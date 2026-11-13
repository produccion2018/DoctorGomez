import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
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

/** Médicos y Dirección general están obligados a usar 2FA. */
export const exige2fa = (u: { rol: string; area?: string | null }) => u.rol === "medico" || u.area === "Dirección general";

/** Sesión por cookie, aunque le falte el segundo paso (2FA). Solo para las pantallas de 2FA. */
export async function sesionCompleta(): Promise<{ usuario: UsuarioServidor; falta2fa: boolean; totpOk: boolean } | null> {
  const { hayBase, db } = await modulo();
  if (!hayBase()) return null;
  const token = getCookie(COOKIE);
  if (!token) return null;
  const sql = await db();
  const filas = (await sql`
    SELECT u.id, u.nombre, u.rol, u.area, u.totp_ok, s.limitada FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id
    WHERE s.token = ${token} AND s.expira > now() AND u.activo = true
  `) as { id: string; nombre: string; rol: string; area: string | null; totp_ok: boolean; limitada: boolean }[];
  const f = filas[0];
  if (!f) return null;
  return { usuario: aUsuario(f), falta2fa: f.limitada || (exige2fa(f) && !f.totp_ok), totpOk: f.totp_ok };
}

/** Usuario de la sesión actual (por cookie) o null. Sin 2FA completo (si es obligatorio) no hay acceso a nada. */
export async function usuarioActual(): Promise<UsuarioServidor | null> {
  const s = await sesionCompleta();
  return s && !s.falta2fa ? s.usuario : null;
}

export async function exigirMedico(): Promise<UsuarioServidor> {
  const u = await usuarioActual();
  if (!u || u.rol !== "medico") throw new Error("Necesita ingresar como médico administrador.");
  return u;
}

/** Médicos administradores o Dirección general (gerencia): manejan personal, permisos y sitio. */
export async function exigirDireccion(): Promise<UsuarioServidor> {
  const u = await usuarioActual();
  if (!u || (u.rol !== "medico" && u.area !== "Dirección general")) throw new Error("Necesita ingresar como médico administrador o Dirección general.");
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
  return `Demasiados intentos fallidos. Intente de nuevo en ${min} minuto${min === 1 ? "" : "s"}.`;
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

export async function abrirSesion(id: string, limitada = false) {
  const { db, tokenAleatorio } = await modulo();
  const sql = await db();
  const token = tokenAleatorio();
  await sql`DELETE FROM sesiones WHERE expira < now()`;
  await sql`INSERT INTO sesiones (token, usuario_id, expira, limitada) VALUES (${token}, ${id}, now() + make_interval(days => ${limitada ? 1 : DIAS_SESION}), ${limitada})`;
  setCookie(COOKIE, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: DIAS_SESION * 24 * 3600 });
}


export const tokenCookie = () => getCookie(COOKIE);
export const borrarCookie = () => deleteCookie(COOKIE, { path: "/" });


/* ---------- 2FA con app de códigos (Google Authenticator, Microsoft Authenticator…) ---------- */
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export function base32(buf: Uint8Array) {
  let bits = 0;
  let val = 0;
  let out = "";
  for (const b of buf) {
    val = ((val << 8) | b) & 0xffffff;
    bits += 8;
    while (bits >= 5) {
      out += B32[(val >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(val << (5 - bits)) & 31];
  return out;
}
function desdeBase32(s: string) {
  let bits = 0;
  let val = 0;
  const out: number[] = [];
  for (const ch of s.replace(/=+$/, "").toUpperCase()) {
    const i = B32.indexOf(ch);
    if (i < 0) continue;
    val = ((val << 5) | i) & 0xffffff;
    bits += 5;
    if (bits >= 8) {
      out.push((val >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}
function codigoEn(clave: Buffer, paso: number) {
  const b = Buffer.alloc(8);
  b.writeBigUInt64BE(BigInt(paso));
  const h = createHmac("sha1", clave).update(b).digest();
  const o = h[h.length - 1]! & 15;
  const n = ((h[o]! & 127) << 24) | (h[o + 1]! << 16) | (h[o + 2]! << 8) | h[o + 3]!;
  return String(n % 1_000_000).padStart(6, "0");
}
/** Valida el código de 6 dígitos (acepta 30 s antes y después por diferencias de reloj). */
export function totpValido(secreto: string, codigo: string) {
  const c = codigo.replace(/\s/g, "");
  if (!/^\d{6}$/.test(c)) return false;
  const clave = desdeBase32(secreto);
  const paso = Math.floor(Date.now() / 30000);
  return [-1, 0, 1].some((d) => timingSafeEqual(Buffer.from(codigoEn(clave, paso + d)), Buffer.from(c)));
}
export const nuevoSecreto = () => base32(randomBytes(20));
export const sha = (x: string) => createHash("sha256").update(x).digest("hex");
/** 8 códigos de respaldo (por si se pierde el celular). Se muestran una sola vez. */
export function codigosRespaldo() {
  return Array.from({ length: 8 }, () => {
    const r = randomBytes(5).toString("hex").toUpperCase();
    return `${r.slice(0, 5)}-${r.slice(5)}`;
  });
}
