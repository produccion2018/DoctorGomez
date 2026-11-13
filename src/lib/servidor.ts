/**
 * Funciones del servidor (backend). Se llaman desde el navegador como funciones normales;
 * TanStack Start las convierte en pedidos al servidor de Vercel.
 */
import { createServerFn } from "@tanstack/react-start";

export type UsuarioServidor = { id: string; nombre: string; rol: "medico" | "enfermeria" | "personal"; area?: string };
export type PersonalServidor = { id: string; nombre: string; documento?: string; activo: boolean; creado: string; creadoPor: string; area?: string; invitacion?: string };
type Resultado<T = object> = ({ ok: true } & T) | { ok: false; error: string };

/** Datos que cualquiera puede leer (se muestran en la web pública). */
const PUBLICOS = ["gb_sitio", "gb_agenda"] as const;
/** Datos internos: los lee y guarda cualquier persona del equipo con sesión. */
const PRIVADOS = ["gb_firmas", "gb_automatizaciones", "gb_automatizaciones_hechas"] as const;
/** Datos internos que solo los médicos pueden modificar. */
const PRIVADOS_MEDICOS = ["gb_permisos"] as const;
/** Datos que solo los médicos administradores pueden modificar. */
const SOLO_MEDICOS = ["gb_sitio", "gb_agenda"] as const;
const ADMINS_IDS = ["alonso", "alberto"];

import { permiteColeccion, nivelDe, AREA_DIRECCION, AREAS_MEDICAS, type Permisos } from "./permisos";
const permiteModulo = (p: Permisos, area: string, modulo: string, accion: "ver" | "editar") => {
  const n = nivelDe(p, area, modulo);
  return accion === "ver" ? n !== "ninguno" : n === "editar";
};
const modulo = () => import("./db.server");
const acceso = () => import("./acceso.server");

/* ===================================================================== */
/* Estado                                                                  */
/* ===================================================================== */

export const estadoBackend = createServerFn({ method: "GET" }).handler(async () => {
  const { hayBase } = await modulo();
  if (!hayBase()) return { conectado: false as const };
  try {
    await (await acceso()).sembrarAdmins();
    return { conectado: true as const };
  } catch (e) {
    console.error("Base de datos no disponible", e);
    return { conectado: false as const };
  }
});

/* ===================================================================== */
/* Datos (clave → valor JSON)                                              */
/* ===================================================================== */

export const leerDatos = createServerFn({ method: "GET" })
  .validator((d: { claves: string[] }) => d)
  .handler(async ({ data }) => {
    const { hayBase, db } = await modulo();
    if (!hayBase()) return {} as Record<string, string>;
    let permitidas = data.claves.filter((c) => (PUBLICOS as readonly string[]).includes(c));
    const internas = data.claves.filter((c) => ([...PRIVADOS, ...PRIVADOS_MEDICOS] as readonly string[]).includes(c));
    if (internas.length && (await (await acceso()).usuarioActual())) permitidas = [...permitidas, ...internas];
    if (!permitidas.length) return {} as Record<string, string>;
    const sql = await db();
    const filas = (await sql`SELECT clave, valor FROM datos WHERE clave = ANY(${permitidas})`) as { clave: string; valor: unknown }[];
    return Object.fromEntries(filas.map((f) => [f.clave, JSON.stringify(f.valor)])) as Record<string, string>;
  });

