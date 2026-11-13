/** Sesiones, cookies y auditoría. Solo servidor. */
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import type { UsuarioServidor } from "./servidor";

const modulo = () => import("./db.server");

const COOKIE = "gb_sesion";
const DIAS_SESION = 14;

/** Los dos únicos administradores. */
const ADMINS = [
  { id: "alonso", nombre: "Dr. Carlos Alonso Gómez Bolaño" },
  { id: "alberto", nombre: "Dr. Carlos Alberto Gómez Bolaño" },
];

/** Datos que cualquiera puede leer (se muestran en la web pública). */
const PUBLICOS = ["gb_sitio", "gb_agenda"] as const;
/** Datos que solo los médicos administradores pueden modificar. */
const SOLO_MEDICOS = ["gb_sitio", "gb_agenda"] as const;



export async function sembrarAdmins() {
  const { db } = await modulo();
  const sql = await db();
  for (const a of ADMINS) {
    await sql`INSERT INTO usuarios (id, nombre, rol, creado_por) VALUES (${a.id}, ${a.nombre}, 'medico', 'sistema') ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre`;
  }
  return sql;
}

export async function auditar(usuario: string, accion: string, detalle = "") {
  try {
    const { db } = await modulo();
    const sql = await db();
    const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    const ev = { id, fecha: new Date().toISOString(), usuario, accion, detalle };
    await sql`INSERT INTO registros (coleccion, id, valor) VALUES ('gb_audit', ${id}, ${JSON.stringify(ev)}::jsonb)`;
  } catch {
    /* la auditoría nunca bloquea */
  }
}

export const aUsuario = (r: { id: string; nombre: string; rol: string; area: string | null }): UsuarioServidor => ({
  id: r.id,
  nombre: r.nombre,
  rol: r.rol as UsuarioServidor["rol"],
  ...(r.area ? { area: r.area } : {}),
});

/** Usuario de la sesión actual (por cookie) o null. */
export async function usuarioActual(): Promise<UsuarioServidor | null> {
  const { hayBase, db } = await modulo();
  if (!hayBase()) return null;
  const token = getCookie(COOKIE);
  if (!token) return null;
  const sql = await db();
  const filas = (await sql`
    SELECT u.id, u.nombre, u.rol, u.area FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id
    WHERE s.token = ${token} AND s.expira > now() AND u.activo = true
  `) as { id: string; nombre: string; rol: string; area: string | null }[];
  return filas[0] ? aUsuario(filas[0]) : null;
}

export async function exigirMedico(): Promise<UsuarioServidor> {
  const u = await usuarioActual();
  if (!u || u.rol !== "medico") throw new Error("Necesitás ingresar como médico administrador.");
  return u;
}

/** Médicos administradores o Dirección general (gerencia): manejan personal, permisos y sitio. */
export async function exigirDireccion(): Promise<UsuarioServidor> {
  const u = await usuarioActual();
  if (!u || (u.rol !== "medico" && u.area !== "Dirección general")) throw new Error("Necesitás ingresar como médico administrador o Dirección general.");
  return u;
}

/* ---------- Freno contra adivinar contraseñas: 5 fallos → 15 minutos bloqueado ---------- */
const MAX_FALLOS = 5;
const MINUTOS_BLOQUEO = 15;
export async function bloqueado(clave: string): Promise<string | null> {
  const sql = await (await modulo()).db();
  const f = (await sql`SELECT hasta FROM intentos WHERE clave = ${clave} AND hasta > now()`) as { hasta: string }[];
  if (!f[0]) return null;
  const min = Math.max(1, Math.ceil((new Date(f[0].hasta).getTime() - Date.now()) / 60000));
  return `Demasiados intentos fallidos. Probá de nuevo en ${min} minuto${min === 1 ? "" : "s"}.`;
}
export async function registrarFallo(clave: string) {
  const sql = await (await modulo()).db();
  await sql`INSERT INTO intentos (clave, fallos) VALUES (${clave}, 1)
    ON CONFLICT (clave) DO UPDATE SET fallos = CASE WHEN intentos.hasta IS NOT NULL AND intentos.hasta < now() THEN 1 ELSE intentos.fallos + 1 END,
      hasta = CASE WHEN (CASE WHEN intentos.hasta IS NOT NULL AND intentos.hasta < now() THEN 1 ELSE intentos.fallos + 1 END) >= ${MAX_FALLOS}
        THEN now() + make_interval(mins => ${MINUTOS_BLOQUEO}) ELSE NULL END`;
}
export async function limpiarFallos(clave: string) {
  const sql = await (await modulo()).db();
  await sql`DELETE FROM intentos WHERE clave = ${clave}`;
}

export async function abrirSesion(id: string) {
  const { db, tokenAleatorio } = await modulo();
  const sql = await db();
  const token = tokenAleatorio();
  await sql`DELETE FROM sesiones WHERE expira < now()`;
  await sql`INSERT INTO sesiones (token, usuario_id, expira) VALUES (${token}, ${id}, now() + make_interval(days => ${DIAS_SESION}))`;
  setCookie(COOKIE, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: DIAS_SESION * 24 * 3600 });
}


export const tokenCookie = () => getCookie(COOKIE);
export const borrarCookie = () => deleteCookie(COOKIE, { path: "/" });
