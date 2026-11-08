import { useCallback, useEffect, useState } from "react";

const SESSION_KEY = "gb_session";
const AUDIT_KEY = "gb_audit";
const PW_KEY = "gb_admin_pw_";

export type Admin = { id: string; nombre: string };
export type SessionUser = { id: string; nombre: string };
export type Evento = { id: string; fecha: string; usuario: string; accion: string; detalle: string };
type Result = { ok: true } | { ok: false; error: string };

// Los únicos usuarios con acceso. Cambiá los nombres acá si hace falta.
export const ADMINS: Admin[] = [
  { id: "alberto", nombre: "Dr. Alberto Gómez Bolaño" },
  { id: "alonso", nombre: "Dr. Alonso Gómez Bolaño" },
];

async function hash(texto: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function leerAuditoria(): Evento[] {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_KEY) ?? "[]") as Evento[];
  } catch {
    return [];
  }
}

export function auditar(usuario: string, accion: string, detalle = ""): Evento[] {
  const evento: Evento = {
    id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
    fecha: new Date().toISOString(),
    usuario,
    accion,
    detalle,
  };
  const lista = [evento, ...leerAuditoria()].slice(0, 500);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(lista));
  return lista;
}

export function tieneClave(id: string): boolean {
  return localStorage.getItem(PW_KEY + id) !== null;
}

export async function crearClave(id: string, password: string): Promise<Result> {
  const admin = ADMINS.find((a) => a.id === id);
  if (!admin) return { ok: false, error: "Usuario no autorizado." };
  if (tieneClave(id)) return { ok: false, error: "Este usuario ya tiene contraseña." };
  if (password.length < 6) return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
  localStorage.setItem(PW_KEY + id, await hash(password));
  auditar(admin.nombre, "Contraseña creada", "Primer ingreso");
  return { ok: true };
}

export async function ingresar(id: string, password: string): Promise<Result> {
  const admin = ADMINS.find((a) => a.id === id);
  if (!admin) return { ok: false, error: "Usuario no autorizado." };
  const guardado = localStorage.getItem(PW_KEY + id);
  if (!guardado) return { ok: false, error: "Este usuario todavía no creó su contraseña." };
  if ((await hash(password)) !== guardado) {
    auditar(admin.nombre, "Intento de acceso fallido", "Contraseña incorrecta");
    return { ok: false, error: "Contraseña incorrecta." };
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id: admin.id, nombre: admin.nombre }));
  auditar(admin.nombre, "Inicio de sesión", "Acceso al panel administrativo");
  return { ok: true };
}

export async function cambiarClave(id: string, actual: string, nueva: string): Promise<Result> {
  const guardado = localStorage.getItem(PW_KEY + id);
  if (!guardado) return { ok: false, error: "Todavía no hay una contraseña creada." };
  if ((await hash(actual)) !== guardado) return { ok: false, error: "La contraseña actual no es correcta." };
  if (nueva.length < 6) return { ok: false, error: "La nueva contraseña debe tener al menos 6 caracteres." };
  localStorage.setItem(PW_KEY + id, await hash(nueva));
  return { ok: true };
}

export function sesionActual(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as SessionUser;
    return ADMINS.some((a) => a.id === s.id) ? s : null;
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem(SESSION_KEY);
}

/* =====================================================================
   Datos compartidos entre el panel, la web pública y el portal del paciente.
   Por ahora se guardan en el navegador (localStorage); después se pasa al backend.
   ===================================================================== */

const EVT = "gb-store";

export function leerDato<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function guardarDato<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val));
  window.dispatchEvent(new CustomEvent(EVT, { detail: key }));
}