export const guardarDatoServidor = createServerFn({ method: "POST" })
  .validator((d: { clave: string; valor: string }) => d)
  .handler(async ({ data }): Promise<Resultado> => {
    const { db } = await modulo();
    const esAgenda = data.clave === "gb_agenda";
    const deMedicos = !esAgenda && ([...SOLO_MEDICOS, ...PRIVADOS_MEDICOS] as readonly string[]).includes(data.clave);
    if (!deMedicos && !(PRIVADOS as readonly string[]).includes(data.clave)) return { ok: false, error: "Dato no habilitado." };
    let u: UsuarioServidor;
    try {
      const a = await acceso();
      if (deMedicos) u = await a.exigirDireccion();
      else if (esAgenda) {
        // Agenda: los médicos, o el personal con permiso de editar Horarios (secretaría)
        const x = await a.usuarioActual();
        if (!x) throw new Error("Tu sesión venció. Volvé a ingresar.");
        if (x.rol !== "medico" && !permiteModulo(await permisosGuardados(), x.area ?? "", "Horarios", "editar")) throw new Error("Tu área no tiene permiso para modificar horarios.");
        u = x;
      }
      else {
        const x = await a.usuarioActual();
        if (!x) throw new Error("Tu sesión venció. Volvé a ingresar.");
        u = x;
      }
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const sql = await db();
    let json = data.valor;
    if (data.clave === "gb_agenda") {
      // Cada médico solo puede guardar SU agenda: se toma su parte y se conserva la del otro
      // Cada médico solo cambia SU agenda; las de los demás profesionales las cambian
      // los médicos o la secretaría. La agenda de un médico nunca la toca otro.
      const nuevo = JSON.parse(data.valor || "{}") as Record<string, unknown>;
      const filas = (await sql`SELECT valor FROM datos WHERE clave = 'gb_agenda'`) as { valor: Record<string, unknown> }[];
      const actual: Record<string, unknown> = { ...(filas[0]?.valor ?? {}) };
      const admins = ["alonso", "alberto"];
      const puede = (k: string) => (admins.includes(k) ? u.rol === "medico" && k === u.id : true);
      for (const k of new Set([...Object.keys(actual), ...Object.keys(nuevo)])) {
        if (!puede(k)) continue;
        if (k in nuevo) actual[k] = nuevo[k];
        else if (!admins.includes(k)) delete actual[k];
      }
      json = JSON.stringify(actual);
    }
    await sql`INSERT INTO datos (clave, valor, por, actualizado) VALUES (${data.clave}, ${json}::jsonb, ${u.nombre}, now())
      ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, por = EXCLUDED.por, actualizado = now()`;
    return { ok: true };
  });

/* ===================================================================== */
/* Acceso: médicos y personal                                              */
/* ===================================================================== */

/** Lista para la pantalla de ingreso (sin datos sensibles). */
export const listaIngreso = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await (await acceso()).sembrarAdmins();
  const filas = (await sql`SELECT id, nombre, rol, area, documento, activo, creado, creado_por, (hash IS NOT NULL) AS con_clave FROM usuarios ORDER BY creado`) as {
    id: string; nombre: string; rol: string; area: string | null; documento: string | null; activo: boolean; creado: string; creado_por: string | null; con_clave: boolean;
  }[];
  return {
    conClave: filas.filter((f) => f.con_clave).map((f) => f.id),
    personal: filas
      .filter((f) => f.rol !== "medico" && f.activo)
      .map((f): PersonalServidor => ({ id: f.id, nombre: f.nombre, activo: f.activo, creado: new Date(f.creado).toISOString(), creadoPor: f.creado_por ?? "", ...(f.area ? { area: f.area } : {}) })),
  };
});

export const crearClaveServidor = createServerFn({ method: "POST" })
  .validator((d: { id: string; password: string }) => d)
  .handler(async ({ data }): Promise<Resultado> => {
    const { hashClave } = await modulo();
    const sql = await (await acceso()).sembrarAdmins();
    if (data.password.length < 6) return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
    const filas = (await sql`SELECT nombre, rol, hash FROM usuarios WHERE id = ${data.id} AND activo = true`) as { nombre: string; rol: string; hash: string | null }[];
    const f = filas[0];
    if (!f || f.rol !== "medico") return { ok: false, error: "Usuario no autorizado." };
    if (f.hash) return { ok: false, error: "Este usuario ya tiene contraseña." };
    await sql`UPDATE usuarios SET hash = ${hashClave(data.password)} WHERE id = ${data.id} AND hash IS NULL`;
    await (await acceso()).auditar(f.nombre, "Contraseña creada", "Primer ingreso");
    return { ok: true };
  });

