/**
 * Asistente de IA de los médicos (servidor).
 * Lee la agenda y las citas, y PROPONE cambios. Nada se guarda hasta que el médico
 * toca "Confirmar" (ejecutarAcciones vuelve a validar todo antes de escribir).
 */
import { generateText, tool, isStepCount, transcribe } from "ai";
import { z } from "zod";
import { db } from "./db.server";
import * as c from "./colecciones.server";
import * as a from "./acceso.server";
import type { UsuarioServidor } from "./servidor";

const MODELO = () => process.env["AI_MODEL"] || "google/gemini-2.5-flash";
const MODELO_VOZ = () => process.env["AI_TRANSCRIPCION"] || "openai/gpt-4o-mini-transcribe";
const ADMINS = ["alonso", "alberto"];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export type AccionIA =
  | { tipo: "horarios"; descripcion: string; bloques: { dia: number; desde: string; hasta: string; servicio: string; duracion: number }[]; reemplazar: boolean }
  | { tipo: "duracion"; descripcion: string; duracion: number; servicio?: string | undefined }
  | { tipo: "vacaciones"; descripcion: string; desde: string; hasta: string; motivo: string }
  | { tipo: "quitarVacaciones"; descripcion: string; id: string }
  | { tipo: "crearCita"; descripcion: string; paciente: string; telefono?: string; fecha: string; hora: string; doctor: string; motivo: string; sobreturno: boolean }
  | { tipo: "estadoCita"; descripcion: string; id: string; estado: "Confirmado" | "Atendido" | "Cancelado" | "Pendiente" }
  | { tipo: "moverCita"; descripcion: string; id: string; fecha: string; hora: string };

type Msg = { de: "yo" | "ia"; texto: string };