/** Estado sincronizado con localStorage (también entre pestañas). */
export function useDato<T>(key: string, fallback: T): readonly [T, (fn: (prev: T) => T) => void] {
  const [val, setVal] = useState<T>(fallback);
  useEffect(() => {
    const cargar = () => setVal(leerDato(key, fallback));
    cargar();
    const onCustom = (e: Event) => {
      if ((e as CustomEvent<string>).detail === key) cargar();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) cargar();
    };
    window.addEventListener(EVT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const actualizar = useCallback(
    (fn: (prev: T) => T) => {
      const nuevo = fn(leerDato(key, fallback));
      guardarDato(key, nuevo);
      setVal(nuevo);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return [val, actualizar] as const;
}

/* ---------- Turnos (misma clave que usa el panel) ---------- */
export type EstadoTurno = "Pendiente" | "Confirmado" | "Atendido" | "Cancelado";
export type TurnoClinica = {
  id: string;
  fecha: string;
  hora: string;
  paciente: string;
  doctor: string;
  motivo: string;
  estado: EstadoTurno;
  telefono?: string;
  email?: string;
  origen?: "web" | "panel" | "portal";
  pacienteId?: string;
};
export const KEY_TURNOS = "gb_turnos";

/* ---------- Horarios de atención de cada doctor ---------- */
export type Bloqueo = { id: string; desde: string; hasta: string; motivo: string };
export type AgendaDoctor = {
  activo: boolean;
  dias: number[]; // 0 = domingo … 6 = sábado
  desde: string;
  hasta: string;
  duracion: number; // minutos por turno
  pausa: boolean;
  pausaDesde: string;
  pausaHasta: string;
  consultorio: string;
  nota: string;
  bloqueos: Bloqueo[];
};
export type Agendas = Record<string, AgendaDoctor>;
export const KEY_AGENDA = "gb_agenda";
export const NOMBRES_DIA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const agendaBase = (consultorio: string): AgendaDoctor => ({
  activo: true,
  dias: [1, 2, 3, 4, 5],
  desde: "08:00",
  hasta: "18:40",
  duracion: 40,
  pausa: true,
  pausaDesde: "12:40",
  pausaHasta: "14:00",
  consultorio,
  nota: "",
  bloqueos: [],
});

export const AGENDA_INICIAL: Agendas = {
  alberto: agendaBase("Consultorio 3"),
  alonso: agendaBase("Consultorio 5"),
};

export function agendaDe(agendas: Agendas, id: string): AgendaDoctor {
  return { ...(AGENDA_INICIAL[id] ?? agendaBase("")), ...(agendas[id] ?? {}) };
}

const aMin = (h: string) => {
  const [a, b] = h.split(":").map(Number);
  return (a ?? 0) * 60 + (b ?? 0);
};
const aHora = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const isoDe = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Horarios de inicio de turno de un día cualquiera según la configuración. */
export function horariosDelDia(a: AgendaDoctor): string[] {
  const out: string[] = [];
  const fin = aMin(a.hasta);
  const pD = aMin(a.pausaDesde);
  const pH = aMin(a.pausaHasta);
  let t = aMin(a.desde);
  const dur = Math.max(10, a.duracion);
  while (t + dur <= fin && out.length < 60) {
    if (a.pausa && t < pH && t + dur > pD) {
      t = pH;
      continue;
    }
    out.push(aHora(t));
    t += dur;
  }
  return out;
}

export function bloqueoEn(a: AgendaDoctor, fecha: string): Bloqueo | undefined {
  return a.bloqueos.find((b) => fecha >= b.desde && fecha <= b.hasta);
}

export function atiendeEl(a: AgendaDoctor, fecha: string): boolean {
  const d = new Date(fecha + "T12:00:00");
  return a.activo && a.dias.includes(d.getDay()) && !bloqueoEn(a, fecha);
}

/** Próximos días en que el doctor atiende. */
export function proximosDias(a: AgendaDoctor, cantidad = 15): string[] {
  const out: string[] = [];
  const hoy = new Date();
  for (let i = 0; out.length < cantidad && i < 90; i++) {
    const f = isoDe(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i));
    if (atiendeEl(a, f)) out.push(f);
  }
  return out;
}

/** Texto corto tipo "Lun a Vie · 08:00 a 18:40". */
export function resumenAgenda(a: AgendaDoctor): string {
  if (!a.activo) return "Agenda pausada momentáneamente";
  const d = [...a.dias].sort((x, y) => ((x + 6) % 7) - ((y + 6) % 7));
  const corto = (n: number) => NOMBRES_DIA[n]!.slice(0, 3);
  const seguidos = d.length > 2 && d.every((v, i) => i === 0 || ((v + 6) % 7) - ((d[i - 1]! + 6) % 7) === 1);
  const dias = d.length === 0 ? "Sin días" : seguidos ? `${corto(d[0]!)} a ${corto(d[d.length - 1]!)}` : d.map(corto).join(", ");
  return `${dias} · ${a.desde} a ${a.hasta}${a.pausa ? ` (pausa ${a.pausaDesde}–${a.pausaHasta})` : ""}`;
}

/* ---------- Portal del paciente ---------- */
export type EstadoAcceso = "Invitado" | "Activo" | "Revocado";
export type PacientePortal = {
  id: string;
  nombre: string;
  dni: string;
  telefono: string;
  email: string;
  codigo: string;
  clave?: string;
  estado: EstadoAcceso;
  invitadoPor: string;
  fecha: string;
  ultimoIngreso?: string;
};
export const KEY_PACIENTES = "gb_pacientes";
export const KEY_SESION_PACIENTE = "gb_sesion_paciente";

export const nuevoCodigo = () => String(Math.floor(100000 + Math.random() * 900000));
export const nuevoId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export async function hashTexto(t: string) {
  return hash(t);
}

export async function ingresarPaciente(dniOEmail: string, codigoOClave: string): Promise<{ ok: true; paciente: PacientePortal } | { ok: false; error: string }> {
  const lista = leerDato<PacientePortal[]>(KEY_PACIENTES, []);
  const u = dniOEmail.trim().toLowerCase();
  const dni = u.replace(/\D/g, "");
  const p = lista.find((x) => (dni.length >= 7 && x.dni === dni) || (u.includes("@") && x.email.toLowerCase() === u));
  if (!p) return { ok: false, error: "No encontramos un paciente con ese DNI o correo. Pedile a la clínica que te envíe la invitación." };
  if (p.estado === "Revocado") return { ok: false, error: "Tu acceso al portal está deshabilitado. Comunicate con la clínica." };
  const c = codigoOClave.trim();
  const valida = c === p.codigo || (!!p.clave && (await hash(c)) === p.clave);
  if (!valida) return { ok: false, error: p.clave ? "El código o la contraseña no son correctos." : "El código no es correcto. Revisá el mensaje de la clínica." };
  const actualizado: PacientePortal = { ...p, estado: "Activo", ultimoIngreso: new Date().toISOString() };
  guardarDato(KEY_PACIENTES, lista.map((x) => (x.id === p.id ? actualizado : x)));
  localStorage.setItem(KEY_SESION_PACIENTE, p.id);
  auditar(p.nombre, p.estado === "Invitado" ? "Primer ingreso al portal" : "Ingreso al portal", `Paciente DNI ${p.dni}`);
  return { ok: true, paciente: actualizado };
}

/* ---------- Autorizaciones ---------- */
export type EstadoAut = "Pendiente" | "Autorizada" | "Rechazada";
export const TIPOS_AUT = ["Estudio", "Receta", "Tratamiento", "Consentimiento informado", "Compartir datos", "Orden de obra social", "Otro"] as const;
export type Autorizacion = {
  id: string;
  pacienteId: string;
  paciente: string;
  tipo: string;
  titulo: string;
  detalle: string;
  origen: "Clínica" | "Paciente";
  solicitadoPor: string;
  fecha: string;
  estado: EstadoAut;
  respuesta?: string;
  respondidoPor?: string;
  fechaRespuesta?: string;
};
export const KEY_AUT = "gb_autorizaciones";
