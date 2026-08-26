import type { DB, Appointment } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const addDays = (d: Date, n: number) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};

const now = new Date();
const nowISO = new Date().toISOString();

const pacientes = [
  { id: "p1", nombre: "Lucía Fernández", email: "paciente@demo.com", doc: "32.144.870" },
  { id: "p2", nombre: "Martín Aguirre", email: "martin@demo.com", doc: "28.910.554" },
  { id: "p3", nombre: "Rosa Medina", email: "rosa@demo.com", doc: "18.442.019" },
  { id: "p4", nombre: "Javier Soto", email: "javier@demo.com", doc: "35.700.221" },
  { id: "p5", nombre: "Elena Ríos", email: "elena@demo.com", doc: "27.118.903" },
  { id: "p6", nombre: "Tomás Bianchi", email: "tomas@demo.com", doc: "40.223.887" },
];

function mkAppointment(i: number, o: Partial<Appointment>): Appointment {
  return {
    id: `a${i}`,
    codigo: `TRN-${1000 + i}`,
    pacienteId: "p1",
    pacienteNombre: "Lucía Fernández",
    doctorId: "d1",
    especialidad: "Medicina Interna",
    fecha: toISO(now),
    hora: "09:20",
    modalidad: "Presencial",
    estado: "confirmado",
    motivo: "Control clínico",
    importe: 32000,
    metodoPago: "Tarjeta",
    estadoPago: "pagado",
    creadoPor: "Sistema",
    creadoPorRol: "secretaria",
    creadoEl: nowISO,
    modificadoEl: nowISO,
    ...o,
  };
}

