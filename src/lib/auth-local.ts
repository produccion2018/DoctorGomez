import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  aceptarInvitacionServidor,
  cambiarClaveServidor,
  crearClaveServidor,
  estadoBackend,
  guardarDatoServidor,
  guardarPersonalServidor,
  ingresarServidor,
  leerDatos,
  listaIngreso,
  listarPersonalServidor,
  salirServidor,
  sesionServidor,
  leerColeccion,
  aplicarCambios,
  horariosOcupados,
  reservarTurnoPublico,
  ingresarPacienteServidor,
  salirPacienteServidor,
  type PersonalServidor,
} from "./servidor";

const SESSION_KEY = "gb_session";
const AUDIT_KEY = "gb_audit";
const PW_KEY = "gb_admin_pw_";
const BACKEND_KEY = "gb_backend";
const CONCLAVE_KEY = "gb_conclave";

/* =====================================================================
   Backend (Neon + Vercel). Si la base está conectada, el acceso y los datos
   compartidos van al servidor; si no, todo sigue funcionando en el navegador.
   ===================================================================== */

/** true cuando el servidor tiene la base de datos conectada. */
/** Pasa los nombres viejos ("Dr. Alonso Gómez Bolaño") a los completos en los datos guardados. */
function migrarNombres() {
  if (typeof window === "undefined" || localStorage.getItem("gb_nombres_v2")) return;
  const pares: [string, string][] = [
    ["Dr. Alonso Gómez Bolaño", "Dr. Carlos Alonso Gómez Bolaño"],
    ["Dr. Alberto Gómez Bolaño", "Dr. Carlos Alberto Gómez Bolaño"],
  ];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith("gb_")) continue;
    const v = localStorage.getItem(k);
    if (!v) continue;
    let n = v;
    for (const [a, b] of pares) n = n.split(a).join(b);
    if (n !== v) localStorage.setItem(k, n);
  }
  localStorage.setItem("gb_nombres_v2", "1");
}
if (typeof window !== "undefined") {
  try {
    migrarNombres();
  } catch {
    /* sin acceso a almacenamiento */
  }
}

export function modoServidor(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(BACKEND_KEY) === "1";
}

let inicio: Promise<boolean> | null = null;
/** Consulta una vez por carga si hay backend y trae la lista de acceso. */
export function iniciarBackend(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (!inicio) {
    inicio = (async () => {
      try {
        const r = await estadoBackend();
        localStorage.setItem(BACKEND_KEY, r.conectado ? "1" : "0");
        if (!r.conectado) return false;
        const l = await listaIngreso();
        localStorage.setItem(CONCLAVE_KEY, JSON.stringify(l.conClave));
        // Para la pantalla de ingreso alcanza con la lista pública (sin links de invitación)
        const actuales = listarEnfermeras();
        const porId = new Map(actuales.map((x) => [x.id, x]));
        const fusion = l.personal.map((p) => ({ ...(porId.get(p.id) ?? {}), ...p }) as Personal);
        localStorage.setItem(KEY_ENFERMERIA, JSON.stringify([...fusion, ...actuales.filter((x) => !x.activo && !fusion.some((y) => y.id === x.id))]));
        window.dispatchEvent(new CustomEvent("gb-store", { detail: KEY_ENFERMERIA }));
        return true;
      } catch {
        localStorage.setItem(BACKEND_KEY, "0");
        return false;
      }
    })();
  }
  return inicio;
}

/** Con backend: confirma que la cookie de sesión siga vigente. */
export async function validarSesion(): Promise<SessionUser | null> {
  if (!(await iniciarBackend())) return sesionActual();
  const u = await sesionServidor().catch(() => null);
  if (!u) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(u));
  return u;
}

/** Trae del servidor el personal completo (con links) — solo médicos. */
export async function sincronizarPersonal() {
  if (!(await iniciarBackend())) return;
  const r = await listarPersonalServidor().catch(() => null);
  if (!r || !r.ok) return;
  localStorage.setItem(CONCLAVE_KEY, JSON.stringify(r.conClave));
  localStorage.setItem(KEY_ENFERMERIA, JSON.stringify(r.personal));
  window.dispatchEvent(new CustomEvent("gb-store", { detail: KEY_ENFERMERIA }));
}

async function subirPersonal(lista: Personal[], resetear: string[] = []) {
  const r = await guardarPersonalServidor({ data: { personal: lista as PersonalServidor[], resetear } }).catch((e: Error) => ({ ok: false as const, error: e.message }));
  if (!r.ok) toast.error(`No se pudo guardar en el servidor: ${r.error}`);
  else void sincronizarPersonal();
}

export type Admin = { id: string; nombre: string };
export type Rol = "medico" | "enfermeria" | "personal";
export type SessionUser = { id: string; nombre: string; rol?: Rol; area?: string };
export type Evento = { id: string; fecha: string; usuario: string; accion: string; detalle: string };
type Result = { ok: true } | { ok: false; error: string };

// Los únicos usuarios con acceso. Cambiá los nombres acá si hace falta.
export const ADMINS: Admin[] = [
  { id: "alonso", nombre: "Dr. Carlos Alonso Gómez Bolaño" },
  { id: "alberto", nombre: "Dr. Carlos Alberto Gómez Bolaño" },
];
export const ADMIN_IDS = ADMINS.map((a) => a.id);

