import { useSyncExternalStore } from "react";
import type {
  Appointment,
  AppointmentStatus,
  AuditLog,
  DB,
  DocumentItem,
  Notification,
  Role,
  SecurityAlert,
  Study,
  User,
} from "./types";
import { buildSeed } from "./seed";

const KEY = "clinica_gomez_bolano_db_v1";

let serverSnapshot: DB | null = null;
let memory: DB | null = null;
const listeners = new Set<() => void>();

function load(): DB {
  if (typeof window === "undefined") {
    if (!serverSnapshot) serverSnapshot = buildSeed();
    return serverSnapshot;
  }
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(KEY);
    memory = raw ? (JSON.parse(raw) as DB) : buildSeed();
  } catch {
    memory = buildSeed();
  }
  return memory;
}

function persist(db: DB) {
  memory = db;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
      /* almacenamiento no disponible */
    }
  }
  listeners.forEach((l) => l());
}

export function getDB(): DB {
  return load();
}

export function setDB(updater: (db: DB) => DB) {
  persist(updater(structuredClone(load())));
}

export function resetDB() {
  persist(buildSeed());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useDB<T>(selector: (db: DB) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(load()),
    () => selector(load()),
  );
}

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

/* ---------------- Auditoría / notificaciones / alertas ---------------- */

export function logAudit(entry: Omit<AuditLog, "id" | "fecha">) {
  setDB((db) => {
    db.audit.unshift({ ...entry, id: uid("log"), fecha: new Date().toISOString() });
    return db;
  });
}

export function pushNotification(n: Omit<Notification, "id" | "fecha" | "leida">) {
  setDB((db) => {
    db.notifications.unshift({ ...n, id: uid("ntf"), fecha: new Date().toISOString(), leida: false });
    return db;
  });
}

export function markNotificationRead(id: string) {
  setDB((db) => {
    const n = db.notifications.find((x) => x.id === id);
    if (n) n.leida = true;
    return db;
  });
}

export function pushAlert(a: Omit<SecurityAlert, "id" | "fecha" | "revisada">) {
  setDB((db) => {
    db.alerts.unshift({ ...a, id: uid("alr"), fecha: new Date().toISOString(), revisada: false });
    return db;
  });
}

export function reviewAlert(id: string) {
  setDB((db) => {
    const a = db.alerts.find((x) => x.id === id);
    if (a) a.revisada = true;
    return db;
  });
}

/* ---------------- Sesión ---------------- */

export function login(email: string, password: string): { ok: boolean; error?: string; user?: User } {
  const db = load();
  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) return { ok: false, error: "Credenciales incorrectas." };
  if (!user.activo) return { ok: false, error: "El usuario se encuentra desactivado." };
  setDB((d) => {
    d.sessionUserId = user.id;
    const u = d.users.find((x) => x.id === user.id);
    if (u) u.ultimoAcceso = new Date().toISOString();
    return d;
  });
  logAudit({ usuario: user.nombre, rol: user.role, accion: "Inició sesión", modulo: "Seguridad", registro: user.email, anterior: "—", nuevo: "sesión activa" });
  if (user.role !== "paciente") {
    pushAlert({ nivel: "baja", tipo: "Acceso", mensaje: `Nuevo inicio de sesión administrativo: ${user.nombre}.` });
  }
  return { ok: true, user };
}

export function logout() {
  const u = currentUser();
  if (u) logAudit({ usuario: u.nombre, rol: u.role, accion: "Cerró sesión", modulo: "Seguridad", registro: u.email, anterior: "sesión activa", nuevo: "—" });
  setDB((db) => {
    db.sessionUserId = null;
    return db;
  });
}

export function register(data: { nombre: string; email: string; password: string; documento?: string; telefono?: string }) {
  const db = load();
  if (db.users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { ok: false as const, error: "Ya existe una cuenta con ese correo." };
  }
  const user: User = {
    id: uid("p"),
    nombre: data.nombre,
    email: data.email,
    password: data.password,
    role: "paciente",
    activo: true,
    documento: data.documento,
    telefono: data.telefono,
    permisos: ["turnos.propios"],
    creadoEl: new Date().toISOString(),
    ultimoAcceso: new Date().toISOString(),
  };
  setDB((d) => {
    d.users.push(user);
    d.sessionUserId = user.id;
    return d;
  });
  logAudit({ usuario: user.nombre, rol: "paciente", accion: "Registró una cuenta", modulo: "Usuarios", registro: user.email, anterior: "—", nuevo: "paciente activo" });
  pushNotification({ rol: "secretaria", titulo: "Nuevo paciente registrado", mensaje: `${user.nombre} creó su cuenta.` });
  return { ok: true as const, user };
}