export function buildSeed(): DB {
  const users: DB["users"] = [
    {
      id: "u-dir1", nombre: "Dr. Carlos Alberto Gómez Bolaño", email: "alberto@clinica.com", password: "director123",
      role: "director", activo: true, doctorId: "d1", permisos: ["*"], creadoEl: nowISO, ultimoAcceso: nowISO, telefono: "+54 11 4000-1201",
    },
    {
      id: "u-dir2", nombre: "Dr. Carlos Alonso Gómez Bolaño", email: "alonso@clinica.com", password: "director123",
      role: "director", activo: true, doctorId: "d2", permisos: ["*"], creadoEl: nowISO, ultimoAcceso: nowISO, telefono: "+54 11 4000-1202",
    },
    {
      id: "u-med1", nombre: "Dra. Paula Sanabria", email: "medico@clinica.com", password: "medico123",
      role: "medico", activo: true, doctorId: "d1", permisos: ["agenda.ver", "pacientes.ver", "estudios.ver"], creadoEl: nowISO, ultimoAcceso: nowISO,
    },
    {
      id: "u-sec1", nombre: "Valeria Ponce", email: "secretaria@clinica.com", password: "secre123",
      role: "secretaria", activo: true, permisos: ["turnos.crear", "turnos.confirmar", "turnos.reprogramar", "turnos.cancelar", "pacientes.buscar", "agenda.ver"],
      creadoEl: nowISO, ultimoAcceso: nowISO,
    },
    {
      id: "u-sec2", nombre: "Diego Ferrari", email: "recepcion@clinica.com", password: "secre123",
      role: "secretaria", activo: false, permisos: ["turnos.crear", "pacientes.buscar", "agenda.ver"], creadoEl: nowISO,
      ultimoAcceso: toISO(addDays(now, -12)),
    },
    ...pacientes.map((p, i) => ({
      id: p.id, nombre: p.nombre, email: p.email, password: "paciente123", role: "paciente" as const,
      activo: true, documento: p.doc, permisos: ["turnos.propios"], creadoEl: toISO(addDays(now, -30 + i * 4)),
      ultimoAcceso: nowISO, telefono: "+54 11 5555-00" + (10 + i),
    })),
  ];

  const appointments: Appointment[] = [
    mkAppointment(1, {}),
    mkAppointment(2, { pacienteId: "p2", pacienteNombre: "Martín Aguirre", doctorId: "d2", especialidad: "Cardiología", hora: "10:00", importe: 36000, estado: "confirmado" }),
    mkAppointment(3, { pacienteId: "p3", pacienteNombre: "Rosa Medina", doctorId: "d1", especialidad: "Nefrología", hora: "11:20", importe: 36000, estado: "pendiente", estadoPago: "pendiente", metodoPago: "Transferencia" }),
    mkAppointment(4, { pacienteId: "p4", pacienteNombre: "Javier Soto", doctorId: "d2", especialidad: "Ecocardiografía", hora: "14:40", importe: 58000, estado: "finalizado" }),
    mkAppointment(5, { pacienteId: "p5", pacienteNombre: "Elena Ríos", doctorId: "d1", especialidad: "Medicina Interna", fecha: toISO(addDays(now, 1)), hora: "09:20", estado: "confirmado" }),
    mkAppointment(6, { pacienteId: "p1", pacienteNombre: "Lucía Fernández", doctorId: "d2", especialidad: "Cardiología", fecha: toISO(addDays(now, 3)), hora: "16:00", importe: 36000, estado: "confirmado" }),
    mkAppointment(7, { pacienteId: "p6", pacienteNombre: "Tomás Bianchi", doctorId: "d2", especialidad: "Cardiología", fecha: toISO(addDays(now, 2)), hora: "10:40", importe: 36000, estado: "reprogramado" }),
    mkAppointment(8, { pacienteId: "p2", pacienteNombre: "Martín Aguirre", doctorId: "d1", especialidad: "Nefrología", fecha: toISO(addDays(now, -5)), hora: "08:40", importe: 36000, estado: "cancelado", estadoPago: "cancelado" }),
    mkAppointment(9, { pacienteId: "p1", pacienteNombre: "Lucía Fernández", doctorId: "d1", especialidad: "Medicina Interna", fecha: toISO(addDays(now, -20)), hora: "15:20", estado: "finalizado" }),
    mkAppointment(10, { pacienteId: "p3", pacienteNombre: "Rosa Medina", doctorId: "d2", especialidad: "Cardiología", fecha: toISO(addDays(now, -9)), hora: "17:20", importe: 36000, estado: "ausente" }),
    mkAppointment(11, { pacienteId: "p5", pacienteNombre: "Elena Ríos", doctorId: "d2", especialidad: "Cardiología", fecha: toISO(addDays(now, 4)), hora: "08:00", importe: 36000, estado: "pendiente", estadoPago: "pendiente" }),
    mkAppointment(12, { pacienteId: "p4", pacienteNombre: "Javier Soto", doctorId: "d1", especialidad: "Nefrología", fecha: toISO(addDays(now, 5)), hora: "12:00", importe: 36000, estado: "confirmado" }),
  ];

  const studies: DB["studies"] = [
    { id: "e1", pacienteId: "p1", tipo: "Laboratorio completo", categoria: "Laboratorio", fecha: toISO(addDays(now, -18)), profesional: "Dr. Carlos Alberto Gómez Bolaño", estado: "Disponible", resumen: "Valores dentro de parámetros esperados. Se sugiere control en 6 meses." },
    { id: "e2", pacienteId: "p1", tipo: "Ecocardiograma doppler", categoria: "Ecocardiograma", fecha: toISO(addDays(now, -10)), profesional: "Dr. Carlos Alonso Gómez Bolaño", estado: "Disponible", resumen: "Función ventricular conservada. Válvulas sin alteraciones significativas." },
    { id: "e3", pacienteId: "p1", tipo: "Ecografía renal", categoria: "Estudios renales", fecha: toISO(addDays(now, -4)), profesional: "Dr. Carlos Alberto Gómez Bolaño", estado: "En proceso", resumen: "Estudio en revisión por el profesional tratante." },
    { id: "e4", pacienteId: "p2", tipo: "Holter 24 horas", categoria: "Estudios cardiológicos", fecha: toISO(addDays(now, -7)), profesional: "Dr. Carlos Alonso Gómez Bolaño", estado: "Disponible", resumen: "Ritmo sinusal. Extrasístoles aisladas sin significado clínico." },
    { id: "e5", pacienteId: "p3", tipo: "Función renal", categoria: "Laboratorio", fecha: toISO(addDays(now, -2)), profesional: "Dr. Carlos Alberto Gómez Bolaño", estado: "Pendiente", resumen: "Muestra procesada, informe pendiente de firma." },
  ];

  const documents: DB["documents"] = [
    { id: "doc1", pacienteId: "p1", tipo: "Certificado", titulo: "Certificado de aptitud física", fecha: toISO(addDays(now, -18)), profesional: "Dr. Carlos Alonso Gómez Bolaño", contenido: "Se certifica que la paciente se encuentra en condiciones de realizar actividad física de intensidad moderada. Documento de demostración." },
    { id: "doc2", pacienteId: "p1", tipo: "Receta", titulo: "Receta de medicación crónica", fecha: toISO(addDays(now, -10)), profesional: "Dr. Carlos Alberto Gómez Bolaño", contenido: "Plan de medicación ficticio con fines demostrativos. No constituye una indicación médica real." },
    { id: "doc3", pacienteId: "p1", tipo: "Informe", titulo: "Informe de ecocardiograma", fecha: toISO(addDays(now, -10)), profesional: "Dr. Carlos Alonso Gómez Bolaño", contenido: "Informe simulado de ecocardiograma doppler color con función sistólica conservada." },
    { id: "doc4", pacienteId: "p1", tipo: "Constancia", titulo: "Constancia de atención", fecha: toISO(addDays(now, -4)), profesional: "Secretaría", contenido: "Se deja constancia de la asistencia de la paciente a consulta en la fecha indicada." },
    { id: "doc5", pacienteId: "p2", tipo: "Informe", titulo: "Informe de Holter", fecha: toISO(addDays(now, -7)), profesional: "Dr. Carlos Alonso Gómez Bolaño", contenido: "Informe simulado de monitoreo Holter de 24 horas." },
  ];

  const audit: DB["audit"] = [
    { id: "l1", usuario: "Valeria Ponce", rol: "secretaria", accion: "Creó turno", modulo: "Turnos", registro: "TRN-1003", anterior: "—", nuevo: "pendiente", fecha: new Date(Date.now() - 3600e3 * 5).toISOString() },
    { id: "l2", usuario: "Dr. Carlos Alberto Gómez Bolaño", rol: "director", accion: "Confirmó turno", modulo: "Turnos", registro: "TRN-1001", anterior: "pendiente", nuevo: "confirmado", fecha: new Date(Date.now() - 3600e3 * 4).toISOString() },
    { id: "l3", usuario: "Valeria Ponce", rol: "secretaria", accion: "Canceló turno", modulo: "Turnos", registro: "TRN-1008", anterior: "confirmado", nuevo: "cancelado", fecha: new Date(Date.now() - 3600e3 * 26).toISOString() },
    { id: "l4", usuario: "Dr. Carlos Alonso Gómez Bolaño", rol: "director", accion: "Modificó disponibilidad", modulo: "Agenda", registro: "Agenda d2", anterior: "40 min", nuevo: "40 min", fecha: new Date(Date.now() - 3600e3 * 50).toISOString() },
    { id: "l5", usuario: "Sistema", rol: "sistema", accion: "Datos de demostración inicializados", modulo: "Sistema", registro: "seed", anterior: "—", nuevo: "ok", fecha: nowISO },
  ];

  const notifications: DB["notifications"] = [
    { id: "n1", rol: "paciente", userId: "p1", titulo: "Turno confirmado", mensaje: "Tu turno TRN-1001 fue confirmado.", fecha: nowISO, leida: false },
    { id: "n2", rol: "paciente", userId: "p1", titulo: "Estudio disponible", mensaje: "El informe de tu ecocardiograma ya está disponible.", fecha: nowISO, leida: false },
    { id: "n3", rol: "secretaria", titulo: "Nuevo turno solicitado", mensaje: "Rosa Medina solicitó un turno de Nefrología.", fecha: nowISO, leida: false },
    { id: "n4", rol: "director", titulo: "Modificación administrativa", mensaje: "Se detectó una modificación sobre un turno confirmado.", fecha: nowISO, leida: false },
    { id: "n5", rol: "medico", titulo: "Agenda del día", mensaje: "Tiene 5 pacientes próximos en su agenda.", fecha: nowISO, leida: false },
  ];

  const alerts: DB["alerts"] = [
    { id: "al1", nivel: "alta", tipo: "Actividad inusual", mensaje: "Se detectaron múltiples cancelaciones realizadas por un mismo usuario.", fecha: new Date(Date.now() - 3600e3 * 6).toISOString(), revisada: false },
    { id: "al2", nivel: "media", tipo: "Modificación", mensaje: "Se modificaron turnos previamente confirmados.", fecha: new Date(Date.now() - 3600e3 * 20).toISOString(), revisada: false },
    { id: "al3", nivel: "media", tipo: "Pago", mensaje: "Se modificó el estado de un pago registrado.", fecha: new Date(Date.now() - 3600e3 * 30).toISOString(), revisada: true },
    { id: "al4", nivel: "baja", tipo: "Acceso", mensaje: "Nuevo inicio de sesión administrativo desde un dispositivo conocido.", fecha: new Date(Date.now() - 3600e3 * 40).toISOString(), revisada: true },
  ];

  return {
    users,
    appointments,
    studies,
    documents,
    audit,
    notifications,
    alerts,
    agenda: {
      duracionConsulta: 40,
      maxPacientesDia: 14,
      diasAtencion: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
      horaInicio: "08:00",
      horaFin: "18:00",
      bloqueos: [{ id: "b1", doctorId: "d2", fecha: toISO(addDays(now, 6)), motivo: "Congreso de cardiología" }],
      consultorios: ["Consultorio 1", "Consultorio 3", "Consultorio 5", "Sala de ecocardiografía"],
    },
    sessionUserId: null,
  };
}