/** Todos los profesionales con agenda: los dos médicos y los que agregó la secretaría. */
export type ProfesionalAgenda = { id: string; nombre: string; especialidad: string; admin: boolean };
export function profesionalesAgenda(agendas: Record<string, { nombre?: string; especialidad?: string }>): ProfesionalAgenda[] {
  const esp: Record<string, string> = { alonso: "Cardiología", alberto: "Nefrología" };
  return [
    ...ADMINS.map((a) => ({ id: a.id, nombre: a.nombre, especialidad: esp[a.id] ?? "", admin: true })),
    ...Object.entries(agendas)
      .filter(([id, a]) => !ADMIN_IDS.includes(id) && a?.nombre)
      .map(([id, a]) => ({ id, nombre: a.nombre!, especialidad: a.especialidad ?? "", admin: false })),
  ];
}

/* ---------- Personal de enfermería (lo dan de alta los médicos) ---------- */
/** Persona del equipo con acceso al panel (enfermería, recepción, secretaría, etc.). */
export type Enfermera = { id: string; nombre: string; documento?: string; activo: boolean; creado: string; creadoPor: string; area?: string; invitacion?: string };
export type Personal = Enfermera;
export const KEY_ENFERMERIA = "gb_enfermeria";
export function listarEnfermeras(): Enfermera[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY_ENFERMERIA) ?? "[]") as Enfermera[];
  } catch {
    return [];
  }
}
export const listarPersonal = listarEnfermeras;
export const areaDe = (p: Personal) => p.area ?? "Enfermería";

/** Busca un usuario habilitado: médicos o personal activo. */
export function usuarioPorId(id: string): (SessionUser & { rol: Rol }) | null {
  const a = ADMINS.find((x) => x.id === id);
  if (a) return { id: a.id, nombre: a.nombre, rol: "medico" };
  const e = listarEnfermeras().find((x) => x.id === id && x.activo);
  if (!e) return null;
  const area = areaDe(e);
  return { id: e.id, nombre: e.nombre, rol: area === "Enfermería" ? "enfermeria" : "personal", area };
}

/* ---------- Invitaciones del personal (link para crear la contraseña) ---------- */
export function nuevoTokenInvitacion() {
  const b = new Uint8Array(12);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}
function guardarPersonal(lista: Personal[]) {
  localStorage.setItem(KEY_ENFERMERIA, JSON.stringify(lista));
  if (modoServidor()) void subirPersonal(lista);
  window.dispatchEvent(new CustomEvent("gb-store", { detail: KEY_ENFERMERIA }));
}
/** El link lleva los datos de la persona, así funciona también en otra computadora o celular. */
export function linkInvitacion(p: Personal, origen: string) {
  const datos = { i: p.id, n: p.nombre, a: areaDe(p), t: p.invitacion, d: p.documento };
  const codigo = btoa(unescape(encodeURIComponent(JSON.stringify(datos)))).replace(/=+$/, "");
  return `${origen}/login?invitacion=${encodeURIComponent(codigo)}`;
}
export function leerInvitacion(codigo: string): Personal | null {
  try {
    const d = JSON.parse(decodeURIComponent(escape(atob(codigo)))) as { i: string; n: string; a: string; t: string; d?: string };
    if (!d.i || !d.n || !d.t) return null;
    // Con backend el link se valida en el servidor al crear la contraseña
    if (modoServidor()) return { id: d.i, nombre: d.n, area: d.a, invitacion: d.t, activo: true, creado: new Date().toISOString(), creadoPor: "Invitación", ...(d.d ? { documento: d.d } : {}) };
    const local = listarEnfermeras().find((x) => x.id === d.i);
    if (local) return local.invitacion === d.t && local.activo ? local : null;
    // Abierto en otro dispositivo: se registra la persona acá
    const nueva: Personal = { id: d.i, nombre: d.n, area: d.a, invitacion: d.t, activo: true, creado: new Date().toISOString(), creadoPor: "Invitación", ...(d.d ? { documento: d.d } : {}) };
    guardarPersonal([...listarEnfermeras(), nueva]);
    return nueva;
  } catch {
    return null;
  }
}
export async function aceptarInvitacion(p: Personal, password: string): Promise<Result> {
  if (password.length < 8) return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  if (await iniciarBackend()) {
    const r = await aceptarInvitacionServidor({ data: { id: p.id, token: p.invitacion ?? "", password } });
    if (!r.ok) return r;
    localStorage.setItem(SESSION_KEY, JSON.stringify(r.usuario));
    return { ok: true };
  }
  localStorage.removeItem(PW_KEY + p.id);
  localStorage.setItem(PW_KEY + p.id, await hash(password));
  guardarPersonal(listarEnfermeras().map((x) => (x.id === p.id ? (({ invitacion: _i, ...resto }) => resto)(x) : x)));
  auditar(p.nombre, "Contraseña creada", `Invitación aceptada · ${areaDe(p)}`);
  return ingresar(p.id, password);
}
export function borrarClave(id: string) {
  if (modoServidor()) {
    void subirPersonal(listarEnfermeras(), [id]);
    return;
  }
  localStorage.removeItem(PW_KEY + id);
}

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
  if (modoServidor() && hayQuien()) void enviarCambios(AUDIT_KEY, [], [evento]);
  return lista;
}