export const ingresarServidor = createServerFn({ method: "POST" })
  .validator((d: { id: string; password: string }) => d)
  .handler(async ({ data }): Promise<Resultado<{ usuario: UsuarioServidor }>> => {
    const { verificarClave } = await modulo();
    const sql = await (await acceso()).sembrarAdmins();
    const filas = (await sql`SELECT id, nombre, rol, area, hash FROM usuarios WHERE id = ${data.id} AND activo = true`) as {
      id: string; nombre: string; rol: string; area: string | null; hash: string | null;
    }[];
    const f = filas[0];
    if (!f) return { ok: false, error: "Usuario no autorizado." };
    if (!f.hash) return { ok: false, error: "Este usuario todavía no creó su contraseña." };
    if (!verificarClave(data.password, f.hash)) {
      await (await acceso()).auditar(f.nombre, "Intento de acceso fallido", "Contraseña incorrecta");
      return { ok: false, error: "Contraseña incorrecta." };
    }
    await (await acceso()).abrirSesion(f.id);
    const usuario = (await acceso()).aUsuario(f);
    await (await acceso()).auditar(f.nombre, "Inicio de sesión", usuario.rol === "medico" ? "Acceso al panel administrativo" : `Acceso al panel · ${usuario.area ?? ""}`);
    return { ok: true, usuario };
  });

export const sesionServidor = createServerFn({ method: "GET" }).handler(async () => (await acceso()).usuarioActual());

export const salirServidor = createServerFn({ method: "POST" }).handler(async () => {
  const { hayBase, db } = await modulo();
  const a = await acceso();
  const token = a.tokenCookie();
  if (hayBase() && token) {
    const sql = await db();
    await sql`DELETE FROM sesiones WHERE token = ${token}`;
  }
  a.borrarCookie();
  return { ok: true };
});

export const cambiarClaveServidor = createServerFn({ method: "POST" })
  .validator((d: { actual: string; nueva: string }) => d)
  .handler(async ({ data }): Promise<Resultado> => {
    const { db, hashClave, verificarClave } = await modulo();
    const u = await (await acceso()).usuarioActual();
    if (!u) return { ok: false, error: "Tu sesión venció. Volvé a ingresar." };
    const sql = await db();
    const filas = (await sql`SELECT hash FROM usuarios WHERE id = ${u.id}`) as { hash: string | null }[];
    if (!verificarClave(data.actual, filas[0]?.hash ?? null)) return { ok: false, error: "La contraseña actual no es correcta." };
    if (data.nueva.length < 6) return { ok: false, error: "La nueva contraseña debe tener al menos 6 caracteres." };
    await sql`UPDATE usuarios SET hash = ${hashClave(data.nueva)} WHERE id = ${u.id}`;
    await (await acceso()).auditar(u.nombre, "Contraseña cambiada");
    return { ok: true };
  });

/* ---------- Personal (lo administran los médicos) ---------- */