export function recoverPassword(email: string) {
  const db = load();
  const u = db.users.find((x) => x.email.toLowerCase() === email.toLowerCase());
  logAudit({ usuario: u?.nombre ?? email, rol: u?.role ?? "sistema", accion: "Solicitó recuperación de contraseña", modulo: "Seguridad", registro: email, anterior: "—", nuevo: "enlace simulado enviado" });
  return !!u;
}

export function currentUser(): User | null {
  const db = load();
  return db.users.find((u) => u.id === db.sessionUserId) ?? null;
}

export function useCurrentUser(): User | null {
  return useDB((db) => db.users.find((u) => u.id === db.sessionUserId) ?? null);
}

/* ---------------- Turnos ---------------- */

export function isSlotTaken(db: DB, doctorId: string, fecha: string, hora: string, ignoreId?: string) {
  return db.appointments.some(
    (a) =>
      a.doctorId === doctorId &&
      a.fecha === fecha &&
      a.hora === hora &&
      a.id !== ignoreId &&
      !["cancelado", "ausente"].includes(a.estado),
  );
}

export function useTakenSlots(doctorId: string, fecha: string) {
  return useDB((db) =>
    db.appointments
      .filter((a) => a.doctorId === doctorId && a.fecha === fecha && !["cancelado", "ausente"].includes(a.estado))
      .map((a) => a.hora),
  );
}

export function createAppointment(
  data: Omit<Appointment, "id" | "codigo" | "creadoEl" | "modificadoEl">,
  actor: { nombre: string; role: Role },
): { ok: boolean; error?: string; appointment?: Appointment } {
  const db = load();
  if (isSlotTaken(db, data.doctorId, data.fecha, data.hora)) {
    return { ok: false, error: "Ese horario ya fue ocupado. Elegí otro." };
  }
  const codigo = `TRN-${1000 + db.appointments.length + 1}`;
  const appointment: Appointment = {
    ...data,
    id: uid("a"),
    codigo,
    creadoEl: new Date().toISOString(),
    modificadoEl: new Date().toISOString(),
  };
  setDB((d) => {
    d.appointments.push(appointment);
    return d;
  });
  logAudit({ usuario: actor.nombre, rol: actor.role, accion: "Creó turno", modulo: "Turnos", registro: codigo, anterior: "—", nuevo: appointment.estado });
  pushNotification({ rol: "secretaria", titulo: "Nuevo turno solicitado", mensaje: `${appointment.pacienteNombre} — ${appointment.especialidad} ${appointment.fecha} ${appointment.hora}.` });
  pushNotification({ rol: "paciente", userId: appointment.pacienteId, titulo: "Turno registrado", mensaje: `Tu turno ${codigo} fue registrado.` });
  return { ok: true, appointment };
}

export function changeAppointmentStatus(
  id: string,
  estado: AppointmentStatus,
  actor: { nombre: string; role: Role },
  autorizadoPor?: string,
) {
  const db = load();
  const prev = db.appointments.find((a) => a.id === id);
  if (!prev) return;
  setDB((d) => {
    const a = d.appointments.find((x) => x.id === id)!;
    a.estado = estado;
    a.modificadoEl = new Date().toISOString();
    if (autorizadoPor) a.autorizadoPor = autorizadoPor;
    if (estado === "cancelado") a.estadoPago = a.estadoPago === "pagado" ? "cancelado" : "cancelado";
    return d;
  });
  logAudit({
    usuario: actor.nombre, rol: actor.role, accion: `Cambió estado a ${estado}`, modulo: "Turnos",
    registro: prev.codigo, anterior: prev.estado, nuevo: estado,
  });
  pushNotification({ rol: "paciente", userId: prev.pacienteId, titulo: "Turno actualizado", mensaje: `Tu turno ${prev.codigo} ahora está ${estado}.` });
  if (prev.estado === "confirmado" && estado === "cancelado") {
    pushAlert({ nivel: "media", tipo: "Modificación", mensaje: `${actor.nombre} canceló el turno confirmado ${prev.codigo}.` });
  }
}

