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
/** Datos que solo los médicos administradores pueden modificar. */
const SOLO_MEDICOS = ["gb_sitio", "gb_agenda"] as const;
const ADMINS_IDS = ["alberto", "alonso"];

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
    const permitidas = data.claves.filter((c) => (PUBLICOS as readonly string[]).includes(c));
    if (!permitidas.length) return {} as Record<string, string>;
    const sql = await db();
    const filas = (await sql`SELECT clave, valor FROM datos WHERE clave = ANY(${permitidas})`) as { clave: string; valor: unknown }[];
    return Object.fromEntries(filas.map((f) => [f.clave, JSON.stringify(f.valor)])) as Record<string, string>;
  });

export const guardarDatoServidor = createServerFn({ method: "POST" })
  .validator((d: { clave: string; valor: string }) => d)
  .handler(async ({ data }): Promise<Resultado> => {
    const { db } = await modulo();
    if (!(SOLO_MEDICOS as readonly string[]).includes(data.clave)) return { ok: false, error: "Dato no habilitado." };
    let u: UsuarioServidor;
    try {
      u = await (await acceso()).exigirMedico();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const sql = await db();
    const json = data.valor;
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
    await (await acceso()).exigirMedico();
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
      u = await (await acceso()).exigirMedico();
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
      await (await acceso()).exigirMedico();
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
