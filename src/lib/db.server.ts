/**
 * Acceso a la base de datos (Neon Postgres). Solo se usa del lado del servidor.
 * Si no hay DATABASE_URL configurada, la app sigue funcionando con el navegador (modo local).
 */
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

type Sql = NeonQueryFunction<false, false>;

let sqlCache: Sql | null = null;
let esquemaListo: Promise<void> | null = null;

export function urlBase(): string {
  return process.env["DATABASE_URL"] || process.env["POSTGRES_URL"] || process.env["DATABASE_URL_UNPOOLED"] || "";
}

export function hayBase(): boolean {
  return !!urlBase();
}

/** Devuelve el cliente SQL con las tablas ya creadas. */
export async function db(): Promise<Sql> {
  if (!sqlCache) sqlCache = neon(urlBase());
  if (!esquemaListo) {
    const sql = sqlCache;
    esquemaListo = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS datos (
        clave text PRIMARY KEY,
        valor jsonb NOT NULL,
        actualizado timestamptz NOT NULL DEFAULT now(),
        por text
      )`;
      await sql`CREATE TABLE IF NOT EXISTS usuarios (
        id text PRIMARY KEY,
        nombre text NOT NULL,
        rol text NOT NULL,
        area text,
        documento text,
        activo boolean NOT NULL DEFAULT true,
        hash text,
        invitacion text,
        creado timestamptz NOT NULL DEFAULT now(),
        creado_por text
      )`;
      await sql`CREATE TABLE IF NOT EXISTS sesiones (
        token text PRIMARY KEY,
        usuario_id text NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        expira timestamptz NOT NULL
      )`;
      await sql`CREATE TABLE IF NOT EXISTS auditoria (
        id bigserial PRIMARY KEY,
        fecha timestamptz NOT NULL DEFAULT now(),
        usuario text NOT NULL,
        accion text NOT NULL,
        detalle text NOT NULL DEFAULT ''
      )`;
    })().catch((e) => {
      esquemaListo = null;
      throw e;
    });
  }
  await esquemaListo;
  return sqlCache;
}

/* ---------- Contraseñas (scrypt con sal) ---------- */
export function hashClave(clave: string): string {
  const sal = randomBytes(16).toString("hex");
  const h = scryptSync(clave, sal, 64).toString("hex");
  return `scrypt$${sal}$${h}`;
}

export function verificarClave(clave: string, guardado: string | null): boolean {
  if (!guardado) return false;
  const [tipo, sal, h] = guardado.split("$");
  if (tipo !== "scrypt" || !sal || !h) return false;
  const a = Buffer.from(h, "hex");
  const b = scryptSync(clave, sal, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const tokenAleatorio = (n = 32) => randomBytes(n).toString("hex");