export function rescheduleAppointment(
  id: string,
  fecha: string,
  hora: string,
  actor: { nombre: string; role: Role },
): { ok: boolean; error?: string } {
  const db = load();
  const prev = db.appointments.find((a) => a.id === id);
  if (!prev) return { ok: false, error: "Turno inexistente." };
  if (isSlotTaken(db, prev.doctorId, fecha, hora, id)) return { ok: false, error: "El nuevo horario ya está ocupado." };
  setDB((d) => {
    const a = d.appointments.find((x) => x.id === id)!;
    a.fecha = fecha;
    a.hora = hora;
    a.estado = "reprogramado";
    a.modificadoEl = new Date().toISOString();
    return d;
  });
  logAudit({
    usuario: actor.nombre, rol: actor.role, accion: "Reprogramó turno", modulo: "Turnos", registro: prev.codigo,
    anterior: `${prev.fecha} ${prev.hora}`, nuevo: `${fecha} ${hora}`,
  });
  pushNotification({ rol: "paciente", userId: prev.pacienteId, titulo: "Turno reprogramado", mensaje: `Tu turno ${prev.codigo} pasó al ${fecha} a las ${hora}.` });
  pushAlert({ nivel: "baja", tipo: "Modificación", mensaje: `${actor.nombre} reprogramó el turno ${prev.codigo}.` });
  return { ok: true };
}

export function updatePayment(
  id: string,
  estadoPago: Appointment["estadoPago"],
  metodoPago: string,
  actor: { nombre: string; role: Role },
  autorizadoPor?: string,
) {
  const db = load();
  const prev = db.appointments.find((a) => a.id === id);
  if (!prev) return;
  setDB((d) => {
    const a = d.appointments.find((x) => x.id === id)!;
    a.estadoPago = estadoPago;
    a.metodoPago = metodoPago;
    a.modificadoEl = new Date().toISOString();
    if (autorizadoPor) a.autorizadoPor = autorizadoPor;
    return d;
  });
  logAudit({
    usuario: actor.nombre, rol: actor.role, accion: "Modificó pago", modulo: "Pagos", registro: prev.codigo,
    anterior: `${prev.estadoPago} / ${prev.metodoPago}`, nuevo: `${estadoPago} / ${metodoPago}`,
  });
  pushAlert({ nivel: "media", tipo: "Pago", mensaje: `Se modificó el estado de pago del turno ${prev.codigo}.` });
}

/* ---------------- Usuarios / personal ---------------- */

export function upsertUser(user: Partial<User> & { id?: string }, actor: { nombre: string; role: Role }) {
  const db = load();
  const existing = user.id ? db.users.find((u) => u.id === user.id) : undefined;
  if (existing) {
    setDB((d) => {
      const u = d.users.find((x) => x.id === existing.id)!;
      Object.assign(u, user);
      return d;
    });
    logAudit({ usuario: actor.nombre, rol: actor.role, accion: "Editó usuario", modulo: "Personal", registro: existing.email, anterior: existing.role, nuevo: String(user.role ?? existing.role) });
  } else {
    const nuevo: User = {
      id: uid("u"),
      nombre: user.nombre ?? "Nuevo usuario",
      email: user.email ?? `usuario${Date.now()}@clinica.com`,
      password: user.password ?? "temporal123",
      role: (user.role as Role) ?? "secretaria",
      activo: user.activo ?? true,
      permisos: user.permisos ?? ["turnos.crear", "pacientes.buscar"],
      creadoEl: new Date().toISOString(),
      doctorId: user.doctorId,
      telefono: user.telefono,
    };
    setDB((d) => {
      d.users.push(nuevo);
      return d;
    });
    logAudit({ usuario: actor.nombre, rol: actor.role, accion: "Creó usuario", modulo: "Personal", registro: nuevo.email, anterior: "—", nuevo: nuevo.role });
    pushAlert({ nivel: "media", tipo: "Usuario", mensaje: `Se creó un nuevo usuario administrativo: ${nuevo.nombre}.` });
  }
}

export function toggleUser(id: string, actor: { nombre: string; role: Role }) {
  const db = load();
  const u = db.users.find((x) => x.id === id);
  if (!u) return;
  setDB((d) => {
    const t = d.users.find((x) => x.id === id)!;
    t.activo = !t.activo;
    return d;
  });
  logAudit({ usuario: actor.nombre, rol: actor.role, accion: u.activo ? "Desactivó usuario" : "Activó usuario", modulo: "Personal", registro: u.email, anterior: String(u.activo), nuevo: String(!u.activo) });
}

