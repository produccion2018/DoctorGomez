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