export function tieneClave(id: string): boolean {
  if (modoServidor()) return leerDato<string[]>(CONCLAVE_KEY, []).includes(id);
  return localStorage.getItem(PW_KEY + id) !== null;
}

export async function crearClave(id: string, password: string): Promise<Result> {
  if (await iniciarBackend()) {
    const r = await crearClaveServidor({ data: { id, password } });
    if (r.ok) localStorage.setItem(CONCLAVE_KEY, JSON.stringify([...leerDato<string[]>(CONCLAVE_KEY, []), id]));
    return r;
  }
  const admin = usuarioPorId(id);
  if (!admin) return { ok: false, error: "Usuario no autorizado." };
  if (tieneClave(id)) return { ok: false, error: "Este usuario ya tiene contraseña." };
  if (password.length < 8) return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  localStorage.setItem(PW_KEY + id, await hash(password));
  auditar(admin.nombre, "Contraseña creada", "Primer ingreso");
  return { ok: true };
}

export async function ingresar(id: string, password: string): Promise<Result> {
  if (await iniciarBackend()) {
    const r = await ingresarServidor({ data: { id, password } });
    if (!r.ok) return r;
    localStorage.setItem(SESSION_KEY, JSON.stringify(r.usuario));
    return { ok: true };
  }
  const admin = usuarioPorId(id);
  if (!admin) return { ok: false, error: "Usuario no autorizado." };
  const guardado = localStorage.getItem(PW_KEY + id);
  if (!guardado) return { ok: false, error: "Este usuario todavía no creó su contraseña." };
  if ((await hash(password)) !== guardado) {
    auditar(admin.nombre, "Intento de acceso fallido", "Contraseña incorrecta");
    return { ok: false, error: "Contraseña incorrecta." };
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id: admin.id, nombre: admin.nombre, rol: admin.rol, ...(admin.area ? { area: admin.area } : {}) }));
  auditar(admin.nombre, "Inicio de sesión", admin.rol === "medico" ? "Acceso al panel administrativo" : `Acceso al panel · ${admin.area}`);
  return { ok: true };
}

export async function cambiarClave(id: string, actual: string, nueva: string): Promise<Result> {
  if (await iniciarBackend()) return cambiarClaveServidor({ data: { actual, nueva } });
  const guardado = localStorage.getItem(PW_KEY + id);
  if (!guardado) return { ok: false, error: "Todavía no hay una contraseña creada." };
  if ((await hash(actual)) !== guardado) return { ok: false, error: "La contraseña actual no es correcta." };
  if (nueva.length < 8) return { ok: false, error: "La nueva contraseña debe tener al menos 8 caracteres." };
  localStorage.setItem(PW_KEY + id, await hash(nueva));
  return { ok: true };
}