export function deleteUser(id: string, actor: { nombre: string; role: Role }, autorizadoPor: string) {
  const db = load();
  const u = db.users.find((x) => x.id === id);
  if (!u) return;
  setDB((d) => {
    d.users = d.users.filter((x) => x.id !== id);
    return d;
  });
  logAudit({ usuario: actor.nombre, rol: actor.role, accion: `Eliminó usuario (autorizó ${autorizadoPor})`, modulo: "Personal", registro: u.email, anterior: u.role, nuevo: "eliminado" });
  pushAlert({ nivel: "alta", tipo: "Usuario", mensaje: `Se eliminó el usuario ${u.nombre}. Autorizó: ${autorizadoPor}.` });
}

export function setPermisos(id: string, permisos: string[], actor: { nombre: string; role: Role }, autorizadoPor: string) {
  const db = load();
  const u = db.users.find((x) => x.id === id);
  if (!u) return;
  setDB((d) => {
    const t = d.users.find((x) => x.id === id)!;
    t.permisos = permisos;
    return d;
  });
  logAudit({ usuario: actor.nombre, rol: actor.role, accion: `Modificó permisos (autorizó ${autorizadoPor})`, modulo: "Seguridad", registro: u.email, anterior: u.permisos.join(", ") || "—", nuevo: permisos.join(", ") || "—" });
  pushAlert({ nivel: "media", tipo: "Usuario", mensaje: `Se modificaron los permisos de ${u.nombre}.` });
}

/* ---------------- Agenda / configuración ---------------- */

export function updateAgenda(patch: Partial<DB["agenda"]>, actor: { nombre: string; role: Role }) {
  const prev = load().agenda;
  setDB((d) => {
    d.agenda = { ...d.agenda, ...patch };
    return d;
  });
  logAudit({ usuario: actor.nombre, rol: actor.role, accion: "Modificó disponibilidad", modulo: "Agenda", registro: "Configuración de agenda", anterior: JSON.stringify({ d: prev.duracionConsulta, m: prev.maxPacientesDia }), nuevo: JSON.stringify({ d: patch.duracionConsulta ?? prev.duracionConsulta, m: patch.maxPacientesDia ?? prev.maxPacientesDia }) });
}

export function addBloqueo(bloqueo: { doctorId: string; fecha: string; motivo: string }, actor: { nombre: string; role: Role }) {
  setDB((d) => {
    d.agenda.bloqueos.push({ ...bloqueo, id: uid("b") });
    return d;
  });
  logAudit({ usuario: actor.nombre, rol: actor.role, accion: "Bloqueó agenda", modulo: "Agenda", registro: bloqueo.fecha, anterior: "disponible", nuevo: bloqueo.motivo });
}

export function removeBloqueo(id: string, actor: { nombre: string; role: Role }) {
  const b = load().agenda.bloqueos.find((x) => x.id === id);
  setDB((d) => {
    d.agenda.bloqueos = d.agenda.bloqueos.filter((x) => x.id !== id);
    return d;
  });
  if (b) logAudit({ usuario: actor.nombre, rol: actor.role, accion: "Liberó bloqueo de agenda", modulo: "Agenda", registro: b.fecha, anterior: b.motivo, nuevo: "disponible" });
}

/* ---------------- Estudios y documentos ---------------- */

export function addStudy(study: Omit<Study, "id">, actor: { nombre: string; role: Role }) {
  setDB((d) => {
    d.studies.unshift({ ...study, id: uid("e") });
    return d;
  });
  logAudit({ usuario: actor.nombre, rol: actor.role, accion: "Cargó estudio", modulo: "Estudios", registro: study.tipo, anterior: "—", nuevo: study.estado });
}

export function addDocument(doc: Omit<DocumentItem, "id">, actor: { nombre: string; role: Role }) {
  setDB((d) => {
    d.documents.unshift({ ...doc, id: uid("doc") });
    return d;
  });
  logAudit({ usuario: actor.nombre, rol: actor.role, accion: "Emitió documento", modulo: "Documentos", registro: doc.titulo, anterior: "—", nuevo: doc.tipo });
}