/* ---------- utilidades ---------- */
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const ahoraCO = () => {
  const iso = new Date(Date.now() - 5 * 3600e3).toISOString();
  return { fecha: iso.slice(0, 10), hora: iso.slice(11, 16) };
};
const sumarDias = (f: string, n: number) => {
  const d = new Date(f + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const diaSemana = (f: string) => new Date(f + "T12:00:00Z").getUTCDay();
const hhmm = z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM, 24 horas");
const fechaIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato AAAA-MM-DD");
const h12 = (h: string) => {
  const [a, b] = h.split(":").map(Number) as [number, number];
  if (a === 12 && b === 0) return "12:00 m.";
  return `${a % 12 === 0 ? 12 : a % 12}:${String(b).padStart(2, "0")} ${a < 12 ? "a. m." : "p. m."}`;
};
const uid = () => Math.random().toString(36).slice(2, 10);

async function leerAgendas(): Promise<Record<string, Record<string, unknown>>> {
  const sql = await db();
  const filas = (await sql`SELECT valor FROM datos WHERE clave = 'gb_agenda'`) as { valor: Record<string, Record<string, unknown>> }[];
  return filas[0]?.valor ?? {};
}
async function guardarAgendas(v: Record<string, unknown>, por: string) {
  const sql = await db();
  await sql`INSERT INTO datos (clave, valor, por, actualizado) VALUES ('gb_agenda', ${JSON.stringify(v)}::jsonb, ${por}, now())
    ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, por = EXCLUDED.por, actualizado = now()`;
}
const L = () => import("./auth-local");

async function profesionales() {
  const ag = await leerAgendas();
  return (await L()).profesionalesAgenda(ag as never);
}
/** "Alberto", "mi hermano", "el nefrólogo"… → el profesional; sin nombre = el propio médico. */
async function resolverDoctor(u: UsuarioServidor, nombre?: string) {
  const lista = await profesionales();
  if (!nombre?.trim()) return lista.find((p) => p.id === u.id) ?? null;
  const n = norm(nombre);
  if (/^(yo|mi|mio|mia|mis)$/.test(n)) return lista.find((p) => p.id === u.id) ?? null;
  if (/hermano/.test(n)) return lista.find((p) => ADMINS.includes(p.id) && p.id !== u.id) ?? null;
  return (
    lista.find((p) => norm(p.nombre) === n) ??
    lista.find((p) => norm(p.nombre).includes(n)) ??
    lista.find((p) => norm(p.especialidad).includes(n) || n.includes(norm(p.especialidad))) ??
    lista.find((p) => n.split(/\s+/).filter((w) => w.length > 3).every((w) => norm(p.nombre).includes(w))) ??
    null
  );
}

async function slotsDe(doctorId: string, fecha: string, servicio?: string | null) {
  const lib = await L();
  const ag = lib.agendaDe((await leerAgendas()) as never, doctorId);
  return lib.atiendeEl(ag, fecha, servicio) ? lib.horariosDelDia(ag, fecha, servicio) : [];
}

/* ---------- validaciones compartidas (propuesta y ejecución) ---------- */
async function validarCita(doctor: string, doctorId: string, fecha: string, hora: string, sobreturno: boolean, excepto?: string) {
  const ya = ahoraCO();
  if (fecha < ya.fecha || (fecha === ya.fecha && hora <= ya.hora)) return "Ese horario ya pasó.";
  if (!sobreturno && !(await slotsDe(doctorId, fecha)).includes(hora)) return `Las ${hora} del ${fecha} no es un horario de la agenda de ${doctor}. Si es un sobreturno, dígalo.`;
  if (await c.horarioOcupado(doctor, fecha, hora, excepto)) return `Las ${hora} del ${fecha} ya está ocupado para ${doctor}.`;
  return null;
}

/* ---------- asistente ---------- */
export async function asistente(u: UsuarioServidor, entrada: { texto?: string; audio?: string; historial?: Msg[] }) {
  let texto = (entrada.texto ?? "").trim();
  let transcripcion: string | undefined;
  if (entrada.audio) {
    const t = await transcribe({ model: MODELO_VOZ(), audio: entrada.audio });
    transcripcion = t.text.trim();
    texto = transcripcion;
  }
  if (!texto) return { ok: false as const, error: "No le entendí. Intente de nuevo, hablando cerca del celular." };

  const acciones: AccionIA[] = [];
  const hoy = ahoraCO();
  const calendario = Array.from({ length: 21 }, (_, i) => {
    const f = sumarDias(hoy.fecha, i);
    return `${DIAS[diaSemana(f)]} ${f}`;
  }).join(", ");
  const lista = await profesionales();
  const lib = await L();
  const agendas = await leerAgendas();
  const resumenProfs = lista
    .map((p) => {
      const ag = lib.agendaDe(agendas as never, p.id);
      const bs = lib.bloquesDe(ag).map((b) => `${DIAS[b.dia]} ${b.desde}-${b.hasta} ${b.servicio === "*" ? "(sin especialidad)" : b.servicio} cada ${b.duracion} min`).join("; ");
      return `- ${p.nombre} (${p.especialidad || "sin especialidad"})${p.id === u.id ? " ← es quien le habla" : ""}: ${bs || "sin horarios cargados"}`;
    })
    .join("\n");

  const tools = {
    verCitas: tool({
      description: "Lista las citas (agenda) entre dos fechas. Úsela para responder qué pacientes hay, cuántas citas, etc.",
      inputSchema: z.object({ desde: fechaIso, hasta: fechaIso.optional(), doctor: z.string().optional().describe("Nombre del profesional; vacío = todos") }),
      execute: async ({ desde, hasta, doctor }) => {
        const d = doctor ? await resolverDoctor(u, doctor) : null;
        const filas = (await c.leer("gb_turnos"))
          .filter((t) => String(t["fecha"]) >= desde && String(t["fecha"]) <= (hasta ?? desde))
          .filter((t) => !d || t["doctor"] === d.nombre)
          .sort((x, y) => `${x["fecha"]}${x["hora"]}`.localeCompare(`${y["fecha"]}${y["hora"]}`))
          .slice(0, 80)
          .map((t) => ({ id: t.id, fecha: t["fecha"], hora: t["hora"], paciente: t["paciente"], doctor: t["doctor"], motivo: t["motivo"], estado: t["estado"], telefono: t["telefono"] }));
        return { citas: filas, total: filas.length };
      },
    }),
    horariosLibres: tool({
      description: "Horarios libres de un profesional en una fecha, según su agenda. Indique la especialidad o estudio si la sabe.",
      inputSchema: z.object({ fecha: fechaIso, doctor: z.string().optional(), servicio: z.string().optional().describe("Especialidad o estudio, ej. Cardiología, Medicina Interna, Ecocardiografía") }),
      execute: async ({ fecha, doctor, servicio }) => {
        const d = await resolverDoctor(u, doctor);
        if (!d) return { error: "No encontré a ese profesional." };
        const slots = await slotsDe(d.id, fecha, servicio);
        const ocupados = (await c.leer("gb_turnos")).filter((t) => t["doctor"] === d.nombre && t["fecha"] === fecha && t["estado"] !== "Cancelado").map((t) => String(t["hora"]));
        const ya = ahoraCO();
        return { doctor: d.nombre, fecha, libres: slots.filter((h) => !ocupados.includes(h) && !(fecha === ya.fecha && h <= ya.hora)), atiende: slots.length > 0 };
      },
    }),
    verHorarios: tool({
      description: "Muestra los días, horarios, duración de cita, pausas y vacaciones cargados de un profesional.",
      inputSchema: z.object({ doctor: z.string().optional() }),
      execute: async ({ doctor }) => {
        const d = await resolverDoctor(u, doctor);
        if (!d) return { error: "No encontré a ese profesional." };
        const ag = lib.agendaDe((await leerAgendas()) as never, d.id);
        return { doctor: d.nombre, resumen: lib.resumenAgenda(ag), bloques: lib.bloquesDe(ag).map((b) => ({ dia: DIAS[b.dia], desde: b.desde, hasta: b.hasta, atiende: b.servicio === "*" ? "sin especialidad" : b.servicio, duracionMin: b.duracion })), vacaciones: ag.bloqueos };
      },
    }),
    buscarPaciente: tool({
      description: "Busca pacientes por nombre o cédula para obtener teléfono y datos de contacto.",
      inputSchema: z.object({ texto: z.string().min(2) }),
      execute: async ({ texto: q }) => {
        const n = norm(q);
        const pad = [...(await c.leer("gb_padron")), ...(await c.leer("gb_pacientes"))];
        return { pacientes: pad.filter((p) => norm(`${p["nombre"]} ${p["dni"] ?? ""}`).includes(n)).slice(0, 8).map((p) => ({ nombre: p["nombre"], cedula: p["dni"], telefono: p["telefono"] })) };
      },
    }),
    proponerHorarios: tool({
      description:
        "Propone cargar o cambiar los horarios DEL MÉDICO QUE HABLA, como bloques: cada bloque = día (0=domingo,1=lunes…6=sábado) + desde/hasta + qué atiende (especialidad o estudio) + duración de cada cita en minutos. 'De lunes a viernes de 8 a 12 cardiología' son 5 bloques. 'De 8 a 12 y de 2 a 6' son 2 bloques por día. reemplazar=true si esos son TODOS sus horarios; false si solo cambia los días mencionados (los demás días quedan como estaban).",
      inputSchema: z.object({
        bloques: z.array(z.object({ dia: z.number().int().min(0).max(6), desde: hhmm, hasta: hhmm, servicio: z.string().min(3).describe("Qué atiende: Cardiología, Medicina Interna, Nefrología, Ecocardiografía, Holter y MAPA…"), duracion: z.number().int().min(5).max(240) })).min(1),
        reemplazar: z.boolean(),
      }),
      execute: async ({ bloques, reemplazar }) => {
        if (u.rol !== "medico") return { error: "Solo cada médico puede cambiar sus horarios." };
        for (const b of bloques) if (b.desde >= b.hasta) return { error: `${DIAS[b.dia]}: la hora de inicio debe ser anterior a la de fin.` };
        const cruce = bloques.find((b, i) => bloques.some((o, k) => k !== i && o.dia === b.dia && b.desde < o.hasta && o.desde < b.hasta));
        if (cruce) return { error: `${DIAS[cruce.dia]}: dos horarios se pisan.` };
        const txt = bloques.map((b) => `${DIAS[b.dia]} ${h12(b.desde)} a ${h12(b.hasta)} ${b.servicio} (${b.duracion} min)`).join("; ");
        acciones.push({ tipo: "horarios", bloques, reemplazar, descripcion: `${reemplazar ? "Dejar sus horarios en" : "Cambiar"}: ${txt}` });
        return { propuesto: true };
      },
    }),
    proponerDuracion: tool({
      description: "Propone cambiar la duración de cada cita del médico que habla (de todos sus horarios o solo de una especialidad/estudio).",
      inputSchema: z.object({ duracion: z.number().int().min(5).max(240), servicio: z.string().optional() }),
      execute: async ({ duracion, servicio }) => {
        if (u.rol !== "medico") return { error: "Solo cada médico puede cambiar sus horarios." };
        acciones.push({ tipo: "duracion", duracion, servicio, descripcion: `Citas de ${duracion} minutos${servicio ? ` en ${servicio}` : ""}` });
        return { propuesto: true };
      },
    }),
    proponerVacaciones: tool({
      description: "Propone bloquear días (vacaciones, congreso, ausencia) del médico que habla. Avise si ya hay citas esos días.",
      inputSchema: z.object({ desde: fechaIso, hasta: fechaIso, motivo: z.string().default("No atiende") }),
      execute: async ({ desde, hasta, motivo }) => {
        if (u.rol !== "medico") return { error: "Solo cada médico puede cargar sus vacaciones." };
        if (hasta < desde) return { error: "La fecha final es anterior a la inicial." };
        const yo = lista.find((p) => p.id === u.id);
        const afectadas = (await c.leer("gb_turnos")).filter((t) => t["doctor"] === yo?.nombre && String(t["fecha"]) >= desde && String(t["fecha"]) <= hasta && t["estado"] !== "Cancelado" && t["estado"] !== "Atendido");
        acciones.push({ tipo: "vacaciones", desde, hasta, motivo, descripcion: `No atender del ${desde} al ${hasta} (${motivo})` });
        return { propuesto: true, citasAfectadas: afectadas.map((t) => `${t["fecha"]} ${t["hora"]} ${t["paciente"]}`) };
      },
    }),
    proponerQuitarVacaciones: tool({
      description: "Propone quitar un bloqueo de vacaciones del médico que habla (usar el id que devuelve verHorarios).",
      inputSchema: z.object({ id: z.string() }),
      execute: async ({ id }) => {
        const ag = lib.agendaDe((await leerAgendas()) as never, u.id);
        const b = ag.bloqueos.find((x) => x.id === id);
        if (!b) return { error: "No encontré ese bloqueo." };
        acciones.push({ tipo: "quitarVacaciones", id, descripcion: `Quitar el bloqueo del ${b.desde} al ${b.hasta}` });
        return { propuesto: true };
      },
    }),
    proponerCita: tool({
      description: "Propone dar una cita. Antes verifique horarios libres. sobreturno=true solo si el médico pide explícitamente una hora fuera de la agenda.",
      inputSchema: z.object({ paciente: z.string().min(3), telefono: z.string().optional(), fecha: fechaIso, hora: hhmm, doctor: z.string().optional(), motivo: z.string().optional().describe("Especialidad o estudio de la cita; si no lo dice se toma el del horario"), sobreturno: z.boolean().default(false) }),
      execute: async (x) => {
        const d = await resolverDoctor(u, x.doctor);
        if (!d) return { error: "No encontré a ese profesional." };
        const malo = await validarCita(d.nombre, d.id, x.fecha, x.hora, x.sobreturno);
        if (malo) return { error: malo };
        if (acciones.some((y) => y.tipo === "crearCita" && y.doctor === d.nombre && y.fecha === x.fecha && y.hora === x.hora)) return { error: "Ya propuso otra cita en ese mismo horario." };
        const motivo = x.motivo || lib.servicioEn(lib.agendaDe((await leerAgendas()) as never, d.id), x.fecha, x.hora) || "Consulta";
        acciones.push({ tipo: "crearCita", paciente: x.paciente.trim(), ...(x.telefono ? { telefono: x.telefono } : {}), fecha: x.fecha, hora: x.hora, doctor: d.nombre, motivo, sobreturno: x.sobreturno, descripcion: `Cita para ${x.paciente.trim()} · ${x.fecha} ${h12(x.hora)} · ${motivo} con ${d.nombre}${x.sobreturno ? " (sobreturno)" : ""}` });
        return { propuesto: true };
      },
    }),
    proponerEstadoCita: tool({
      description: "Propone confirmar, marcar atendida, cancelar o volver a pendiente una cita existente (use el id de verCitas).",
      inputSchema: z.object({ id: z.string(), estado: z.enum(["Confirmado", "Atendido", "Cancelado", "Pendiente"]) }),
      execute: async ({ id, estado }) => {
        const t = await c.uno("gb_turnos", id);
        if (!t) return { error: "No encontré esa cita." };
        acciones.push({ tipo: "estadoCita", id, estado, descripcion: `${estado === "Cancelado" ? "Cancelar" : `Pasar a ${estado}`} la cita de ${t["paciente"]} (${t["fecha"]} ${h12(String(t["hora"]))})` });
        return { propuesto: true };
      },
    }),
    proponerMoverCita: tool({
      description: "Propone mover una cita existente a otra fecha y hora libre (use el id de verCitas).",
      inputSchema: z.object({ id: z.string(), fecha: fechaIso, hora: hhmm }),
      execute: async ({ id, fecha, hora }) => {
        const t = await c.uno("gb_turnos", id);
        if (!t) return { error: "No encontré esa cita." };
        const d = lista.find((p) => p.nombre === t["doctor"]);
        const malo = await validarCita(String(t["doctor"]), d?.id ?? "", fecha, hora, false, id);
        if (malo) return { error: malo };
        acciones.push({ tipo: "moverCita", id, fecha, hora, descripcion: `Mover la cita de ${t["paciente"]} del ${t["fecha"]} ${h12(String(t["hora"]))} al ${fecha} ${h12(hora)}` });
        return { propuesto: true };
      },
    }),
  };

  const system = `Usted es el asistente de IA del panel de HEGO, centro de especialidades médicas en Colombia. Habla con ${u.nombre}.
Responda SIEMPRE en español de Colombia, tratando de "usted", breve y claro (se lee en el celular).
Hoy es ${DIAS[diaSemana(hoy.fecha)]} ${hoy.fecha}, hora de Colombia ${hoy.hora}. Próximos días: ${calendario}.
Profesionales y sus horarios actuales:
${resumenProfs}

Reglas:
- Para consultar use las herramientas de lectura; no invente pacientes, citas ni horarios.
- Para cambiar algo use las herramientas "proponer…". NADA se guarda hasta que el médico toque Confirmar en pantalla: diga "Le dejé para confirmar: …".
- Cada médico solo cambia SUS horarios y vacaciones. Si pide cambiar los del otro médico, explíquele que el otro lo hace desde su panel.
- Si falta un dato necesario (duración de la cita, hora, paciente), pregúnteselo en una sola frase.
- Fechas relativas ("el lunes", "mañana", "la semana que viene") conviértalas con el calendario de arriba.
- Las horas: en las herramientas use formato 24 h (14:00), pero AL HABLAR con el médico dígalas como en Colombia: 8:00 a. m., 12:00 m., 2:30 p. m. Nunca hora militar.
- Los horarios son BLOQUES: cada uno con día, desde, hasta, qué atiende (especialidad o estudio) y duración por cita. El mismo médico puede atender Cardiología unas horas y Medicina Interna otras. Si no dice qué atiende o cuánto dura cada cita, pregúntelo.
- "De 8 a 12 y de 2 a 6" = dos bloques ese día (el almuerzo queda en el medio).
- No dé diagnósticos ni consejos médicos: este asistente es para agenda y organización.`;

  const historial = (entrada.historial ?? []).slice(-8).map((m) => ({ role: m.de === "yo" ? ("user" as const) : ("assistant" as const), content: m.texto.slice(0, 2000) }));
  const r = await generateText({
    model: MODELO(),
    system,
    messages: [...historial, { role: "user" as const, content: texto }],
    tools,
    stopWhen: isStepCount(8),
  });
  await a.auditar(u.nombre, "Asistente IA", `${transcripcion ? "Audio: " : ""}${texto.slice(0, 120)}`);
  return { ok: true as const, transcripcion, respuesta: r.text || (acciones.length ? "Le dejé los cambios para confirmar." : "Listo."), acciones };
}

/* ---------- ejecutar lo que el médico confirmó ---------- */
export async function ejecutarAcciones(u: UsuarioServidor, acciones: AccionIA[]) {
  const lib = await L();
  const hechas: string[] = [];
  const errores: string[] = [];
  const lista = await profesionales();
  for (const x of acciones.slice(0, 20)) {
    try {
      if (x.tipo === "horarios" || x.tipo === "duracion" || x.tipo === "vacaciones" || x.tipo === "quitarVacaciones") {
        if (u.rol !== "medico" || !ADMINS.includes(u.id)) throw new Error("Solo cada médico cambia sus horarios.");
        const todas = await leerAgendas();
        const ag = lib.agendaDe(todas as never, u.id);
        if (x.tipo === "horarios") {
          const previos = lib.bloquesDe(ag).map((b) => (b.servicio === "*" ? { ...b, servicio: x.bloques[0]?.servicio ?? "Consulta" } : b));
          const dias = new Set(x.bloques.map((b) => b.dia));
          const quedan = x.reemplazar ? [] : previos.filter((b) => !dias.has(b.dia));
          const bloques = [...quedan, ...x.bloques.map((b) => ({ id: uid(), dia: b.dia, desde: b.desde, hasta: b.hasta, servicio: b.servicio.slice(0, 60), duracion: Math.max(5, Math.min(240, Math.round(b.duracion))) }))];
          if (bloques.some((b, i) => bloques.some((o, k) => k !== i && o.dia === b.dia && b.desde < o.hasta && o.desde < b.hasta))) throw new Error("Hay horarios que se pisan.");
          todas[u.id] = { ...ag, activo: true, bloques, dias: [...new Set(bloques.map((b) => b.dia))].sort(), duracion: bloques[0]?.duracion ?? ag.duracion, desde: bloques.map((b) => b.desde).sort()[0] ?? ag.desde, hasta: bloques.map((b) => b.hasta).sort().reverse()[0] ?? ag.hasta };
        } else if (x.tipo === "duracion") {
          const d = Math.max(5, Math.min(240, Math.round(x.duracion)));
          const bloques = lib.bloquesDe(ag).map((b) => (!x.servicio || lib.bloqueSirve(b, x.servicio) ? { ...b, duracion: d } : b));
          todas[u.id] = { ...ag, bloques, duracion: d };
        } else if (x.tipo === "vacaciones") {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(x.desde) || !/^\d{4}-\d{2}-\d{2}$/.test(x.hasta) || x.hasta < x.desde) throw new Error("Fechas inválidas.");
          todas[u.id] = { ...ag, bloqueos: [...ag.bloqueos, { id: uid(), desde: x.desde, hasta: x.hasta, motivo: (x.motivo || "No atiende").slice(0, 80) }] };
        } else {
          todas[u.id] = { ...ag, bloqueos: ag.bloqueos.filter((b) => b.id !== x.id) };
        }
        await guardarAgendas(todas, u.nombre);
      } else if (x.tipo === "crearCita") {
        const d = lista.find((p) => p.nombre === x.doctor);
        if (!d) throw new Error("Profesional desconocido.");
        const malo = await validarCita(d.nombre, d.id, x.fecha, x.hora, x.sobreturno);
        if (malo) throw new Error(malo);
        await c.guardar("gb_turnos", { id: uid(), fecha: x.fecha, hora: x.hora, paciente: x.paciente.slice(0, 120), doctor: d.nombre, motivo: (x.motivo || "Consulta").slice(0, 200), estado: "Confirmado", origen: "panel", ...(x.telefono ? { telefono: x.telefono.slice(0, 40) } : {}) });
      } else if (x.tipo === "estadoCita") {
        const t = await c.uno("gb_turnos", x.id);
        if (!t) throw new Error("La cita ya no existe.");
        await c.guardar("gb_turnos", { ...t, estado: x.estado });
      } else if (x.tipo === "moverCita") {
        const t = await c.uno("gb_turnos", x.id);
        if (!t) throw new Error("La cita ya no existe.");
        const d = lista.find((p) => p.nombre === t["doctor"]);
        const malo = await validarCita(String(t["doctor"]), d?.id ?? "", x.fecha, x.hora, false, x.id);
        if (malo) throw new Error(malo);
        await c.guardar("gb_turnos", { ...t, fecha: x.fecha, hora: x.hora });
      }
      hechas.push(x.descripcion);
      await a.auditar(u.nombre, "Cambio hecho con la IA", x.descripcion.slice(0, 160));
    } catch (e) {
      errores.push(`${x.descripcion}: ${(e as Error).message}`);
    }
  }
  return { ok: true as const, hechas, errores };
}