export function sesionActual(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as SessionUser;
    if (modoServidor()) return s; // la validez la confirma validarSesion()
    return usuarioPorId(s.id);
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem(SESSION_KEY);
  if (modoServidor()) void salirServidor().catch(() => undefined);
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

/** Datos que viven en el servidor y se ven en la web pública. */
const SINCRONIZADOS = ["gb_sitio", "gb_agenda", "gb_firmas", "gb_automatizaciones", "gb_automatizaciones_hechas", "gb_permisos"];
const INTERNOS = ["gb_firmas", "gb_automatizaciones", "gb_automatizaciones_hechas", "gb_permisos"];
const traidos = new Map<string, Promise<void>>();

function traerDelServidor(key: string): Promise<void> {
  if (!traidos.has(key)) {
    traidos.set(
      key,
      (async () => {
        if (!(await iniciarBackend())) return;
        if (INTERNOS.includes(key) && !sesionActual()) return;
        const r = await leerDatos({ data: { claves: [key] } }).catch(() => ({}) as Record<string, string>);
        const remoto = r[key];
        if (remoto !== undefined) {
          localStorage.setItem(key, remoto);
          window.dispatchEvent(new CustomEvent(EVT, { detail: key }));
        } else {
          // Primera vez con backend: si un médico ya tenía datos en este navegador, se suben
          const local = localStorage.getItem(key);
          const s = sesionActual();
          if (local && s?.rol === "medico") void guardarDatoServidor({ data: { clave: key, valor: local } }).catch(() => undefined);
        }
      })(),
    );
  }
  return traidos.get(key)!;
}

/* ---------- Colecciones fila por fila (turnos, padrón, pacientes) ---------- */
const COLECCIONES = [
  "gb_turnos", "gb_padron", "gb_pacientes",
  "gb_evoluciones", "gb_triage", "gb_recetas", "gb_laboratorio", "gb_estudios",
  "gb_controles", "gb_medicacion", "gb_autorizaciones",
  "gb_facturas", "gb_cobros", "gb_equipo", "gb_cierres", "gb_movs",
  "gb_audit", "gb_mensajes",
];
type ConId = { id: string };
const hayQuien = () => !!sesionActual() || !!localStorage.getItem("gb_sesion_paciente");

/** Vuelve a traer del servidor todo lo que el panel usa (al iniciar sesión). */
export async function refrescarTodo() {
  if (!(await iniciarBackend())) return;
  for (const k of INTERNOS) traidos.delete(k);
  await Promise.all([...INTERNOS.map((k) => traerDelServidor(k)), ...COLECCIONES.map((k) => traerColeccion(k))]);
}

async function traerColeccion(key: string) {
  if (!(await iniciarBackend()) || !hayQuien()) return;
  const r = await leerColeccion({ data: { coleccion: key } }).catch(() => null);
  if (!r || !r.ok) return;
  const remoto = JSON.parse(r.json) as ConId[];
  const local = leerDato<ConId[]>(key, []);
  const s = sesionActual();
  // Primera vez con backend: un médico sube lo que tenía cargado en su navegador
  if (remoto.length === 0 && local.length > 0 && s?.rol === "medico" && !localStorage.getItem(`gb_subido_${key}`)) {
    localStorage.setItem(`gb_subido_${key}`, "1");
    await enviarCambios(key, [], local);
    return;
  }
  if (JSON.stringify(remoto) !== JSON.stringify(local)) {
    localStorage.setItem(key, JSON.stringify(remoto));
    window.dispatchEvent(new CustomEvent(EVT, { detail: key }));
  }
}

async function enviarCambios(key: string, antes: ConId[], despues: ConId[]) {
  const previo = new Map(antes.map((x) => [x.id, JSON.stringify(x)]));
  const upserts = despues.filter((x) => x && x.id && previo.get(x.id) !== JSON.stringify(x)).map((x) => JSON.stringify(x));
  const ids = new Set(despues.map((x) => x.id));
  const borrar = antes.filter((x) => !ids.has(x.id)).map((x) => x.id);
  if (!upserts.length && !borrar.length) return;
  const r = await aplicarCambios({ data: { coleccion: key, upserts, borrar } }).catch((e: Error) => ({ ok: false as const, error: e.message }));
  if (!r.ok) {
    toast.error(r.error);
    void traerColeccion(key);
  }
}

/** Refresca las colecciones abiertas cada 20 s y al volver a la pestaña. */
const abiertas = new Map<string, number>();
let reloj: number | null = null;
function vigilar(key: string) {
  abiertas.set(key, (abiertas.get(key) ?? 0) + 1);
  if (!reloj && typeof window !== "undefined") {
    const tick = () => abiertas.forEach((n, k) => n > 0 && void traerColeccion(k));
    reloj = window.setInterval(tick, 20000);
    window.addEventListener("focus", tick);
  }
  return () => abiertas.set(key, (abiertas.get(key) ?? 1) - 1);
}

/** Mientras esté abierto el chat interno, refresca los mensajes cada pocos segundos. */
export function refrescoRapido(key: string, ms = 4000) {
  if (typeof window === "undefined") return () => undefined;
  const t = window.setInterval(() => void traerColeccion(key), ms);
  return () => window.clearInterval(t);
}

/** Horarios tomados (para la web pública y el portal). */
export async function ocupadosServidor(desde: string) {
  if (!(await iniciarBackend())) return null;
  return horariosOcupados({ data: { desde } }).catch(() => null);
}

/** Reserva desde la web pública: con backend va al servidor. */
export async function reservarTurnoWeb(t: { fecha: string; hora: string; paciente: string; doctor: string; motivo: string; telefono: string; email: string }): Promise<Result | null> {
  if (!(await iniciarBackend())) return null;
  return reservarTurnoPublico({ data: t });
}

export async function salirPortal() {
  localStorage.removeItem("gb_sesion_paciente");
  if (modoServidor()) await salirPacienteServidor().catch(() => undefined);
}

async function subirAlServidor(key: string, val: unknown) {
  if (!(await iniciarBackend())) return;
  const r = await guardarDatoServidor({ data: { clave: key, valor: JSON.stringify(val) } }).catch((e: Error) => ({ ok: false as const, error: e.message }));
  if (!r.ok) toast.error(`No se pudo publicar: ${r.error}`);
}

/** Estado sincronizado con localStorage (también entre pestañas). */
export function useDato<T>(key: string, fallback: T): readonly [T, (fn: (prev: T) => T) => void] {
  const [val, setVal] = useState<T>(fallback);
  useEffect(() => {
    const cargar = () => setVal(leerDato(key, fallback));
    cargar();
    if (SINCRONIZADOS.includes(key)) void traerDelServidor(key);
    const soltar = COLECCIONES.includes(key) ? vigilar(key) : null;
    if (soltar) void traerColeccion(key);
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
      soltar?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const actualizar = useCallback(
    (fn: (prev: T) => T) => {
      const previo = leerDato(key, fallback);
      const nuevo = fn(previo);
      guardarDato(key, nuevo);
      setVal(nuevo);
      if (SINCRONIZADOS.includes(key) && modoServidor()) void subirAlServidor(key, nuevo);
      if (key === KEY_ENFERMERIA && modoServidor()) void subirPersonal(nuevo as unknown as Personal[]);
      if (COLECCIONES.includes(key) && modoServidor() && Array.isArray(nuevo)) void enviarCambios(key, previo as unknown as ConId[], nuevo as unknown as ConId[]);
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
  /** Horario propio de cada día (clave = número de día), con pausa opcional de ese día. */
  porDia?: Record<string, RangoDia>;
  /** Solo profesionales que no son los médicos administradores (los carga la secretaría). */
  nombre?: string;
  especialidad?: string;
};
export type RangoDia = { desde: string; hasta: string; pausaDesde?: string; pausaHasta?: string };
export type Agendas = Record<string, AgendaDoctor>;
export const KEY_AGENDA = "gb_agenda";
export const NOMBRES_DIA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const agendaBase = (consultorio: string): AgendaDoctor => ({
  activo: true,
  dias: [], // en blanco: cada médico carga sus días y horarios desde el panel
  desde: "08:00",
  hasta: "18:40",
  duracion: 0, // la elige cada profesional
  pausa: false,
  pausaDesde: "13:00",
  pausaHasta: "14:00",
  consultorio,
  nota: "",
  bloqueos: [],
});

export const AGENDA_INICIAL: Agendas = {
  alberto: agendaBase(""),
  alonso: agendaBase(""),
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

/** Horario (desde / hasta) de un día de la semana: el propio del día o el general. */
export function rangoDia(a: AgendaDoctor, dia: number): RangoDia {
  return a.porDia?.[String(dia)] ?? { desde: a.desde, hasta: a.hasta, ...(a.pausa ? { pausaDesde: a.pausaDesde, pausaHasta: a.pausaHasta } : {}) };
}

/** Horarios de inicio de turno. Con fecha usa el horario de ese día; sin fecha, el general. */
export function horariosDelDia(a: AgendaDoctor, fecha?: string): string[] {
  const r = fecha ? rangoDia(a, new Date(fecha + "T12:00:00").getDay()) : rangoDia(a, -1);
  const out: string[] = [];
  if (!a.duracion || a.duracion < 5) return out; // sin duración elegida todavía
  const fin = aMin(r.hasta);
  const hayPausa = !!(r.pausaDesde && r.pausaHasta && r.pausaDesde < r.pausaHasta);
  const pD = aMin(r.pausaDesde ?? "00:00");
  const pH = aMin(r.pausaHasta ?? "00:00");
  let t = aMin(r.desde);
  const dur = a.duracion;
  while (t + dur <= fin && out.length < 300) {
    if (hayPausa && t < pH && t + dur > pD) {
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
  return a.activo && (a.duracion ?? 0) >= 5 && a.dias.includes(d.getDay()) && !bloqueoEn(a, fecha);
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

/** Texto corto: "Lun a Vie · 08:00 a 12:00" o, si cada día tiene su horario, "Mar 08:00–12:00 · Mié 14:00–18:00". */
export function resumenAgenda(a: AgendaDoctor): string {
  if (!a.activo) return "Agenda pausada momentáneamente";
  if (a.dias.length === 0) return "Horarios a confirmar";
  const d = [...a.dias].sort((x, y) => ((x + 6) % 7) - ((y + 6) % 7));
  const corto = (n: number) => NOMBRES_DIA[n]!.slice(0, 3);
  const pausa = "";
  // Agrupa los días que comparten horario
  const grupos = new Map<string, number[]>();
  for (const n of d) {
    const r = rangoDia(a, n);
    const k = `${r.desde}–${r.hasta}` + (r.pausaDesde && r.pausaHasta ? ` (pausa ${r.pausaDesde}–${r.pausaHasta})` : "");
    grupos.set(k, [...(grupos.get(k) ?? []), n]);
  }
  const nombreDias = (ds: number[]) => {
    const seguidos = ds.length > 2 && ds.every((v, i) => i === 0 || ((v + 6) % 7) - ((ds[i - 1]! + 6) % 7) === 1);
    return seguidos ? `${corto(ds[0]!)} a ${corto(ds[ds.length - 1]!)}` : ds.map(corto).join(", ");
  };
  if (grupos.size === 1) {
    const [k] = [...grupos.keys()];
    return `${nombreDias(d)} · ${k!.replace("–", " a ")}${pausa}`;
  }
  return [...grupos.entries()].map(([k, ds]) => `${nombreDias(ds)} ${k}`).join(" · ") + pausa;
}

/** Fecha del próximo día con atención, en texto ("mar 17 nov"), o null. */
export function proximoDiaTexto(a: AgendaDoctor): string | null {
  const f = proximosDias(a, 1)[0];
  return f ? new Date(f + "T12:00:00").toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" }) : null;
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
  ficha?: FichaMedica;
};
export type FichaMedica = {
  nacimiento?: string;
  obraSocial?: string;
  afiliado?: string;
  grupo?: string;
  alergias?: string;
  antecedentes?: string[];
  emergenciaNombre?: string;
  emergenciaTel?: string;
};
export const ANTECEDENTES = [
  "Hipertensión arterial",
  "Diabetes",
  "Enfermedad renal crónica",
  "Diálisis",
  "Trasplante renal",
  "Insuficiencia cardíaca",
  "Arritmia / fibrilación auricular",
  "Infarto previo",
  "Colesterol alto",
  "Tabaquismo",
  "Marcapasos / stent",
] as const;
export const KEY_PACIENTES = "gb_pacientes";
export const KEY_SESION_PACIENTE = "gb_sesion_paciente";

export const nuevoCodigo = () => String(Math.floor(100000 + Math.random() * 900000));
export const nuevoId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export async function hashTexto(t: string) {
  return hash(t);
}

export async function ingresarPaciente(dniOEmail: string, codigoOClave: string): Promise<{ ok: true; paciente: PacientePortal } | { ok: false; error: string }> {
  if (await iniciarBackend()) {
    const r = await ingresarPacienteServidor({ data: { usuario: dniOEmail, codigo: codigoOClave } });
    if (!r.ok) return r;
    const p = JSON.parse(r.json) as PacientePortal;
    localStorage.setItem(KEY_PACIENTES, JSON.stringify([p]));
    localStorage.setItem(KEY_SESION_PACIENTE, p.id);
    window.dispatchEvent(new CustomEvent(EVT, { detail: KEY_PACIENTES }));
    void traerColeccion(KEY_TURNOS);
    return { ok: true, paciente: p };
  }
  const lista = leerDato<PacientePortal[]>(KEY_PACIENTES, []);
  const u = dniOEmail.trim().toLowerCase();
  const dni = u.replace(/\D/g, "");
  const p = lista.find((x) => (dni.length >= 5 && x.dni === dni) || (u.includes("@") && x.email.toLowerCase() === u));
  if (!p) return { ok: false, error: "No encontramos un paciente con esa cédula o correo. Pedile a la clínica que te envíe la invitación." };
  if (p.estado === "Revocado") return { ok: false, error: "Tu acceso al portal está deshabilitado. Comunicate con la clínica." };
  const c = codigoOClave.trim();
  const valida = c === p.codigo || (!!p.clave && (await hash(c)) === p.clave);
  if (!valida) return { ok: false, error: p.clave ? "El código o la contraseña no son correctos." : "El código no es correcto. Revisá el mensaje de la clínica." };
  const actualizado: PacientePortal = { ...p, estado: "Activo", ultimoIngreso: new Date().toISOString() };
  guardarDato(KEY_PACIENTES, lista.map((x) => (x.id === p.id ? actualizado : x)));
  localStorage.setItem(KEY_SESION_PACIENTE, p.id);
  auditar(p.nombre, p.estado === "Invitado" ? "Primer ingreso al portal" : "Ingreso al portal", `Paciente C.C. ${p.dni}`);
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

/* ---------- Cobros a pacientes, equipo y control de caja ---------- */
export const METODOS_PAGO = ["Efectivo", "Débito", "Crédito", "Transferencia", "Mercado Pago", "Obra social"] as const;
export type MetodoPago = (typeof METODOS_PAGO)[number];
export type EstadoCobro = "Pagado" | "Parcial" | "Pendiente" | "Anulado";
export type PagoParcial = { fecha: string; monto: number; metodo: MetodoPago; cobradoPor: string };
export type Cobro = {
  id: string;
  fecha: string; // ISO con hora
  paciente: string;
  dni?: string;
  pacienteId?: string;
  turnoId?: string;
  concepto: string;
  profesional: string;
  arancel: number;
  pagos: PagoParcial[];
  obraSocial?: string;
  nota?: string;
  anulado?: { por: string; motivo: string; fecha: string };
};
export type Persona = { id: string; nombre: string; rol: string; activo: boolean };
export type CierreCaja = {
  id: string;
  fecha: string; // día ISO
  persona: string;
  esperado: number;
  declarado: number;
  nota: string;
  registradoPor: string;
  creado: string;
};
export const KEY_COBROS = "gb_cobros";
export const KEY_EQUIPO = "gb_equipo";
export const KEY_CIERRES = "gb_cierres";
export const EQUIPO_INICIAL: Persona[] = [{ id: "secretaria", nombre: "Secretaría", rol: "Secretaria", activo: true }];

export const pagadoDe = (c: Cobro) => c.pagos.reduce((a, p) => a + p.monto, 0);
export const saldoDe = (c: Cobro) => (c.anulado ? 0 : Math.max(0, c.arancel - pagadoDe(c)));
export function estadoCobro(c: Cobro): EstadoCobro {
  if (c.anulado) return "Anulado";
  const p = pagadoDe(c);
  if (p <= 0) return "Pendiente";
  return p >= c.arancel ? "Pagado" : "Parcial";
}


/* ---------- Salud del paciente (portal): controles, medicación y estudios ---------- */
export type Control = { id: string; pacienteId: string; fecha: string; sistolica: number; diastolica: number; pulso?: number; peso?: number; nota?: string };
export type Medicamento = { id: string; pacienteId: string; nombre: string; dosis: string; horarios: string[]; indicacion: string; activo: boolean; tomas: Record<string, boolean> };
export type ValoresEstudio = { creatinina?: number; egfr?: number; potasio?: number; urea?: number; proteinuria?: number; hemoglobina?: number; ldl?: number; fevi?: number };
export type Estudio = { id: string; pacienteId: string; tipo: string; fecha: string; titulo: string; informe: string; valores: ValoresEstudio; cargadoPor: string; creado: string };
/* ---------- Padrón de pacientes de la clínica ---------- */
export type PacienteClinica = {
  id: string;
  nombre: string;
  dni: string;
  nacimiento?: string;
  sexo?: "F" | "M" | "X";
  telefono?: string;
  email?: string;
  domicilio?: string;
  obraSocial?: string;
  afiliado?: string;
  alergias?: string;
  antecedentes: string[];
  medicoCabecera?: string;
  notas?: string;
  creado: string;
};
export const KEY_PADRON = "gb_padron";

/* ---------- Receta digital ---------- */
export type ItemReceta = { droga: string; presentacion: string; cantidad: string; posologia: string };
export type Receta = {
  id: string;
  numero: number;
  fecha: string;
  pacienteId: string;
  paciente: string;
  dni?: string;
  obraSocial?: string;
  afiliado?: string;
  doctorId: string;
  doctor: string;
  matricula: string;
  especialidad: string;
  diagnostico: string;
  items: ItemReceta[];
  indicaciones?: string;
  codigo: string;
  firmada: boolean;
  anulada?: { motivo: string; fecha: string };
};
export const KEY_RECETAS = "gb_recetas";
export const KEY_FIRMAS = "gb_firmas";

/* ---------- Laboratorio ---------- */
export type EstadoLab = "Pedido" | "En proceso" | "Resultado";
export type PedidoLab = {
  id: string;
  fecha: string;
  pacienteId: string;
  paciente: string;
  doctor: string;
  paneles: string[];
  urgente: boolean;
  ayuno: boolean;
  estado: EstadoLab;
  resultados: Record<string, number>;
  fechaResultado?: string;
  nota?: string;
};
export const KEY_LAB = "gb_laboratorio";

/* ---------- Facturación ---------- */
export type TipoComprobante = "Factura B" | "Factura C" | "Recibo";
export type Factura = {
  id: string;
  numero: string;
  tipo: TipoComprobante;
  fecha: string;
  receptor: string;
  docReceptor?: string;
  cobertura: string; // "Particular" u obra social
  items: { desc: string; cant: number; precio: number }[];
  total: number;
  estado: "Emitida" | "Cobrada" | "Anulada";
  cobroId?: string;
  emitidaPor: string;
};
export const KEY_FACTURAS = "gb_facturas";

/* ---------- Automatizaciones ---------- */
export const KEY_AUTOS = "gb_automatizaciones";
export const KEY_AUTOS_HECHAS = "gb_automatizaciones_hechas";

/* ---------- Enfermería – Triage ---------- */
export type NivelTriage = "I" | "II" | "III" | "IV" | "V";
export type Triage = {
  id: string;
  pacienteId: string;
  paciente: string;
  fecha: string; // ISO con hora
  enfermeraId: string;
  enfermera: string;
  nivel?: NivelTriage;
  motivo?: string;
  observaciones?: string;
  signos: { sistolica?: number; diastolica?: number; pulso?: number; fr?: number; temp?: number; spo2?: number; peso?: number; talla?: number; imc?: number };
  /** Se completa cuando el médico usa estos signos en la evolución. */
  atendidoPor?: string;
  evolucionId?: string;
};
export const KEY_TRIAGE = "gb_triage";

/* ---------- Historia clínica (evoluciones de cada consulta) ---------- */
export const ESPECIALIDADES_HC = ["Cardiología", "Nefrología", "Medicina Interna"] as const;
export type EspecialidadHC = (typeof ESPECIALIDADES_HC)[number];
export type Evolucion = {
  id: string;
  pacienteId: string;
  paciente: string;
  fecha: string; // ISO con hora
  doctor: string;
  /** Solo en evoluciones viejas; la historia clínica ahora es general. */
  especialidad?: EspecialidadHC;
  motivo: string;
  /** Evolución del cuadro clínico (enfermedad actual). */
  nota: string;
  sintomas?: string;
  /** Semiología médica / examen físico. */
  semiologia?: string;
  /** Conducta médica e indicaciones. */
  plan?: string;
  triageId?: string;
  /** Quién tomó los signos vitales y cuándo (enfermería o el propio médico). */
  signosPor?: { nombre: string; fecha: string; rol: Rol };
  diagnosticos: string[];
  cie10?: { codigo: string; descripcion: string }[];
  signos: { sistolica?: number; diastolica?: number; pulso?: number; fr?: number; temp?: number; spo2?: number; peso?: number; talla?: number; imc?: number };
  cardio?: { fevi?: number; ritmo?: string; nyha?: string };
  nefro?: { creatinina?: number; egfr?: number; potasio?: number; proteinuria?: number };
};
export const KEY_EVOLUCIONES = "gb_evoluciones";
export const KEY_CONTROLES = "gb_controles";
export const KEY_MEDICACION = "gb_medicacion";
export const KEY_ESTUDIOS = "gb_estudios";
export const TIPOS_ESTUDIO = [
  "Laboratorio renal",
  "Laboratorio general",
  "Orina de 24 horas",
  "Ecocardiograma",
  "Electrocardiograma",
  "Holter 24 h",
  "MAPA 24 h",
  "Ergometría",
  "Ecografía renal",
  "Doppler",
  "Otro",
] as const;

export type NivelPresion = { nivel: string; tono: "verde" | "ambar" | "naranja" | "rojo" | "critico"; consejo: string };
/** Clasificación según guías AHA/ACC 2017 (valores en mmHg). */
export function clasificarPresion(s: number, d: number): NivelPresion {
  if (s > 180 || d > 120) return { nivel: "Crisis hipertensiva", tono: "critico", consejo: "Si tenés dolor de pecho, falta de aire, visión borrosa o confusión, llamá al 107 o andá a la guardia." };
  if (s >= 140 || d >= 90) return { nivel: "Hipertensión grado 2", tono: "rojo", consejo: "Volvé a medirla en 5 minutos. Si sigue alta, avisale a tu médico." };
  if (s >= 130 || d >= 80) return { nivel: "Hipertensión grado 1", tono: "naranja", consejo: "Registrala y comentalo en tu próximo control." };
  if (s >= 120) return { nivel: "Elevada", tono: "ambar", consejo: "Mantené los hábitos saludables y seguí registrando." };
  return { nivel: "Normal", tono: "verde", consejo: "¡Muy bien! Seguí así." };
}

/** Estadio de enfermedad renal crónica según filtrado glomerular (KDIGO). */
export function estadioRenal(egfr: number): { estadio: string; texto: string; tono: "verde" | "ambar" | "naranja" | "rojo" | "critico" } {
  if (egfr >= 90) return { estadio: "G1", texto: "Función renal normal o alta", tono: "verde" };
  if (egfr >= 60) return { estadio: "G2", texto: "Levemente disminuida", tono: "verde" };
  if (egfr >= 45) return { estadio: "G3a", texto: "Leve a moderadamente disminuida", tono: "ambar" };
  if (egfr >= 30) return { estadio: "G3b", texto: "Moderada a severamente disminuida", tono: "naranja" };
  if (egfr >= 15) return { estadio: "G4", texto: "Severamente disminuida", tono: "rojo" };
  return { estadio: "G5", texto: "Falla renal", tono: "critico" };
}

export function clasificarFevi(fevi: number): { texto: string; tono: "verde" | "ambar" | "rojo" } {
  if (fevi >= 50) return { texto: "Función del corazón conservada", tono: "verde" };
  if (fevi >= 41) return { texto: "Levemente reducida", tono: "ambar" };
  return { texto: "Reducida", tono: "rojo" };
}

/* ===================================================================== */
/* Datos del sitio público que cargan los administradores en el panel      */
/* (contacto, horarios de la clínica y música de espera).                  */
/* ===================================================================== */

export const KEY_SITIO = "gb_sitio";

export type PistaMusica = {
  id: string;
  nombre: string;
  sub: string;
  /** Archivo subido (data URL) o enlace a un .mp3 / .ogg. */
  url: string;
  color: string;
};

export type DiaClinica = { dia: number; abierto: boolean; desde: string; hasta: string };

export type DatosSitio = {
  direccion: string;
  telefono: string;
  whatsapp: string;
  email: string;
  /** Horario de atención de la clínica, día por día (0 = domingo). */
  semana: DiaClinica[];
  musicaActiva: boolean;
  musicaEjemplo: boolean;
  pistas: PistaMusica[];
};

export const SITIO_BASE: DatosSitio = {
  direccion: "",
  telefono: "",
  whatsapp: "",
  email: "",
  semana: [1, 2, 3, 4, 5, 6, 0].map((dia) => ({ dia, abierto: false, desde: "08:00", hasta: "18:00" })),
  musicaActiva: true,
  musicaEjemplo: true,
  pistas: [],
};

export function sitioDe(d: Partial<DatosSitio> | null | undefined): DatosSitio {
  return { ...SITIO_BASE, ...(d ?? {}), pistas: d?.pistas ?? [], semana: d?.semana?.length ? d.semana : SITIO_BASE.semana };
}

/** "Lun a Vie 08:00–20:00 · Sáb 09:00–13:00" — vacío si todavía no se cargó. */
export function resumenHorarioClinica(s: DatosSitio): string {
  const corto = (n: number) => NOMBRES_DIA[n]!.slice(0, 3);
  const abiertos = s.semana.filter((d) => d.abierto);
  if (!abiertos.length) return "";
  const grupos: { dias: number[]; desde: string; hasta: string }[] = [];
  for (const d of abiertos) {
    const g = grupos[grupos.length - 1];
    if (g && g.desde === d.desde && g.hasta === d.hasta) g.dias.push(d.dia);
    else grupos.push({ dias: [d.dia], desde: d.desde, hasta: d.hasta });
  }
  return grupos
    .map((g) => `${g.dias.length > 2 ? `${corto(g.dias[0]!)} a ${corto(g.dias[g.dias.length - 1]!)}` : g.dias.map(corto).join(" y ")} ${g.desde}–${g.hasta}`)
    .join(" · ");
}

export const COLORES_PISTA = [
  "from-sky-400 to-indigo-600",
  "from-amber-300 to-rose-500",
  "from-emerald-300 to-teal-600",
  "from-violet-400 to-fuchsia-600",
  "from-rose-400 to-red-600",
  "from-cyan-300 to-blue-600",
];