export const listarPersonalServidor = createServerFn({ method: "GET" }).handler(async (): Promise<Resultado<{ personal: PersonalServidor[]; conClave: string[] }>> => {
  const { db } = await modulo();
  try {
    await (await acceso()).exigirDireccion();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const sql = await db();
  const filas = (await sql`SELECT id, nombre, area, documento, activo, invitacion, creado, creado_por, (hash IS NOT NULL) AS con_clave FROM usuarios WHERE rol <> 'medico' ORDER BY creado`) as {
    id: string; nombre: string; area: string | null; documento: string | null; activo: boolean; invitacion: string | null; creado: string; creado_por: string | null; con_clave: boolean;
  }[];
  return {
    ok: true,
    conClave: filas.filter((f) => f.con_clave).map((f) => f.id),
    personal: filas.map((f) => ({
      id: f.id,
      nombre: f.nombre,
      activo: f.activo,
      creado: new Date(f.creado).toISOString(),
      creadoPor: f.creado_por ?? "",
      ...(f.area ? { area: f.area } : {}),
      ...(f.documento ? { documento: f.documento } : {}),
      ...(f.invitacion ? { invitacion: f.invitacion } : {}),
    })),
  };
});

/** Guarda la lista completa del personal (altas, bajas, invitaciones). No toca contraseñas. */
export const guardarPersonalServidor = createServerFn({ method: "POST" })
  .validator((d: { personal: PersonalServidor[]; resetear?: string[] }) => d)
  .handler(async ({ data }): Promise<Resultado> => {
    const { db } = await modulo();
    let u: UsuarioServidor;
    try {
      u = await (await acceso()).exigirDireccion();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const sql = await db();
    for (const p of data.personal) {
      if (ADMINS_IDS.includes(p.id)) continue;
      const area = p.area ?? "Enfermería";
      const rol = area === "Enfermería" ? "enfermeria" : "personal";
      await sql`INSERT INTO usuarios (id, nombre, rol, area, documento, activo, invitacion, creado, creado_por)
        VALUES (${p.id}, ${p.nombre}, ${rol}, ${area}, ${p.documento ?? null}, ${p.activo}, ${p.invitacion ?? null}, ${p.creado}, ${p.creadoPor || u.nombre})
        ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, rol = EXCLUDED.rol, area = EXCLUDED.area, documento = EXCLUDED.documento,
          activo = EXCLUDED.activo, invitacion = EXCLUDED.invitacion`;
      if (!p.activo) await sql`DELETE FROM sesiones WHERE usuario_id = ${p.id}`;
    }
    for (const id of data.resetear ?? []) {
      if (ADMINS_IDS.includes(id)) continue;
      await sql`UPDATE usuarios SET hash = NULL WHERE id = ${id}`;
      await sql`DELETE FROM sesiones WHERE usuario_id = ${id}`;
    }
    return { ok: true };
  });

export const verInvitacion = createServerFn({ method: "GET" })
  .validator((d: { id: string; token: string }) => d)
  .handler(async ({ data }) => {
    const { db } = await modulo();
    const sql = await db();
    const filas = (await sql`SELECT id, nombre, area, documento, activo, invitacion, creado, creado_por FROM usuarios WHERE id = ${data.id} AND rol <> 'medico'`) as {
      id: string; nombre: string; area: string | null; documento: string | null; activo: boolean; invitacion: string | null; creado: string; creado_por: string | null;
    }[];
    const f = filas[0];
    if (!f || !f.activo || !f.invitacion || f.invitacion !== data.token) return null;
    return { id: f.id, nombre: f.nombre, activo: true, creado: new Date(f.creado).toISOString(), creadoPor: f.creado_por ?? "", invitacion: f.invitacion, ...(f.area ? { area: f.area } : {}), ...(f.documento ? { documento: f.documento } : {}) } as PersonalServidor;
  });

export const aceptarInvitacionServidor = createServerFn({ method: "POST" })
  .validator((d: { id: string; token: string; password: string }) => d)
  .handler(async ({ data }): Promise<Resultado<{ usuario: UsuarioServidor }>> => {
    const { db, hashClave } = await modulo();
    if (data.password.length < 6) return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
    const sql = await db();
    const filas = (await sql`UPDATE usuarios SET hash = ${hashClave(data.password)}, invitacion = NULL
      WHERE id = ${data.id} AND invitacion = ${data.token} AND activo = true AND rol <> 'medico'
      RETURNING id, nombre, rol, area`) as { id: string; nombre: string; rol: string; area: string | null }[];
    const f = filas[0];
    if (!f) return { ok: false, error: "Este link ya se usó o no es válido. Pedí uno nuevo." };
    await (await acceso()).auditar(f.nombre, "Contraseña creada", `Invitación aceptada · ${f.area ?? ""}`);
    await (await acceso()).abrirSesion(f.id);
    return { ok: true, usuario: (await acceso()).aUsuario(f) };
  });

/* ===================================================================== */
/* Archivos (música de espera) → Vercel Blob                               */
/* ===================================================================== */

export const subirAudioServidor = createServerFn({ method: "POST" })
  .validator((d: { nombre: string; tipo: string; base64: string }) => d)
  .handler(async ({ data }): Promise<Resultado<{ url: string }>> => {
    try {
      await (await acceso()).exigirDireccion();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    if (!process.env["BLOB_READ_WRITE_TOKEN"]) return { ok: false, error: "El almacenamiento de archivos no está configurado." };
    if (!data.tipo.startsWith("audio/")) return { ok: false, error: "El archivo tiene que ser de audio." };
    const buf = Buffer.from(data.base64, "base64");
    if (buf.length > 15 * 1024 * 1024) return { ok: false, error: "El archivo supera 15 MB." };
    const { put } = await import("@vercel/blob");
    const limpio = data.nombre.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(0, 60) || "tema";
    const r = await put(`musica/${limpio}`, buf, { access: "public", contentType: data.tipo, addRandomSuffix: true });
    return { ok: true, url: r.url };
  });

/* ===================================================================== */
/* Colecciones: turnos, padrón y pacientes del portal                      */
/* ===================================================================== */

const colecciones = () => import("./colecciones.server");

type Quien = { tipo: "staff"; id: string; nombre: string; medico: boolean; area: string } | { tipo: "paciente"; id: string; nombre: string } | null;

async function quienSoy(): Promise<Quien> {
  const u = await (await acceso()).usuarioActual();
  if (u) return { tipo: "staff", id: u.id, nombre: u.nombre, medico: u.rol === "medico", area: u.area ?? (u.rol === "enfermeria" ? "Enfermería" : "") };
  const c = await colecciones();
  const p = await c.pacienteActual().catch(() => null);
  if (p) return { tipo: "paciente", id: p.id, nombre: String(p["nombre"] ?? "") };
  return null;
}

/** Permisos por área guardados por los médicos (si no hay, valen los de fábrica). */
async function permisosGuardados(): Promise<Permisos> {
  const sql = await (await modulo()).db();
  const filas = (await sql`SELECT valor FROM datos WHERE clave = 'gb_permisos'`) as { valor: Permisos }[];
  return filas[0]?.valor ?? {};
}

/** ¿Este integrante del personal puede ver / editar la colección según su área? */
async function areaPermite(q: Extract<Quien, { tipo: "staff" }>, coleccion: string, accion: "ver" | "editar") {
  if (q.medico) return true;
  return permiteColeccion(await permisosGuardados(), q.area, coleccion, accion);
}

/** Lee una colección. Los médicos ven todo, el personal según su área y el paciente solo lo suyo. */
export const leerColeccion = createServerFn({ method: "GET" })
  .validator((d: { coleccion: string }) => d)
  .handler(async ({ data }): Promise<Resultado<{ json: string }>> => {
    const { hayBase } = await modulo();
    if (!hayBase()) return { ok: false, error: "Sin base de datos." };
    const c = await colecciones();
    if (!c.esColeccion(data.coleccion)) return { ok: false, error: "Colección no habilitada." };
    const q = await quienSoy();
    if (!q) return { ok: false, error: "Sin sesión." };
    // Chat interno: todo el personal; el canal de médicos solo lo ven médicos y Dirección
    if (data.coleccion === "gb_mensajes") {
      if (q.tipo !== "staff") return { ok: true, json: "[]" };
      const todos = await c.leer("gb_mensajes");
      const veMedicos = q.medico || q.area === AREA_DIRECCION || AREAS_MEDICAS.includes(q.area);
      return { ok: true, json: JSON.stringify(todos.filter((m) => m["canal"] !== "medicos" || veMedicos)) };
    }
    if (q.tipo === "staff" && !(await areaPermite(q, data.coleccion, "ver"))) return { ok: true, json: "[]" };
    let filas = await c.leer(data.coleccion);
    if (q.tipo === "paciente") {
      if (data.coleccion === "gb_pacientes") filas = filas.filter((p) => p.id === q.id);
      else if (c.DEL_PACIENTE.includes(data.coleccion)) filas = filas.filter((t) => t["pacienteId"] === q.id);
      else filas = [];
    }
    return { ok: true, json: JSON.stringify(filas) };
  });

/** Aplica cambios fila por fila (así dos personas pueden trabajar a la vez sin pisarse). */
export const aplicarCambios = createServerFn({ method: "POST" })
  .validator((d: { coleccion: string; upserts: string[]; borrar: string[] }) => d)
  .handler(async ({ data }): Promise<Resultado> => {
    const c = await colecciones();
    if (!c.esColeccion(data.coleccion)) return { ok: false, error: "Colección no habilitada." };
    const q = await quienSoy();
    if (!q) return { ok: false, error: "Tu sesión venció. Volvé a ingresar." };
    const filas = data.upserts.map((x) => JSON.parse(x) as Record<string, unknown> & { id: string }).filter((f) => typeof f.id === "string" && f.id);

    // Auditoría: cualquiera agrega eventos, nadie los cambia ni los borra (salvo los médicos)
    if (data.coleccion === "gb_audit" && !(q.tipo === "staff" && q.medico)) {
      for (const f of filas) if (!(await c.uno("gb_audit", f.id))) await c.guardar("gb_audit", { ...f, usuario: q.nombre });
      return { ok: true };
    }

    // Chat interno: cada uno escribe a su nombre; borra lo suyo (médicos y Dirección, cualquiera)
    if (data.coleccion === "gb_mensajes") {
      if (q.tipo !== "staff") return { ok: false, error: "No autorizado." };
      const jefe = q.medico || q.area === AREA_DIRECCION;
      for (const f of filas) {
        const previo = await c.uno("gb_mensajes", f.id);
        if (previo && previo["deId"] !== q.id && !jefe) return { ok: false, error: "Solo podés editar tus mensajes." };
        if (!previo && f["canal"] === "avisos" && !jefe) return { ok: false, error: "En Avisos publican los médicos y Dirección." };
        await c.guardar("gb_mensajes", { ...f, deId: previo?.["deId"] ?? q.id, de: previo?.["de"] ?? q.nombre });
      }
      for (const id of data.borrar) {
        const previo = await c.uno("gb_mensajes", id);
        if (previo && (previo["deId"] === q.id || jefe)) await c.borrar("gb_mensajes", [id]);
      }
      return { ok: true };
    }

    if (q.tipo === "staff") {
      if (!(await areaPermite(q, data.coleccion, "editar"))) {
        await (await acceso()).auditar(q.nombre, "Cambio bloqueado por permisos", `${q.area || "Sin área"} · ${data.coleccion.replace("gb_", "")}`);
        return { ok: false, error: `Tu área (${q.area || "sin área"}) no tiene permiso para modificar esto. Pedíselo a un médico administrador.` };
      }
      for (const f of filas) await c.guardar(data.coleccion, f);
      await c.borrar(data.coleccion, data.borrar);
      return { ok: true };
    }

    // Paciente: lo que carga en su portal (controles, medicación, autorizaciones) solo si es suyo
    if (c.EDITA_PACIENTE.includes(data.coleccion)) {
      for (const f of filas) {
        const previo = await c.uno(data.coleccion, f.id);
        if (previo && previo["pacienteId"] !== q.id) return { ok: false, error: "No autorizado." };
        await c.guardar(data.coleccion, { ...f, pacienteId: q.id });
      }
      for (const id of data.borrar) {
        const previo = await c.uno(data.coleccion, id);
        if (previo && previo["pacienteId"] === q.id) await c.borrar(data.coleccion, [id]);
      }
      return { ok: true };
    }
    // Paciente: solo pedir/cancelar sus turnos y editar su perfil
    if (data.borrar.length) return { ok: false, error: "No autorizado." };
    if (data.coleccion === "gb_turnos") {
      for (const f of filas) {
        const previo = await c.uno("gb_turnos", f.id);
        if (previo) {
          if (previo["pacienteId"] !== q.id) return { ok: false, error: "No autorizado." };
          if (f["estado"] === "Cancelado") await c.guardar("gb_turnos", { ...previo, estado: "Cancelado" } as typeof f);
          continue;
        }
        const t: Record<string, unknown> & { id: string } = { ...f, pacienteId: q.id, paciente: q.nombre, estado: "Pendiente", origen: "portal" };
        if (await c.horarioOcupado(String(t["doctor"]), String(t["fecha"]), String(t["hora"]))) return { ok: false, error: "Ese horario se acaba de ocupar. Elegí otro." };
        await c.guardar("gb_turnos", t);
        await (await acceso()).auditar(q.nombre, "Turno pedido desde el portal", `${t["fecha"]} ${t["hora"]} · ${t["doctor"]}`);
      }
      return { ok: true };
    }
    if (data.coleccion === "gb_pacientes") {
      const f = filas.find((x) => x.id === q.id);
      const previo = await c.uno("gb_pacientes", q.id);
      if (!f || !previo) return { ok: false, error: "No autorizado." };
      const permitido: Record<string, unknown> = {};
      for (const k of ["telefono", "email", "ficha", "clave"]) if (k in f) permitido[k] = f[k];
      await c.guardar("gb_pacientes", { ...previo, ...permitido, id: q.id });
      return { ok: true };
    }
    return { ok: false, error: "No autorizado." };
  });

/** Horarios tomados (sin datos de pacientes) para mostrar disponibilidad en la web. */
export const horariosOcupados = createServerFn({ method: "GET" })
  .validator((d: { desde: string }) => d)
  .handler(async ({ data }) => {
    const { hayBase } = await modulo();
    if (!hayBase()) return [] as { doctor: string; fecha: string; hora: string }[];
    return (await colecciones()).ocupadosDesde(data.desde);
  });

/** Reserva desde la web pública (sin cuenta). */
export const reservarTurnoPublico = createServerFn({ method: "POST" })
  .validator((d: { fecha: string; hora: string; paciente: string; doctor: string; motivo: string; telefono: string; email: string }) => d)
  .handler(async ({ data }): Promise<Resultado<{ id: string }>> => {
    const c = await colecciones();
    const limpio = (s: string, n: number) => String(s ?? "").trim().slice(0, n);
    const t = {
      id: (await modulo()).tokenAleatorio(5),
      fecha: limpio(data.fecha, 10),
      hora: limpio(data.hora, 5),
      paciente: limpio(data.paciente, 120),
      doctor: limpio(data.doctor, 120),
      motivo: limpio(data.motivo, 300),
      telefono: limpio(data.telefono, 40),
      email: limpio(data.email, 120),
      estado: "Pendiente",
      origen: "web",
    };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(t.fecha) || !/^\d{2}:\d{2}$/.test(t.hora) || t.paciente.length < 3 || !t.telefono) return { ok: false, error: "Faltan datos del turno." };
    if (await c.horarioOcupado(t.doctor, t.fecha, t.hora)) return { ok: false, error: "Ese horario se acaba de ocupar. Elegí otro, por favor." };
    await c.guardar("gb_turnos", t);
    await (await acceso()).auditar("Web", "Turno solicitado desde la web", `${t.paciente} · ${t.fecha} ${t.hora} · ${t.doctor}`);
    return { ok: true, id: t.id };
  });

/** Ingreso al portal del paciente. */
export const ingresarPacienteServidor = createServerFn({ method: "POST" })
  .validator((d: { usuario: string; codigo: string }) => d)
  .handler(async ({ data }): Promise<Resultado<{ json: string }>> => {
    const c = await colecciones();
    const u = data.usuario.trim().toLowerCase();
    const dni = u.replace(/\D/g, "");
    const lista = await c.leer("gb_pacientes");
    const p = lista.find((x) => (dni.length >= 5 && x["dni"] === dni) || (u.includes("@") && String(x["email"] ?? "").toLowerCase() === u));
    if (!p) return { ok: false, error: "No encontramos un paciente con esa cédula o correo. Pedile a la clínica que te envíe la invitación." };
    if (p["estado"] === "Revocado") return { ok: false, error: "Tu acceso al portal está deshabilitado. Comunicate con la clínica." };
    const cod = data.codigo.trim();
    const valida = cod === p["codigo"] || (!!p["clave"] && c.sha256(cod) === p["clave"]);
    if (!valida) return { ok: false, error: p["clave"] ? "El código o la contraseña no son correctos." : "El código no es correcto. Revisá el mensaje de la clínica." };
    const primero = p["estado"] === "Invitado";
    const act = { ...p, estado: "Activo", ultimoIngreso: new Date().toISOString() };
    await c.guardar("gb_pacientes", act);
    await c.abrirSesionPaciente(p.id, (await modulo()).tokenAleatorio());
    await (await acceso()).auditar(String(p["nombre"]), primero ? "Primer ingreso al portal" : "Ingreso al portal", `Paciente C.C. ${p["dni"]}`);
    return { ok: true, json: JSON.stringify(act) };
  });

export const salirPacienteServidor = createServerFn({ method: "POST" }).handler(async () => {
  await (await colecciones()).cerrarSesionPaciente();
  return { ok: true };
});
