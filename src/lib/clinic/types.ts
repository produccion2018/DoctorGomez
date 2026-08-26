export type Role = "paciente" | "medico" | "secretaria" | "director";

export type AppointmentStatus =
  | "pendiente"
  | "confirmado"
  | "reprogramado"
  | "cancelado"
  | "finalizado"
  | "ausente";

export type PaymentStatus = "pagado" | "pendiente" | "cancelado";

export interface User {
  id: string;
  nombre: string;
  email: string;
  password: string;
  role: Role;
  activo: boolean;
  telefono?: string | undefined;
  documento?: string | undefined;
  ultimoAcceso?: string | undefined;
  doctorId?: string | undefined;
  permisos: string[];
  creadoEl: string;
}

export interface Doctor {
  id: string;
  nombre: string;
  titulo: string;
  especialidades: string[];
  matricula: string;
  bio: string;
  formacion: string[];
  areas: string[];
  foto: "alberto" | "alonso";
  consultorio: string;
  dias: string[];
}

export interface Appointment {
  id: string;
  codigo: string;
  pacienteId: string;
  pacienteNombre: string;
  doctorId: string;
  especialidad: string;
  fecha: string; // yyyy-mm-dd
  hora: string; // HH:mm
  modalidad: "Presencial" | "Teleconsulta";
  estado: AppointmentStatus;
  motivo?: string | undefined;
  importe: number;
  metodoPago: string;
  estadoPago: PaymentStatus;
  creadoPor: string;
  creadoPorRol: Role;
  creadoEl: string;
  modificadoEl: string;
  autorizadoPor?: string | undefined;
}

export interface Study {
  id: string;
  pacienteId: string;
  tipo: string;
  categoria: string;
  fecha: string;
  profesional: string;
  estado: "Disponible" | "En proceso" | "Pendiente";
  resumen: string;
}

export interface DocumentItem {
  id: string;
  pacienteId: string;
  tipo: "Certificado" | "Informe" | "Receta" | "Constancia";
  titulo: string;
  fecha: string;
  profesional: string;
  contenido: string;
}

export interface AuditLog {
  id: string;
  usuario: string;
  rol: Role | "sistema";
  accion: string;
  modulo: string;
  registro: string;
  anterior: string;
  nuevo: string;
  fecha: string;
}

export interface Notification {
  id: string;
  rol: Role;
  userId?: string | undefined;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
}

export interface SecurityAlert {
  id: string;
  nivel: "alta" | "media" | "baja";
  tipo: string;
  mensaje: string;
  fecha: string;
  revisada: boolean;
}

export interface AgendaConfig {
  duracionConsulta: number;
  maxPacientesDia: number;
  diasAtencion: string[];
  horaInicio: string;
  horaFin: string;
  bloqueos: { id: string; doctorId: string; fecha: string; motivo: string }[];
  consultorios: string[];
}

export interface DB {
  users: User[];
  appointments: Appointment[];
  studies: Study[];
  documents: DocumentItem[];
  audit: AuditLog[];
  notifications: Notification[];
  alerts: SecurityAlert[];
  agenda: AgendaConfig;
  sessionUserId: string | null;
}
