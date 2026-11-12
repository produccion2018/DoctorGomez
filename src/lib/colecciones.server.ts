/** Colecciones (turnos, padrón, pacientes del portal) guardadas fila por fila. Solo servidor. */
import { createHash } from "node:crypto";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";

const db = async () => (await import("./db.server")).db();

export const COLECCIONES = ["gb_turnos", "gb_padron", "gb_pacientes"] as const;
export type Coleccion = (typeof COLECCIONES)[number];
export const esColeccion = (c: string): c is Coleccion => (COLECCIONES as readonly string[]).includes(c);

type Fila = Record<string, unknown> & { id: string };
const COOKIE_PAC = "gb_pac";

export async function leer(col: Coleccion): Promise<Fila[]> {
  const sql = await db();
  const filas = (await sql`SELECT valor FROM registros WHERE coleccion = ${col} ORDER BY actualizado`) as { valor: Fila }[];
  return filas.map((f) => f.valor);
}

export async function uno(col: Coleccion, id: string): Promise<Fila | null> {
  const sql = await db();
  const filas = (await sql`SELECT valor FROM registros WHERE coleccion = ${col} AND id = ${id}`) as { valor: Fila }[];
  return filas[0]?.valor ?? null;
}

export async function guardar(col: Coleccion, fila: Fila) {
  const sql = await db();
  await sql`INSERT INTO registros (coleccion, id, valor, actualizado) VALUES (${col}, ${fila.id}, ${JSON.stringify(fila)}::jsonb, now())
    ON CONFLICT (coleccion, id) DO UPDATE SET valor = EXCLUDED.valor, actualizado = now()`;
}

export async function borrar(col: Coleccion, ids: string[]) {
  if (!ids.length) return;
  const sql = await db();
  await sql`DELETE FROM registros WHERE coleccion = ${col} AND id = ANY(${ids})`;
}

/** ¿Ese horario ya está tomado por un turno no cancelado? */
export async function horarioOcupado(doctor: string, fecha: string, hora: string, excepto?: string) {
  const sql = await db();
  const filas = (await sql`SELECT 1 FROM registros WHERE coleccion = 'gb_turnos'
    AND valor->>'doctor' = ${doctor} AND valor->>'fecha' = ${fecha} AND valor->>'hora' = ${hora}
    AND coalesce(valor->>'estado','') <> 'Cancelado' AND id <> ${excepto ?? ""} LIMIT 1`) as unknown[];
  return filas.length > 0;
}

export async function ocupadosDesde(fecha: string) {
  const sql = await db();
  return (await sql`SELECT valor->>'doctor' AS doctor, valor->>'fecha' AS fecha, valor->>'hora' AS hora FROM registros
    WHERE coleccion = 'gb_turnos' AND valor->>'fecha' >= ${fecha} AND coalesce(valor->>'estado','') <> 'Cancelado'`) as { doctor: string; fecha: string; hora: string }[];
}

/* ---------- Sesión del paciente (portal) ---------- */
export const sha256 = (t: string) => createHash("sha256").update(t).digest("hex");

export async function abrirSesionPaciente(id: string, token: string) {
  const sql = await db();
  await sql`DELETE FROM sesiones_pac WHERE expira < now()`;
  await sql`INSERT INTO sesiones_pac (token, paciente_id, expira) VALUES (${token}, ${id}, now() + interval '30 days')`;
  setCookie(COOKIE_PAC, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 30 * 24 * 3600 });
}

export async function pacienteActual(): Promise<Fila | null> {
  const token = getCookie(COOKIE_PAC);
  if (!token) return null;
  const sql = await db();
  const filas = (await sql`SELECT paciente_id FROM sesiones_pac WHERE token = ${token} AND expira > now()`) as { paciente_id: string }[];
  if (!filas[0]) return null;
  const p = await uno("gb_pacientes", filas[0].paciente_id);
  return p && p["estado"] !== "Revocado" ? p : null;
}

export async function cerrarSesionPaciente() {
  const token = getCookie(COOKIE_PAC);
  if (token) {
    const sql = await db();
    await sql`DELETE FROM sesiones_pac WHERE token = ${token}`;
  }
  deleteCookie(COOKIE_PAC, { path: "/" });
}
