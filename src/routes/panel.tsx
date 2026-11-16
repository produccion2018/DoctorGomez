import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type FormEvent, type PointerEvent as RPointerEvent, type ReactNode, type SetStateAction, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { subirAudioServidor, asistenteIA, ejecutarIA } from "@/lib/servidor";
import type { AccionIA } from "@/lib/ia.server";
import { Electro, InstalarApp } from "@/components/site/PublicLayout";
import fondoRinonesPanel from "@/assets/fondo-rinones.jpg";
import fondoCorazonPanel from "@/assets/fondo-corazon.jpg";
import type { LucideIcon } from "lucide-react";
import {
  QrCode,
  SlidersHorizontal,
  Mic,
  Square,
  Sparkles,
  Volume2,
  VolumeX,
  Loader2,
  Printer,
  ListChecks,
  Landmark,
  Globe,
  Music2,
  Upload,
  ChevronUp,
  Phone,
  Activity,
  Accessibility,
  Apple,
  Baby,
  Bone,
  Brain,
  BrainCircuit,
  Dna,
  Ear,
  HandHeart,
  Hospital,
  PersonStanding,
  Ribbon,
  Smile,
  Sparkle,
  Venus,
  Wind,
  AlertTriangle,
  PenLine,
  Scale,
  Thermometer,
  Workflow,
  Zap,
  X,
  Menu,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Ban,
  Bell,
  Bot,
  Building2,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  Clock,
  ConciergeBell,
  Download,
  Droplets,
  ExternalLink,
  Eye,
  FileText,
  FlaskConical,
  Headphones,
  HeartPulse,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogIn,
  LogOut,
  NotebookPen,
  Pencil,
  Pill,
  Plus,
  Receipt,
  ScanLine,
  Search,
  Send,
  Server,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserCog,
  Users,
  Crown,
  Copy,
  Mail,
  Smartphone,
  UserRound,
  ChevronLeft,
  Pin,
  Palette,
  Megaphone,
  MessagesSquare,
  Wallet,
  RefreshCw,
  UserPlus,
  MessageCircle,
  FileSpreadsheet,
  Paperclip,
  Gift,
  Monitor,
  CalendarX,
  Share2,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Fingerprint,
  ShieldAlert,
} from "lucide-react";
import { GRUPOS_NOTIF, NOTIFICACIONES, ACTIVAS_POR_DEFECTO, type CanalNotif, type ParaNotif } from "@/lib/notificaciones";
import { toast } from "sonner";
import { confirmar as preguntar } from "@/components/confirmar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-provider";
import {
  ADMINS,
  ADMIN_IDS,
  falta2fa,
  estadoSeguridad,
  iniciar2fa,
  confirmar2fa,
  desactivar2fa,
  guardarEmail,
  restablecer2fa,
  refrescoRapido,
  profesionalesAgenda,
  type RangoDia,
  auditar,
  cambiarClave,
  cerrarSesion,
  leerAuditoria,
  sesionActual,
  sincronizarPersonal,
  validarSesion,
  refrescarTodo,
  refrescarAgendaYCitas,
  guardarYConfirmar,
  hora12,
  bloquesDe,
  horasDeBloque,
  servicioEn,
  type BloqueAgenda,
  modoServidor,
  useDato,
  leerDato,
  agendaDe,
  horariosDelDia,
  rangoDia,
  atiendeEl,
  proximosDias,
  resumenAgenda,
  nuevoCodigo,
  nuevoId,
  NOMBRES_DIA,
  KEY_AGENDA,
  KEY_PACIENTES,
  KEY_AUT,
  TIPOS_AUT,
  TIPOS_ESTUDIO,
  KEY_ESTUDIOS,
  indicacionesTexto,
  invitarPortalPorCorreo,
  KEY_DOCUMENTOS,
  CATEGORIAS_DOC,
  subirDocumento,
  abrirDocumento,
  borrarDocumento,
  type DocumentoPaciente,
  nombrePropio,
  limpiarDoc,
  KEY_CONTROLES,
  clasificarPresion,
  clasificarFevi,
  ANTECEDENTES,
  KEY_PADRON,
  KEY_RECETAS,
  KEY_FIRMAS,
  KEY_LAB,
  KEY_FACTURAS,
  siglaComp,
  KEY_FACT_CONFIG,
  KEY_TARIFAS,
  prefijoDe,
  enLetras,
  numeroComprobante,
  type ConfigFactura,
  type Tarifa,
  valorTarifa,
  saldoFactura,
  type Glosa,
  KEY_INTEROP,
  TIPOS_DOC,
  type Interop,
  KEY_AUTOS,
  KEY_AUTOS_HECHAS,
  type PacienteClinica,
  type Receta,
  type ItemReceta,
  type PedidoLab,
  type EstadoLab,
  type Factura,
  type TipoComprobante,
  estadioRenal,
  KEY_MEDICACION,
  KEY_EVOLUCIONES,
  KEY_TRIAGE,
  KEY_NOTAS_ENF,
  type NotaEnfermeria,
  KEY_ENFERMERIA,
  tieneClave,
  borrarClave,
  type Triage,
  type NivelTriage,
  type Enfermera,
  type Personal,
  areaDe,
  linkInvitacion,
  nuevoTokenInvitacion,
  type Evolucion,
  type Medicamento,
  type Estudio,
  type Control,
  type ValoresEstudio,
  isoDe,
  METODOS_PAGO,
  KEY_COBROS,
  KEY_EQUIPO,
  KEY_CIERRES,
  EQUIPO_INICIAL,
  pagadoDe,
  saldoDe,
  estadoCobro,
  type Cobro,
  type CierreCaja,
  type EstadoCobro,
  type MetodoPago,
  metodoTxt,
  TIPOS_PAGO_EPS,
  enviarReciboPorCorreo,
  type Persona,
  type AgendaDoctor,
  type Agendas,
  type Autorizacion,
  type EstadoAcceso,
  type EstadoAut,
  type PacientePortal,
  type Evento,
  type SessionUser,
  KEY_SITIO,
  sitioDe,
  resumenHorarioClinica,
  COLORES_PISTA,
  type DatosSitio,
  type DiaClinica,
  type PistaMusica,
} from "@/lib/auth-local";
import { DOCTORS, ESPECIALIDADES, SERVICIOS } from "@/data/clinic";
import fotoAlberto from "@/assets/doctor-alberto.jpg";
import fotoAlonso from "@/assets/doctor-alonso.jpg";

import logoClinica from "@/assets/logo.png";
import { MODULOS, SEED_PERMISOS, nivelDe, nivelPersona, clavePersona, mk, AREAS_MEDICAS, type Nivel, type Permisos } from "@/lib/permisos";
/** Especialidades para marcar en la ficha del paciente. */
const ESPECIALIDADES_PACIENTE = Array.from(new Set(["Cardiología", "Nefrología", "Medicina Interna", ...AREAS_MEDICAS.map((a) => a.replace(/\s*\(médicos\)\s*$/, ""))]));
export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [
      { title: "Panel administrativo | HEGO · Centro de especialidades médicas" },
      { name: "robots", content: "noindex" },
      { name: "theme-color", content: "#0b1f4d" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "HEGO Panel" },
    ],
    links: [{ rel: "manifest", href: "/panel.webmanifest" }],
    scripts: [{ children: "if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js')" }],
  }),
  component: Panel,
});

/* ---------- Tipos y datos de ejemplo ---------- */
type Estado = "Pendiente" | "Confirmado" | "Atendido" | "Cancelado";
type Turno = { id: string; fecha: string; hora: string; paciente: string; doctor: string; motivo: string; estado: Estado; telefono?: string; email?: string; origen?: "web" | "panel" | "portal"; pacienteId?: string; dni?: string; tipoDoc?: string; recordado1?: string; recordado2?: string; recordado1Canal?: string; recordado2Canal?: string };
type Mov = { id: string; fecha: string; concepto: string; tipo: "Ingreso" | "Egreso"; monto: number };
type Tab = "resumen" | "turnos" | "triage" | "padron" | "historia" | "recetas" | "laboratorio" | "horarios" | "pacientes" | "finanzas" | "facturacion" | "analitica" | "automatizaciones" | "permisos" | "asistente" | "auditoria" | "sitio" | "comunicacion" | "ministerio";
type LogFn = (accion: string, detalle?: string) => void;
type Tono = "azul" | "ambar" | "verde" | "violeta" | "rojo";

const ESTADOS: Estado[] = ["Pendiente", "Confirmado", "Atendido", "Cancelado"];


/** Qué pestaña del panel abre cada módulo de permisos. */
const MODULO_TAB: Partial<Record<string, Tab>> = {
  "Enfermería – Triage": "triage",
  Turnos: "turnos",
  Pacientes: "padron",
  "Historias clínicas": "historia",
  Recetas: "recetas",
  Laboratorio: "laboratorio",
  Finanzas: "finanzas",
  Facturación: "facturacion",
  Reportes: "analitica",
  "Asistente IA": "asistente",
  Automatizaciones: "automatizaciones",
  Horarios: "horarios",
  "Portal del paciente": "pacientes",
  Auditoría: "auditoria",
  Permisos: "permisos",
  "Sitio web": "sitio",
};

type Area = { nombre: string; desc: string; icon: LucideIcon; medica?: boolean };
const AREAS: Area[] = [
  { nombre: "Dirección general", desc: "Gerencia de la clínica: acceso completo a todos los módulos, el personal y los permisos", icon: Crown },
  { nombre: "Recepción", desc: "Atención al público, agenda y admisión de pacientes", icon: ConciergeBell },
  { nombre: "Secretaría médica", desc: "Agenda de los doctores, recetas y documentación", icon: NotebookPen },
  { nombre: "Atención al paciente", desc: "WhatsApp, llamadas y consultas de pacientes", icon: Headphones },
  { nombre: "Enfermería", desc: "Triage y signos vitales. Se aplica al personal de enfermería cuando ingresa al panel", icon: Syringe },
  { nombre: "Cardiología", desc: "Equipo técnico de electro, ergometría y Holter", icon: HeartPulse },
  { nombre: "Nefrología", desc: "Equipo de seguimiento renal", icon: Droplets },
  { nombre: "Estudios y laboratorio", desc: "Extracciones, muestras y resultados", icon: FlaskConical },
  { nombre: "Diagnóstico por imágenes", desc: "Ecografías, doppler y ecocardiogramas", icon: ScanLine },
  { nombre: "Farmacia e insumos", desc: "Stock de medicamentos e insumos médicos", icon: Pill },
  { nombre: "Administración", desc: "Gestión general de la clínica", icon: Building2 },
  { nombre: "Facturación", desc: "Cobros, EPS y comprobantes", icon: Receipt },
  { nombre: "Recursos Humanos", desc: "Personal, horarios y legajos", icon: UserCog },
  { nombre: "Sistemas", desc: "Soporte técnico y equipos", icon: Server },
];

/** Especialidades médicas: médicos invitados (no administradores). Pueden escribir evoluciones si su permiso lo permite. */
const ESPECIALIDADES_MED: Area[] = [
  { nombre: "Medicina General", desc: "Médicos generales y consulta externa", icon: Stethoscope, medica: true },
  { nombre: "Medicina Interna", desc: "Médicos internistas", icon: Hospital, medica: true },
  { nombre: "Cardiología (médicos)", desc: "Cardiólogos invitados", icon: HeartPulse, medica: true },
  { nombre: "Nefrología (médicos)", desc: "Nefrólogos invitados", icon: Droplets, medica: true },
  { nombre: "Endocrinología", desc: "Diabetes, tiroides y metabolismo", icon: Activity, medica: true },
  { nombre: "Neumología", desc: "Enfermedades respiratorias", icon: Wind, medica: true },
  { nombre: "Neurología", desc: "Sistema nervioso", icon: Brain, medica: true },
  { nombre: "Gastroenterología", desc: "Aparato digestivo", icon: Apple, medica: true },
  { nombre: "Pediatría", desc: "Niños y adolescentes", icon: Baby, medica: true },
  { nombre: "Ginecología y Obstetricia", desc: "Salud de la mujer y embarazo", icon: Venus, medica: true },
  { nombre: "Dermatología", desc: "Piel, pelo y uñas", icon: Sparkle, medica: true },
  { nombre: "Traumatología y Ortopedia", desc: "Huesos, articulaciones y lesiones", icon: Bone, medica: true },
  { nombre: "Urología", desc: "Vías urinarias y aparato reproductor masculino", icon: Dna, medica: true },
  { nombre: "Oftalmología", desc: "Ojos y visión", icon: Eye, medica: true },
  { nombre: "Otorrinolaringología", desc: "Oído, nariz y garganta", icon: Ear, medica: true },
  { nombre: "Reumatología", desc: "Enfermedades autoinmunes y articulares", icon: Accessibility, medica: true },
  { nombre: "Oncología", desc: "Diagnóstico y tratamiento del cáncer", icon: Ribbon, medica: true },
  { nombre: "Geriatría", desc: "Adultos mayores", icon: HandHeart, medica: true },
  { nombre: "Psiquiatría", desc: "Salud mental", icon: BrainCircuit, medica: true },
  { nombre: "Psicología", desc: "Terapia y acompañamiento", icon: Smile, medica: true },
  { nombre: "Nutrición", desc: "Planes alimentarios y control de peso", icon: Apple, medica: true },
  { nombre: "Fisioterapia", desc: "Rehabilitación física", icon: PersonStanding, medica: true },
];
const TODAS_AREAS: Area[] = [...ESPECIALIDADES_MED, ...AREAS];
const esAreaMedica = (nombre?: string) => !!nombre && ESPECIALIDADES_MED.some((a) => a.nombre === nombre);

const NIVELES: Record<Nivel, string> = { ninguno: "Sin acceso", ver: "Solo ver", editar: "Ver y editar" };
const NIVEL_ICON: Record<Nivel, LucideIcon> = { ninguno: Ban, ver: Eye, editar: Pencil };

const ESTADO_CLASE: Record<Estado, string> = {
  Pendiente: "bg-amber-100 text-amber-800 ring-amber-200",
  Confirmado: "bg-sky-100 text-sky-800 ring-sky-200",
  Atendido: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Cancelado: "bg-red-100 text-red-700 ring-red-200",
};
const ESTADO_DOT: Record<Estado, string> = {
  Pendiente: "bg-amber-500",
  Confirmado: "bg-sky-500",
  Atendido: "bg-emerald-500",
  Cancelado: "bg-red-500",
};

const TONOS: Record<Tono, { tile: string; glow: string; text: string }> = {
  azul: { tile: "from-sky-500 to-blue-700", glow: "bg-sky-500/10", text: "text-sky-700" },
  ambar: { tile: "from-amber-400 to-orange-600", glow: "bg-amber-500/10", text: "text-amber-700" },
  verde: { tile: "from-emerald-400 to-teal-600", glow: "bg-emerald-500/10", text: "text-emerald-700" },
  violeta: { tile: "from-violet-500 to-indigo-700", glow: "bg-violet-500/10", text: "text-violet-700" },
  rojo: { tile: "from-rose-500 to-red-700", glow: "bg-rose-500/10", text: "text-rose-700" },
};

const fechaISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const hoy = () => fechaISO(new Date());
const maniana = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return fechaISO(d);
};
const uid = () => Math.random().toString(36).slice(2, 10);
const dinero = (n: number) => "$ " + n.toLocaleString("es-CO");
const fechaCorta = (iso: string) => iso.split("-").reverse().join("/");
const fechaHora = (iso: string) => new Date(iso).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const SEED_TURNOS: Turno[] = [];
const IDS_EJEMPLO = ["t1", "t2", "t3", "t4"];

/** Los movimientos de ejemplo que traía la primera versión: se ocultan siempre. */
const EJEMPLO_MOVS: Record<string, string> = { m1: "Consultas de la mañana", m2: "Estudios de ecocardiografía", m3: "Insumos médicos", m4: "Servicios del consultorio" };
const esEjemploMov = (m: Mov) => EJEMPLO_MOVS[m.id] === m.concepto;


/* ---------- Persistencia local (se reemplaza por el backend) ---------- */
function usePersist<T>(key: string, seed: T): readonly [T, Dispatch<SetStateAction<T>>] {
  const [val, setVal] = useState<T>(seed);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setVal(JSON.parse(raw) as T);
    } catch {
      /* ignorar */
    }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (ready) localStorage.setItem(key, JSON.stringify(val));
  }, [key, val, ready]);
  return [val, setVal] as const;
}

const inp =
  "pn-field h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-[rgb(var(--acc))] focus:ring-4 focus:ring-[rgba(var(--acc),.15)] dark:border-white/10";

const NAV: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "turnos", label: "Citas", icon: CalendarDays },
  { id: "historia", label: "Historia", icon: FileText },
  { id: "triage", label: "Triage", icon: Syringe },
  { id: "padron", label: "Pacientes", icon: Users },
  { id: "horarios", label: "Mis horarios", icon: Clock },
  { id: "pacientes", label: "Portal paciente", icon: Users },
  { id: "finanzas", label: "Finanzas", icon: Wallet },
  { id: "permisos", label: "Permisos", icon: KeyRound },
  { id: "asistente", label: "Asistente IA", icon: Bot },
  { id: "auditoria", label: "Auditoría", icon: ClipboardList },
];

type SubNav = { id: string; label: string; badge?: () => number };
type ItemNav = { id: Tab; label: string; icon: LucideIcon; tono: string; sub?: SubNav[] };
const GRUPOS_NAV: { grupo: string; items: ItemNav[] }[] = [
  {
    grupo: "Consultorio",
    items: [
      { id: "resumen", label: "Inicio", icon: LayoutDashboard, tono: "text-sky-300" },
      { id: "turnos", label: "Agenda y citas", icon: CalendarDays, tono: "text-sky-300" },
      { id: "triage", label: "Enfermería – Triage", icon: Syringe, tono: "text-emerald-300" },
      { id: "padron", label: "Pacientes", icon: Users, tono: "text-sky-300" },
      { id: "historia", label: "Historia Clínica", icon: FileText, tono: "text-rose-300" },
      { id: "recetas", label: "Receta digital", icon: PenLine, tono: "text-violet-300" },
      { id: "laboratorio", label: "Laboratorio", icon: FlaskConical, tono: "text-emerald-300" },
      { id: "pacientes", label: "Portal del paciente", icon: LogIn, tono: "text-fuchsia-300" },
    ],
  },
  { grupo: "Agenda médica", items: [{ id: "horarios", label: "Mis horarios", icon: Clock, tono: "text-teal-300" }] },
  { grupo: "Equipo", items: [{ id: "comunicacion", label: "Comunicación interna", icon: MessagesSquare, tono: "text-sky-300" }] },
  {
    grupo: "Pagos y facturación",
    items: [
      {
        id: "finanzas",
        label: "Pagos y caja",
        icon: Wallet,
        tono: "text-emerald-300",
        sub: [
          { id: "cobros", label: "Cobros a pacientes" },
          { id: "caja", label: "Control de caja" },
          { id: "resumen", label: "Resumen financiero" },
        ],
      },
      {
        id: "facturacion",
        label: "Facturación",
        icon: Receipt,
        tono: "text-emerald-300",
        sub: [
          { id: "comprobantes", label: "Comprobantes" },
          { id: "porfacturar", label: "Por facturar" },
          { id: "obras", label: "EPS" },
          { id: "tarifas", label: "Tarifas" },
          { id: "datos", label: "Datos de facturación" },
        ],
      },
    ],
  },
  {
    grupo: "Inteligencia",
    items: [
      { id: "analitica", label: "Analítica y reportes", icon: TrendingUp, tono: "text-amber-300" },
      { id: "automatizaciones", label: "Automatizaciones", icon: Zap, tono: "text-amber-300" },
      { id: "asistente", label: "Asistente IA", icon: Bot, tono: "text-violet-300" },
    ],
  },
  {
    grupo: "Sistema",
    items: [
      { id: "ministerio", label: "Ministerio de Salud", icon: Landmark, tono: "text-amber-300" },
      { id: "sitio", label: "Sitio web", icon: Globe, tono: "text-sky-300" },
      { id: "permisos", label: "Permisos y accesos", icon: KeyRound, tono: "text-violet-300" },
      { id: "auditoria", label: "Auditoría", icon: ClipboardList, tono: "text-slate-300" },
    ],
  },
];

const TITULOS: Record<Tab, [string, string]> = {
  resumen: ["Resumen general", "Vista rápida de la actividad de la clínica."],
  turnos: ["Citas", "La agenda de cada doctor: quién tomó cada horario y qué queda libre."],
  triage: ["Enfermería – Triage", "Toma de signos vitales y clasificación de pacientes antes de la consulta médica."],
  padron: ["Pacientes", "Padrón de pacientes: datos, cobertura, antecedentes y accesos rápidos."],
  recetas: ["Receta digital", "Recetas con su firma digitalizada, código de verificación y envío por WhatsApp."],
  laboratorio: ["Laboratorio", "Pedidos, órdenes firmadas y resultados con valores fuera de rango marcados."],
  facturacion: ["Facturación", "Comprobantes, cobros por facturar y liquidación de EPS."],
  analitica: ["Analítica y reportes", "Indicadores de la clínica, clínicos y reportes para descargar."],
  automatizaciones: ["Automatizaciones", "Recordatorios, alertas clínicas y avisos que se preparan solos."],
  historia: ["Historia Clínica", "Historia clínica general: evoluciones, signos vitales, diagnósticos CIE-10 e indicaciones."],
  ministerio: ["Ministerio de Salud", "Conexión con MIPRES y con la historia clínica interoperable (RDA)."],
  comunicacion: ["Comunicación interna", "Chat del equipo: avisos, novedades y coordinación del día."],
  horarios: ["Mis horarios", "Días, horarios y vacaciones de cada doctor: se publican en la web."],
  pacientes: ["Portal del paciente", "Accesos de pacientes y autorizaciones."],
  finanzas: ["Finanzas", "Cobros a pacientes, control de la caja e ingresos y egresos de la clínica."],
  permisos: ["Permisos", "Defina qué puede ver y hacer cada departamento."],
  asistente: ["Asistente IA", "Consultas rápidas sobre citas, finanzas, permisos y actividad."],
  auditoria: ["Auditoría", "Registro de todas las acciones realizadas en el panel."],
  sitio: ["Sitio web", "Datos de contacto, horario de la clínica y música de espera que se ven en la web."],
};

/* ---------- Panel principal ---------- */
function Panel() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [obliga2fa, setObliga2fa] = useState(() => falta2fa());
  const [seguridad, setSeguridad] = useState(false);
  const [tab, setTab] = useState<Tab>("resumen");
  const [menu, setMenu] = useState(false);
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({});
  const [finVista, setFinVista] = useState<VistaFin>("cobros");
  const [factVista, setFactVista] = useState<VistaFact>("comprobantes");
  const [pacSel, setPacSel] = useState<string | null>(null);
  const [focoTurnos, setFocoTurnos] = useState<FocoTurnos>(null);
  const [turnos, setTurnosDato] = useDato<Turno[]>("gb_turnos", SEED_TURNOS);
  const setTurnos = useCallback((v: SetStateAction<Turno[]>) => setTurnosDato((p) => (typeof v === "function" ? (v as (x: Turno[]) => Turno[])(p) : v)), [setTurnosDato]);
  const [movsTodos, setMovsDato] = useDato<Mov[]>("gb_movs", []);
  const movs = useMemo(() => movsTodos.filter((m) => !esEjemploMov(m)), [movsTodos]);
  const setMovs = useCallback((v: SetStateAction<Mov[]>) => setMovsDato((p) => (typeof v === "function" ? (v as (x: Mov[]) => Mov[])(p.filter((m) => !esEjemploMov(m))) : v)), [setMovsDato]);
  const [permisos, setPermisosDato] = useDato<Permisos>("gb_permisos", SEED_PERMISOS);
  const setPermisos = useCallback((v: SetStateAction<Permisos>) => setPermisosDato((p) => (typeof v === "function" ? (v as (x: Permisos) => Permisos)(p) : v)), [setPermisosDato]);
  const [auditGuardada] = useDato<Evento[]>("gb_audit", []);
  const [audit, setAudit] = useState<Evento[]>([]);
  useEffect(() => setAudit(auditGuardada), [auditGuardada]);
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    const s = sesionActual();
    if (!s) {
      navigate({ to: "/login" });
      return;
    }
    setUser(s);
    if (s.rol === "enfermeria") setTab("triage");
    else if (s.rol === "personal") setTab("turnos");
    setAudit(leerAuditoria());
    // Con backend: la sesión tiene que seguir vigente en el servidor
    void validarSesion().then((v) => {
      if (!v) {
        toast.error("Su sesión venció. Vuelva a ingresar.");
        navigate({ to: "/login" });
        return;
      }
      setUser(v);
      setObliga2fa(falta2fa());
      if (falta2fa()) return; // primero tiene que activar la verificación en dos pasos
      if (v.rol === "medico" || v.area === "Dirección general") void sincronizarPersonal();
      void refrescarTodo();
    });
  }, [navigate]);

  // Quita los turnos de ejemplo que pudieran haber quedado guardados
  useEffect(() => {
    setTurnos((p) => (p.some((t) => IDS_EJEMPLO.includes(t.id)) ? p.filter((t) => !IDS_EJEMPLO.includes(t.id)) : p));
  }, [setTurnos]);


  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const noLeidos = useNoLeidos(user);
  const [horarioSel, setHorarioSel] = useState<string | null>(null);
  if (!user) return null;
  if (obliga2fa)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(at_20%_10%,rgba(56,189,248,.18),transparent_50%),linear-gradient(180deg,#0b1430,#0a1024)] p-4">
        <div className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-2xl sm:p-8">
          <img src={logoClinica} alt="HEGO" className="size-12 rounded-2xl" />
          <h1 className="mt-4 text-2xl font-semibold">Active la verificación en dos pasos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Por seguridad, los médicos y Dirección general tienen que usar una app de códigos para entrar al panel. Se hace una sola vez.</p>
          <div className="mt-6">
            <Activar2FA onListo={() => { setObliga2fa(false); void refrescarTodo(); if (user.rol === "medico" || user.area === "Dirección general") void sincronizarPersonal(); }} />
          </div>
          <button onClick={() => { cerrarSesion(); navigate({ to: "/login" }); }} className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground">Salir</button>
        </div>
      </div>
    );

  // Permisos: enfermería ve solo los módulos habilitados en Permisos → Enfermería
  // Cualquier persona del equipo que no es médico usa los permisos de su área
  const esEnf = user.rol !== "medico";
  const areaUsuario = user.area ?? "Enfermería";
  const nivelEnf = (m: string) => nivelPersona(permisos, user.id, areaUsuario, m);
  const TABS_ENF: Tab[] = [
    ...(areaUsuario === "Dirección general" ? (["resumen", "ministerio"] as Tab[]) : []),
    ...Object.entries(MODULO_TAB).filter(([m]) => nivelEnf(m) !== "ninguno").map(([, t]) => t!),
    "comunicacion" as Tab,
  ];
  const permitido = (t: Tab) => !esEnf || TABS_ENF.includes(t);
  const tabVisible: Tab = permitido(tab) ? tab : (TABS_ENF[0] ?? "triage");
  const moduloDe = (t: Tab) => Object.entries(MODULO_TAB).find(([, x]) => x === t)?.[0] ?? "";
  const soloLectura = (t: Tab) => esEnf && nivelEnf(moduloDe(t)) === "ver";
  const gruposVisibles = esEnf
    ? [{ grupo: areaUsuario, items: GRUPOS_NAV.flatMap((g) => g.items).filter((i) => TABS_ENF.includes(i.id)) }]
    : GRUPOS_NAV;

  const log: LogFn = (accion, detalle = "") => setAudit(auditar(user.nombre, accion, detalle));
  const salir = () => {
    log("Cierre de sesión");
    cerrarSesion();
    navigate({ to: "/login" });
  };
  const [titulo, subtitulo] = TITULOS[tabVisible];
  const foto = fotoDe(user.id);
  const corto = nombreCorto(user.nombre);
  const pendientes = turnos.filter((t) => t.estado === "Pendiente").length;
  const eventosHoy = audit.filter((e) => new Date(e.fecha).toDateString() === new Date().toDateString()).length;
  const pedidosPacientes = leerDato<Autorizacion[]>(KEY_AUT, []).filter((x) => x.estado === "Pendiente" && x.origen === "Paciente").length;
  const triagesEspera = leerDato<Triage[]>(KEY_TRIAGE, []).filter((t) => !t.evolucionId && diaLocal(t.fecha) === isoDe(new Date())).length;
  const badges: Partial<Record<Tab, number>> = { comunicacion: noLeidos, turnos: pendientes, pacientes: pedidosPacientes, auditoria: eventosHoy, ...(esEnf ? {} : { triage: triagesEspera }) };
  const fechaLarga = ahora.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  const hora = ahora.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  const irHorarios = (id: string) => {
    setHorarioSel(id);
    irTab("horarios");
  };
  const irTab = (t: Tab) => {
    if (!permitido(t)) return;
    if (t !== tab) setPacSel(null);
    if (t !== "turnos") setFocoTurnos(null);
    setTab(t);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const subActual = (id: Tab) => (id === "finanzas" ? finVista : id === "facturacion" ? factVista : "");
  const abrirPaciente = (t: Tab, id: string) => {
    irTab(t);
    setPacSel(id);
  };
  const irSub = (id: Tab, sub: string) => {
    if (id === "finanzas") setFinVista(sub as VistaFin);
    if (id === "facturacion") setFactVista(sub as VistaFact);
    irTab(id);
  };
  const interiorSidebar = (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#0a1226] text-white">
      {/* Brillos de fondo (estilo Cloud Esther, en azul clínico y rojo cardio) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(56,132,246,0.28),transparent_48%),radial-gradient(circle_at_100%_55%,rgba(244,63,94,0.12),transparent_42%),radial-gradient(circle_at_0%_100%,rgba(14,165,233,0.16),transparent_45%)]" />

      <div className="relative flex min-h-0 flex-1 flex-col">
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="relative shrink-0">
              <span aria-hidden className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-sky-400 to-rose-500 opacity-50 blur-md" />
              <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-white/25">
                <img src={logoClinica} alt="" className="size-full object-cover" />
              </span>
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[15px] font-semibold tracking-tight">HEGO</span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-white/50">Especialidades médicas</span>
            </span>
          </Link>
          <button onClick={() => setMenu(false)} aria-label="Cerrar menú" className="rounded-lg p-2 text-white/80 hover:bg-white/10 lg:hidden">
            <X className="size-5" />
          </button>
        </div>

        {/* Médico activo */}
        <div className="relative mx-3 mb-3 flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 p-3 shadow-[0_14px_30px_-18px_rgba(37,99,235,0.95)]">
          <span aria-hidden className="pointer-events-none absolute -right-6 -top-8 size-20 rounded-full bg-white/20 blur-xl" />
          <span aria-hidden className="pointer-events-none absolute -bottom-8 -left-4 size-16 rounded-full bg-rose-400/30 blur-xl" />
          <span className="relative shrink-0">
            {foto ? (
              <img src={foto} alt={user.nombre} className="size-10 rounded-xl object-cover object-top ring-2 ring-white/40" />
            ) : (
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/20 text-xs font-bold ring-1 ring-white/30">{iniciales(user.nombre)}</span>
            )}
            <span className="pn-online absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 ring-2 ring-blue-700" />
          </span>
          <div className="relative min-w-0 flex-1 leading-tight">
            <p className="font-display text-[13px] font-bold leading-snug">{corto}</p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-white/80">
              {user.id === "alonso" ? <HeartPulse className="size-3 shrink-0" /> : <Droplets className="size-3 shrink-0" />}
              {esEnf ? `${areaUsuario} · ${esAreaMedica(areaUsuario) ? "Médico" : "Equipo"}` : `${user.id === "alonso" ? "Cardiología" : user.id === "alberto" ? "Nefrología" : "Clínica"} · Administrador`}
            </p>
          </div>
        </div>

        {/* Navegación agrupada */}
        <nav className="pn-noscroll min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 pb-6 pt-1 [mask-image:linear-gradient(to_bottom,transparent,#000_10px,#000_calc(100%-28px),transparent)]">
          {gruposVisibles.map((g) => (
            <div key={g.grupo}>
              <p className="flex items-center gap-2 px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                <span className="h-1 w-3 rounded-full bg-gradient-to-r from-sky-400 to-rose-400" />
                {g.grupo}
              </p>
              <ul className="space-y-0.5">
                {g.items.map((n) => {
                  const activo = tabVisible === n.id;
                  const badge = badges[n.id];
                  const abierto = n.sub ? (abiertos[n.id] ?? activo) : false;
                  return (
                    <li key={n.id}>
                      <div className="relative">
                        <button
                          onClick={() => {
                            irTab(n.id);
                            if (n.sub) setAbiertos((p) => ({ ...p, [n.id]: true }));
                          }}
                          aria-current={activo ? "page" : undefined}
                          className={`group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-white/40 ${n.sub ? "pr-9" : ""} ${
                            activo
                              ? "bg-gradient-to-r from-sky-500 to-blue-600 font-semibold text-white shadow-[0_10px_24px_-14px_rgba(56,132,246,0.95)]"
                              : "text-white/75 hover:translate-x-0.5 hover:bg-white/[0.07] hover:text-white"
                          }`}
                        >
                          <n.icon className={`size-4 shrink-0 ${activo ? "text-white" : n.tono}`} />
                          <span className="truncate">{n.label}</span>
                          {n.id === "asistente" && !activo && (
                            <span className="ml-auto rounded-full bg-gradient-to-r from-sky-400 to-violet-400 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">IA</span>
                          )}
                          {!!badge && !n.sub && (
                            <span className={`ml-auto grid min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold ${activo ? "bg-white text-blue-700" : "bg-rose-500 text-white"}`}>{badge > 99 ? "99+" : badge}</span>
                          )}
                        </button>
                        {n.sub && (
                          <button
                            type="button"
                            aria-label={abierto ? `Contraer ${n.label}` : `Desplegar ${n.label}`}
                            aria-expanded={abierto}
                            onClick={() => setAbiertos((p) => ({ ...p, [n.id]: !abierto }))}
                            className={`absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md transition-colors ${activo ? "text-white hover:bg-white/15" : "text-white/55 hover:bg-white/10 hover:text-white"}`}
                          >
                            <ChevronDown className={`size-3.5 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>
                      {n.sub && (
                        <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${abierto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`} aria-hidden={!abierto}>
                          <div className="overflow-hidden">
                            <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-2">
                              {n.sub.map((s) => {
                                const subActivo = activo && subActual(n.id) === s.id;
                                return (
                                  <li key={s.id}>
                                    <button
                                      tabIndex={abierto ? 0 : -1}
                                      onClick={() => irSub(n.id, s.id)}
                                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors ${subActivo ? "bg-white/10 font-medium text-white" : "text-white/60 hover:bg-white/[0.06] hover:text-white"}`}
                                    >
                                      <span className={`size-1.5 shrink-0 rounded-full ${subActivo ? "bg-sky-300 shadow-[0_0_8px_rgba(125,211,252,.9)]" : "bg-white/25"}`} />
                                      <span className="truncate">{s.label}</span>
                                      {s.badge?.() ? <span className="ml-auto rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{s.badge()}</span> : null}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Pie: hora y accesos */}
        <div className="relative space-y-2.5 border-t border-white/10 p-3">
          <div className="flex items-center justify-between rounded-xl bg-white/[0.06] px-3 py-2.5 ring-1 ring-white/10 [@media(max-height:720px)]:hidden">
            <div className="leading-tight">
              <p className="font-display text-lg font-semibold tabular-nums">{hora}</p>
              <p className="text-[11px] text-white/55 first-letter:uppercase">{fechaLarga}</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-semibold text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-400" /> En línea
            </span>
          </div>
          <button onClick={() => setSeguridad(true)} className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/[0.06] py-2 text-xs font-medium text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white">
            <ShieldCheck className="size-3.5" /> Mi seguridad
          </button>
          <div className="flex gap-2">
            <Link to="/" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/[0.06] py-2 text-xs font-medium text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white">
              <ExternalLink className="size-3.5" /> Ver sitio
            </Link>
            <button onClick={salir} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500/15 py-2 text-xs font-medium text-red-200 ring-1 ring-red-400/25 transition hover:bg-red-500/25 hover:text-white">
              <LogOut className="size-3.5" /> Salir
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pn-root pn-bg isolate min-h-screen bg-[#eaf0f9] text-foreground lg:grid lg:grid-cols-[280px_1fr] dark:bg-[#070d1a]" style={{ ["--acc" as string]: FONDOS[tab].a }}>
      <style>{`
        @keyframes pn-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pn-orb { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(18px,-24px) scale(1.15); } }
        @keyframes pn-ring { 0% { transform: scale(1); opacity: .7; } 100% { transform: scale(2.4); opacity: 0; } }
        @keyframes pn-wave { 0%,60%,100% { transform: rotate(0deg); } 10%,30% { transform: rotate(14deg); } 20%,40% { transform: rotate(-8deg); } }
        @keyframes pn-dot { 0%,80%,100% { opacity: .25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
        @keyframes pn-bar { from { width: 0; } }
        @keyframes pn-shine { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
        .pn-root { --acc: 14,165,233; }
        .pn-up { animation: pn-up .55s ease-out both; }
        .pn-orb { animation: pn-orb 12s ease-in-out infinite; }
        .pn-online::after { content: ""; position: absolute; inset: 0; border-radius: 9999px; background: inherit; animation: pn-ring 2s ease-out infinite; }
        .pn-wave { display: inline-block; transform-origin: 70% 70%; animation: pn-wave 2.4s ease-in-out 1s 2; }
        .pn-dot { animation: pn-dot 1.2s ease-in-out infinite; }
        .pn-bar { animation: pn-bar 1s cubic-bezier(.22,1,.36,1) both; }
        .pn-card { position: relative; border-radius: 1.25rem; border: 1px solid var(--color-border); background: var(--color-card); box-shadow: 0 1px 2px rgba(15,35,80,.04), 0 12px 32px -12px rgba(15,35,80,.12); }
        .pn-sheen { position: relative; overflow: hidden; }
        .pn-sheen::after { content: ""; position: absolute; inset: 0; width: 40%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.18), transparent); transform: translateX(-100%); animation: pn-shine 6s ease-in-out infinite; pointer-events: none; }
        .pn-noscroll { scrollbar-width: none; -ms-overflow-style: none; }
        .pn-noscroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
        .pn-card { border: 1px solid transparent; background: radial-gradient(120% 80% at 100% 0%, rgba(var(--acc),.10), transparent 55%) padding-box, radial-gradient(90% 70% at 0% 100%, rgba(30,64,175,.05), transparent 60%) padding-box, linear-gradient(165deg, rgba(255,255,255,.97), rgba(248,250,255,.9)) padding-box, linear-gradient(150deg, rgba(var(--acc),.65), rgba(var(--acc),.18) 22%, rgba(203,213,225,.7) 50%, rgba(var(--acc),.15) 80%, rgba(var(--acc),.5)) border-box; backdrop-filter: blur(16px) saturate(140%); transition: transform .45s cubic-bezier(.22,1,.36,1), box-shadow .45s cubic-bezier(.22,1,.36,1); }
        .pn-card::before { content: ""; position: absolute; top: 0; left: 14%; right: 14%; height: 1px; background: linear-gradient(90deg, transparent, rgba(var(--acc),.8), transparent); pointer-events: none; }
        .pn-card { box-shadow: inset 0 1px 0 rgba(255,255,255,1), inset 0 0 0 1px rgba(255,255,255,.5), 0 1px 2px rgba(15,23,42,.06), 0 8px 18px -6px rgba(15,23,42,.08), 0 26px 50px -20px rgba(15,35,80,.22), 0 40px 80px -40px rgba(var(--acc),.55); }
        .pn-bg { background-image: radial-gradient(1100px 620px at 85% -8%, rgba(var(--acc),.22), transparent 60%), radial-gradient(900px 600px at -5% 25%, rgba(37,99,235,.14), transparent 60%), radial-gradient(800px 500px at 60% 110%, rgba(var(--acc),.12), transparent 60%), linear-gradient(180deg, #edf2fb 0%, #e3eaf6 100%); background-attachment: fixed; transition: background-image .6s; }
        .dark .pn-bg { background-image: radial-gradient(1100px 620px at 85% -8%, rgba(var(--acc),.18), transparent 60%), radial-gradient(900px 600px at -5% 25%, rgba(37,99,235,.12), transparent 60%), linear-gradient(180deg, #070d1a, #050a14); }
        .pn-sec-top { background: linear-gradient(118deg, #071a46 0%, #0b2a6b 38%, rgb(var(--acc)) 130%); box-shadow: inset 0 -1px 0 rgba(255,255,255,.08); }
        .pn-sec-acc .h-10, .pn-sec-acc .h-11 { height: 2.4rem; }
        .pn-sec-band { background: linear-gradient(100deg, rgba(var(--acc),.13), rgba(var(--acc),.05) 45%, transparent 80%); }
        .dark .pn-sec-band { background: linear-gradient(100deg, rgba(var(--acc),.18), rgba(var(--acc),.05) 45%, transparent 80%); }
        .pn-sec-h { position: relative; }
        .pn-sec-h::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: linear-gradient(90deg, rgba(var(--acc),.45), rgba(148,163,184,.25) 35%, rgba(148,163,184,.12)); }
        .dark .pn-sec-h::after { background: linear-gradient(90deg, rgba(var(--acc),.5), rgba(255,255,255,.08) 40%, transparent); }
        .pn-field { background: linear-gradient(180deg, #f6f8fc, #ffffff); box-shadow: inset 0 1px 2px rgba(15,23,42,.06), 0 1px 0 rgba(255,255,255,.9); }
        .pn-field:focus { background: #fff; }
        .pn-field:hover { border-color: rgba(var(--acc),.45); }
        .dark .pn-field { background: rgba(255,255,255,.04); box-shadow: none; }
        @keyframes pn-pulse { from { stroke-dashoffset: 1180; } to { stroke-dashoffset: 0; } }
        .pn-pulse { stroke-dasharray: 80 1100; animation: pn-pulse 3.2s linear infinite; }
        @keyframes pn-ripple { 0% { transform: scale(.85); opacity: .9; } 100% { transform: scale(1.35); opacity: 0; } }
        .pn-ripple { animation: pn-ripple 2.4s ease-out infinite; }
        .pn-acc-tile { background: linear-gradient(135deg, rgb(var(--acc)), rgba(var(--acc),.62)); box-shadow: 0 8px 18px -8px rgba(var(--acc),.8), inset 0 1px 0 rgba(255,255,255,.35); }
        .pn-card:hover { box-shadow: inset 0 1px 0 rgba(255,255,255,.95), 0 1px 1px rgba(15,23,42,.05), 0 4px 10px rgba(15,23,42,.05), 0 24px 44px -14px rgba(15,23,42,.14), 0 40px 80px -30px rgba(var(--acc),.45); }
        .pn-lift:hover { transform: translateY(-4px); }
        .pn-cross { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Cpath d='M12 9h4v3h3v4h-3v3h-4v-3H9v-4h3z' fill='%23ffffff' fill-opacity='.06'/%3E%3C/svg%3E"); }
        .pn-cross-dark { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Cpath d='M12 9h4v3h3v4h-3v3h-4v-3H9v-4h3z' fill='%231e40af' fill-opacity='.045'/%3E%3C/svg%3E"); }
        @keyframes pn-ecg { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
        .pn-ecg { stroke-dasharray: 1000; animation: pn-ecg 3.2s linear infinite; }
        @keyframes pn-draw { from { stroke-dashoffset: var(--len, 1400); } to { stroke-dashoffset: 0; } }
        .pn-draw { stroke-dasharray: var(--len, 1400); animation: pn-draw 1.8s cubic-bezier(.22,1,.36,1) both; }
        @keyframes pn-fade { from { opacity: 0; } to { opacity: 1; } }
        .pn-area { animation: pn-fade 1.4s ease .6s both; }
        @keyframes pn-beat { 0%,100% { transform: scale(1); } 14% { transform: scale(1.18); } 28% { transform: scale(1); } 42% { transform: scale(1.12); } 70% { transform: scale(1); } }
        .pn-beat { animation: pn-beat 1.6s ease-in-out infinite; }
        @keyframes pn-scan { from { transform: translateX(-30%); } to { transform: translateX(130%); } }
        .pn-scan { animation: pn-scan 3.2s linear infinite; }
        .pn-donut { transition: stroke-dasharray 1.4s cubic-bezier(.22,1,.36,1); }
        .dark .pn-root .bg-emerald-50, .dark .pn-root .bg-emerald-100 { background-color: rgb(16 185 129 / .14); }
        .dark .pn-root .text-emerald-700, .dark .pn-root .text-emerald-800, .dark .pn-root .text-emerald-900 { color: rgb(110 231 183); }
        .dark .pn-root .ring-emerald-100, .dark .pn-root .ring-emerald-200 { --tw-ring-color: rgb(16 185 129 / .3); }
        .dark .pn-root .bg-amber-50, .dark .pn-root .bg-amber-100 { background-color: rgb(245 158 11 / .14); }
        .dark .pn-root .text-amber-700, .dark .pn-root .text-amber-800, .dark .pn-root .text-amber-900 { color: rgb(252 211 77); }
        .dark .pn-root .ring-amber-100, .dark .pn-root .ring-amber-200 { --tw-ring-color: rgb(245 158 11 / .3); }
        .dark .pn-root .bg-rose-50, .dark .pn-root .bg-rose-100 { background-color: rgb(244 63 94 / .14); }
        .dark .pn-root .text-rose-700, .dark .pn-root .text-rose-800, .dark .pn-root .text-rose-900 { color: rgb(253 164 175); }
        .dark .pn-root .ring-rose-100, .dark .pn-root .ring-rose-200 { --tw-ring-color: rgb(244 63 94 / .3); }
        .dark .pn-root .bg-red-50, .dark .pn-root .bg-red-100 { background-color: rgb(239 68 68 / .14); }
        .dark .pn-root .text-red-700, .dark .pn-root .text-red-800, .dark .pn-root .text-red-900 { color: rgb(252 165 165); }
        .dark .pn-root .ring-red-100, .dark .pn-root .ring-red-200 { --tw-ring-color: rgb(239 68 68 / .3); }
        .dark .pn-root .bg-sky-50, .dark .pn-root .bg-sky-100 { background-color: rgb(14 165 233 / .14); }
        .dark .pn-root .text-sky-700, .dark .pn-root .text-sky-800, .dark .pn-root .text-sky-900 { color: rgb(125 211 252); }
        .dark .pn-root .ring-sky-100, .dark .pn-root .ring-sky-200 { --tw-ring-color: rgb(14 165 233 / .3); }
        .dark .pn-root .bg-violet-50, .dark .pn-root .bg-violet-100 { background-color: rgb(139 92 246 / .14); }
        .dark .pn-root .text-violet-700, .dark .pn-root .text-violet-800, .dark .pn-root .text-violet-900 { color: rgb(196 181 253); }
        .dark .pn-root .ring-violet-100, .dark .pn-root .ring-violet-200 { --tw-ring-color: rgb(139 92 246 / .3); }
        .dark .pn-root .bg-pink-50, .dark .pn-root .bg-pink-100 { background-color: rgb(236 72 153 / .14); }
        .dark .pn-root .text-pink-700, .dark .pn-root .text-pink-800, .dark .pn-root .text-pink-900 { color: rgb(249 168 212); }
        .dark .pn-root .ring-pink-100, .dark .pn-root .ring-pink-200 { --tw-ring-color: rgb(236 72 153 / .3); }
        .dark .pn-root .bg-orange-50, .dark .pn-root .bg-orange-100 { background-color: rgb(249 115 22 / .14); }
        .dark .pn-root .text-orange-700, .dark .pn-root .text-orange-800, .dark .pn-root .text-orange-900 { color: rgb(253 186 116); }
        .dark .pn-root .ring-orange-100, .dark .pn-root .ring-orange-200 { --tw-ring-color: rgb(249 115 22 / .3); }
        .dark .pn-root .bg-teal-50, .dark .pn-root .bg-teal-100 { background-color: rgb(20 184 166 / .14); }
        .dark .pn-root .text-teal-700, .dark .pn-root .text-teal-800, .dark .pn-root .text-teal-900 { color: rgb(94 234 212); }
        .dark .pn-root .ring-teal-100, .dark .pn-root .ring-teal-200 { --tw-ring-color: rgb(20 184 166 / .3); }
        .dark .pn-root .bg-indigo-50, .dark .pn-root .bg-indigo-100 { background-color: rgb(99 102 241 / .14); }
        .dark .pn-root .text-indigo-700, .dark .pn-root .text-indigo-800, .dark .pn-root .text-indigo-900 { color: rgb(165 180 252); }
        .dark .pn-root .ring-indigo-100, .dark .pn-root .ring-indigo-200 { --tw-ring-color: rgb(99 102 241 / .3); }
        .dark .pn-root .bg-cyan-50, .dark .pn-root .bg-cyan-100 { background-color: rgb(6 182 212 / .14); }
        .dark .pn-root .text-cyan-700, .dark .pn-root .text-cyan-800, .dark .pn-root .text-cyan-900 { color: rgb(103 232 249); }
        .dark .pn-root .ring-cyan-100, .dark .pn-root .ring-cyan-200 { --tw-ring-color: rgb(6 182 212 / .3); }
        .dark .pn-root .bg-slate-100 { background-color: rgb(148 163 184 / .14); }
        .dark .pn-root .text-slate-500, .dark .pn-root .text-slate-600 { color: rgb(203 213 225); }
        .dark .pn-root .bg-white:not(.pn-keep) { background-color: rgb(255 255 255 / .92); }
        .dark .pn-card { background: linear-gradient(rgb(17 26 46 / .92), rgb(12 20 38 / .92)) padding-box, linear-gradient(160deg, rgba(var(--acc),.5), rgba(255,255,255,.06) 30%, rgba(255,255,255,.04) 70%, rgba(var(--acc),.3)) border-box; box-shadow: 0 20px 50px -25px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.02); }
        .dark .pn-card::before { opacity: .6; }
        @media (prefers-reduced-motion: reduce) { .pn-up, .pn-orb, .pn-wave, .pn-dot, .pn-bar, .pn-sheen::after, .pn-online::after, .pn-ecg, .pn-draw, .pn-area, .pn-beat, .pn-scan, .pn-pulse, .pn-ripple { animation: none; } }
      `}</style>

      {/* ───────── SIDEBAR (escritorio) ───────── */}
      <aside className="relative hidden overflow-hidden border-r border-white/5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        {interiorSidebar}
      </aside>

      {/* ───────── BARRA SUPERIOR (celular) ───────── */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-3 gradient-deep px-4 py-3 text-white shadow-lg lg:hidden">
        <button onClick={() => setMenu(true)} aria-label="Abrir menú" className="flex size-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20"><Menu className="size-5" /></button>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-semibold">{titulo}</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">Gómez Bolaño · Panel</p>
        </div>
        {foto ? <img src={foto} alt="" className="size-10 rounded-xl object-cover object-top ring-2 ring-white/25" /> : null}
      </div>

      {/* ───────── MENÚ LATERAL (celular) ───────── */}
      {menu && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setMenu(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[86%] max-w-[320px] flex-col overflow-hidden shadow-2xl animate-in slide-in-from-left duration-300">
            {interiorSidebar}
          </aside>
        </div>
      )}

      {/* ───────── NAVEGACIÓN INFERIOR (celular) ───────── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {([...NAV.filter((n) => (esEnf ? TABS_ENF.slice(0, 4) : ["resumen", "turnos", "padron", "historia"]).includes(n.id))] as typeof NAV).map((n) => {
            const on = tabVisible === n.id;
            const b = badges[n.id];
            return (
              <button key={n.id} onClick={() => irTab(n.id)} className={`relative flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition-colors ${on ? "text-[rgb(var(--acc))]" : "text-muted-foreground"}`}>
                <span className={`flex h-8 w-12 items-center justify-center rounded-full transition-all ${on ? "bg-[rgba(var(--acc),.12)]" : ""}`}><n.icon className="size-5" /></span>
                {n.id === "pacientes" ? "Pacientes" : n.label}
                {!!b && <span className="absolute right-2 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">{b}</span>}
              </button>
            );
          })}
          <button onClick={() => setMenu(true)} className="flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold text-muted-foreground">
            <span className="flex h-8 w-12 items-center justify-center rounded-full"><Menu className="size-5" /></span>
            Más
          </button>
        </div>
      </nav>

      {/* ───────── CONTENIDO ───────── */}
      <FondoModulo tab={tabVisible} />
      <main className="relative min-w-0 p-4 pb-28 sm:p-8 sm:pb-28 lg:pb-8">
        <div className="pn-up pn-sheen relative mb-8 overflow-hidden rounded-3xl gradient-deep p-6 text-deep-foreground shadow-elevated sm:p-8">
          <div className="pn-cross pointer-events-none absolute inset-0" />
          <div className="pn-orb pointer-events-none absolute -right-10 -top-16 size-64 rounded-full bg-white/10 blur-3xl" />
          <FondoEspecialidadMedico id={user.id} />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {foto && <img src={foto} alt="" className="hidden size-16 rounded-2xl object-cover object-top ring-2 ring-white/30 sm:block" />}
              <div>
                <p className="text-sm text-deep-foreground/70 first-letter:uppercase">{fechaLarga}</p>
                <h1 className="text-2xl font-semibold sm:text-3xl">
                  {saludo(ahora)}, {corto}
                </h1>
                <p className="mt-1 text-sm text-deep-foreground/75">
                  {esEnf && esAreaMedica(areaUsuario)
                    ? `Panel médico · ${areaUsuario}. Atiende a sus pacientes desde la Historia Clínica.`
                    : esEnf && areaUsuario !== "Enfermería"
                    ? `Panel de ${areaUsuario}: verá los módulos que su área tiene habilitados.`
                    : esEnf
                    ? `Hay ${turnos.filter((t) => t.fecha === isoDe(new Date()) && t.estado !== "Cancelado").length} pacientes con cita hoy. Registre sus signos vitales antes de la consulta.`
                    : pendientes > 0
                    ? `Tiene ${pendientes} cita${pendientes === 1 ? "" : "s"} pendiente${pendientes === 1 ? "" : "s"} de confirmar.`
                    : "Todo al día: no hay citas pendientes."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ThemeToggle className="size-10 rounded-xl bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20 hover:text-white" />
              <InstalarApp nombre="el panel" oscuro className="h-11" />
              {!esEnf && <CampanaPanel turnos={turnos} user={user} irA={setTab} />}
              {!esEnf && <Button onClick={() => abrirIA()} variant="outline" className="rounded-xl !border-white/25 !bg-white/10 text-deep-foreground hover:!bg-white/20 hover:text-deep-foreground">
                <Bot className="size-4" /> Preguntar a la IA
              </Button>}
              {!esEnf && <Button onClick={() => setTab("turnos")} className="rounded-xl !bg-white text-[var(--deep)] hover:!bg-white/90">
                <Plus className="size-4" /> Nueva cita
              </Button>}
            </div>
          </div>
        </div>

        <div key={tab} className="pn-up mb-7 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="pn-acc-tile flex size-12 items-center justify-center rounded-2xl text-white">
              {(() => {
                const I = GRUPOS_NAV.flatMap((g) => g.items).find((n) => n.id === tab)?.icon ?? LayoutDashboard;
                return <I className="size-5" />;
              })()}
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: `rgb(${FONDOS[tab].a})` }}>Panel · {titulo}</p>
              <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">{titulo}</h2>
              <p className="text-sm text-muted-foreground">{subtitulo}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur">
            <span className="pn-online relative size-2 rounded-full bg-emerald-500" /> Datos actualizados
          </span>
        </div>

        {esEnf && TABS_ENF.length === 0 && (
          <section className="pn-card p-6"><Vacio icon={KeyRound} titulo="Sin módulos habilitados" texto={`Pídale a un médico que le habilite módulos en Permisos → ${areaUsuario}.`} /></section>
        )}
        {(!esEnf || TABS_ENF.length > 0) && tabVisible === "resumen" && <Resumen turnos={turnos} movs={movs} audit={audit} irA={setTab} abrirTurnos={(f) => { setFocoTurnos(f); irTab("turnos"); }} />}
        {tabVisible === "turnos" && soloLectura("turnos") && <TurnosLectura turnos={turnos} />}
        {tabVisible === "turnos" && !soloLectura("turnos") && <TurnosTab key={focoTurnos ?? "t"} turnos={turnos} setTurnos={setTurnos} log={log} foco={focoTurnos} irHorarios={permitido("horarios") ? irHorarios : undefined} />}
        {tabVisible === "triage" && <TriageTab user={user} log={log} turnos={turnos} esMedico={!esEnf || esAreaMedica(user.area)} soloLectura={soloLectura("triage")} abrirHistoria={(id) => abrirPaciente("historia", id)} />}
        {tabVisible === "padron" && <PadronTab key={pacSel ?? "pad"} user={user} log={log} turnos={turnos} abrir={abrirPaciente} inicial={pacSel} soloLectura={soloLectura("padron")} />}
        {tabVisible === "historia" && <HistoriaTab key={pacSel ?? "hc"} user={user} log={log} turnos={turnos} inicial={pacSel} soloLectura={soloLectura("historia") || (esEnf && !esAreaMedica(user.area))} notasEnf={esEnf && !esAreaMedica(user.area) && TABS_ENF.includes("triage") && !soloLectura("triage")} />}
        {tabVisible === "recetas" && <RecetasTab key={pacSel ?? "rx"} user={user} log={log} turnos={turnos} inicial={pacSel} />}
        {tabVisible === "laboratorio" && <LaboratorioTab key={pacSel ?? "lab"} user={user} log={log} turnos={turnos} inicial={pacSel} />}
        {tabVisible === "facturacion" && <FacturacionTab user={user} log={log} turnos={turnos} vista={factVista} setVista={setFactVista} />}
        {tabVisible === "analitica" && <AnaliticaTab log={log} turnos={turnos} />}
        {tabVisible === "automatizaciones" && <AutomatizacionesTab log={log} turnos={turnos} irA={irTab} />}
        {tabVisible === "horarios" && <HorariosTab key={horarioSel ?? "h"} user={user} log={log} puedeEditarOtros={!soloLectura("horarios")} inicial={horarioSel} />}
        {tabVisible === "pacientes" && <PacientesTab user={user} log={log} turnos={turnos} />}
        {tabVisible === "finanzas" && <FinanzasTab movs={movs} setMovs={setMovs} log={log} turnos={turnos} user={user} vista={finVista} setVista={setFinVista} />}
        {tabVisible === "permisos" && <PermisosTab permisos={permisos} setPermisos={setPermisos} log={log} user={user} />}
        {tabVisible === "asistente" && <AsistenteTab turnos={turnos} movs={movs} permisos={permisos} audit={audit} log={log} user={user} />}
        {tabVisible === "auditoria" && <AuditoriaTab audit={audit} log={log} />}
        {tabVisible === "sitio" && <SitioTab log={log} />}
        {tabVisible === "comunicacion" && <ComunicacionTab user={user} log={log} />}
        {tabVisible === "ministerio" && <MinisterioTab user={user} log={log} turnos={turnos} abrirPaciente={(id) => abrirPaciente("padron", id)} />}
        {seguridad && <MiSeguridad user={user} onCerrar={() => setSeguridad(false)} />}
        {(user.rol === "medico" || user.area === "Dirección general") && <AsistenteVoz user={user} log={log} />}
      </main>
    </div>
  );
}

/* ---------- Campana de notificaciones de los doctores ---------- */
type Notif = { id: string; titulo: string; texto: string; icon: LucideIcon; tono: Tono; tab: Tab; fecha: string };

function CampanaPanel({ turnos, user, irA }: { turnos: Turno[]; user: SessionUser; irA: (t: Tab) => void }) {
  const [abierta, setAbierta] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const [auts] = useDato<Autorizacion[]>(KEY_AUT, []);
  const [controles] = useDato<Control[]>(KEY_CONTROLES, []);
  const [pacientes] = useDato<PacientePortal[]>(KEY_PACIENTES, []);
  const [cobros] = useDato<Cobro[]>(KEY_COBROS, []);
  const [cierres] = useDato<CierreCaja[]>(KEY_CIERRES, []);
  const [vistas, setVistas] = useDato<string[]>(`gb_notif_vistas_${user.id}`, []);
  const [notasEnfN] = useDato<NotaEnfermeria[]>(KEY_NOTAS_ENF, []);
  const [triagesN] = useDato<Triage[]>(KEY_TRIAGE, []);
  const [docsN] = useDato<DocumentoPaciente[]>(KEY_DOCUMENTOS, []);

  const ahora = Date.now();
  const nombreP = (id: string) => pacientes.find((p) => p.id === id)?.nombre ?? "Paciente";
  const esMedicoN = user.rol === "medico";
  const items: Notif[] = [
    // Laboratorios y estudios que subieron los pacientes desde su portal
    ...docsN
      .filter((d) => d.origen === "paciente" && !d.vistoPor)
      .map((d) => ({ id: `doc-${d.id}`, titulo: "Documento subido por un paciente", texto: `${nombreCorto(d.paciente)} · ${d.categoria} · ${d.nombre}`, icon: Paperclip, tono: "azul" as Tono, tab: "padron" as Tab, fecha: d.fecha })),
    // Lo que registra enfermería le llega al médico
    ...(esMedicoN
      ? notasEnfN
          .filter((n) => !n.anulada && ahora - new Date(n.fecha).getTime() < 86400000)
          .map((n) => ({ id: `enf-${n.id}`, titulo: `Enfermería · ${n.tipo}`, texto: `${n.paciente} · ${n.texto.slice(0, 70)}`, icon: Syringe, tono: "verde" as Tono, tab: "triage" as Tab, fecha: n.fecha }))
      : []),
    ...(esMedicoN
      ? triagesN
          .filter((t) => !t.evolucionId && ahora - new Date(t.fecha).getTime() < 86400000)
          .map((t) => ({ id: `tri-${t.id}`, titulo: "Signos vitales listos", texto: `${t.paciente}${t.signos.sistolica ? ` · PA ${t.signos.sistolica}/${t.signos.diastolica}` : ""} · ${t.enfermera}`, icon: HeartPulse, tono: "azul" as Tono, tab: "triage" as Tab, fecha: t.fecha }))
      : []),
    ...turnos
      .filter((t) => t.estado === "Pendiente" && (t.origen === "web" || t.origen === "portal") && t.fecha >= hoy())
      .map((t) => ({ id: `turno-${t.id}`, titulo: `Nueva cita ${t.origen === "portal" ? "desde el portal" : "desde la web"}`, texto: `${t.paciente} · ${fechaCorta(t.fecha)} ${hora12(t.hora)} · ${nombreCorto(t.doctor)}`, icon: CalendarCheck, tono: "azul" as Tono, tab: "turnos" as Tab, fecha: `${t.fecha}T${hora12(t.hora)}` })),
    ...auts
      .filter((a) => a.estado === "Pendiente" && a.origen === "Paciente")
      .map((a) => ({ id: `aut-${a.id}`, titulo: "Pedido de autorización", texto: `${a.paciente} · ${a.titulo}`, icon: ShieldCheck, tono: "violeta" as Tono, tab: "pacientes" as Tab, fecha: a.fecha })),
    ...auts
      .filter((a) => a.origen === "Clínica" && a.estado !== "Pendiente" && a.fechaRespuesta && ahora - new Date(a.fechaRespuesta).getTime() < 7 * 86400000)
      .map((a) => ({ id: `autresp-${a.id}`, titulo: `El paciente ${a.estado === "Autorizada" ? "autorizó" : "rechazó"}`, texto: `${a.paciente} · ${a.titulo}`, icon: a.estado === "Autorizada" ? Check : Ban, tono: (a.estado === "Autorizada" ? "verde" : "rojo") as Tono, tab: "pacientes" as Tab, fecha: a.fechaRespuesta! })),
    ...controles
      .filter((c) => ahora - new Date(c.fecha).getTime() < 14 * 86400000)
      .map((c) => ({ c, k: clasificarPresion(c.sistolica, c.diastolica) }))
      .filter((x) => x.k.tono === "rojo" || x.k.tono === "critico")
      .map(({ c, k }) => ({ id: `pa-${c.id}`, titulo: k.tono === "critico" ? "¡Crisis hipertensiva!" : "Presión alta registrada", texto: `${nombreP(c.pacienteId)} · ${c.sistolica}/${c.diastolica} mmHg`, icon: HeartPulse, tono: "rojo" as Tono, tab: "pacientes" as Tab, fecha: c.fecha })),
    ...pacientes
      .filter((p) => p.ultimoIngreso && p.estado === "Activo" && ahora - new Date(p.ultimoIngreso).getTime() < 2 * 86400000 && ahora - new Date(p.fecha).getTime() < 14 * 86400000)
      .map((p) => ({ id: `ingreso-${p.id}`, titulo: "Paciente activó su portal", texto: p.nombre, icon: LogIn, tono: "verde" as Tono, tab: "pacientes" as Tab, fecha: p.ultimoIngreso! })),
    ...cobros
      .filter((c) => c.anulado && ahora - new Date(c.anulado.fecha).getTime() < 7 * 86400000)
      .map((c) => ({ id: `anul-${c.id}`, titulo: "Cobro anulado", texto: `${c.paciente} · ${dinero(pagadoDe(c))} · ${c.anulado!.motivo}`, icon: Ban, tono: "rojo" as Tono, tab: "finanzas" as Tab, fecha: c.anulado!.fecha })),
    ...cierres
      .filter((c) => c.declarado !== c.esperado && ahora - new Date(c.creado).getTime() < 7 * 86400000)
      .map((c) => ({ id: `caja-${c.id}`, titulo: "Diferencia de caja", texto: `${c.persona} · ${dinero(c.declarado - c.esperado)} el ${fechaCorta(c.fecha)}`, icon: Wallet, tono: "ambar" as Tono, tab: "finanzas" as Tab, fecha: c.creado })),
  ].sort((a, b) => b.fecha.localeCompare(a.fecha));

  const nuevas = items.filter((n) => !vistas.includes(n.id));
  const marcarTodas = () => setVistas((v) => Array.from(new Set([...v, ...items.map((n) => n.id)])).slice(-500));
  const abrir = (n: Notif) => {
    setVistas((v) => (v.includes(n.id) ? v : [...v, n.id].slice(-500)));
    setAbierta(false);
    irA(n.tab);
  };
  const TONO_N: Record<Tono, string> = {
    azul: "bg-sky-100 text-sky-700",
    ambar: "bg-amber-100 text-amber-700",
    verde: "bg-emerald-100 text-emerald-700",
    violeta: "bg-violet-100 text-violet-700",
    rojo: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos({ top: r.bottom + 10, right: Math.max(12, window.innerWidth - r.right) });
          setAbierta((v) => !v);
        }}
        aria-label="Notificaciones"
        className={`relative flex size-10 items-center justify-center rounded-xl ring-1 transition-all ${abierta ? "bg-white text-[var(--deep)] ring-white" : "bg-white/10 text-white ring-white/25 hover:bg-white/20"}`}
      >
        <Bell className={`size-5 ${nuevas.length ? "origin-top animate-[pn-wave_1.6s_ease-in-out_2]" : ""}`} />
        {nuevas.length > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-[var(--deep)]">
            {nuevas.length > 9 ? "9+" : nuevas.length}
          </span>
        )}
      </button>
      {abierta && createPortal(
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setAbierta(false)} />
          <div style={{ top: pos.top, right: pos.right }} className="fixed z-[100] w-[min(22rem,calc(100vw-24px))] overflow-hidden rounded-2xl border border-border bg-popover text-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="font-semibold">Notificaciones {nuevas.length > 0 && <span className="ml-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{nuevas.length}</span>}</p>
              {nuevas.length > 0 && <button onClick={marcarTodas} className="text-xs font-semibold text-primary hover:underline">Marcar todas como leídas</button>}
            </div>
            <div className="max-h-[26rem] overflow-y-auto pn-noscroll">
              {items.length === 0 && (
                <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-muted-foreground">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary"><Bell className="size-5" /></span>
                  No hay novedades por ahora.
                </div>
              )}
              {items.slice(0, 30).map((n) => {
                const nueva = !vistas.includes(n.id);
                return (
                  <button key={n.id} onClick={() => abrir(n)} className={`flex w-full gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-0 hover:bg-secondary/60 ${nueva ? "bg-sky-50/60" : ""}`}>
                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${TONO_N[n.tono]}`}><n.icon className="size-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-semibold">{n.titulo}{nueva && <span className="size-2 rounded-full bg-sky-500" />}</span>
                      <span className="block truncate text-xs text-muted-foreground">{limpiarTextoNota(n.texto)}</span>
                      <span className="block text-[10px] text-muted-foreground/70">{fechaHora(n.fecha.length > 16 ? n.fecha : n.fecha + ":00")}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>,
        document.body,
      )}
    </div>
  );
}

/* ---------- Fondo premium de cada módulo ---------- */
const FONDOS: Record<Tab, { a: string; b: string; c: string }> = {
  resumen: { a: "56,132,246", b: "99,102,241", c: "14,165,233" },
  turnos: { a: "14,165,233", b: "20,184,166", c: "59,130,246" },
  triage: { a: "5,150,105", b: "14,165,233", c: "16,185,129" },
  padron: { a: "37,99,235", b: "14,165,233", c: "99,102,241" },
  recetas: { a: "124,58,237", b: "99,102,241", c: "56,132,246" },
  laboratorio: { a: "5,150,105", b: "14,165,233", c: "20,184,166" },
  facturacion: { a: "13,148,136", b: "16,185,129", c: "14,165,233" },
  analitica: { a: "14,116,144", b: "11,42,107", c: "56,132,246" },
  automatizaciones: { a: "11,42,107", b: "14,116,144", c: "56,132,246" },
  historia: { a: "14,116,144", b: "11,42,107", c: "56,132,246" },
  horarios: { a: "13,148,136", b: "14,165,233", c: "16,185,129" },
  pacientes: { a: "29,78,216", b: "11,42,107", c: "14,116,144" },
  finanzas: { a: "16,185,129", b: "14,165,233", c: "20,184,166" },
  permisos: { a: "139,92,246", b: "79,70,229", c: "56,132,246" },
  asistente: { a: "99,102,241", b: "168,85,247", c: "14,165,233" },
  auditoria: { a: "30,58,138", b: "14,116,144", c: "100,116,139" },
  sitio: { a: "14,165,233", b: "56,132,246", c: "236,72,153" },
  comunicacion: { a: "14,165,233", b: "139,92,246", c: "16,185,129" },
  ministerio: { a: "245,158,11", b: "234,88,12", c: "59,130,246" },
};

function FondoModulo({ tab }: { tab: Tab }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden lg:left-[280px]">
      {(Object.keys(FONDOS) as Tab[]).map((k) => {
        const f = FONDOS[k];
        return (
          <div
            key={k}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${tab === k ? "opacity-100" : "opacity-0"}`}
            style={{
              background: [
                `radial-gradient(60% 50% at 0% 0%, rgba(${f.a},.16), transparent 70%)`,
                `radial-gradient(50% 45% at 100% 0%, rgba(${f.b},.14), transparent 70%)`,
                `radial-gradient(55% 55% at 100% 100%, rgba(${f.c},.12), transparent 70%)`,
                `radial-gradient(40% 40% at 0% 100%, rgba(${f.b},.08), transparent 70%)`,
              ].join(","),
            }}
          >
            <div className="pn-orb absolute -left-24 top-1/3 size-[420px] rounded-full blur-[110px]" style={{ background: `rgba(${f.a},.10)` }} />
            <div className="pn-orb absolute -right-24 top-10 size-[380px] rounded-full blur-[110px]" style={{ background: `rgba(${f.b},.10)`, animationDelay: "-6s" }} />
          </div>
        );
      })}
      {/* Trama médica sutil */}
      <div className="pn-cross-dark absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,#000_15%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(30,64,175,.07)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,transparent,#000_40%,transparent)]" />
      {/* Línea de pulso de fondo */}
      <Electro latidos={4} grilla={false} color="#7dd3fc" className="absolute inset-x-0 bottom-10 h-24 w-full" />
    </div>
  );
}

/* ---------- Datos del administrador ---------- */
function fotoDe(id: string): string | null {
  if (id === "alberto") return fotoAlberto;
  if (id === "alonso") return fotoAlonso;
  return null;
}
function nombreCorto(nombre: string) {
  return /[a-záéíóúñ]/.test(nombre.charAt(0)) || nombre === nombre.toUpperCase() ? nombrePropio(nombre).trim() : nombre;
}
function iniciales(nombre: string) {
  return nombre
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
function saludo(d: Date) {
  const h = d.getHours();
  if (h < 12) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}
const AVATAR_COLORES = [
  "from-[#0b2a6b] to-[#1e3a8a]",
  "from-[#0e7490] to-[#155e75]",
  "from-slate-600 to-slate-800",
  "from-[#1d4ed8] to-[#0b2a6b]",
  "from-[#0f766e] to-[#134e4a]",
];
function colorDe(texto: string) {
  let h = 0;
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORES[h % AVATAR_COLORES.length]!;
}

/* ---------- Componentes comunes ---------- */
function Avatar({ nombre, size = "size-10" }: { nombre: string; size?: string }) {
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colorDe(nombre)} text-xs font-bold text-white shadow-sm`}>
      {iniciales(nombre)}
    </span>
  );
}

function Seccion({
  icon: Icon,
  titulo,
  sub,
  acciones,
  children,
  delay = 0,
  className = "",
}: {
  icon: LucideIcon;
  titulo: string;
  sub?: string;
  acciones?: ReactNode;
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <section className={`pn-card pn-up p-5 sm:p-6 ${className}`} style={{ animationDelay: `${delay}s` }}>
      <div className="pn-sec-top relative -mx-5 -mt-5 mb-5 flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-t-[1.2rem] px-5 py-4 text-white sm:-mx-6 sm:-mt-6 sm:px-6 sm:py-5">
        <div className="pn-cross pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-white/15 blur-3xl" />
        <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-1 h-7 w-full opacity-30" aria-hidden="true"><polyline points="0,22 120,22 135,22 145,10 155,34 165,22 250,22 262,22 272,4 282,38 292,22 400,22" fill="none" stroke="white" strokeWidth="1.5" strokeLinejoin="round" /></svg>
        <div className="relative flex min-w-0 items-center gap-3.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur shadow-[inset_0_1px_0_rgba(255,255,255,.35)]">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold leading-tight tracking-tight text-white">{titulo}</h3>
            {sub && <p className="mt-0.5 text-xs leading-snug text-white/75">{sub}</p>}
          </div>
        </div>
        {acciones && <div className="pn-sec-acc relative flex flex-wrap items-center gap-2 rounded-2xl bg-white/95 p-1.5 text-foreground shadow-lg dark:bg-slate-900/85">{acciones}</div>}
      </div>
      {children}
    </section>
  );
}

const TONO_HEX: Record<Tono, string> = { azul: "#0ea5e9", ambar: "#f59e0b", verde: "#10b981", violeta: "#8b5cf6", rojo: "#f43f5e" };

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tono = "azul",
  delay = 0,
  onClick,
  activo = false,
  desglose,
  accion,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tono?: Tono;
  delay?: number;
  onClick?: () => void;
  activo?: boolean;
  desglose?: { l: string; v: number }[];
  accion?: string;
}) {
  const t = TONOS[tono];
  const Raiz = onClick ? "button" : "div";
  return (
    <Raiz
      {...(onClick ? { type: "button" as const, onClick, "aria-expanded": activo } : {})}
      className={`pn-kpi pn-lift pn-up group relative block w-full overflow-hidden rounded-[1.25rem] bg-gradient-to-br ${t.tile} p-5 text-left text-white shadow-[0_20px_40px_-18px_rgba(15,35,80,.55)] ring-1 ring-white/20 ${onClick ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" : ""} ${activo ? "ring-4 ring-white/60" : ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="pn-cross pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-white/20 blur-2xl transition-transform duration-700 group-hover:scale-150" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 size-40 rounded-full bg-black/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75">{label}</p>
          <p className="mt-2 truncate font-display text-[2.2rem] font-semibold leading-none tabular-nums drop-shadow-sm">{value}</p>
          {hint && <p className="mt-2 text-xs font-medium text-white/85">{hint}</p>}
        </div>
        <span className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white ring-1 ring-white/35 backdrop-blur shadow-[inset_0_1px_0_rgba(255,255,255,.4)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
          <Icon className="size-5" />
        </span>
      </div>
      <svg viewBox="0 0 300 36" preserveAspectRatio="none" className="relative mt-4 h-8 w-full opacity-80 transition-opacity group-hover:opacity-100" aria-hidden="true">
        <polyline points="0,20 60,20 75,20 85,8 95,30 105,20 170,20 180,20 190,3 200,34 210,20 300,20" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="2" strokeLinejoin="round" />
        <polyline
          className="pn-pulse"
          style={{ animationDelay: `${delay * 4}s`, filter: "drop-shadow(0 0 4px #fff)" }}
          points="0,20 60,20 75,20 85,8 95,30 105,20 170,20 180,20 190,3 200,34 210,20 300,20"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {desglose && (
        <div className="relative mt-3 grid grid-cols-3 gap-2 border-t border-white/20 pt-3">
          {desglose.map((d) => (
            <div key={d.l} className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-white/70">{d.l}</p>
              <p className="font-display text-lg font-semibold tabular-nums">{d.v}</p>
            </div>
          ))}
        </div>
      )}
      {onClick && (
        <p className="relative mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-white/25">
          {accion ?? (activo ? "Ocultar detalle" : "Ver detalle")} {accion ? <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" /> : <ChevronDown className={`size-3.5 transition-transform ${activo ? "rotate-180" : ""}`} />}
        </p>
      )}
    </Raiz>
  );
}

/** Hora en formato Colombia, siempre en un renglón: "8:15" grande y "a. m." pequeño. */
/** Listas largas: muestra unos pocos y una flecha "Ver más" (en vez de crecer hacia abajo sin fin). */
function useVerMas<T>(lista: T[], inicial = 5) {
  const [n, setN] = useState(inicial);
  const items = lista.slice(0, n);
  const resto = lista.length - items.length;
  const boton =
    lista.length > inicial ? (
      <div className="flex justify-center pt-3">
        <button
          type="button"
          onClick={() => (resto > 0 ? setN((x) => x + inicial * 2) : setN(inicial))}
          className="group inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-xs font-semibold text-[rgb(var(--acc))] shadow-sm ring-1 ring-border/70 transition hover:-translate-y-0.5 hover:shadow-md dark:ring-white/10"
        >
          {resto > 0 ? `Ver más (${resto})` : "Ver menos"}
          <span className="grid size-5 place-items-center rounded-full bg-[rgba(var(--acc),.12)]"><ChevronDown className={`size-3.5 transition-transform ${resto > 0 ? "group-hover:translate-y-0.5" : "rotate-180"}`} /></span>
        </button>
      </div>
    ) : null;
  return { items, boton };
}

/** Exámenes de sangre más pedidos (para sugerir mientras se escribe). */
const EXAMENES_SANGRE: { n: string; a?: string }[] = [
  { n: "Hemograma completo", a: "cuadro hematico ch" }, { n: "Hemoglobina", a: "hb" }, { n: "Hemoglobina glicosilada (HbA1c)", a: "hba1c a1c glicada" }, { n: "Hematocrito", a: "hto" },
  { n: "Plaquetas" }, { n: "Reticulocitos" }, { n: "Velocidad de sedimentación (VSG)", a: "vsg eritrosedimentacion" }, { n: "Grupo sanguíneo y Rh", a: "rh hemoclasificacion" },
  { n: "Glucosa en ayunas", a: "glicemia basal" }, { n: "Glucosa posprandial", a: "glicemia pospandrial" }, { n: "Curva de tolerancia a la glucosa", a: "ptog" }, { n: "Insulina" }, { n: "Péptido C" },
  { n: "Creatinina", a: "tfg filtrado" }, { n: "Nitrógeno ureico (BUN)", a: "bun" }, { n: "Urea" }, { n: "Ácido úrico" }, { n: "Cistatina C" },
  { n: "Ionograma", a: "electrolitos" }, { n: "Sodio", a: "na" }, { n: "Potasio", a: "k" }, { n: "Cloro", a: "cl" }, { n: "Calcio", a: "ca" }, { n: "Fósforo" }, { n: "Magnesio", a: "mg" },
  { n: "Perfil lipídico", a: "lipidos" }, { n: "Colesterol total" }, { n: "Colesterol HDL", a: "hdl" }, { n: "Colesterol LDL", a: "ldl" }, { n: "Triglicéridos", a: "tg" },
  { n: "Transaminasas (AST/TGO, ALT/TGP)", a: "tgo tgp ast alt" }, { n: "Bilirrubinas", a: "bilirrubina" }, { n: "Fosfatasa alcalina" }, { n: "Gamma GT (GGT)", a: "ggt" }, { n: "Albúmina" }, { n: "Proteínas totales" },
  { n: "Troponina", a: "tnt tni" }, { n: "CK-MB", a: "ckmb" }, { n: "CPK total", a: "ck" }, { n: "NT-proBNP", a: "bnp peptido natriuretico" }, { n: "Dímero D", a: "dimero" },
  { n: "Tiempo de protrombina (TP/INR)", a: "tp inr" }, { n: "Tiempo parcial de tromboplastina (TPT)", a: "tpt ptt" }, { n: "Fibrinógeno" },
  { n: "Proteína C reactiva (PCR)", a: "pcr" }, { n: "Procalcitonina" }, { n: "Ferritina" }, { n: "Hierro sérico", a: "fe" }, { n: "Transferrina" }, { n: "Vitamina B12", a: "b12" }, { n: "Ácido fólico", a: "folato" }, { n: "Vitamina D", a: "25 oh" },
  { n: "TSH", a: "tiroides" }, { n: "T4 libre", a: "t4" }, { n: "T3", a: "t3" }, { n: "Hormona paratiroidea (PTH)", a: "pth paratohormona" }, { n: "Cortisol" }, { n: "Prolactina" }, { n: "Antígeno prostático (PSA)", a: "psa" },
  { n: "Amilasa" }, { n: "Lipasa" }, { n: "Gases arteriales", a: "gasometria" }, { n: "Lactato" },
  { n: "VIH", a: "elisa hiv" }, { n: "Hepatitis B (HBsAg)", a: "hbsag" }, { n: "Hepatitis C", a: "vhc" }, { n: "VDRL", a: "sifilis serologia" }, { n: "Hemocultivo" },
];
const normEx = (x: string) => x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

/** Campo de exámenes: al escribir "h" sugiere Hemograma, Hemoglobina…; se pueden poner varios separados por coma. */
function ExamenesSangre({ valor, onChange }: { valor: string; onChange: (v: string) => void }) {
  const [foco, setFoco] = useState(false);
  const partes = valor.split(",");
  const actual = normEx(partes[partes.length - 1] ?? "");
  const elegidos = new Set(partes.slice(0, -1).map((x) => normEx(x)));
  const sugeridos = actual
    ? EXAMENES_SANGRE.filter((e) => !elegidos.has(normEx(e.n)) && (normEx(e.n).split(/[\s(/-]+/).some((w) => w.startsWith(actual)) || normEx(e.n).startsWith(actual) || (e.a ?? "").split(" ").some((w) => w.startsWith(actual))))
        .sort((x, y) => Number(!normEx(x.n).startsWith(actual)) - Number(!normEx(y.n).startsWith(actual)))
        .slice(0, 8)
    : [];
  const elegir = (n: string) => {
    const previos = partes.slice(0, -1).map((x) => x.trim()).filter(Boolean);
    onChange([...previos, n].join(", ") + ", ");
  };
  const quitar = (n: string) => onChange(partes.map((x) => x.trim()).filter((x) => x && normEx(x) !== normEx(n)).join(", "));
  const lista = partes.slice(0, -1).map((x) => x.trim()).filter(Boolean);
  return (
    <div className="relative">
      {lista.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {lista.map((x) => (
            <span key={x} className="inline-flex items-center gap-1 rounded-full bg-rose-50 py-1 pl-2.5 pr-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300">
              <Droplets className="size-3" /> {x}
              <button type="button" onClick={() => quitar(x)} aria-label={`Quitar ${x}`} className="grid size-4 place-items-center rounded-full hover:bg-rose-200/60"><X className="size-3" /></button>
            </span>
          ))}
        </div>
      )}
      <input
        value={partes[partes.length - 1]?.trimStart() ?? ""}
        onChange={(e) => onChange([...partes.slice(0, -1).map((x) => x.trim()), e.target.value].filter((x, i, arr) => x || i === arr.length - 1).join(", "))}
        onFocus={() => setFoco(true)}
        onBlur={() => setTimeout(() => setFoco(false), 150)}
        onKeyDown={(e) => { if ((e.key === "Enter" || e.key === "Tab") && sugeridos[0] && actual) { e.preventDefault(); elegir(sugeridos[0].n); } }}
        placeholder={lista.length ? "Agregar otro examen…" : "Escriba la primera letra: h → Hemograma, c → Creatinina…"}
        className={inp}
        autoComplete="off"
      />
      {foco && sugeridos.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-2xl border border-border bg-card p-1.5 shadow-2xl dark:border-white/10">
          {sugeridos.map((e) => (
            <li key={e.n}>
              <button type="button" onMouseDown={(ev) => { ev.preventDefault(); elegir(e.n); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm hover:bg-secondary">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-rose-500 to-red-600 text-white"><Droplets className="size-3.5" /></span>
                <span className="font-medium">{e.n}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {!actual && lista.length === 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["Hemograma completo", "Creatinina", "Glucosa en ayunas", "Perfil lipídico", "Ionograma", "Hemoglobina glicosilada (HbA1c)", "TSH"].map((n) => (
            <button key={n} type="button" onClick={() => elegir(n)} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition hover:bg-rose-50 hover:text-rose-700">+ {n}</button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Arregla textos viejos: "a. m.." → "a. m.", "hemograma , a las" → "hemograma, a las". */
const limpiarTextoNota = (t: string) => t.replace(/([ap]\. m\.)\.(?=\s|$)/g, "$1").replace(/\s+,/g, ",");

/** Hora de una fecha ISO en formato Colombia: "11:43 a. m." */
function horaDeIso(iso: string) {
  const d = new Date(iso);
  return hora12(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
}

/** Hora compacta para listas: "8:15" grande y "a. m." chiquito debajo, en una cajita. */
function HoraMini({ hora, activo = false }: { hora: string; activo?: boolean }) {
  const [num, ...suf] = hora12(hora).split(" ");
  return (
    <span className={`flex w-[3.4rem] shrink-0 flex-col items-center rounded-xl py-1.5 transition ${activo ? "bg-gradient-to-br from-[#0b2a6b] to-[#1d4ed8] text-white shadow-md" : "bg-[rgba(var(--acc),.08)] text-[rgb(var(--acc))] ring-1 ring-[rgba(var(--acc),.15)]"}`}>
      <span className="font-display text-[15px] font-semibold leading-none tabular-nums">{num}</span>
      <span className={`mt-0.5 text-[9px] font-semibold uppercase tracking-wide ${activo ? "text-white/70" : "opacity-70"}`}>{suf.join(" ")}</span>
    </span>
  );
}

function HoraChip({ hora, className = "" }: { hora: string; className?: string }) {
  const [num, ...suf] = hora12(hora).split(" ");
  return (
    <span className={`inline-flex w-[4.6rem] shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b2a6b] to-[#1d4ed8] px-2 py-2 text-white shadow-[0_10px_20px_-10px_rgba(29,78,216,.9)] ring-1 ring-white/10 ${className}`}>
      <span className="font-display text-lg font-semibold leading-none tabular-nums">{num}</span>
      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">{suf.join(" ")}</span>
    </span>
  );
}

/** Selector de día elegante: ‹ fecha › con calendario al tocar la fecha. */
function DiaNav({ dia, setDia }: { dia: string; setDia: (d: string) => void }) {
  const mover = (n: number) => {
    const d = new Date(dia + "T12:00:00");
    d.setDate(d.getDate() + n);
    setDia(fechaISO(d));
  };
  return (
    <div className="flex items-center rounded-xl">
      <button type="button" onClick={() => mover(-1)} aria-label="Día anterior" className="grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"><ChevronLeft className="size-4" /></button>
      <label className="relative flex h-9 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-sm font-semibold transition hover:bg-secondary">
        <CalendarDays className="size-4 text-[rgb(var(--acc))]" />
        <span className="whitespace-nowrap first-letter:uppercase">{new Date(dia + "T12:00:00").toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "")}</span>
        <input type="date" value={dia} onChange={(e) => e.target.value && setDia(e.target.value)} aria-label="Elegir fecha" className="absolute inset-0 cursor-pointer opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
      </label>
      <button type="button" onClick={() => mover(1)} aria-label="Día siguiente" className="grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"><ChevronDown className="size-4 -rotate-90" /></button>
      {dia !== hoy() && <button type="button" onClick={() => setDia(hoy())} className="ml-1 rounded-lg bg-[rgba(var(--acc),.12)] px-2.5 py-1.5 text-xs font-semibold text-[rgb(var(--acc))] hover:bg-[rgba(var(--acc),.2)]">Hoy</button>}
    </div>
  );
}

/** Botones tipo pastilla para filtrar (reemplaza las listas desplegables). */
function Pastillas<T extends string>({ valor, opciones, onChange }: { valor: T; opciones: { v: T; l: string; n?: number }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {opciones.map((o) => {
        const on = o.v === valor;
        return (
          <button key={o.v} type="button" onClick={() => onChange(o.v)} className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all ${on ? "pn-acc-tile text-white shadow-md" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
            {o.l}
            {o.n !== undefined && <span className={`rounded-full px-1.5 text-[10px] ${on ? "bg-white/25" : "bg-secondary"}`}>{o.n}</span>}
          </button>
        );
      })}
    </div>
  );
}

function Estadito({ estado }: { estado: Estado }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${ESTADO_CLASE[estado]}`}>
      <span className={`size-1.5 rounded-full ${ESTADO_DOT[estado]}`} />
      {estado}
    </span>
  );
}

function Campo({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-xs font-semibold text-foreground/70">{label}</span>
      {children}
    </label>
  );
}

function Vacio({ icon: Icon, texto, titulo, accion }: { icon: LucideIcon; texto: string; titulo?: string; accion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="relative mb-5 flex size-24 items-center justify-center">
        <span className="pn-ripple absolute inset-0 rounded-full" style={{ background: "rgba(var(--acc),.14)" }} />
        <span className="absolute inset-3 rounded-full" style={{ background: "rgba(var(--acc),.10)" }} />
        <span className="pn-acc-tile relative flex size-14 items-center justify-center rounded-2xl text-white"><Icon className="size-6" /></span>
      </div>
      {titulo && <p className="font-semibold">{titulo}</p>}
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">{texto}</p>
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  );
}

function iconoEvento(accion: string): { icon: LucideIcon; clase: string } {
  const a = norm(accion);
  if (a.includes("inicio")) return { icon: LogIn, clase: "bg-emerald-100 text-emerald-700" };
  if (a.includes("cierre")) return { icon: LogOut, clase: "bg-slate-100 text-slate-600" };
  if (a.includes("fallido")) return { icon: Lock, clase: "bg-red-100 text-red-700" };
  if (a.includes("turno")) return { icon: CalendarCheck, clase: "bg-sky-100 text-sky-700" };
  if (a.includes("ingreso") || a.includes("egreso") || a.includes("movimiento")) return { icon: Wallet, clase: "bg-amber-100 text-amber-700" };
  if (a.includes("permiso") || a.includes("contrasena")) return { icon: KeyRound, clase: "bg-violet-100 text-violet-700" };
  if (a.includes("asistente")) return { icon: Bot, clase: "bg-indigo-100 text-indigo-700" };
  return { icon: ClipboardList, clase: "bg-secondary text-primary" };
}

/* ---------- Resumen ---------- */
/** Turnos que son estudios o procedimientos (no consultas). */
const esProcedimiento = (motivo: string) => /eco|electro|holter|mapa|ergom|doppler|ecograf|estudio|procedim|monitoreo|biopsia|punci|infiltra/i.test(motivo);

/** Tarjeta del resumen: se toca entera (o el ícono) y abre la agenda de hoy. */
function TarjetaDia({ icon: Icon, label, valor, detalle, onClick, delay = 0 }: { icon: LucideIcon; label: string; valor: number; detalle: string; onClick: () => void; delay?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${delay}s` }}
      className="pn-up group relative w-full overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 p-5 text-left text-white shadow-[0_24px_50px_-24px_rgba(162,28,175,.75)] ring-1 ring-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-24px_rgba(162,28,175,.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <span className="pn-cross pointer-events-none absolute inset-0 opacity-70" />
      <span className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-white/25 blur-2xl transition-transform duration-500 group-hover:scale-125" />
      <svg viewBox="0 0 300 36" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-2 h-8 w-full opacity-30" aria-hidden="true"><polyline points="0,20 60,20 75,20 85,8 95,30 105,20 170,20 180,20 190,3 200,34 210,20 300,20" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" /></svg>
      <div className="relative flex items-start justify-between gap-3">
        <p className="pt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">{label}</p>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white ring-1 ring-white/35 backdrop-blur transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
          <Icon className="size-5" />
        </span>
      </div>
      <p className="relative mt-1 font-display text-5xl font-bold tabular-nums drop-shadow-sm">{valor}</p>
      <div className="relative mt-2 flex items-center justify-between gap-2">
        <p className="text-sm text-white/85">{detalle}</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold ring-1 ring-white/30 transition-transform duration-300 group-hover:translate-x-0.5">
          Ver agenda <ArrowRight className="size-3.5" />
        </span>
      </div>
    </button>
  );
}

const plural = (n: number, palabra: string) => `${n} ${palabra}${n === 1 ? "" : "s"}`;

type FocoTurnos = "agenda" | "procedimientos" | null;


/** "Mañana": qué tiene cada médico al día siguiente, separado por especialidad y estudios, con recordatorio por WhatsApp. */
function ManianaCard({ turnos, abrirTurnos }: { turnos: Turno[]; abrirTurnos: () => void }) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const f = isoDe(d);
  const lista = turnos.filter((t) => t.fecha === f && t.estado !== "Cancelado").sort((a, b) => a.hora.localeCompare(b.hora));
  const servicio = (t: Turno) => (t.motivo || "Consulta").split(" · ")[0]!.trim() || "Consulta";
  const grupos = new Map<string, Turno[]>();
  for (const t of lista) grupos.set(servicio(t), [...(grupos.get(servicio(t)) ?? []), t]);
  const estudios = lista.filter((t) => esProcedimiento(t.motivo));
  const diaTxt = d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  return (
    <section className="pn-card pn-up overflow-hidden" style={{ animationDelay: ".12s" }}>
      <div className="relative flex flex-wrap items-center gap-3 overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-5 text-white">
        <div className="pn-cross pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute -right-10 -top-14 size-44 rounded-full bg-white/20 blur-3xl" />
        <span className="relative flex size-11 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/35 backdrop-blur"><CalendarDays className="size-5" /></span>
        <div className="relative min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">Para preparar</p>
          <p className="font-display text-lg font-semibold">Mañana, {diaTxt}</p>
        </div>
        <button onClick={abrirTurnos} className="relative rounded-full bg-white px-4 py-2 text-xs font-semibold text-orange-700 shadow-md hover:bg-white/90">Ver agenda</button>
      </div>
      {lista.length === 0 ? (
        <p className="p-5 text-sm text-muted-foreground">Mañana no hay citas agendadas.</p>
      ) : (
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap gap-2">
            {[...grupos.entries()].map(([k, ts]) => (
              <span key={k} className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${esProcedimiento(k) ? "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300" : "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300"}`}>
                {ts.length} · {k}
              </span>
            ))}
          </div>
          {estudios.length > 0 && (
            <div className="rounded-2xl bg-violet-50/70 p-3 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:ring-violet-500/20">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-violet-700 dark:text-violet-300">Estudios de mañana · recuérdeles</p>
              <ul className="space-y-1.5">
                {estudios.map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-card px-3 py-2 text-sm ring-1 ring-border">
                    <span className="w-20 shrink-0 font-semibold tabular-nums">{hora12(t.hora)}</span>
                    <span className="min-w-0 flex-1"><b>{t.paciente}</b> · {servicio(t)} <span className="text-muted-foreground">· {nombreCorto(t.doctor)}</span>{t.recordado1 && t.recordado1Canal !== "sin envío" && <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300">✓ Recordado por {t.recordado1Canal}</span>}</span>
                    {t.telefono && (
                      <a href={waDe(t.telefono, `Hola ${t.paciente.split(" ")[0]}, le escribimos del Centro HEGO para recordarle su ${servicio(t)} mañana ${diaTxt} a las ${hora12(t.hora)} con ${t.doctor}.\n\n${indicacionesTexto(t.motivo)}\n\nAnte cualquier duda, escríbanos.`)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-600"><Send className="size-3" /> Recordar</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Resumen({ turnos, movs, audit, irA, abrirTurnos }: { turnos: Turno[]; movs: Mov[]; audit: Evento[]; irA: (t: Tab) => void; abrirTurnos: (f: FocoTurnos) => void }) {
  const h = hoy();
  const deHoy = turnos.filter((t) => t.fecha === h);
  const procHoy = deHoy.filter((t) => t.estado !== "Cancelado" && esProcedimiento(t.motivo));
  const turnosHoy = deHoy.filter((t) => t.estado !== "Cancelado").length;
  const pendientes = turnos.filter((t) => t.estado === "Pendiente").length;
  const ingresos = movs.filter((m) => m.tipo === "Ingreso").reduce((a, m) => a + m.monto, 0);
  const egresos = movs.filter((m) => m.tipo === "Egreso").reduce((a, m) => a + m.monto, 0);
  const balance = ingresos - egresos;
  const eventosHoy = audit.filter((e) => new Date(e.fecha).toDateString() === new Date().toDateString()).length;
  const proximos = [...turnos]
    .filter((t) => t.estado === "Pendiente" || t.estado === "Confirmado")
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
    .slice(0, 5);
  const conteo = ESTADOS.map((e) => ({ e, n: turnos.filter((t) => t.estado === e).length }));
  const totalT = Math.max(1, turnos.length);
  const insights = generarInsights(turnos, movs);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:max-w-3xl">
        <TarjetaDia
          icon={Clock}
          label="Agenda del día"
          valor={turnosHoy}
          detalle={`${plural(deHoy.filter((t) => t.estado === "Confirmado").length, "confirmada")} · ${plural(deHoy.filter((t) => t.estado === "Pendiente").length, "pendiente")}`}
          onClick={() => abrirTurnos("agenda")}
        />
        <TarjetaDia
          icon={Stethoscope}
          label="Procedimientos del día"
          valor={procHoy.length}
          detalle={`${plural(procHoy.filter((t) => t.estado === "Atendido").length, "realizado")} · ${procHoy.filter((t) => t.estado === "Pendiente" || t.estado === "Confirmado").length} por hacer`}
          onClick={() => abrirTurnos("procedimientos")}
          delay={0.06}
        />
      </div>

      <ManianaCard turnos={turnos} abrirTurnos={() => abrirTurnos("agenda")} />

      {/* Tarjeta de inteligencia */}
      <div className="pn-up pn-sheen relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-indigo-600 via-blue-700 to-sky-600 p-6 text-white shadow-elevated" style={{ animationDelay: ".22s" }}>
        <div className="pn-orb pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
              <Bot className="size-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Asistente IA · análisis del día</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {insights.map((i) => (
                  <li key={i} className="flex gap-2"><Bot className="mt-0.5 size-3.5 shrink-0 text-sky-200" /> {i}</li>
                ))}
              </ul>
            </div>
          </div>
          <Button onClick={() => irA("asistente")} className="rounded-xl !bg-white text-[#4338ca] hover:!bg-white/90">
            Hacer una consulta
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Seccion icon={CalendarCheck} titulo="Próximas citas" sub="Pendientes y confirmadas" delay={0.25} className="xl:col-span-3"
          acciones={<Button size="sm" variant="ghost" className="rounded-lg text-primary" onClick={() => irA("turnos")}>Ver agenda <ArrowUpRight className="size-4" /></Button>}>
          {proximos.length === 0 && <Vacio icon={CalendarDays} titulo="Agenda libre" texto="Todavía no hay citas. Las que se reserven desde la web o se creen aquí van a aparecer en esta lista." accion={<Button onClick={() => irA("turnos")} className="rounded-xl"><Plus className="size-4" /> Crear cita</Button>} />}
          <div className="space-y-5">
            {[...new Set(proximos.map((t) => t.fecha))].map((f) => {
              const delDia = proximos.filter((t) => t.fecha === f);
              const dif = Math.round((new Date(f + "T12:00:00").getTime() - new Date(hoy() + "T12:00:00").getTime()) / 86400000);
              const titulo = dif === 0 ? "Hoy" : dif === 1 ? "Mañana" : new Date(f + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
              return (
                <div key={f}>
                  <div className="mb-2.5 flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${dif === 0 ? "bg-emerald-500 text-white shadow-[0_6px_14px_-6px_rgba(16,185,129,.9)]" : "bg-[#0b2a6b] text-white"}`}>
                      {dif === 0 && <span className="size-1.5 animate-pulse rounded-full bg-white" />}<span className="first-letter:uppercase">{titulo}</span>
                    </span>
                    <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent dark:from-white/15" />
                    <span className="text-[11px] font-semibold text-muted-foreground">{delDia.length} {delDia.length === 1 ? "cita" : "citas"}</span>
                  </div>
                  <div className="space-y-2.5">
                    {delDia.map((t) => {
                      const [num, ...suf] = hora12(t.hora).split(" ");
                      const [servicio, ...resto] = (t.motivo || "Consulta").split(" · ");
                      const foto = fotoDe(ADMINS.find((a) => a.nombre === t.doctor)?.id ?? "");
                      return (
                        <div key={t.id} className="group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-r from-white to-slate-50/70 p-3 pr-4 shadow-[0_2px_6px_rgba(15,23,42,.04),0_12px_24px_-16px_rgba(15,35,80,.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-18px_rgba(15,35,80,.45)] dark:border-white/10 dark:from-white/[0.04] dark:to-white/[0.02]">
                          <span className={`absolute inset-y-0 left-0 w-1.5 ${ESTADO_DOT[t.estado]}`} />
                          <div className="ml-1 flex w-[4.6rem] shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b2a6b] to-[#1d4ed8] py-2.5 text-white shadow-[0_10px_20px_-10px_rgba(29,78,216,.9)]">
                            <span className="font-display text-xl font-semibold leading-none tabular-nums">{num}</span>
                            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/70">{suf.join(" ")}</span>
                          </div>
                          <Avatar nombre={t.paciente} size="size-11" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[15px] font-semibold">{nombreCorto(t.paciente)}</p>
                            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
                              <span className="rounded-md bg-[rgba(var(--acc),.12)] px-2 py-0.5 text-[11px] font-semibold text-[rgb(var(--acc))]">{servicio}</span>
                              {resto.length > 0 && <span className="truncate text-xs text-muted-foreground">{resto.join(" · ")}</span>}
                            </div>
                            <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] text-muted-foreground">
                              {foto ? <img src={foto} alt="" className="size-4 rounded-full object-cover object-top" /> : <Stethoscope className="size-3" />} {nombreCorto(t.doctor)}
                            </p>
                          </div>
                          <Estadito estado={t.estado} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Seccion>

        <div className="min-w-0 space-y-6 xl:col-span-2">
          <Seccion icon={Activity} titulo="Estado de la agenda" sub={`${turnos.length} citas en total`} delay={0.3}>
            <div className="mb-5 flex items-center gap-5">
              <div
                className="relative size-24 shrink-0 rounded-full"
                style={{
                  background: turnos.length
                    ? `conic-gradient(${(() => {
                        const col: Record<Estado, string> = { Pendiente: "#f59e0b", Confirmado: "#0ea5e9", Atendido: "#10b981", Cancelado: "#ef4444" };
                        let acc = 0;
                        return conteo
                          .map(({ e, n }) => {
                            const a = acc;
                            acc += (n / totalT) * 100;
                            return `${col[e]} ${a}% ${acc}%`;
                          })
                          .join(",");
                      })()})`
                    : "conic-gradient(#e2e8f0 0 100%)",
                }}
              >
                <div className="absolute inset-[10px] flex flex-col items-center justify-center rounded-full bg-card shadow-inner">
                  <span className="font-display text-2xl font-semibold leading-none">{turnos.length}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">citas</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {turnos.length
                  ? `${Math.round((conteo.find((c) => c.e === "Confirmado")!.n / totalT) * 100)}% de la agenda está confirmada.`
                  : "Cuando haya citas verá aquí cómo se reparten por estado."}
              </p>
            </div>
            <div className="space-y-3">
              {conteo.map(({ e, n }) => (
                <div key={e}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium"><span className={`size-2 rounded-full ${ESTADO_DOT[e]}`} />{e}</span>
                    <span className="tabular-nums text-muted-foreground">{n}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className={`pn-bar h-full rounded-full ${ESTADO_DOT[e]}`} style={{ width: `${(n / totalT) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Seccion>

          <Seccion icon={ClipboardList} titulo="Actividad reciente" delay={0.35}
            acciones={<Button size="sm" variant="ghost" className="rounded-lg text-primary" onClick={() => irA("auditoria")}>Ver todo</Button>}>
            {audit.length === 0 && <Vacio icon={ClipboardList} titulo="Sin actividad" texto="Aquí va a ver cada acción del panel." />}
            <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-border">
              {audit.slice(0, 5).map((e) => {
                const { icon: I, clase } = iconoEvento(e.accion);
                return (
                  <li key={e.id} className="relative flex gap-3">
                    <span className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-card ${clase}`}><I className="size-3.5" /></span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{e.accion}</p>
                      <p className="truncate text-xs text-muted-foreground">{nombreCorto(e.usuario)} · {fechaHora(e.fecha)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Seccion>
        </div>
      </div>
    </div>
  );
}

/* ---------- Turnos ---------- */
/* ---------- Agenda del día (grilla por doctor) ---------- */
function waDe(tel: string, texto: string) {
  let n = tel.replace(/\D/g, "");
  if (n.length === 10 && n.startsWith("3")) n = "57" + n;
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}

function AgendaDia({ turnos, setTurnos, log, onCargaManual, irHorarios }: { turnos: Turno[]; setTurnos: Dispatch<SetStateAction<Turno[]>>; log: LogFn; onCargaManual: () => void; irHorarios?: ((id: string) => void) | undefined }) {
  const yo = sesionActual();
  const [agendas] = useDato<Agendas>(KEY_AGENDA, {});
  const [dia, setDia] = useState(hoy());
  const [asignando, setAsignando] = useState<string | null>(null); // "doctor|hora"
  const [rapido, setRapido] = useState({ paciente: "", dni: "", telefono: "", motivo: "Consulta" });
  const conocidos = usePacientesClinica(turnos);
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const mover = (n: number) => {
    const d = new Date(dia + "T12:00:00");
    d.setDate(d.getDate() + n);
    setDia(isoDe(d));
    setAsignando(null);
  };
  const esHoy = dia === hoy();
  const hhmm = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
  const delDia = turnos.filter((t) => t.fecha === dia && t.estado !== "Cancelado");
  const semana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(dia + "T12:00:00");
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + i);
    return isoDe(d);
  });

  const columnas = profesionalesAgenda(agendas).filter((p) => p.admin || bloquesDe(agendaDe(agendas, p.id)).length > 0).map((a) => {
    const ag = agendaDe(agendas, a.id);
    const atiende = atiendeEl(ag, dia);
    const bloqueo = ag.bloqueos.find((b) => dia >= b.desde && dia <= b.hasta);
    const slots = atiende ? horariosDelDia(ag, dia) : [];
    const suyos = delDia.filter((t) => t.doctor === a.nombre);
    const fuera = suyos.filter((t) => !slots.includes(t.hora)).sort((x, y) => x.hora.localeCompare(y.hora));
    // el horario "actual": el último que ya empezó
    const actual = esHoy ? [...slots].reverse().find((h) => h <= hhmm) : undefined;
    return { a, ag, atiende, bloqueo, slots, suyos, fuera, actual };
  });

  const totalSlots = columnas.reduce((acc, c) => acc + c.slots.length, 0);
  const ocupados = delDia.length;
  const confirmados = delDia.filter((t) => t.estado === "Confirmado").length;
  const pendientes = delDia.filter((t) => t.estado === "Pendiente").length;
  const atendidos = delDia.filter((t) => t.estado === "Atendido").length;

  const cambiar = (t: Turno, estado: Estado) => {
    setTurnos((p) => p.map((x) => (x.id === t.id ? { ...x, estado } : x)));
    log("Cita actualizada", `${t.paciente}: ${t.estado} → ${estado}`);
    toast.success(`${t.paciente}: ${estado.toLowerCase()}.`);
  };

  const asignar = (doctor: string, hora: string) => {
    if (rapido.paciente.trim().length < 3) {
      toast.error("Escriba el nombre y apellido del paciente.");
      return;
    }
    if (limpiarDoc(rapido.dni).length < 5) {
      toast.error("La cédula es obligatoria.");
      return;
    }
    const nuevo: Turno = {
      id: uid(),
      fecha: dia,
      hora,
      paciente: nombrePropio(rapido.paciente).trim(),
      dni: limpiarDoc(rapido.dni),
      doctor,
      motivo: rapido.motivo.trim() || "Consulta",
      estado: "Confirmado",
      origen: "panel",
      ...(rapido.telefono.trim() ? { telefono: rapido.telefono.trim() } : {}),
    };
    setTurnos((p) => [...p, nuevo]);
    log("Cita creada", `${nuevo.paciente} · ${fechaCorta(dia)} ${hora12(hora)} · ${doctor}`);
    toast.success("Cita asignada.");
    setAsignando(null);
    setRapido({ paciente: "", dni: "", telefono: "", motivo: "Consulta" });
  };

  const FilaPaciente = ({ t, ahoraEs }: { t: Turno; ahoraEs: boolean }) => (
    <div className={`group relative flex items-center gap-3 rounded-2xl border p-3 transition-all ${ahoraEs ? "border-transparent bg-[rgba(var(--acc),.08)] ring-2 ring-[rgba(var(--acc),.5)]" : t.estado === "Atendido" ? "border-border/60 bg-secondary/30" : "border-border bg-card hover:shadow-md"}`}>
      <span className={`absolute inset-y-3 left-0 w-1 rounded-r-full ${ESTADO_DOT[t.estado]}`} />
      <Avatar nombre={t.paciente} size="size-10" />
      <div className="min-w-0 flex-1">
        <p className={`flex flex-wrap items-center gap-1.5 text-sm font-semibold ${t.estado === "Atendido" ? "text-muted-foreground" : ""}`}>
          <span className="truncate">{t.paciente}</span>
          {t.origen === "web" && <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-700">Web</span>}
          {t.origen === "portal" && <span className="rounded-full bg-pink-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-pink-700">Portal</span>}
        </p>
        <p className="truncate text-xs text-muted-foreground">{t.motivo}{t.telefono ? ` · ${t.telefono}` : ""}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {t.estado === "Pendiente" && (
          <button onClick={() => cambiar(t, "Confirmado")} className="rounded-lg bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-100">Confirmar</button>
        )}
        {(t.estado === "Pendiente" || t.estado === "Confirmado") && (
          <button onClick={() => cambiar(t, "Atendido")} className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100">Atendido</button>
        )}
        {t.estado === "Atendido" && <span className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-emerald-700"><Check className="size-3" /> Atendido</span>}
        {t.telefono && (
          <a href={waDe(t.telefono, `Hola ${t.paciente.split(" ")[0]}, le escribimos del Centro HEGO por su cita del ${fechaCorta(t.fecha)} a las ${hora12(t.hora)}.`)} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="rounded-lg p-1.5 text-emerald-600 opacity-60 transition-opacity hover:bg-emerald-50 group-hover:opacity-100">
            <Send className="size-3.5" />
          </a>
        )}
        {t.estado !== "Atendido" && (
          <button onClick={() => cambiar(t, "Cancelado")} aria-label="Cancelar cita" className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100">
            <Ban className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <section className="pn-card pn-up overflow-hidden">
      {/* Encabezado con navegación de días */}
      <div className="relative overflow-hidden border-b border-border/60 p-5 pb-5 sm:p-6">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[rgba(var(--acc),.08)] blur-3xl" />
        <div className="pn-sec-top relative -mx-5 -mt-5 flex flex-wrap items-center justify-between gap-4 overflow-hidden px-5 py-5 text-white sm:-mx-6 sm:-mt-6 sm:px-6">
          <div className="pn-cross pointer-events-none absolute inset-0 opacity-70" />
          <div className="relative flex items-center gap-3.5">
            <span className="relative flex size-12 ring-2 ring-white/30 pn-acc-tile flex-col items-center justify-center rounded-2xl text-white shadow-lg">
              <span className="text-[9px] font-bold uppercase leading-none tracking-wider text-white/80">{new Date(dia + "T12:00:00").toLocaleDateString("es-CO", { month: "short" }).replace(".", "")}</span>
              <span className="font-display text-xl font-semibold leading-none">{new Date(dia + "T12:00:00").getDate()}</span>
            </span>
            <div>
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight">Agenda del día {esHoy && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-emerald-200 ring-1 ring-emerald-300/40"><span className="size-1.5 animate-pulse rounded-full bg-emerald-500" /> Hoy</span>}</h3>
              <p className="text-sm text-white/75 first-letter:uppercase">{new Date(dia + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </div>
          <div className="relative flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-2xl bg-white/10 p-1 ring-1 ring-white/20 backdrop-blur">
              <button onClick={() => mover(-1)} aria-label="Día anterior" className="grid size-9 place-items-center rounded-xl text-white/75 transition hover:bg-white/15 hover:text-white"><ChevronLeft className="size-4" /></button>
              <label className="relative flex h-9 cursor-pointer items-center gap-2 rounded-xl px-3 text-sm font-semibold transition hover:bg-white/15">
                <CalendarDays className="size-4 text-sky-300" />
                <span className="tabular-nums">{new Date(dia + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }).replace(".", "")}</span>
                <input type="date" value={dia} onChange={(e) => e.target.value && setDia(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" aria-label="Elegir fecha" />
              </label>
              <button onClick={() => mover(1)} aria-label="Día siguiente" className="grid size-9 place-items-center rounded-xl text-white/75 transition hover:bg-white/15 hover:text-white"><ChevronDown className="size-4 -rotate-90" /></button>
            </div>
            {!esHoy && <Button variant="outline" className="h-11 rounded-2xl !border-white/30 !bg-white/10 text-white hover:!bg-white/20 hover:text-white" onClick={() => setDia(hoy())}>Ir a hoy</Button>}
            <Button onClick={onCargaManual} className="h-11 rounded-2xl !bg-white px-5 text-[var(--deep)] shadow-lg hover:!bg-white/90"><Plus className="size-4" /> Cargar cita</Button>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
          {semana.map((d) => {
            const f = new Date(d + "T12:00:00");
            const n = turnos.filter((t) => t.fecha === d && t.estado !== "Cancelado").length;
            const on = d === dia;
            const esHoyD = d === hoy();
            const trabaja = columnas.some((c) => atiendeEl(c.ag, d));
            return (
              <button
                key={d}
                onClick={() => { setDia(d); setAsignando(null); }}
                className={`group relative flex flex-col items-center rounded-2xl px-1 pb-2 pt-2.5 transition-all duration-200 ${
                  on ? "pn-acc-tile -translate-y-0.5 text-white shadow-lg" : `ring-1 ring-transparent hover:-translate-y-0.5 hover:bg-card hover:shadow-md hover:ring-border/70 dark:hover:ring-white/10 ${trabaja ? "" : "opacity-50"}`
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${on ? "text-white/80" : esHoyD ? "text-[rgb(var(--acc))]" : "text-muted-foreground"}`}>{f.toLocaleDateString("es-CO", { weekday: "short" }).replace(".", "")}</span>
                <span className="font-display text-xl font-semibold leading-tight tabular-nums sm:text-2xl">{f.getDate()}</span>
                <span className="mt-1 flex h-4 items-center">
                  {n ? (
                    <span className={`rounded-full px-1.5 text-[10px] font-bold leading-4 ${on ? "bg-white/25 text-white" : "bg-[rgba(var(--acc),.14)] text-[rgb(var(--acc))]"}`}>{n} {n === 1 ? "cita" : "citas"}</span>
                  ) : (
                    <span className={`text-[9px] font-medium ${on ? "text-white/70" : "text-muted-foreground/70"}`}>{trabaja ? "Libre" : "—"}</span>
                  )}
                </span>
                {esHoyD && !on && <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[rgb(var(--acc))]" />}
              </button>
            );
          })}
        </div>

        {(() => {
          const libres = Math.max(0, totalSlots - columnas.reduce((acc, c) => acc + c.suyos.filter((t) => c.slots.includes(t.hora)).length, 0));
          const pct = totalSlots ? Math.round(((totalSlots - libres) / totalSlots) * 100) : 0;
          const tiles = [
            { l: "Citas", v: ocupados, icon: CalendarDays, tono: "from-slate-500/15 to-slate-500/5 text-slate-700 dark:text-slate-200", ic: "bg-slate-500/15 text-slate-600 dark:text-slate-300" },
            { l: "Confirmadas", v: confirmados, icon: CalendarCheck, tono: "from-sky-500/15 to-sky-500/5 text-sky-800 dark:text-sky-200", ic: "bg-sky-500/15 text-sky-600 dark:text-sky-300" },
            { l: "Pendientes", v: pendientes, icon: Clock, tono: "from-amber-500/15 to-amber-500/5 text-amber-800 dark:text-amber-200", ic: "bg-amber-500/15 text-amber-600 dark:text-amber-300" },
            { l: "Atendidas", v: atendidos, icon: Check, tono: "from-emerald-500/15 to-emerald-500/5 text-emerald-800 dark:text-emerald-200", ic: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
          ];
          return (
            <div className="relative mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-4 2xl:grid-cols-5">
              {tiles.map((x) => {
                const Icono = x.icon;
                return (
                  <div key={x.l} className={`flex items-center gap-3 rounded-2xl bg-gradient-to-br px-3.5 py-3 ring-1 ring-black/[0.04] dark:ring-white/10 ${x.tono}`}>
                    <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${x.ic}`}><Icono className="size-4" /></span>
                    <div className="min-w-0">
                      <p className="font-display text-2xl font-semibold leading-none tabular-nums">{x.v}</p>
                      <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-wide opacity-70">{x.l}</p>
                    </div>
                  </div>
                );
              })}
              <div className="col-span-2 rounded-2xl bg-card px-3.5 py-3 ring-1 ring-border/70 md:col-span-4 2xl:col-span-1 dark:ring-white/10">
                <div className="flex items-baseline justify-between">
                  <p className="font-display text-2xl font-semibold leading-none tabular-nums">{libres} <span className="text-xs font-medium text-muted-foreground">libres</span></p>
                  <span className="text-xs font-bold tabular-nums text-[rgb(var(--acc))]">{pct}%</span>
                </div>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-secondary dark:bg-white/10"><div className="pn-acc-tile h-full rounded-full transition-all duration-700" style={{ width: `${pct}%` }} /></div>
                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ocupación del día</p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Columnas por doctor */}
      <div className="grid divide-y divide-border/60 xl:grid-cols-2 xl:divide-x xl:divide-y-0">
        {columnas.map(({ a, ag, atiende, bloqueo, slots, suyos, fuera, actual }) => {
          const foto = fotoDe(a.id);
          const libres = slots.filter((h) => !suyos.some((t) => t.hora === h)).length;
          return (
            <div key={a.id} className="min-w-0 p-5">
              <div className="mb-4 flex items-center gap-3">
                {foto && <img src={foto} alt="" className="size-11 rounded-xl object-cover object-top" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{a.nombre}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{atiende ? (() => { const bs = bloquesDe(ag).filter((b) => b.dia === new Date(dia + "T12:00:00").getDay()).sort((x, y) => x.desde.localeCompare(y.desde)); return `Hoy de ${hora12(bs[0]!.desde)} a ${hora12(bs[bs.length - 1]!.hasta)}`; })() : resumenAgenda(ag)}</p>
                </div>
                {atiende && <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">{suyos.length}/{slots.length}</span>}
                {irHorarios && (
                  <button onClick={() => irHorarios(a.id)} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[rgba(var(--acc),.1)] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--acc))] transition hover:bg-[rgba(var(--acc),.18)]"><Clock className="size-3.5" /> <span className="hidden sm:inline">{yo?.id === a.id ? "Mis horarios" : "Horarios"}</span></button>
                )}
              </div>

              {!atiende && (() => {
                const sinCargar = bloquesDe(ag).length === 0;
                const esSuyo = yo?.id === a.id;
                return (
                  <div className={`rounded-2xl border border-dashed p-6 text-center text-sm ${sinCargar ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200" : "border-border bg-secondary/30 text-muted-foreground"}`}>
                    {bloqueo ? <>No atiende: <b>{bloqueo.motivo}</b></> : !ag.activo ? "Agenda pausada." : sinCargar ? (
                      <>
                        <Clock className="mx-auto mb-2 size-6" />
                        <p className="font-semibold">{esSuyo ? "Todavía no cargó sus horarios" : `${nombreCorto(a.nombre)} todavía no cargó sus horarios`}</p>
                        <p className="mt-1 text-xs opacity-80">Sin horarios de atención no aparecen horas para reservar, ni aquí ni en la web.</p>
                      </>
                    ) : (
                      <>Los {NOMBRES_DIA[new Date(dia + "T12:00:00").getDay()]!.toLowerCase()} no atiende. <span className="block pt-1 text-xs">Atiende: {resumenAgenda(ag)}</span></>
                    )}
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      {irHorarios && !bloqueo && (
                        <button onClick={() => irHorarios(a.id)} className="inline-flex items-center gap-1.5 rounded-xl pn-acc-tile px-4 py-2 text-xs font-semibold text-white"><Clock className="size-3.5" /> {esSuyo ? (sinCargar ? "Cargar mis horarios" : "Cambiar mis horarios") : "Ver sus horarios"}</button>
                      )}
                      {esSuyo && sinCargar && (
                        <button onClick={() => abrirIA("Atiendo de lunes a viernes de 8 a 12, citas de 20 minutos")} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-700 px-4 py-2 text-xs font-semibold text-white"><Mic className="size-3.5" /> Decírselo a la IA</button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {atiende && (
                <div className="space-y-1.5">
                  {slots.map((h) => {
                    const t = suyos.find((x) => x.hora === h);
                    const clave = `${a.nombre}|${h}`;
                    const pasado = esHoy && h < hhmm && h !== actual;
                    const sv = servicioEn(ag, dia, h);
                    const nuevoBloque = sv && sv !== servicioEn(ag, dia, slots[slots.indexOf(h) - 1] ?? "");
                    return (
                      <Fragment key={h}>
                      {nuevoBloque && <p className={`flex items-center gap-2 pb-0.5 text-[11px] font-bold uppercase tracking-wider ${esProcedimiento(sv) ? "text-violet-600" : "text-sky-700 dark:text-sky-300"} ${slots.indexOf(h) > 0 ? "pt-3" : ""}`}><span className="h-px flex-1 bg-current opacity-20" />{sv}<span className="h-px flex-1 bg-current opacity-20" /></p>}
                      <div className={`flex gap-3 ${pasado && !t ? "opacity-45" : ""}`}>
                        <div className="w-[4.5rem] shrink-0 pt-3 text-right">
                          <span className={`text-xs font-semibold tabular-nums ${h === actual ? "" : "text-muted-foreground"}`} style={h === actual ? { color: `rgb(var(--acc))` } : undefined}>{hora12(h)}</span>
                          {h === actual && <span className="block text-[9px] font-bold uppercase" style={{ color: `rgb(var(--acc))` }}>Ahora</span>}
                        </div>
                        <div className="min-w-0 flex-1">
                          {t ? (
                            <FilaPaciente t={t} ahoraEs={h === actual} />
                          ) : asignando === clave ? (
                            <div className="space-y-2 rounded-2xl border border-[rgba(var(--acc),.4)] bg-[rgba(var(--acc),.05)] p-3 animate-in fade-in duration-200">
                              <div className="grid gap-2 sm:grid-cols-3">
                                <input autoFocus inputMode="numeric" placeholder="Cédula *" value={rapido.dni} onChange={(e) => {
                                  const dni = limpiarDoc(e.target.value);
                                  const c = dni.length >= 5 ? conocidos.find((x) => x.dni === dni) : undefined;
                                  setRapido({ ...rapido, dni, ...(c && !rapido.paciente ? { paciente: c.nombre, telefono: rapido.telefono || c.telefono || "" } : {}) });
                                }} className={inp + " h-9"} />
                                <input placeholder="Nombre y apellido *" value={rapido.paciente} onChange={(e) => setRapido({ ...rapido, paciente: nombrePropio(e.target.value) })} className={inp + " h-9"} />
                                <input placeholder="WhatsApp (opcional)" value={rapido.telefono} onChange={(e) => setRapido({ ...rapido, telefono: e.target.value })} className={inp + " h-9"} />
                              </div>
                              <div className="flex gap-2">
                                <input placeholder="Motivo" value={rapido.motivo} onChange={(e) => setRapido({ ...rapido, motivo: e.target.value })} className={inp + " h-9 flex-1"} />
                                <Button size="sm" className="h-9 rounded-xl" onClick={() => asignar(a.nombre, h)}><Check className="size-4" /> Asignar</Button>
                                <Button size="sm" variant="ghost" className="h-9 rounded-xl" onClick={() => setAsignando(null)}>Cancelar</Button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => { setAsignando(clave); setRapido({ paciente: "", dni: "", telefono: "", motivo: servicioEn(ag, dia, h) || "Consulta" }); }} disabled={pasado}
                              className={`group flex w-full items-center justify-between rounded-2xl border border-dashed px-4 py-3 text-left text-sm transition-all ${h === actual ? "border-[rgba(var(--acc),.5)]" : "border-border"} ${pasado ? "cursor-default" : "hover:border-[rgba(var(--acc),.5)] hover:bg-[rgba(var(--acc),.04)]"}`}>
                              <span className="text-muted-foreground">Libre</span>
                              {!pasado && <span className="inline-flex items-center gap-1 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100" style={{ color: `rgb(var(--acc))` }}><Plus className="size-3.5" /> Asignar paciente</span>}
                            </button>
                          )}
                        </div>
                      </div>
                      </Fragment>
                    );
                  })}
                  {libres === 0 && slots.length > 0 && <p className="pt-2 text-center text-xs font-semibold text-emerald-700">Agenda completa</p>}
                </div>
              )}

              {fuera.length > 0 && (
                <div className="mt-4 border-t border-border/60 pt-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Sobreturnos / fuera de agenda</p>
                  <div className="space-y-1.5">
                    {fuera.map((t) => (
                      <div key={t.id} className="flex gap-3">
                        <span className="w-[4.5rem] shrink-0 pt-3 text-right text-xs font-semibold tabular-nums text-muted-foreground">{hora12(t.hora)}</span>
                        <div className="min-w-0 flex-1"><FilaPaciente t={t} ahoraEs={false} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TurnosTab({ turnos, setTurnos, log, foco = null, irHorarios }: { turnos: Turno[]; setTurnos: Dispatch<SetStateAction<Turno[]>>; log: LogFn; foco?: FocoTurnos; irHorarios?: ((id: string) => void) | undefined }) {
  const [procHoy, setProcHoy] = useState(foco === "procedimientos");
  useEffect(() => {
    if (!foco) return;
    const id = foco === "procedimientos" ? "lista-turnos" : "agenda-hoy";
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    return () => window.clearTimeout(t);
  }, [foco]);
  const [f, setF] = useState({ fecha: hoy(), hora: "", paciente: "", dni: "", telefono: "", doctor: ADMINS[0]!.nombre, motivo: "" });
  const conocidos = usePacientesClinica(turnos);
  const [agendas] = useDato<Agendas>(KEY_AGENDA, {});
  const [otraHora, setOtraHora] = useState(false);
  const [manual, setManual] = useState(false);
  const profs = profesionalesAgenda(agendas);
  const adminSel = profs.find((a) => a.nombre === f.doctor) ?? profs[0]!;
  const agendaSel = agendaDe(agendas, adminSel.id);
  const diasRapidos = Array.from({ length: 10 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return isoDe(d);
  });
  const atiende = atiendeEl(agendaSel, f.fecha);
  const slots = horariosDelDia(agendaSel, f.fecha).map((h) => ({
    h,
    ocupado: turnos.some((t) => t.doctor === f.doctor && t.fecha === f.fecha && t.hora === h && t.estado !== "Cancelado"),
  }));
  const MOTIVOS = ["Consulta", "Control", "Primera vez", "Ecocardiograma", "Electrocardiograma", "Lectura de estudios"];
  const [filtro, setFiltro] = useState<"Todos" | Estado>("Todos");
  const [q, setQ] = useState("");

  const lista = useMemo(
    () =>
      [...turnos]
        .filter((t) => filtro === "Todos" || t.estado === filtro)
        .filter((t) => !procHoy || (t.fecha === hoy() && esProcedimiento(t.motivo)))
        .filter((t) => norm(`${t.paciente} ${t.motivo} ${t.doctor}`).includes(norm(q)))
        .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora)),
    [turnos, filtro, q, procHoy],
  );

  const agregar = (e: FormEvent) => {
    e.preventDefault();
    if (!f.hora) {
      toast.error("Elija un horario.");
      return;
    }
    if (turnos.some((t) => t.doctor === f.doctor && t.fecha === f.fecha && t.hora === f.hora && t.estado !== "Cancelado")) {
      toast.error("Ese horario ya está ocupado para ese profesional.");
      return;
    }
    if (limpiarDoc(f.dni).length < 5) {
      toast.error("La cédula del paciente es obligatoria.");
      return;
    }
    const nuevo: Turno = {
      id: uid(),
      fecha: f.fecha,
      hora: f.hora,
      paciente: nombrePropio(f.paciente).trim(),
      dni: limpiarDoc(f.dni),
      doctor: f.doctor,
      motivo: f.motivo.trim(),
      estado: "Pendiente",
      origen: "panel",
      ...(f.telefono.trim() ? { telefono: f.telefono.trim() } : {}),
    };
    setTurnos((p) => [...p, nuevo]);
    log("Cita creada", `${nuevo.paciente} · ${fechaCorta(nuevo.fecha)} ${hora12(nuevo.hora)} · ${nuevo.doctor}`);
    toast.success("Cita creada.");
    setF({ ...f, hora: "", paciente: "", dni: "", telefono: "", motivo: "" });
  };

  const cambiarEstado = (t: Turno, estado: Estado) => {
    setTurnos((p) => p.map((x) => (x.id === t.id ? { ...x, estado } : x)));
    log("Cita actualizada", `${t.paciente}: ${t.estado} → ${estado}`);
  };

  const borrar = (t: Turno) => {
    setTurnos((p) => p.filter((x) => x.id !== t.id));
    log("Cita eliminada", `${t.paciente} · ${fechaCorta(t.fecha)} ${hora12(t.hora)}`);
  };

  const filtros: ("Todos" | Estado)[] = ["Todos", ...ESTADOS];

  return (
    <div className="space-y-6">
      <div id="agenda-hoy" className="scroll-mt-24" />
      <AgendaDia turnos={turnos} setTurnos={setTurnos} log={log} irHorarios={irHorarios} onCargaManual={() => { setManual(true); window.setTimeout(() => document.getElementById("carga-manual")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }} />

      {!manual && (
        <button onClick={() => setManual(true)} className="pn-card flex w-full items-center gap-4 p-5 text-left transition-transform hover:-translate-y-0.5">
          <span className="pn-acc-tile flex size-11 items-center justify-center rounded-2xl text-white"><Plus className="size-5" /></span>
          <span className="flex-1">
            <span className="block font-semibold">Cargar una cita manualmente</span>
            <span className="text-sm text-muted-foreground">Para pacientes que llaman por teléfono o se acercan a la clínica.</span>
          </span>
          <ChevronDown className="size-5 text-muted-foreground" />
        </button>
      )}

      {manual && (
      <section id="carga-manual" className="pn-card pn-up scroll-mt-6 overflow-hidden">
        <form onSubmit={agregar} className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-6 p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="pn-acc-tile flex size-11 items-center justify-center rounded-2xl text-white"><CalendarCheck className="size-5" /></span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Nueva cita</h3>
                <p className="text-xs text-muted-foreground">Elija profesional, día y horario libre. Se crea como pendiente hasta confirmarlo.</p>
              </div>
              <button type="button" onClick={() => setManual(false)} className="ml-auto rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary">Cerrar</button>
            </div>

            {/* 1. Profesional */}
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><span className="pn-acc-tile flex size-5 items-center justify-center rounded-full text-[10px] text-white">1</span> Profesional</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {profs.map((a) => {
                  const on = f.doctor === a.nombre;
                  const ag = agendaDe(agendas, a.id);
                  const foto = fotoDe(a.id);
                  return (
                    <button key={a.id} type="button" onClick={() => setF({ ...f, doctor: a.nombre, hora: "" })}
                      className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-300 ${on ? "border-transparent bg-[rgba(var(--acc),.07)] shadow-md ring-2 ring-[rgba(var(--acc),.55)]" : "border-border hover:border-[rgba(var(--acc),.4)] hover:bg-secondary/40"}`}>
                      {foto && <img src={foto} alt="" className="size-12 rounded-xl object-cover object-top" />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{a.nombre}</span>
                        <span className="block truncate text-[11px] text-muted-foreground">{resumenAgenda(ag)}</span>
                      </span>
                      {on && <Check className="size-5 shrink-0" style={{ color: `rgb(var(--acc))` }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Día */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><span className="pn-acc-tile flex size-5 items-center justify-center rounded-full text-[10px] text-white">2</span> Día</p>
                <input type="date" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value, hora: "" })} className="h-8 rounded-lg border border-input bg-background px-2 text-xs outline-none focus:border-primary" />
              </div>
              <div className="pn-noscroll flex gap-2 overflow-x-auto pb-1">
                {diasRapidos.map((d) => {
                  const fecha = new Date(d + "T12:00:00");
                  const on = f.fecha === d;
                  const abre = atiendeEl(agendaSel, d);
                  return (
                    <button key={d} type="button" onClick={() => setF({ ...f, fecha: d, hora: "" })}
                      className={`relative flex w-16 shrink-0 flex-col items-center rounded-2xl border py-2.5 transition-all duration-300 ${on ? "pn-acc-tile border-transparent text-white" : abre ? "border-border bg-card hover:border-[rgba(var(--acc),.45)]" : "border-dashed border-border bg-secondary/40 text-muted-foreground/60"}`}>
                      <span className="text-[10px] font-semibold uppercase opacity-80">{d === hoy() ? "Hoy" : fecha.toLocaleDateString("es-CO", { weekday: "short" }).replace(".", "")}</span>
                      <span className="font-display text-xl font-semibold leading-tight">{fecha.getDate()}</span>
                      <span className={`mt-0.5 size-1.5 rounded-full ${abre ? (on ? "bg-white" : "bg-emerald-500") : "bg-slate-300"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Horario */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><span className="pn-acc-tile flex size-5 items-center justify-center rounded-full text-[10px] text-white">3</span> Horario</p>
                <button type="button" onClick={() => setOtraHora((v) => !v)} className="text-xs font-semibold hover:underline" style={{ color: `rgb(var(--acc))` }}>{otraHora ? "Ver horarios de la agenda" : "Otro horario (sobreturno)"}</button>
              </div>
              {otraHora ? (
                <SelectorHora value={f.hora || "08:00"} onChange={(v) => setF({ ...f, hora: v })} label="Hora del sobreturno" />
              ) : !atiende ? (
                <p className="rounded-2xl border border-dashed border-border bg-secondary/30 p-4 text-sm text-muted-foreground">{nombreCorto(adminSel.nombre)} no atiende este día según su agenda ({resumenAgenda(agendaSel)}). Elija otro día o use "Otro horario".{irHorarios && <button type="button" onClick={() => irHorarios(adminSel.id)} className="ml-1 font-semibold text-[rgb(var(--acc))] hover:underline">Ver horarios</button>}</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-6">
                  {slots.map(({ h, ocupado }) => {
                    const [num, ...suf] = hora12(h).split(" ");
                    const on = f.hora === h;
                    return (
                      <button key={h} type="button" disabled={ocupado} onClick={() => setF({ ...f, hora: h, motivo: f.motivo || servicioEn(agendaSel, f.fecha, h) })}
                        className={`rounded-2xl px-1 py-2 tabular-nums transition-all duration-200 ${ocupado ? "cursor-not-allowed bg-secondary/40 text-muted-foreground/40" : on ? "pn-acc-tile scale-[1.03] text-white shadow-lg" : "pn-field ring-1 ring-slate-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-[rgba(var(--acc),.5)] dark:ring-white/10"}`}>
                        <span className={`whitespace-nowrap ${ocupado ? "line-through" : ""}`}><span className="text-[15px] font-semibold">{num}</span> <span className={`text-[10px] font-medium ${on ? "text-white/80" : "text-muted-foreground"}`}>{suf.join(" ")}</span></span>
                        {servicioEn(agendaSel, f.fecha, h) && <span className={`block truncate text-[9px] font-medium ${on ? "text-white/75" : "text-muted-foreground"}`}>{ocupado ? "Ocupado" : servicioEn(agendaSel, f.fecha, h)}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Paciente */}
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><span className="pn-acc-tile flex size-5 items-center justify-center rounded-full text-[10px] text-white">4</span> Paciente y motivo</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input id="nt-dni" required inputMode="numeric" placeholder="Cédula del paciente *" value={f.dni} onChange={(e) => {
                    const dni = limpiarDoc(e.target.value);
                    const c = dni.length >= 5 ? conocidos.find((x) => x.dni === dni) : undefined;
                    setF({ ...f, dni, ...(c && !f.paciente ? { paciente: c.nombre, telefono: f.telefono || c.telefono || "" } : {}) });
                  }} className={inp + " pl-10"} />
                </div>
                <div className="relative">
                  <Users className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input id="nt-paciente" required placeholder="Nombre y apellido *" value={f.paciente} onChange={(e) => setF({ ...f, paciente: nombrePropio(e.target.value) })} className={inp + " pl-10"} />
                </div>
                <div className="relative">
                  <Send className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input type="tel" placeholder="WhatsApp (opcional)" value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} className={inp + " pl-10"} />
                </div>
                <div className="relative sm:col-span-2">
                  <Stethoscope className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input required placeholder="Motivo de la consulta" value={f.motivo} onChange={(e) => setF({ ...f, motivo: e.target.value })} className={inp + " pl-10"} />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {MOTIVOS.map((m) => (
                  <button key={m} type="button" onClick={() => setF({ ...f, motivo: m })} className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${f.motivo === m ? "pn-acc-tile text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{m}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen */}
          <aside className="relative flex flex-col justify-between gap-6 overflow-hidden gradient-deep p-6 text-white sm:p-7">
            <div className="pn-orb pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-3xl" />
            <Electro latidos={4} grilla={false} color="#7dd3fc" className="pointer-events-none absolute inset-x-0 bottom-24 h-10 w-full" />
            <div className="relative space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">Resumen de la cita</p>
              <div className="flex items-center gap-3">
                {fotoDe(adminSel.id) && <img src={fotoDe(adminSel.id)!} alt="" className="size-12 rounded-xl object-cover object-top ring-2 ring-white/25" />}
                <div className="min-w-0">
                  <p className="truncate font-semibold">{nombreCorto(adminSel.nombre)}</p>
                  
                </div>
              </div>
              <div className="space-y-3 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
                <p className="flex items-center gap-3 text-sm"><CalendarDays className="size-4 text-sky-300" /> <span className="inline-block first-letter:uppercase">{new Date(f.fecha + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}</span></p>
                <p className="flex items-center gap-3 text-sm"><Clock className="size-4 text-sky-300" /> {f.hora ? hora12(f.hora) : <span className="text-white/50">Elija un horario</span>}</p>
                <p className="flex items-center gap-3 text-sm"><Users className="size-4 text-sky-300" /> {f.paciente.trim() || <span className="text-white/50">Paciente</span>}</p>
                <p className="flex items-center gap-3 text-sm"><Stethoscope className="size-4 text-sky-300" /> {f.motivo.trim() || <span className="text-white/50">Motivo</span>}</p>
              </div>
              {atiende && !otraHora && <p className="text-xs text-white/60">{slots.filter((x) => !x.ocupado).length} horarios libres este día</p>}
            </div>
            <Button type="submit" className="relative h-12 w-full rounded-xl !bg-white text-[var(--deep)] shadow-lg hover:!bg-white/90">
              <Plus className="size-4" /> Crear cita
            </Button>
          </aside>
        </form>
      </section>
      )}

      <div id="lista-turnos" className="scroll-mt-24" />
      <Seccion icon={ClipboardList} titulo={procHoy ? "Procedimientos de hoy" : "Todas las citas"} sub={`${lista.length} cita${lista.length === 1 ? "" : "s"} · ${procHoy ? "estudios y procedimientos del día" : "lista completa con filtros"}`} delay={0.08}
        acciones={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Buscar paciente, motivo..." value={q} onChange={(e) => setQ(e.target.value)} className={inp + " h-10 pl-9 sm:w-64"} />
          </div>
        }>
        <div className="mb-4 flex flex-wrap gap-2">
          <button onClick={() => setProcHoy(!procHoy)} className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${procHoy ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md" : "bg-violet-50 text-violet-700 ring-1 ring-violet-200 hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30"}`}>
            <Stethoscope className="size-3.5" /> Procedimientos de hoy
            <span className={`rounded-full px-1.5 tabular-nums ${procHoy ? "bg-white/20" : "bg-white dark:bg-white/10"}`}>{turnos.filter((t) => t.fecha === hoy() && t.estado !== "Cancelado" && esProcedimiento(t.motivo)).length}</span>
          </button>
          {filtros.map((x) => {
            const n = x === "Todos" ? turnos.length : turnos.filter((t) => t.estado === x).length;
            const on = filtro === x;
            return (
              <button key={x} onClick={() => setFiltro(x)} className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${on ? "gradient-deep text-white shadow-md" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {x !== "Todos" && <span className={`size-1.5 rounded-full ${ESTADO_DOT[x]}`} />}
                {x} <span className={`rounded-full px-1.5 tabular-nums ${on ? "bg-white/20" : "bg-background"}`}>{n}</span>
              </button>
            );
          })}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="pb-3 pr-3 font-medium">Fecha</th>
                <th className="pb-3 pr-3 font-medium">Paciente</th>
                <th className="pb-3 pr-3 font-medium">Profesional</th>
                <th className="pb-3 pr-3 font-medium">Estado</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && (
                <tr><td colSpan={5}>
                  {turnos.length === 0 ? (
                    <Vacio icon={CalendarDays} titulo="Sin citas todavía" texto="Cree el primero arriba o espere las reservas que lleguen desde la web." accion={<Button variant="outline" className="rounded-xl" onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); window.setTimeout(() => document.getElementById("nt-paciente")?.focus(), 400); }}><Plus className="size-4" /> Crear el primera cita</Button>} />
                  ) : (
                    <Vacio icon={Search} titulo="Sin resultados" texto="No hay citas con ese filtro o búsqueda." />
                  )}
                </td></tr>
              )}
              {lista.map((t) => (
                <tr key={t.id} className="group border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40">
                  <td className="py-3 pr-3">
                    <p className="whitespace-nowrap font-semibold tabular-nums">{hora12(t.hora)}</p>
                    <p className="whitespace-nowrap text-xs text-muted-foreground">{fechaCorta(t.fecha)}</p>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <Avatar nombre={t.paciente} size="size-9" />
                      <div>
                        <p className="flex items-center gap-2 font-medium">
                          {t.paciente}
                          {t.origen === "web" && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-700">Web</span>}
                          {t.origen === "portal" && <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-pink-700">Portal</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{t.motivo}{t.telefono ? ` · ${t.telefono}` : ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><Stethoscope className="size-3.5" /> {nombreCorto(t.doctor)}</span>
                  </td>
                  <td className="py-3 pr-3">
                    <select value={t.estado} onChange={(e) => cambiarEstado(t, e.target.value as Estado)} className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-xs font-medium outline-none ring-1 ${ESTADO_CLASE[t.estado]}`}>
                      {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => borrar(t)} aria-label="Eliminar cita" className="rounded-lg p-2 text-muted-foreground opacity-60 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100">
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Seccion>
    </div>
  );
}

/* ---------- Finanzas ---------- */
const CONCEPTOS_RAPIDOS: Record<Mov["tipo"], string[]> = {
  Ingreso: ["Consultas", "Ecocardiograma", "Estudios cardiológicos", "Evaluación renal", "Laboratorio", "Teleconsulta"],
  Egreso: ["Insumos médicos", "Sueldos", "Alquiler", "Servicios", "Mantenimiento de equipos", "Medicamentos"],
};

function iconoConcepto(concepto: string): LucideIcon {
  const c = norm(concepto);
  if (c.includes("eco") || c.includes("cardio") || c.includes("holter") || c.includes("ergo")) return HeartPulse;
  if (c.includes("consulta") || c.includes("control")) return Stethoscope;
  if (c.includes("labor") || c.includes("estudio") || c.includes("renal") || c.includes("analisis")) return FlaskConical;
  if (c.includes("imagen") || c.includes("ecograf") || c.includes("doppler")) return ScanLine;
  if (c.includes("insumo") || c.includes("medicamento") || c.includes("farmacia")) return Pill;
  if (c.includes("sueldo") || c.includes("personal")) return Users;
  if (c.includes("tele")) return Headphones;
  return Receipt;
}

function curva(pts: [number, number][]) {
  if (!pts.length) return "";
  let d = `M ${pts[0]![0]} ${pts[0]![1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]!;
    const [x1, y1] = pts[i]!;
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

function MonitorFinanciero({ movs }: { movs: Mov[] }) {
  const W = 640;
  const H = 200;
  const PAD = 18;
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const serie = dias.map((d) => {
    const iso = fechaISO(d);
    const delDia = movs.filter((m) => m.fecha === iso);
    return {
      label: d.toLocaleDateString("es-CO", { weekday: "short" }).replace(".", ""),
      ing: delDia.filter((m) => m.tipo === "Ingreso").reduce((a, m) => a + m.monto, 0),
      egr: delDia.filter((m) => m.tipo === "Egreso").reduce((a, m) => a + m.monto, 0),
    };
  });
  const max = Math.max(1, ...serie.map((s) => Math.max(s.ing, s.egr)));
  const x = (i: number) => PAD + (i * (W - PAD * 2)) / (serie.length - 1);
  const y = (v: number) => H - PAD - (v / max) * (H - PAD * 2.4);
  const ptsI = serie.map((s, i) => [x(i), y(s.ing)] as [number, number]);
  const ptsE = serie.map((s, i) => [x(i), y(s.egr)] as [number, number]);
  const lineaI = curva(ptsI);
  const lineaE = curva(ptsE);
  const areaI = `${lineaI} L ${x(serie.length - 1)} ${H - PAD} L ${x(0)} ${H - PAD} Z`;

  const ing = movs.filter((m) => m.tipo === "Ingreso").reduce((a, m) => a + m.monto, 0);
  const egr = movs.filter((m) => m.tipo === "Egreso").reduce((a, m) => a + m.monto, 0);
  const semana = serie.reduce((a, s) => a + s.ing - s.egr, 0);

  return (
    <section className="pn-up relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-slate-950 via-[#0b1f4d] to-[#0a3a6b] p-6 text-white shadow-[0_30px_60px_-25px_rgba(10,30,80,.7)] sm:p-8">
      <div className="pn-cross pointer-events-none absolute inset-0" />
      <div className="pn-orb pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="pn-orb pointer-events-none absolute -bottom-24 left-10 size-72 rounded-full bg-emerald-500/10 blur-3xl" style={{ animationDelay: "-6s" }} />

      <div className="relative flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/80">
            <HeartPulse className="pn-beat size-4 text-rose-400" /> Monitor financiero · en vivo
          </p>
          <p className="mt-3 text-sm text-white/60">Balance acumulado</p>
          <p className="font-display text-4xl font-semibold tabular-nums sm:text-5xl">{dinero(ing - egr)}</p>
          <p className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${semana >= 0 ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"}`}>
            {semana >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {dinero(semana)} en los últimos 7 días
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10 backdrop-blur">
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/60"><span className="size-2 rounded-full bg-emerald-400" /> Ingresos</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{dinero(ing)}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10 backdrop-blur">
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/60"><span className="size-2 rounded-full bg-rose-400" /> Egresos</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{dinero(egr)}</p>
          </div>
        </div>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-2xl bg-black/20 ring-1 ring-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="pn-scan pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-sky-300/10 to-transparent" />
        <svg viewBox={`0 0 ${W} ${H}`} className="relative h-48 w-full sm:h-56" preserveAspectRatio="none" aria-label="Ingresos y egresos de los últimos 7 días">
          <defs>
            <linearGradient id="pn-gi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity=".45" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
            <filter id="pn-glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <path className="pn-area" d={areaI} fill="url(#pn-gi)" />
          <path className="pn-draw" d={lineaI} fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" filter="url(#pn-glow)" style={{ ["--len" as string]: 1400 }} />
          <path className="pn-draw" d={lineaE} fill="none" stroke="#fb7185" strokeWidth="2.5" strokeDasharray="1400" strokeLinecap="round" style={{ ["--len" as string]: 1400, animationDelay: ".3s" }} />
          {ptsI.map(([px, py], i) => (
            <circle key={i} cx={px} cy={py} r="4.5" fill="#0b1f4d" stroke="#34d399" strokeWidth="2.5" className="pn-area" />
          ))}
        </svg>
        <div className="relative flex justify-between px-4 pb-3 text-[11px] font-medium capitalize text-white/50">
          {serie.map((s, i) => <span key={i}>{s.label}</span>)}
        </div>
      </div>
    </section>
  );
}

function Dona({ ingresos, egresos }: { ingresos: number; egresos: number }) {
  const [listo, setListo] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setListo(true), 150);
    return () => window.clearTimeout(t);
  }, []);
  const total = ingresos + egresos;
  const pct = total === 0 ? 0 : ingresos / total;
  const R = 70;
  const C = 2 * Math.PI * R;
  const margen = ingresos === 0 ? 0 : Math.round(((ingresos - egresos) / ingresos) * 100);
  return (
    <div className="relative mx-auto size-48">
      <svg viewBox="0 0 180 180" className="size-full -rotate-90">
        <circle cx="90" cy="90" r={R} fill="none" stroke="#ffe4e6" strokeWidth="16" />
        <circle
          className="pn-donut"
          cx="90"
          cy="90"
          r={R}
          fill="none"
          stroke="url(#pn-dg)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${listo ? C * pct : 0} ${C}`}
        />
        <defs>
          <linearGradient id="pn-dg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <HeartPulse className="pn-beat mb-1 size-5 text-rose-500" />
        <p className="font-display text-3xl font-semibold tabular-nums">{margen}%</p>
        <p className="text-xs text-muted-foreground">Margen</p>
      </div>
    </div>
  );
}

function FinanzasResumen({ movs, setMovs, log }: { movs: Mov[]; setMovs: Dispatch<SetStateAction<Mov[]>>; log: LogFn }) {
  const [f, setF] = useState({ fecha: hoy(), concepto: "", tipo: "Ingreso" as Mov["tipo"], monto: "" });
  const [ver, setVer] = useState<"Todos" | Mov["tipo"]>("Todos");
  const ingresos = movs.filter((m) => m.tipo === "Ingreso").reduce((a, m) => a + m.monto, 0);
  const egresos = movs.filter((m) => m.tipo === "Egreso").reduce((a, m) => a + m.monto, 0);
  const lista = [...movs].filter((m) => ver === "Todos" || m.tipo === ver).sort((a, b) => b.fecha.localeCompare(a.fecha));

  const agrupar = (tipo: Mov["tipo"]) => {
    const mapa = new Map<string, number>();
    movs.filter((m) => m.tipo === tipo).forEach((m) => mapa.set(m.concepto, (mapa.get(m.concepto) ?? 0) + m.monto));
    return [...mapa.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  };
  const porServicio = agrupar("Ingreso");
  const porGasto = agrupar("Egreso");
  const maxServ = Math.max(1, ...porServicio.map((x) => x[1]));
  const maxGasto = Math.max(1, ...porGasto.map((x) => x[1]));

  const agregar = (e: FormEvent) => {
    e.preventDefault();
    const monto = Number(f.monto);
    if (!monto || monto <= 0) {
      toast.error("Ingrese un monto válido.");
      return;
    }
    const nuevo: Mov = { id: uid(), fecha: f.fecha, concepto: f.concepto.trim(), tipo: f.tipo, monto };
    setMovs((p) => [...p, nuevo]);
    log(`${nuevo.tipo} registrado`, `${nuevo.concepto} · ${dinero(nuevo.monto)}`);
    toast.success("Movimiento registrado.");
    setF({ ...f, concepto: "", monto: "" });
  };

  const borrar = (m: Mov) => {
    setMovs((p) => p.filter((x) => x.id !== m.id));
    log("Movimiento eliminado", `${m.tipo}: ${m.concepto} · ${dinero(m.monto)}`);
  };

  const Ranking = ({ datos, max, tipo }: { datos: [string, number][]; max: number; tipo: Mov["tipo"] }) => (
    <div className="space-y-4">
      {datos.length === 0 && <Vacio icon={Receipt} texto="Sin datos todavía." />}
      {datos.map(([concepto, monto], i) => {
        const I = iconoConcepto(concepto);
        return (
          <div key={concepto} className="group">
            <div className="mb-1.5 flex items-center gap-3">
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${tipo === "Ingreso" ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" : "bg-rose-50 text-rose-600 ring-1 ring-rose-100"}`}>
                <I className="size-4" />
              </span>
              <p className="min-w-0 flex-1 truncate text-sm font-medium">{concepto}</p>
              <p className="text-sm font-semibold tabular-nums">{dinero(monto)}</p>
            </div>
            <div className="ml-12 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className={`pn-bar h-full rounded-full bg-gradient-to-r ${tipo === "Ingreso" ? "from-emerald-400 to-sky-500" : "from-rose-400 to-orange-400"}`}
                style={{ width: `${(monto / max) * 100}%`, animationDelay: `${i * 0.1}s` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <MonitorFinanciero movs={movs} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Seccion icon={Activity} titulo="Salud financiera" sub="Ingresos vs. egresos" delay={0.1}>
          <Dona ingresos={ingresos} egresos={egresos} />
          <div className="mt-5 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Ingresos</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-emerald-800">{dinero(ingresos)}</p>
            </div>
            <div className="rounded-xl bg-rose-50 p-3 ring-1 ring-rose-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">Egresos</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-rose-800">{dinero(egresos)}</p>
            </div>
          </div>
        </Seccion>

        <Seccion icon={Stethoscope} titulo="Ingresos por servicio" sub="Servicios que más facturan" delay={0.15}>
          <Ranking datos={porServicio} max={maxServ} tipo="Ingreso" />
        </Seccion>

        <Seccion icon={Pill} titulo="Gastos por concepto" sub="Dónde se va el dinero" delay={0.2}>
          <Ranking datos={porGasto} max={maxGasto} tipo="Egreso" />
        </Seccion>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Seccion icon={Plus} titulo="Registrar movimiento" sub="Se guarda y queda en auditoría" delay={0.25} className="xl:col-span-2">
          <form onSubmit={agregar} className="space-y-4">
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-secondary p-1">
              {(["Ingreso", "Egreso"] as const).map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setF({ ...f, tipo: tp, concepto: "" })}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-300 ${
                    f.tipo === tp
                      ? tp === "Ingreso"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                        : "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/25"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tp === "Ingreso" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />} {tp}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CONCEPTOS_RAPIDOS[f.tipo].map((c) => {
                const I = iconoConcepto(c);
                return (
                  <button key={c} type="button" onClick={() => setF({ ...f, concepto: c })} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${f.concepto === c ? "gradient-deep text-white shadow" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"}`}>
                    <I className="size-3" /> {c}
                  </button>
                );
              })}
            </div>
            <Campo label="Concepto"><input required placeholder="O escribe uno nuevo" value={f.concepto} onChange={(e) => setF({ ...f, concepto: e.target.value })} className={inp} /></Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Fecha"><input type="date" required value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} className={inp} /></Campo>
              <Campo label="Monto"><input required type="number" min="1" placeholder="$ 0" value={f.monto} onChange={(e) => setF({ ...f, monto: e.target.value })} className={inp + " font-semibold tabular-nums"} /></Campo>
            </div>
            <Button type="submit" className={`h-12 w-full rounded-xl text-white shadow-lg transition-transform hover:-translate-y-0.5 ${f.tipo === "Ingreso" ? "!bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/25" : "!bg-gradient-to-r from-rose-500 to-red-600 shadow-rose-500/25"}`}>
              <Plus className="size-4" /> Registrar {f.tipo.toLowerCase()}
            </Button>
          </form>
        </Seccion>

        <Seccion
          icon={Wallet}
          titulo="Movimientos"
          sub={`${lista.length} registrados`}
          delay={0.3}
          className="xl:col-span-3"
          acciones={
            <div className="flex rounded-xl bg-secondary p-1">
              {(["Todos", "Ingreso", "Egreso"] as const).map((v) => (
                <button key={v} onClick={() => setVer(v)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${ver === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {v === "Todos" ? "Todos" : `${v}s`}
                </button>
              ))}
            </div>
          }
        >
          {lista.length === 0 && <Vacio icon={Wallet} texto="No hay movimientos." />}
          <div className="space-y-1.5">
            {lista.map((m, i) => {
              const I = iconoConcepto(m.concepto);
              const esIng = m.tipo === "Ingreso";
              return (
                <div key={m.id} className="pn-up group flex items-center gap-3 rounded-2xl border border-transparent p-3 transition-all hover:border-border hover:bg-secondary/40 hover:shadow-sm" style={{ animationDelay: `${0.3 + i * 0.04}s` }}>
                  <span className={`relative flex size-11 shrink-0 items-center justify-center rounded-2xl ${esIng ? "bg-gradient-to-br from-emerald-400 to-teal-600" : "bg-gradient-to-br from-rose-400 to-red-600"} text-white shadow-md`}>
                    <I className="size-[18px]" />
                    <span className={`absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full ring-2 ring-card ${esIng ? "bg-emerald-600" : "bg-rose-600"}`}>
                      {esIng ? <ArrowDownLeft className="size-3" /> : <ArrowUpRight className="size-3" />}
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{m.concepto}</p>
                    <p className="text-xs text-muted-foreground">{fechaCorta(m.fecha)} · {m.tipo}</p>
                  </div>
                  <span className={`rounded-xl px-3 py-1.5 text-sm font-semibold tabular-nums ${esIng ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                    {esIng ? "+" : "−"} {dinero(m.monto)}
                  </span>
                  {!m.id.startsWith("cobro-") && <button onClick={() => borrar(m)} aria-label="Eliminar movimiento" className="rounded-lg p-2 text-muted-foreground opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100">
                    <Trash2 className="size-4" />
                  </button>}
                </div>
              );
            })}
          </div>
        </Seccion>
      </div>
    </div>
  );
}

/* ---------- Finanzas: contenedor con subpestañas ---------- */
type VistaFin = "resumen" | "cobros" | "caja";

function FinanzasTab({ movs, setMovs, log, turnos, user, vista, setVista }: { movs: Mov[]; setMovs: Dispatch<SetStateAction<Mov[]>>; log: LogFn; turnos: Turno[]; user: SessionUser; vista: VistaFin; setVista: (v: VistaFin) => void }) {
  const [cobros] = useDato<Cobro[]>(KEY_COBROS, []);
  // Los pagos de pacientes también cuentan como ingresos en el resumen.
  const movsTodos: Mov[] = [
    ...movs,
    ...cobros.filter((c) => !c.anulado).flatMap((c) =>
      c.pagos.map((p, i) => ({ id: `cobro-${c.id}-${i}`, fecha: diaLocal(p.fecha), concepto: `Cobro · ${c.paciente}`, tipo: "Ingreso" as const, monto: p.monto })),
    ),
  ];
  const vistas: { id: VistaFin; label: string; icon: LucideIcon }[] = [
    { id: "cobros", label: "Cobros a pacientes", icon: Receipt },
    { id: "caja", label: "Control de caja", icon: ShieldCheck },
    { id: "resumen", label: "Resumen financiero", icon: Activity },
  ];
  return (
    <div className="space-y-6">
      <div className="pn-card inline-flex flex-wrap gap-1 p-1.5">
        {vistas.map((v) => (
          <button key={v.id} onClick={() => setVista(v.id)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${vista === v.id ? "pn-acc-tile text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
            <v.icon className="size-4" /> {v.label}
          </button>
        ))}
      </div>
      <div key={vista} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {vista === "resumen" && <FinanzasResumen movs={movsTodos} setMovs={setMovs} log={log} />}
        {vista === "cobros" && <CobrosVista turnos={turnos} user={user} log={log} />}
        {vista === "caja" && <CajaVista user={user} log={log} />}
      </div>
    </div>
  );
}

const ESTADO_COBRO: Record<EstadoCobro, string> = {
  Pagado: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Parcial: "bg-sky-100 text-sky-800 ring-sky-200",
  Pendiente: "bg-amber-100 text-amber-800 ring-amber-200",
  Anulado: "bg-slate-100 text-slate-500 ring-slate-200 line-through",
};
const COLOR_METODO: Record<string, string> = {
  Efectivo: "from-[#0f766e] to-[#115e59]",
  "Tarjeta débito": "from-[#1d4ed8] to-[#0b2a6b]",
  "Tarjeta crédito": "from-[#0b2a6b] to-[#071a46]",
  Transferencia: "from-[#0e7490] to-[#155e75]",
  Nequi: "from-[#6d28d9] to-[#4c1d95]",
  Daviplata: "from-[#b91c1c] to-[#7f1d1d]",
  PSE: "from-[#0369a1] to-[#0c4a6e]",
  "Débito": "from-[#1d4ed8] to-[#0b2a6b]",
  "Crédito": "from-[#0b2a6b] to-[#071a46]",
  "Mercado Pago": "from-slate-500 to-slate-700",
  EPS: "from-slate-500 to-slate-700",
};

function useQuienCobra() {
  const [equipo] = useDato<Persona[]>(KEY_EQUIPO, EQUIPO_INICIAL);
  return [...equipo.filter((p) => p.activo).map((p) => p.nombre), ...ADMINS.map((a) => a.nombre)];
}

function textoRecibo(c: Cobro) {
  const eps = c.aCargoEps ?? 0;
  return [
    `*HEGO · Centro de especialidades médicas*`,
    `Recibo de pago N° ${c.id.toUpperCase()}`,
    ``,
    `Paciente: ${c.paciente}${c.dni ? ` (C.C. ${c.dni})` : ""}`,
    `Servicio: ${c.concepto}`,
    `Profesional: ${c.profesional}`,
    ...(c.obraSocial ? [`EPS: ${c.obraSocial}`] : []),
    ...(eps > 0 ? [`Valor del servicio: ${dinero(c.valor + eps)}`, `A cargo de la EPS: ${dinero(eps)}`] : []),
    `${c.tipoPagoEps ?? "Valor"}: ${dinero(c.valor)}`,
    ...c.pagos.map((p) => `Pago ${metodoTxt(p.metodo)} · ${fechaHora(p.fecha)}: ${dinero(p.monto)}`),
    `*Total pagado: ${dinero(pagadoDe(c))}*`,
    ...(saldoDe(c) > 0 ? [`Saldo pendiente: ${dinero(saldoDe(c))}`] : []),
    ``,
    `Gracias por confiar en HEGO.`,
  ].join("\n");
}

function imprimirRecibo(c: Cobro) {
  const w = window.open("", "_blank", "width=720,height=900");
  if (!w) return;
  const eps = c.aCargoEps ?? 0;
  const filas = c.pagos.map((p) => `<tr><td>${fechaHora(p.fecha)}</td><td>${metodoTxt(p.metodo)}</td><td>${p.cobradoPor}</td><td style="text-align:right">${dinero(p.monto)}</td></tr>`).join("");
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Recibo ${c.id}</title>
  <style>body{font-family:system-ui,sans-serif;color:#0f172a;padding:40px}h1{margin:0;font-size:22px;color:#0b2a6b}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{border-bottom:1px solid #e2e8f0;padding:8px;text-align:left;font-size:13px}.t{font-size:20px;font-weight:700;color:#0b2a6b}.m{color:#64748b;font-size:13px}.r{display:flex;justify-content:space-between;font-size:14px;padding:4px 0}</style></head><body>
  <h1>HEGO · Centro de especialidades médicas</h1><p class="m">Recibo de pago N° ${c.id.toUpperCase()} · ${fechaHora(c.fecha)}</p>
  <p><b>Paciente:</b> ${c.paciente}${c.dni ? ` · C.C. ${c.dni}` : ""}<br><b>Servicio:</b> ${c.concepto}<br><b>Profesional:</b> ${c.profesional}${c.obraSocial ? `<br><b>EPS:</b> ${c.obraSocial}` : ""}${c.autorizacion ? `<br><b>Autorización:</b> ${c.autorizacion}` : ""}</p>
  ${eps > 0 ? `<div class="r"><span>Valor del servicio</span><b>${dinero(c.valor + eps)}</b></div><div class="r"><span>A cargo de la EPS</span><b>${dinero(eps)}</b></div>` : ""}
  <div class="r"><span>${c.tipoPagoEps ?? "Valor a pagar"}</span><b>${dinero(c.valor)}</b></div>
  <table><thead><tr><th>Fecha</th><th>Medio</th><th>Cobró</th><th style="text-align:right">Monto</th></tr></thead><tbody>${filas}</tbody></table>
  <p class="t">Total pagado: ${dinero(pagadoDe(c))}</p><p class="m">Saldo pendiente ${dinero(saldoDe(c))}</p>
  <p class="m" style="margin-top:28px">Este recibo es un soporte de pago, no reemplaza la factura electrónica.</p>
  <script>window.print()</script></body></html>`);
  w.document.close();
}

/** Excel del mes: cobros, pagos uno por uno y cierres de caja. */
async function exportarFinanzasExcel(mes: string, cobros: Cobro[], cierres: CierreCaja[]) {
  const XLSX = await import("@e965/xlsx");
  const delMes = cobros.filter((c) => diaLocal(c.fecha).slice(0, 7) === mes || c.pagos.some((p) => diaLocal(p.fecha).slice(0, 7) === mes));
  const hojaCobros = delMes.map((c) => ({
    Fecha: fechaHora(c.fecha), "Recibo N°": c.id.toUpperCase(), Paciente: c.paciente, "Cédula": c.dni ?? "", Servicio: c.concepto, Profesional: c.profesional,
    Cobertura: c.obraSocial || "Particular", "Tipo de pago": c.tipoPagoEps ?? "Particular", "Autorización": c.autorizacion ?? "",
    "Valor del servicio": c.valor + (c.aCargoEps ?? 0), "A cargo de la EPS": c.aCargoEps ?? 0, "Paga el paciente": c.valor, Pagado: pagadoDe(c), Saldo: saldoDe(c),
    Estado: estadoCobro(c), "Motivo de anulación": c.anulado?.motivo ?? "", Nota: c.nota ?? "",
  }));
  const hojaPagos = delMes.filter((c) => !c.anulado).flatMap((c) => c.pagos.filter((p) => diaLocal(p.fecha).slice(0, 7) === mes).map((p) => ({
    Fecha: fechaHora(p.fecha), Paciente: c.paciente, "Cédula": c.dni ?? "", Servicio: c.concepto, "Medio de pago": metodoTxt(p.metodo), "Cobró": p.cobradoPor, Monto: p.monto,
  })));
  const hojaCierres = cierres.filter((c) => c.fecha.slice(0, 7) === mes).map((c) => ({
    "Día": fechaCorta(c.fecha), Persona: c.persona, "Según el sistema": c.esperado, "Efectivo contado": c.declarado, Diferencia: c.declarado - c.esperado, "Aclaración": c.nota, "Registró": c.registradoPor,
  }));
  const porMedio = METODOS_PAGO.map((m) => ({ "Medio de pago": m, Total: hojaPagos.filter((p) => p["Medio de pago"] === m).reduce((a, p) => a + p.Monto, 0) })).filter((x) => x.Total > 0);
  const wb = XLSX.utils.book_new();
  const hoja = (filas: Record<string, unknown>[], nombre: string, vacio: string) => {
    const ws = XLSX.utils.json_to_sheet(filas.length ? filas : [{ "": vacio }]);
    const cols = Object.keys(filas[0] ?? { "": vacio });
    ws["!cols"] = cols.map((k) => ({ wch: Math.min(40, Math.max(k.length + 2, ...filas.map((f) => String(f[k] ?? "").length + 2))) }));
    XLSX.utils.book_append_sheet(wb, ws, nombre);
  };
  hoja(hojaCobros, "Cobros", "Sin cobros en este mes");
  hoja(hojaPagos, "Pagos recibidos", "Sin pagos en este mes");
  hoja(porMedio, "Por medio de pago", "Sin pagos en este mes");
  hoja(hojaCierres, "Cierres de caja", "Sin cierres en este mes");
  XLSX.writeFile(wb, `HEGO pagos y caja ${mes}.xlsx`);
  return hojaCobros.length;
}

function BotonExcel({ cobros, cierres, log }: { cobros: Cobro[]; cierres: CierreCaja[]; log: LogFn }) {
  const [mes, setMes] = useState(hoy().slice(0, 7));
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className={inp + " h-10 w-[150px] px-2.5 text-sm"} aria-label="Mes a exportar" />
      <button type="button" disabled={busy} onClick={async () => { setBusy(true); try { const n = await exportarFinanzasExcel(mes, cobros, cierres); log("Exportó pagos y caja a Excel", `${mes} · ${n} cobros`); toast.success("Excel descargado."); } catch { toast.error("No se pudo generar el Excel."); } setBusy(false); }}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#0b2a6b] ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-white/5 dark:text-sky-200 dark:ring-white/10">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <FileSpreadsheet className="size-4" />} Excel
      </button>
    </div>
  );
}

function BotonMesExcel({ alExportar, log, que }: { alExportar: (mes: string) => Promise<number>; log: LogFn; que: string }) {
  const [mes, setMes] = useState(hoy().slice(0, 7));
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className={inp + " h-10 w-[150px] px-2.5 text-sm"} aria-label="Mes a exportar" />
      <button type="button" disabled={busy} onClick={async () => { setBusy(true); try { const n = await alExportar(mes); log(`Exportó ${que} a Excel`, `${mes} · ${n} registros`); toast.success("Excel descargado."); } catch { toast.error("No se pudo generar el Excel."); } setBusy(false); }}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#0b2a6b] ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-white/5 dark:text-sky-200 dark:ring-white/10">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <FileSpreadsheet className="size-4" />} Excel
      </button>
    </div>
  );
}

/** Excel de facturación: comprobantes del mes, sus ítems, la cartera con cada EPS y las glosas. */
async function exportarFacturacionExcel(mes: string, facturas: Factura[]) {
  const XLSX = await import("@e965/xlsx");
  const delMes = facturas.filter((f) => diaLocal(f.fecha).slice(0, 7) === mes).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const abonado = (f: Factura) => (f.abonos ?? []).reduce((a, x) => a + x.valor, 0);
  const glosado = (f: Factura, e: Glosa["estado"]) => (f.glosas ?? []).filter((g) => g.estado === e).reduce((a, g) => a + g.valor, 0);
  const comp = delMes.map((f) => ({
    Tipo: f.tipo, "Número": f.numero, Fecha: fechaHora(f.fecha), "Paciente o entidad": f.receptor, "Cédula / NIT": f.docReceptor ?? "", Cobertura: f.cobertura, Periodo: f.periodo ?? "",
    Total: f.tipo === "Nota crédito" ? -f.total : f.total, Estado: f.estado, Saldo: saldoFactura(f), "Corrige factura": f.refFactura?.numero ?? "", "Motivo de anulación": f.anulacion?.motivo ?? f.motivo ?? "", "Emitió": f.emitidaPor,
  }));
  const items = delMes.flatMap((f) => f.items.map((i) => ({ "Número": f.numero, Tipo: f.tipo, Fecha: fechaDe(diaLocal(f.fecha)), Cobertura: f.cobertura, CUPS: i.cups ?? "", Servicio: i.desc, Cantidad: i.cant, "Valor unitario": i.precio, Total: i.cant * i.precio })));
  const cartera = facturas.filter((f) => f.estado !== "Anulada" && f.tipo !== "Nota crédito" && f.cobertura !== "Particular").sort((a, b) => a.cobertura.localeCompare(b.cobertura) || a.fecha.localeCompare(b.fecha)).map((f) => ({
    EPS: f.cobertura, NIT: f.docReceptor ?? "", "Número": f.numero, Fecha: fechaDe(diaLocal(f.fecha)), Periodo: f.periodo ?? "", Total: f.total, Radicado: f.radicacion?.numero ?? "", "Fecha de radicación": f.radicacion ? fechaDe(f.radicacion.fecha) : "",
    "Días desde la radicación": f.radicacion && saldoFactura(f) > 0 ? Math.floor((Date.now() - new Date(`${f.radicacion.fecha}T12:00:00`).getTime()) / 86400000) : "",
    Pagado: abonado(f), "Glosa aceptada": glosado(f, "Aceptada"), "Glosa en discusión": glosado(f, "En discusión"), Saldo: saldoFactura(f), Estado: saldoFactura(f) <= 0 ? "Pagada" : f.radicacion ? "Radicada" : "Sin radicar",
  }));
  const glosas = facturas.flatMap((f) => (f.glosas ?? []).map((g) => ({ EPS: f.cobertura, "Cuenta N.º": f.numero, Fecha: fechaDe(diaLocal(g.fecha)), Motivo: g.motivo, Valor: g.valor, Estado: g.estado, "Registró": g.por })));
  const wb = XLSX.utils.book_new();
  const hoja = (filas: Record<string, unknown>[], nombre: string, vacio: string) => {
    const ws = XLSX.utils.json_to_sheet(filas.length ? filas : [{ "": vacio }]);
    const cols = Object.keys(filas[0] ?? { "": vacio });
    ws["!cols"] = cols.map((k) => ({ wch: Math.min(48, Math.max(k.length + 2, ...filas.map((f) => String(f[k] ?? "").length + 2))) }));
    XLSX.utils.book_append_sheet(wb, ws, nombre);
  };
  hoja(comp, "Comprobantes del mes", "Sin comprobantes en este mes");
  hoja(items, "Detalle de servicios", "Sin comprobantes en este mes");
  hoja(cartera, "Cartera EPS", "Sin cuentas con EPS");
  hoja(glosas, "Glosas", "Sin glosas");
  XLSX.writeFile(wb, `HEGO facturación ${mes}.xlsx`);
  return comp.length;
}

function CobrosVista({ turnos, user, log }: { turnos: Turno[]; user: SessionUser; log: LogFn }) {
  const [cobros, setCobros] = useDato<Cobro[]>(KEY_COBROS, []);
  const [cierres] = useDato<CierreCaja[]>(KEY_CIERRES, []);
  const [padron] = useDato<PacienteClinica[]>(KEY_PADRON, []);
  const [tarifasG] = useDato<Tarifa[]>(KEY_TARIFAS, []);
  const quienes = useQuienCobra();
  // Precios: los de Facturación → Tarifas; si todavía no se cargaron, los de la lista base.
  const activas = tarifasG.filter((t) => t.activo);
  const catalogo: { nombre: string; precio: number; t?: Tarifa }[] = activas.length ? activas.map((t) => ({ nombre: t.nombre, precio: t.valor, t })) : SERVICIOS.map((x) => ({ nombre: x.nombre, precio: x.precio }));
  /** Precio del servicio: convenio con la EPS si existe, si no el particular. */
  const precioDe = (nombre: string, eps?: string) => { const c = catalogo.find((x) => x.nombre === nombre); return c ? (c.t ? valorTarifa(c.t, eps) : c.precio) : null; };
  const profDe = (nombre: string) => { const sv = SERVICIOS.find((x) => norm(x.nombre) === norm(nombre)); return sv ? nombrePanelDe(sv.doctorId) : null; };
  const base0 = catalogo[0] ?? { nombre: "Otro", precio: 0 };
  const vacio = { paciente: "", dni: "", concepto: base0.nombre, profesional: profDe(base0.nombre) ?? ADMINS[0]!.nombre, valor: String(base0.precio || ""), pagado: String(base0.precio || ""), metodo: "Efectivo" as MetodoPago, obraSocial: "", cobradoPor: quienes[0] ?? user.nombre, nota: "", turnoId: "", pacienteId: "", eps: false, tipoPagoEps: "Cuota moderadora" as (typeof TIPOS_PAGO_EPS)[number], cuota: "", autorizacion: "" };
  const fichaDe = (c: { pacienteId?: string | undefined; dni?: string | undefined; paciente: string }) =>
    padron.find((p) => (c.pacienteId && (p.id === c.pacienteId)) || (c.dni && p.dni === c.dni)) ?? padron.find((p) => norm(p.nombre) === norm(c.paciente));
  const [enviando, setEnviando] = useState<{ id: string; para: string } | null>(null);
  const [mandando, setMandando] = useState(false);
  const [f, setF] = useState(vacio);
  const [filtro, setFiltro] = useState<"Todos" | EstadoCobro>("Todos");
  const [q, setQ] = useState("");
  const [abonando, setAbonando] = useState<string | null>(null);
  const [abono, setAbono] = useState({ monto: "", metodo: "Efectivo" as MetodoPago, cobradoPor: quienes[0] ?? user.nombre });
  // Lo que paga el paciente: el valor del servicio, o solo la cuota moderadora / copago si va por EPS.
  const pagaPaciente = (x: typeof f) => (!x.eps ? Number(x.valor || 0) : x.tipoPagoEps === "Sin pago del paciente" ? 0 : Number(x.cuota || 0));
  const elegirPaciente = (nombre: string) => {
    const p = padron.find((x) => norm(x.nombre) === norm(nombre));
    setF((x) => ({ ...x, paciente: nombrePropio(nombre), ...(p ? { dni: p.dni ?? x.dni, pacienteId: p.id, ...(p.obraSocial && !/particular/i.test(p.obraSocial) ? { eps: true, obraSocial: p.obraSocial, pagado: x.cuota } : {}) } : {}) }));
  };
  const enviarCorreo = async () => {
    if (!enviando || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enviando.para.trim())) { toast.error("Escriba un correo válido."); return; }
    setMandando(true);
    const r = await enviarReciboPorCorreo(enviando.id, enviando.para.trim());
    setMandando(false);
    if (!r.ok) { toast.error(r.error); return; }
    if (r.prueba) toast.success(`Modo de prueba: el recibo para ${r.para} llegó a ${r.prueba}.`, { duration: 7000 });
    else toast.success(`Recibo enviado a ${r.para}.`);
    setEnviando(null);
  };
  const [anulando, setAnulando] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");

  const hoyIso = hoy();
  const mes = hoyIso.slice(0, 7);
  const validos = cobros.filter((c) => !c.anulado);
  const pagosHoy = validos.flatMap((c) => c.pagos).filter((p) => diaLocal(p.fecha) === hoyIso);
  const pagosMes = validos.flatMap((c) => c.pagos).filter((p) => diaLocal(p.fecha).slice(0, 7) === mes);
  const pacientesMes = new Set(validos.filter((c) => c.pagos.some((p) => diaLocal(p.fecha).slice(0, 7) === mes)).map((c) => (c.dni || c.paciente).toLowerCase())).size;
  const saldoTotal = validos.reduce((a, c) => a + saldoDe(c), 0);
  const conDeuda = validos.filter((c) => saldoDe(c) > 0).length;

  const porMetodo = [...new Set([...METODOS_PAGO, ...pagosMes.map((p) => metodoTxt(p.metodo))])].map((m) => ({ m, total: pagosMes.filter((p) => metodoTxt(p.metodo) === m).reduce((a, p) => a + p.monto, 0) })).filter((x) => x.total > 0);
  const maxMetodo = Math.max(1, ...porMetodo.map((x) => x.total));

  const sinCobrar = turnos.filter((t) => t.estado === "Atendido" && !cobros.some((c) => c.turnoId === t.id));

  const lista = cobros
    .filter((c) => filtro === "Todos" || estadoCobro(c) === filtro)
    .filter((c) => norm(`${c.paciente} ${c.dni ?? ""} ${c.concepto} ${c.profesional}`).includes(norm(q)))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  // Cuando llegan las tarifas, el servicio elegido se ajusta a esa lista.
  useEffect(() => {
    if (f.concepto !== "Otro" && !catalogo.some((x) => x.nombre === f.concepto) && catalogo[0]) elegirServicio(catalogo[0].nombre);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogo.map((x) => x.nombre).join("|")]);
  const elegirServicio = (nombre: string) => {
    const prof = profDe(nombre);
    setF((p) => { const v = precioDe(nombre, p.eps ? p.obraSocial : undefined); return { ...p, concepto: nombre, ...(v !== null ? { valor: String(v), pagado: p.eps ? p.pagado : String(v) } : {}), ...(prof ? { profesional: prof } : {}) }; });
  };

  const cobrarTurno = (t: Turno) => {
    const sv = SERVICIOS.find((x) => t.motivo.startsWith(x.especialidad));
    const s = (sv && catalogo.find((x) => norm(x.nombre) === norm(sv.nombre))) ?? catalogo.find((x) => norm(t.motivo).includes(norm(x.nombre))) ?? (sv ? { nombre: sv.nombre, precio: sv.precio } : base0);
    const p = fichaDe({ pacienteId: t.pacienteId, paciente: t.paciente });
    const conEps = !!(p?.obraSocial && !/particular/i.test(p.obraSocial));
    setF({ ...vacio, paciente: t.paciente, dni: p?.dni ?? "", concepto: s.nombre, profesional: t.doctor, valor: String(precioDe(s.nombre, conEps ? p!.obraSocial : undefined) ?? s.precio), pagado: conEps ? "" : String(s.precio), turnoId: t.id, pacienteId: t.pacienteId ?? p?.id ?? "", eps: conEps, obraSocial: conEps ? p!.obraSocial! : "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const registrar = (e: FormEvent) => {
    e.preventDefault();
    const total = Number(f.valor);
    const valor = pagaPaciente(f);
    const pagado = Number(f.pagado || 0);
    if (!total || total <= 0) {
      toast.error("Ingrese el valor del servicio.");
      return;
    }
    if (f.eps && !f.obraSocial.trim()) {
      toast.error("Escriba la EPS.");
      return;
    }
    if (valor < 0 || valor > total) {
      toast.error("Lo que paga el paciente no puede superar el valor del servicio.");
      return;
    }
    if (pagado < 0 || pagado > valor) {
      toast.error(f.eps ? `El paciente paga ${dinero(valor)}: no puede pagar más que eso.` : "El monto pagado no puede superar el valor.");
      return;
    }
    const ahora = new Date().toISOString();
    const nuevo: Cobro = {
      id: nuevoId(),
      fecha: ahora,
      paciente: f.paciente.trim(),
      concepto: f.concepto,
      profesional: f.profesional,
      valor,
      pagos: pagado > 0 ? [{ fecha: ahora, monto: pagado, metodo: f.metodo, cobradoPor: f.cobradoPor }] : [],
      ...(f.dni.trim() ? { dni: f.dni.replace(/\D/g, "") } : {}),
      ...(f.turnoId ? { turnoId: f.turnoId } : {}),
      ...(f.pacienteId ? { pacienteId: f.pacienteId } : {}),
      ...(f.eps ? { obraSocial: f.obraSocial.trim(), tipoPagoEps: f.tipoPagoEps, aCargoEps: total - valor, ...(f.autorizacion.trim() ? { autorizacion: f.autorizacion.trim() } : {}) } : {}),
      ...(f.nota.trim() ? { nota: f.nota.trim() } : {}),
    };
    setCobros((l) => [nuevo, ...l]);
    log("Cobro registrado", `${nuevo.paciente} · ${dinero(pagado)} de ${dinero(valor)}${f.eps ? ` (${f.tipoPagoEps} · ${f.obraSocial.trim()} cubre ${dinero(total - valor)})` : ""} · ${metodoTxt(f.metodo)} · cobró ${f.cobradoPor}`);
    toast.success(pagado >= valor ? "Cobro registrado." : "Cobro registrado con saldo pendiente.");
    setF({ ...vacio, cobradoPor: f.cobradoPor });
  };

  const agregarPago = (c: Cobro) => {
    const monto = Number(abono.monto);
    if (!monto || monto <= 0 || monto > saldoDe(c)) {
      toast.error(`Ingrese un monto entre $1 y ${dinero(saldoDe(c))}.`);
      return;
    }
    setCobros((l) => l.map((x) => (x.id === c.id ? { ...x, pagos: [...x.pagos, { fecha: new Date().toISOString(), monto, metodo: abono.metodo, cobradoPor: abono.cobradoPor }] } : x)));
    log("Pago de saldo registrado", `${c.paciente} · ${dinero(monto)} · ${abono.metodo} · cobró ${abono.cobradoPor}`);
    toast.success("Pago registrado.");
    setAbonando(null);
    setAbono({ ...abono, monto: "" });
  };

  const anular = (c: Cobro) => {
    if (motivo.trim().length < 4) {
      toast.error("Escriba el motivo de la anulación.");
      return;
    }
    setCobros((l) => l.map((x) => (x.id === c.id ? { ...x, anulado: { por: user.nombre, motivo: motivo.trim(), fecha: new Date().toISOString() } } : x)));
    log("Cobro anulado", `${c.paciente} · ${dinero(pagadoDe(c))} · motivo: ${motivo.trim()}`);
    toast.success("Cobro anulado. Queda registrado en auditoría.");
    setAnulando(null);
    setMotivo("");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Wallet} label="Cobrado hoy" value={dinero(pagosHoy.reduce((a, p) => a + p.monto, 0))} hint={`${pagosHoy.length} pago${pagosHoy.length === 1 ? "" : "s"}`} tono="verde" delay={0.05} />
        <Kpi icon={TrendingUp} label="Cobrado este mes" value={dinero(pagosMes.reduce((a, p) => a + p.monto, 0))} hint={`${pagosMes.length} pagos`} tono="azul" delay={0.1} />
        <Kpi icon={Users} label="Pacientes que pagaron" value={String(pacientesMes)} hint="Este mes" tono="violeta" delay={0.15} />
        <Kpi icon={Clock} label="Saldo por cobrar" value={dinero(saldoTotal)} hint={`${conDeuda} paciente${conDeuda === 1 ? "" : "s"} con deuda`} tono={saldoTotal ? "ambar" : "verde"} delay={0.2} />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Seccion icon={Plus} titulo="Registrar cobro" sub="Queda a nombre de quien cobró" className="xl:col-span-2" delay={0.1}>
          <form onSubmit={registrar} className="space-y-4">
            {f.turnoId && <p className="flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-xs text-sky-800 ring-1 ring-sky-100"><CalendarCheck className="size-4" /> Cobro de la cita atendida de {f.paciente}</p>}
            <div className="grid grid-cols-[1.5fr_1fr] gap-3">
              <Campo label="Paciente"><input required list="pacientes-cobro" value={f.paciente} onChange={(e) => elegirPaciente(e.target.value)} className={inp} /></Campo>
              <Campo label="Cédula"><input inputMode="numeric" value={f.dni} onChange={(e) => setF({ ...f, dni: e.target.value })} className={inp} /></Campo>
            </div>
            <datalist id="pacientes-cobro">{Array.from(new Set([...padron.map((p) => p.nombre), ...turnos.map((t) => t.paciente)])).map((p) => <option key={p} value={p} />)}</datalist>
            <Campo label="Servicio">
              <select value={f.concepto} onChange={(e) => elegirServicio(e.target.value)} className={inp}>
                {catalogo.map((s) => <option key={s.nombre}>{s.nombre}</option>)}
                <option>Otro</option>
              </select>
              <p className="mt-1 text-[11px] text-muted-foreground">{activas.length ? (f.eps && f.obraSocial && catalogo.find((x) => x.nombre === f.concepto)?.t?.porEps && precioDe(f.concepto, f.obraSocial) !== catalogo.find((x) => x.nombre === f.concepto)?.precio ? `Precio del convenio con ${f.obraSocial} (Facturación → Tarifas).` : "Precio tomado de Facturación → Tarifas.") : "Precios de la lista base. Cárguelos en Facturación → Tarifas para usar los suyos."}</p>
            </Campo>
            <Campo label="Profesional">
              <select value={f.profesional} onChange={(e) => setF({ ...f, profesional: e.target.value })} className={inp}>{ADMINS.map((a) => <option key={a.id}>{a.nombre}</option>)}</select>
            </Campo>
            <Campo label="Valor del servicio"><input required type="number" min="1" value={f.valor} onChange={(e) => setF({ ...f, valor: e.target.value, ...(f.eps ? {} : { pagado: e.target.value }) })} className={inp + " font-semibold tabular-nums"} /></Campo>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1 dark:bg-white/5">
              {([[false, "Particular"], [true, "EPS / prepagada"]] as const).map(([v, l]) => (
                <button key={l} type="button" onClick={() => { const pv = precioDe(f.concepto, v ? f.obraSocial : undefined); const valor = pv !== null ? String(pv) : f.valor; setF({ ...f, eps: v, valor, pagado: v ? String(pagaPaciente({ ...f, eps: true, valor })) : valor }); }} className={`rounded-lg py-2 text-xs font-semibold transition ${f.eps === v ? "bg-card text-[#0b2a6b] shadow-sm dark:text-sky-200" : "text-muted-foreground hover:text-foreground"}`}>{l}</button>
              ))}
            </div>
            {f.eps && (
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/5">
                <div className="grid grid-cols-[1.4fr_1fr] gap-3">
                  <Campo label="EPS"><input value={f.obraSocial} onChange={(e) => { const v = precioDe(f.concepto, e.target.value); setF({ ...f, obraSocial: e.target.value, ...(v !== null ? { valor: String(v) } : {}) }); }} placeholder="Sura, Sanitas, Nueva EPS…" className={inp} /></Campo>
                  <Campo label="N° de autorización"><input value={f.autorizacion} onChange={(e) => setF({ ...f, autorizacion: e.target.value })} placeholder="Opcional" className={inp} /></Campo>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">El paciente paga</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {TIPOS_PAGO_EPS.map((t) => (
                      <button key={t} type="button" onClick={() => { const nx = { ...f, tipoPagoEps: t }; setF({ ...nx, pagado: String(pagaPaciente(nx)) }); }} className={`rounded-lg px-2 py-2 text-[11px] font-semibold leading-tight transition ${f.tipoPagoEps === t ? "bg-[#0b2a6b] text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10"}`}>{t}</button>
                    ))}
                  </div>
                </div>
                {f.tipoPagoEps !== "Sin pago del paciente" && (
                  <Campo label={f.tipoPagoEps === "Copago" ? "Valor del copago" : "Valor de la cuota moderadora"}>
                    <input type="number" min="0" value={f.cuota} onChange={(e) => { const nx = { ...f, cuota: e.target.value }; setF({ ...nx, pagado: String(pagaPaciente(nx)) }); }} className={inp + " font-semibold tabular-nums"} />
                    {f.tipoPagoEps === "Copago" && Number(f.valor) > 0 && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground">Calcular:</span>
                        {[10, 15, 20, 30].map((pc) => (
                          <button key={pc} type="button" onClick={() => { const nx = { ...f, cuota: String(Math.round((Number(f.valor) * pc) / 100)) }; setF({ ...nx, pagado: nx.cuota }); }} className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">{pc}%</button>
                        ))}
                      </div>
                    )}
                  </Campo>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-white p-2.5 ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10"><p className="text-muted-foreground">Paga el paciente</p><p className="font-semibold tabular-nums">{dinero(pagaPaciente(f))}</p></div>
                  <div className="rounded-xl bg-white p-2.5 ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10"><p className="text-muted-foreground">A cargo de la EPS</p><p className="font-semibold tabular-nums">{dinero(Math.max(0, Number(f.valor || 0) - pagaPaciente(f)))}</p></div>
                </div>
              </div>
            )}
            <Campo label={f.eps ? "El paciente paga ahora" : "Paga ahora"}><input type="number" min="0" value={f.pagado} onChange={(e) => setF({ ...f, pagado: e.target.value })} className={inp + " font-semibold tabular-nums"} /></Campo>
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Medio de pago</p>
              <div className="grid grid-cols-3 gap-1.5">
                {METODOS_PAGO.map((m) => (
                  <button key={m} type="button" onClick={() => setF({ ...f, metodo: m })} className={`rounded-xl px-2 py-2 text-xs font-semibold transition-all ${f.metodo === m ? "bg-[#0b2a6b] text-white shadow-md" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{m}</button>
                ))}
              </div>
            </div>
            <Campo label="Cobró">
              <select value={f.cobradoPor} onChange={(e) => setF({ ...f, cobradoPor: e.target.value })} className={inp}>{quienes.map((n) => <option key={n}>{n}</option>)}</select>
            </Campo>
            <Campo label="Nota (opcional)"><input value={f.nota} onChange={(e) => setF({ ...f, nota: e.target.value })} className={inp} /></Campo>
            {Number(f.pagado || 0) < pagaPaciente(f) && <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">Queda un saldo de <b>{dinero(pagaPaciente(f) - Number(f.pagado || 0))}</b> a cobrarle al paciente.</p>}
            <Button type="submit" className="h-12 w-full rounded-xl !bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"><Check className="size-4" /> Registrar cobro</Button>
          </form>
        </Seccion>

        <div className="min-w-0 space-y-6 xl:col-span-3">
          <Seccion icon={CalendarCheck} titulo="Citas atendidas sin cobrar" sub="Marque la cita como Atendido en Citas y aparece aquí" delay={0.15}>
            {sinCobrar.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="size-4 text-emerald-600" /> No hay citas atendidas pendientes de cobro.</p>
            ) : (
              <div className="space-y-2">
                {sinCobrar.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl bg-amber-50/70 p-3 ring-1 ring-amber-100">
                    <Avatar nombre={t.paciente} size="size-9" />
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{t.paciente}</p><p className="text-xs text-muted-foreground">{fechaCorta(t.fecha)} {hora12(t.hora)} · {t.motivo} · {nombreCorto(t.doctor)}</p></div>
                    <Button size="sm" className="rounded-lg" onClick={() => cobrarTurno(t)}><Wallet className="size-4" /> Cobrar</Button>
                  </div>
                ))}
              </div>
            )}
          </Seccion>

          <Seccion icon={Activity} titulo="Medios de pago del mes" delay={0.2}>
            {porMetodo.length === 0 ? <p className="text-sm text-muted-foreground">Todavía no hay cobros este mes.</p> : (
              <div className="space-y-3">
                {porMetodo.map(({ m, total }) => (
                  <div key={m}>
                    <div className="mb-1 flex justify-between text-sm"><span className="font-medium">{m}</span><span className="font-semibold tabular-nums">{dinero(total)}</span></div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-secondary"><div className={`pn-bar h-full rounded-full bg-gradient-to-r ${COLOR_METODO[m]}`} style={{ width: `${(total / maxMetodo) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            )}
          </Seccion>
        </div>
      </div>

      <Seccion icon={Receipt} titulo="Cobros registrados" sub={`${lista.length} resultado${lista.length === 1 ? "" : "s"}`} delay={0.25}
        acciones={<div className="flex flex-wrap items-center gap-2"><BotonExcel cobros={cobros} cierres={cierres} log={log} /><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input placeholder="Paciente, cédula, servicio..." value={q} onChange={(e) => setQ(e.target.value)} className={inp + " h-10 pl-9 sm:w-60"} /></div></div>}>
        <div className="mb-4 flex flex-wrap gap-2">
          {(["Todos", "Pagado", "Parcial", "Pendiente", "Anulado"] as const).map((x) => {
            const n = x === "Todos" ? cobros.length : cobros.filter((c) => estadoCobro(c) === x).length;
            return (
              <button key={x} onClick={() => setFiltro(x)} className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${filtro === x ? "pn-acc-tile text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {x} <span className={`rounded-full px-1.5 tabular-nums ${filtro === x ? "bg-white/20" : "bg-background"}`}>{n}</span>
              </button>
            );
          })}
        </div>
        {lista.length === 0 && <Vacio icon={Receipt} titulo="Sin cobros" texto="Los cobros que registre aquí quedan con el nombre de quien cobró, para que los doctores puedan controlarlos." />}
        <div className="space-y-2">
          {lista.map((c) => {
            const est = estadoCobro(c);
            const ult = c.pagos[c.pagos.length - 1];
            return (
              <div key={c.id} className={`rounded-2xl border border-border/70 p-4 transition-colors hover:bg-secondary/30 ${c.anulado ? "opacity-60" : ""}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <Avatar nombre={c.paciente} />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-semibold">{c.paciente} <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${ESTADO_COBRO[est]}`}>{est}</span></p>
                    <p className="text-xs text-muted-foreground">{c.concepto} · {nombreCorto(c.profesional)} · {fechaHora(c.fecha)}{c.dni ? ` · C.C. ${c.dni}` : ""}</p>
                    {c.obraSocial && c.tipoPagoEps && <p className="text-xs text-muted-foreground">{c.obraSocial} · {c.tipoPagoEps}{c.aCargoEps ? ` · la EPS cubre ${dinero(c.aCargoEps)}` : ""}{c.autorizacion ? ` · Aut. ${c.autorizacion}` : ""}</p>}
                    {ult && <p className="text-xs text-muted-foreground">Último pago: {metodoTxt(ult.metodo)} · cobró <b className="text-foreground/80">{ult.cobradoPor}</b></p>}
                    {c.anulado && <p className="text-xs text-rose-700">Anulado por {nombreCorto(c.anulado.por)}: {c.anulado.motivo}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-semibold tabular-nums">{dinero(pagadoDe(c))}</p>
                    <p className="text-xs text-muted-foreground">de {dinero(c.valor)}{saldoDe(c) > 0 ? <> · <span className="font-semibold text-amber-700">debe {dinero(saldoDe(c))}</span></> : null}</p>
                  </div>
                </div>
                {!c.anulado && (
                  <div className="mt-3 flex flex-wrap gap-1.5 pl-[52px]">
                    {saldoDe(c) > 0 && <button onClick={() => { setAbonando(abonando === c.id ? null : c.id); setAbono({ ...abono, monto: String(saldoDe(c)) }); }} className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">Registrar pago</button>}
                    <button onClick={() => imprimirRecibo(c)} className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium hover:bg-secondary/70"><Printer className="size-3" /> Imprimir recibo</button>
                    <button onClick={() => setEnviando(enviando?.id === c.id ? null : { id: c.id, para: fichaDe(c)?.email ?? "" })} className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium hover:bg-secondary/70"><Mail className="size-3" /> Por correo</button>
                    <a href={(() => { const tel = fichaDe(c)?.telefono; return tel ? waDe(tel, textoRecibo(c)) : `https://wa.me/?text=${encodeURIComponent(textoRecibo(c))}`; })()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium hover:bg-secondary/70"><MessageCircle className="size-3" /> Por WhatsApp</a>
                    <button onClick={() => { setAnulando(anulando === c.id ? null : c.id); setMotivo(""); }} className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">Anular</button>
                  </div>
                )}
                {enviando?.id === c.id && (
                  <div className="mt-3 flex flex-wrap gap-2 rounded-xl bg-secondary/50 p-3">
                    <input autoFocus type="email" placeholder="Correo del paciente" value={enviando.para} onChange={(e) => setEnviando({ id: c.id, para: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") void enviarCorreo(); }} className={inp + " h-10 flex-1"} />
                    <Button onClick={() => void enviarCorreo()} disabled={mandando} className="h-10 rounded-xl">{mandando ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Enviar recibo</Button>
                  </div>
                )}
                {abonando === c.id && (
                  <div className="mt-3 grid gap-2 rounded-xl bg-secondary/50 p-3 sm:grid-cols-4">
                    <input type="number" value={abono.monto} onChange={(e) => setAbono({ ...abono, monto: e.target.value })} className={inp + " h-10"} />
                    <select value={abono.metodo} onChange={(e) => setAbono({ ...abono, metodo: e.target.value as MetodoPago })} className={inp + " h-10"}>{METODOS_PAGO.map((m) => <option key={m}>{m}</option>)}</select>
                    <select value={abono.cobradoPor} onChange={(e) => setAbono({ ...abono, cobradoPor: e.target.value })} className={inp + " h-10"}>{quienes.map((n) => <option key={n}>{n}</option>)}</select>
                    <Button onClick={() => agregarPago(c)} className="h-10 rounded-xl"><Check className="size-4" /> Guardar</Button>
                  </div>
                )}
                {anulando === c.id && (
                  <div className="mt-3 flex flex-wrap gap-2 rounded-xl bg-rose-50 p-3 ring-1 ring-rose-100">
                    <input autoFocus placeholder="Motivo de la anulación (obligatorio)" value={motivo} onChange={(e) => setMotivo(e.target.value)} className={inp + " h-10 flex-1"} />
                    <Button onClick={() => anular(c)} className="h-10 rounded-xl !bg-rose-600 text-white"><Ban className="size-4" /> Confirmar anulación</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Seccion>
    </div>
  );
}

const diaLocal = (iso: string) => isoDe(new Date(iso));

function nombrePanelDe(doctorId: string) {
  const d = DOCTORS.find((x) => x.id === doctorId);
  return ADMINS.find((a) => a.id === d?.foto)?.nombre ?? ADMINS[0]!.nombre;
}

function CajaVista({ user, log }: { user: SessionUser; log: LogFn }) {
  const [cobros] = useDato<Cobro[]>(KEY_COBROS, []);
  const [equipo, setEquipo] = useDato<Persona[]>(KEY_EQUIPO, EQUIPO_INICIAL);
  const [cierres, setCierres] = useDato<CierreCaja[]>(KEY_CIERRES, []);
  const quienes = useQuienCobra();
  const [dia, setDia] = useState(hoy());
  const [nuevo, setNuevo] = useState({ nombre: "", rol: "Secretaria" });
  const [ci, setCi] = useState({ persona: quienes[0] ?? "", declarado: "", nota: "" });

  const pagosDia = cobros.filter((c) => !c.anulado).flatMap((c) => c.pagos.map((p) => ({ ...p, paciente: c.paciente }))).filter((p) => diaLocal(p.fecha) === dia);
  const anulDia = cobros.filter((c) => c.anulado && diaLocal(c.anulado.fecha) === dia);
  const personas = Array.from(new Set([...quienes, ...pagosDia.map((p) => p.cobradoPor)]));
  const resumen = personas.map((n) => {
    const ps = pagosDia.filter((p) => p.cobradoPor === n);
    return {
      n,
      total: ps.reduce((a, p) => a + p.monto, 0),
      efectivo: ps.filter((p) => p.metodo === "Efectivo").reduce((a, p) => a + p.monto, 0),
      cant: ps.length,
      ultimo: ps.map((p) => p.fecha).sort().pop(),
      cierre: cierres.find((c) => c.fecha === dia && c.persona === n),
    };
  });
  const esperado = resumen.find((r) => r.n === ci.persona)?.efectivo ?? 0;

  const alertas = [
    ...anulDia.map((c) => ({ t: `Cobro anulado: ${c.paciente} (${dinero(pagadoDe(c))})`, d: `Por ${nombreCorto(c.anulado!.por)} · ${c.anulado!.motivo}`, tipo: "rojo" as const })),
    ...cierres.filter((c) => c.fecha === dia && c.declarado !== c.esperado).map((c) => ({ t: `Diferencia de caja de ${c.persona}: ${dinero(c.declarado - c.esperado)}`, d: c.nota || "Sin aclaración", tipo: "ambar" as const })),
    ...cobros.filter((c) => !c.anulado && saldoDe(c) > 0 && (Date.now() - new Date(c.fecha).getTime()) / 86400000 > 7).map((c) => ({ t: `Saldo sin cobrar hace más de 7 días: ${c.paciente}`, d: `Debe ${dinero(saldoDe(c))}`, tipo: "ambar" as const })),
  ];

  const agregarPersona = (e: FormEvent) => {
    e.preventDefault();
    if (!nuevo.nombre.trim()) return;
    setEquipo((l) => [...l, { id: nuevoId(), nombre: nuevo.nombre.trim(), rol: nuevo.rol, activo: true }]);
    log("Persona agregada al equipo", `${nuevo.nombre.trim()} · ${nuevo.rol}`);
    setNuevo({ nombre: "", rol: "Secretaria" });
  };

  const cerrar = (e: FormEvent) => {
    e.preventDefault();
    const declarado = Number(ci.declarado);
    if (Number.isNaN(declarado) || ci.declarado === "") {
      toast.error("Ingrese el efectivo contado.");
      return;
    }
    const c: CierreCaja = { id: nuevoId(), fecha: dia, persona: ci.persona, esperado, declarado, nota: ci.nota.trim(), registradoPor: user.nombre, creado: new Date().toISOString() };
    setCierres((l) => [c, ...l.filter((x) => !(x.fecha === dia && x.persona === ci.persona))]);
    log("Cierre de caja", `${ci.persona} · ${fechaCorta(dia)} · sistema ${dinero(esperado)} · contado ${dinero(declarado)} · diferencia ${dinero(declarado - esperado)}`);
    toast.success(declarado === esperado ? "Caja cerrada sin diferencias." : "Caja cerrada con diferencia. Quedó registrada.");
    setCi({ ...ci, declarado: "", nota: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Día</span>
        <input type="date" value={dia} onChange={(e) => setDia(e.target.value)} className={inp + " !w-auto"} />
        <span className="text-sm text-muted-foreground">{pagosDia.length} pagos · {dinero(pagosDia.reduce((a, p) => a + p.monto, 0))}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resumen.map((r, i) => (
          <div key={r.n} className="pn-card pn-up pn-lift p-5" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center gap-3">
              <Avatar nombre={r.n} />
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{r.n}</p><p className="text-xs text-muted-foreground">{r.ultimo ? `Último cobro ${new Date(r.ultimo).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}` : "Sin cobros este día"}</p></div>
              {r.cierre ? (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${r.cierre.declarado === r.cierre.esperado ? "bg-emerald-100 text-emerald-800 ring-emerald-200" : "bg-amber-100 text-amber-800 ring-amber-200"}`}>{r.cierre.declarado === r.cierre.esperado ? "Caja OK" : "Diferencia"}</span>
              ) : r.cant > 0 ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">Sin cerrar</span> : null}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-secondary/60 p-2"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Cobró</p><p className="text-sm font-semibold tabular-nums">{dinero(r.total)}</p></div>
              <div className="rounded-xl bg-secondary/60 p-2"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Efectivo</p><p className="text-sm font-semibold tabular-nums">{dinero(r.efectivo)}</p></div>
              <div className="rounded-xl bg-secondary/60 p-2"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pagos</p><p className="text-sm font-semibold tabular-nums">{r.cant}</p></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Seccion icon={Wallet} titulo="Cierre de caja" sub="Compare el efectivo contado con lo registrado" className="xl:col-span-2" delay={0.1}>
          <form onSubmit={cerrar} className="space-y-4">
            <Campo label="Persona"><select value={ci.persona} onChange={(e) => setCi({ ...ci, persona: e.target.value })} className={inp}>{personas.map((n) => <option key={n}>{n}</option>)}</select></Campo>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-secondary/60 p-3"><p className="text-xs text-muted-foreground">Efectivo según sistema</p><p className="font-display text-xl font-semibold tabular-nums">{dinero(esperado)}</p></div>
              <Campo label="Efectivo contado"><input type="number" min="0" value={ci.declarado} onChange={(e) => setCi({ ...ci, declarado: e.target.value })} className={inp + " font-semibold tabular-nums"} /></Campo>
            </div>
            {ci.declarado !== "" && Number(ci.declarado) !== esperado && <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-100">Diferencia de {dinero(Number(ci.declarado) - esperado)}</p>}
            <Campo label="Aclaración (opcional)"><input value={ci.nota} onChange={(e) => setCi({ ...ci, nota: e.target.value })} className={inp} /></Campo>
            <Button type="submit" className="h-11 w-full rounded-xl"><Check className="size-4" /> Cerrar caja</Button>
          </form>
        </Seccion>

        <Seccion icon={ShieldCheck} titulo="Alertas para los doctores" sub="Anulaciones, diferencias y deudas viejas" className="xl:col-span-3" delay={0.15}>
          {alertas.length === 0 ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="size-4 text-emerald-600" /> Sin alertas para este día.</p> : (
            <div className="space-y-2">
              {alertas.map((a, i) => (
                <div key={i} className={`flex items-start gap-3 rounded-xl p-3 ring-1 ${a.tipo === "rojo" ? "bg-rose-50 ring-rose-100" : "bg-amber-50 ring-amber-100"}`}>
                  <Ban className={`mt-0.5 size-4 shrink-0 ${a.tipo === "rojo" ? "text-rose-600" : "text-amber-600"}`} />
                  <div><p className="text-sm font-semibold">{a.t}</p><p className="text-xs text-muted-foreground">{a.d}</p></div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 border-t border-border/60 pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pagos del día, uno por uno</p>
            {pagosDia.length === 0 && <p className="text-sm text-muted-foreground">No hay pagos.</p>}
            <ol className="space-y-2">
              {[...pagosDia].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((p, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-20 shrink-0 whitespace-nowrap tabular-nums text-muted-foreground">{new Date(p.fecha).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="min-w-0 flex-1 truncate">{p.paciente} · <span className="text-muted-foreground">{p.metodo}</span></span>
                  <span className="text-xs text-muted-foreground">{nombreCorto(p.cobradoPor)}</span>
                  <span className="font-semibold tabular-nums">{dinero(p.monto)}</span>
                </li>
              ))}
            </ol>
          </div>
        </Seccion>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Seccion icon={Users} titulo="Equipo que cobra" sub="Secretarias y administrativos" delay={0.2}>
          <form onSubmit={agregarPersona} className="mb-4 grid gap-2 sm:grid-cols-[1.4fr_1fr_auto]">
            <input placeholder="Nombre y apellido" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: nombrePropio(e.target.value) })} className={inp} />
            <select value={nuevo.rol} onChange={(e) => setNuevo({ ...nuevo, rol: e.target.value })} className={inp}>{["Secretaria", "Recepción", "Administración", "Facturación"].map((r) => <option key={r}>{r}</option>)}</select>
            <Button type="submit" variant="outline" className="h-11 rounded-xl"><Plus className="size-4" /> Agregar</Button>
          </form>
          <div className="space-y-2">
            {equipo.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border/70 p-3">
                <Avatar nombre={p.nombre} size="size-9" />
                <div className="flex-1"><p className="text-sm font-semibold">{p.nombre}</p><p className="text-xs text-muted-foreground">{p.rol}</p></div>
                <button onClick={() => { setEquipo((l) => l.map((x) => (x.id === p.id ? { ...x, activo: !x.activo } : x))); log(p.activo ? "Persona desactivada" : "Persona activada", p.nombre); }} className={`rounded-lg px-2.5 py-1 text-xs font-medium ${p.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{p.activo ? "Activa" : "Inactiva"}</button>
              </div>
            ))}
          </div>
        </Seccion>

        <Seccion icon={ClipboardList} titulo="Historial de cierres" delay={0.25} acciones={<BotonExcel cobros={cobros} cierres={cierres} log={log} />}>
          {cierres.length === 0 && <p className="text-sm text-muted-foreground">Todavía no hay cierres de caja.</p>}
          <div className="space-y-2">
            {cierres.slice(0, 12).map((c) => {
              const dif = c.declarado - c.esperado;
              return (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border/70 p-3 text-sm">
                  <span className="w-20 shrink-0 font-medium tabular-nums">{fechaCorta(c.fecha)}</span>
                  <span className="min-w-0 flex-1 truncate">{c.persona}</span>
                  <span className="text-xs text-muted-foreground">{dinero(c.declarado)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${dif === 0 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{dif === 0 ? "OK" : dinero(dif)}</span>
                </div>
              );
            })}
          </div>
        </Seccion>
      </div>
    </div>
  );
}

/* ---------- Permisos ---------- */
function PermisosTab({ permisos, setPermisos, log, user }: { permisos: Permisos; setPermisos: Dispatch<SetStateAction<Permisos>>; log: LogFn; user: SessionUser }) {
  const [abierta, setAbierta] = useState<string | null>(AREAS[0]!.nombre);
  const [q, setQ] = useState("");
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");

  const areas = TODAS_AREAS.filter((a) => norm(`${a.nombre} ${a.desc}`).includes(norm(q)));

  const cambiar = (area: string, modulo: string, nivel: Nivel) => {
    setPermisos((p) => {
      const base = Object.fromEntries(MODULOS.map((m) => [m, nivelDe(p, area, m)])) as Record<string, Nivel>;
      return { ...p, [area]: { ...base, [modulo]: nivel } };
    });
    log("Permiso modificado", `${area} · ${modulo}: ${NIVELES[nivel]}`);
  };

  const todo = (area: string, nivel: Nivel) => {
    setPermisos((p) => ({ ...p, [area]: mk(Object.fromEntries(MODULOS.filter((m) => m !== "Permisos").map((m) => [m, nivel]))) }));
    log("Permisos masivos", `${area}: todos los módulos en "${NIVELES[nivel]}"`);
  };

  const guardarClave = async (e: FormEvent) => {
    e.preventDefault();
    const res = await cambiarClave(user.id, actual, nueva);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    log("Contraseña cambiada", "Cambio de contraseña del administrador");
    toast.success("Contraseña actualizada.");
    setActual("");
    setNueva("");
  };

  return (
    <div className="space-y-6">
      <div className="pn-up flex items-start gap-4 rounded-[1.25rem] bg-gradient-to-r from-[#071a46] via-[#0b2a6b] to-[#1d4ed8] p-5 text-white shadow-lg">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/30"><Users className="size-5" /></span>
        <div className="text-sm">
          <p className="font-display text-lg font-semibold">Pacientes por especialidad</p>
          <p className="mt-1 text-white/80">Los <b>médicos invitados</b> (Medicina Interna, Cardiología, Nefrología, Endocrinología…) solo ven a los pacientes de <b>su especialidad</b>: los que tienen cita de esa especialidad o con ellos, consultas suyas o la especialidad marcada en la ficha.</p>
          <p className="mt-1 text-white/80">Los <b>dueños</b> (Dr. Carlos Alonso, Dr. Carlos Alberto) y <b>Dirección general</b> ven a todos. Recepción, Secretaría, Enfermería y Facturación también ven a todos para poder dar citas, tomar signos y cobrar.</p>
        </div>
      </div>
      <PersonalEquipo user={user} log={log} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi icon={Building2} label="Departamentos" value={String(TODAS_AREAS.length)} hint={`${ESPECIALIDADES_MED.length} especialidades médicas y ${AREAS.length} áreas`} tono="azul" delay={0.05} />
        <Kpi icon={ShieldCheck} label="Módulos" value={String(MODULOS.length)} hint="Incluye el Asistente IA" tono="violeta" delay={0.1} />
        <Kpi icon={Bot} label="Con acceso a IA" value={String(AREAS.filter((a) => nivelDe(permisos, a.nombre, "Asistente IA") !== "ninguno").length)} hint="Departamentos que pueden consultar" tono="verde" delay={0.15} />
      </div>

      <Seccion icon={KeyRound} titulo="Permisos por departamento" sub="Los administradores (Dr. Carlos Alonso y Dr. Carlos Alberto Gómez Bolaño) tienen acceso total." delay={0.2}
        acciones={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Buscar departamento..." value={q} onChange={(e) => setQ(e.target.value)} className={inp + " h-10 pl-9 sm:w-60"} />
          </div>
        }>
        <div className="space-y-3">
          {areas.map((a, idx) => {
            const abiertaEsta = abierta === a.nombre;
            const titulo = idx === 0 || !!areas[idx - 1]?.medica !== !!a.medica ? (a.medica ? "Especialidades médicas · médicos invitados" : "Áreas de la clínica") : null;
            const conAcceso = MODULOS.filter((m) => nivelDe(permisos, a.nombre, m) !== "ninguno").length;
            return (
              <Fragment key={a.nombre}>
              {titulo && <p className="flex items-center gap-2 px-1 pt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground"><span className="h-1 w-3 rounded-full bg-gradient-to-r from-sky-400 to-rose-400" />{titulo}</p>}
              <div className={`overflow-hidden rounded-2xl border transition-all ${abiertaEsta ? "border-primary/30 shadow-card ring-4 ring-primary/5" : "border-border hover:border-primary/20"}`}>
                <button onClick={() => setAbierta(abiertaEsta ? null : a.nombre)} className="flex w-full items-center gap-4 p-4 text-left">
                  <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors ${abiertaEsta ? "gradient-deep text-white" : "bg-secondary text-primary"}`}>
                    <a.icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{a.nombre}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                  <div className="hidden w-32 sm:block">
                    <div className="mb-1 text-right text-[11px] text-muted-foreground">{conAcceso}/{MODULOS.length} módulos</div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(conAcceso / MODULOS.length) * 100}%` }} />
                    </div>
                  </div>
                  <ChevronDown className={`size-5 shrink-0 text-muted-foreground transition-transform duration-300 ${abiertaEsta ? "rotate-180" : ""}`} />
                </button>

                {abiertaEsta && (
                  <div className="border-t border-border bg-secondary/30 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" className="rounded-lg" onClick={() => todo(a.nombre, "ver")}><Eye className="size-3.5" /> Todo solo ver</Button>
                      <Button size="sm" variant="outline" className="rounded-lg" onClick={() => todo(a.nombre, "ninguno")}><Ban className="size-3.5" /> Quitar todo</Button>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {MODULOS.map((m) => {
                        const actualN = nivelDe(permisos, a.nombre, m);
                        return (
                          <div key={m} className="flex items-center justify-between gap-3 rounded-xl bg-card p-2.5 pl-3.5 ring-1 ring-border">
                            <span className="flex items-center gap-2 text-sm font-medium">
                              {m === "Asistente IA" && <Bot className="size-3.5 text-violet-600" />}
                              {m}
                            </span>
                            <div className="flex rounded-lg bg-secondary p-0.5">
                              {(Object.keys(NIVELES) as Nivel[]).map((n) => {
                                const I = NIVEL_ICON[n];
                                const on = actualN === n;
                                const color = n === "editar" ? "bg-primary text-white" : n === "ver" ? "bg-sky-600 text-white" : "bg-slate-500 text-white";
                                return (
                                  <button key={n} title={NIVELES[n]} onClick={() => cambiar(a.nombre, m, n)} className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${on ? `${color} shadow-sm` : "text-muted-foreground hover:text-foreground"}`}>
                                    <I className="size-3" /> <span className="hidden sm:inline">{n === "ninguno" ? "No" : n === "ver" ? "Ver" : "Editar"}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              </Fragment>
            );
          })}
          {areas.length === 0 && <Vacio icon={Search} texto="No se encontró ese departamento." />}
        </div>
      </Seccion>

      <Seccion icon={Lock} titulo="Seguridad" sub={`Cambie su contraseña de administrador (${user.nombre}).`} delay={0.25}>
        <form onSubmit={guardarClave} className="grid gap-4 sm:grid-cols-3">
          <Campo label="Contraseña actual"><input type="password" required value={actual} onChange={(e) => setActual(e.target.value)} className={inp} /></Campo>
          <Campo label="Nueva contraseña"><input type="password" required placeholder="Mínimo 8 caracteres" value={nueva} onChange={(e) => setNueva(e.target.value)} className={inp} /></Campo>
          <div className="flex items-end"><Button type="submit" className="h-11 w-full rounded-xl"><Check className="size-4" /> Guardar contraseña</Button></div>
        </form>
      </Seccion>
    </div>
  );
}

/* ---------- Asistente IA ---------- */
type Msg = { id: string; de: "yo" | "ia"; texto: string; quien?: string };
type Ctx = { turnos: Turno[]; movs: Mov[]; permisos: Permisos; audit: Evento[]; rol: string };

const ROL_ADMIN = "Administrador";

function generarInsights(turnos: Turno[], movs: Mov[]): string[] {
  const h = hoy();
  const deHoy = turnos.filter((t) => t.fecha === h && t.estado !== "Cancelado");
  const pend = turnos.filter((t) => t.estado === "Pendiente");
  const ing = movs.filter((m) => m.tipo === "Ingreso").reduce((a, m) => a + m.monto, 0);
  const egr = movs.filter((m) => m.tipo === "Egreso").reduce((a, m) => a + m.monto, 0);
  const out: string[] = [];
  out.push(deHoy.length ? `Hoy hay ${deHoy.length} cita${deHoy.length === 1 ? "" : "s"}; la próxima es a las ${hora12([...deHoy].sort((a, b) => a.hora.localeCompare(b.hora))[0]!.hora).replace(/\.$/, "")}.` : "Hoy no hay citas agendadas.");
  if (pend.length) out.push(`${pend.length} cita${pend.length === 1 ? "" : "s"} sigue${pend.length === 1 ? "" : "n"} pendiente${pend.length === 1 ? "" : "s"}: conviene confirmarla${pend.length === 1 ? "" : "s"} para evitar ausencias.`);
  if (ing + egr > 0) out.push(`Los egresos representan el ${Math.round((egr / Math.max(1, ing)) * 100)}% de los ingresos; balance de ${dinero(ing - egr)}.`);
  return out;
}

function puede(ctx: Ctx, modulo: string) {
  return ctx.rol === ROL_ADMIN || nivelDe(ctx.permisos, ctx.rol, modulo) !== "ninguno";
}

function listaTurnos(ts: Turno[]) {
  return ts
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
    .map((t) => `• ${fechaCorta(t.fecha)} ${hora12(t.hora)} — ${t.paciente} (${t.motivo}) · ${nombreCorto(t.doctor)} · ${t.estado}`)
    .join("\n");
}

function responder(pregunta: string, ctx: Ctx): string {
  const p = norm(pregunta);
  const tiene = (...ws: string[]) => ws.some((w) => p.includes(w));
  const sinPermiso = (m: string) => `🔒 El departamento ${ctx.rol} no tiene acceso al módulo "${m}". Pídale a un administrador que lo habilite en Permisos.`;

  if (ctx.rol !== ROL_ADMIN && nivelDe(ctx.permisos, ctx.rol, "Asistente IA") === "ninguno") {
    return `🔒 ${ctx.rol} no tiene habilitado el Asistente IA. Un administrador puede activarlo desde Permisos.`;
  }

  if (tiene("hola", "ayuda", "que podes", "que sabe", "buen dia", "buenas")) {
    return "¡Hola! Puedo responderle sobre:\n• Citas de hoy, de mañana, pendientes o canceladas\n• Citas de un paciente o de un doctor\n• Ingresos, egresos y balance\n• Permisos de cada departamento\n• Actividad reciente y quién hizo cada cambio\nPruebe con: \"¿cuántas citas hay hoy?\"";
  }

  // Permisos de un departamento
  if (tiene("permiso", "acceso", "puede ver", "puede editar")) {
    if (!puede(ctx, "Permisos")) return sinPermiso("Permisos");
    const area = AREAS.find((a) => p.includes(norm(a.nombre)) || p.includes(norm(a.nombre.split(" ")[0]!)));
    if (!area) return `¿De qué departamento? Tengo: ${AREAS.map((a) => a.nombre).join(", ")}.`;
    const filas = MODULOS.map((m) => `• ${m}: ${NIVELES[nivelDe(ctx.permisos, area.nombre, m)]}`).join("\n");
    return `Permisos de ${area.nombre}:\n${filas}`;
  }

  // Finanzas
  if (tiene("balance", "ingreso", "egreso", "finanz", "plata", "dinero", "caja", "gasto", "ganancia", "factur", "cobr")) {
    if (!puede(ctx, "Finanzas")) return sinPermiso("Finanzas");
    const ing = ctx.movs.filter((m) => m.tipo === "Ingreso");
    const egr = ctx.movs.filter((m) => m.tipo === "Egreso");
    const ti = ing.reduce((a, m) => a + m.monto, 0);
    const te = egr.reduce((a, m) => a + m.monto, 0);
    const mayorE = [...egr].sort((a, b) => b.monto - a.monto)[0];
    const mayorI = [...ing].sort((a, b) => b.monto - a.monto)[0];
    return [
      `💰 Ingresos: ${dinero(ti)} (${ing.length} movimientos)`,
      `📉 Egresos: ${dinero(te)} (${egr.length} movimientos)`,
      `📊 Balance: ${dinero(ti - te)}`,
      mayorI ? `El ingreso más alto fue "${mayorI.concepto}" por ${dinero(mayorI.monto)}.` : "",
      mayorE ? `El gasto más alto fue "${mayorE.concepto}" por ${dinero(mayorE.monto)}.` : "",
    ].filter(Boolean).join("\n");
  }

  // Auditoría
  if (tiene("actividad", "auditor", "quien", "ultimo", "cambio", "movimiento del panel", "registro")) {
    if (!puede(ctx, "Auditoría")) return sinPermiso("Auditoría");
    if (!ctx.audit.length) return "Todavía no hay actividad registrada.";
    return "Últimas acciones en el panel:\n" + ctx.audit.slice(0, 6).map((e) => `• ${fechaHora(e.fecha)} — ${nombreCorto(e.usuario)}: ${e.accion}${e.detalle ? ` (${e.detalle})` : ""}`).join("\n");
  }

  // A partir de acá, todo es sobre turnos
  if (!puede(ctx, "Turnos")) return sinPermiso("Turnos");

  const paciente = ctx.turnos.find((t) => norm(t.paciente).split(" ").some((w) => w.length > 2 && p.includes(w)));
  if (paciente && !tiene("alberto", "alonso")) {
    const ts = ctx.turnos.filter((t) => t.paciente === paciente.paciente);
    return `Citas de ${paciente.paciente}:\n${listaTurnos(ts)}`;
  }

  const doctor = ADMINS.find((a) => p.includes(norm(a.id)));
  if (doctor) {
    const ts = ctx.turnos.filter((t) => t.doctor === doctor.nombre && t.estado !== "Cancelado");
    return ts.length ? `Agenda de ${nombreCorto(doctor.nombre)} (${ts.length}):\n${listaTurnos(ts)}` : `${nombreCorto(doctor.nombre)} no tiene citas activos.`;
  }

  if (tiene("cancel")) {
    const ts = ctx.turnos.filter((t) => t.estado === "Cancelado");
    return ts.length ? `Citas canceladas (${ts.length}):\n${listaTurnos(ts)}` : "No hay citas canceladas. 👍";
  }
  if (tiene("pendiente", "confirmar", "sin confirmar")) {
    const ts = ctx.turnos.filter((t) => t.estado === "Pendiente");
    return ts.length ? `Hay ${ts.length} cita${ts.length === 1 ? "" : "s"} pendiente${ts.length === 1 ? "" : "s"}:\n${listaTurnos(ts)}` : "No hay citas pendientes. Todo confirmado ✅";
  }
  if (tiene("manana")) {
    const ts = ctx.turnos.filter((t) => t.fecha === maniana() && t.estado !== "Cancelado");
    return ts.length ? `Mañana hay ${ts.length} cita${ts.length === 1 ? "" : "s"}:\n${listaTurnos(ts)}` : "Mañana no hay citas agendadas.";
  }
  if (tiene("hoy", "turno", "agenda", "proximo", "cuantos")) {
    const ts = ctx.turnos.filter((t) => t.fecha === hoy() && t.estado !== "Cancelado");
    if (!ts.length) return "Hoy no hay citas agendadas.";
    const prox = ts.filter((t) => t.hora >= new Date().toTimeString().slice(0, 5)).sort((a, b) => a.hora.localeCompare(b.hora))[0];
    return `Hoy hay ${ts.length} cita${ts.length === 1 ? "" : "s"}${prox ? ` (el próximo es ${prox.paciente} a las ${hora12(prox.hora)})` : ""}:\n${listaTurnos(ts)}`;
  }
  if (tiene("resumen", "como viene", "como va", "estado", "dia")) {
    return generarInsights(ctx.turnos, puede(ctx, "Finanzas") ? ctx.movs : []).join("\n");
  }

  return "No estoy seguro de haber entendido 🤔. Pruebe preguntando por citas de hoy, pendientes, un paciente, un doctor, el balance o los permisos de un departamento.";
}

const SUGERENCIAS = [
  "¿Cuántos citas hay hoy?",
  "¿Qué citas están pendientes?",
  "¿Cómo está el balance?",
  "Agenda del Dr. Carlos Alonso Gómez Bolaño",
  "Permisos de Recepción",
  "¿Quién hizo los últimos cambios?",
];

function AsistenteTab({ turnos, movs, permisos, audit, log, user }: { turnos: Turno[]; movs: Mov[]; permisos: Permisos; audit: Evento[]; log: LogFn; user: SessionUser }) {
  const [rol, setRol] = useState(ROL_ADMIN);
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: "hola", de: "ia", texto: `¡Hola, ${nombreCorto(user.nombre)}! Soy el asistente de la clínica. Pregúnteme por citas, finanzas, permisos o actividad. Si elige un departamento arriba, respondo solo con lo que ese departamento tiene permitido ver.` },
  ]);
  const fin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs, pensando]);

  const enviar = (q: string) => {
    const pregunta = q.trim();
    if (!pregunta || pensando) return;
    setMsgs((m) => [...m, { id: uid(), de: "yo", texto: pregunta, quien: rol }]);
    setTexto("");
    setPensando(true);
    log("Consulte al asistente", `${rol}: ${pregunta.slice(0, 80)}`);
    window.setTimeout(() => {
      const r = responder(pregunta, { turnos, movs, permisos, audit, rol });
      setMsgs((m) => [...m, { id: uid(), de: "ia", texto: r }]);
      setPensando(false);
    }, 650);
  };

  const areasIA = AREAS.filter((a) => nivelDe(permisos, a.nombre, "Asistente IA") !== "ninguno");

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <section className="pn-card pn-up flex h-[640px] flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-gradient-to-r from-indigo-600 via-blue-700 to-sky-600 p-4 text-white">
          <div className="flex items-center gap-3">
            <span className="relative flex size-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <Bot className="size-5" />
              <span className="pn-online absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 ring-2 ring-blue-700" />
            </span>
            <div className="leading-tight">
              <p className="font-semibold">Asistente de la clínica</p>
              <p className="text-xs text-white/75">Responda con los datos del panel en tiempo real</p>
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs">
            <span className="text-white/80">Consultar como</span>
            <select value={rol} onChange={(e) => setRol(e.target.value)} className="h-9 rounded-lg border-0 bg-white/15 px-2.5 text-sm text-white outline-none ring-1 ring-white/25 [&>option]:text-foreground">
              <option value={ROL_ADMIN}>{ROL_ADMIN}</option>
              {AREAS.map((a) => <option key={a.nombre} value={a.nombre}>{a.nombre}</option>)}
            </select>
          </label>
        </div>

        <div className="pn-noscroll pn-cross-dark flex-1 space-y-4 overflow-y-auto bg-secondary/30 p-4 sm:p-6">
          {msgs.map((m) => (
            <div key={m.id} className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${m.de === "yo" ? "flex-row-reverse" : ""}`}>
              {m.de === "ia" ? (
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white"><Bot className="size-4" /></span>
              ) : (
                <Avatar nombre={user.nombre} size="size-8" />
              )}
              <div className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${m.de === "yo" ? "rounded-tr-sm gradient-deep text-white" : "rounded-tl-sm bg-card ring-1 ring-border"}`}>
                {m.de === "yo" && m.quien !== ROL_ADMIN && <p className="mb-1 text-[10px] uppercase tracking-wider text-white/70">Como {m.quien}</p>}
                {m.texto}
              </div>
            </div>
          ))}
          {msgs.length === 1 && !pensando && (
            <div className="grid gap-3 pt-2 sm:grid-cols-2 animate-in fade-in slide-in-from-bottom-3 duration-500">
              {[
                { icon: CalendarDays, t: "Agenda de hoy", q: "¿Cuántos citas hay hoy?" },
                { icon: Clock, t: "Pendientes", q: "¿Qué citas están pendientes?" },
                { icon: Wallet, t: "Finanzas", q: "¿Cómo está el balance?" },
                { icon: KeyRound, t: "Permisos", q: "Permisos de Recepción" },
              ].map((c) => (
                <button key={c.t} onClick={() => enviar(c.q)} className="pn-card group flex items-center gap-3 p-4 text-left transition-transform hover:-translate-y-0.5">
                  <span className="pn-acc-tile flex size-10 shrink-0 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-110"><c.icon className="size-4" /></span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{c.t}</span>
                    <span className="block truncate text-xs text-muted-foreground">{c.q}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
          {pensando && (
            <div className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white"><Bot className="size-4" /></span>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-card px-4 py-3 ring-1 ring-border">
                {[0, 1, 2].map((i) => <span key={i} className="pn-dot size-2 rounded-full bg-primary" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          )}
          <div ref={fin} />
        </div>

        <div className="border-t border-border bg-card p-3 sm:p-4">
          <div className="pn-noscroll mb-3 flex gap-2 overflow-x-auto pb-1">
            {SUGERENCIAS.map((s) => (
              <button key={s} onClick={() => enviar(s)} className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); enviar(texto); }} className="flex gap-2">
            <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escriba su consulta..." className={inp} />
            <Button type="submit" disabled={!texto.trim() || pensando} className="h-11 rounded-xl px-5"><Send className="size-4" /></Button>
          </form>
        </div>
      </section>

      <div className="space-y-6">
        <Seccion icon={ShieldCheck} titulo="Respeta los permisos" delay={0.1}>
          <p className="text-sm text-muted-foreground">
            Cada departamento solo recibe respuestas de los módulos que tiene habilitados. Las consultas quedan registradas en Auditoría.
          </p>
        </Seccion>
        <Seccion icon={Users} titulo="Departamentos con IA" sub={`${areasIA.length} de ${AREAS.length}`} delay={0.15}>
          <div className="flex flex-wrap gap-2">
            {areasIA.map((a) => (
              <button key={a.nombre} onClick={() => setRol(a.nombre)} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${rol === a.nombre ? "gradient-deep text-white" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"}`}>
                <a.icon className="size-3" /> {a.nombre}
              </button>
            ))}
          </div>
        </Seccion>
        <div className="pn-up rounded-2xl border border-dashed border-border p-4 text-xs text-muted-foreground" style={{ animationDelay: ".2s" }}>
          <Clock className="mb-1 size-4" />
          Por ahora el asistente funciona dentro del navegador con los datos del panel. Cuando conecte el backend se puede enlazar a una IA real para consultas libres.
        </div>
      </div>
    </div>
  );
}

/* ---------- Horarios de atención ---------- */
const ADMIN_A_DOCTOR: Record<string, string> = { alberto: "d1", alonso: "d2" };
const ORDEN_DIAS = [1, 2, 3, 4, 5, 6, 0];

function Interruptor({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="inline-flex items-center gap-3 text-sm font-medium">
      <span className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${on ? "pn-acc-tile" : "bg-slate-300"}`}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all duration-300 ${on ? "left-[22px]" : "left-0.5"}`} />
      </span>
      {label}
    </button>
  );
}

/** Una fecha cualquiera que cae en ese día de la semana (para calcular turnos). */
function isoDiaSemana(d: number) {
  const x = new Date(2026, 0, 4 + d); // 4/1/2026 es domingo
  return isoDe(x);
}


/** JSON con las claves ordenadas, para comparar agendas sin importar el orden en que vienen del servidor. */
const canonico = (v: unknown): string =>
  JSON.stringify(v, (_k, x: unknown) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))) : x));

/** Selector de hora fácil: lista de 15 en 15 minutos, en formato 8:00 a. m. / 2:30 p. m. */
const HORAS_SELECTOR = Array.from({ length: (22 - 5) * 4 + 1 }, (_, i) => {
  const m = 5 * 60 + i * 15;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
});
function SelectorHora({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const opciones = HORAS_SELECTOR.includes(value) || !value ? HORAS_SELECTOR : [...HORAS_SELECTOR, value].sort();
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={inp.replace("w-full", "") + " h-11 w-full min-w-0 cursor-pointer px-2.5 font-medium tabular-nums sm:w-[8.5rem]"}>
      {opciones.map((h) => <option key={h} value={h}>{hora12(h)}</option>)}
    </select>
  );
}

function HorariosTab({ user, log, puedeEditarOtros, inicial = null }: { user: SessionUser; log: LogFn; puedeEditarOtros: boolean; inicial?: string | null }) {
  const [agendas, setAgendas] = useDato<Agendas>(KEY_AGENDA, {});
  const [personal] = useDato<Personal[]>(KEY_ENFERMERIA, []);
  const esAdmin = ADMIN_IDS.includes(user.id);
  // Profesionales con agenda + médicos del equipo (Permisos y accesos) que todavía no tienen horarios
  const conAgenda = profesionalesAgenda(agendas);
  const profesionales = [
    ...conAgenda,
    ...personal
      .filter((p) => p.activo && esAreaMedica(areaDe(p)) && !conAgenda.some((c) => c.id === p.id || c.nombre === p.nombre))
      .map((p) => ({ id: p.id, nombre: p.nombre, especialidad: areaDe(p).replace(" (médicos)", ""), admin: false })),
  ];
  const [sel, setSel] = useState<string>(inicial ?? (esAdmin ? user.id : ADMINS[0]!.id));
  const [nuevo, setNuevo] = useState({ nombre: "", especialidad: "" });
  const [agregando, setAgregando] = useState(false);
  const guardada = agendaDe(agendas, sel);
  const [draft, setDraft] = useState<AgendaDoctor>(guardada);
  const [bloq, setBloq] = useState({ desde: hoy(), hasta: hoy(), motivo: "" });
  const firma = JSON.stringify(guardada);

  // Si llega una versión nueva del servidor, solo se reemplaza el borrador cuando no hay cambios sin guardar
  // (antes la sincronización cada 20 s podía borrar lo que el médico estaba editando).
  const firmaPrev = useRef(firma);
  const selPrev = useRef(sel);
  useEffect(() => {
    const cambioDoctor = selPrev.current !== sel;
    setDraft((d) => (cambioDoctor || canonico(d) === canonico(JSON.parse(firmaPrev.current) as AgendaDoctor) ? agendaDe(agendas, sel) : d));
    firmaPrev.current = firma;
    selPrev.current = sel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, firma]);

  const cambios = canonico(draft) !== canonico(guardada);
  const set = (patch: Partial<AgendaDoctor>) => setDraft((d) => ({ ...d, ...patch }));
  const prof = profesionales.find((p) => p.id === sel) ?? profesionales[0]!;
  const admin = { nombre: prof.nombre };
  const doctor = DOCTORS.find((d) => d.id === ADMIN_A_DOCTOR[sel]);
  /** Los médicos editan lo suyo; los demás profesionales los maneja la secretaría (o los médicos). */
  const editable = (id: string) => (ADMIN_IDS.includes(id) ? id === user.id : esAdmin || puedeEditarOtros);
  const proximos = proximosDias(draft, 6);
  const slots = horariosDelDia(draft, proximos[0]);
  // Citas ya tomadas que quedarían fuera del horario (o en vacaciones) con estos cambios
  const [turnosAg] = useDato<Turno[]>("gb_turnos", []);
  const afectadas = turnosAg
    .filter((t) => t.doctor === prof?.nombre && t.fecha >= hoy() && t.estado !== "Cancelado" && t.estado !== "Atendido")
    .filter((t) => !atiendeEl(draft, t.fecha) || !horariosDelDia(draft, t.fecha).includes(t.hora))
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  /** Prende / apaga un día y le pone un horario inicial (el del último día cargado). */
  const toggleDia = (d: number) => {
    const on = draft.dias.includes(d);
    const pd = { ...(draft.porDia ?? {}) };
    if (on) delete pd[String(d)];
    else {
      const ultimo = draft.dias.length ? rangoDia(draft, draft.dias[draft.dias.length - 1]!) : { desde: "08:00", hasta: "12:00" };
      pd[String(d)] = { ...ultimo };
    }
    set({ dias: on ? draft.dias.filter((x) => x !== d) : [...draft.dias, d], porDia: pd });
  };
  const setRango = (d: number, patch: Partial<RangoDia>) =>
    set({ porDia: { ...(draft.porDia ?? {}), [String(d)]: { ...rangoDia(draft, d), ...patch } } });
  /** Divide el día en mañana y tarde (con almuerzo en el medio) o lo vuelve jornada continua. */
  const toggleTarde = (d: number) => {
    const r = rangoDia(draft, d);
    const m = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
    const hh = (x: number) => `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`;
    const nuevo: RangoDia = r.pausaDesde && r.pausaHasta
      ? { desde: r.desde, hasta: r.pausaDesde }
      : { desde: r.desde, pausaDesde: r.hasta, pausaHasta: hh(Math.min(m(r.hasta) + 120, 20 * 60)), hasta: hh(Math.min(m(r.hasta) + 360, 22 * 60)) };
    set({ porDia: { ...(draft.porDia ?? {}), [String(d)]: nuevo } });
  };
  const copiarATodos = (d: number) => {
    const r = rangoDia(draft, d);
    set({ porDia: Object.fromEntries(draft.dias.map((x) => [String(x), { ...r }])) });
    toast.success(`Horario del ${NOMBRES_DIA[d]!.toLowerCase()} copiado a todos sus días.`);
  };
  /* ----- Bloques de atención (día + horario + qué atiende + duración) ----- */
  const bloques = bloquesDe(draft);
  const opcionesServicio = (() => {
    const docId = ADMIN_A_DOCTOR[sel];
    const base = docId ? ESPECIALIDADES.filter((e) => e.doctorIds.includes(docId)).map((e) => e.nombre) : [prof.especialidad].filter(Boolean);
    return [...new Set([...base, ...bloques.map((b) => b.servicio).filter((x) => x && x !== "*")])];
  })();
  const servicioPrincipal = opcionesServicio.find((x) => /cardiolog|nefrolog/i.test(x)) ?? opcionesServicio[0] ?? "Consulta";
  const setBloques = (lista: BloqueAgenda[]) =>
    set({ bloques: lista, dias: [...new Set(lista.map((b) => b.dia))].sort(), duracion: lista[0]?.duracion ?? draft.duracion });
  const conServicio = (b: BloqueAgenda) => (b.servicio === "*" ? { ...b, servicio: servicioPrincipal } : b);
  const agregarBloque = (dia: number) => {
    const delDia = bloques.filter((b) => b.dia === dia).sort((x, y) => x.hasta.localeCompare(y.hasta));
    const ult = delDia[delDia.length - 1];
    const m = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
    const hh = (x: number) => `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`;
    const desde = ult ? hh(Math.min(m(ult.hasta) + 120, 20 * 60)) : "08:00";
    const nuevoB: BloqueAgenda = { id: uid(), dia, desde, hasta: hh(Math.min(m(desde) + 240, 22 * 60)), servicio: ult && ult.servicio !== "*" ? ult.servicio : servicioPrincipal, duracion: ult?.duracion ?? 20 };
    setBloques([...bloques.map(conServicio), nuevoB]);
  };
  const cambiarBloque = (id: string, patch: Partial<BloqueAgenda>) => setBloques(bloques.map((b) => (b.id === id ? { ...conServicio(b), ...patch } : conServicio(b))));
  const quitarBloque = (id: string) => setBloques(bloques.filter((b) => b.id !== id).map(conServicio));
  const [copiando, setCopiando] = useState<number | null>(null);
  const copiarDiaA = (origen: number, destinos: number[]) => {
    const fuente = bloques.filter((b) => b.dia === origen).map(conServicio);
    setBloques([...bloques.filter((b) => !destinos.includes(b.dia)).map(conServicio), ...destinos.flatMap((dest) => fuente.map((b) => ({ ...b, id: uid(), dia: dest })))]);
  };
  const togglePausa = (d: number) => {
    const r = rangoDia(draft, d);
    // Pausa sugerida: 30 minutos a mitad del horario de ese día (después la cambian)
    const m = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
    const hh = (x: number) => `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`;
    const medio = Math.floor((m(r.desde) + m(r.hasta)) / 2 / 30) * 30;
    const nuevo: RangoDia = r.pausaDesde ? { desde: r.desde, hasta: r.hasta } : { ...r, pausaDesde: hh(medio), pausaHasta: hh(medio + 30) };
    set({ porDia: { ...(draft.porDia ?? {}), [String(d)]: nuevo } });
  };

  const propia = editable(sel);
  const agregarProfesional = () => {
    const nombre = nuevo.nombre.trim();
    if (!nombre || !nuevo.especialidad.trim()) {
      toast.error("Complete el nombre y la especialidad.");
      return;
    }
    const id = "p-" + uid();
    setAgendas((p) => ({ ...p, [id]: { ...agendaDe({}, id), nombre, especialidad: nuevo.especialidad.trim() } }));
    log("Profesional agregado a la agenda", `${nombre} · ${nuevo.especialidad}`);
    setNuevo({ nombre: "", especialidad: "" });
    setAgregando(false);
    setSel(id);
    toast.success("Profesional agregado. Ahora carga sus días y horarios.");
  };
  const quitarProfesional = async () => {
    if (ADMIN_IDS.includes(sel) || !propia) return;
    if (!(await preguntar({ titulo: `¿Quitar a ${prof.nombre} de la agenda?`, texto: "Deja de aparecer para pedir citas.", aceptar: "Sí, quitar" }))) return;
    setAgendas((p) => {
      const c = { ...p };
      delete c[sel];
      return c;
    });
    log("Profesional quitado de la agenda", prof.nombre);
    setSel(ADMINS[0]!.id);
  };

  /** Guarda y publica en la web en el momento (lo usan el horario simple, las vacaciones y el editor avanzado). */
  const [publicando, setPublicando] = useState(false);
  const publicarAgenda = async (base: AgendaDoctor, lista: BloqueAgenda[], aviso = "Listo. Ya se ve en la web.") => {
    const final = { ...base, ...(prof.admin ? {} : { nombre: prof.nombre, especialidad: prof.especialidad }), bloques: lista, dias: [...new Set(lista.map((b) => b.dia))].sort(), duracion: lista[0]?.duracion ?? base.duracion, pausa: false, desde: lista.map((b) => b.desde).sort()[0] ?? base.desde, hasta: lista.map((b) => b.hasta).sort().reverse()[0] ?? base.hasta };
    setDraft(final);
    setPublicando(true);
    const r = await guardarYConfirmar<Agendas>(KEY_AGENDA, { ...leerDato<Agendas>(KEY_AGENDA, {}), [sel]: final });
    setPublicando(false);
    if (!r.ok) {
      toast.error(`No se pudo publicar: ${r.error}`, { duration: 9000 });
      return;
    }
    const quedo = r.remoto[sel] as AgendaDoctor | undefined;
    if (!quedo || canonico(quedo.bloques ?? []) !== canonico(final.bloques)) {
      toast.error("El servidor no aceptó el cambio. Revise que haya ingresado con su propio usuario de médico.", { duration: 9000 });
      return;
    }
    log("Horarios actualizados", `${admin.nombre}: ${resumenAgenda(final)}`);
    toast.success(aviso, { description: "Guardado en el servidor ✓", duration: 6000 });
  };
  const guardar = () => {
    if (!propia) {
      toast.error("No puede modificar estos horarios.");
      return;
    }
    const lista = bloques.map(conServicio);
    if (lista.length === 0) {
      toast.error("Agregue al menos un horario de atención.");
      return;
    }
    const malo = lista.find((b) => b.desde >= b.hasta);
    if (malo) {
      toast.error(`${NOMBRES_DIA[malo.dia]}: la hora de inicio tiene que ser anterior a la de fin.`);
      return;
    }
    const cruce = lista.find((b) => lista.some((o) => o.id !== b.id && o.dia === b.dia && b.desde < o.hasta && o.desde < b.hasta));
    if (cruce) {
      toast.error(`${NOMBRES_DIA[cruce.dia]}: dos horarios se pisan. Revise las horas de ese día.`);
      return;
    }
    publicarAgenda(draft, lista, "Horarios publicados en la web.");
  };

  /* ----- Horario simple (como una obra social): días + de/a + cada cuánto + almuerzo ----- */
  const deBloques = (() => {
    const bs = bloquesDe(guardada).map(conServicio);
    const dias = [...new Set(bs.map((b) => b.dia))].sort();
    const ref = bs.filter((b) => b.dia === dias[0]).sort((x, y) => x.desde.localeCompare(y.desde));
    const forma = (d: number) => bs.filter((b) => b.dia === d).sort((x, y) => x.desde.localeCompare(y.desde)).map((b) => `${b.desde}-${b.hasta}-${b.duracion}-${b.servicio}`).join("|");
    const uniforme = dias.length > 0 && ref.length <= 2 && dias.every((d) => forma(d) === forma(dias[0]!)) && (ref.length < 2 || (ref[0]!.duracion === ref[1]!.duracion && ref[0]!.servicio === ref[1]!.servicio));
    if (!uniforme) return { personalizado: bs.length > 0, v: { dias: [1, 2, 3, 4, 5], desde: "08:00", hasta: "18:00", cada: 20, almuerzo: true, almDesde: "12:00", almHasta: "13:00", servicio: servicioPrincipal } };
    return { personalizado: false, v: { dias, desde: ref[0]!.desde, hasta: ref[ref.length - 1]!.hasta, cada: ref[0]!.duracion, almuerzo: ref.length === 2, almDesde: ref.length === 2 ? ref[0]!.hasta : "12:00", almHasta: ref.length === 2 ? ref[1]!.desde : "13:00", servicio: ref[0]!.servicio } };
  })();
  const [rap, setRap] = useState(deBloques.v);
  useEffect(() => setRap(deBloques.v), [sel, firma]); // eslint-disable-line react-hooks/exhaustive-deps
  const bloquesRapido = (): BloqueAgenda[] =>
    rap.dias.flatMap((dia) =>
      (rap.almuerzo ? [[rap.desde, rap.almDesde], [rap.almHasta, rap.hasta]] : [[rap.desde, rap.hasta]]).map(([a, b]) => ({ id: uid(), dia, desde: a!, hasta: b!, servicio: rap.servicio, duracion: rap.cada })),
    );
  const citasPorDia = bloquesRapido().filter((b) => b.dia === rap.dias[0]).reduce((n, b) => n + horasDeBloque(b).length, 0);
  const guardarRapido = () => {
    if (!propia) return toast.error("No puede modificar estos horarios.");
    if (rap.dias.length === 0) return toast.error("Elija los días que atiende.");
    if (rap.desde >= rap.hasta) return toast.error("La hora de inicio tiene que ser antes que la de fin.");
    if (rap.almuerzo && !(rap.desde < rap.almDesde && rap.almDesde < rap.almHasta && rap.almHasta < rap.hasta)) return toast.error("El almuerzo tiene que quedar dentro del horario de atención.");
    publicarAgenda({ ...draft, activo: true }, bloquesRapido(), "¡Listo! Su horario ya se ve en la web para sacar citas.");
  };

  const agregarBloqueo = (e: FormEvent) => {
    e.preventDefault();
    if (bloq.hasta < bloq.desde) {
      toast.error("La fecha de fin no puede ser anterior a la de inicio.");
      return;
    }
    publicarAgenda({ ...guardada, bloqueos: [...guardada.bloqueos, { id: uid(), ...bloq, motivo: bloq.motivo.trim() || "No atiende" }] }, bloquesDe(guardada).map(conServicio), "Listo. Esos días ya no se pueden reservar.");
    setBloq({ desde: hoy(), hasta: hoy(), motivo: "" });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {profesionales.map((a) => {
          const ag = agendaDe(agendas, a.id);
          const on = sel === a.id;
          const f = fotoDe(a.id);
          const etiqueta = a.id === user.id ? "Sus horarios" : editable(a.id) ? "Puede editar" : "Solo ver";
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setSel(a.id)}
              className={`pn-card pn-up flex items-center gap-4 p-4 text-left transition-all ${on ? "ring-4 ring-[rgba(var(--acc),.18)]" : "opacity-80 hover:opacity-100"}`}
            >
              {f ? <img src={f} alt="" className="size-14 rounded-2xl object-cover object-top" /> : <span className="pn-acc-tile flex size-14 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-white">{iniciales(a.nombre)}</span>}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{a.nombre}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{a.especialidad}{a.admin ? " · Administrador" : ""}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${etiqueta === "Solo ver" ? "bg-secondary text-muted-foreground" : "bg-[rgba(var(--acc),.12)] text-[rgb(var(--acc))]"}`}>{etiqueta}</span>
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{resumenAgenda(ag)}</p>
              </div>
              <span className={`size-2.5 shrink-0 rounded-full ${ag.activo && ag.dias.length ? "bg-emerald-500" : "bg-slate-400"}`} />
            </button>
          );
        })}
        {(esAdmin || puedeEditarOtros) && (
          agregando ? (
            <div className="pn-card flex flex-col gap-2 p-4">
              <input value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} placeholder="Nombre del profesional" list="personal-medico" className={inp + " h-10"} />
              <datalist id="personal-medico">{personal.filter((p) => p.activo && esAreaMedica(areaDe(p))).map((p) => <option key={p.id} value={p.nombre} />)}</datalist>
              <input value={nuevo.especialidad} onChange={(e) => setNuevo({ ...nuevo, especialidad: e.target.value })} placeholder="Especialidad (ej: Cardiología)" list="especialidades-web" className={inp + " h-10"} />
              <datalist id="especialidades-web">{ESPECIALIDADES.map((e) => <option key={e.slug} value={e.nombre} />)}</datalist>
              <div className="flex gap-2">
                <Button type="button" onClick={agregarProfesional} className="h-9 flex-1 rounded-xl"><Plus className="size-4" /> Agregar a la agenda</Button>
                <Button type="button" variant="ghost" onClick={() => setAgregando(false)} className="h-9 rounded-xl">Cancelar</Button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setAgregando(true)} className="flex min-h-[5.5rem] items-center justify-center gap-2 rounded-[1.25rem] border-2 border-dashed border-border text-sm font-semibold text-muted-foreground transition hover:border-[rgb(var(--acc))] hover:text-[rgb(var(--acc))]">
              <Plus className="size-4" /> Agregar profesional
            </button>
          )
        )}
      </div>

      {propia && !prof.admin && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-900 ring-1 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-200 dark:ring-sky-500/30">
          <Users className="size-4 shrink-0" /> <span className="flex-1">Horarios de {prof.nombre}: los carga la secretaría según lo que indique el profesional, con supervisión de los médicos. Cada cambio queda en Auditoría.</span>
          <Button type="button" variant="ghost" size="sm" onClick={quitarProfesional} className="rounded-xl text-rose-600 hover:bg-rose-100"><Trash2 className="size-4" /> Quitar de la agenda</Button>
        </div>
      )}
      {!propia && (
        <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/30">
          <Lock className="size-4 shrink-0" /> Está viendo los horarios de {admin.nombre}. {prof.admin ? "Solo él puede modificarlos desde su usuario." : "Los carga la secretaría o un médico administrador."}
        </div>
      )}

      {cambios && propia && <div aria-hidden className="h-24 lg:h-16" />}
      {cambios && propia && (
        <div className="fixed inset-x-3 bottom-[5.5rem] z-[45] flex items-center gap-3 rounded-2xl bg-slate-900/95 p-3 pl-4 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur animate-in slide-in-from-bottom-4 lg:inset-x-auto lg:bottom-6 lg:left-[calc(50%+9rem)] lg:w-[32rem] lg:-translate-x-1/2">
          <span className="relative flex size-2.5"><span className="absolute inset-0 animate-ping rounded-full bg-amber-400" /><span className="relative size-2.5 rounded-full bg-amber-400" /></span>
          <p className="min-w-0 flex-1 text-sm font-medium leading-tight">Tiene cambios sin publicar<span className="block text-[11px] font-normal text-white/60">Toque Publicar para que se vean en la web.</span></p>
          <button onClick={() => setDraft(guardada)} className="rounded-xl px-3 py-2 text-xs font-semibold text-white/70 hover:text-white">Descartar</button>
          <button onClick={guardar} className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-emerald-400"><Check className="mr-1 inline size-4" />Publicar</button>
        </div>
      )}
      {propia && sel === user.id && (
        <button onClick={() => abrirIA()} className="pn-up group flex w-full items-center gap-4 overflow-hidden rounded-[1.4rem] bg-gradient-to-r from-indigo-600 via-violet-700 to-fuchsia-700 p-4 text-left text-white shadow-[0_20px_40px_-24px_rgba(124,58,237,.9)] transition hover:-translate-y-0.5">
          <span className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25"><span className="absolute inset-0 animate-ping rounded-2xl bg-white/10" /><Mic className="relative size-5" /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">¿Sin tiempo? Dígaselo a la IA</span>
            <span className="block text-xs text-white/80">Ej.: “Atiendo lunes a viernes de 8 a 12 y de 2 a 5, citas de 20 minutos, almuerzo de 12 a 2”. Usted confirma antes de guardar.</span>
          </span>
          <ArrowRight className="size-5 shrink-0 transition group-hover:translate-x-1" />
        </button>
      )}
      <fieldset disabled={!propia} className={`min-w-0 border-0 p-0 ${propia ? "" : "opacity-75"}`}>
      <div className="grid gap-6 xl:grid-cols-5">
        <div className="min-w-0 space-y-6 xl:col-span-3">
          <Seccion icon={Clock} titulo={propia ? "Mi horario de atención" : "Horario de atención"} sub="Complete y toque Guardar: se publica al instante en la web">
            {deBloques.personalizado && (
              <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">Hoy tiene horarios personalizados (distintos por día o especialidad). Si guarda aquí, se reemplazan por este horario. Para mantenerlos, use «Horarios distintos por día o especialidad» más abajo.</p>
            )}
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-semibold">1. ¿Qué días atiende?</p>
                <div className="grid grid-cols-7 gap-1.5">
                  {ORDEN_DIAS.map((d) => {
                    const on = rap.dias.includes(d);
                    return <button key={d} type="button" onClick={() => setRap({ ...rap, dias: on ? rap.dias.filter((x) => x !== d) : [...rap.dias, d].sort() })} className={`rounded-xl py-2.5 text-sm font-bold transition ${on ? "pn-acc-tile text-white shadow-md" : "bg-secondary text-muted-foreground"}`}>{NOMBRES_DIA[d]!.slice(0, 3)}</button>;
                  })}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">2. ¿En qué horario?</p>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <SelectorHora value={rap.desde} onChange={(v) => setRap({ ...rap, desde: v })} label="Atiende desde" />
                  <span className="text-sm text-muted-foreground">a</span>
                  <SelectorHora value={rap.hasta} onChange={(v) => setRap({ ...rap, hasta: v })} label="Atiende hasta" />
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">3. Una cita cada…</p>
                <div className="flex flex-wrap gap-1.5">
                  {[10, 15, 20, 30, 40, 60].map((m) => <button key={m} type="button" onClick={() => setRap({ ...rap, cada: m })} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${rap.cada === m ? "pn-acc-tile text-white shadow-md" : "bg-secondary text-muted-foreground"}`}>{m} min</button>)}
                </div>
              </div>
              <div>
                <label className="mb-2 flex cursor-pointer items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={rap.almuerzo} onChange={(e) => setRap({ ...rap, almuerzo: e.target.checked })} className="size-4 accent-[rgb(var(--acc))]" /> 4. Hora de almuerzo
                </label>
                {rap.almuerzo && (
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <SelectorHora value={rap.almDesde} onChange={(v) => setRap({ ...rap, almDesde: v })} label="Almuerzo desde" />
                    <span className="text-sm text-muted-foreground">a</span>
                    <SelectorHora value={rap.almHasta} onChange={(v) => setRap({ ...rap, almHasta: v })} label="Almuerzo hasta" />
                  </div>
                )}
              </div>
              {opcionesServicio.length > 1 && (
                <div>
                  <p className="mb-2 text-sm font-semibold">5. ¿Qué atiende en este horario?</p>
                  <select value={rap.servicio} onChange={(e) => setRap({ ...rap, servicio: e.target.value })} className={inp + " h-11 cursor-pointer font-semibold"}>
                    {opcionesServicio.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
              )}
              <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:ring-emerald-500/20">
                <p className="text-sm text-emerald-900 dark:text-emerald-100">
                  {rap.dias.length ? <><b>{rap.dias.map((d) => NOMBRES_DIA[d]!.slice(0, 3)).join(", ")}</b> de <b>{hora12(rap.desde)}</b> a <b>{hora12(rap.hasta)}</b>{rap.almuerzo ? <> · almuerzo {hora12(rap.almDesde)} a {hora12(rap.almHasta)}</> : null} · una cita cada {rap.cada} min</> : "Elija al menos un día."}
                </p>
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">≈ <b>{citasPorDia}</b> citas por día · {rap.servicio}</p>
              </div>
              <Button type="button" onClick={guardarRapido} disabled={publicando} className="h-12 w-full rounded-xl text-base">{publicando ? <><Loader2 className="size-5 animate-spin" /> Guardando…</> : <><Check className="size-5" /> Guardar mi horario</>}</Button>
            </div>
          </Seccion>

          <details className="group rounded-[1.4rem] ring-1 ring-border open:bg-transparent">
            <summary className="flex cursor-pointer list-none items-center gap-3 rounded-[1.4rem] bg-card px-5 py-4 text-sm font-semibold hover:bg-secondary/50">
              <SlidersHorizontal className="size-4 text-muted-foreground" /> Horarios distintos por día o por especialidad <span className="ml-auto text-xs font-normal text-muted-foreground group-open:hidden">Avanzado</span>
            </summary>
            <div className="pt-4">
          <Seccion icon={CalendarDays} titulo={propia ? "Sus días y horarios de consulta" : "Días y horarios de consulta"} sub={`${admin.nombre} · se publican en su perfil y en «Solicitar cita»`}
            acciones={<Interruptor on={draft.activo} onChange={(v) => set({ activo: v })} label={draft.activo ? "Agenda abierta" : "Agenda pausada"} />}>
            <p className="mb-3 text-sm text-muted-foreground">Arme su semana con <b>bloques</b>: cada bloque dice <b>de qué hora a qué hora</b>, <b>qué atiende</b> (Cardiología, Medicina Interna, un estudio…) y <b>cuánto dura cada cita</b>. En la web el paciente elige la especialidad y ve solo esas horas.</p>
            <div className="space-y-3">
              {ORDEN_DIAS.map((d) => {
                const delDia = bloques.filter((b) => b.dia === d).sort((x, y) => x.desde.localeCompare(y.desde));
                const total = delDia.reduce((n, b) => n + horasDeBloque(b).length, 0);
                return (
                  <div key={d} className={`rounded-2xl p-3 ring-1 transition-colors ${delDia.length ? "bg-secondary/50 ring-border" : "ring-border/60"}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${delDia.length ? "pn-acc-tile text-white" : "bg-secondary text-muted-foreground"}`}>{NOMBRES_DIA[d]}</span>
                      {delDia.length === 0 && <span className="text-sm text-muted-foreground">No atiende</span>}
                      {total > 0 && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">{total} citas</span>}
                      <span className="ml-auto flex flex-wrap gap-1.5">
                        {delDia.length > 0 && <button type="button" onClick={() => setCopiando(copiando === d ? null : d)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-[rgb(var(--acc))] ring-1 ring-[rgba(var(--acc),.3)] hover:bg-[rgba(var(--acc),.06)]">Copiar a…</button>}
                        <button type="button" onClick={() => agregarBloque(d)} className="rounded-full bg-card px-3 py-1.5 text-xs font-semibold ring-1 ring-border hover:ring-[rgba(var(--acc),.5)]">+ {delDia.length ? "Otro horario" : "Agregar horario"}</button>
                      </span>
                    </div>
                    {copiando === d && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-xl bg-card p-2 ring-1 ring-border">
                        <span className="text-xs text-muted-foreground">Copiar el {NOMBRES_DIA[d]!.toLowerCase()} a:</span>
                        {ORDEN_DIAS.filter((x) => x !== d).map((x) => (
                          <button key={x} type="button" onClick={() => copiarDiaA(d, [x])} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold hover:bg-[rgba(var(--acc),.12)]">{NOMBRES_DIA[x]!.slice(0, 3)}</button>
                        ))}
                        <button type="button" onClick={() => { copiarDiaA(d, ORDEN_DIAS.filter((x) => x !== d && x !== 0 && x !== 6)); setCopiando(null); toast.success("Copiado de lunes a viernes."); }} className="rounded-full pn-acc-tile px-2.5 py-1 text-xs font-semibold text-white">Lun a Vie</button>
                        <button type="button" onClick={() => setCopiando(null)} className="ml-auto text-xs text-muted-foreground">Listo</button>
                      </div>
                    )}
                    {delDia.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {delDia.map((b) => {
                          const n = horasDeBloque(b).length;
                          return (
                            <div key={b.id} className="rounded-xl bg-card p-2.5 ring-1 ring-border">
                              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                <SelectorHora value={b.desde} onChange={(v) => cambiarBloque(b.id, { desde: v })} label={`${NOMBRES_DIA[d]} desde`} />
                                <span className="text-sm text-muted-foreground">a</span>
                                <SelectorHora value={b.hasta} onChange={(v) => cambiarBloque(b.id, { hasta: v })} label={`${NOMBRES_DIA[d]} hasta`} />
                              </div>
                              <div className="mt-2 grid grid-cols-[1fr_auto_auto] items-center gap-2 sm:grid-cols-[1fr_auto_auto]">
                                <select aria-label="Qué atiende" value={b.servicio === "*" ? servicioPrincipal : b.servicio} onChange={(e) => {
                                  if (e.target.value === "__otro") {
                                    const x = window.prompt("¿Qué atiende en este horario? (ej.: Electrocardiograma)")?.trim();
                                    if (x) cambiarBloque(b.id, { servicio: x });
                                    return;
                                  }
                                  cambiarBloque(b.id, { servicio: e.target.value });
                                }} className={inp + " col-span-3 h-11 min-w-0 cursor-pointer px-2.5 font-semibold sm:col-span-1"}>
                                  {opcionesServicio.map((x) => <option key={x} value={x}>{x}</option>)}
                                  <option value="__otro">Otro…</option>
                                </select>
                                <select aria-label="Duración de cada cita" value={b.duracion} onChange={(e) => cambiarBloque(b.id, { duracion: Number(e.target.value) })} className={inp.replace("w-full", "") + " h-11 w-[6.5rem] cursor-pointer px-2.5 tabular-nums"}>
                                  {[...new Set([10, 15, 20, 25, 30, 40, 45, 60, 90, 120, b.duracion])].sort((x, y) => x - y).map((m) => <option key={m} value={m}>{m} min</option>)}
                                </select>
                                <button type="button" onClick={() => quitarBloque(b.id)} aria-label="Quitar horario" className="flex size-11 items-center justify-center rounded-xl text-rose-600 ring-1 ring-border hover:bg-rose-50"><Trash2 className="size-4" /></button>
                              </div>
                              <p className="mt-1.5 px-1 text-[11px] text-muted-foreground">{n > 0 ? `${n} ${n === 1 ? "cita" : "citas"} de ${b.duracion} min` : "Con esas horas no entra ninguna cita"}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">La duración solo la ve el equipo: sirve para armar las horas que el paciente puede reservar. Entre dos horarios queda el almuerzo o el descanso.</p>
            <details className="group mt-4 rounded-2xl ring-1 ring-border open:bg-secondary/30">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">+ Aviso para pacientes (opcional)</summary>
              <div className="px-4 pb-4">
                <Campo label="Se muestra en la web al reservar"><input value={draft.nota} placeholder="Ej: traer estudios previos" onChange={(e) => set({ nota: e.target.value })} className={inp} /></Campo>
              </div>
            </details>
          </Seccion>

            </div>
          </details>
          {afectadas.length > 0 && (
            <div className="pn-up rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
              <p className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-200"><AlertTriangle className="size-4" /> {afectadas.length} {afectadas.length === 1 ? "cita queda" : "citas quedan"} fuera de este horario</p>
              <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-200/80">No se borran solas: avísele a cada paciente y reprográmela en Agenda y citas.</p>
              <ul className="mt-3 space-y-1.5">
                {afectadas.slice(0, 12).map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-card px-3 py-2 text-sm ring-1 ring-amber-200 dark:ring-amber-500/20">
                    <span className="font-semibold tabular-nums">{fechaCorta(t.fecha)} {hora12(t.hora)}</span>
                    <span className="min-w-0 flex-1 truncate">{t.paciente}</span>
                    {t.telefono && <a href={waDe(t.telefono, `Hola ${t.paciente.split(" ")[0]}, le escribimos del Centro HEGO. Necesitamos reprogramar su cita del ${fechaCorta(t.fecha)} a las ${hora12(t.hora)} con ${t.doctor}. ¿Qué día le queda bien?`)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-600"><Send className="size-3" /> Avisar</a>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Seccion icon={Ban} titulo="Vacaciones, ausencias y días sin atención" sub="Vacaciones, un trámite, un congreso: esos días no se pueden reservar citas" delay={0.05}>
            <form onSubmit={agregarBloqueo} className="grid gap-3 sm:grid-cols-[1fr_1fr_1.4fr_auto]">
              <Campo label="Desde"><input type="date" required value={bloq.desde} onChange={(e) => setBloq({ ...bloq, desde: e.target.value })} className={inp} /></Campo>
              <Campo label="Hasta"><input type="date" required value={bloq.hasta} onChange={(e) => setBloq({ ...bloq, hasta: e.target.value })} className={inp} /></Campo>
              <Campo label="Motivo">
                <input placeholder="Ej: vacaciones, diligencia" value={bloq.motivo} onChange={(e) => setBloq({ ...bloq, motivo: e.target.value })} className={inp} />
                <span className="mt-1.5 flex flex-wrap gap-1">{["Vacaciones", "Diligencia", "Descanso", "Congreso"].map((m) => <button key={m} type="button" onClick={() => setBloq({ ...bloq, motivo: m })} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${bloq.motivo === m ? "pn-acc-tile text-white ring-transparent" : "ring-border text-muted-foreground"}`}>{m}</button>)}</span>
              </Campo>
              <div className="flex items-start pt-6"><Button type="submit" className="h-11 w-full rounded-xl"><Ban className="size-4" /> Bloquear días</Button></div>
            </form>
            <div className="mt-4 space-y-2">
              {guardada.bloqueos.length === 0 && <p className="text-sm text-muted-foreground">No hay días bloqueados.</p>}
              {guardada.bloqueos.map((b) => (
                <div key={b.id} className="flex items-center gap-3 rounded-xl bg-rose-50 px-3 py-2.5 ring-1 ring-rose-100">
                  <Ban className="size-4 text-rose-600" />
                  <span className="flex-1 text-sm"><b>{fechaCorta(b.desde)}{b.hasta !== b.desde ? ` al ${fechaCorta(b.hasta)}` : ""}</b> · {b.motivo}</span>
                  <button onClick={() => publicarAgenda({ ...guardada, bloqueos: guardada.bloqueos.filter((x) => x.id !== b.id) }, bloquesDe(guardada).map(conServicio), "Listo. Esos días se pueden reservar otra vez.")} aria-label="Quitar" className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-100"><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
          </Seccion>
        </div>

        <div className="min-w-0 space-y-6 xl:col-span-2">
          <section className="pn-card pn-up overflow-hidden xl:sticky xl:top-6" style={{ animationDelay: ".1s" }}>
            <div className="gradient-deep relative p-5 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Así se ve en la web</p>
              <div className="mt-3 flex items-center gap-3">
                {fotoDe(sel) && <img src={fotoDe(sel)!} alt="" className="size-12 rounded-xl object-cover object-top ring-2 ring-white/30" />}
                <div className="min-w-0">
                  <p className="truncate font-semibold">{doctor?.nombre ?? admin.nombre}</p>
                  <p className="text-xs text-white/75">{doctor?.titulo}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <p className="flex items-start gap-2 text-sm"><Clock className="mt-0.5 size-4 shrink-0 text-primary" /> {resumenAgenda(draft)}</p>
              {draft.nota && <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-100">{draft.nota}</p>}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Próximos días</p>
                <div className="flex flex-wrap gap-1.5">
                  {proximos.length === 0 && <span className="text-sm text-muted-foreground">Sin días disponibles.</span>}
                  {proximos.map((f) => (
                    <span key={f} className="rounded-lg bg-secondary px-2.5 py-1 inline-block text-xs font-medium first-letter:uppercase">{new Date(f + "T12:00:00").toLocaleDateString("es-CO", { weekday: "short", day: "numeric" })}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{slots.length ? `${slots.length} citas el próximo día` : "Agregue un horario para ver las citas"}</p>
                <div className="flex flex-wrap gap-1.5">
                  {slots.map((h) => { const sv = proximos[0] ? servicioEn(draft, proximos[0], h) : ""; return <span key={h} title={sv} className="rounded-lg border border-border px-2 py-1 text-xs tabular-nums">{hora12(h)}{sv ? <span className="ml-1 text-[10px] text-muted-foreground">· {sv.split(" ")[0]}</span> : null}</span>; })}
                </div>
              </div>
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <Button onClick={guardar} disabled={!cambios} className="h-11 rounded-xl">
                  <Check className="size-4" /> {cambios ? "Guardar y publicar" : "Publicado"}
                </Button>
                {cambios && (
                  <Button variant="ghost" onClick={() => setDraft(guardada)} className="rounded-xl text-muted-foreground">Descartar cambios</Button>
                )}
                {doctor && (
                  <Button asChild variant="outline" className="rounded-xl">
                    <a href={`/especialistas/${doctor.id}`} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> Ver en la web</a>
                  </Button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
      </fieldset>
    </div>
  );
}

/* ---------- Portal del paciente (accesos y autorizaciones) ---------- */
function waPaciente(tel: string, texto: string) {
  let n = tel.replace(/\D/g, "");
  if (n.length === 10 && n.startsWith("3")) n = "57" + n;
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}

function mensajeInvitacion(p: PacientePortal) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/portal` : "/portal";
  return `Hola ${p.nombre.split(" ")[0]}, le escribimos del Centro HEGO. Le habilitamos el Portal del paciente para que saque sus citas y gestione sus autorizaciones.\n\nIngrese en: ${url}\nCédula: ${p.dni}\nCódigo de acceso: ${p.codigo}`;
}

const ESTADO_ACCESO: Record<EstadoAcceso, string> = {
  Invitado: "bg-amber-100 text-amber-800 ring-amber-200",
  Activo: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Revocado: "bg-slate-100 text-slate-600 ring-slate-200",
};
const ESTADO_AUT: Record<EstadoAut, string> = {
  Pendiente: "bg-amber-100 text-amber-800 ring-amber-200",
  Autorizada: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Rechazada: "bg-rose-100 text-rose-700 ring-rose-200",
};

/* ---------- Estudios para el portal y alertas de pacientes ---------- */
function EstudiosPortal({ user, log, pacientes }: { user: SessionUser; log: LogFn; pacientes: PacientePortal[] }) {
  const [estudios, setEstudios] = useDato<Estudio[]>(KEY_ESTUDIOS, []);
  const [controles] = useDato<Control[]>(KEY_CONTROLES, []);
  const vacio = { pacienteId: "", tipo: TIPOS_ESTUDIO[0] as string, fecha: hoy(), titulo: "", informe: "", creatinina: "", egfr: "", potasio: "", urea: "", proteinuria: "", hemoglobina: "", ldl: "", fevi: "" };
  const [f, setF] = useState(vacio);

  const num = (v: string) => (v.trim() === "" ? undefined : Number(v.replace(",", ".")));
  const cargar = (e: FormEvent) => {
    e.preventDefault();
    const p = pacientes.find((x) => x.id === f.pacienteId);
    if (!p) {
      toast.error("Elija un paciente.");
      return;
    }
    const valores: ValoresEstudio = {};
    (["creatinina", "egfr", "potasio", "urea", "proteinuria", "hemoglobina", "ldl", "fevi"] as const).forEach((k) => {
      const n = num(f[k]);
      if (n !== undefined && !Number.isNaN(n)) valores[k] = n;
    });
    const nuevo: Estudio = { id: nuevoId(), pacienteId: p.id, tipo: f.tipo, fecha: f.fecha, titulo: f.titulo.trim() || f.tipo, informe: f.informe.trim(), valores, cargadoPor: user.nombre, creado: new Date().toISOString() };
    setEstudios((l) => [nuevo, ...l]);
    log("Estudio cargado al portal", `${p.nombre} · ${nuevo.tipo}`);
    toast.success("Resultado publicado en el portal del paciente.");
    setF({ ...vacio, pacienteId: f.pacienteId });
  };

  const renal = /renal|orina|laboratorio/i.test(f.tipo);
  const cardio = /eco|electro|holter|mapa|ergo|doppler/i.test(f.tipo);
  const alertas = controles
    .filter((c) => Date.now() - new Date(c.fecha).getTime() < 14 * 86400000)
    .map((c) => ({ c, k: clasificarPresion(c.sistolica, c.diastolica), p: pacientes.find((x) => x.id === c.pacienteId) }))
    .filter((x) => x.p && (x.k.tono === "rojo" || x.k.tono === "critico"))
    .sort((a, b) => b.c.fecha.localeCompare(a.c.fecha));
  const campo = (k: keyof typeof vacio, label: string, unidad: string) => (
    <label className="space-y-1"><span className="text-[11px] font-medium text-muted-foreground">{label} <span className="opacity-60">({unidad})</span></span>
      <input inputMode="decimal" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className={inp + " h-10"} /></label>
  );

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <Seccion icon={FileText} titulo="Publicar estudio en el portal" sub="El paciente lo ve en «Estudios y resultados» con cada valor explicado" className="xl:col-span-3" delay={0.3}>
        <form onSubmit={cargar} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Campo label="Paciente">
              <select required value={f.pacienteId} onChange={(e) => setF({ ...f, pacienteId: e.target.value })} className={inp}>
                <option value="">Elija un paciente</option>
                {pacientes.filter((p) => p.estado !== "Revocado").map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </Campo>
            <Campo label="Tipo"><select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })} className={inp}>{TIPOS_ESTUDIO.map((t) => <option key={t}>{t}</option>)}</select></Campo>
            <Campo label="Fecha"><input type="date" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} className={inp} /></Campo>
          </div>
          <Campo label="Título"><input placeholder="Ej: Control de función renal" value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} className={inp} /></Campo>
          {(renal || !cardio) && (
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-amber-500/5 p-3 ring-1 ring-amber-500/15 sm:grid-cols-4">
              {campo("creatinina", "Creatinina", "mg/dl")}
              {campo("egfr", "Filtrado eGFR", "ml/min")}
              {campo("potasio", "Potasio", "mEq/l")}
              {campo("urea", "Urea", "mg/dl")}
              {campo("proteinuria", "Proteinuria", "mg/24h")}
              {campo("hemoglobina", "Hemoglobina", "g/dl")}
              {campo("ldl", "Colesterol LDL", "mg/dl")}
            </div>
          )}
          {cardio && <div className="grid grid-cols-2 gap-3 rounded-2xl bg-rose-500/5 p-3 ring-1 ring-rose-500/15 sm:grid-cols-4">{campo("fevi", "FEVI", "%")}</div>}
          <Campo label="Informe / indicaciones para el paciente"><textarea rows={4} value={f.informe} onChange={(e) => setF({ ...f, informe: e.target.value })} className={inp + " h-auto py-3"} /></Campo>
          <Button type="submit" className="h-11 rounded-xl"><Send className="size-4" /> Publicar en el portal</Button>
        </form>
        {estudios.length > 0 && (
          <div className="mt-6 border-t border-border/60 pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Últimos publicados</p>
            <div className="space-y-2">
              {estudios.slice(0, 6).map((e) => (
                <div key={e.id} className="flex items-center gap-3 rounded-xl border border-border/60 p-3 text-sm">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate"><b>{pacientes.find((p) => p.id === e.pacienteId)?.nombre ?? "Paciente"}</b> · {e.titulo}</span>
                  <span className="text-xs text-muted-foreground">{fechaCorta(e.fecha)}</span>
                  <button onClick={() => { setEstudios((l) => l.filter((x) => x.id !== e.id)); log("Estudio quitado del portal", e.titulo); }} aria-label="Quitar" className="rounded-lg p-1.5 text-muted-foreground hover:text-rose-600"><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Seccion>

      <Seccion icon={HeartPulse} titulo="Alertas de presión" sub="Mediciones altas que cargaron los pacientes (14 días)" className="xl:col-span-2" delay={0.35}>
        {alertas.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="size-4 text-emerald-600" /> Sin mediciones de riesgo.</p>
        ) : (
          <div className="space-y-2">
            {alertas.map(({ c, k, p }) => (
              <div key={c.id} className={`flex items-center gap-3 rounded-xl p-3 ring-1 ${k.tono === "critico" ? "bg-red-50 ring-red-200" : "bg-rose-50 ring-rose-100"}`}>
                <Avatar nombre={p!.nombre} size="size-9" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{p!.nombre}</p><p className="text-xs text-muted-foreground">{fechaHora(c.fecha)} · {k.nivel}</p></div>
                <span className="font-display text-lg font-semibold tabular-nums text-rose-700">{c.sistolica}/{c.diastolica}</span>
                <a href={waPaciente(p!.telefono, `Hola ${p!.nombre.split(" ")[0]}, vimos en su portal una presión de ${c.sistolica}/${c.diastolica}. ¿Cómo se siente?`)} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"><Send className="size-4" /></a>
              </div>
            ))}
          </div>
        )}
      </Seccion>
    </div>
  );
}

function verPortal(id: string) {
  window.open(`/portal?vista=${encodeURIComponent(id)}`, "_blank", "noopener");
}

function PacientesTab({ user, log, turnos }: { user: SessionUser; log: LogFn; turnos: Turno[] }) {
  const [pacientes, setPacientes] = useDato<PacientePortal[]>(KEY_PACIENTES, []);
  const [auts, setAuts] = useDato<Autorizacion[]>(KEY_AUT, []);
  const [f, setF] = useState({ nombre: "", dni: "", telefono: "", email: "" });
  const [recien, setRecien] = useState<PacientePortal | null>(null);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [fa, setFa] = useState({ pacienteId: "", tipo: TIPOS_AUT[0] as string, titulo: "", detalle: "" });
  const [verAut, setVerAut] = useState<"pendientes" | "resueltas">("pendientes");
  const [respuesta, setRespuesta] = useState<Record<string, string>>({});

  const lista = pacientes.filter((p) => norm(`${p.nombre} ${p.dni} ${p.email}`).includes(norm(q)));
  const vmPort = useVerMas(lista, 5);
  const autsLista = auts
    .filter((a) => (verAut === "pendientes" ? a.estado === "Pendiente" : a.estado !== "Pendiente"))
    .sort((x, y) => Number(y.origen === "Paciente") - Number(x.origen === "Paciente") || y.fecha.localeCompare(x.fecha));
  const vmAut = useVerMas(autsLista, 5);

  const invitar = (e: FormEvent) => {
    e.preventDefault();
    const dni = f.dni.replace(/\D/g, "");
    if (dni.length < 5) {
      toast.error("Ingrese una cédula válida.");
      return;
    }
    if (pacientes.some((p) => p.dni === dni)) {
      toast.error("Ya existe un paciente con esa cédula.");
      return;
    }
    const nuevo: PacientePortal = {
      id: nuevoId(),
      nombre: nombrePropio(f.nombre).trim(),
      dni,
      telefono: f.telefono.trim(),
      email: f.email.trim(),
      codigo: nuevoCodigo(),
      estado: "Invitado",
      invitadoPor: user.nombre,
      fecha: new Date().toISOString(),
    };
    setPacientes((p) => [nuevo, ...p]);
    log("Acceso al portal enviado", `${nuevo.nombre} · C.C. ${dni}`);
    setRecien(nuevo);
    setF({ nombre: "", dni: "", telefono: "", email: "" });
    if (nuevo.email) void enviarCorreo(nuevo, true);
  };

  /** Invitación por correo con Resend (sale desde el servidor). */
  const enviarCorreo = async (p: PacientePortal, silencioso = false) => {
    if (!p.email) {
      toast.error("Este paciente no tiene correo cargado.");
      return;
    }
    setEnviando(p.id);
    const r = await invitarPortalPorCorreo(p.id);
    setEnviando(null);
    if (r.ok) {
      toast.success(`Invitación enviada a ${r.para}`);
      log("Invitación enviada", `${p.nombre} · correo`);
    } else if (!silencioso || !/modo de prueba/.test(r.error)) toast.error(r.error, { duration: 8000 });
    else toast.message("El correo de invitación no salió", { description: r.error, duration: 8000 });
  };

  const cambiarPaciente = (id: string, patch: Partial<PacientePortal>, accion: string) => {
    const p = pacientes.find((x) => x.id === id);
    setPacientes((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    if (p) log(accion, `${p.nombre} · C.C. ${p.dni}`);
  };

  const copiar = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success("Copiado.");
    } catch {
      toast.error("No se pudo copiar.");
    }
  };

  const pedirAut = (e: FormEvent) => {
    e.preventDefault();
    const p = pacientes.find((x) => x.id === fa.pacienteId);
    if (!p) {
      toast.error("Elija un paciente.");
      return;
    }
    const nueva: Autorizacion = {
      id: nuevoId(),
      pacienteId: p.id,
      paciente: p.nombre,
      tipo: fa.tipo,
      titulo: fa.titulo.trim(),
      detalle: fa.detalle.trim(),
      origen: "Clínica",
      solicitadoPor: user.nombre,
      fecha: new Date().toISOString(),
      estado: "Pendiente",
    };
    setAuts((l) => [nueva, ...l]);
    log("Autorización solicitada", `${p.nombre} · ${nueva.tipo}: ${nueva.titulo}`);
    toast.success("Solicitud enviada al portal del paciente.");
    setFa({ ...fa, titulo: "", detalle: "" });
  };

  const responder = (a: Autorizacion, estado: EstadoAut) => {
    const r = (respuesta[a.id] ?? "").trim();
    setAuts((l) => l.map((x) => (x.id === a.id ? { ...x, estado, respondidoPor: user.nombre, fechaRespuesta: new Date().toISOString(), ...(r ? { respuesta: r } : {}) } : x)));
    log(`Autorización ${estado.toLowerCase()}`, `${a.paciente} · ${a.titulo}`);
  };

  const activos = pacientes.filter((p) => p.estado === "Activo").length;
  const invitados = pacientes.filter((p) => p.estado === "Invitado").length;
  const autPend = auts.filter((a) => a.estado === "Pendiente").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Users} label="Pacientes con acceso" value={String(pacientes.length)} tono="azul" delay={0.05} />
        <Kpi icon={LogIn} label="Ya ingresaron" value={String(activos)} hint="Portal activo" tono="verde" delay={0.1} />
        <Kpi icon={Send} label="Invitaciones" value={String(invitados)} hint="Esperando primer ingreso" tono="ambar" delay={0.15} />
        <Kpi icon={ShieldCheck} label="Autorizaciones" value={String(autPend)} hint="Pendientes" tono="violeta" delay={0.2} />
      </div>

      <div className="pn-up pn-sheen relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-pink-600 via-fuchsia-700 to-violet-700 p-6 text-white shadow-elevated sm:p-7">
        <div className="pn-cross pointer-events-none absolute inset-0" />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Cómo funciona</p>
            <p className="mt-1 text-lg font-semibold">1. Cree el acceso · 2. Envíele la invitación por WhatsApp o correo · 3. El paciente entra con su cédula y el código, y agenda sus citas.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => verPortal("demo")} className="rounded-xl !bg-white text-[#a21caf] hover:!bg-white/90"><Eye className="size-4" /> Ver cómo se ve el portal</Button>
            <Button onClick={() => document.getElementById("inv-nombre")?.focus()} variant="outline" className="rounded-xl !border-white/30 !bg-white/10 text-white hover:!bg-white/20 hover:text-white"><Send className="size-4" /> Invitar paciente</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Seccion icon={UserPlus} titulo="Invitar al portal" sub="Cree el acceso y envíele el código por WhatsApp o correo" className="xl:col-span-2" delay={0.1}>
          {recien ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-5 text-white shadow-lg">
                <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
                <p className="relative flex items-center gap-2 text-sm font-semibold"><span className="grid size-6 place-items-center rounded-full bg-white/20"><Check className="size-3.5" strokeWidth={3} /></span> Acceso creado para {recien.nombre}</p>
                <p className="relative mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Código de acceso</p>
                <div className="relative mt-2 flex items-center gap-1.5">
                  {recien.codigo.split("").map((d, i) => (
                    <span key={i} className="grid h-12 w-10 place-items-center rounded-xl bg-white/95 font-mono text-2xl font-bold text-emerald-800 shadow-sm">{d}</span>
                  ))}
                  <button onClick={() => copiar(recien.codigo)} className="ml-auto grid size-10 place-items-center rounded-xl bg-white/15 transition-colors hover:bg-white/25" aria-label="Copiar código"><Copy className="size-4" /></button>
                </div>
                <p className="relative mt-3 text-xs text-white/80">Usuario: cédula {recien.dni}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button asChild className="h-11 rounded-xl !bg-[#25D366] text-white shadow-sm hover:!bg-[#1ebe5b]">
                  <a href={waPaciente(recien.telefono, mensajeInvitacion(recien))} target="_blank" rel="noreferrer" onClick={() => log("Invitación enviada", `${recien.nombre} · WhatsApp`)}><MessageCircle className="size-4" /> WhatsApp</a>
                </Button>
                <Button className="h-11 rounded-xl" disabled={!recien.email || enviando === recien.id} onClick={() => void enviarCorreo(recien)} title={recien.email ? recien.email : "Sin correo cargado"}>
                  {enviando === recien.id ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />} {recien.email ? "Reenviar correo" : "Sin correo"}
                </Button>
                <Button variant="outline" className="h-10 rounded-xl" onClick={() => copiar(mensajeInvitacion(recien))}><Copy className="size-4" /> Copiar mensaje</Button>
                <Button variant="outline" className="h-10 rounded-xl" onClick={() => verPortal(recien.id)}><Eye className="size-4" /> Ver su portal</Button>
              </div>
              {recien.email && <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="size-3.5" /> El correo con el código se envía solo a {recien.email}.</p>}
              <Button variant="ghost" className="w-full rounded-xl" onClick={() => setRecien(null)}><Plus className="size-4" /> Invitar a otro paciente</Button>
            </div>
          ) : (
            <form onSubmit={invitar} className="space-y-4">
              <Campo label="Nombre y apellido"><input id="inv-nombre" required placeholder="Ej.: María Fernanda López" value={f.nombre} onChange={(e) => setF({ ...f, nombre: nombrePropio(e.target.value) })} className={inp} /></Campo>
              <div className="grid grid-cols-2 gap-3">
                <Campo label="Cédula"><input required inputMode="numeric" placeholder="1002240625" value={f.dni} onChange={(e) => setF({ ...f, dni: e.target.value })} className={inp} /></Campo>
                <Campo label="Celular (WhatsApp)"><input required type="tel" placeholder="300 123 4567" value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} className={inp} /></Campo>
              </div>
              <Campo label="Correo (recomendado)"><input type="email" placeholder="paciente@correo.com" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={inp} /></Campo>
              <div className="rounded-2xl bg-secondary/60 p-3 text-xs text-muted-foreground dark:bg-white/5">
                <p className="flex items-center gap-1.5 font-semibold text-foreground"><Sparkles className="size-3.5 text-primary" /> Qué pasa al crear el acceso</p>
                <p className="mt-1">Se genera un código de 6 números. Si tiene correo, la invitación le llega sola; además puede mandársela por WhatsApp con un toque.</p>
              </div>
              <Button type="submit" className="h-11 w-full rounded-xl shadow-md"><Send className="size-4" /> Crear acceso y enviar invitación</Button>
            </form>
          )}
        </Seccion>

        <Seccion icon={Users} titulo="Pacientes del portal" sub={`${pacientes.length} con acceso · ${activos} ya ingresaron`} className="xl:col-span-3" delay={0.15}
          acciones={<div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input placeholder="Buscar por nombre o cédula" value={q} onChange={(e) => setQ(e.target.value)} className={inp + " h-10 pl-9 sm:w-60"} /></div>}>
          {pacientes.length === 0 && <Vacio icon={Users} titulo="Todavía no invitó pacientes" texto="Cree un acceso y mándele el código por WhatsApp o correo. Con eso entra al portal y agenda sus citas." />}
          <div className="space-y-3">
            {vmPort.items.map((p) => {
              const n = turnos.filter((t) => t.pacienteId === p.id).length;
              const revocado = p.estado === "Revocado";
              return (
                <div key={p.id} className={`group relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-all hover:shadow-md dark:border-white/10 ${revocado ? "border-border opacity-70" : "border-border/70"}`}>
                  <span className={`absolute inset-y-0 left-0 w-1 ${p.estado === "Activo" ? "bg-emerald-500" : p.estado === "Invitado" ? "bg-amber-400" : "bg-slate-300"}`} />
                  <div className="flex flex-wrap items-start gap-3">
                    <Avatar nombre={p.nombre} />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 font-semibold">{nombrePropio(p.nombre)} <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold normal-case ring-1 ${ESTADO_ACCESO[p.estado]}`}>{p.estado === "Invitado" ? "Invitado · aún no entra" : p.estado}</span></p>
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><KeyRound className="size-3" /> C.C. {p.dni}</span>
                        {p.telefono && <span className="flex items-center gap-1"><Phone className="size-3" /> {p.telefono}</span>}
                        {p.email && <span className="flex min-w-0 items-center gap-1"><Mail className="size-3 shrink-0" /> <span className="truncate">{p.email}</span></span>}
                        {n > 0 && <span className="flex items-center gap-1"><CalendarDays className="size-3" /> {n} cita{n === 1 ? "" : "s"}</span>}
                        {p.ultimoIngreso && <span className="flex items-center gap-1"><Clock className="size-3" /> Último ingreso {fechaHora(p.ultimoIngreso)}</span>}
                      </div>
                      {(p.ficha?.antecedentes?.length || p.ficha?.alergias || p.ficha?.obraSocial) ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {p.ficha?.obraSocial && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">EPS: {p.ficha.obraSocial}</span>}
                          {p.ficha?.alergias && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">Alergia: {p.ficha.alergias}</span>}
                          {p.ficha?.antecedentes?.map((a) => <span key={a} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium">{a}</span>)}
                        </div>
                      ) : null}
                    </div>
                    <button onClick={() => copiar(p.codigo)} title="Copiar código" className="flex items-center gap-2 rounded-xl bg-secondary/70 px-3 py-1.5 transition-colors hover:bg-secondary dark:bg-white/5">
                      <span className="text-left leading-tight"><span className="block text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Código</span><span className="font-mono text-sm font-bold tracking-[0.2em]">{p.codigo}</span></span>
                      <Copy className="size-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3 dark:border-white/10">
                    {!revocado && (
                      <>
                        <a href={waPaciente(p.telefono, mensajeInvitacion(p))} target="_blank" rel="noreferrer" onClick={() => log("Invitación enviada", `${p.nombre} · WhatsApp`)} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#25D366] px-3 text-xs font-semibold text-white shadow-sm hover:bg-[#1ebe5b]"><MessageCircle className="size-3.5" /> WhatsApp</a>
                        <button disabled={!p.email || enviando === p.id} onClick={() => void enviarCorreo(p)} title={p.email ? `Enviar a ${p.email}` : "Sin correo cargado"} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-40">
                          {enviando === p.id ? <Loader2 className="size-3.5 animate-spin" /> : <Mail className="size-3.5" />} Correo
                        </button>
                      </>
                    )}
                    <button onClick={() => verPortal(p.id)} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-500/10"><Eye className="size-3.5" /> Ver su portal</button>
                    <button onClick={() => copiar(mensajeInvitacion(p))} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"><Copy className="size-3.5" /> Copiar mensaje</button>
                    {!revocado && <button onClick={() => cambiarPaciente(p.id, { codigo: nuevoCodigo() }, "Nuevo código de portal")} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"><RefreshCw className="size-3.5" /> Nuevo código</button>}
                    <span className="flex-1" />
                    {revocado ? (
                      <button onClick={() => cambiarPaciente(p.id, { estado: "Invitado", codigo: nuevoCodigo() }, "Acceso al portal reactivado")} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-sky-50 px-3 text-xs font-semibold text-sky-700 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-300">Reactivar acceso</button>
                    ) : (
                      <button onClick={async () => { if (await preguntar({ titulo: `¿Quitarle el acceso al portal a ${p.nombre}?`, texto: "No podrá entrar a su portal hasta que se lo reactive.", aceptar: "Sí, quitar acceso" })) cambiarPaciente(p.id, { estado: "Revocado" }, "Acceso al portal quitado"); }} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"><Ban className="size-3.5" /> Quitar acceso</button>
                    )}
                  </div>
                </div>
              );
            })}
            {vmPort.boton}
          </div>
        </Seccion>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Seccion icon={ShieldCheck} titulo="Pedir una autorización" sub="El paciente la acepta o rechaza desde su portal" className="xl:col-span-2" delay={0.2}>
          <form onSubmit={pedirAut} className="space-y-4">
            <Campo label="Paciente">
              <select required value={fa.pacienteId} onChange={(e) => setFa({ ...fa, pacienteId: e.target.value })} className={inp}>
                <option value="">Elija un paciente</option>
                {pacientes.filter((p) => p.estado !== "Revocado").map((p) => <option key={p.id} value={p.id}>{p.nombre} · C.C. {p.dni}</option>)}
              </select>
            </Campo>
            <Campo label="Tipo">
              <select value={fa.tipo} onChange={(e) => setFa({ ...fa, tipo: e.target.value })} className={inp}>
                {TIPOS_AUT.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Campo>
            <Campo label="Título"><input required placeholder="Ej: Ecocardiograma doppler" value={fa.titulo} onChange={(e) => setFa({ ...fa, titulo: e.target.value })} className={inp} /></Campo>
            <Campo label="Detalle"><textarea rows={3} value={fa.detalle} onChange={(e) => setFa({ ...fa, detalle: e.target.value })} className={inp + " h-auto py-3"} /></Campo>
            <Button type="submit" className="h-11 w-full rounded-xl"><Send className="size-4" /> Enviar al portal</Button>
          </form>
        </Seccion>

        <Seccion icon={ShieldCheck} titulo="Autorizaciones" sub="Pedidas por la clínica o por los pacientes" className="xl:col-span-3" delay={0.25}
          acciones={
            <div className="flex rounded-xl bg-secondary p-1">
              {(["pendientes", "resueltas"] as const).map((v) => (
                <button key={v} onClick={() => setVerAut(v)} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${verAut === v ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{v}</button>
              ))}
            </div>
          }>
          {autsLista.length === 0 && <Vacio icon={ShieldCheck} titulo={verAut === "pendientes" ? "Nada pendiente" : "Sin historial"} texto="Las autorizaciones que pida o que pidan los pacientes aparecen aquí." />}
          <div className="space-y-3">
            {vmAut.items.map((a) => (
              <div key={a.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{a.titulo}</p>
                    <p className="text-xs text-muted-foreground">{a.tipo} · {a.paciente} · pedida por {a.origen === "Paciente" ? "el paciente" : nombreCorto(a.solicitadoPor)} · {fechaHora(a.fecha)}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${ESTADO_AUT[a.estado]}`}>{a.estado}</span>
                </div>
                {a.detalle && <p className="mt-2 text-sm text-muted-foreground">{a.detalle}</p>}
                {a.respuesta && <p className="mt-2 rounded-xl bg-secondary/60 px-3 py-2 text-xs"><b>Respuesta:</b> {a.respuesta}</p>}
                {a.estado === "Pendiente" && a.origen === "Paciente" && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-semibold text-pink-700 ring-1 ring-pink-100"><Bell className="size-3" /> Pedido del paciente desde su portal: responda aquí</p>
                )}
                {a.estado === "Pendiente" && a.origen === "Paciente" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <input placeholder="Comentario (opcional)" value={respuesta[a.id] ?? ""} onChange={(e) => setRespuesta({ ...respuesta, [a.id]: e.target.value })} className={inp + " h-9 flex-1"} />
                    <Button size="sm" className="rounded-lg !bg-emerald-600 text-white" onClick={() => responder(a, "Autorizada")}><Check className="size-4" /> Autorizar</Button>
                    <Button size="sm" variant="outline" className="rounded-lg text-rose-600" onClick={() => responder(a, "Rechazada")}><Ban className="size-4" /> Rechazar</Button>
                  </div>
                )}
                {a.estado === "Pendiente" && a.origen === "Clínica" && <p className="mt-2 text-xs text-amber-700">Esperando respuesta del paciente en su portal.</p>}
              </div>
            ))}
            {vmAut.boton}
          </div>
        </Seccion>
      </div>
      <EstudiosPortal user={user} log={log} pacientes={pacientes} />
    </div>
  );
}

/* ---------- Auditoría ---------- */
const CATS_AUD: { id: string; l: string; icon: LucideIcon; re: RegExp }[] = [
  { id: "accesos", l: "Accesos", icon: Fingerprint, re: /sesion|fallido|contrasena|2fa|verificacion|codigo de respaldo|ingreso al portal|primer ingreso|recuperacion|restablec/ },
  { id: "seguridad", l: "Permisos y equipo", icon: KeyRound, re: /permiso|acceso al panel|equipo|invitacion|bloqueado|profesional (agregado|quitado)/ },
  { id: "clinico", l: "Historia clínica", icon: FileText, re: /evolucion|registro medico|enfermeria|signos|procedimiento|receta|laboratorio|muestra|estudio|documento|firma|resultado/ },
  { id: "agenda", l: "Agenda", icon: CalendarDays, re: /cita|turno|horario|agenda|autorizacion/ },
  { id: "finanzas", l: "Pagos y caja", icon: Wallet, re: /cobro|pago|caja|movimiento|recibo|saldo/ },
  { id: "facturacion", l: "Facturación", icon: Receipt, re: /comprobante|factura|glosa|radic|nota credito|tarifa|prestador|liquidacion|eps/ },
  { id: "pacientes", l: "Pacientes", icon: Users, re: /paciente|portal|carga masiva/ },
  { id: "sistema", l: "Sistema e IA", icon: Bot, re: /asistente|\bia\b|sitio|automatizacion|notificacion|reporte|export|informe|comunicacion/ },
];
const catAud = (accion: string) => CATS_AUD.find((c) => c.re.test(norm(accion))) ?? { id: "otros", l: "Otros", icon: ClipboardList, re: /./ };
const esSensible = (accion: string) => /anul|elimin|borr|quit|revoc|fallido|incorrecto|bloqueado|restablec|permiso|export|desactiv/.test(norm(accion));

function AuditoriaTab({ audit, log }: { audit: Evento[]; log: LogFn }) {
  const [q, setQ] = useState("");
  const [rango, setRango] = useState<1 | 7 | 30 | 9999>(30);
  const [usuario, setUsuario] = useState("Todos");
  const [cat, setCat] = useState("todas");
  const [sensibles, setSensibles] = useState(false);
  const desde = rango === 1 ? isoDe(new Date()) : isoDe(new Date(Date.now() - (rango - 1) * 86400000));
  const enRango = (e: Evento) => rango === 9999 || diaLocal(e.fecha) >= desde;
  const base = audit.filter(enRango);
  const usuarios = [...new Set(audit.map((e) => e.usuario))].sort();
  const lista = base
    .filter((e) => usuario === "Todos" || e.usuario === usuario)
    .filter((e) => cat === "todas" || catAud(e.accion).id === cat)
    .filter((e) => !sensibles || esSensible(e.accion))
    .filter((e) => !q || norm(`${e.usuario} ${e.accion} ${e.detalle}`).includes(norm(q)))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  const vmAud = useVerMas(lista, 25);
  const [excel, setExcel] = useState(false);

  const nSens = base.filter((e) => esSensible(e.accion)).length;
  const fallidos = base.filter((e) => /fallido|incorrecto/.test(norm(e.accion))).length;
  const activos = new Set(base.map((e) => e.usuario)).size;
  const porUsuario = Object.entries(base.reduce<Record<string, number>>((a, e) => ({ ...a, [e.usuario]: (a[e.usuario] ?? 0) + 1 }), {})).map(([l, v]) => ({ l, v })).sort((a, b) => b.v - a.v);
  const porCat = [...CATS_AUD, { id: "otros", l: "Otros", icon: ClipboardList, re: /./ }].map((c) => ({ ...c, v: base.filter((e) => catAud(e.accion).id === c.id).length })).filter((c) => c.v > 0);
  const rangoTxt = rango === 1 ? "hoy" : rango === 9999 ? "todo el historial" : `últimos ${rango} días`;

  const exportar = async () => {
    setExcel(true);
    try {
      await descargarExcel(`HEGO auditoría ${isoDe(new Date())}`, [
        { nombre: "Eventos", filas: lista.map((e) => ({ Fecha: fechaHora(e.fecha), Usuario: e.usuario, "Categoría": catAud(e.accion).l, "Acción": e.accion, Detalle: e.detalle, Sensible: esSensible(e.accion) ? "Sí" : "" })) },
        { nombre: "Por usuario", filas: porUsuario.map((x) => ({ Usuario: x.l, Eventos: x.v })) },
      ]);
      log("Auditoría exportada", `${lista.length} eventos · ${rangoTxt}`);
      toast.success("Excel descargado.");
    } catch { toast.error("No se pudo generar el Excel."); }
    setExcel(false);
  };

  // Agrupar por día
  const dias: { dia: string; items: Evento[] }[] = [];
  vmAud.items.forEach((e) => {
    const d = diaLocal(e.fecha);
    const g = dias[dias.length - 1];
    if (g && g.dia === d) g.items.push(e);
    else dias.push({ dia: d, items: [e] });
  });
  const hoyD = isoDe(new Date());
  const ayerD = isoDe(new Date(Date.now() - 86400000));
  const diaTxt = (d: string) => (d === hoyD ? "Hoy" : d === ayerD ? "Ayer" : new Date(`${d}T12:00:00`).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));

  return (
    <div className="space-y-6">
      <section className="pn-up relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#071a46] via-[#0b2a6b] to-[#1e3a8a] p-6 text-white shadow-elevated sm:p-7">
        <div className="pn-cross pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ring-1 ring-white/20"><ShieldCheck className="size-3.5" /> Auditoría</span>
            <h2 className="mt-3 text-3xl font-semibold">Quién hizo qué y cuándo</h2>
            <p className="mt-2 text-sm text-white/75">Cada acción del panel y del portal queda registrada con usuario, fecha y detalle. Los registros no se pueden borrar ni editar.</p>
          </div>
          <div className="inline-flex flex-wrap gap-1 rounded-xl bg-white/10 p-1 ring-1 ring-white/15">
            {([[1, "Hoy"], [7, "7 días"], [30, "30 días"], [9999, "Todo"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => setRango(v)} className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${rango === v ? "bg-white text-[#0b2a6b]" : "text-white/80 hover:bg-white/10"}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { l: "Eventos", v: base.length, s: rangoTxt, i: ClipboardList, on: () => { setSensibles(false); setCat("todas"); } },
            { l: "Usuarios activos", v: activos, s: "personas con actividad", i: Users },
            { l: "Acciones sensibles", v: nSens, s: "anulaciones, borrados, permisos", i: ShieldAlert, on: () => setSensibles(true) },
            { l: "Accesos fallidos", v: fallidos, s: fallidos ? "revise los intentos" : "sin incidentes", i: Lock, on: () => { setCat("accesos"); setQ("fallido"); } },
          ].map((k) => (
            <button key={k.l} type="button" onClick={k.on} disabled={!k.on} className="rounded-2xl bg-white/10 p-4 text-left ring-1 ring-white/15 backdrop-blur transition enabled:hover:bg-white/15">
              <div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/65">{k.l}</p><k.i className="size-4 text-white/70" /></div>
              <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{k.v}</p>
              <p className="text-[11px] text-white/60">{k.s}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Seccion icon={ClipboardList} titulo="Registro de eventos" sub={`${lista.length} evento${lista.length === 1 ? "" : "s"}${sensibles ? " sensibles" : ""} · ${rangoTxt}`}
          acciones={<button type="button" onClick={() => void exportar()} disabled={excel} className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#0b2a6b] ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-sky-200 dark:ring-white/10">{excel ? <Loader2 className="size-4 animate-spin" /> : <FileSpreadsheet className="size-4" />} Exportar a Excel</button>}>
          <div className="mb-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <div className="relative min-w-[200px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input placeholder="Buscar paciente, acción, detalle…" value={q} onChange={(e) => setQ(e.target.value)} className={inp + " h-10 pl-9"} />
              </div>
              <div className="w-full sm:w-64"><select value={usuario} onChange={(e) => setUsuario(e.target.value)} className={inp + " h-10"} aria-label="Usuario">
                <option value="Todos">Todos los usuarios</option>
                {usuarios.map((u) => <option key={u} value={u}>{u}</option>)}
              </select></div>
              <button type="button" onClick={() => setSensibles((v) => !v)} className={`inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition ${sensibles ? "bg-[#0b2a6b] text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10"}`}><ShieldAlert className="size-3.5" /> Solo sensibles</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setCat("todas")} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${cat === "todas" ? "bg-[#0b2a6b] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300"}`}>Todas</button>
              {porCat.map((c) => (
                <button key={c.id} onClick={() => setCat(c.id)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${cat === c.id ? "bg-[#0b2a6b] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300"}`}><c.icon className="size-3.5" /> {c.l} <span className="opacity-70">{c.v}</span></button>
              ))}
            </div>
          </div>
          {lista.length === 0 ? <Vacio icon={ClipboardList} titulo="Sin eventos" texto="No hay eventos con estos filtros." /> : (
            <div className="space-y-5">
              {dias.map((g) => (
                <div key={g.dia}>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="inline-block rounded-full bg-[#0b2a6b] px-3 py-1 text-[11px] font-semibold text-white first-letter:uppercase dark:bg-white/15">{diaTxt(g.dia)}</span>
                    <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                    <span className="text-[11px] text-muted-foreground">{g.items.length} evento{g.items.length === 1 ? "" : "s"}</span>
                  </div>
                  <ol className="relative space-y-1 before:absolute before:bottom-3 before:left-[19px] before:top-3 before:w-px before:bg-slate-200 dark:before:bg-white/10">
                    {g.items.map((e) => {
                      const c = catAud(e.accion);
                      const sens = esSensible(e.accion);
                      return (
                        <li key={e.id} className="relative flex gap-4 rounded-xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                          <span className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-xl ring-4 ring-card ${sens ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300" : "bg-[#0b2a6b]/[.07] text-[#0b2a6b] dark:bg-white/10 dark:text-sky-200"}`}><c.icon className="size-4" /></span>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                              <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">{e.accion}{sens && <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-700 ring-1 ring-red-100 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20">Sensible</span>}</p>
                              <p className="text-xs tabular-nums text-muted-foreground" title={fechaHora(e.fecha)}>{horaDeIso(e.fecha)}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              <button type="button" onClick={() => setUsuario(e.usuario)} className="font-semibold text-foreground/80 hover:underline">{e.usuario}</button>
                              <span className="mx-1.5 text-slate-300">·</span>{c.l}
                              {e.detalle ? <span className="block text-muted-foreground/90">{e.detalle}</span> : null}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
              {vmAud.boton}
            </div>
          )}
        </Seccion>

        <div className="space-y-6">
          <Seccion icon={Users} titulo="Actividad por usuario" sub={rangoTxt}>
            <BarrasH datos={porUsuario} max={8} />
          </Seccion>
          <Seccion icon={Activity} titulo="Por categoría" sub="Toque para filtrar">
            <ul className="space-y-1.5">
              {porCat.sort((a, b) => b.v - a.v).map((c) => (
                <li key={c.id}>
                  <button onClick={() => setCat(c.id)} className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-slate-50 dark:hover:bg-white/5">
                    <span className="grid size-8 place-items-center rounded-lg bg-[#0b2a6b]/[.07] text-[#0b2a6b] dark:bg-white/10 dark:text-sky-200"><c.icon className="size-4" /></span>
                    <span className="flex-1 text-sm font-medium">{c.l}</span>
                    <span className="text-sm font-semibold tabular-nums">{c.v}</span>
                  </button>
                </li>
              ))}
              {porCat.length === 0 && <li className="py-4 text-center text-sm text-muted-foreground">Sin eventos en el período.</li>}
            </ul>
          </Seccion>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ HISTORIA CLÍNICA (general) ═══════════════════════ */
type PacienteHC = { id: string; nombre: string; dni?: string; telefono?: string; email?: string; ficha?: PacientePortal["ficha"]; portal: boolean; portalId?: string; origen: "padron" | "portal" | "turno"; creado?: string };

const TONO_HC: Record<string, string> = {
  verde: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  ambar: "bg-amber-100 text-amber-800 ring-amber-200",
  naranja: "bg-orange-100 text-orange-800 ring-orange-200",
  rojo: "bg-red-100 text-red-700 ring-red-200",
  critico: "bg-red-600 text-white ring-red-700",
  gris: "bg-secondary text-muted-foreground ring-border",
};

function edadDe(nac?: string) {
  if (!nac) return null;
  const d = new Date(nac);
  if (Number.isNaN(d.getTime())) return null;
  const h = new Date();
  let e = h.getFullYear() - d.getFullYear();
  if (h.getMonth() < d.getMonth() || (h.getMonth() === d.getMonth() && h.getDate() < d.getDate())) e--;
  return e >= 0 && e < 130 ? e : null; // fecha mal cargada (a futuro o imposible)
}
/** Fecha legible: respeta las fechas sin hora (AAAA-MM-DD) para no correrlas un día. */
const fechaDe = (f: string) => (f.length === 10 ? fechaCorta(f) : new Date(f).toLocaleDateString("es-CO"));
const num = (v: string) => (v.trim() === "" ? undefined : Number(v.replace(",", ".")));

/** IMC = peso (kg) / talla (m)². Clasificación de la OMS. */
function calcularImc(peso?: number, tallaCm?: number) {
  if (!peso || !tallaCm || tallaCm < 50) return null;
  const v = Math.round((peso / (tallaCm / 100) ** 2) * 10) / 10;
  const c =
    v < 18.5 ? { texto: "Bajo peso", tono: "ambar" }
    : v < 25 ? { texto: "Peso normal", tono: "verde" }
    : v < 30 ? { texto: "Sobrepeso", tono: "ambar" }
    : v < 35 ? { texto: "Obesidad grado I", tono: "naranja" }
    : v < 40 ? { texto: "Obesidad grado II", tono: "rojo" }
    : { texto: "Obesidad grado III", tono: "critico" };
  return { valor: v, ...c };
}
/** Marca un signo vital fuera de rango habitual en adultos. */
function fueraDeRango(tipo: "fc" | "fr" | "temp", v?: number) {
  if (v === undefined) return false;
  if (tipo === "fc") return v < 50 || v > 100;
  if (tipo === "fr") return v < 12 || v > 20;
  return v < 35.5 || v >= 37.8;
}

/* ---------- Buscador CIE-10 (los ~14.000 códigos se cargan recién al usarlo) ---------- */
type Cie = { codigo: string; descripcion: string };
let cacheCie: [string, string][] | null = null;
async function cargarCie() {
  if (!cacheCie) cacheCie = (await import("@/data/cie10.json")).default as [string, string][];
  return cacheCie;
}

function BuscadorCie({ seleccion, onChange }: { seleccion: Cie[]; onChange: (v: Cie[]) => void }) {
  const [q, setQ] = useState("");
  const [datos, setDatos] = useState<[string, string][] | null>(cacheCie);
  const [abierto, setAbierto] = useState(false);
  const [idx, setIdx] = useState(0);
  const cargando = abierto && !datos;

  useEffect(() => {
    if (abierto && !datos) void cargarCie().then(setDatos);
  }, [abierto, datos]);

  const resultados = useMemo(() => {
    if (!datos || q.trim().length < 2) return [];
    // Sinónimos y siglas de uso diario → términos de la CIE-10
    const expandida = ` ${norm(q.trim())} `
      .replace(/ tipo 2 /g, " no_insulinodependiente ")
      .replace(/ tipo 1 /g, " solo_insulinodependiente ")
      .replace(/ (dm|dbt) /g, " diabetes ")
      .replace(/ hta /g, " hipertension ")
      .replace(/ (erc|irc) /g, " renal cronica ")
      .replace(/ epoc /g, " pulmonar obstructiva cronica ")
      .replace(/ (acv|ictus) /g, " cerebrovascular ")
      .replace(/ (iam|infarto) /g, " infarto agudo ")
      .replace(/ (toracico|torax) /g, " pecho ")
      .replace(/ (fa|fibrilacion auricular) /g, " fibrilacion ")
      .trim();
    const t = expandida;
    const palabras = t.split(/\s+/).filter((w) => w.length > 1 && !["de", "del", "la", "el", "en", "y", "con", "sin"].includes(w));
    const cod = norm(q.trim()).replace(/[.\s]/g, "").toUpperCase();
    const esCodigo = /^[A-Z]\d/.test(cod);
    // Puntaje: código exacto > código que empieza igual > descripción que empieza igual > todas las palabras presentes
    const puntuados: { r: [string, string]; p: number }[] = [];
    for (const r of datos) {
      const c = r[0].replace(".", "");
      const d = norm(r[1]);
      let p = 0;
      if (esCodigo && c === cod) p = 100;
      else if (esCodigo && c.startsWith(cod)) p = 80 - c.length;
      else if (d.startsWith(t)) p = 60;
      else if (palabras.length > 0 && palabras.every((w) => (w === "solo_insulinodependiente" ? d.includes("insulinodependiente") && !d.includes("no insulinodependiente") : d.includes(w.replace("_", " "))))) p = d.includes(` ${palabras[0]}`) || d.startsWith(palabras[0]!) ? 40 : 20;
      if (p) puntuados.push({ r, p: p - (r[0].length > 3 ? 2 : 0) });
    }
    return puntuados.sort((a, b) => b.p - a.p || a.r[0].localeCompare(b.r[0])).slice(0, 40).map((x) => x.r);
  }, [datos, q]);

  const agregar = (r: [string, string]) => {
    if (!seleccion.some((s) => s.codigo === r[0])) onChange([...seleccion, { codigo: r[0], descripcion: r[1] }]);
    setQ("");
    setIdx(0);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setAbierto(true); setIdx(0); }}
          onFocus={() => setAbierto(true)}
          onBlur={() => window.setTimeout(() => setAbierto(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, resultados.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
            if (e.key === "Enter" && resultados[idx]) { e.preventDefault(); agregar(resultados[idx]!); }
          }}
          placeholder="Busque por código (I10, E11.9) o por descripción (hipertensión, diabetes…)"
          className={inp + " pl-10"}
          role="combobox"
          aria-expanded={abierto}
          aria-controls="cie-resultados"
        />
        {abierto && q.trim().length >= 2 && (
          <ul id="cie-resultados" role="listbox" className="absolute inset-x-0 top-full z-40 mt-1.5 max-h-80 overflow-y-auto rounded-2xl border border-border bg-card p-1.5 shadow-2xl">
            {cargando && <li className="px-3 py-4 text-center text-sm text-muted-foreground">Cargando la CIE-10…</li>}
            {!cargando && resultados.length === 0 && <li className="px-3 py-4 text-center text-sm text-muted-foreground">Sin resultados para “{q}”.</li>}
            {resultados.map((r, i) => {
              const ya = seleccion.some((s) => s.codigo === r[0]);
              return (
                <li key={r[0]} role="option" aria-selected={i === idx}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setIdx(i)}
                    onClick={() => agregar(r)}
                    className={`flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${i === idx ? "bg-[rgba(var(--acc),.1)]" : ""}`}
                  >
                    <span className="mt-0.5 w-14 shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-center font-mono text-xs font-bold">{r[0]}</span>
                    <span className="min-w-0 flex-1">{r[1]}</span>
                    {ya && <Check className="mt-0.5 size-4 text-emerald-600" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {seleccion.length > 0 ? (
        <ol className="space-y-2">
          {seleccion.map((s, i) => (
            <li key={s.codigo} className="flex items-center gap-3 rounded-xl border border-border/70 bg-background px-3 py-2.5">
              <span className="w-16 shrink-0 rounded-md bg-[rgba(var(--acc),.12)] px-1.5 py-0.5 text-center font-mono text-xs font-bold text-[rgb(var(--acc))]">{s.codigo}</span>
              <span className="min-w-0 flex-1 text-sm">{s.descripcion}</span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${i === 0 ? "bg-[rgba(var(--acc),.12)] text-[rgb(var(--acc))]" : "bg-secondary text-muted-foreground"}`}>{i === 0 ? "Principal" : "Secundario"}</span>
              {i > 0 && (
                <button type="button" title="Marcar como principal" onClick={() => onChange([s, ...seleccion.filter((x) => x.codigo !== s.codigo)])} className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
                  <ArrowUpRight className="size-3.5 -rotate-45" />
                </button>
              )}
              <button type="button" aria-label={`Quitar ${s.codigo}`} onClick={() => onChange(seleccion.filter((x) => x.codigo !== s.codigo))} className="rounded-md p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600">
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-xs text-muted-foreground">Todavía no agregó diagnósticos. El primero que agregue queda como principal.</p>
      )}
    </div>
  );
}

/** Diagnósticos de una evolución (CIE-10 o los de texto de evoluciones anteriores). */
const dxDe = (e: Evolucion): Cie[] => e.cie10 ?? (e.diagnosticos ?? []).map((d) => ({ codigo: "", descripcion: d }));

function HistoriaTab({ user, log, turnos, inicial, soloLectura = false, notasEnf = false }: { user: SessionUser; log: LogFn; turnos: Turno[]; inicial: string | null; soloLectura?: boolean; notasEnf?: boolean }) {
  const [evols, setEvols] = useDato<Evolucion[]>(KEY_EVOLUCIONES, []);
  const [estudios] = useDato<Estudio[]>(KEY_ESTUDIOS, []);
  const [controles] = useDato<Control[]>(KEY_CONTROLES, []);
  const [meds] = useDato<Medicamento[]>(KEY_MEDICACION, []);
  const [q, setQ] = useState("");
  const [selId, setSelId] = useState<string | null>(inicial);
  const [nueva, setNueva] = useState(false);
  const pacientes = usePacientesClinica(turnos);

  const esDe = (p: PacienteHC, id: string) => id === p.id || id === p.portalId;
  const ultimaDe = (p: PacienteHC) => evols.filter((e) => esDe(p, e.pacienteId)).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  const [vista, setVista] = useState<"todas" | "hoy" | "conHistoria" | null>(null);
  const conHistoria = (p: PacienteHC) => evols.some((e) => esDe(p, e.pacienteId));
  const visibles = pacientes.filter((p) => (!q || norm(`${p.nombre} ${p.dni ?? ""}`).includes(norm(q))) && (vista !== "conHistoria" || conHistoria(p)));
  const sel = pacientes.find((p) => p.id === selId) ?? null;
  const hoyIso = isoDe(new Date());
  const evolsHoy = evols.filter((e) => diaLocal(e.fecha) === hoyIso);
  const listaKpi = [...(vista === "hoy" ? evolsHoy : evols)].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi icon={FileText} label="Evoluciones" value={String(evols.length)} hint="Registradas en total" onClick={() => setVista(vista === "todas" ? null : "todas")} activo={vista === "todas"} />
        <Kpi icon={CalendarCheck} label="Hoy" value={String(evolsHoy.length)} hint="Consultas registradas hoy" tono="verde" delay={0.05} onClick={() => setVista(vista === "hoy" ? null : "hoy")} activo={vista === "hoy"} />
        <Kpi icon={Users} label="Pacientes con historia" value={String(pacientes.filter(conHistoria).length)} hint={`de ${pacientes.length} ${pacientes.length === 1 ? "paciente" : "pacientes"} · filtra la lista`} tono="violeta" delay={0.1} onClick={() => setVista(vista === "conHistoria" ? null : "conHistoria")} activo={vista === "conHistoria"} />
      </div>

      {(vista === "todas" || vista === "hoy") && (
        <Seccion icon={FileText} titulo={vista === "hoy" ? "Consultas de hoy" : "Todas las evoluciones"} sub={`${listaKpi.length} ${listaKpi.length === 1 ? "evolución" : "evoluciones"} · toca una para abrir la historia`}>
          {listaKpi.length === 0 ? (
            <Vacio icon={FileText} texto={vista === "hoy" ? "Hoy todavía no se registraron consultas." : "Todavía no hay evoluciones registradas."} />
          ) : (
            <ul className="divide-y divide-border/60">
              {listaKpi.map((e) => {
                const dx0 = dxDe(e)[0];
                const pac = pacientes.find((p) => esDe(p, e.pacienteId));
                return (
                  <li key={e.id}>
                    <button
                      onClick={() => { if (pac) { setSelId(pac.id); setNueva(false); setVista(null); window.setTimeout(() => document.getElementById("ficha-hc")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); } }}
                      className="flex w-full flex-wrap items-center gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-secondary"
                    >
                      <Avatar nombre={e.paciente} size="size-9" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{e.paciente} <span className="font-normal text-muted-foreground">· {e.motivo || "Consulta"}</span></p>
                        <p className="truncate text-xs text-muted-foreground">{dx0 ? `${dx0.codigo ? `${dx0.codigo} ` : ""}${dx0.descripcion} · ` : ""}{nombreCorto(e.doctor)}</p>
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">{fechaHora(e.fecha)}</span>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Seccion>
      )}

      <div id="ficha-hc" className="grid scroll-mt-24 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        {/* Lista de pacientes */}
        <section className="pn-card pn-up flex max-h-[calc(100vh-10rem)] min-h-[420px] flex-col overflow-hidden xl:sticky xl:top-6">
          <div className="pn-sec-top relative overflow-hidden px-4 pb-4 pt-5 text-white">
            <div className="pn-cross pointer-events-none absolute inset-0 opacity-70" />
            <div className="pointer-events-none absolute -right-10 -top-14 size-40 rounded-full bg-white/15 blur-3xl" />
            <div className="relative mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 font-display text-lg font-semibold"><Users className="size-4" /> Pacientes</p>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold ring-1 ring-white/25">{visibles.length}</span>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o cédula" className={inp + " pl-10 !bg-white text-foreground"} />
            </div>
          </div>
          <ul className="pn-noscroll flex-1 space-y-1.5 overflow-y-auto p-3">
            {visibles.map((p) => {
              const u = ultimaDe(p);
              const on = p.id === selId;
              return (
                <li key={p.id}>
                  <button
                    onClick={() => { setSelId(p.id); setNueva(false); }}
                    className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl px-3 py-2.5 text-left transition-all ${on ? "bg-gradient-to-r from-[rgba(var(--acc),.16)] to-[rgba(var(--acc),.04)] shadow-sm ring-1 ring-[rgba(var(--acc),.4)]" : "hover:translate-x-0.5 hover:bg-secondary/80"}`}
                  >
                    {on && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-[rgb(var(--acc))]" />}
                    <Avatar nombre={p.nombre} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{p.nombre}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{p.dni ? `C.C. ${p.dni}` : "Sin cédula"} · {u ? `última consulta ${fechaDe(u.fecha)}` : "sin consultas"}</span>
                    </span>
                    {p.ficha?.alergias ? <AlertTriangle className="size-3.5 shrink-0 text-red-500" /> : <ChevronDown className={`size-4 shrink-0 -rotate-90 text-muted-foreground transition-transform ${on ? "text-[rgb(var(--acc))]" : "opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100"}`} />}
                  </button>
                </li>
              );
            })}
            {visibles.length === 0 && <li className="px-2 py-8 text-center text-sm text-muted-foreground">Sin pacientes. Cárguelos en Pacientes.</li>}
          </ul>
        </section>

        {!sel ? (
          <section className="pn-card pn-up p-6">
            <Vacio icon={FileText} titulo="Elija un paciente" texto="Abra su historia clínica para ver las consultas anteriores, signos vitales, diagnósticos e indicaciones, y registrar una nueva evolución." />
          </section>
        ) : (
          <FichaHC
            key={sel.id}
            soloLectura={soloLectura}
            log={log}
            notasEnf={notasEnf}
            turnosHC={turnos}
            pacientesHC={pacientes}
            p={sel}
            evols={evols.filter((e) => esDe(sel, e.pacienteId))}
            estudios={estudios.filter((e) => esDe(sel, e.pacienteId))}
            controles={controles.filter((c) => esDe(sel, c.pacienteId))}
            meds={meds.filter((m) => esDe(sel, m.pacienteId) && m.activo)}
            nueva={nueva}
            setNueva={setNueva}
            onGuardar={(ev) => {
              setEvols((prev) => [ev, ...prev]);
              log("Evolución registrada", ev.paciente);
              toast.success("Evolución guardada en la historia clínica");
              setNueva(false);
            }}
            onBorrar={(id) => {
              setEvols((prev) => prev.filter((e) => e.id !== id));
              log("Evolución eliminada", sel.nombre);
            }}
            user={user}
          />
        )}
      </div>
    </div>
  );
}

function htmlEvolucion(p: PacienteHC, e: Evolucion) {
  const s = e.signos;
  const imc = s.imc ?? calcularImc(s.peso, s.talla)?.valor;
  const vit = [
    s.sistolica && s.diastolica ? `TA ${s.sistolica}/${s.diastolica} mmHg` : "",
    s.pulso ? `FC ${s.pulso} lpm` : "",
    s.fr ? `FR ${s.fr} rpm` : "",
    s.temp ? `T° ${s.temp} °C` : "",
    s.spo2 ? `SpO₂ ${s.spo2}%` : "",
    s.peso ? `Peso ${s.peso} kg` : "",
    s.talla ? `Talla ${s.talla} cm` : "",
    imc ? `IMC ${imc}` : "",
  ].filter(Boolean).join(" · ");
  const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Evolución · ${p.nombre}</title>
<style>body{font-family:system-ui,sans-serif;color:#0f172a;padding:36px;max-width:780px;margin:auto;font-size:14px;line-height:1.55}h1{font-size:20px;margin:0}.m{color:#64748b;font-size:12px}
h2{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#475569;margin:22px 0 6px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}.dx b{font-family:ui-monospace,monospace}</style></head><body>
<h1>HEGO · Centro de especialidades médicas · Historia Clínica</h1><p class="m">${p.nombre}${p.dni ? ` · C.C. ${p.dni}` : ""} · ${new Date(e.fecha).toLocaleString("es-CO")} · ${e.doctor}</p>
<h2>Motivo de consulta</h2><p>${esc(e.motivo || "—")}</p>${vit ? `<h2>Signos vitales</h2><p>${vit}</p>` : ""}
${e.signosPor ? `<p class="m">Signos vitales tomados por ${e.signosPor.nombre} · ${new Date(e.signosPor.fecha).toLocaleString("es-CO")}</p>` : ""}
<h2>Evolución del cuadro clínico</h2><p>${esc(e.nota || "—")}</p>${e.sintomas ? `<h2>Signos y síntomas</h2><p>${esc(e.sintomas)}</p>` : ""}${e.semiologia ? `<h2>Semiología médica</h2><p>${esc(e.semiologia)}</p>` : ""}
<h2>Diagnósticos</h2>${dxDe(e).map((d, i) => `<p class="dx">${d.codigo ? `<b>${d.codigo}</b> ` : ""}${d.descripcion}${i === 0 ? " (principal)" : ""}</p>`).join("") || "<p>—</p>"}
<h2>Conducta médica</h2><p>${esc(e.plan || "—")}</p><script>setTimeout(()=>window.print(),300)</script></body></html>`;
}

function FichaHC({
  p, evols, estudios, controles, meds, nueva, setNueva, onGuardar, onBorrar, user, soloLectura = false, log = () => undefined, notasEnf = false, turnosHC = [], pacientesHC = [],
}: {
  p: PacienteHC; evols: Evolucion[]; estudios: Estudio[]; controles: Control[]; meds: Medicamento[];
  nueva: boolean; setNueva: (v: boolean) => void; onGuardar: (e: Evolucion) => void; onBorrar: (id: string) => void; user: SessionUser; soloLectura?: boolean; log?: LogFn; notasEnf?: boolean; turnosHC?: Turno[]; pacientesHC?: PacienteHC[];
}) {
  const [ver, setVer] = useState<"todo" | "evoluciones" | "enfermeria" | "estudios">("todo");
  const [notasTodas, setNotasTodas] = useDato<NotaEnfermeria[]>(KEY_NOTAS_ENF, []);
  const [labTodosHC] = useDato<PedidoLab[]>(KEY_LAB, []);
  const labsHC = labTodosHC.filter((l) => l.pacienteId === p.id || l.pacienteId === p.portalId);
  const notasEnfP = notasTodas.filter((n) => !n.anulada && (n.pacienteId === p.id || n.pacienteId === p.portalId));
  const [selNotas, setSelNotas] = useState<Set<string>>(() => new Set());
  const [editNota, setEditNota] = useState<{ id: string; texto: string } | null>(null);
  const puedeNotas = !soloLectura && (user.rol === "medico" || user.area === "Dirección general" || notasEnf);
  const ahoraIso = () => new Date().toISOString();
  const cambiarNotas = (ids: string[], patch: (n: NotaEnfermeria) => Partial<NotaEnfermeria>, accion: string) => {
    setNotasTodas((l) => l.map((n) => (ids.includes(n.id) ? { ...n, ...patch(n) } : n)));
    log(accion, `${p.nombre} · ${ids.length} registro${ids.length === 1 ? "" : "s"} de enfermería`);
    setSelNotas(new Set());
  };
  const confirmarNotas = (ids: string[]) => cambiarNotas(ids, () => ({ estado: "Confirmado", confirmadoPor: user.nombre, confirmadoEl: ahoraIso() }), "Registro de enfermería confirmado");
  const pendienteNotas = (ids: string[]) => cambiarNotas(ids, () => ({ estado: "Pendiente" }), "Registro de enfermería marcado pendiente");
  const borrarNotas = async (ids: string[]) => {
    if (!(await preguntar({ titulo: ids.length === 1 ? "¿Eliminar este registro?" : `¿Eliminar ${ids.length} registros?`, texto: "Deja de mostrarse en la historia, pero queda guardado en la auditoría de la clínica." }))) return;
    cambiarNotas(ids, () => ({ anulada: true, anuladaPor: user.nombre, anuladaEl: ahoraIso() }), "Registro de enfermería eliminado");
    toast.success(ids.length === 1 ? "Registro eliminado." : `${ids.length} registros eliminados.`);
  };
  const guardarEdicion = () => {
    if (!editNota || !editNota.texto.trim()) return;
    const id = editNota.id;
    cambiarNotas([id], (n) => ({ texto: editNota.texto.trim(), textoOriginal: n.textoOriginal ?? n.texto, editadoPor: user.nombre, editadoEl: ahoraIso() }), "Registro de enfermería corregido");
    setEditNota(null);
    toast.success("Registro corregido. El texto original queda guardado.");
  };
  const alternarSel = (id: string) => setSelNotas((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const [abiertas, setAbiertas] = useState<Set<string>>(() => new Set());
  const [ventSignos, setVentSignos] = useState(false);
  const puedeSignos = notasEnf || user.rol === "medico" || user.area === "Dirección general";
  const edad = edadDe(p.ficha?.nacimiento);
  const ordenadas = [...evols].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const [triagesTodos] = useDato<Triage[]>(KEY_TRIAGE, []);
  const triages = triagesTodos.filter((t) => t.pacienteId === p.id || t.pacienteId === p.portalId).sort((a, b) => b.fecha.localeCompare(a.fecha));
  // Triage de hoy que todavía no usó ningún médico
  const pendiente = triages.find((t) => !t.evolucionId && diaLocal(t.fecha) === isoDe(new Date()));
  const nivelPend = pendiente?.nivel ? NIVELES_TRIAGE.find((n) => n.id === pendiente.nivel) : undefined;

  // Últimos signos vitales registrados (evoluciones y enfermería)
  const regs = [...ordenadas.map((e) => ({ fecha: e.fecha, signos: e.signos as Triage["signos"] })), ...triages.map((t) => ({ fecha: t.fecha, signos: t.signos }))].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const ultimo = <K extends keyof Triage["signos"]>(k: K) => regs.find((e) => e.signos[k] !== undefined);
  const presiones = [
    ...regs.filter((e) => e.signos.sistolica && e.signos.diastolica).map((e) => ({ f: e.fecha, s: e.signos.sistolica!, d: e.signos.diastolica! })),
    ...controles.map((c) => ({ f: c.fecha, s: c.sistolica, d: c.diastolica })),
  ].sort((a, b) => b.f.localeCompare(a.f));
  const ta = presiones[0];
  const fc = ultimo("pulso");
  const temp = ultimo("temp");
  const conPeso = regs.find((e) => e.signos.peso && (e.signos.talla || regs.some((x) => x.signos.talla)));
  const talla = regs.find((e) => e.signos.talla)?.signos.talla;
  const imc = conPeso ? calcularImc(conPeso.signos.peso, conPeso.signos.talla ?? talla) : null;
  const dxActivos = Array.from(new Map(ordenadas.flatMap(dxDe).map((d) => [d.codigo || d.descripcion, d])).values()).slice(0, 8);

  type Item = { tipo: "evol"; f: string; e: Evolucion } | { tipo: "estudio"; f: string; e: Estudio } | { tipo: "triage"; f: string; e: Triage } | { tipo: "enf"; f: string; e: NotaEnfermeria };
  const conteo = { todo: ordenadas.length + triages.filter((t) => !t.evolucionId).length + notasEnfP.length + estudios.length, evoluciones: ordenadas.length, enfermeria: triages.filter((t) => !t.evolucionId).length + notasEnfP.length, estudios: estudios.length };
  const linea: Item[] = [
    ...(ver === "todo" || ver === "evoluciones" ? ordenadas.map((e) => ({ tipo: "evol" as const, f: e.fecha, e })) : []),
    ...(ver === "todo" || ver === "enfermeria" ? triages.filter((t) => !t.evolucionId).map((e) => ({ tipo: "triage" as const, f: e.fecha, e })) : []),
    ...(ver === "todo" || ver === "enfermeria" ? notasEnfP.map((e) => ({ tipo: "enf" as const, f: e.fecha, e })) : []),
    ...(ver === "todo" || ver === "estudios" ? estudios.map((e) => ({ tipo: "estudio" as const, f: e.fecha, e })) : []),
  ].sort((a, b) => b.f.localeCompare(a.f));
  const vmLinea = useVerMas(linea, 8);
  const diaTxt = (iso: string) => {
    const d = new Date(iso);
    const h = new Date();
    const ay = new Date();
    ay.setDate(h.getDate() - 1);
    if (d.toDateString() === h.toDateString()) return "Hoy";
    if (d.toDateString() === ay.toDateString()) return "Ayer";
    return d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };
  const alternar = (id: string) => setAbiertas((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div className="min-w-0 space-y-5">
      {/* Encabezado del paciente */}
      <section className="pn-up relative overflow-hidden rounded-[1.5rem] gradient-deep p-6 text-white shadow-elevated">
        <div className="pn-cross pointer-events-none absolute inset-0" />
        <div className="pn-orb pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold ring-1 ring-white/25">{iniciales(p.nombre)}</span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Historia Clínica</p>
              <h2 className="text-2xl font-semibold">{p.nombre}</h2>
              <p className="mt-0.5 text-sm text-white/70">
                {[p.dni ? `C.C. ${p.dni}` : null, edad !== null ? `${edad} años` : null, p.ficha?.obraSocial ?? null, p.ficha?.grupo ? `Grupo ${p.ficha.grupo}` : null].filter(Boolean).join(" · ") || "Sin datos de ficha cargados"}
              </p>
            </div>
          </div>
          {soloLectura ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold ring-1 ring-white/25">{notasEnf ? <><Syringe className="size-4" /> Enfermería · la evolución la escribe el médico</> : <><Eye className="size-4" /> Solo lectura</>}</span>
          ) : (
            <Button onClick={() => setNueva(!nueva)} className="rounded-xl !bg-white text-[var(--deep)] hover:!bg-white/90">
              {nueva ? <X className="size-4" /> : <Plus className="size-4" />} {nueva ? "Cancelar" : "Nueva evolución"}
            </Button>
          )}
        </div>
        <div className="relative mt-5 flex flex-wrap gap-2">
          {p.ficha?.alergias ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold"><AlertTriangle className="size-3.5" /> Alergias: {p.ficha.alergias}</span>
          ) : (
            <span className="rounded-full bg-white/12 px-3 py-1 text-xs ring-1 ring-white/20">Sin alergias registradas</span>
          )}
          {(p.ficha?.antecedentes ?? []).map((a) => (
            <span key={a} className="rounded-full bg-white/12 px-3 py-1 text-xs ring-1 ring-white/20">{a}</span>
          ))}
        </div>
      </section>

      {/* Últimos signos vitales */}
      <div className="pn-up flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <p className="font-semibold">Signos vitales</p>
          <p className="text-xs text-muted-foreground">Los registra enfermería o el médico. Quedan en el historial y los ve todo el equipo.</p>
        </div>
        {puedeSignos && (
          <button onClick={() => setVentSignos(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b2a6b] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0a2459] transition hover:-translate-y-0.5"><Plus className="size-3.5" /> Registrar signos vitales</button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: Activity, l: "Presión arterial", v: ta ? `${ta.s}/${ta.d}` : "—", u: "mmHg", f: ta?.f, b: ta ? { t: clasificarPresion(ta.s, ta.d).nivel, tono: clasificarPresion(ta.s, ta.d).tono } : null },
          { icon: HeartPulse, l: "Frecuencia cardíaca", v: fc ? String(fc.signos.pulso) : "—", u: "lpm", f: fc?.fecha, b: fc ? (fueraDeRango("fc", fc.signos.pulso) ? { t: "Fuera de rango", tono: "ambar" } : { t: "Normal", tono: "verde" }) : null },
          { icon: Thermometer, l: "Temperatura", v: temp ? String(temp.signos.temp) : "—", u: "°C", f: temp?.fecha, b: temp ? (fueraDeRango("temp", temp.signos.temp) ? { t: "Fuera de rango", tono: "ambar" } : { t: "Normal", tono: "verde" }) : null },
          { icon: Scale, l: "Índice de masa corporal", v: imc ? String(imc.valor) : "—", u: "kg/m²", f: conPeso?.fecha, b: imc ? { t: imc.texto, tono: imc.tono } : null },
        ].map((x) => (
          <button type="button" key={x.l} disabled={!puedeSignos} onClick={() => setVentSignos(true)} className="pn-card pn-up p-4 text-left transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{x.l}</p>
              <x.icon className="size-4 text-[rgb(var(--acc))]" />
            </div>
            <p className="mt-2 font-display text-2xl font-semibold tabular-nums">{x.v} <span className="text-xs font-normal text-muted-foreground">{x.v !== "—" ? x.u : ""}</span></p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {x.b ? <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${TONO_HC[x.b.tono] ?? TONO_HC["gris"]}`}>{x.b.t}</span> : puedeSignos ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0e7490] dark:text-sky-300"><Plus className="size-3" /> Registrar</span> : <span className="text-[11px] text-muted-foreground">Sin registros</span>}
              {x.f && <span className="text-[10px] text-muted-foreground">{fechaDe(x.f)}</span>}
            </div>
          </button>
        ))}
      </div>
      {ventSignos && <VentanaSignos user={user} log={log} turnos={turnosHC} soloLectura={false} inicial={p.id} onCerrar={() => setVentSignos(false)} />}

      {pendiente && !nueva && (
        <div className="pn-up flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-4 shadow-sm dark:border-emerald-500/25 dark:from-emerald-500/10 dark:to-transparent">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white"><Syringe className="size-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 font-semibold">
              Enfermería ya registró los signos vitales de hoy
              {nivelPend && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${nivelPend.clase}`}>{nivelPend.nombre}</span>}
            </p>
            <p className="text-xs text-muted-foreground">{pendiente.enfermera} · {fechaHora(pendiente.fecha)}{pendiente.motivo ? ` · Motivo: ${pendiente.motivo}` : ""}</p>
            <div className="mt-2"><GrillaSignos s={pendiente.signos} compacta /></div>
          </div>
          {!soloLectura && <Button className="rounded-xl" onClick={() => setNueva(true)}><NotebookPen className="size-4" /> Iniciar evolución</Button>}
        </div>
      )}

      {nueva && !soloLectura && <FormEvolucion p={p} user={user} onGuardar={onGuardar} onCancelar={() => setNueva(false)} tallaPrevia={talla} triage={pendiente} />}

      <DocumentosPaciente p={p} user={user} log={log} soloLectura={soloLectura} compacto />
      {labsHC.some((l) => Object.keys(l.resultados ?? {}).length) && <SeguimientoLab labs={labsHC} />}

      <RegistrarEnHC p={p} user={user} log={log} turnos={turnosHC} pacientes={pacientesHC.length ? pacientesHC : [p]} puede={notasEnf || user.rol === "medico" || user.area === "Dirección general"} />

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* Registro de consultas */}
        <Seccion
          icon={ClipboardList}
          titulo="Historial del paciente"
          sub={`${ordenadas.length} ${ordenadas.length === 1 ? "consulta" : "consultas"} · ${conteo.enfermeria} de enfermería · ${estudios.length} ${estudios.length === 1 ? "estudio" : "estudios"}`}
          acciones={
            <div className="flex flex-wrap gap-1 rounded-2xl bg-secondary/80 p-1 ring-1 ring-border/60">
              {([["todo", "Todo", "#0ea5e9"], ["evoluciones", "Médico", "#6366f1"], ["enfermeria", "Enfermería", "#10b981"], ["estudios", "Estudios", "#f59e0b"]] as const).map(([id, l, c]) => (
                <button key={id} onClick={() => setVer(id)} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${ver === id ? "bg-card text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}>
                  <span className="size-1.5 rounded-full" style={{ background: c }} />
                  {l}
                  <span className={`rounded-full px-1.5 text-[10px] tabular-nums ${ver === id ? "bg-secondary" : ""}`}>{conteo[id]}</span>
                </button>
              ))}
            </div>
          }
        >
          {linea.length === 0 ? (
            <Vacio icon={NotebookPen} titulo="Sin registros" texto={soloLectura ? "Todavía no hay consultas ni registros de enfermería para este paciente." : "Registre la primera consulta con Nueva evolución."} />
          ) : (
            <>
            <ol className="hc-linea relative space-y-4">
              {vmLinea.items.map((it, i) => {
                const nuevoDia = i === 0 || new Date(vmLinea.items[i - 1]!.f).toDateString() !== new Date(it.f).toDateString();
                const separador = nuevoDia ? (
                  <li key={`dia-${it.f}`} className="relative flex items-center gap-3 pl-[52px] pt-1">
                    <span className="inline-block rounded-full bg-[#0b2a6b] px-3 py-1 text-[11px] font-semibold text-white first-letter:uppercase shadow-sm dark:bg-white/15">{diaTxt(it.f)}</span>
                    <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                  </li>
                ) : null;
                const cuerpo = (() => {
                if (it.tipo === "enf") {
                  const n = it.e;
                  return (
                    <li key={`en-${n.id}`} className="hc-item relative flex gap-4" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
                      <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0e7490] to-[#0b2a6b] text-white shadow-sm ring-4 ring-card"><Syringe className="size-4" /></span>
                      <div className="hc-card min-w-0 flex-1 rounded-2xl border border-slate-200 bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,.04)] dark:border-white/10">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ${COLOR_NOTA[n.tipo] ?? COLOR_NOTA["Nota de enfermería"]}`}>{n.tipo}</span>
                          <EstadoNota n={n} />
                          {n.editadoPor && <span className="text-[10px] text-muted-foreground" title={`Texto original: ${n.textoOriginal ?? ""}`}>· corregido por {nombreCorto(n.editadoPor)}</span>}
                          <span className="ml-auto text-xs text-muted-foreground">{horaDeIso(n.fecha)} · {nombreCorto(n.enfermera)}</span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">{limpiarTextoNota(n.texto)}</p>
                        {n.estado === "Confirmado" && n.confirmadoPor && <p className="mt-1.5 text-[11px] text-muted-foreground">Confirmado por {nombreCorto(n.confirmadoPor)}{n.confirmadoEl ? ` · ${horaDeIso(n.confirmadoEl)}` : ""}</p>}
                      </div>
                    </li>
                  );
                }
                if (it.tipo === "triage") {
                  const t = it.e;
                  const n = t.nivel ? NIVELES_TRIAGE.find((x) => x.id === t.nivel) : undefined;
                  return (
                    <li key={`tr-${t.id}`} className="hc-item relative flex gap-4" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
                      <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-600 text-white shadow-[0_10px_20px_-8px_rgba(14,165,233,.9)] ring-4 ring-card"><HeartPulse className="size-4" /></span>
                      <div className="hc-card min-w-0 flex-1 rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50/80 to-card p-4 dark:border-sky-500/20 dark:from-sky-500/5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">Signos vitales · enfermería</p>
                          {n && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${n.clase}`}>{n.nombre}</span>}
                          <span className="ml-auto text-xs text-muted-foreground">{fechaHora(t.fecha)} · {t.enfermera}</span>
                        </div>
                        <div className="mt-2"><ChipsSignos s={t.signos} /></div>
                        {(t.motivo || t.observaciones) && <p className="mt-2 text-xs text-muted-foreground">{t.motivo ? `Motivo: ${t.motivo}. ` : ""}{t.observaciones ?? ""}</p>}
                      </div>
                    </li>
                  );
                }
                if (it.tipo === "estudio") {
                  const e = it.e;
                  return (
                    <li key={`es-${e.id}`} className="hc-item relative flex gap-4" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
                      <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-[0_10px_20px_-8px_rgba(245,158,11,.9)] ring-4 ring-card"><FlaskConical className="size-4" /></span>
                      <div className="hc-card min-w-0 flex-1 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/70 to-card p-4 dark:border-amber-500/20 dark:from-amber-500/5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{e.titulo || e.tipo}</p>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 ring-1 ring-emerald-200">Estudio</span>
                          <span className="ml-auto text-xs text-muted-foreground">{fechaDe(e.fecha)}</span>
                        </div>
                        {e.informe && <p className="mt-1.5 text-sm text-muted-foreground">{e.informe}</p>}
                      </div>
                    </li>
                  );
                }
                const e = it.e;
                const s = e.signos;
                const pr = s.sistolica && s.diastolica ? clasificarPresion(s.sistolica, s.diastolica) : null;
                const im = s.imc ? calcularImc(s.peso, s.talla) : null;
                const dx = dxDe(e);
                const larga = (e.nota?.length ?? 0) > 420;
                const expandida = abiertas.has(e.id) || i === 0;
                return (
                  <li key={e.id} className="hc-item group relative flex gap-4" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
                    <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-700 text-white shadow-[0_10px_20px_-8px_rgba(99,102,241,.9)] ring-4 ring-card">
                      {i === 0 && <span className="absolute inset-0 animate-ping rounded-xl bg-indigo-400/40" style={{ animationDuration: "2.4s" }} />}
                      <Stethoscope className="relative size-4" />
                    </span>
                    <article className="hc-card min-w-0 flex-1 overflow-hidden rounded-2xl border border-indigo-200/60 bg-card dark:border-indigo-500/20">
                      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-violet-50/60 to-transparent px-4 py-2.5 dark:border-indigo-500/20 dark:from-indigo-500/10">
                        <p className="text-sm font-semibold">{new Date(e.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}</p>
                        <span className="text-xs text-muted-foreground">{horaDeIso(e.fecha)} · {e.doctor}</span>
                        <div className="ml-auto flex items-center gap-1">
                          <button onClick={() => imprimirHtml(htmlEvolucion(p, e))} className="rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-card hover:text-foreground">Imprimir</button>
                          {e.doctor === user.nombre && (
                            <button onClick={async () => { if (await preguntar({ titulo: "¿Eliminar esta evolución?", texto: "Se quita de la historia clínica del paciente." })) onBorrar(e.id); }} className="rounded-lg p-1 text-muted-foreground opacity-0 transition hover:text-red-600 group-hover:opacity-100" aria-label="Eliminar evolución"><Trash2 className="size-3.5" /></button>
                          )}
                        </div>
                      </header>
                      <div className="space-y-3 p-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Motivo de consulta</p>
                          <p className="font-medium">{e.motivo || "—"}</p>
                        </div>
                        {(pr || s.pulso || s.fr || s.temp || s.spo2 || s.peso || s.talla) && (
                          <div>
                            <p className="mb-1 flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                              Signos vitales
                              {e.signosPor && (
                                <span className={`normal-case tracking-normal font-medium ${e.signosPor.rol === "enfermeria" ? "text-emerald-700 dark:text-emerald-300" : ""}`}>
                                  · tomados por {e.signosPor.nombre} · {fechaHora(e.signosPor.fecha)}
                                </span>
                              )}
                            </p>
                            <ChipsSignos s={s} />
                          </div>
                        )}
                        {e.nota && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Evolución del cuadro clínico</p>
                            <p className={`whitespace-pre-line text-sm leading-relaxed ${larga && !expandida ? "line-clamp-5" : ""}`}>{e.nota}</p>
                            {larga && i !== 0 && <button onClick={() => alternar(e.id)} className="mt-1 text-xs font-semibold text-[rgb(var(--acc))]">{expandida ? "Ver menos" : "Ver completa"}</button>}
                          </div>
                        )}
                        {e.sintomas && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Signos y síntomas</p>
                            <p className="whitespace-pre-line text-sm leading-relaxed">{e.sintomas}</p>
                          </div>
                        )}
                        {e.semiologia && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Semiología médica</p>
                            <p className="whitespace-pre-line text-sm leading-relaxed">{e.semiologia}</p>
                          </div>
                        )}
                        {dx.length > 0 && (
                          <div>
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Diagnósticos</p>
                            <ul className="space-y-1">
                              {dx.map((d, k) => (
                                <li key={`${d.codigo}-${k}`} className="flex items-start gap-2 text-sm">
                                  {d.codigo && <span className="mt-0.5 shrink-0 rounded bg-[rgba(var(--acc),.12)] px-1.5 font-mono text-[11px] font-bold text-[rgb(var(--acc))]">{d.codigo}</span>}
                                  <span>{d.descripcion}{k === 0 && dx.length > 1 && <span className="ml-1.5 text-[10px] font-semibold uppercase text-muted-foreground">Principal</span>}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {e.plan && (
                          <div className="rounded-xl bg-[rgba(var(--acc),.06)] px-3.5 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[rgb(var(--acc))]">Conducta médica</p>
                            <p className="mt-0.5 whitespace-pre-line text-sm leading-relaxed">{e.plan}</p>
                          </div>
                        )}
                      </div>
                    </article>
                  </li>
                );
                })();
                return <Fragment key={`g-${i}`}>{separador}{cuerpo}</Fragment>;
              })}
            </ol>
            {vmLinea.boton}
            </>
          )}
        </Seccion>

        <div className="space-y-5">
          <Seccion icon={ClipboardList} titulo="Diagnósticos registrados" sub="De todas las consultas" delay={0.05}>
            {dxActivos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin diagnósticos registrados.</p>
            ) : (
              <ul className="space-y-2">
                {dxActivos.map((d) => (
                  <li key={d.codigo || d.descripcion} className="flex items-start gap-2 text-sm">
                    {d.codigo ? <span className="mt-0.5 shrink-0 rounded bg-secondary px-1.5 font-mono text-[11px] font-bold">{d.codigo}</span> : <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[rgb(var(--acc))]" />}
                    <span className="leading-snug">{d.descripcion}</span>
                  </li>
                ))}
              </ul>
            )}
          </Seccion>
          <Seccion icon={Pill} titulo="Medicación activa" sub="Cargada en el portal" delay={0.08}>
            {meds.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin medicación registrada.</p>
            ) : (
              <ul className="space-y-2.5">
                {meds.map((m) => (
                  <li key={m.id} className="rounded-xl bg-secondary/50 px-3 py-2.5">
                    <p className="text-sm font-semibold">{m.nombre} <span className="font-normal text-muted-foreground">{m.dosis}</span></p>
                    <p className="text-xs text-muted-foreground">{m.horarios.join(" · ")}{m.indicacion ? ` — ${m.indicacion}` : ""}</p>
                  </li>
                ))}
              </ul>
            )}
          </Seccion>
        </div>
      </div>
    </div>
  );
}

function PasoHC({ n, t, sub, children }: { n: number; t: string; sub?: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-b border-border/60 py-6 last:border-0 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="flex gap-3">
        <span className="pn-acc-tile flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">{n}</span>
        <div>
          <p className="font-semibold">{t}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
function CampoVital({ l, u, ph, value, onChange, alerta }: { l: string; u: string; ph: string; value: string; onChange: (e: { target: { value: string } }) => void; alerta?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{l}</span>
      <div className="relative">
        <input inputMode="decimal" value={value} onChange={onChange} placeholder={ph} className={`${inp} pr-14 tabular-nums ${alerta ? "!border-amber-400 !ring-amber-200" : ""}`} />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{u}</span>
      </div>
    </label>
  );
}

function FormEvolucion({ p, user, onGuardar, onCancelar, tallaPrevia, triage }: { p: PacienteHC; user: SessionUser; onGuardar: (e: Evolucion) => void; onCancelar: () => void; tallaPrevia?: number | undefined; triage?: Triage | undefined }) {
  const [, setTriages] = useDato<Triage[]>(KEY_TRIAGE, []);
  const ts = triage?.signos;
  const txt = (v?: number) => (v === undefined ? "" : String(v));
  const [f, setF] = useState({
    motivo: triage?.motivo ?? "",
    nota: "",
    sintomas: "",
    semiologia: "",
    conducta: "",
    s: txt(ts?.sistolica),
    d: txt(ts?.diastolica),
    fc: txt(ts?.pulso),
    fr: txt(ts?.fr),
    temp: txt(ts?.temp),
    spo2: txt(ts?.spo2),
    peso: txt(ts?.peso),
    talla: ts?.talla ? String(ts.talla) : tallaPrevia ? String(tallaPrevia) : "",
  });
  const [editarSignos, setEditarSignos] = useState(!triage);
  const [dx, setDx] = useState<Cie[]>([]);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const s = num(f.s), d = num(f.d);
  const pr = s && d ? clasificarPresion(s, d) : null;
  const imc = calcularImc(num(f.peso), num(f.talla));
  const usaTriage = !!triage;

  const guardar = (e: FormEvent) => {
    e.preventDefault();
    if (!f.motivo.trim()) { toast.error("Complete el motivo de consulta"); return; }
    if (!f.nota.trim()) { toast.error("Escriba la evolución del cuadro clínico"); return; }
    if (dx.length === 0) { toast.error("Agregue al menos un diagnóstico"); return; }
    const id = nuevoId();
    const ahora = new Date().toISOString();
    const ev = JSON.parse(
      JSON.stringify({
        id,
        pacienteId: p.id,
        paciente: p.nombre,
        fecha: ahora,
        doctor: user.nombre,
        motivo: f.motivo.trim(),
        nota: f.nota.trim(),
        sintomas: f.sintomas.trim() || undefined,
        semiologia: f.semiologia.trim() || undefined,
        plan: f.conducta.trim() || undefined,
        diagnosticos: dx.map((x) => `${x.codigo} ${x.descripcion}`),
        cie10: dx,
        triageId: triage?.id,
        signosPor: triage ? { nombre: triage.enfermera, fecha: triage.fecha, rol: "enfermeria" } : undefined,
        signos: triage ? { ...triage.signos } : {},
      }),
    ) as Evolucion;
    if (triage) setTriages((prev) => prev.map((t) => (t.id === triage.id ? { ...t, evolucionId: id, atendidoPor: user.nombre } : t)));
    onGuardar(ev);
  };

  const nivel = triage?.nivel ? NIVELES_TRIAGE.find((n) => n.id === triage.nivel) : undefined;

  return (
    <form onSubmit={guardar} className="pn-card pn-up overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-secondary/40 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="pn-acc-tile flex size-10 items-center justify-center rounded-xl text-white"><NotebookPen className="size-5" /></span>
          <div>
            <h3 className="text-[15px] font-semibold">Nueva evolución</h3>
            <p className="text-xs text-muted-foreground">{p.nombre} · {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {user.nombre}</p>
          </div>
        </div>
        {p.ficha?.alergias && <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200"><AlertTriangle className="size-3.5" /> Alergias: {p.ficha.alergias}</span>}
      </div>

      <div className="px-6">
        <PasoHC n={1} t="Signos vitales" sub="Registrados por enfermería">
          {usaTriage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-500/25 dark:bg-emerald-500/5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white"><Syringe className="size-3.5" /> Tomados por {triage!.enfermera}</span>
                <span className="text-xs text-muted-foreground">{fechaHora(triage!.fecha)}</span>
                {nivel && <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${nivel.clase}`}>{nivel.nombre}</span>}
                <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground"><Lock className="size-3" /> Carga exclusiva de enfermería</span>
              </div>
              <GrillaSignos s={triage!.signos} />
              {triage!.observaciones && <p className="mt-3 text-xs text-muted-foreground"><span className="font-semibold">Observaciones de enfermería:</span> {triage!.observaciones}</p>}
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-2xl border border-dashed border-amber-300 bg-amber-50/70 p-4 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/5 dark:text-amber-200">
              <Syringe className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Enfermería todavía no registró los signos vitales</p>
                <p className="mt-0.5 text-xs opacity-80">Los signos vitales los carga enfermería desde la pestaña «Enfermería – Triage». Cuando los registre, aparecen aquí automáticamente. Puede guardar la evolución igual.</p>
              </div>
            </div>
          )}
        </PasoHC>

        <PasoHC n={2} t="Motivo de consulta" sub="Por qué consulta hoy">
          <input value={f.motivo} onChange={set("motivo")} placeholder="Ej.: Control, dolor torácico, cefalea, seguimiento de tratamiento…" className={inp} />
        </PasoHC>

        <PasoHC n={3} t="Evolución del cuadro clínico" sub="Enfermedad actual: inicio, curso y tratamientos previos">
          <textarea rows={8} value={f.nota} onChange={set("nota")} placeholder="Paciente de … años que consulta por … de … días de evolución…" className={inp + " h-auto min-h-[200px] resize-y py-3 leading-relaxed"} />
        </PasoHC>

        <PasoHC n={4} t="Signos y síntomas" sub="Lo que refiere el paciente y lo que se observa">
          <textarea rows={5} value={f.sintomas} onChange={set("sintomas")} placeholder={"• Síntomas referidos:\n• Signos observados:"} className={inp + " h-auto min-h-[130px] resize-y py-3 leading-relaxed"} />
        </PasoHC>

        <PasoHC n={5} t="Semiología médica" sub="Examen físico por aparatos y sistemas">
          <textarea
            rows={9}
            value={f.semiologia}
            onChange={set("semiologia")}
            placeholder={"Estado general:\nCabeza y cuello:\nCardiopulmonar:\nAbdomen:\nExtremidades:\nNeurológico:"}
            className={inp + " h-auto min-h-[220px] resize-y py-3 leading-relaxed"}
          />
        </PasoHC>

        <PasoHC n={6} t="Diagnóstico" sub="Codificado con la CIE-10">
          <BuscadorCie seleccion={dx} onChange={setDx} />
        </PasoHC>

        <PasoHC n={7} t="Conducta médica" sub="Tratamiento, estudios, indicaciones y próximo control">
          <textarea
            rows={8}
            value={f.conducta}
            onChange={set("conducta")}
            placeholder={"• Tratamiento:\n• Estudios solicitados:\n• Recomendaciones:\n• Próximo control:"}
            className={inp + " h-auto min-h-[200px] resize-y py-3 leading-relaxed"}
          />
        </PasoHC>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-secondary/40 px-6 py-4">
        <p className="text-xs text-muted-foreground">Queda registrada a nombre de {user.nombre} con fecha y hora.</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="rounded-xl" onClick={onCancelar}>Cancelar</Button>
          <Button type="submit" className="rounded-xl px-6"><Check className="size-4" /> Guardar evolución</Button>
        </div>
      </div>
    </form>
  );
}

/* ═══════════════════════ PACIENTES (padrón unificado) ═══════════════════════ */
/** Une el padrón de la clínica, los pacientes del portal y los que solo tienen turnos. */
function usePacientesClinica(turnos: Turno[]): PacienteHC[] {
  const [padron] = useDato<PacienteClinica[]>(KEY_PADRON, []);
  const [portal] = useDato<PacientePortal[]>(KEY_PACIENTES, []);
  return useMemo(() => {
    const lista: PacienteHC[] = [];
    const porDni = new Map<string, PacienteHC>();
    const porNombre = new Set<string>();
    padron.forEach((p) => {
      const x: PacienteHC = {
        id: p.id,
        nombre: p.nombre,
        dni: p.dni,
        telefono: p.telefono,
        email: p.email,
        origen: "padron",
        portal: false,
        creado: p.creado,
        ficha: { nacimiento: p.nacimiento, obraSocial: p.obraSocial, afiliado: p.afiliado, alergias: p.alergias, antecedentes: p.antecedentes },
      } as PacienteHC;
      lista.push(x);
      if (p.dni) porDni.set(p.dni, x);
      porNombre.add(norm(p.nombre));
    });
    portal.forEach((p) => {
      const ya = (p.dni && porDni.get(p.dni)) || lista.find((x) => norm(x.nombre) === norm(p.nombre));
      if (ya) {
        ya.portal = true;
        ya.portalId = p.id;
        ya.ficha = { ...p.ficha, ...Object.fromEntries(Object.entries(ya.ficha ?? {}).filter(([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0))) };
        return;
      }
      lista.push({ id: p.id, nombre: p.nombre, dni: p.dni, telefono: p.telefono, email: p.email, origen: "portal", portal: true, portalId: p.id, creado: p.fecha, ficha: p.ficha } as PacienteHC);
      porNombre.add(norm(p.nombre));
    });
    turnos.forEach((t) => {
      const n = t.paciente.trim();
      if (!n || porNombre.has(norm(n))) return;
      porNombre.add(norm(n));
      lista.push({ id: t.pacienteId ?? `nombre:${norm(n)}`, nombre: n, telefono: t.telefono, email: t.email, origen: "turno", portal: false } as PacienteHC);
    });
    return lista.map((p) => ({ ...p, nombre: nombrePropio(p.nombre).trim() })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [padron, portal, turnos]);
}

const esCardio = (ant: string[] = []) => ant.some((a) => /card|infarto|arritmia|marcapasos|hipert|colesterol/i.test(a));
const esNefro = (ant: string[] = []) => ant.some((a) => /renal|diálisis/i.test(a));

function exportarCSV(nombre: string, filas: (string | number | undefined)[][]) {
  const csv = filas.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nombre}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Selector de paciente con buscador. */
function SelectorPaciente({ pacientes, valor, onChange, arriba = false }: { pacientes: PacienteHC[]; valor: string; onChange: (id: string) => void; arriba?: boolean }) {
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState(false);
  const sel = pacientes.find((p) => p.id === valor);
  const lista = pacientes.filter((p) => `${p.nombre} ${p.dni ?? ""}`.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  return (
    <div className="relative">
      <button type="button" onClick={() => setAbierto(!abierto)} className={inp + " flex items-center justify-between text-left"}>
        <span className={sel ? "" : "text-muted-foreground"}>{sel ? `${sel.nombre}${sel.dni ? ` · C.C. ${sel.dni}` : ""}` : "Elija un paciente"}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>
      {abierto && (
        <div className={`absolute inset-x-0 z-30 rounded-xl border border-border bg-card p-2 shadow-2xl ${arriba ? "bottom-12" : "top-12"}`}>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className={inp + " h-9"} />
          <ul className="mt-1 max-h-60 overflow-y-auto">
            {lista.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => { onChange(p.id); setAbierto(false); setQ(""); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-secondary">
                  <Avatar nombre={p.nombre} size="size-7" />
                  <span className="min-w-0 flex-1 truncate">{p.nombre}</span>
                  {p.dni && <span className="text-xs text-muted-foreground">{p.dni}</span>}
                </button>
              </li>
            ))}
            {lista.length === 0 && <li className="px-2 py-3 text-center text-xs text-muted-foreground">Sin resultados. Cárguelo en Pacientes.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

type PeriodoReg = "hoy" | "mes" | "total";
type FiltroPac = "todos" | "cardio" | "nefro" | "alergias" | "sinportal";

function PadronTab({ user, log, turnos, abrir, inicial, soloLectura = false }: { user: SessionUser; log: LogFn; turnos: Turno[]; abrir: (tab: Tab, pacienteId: string) => void; inicial: string | null; soloLectura?: boolean }) {
  const [abiertoId, setAbiertoId] = useState<string | null>(inicial);
  const [detalle, setDetalle] = useState<"pacientes" | "usuarios" | null>(null);
  const [periodo, setPeriodo] = useState<PeriodoReg>("total");
  const [estadoU, setEstadoU] = useState<"Todos" | EstadoAcceso>("Todos");
  const [portalUsuarios] = useDato<PacientePortal[]>(KEY_PACIENTES, []);
  const pacientes = usePacientesClinica(turnos);
  const [padronLista, setPadron] = useDato<PacienteClinica[]>(KEY_PADRON, []);
  const [importando, setImportando] = useState(false);
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<FiltroPac>("todos");
  const [editando, setEditando] = useState<PacienteClinica | null>(null);

  const vacio = (): PacienteClinica => ({ id: nuevoId(), nombre: "", dni: "", antecedentes: [], creado: new Date().toISOString(), medicoCabecera: user.nombre });
  const visibles = pacientes.filter((p) => {
    if (q && !norm(`${p.nombre} ${p.dni ?? ""} ${p.telefono ?? ""}`).includes(norm(q))) return false;
    const ant = p.ficha?.antecedentes ?? [];
    if (filtro === "cardio") return esCardio(ant);
    if (filtro === "nefro") return esNefro(ant);
    if (filtro === "alergias") return !!p.ficha?.alergias;
    if (filtro === "sinportal") return !p.portal;
    return true;
  });
  const vmPad = useVerMas(visibles, 10);

  const editar = (p: PacienteHC) => {
    if (p.origen !== "padron") {
      // Se pasa al padrón con los datos que ya hay
      setEditando({
        id: p.origen === "portal" ? `pad-${p.id}` : nuevoId(),
        nombre: p.nombre,
        dni: p.dni ?? "",
        telefono: p.telefono,
        email: p.email,
        nacimiento: p.ficha?.nacimiento,
        obraSocial: p.ficha?.obraSocial,
        afiliado: p.ficha?.afiliado,
        alergias: p.ficha?.alergias,
        antecedentes: [...(p.ficha?.antecedentes ?? [])],
        creado: new Date().toISOString(),
      } as PacienteClinica);
      return;
    }
    const [orig] = leerDato<PacienteClinica[]>(KEY_PADRON, []).filter((x) => x.id === p.id);
    if (orig) setEditando({ ...orig, antecedentes: [...orig.antecedentes] });
  };

  const guardar = (e: FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    const limpio = JSON.parse(JSON.stringify({ ...editando, nombre: nombrePropio(editando.nombre).trim(), dni: limpiarDoc(editando.dni) })) as PacienteClinica;
    const existe = leerDato<PacienteClinica[]>(KEY_PADRON, []).some((x) => x.id === limpio.id);
    setPadron((prev) => (existe ? prev.map((x) => (x.id === limpio.id ? limpio : x)) : [limpio, ...prev]));
    log(existe ? "Paciente actualizado" : "Paciente nuevo", `${limpio.nombre} · C.C. ${limpio.dni}`);
    toast.success(existe ? "Datos del paciente actualizados" : "Paciente agregado");
    setEditando(null);
  };

  const total = pacientes.length;
  // Fecha de registro de cada paciente (los que solo tienen turno: su primer turno)
  const altaDe = (p: PacienteHC) => {
    if (p.creado) return diaLocal(p.creado);
    const primero = turnos.filter((t) => norm(t.paciente) === norm(p.nombre)).map((t) => t.fecha).sort()[0];
    return primero ?? "sin-fecha";
  };
  const hoyIsoReg = isoDe(new Date());
  const regHoy = pacientes.filter((p) => altaDe(p) === hoyIsoReg);
  const regMes = pacientes.filter((p) => altaDe(p).slice(0, 7) === hoyIsoReg.slice(0, 7));
  const delPeriodo = periodo === "hoy" ? regHoy : periodo === "mes" ? regMes : pacientes;
  const porDia = Object.entries(
    delPeriodo.reduce<Record<string, PacienteHC[]>>((acc, p) => {
      const d = altaDe(p);
      (acc[d] ??= []).push(p);
      return acc;
    }, {}),
  ).sort((a, b) => (a[0] === "sin-fecha" ? 1 : b[0] === "sin-fecha" ? -1 : b[0].localeCompare(a[0])));
  const usuarios = [...portalUsuarios].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const usuariosVis = estadoU === "Todos" ? usuarios : usuarios.filter((u) => u.estado === estadoU);
  const set = (k: keyof PacienteClinica) => (e: { target: { value: string } }) => editando && setEditando({ ...editando, [k]: e.target.value });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:max-w-4xl">
        <Kpi
          icon={Users}
          label="Pacientes"
          value={String(total)}
          hint="Registrados en la clínica"
          desglose={[{ l: "Hoy", v: regHoy.length }, { l: "Este mes", v: regMes.length }, { l: "Total", v: total }]}
          onClick={() => setDetalle(detalle === "pacientes" ? null : "pacientes")}
          activo={detalle === "pacientes"}
        />
        <Kpi
          icon={LogIn}
          label="Usuarios registrados"
          value={String(usuarios.length)}
          hint="Con acceso al portal del paciente"
          tono="violeta"
          delay={0.05}
          desglose={[{ l: "Activos", v: usuarios.filter((u) => u.estado === "Activo").length }, { l: "Invitados", v: usuarios.filter((u) => u.estado === "Invitado").length }, { l: "Bloqueados", v: usuarios.filter((u) => u.estado === "Revocado").length }]}
          onClick={() => setDetalle(detalle === "usuarios" ? null : "usuarios")}
          activo={detalle === "usuarios"}
        />
      </div>

      {detalle === "pacientes" && (
        <Seccion icon={Users} titulo="Pacientes registrados" sub="Discriminados por día, mes y total">
          <div className="mb-4 flex flex-wrap gap-1.5">
            {([["hoy", "Hoy", regHoy.length], ["mes", "Este mes", regMes.length], ["total", "Total", total]] as [PeriodoReg, string, number][]).map(([id, l, n]) => (
              <button key={id} onClick={() => setPeriodo(id)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${periodo === id ? "pn-acc-tile text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {l} <span className={`rounded-full px-1.5 tabular-nums ${periodo === id ? "bg-white/20" : "bg-background"}`}>{n}</span>
              </button>
            ))}
          </div>
          {porDia.length === 0 ? (
            <Vacio icon={Users} texto={periodo === "hoy" ? "Hoy no se registraron pacientes." : periodo === "mes" ? "Este mes no se registraron pacientes." : "Todavía no hay pacientes."} />
          ) : (
            <div className="space-y-5">
              {porDia.map(([dia, lista]) => (
                <div key={dia}>
                  <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    <CalendarDays className="size-3.5" /> {dia === "sin-fecha" ? "Sin fecha de registro" : new Date(`${dia}T12:00`).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] tabular-nums">{lista.length}</span>
                  </p>
                  <ul className="divide-y divide-border/60 rounded-2xl border border-border/60">
                    {lista.map((p) => (
                      <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                        <Avatar nombre={p.nombre} size="size-9" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{p.nombre}</p>
                          <p className="truncate text-xs text-muted-foreground">{[p.dni ? `C.C. ${p.dni}` : null, p.telefono, p.ficha?.obraSocial].filter(Boolean).join(" · ") || "Sin datos"}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${p.origen === "padron" ? "bg-sky-100 text-sky-800 ring-sky-200" : p.origen === "portal" ? "bg-violet-100 text-violet-700 ring-violet-200" : "bg-amber-100 text-amber-800 ring-amber-200"}`}>
                          {p.origen === "padron" ? "Cargado en clínica" : p.origen === "portal" ? "Portal" : "Desde cita"}
                        </span>
                        <button onClick={() => { setAbiertoId(p.id); setDetalle(null); window.setTimeout(() => document.getElementById(`pac-${p.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[rgb(var(--acc))] hover:bg-[rgba(var(--acc),.08)]">Abrir carpeta</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Seccion>
      )}

      {detalle === "usuarios" && (
        <Seccion icon={LogIn} titulo="Usuarios registrados" sub={`${usuarios.length} con acceso al portal · ${usuarios.filter((u) => diaLocal(u.fecha) === isoDe(new Date())).length} hoy · ${usuarios.filter((u) => diaLocal(u.fecha).slice(0, 7) === isoDe(new Date()).slice(0, 7)).length} este mes`}>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {(["Todos", "Activo", "Invitado", "Revocado"] as const).map((e) => {
              const n = e === "Todos" ? usuarios.length : usuarios.filter((u) => u.estado === e).length;
              const on = estadoU === e;
              return (
                <button key={e} onClick={() => setEstadoU(e)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${on ? "pn-acc-tile text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {e === "Activo" ? "Activos" : e === "Invitado" ? "Invitados" : e === "Revocado" ? "Bloqueados" : "Todos"} <span className={`rounded-full px-1.5 tabular-nums ${on ? "bg-white/20" : "bg-background"}`}>{n}</span>
                </button>
              );
            })}
          </div>
          {usuariosVis.length === 0 ? (
            <Vacio icon={LogIn} texto="No hay usuarios en este estado. Se crean al invitar pacientes desde Portal del paciente." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="pb-3 pr-3 font-medium">Usuario</th>
                    <th className="pb-3 pr-3 font-medium">Contacto</th>
                    <th className="pb-3 pr-3 font-medium">Estado</th>
                    <th className="pb-3 pr-3 font-medium">Registrado</th>
                    <th className="pb-3 font-medium">Último ingreso</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosVis.map((u) => (
                    <tr key={u.id} className="border-b border-border/60 last:border-0">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <Avatar nombre={u.nombre} size="size-9" />
                          <div className="min-w-0">
                            <p className="font-medium">{u.nombre}</p>
                            <p className="text-xs text-muted-foreground">C.C. {u.dni}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-xs">
                        <p>{u.email || "—"}</p>
                        <p className="text-muted-foreground">{u.telefono || "—"}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${u.estado === "Activo" ? "bg-emerald-100 text-emerald-800 ring-emerald-200" : u.estado === "Invitado" ? "bg-amber-100 text-amber-800 ring-amber-200" : "bg-red-100 text-red-700 ring-red-200"}`}>
                          {u.estado === "Revocado" ? "Bloqueado" : u.estado}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-xs">
                        <p>{fechaHora(u.fecha)}</p>
                        <p className="text-muted-foreground">Por {nombreCorto(u.invitadoPor)}</p>
                      </td>
                      <td className="py-3 text-xs">{u.ultimoIngreso ? fechaHora(u.ultimoIngreso) : <span className="text-muted-foreground">Nunca ingresó</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Seccion>
      )}

      {editando && (
        <form onSubmit={guardar} className="pn-card pn-up space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div>
              <h3 className="text-[15px] font-semibold">{editando.nombre ? editando.nombre : "Nuevo paciente"}</h3>
              <p className="text-xs text-muted-foreground">Datos personales, cobertura y antecedentes clínicos</p>
            </div>
            <button type="button" onClick={() => setEditando(null)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><X className="size-4" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Campo label="Nombre y apellido" className="sm:col-span-2"><input required value={editando.nombre} onChange={(e) => setEditando({ ...editando, nombre: nombrePropio(e.target.value) })} className={inp} /></Campo>
            <Campo label="Tipo de documento">
              <select value={editando.tipoDoc ?? "CC"} onChange={set("tipoDoc")} className={inp}>
                {TIPOS_DOC.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Campo>
            <Campo label="Número de documento"><input required inputMode="numeric" value={editando.dni} onChange={set("dni")} className={inp} /></Campo>
            <Campo label="Fecha de nacimiento"><input type="date" value={editando.nacimiento ?? ""} onChange={set("nacimiento")} className={inp} /></Campo>
            <Campo label="Sexo">
              <select value={editando.sexo ?? ""} onChange={set("sexo")} className={inp}>
                <option value="">—</option><option value="F">Femenino</option><option value="M">Masculino</option><option value="X">X</option>
              </select>
            </Campo>
            <Campo label="WhatsApp / teléfono"><input type="tel" value={editando.telefono ?? ""} onChange={set("telefono")} className={inp} /></Campo>
            <Campo label="Email"><input type="email" value={editando.email ?? ""} onChange={set("email")} className={inp} /></Campo>
            <Campo label="Domicilio"><input value={editando.domicilio ?? ""} onChange={set("domicilio")} className={inp} /></Campo>
            <Campo label="EPS / medicina prepagada"><input value={editando.obraSocial ?? ""} onChange={set("obraSocial")} placeholder="Particular, Sura, Sanitas, Nueva EPS…" className={inp} /></Campo>
            <Campo label="N° de afiliado"><input value={editando.afiliado ?? ""} onChange={set("afiliado")} className={inp} /></Campo>
            <Campo label="Médico de cabecera">
              <select value={editando.medicoCabecera ?? ""} onChange={set("medicoCabecera")} className={inp}>
                <option value="">—</option>
                {ADMINS.map((a) => <option key={a.id}>{a.nombre}</option>)}
              </select>
            </Campo>
            <Campo label="Alergias"><input value={editando.alergias ?? ""} onChange={set("alergias")} placeholder="Ninguna conocida" className={inp} /></Campo>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Especialidades que lo atienden</p>
            <p className="mb-2 text-[11px] text-muted-foreground">Los médicos invitados solo ven a los pacientes de su especialidad. También se suman solos al sacar una cita de esa especialidad.</p>
            <div className="flex flex-wrap gap-1.5">
              {ESPECIALIDADES_PACIENTE.map((e) => {
                const lista = editando.especialidades ?? [];
                const on = lista.includes(e);
                return (
                  <button type="button" key={e} onClick={() => setEditando({ ...editando, especialidades: on ? lista.filter((x) => x !== e) : [...lista, e] })}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${on ? "pn-acc-tile text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                    {on && <Check className="size-3" />} {e}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Antecedentes</p>
            <div className="flex flex-wrap gap-1.5">
              {ANTECEDENTES.map((a) => {
                const on = editando.antecedentes.includes(a);
                return (
                  <button type="button" key={a} onClick={() => setEditando({ ...editando, antecedentes: on ? editando.antecedentes.filter((x) => x !== a) : [...editando.antecedentes, a] })} className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${on ? "pn-acc-tile text-white ring-transparent" : "bg-background text-muted-foreground ring-border hover:text-foreground"}`}>
                    {on && <Check className="size-3" />} {a}
                  </button>
                );
              })}
            </div>
          </div>
          <Campo label="Notas"><textarea rows={3} value={editando.notas ?? ""} onChange={set("notas")} className={inp + " h-auto resize-none py-3"} /></Campo>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button type="submit" className="rounded-xl px-6"><Check className="size-4" /> Guardar paciente</Button>
          </div>
        </form>
      )}

      <Seccion
        icon={Users}
        titulo="Padrón de pacientes"
        sub={`${visibles.length} de ${total}`}
        acciones={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="h-10 rounded-xl" onClick={() => exportarCSV("pacientes", [["Nombre", "Cédula", "Teléfono", "Email", "EPS", "Afiliado", "Nacimiento", "Alergias", "Antecedentes", "Portal"], ...pacientes.map((p) => [p.nombre, p.dni, p.telefono, p.email, p.ficha?.obraSocial, p.ficha?.afiliado, p.ficha?.nacimiento, p.ficha?.alergias, (p.ficha?.antecedentes ?? []).join(" | "), p.portal ? "Sí" : "No"])])}>
              <Download className="size-4" /> Exportar
            </Button>
            {!soloLectura && <Button variant="outline" className="h-10 rounded-xl" onClick={() => setImportando(true)}><FileSpreadsheet className="size-4" /> Cargar desde archivo</Button>}
            {!soloLectura && <Button className="h-10 rounded-xl" onClick={() => setEditando(vacio())}><Plus className="size-4" /> Nuevo paciente</Button>}
          </div>
        }
      >
        {importando && (
          <ImportarPacientes
            user={user}
            log={log}
            existentes={padronLista}
            onCerrar={() => setImportando(false)}
            onImportar={(lista) => setPadron((prev) => {
              const porId = new Map(prev.map((x) => [x.id, x]));
              for (const n of lista) porId.set(n.id, { ...(porId.get(n.id) ?? {}), ...n });
              return [...porId.values()];
            })}
          />
        )}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, cédula o teléfono" className={inp + " pl-10"} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {([["todos", "Todos"], ["cardio", "Cardiología"], ["nefro", "Nefrología"], ["alergias", "Con alergias"], ["sinportal", "Sin portal"]] as [FiltroPac, string][]).map(([id, l]) => (
              <button key={id} onClick={() => setFiltro(id)} className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${filtro === id ? "pn-acc-tile text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{l}</button>
            ))}
          </div>
        </div>

        {visibles.length === 0 ? (
          <Vacio icon={Users} titulo="No hay pacientes" texto="Cargue el primero con Nuevo paciente. También aparecen los del portal y los que piden cita." />
        ) : (
          <ul className="divide-y divide-border/60">
            {vmPad.items.map((p) => {
              const edad = edadDe(p.ficha?.nacimiento);
              const ant = p.ficha?.antecedentes ?? [];
              const abierto = abiertoId === p.id;
              const hoyIso = isoDe(new Date());
              const proximo = turnos
                .filter((t) => (t.pacienteId === p.id || norm(t.paciente) === norm(p.nombre)) && t.fecha >= hoyIso && (t.estado === "Pendiente" || t.estado === "Confirmado"))
                .sort((x, y) => (x.fecha + x.hora).localeCompare(y.fecha + y.hora))[0];
              return (
                <li key={p.id} id={`pac-${p.id}`} className={`-mx-2 scroll-mt-24 rounded-2xl px-2 transition-colors ${abierto ? "bg-[rgba(var(--acc),.04)]" : "hover:bg-secondary/40"}`}>
                  <div className="grid grid-cols-1 items-center gap-3 py-3.5 lg:grid-cols-[minmax(220px,1.6fr)_1.1fr_0.9fr_1fr_auto] lg:gap-4">
                    {/* Paciente */}
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar nombre={p.nombre} size="size-11" />
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold leading-tight">{p.nombre}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">{p.dni ? `C.C. ${p.dni}` : "Sin cédula"}{edad !== null ? ` · ${edad} años` : ""}</span>
                          {p.portal && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700 ring-1 ring-violet-200">Portal</span>}
                          {p.origen === "turno" && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200">Solo cita</span>}
                          {esCardio(ant) && <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-rose-200"><HeartPulse className="size-3" /> Cardio</span>}
                          {esNefro(ant) && <span className="inline-flex items-center gap-0.5 rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800 ring-1 ring-sky-200"><Droplets className="size-3" /> Nefro</span>}
                          {p.ficha?.alergias && <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 ring-1 ring-red-200"><AlertTriangle className="size-3" /> Alergia</span>}
                        </div>
                      </div>
                    </div>
                    {/* Contacto */}
                    <div className="min-w-0 text-xs">
                      <p className="truncate font-medium text-foreground/85">{p.telefono || "—"}</p>
                      <p className="mt-1 truncate text-muted-foreground">{p.email || "Sin correo"}</p>
                    </div>
                    {/* Cobertura */}
                    <div className="min-w-0">
                      <span className="inline-flex max-w-full truncate rounded-full border border-border px-2.5 py-1 text-[11px] font-medium">{p.ficha?.obraSocial || "Particular"}</span>
                    </div>
                    {/* Próximo turno */}
                    <div className="min-w-0 text-xs">
                      {proximo ? (
                        <>
                          <p className="flex items-center gap-1.5 font-semibold text-foreground/85"><CalendarDays className="size-3.5 text-[rgb(var(--acc))]" /> {proximo.fecha === hoyIso ? "Hoy" : fechaCorta(proximo.fecha).slice(0, 5)} · {hora12(proximo.hora)}</p>
                          <p className="mt-1 truncate text-muted-foreground">{nombreCorto(proximo.doctor)}</p>
                        </>
                      ) : (
                        <p className="text-muted-foreground">Sin cita agendada</p>
                      )}
                    </div>
                    {/* Acciones */}
                    <div className="flex items-center gap-2 lg:justify-end">
                      <button onClick={() => setAbiertoId(abierto ? null : p.id)} aria-expanded={abierto} className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${abierto ? "bg-secondary text-foreground" : "pn-acc-tile text-white hover:-translate-y-0.5"}`}>
                        <FileText className="size-4" /> {abierto ? "Cerrar carpeta" : "Abrir carpeta"} <ChevronDown className={`size-4 transition-transform ${abierto ? "rotate-180" : ""}`} />
                      </button>
                      {!soloLectura && <button onClick={() => editar(p)} aria-label={`Editar a ${p.nombre}`} className="grid size-9 place-items-center rounded-xl border border-border text-muted-foreground transition hover:text-foreground"><Pencil className="size-4" /></button>}
                    </div>
                  </div>
                  {abierto && (
                    <div className="pb-4">
                      <CarpetaPaciente p={p} user={user} log={log} turnos={turnos} abrir={abrir} soloLectura={soloLectura || (user.rol !== "medico" && !esAreaMedica(user.area))} onEditar={() => { if (!soloLectura) { editar(p); window.scrollTo({ top: 0, behavior: "smooth" }); } }} />
                    </div>
                  )}
                </li>
              );
            })}
            {vmPad.boton && <li className="list-none">{vmPad.boton}</li>}
          </ul>
        )}
      </Seccion>
    </div>
  );
}

/* ═══════════════════════ RECETA DIGITAL ═══════════════════════ */
const MEDICAMENTOS_FRECUENTES = [
  "Enalapril", "Losartán", "Valsartán", "Amlodipina", "Bisoprolol", "Carvedilol", "Atenolol", "Hidroclorotiazida", "Clortalidona", "Furosemida",
  "Espironolactona", "Sacubitrilo/Valsartán", "Dapagliflozina", "Empagliflozina", "Atorvastatina", "Rosuvastatina", "Ácido acetilsalicílico",
  "Clopidogrel", "Apixabán", "Rivaroxabán", "Acenocumarol", "Amiodarona", "Ivabradina", "Calcitriol", "Sevelamer", "Carbonato de calcio",
  "Bicarbonato de sodio", "Eritropoyetina", "Hierro sacarato", "Alopurinol", "Febuxostat", "Metformina", "Levotiroxina", "Omeprazol",
];

function datosMedico(user: SessionUser, firmas?: Record<string, string>) {
  const d = DOCTORS.find((x) => x.foto === user.id);
  const rm = firmas?.[`rm:${user.id}`]?.trim();
  return {
    nombre: d?.nombre ?? user.nombre,
    matricula: rm ? `R.M. ${rm}` : d?.matricula ?? "",
    especialidad: user.id === "alonso" ? "Cardiología" : user.id === "alberto" ? "Nefrología" : (user.area ?? "Medicina General").replace(" (médicos)", ""),
    titulo: d?.titulo ?? "",
  };
}

/** Pad para dibujar la firma con el mouse o el dedo. */
function FirmaPad({ onGuardar, onCancelar }: { onGuardar: (dataUrl: string) => void; onCancelar: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dibujando = useRef(false);
  const [vacio, setVacio] = useState(true);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const r = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * r;
    c.height = c.offsetHeight * r;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(r, r);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0b2a6b";
  }, []);
  const pos = (e: RPointerEvent<HTMLCanvasElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - b.left, y: e.clientY - b.top };
  };
  const limpiar = () => {
    const c = ref.current;
    c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
    setVacio(true);
  };
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-border bg-white">
        <canvas
          ref={ref}
          className="h-44 w-full touch-none cursor-crosshair"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            dibujando.current = true;
            const ctx = ref.current?.getContext("2d");
            const p = pos(e);
            ctx?.beginPath();
            ctx?.moveTo(p.x, p.y);
          }}
          onPointerMove={(e) => {
            if (!dibujando.current) return;
            const ctx = ref.current?.getContext("2d");
            const p = pos(e);
            ctx?.lineTo(p.x, p.y);
            ctx?.stroke();
            setVacio(false);
          }}
          onPointerUp={() => (dibujando.current = false)}
          onPointerLeave={() => (dibujando.current = false)}
        />
        {vacio && <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">Firme aquí con el mouse o el dedo</p>}
        <span className="pointer-events-none absolute inset-x-8 bottom-8 h-px bg-slate-300" />
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" className="rounded-xl" onClick={onCancelar}>Cancelar</Button>
        <Button type="button" variant="outline" className="rounded-xl" onClick={limpiar}>Borrar</Button>
        <Button type="button" className="rounded-xl" disabled={vacio} onClick={() => ref.current && onGuardar(ref.current.toDataURL("image/png"))}><Check className="size-4" /> Guardar firma</Button>
      </div>
    </div>
  );
}

/** Sello médico (SVG) con nombre, especialidad y registro. Se usa en pantalla y en la receta impresa. */
function selloSvg(m: { nombre: string; especialidad: string; matricula: string }, id: string, color = "#1e3a8a") {
  const pal = m.nombre.replace(/^Dra?\.\s*/, "").split(/\s+/).filter(Boolean);
  const corte = Math.ceil(pal.length / 2);
  const l1 = (/^Dra\./.test(m.nombre) ? "Dra. " : "Dr. ") + pal.slice(0, corte).join(" ");
  const l2 = pal.slice(corte).join(" ");
  const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sello médico">
<defs>
<path id="${id}a" d="M 26,100 A 74,74 0 0 1 174,100"/>
<path id="${id}b" d="M 17,100 A 83,83 0 0 0 183,100"/>
<filter id="${id}t" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.7 1.3" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter>
</defs>
<g filter="url(#${id}t)" fill="${color}" stroke="${color}">
<circle cx="100" cy="100" r="95" fill="none" stroke-width="3.2"/>
<circle cx="100" cy="100" r="89" fill="none" stroke-width="1"/>
<circle cx="100" cy="100" r="64" fill="none" stroke-width="1" stroke-dasharray="2 3"/>
<text font-family="Arial, Helvetica, sans-serif" font-size="10.5" font-weight="700" stroke="none"><textPath href="#${id}a" startOffset="50%" text-anchor="middle" textLength="208" lengthAdjust="spacingAndGlyphs">HEGO · ESPECIALIDADES MÉDICAS</textPath></text>
<text font-family="Arial, Helvetica, sans-serif" font-size="10.5" font-weight="700" letter-spacing="2" stroke="none"><textPath href="#${id}b" startOffset="50%" text-anchor="middle">★ ${esc(m.especialidad.toUpperCase())} ★</textPath></text>
<path d="M100 58 c-4-6-13-5-13 2 c0 6 9 10 13 15 c4-5 13-9 13-15 c0-7-9-8-13-2z" stroke="none"/>
<text x="100" y="${l2 ? 96 : 104}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="12.5" font-weight="700" stroke="none" textLength="${Math.min(112, l1.length * 7.2)}" lengthAdjust="spacingAndGlyphs">${esc(l1)}</text>
${l2 ? `<text x="100" y="112" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="12.5" font-weight="700" stroke="none" textLength="${Math.min(112, l2.length * 7.2)}" lengthAdjust="spacingAndGlyphs">${esc(l2)}</text>` : ""}
<line x1="64" y1="121" x2="136" y2="121" stroke-width="0.9"/>
<text x="100" y="135" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="9" font-weight="700" stroke="none">${esc(m.matricula || "Médico especialista")}</text>
<text x="100" y="147" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="7.5" stroke="none" letter-spacing="1">COLOMBIA</text>
</g></svg>`;
}

function SelloMedico({ m, className = "" }: { m: { nombre: string; especialidad: string; matricula: string }; className?: string }) {
  const id = useMemo(() => "s" + Math.random().toString(36).slice(2, 8), []);
  return <div className={`pn-keep pointer-events-none select-none [&>svg]:size-full ${className}`} dangerouslySetInnerHTML={{ __html: selloSvg(m, id) }} />;
}

async function htmlReceta(r: Receta, firma: string | undefined) {
  let qr = "";
  try {
    const QR = (await import("qrcode")).default;
    qr = await QR.toDataURL(`HEGO · Receta N° ${String(r.numero).padStart(6, "0")} · Código ${r.codigo} · ${r.paciente} · ${r.doctor} · ${fechaDe(r.fecha)}`, { margin: 1, width: 220, color: { dark: "#0b2a6b", light: "#ffffff" } });
  } catch { /* sin QR */ }
  const logo = `${location.origin}${logoClinica}`;
  const sello = selloSvg({ nombre: r.doctor, especialidad: r.especialidad, matricula: r.matricula }, "rs");
  const items = r.items
    .map((it, i) => `<div class="it"><span class="num">${i + 1}</span><div class="tx"><p class="n">${it.droga} <span>${it.presentacion}</span></p><p class="m"><b>Cantidad:</b> ${it.cantidad || "—"}</p>${it.posologia ? `<p class="pos">${it.posologia}</p>` : ""}</div></div>`)
    .join("");
  return `<!doctype html><html lang="es-CO"><head><meta charset="utf-8"><title>Receta N° ${String(r.numero).padStart(6, "0")}</title>
<style>
*{box-sizing:border-box}body{font-family:'Inter',system-ui,-apple-system,sans-serif;color:#0f172a;margin:0;padding:32px;background:radial-gradient(circle at 20% 0%,#e0e7ff,#f1f5f9 50%)}
.hoja{position:relative;max-width:760px;margin:auto;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 30px 80px -35px rgba(15,23,42,.55)}
.marca{position:absolute;inset:0;background:url('${logo}') center 58%/300px no-repeat;opacity:.05;pointer-events:none;-webkit-mask-image:radial-gradient(circle at 50% 58%,#000 0,#000 90px,transparent 150px);mask-image:radial-gradient(circle at 50% 58%,#000 0,#000 90px,transparent 150px);filter:grayscale(1)}
.top{position:relative;background:linear-gradient(130deg,#071a46 0%,#0b2a6b 45%,#1d4ed8 100%);color:#fff;padding:26px 32px 30px;display:flex;justify-content:space-between;align-items:center;gap:16px;overflow:hidden}
.top:after{content:"";position:absolute;right:-60px;top:-80px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.18),transparent 70%)}
.marcas{display:flex;align-items:center;gap:14px}.marcas img{width:54px;height:54px;border-radius:14px;background:#fff;padding:5px;box-shadow:0 8px 20px -8px rgba(0,0,0,.5)}
.top h1{margin:0;font-family:Georgia,serif;font-size:21px;letter-spacing:.01em}.top .sub{margin:3px 0 0;font-size:10px;letter-spacing:.24em;text-transform:uppercase;opacity:.7}
.top .doc{margin:8px 0 0;font-size:12.5px;opacity:.9}.rx{position:relative;z-index:1;font-family:Georgia,serif;font-size:58px;font-style:italic;line-height:1;opacity:.95;text-shadow:0 6px 20px rgba(0,0,0,.35)}
.ecg{position:absolute;left:0;right:0;bottom:6px;height:26px;opacity:.28}
.franja{height:5px;background:linear-gradient(90deg,#f43f5e,#8b5cf6,#0ea5e9)}
.body{position:relative;padding:24px 32px 26px}
.pac{display:grid;grid-template-columns:repeat(3,1fr);gap:12px 18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:14px 18px}
.pac div{font-size:13px}.pac small{display:block;font-size:9.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;margin-bottom:2px}
.pac .full{grid-column:span 2}
h2{margin:22px 0 6px;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#1d4ed8}
.it{display:flex;gap:14px;border:1px solid #e2e8f0;border-left:4px solid #1d4ed8;border-radius:14px;padding:12px 16px;margin-top:10px;background:#fff}
.num{flex:none;width:28px;height:28px;border-radius:9px;background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center}
.tx{min-width:0}.n{margin:0;font-weight:700;font-size:15.5px}.n span{font-weight:500;color:#475569}.m{margin:4px 0 0;font-size:12.5px;color:#334155}
.pos{margin:6px 0 0;font-size:13px;color:#0f172a;background:#eff6ff;border-radius:8px;padding:6px 10px;display:inline-block}
.dx{margin-top:18px;font-size:13px;padding:10px 14px;border-radius:12px;background:#fdf2f8;border:1px solid #fbcfe8}.dx b{color:#9d174d}
.ind{margin-top:10px;font-size:13px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:10px 14px}.ind b{color:#166534}
.pie{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-top:30px;padding-top:18px;border-top:1px dashed #cbd5e1}
.ver{display:flex;align-items:center;gap:12px}.ver img{width:92px;height:92px;border-radius:10px;border:1px solid #e2e8f0;padding:4px;background:#fff}
.cod{font-size:10.5px;color:#64748b;line-height:1.5}.cod b{display:block;font-family:ui-monospace,Menlo,monospace;font-size:16px;color:#0f172a;letter-spacing:.16em}
.firma{position:relative;width:270px;height:150px}.firma .f{position:absolute;left:0;right:0;bottom:34px;text-align:center;z-index:2}.firma .f img{height:76px;mix-blend-mode:multiply}
.firma .l{position:absolute;left:0;right:0;bottom:0;border-top:1.5px solid #334155;padding-top:6px;font-size:11.5px;text-align:center;line-height:1.35}
.firma .sello{position:absolute;right:-26px;bottom:34px;width:140px;height:140px;transform:rotate(-12deg);opacity:.82;mix-blend-mode:multiply;z-index:1}
.legal{margin:18px 0 0;font-size:9.5px;color:#94a3b8;text-align:center}
.anulada{position:absolute;top:44%;left:50%;transform:translate(-50%,-50%) rotate(-18deg);color:#dc2626;font-weight:900;font-size:54px;letter-spacing:.1em;border:6px solid #dc2626;padding:6px 24px;border-radius:14px;opacity:.55;z-index:5}
@media print{body{background:#fff;padding:0}.hoja{box-shadow:none;border-radius:0}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body><div class="hoja"><div class="marca"></div>
<div class="top"><div><div class="marcas"><img src="${logo}" alt=""><div><h1>HEGO</h1><p class="sub">Centro de especialidades médicas</p></div></div>
<p class="doc"><b>${r.doctor}</b> · ${r.especialidad}${r.matricula ? ` · ${r.matricula}` : ""}</p></div><div class="rx">Rp/</div>
<svg class="ecg" viewBox="0 0 600 30" preserveAspectRatio="none"><polyline fill="none" stroke="#fff" stroke-width="1.6" points="0,18 120,18 135,18 142,4 150,28 158,10 165,18 300,18 315,18 322,4 330,28 338,10 345,18 480,18 495,18 502,4 510,28 518,10 525,18 600,18"/></svg></div>
<div class="franja"></div>
<div class="body">${r.anulada ? `<div class="anulada">ANULADA</div>` : ""}
<div class="pac"><div class="full"><small>Paciente</small><b>${r.paciente}</b></div><div><small>Receta N°</small><b>${String(r.numero).padStart(6, "0")}</b></div>
<div><small>Cédula</small>${r.dni ?? "—"}</div><div><small>Cobertura</small>${r.obraSocial ?? "Particular"}</div><div><small>Fecha</small>${fechaDe(r.fecha)}</div>
${r.afiliado ? `<div class="full"><small>Afiliado</small>${r.afiliado}</div>` : ""}</div>
<h2>Prescripción</h2>${items}
<p class="dx"><b>Diagnóstico:</b> ${r.diagnostico}</p>${r.indicaciones ? `<p class="ind"><b>Indicaciones:</b> ${r.indicaciones}</p>` : ""}
<div class="pie"><div class="ver">${qr ? `<img src="${qr}" alt="QR">` : ""}<div class="cod">Código de verificación<b>${r.codigo}</b>Firmada digitalmente<br>${new Date(r.fecha).toLocaleString("es-CO")}</div></div>
<div class="firma"><div class="sello">${sello}</div><div class="f">${firma ? `<img src="${firma}" alt="Firma">` : ""}</div><div class="l"><b>${r.doctor}</b><br>${r.especialidad}${r.matricula ? ` · ${r.matricula}` : ""}</div></div></div>
<p class="legal">Documento generado por HEGO · Centro de especialidades médicas. Verifique la receta con el código o el QR.</p>
</div></div><script>window.onload=()=>setTimeout(()=>window.print(),400)</script></body></html>`;
}
function imprimirHtml(html: string | Promise<string>) {
  const w = window.open("", "_blank", "width=840,height=1060");
  if (!w) return;
  w.document.write("<p style='font-family:system-ui;padding:40px;color:#64748b'>Preparando documento…</p>");
  void Promise.resolve(html).then((h) => {
    w.document.open();
    w.document.write(h);
    w.document.close();
  });
}

function RecetasTab({ user, log, turnos, inicial }: { user: SessionUser; log: LogFn; turnos: Turno[]; inicial: string | null }) {
  const pacientes = usePacientesClinica(turnos);
  const [recetas, setRecetas] = useDato<Receta[]>(KEY_RECETAS, []);
  const [firmas, setFirmas] = useDato<Record<string, string>>(KEY_FIRMAS, {});
  const [firmando, setFirmando] = useState(false);
  const [pacId, setPacId] = useState(inicial ?? "");
  const [dx, setDx] = useState("");
  const [indic, setIndic] = useState("");
  const vacioItem = (): ItemReceta => ({ droga: "", presentacion: "", cantidad: "1 caja", posologia: "" });
  const [items, setItems] = useState<ItemReceta[]>([vacioItem()]);
  const [q, setQ] = useState("");
  const med = datosMedico(user, firmas);
  const firma = firmas[user.id];
  const [rm, setRm] = useState(firmas[`rm:${user.id}`] ?? "");
  const pac = pacientes.find((p) => p.id === pacId);

  const emitir = (e: FormEvent) => {
    e.preventDefault();
    if (!pac) { toast.error("Elija un paciente"); return; }
    if (!firma) { toast.error("Primero registra su firma"); return; }
    const validos = items.filter((i) => i.droga.trim());
    if (validos.length === 0) { toast.error("Agregue al menos un medicamento"); return; }
    const numero = (recetas.reduce((m, r) => Math.max(m, r.numero), 0) || 0) + 1;
    const r = JSON.parse(
      JSON.stringify({
        id: nuevoId(),
        numero,
        fecha: new Date().toISOString(),
        pacienteId: pac.id,
        paciente: pac.nombre,
        dni: pac.dni,
        obraSocial: pac.ficha?.obraSocial,
        afiliado: pac.ficha?.afiliado,
        doctorId: user.id,
        doctor: med.nombre,
        matricula: med.matricula,
        especialidad: med.especialidad,
        diagnostico: dx.trim(),
        items: validos,
        indicaciones: indic.trim() || undefined,
        codigo: Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
        firmada: true,
      }),
    ) as Receta;
    setRecetas((prev) => [r, ...prev]);
    log("Receta emitida", `N° ${numero} · ${pac.nombre}`);
    toast.success(`Receta N° ${numero} firmada y emitida`);
    setItems([vacioItem()]);
    setDx("");
    setIndic("");
    imprimirHtml(htmlReceta(r, firma));
  };

  const lista = recetas.filter((r) => !q || norm(`${r.paciente} ${r.numero} ${r.items.map((i) => i.droga).join(" ")}`).includes(norm(q)));
  const hoy = recetas.filter((r) => isoDe(new Date(r.fecha)) === isoDe(new Date())).length;
  const telDe = (r: Receta) => pacientes.find((p) => p.id === r.pacienteId)?.telefono;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Pill} label="Recetas emitidas" value={String(recetas.filter((r) => !r.anulada).length)} hint="En total" tono="violeta" />
        <Kpi icon={CalendarCheck} label="Hoy" value={String(hoy)} hint="Recetas de hoy" delay={0.05} />
        <Kpi icon={Users} label="Pacientes" value={String(new Set(recetas.map((r) => r.pacienteId)).size)} hint="Con receta" tono="verde" delay={0.1} />
        <Kpi icon={PenLine} label="Su firma" value={firma ? "Registrada" : "Falta"} hint={firma ? "Se usa en cada receta" : "Regístrela para emitir"} tono={firma ? "verde" : "ambar"} delay={0.15} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <form onSubmit={emitir} className="pn-card pn-up space-y-5 overflow-hidden p-0">
          <div className="relative overflow-hidden gradient-deep px-6 py-5 text-white">
            <div className="pn-cross pointer-events-none absolute inset-0 opacity-60" />
            <span className="pn-orb pointer-events-none absolute -right-14 -top-20 size-56 rounded-full bg-violet-400/30 blur-3xl" />
            <Electro latidos={4} grilla={false} color="#ffffff" className="pointer-events-none absolute inset-x-0 bottom-0 h-10 w-full opacity-20" />
            <div className="relative flex flex-wrap items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-white/12 font-display text-3xl italic ring-1 ring-white/25 backdrop-blur">Rp/</span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">Receta digital</p>
                <h3 className="font-display text-2xl font-semibold tracking-tight">Nueva receta</h3>
                <p className="mt-0.5 text-xs text-white/75">{med.nombre} · {med.especialidad}{med.matricula ? ` · ${med.matricula}` : ""}</p>
              </div>
              <div className="flex gap-1.5 text-[11px] font-semibold">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ring-1 ${firma ? "bg-emerald-400/20 text-emerald-100 ring-emerald-300/30" : "bg-amber-400/20 text-amber-100 ring-amber-300/30"}`}>{firma ? <Check className="size-3" /> : <AlertTriangle className="size-3" />} Firma</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-1 text-emerald-100 ring-1 ring-emerald-300/30"><Check className="size-3" /> Sello</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 ring-1 ring-white/20"><QrCode className="size-3" /> QR</span>
              </div>
            </div>
          </div>
          <div className="space-y-5 px-6 pb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Paciente"><SelectorPaciente pacientes={pacientes} valor={pacId} onChange={setPacId} /></Campo>
            <Campo label="Diagnóstico"><input required value={dx} onChange={(e) => setDx(e.target.value)} placeholder="Hipertensión arterial, ERC estadio 3a…" className={inp} /></Campo>
          </div>
          {pac && (
            <p className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-secondary px-2.5 py-1">Cobertura: {pac.ficha?.obraSocial || "Particular"}</span>
              {pac.ficha?.afiliado && <span className="rounded-full bg-secondary px-2.5 py-1">Afiliado {pac.ficha.afiliado}</span>}
              {pac.ficha?.alergias && <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 font-semibold text-red-700"><AlertTriangle className="size-3" /> Alergias: {pac.ficha.alergias}</span>}
            </p>
          )}

          <datalist id="meds-frecuentes">{MEDICAMENTOS_FRECUENTES.map((m) => <option key={m} value={m} />)}</datalist>
          <div className="space-y-3">
            {items.map((it, i) => (
              <div key={i} className="relative rounded-2xl border border-border/70 border-l-4 border-l-[rgb(var(--acc))] bg-secondary/30 p-4 transition hover:shadow-md">
                <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"><span className="flex size-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-[11px] text-white">{i + 1}</span> Medicamento</p>
                <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_0.8fr]">
                  <input list="meds-frecuentes" value={it.droga} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, droga: e.target.value } : x)))} placeholder="Droga (nombre genérico)" className={inp} />
                  <input value={it.presentacion} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, presentacion: e.target.value } : x)))} placeholder="10 mg x 30 comp." className={inp} />
                  <input value={it.cantidad} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, cantidad: e.target.value } : x)))} placeholder="Cantidad" className={inp} />
                  <input value={it.posologia} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, posologia: e.target.value } : x)))} placeholder="1 comprimido cada 12 horas" className={inp + " sm:col-span-3"} />
                </div>
                {items.length > 1 && (
                  <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button>
                )}
              </div>
            ))}
            {items.length < 3 && (
              <button type="button" onClick={() => setItems([...items, vacioItem()])} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"><Plus className="size-4" /> Agregar medicamento</button>
            )}
          </div>
          <Campo label="Indicaciones (opcional)"><textarea rows={2} value={indic} onChange={(e) => setIndic(e.target.value)} placeholder="Dieta hiposódica, control de presión en domicilio…" className={inp + " h-auto resize-none py-3"} /></Campo>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
            <p className="max-w-md text-[11px] leading-relaxed text-muted-foreground">
              La receta sale con su firma, su sello, un código de verificación y un QR. Para que tenga validez como prescripción electrónica ante farmacias y EPS debe emitirse por una plataforma habilitada; eso se conecta más adelante.
            </p>
            <Button type="submit" className="rounded-xl px-6 shadow-[0_12px_28px_-14px_rgba(29,78,216,.9)]" disabled={!firma}><PenLine className="size-4" /> Firmar y emitir</Button>
          </div>
          </div>
        </form>

        <div className="space-y-6">
          <Seccion icon={FileText} titulo="Vista previa" sub="Así sale la receta" delay={0.02}>
            <div className="pn-keep relative overflow-hidden rounded-2xl bg-white text-slate-900 shadow-[0_20px_50px_-30px_rgba(15,23,42,.6)] ring-1 ring-slate-200">
              <div className="flex items-center justify-between bg-gradient-to-r from-[#071a46] via-[#0b2a6b] to-[#1d4ed8] px-4 py-3 text-white">
                <div className="flex items-center gap-2"><img src={logoClinica} alt="" className="size-7 rounded-lg bg-white p-0.5" /><div><p className="font-display text-sm font-semibold leading-none">HEGO</p><p className="text-[8px] uppercase tracking-[0.2em] opacity-70">Especialidades médicas</p></div></div>
                <span className="font-display text-2xl italic">Rp/</span>
              </div>
              <div className="h-1 bg-gradient-to-r from-rose-500 via-violet-500 to-sky-500" />
              <div className="space-y-2 p-4 text-[11px]">
                <div className="rounded-lg bg-slate-50 px-2.5 py-2 ring-1 ring-slate-200"><p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-500">Paciente</p><p className="font-semibold">{pac?.nombre ?? "—"}</p></div>
                {items.filter((x) => x.droga.trim()).length === 0 ? (
                  <p className="py-2 text-center text-slate-400">Los medicamentos aparecen aquí</p>
                ) : items.filter((x) => x.droga.trim()).map((x, i) => (
                  <div key={i} className="flex gap-2 rounded-lg border-l-[3px] border-blue-600 bg-white px-2 py-1.5 ring-1 ring-slate-200">
                    <span className="flex size-4 shrink-0 items-center justify-center rounded bg-blue-600 text-[9px] font-bold text-white">{i + 1}</span>
                    <div className="min-w-0"><p className="truncate font-semibold">{x.droga} <span className="font-normal text-slate-500">{x.presentacion}</span></p>{x.posologia && <p className="truncate text-slate-600">{x.posologia}</p>}</div>
                  </div>
                ))}
                <div className="flex items-end justify-between border-t border-dashed border-slate-300 pt-2">
                  <span className="flex size-10 items-center justify-center rounded-md ring-1 ring-slate-200"><QrCode className="size-6 text-[#0b2a6b]" /></span>
                  <div className="relative h-24 w-40">
                    <SelloMedico m={med} className="absolute -right-1 bottom-1 size-24 -rotate-12 opacity-80 mix-blend-multiply" />
                    {firma && <img src={firma} alt="" className="absolute inset-x-0 bottom-5 mx-auto h-12 mix-blend-multiply" />}
                    <p className="absolute inset-x-0 bottom-0 border-t border-slate-500 pt-0.5 text-center text-[8.5px] leading-tight">{med.nombre}</p>
                  </div>
                </div>
              </div>
            </div>
          </Seccion>
          <div className="pn-card pn-up relative overflow-hidden p-5">
            <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-amber-400/20 blur-2xl" />
            <div className="relative flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-md"><Landmark className="size-[18px]" /></span>
              <div className="min-w-0">
                <p className="font-semibold">¿Medicamento no PBS?</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">Lo que no cubre el Plan de Beneficios (no financiado con la UPC) se prescribe en MIPRES, la plataforma del Ministerio. Lo demás se receta aquí.</p>
                <a href={MIPRES_URL} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_-12px_rgba(234,88,12,.9)] transition hover:-translate-y-0.5">Abrir MIPRES <ArrowRight className="size-3.5" /></a>
              </div>
            </div>
          </div>
          <Seccion icon={PenLine} titulo="Firma y sello" sub={firma ? "Registrados · se usan en cada receta" : "Dibuje su firma una sola vez"} delay={0.05}>
            <form
              className="mb-4 flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const v = rm.replace(/^R\.?\s*M\.?\s*/i, "").trim();
                setFirmas((p) => ({ ...p, [`rm:${user.id}`]: v }));
                setRm(v);
                log("Registro médico actualizado", v || "(vacío)");
                toast.success(v ? "Registro médico guardado: sale en la receta y en el sello" : "Registro médico borrado");
              }}
            >
              <label className="flex-1">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Registro médico (R.M.)</span>
                <input value={rm} onChange={(e) => setRm(e.target.value)} placeholder="Ej.: 1234567" className={inp} />
              </label>
              <Button type="submit" variant="outline" className="h-11 rounded-xl"><Check className="size-4" /> Guardar</Button>
            </form>
            {firmando ? (
              <FirmaPad
                onCancelar={() => setFirmando(false)}
                onGuardar={(d) => {
                  setFirmas((p) => ({ ...p, [user.id]: d }));
                  setFirmando(false);
                  log("Firma registrada", med.nombre);
                  toast.success("Firma guardada");
                }}
              />
            ) : firma ? (
              <div className="space-y-3">
                <div className="pn-keep grid grid-cols-[1fr_auto] items-center gap-2 rounded-2xl bg-white p-4 ring-1 ring-border">
                  <div className="text-center">
                    <img src={firma} alt="Firma" className="mx-auto h-16" />
                    <p className="mt-1 border-t border-slate-300 pt-1.5 text-[11px] text-slate-600">{med.nombre}</p>
                  </div>
                  <SelloMedico m={med} className="size-24 -rotate-12 opacity-85" />
                </div>
                <Button variant="outline" className="w-full rounded-xl" onClick={() => setFirmando(true)}><Pencil className="size-4" /> Cambiar firma</Button>
              </div>
            ) : (
              <Vacio icon={PenLine} titulo="Sin firma" texto="Registre su firma para poder emitir recetas y órdenes." accion={<Button className="rounded-xl" onClick={() => setFirmando(true)}><PenLine className="size-4" /> Registrar firma</Button>} />
            )}
          </Seccion>
        </div>
      </div>

      <Seccion
        icon={ClipboardList}
        titulo="Recetas emitidas"
        sub={`${lista.length} recetas`}
        acciones={
          <div className="relative w-64 max-w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Paciente, N° o droga" className={inp + " h-10 pl-10"} />
          </div>
        }
      >
        {lista.length === 0 ? (
          <Vacio icon={Pill} texto="Las recetas que emita aparecen aquí para reimprimir, enviar o anular." />
        ) : (
          <ul className="divide-y divide-border/60">
            {lista.map((r) => {
              const tel = telDe(r);
              return (
                <li key={r.id} className={`flex flex-col gap-3 py-3.5 lg:flex-row lg:items-center ${r.anulada ? "opacity-55" : ""}`}>
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-700 font-display text-sm italic text-white">Rp</span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-semibold">
                        {r.paciente}
                        <span className="text-xs font-normal text-muted-foreground">N° {String(r.numero).padStart(6, "0")}</span>
                        {r.anulada && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 ring-1 ring-red-200">Anulada</span>}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{r.items.map((i) => `${i.droga} ${i.presentacion}`).join(" · ")}</p>
                      <p className="text-[11px] text-muted-foreground">{fechaHora(r.fecha)} · {nombreCorto(r.doctor)} · Código {r.codigo}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => imprimirHtml(htmlReceta(r, firmas[r.doctorId]))} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"><FileText className="size-3.5" /> Ver / imprimir</button>
                    {tel && !r.anulada && (
                      <a
                        href={waDe(tel, `Hola ${r.paciente.split(" ")[0]}, le enviamos su receta N° ${r.numero} del Centro HEGO:\n${r.items.map((i) => `• ${i.droga} ${i.presentacion} — ${i.posologia}`).join("\n")}\nCódigo de verificación: ${r.codigo}`)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                      >
                        <Send className="size-3.5" /> WhatsApp
                      </a>
                    )}
                    {!r.anulada && r.doctorId === user.id && (
                      <button
                        onClick={() => {
                          const motivo = window.prompt("Motivo de la anulación");
                          if (!motivo) return;
                          setRecetas((prev) => prev.map((x) => (x.id === r.id ? { ...x, anulada: { motivo, fecha: new Date().toISOString() } } : x)));
                          log("Receta anulada", `N° ${r.numero} · ${motivo}`);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600"
                      >
                        <Ban className="size-3.5" /> Anular
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Seccion>
    </div>
  );
}

/* ═══════════════════════ LABORATORIO ═══════════════════════ */
type Determinacion = { id: string; nombre: string; unidad: string; min?: number; max?: number };
const PANELES_LAB: { id: string; nombre: string; esp: "Nefrología" | "Cardiología" | "General"; det: Determinacion[] }[] = [
  {
    id: "renal",
    nombre: "Perfil renal",
    esp: "Nefrología",
    det: [
      { id: "urea", nombre: "Urea", unidad: "mg/dl", min: 15, max: 45 },
      { id: "creatinina", nombre: "Creatinina", unidad: "mg/dl", min: 0.6, max: 1.2 },
      { id: "egfr", nombre: "Filtrado glomerular (eGFR)", unidad: "ml/min", min: 60 },
      { id: "acido_urico", nombre: "Ácido úrico", unidad: "mg/dl", min: 2.5, max: 7 },
    ],
  },
  {
    id: "iono",
    nombre: "Ionograma",
    esp: "Nefrología",
    det: [
      { id: "sodio", nombre: "Sodio", unidad: "mEq/l", min: 135, max: 145 },
      { id: "potasio", nombre: "Potasio", unidad: "mEq/l", min: 3.5, max: 5.0 },
      { id: "cloro", nombre: "Cloro", unidad: "mEq/l", min: 98, max: 107 },
    ],
  },
  {
    id: "orina",
    nombre: "Orina y proteinuria",
    esp: "Nefrología",
    det: [
      { id: "proteinuria", nombre: "Proteinuria 24 h", unidad: "g/24h", max: 0.15 },
      { id: "rac", nombre: "Albúmina/creatinina (RAC)", unidad: "mg/g", max: 30 },
    ],
  },
  {
    id: "fosfo",
    nombre: "Metabolismo fosfocálcico",
    esp: "Nefrología",
    det: [
      { id: "calcio", nombre: "Calcio", unidad: "mg/dl", min: 8.5, max: 10.5 },
      { id: "fosforo", nombre: "Fósforo", unidad: "mg/dl", min: 2.5, max: 4.5 },
      { id: "pth", nombre: "PTH", unidad: "pg/ml", min: 15, max: 65 },
    ],
  },
  {
    id: "lipidos",
    nombre: "Perfil lipídico",
    esp: "Cardiología",
    det: [
      { id: "colesterol", nombre: "Colesterol total", unidad: "mg/dl", max: 200 },
      { id: "hdl", nombre: "HDL", unidad: "mg/dl", min: 40 },
      { id: "ldl", nombre: "LDL", unidad: "mg/dl", max: 130 },
      { id: "tg", nombre: "Triglicéridos", unidad: "mg/dl", max: 150 },
    ],
  },
  {
    id: "cardiaco",
    nombre: "Marcadores cardíacos",
    esp: "Cardiología",
    det: [
      { id: "ntprobnp", nombre: "NT-proBNP", unidad: "pg/ml", max: 125 },
      { id: "troponina", nombre: "Troponina T us", unidad: "ng/l", max: 14 },
      { id: "cpk", nombre: "CPK", unidad: "U/l", max: 190 },
    ],
  },
  {
    id: "metabolico",
    nombre: "Glucemia y HbA1c",
    esp: "General",
    det: [
      { id: "glucemia", nombre: "Glucemia", unidad: "mg/dl", min: 70, max: 100 },
      { id: "hba1c", nombre: "Hemoglobina glicosilada", unidad: "%", max: 5.7 },
    ],
  },
  {
    id: "hemograma",
    nombre: "Hemograma",
    esp: "General",
    det: [
      { id: "hemoglobina", nombre: "Hemoglobina", unidad: "g/dl", min: 12, max: 16 },
      { id: "hematocrito", nombre: "Hematocrito", unidad: "%", min: 36, max: 48 },
      { id: "plaquetas", nombre: "Plaquetas", unidad: "x10³/µl", min: 150, max: 450 },
      { id: "leucocitos", nombre: "Leucocitos", unidad: "x10³/µl", min: 4.5, max: 11 },
    ],
  },
  {
    id: "tiroides",
    nombre: "Tiroides",
    esp: "General",
    det: [{ id: "tsh", nombre: "TSH", unidad: "µUI/ml", min: 0.4, max: 4.5 }],
  },
  {
    id: "hepatico",
    nombre: "Perfil hepático",
    esp: "General",
    det: [
      { id: "ast", nombre: "AST (TGO)", unidad: "U/l", max: 40 },
      { id: "alt", nombre: "ALT (TGP)", unidad: "U/l", max: 41 },
      { id: "bilirrubina", nombre: "Bilirrubina total", unidad: "mg/dl", max: 1.2 },
      { id: "fosfatasa", nombre: "Fosfatasa alcalina", unidad: "U/l", min: 40, max: 130 },
      { id: "albumina", nombre: "Albúmina", unidad: "g/dl", min: 3.5, max: 5 },
    ],
  },
  {
    id: "hierro",
    nombre: "Hierro y vitaminas",
    esp: "General",
    det: [
      { id: "ferritina", nombre: "Ferritina", unidad: "ng/ml", min: 30, max: 300 },
      { id: "hierro_serico", nombre: "Hierro sérico", unidad: "µg/dl", min: 60, max: 170 },
      { id: "vitd", nombre: "Vitamina D", unidad: "ng/ml", min: 30, max: 100 },
      { id: "b12", nombre: "Vitamina B12", unidad: "pg/ml", min: 200, max: 900 },
    ],
  },
  {
    id: "inflamacion",
    nombre: "Inflamación y coagulación",
    esp: "General",
    det: [
      { id: "pcr", nombre: "Proteína C reactiva (PCR)", unidad: "mg/l", max: 5 },
      { id: "vsg", nombre: "VSG", unidad: "mm/h", max: 20 },
      { id: "inr", nombre: "INR", unidad: "", min: 0.8, max: 1.2 },
    ],
  },
];
const DET_TODAS = PANELES_LAB.flatMap((p) => p.det);
function flagDe(d: Determinacion, v: number): "alto" | "bajo" | "ok" {
  if (d.max !== undefined && v > d.max) return "alto";
  if (d.min !== undefined && v < d.min) return "bajo";
  return "ok";
}
const rangoTxt = (d: Determinacion) =>
  d.min !== undefined && d.max !== undefined ? `Normal ${d.min}–${d.max} ${d.unidad}` : d.max !== undefined ? `Normal hasta ${d.max} ${d.unidad}` : d.min !== undefined ? `Normal desde ${d.min} ${d.unidad}` : d.unidad;

const pesoDoc = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

/** Laboratorios, imágenes e informes que subió el paciente desde su portal (o que cargó la clínica). */
function DocumentosPaciente({ p, user, log, soloLectura = false, compacto = false }: { p: { id: string; nombre: string; portalId?: string | undefined }; user: SessionUser; log: LogFn; soloLectura?: boolean; compacto?: boolean }) {
  const [docsTodos] = useDato<DocumentoPaciente[]>(KEY_DOCUMENTOS, []);
  const docs = docsTodos.filter((d) => d.pacienteId === p.id || d.pacienteId === p.portalId).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const nuevos = docs.filter((d) => d.origen === "paciente" && !d.vistoPor).length;
  const [abriendo, setAbriendo] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [cat, setCat] = useState<string>(CATEGORIAS_DOC[0]);
  const [abierto, setAbierto] = useState(!compacto);
  const vm = useVerMas(docs, compacto ? 4 : 8);
  const ver = async (d: DocumentoPaciente) => {
    setAbriendo(d.id);
    const r = await abrirDocumento(d.id);
    setAbriendo(null);
    if (!r.ok) toast.error(r.error);
    else if (d.origen === "paciente" && !d.vistoPor) log("Documento del paciente revisado", `${p.nombre} · ${d.nombre}`);
  };
  const subir = async (lista: FileList | null) => {
    if (!lista?.length) return;
    setSubiendo(true);
    let bien = 0;
    for (const f of Array.from(lista).slice(0, 10)) {
      const r = await subirDocumento(f, { categoria: cat, pacienteId: p.id });
      if (r.ok) bien++;
      else toast.error(r.error);
    }
    setSubiendo(false);
    if (bien) toast.success(bien === 1 ? "Documento agregado a la carpeta." : `${bien} documentos agregados.`);
  };
  if (compacto && docs.length === 0) return null;
  const COLOR: Record<string, string> = { Laboratorio: "from-rose-500 to-red-600", "Imágenes (Rx, eco, TAC)": "from-sky-500 to-blue-700", Electrocardiograma: "from-pink-500 to-rose-600", "Holter / MAPA": "from-violet-500 to-indigo-600", Ecocardiograma: "from-cyan-500 to-sky-700", "Orden o fórmula médica": "from-amber-400 to-orange-600" };
  return (
    <section className={`overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm dark:border-white/10 ${compacto ? "" : "mb-2"}`}>
      <button type="button" onClick={() => compacto && setAbierto((v) => !v)} className={`relative flex w-full flex-wrap items-center gap-3 overflow-hidden bg-gradient-to-r from-[#071a46] via-[#0b2a6b] to-[#0e7490] px-4 py-3.5 text-left text-white ${compacto ? "cursor-pointer" : "cursor-default"}`}>
        <span className="pn-cross pointer-events-none absolute inset-0 opacity-60" />
        <span className="relative grid size-10 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25"><Paperclip className="size-5" /></span>
        <span className="relative min-w-0 flex-1">
          <span className="block font-display text-lg font-semibold">Documentos del paciente</span>
          <span className="block text-xs text-white/75">Laboratorios, imágenes e informes que subió desde su portal o que cargó la clínica</span>
        </span>
        {nuevos > 0 && <span className="relative inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950 shadow"><span className="size-1.5 animate-pulse rounded-full bg-amber-950" /> {nuevos} sin revisar</span>}
        <span className="relative rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold ring-1 ring-white/25">{docs.length}</span>
        {compacto && <ChevronDown className={`relative size-4 transition-transform ${abierto ? "rotate-180" : ""}`} />}
      </button>
      {abierto && (
        <div className="p-3 sm:p-4">
          {!soloLectura && !compacto && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-secondary/50 p-3 dark:bg-white/5">
              <select value={cat} onChange={(e) => setCat(e.target.value)} className={inp + " h-10 w-auto"} aria-label="Tipo de documento">{CATEGORIAS_DOC.map((c) => <option key={c}>{c}</option>)}</select>
              <label className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-md transition gradient-deep ${subiendo ? "pointer-events-none opacity-70" : "hover:-translate-y-0.5"}`}>
                {subiendo ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} {subiendo ? "Subiendo…" : "Cargar documento"}
                <input type="file" multiple hidden onChange={(e) => { void subir(e.target.files); e.target.value = ""; }} />
              </label>
              <span className="text-xs text-muted-foreground">PDF, fotos o cualquier archivo · hasta 15 MB</span>
            </div>
          )}
          {docs.length === 0 ? (
            <Vacio icon={Paperclip} titulo="Sin documentos" texto="Cuando el paciente suba sus laboratorios o estudios desde su portal, aparecen aquí." />
          ) : (
            <ul className="grid gap-2.5 2xl:grid-cols-2">
              {vm.items.map((d) => {
                const nuevo = d.origen === "paciente" && !d.vistoPor;
                return (
                  <li key={d.id} className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3 transition hover:-translate-y-0.5 hover:shadow-md ${nuevo ? "border-amber-300 bg-amber-50/60 dark:border-amber-500/40 dark:bg-amber-500/5" : "border-border/70 bg-card dark:border-white/10"}`}>
                    <span className={`grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ${COLOR[d.categoria] ?? "from-slate-500 to-slate-700"}`}>{d.tipo.startsWith("image/") ? <ScanLine className="size-5" /> : d.tipo.includes("pdf") ? <FileText className="size-5" /> : <Paperclip className="size-5" />}</span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate text-sm font-semibold">{d.nombre}{nuevo && <span className="shrink-0 rounded-full bg-amber-400 px-1.5 text-[9px] font-bold uppercase text-amber-950">Nuevo</span>}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{d.categoria}{d.fechaEstudio ? ` · examen del ${fechaDe(d.fechaEstudio)}` : ""} · {pesoDoc(d.tamano)}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{d.origen === "paciente" ? "Lo subió el paciente" : `Cargado por ${nombreCorto(d.subidoPor)}`} · {fechaHora(d.fecha)}{d.vistoPor ? ` · ✓ visto por ${nombreCorto(d.vistoPor)}` : ""}</p>
                      {d.nota && <p className="mt-1 line-clamp-2 rounded-lg bg-secondary/60 px-2 py-1 text-[11px] italic dark:bg-white/5">"{d.nota}"</p>}
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <button type="button" onClick={() => void ver(d)} disabled={abriendo === d.id} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:-translate-y-0.5">{abriendo === d.id ? <Loader2 className="size-3.5 animate-spin" /> : <Eye className="size-3.5" />} Ver</button>
                      {!soloLectura && !compacto && (
                        <button type="button" onClick={async () => { if (!(await preguntar({ titulo: "¿Eliminar este documento?", texto: d.nombre }))) return; const r = await borrarDocumento(d.id); if (!r.ok) toast.error(r.error); else { log("Documento eliminado", `${p.nombre} · ${d.nombre}`); toast.success("Documento eliminado."); } }} className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50"><Trash2 className="size-3" /> Eliminar</button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {vm.boton}
        </div>
      )}
    </section>
  );
}

/** Seguimiento del paciente: cómo evolucionó cada valor de laboratorio en el tiempo, con su rango normal. */
function SeguimientoLab({ labs }: { labs: PedidoLab[] }) {
  const conRes = labs.filter((l) => Object.keys(l.resultados ?? {}).length).sort((a, b) => (a.fechaResultado ?? a.fecha).localeCompare(b.fechaResultado ?? b.fecha));
  const series = DET_TODAS.map((d) => ({
    d,
    pts: conRes.filter((l) => typeof l.resultados[d.id] === "number").map((l) => ({ f: l.fechaResultado ?? l.fecha, v: l.resultados[d.id]! })),
  })).filter((x) => x.pts.length > 0);
  const [elegido, setElegido] = useState<string | null>(null);
  const [vista, setVista] = useState<"tabla" | "grafico">("tabla");
  if (!series.length) {
    return (
      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground dark:border-white/10">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white"><Activity className="size-5" /></span>
        Cuando se carguen resultados de laboratorio, aquí va a ver el seguimiento del paciente: cómo sube o baja cada valor con el tiempo.
      </div>
    );
  }
  const sel = series.find((x) => x.d.id === elegido) ?? series.find((x) => x.pts.some((p) => flagDe(x.d, p.v) !== "ok")) ?? series[0]!;
  const W = 600, H = 190, PX = 36, PY = 22;
  const vals = sel.pts.map((p) => p.v);
  const lo = Math.min(...vals, sel.d.min ?? Infinity) * 0.9;
  const hi = Math.max(...vals, sel.d.max ?? -Infinity) * 1.1 || 1;
  const y = (v: number) => H - PY - ((v - lo) / (hi - lo || 1)) * (H - PY * 2);
  const x = (i: number) => (sel.pts.length === 1 ? W / 2 : PX + (i * (W - PX * 2)) / (sel.pts.length - 1));
  const linea = sel.pts.map((p, i) => `${i ? "L" : "M"} ${x(i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ");
  const color = (v: number) => (flagDe(sel.d, v) === "ok" ? "#10b981" : flagDe(sel.d, v) === "alto" ? "#ef4444" : "#f59e0b");
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm dark:border-white/10">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#071a46] via-[#0b2a6b] to-[#be123c] px-4 py-3.5 text-white">
        <div className="pn-cross pointer-events-none absolute inset-0 opacity-60" />
        <p className="relative flex items-center gap-2 pr-40 font-display text-lg font-semibold"><Activity className="size-4" /> Seguimiento de laboratorio</p>
        <p className="relative text-xs text-white/75">{conRes.length} análisis cargado{conRes.length === 1 ? "" : "s"} · cómo vino cada valor en cada control</p>
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 rounded-xl bg-white/15 p-1 ring-1 ring-white/25">
          {([["tabla", "Tabla"], ["grafico", "Gráficos"]] as const).map(([v, l]) => (
            <button key={v} type="button" onClick={() => setVista(v)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${vista === v ? "bg-white text-[#0b2a6b] shadow" : "text-white/80 hover:text-white"}`}>{l}</button>
          ))}
        </div>
      </div>
      {vista === "tabla" && (() => {
        const fechas = conRes.slice(-6);
        return (
          <div className="overflow-x-auto p-3">
            <table className="w-full min-w-[560px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-card px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Valor</th>
                  {fechas.map((l, i) => (
                    <th key={l.id} className={`px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wider ${i === fechas.length - 1 ? "rounded-t-xl bg-[rgba(var(--acc),.08)] text-[rgb(var(--acc))]" : "text-muted-foreground"}`}>
                      {(() => { const d = new Date(l.fechaResultado ?? l.fecha); return <><span className="block whitespace-nowrap text-xs normal-case tracking-normal">{d.getDate()} {d.toLocaleDateString("es-CO", { month: "short" }).replace(".", "")}</span><span className="block text-[10px] font-medium tracking-normal opacity-70">{d.getFullYear()}{i === fechas.length - 1 ? " · último" : ""}</span></>; })()}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Normal</th>
                </tr>
              </thead>
              <tbody>
                {series.map(({ d }) => (
                  <tr key={d.id} className="group cursor-pointer" onClick={() => { setElegido(d.id); setVista("grafico"); }}>
                    <td className="sticky left-0 z-10 border-t border-border/60 bg-card px-3 py-2.5 font-medium group-hover:text-[rgb(var(--acc))] dark:border-white/10">{d.nombre}</td>
                    {fechas.map((l, i) => {
                      const v = l.resultados[d.id];
                      const prev = fechas.slice(0, i).reverse().find((x) => typeof x.resultados[d.id] === "number")?.resultados[d.id];
                      const f = typeof v === "number" ? flagDe(d, v) : "ok";
                      return (
                        <td key={l.id} className={`border-t border-border/60 px-3 py-2.5 text-center tabular-nums dark:border-white/10 ${i === fechas.length - 1 ? "bg-[rgba(var(--acc),.05)]" : ""}`}>
                          {typeof v === "number" ? (
                            <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-semibold ${f === "ok" ? "" : f === "alto" ? "bg-red-50 text-red-600 dark:bg-red-500/10" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10"}`}>
                              {v}
                              {typeof prev === "number" && prev !== v && <span className={`text-[10px] ${f === "ok" ? "text-emerald-600" : "text-red-500"}`}>{v > prev ? "▲" : "▼"}</span>}
                            </span>
                          ) : <span className="text-muted-foreground/40">—</span>}
                        </td>
                      );
                    })}
                    <td className="border-t border-border/60 px-3 py-2.5 text-[11px] text-muted-foreground dark:border-white/10">{rangoTxt(d).replace("Normal ", "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 px-1 text-[11px] text-muted-foreground"><span className="font-semibold text-red-600">Rojo</span> = alto · <span className="font-semibold text-amber-700">ámbar</span> = bajo · ▲▼ subió o bajó respecto al control anterior · toque una fila para ver su gráfico.</p>
          </div>
        );
      })()}
      {vista === "grafico" && <>
      <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
        {series.map(({ d, pts }) => {
          const ult = pts[pts.length - 1]!;
          const ant = pts[pts.length - 2];
          const f = flagDe(d, ult.v);
          const dif = ant ? ult.v - ant.v : 0;
          const on = sel.d.id === d.id;
          return (
            <button key={d.id} type="button" onClick={() => setElegido(d.id)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${on ? "bg-[rgba(var(--acc),.1)] ring-2 ring-[rgba(var(--acc),.45)]" : "bg-secondary/40 hover:bg-secondary dark:bg-white/5"}`}>
              <span className={`size-2.5 shrink-0 rounded-full ${f === "ok" ? "bg-emerald-500" : f === "alto" ? "bg-red-500" : "bg-amber-500"}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold">{d.nombre}</span>
                <span className="block text-[10px] text-muted-foreground">{rangoTxt(d)}</span>
              </span>
              <span className="text-right">
                <span className={`block font-display text-lg font-semibold tabular-nums ${f === "ok" ? "" : f === "alto" ? "text-red-600" : "text-amber-600"}`}>{ult.v}</span>
                {ant && <span className={`block text-[10px] font-semibold ${dif === 0 ? "text-muted-foreground" : flagDe(d, ult.v) === "ok" ? "text-emerald-600" : "text-red-500"}`}>{dif === 0 ? "= igual" : `${dif > 0 ? "▲" : "▼"} ${Math.abs(Math.round(dif * 100) / 100)}`}</span>}
              </span>
            </button>
          );
        })}
      </div>
      <div className="border-t border-border/60 p-4 dark:border-white/10">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold">{sel.d.nombre} <span className="font-normal text-muted-foreground">({sel.d.unidad})</span></p>
          <p className="text-[11px] text-muted-foreground"><span className="mr-1 inline-block size-2.5 rounded-sm bg-emerald-500/20 align-middle ring-1 ring-emerald-500/40" /> {rangoTxt(sel.d)}</p>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-48 w-full" role="img" aria-label={`Evolución de ${sel.d.nombre}`}>
          {(sel.d.min !== undefined || sel.d.max !== undefined) && (
            <rect x={PX - 10} width={W - PX * 2 + 20} y={y(Math.min(sel.d.max ?? hi, hi))} height={Math.max(0, y(Math.max(sel.d.min ?? lo, lo)) - y(Math.min(sel.d.max ?? hi, hi)))} rx="8" fill="#10b981" fillOpacity=".09" stroke="#10b981" strokeOpacity=".25" strokeDasharray="4 4" />
          )}
          {([["max", sel.d.max, "#ef4444"], ["min", sel.d.min, "#f59e0b"]] as const).map(([k, v, c]) =>
            v === undefined || v < lo || v > hi ? null : (
              <g key={k}>
                <line x1={PX - 10} x2={W - PX + 10} y1={y(v)} y2={y(v)} stroke={c} strokeWidth="1.5" strokeDasharray="6 5" opacity=".75" />
                <text x={W - PX + 8} y={y(v) - 5} textAnchor="end" fontSize="10.5" fontWeight="700" fill={c}>{k === "max" ? "Máx." : "Mín."} {v}</text>
              </g>
            ),
          )}
          {sel.pts.length > 1 && <path d={`${linea} L ${x(sel.pts.length - 1).toFixed(1)} ${H - PY} L ${x(0).toFixed(1)} ${H - PY} Z`} fill="rgb(var(--acc))" fillOpacity=".07" />}
          {sel.pts.length > 1 && <path d={linea} fill="none" stroke="rgb(var(--acc))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
          {sel.pts.map((p, i) => (
            <g key={i}>
              <circle cx={x(i)} cy={y(p.v)} r="7" fill="white" stroke={color(p.v)} strokeWidth="3" />
              <text x={x(i)} y={y(p.v) - 13} textAnchor="middle" fontSize="12" fontWeight="700" fill={color(p.v)}>{p.v}</text>
              <text x={x(i)} y={H - 4} textAnchor="middle" fontSize="11" fill="currentColor" opacity=".55">{new Date(p.f).toLocaleDateString("es-CO", { day: "numeric", month: "short" }).replace(".", "")}</text>
            </g>
          ))}
        </svg>
        {sel.pts.length === 1 && <p className="mt-1 text-center text-xs text-muted-foreground">Hay un solo resultado. Con el próximo análisis se dibuja la línea de evolución.</p>}
      </div>
      </>}
    </div>
  );
}

const ESTADO_LAB: Record<EstadoLab, string> = {
  Pedido: "bg-amber-100 text-amber-800 ring-amber-200",
  "En proceso": "bg-sky-100 text-sky-800 ring-sky-200",
  Resultado: "bg-emerald-100 text-emerald-800 ring-emerald-200",
};

function htmlOrdenLab(p: PedidoLab, med: ReturnType<typeof datosMedico>, firma?: string) {
  const paneles = p.paneles.map((id) => PANELES_LAB.find((x) => x.id === id)).filter(Boolean) as typeof PANELES_LAB;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Orden de laboratorio</title>
<style>body{font-family:system-ui,sans-serif;color:#0f172a;padding:36px;max-width:720px;margin:auto}h1{margin:0;font-size:20px}.m{color:#64748b;font-size:13px}
.box{border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px;margin-top:14px}.box h3{margin:0 0 6px;font-size:14px}.box p{margin:0;font-size:13px;color:#334155}
.tag{display:inline-block;background:#fee2e2;color:#b91c1c;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;margin-right:6px}
.firme{text-align:right;margin-top:40px}.firme img{height:64px}.firme div{display:inline-block;border-top:1px solid #334155;padding-top:6px;font-size:12px;min-width:220px;text-align:center}</style></head><body>
<h1>HEGO · Centro de especialidades médicas · Orden de laboratorio</h1><p class="m">${fechaDe(p.fecha)} · ${med.nombre} · ${med.matricula}</p>
<p><b>Paciente:</b> ${p.paciente}</p>${p.urgente ? `<span class="tag">URGENTE</span>` : ""}${p.ayuno ? `<span class="tag" style="background:#e0f2fe;color:#075985">Con ayuno de 8 a 12 h</span>` : ""}
${paneles.map((x) => `<div class="box"><h3>${x.nombre}</h3><p>${x.det.map((d) => d.nombre).join(" · ")}</p></div>`).join("")}
${p.nota ? `<p class="m" style="margin-top:14px"><b>Nota:</b> ${p.nota}</p>` : ""}
<div class="firme">${firma ? `<img src="${firma}"><br>` : ""}<div>${med.nombre}<br>${med.matricula}</div></div><script>setTimeout(()=>window.print(),300)</script></body></html>`;
}

function LaboratorioTab({ user, log, turnos, inicial }: { user: SessionUser; log: LogFn; turnos: Turno[]; inicial: string | null }) {
  const pacientes = usePacientesClinica(turnos);
  const [pedidos, setPedidos] = useDato<PedidoLab[]>(KEY_LAB, []);
  const [, setEstudios] = useDato<Estudio[]>(KEY_ESTUDIOS, []);
  const [firmas] = useDato<Record<string, string>>(KEY_FIRMAS, {});
  const [nuevo, setNuevo] = useState(!!inicial);
  const [pacId, setPacId] = useState(inicial ?? "");
  const [paneles, setPaneles] = useState<string[]>(user.id === "alonso" ? ["lipidos", "cardiaco"] : ["renal", "iono"]);
  const [urgente, setUrgente] = useState(false);
  const [ayuno, setAyuno] = useState(true);
  const [nota, setNota] = useState("");
  const [cargando, setCargando] = useState<PedidoLab | null>(null);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [verEstado, setVerEstado] = useState<"todos" | EstadoLab>("todos");
  const med = datosMedico(user, firmas);

  const crear = (e: FormEvent) => {
    e.preventDefault();
    const pac = pacientes.find((p) => p.id === pacId);
    if (!pac) { toast.error("Elija un paciente"); return; }
    if (paneles.length === 0) { toast.error("Elija al menos un panel"); return; }
    const p = JSON.parse(JSON.stringify({ id: nuevoId(), fecha: new Date().toISOString(), pacienteId: pac.id, paciente: pac.nombre, doctor: user.nombre, paneles, urgente, ayuno, estado: "Pedido", resultados: {}, nota: nota.trim() || undefined })) as PedidoLab;
    setPedidos((prev) => [p, ...prev]);
    log("Pedido de laboratorio", `${pac.nombre} · ${paneles.length} paneles`);
    toast.success("Pedido creado");
    setNuevo(false);
    setNota("");
    imprimirHtml(htmlOrdenLab(p, med, firmas[user.id]));
  };

  const guardarResultados = (e: FormEvent) => {
    e.preventDefault();
    if (!cargando) return;
    const res: Record<string, number> = {};
    Object.entries(valores).forEach(([k, v]) => {
      const n = Number(v.replace(",", "."));
      if (v.trim() !== "" && !Number.isNaN(n)) res[k] = n;
    });
    const act: PedidoLab = { ...cargando, resultados: res, estado: "Resultado", fechaResultado: new Date().toISOString() };
    setPedidos((prev) => prev.map((x) => (x.id === act.id ? act : x)));
    // Se suma como estudio: aparece en la historia clínica y en el portal del paciente
    const vals = JSON.parse(JSON.stringify({ creatinina: res["creatinina"], egfr: res["egfr"], potasio: res["potasio"], urea: res["urea"], proteinuria: res["proteinuria"], hemoglobina: res["hemoglobina"], ldl: res["ldl"] })) as ValoresEstudio;
    const nombres = act.paneles.map((id) => PANELES_LAB.find((x) => x.id === id)?.nombre).filter(Boolean).join(", ");
    const informe = Object.entries(res)
      .map(([k, v]) => {
        const d = DET_TODAS.find((x) => x.id === k);
        return d ? `${d.nombre}: ${v} ${d.unidad}${flagDe(d, v) !== "ok" ? ` (${flagDe(d, v)})` : ""}` : "";
      })
      .filter(Boolean)
      .join(" · ");
    const est: Estudio = {
      id: nuevoId(),
      pacienteId: act.pacienteId,
      tipo: act.paneles.some((x) => ["renal", "iono", "orina", "fosfo"].includes(x)) ? "Laboratorio renal" : "Laboratorio general",
      fecha: isoDe(new Date()),
      titulo: `Laboratorio: ${nombres}`,
      informe,
      valores: vals,
      cargadoPor: user.nombre,
      creado: new Date().toISOString(),
    };
    setEstudios((prev) => [est, ...prev]);
    log("Resultados de laboratorio", `${act.paciente} · ${Object.keys(res).length} valores`);
    toast.success("Resultados guardados: ya figuran en la historia clínica y en el portal");
    setCargando(null);
    setValores({});
  };

  const fuera = pedidos.filter((p) => p.estado === "Resultado" && Object.entries(p.resultados).some(([k, v]) => { const d = DET_TODAS.find((x) => x.id === k); return d && flagDe(d, v) !== "ok"; })).length;
  const lista = pedidos.filter((p) => verEstado === "todos" || p.estado === verEstado);
  const vmLab = useVerMas(lista, 6);
  const anterior = (p: PedidoLab, det: string) =>
    pedidos.filter((x) => x.pacienteId === p.pacienteId && x.id !== p.id && x.estado === "Resultado" && x.resultados[det] !== undefined && (x.fechaResultado ?? "") < (p.fechaResultado ?? "")).sort((a, b) => (b.fechaResultado ?? "").localeCompare(a.fechaResultado ?? ""))[0]?.resultados[det];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={FlaskConical} label="Pedidos" value={String(pedidos.length)} hint="En total" tono="verde" />
        <Kpi icon={Clock} label="Pendientes" value={String(pedidos.filter((p) => p.estado !== "Resultado").length)} hint="Sin resultado" tono="ambar" delay={0.05} />
        <Kpi icon={Check} label="Con resultado" value={String(pedidos.filter((p) => p.estado === "Resultado").length)} hint="Cargados" delay={0.1} />
        <Kpi icon={AlertTriangle} label="Fuera de rango" value={String(fuera)} hint="Pedidos con valores alterados" tono="rojo" delay={0.15} />
      </div>

      {nuevo && (
        <form onSubmit={crear} className="pn-card pn-up space-y-5 p-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h3 className="text-[15px] font-semibold">Nuevo pedido de laboratorio</h3>
              <p className="text-xs text-muted-foreground">Se imprime la orden con su firma</p>
            </div>
            <button type="button" onClick={() => setNuevo(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><X className="size-4" /></button>
          </div>
          <Campo label="Paciente"><SelectorPaciente pacientes={pacientes} valor={pacId} onChange={setPacId} /></Campo>
          {(["Nefrología", "Cardiología", "General"] as const).map((esp) => (
            <div key={esp}>
              <p className={`mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] ${esp === "Nefrología" ? "text-sky-700" : esp === "Cardiología" ? "text-rose-700" : "text-muted-foreground"}`}>
                {esp === "Nefrología" ? <Droplets className="size-3.5" /> : esp === "Cardiología" ? <HeartPulse className="size-3.5" /> : <FlaskConical className="size-3.5" />} {esp}
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {PANELES_LAB.filter((p) => p.esp === esp).map((p) => {
                  const on = paneles.includes(p.id);
                  return (
                    <button type="button" key={p.id} onClick={() => setPaneles(on ? paneles.filter((x) => x !== p.id) : [...paneles, p.id])} className={`rounded-2xl p-3 text-left ring-1 transition-all ${on ? "bg-[rgba(var(--acc),.1)] ring-[rgba(var(--acc),.5)]" : "bg-background ring-border hover:ring-[rgba(var(--acc),.3)]"}`}>
                      <p className="flex items-center justify-between text-sm font-semibold">{p.nombre} {on && <Check className="size-4 text-[rgb(var(--acc))]" />}</p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{p.det.map((d) => d.nombre).join(" · ")}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-5">
            <Interruptor on={urgente} onChange={setUrgente} label="Urgente" />
            <Interruptor on={ayuno} onChange={setAyuno} label="Requiere ayuno" />
          </div>
          <Campo label="Nota para el laboratorio (opcional)"><input value={nota} onChange={(e) => setNota(e.target.value)} className={inp} /></Campo>
          <div className="flex justify-end"><Button type="submit" className="rounded-xl px-6"><FileText className="size-4" /> Crear e imprimir orden</Button></div>
        </form>
      )}

      {cargando && (
        <form onSubmit={guardarResultados} className="pn-card pn-up space-y-5 p-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h3 className="text-[15px] font-semibold">Cargar resultados · {cargando.paciente}</h3>
              <p className="text-xs text-muted-foreground">Los valores fuera de rango se marcan solos</p>
            </div>
            <button type="button" onClick={() => setCargando(null)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><X className="size-4" /></button>
          </div>
          {cargando.paneles.map((id) => {
            const p = PANELES_LAB.find((x) => x.id === id);
            if (!p) return null;
            return (
              <div key={id}>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{p.nombre}</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {p.det.map((d) => {
                    const v = valores[d.id] ?? "";
                    const n = Number(v.replace(",", "."));
                    const f = v.trim() !== "" && !Number.isNaN(n) ? flagDe(d, n) : "ok";
                    return (
                      <label key={d.id} className="block">
                        <span className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
                          {d.nombre}
                          {f !== "ok" && <span className={`rounded px-1.5 text-[10px] font-bold uppercase ${f === "alto" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>{f}</span>}
                        </span>
                        <div className="relative">
                          <input inputMode="decimal" value={v} onChange={(e) => setValores({ ...valores, [d.id]: e.target.value })} className={`${inp} pr-20 ${f !== "ok" ? "!border-red-300" : ""}`} />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">{d.unidad}</span>
                        </div>
                        <span className="mt-1 block text-[10px] text-muted-foreground">Ref: {d.min !== undefined ? `≥ ${d.min}` : ""}{d.min !== undefined && d.max !== undefined ? " y " : ""}{d.max !== undefined ? `≤ ${d.max}` : ""}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div className="flex justify-end"><Button type="submit" className="rounded-xl px-6"><Check className="size-4" /> Guardar resultados</Button></div>
        </form>
      )}

      <Seccion
        icon={FlaskConical}
        titulo="Pedidos y resultados"
        sub="Perfil renal, ionograma, lípidos, marcadores cardíacos y más"
        acciones={
          <div className="flex flex-wrap gap-2">
            <Pastillas<"todos" | EstadoLab> valor={verEstado} onChange={setVerEstado} opciones={[{ v: "todos", l: "Todos" }, { v: "Pedido", l: "Pedidos" }, { v: "En proceso", l: "En proceso" }, { v: "Resultado", l: "Con resultado" }]} />
            <Button className="h-9 rounded-lg" onClick={() => { setNuevo(true); setCargando(null); }}><Plus className="size-4" /> Nuevo pedido</Button>
          </div>
        }
      >
        {lista.length === 0 ? (
          <Vacio icon={FlaskConical} texto="Cree un pedido, imprima la orden y después cargue los resultados: se guardan en la historia clínica." />
        ) : (
          <ul className="space-y-3">
            {vmLab.items.map((p) => (
              <li key={p.id} className="rounded-2xl border border-border/70 bg-card p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Avatar nombre={p.paciente} size="size-9" />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-semibold">
                      {p.paciente}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${ESTADO_LAB[p.estado]}`}>{p.estado}</span>
                      {p.urgente && <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">Urgente</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{fechaHora(p.fecha)} · {nombreCorto(p.doctor)} · {p.paneles.map((id) => PANELES_LAB.find((x) => x.id === id)?.nombre).join(", ")}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.estado === "Pedido" && (
                      <button onClick={() => setPedidos((prev) => prev.map((x) => (x.id === p.id ? { ...x, estado: "En proceso" } : x)))} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Marcar en proceso</button>
                    )}
                    <button onClick={() => { setCargando(p); setNuevo(false); setValores(Object.fromEntries(Object.entries(p.resultados).map(([k, v]) => [k, String(v)]))); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="inline-flex items-center gap-1 rounded-lg bg-[rgba(var(--acc),.1)] px-2.5 py-1.5 text-xs font-semibold text-[rgb(var(--acc))]">
                      <Pencil className="size-3.5" /> {p.estado === "Resultado" ? "Editar resultados" : "Cargar resultados"}
                    </button>
                    <button onClick={() => imprimirHtml(htmlOrdenLab(p, datosMedico({ id: ADMINS.find((a) => a.nombre === p.doctor)?.id ?? user.id, nombre: p.doctor }, firmas), firmas[ADMINS.find((a) => a.nombre === p.doctor)?.id ?? ""]))} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Orden</button>
                  </div>
                </div>
                {p.estado === "Resultado" && Object.keys(p.resultados).length > 0 && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(p.resultados).map(([k, v]) => {
                      const d = DET_TODAS.find((x) => x.id === k);
                      if (!d) return null;
                      const f = flagDe(d, v);
                      const prev = anterior(p, k);
                      return (
                        <div key={k} className={`rounded-xl px-3 py-2 ring-1 ${f === "ok" ? "bg-secondary/50 ring-border/60" : f === "alto" ? "bg-red-50 ring-red-200" : "bg-amber-50 ring-amber-200"}`}>
                          <p className="text-[11px] text-muted-foreground">{d.nombre}</p>
                          <p className={`flex items-center gap-1 font-semibold tabular-nums ${f === "ok" ? "" : f === "alto" ? "text-red-700" : "text-amber-800"}`}>
                            {v} <span className="text-[11px] font-normal text-muted-foreground">{d.unidad}</span>
                            {prev !== undefined && prev !== v && (prev < v ? <TrendingUp className="ml-auto size-3.5" /> : <TrendingDown className="ml-auto size-3.5" />)}
                          </p>
                          {prev !== undefined && <p className="text-[10px] text-muted-foreground">Anterior: {prev}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </li>
            ))}
            {vmLab.boton && <li className="list-none">{vmLab.boton}</li>}
          </ul>
        )}
      </Seccion>
    </div>
  );
}

/* ═══════════════════════ PAGOS Y FACTURACIÓN ═══════════════════════ */
type VistaFact = "comprobantes" | "porfacturar" | "obras" | "tarifas" | "datos";
const ESTADO_FACT: Record<Factura["estado"], string> = {
  Emitida: "bg-slate-50 text-slate-600 ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10",
  Cobrada: "bg-[#0b2a6b]/[.06] text-[#0b2a6b] ring-[#0b2a6b]/15 dark:bg-white/10 dark:text-sky-200 dark:ring-white/10",
  Anulada: "bg-red-50 text-red-700 ring-red-100 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20",
};

function htmlFactura(f: Factura, c: ConfigFactura = {}) {
  const logo = `${location.origin}${logoClinica}`;
  const esc = (x: unknown) => String(x ?? "").replace(/[<>&"]/g, (ch) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[ch]!);
  const conCups = f.items.some((i) => i.cups);
  const filas = f.items.map((i, n) => `<tr><td class="c">${n + 1}</td>${conCups ? `<td class="c">${esc(i.cups ?? "")}</td>` : ""}<td>${esc(i.desc)}</td><td class="c">${i.cant}</td><td class="r">${dinero(i.precio)}</td><td class="r b">${dinero(i.cant * i.precio)}</td></tr>`).join("");
  const datos = [c.nit && `NIT ${esc(c.nit)}`, c.habilitacion && `Cód. habilitación ${esc(c.habilitacion)}`, c.direccion && esc(c.direccion), c.ciudad && esc(c.ciudad), c.telefono && `Tel. ${esc(c.telefono)}`, c.correo && esc(c.correo)].filter(Boolean).join(" · ");
  const resol = f.tipo.startsWith("Factura") && c.resolucion
    ? `Autorización de numeración de facturación DIAN N.º ${esc(c.resolucion)}${c.fechaResolucion ? ` del ${esc(fechaDe(c.fechaResolucion))}` : ""}${c.prefijo ? `, prefijo ${esc(c.prefijo)}` : ""}${c.desde && c.hasta ? `, del ${c.desde} al ${c.hasta}` : ""}${c.vigenciaHasta ? `, vigente hasta ${esc(fechaDe(c.vigenciaHasta))}` : ""}.`
    : "";
  return `<!doctype html><html lang="es-CO"><head><meta charset="utf-8"><title>${esc(f.tipo)} ${esc(f.numero)}</title>
<style>
*{box-sizing:border-box}body{font-family:'Inter',system-ui,-apple-system,sans-serif;color:#0f172a;margin:0;padding:32px;background:radial-gradient(circle at 20% 0%,#e0e7ff,#f1f5f9 50%)}
.hoja{position:relative;max-width:800px;margin:auto;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 30px 80px -35px rgba(15,23,42,.55)}
.top{position:relative;background:linear-gradient(130deg,#071a46 0%,#0b2a6b 45%,#1d4ed8 100%);color:#fff;padding:26px 32px;display:flex;justify-content:space-between;align-items:center;gap:18px}
.top:after{content:"";position:absolute;left:0;right:0;bottom:0;height:4px;background:linear-gradient(90deg,#e11d48,#7c3aed,#0ea5e9)}
.marca{display:flex;gap:14px;align-items:center}.marca img{width:58px;height:58px;border-radius:16px;background:#fff;padding:4px}
.marca h1{margin:0;font-size:20px;letter-spacing:.5px}.marca p{margin:3px 0 0;font-size:10.5px;letter-spacing:2px;text-transform:uppercase;opacity:.75}
.doc{text-align:right}.doc .t{font-size:11px;letter-spacing:2.5px;text-transform:uppercase;opacity:.75}.doc .n{font-size:24px;font-weight:800;margin-top:2px}.doc .f{font-size:12px;opacity:.8;margin-top:2px}
.datos{padding:12px 32px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:11.5px;color:#475569}
.cuerpo{padding:24px 32px}
.cajas{display:grid;grid-template-columns:1.4fr 1fr;gap:14px}.caja{border:1px solid #e2e8f0;border-radius:14px;padding:12px 14px}.caja .l{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#64748b;margin-bottom:4px}.caja .v{font-size:15px;font-weight:700}.caja .s{font-size:12px;color:#475569;margin-top:2px}
table{width:100%;border-collapse:separate;border-spacing:0;margin-top:20px;font-size:13px}thead th{background:#0b2a6b;color:#fff;font-size:10.5px;letter-spacing:1px;text-transform:uppercase;padding:10px;text-align:left}thead th:first-child{border-radius:10px 0 0 10px}thead th:last-child{border-radius:0 10px 10px 0}
td{padding:11px 10px;border-bottom:1px solid #eef2f7}.c{text-align:center}.r{text-align:right}.b{font-weight:700}
.tot{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-top:18px}.letras{font-size:12px;color:#475569;max-width:58%}.letras b{color:#0f172a;display:inline-block}.letras b::first-letter{text-transform:uppercase}
.suma{min-width:260px;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0}.suma div{display:flex;justify-content:space-between;padding:8px 14px;font-size:13px}.suma .g{background:linear-gradient(130deg,#0b2a6b,#1d4ed8);color:#fff;font-size:18px;font-weight:800;padding:12px 14px}
.nota{margin-top:22px;padding-top:12px;border-top:1px dashed #cbd5e1;font-size:10.5px;color:#64748b;line-height:1.55}
.anulada{position:absolute;top:44%;left:50%;transform:translate(-50%,-50%) rotate(-18deg);font-size:84px;font-weight:900;color:rgba(220,38,38,.16);letter-spacing:8px;pointer-events:none}
@media print{body{background:#fff;padding:0}.hoja{box-shadow:none;border-radius:0}}
</style></head><body><div class="hoja">
${f.estado === "Anulada" ? '<div class="anulada">ANULADA</div>' : ""}
<div class="top"><div class="marca"><img src="${logo}" alt=""><div><h1>${esc(c.razonSocial || "HEGO")}</h1><p>Centro de especialidades médicas</p></div></div>
<div class="doc"><div class="t">${esc(f.tipo)}</div><div class="n">N.º ${esc(f.numero)}</div><div class="f">${esc(fechaDe(f.fecha))}</div></div></div>
${datos ? `<div class="datos">${datos}</div>` : ""}
<div class="cuerpo">
<div class="cajas"><div class="caja"><div class="l">${f.cobertura === "Particular" ? "Paciente" : "Paciente / adquiriente"}</div><div class="v">${esc(f.receptor)}</div><div class="s">${esc(f.docReceptor || "")}</div></div>
<div class="caja"><div class="l">Cobertura</div><div class="v">${esc(f.cobertura)}</div><div class="s">Atendió: ${esc(f.emitidaPor)}</div></div></div>
${f.tipo === "Nota crédito" && f.refFactura ? `<div class="caja" style="margin-top:14px;border-color:#fecaca;background:#fff7f7"><div class="l">Corrige la factura</div><div class="v">N.º ${esc(f.refFactura.numero)}</div><div class="s">Motivo: ${esc(f.motivo ?? "")}</div></div>` : ""}
${f.periodo ? `<p style="margin:14px 0 0;font-size:12px;color:#475569">Periodo facturado: <b>${esc(f.periodo)}</b></p>` : ""}
<table><thead><tr><th class="c">#</th>${conCups ? '<th class="c">CUPS</th>' : ""}<th>Servicio</th><th class="c">Cant.</th><th class="r">Valor unitario</th><th class="r">Total</th></tr></thead><tbody>${filas}</tbody></table>
<div class="tot"><p class="letras">Son: <b>${esc(enLetras(f.total))}</b></p>
<div class="suma"><div><span>Subtotal</span><span>${dinero(f.total)}</span></div><div><span>IVA</span><span>Excluido</span></div><div class="g"><span>Total</span><span>${dinero(f.total)}</span></div></div></div>
<p class="nota">${f.anulacion ? `<b style="color:#b91c1c">Anulada el ${esc(fechaDe(f.anulacion.fecha))} por ${esc(f.anulacion.por)}. Motivo: ${esc(f.anulacion.motivo)}${f.anulacion.notaCredito ? ` · Nota crédito N.º ${esc(f.anulacion.notaCredito)}` : ""}</b><br>` : ""}${resol ? `${resol}<br>` : ""}${esc(c.responsabilidadIva || "Servicios de salud excluidos de IVA (art. 476, num. 1, del Estatuto Tributario).")}<br>${f.tipo.startsWith("Factura") ? "Representación interna del comprobante. La factura electrónica de venta (con CUFE) se emite al conectar el proveedor de facturación electrónica autorizado por la DIAN." : "Documento interno de la clínica."}${c.pie ? `<br>${esc(c.pie)}` : ""}</p>
</div></div><script>setTimeout(()=>window.print(),400)</script></body></html>`;
}

function FacturacionTab({ user, log, turnos, vista, setVista }: { user: SessionUser; log: LogFn; turnos: Turno[]; vista: VistaFact; setVista: (v: VistaFact) => void }) {
  const pacientes = usePacientesClinica(turnos);
  const [facturas, setFacturas] = useDato<Factura[]>(KEY_FACTURAS, []);
  const [config, setConfig] = useDato<ConfigFactura>(KEY_FACT_CONFIG, {});
  const [tarifasG, setTarifas] = useDato<Tarifa[]>(KEY_TARIFAS, []);
  const tarifas: Tarifa[] = tarifasG.length ? tarifasG : SERVICIOS.map((x) => ({ id: x.id, nombre: x.nombre, valor: x.precio, activo: true }));
  const activas = tarifas.filter((t) => t.activo);
  const [emitiendo, setEmitiendo] = useState(false);
  const puedeConfig = user.rol === "medico" || user.area === "Dirección general";
  const [cobros] = useDato<Cobro[]>(KEY_COBROS, []);
  const [form, setForm] = useState<Omit<Factura, "id" | "numero" | "estado" | "emitidaPor" | "total"> | null>(null);
  const [q, setQ] = useState("");
  const [anulando, setAnulando] = useState<{ id: string; motivo: string } | null>(null);
  const [accion, setAccion] = useState<{ id: string; tipo: "radicar" | "glosa" | "abono"; a: string; b: string } | null>(null);
  const tarifaDe = (desc: string) => activas.find((x) => norm(x.nombre) === norm(desc));
  const epsConocidas = [...new Set([...cobros.map((c) => c.obraSocial), ...facturas.map((f) => f.cobertura), ...pacientes.map((p) => p.ficha?.obraSocial)].filter((x): x is string => !!x && !/^particular$/i.test(x.trim())).map((x) => x.trim()))].sort();
  /** Aplica un cambio a un comprobante y recalcula si quedó cobrado. */
  const actualizar = (id: string, fn: (f: Factura) => Factura) =>
    setFacturas((l) => l.map((x) => { if (x.id !== id) return x; const n = fn(x); return n.estado === "Anulada" ? n : { ...n, estado: saldoFactura(n) <= 0 ? "Cobrada" : "Emitida" }; }));

  /** Sin servidor (modo local): numera con el prefijo y el siguiente número. */
  const proximoNumero = (tipo: TipoComprobante) => {
    const pre = prefijoDe(tipo, config);
    const n = facturas.filter((f) => f.tipo === tipo).length + (tipo.startsWith("Factura") && config.desde ? Number(config.desde) : 1);
    return `${pre ? `${pre}-` : ""}${n}`;
  };
  const nuevo = (base?: Partial<Factura>) =>
    setForm({ tipo: "Factura de venta", fecha: new Date().toISOString(), receptor: "", cobertura: "Particular", items: [{ desc: activas[0]?.nombre ?? "Consulta", cant: 1, precio: activas[0]?.valor ?? 0 }], ...base } as Omit<Factura, "id" | "numero" | "estado" | "emitidaPor" | "total">);

  const emitir = async (e: FormEvent) => {
    e.preventDefault();
    if (!form || !form.receptor.trim()) { toast.error("Escriba el nombre del paciente o de la entidad."); return; }
    if (!form.docReceptor?.trim()) { toast.error("La cédula o el NIT es obligatorio."); return; }
    if (form.tipo === "Factura de venta" && !config.nit) toast.message("Falta cargar el NIT de la clínica", { description: "Puede hacerlo en Facturación → Datos de facturación." });
    const total = form.items.reduce((a, i) => a + i.cant * i.precio, 0);
    if (total <= 0) { toast.error("El total tiene que ser mayor a cero."); return; }
    setEmitiendo(true);
    const r = await numeroComprobante(form.tipo);
    setEmitiendo(false);
    if (r && !r.ok) { toast.error(r.error); return; }
    const numero = r ? r.numero : proximoNumero(form.tipo);
    const f = JSON.parse(JSON.stringify({ ...form, receptor: form.cobrosEps ? form.receptor.trim() : nombrePropio(form.receptor).trim(), id: nuevoId(), numero, estado: form.cobroId ? "Cobrada" : "Emitida", emitidaPor: user.nombre, total })) as Factura;
    setFacturas((prev) => [f, ...prev]);
    log("Comprobante emitido", `${f.tipo} ${f.numero} · ${f.receptor} · ${dinero(total)}`);
    toast.success(`${f.tipo} N.º ${f.numero} emitida`);
    setForm(null);
    imprimirHtml(htmlFactura(f, config));
  };

  const anularComp = async (f: Factura, motivo: string) => {
    if (motivo.trim().length < 5) { toast.error("Escriba el motivo de la anulación."); return; }
    let notaCredito: string | undefined;
    if (f.tipo === "Factura de venta") {
      const r = await numeroComprobante("Nota crédito");
      if (r && !r.ok) { toast.error(r.error); return; }
      notaCredito = r ? r.numero : `NC-${facturas.filter((x) => x.tipo === "Nota crédito").length + 1}`;
      const nc: Factura = { id: nuevoId(), numero: notaCredito, tipo: "Nota crédito", fecha: new Date().toISOString(), receptor: f.receptor, ...(f.docReceptor ? { docReceptor: f.docReceptor } : {}), cobertura: f.cobertura, items: f.items, total: f.total, estado: "Emitida", refFactura: { id: f.id, numero: f.numero }, motivo: motivo.trim(), emitidaPor: user.nombre };
      setFacturas((l) => [nc, ...l]);
      imprimirHtml(htmlFactura(nc, config));
    }
    setFacturas((l) => l.map((x) => (x.id === f.id ? { ...x, estado: "Anulada", anulacion: { por: user.nombre, motivo: motivo.trim(), fecha: new Date().toISOString(), ...(notaCredito ? { notaCredito } : {}) } } : x)));
    log("Comprobante anulado", `${f.tipo} ${f.numero} · motivo: ${motivo.trim()}${notaCredito ? ` · nota crédito ${notaCredito}` : ""}`);
    toast.success(notaCredito ? `Factura anulada con la nota crédito N.º ${notaCredito}.` : "Comprobante anulado.");
    setAnulando(null);
  };
  const guardarAccion = () => {
    if (!accion) return;
    const f = facturas.find((x) => x.id === accion.id);
    if (!f) return;
    const ahora = new Date().toISOString();
    if (accion.tipo === "radicar") {
      if (!accion.a.trim()) { toast.error("Escriba el número de radicado."); return; }
      actualizar(f.id, (x) => ({ ...x, radicacion: { numero: accion.a.trim(), fecha: accion.b || hoy(), por: user.nombre } }));
      log("Cuenta radicada en la EPS", `${f.cobertura} · ${f.numero} · radicado ${accion.a.trim()}`);
      toast.success("Radicación guardada.");
    } else if (accion.tipo === "glosa") {
      const valor = Number(accion.b.replace(/\D/g, ""));
      if (!accion.a.trim() || !valor) { toast.error("Escriba el motivo y el valor de la glosa."); return; }
      if (valor > saldoFactura(f)) { toast.error(`La glosa no puede superar el saldo (${dinero(saldoFactura(f))}).`); return; }
      const g: Glosa = { id: nuevoId(), fecha: ahora, motivo: accion.a.trim(), valor, estado: "En discusión", por: user.nombre };
      actualizar(f.id, (x) => ({ ...x, glosas: [...(x.glosas ?? []), g] }));
      log("Glosa registrada", `${f.cobertura} · ${f.numero} · ${dinero(valor)} · ${g.motivo}`);
      toast.success("Glosa registrada.");
    } else {
      const valor = Number(accion.a.replace(/\D/g, ""));
      if (!valor || valor > saldoFactura(f)) { toast.error(`Ingrese un valor entre $1 y ${dinero(saldoFactura(f))}.`); return; }
      actualizar(f.id, (x) => ({ ...x, abonos: [...(x.abonos ?? []), { id: nuevoId(), fecha: ahora, valor, ...(accion.b.trim() ? { nota: accion.b.trim() } : {}), por: user.nombre }] }));
      log("Pago de EPS registrado", `${f.cobertura} · ${f.numero} · ${dinero(valor)}`);
      toast.success(valor === saldoFactura(f) ? "Pago registrado: la cuenta quedó cobrada." : "Pago registrado.");
    }
    setAccion(null);
  };
  const cambiarGlosa = (f: Factura, g: Glosa, estado: Glosa["estado"]) => {
    actualizar(f.id, (x) => ({ ...x, glosas: (x.glosas ?? []).map((y) => (y.id === g.id ? { ...y, estado } : y)) }));
    log(estado === "Aceptada" ? "Glosa aceptada" : "Glosa levantada", `${f.cobertura} · ${f.numero} · ${dinero(g.valor)}`);
  };

  const mes = isoDe(new Date()).slice(0, 7);
  const delMes = facturas.filter((f) => f.estado !== "Anulada" && f.tipo !== "Nota crédito" && f.fecha.slice(0, 7) === mes);
  const sinFacturar = cobros.filter((c) => !c.anulado && pagadoDe(c) > 0 && !facturas.some((f) => f.cobroId === c.id && f.estado !== "Anulada"));
  const vmPf = useVerMas(sinFacturar, 8);
  // Parte a cargo de la EPS (de copagos y cuotas moderadoras) que todavía no está en una cuenta de cobro.
  const epsPend = cobros.filter((c) => !c.anulado && (c.aCargoEps ?? 0) > 0 && c.obraSocial && !facturas.some((f) => f.estado !== "Anulada" && f.cobrosEps?.includes(c.id)));
  const gruposEps = Object.values(epsPend.reduce<Record<string, { eps: string; mes: string; cobros: Cobro[] }>>((acc, c) => {
    const k = `${c.obraSocial!.trim().toLowerCase()}|${diaLocal(c.fecha).slice(0, 7)}`;
    (acc[k] ??= { eps: c.obraSocial!.trim(), mes: diaLocal(c.fecha).slice(0, 7), cobros: [] }).cobros.push(c);
    return acc;
  }, {})).sort((a, b) => b.mes.localeCompare(a.mes) || a.eps.localeCompare(b.eps));
  const mesTxt = (m: string) => new Date(`${m}-15T12:00:00`).toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  const cuentaEps = (g: { eps: string; mes: string; cobros: Cobro[] }) => {
    const nit = facturas.find((f) => norm(f.cobertura) === norm(g.eps) && f.docReceptor)?.docReceptor;
    nuevo({
      tipo: "Cuenta de cobro", receptor: g.eps, cobertura: g.eps, ...(nit ? { docReceptor: nit } : {}), periodo: mesTxt(g.mes), cobrosEps: g.cobros.map((c) => c.id),
      items: g.cobros.map((c) => { const t = tarifaDe(c.concepto); return { desc: `${c.paciente}${c.dni ? ` · C.C. ${c.dni}` : ""} · ${c.concepto} · ${fechaCorta(diaLocal(c.fecha))}${c.autorizacion ? ` · Aut. ${c.autorizacion}` : ""}`, cant: 1, precio: c.aCargoEps ?? 0, ...(t?.cups ? { cups: t.cups } : {}) }; }),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cuentasEps = facturas.filter((f) => f.estado !== "Anulada" && f.tipo !== "Nota crédito" && f.cobertura !== "Particular").sort((a, b) => b.fecha.localeCompare(a.fecha));
  const pendOS = cuentasEps.filter((f) => saldoFactura(f) > 0);
  const porOS = Object.entries(
    cuentasEps.reduce<Record<string, { total: number; pend: number; n: number; abonado: number; glosado: number; enDiscusion: number; cuentas: Factura[] }>>((acc, f) => {
      const k = f.cobertura;
      acc[k] ??= { total: 0, pend: 0, n: 0, abonado: 0, glosado: 0, enDiscusion: 0, cuentas: [] };
      acc[k].total += f.total;
      acc[k].n += 1;
      acc[k].pend += saldoFactura(f);
      acc[k].abonado += (f.abonos ?? []).reduce((a, x) => a + x.valor, 0);
      acc[k].glosado += (f.glosas ?? []).filter((g) => g.estado === "Aceptada").reduce((a, g) => a + g.valor, 0);
      acc[k].enDiscusion += (f.glosas ?? []).filter((g) => g.estado === "En discusión").reduce((a, g) => a + g.valor, 0);
      acc[k].cuentas.push(f);
      return acc;
    }, {}),
  ).sort((a, b) => b[1].pend - a[1].pend);
  const lista = facturas.filter((f) => !q || norm(`${f.receptor} ${f.numero} ${f.cobertura}`).includes(norm(q)));
  const vmComp = useVerMas(lista, 8);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Receipt} label="Facturado este mes" value={dinero(delMes.reduce((a, f) => a + f.total, 0))} hint={`${delMes.length} comprobantes`} tono="verde" />
        <Kpi icon={Wallet} label="Cobrado" value={dinero(delMes.filter((f) => f.estado === "Cobrada").reduce((a, f) => a + f.total, 0))} hint="Del mes" delay={0.05} />
        <Kpi icon={Building2} label="Pendiente EPS" value={dinero(pendOS.reduce((a, f) => a + saldoFactura(f), 0))} hint={`${pendOS.length} cuenta${pendOS.length === 1 ? "" : "s"} por cobrar${epsPend.length ? ` · ${gruposEps.length} sin facturar` : ""}`} tono="ambar" delay={0.1} />
        <Kpi icon={AlertTriangle} label="Cobros sin facturar" value={String(sinFacturar.length)} hint="Pagos de pacientes" tono="rojo" delay={0.15} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="pn-card inline-flex flex-wrap gap-1 p-1.5">
          {([["comprobantes", "Comprobantes", Receipt], ["porfacturar", `Por facturar (${sinFacturar.length + gruposEps.length})`, Clock], ["obras", "EPS", Building2], ["tarifas", "Tarifas", Wallet], ["datos", "Datos de facturación", Building2]] as [VistaFact, string, LucideIcon][]).map(([id, l, Ic]) => (
            <button key={id} onClick={() => setVista(id)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${vista === id ? "pn-acc-tile text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
              <Ic className="size-4" /> {l}
            </button>
          ))}
        </div>
        <Button className="h-10 rounded-xl" onClick={() => nuevo()}><Plus className="size-4" /> Nuevo comprobante</Button>
      </div>

      {form && (
        <form onSubmit={emitir} className="pn-card pn-up space-y-5 p-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h3 className="text-[15px] font-semibold">Nuevo comprobante</h3>
              <p className="text-xs text-muted-foreground">{prefijoDe(form.tipo, config) ? `Prefijo ${prefijoDe(form.tipo, config)} · ` : ""}el número lo asigna el sistema al emitir</p>
            </div>
            <button type="button" onClick={() => setForm(null)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><X className="size-4" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Campo label="Tipo">
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoComprobante })} className={inp}>
                <option>Factura de venta</option><option>Cuenta de cobro</option><option>Recibo de caja</option>
              </select>
            </Campo>
            <Campo label="Paciente o entidad">
              <input
                list="fact-pacientes"
                value={form.receptor}
                onChange={(e) => {
                  const p = pacientes.find((x) => x.nombre === e.target.value);
                  setForm({ ...form, receptor: nombrePropio(e.target.value), ...(p ? { docReceptor: p.dni ? `C.C. ${p.dni}` : undefined, cobertura: p.ficha?.obraSocial || form.cobertura } : {}) } as typeof form);
                }}
                className={inp}
              />
              <datalist id="fact-pacientes">{pacientes.map((p) => <option key={p.id} value={p.nombre} />)}</datalist>
            </Campo>
            <Campo label="Cédula / NIT *"><input value={form.docReceptor ?? ""} onChange={(e) => setForm({ ...form, docReceptor: e.target.value })} className={inp} /></Campo>
            <Campo label="Cobertura"><input value={form.cobertura} onChange={(e) => setForm({ ...form, cobertura: e.target.value })} placeholder="Particular u EPS" className={inp} /></Campo>
          </div>
          <datalist id="fact-servicios">{activas.map((t) => <option key={t.id} value={t.nombre} />)}</datalist>
          <div className="space-y-2">
            {form.items.map((it, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[110px_1fr_80px_150px_40px]">
                <input value={it.cups ?? ""} onChange={(e) => setForm({ ...form, items: form.items.map((x, j) => (j === i ? { ...x, cups: e.target.value.replace(/[^\d]/g, "").slice(0, 8) } : x)) })} placeholder="CUPS" className={inp + " tabular-nums"} aria-label="Código CUPS" />
                <input
                  list="fact-servicios"
                  value={it.desc}
                  onChange={(e) => {
                    const t = activas.find((x) => x.nombre === e.target.value);
                    setForm({ ...form, items: form.items.map((x, j) => (j === i ? { ...x, desc: e.target.value, ...(t ? { precio: valorTarifa(t, form.cobertura), ...(t.cups ? { cups: t.cups } : {}) } : {}) } : x)) });
                  }}
                  placeholder="Descripción"
                  className={inp}
                />
                <input type="number" min={1} value={it.cant} onChange={(e) => setForm({ ...form, items: form.items.map((x, j) => (j === i ? { ...x, cant: Number(e.target.value) || 1 } : x)) })} className={inp} />
                <input type="number" min={0} value={it.precio} onChange={(e) => setForm({ ...form, items: form.items.map((x, j) => (j === i ? { ...x, precio: Number(e.target.value) || 0 } : x)) })} className={inp} />
                <button type="button" disabled={form.items.length === 1} onClick={() => setForm({ ...form, items: form.items.filter((_, j) => j !== i) })} className="rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-30"><Trash2 className="mx-auto size-4" /></button>
              </div>
            ))}
            <button type="button" onClick={() => setForm({ ...form, items: [...form.items, { desc: "", cant: 1, precio: 0 }] })} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"><Plus className="size-4" /> Agregar ítem</button>
          </div>
          {form.cobrosEps && <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">Cuenta de cobro a <b>{form.cobertura}</b>{form.periodo ? ` · ${form.periodo}` : ""}: incluye la parte a cargo de la EPS de {form.cobrosEps.length} atención{form.cobrosEps.length === 1 ? "" : "es"}. Escriba el NIT de la EPS antes de emitir.</p>}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
            <p className="font-display text-2xl font-semibold">Total {dinero(form.items.reduce((a, i) => a + i.cant * i.precio, 0))}</p>
            <Button type="submit" disabled={emitiendo} className="rounded-xl px-6">{emitiendo ? <Loader2 className="size-4 animate-spin" /> : <Receipt className="size-4" />} Emitir e imprimir</Button>
          </div>
        </form>
      )}

      {vista === "comprobantes" && (
        <Seccion
          icon={Receipt}
          titulo="Comprobantes emitidos"
          sub="Facturas y recibos de la clínica"
          acciones={
            <div className="flex flex-wrap gap-2">
              <div className="relative w-56 max-w-full">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar" className={inp + " h-10 pl-10"} />
              </div>
              <BotonMesExcel alExportar={(m) => exportarFacturacionExcel(m, facturas)} log={log} que="facturación" />
            </div>
          }
        >
          {lista.length === 0 ? (
            <Vacio icon={Receipt} texto="Todavía no emitió comprobantes. Puede facturar los cobros de pacientes desde Por facturar." />
          ) : (
            <ul className="divide-y divide-border/60">
              {vmComp.items.map((f) => (
                <li key={f.id} className="flex flex-col gap-3 py-3.5 lg:flex-row lg:flex-wrap lg:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xs font-bold text-white shadow-md ${f.tipo === "Nota crédito" ? "from-slate-500 to-slate-700" : f.tipo.startsWith("Factura") ? "from-[#0b2a6b] to-[#071a46]" : f.tipo.startsWith("Cuenta") ? "from-[#0e7490] to-[#155e75]" : "from-[#1d4ed8] to-[#0b2a6b]"}`}>{siglaComp(f.tipo)}</span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-semibold">{f.receptor} {f.tipo !== "Nota crédito" && <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${ESTADO_FACT[f.estado]}`}>{f.estado}</span>}</p>
                      <p className="text-xs text-muted-foreground">{f.tipo} N.º {f.numero} · {fechaHora(f.fecha)} · {f.cobertura}{f.periodo ? ` · ${f.periodo}` : ""}</p>
                      {f.refFactura && <p className="text-xs text-muted-foreground">Corrige la factura N.º {f.refFactura.numero} · {f.motivo}</p>}
                      {f.anulacion && <p className="text-xs text-red-700 dark:text-red-300">Anulada por {nombreCorto(f.anulacion.por)}: {f.anulacion.motivo}{f.anulacion.notaCredito ? ` · Nota crédito N.º ${f.anulacion.notaCredito}` : ""}</p>}
                      {f.estado === "Emitida" && f.cobertura !== "Particular" && saldoFactura(f) < f.total && <p className="text-xs text-muted-foreground">Saldo {dinero(saldoFactura(f))}</p>}
                    </div>
                  </div>
                  <p className="font-display text-xl font-semibold tabular-nums lg:w-36 lg:text-right">{dinero(f.total)}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => imprimirHtml(htmlFactura(f, config))} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Imprimir</button>
                    {f.estado === "Emitida" && f.cobertura === "Particular" && f.tipo !== "Nota crédito" && (
                      <button onClick={() => { setFacturas((p) => p.map((x) => (x.id === f.id ? { ...x, estado: "Cobrada" } : x))); log("Comprobante cobrado", `${f.numero}`); }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#0b2a6b] hover:bg-slate-100 dark:text-sky-200 dark:hover:bg-white/10">Marcar cobrada</button>
                    )}
                    {f.estado !== "Anulada" && f.tipo !== "Nota crédito" && (
                      <button onClick={() => setAnulando(anulando?.id === f.id ? null : { id: f.id, motivo: "" })} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600">Anular</button>
                    )}
                  </div>
                  {anulando?.id === f.id && (
                    <div className="w-full basis-full rounded-xl bg-red-50/60 p-3 ring-1 ring-red-100 dark:bg-red-500/5 dark:ring-red-500/20">
                      <p className="mb-2 text-xs text-red-800 dark:text-red-200">{f.tipo === "Factura de venta" ? "Una factura no se borra: se anula con una nota crédito por el mismo valor, que se numera e imprime sola." : "El comprobante queda anulado y el motivo se guarda en la auditoría."}</p>
                      <div className="flex flex-wrap gap-2">
                        <input autoFocus placeholder="Motivo de la anulación (obligatorio)" value={anulando.motivo} onChange={(e) => setAnulando({ id: f.id, motivo: e.target.value })} className={inp + " h-10 flex-1"} />
                        <Button onClick={() => void anularComp(f, anulando.motivo)} className="h-10 rounded-xl !bg-red-600 text-white hover:!bg-red-700"><Ban className="size-4" /> {f.tipo === "Factura de venta" ? "Anular con nota crédito" : "Anular"}</Button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
              {vmComp.boton && <li className="list-none">{vmComp.boton}</li>}
            </ul>
          )}
        </Seccion>
      )}

      {vista === "porfacturar" && (
        <Seccion icon={Building2} titulo="Por cobrar a las EPS" sub="Parte a cargo de la EPS de las atenciones con cuota moderadora o copago. Se agrupa por EPS y por mes.">
          {gruposEps.length === 0 ? (
            <Vacio icon={Check} titulo="Nada pendiente con las EPS" texto="Cuando en Pagos y caja registre una atención por EPS, la parte que cubre la EPS aparece aquí para pasarle la cuenta de cobro." />
          ) : (
            <ul className="space-y-2.5">
              {gruposEps.map((g) => {
                const total = g.cobros.reduce((a, c) => a + (c.aCargoEps ?? 0), 0);
                return (
                  <li key={`${g.eps}|${g.mes}`} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 p-3.5 dark:border-white/10">
                    <span className="grid size-11 place-items-center rounded-xl bg-[#0b2a6b] text-white"><Building2 className="size-5" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{g.eps} <span className="font-normal text-muted-foreground first-letter:uppercase">· {mesTxt(g.mes)}</span></p>
                      <p className="text-xs text-muted-foreground">{g.cobros.length} atención{g.cobros.length === 1 ? "" : "es"} · {[...new Set(g.cobros.map((c) => c.paciente))].slice(0, 3).join(", ")}{new Set(g.cobros.map((c) => c.paciente)).size > 3 ? "…" : ""}</p>
                    </div>
                    <p className="font-display text-lg font-semibold tabular-nums">{dinero(total)}</p>
                    <Button size="sm" className="rounded-xl" onClick={() => cuentaEps(g)}><Receipt className="size-4" /> Generar cuenta de cobro</Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Seccion>
      )}
      {vista === "porfacturar" && (
        <Seccion icon={Clock} titulo="Cobros sin facturar" sub="Pagos de pacientes que todavía no tienen comprobante">
          {sinFacturar.length === 0 ? (
            <Vacio icon={Check} titulo="Todo facturado" texto="Cada cobro de Pagos y caja ya tiene su comprobante." />
          ) : (
            <ul className="divide-y divide-border/60">
              {vmPf.items.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-3 py-3.5">
                  <Avatar nombre={c.paciente} size="size-9" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{c.paciente}</p>
                    <p className="text-xs text-muted-foreground">{c.concepto} · {fechaHora(c.fecha)} · {c.obraSocial || "Particular"}</p>
                  </div>
                  <p className="font-display text-lg font-semibold tabular-nums">{dinero(pagadoDe(c))}</p>
                  <Button
                    size="sm"
                    className="rounded-xl"
                    onClick={() => {
                      nuevo({ receptor: c.paciente, ...(c.dni ? { docReceptor: `C.C. ${c.dni}` } : {}), cobertura: c.obraSocial || "Particular", items: [{ desc: c.concepto, cant: 1, precio: pagadoDe(c) }], cobroId: c.id });
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <Receipt className="size-4" /> Facturar
                  </Button>
                </li>
              ))}
              {vmPf.boton && <li className="list-none">{vmPf.boton}</li>}
            </ul>
          )}
        </Seccion>
      )}

      {vista === "obras" && (
        <Seccion icon={Building2} titulo="Cartera con las EPS" sub="Cuentas de cobro a cada EPS: radicación, glosas, pagos recibidos y saldo"
          acciones={<BotonMesExcel alExportar={(m) => exportarFacturacionExcel(m, facturas)} log={log} que="cartera EPS" />}>
          {porOS.length === 0 ? (
            <Vacio icon={Building2} texto="Cuando le pase una cuenta de cobro a una EPS (desde Por facturar), aquí lleva el seguimiento hasta que pague." />
          ) : (
            <div className="space-y-5">
              {porOS.map(([os, v]) => (
                <div key={os} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
                  <div className="flex flex-wrap items-center gap-4 bg-slate-50/80 p-4 dark:bg-white/5">
                    <span className="grid size-11 place-items-center rounded-xl bg-[#0b2a6b] text-white"><Building2 className="size-5" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{os}</p>
                      <p className="text-xs text-muted-foreground">{v.n} cuenta{v.n === 1 ? "" : "s"} · facturado {dinero(v.total)}</p>
                      <div className="mt-2 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                        <div className="h-full rounded-full bg-[#0e7490]" style={{ width: `${v.total ? ((v.total - v.pend) / v.total) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-right text-xs">
                      <div><p className="text-muted-foreground">Pagado</p><p className="font-semibold tabular-nums">{dinero(v.abonado)}</p></div>
                      <div><p className="text-muted-foreground">Glosado</p><p className="font-semibold tabular-nums">{dinero(v.glosado)}</p>{v.enDiscusion > 0 && <p className="text-[10px] text-muted-foreground">{dinero(v.enDiscusion)} en discusión</p>}</div>
                      <div><p className="text-muted-foreground">Saldo</p><p className="font-display text-lg font-semibold tabular-nums text-[#0b2a6b] dark:text-sky-200">{dinero(v.pend)}</p></div>
                    </div>
                  </div>
                  <ul className="divide-y divide-slate-100 dark:divide-white/5">
                    {v.cuentas.map((f) => {
                      const saldo = saldoFactura(f);
                      const dias = f.radicacion ? Math.floor((Date.now() - new Date(`${f.radicacion.fecha}T12:00:00`).getTime()) / 86400000) : null;
                      const btn = "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition";
                      return (
                        <li key={f.id} className="p-4">
                          <div className="flex flex-wrap items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">{f.tipo} N.º {f.numero}
                                <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ${saldo <= 0 ? "bg-[#0b2a6b]/[.06] text-[#0b2a6b] ring-[#0b2a6b]/15 dark:bg-white/10 dark:text-sky-200" : "bg-slate-50 text-slate-600 ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10"}`}>{saldo <= 0 ? "Pagada" : f.radicacion ? "Radicada" : "Sin radicar"}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">{fechaDe(f.fecha)}{f.periodo ? ` · ${f.periodo}` : ""} · {f.items.length} ítem{f.items.length === 1 ? "" : "s"}{f.docReceptor ? ` · ${f.docReceptor}` : ""}</p>
                              {f.radicacion && <p className="text-xs text-muted-foreground">Radicado {f.radicacion.numero} el {fechaDe(f.radicacion.fecha)}{dias !== null && saldo > 0 ? (dias === 0 ? " · hoy" : ` · hace ${dias} día${dias === 1 ? "" : "s"}`) : ""}</p>}
                            </div>
                            <div className="text-right">
                              <p className="font-display text-lg font-semibold tabular-nums">{dinero(saldo)}</p>
                              <p className="text-[11px] text-muted-foreground">de {dinero(f.total)}</p>
                            </div>
                          </div>
                          {(f.glosas?.length || f.abonos?.length) ? (
                            <div className="mt-3 space-y-1.5">
                              {(f.glosas ?? []).map((g) => (
                                <div key={g.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-white/5">
                                  <span className="font-semibold">Glosa</span><span className="min-w-0 flex-1 truncate text-muted-foreground">{g.motivo}</span>
                                  <span className="font-semibold tabular-nums">{dinero(g.valor)}</span>
                                  <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10">{g.estado}</span>
                                  {g.estado === "En discusión" && (
                                    <>
                                      <button onClick={() => cambiarGlosa(f, g, "Levantada")} className="rounded-md px-2 py-0.5 text-[11px] font-semibold text-[#0b2a6b] hover:bg-white dark:text-sky-200">Levantada (la EPS paga)</button>
                                      <button onClick={() => cambiarGlosa(f, g, "Aceptada")} className="rounded-md px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-white dark:text-slate-300">Aceptar (se descuenta)</button>
                                    </>
                                  )}
                                </div>
                              ))}
                              {(f.abonos ?? []).map((x) => (
                                <div key={x.id} className="flex flex-wrap items-center gap-2 rounded-lg px-3 py-1.5 text-xs">
                                  <Check className="size-3.5 text-[#0e7490]" /><span className="text-muted-foreground">Pago recibido el {fechaDe(diaLocal(x.fecha))}{x.nota ? ` · ${x.nota}` : ""}</span>
                                  <span className="ml-auto font-semibold tabular-nums">{dinero(x.valor)}</span>
                                </div>
                              ))}
                            </div>
                          ) : null}
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {!f.radicacion && <button onClick={() => setAccion({ id: f.id, tipo: "radicar", a: "", b: hoy() })} className={`${btn} bg-[#0b2a6b] text-white hover:bg-[#0a2459]`}><Send className="size-3.5" /> Registrar radicación</button>}
                            {saldo > 0 && <button onClick={() => setAccion({ id: f.id, tipo: "abono", a: String(saldo), b: "" })} className={`${btn} bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10`}><Wallet className="size-3.5" /> Registrar pago</button>}
                            {saldo > 0 && <button onClick={() => setAccion({ id: f.id, tipo: "glosa", a: "", b: "" })} className={`${btn} bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10`}><AlertTriangle className="size-3.5" /> Registrar glosa</button>}
                            <button onClick={() => imprimirHtml(htmlFactura(f, config))} className={`${btn} text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/10`}><Printer className="size-3.5" /> Imprimir</button>
                          </div>
                          {accion?.id === f.id && (
                            <div className="mt-3 flex flex-wrap items-end gap-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10">
                              {accion.tipo === "radicar" && (<>
                                <Campo label="N.º de radicado"><input autoFocus value={accion.a} onChange={(e) => setAccion({ ...accion, a: e.target.value })} className={inp + " h-10"} /></Campo>
                                <Campo label="Fecha de radicación"><input type="date" value={accion.b} onChange={(e) => setAccion({ ...accion, b: e.target.value })} className={inp + " h-10"} /></Campo>
                              </>)}
                              {accion.tipo === "glosa" && (<>
                                <div className="min-w-[220px] flex-1"><Campo label="Motivo de la glosa"><input autoFocus value={accion.a} onChange={(e) => setAccion({ ...accion, a: e.target.value })} placeholder="Ej.: falta autorización, tarifa no pactada…" className={inp + " h-10"} /></Campo></div>
                                <Campo label="Valor glosado"><input inputMode="numeric" value={accion.b} onChange={(e) => setAccion({ ...accion, b: e.target.value })} className={inp + " h-10 w-36 tabular-nums"} /></Campo>
                              </>)}
                              {accion.tipo === "abono" && (<>
                                <Campo label="Valor recibido"><input autoFocus inputMode="numeric" value={accion.a} onChange={(e) => setAccion({ ...accion, a: e.target.value })} className={inp + " h-10 w-40 tabular-nums"} /></Campo>
                                <div className="min-w-[200px] flex-1"><Campo label="Referencia (opcional)"><input value={accion.b} onChange={(e) => setAccion({ ...accion, b: e.target.value })} placeholder="Transferencia, comprobante de egreso…" className={inp + " h-10"} /></Campo></div>
                              </>)}
                              <Button onClick={guardarAccion} className="h-10 rounded-xl"><Check className="size-4" /> Guardar</Button>
                              <Button variant="ghost" onClick={() => setAccion(null)} className="h-10 rounded-xl">Cancelar</Button>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Seccion>
      )}
      {vista === "tarifas" && <TarifasFact tarifas={tarifas} setTarifas={(v) => setTarifas(() => v)} puede={puedeConfig} log={log} epsConocidas={epsConocidas} />}
      {vista === "datos" && <DatosFact config={config} setConfig={(v) => setConfig(() => v)} puede={puedeConfig} log={log} />}

      <p className="text-center text-[11px] text-muted-foreground">Comprobantes internos con numeración del sistema. La factura electrónica (con CUFE) y los RIPS se emiten al conectar un proveedor de facturación electrónica autorizado por la DIAN.</p>
    </div>
  );
}

function TarifasFact({ tarifas, setTarifas, puede, log, epsConocidas = [] }: { tarifas: Tarifa[]; setTarifas: (v: Tarifa[]) => void; puede: boolean; log: LogFn; epsConocidas?: string[] }) {
  const [lista, setLista] = useState<Tarifa[]>(tarifas);
  const [cob, setCob] = useState("Particular");
  const [nuevaEps, setNuevaEps] = useState("");
  const [extra, setExtra] = useState<string[]>([]);
  const opciones = [...new Set([...epsConocidas, ...lista.flatMap((t) => Object.keys(t.porEps ?? {})), ...extra])].sort();
  const valorEps = (t: Tarifa) => (cob === "Particular" ? t.valor : t.porEps?.[cob] ?? 0);
  const ponerValor = (t: Tarifa, v: number) => cambiar(t.id, cob === "Particular" ? { valor: v } : { porEps: Object.fromEntries(Object.entries({ ...(t.porEps ?? {}), [cob]: v }).filter(([, x]) => x > 0)) });
  const firma = JSON.stringify(tarifas);
  useEffect(() => setLista(tarifas), [firma]); // eslint-disable-line react-hooks/exhaustive-deps
  const cambios = JSON.stringify(lista) !== firma;
  const cambiar = (id: string, patch: Partial<Tarifa>) => setLista((l) => l.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const guardar = () => {
    const limpias = lista.filter((t) => t.nombre.trim()).map((t) => ({ ...t, nombre: t.nombre.trim(), valor: Math.max(0, Math.round(t.valor)) }));
    setTarifas(limpias);
    log("Tarifas actualizadas", `${limpias.length} servicios`);
    toast.success("Tarifas guardadas. Ya se usan al facturar y al cobrar.");
  };
  const conConvenio = (e: string) => lista.filter((t) => t.porEps?.[e]).length;
  return (
    <Seccion icon={Wallet} titulo="Tarifas de los servicios" sub="Valor particular y valor pactado con cada EPS. Se usan solas al cobrar y al facturar."
      acciones={puede ? <div className="flex gap-2"><Button variant="outline" className="h-9 rounded-lg" onClick={() => setLista((l) => [...l, { id: nuevoId(), nombre: "", valor: 0, activo: true }])}><Plus className="size-4" /> Agregar servicio</Button>{cambios && <Button className="h-9 rounded-lg" onClick={guardar}><Check className="size-4" /> Guardar</Button>}</div> : undefined}>
      {!puede && <p className="mb-4 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800 ring-1 ring-amber-100">Solo los médicos administradores o Dirección pueden cambiar las tarifas.</p>}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Ver tarifas de:</span>
        {["Particular", ...opciones].map((e) => (
          <button key={e} type="button" onClick={() => setCob(e)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${cob === e ? "bg-[#0b2a6b] text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10"}`}>
            {e}{e !== "Particular" && <span className={`rounded px-1 text-[10px] ${cob === e ? "bg-white/20" : "bg-slate-100 dark:bg-white/10"}`}>{conConvenio(e)}</span>}
          </button>
        ))}
        {puede && (
          <form onSubmit={(ev) => { ev.preventDefault(); const n = nuevaEps.trim(); if (!n) return; setExtra((x) => [...x, n]); setCob(n); setNuevaEps(""); }} className="flex items-center gap-1.5">
            <input value={nuevaEps} onChange={(e) => setNuevaEps(e.target.value)} placeholder="Otra EPS…" className={inp + " h-8 w-36 text-xs"} />
            <button type="submit" className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-[#0b2a6b] hover:bg-slate-100 dark:text-sky-200 dark:hover:bg-white/10"><Plus className="size-3.5" /> Agregar</button>
          </form>
        )}
      </div>
      {cob !== "Particular" && <p className="mb-3 rounded-xl bg-slate-50 px-4 py-2.5 text-xs text-slate-600 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">Valores del convenio con <b>{cob}</b>. Si deja un servicio vacío, se cobra el valor particular.</p>}
      <div className="overflow-x-auto rounded-2xl border border-border/70 dark:border-white/10">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="bg-secondary/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground dark:bg-white/5">
            <tr><th className="px-4 py-3">Servicio</th><th className="px-4 py-3">Código CUPS</th><th className="px-4 py-3 text-right">{cob === "Particular" ? "Valor particular" : `Valor con ${cob}`}</th><th className="px-4 py-3 text-center">Activo</th><th className="w-10" /></tr>
          </thead>
          <tbody className="divide-y divide-border/60 dark:divide-white/5">
            {lista.map((t) => (
              <tr key={t.id} className={t.activo ? "" : "opacity-50"}>
                <td className="px-3 py-2"><input disabled={!puede} value={t.nombre} onChange={(e) => cambiar(t.id, { nombre: e.target.value })} placeholder="Ej.: Consulta de Cardiología" className={inp + " h-10"} /></td>
                <td className="px-3 py-2"><input disabled={!puede} value={t.cups ?? ""} onChange={(e) => cambiar(t.id, { cups: e.target.value.replace(/[^\d]/g, "").slice(0, 8) })} placeholder="Opcional" className={inp + " h-10 w-32 tabular-nums"} /></td>
                <td className="px-3 py-2 text-right"><div className="relative ml-auto w-40"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span><input disabled={!puede} inputMode="numeric" value={valorEps(t) ? valorEps(t).toLocaleString("es-CO") : ""} onChange={(e) => ponerValor(t, Number(e.target.value.replace(/\D/g, "")) || 0)} placeholder={cob === "Particular" ? "0" : t.valor.toLocaleString("es-CO")} className={inp + " h-10 pl-7 text-right tabular-nums"} /></div></td>
                <td className="px-3 py-2 text-center"><input type="checkbox" disabled={!puede} checked={t.activo} onChange={(e) => cambiar(t.id, { activo: e.target.checked })} className="size-4 accent-[var(--primary)]" /></td>
                <td className="px-2">{puede && <button onClick={() => setLista((l) => l.filter((x) => x.id !== t.id))} className="rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600" aria-label="Quitar"><Trash2 className="size-4" /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">El código CUPS sale en las facturas y cuentas de cobro, y se usará en los RIPS.</p>
    </Seccion>
  );
}

function DatosFact({ config, setConfig, puede, log }: { config: ConfigFactura; setConfig: (v: ConfigFactura) => void; puede: boolean; log: LogFn }) {
  const [d, setD] = useState<ConfigFactura>(config);
  const firma = JSON.stringify(config);
  useEffect(() => setD(config), [firma]); // eslint-disable-line react-hooks/exhaustive-deps
  const campo = (k: keyof ConfigFactura, label: string, ph = "", tipo = "text") => (
    <Campo label={label}>
      <input disabled={!puede} type={tipo} value={(d[k] as string | number | undefined) ?? ""} placeholder={ph}
        onChange={(e) => setD({ ...d, [k]: tipo === "number" ? (e.target.value ? Number(e.target.value) : undefined) : e.target.value })} className={inp} />
    </Campo>
  );
  const faltan = [!d.nit && "NIT", !d.direccion && "dirección", !d.resolucion && "resolución DIAN", !d.prefijo && "prefijo"].filter(Boolean) as string[];
  const guardar = (e: FormEvent) => {
    e.preventDefault();
    if (d.desde && d.hasta && d.desde > d.hasta) return toast.error("El rango autorizado está al revés: 'desde' tiene que ser menor que 'hasta'.");
    setConfig(JSON.parse(JSON.stringify(d)) as ConfigFactura);
    log("Datos de facturación actualizados", d.nit ? `NIT ${d.nit}` : "");
    toast.success("Datos de facturación guardados.");
  };
  return (
    <form onSubmit={guardar} className="grid gap-6 xl:grid-cols-2">
      <Seccion icon={Building2} titulo="Datos del prestador" sub="Salen en el encabezado de cada comprobante">
        <div className="grid gap-4 sm:grid-cols-2">
          {campo("razonSocial", "Razón social", "HEGO Centro de Especialidades Médicas S.A.S.")}
          {campo("nit", "NIT (con dígito de verificación)", "900.123.456-7")}
          {campo("habilitacion", "Código de habilitación (REPS)", "200010000001")}
          {campo("telefono", "Teléfono", "300 123 4567")}
          {campo("direccion", "Dirección", "Calle 16 # 10-20, consultorio 302")}
          {campo("ciudad", "Ciudad", "Valledupar, Cesar")}
          {campo("correo", "Correo de facturación", "facturacion@hego.com.co", "email")}
          {campo("responsabilidadIva", "Leyenda de IVA", "Servicios de salud excluidos de IVA (art. 476, num. 1, E.T.)")}
        </div>
      </Seccion>
      <Seccion icon={Receipt} titulo="Resolución de facturación DIAN" sub="Numeración autorizada para las facturas de venta">
        <div className="grid gap-4 sm:grid-cols-2">
          {campo("resolucion", "N.º de resolución", "18764000000000")}
          {campo("fechaResolucion", "Fecha de la resolución", "", "date")}
          {campo("prefijo", "Prefijo de facturas", "HEGO")}
          {campo("vigenciaHasta", "Vigente hasta", "", "date")}
          {campo("desde", "Rango desde", "1", "number")}
          {campo("hasta", "Rango hasta", "5000", "number")}
          {campo("prefijoCuenta", "Prefijo de cuentas de cobro", "CC")}
          {campo("prefijoRecibo", "Prefijo de recibos de caja", "RC")}
        </div>
        <div className="mt-4">{campo("pie", "Texto al pie (opcional)", "Gracias por confiar en nosotros.")}</div>
        {faltan.length > 0 && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800 ring-1 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-200">Falta: {faltan.join(", ")}. Hasta que se carguen, los comprobantes salen sin esos datos.</p>}
        {puede ? <Button type="submit" className="mt-5 h-11 w-full rounded-xl"><Check className="size-4" /> Guardar datos de facturación</Button> : <p className="mt-4 text-sm text-muted-foreground">Solo los médicos administradores o Dirección pueden cambiar estos datos.</p>}
      </Seccion>
    </form>
  );
}

/* ═══════════════════════ ANALÍTICA Y REPORTES ═══════════════════════ */
const PALETA = ["#0b2a6b", "#0e7490", "#1d4ed8", "#0f766e", "#475569", "#155e75", "#3b5b9a", "#64748b"];

function BarrasV({ datos, color = "#0b2a6b", fmt = (n: number) => String(n), alto = "h-48" }: { datos: { l: string; v: number }[]; color?: string; fmt?: (n: number) => string; alto?: string }) {
  const max = Math.max(1, ...datos.map((d) => d.v));
  return (
    <div className={`flex ${alto} items-end gap-2`}>
      {datos.map((d, i) => (
        <div key={d.l + i} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
          <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">{d.v ? fmt(d.v) : ""}</span>
          <div className="w-full max-w-[44px] rounded-t-md transition-all duration-700 group-hover:opacity-90" style={{ height: `${Math.max(2, (d.v / max) * 100)}%`, background: `linear-gradient(180deg, ${color}, ${color}cc)`, animation: `pn-up .6s ease-out ${i * 0.04}s both` }} />
          <span className="w-full truncate text-center text-[10px] text-muted-foreground">{d.l}</span>
        </div>
      ))}
    </div>
  );
}
function BarrasH({ datos, colores = PALETA, fmt = (n: number) => String(n), max: maxN }: { datos: { l: string; v: number }[]; colores?: string[]; fmt?: (n: number) => string; max?: number }) {
  const lista = maxN ? datos.slice(0, maxN) : datos;
  const max = Math.max(1, ...lista.map((d) => d.v));
  const total = datos.reduce((a, d) => a + d.v, 0);
  return (
    <ul className="space-y-3">
      {lista.map((d, i) => (
        <li key={d.l}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs">
            <span className="truncate font-medium">{d.l}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground"><b className="font-semibold text-foreground">{fmt(d.v)}</b>{total ? ` · ${Math.round((d.v / total) * 100)}%` : ""}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div className="pn-bar h-full rounded-full" style={{ width: `${(d.v / max) * 100}%`, background: colores[i % colores.length], animationDelay: `${i * 0.06}s` }} />
          </div>
        </li>
      ))}
      {lista.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Sin datos en el período.</li>}
    </ul>
  );
}
/** Dos series en barras agrupadas (ej.: ingresos vs egresos). */
function BarrasDobles({ datos, a, b, fmt }: { datos: { l: string; a: number; b: number }[]; a: string; b: string; fmt: (n: number) => string }) {
  const max = Math.max(1, ...datos.flatMap((d) => [d.a, d.b]));
  return (
    <div>
      <div className="mb-3 flex gap-4 text-[11px] text-muted-foreground"><span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-[#0b2a6b]" />{a}</span><span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-[#94a3b8]" />{b}</span></div>
      <div className="flex h-44 items-end gap-3">
        {datos.map((d, i) => (
          <div key={d.l + i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5" title={`${a}: ${fmt(d.a)} · ${b}: ${fmt(d.b)}`}>
            <div className="flex h-full w-full items-end justify-center gap-1">
              <div className="w-1/2 max-w-[18px] rounded-t-sm bg-[#0b2a6b]" style={{ height: `${Math.max(2, (d.a / max) * 100)}%` }} />
              <div className="w-1/2 max-w-[18px] rounded-t-sm bg-[#94a3b8]" style={{ height: `${Math.max(2, (d.b / max) * 100)}%` }} />
            </div>
            <span className="w-full truncate text-center text-[10px] text-muted-foreground">{d.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function DonaPct({ pct, etiqueta, sub, color = "#0b2a6b" }: { pct: number; etiqueta: string; sub: string; color?: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative size-32">
        <svg viewBox="0 0 36 36" className="size-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeOpacity=".08" strokeWidth="3" />
          <circle className="pn-donut" cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3" strokeLinecap={pct ? "round" : "butt"} strokeDasharray={`${Math.min(100, pct)} 100`} />
        </svg>
        <p className="absolute inset-0 flex flex-col items-center justify-center font-display text-3xl font-semibold">{Math.round(pct)}%</p>
      </div>
      <p className="mt-2 text-sm font-semibold">{etiqueta}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
function Dato({ l, v, s, icon: Icon }: { l: string; v: string; s?: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-card p-4 dark:border-white/10">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#0b2a6b]/[.07] text-[#0b2a6b] dark:bg-white/10 dark:text-sky-200"><Icon className="size-4.5" /></span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{l}</p>
        <p className="font-display text-xl font-semibold tabular-nums">{v}</p>
        {s && <p className="truncate text-[11px] text-muted-foreground">{s}</p>}
      </div>
    </div>
  );
}

async function descargarExcel(nombre: string, hojas: { nombre: string; filas: Record<string, unknown>[] }[]) {
  const XLSX = await import("@e965/xlsx");
  const wb = XLSX.utils.book_new();
  for (const h of hojas) {
    const ws = XLSX.utils.json_to_sheet(h.filas.length ? h.filas : [{ "": "Sin datos en el período" }]);
    const cols = Object.keys(h.filas[0] ?? { "": "" });
    ws["!cols"] = cols.map((k) => ({ wch: Math.min(48, Math.max(k.length + 2, ...h.filas.slice(0, 300).map((f) => String(f[k] ?? "").length + 2))) }));
    XLSX.utils.book_append_sheet(wb, ws, h.nombre.slice(0, 31));
  }
  XLSX.writeFile(wb, `${nombre}.xlsx`);
}

const DIAS_SEM = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const FRANJAS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

function AnaliticaTab({ log, turnos }: { log: LogFn; turnos: Turno[] }) {
  const pacientes = usePacientesClinica(turnos);
  const [cobros] = useDato<Cobro[]>(KEY_COBROS, []);
  const [facturas] = useDato<Factura[]>(KEY_FACTURAS, []);
  const [evols] = useDato<Evolucion[]>(KEY_EVOLUCIONES, []);
  const [recetas] = useDato<Receta[]>(KEY_RECETAS, []);
  const [labs] = useDato<PedidoLab[]>(KEY_LAB, []);
  const [estudios] = useDato<Estudio[]>(KEY_ESTUDIOS, []);
  const [controles] = useDato<Control[]>(KEY_CONTROLES, []);
  const [movs] = useDato<Mov[]>("gb_movs", []);
  const [dias, setDias] = useState(30);
  const [doc, setDoc] = useState("Todos");
  const [excel, setExcel] = useState(false);

  const hoyIso = isoDe(new Date());
  const todo = dias >= 9999;
  const desde = isoDe(new Date(Date.now() - dias * 86400000));
  const desdeAnt = isoDe(new Date(Date.now() - 2 * dias * 86400000));
  const enRango = (iso: string) => todo || (iso.slice(0, 10) >= desde && iso.slice(0, 10) <= hoyIso);
  const enAnterior = (iso: string) => !todo && iso.slice(0, 10) >= desdeAnt && iso.slice(0, 10) < desde;
  const esDoc = (nombre: string | undefined, d: string) => !!nombre && (nombre === d || norm(nombre).includes(norm(d.replace(/^Dra?\.\s*/, "").split(" ").slice(0, 2).join(" "))));
  const delDoc = (nombre?: string) => doc === "Todos" || esDoc(nombre, doc);
  const corto$ = (n: number) => (n >= 1e9 ? `$ ${(n / 1e9).toFixed(1).replace(".", ",")} mil M` : n >= 1e6 ? `$ ${(n / 1e6).toFixed(1).replace(".", ",")} M` : dinero(n));
  const periodoTxt = todo ? "Todo el historial" : dias === 7 ? "Últimos 7 días" : dias === 30 ? "Últimos 30 días" : dias === 90 ? "Últimos 3 meses" : "Últimos 12 meses";

  const tDoc = turnos.filter((t) => delDoc(t.doctor));
  const ts = tDoc.filter((t) => enRango(t.fecha));
  const tsAnt = tDoc.filter((t) => enAnterior(t.fecha));
  const atendidos = ts.filter((t) => t.estado === "Atendido").length;
  const cancelados = ts.filter((t) => t.estado === "Cancelado").length;
  const sinMarcar = ts.filter((t) => t.fecha < hoyIso && (t.estado === "Pendiente" || t.estado === "Confirmado")).length;
  const pasadas = ts.filter((t) => t.fecha < hoyIso && t.estado !== "Cancelado").length;
  const asistencia = pasadas ? (ts.filter((t) => t.fecha < hoyIso && t.estado === "Atendido").length / pasadas) * 100 : 0;

  const cobrosDoc = cobros.filter((c) => !c.anulado && delDoc(c.profesional));
  const pagos = cobrosDoc.flatMap((c) => c.pagos.map((p) => ({ ...p, c })));
  const pagosR = pagos.filter((p) => enRango(diaLocal(p.fecha)));
  const ingresos = pagosR.reduce((a, p) => a + p.monto, 0);
  const ingresosAnt = pagos.filter((p) => enAnterior(diaLocal(p.fecha))).reduce((a, p) => a + p.monto, 0);
  const atencionesR = cobrosDoc.filter((c) => enRango(diaLocal(c.fecha)));
  const ticket = atencionesR.length ? Math.round(atencionesR.reduce((a, c) => a + pagadoDe(c), 0) / atencionesR.length) : 0;
  const nuevos = pacientes.filter((p) => p.creado && enRango(p.creado)).length;
  const nuevosAnt = pacientes.filter((p) => p.creado && enAnterior(p.creado)).length;

  const delta = (a: number, b: number) => {
    if (todo) return "";
    if (!b) return a ? " · nuevo vs. período anterior" : "";
    const d = Math.round(((a - b) / b) * 100);
    return ` · ${d >= 0 ? "▲" : "▼"} ${Math.abs(d)}% vs. anterior`;
  };

  // Tendencia: 12 meses
  const meses = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (11 - i));
    const m = d.toLocaleDateString("es-CO", { month: "short" }).replace(".", "");
    return { k: isoDe(d).slice(0, 7), l: m.charAt(0).toUpperCase() + m.slice(1) };
  });
  const turnosMes = meses.map((m) => ({ l: m.l, v: tDoc.filter((t) => t.fecha.slice(0, 7) === m.k && t.estado !== "Cancelado").length }));
  const ingresosMes = meses.map((m) => ({ l: m.l, v: pagos.filter((p) => diaLocal(p.fecha).slice(0, 7) === m.k).reduce((a, p) => a + p.monto, 0) }));
  const egresosMes = meses.map((m) => movs.filter((x) => x.tipo === "Egreso" && x.fecha.slice(0, 7) === m.k).reduce((a, x) => a + x.monto, 0));
  const balanceMes = meses.slice(-6).map((m, i) => ({ l: m.l, a: ingresosMes[i + 6]!.v + movs.filter((x) => x.tipo === "Ingreso" && x.fecha.slice(0, 7) === m.k).reduce((a, x) => a + x.monto, 0), b: egresosMes[i + 6]! }));

  // Cuándo piden citas: día de la semana × hora
  const mapa = DIAS_SEM.map((_, di) => FRANJAS.map((h) => ts.filter((t) => { const d = new Date(`${t.fecha}T12:00:00`).getDay(); return d === di + 1 && Number(t.hora.slice(0, 2)) === h && t.estado !== "Cancelado"; }).length));
  const maxMapa = Math.max(1, ...mapa.flat());
  const pico = (() => { let m = { d: -1, h: -1, v: 0 }; mapa.forEach((f, d) => f.forEach((v, h) => { if (v > m.v) m = { d, h, v }; })); return m; })();

  const porDoctor = ADMINS.map((a) => ({ l: a.nombre, v: ts.filter((t) => esDoc(t.doctor, a.nombre)).length })).filter((x) => x.v > 0 || doc === "Todos");
  const porEstado = (["Atendido", "Confirmado", "Pendiente", "Cancelado"] as Estado[]).map((e) => ({ l: e, v: ts.filter((t) => t.estado === e).length }));
  const ORIGEN: Record<string, string> = { web: "Página web", portal: "Portal del paciente", panel: "Panel (secretaría)" };
  const porOrigen = Object.entries(ts.reduce<Record<string, number>>((acc, t) => { const k = ORIGEN[t.origen ?? "panel"] ?? "Panel (secretaría)"; acc[k] = (acc[k] ?? 0) + 1; return acc; }, {})).map(([l, v]) => ({ l, v })).sort((a, b) => b.v - a.v);
  const porMotivo = Object.entries(ts.reduce<Record<string, number>>((acc, t) => { const k = (t.motivo || "Sin motivo").split(" · ")[0]!.trim(); acc[k] = (acc[k] ?? 0) + 1; return acc; }, {})).map(([l, v]) => ({ l, v })).sort((a, b) => b.v - a.v);

  // Pacientes
  const pacIdsPeriodo = new Set(ts.filter((t) => t.estado !== "Cancelado").map((t) => t.pacienteId || norm(t.paciente)));
  const recurrentes = [...pacIdsPeriodo].filter((id) => tDoc.some((t) => (t.pacienteId || norm(t.paciente)) === id && !enRango(t.fecha) && t.fecha < desde)).length;
  const porEps = Object.entries(pacientes.reduce<Record<string, number>>((acc, p) => { const k = p.ficha?.obraSocial?.trim() || "Particular"; acc[k] = (acc[k] ?? 0) + 1; return acc; }, {})).map(([l, v]) => ({ l, v })).sort((a, b) => b.v - a.v);
  const grupos = [["0–17", 0, 17], ["18–39", 18, 39], ["40–59", 40, 59], ["60–74", 60, 74], ["75 o más", 75, 200]] as const;
  const conEdad = pacientes.map((p) => edadDe(p.ficha?.nacimiento)).filter((x): x is number => x !== null);
  const porEdad = grupos.map(([l, a, b]) => ({ l, v: conEdad.filter((e) => e >= a && e <= b).length }));

  // Finanzas
  const porServicio = Object.entries(pagosR.reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.c.concepto]: (acc[p.c.concepto] ?? 0) + p.monto }), {})).map(([l, v]) => ({ l, v })).sort((a, b) => b.v - a.v);
  const porMetodo = Object.entries(pagosR.reduce<Record<string, number>>((acc, p) => { const k = metodoTxt(p.metodo); return { ...acc, [k]: (acc[k] ?? 0) + p.monto }; }, {})).map(([l, v]) => ({ l, v })).sort((a, b) => b.v - a.v);
  const factR = facturas.filter((f) => f.estado !== "Anulada" && f.tipo !== "Nota crédito" && enRango(diaLocal(f.fecha)));
  const facturado = factR.reduce((a, f) => a + f.total, 0);
  const cuentasEps = facturas.filter((f) => f.estado !== "Anulada" && f.tipo !== "Nota crédito" && f.cobertura !== "Particular");
  const carteraEps = Object.entries(cuentasEps.reduce<Record<string, number>>((acc, f) => { const s = saldoFactura(f); if (s > 0) acc[f.cobertura] = (acc[f.cobertura] ?? 0) + s; return acc; }, {})).map(([l, v]) => ({ l, v })).sort((a, b) => b.v - a.v);
  const carteraTotal = carteraEps.reduce((a, x) => a + x.v, 0);
  const vencida = cuentasEps.filter((f) => saldoFactura(f) > 0 && f.radicacion && (Date.now() - new Date(`${f.radicacion.fecha}T12:00:00`).getTime()) / 86400000 > 60);
  const saldoPacientes = cobrosDoc.reduce((a, c) => a + saldoDe(c), 0);
  const egresosR = movs.filter((m) => m.tipo === "Egreso" && enRango(m.fecha)).reduce((a, m) => a + m.monto, 0);

  // Clínico
  const evR = evols.filter((e) => enRango(e.fecha) && delDoc(e.doctor));
  const topDx = Object.entries(evR.flatMap((e) => dxDe(e)).reduce<Record<string, number>>((acc, d) => { const k = d.codigo ? `${d.codigo} · ${d.descripcion}` : d.descripcion; if (k.trim()) acc[k] = (acc[k] ?? 0) + 1; return acc; }, {})).map(([l, v]) => ({ l, v })).sort((a, b) => b.v - a.v);
  const ultimoEgfr = new Map<string, { f: string; v: number }>();
  [...estudios.filter((e) => e.valores.egfr).map((e) => ({ id: e.pacienteId, f: e.fecha, v: e.valores.egfr! })), ...evols.filter((e) => e.nefro?.egfr).map((e) => ({ id: e.pacienteId, f: e.fecha, v: e.nefro!.egfr! }))].forEach((x) => {
    const y = ultimoEgfr.get(x.id);
    if (!y || x.f > y.f) ultimoEgfr.set(x.id, { f: x.f, v: x.v });
  });
  const estadios = ["G1", "G2", "G3a", "G3b", "G4", "G5"].map((g) => ({ l: g, v: [...ultimoEgfr.values()].filter((x) => estadioRenal(x.v).estadio === g).length }));
  const ultimaTA = new Map<string, { f: string; s: number; d: number }>();
  [...controles.map((c) => ({ id: c.pacienteId, f: c.fecha, s: c.sistolica, d: c.diastolica })), ...evols.filter((e) => e.signos.sistolica && e.signos.diastolica).map((e) => ({ id: e.pacienteId, f: e.fecha, s: e.signos.sistolica!, d: e.signos.diastolica! }))].forEach((x) => {
    const y = ultimaTA.get(x.id);
    if (!y || x.f > y.f) ultimaTA.set(x.id, x);
  });
  const conTA = [...ultimaTA.values()];
  const controlados = conTA.filter((x) => x.s < 140 && x.d < 90).length;
  const feviRed = evols.filter((e) => e.cardio?.fevi && e.cardio.fevi < 41).length;
  const recetasR = recetas.filter((r) => enRango(r.fecha) && delDoc(r.doctor)).length;
  const labsR = labs.filter((l) => enRango(l.fecha) && delDoc(l.doctor)).length;

  // Alertas automáticas
  const alertas: { t: string; d: string }[] = [];
  if (sinMarcar) alertas.push({ t: `${sinMarcar} cita${sinMarcar === 1 ? "" : "s"} pasada${sinMarcar === 1 ? "" : "s"} sin marcar como atendida o cancelada`, d: "Márquelas en Agenda para que la asistencia y los cobros salgan bien." });
  if (ts.length >= 5 && cancelados / ts.length > 0.15) alertas.push({ t: `Las cancelaciones están en ${Math.round((cancelados / ts.length) * 100)}%`, d: "Revise que los recordatorios de 2 días y 1 día antes estén activos." });
  if (!todo && ingresosAnt && ingresos < ingresosAnt * 0.85) alertas.push({ t: `Los ingresos bajaron ${Math.round((1 - ingresos / ingresosAnt) * 100)}% frente al período anterior`, d: `${dinero(ingresos)} contra ${dinero(ingresosAnt)}.` });
  if (vencida.length) alertas.push({ t: `${vencida.length} cuenta${vencida.length === 1 ? "" : "s"} con EPS radicada${vencida.length === 1 ? "" : "s"} hace más de 60 días sin pagar`, d: `Saldo ${dinero(vencida.reduce((a, f) => a + saldoFactura(f), 0))}. Vea Facturación → EPS.` });
  const sinFacturarEps = cobros.filter((c) => !c.anulado && (c.aCargoEps ?? 0) > 0 && !facturas.some((f) => f.estado !== "Anulada" && f.cobrosEps?.includes(c.id)));
  if (sinFacturarEps.length) alertas.push({ t: `${dinero(sinFacturarEps.reduce((a, c) => a + (c.aCargoEps ?? 0), 0))} a cargo de EPS sin cuenta de cobro`, d: "Genérelas en Facturación → Por facturar." });
  if (saldoPacientes) alertas.push({ t: `${dinero(saldoPacientes)} de saldos de pacientes por cobrar`, d: "Vea Pagos y caja → Cobros a pacientes." });

  const kpis = [
    { l: "Citas", v: String(ts.length), s: `${atendidos} atendidas${delta(ts.length, tsAnt.length)}` },
    { l: "Asistencia", v: `${Math.round(asistencia)}%`, s: `${cancelados} canceladas${sinMarcar ? ` · ${sinMarcar} sin marcar` : ""}` },
    { l: "Ingresos", v: corto$(ingresos), s: `Ticket promedio ${dinero(ticket)}${delta(ingresos, ingresosAnt)}` },
    { l: "Pacientes nuevos", v: String(nuevos), s: `${pacientes.length} en total${delta(nuevos, nuevosAnt)}` },
  ];

  const filasCitas = () => ts.map((t) => ({ Fecha: fechaDe(t.fecha), Hora: hora12(t.hora), Paciente: t.paciente, "Cédula": t.dni ?? "", Doctor: t.doctor, Motivo: t.motivo, Estado: t.estado, Origen: ORIGEN[t.origen ?? "panel"] ?? "" }));
  const filasPagos = () => pagosR.map((p) => ({ Fecha: fechaHora(p.fecha), Paciente: p.c.paciente, "Cédula": p.c.dni ?? "", Servicio: p.c.concepto, Profesional: p.c.profesional, Cobertura: p.c.obraSocial || "Particular", "Medio de pago": metodoTxt(p.metodo), "Cobró": p.cobradoPor, Monto: p.monto }));
  const filasFact = () => facturas.filter((f) => enRango(diaLocal(f.fecha))).map((f) => ({ Tipo: f.tipo, "Número": f.numero, Fecha: fechaDe(diaLocal(f.fecha)), "Paciente o entidad": f.receptor, Cobertura: f.cobertura, Total: f.tipo === "Nota crédito" ? -f.total : f.total, Estado: f.estado, Saldo: saldoFactura(f) }));
  const filasEvol = () => evR.map((e) => ({ Fecha: fechaHora(e.fecha), Paciente: e.paciente, Especialidad: e.especialidad ?? "", Doctor: e.doctor, Motivo: e.motivo, "Presión arterial": e.signos.sistolica ? `${e.signos.sistolica}/${e.signos.diastolica}` : "", "Diagnósticos": dxDe(e).map((d) => (d.codigo ? `${d.codigo} ${d.descripcion}` : d.descripcion)).join(" | ") }));
  const filasPac = () => pacientes.map((p) => ({ Nombre: p.nombre, "Cédula": p.dni ?? "", "Teléfono": p.telefono ?? "", Correo: p.email ?? "", EPS: p.ficha?.obraSocial || "Particular", Edad: edadDe(p.ficha?.nacimiento) ?? "", Antecedentes: (p.ficha?.antecedentes ?? []).join(" | "), Portal: p.portal ? "Sí" : "No" }));
  const filasRec = () => recetas.filter((r) => enRango(r.fecha) && delDoc(r.doctor)).map((r) => ({ "N.º": r.numero, Fecha: fechaHora(r.fecha), Paciente: r.paciente, Doctor: r.doctor, Medicamentos: r.items.map((i) => i.droga).join(" | "), Estado: r.anulada ? "Anulada" : "Vigente" }));
  const filasLab = () => labs.filter((l) => enRango(l.fecha) && delDoc(l.doctor)).map((l) => ({ Fecha: fechaHora(l.fecha), Paciente: l.paciente, Doctor: l.doctor, "Exámenes": l.paneles.join(" | "), Estado: l.estado, Resultados: Object.entries(l.resultados).map(([k, v]) => `${k}=${v}`).join(" | ") }));
  const resumenFilas = () => [
    { Indicador: "Período", Valor: periodoTxt }, { Indicador: "Profesional", Valor: doc },
    ...kpis.map((k) => ({ Indicador: k.l, Valor: k.v })),
    { Indicador: "Facturado", Valor: dinero(facturado) }, { Indicador: "Egresos", Valor: dinero(egresosR) }, { Indicador: "Cartera con EPS", Valor: dinero(carteraTotal) },
    { Indicador: "Saldos de pacientes", Valor: dinero(saldoPacientes) }, { Indicador: "Pacientes recurrentes en el período", Valor: String(recurrentes) },
    { Indicador: "Recetas", Valor: String(recetasR) }, { Indicador: "Laboratorios", Valor: String(labsR) },
    { Indicador: "Presión controlada (< 140/90)", Valor: conTA.length ? `${Math.round((controlados / conTA.length) * 100)}%` : "—" },
  ];
  const nombreArchivo = (q: string) => `HEGO ${q} ${hoyIso}`;
  const reportes: { t: string; d: string; icon: LucideIcon; hojas: () => { nombre: string; filas: Record<string, unknown>[] }[] }[] = [
    { t: "Citas", d: `${ts.length} en el período`, icon: CalendarDays, hojas: () => [{ nombre: "Citas", filas: filasCitas() }] },
    { t: "Pacientes", d: `${pacientes.length} pacientes`, icon: Users, hojas: () => [{ nombre: "Pacientes", filas: filasPac() }] },
    { t: "Pagos", d: `${pagosR.length} pagos`, icon: Wallet, hojas: () => [{ nombre: "Pagos", filas: filasPagos() }] },
    { t: "Facturación", d: `${factR.length} comprobantes`, icon: Receipt, hojas: () => [{ nombre: "Comprobantes", filas: filasFact() }] },
    { t: "Consultas", d: `${evR.length} evoluciones`, icon: FileText, hojas: () => [{ nombre: "Consultas", filas: filasEvol() }, { nombre: "Diagnósticos", filas: topDx.map((x) => ({ "Diagnóstico": x.l, Casos: x.v })) }] },
    { t: "Recetas", d: `${recetasR} recetas`, icon: Pill, hojas: () => [{ nombre: "Recetas", filas: filasRec() }] },
    { t: "Laboratorio", d: `${labsR} pedidos`, icon: FlaskConical, hojas: () => [{ nombre: "Laboratorio", filas: filasLab() }] },
  ];
  const excelCompleto = async () => {
    setExcel(true);
    try {
      await descargarExcel(nombreArchivo("reporte completo"), [{ nombre: "Resumen", filas: resumenFilas() }, ...reportes.flatMap((r) => r.hojas())]);
      log("Reporte completo exportado", `${periodoTxt} · ${doc}`);
      toast.success("Excel descargado.");
    } catch { toast.error("No se pudo generar el Excel."); }
    setExcel(false);
  };
  const informePdf = () => {
    const esc = (x: unknown) => String(x ?? "").replace(/[<>&"]/g, (ch) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[ch]!);
    const tabla = (titulo: string, filas: { l: string; v: number }[], fmt = (n: number) => String(n)) => {
      const tot = filas.reduce((a, x) => a + x.v, 0);
      return `<h2>${esc(titulo)}</h2>${filas.length ? `<table>${filas.slice(0, 10).map((x) => `<tr><td>${esc(x.l)}</td><td class="r">${esc(fmt(x.v))}</td><td class="r m">${tot ? Math.round((x.v / tot) * 100) : 0}%</td></tr>`).join("")}</table>` : '<p class="m">Sin datos en el período.</p>'}`;
    };
    imprimirHtml(`<!doctype html><html lang="es-CO"><head><meta charset="utf-8"><title>Informe de gestión HEGO</title><style>
      body{font-family:system-ui,sans-serif;color:#0f172a;padding:36px;max-width:860px;margin:auto}h1{margin:0;color:#0b2a6b;font-size:24px}h2{font-size:14px;color:#0b2a6b;margin:24px 0 8px;padding-bottom:6px;border-bottom:1px solid #e2e8f0;text-transform:uppercase;letter-spacing:1px}
      .m{color:#64748b;font-size:12px}.k{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:18px}.k div{border:1px solid #e2e8f0;border-radius:12px;padding:12px}.k b{display:block;font-size:20px;color:#0b2a6b;margin:4px 0}
      table{width:100%;border-collapse:collapse;font-size:12.5px}td{padding:6px 4px;border-bottom:1px solid #f1f5f9}.r{text-align:right}.cols{display:grid;grid-template-columns:1fr 1fr;gap:0 28px}li{font-size:12.5px;margin:4px 0}
    </style></head><body>
      <h1>Informe de gestión · HEGO</h1><p class="m">${esc(periodoTxt)}${todo ? "" : ` (${esc(fechaDe(desde))} al ${esc(fechaDe(hoyIso))})`} · Profesional: ${esc(doc)} · Generado el ${esc(fechaHora(new Date().toISOString()))}</p>
      <div class="k">${kpis.map((k) => `<div><span class="m">${esc(k.l)}</span><b>${esc(k.v)}</b><span class="m">${esc(k.s)}</span></div>`).join("")}</div>
      <div class="k">${[["Facturado", dinero(facturado)], ["Egresos", dinero(egresosR)], ["Cartera EPS", dinero(carteraTotal)], ["Saldos de pacientes", dinero(saldoPacientes)]].map(([l, v]) => `<div><span class="m">${l}</span><b>${v}</b></div>`).join("")}</div>
      ${alertas.length ? `<h2>Para atender</h2><ul>${alertas.map((a) => `<li><b>${esc(a.t)}</b> — ${esc(a.d)}</li>`).join("")}</ul>` : ""}
      <div class="cols"><div>${tabla("Citas por doctor", porDoctor)}${tabla("Motivos de consulta", porMotivo)}${tabla("Origen de las citas", porOrigen)}</div>
      <div>${tabla("Ingresos por servicio", porServicio, dinero)}${tabla("Medios de pago", porMetodo, dinero)}${tabla("Cartera por EPS", carteraEps, dinero)}</div></div>
      <div class="cols"><div>${tabla("Diagnósticos más frecuentes", topDx)}</div><div>${tabla("Pacientes por EPS", porEps)}${tabla("Pacientes por edad", porEdad)}</div></div>
      <p class="m" style="margin-top:28px">Documento interno de gestión. Los datos clínicos son confidenciales.</p>
    </body></html>`);
    log("Informe de gestión impreso", `${periodoTxt} · ${doc}`);
  };

  return (
    <div className="space-y-6">
      {/* Barra de filtros */}
      <div className="pn-card flex flex-wrap items-center gap-3 p-3">
        <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/5">
          {[[7, "7 días"], [30, "30 días"], [90, "3 meses"], [365, "12 meses"], [99999, "Todo"]].map(([d, l]) => (
            <button key={d} onClick={() => setDias(d as number)} className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${dias === d ? "bg-[#0b2a6b] text-white shadow-sm" : "text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-white/10"}`}>{l}</button>
          ))}
        </div>
        <div className="w-full sm:w-[290px]"><select value={doc} onChange={(e) => setDoc(e.target.value)} className={inp + " h-10"} aria-label="Profesional">
          <option value="Todos">Todos los profesionales</option>
          {ADMINS.map((a) => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
        </select></div>
        <div className="ml-auto flex flex-wrap gap-2">
          <button type="button" onClick={informePdf} className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#0b2a6b] ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-sky-200 dark:ring-white/10"><Printer className="size-4" /> Informe PDF</button>
          <button type="button" onClick={() => void excelCompleto()} disabled={excel} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0b2a6b] px-4 text-sm font-semibold text-white hover:bg-[#0a2459]">{excel ? <Loader2 className="size-4 animate-spin" /> : <FileSpreadsheet className="size-4" />} Excel completo</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={CalendarDays} label="Citas" value={kpis[0]!.v} hint={kpis[0]!.s} />
        <Kpi icon={CalendarCheck} label="Asistencia" value={kpis[1]!.v} hint={kpis[1]!.s} tono="violeta" delay={0.05} />
        <Kpi icon={Wallet} label="Ingresos" value={kpis[2]!.v} hint={kpis[2]!.s} tono="verde" delay={0.1} />
        <Kpi icon={Users} label="Pacientes nuevos" value={kpis[3]!.v} hint={kpis[3]!.s} tono="azul" delay={0.15} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Dato icon={Receipt} l="Facturado" v={dinero(facturado)} s={`${factR.length} comprobantes`} />
        <Dato icon={TrendingUp} l="Balance" v={dinero(ingresos - egresosR)} s={`Egresos ${dinero(egresosR)}`} />
        <Dato icon={Building2} l="Cartera con EPS" v={dinero(carteraTotal)} s={vencida.length ? `${vencida.length} con más de 60 días` : "Al día"} />
        <Dato icon={Clock} l="Saldos de pacientes" v={dinero(saldoPacientes)} s="Por cobrar en caja" />
      </div>

      {alertas.length > 0 && (
        <Seccion icon={AlertTriangle} titulo="Para atender" sub="Lo que el sistema detectó en los datos">
          <ul className="grid gap-2.5 lg:grid-cols-2">
            {alertas.map((a) => (
              <li key={a.t} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-white/10 dark:bg-white/5">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-[#0e7490]" />
                <div><p className="text-sm font-semibold">{a.t}</p><p className="text-xs text-muted-foreground">{a.d}</p></div>
              </li>
            ))}
          </ul>
        </Seccion>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Seccion icon={CalendarDays} titulo="Citas por mes" sub="Últimos 12 meses, sin canceladas"><BarrasV datos={turnosMes} color="#0b2a6b" /></Seccion>
        <Seccion icon={TrendingUp} titulo="Ingresos por mes" sub="Pagos de pacientes · últimos 12 meses" delay={0.05}><BarrasV datos={ingresosMes} color="#0e7490" fmt={(n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)} M` : n >= 1e3 ? `${Math.round(n / 1e3)} mil` : String(n))} /></Seccion>
      </div>

      <Seccion icon={Clock} titulo="Cuándo piden citas" sub={pico.v ? `Hora pico: ${DIAS_SEM[pico.d]} a las ${hora12(`${String(FRANJAS[pico.h]).padStart(2, "0")}:00`)} · útil para organizar horarios y personal` : "Días y horas con más citas en el período"}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-1 text-[11px]">
            <thead><tr><th />{FRANJAS.map((h) => <th key={h} className="font-medium text-muted-foreground">{h > 12 ? h - 12 : h}{h >= 12 ? " p. m." : " a. m."}</th>)}</tr></thead>
            <tbody>
              {mapa.map((fila, d) => (
                <tr key={d}>
                  <td className="pr-2 text-right font-semibold text-muted-foreground">{DIAS_SEM[d]}</td>
                  {fila.map((v, h) => (
                    <td key={h} title={`${DIAS_SEM[d]} ${FRANJAS[h]}:00 · ${v} cita${v === 1 ? "" : "s"}`} className="h-9 rounded-md text-center font-semibold tabular-nums" style={{ background: v ? `rgba(11,42,107,${0.12 + (v / maxMapa) * 0.78})` : "rgba(148,163,184,.12)", color: v / maxMapa > 0.45 ? "#fff" : "#0b2a6b" }}>{v || ""}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Seccion>

      <div className="grid gap-6 xl:grid-cols-3">
        <Seccion icon={Stethoscope} titulo="Citas por doctor" sub="En el período"><BarrasH datos={porDoctor} /></Seccion>
        <Seccion icon={ClipboardList} titulo="Estado de las citas" sub="En el período" delay={0.05}><BarrasH datos={porEstado} colores={["#0b2a6b", "#0e7490", "#94a3b8", "#cbd5e1"]} /></Seccion>
        <Seccion icon={Globe} titulo="Por dónde llegan" sub="Origen de las citas" delay={0.1}><BarrasH datos={porOrigen} /></Seccion>
        <Seccion icon={Activity} titulo="Motivos de consulta" sub="Los más frecuentes" delay={0.15}><BarrasH datos={porMotivo} max={6} /></Seccion>
        <Seccion icon={Receipt} titulo="Ingresos por servicio" sub="Lo que más ingresa" delay={0.2}><BarrasH datos={porServicio} fmt={dinero} max={6} /></Seccion>
        <Seccion icon={Wallet} titulo="Medios de pago" sub="Monto cobrado por medio" delay={0.25}><BarrasH datos={porMetodo} fmt={dinero} /></Seccion>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Seccion icon={TrendingUp} titulo="Ingresos y egresos" sub="Últimos 6 meses" className="xl:col-span-2"><BarrasDobles datos={balanceMes} a="Ingresos" b="Egresos" fmt={dinero} /></Seccion>
        <Seccion icon={Building2} titulo="Cartera por EPS" sub="Saldo que deben las EPS" delay={0.05}><BarrasH datos={carteraEps} fmt={dinero} max={6} /></Seccion>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Seccion icon={Users} titulo="Pacientes" sub="Nuevos y recurrentes en el período">
          <div className="grid grid-cols-2 gap-4">
            <DonaPct pct={pacIdsPeriodo.size ? (recurrentes / pacIdsPeriodo.size) * 100 : 0} etiqueta="Recurrentes" sub={`${recurrentes} de ${pacIdsPeriodo.size} atendidos`} />
            <DonaPct pct={pacIdsPeriodo.size ? ((pacIdsPeriodo.size - recurrentes) / pacIdsPeriodo.size) * 100 : 0} etiqueta="Primera vez" sub={`${pacIdsPeriodo.size - recurrentes} pacientes`} color="#0e7490" />
          </div>
        </Seccion>
        <Seccion icon={ShieldCheck} titulo="Pacientes por EPS" sub="Todos los pacientes" delay={0.05}><BarrasH datos={porEps} max={6} /></Seccion>
        <Seccion icon={Users} titulo="Pacientes por edad" sub={`${conEdad.length} con fecha de nacimiento`} delay={0.1}><BarrasV datos={porEdad} color="#0e7490" alto="h-40" /></Seccion>
      </div>

      <Seccion icon={Activity} titulo="Indicadores clínicos" sub="Último valor registrado de cada paciente">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0e7490]"><Droplets className="size-3.5" /> Estadios de ERC (KDIGO)</p>
            <BarrasV datos={estadios} color="#0e7490" alto="h-40" />
          </div>
          <div className="flex items-center justify-center rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            <DonaPct pct={conTA.length ? (controlados / conTA.length) * 100 : 0} etiqueta="Presión controlada" sub={`${controlados} de ${conTA.length} · < 140/90`} />
          </div>
          <div className="space-y-2 lg:col-span-2">
            {[
              { l: "Pacientes con función renal medida", v: ultimoEgfr.size },
              { l: "ERC estadio 3 o más (eGFR < 60)", v: [...ultimoEgfr.values()].filter((x) => x.v < 60).length },
              { l: "Para evaluar remisión (eGFR < 30)", v: [...ultimoEgfr.values()].filter((x) => x.v < 30).length },
              { l: "Registros con FEVI reducida (< 41%)", v: feviRed },
              { l: "Recetas emitidas en el período", v: recetasR },
              { l: "Laboratorios en el período", v: labsR },
            ].map((x) => (
              <div key={x.l} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2.5 dark:border-white/10">
                <span className="text-sm">{x.l}</span>
                <span className="font-display text-xl font-semibold tabular-nums text-[#0b2a6b] dark:text-sky-200">{x.v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#0b2a6b] dark:text-sky-200">Diagnósticos más frecuentes en el período</p>
          <BarrasH datos={topDx} max={8} />
        </div>
      </Seccion>

      <Seccion icon={Download} titulo="Reportes para descargar" sub={`Excel del período elegido (${periodoTxt.toLowerCase()}${doc !== "Todos" ? ` · ${nombreCorto(doc)}` : ""})`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {reportes.map((r) => (
            <button key={r.t} onClick={async () => { try { await descargarExcel(nombreArchivo(r.t.toLowerCase()), r.hojas()); log("Reporte exportado", `${r.t} · ${periodoTxt}`); } catch { toast.error("No se pudo generar el Excel."); } }} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-[#0b2a6b]/30 hover:shadow-md dark:border-white/10">
              <span className="grid size-10 place-items-center rounded-xl bg-[#0b2a6b]/[.07] text-[#0b2a6b] dark:bg-white/10 dark:text-sky-200"><r.icon className="size-4" /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{r.t}</span>
                <span className="block text-xs text-muted-foreground">{r.d}</span>
              </span>
              <FileSpreadsheet className="size-4 text-muted-foreground transition group-hover:text-[#0b2a6b]" />
            </button>
          ))}
          <button onClick={() => void excelCompleto()} className="group flex items-center gap-3 rounded-2xl bg-[#0b2a6b] p-4 text-left text-white transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="grid size-10 place-items-center rounded-xl bg-white/15"><FileSpreadsheet className="size-4" /></span>
            <span className="min-w-0 flex-1"><span className="block font-semibold">Todo en un Excel</span><span className="block text-xs text-white/75">Resumen + todas las hojas</span></span>
            <Download className="size-4" />
          </button>
        </div>
      </Seccion>
    </div>
  );
}

/* ═══════════════════════ AUTOMATIZACIONES ═══════════════════════ */
type Canal = "WhatsApp" | "Panel" | "Email";
type AutoDef = { id: string; nombre: string; desc: string; canal: Canal; motor: boolean };
const GRUPOS_AUTO: { id: string; letra: string; titulo: string; icon: LucideIcon; grad: string; items: AutoDef[] }[] = [
  {
    id: "agenda", letra: "A", titulo: "Agenda y citas", icon: CalendarDays, grad: "from-sky-500 to-blue-700",
    items: [
      { id: "recordatorio48", nombre: "Recordatorio 2 días antes de la cita", desc: "Aviso al paciente con día, hora, doctor y qué debe traer o cómo prepararse para el estudio. Por correo sale solo todos los días a las 8:00 a. m.", canal: "WhatsApp", motor: true },
      { id: "recordatorio24", nombre: "Recordatorio 1 día antes de la cita", desc: "Aviso el día anterior con día, hora, doctor y la preparación del estudio (Holter, MAPA, eco, prueba de esfuerzo…). Por correo sale solo a las 8:00 a. m.", canal: "WhatsApp", motor: true },
      { id: "confirmar", nombre: "Pedir confirmación de citas pendientes", desc: "Le pide al paciente que confirme o reprograme.", canal: "WhatsApp", motor: true },
      { id: "ausentes", nombre: "Recuperar citas canceladas", desc: "Ofrece un nuevo horario a quien canceló en las últimas 2 semanas.", canal: "WhatsApp", motor: true },
      { id: "encuesta", nombre: "Encuesta después de la consulta", desc: "Pregunta cómo fue la atención al día siguiente.", canal: "WhatsApp", motor: true },
    ],
  },
  {
    id: "cardio", letra: "B", titulo: "Cardiología", icon: HeartPulse, grad: "from-rose-500 to-red-600",
    items: [
      { id: "crisisTA", nombre: "Alerta de presión en crisis", desc: "Avise al cardiólogo si se registra una TA > 180/120.", canal: "Panel", motor: true },
      { id: "controlTA", nombre: "Recordatorio semanal de control de presión", desc: "Pida a los hipertensos que carguen su presión en el portal.", canal: "WhatsApp", motor: true },
      { id: "feviBaja", nombre: "Seguimiento de FEVI reducida", desc: "Marque a los pacientes con FEVI < 41% sin control en 90 días.", canal: "Panel", motor: true },
      { id: "prepHolter", nombre: "Preparación para Holter / MAPA", desc: "Envíe las indicaciones el día anterior al estudio.", canal: "WhatsApp", motor: false },
    ],
  },
  {
    id: "nefro", letra: "C", titulo: "Nefrología", icon: Droplets, grad: "from-sky-400 to-cyan-600",
    items: [
      { id: "potasio", nombre: "Alerta de potasio alto", desc: "Avise al nefrólogo si un resultado supera 5,5 mEq/l.", canal: "Panel", motor: true },
      { id: "egfrCae", nombre: "Caída del filtrado glomerular", desc: "Detecta una caída mayor al 25% entre dos resultados.", canal: "Panel", motor: true },
      { id: "g4", nombre: "Estadio G4–G5: evaluar derivación", desc: "Marque pacientes con eGFR < 30 para planificar el tratamiento.", canal: "Panel", motor: true },
      { id: "labTrimestral", nombre: "Laboratorio renal trimestral", desc: "Recuerde a pacientes con ERC hacer su control cada 3 meses.", canal: "WhatsApp", motor: true },
    ],
  },
  {
    id: "recetas", letra: "D", titulo: "Recetas y laboratorio", icon: Pill, grad: "from-violet-500 to-indigo-700",
    items: [
      { id: "recetaLista", nombre: "Aviso de receta emitida", desc: "Envíe al paciente la receta del día con su código.", canal: "WhatsApp", motor: true },
      { id: "labListo", nombre: "Resultados de laboratorio disponibles", desc: "Avise que ya puede ver sus resultados en el portal.", canal: "WhatsApp", motor: true },
      { id: "labDemorado", nombre: "Pedidos sin resultado hace más de 7 días", desc: "Avise al equipo para reclamar al laboratorio.", canal: "Panel", motor: true },
      { id: "renovacion", nombre: "Renovación de medicación crónica", desc: "Recuerde renovar la receta a los 25 días.", canal: "WhatsApp", motor: true },
    ],
  },
  {
    id: "pagos", letra: "E", titulo: "Pagos y facturación", icon: Wallet, grad: "from-emerald-400 to-teal-600",
    items: [
      { id: "saldo", nombre: "Aviso de saldo pendiente", desc: "Recordatorio amable a pacientes con saldo.", canal: "WhatsApp", motor: true },
      { id: "sinFacturar", nombre: "Cobros sin facturar", desc: "Avise a administración qué cobros no tienen comprobante.", canal: "Panel", motor: true },
      { id: "liquidacion", nombre: "Liquidación de EPS", desc: "A fin de mes muestra lo pendiente por cobertura.", canal: "Panel", motor: true },
    ],
  },
  {
    id: "pacientes", letra: "F", titulo: "Pacientes y portal", icon: Users, grad: "from-fuchsia-500 to-pink-600",
    items: [
      { id: "cumple", nombre: "Saludo de cumpleaños", desc: "Mensaje de la clínica el día del cumpleaños.", canal: "WhatsApp", motor: true },
      { id: "invitarPortal", nombre: "Invitar al portal a pacientes con cita", desc: "Detecta pacientes con citas que todavía no tienen portal.", canal: "Panel", motor: true },
      { id: "bienvenida", nombre: "Bienvenida al portal", desc: "Explique cómo usar el portal en el primer ingreso.", canal: "Email", motor: false },
    ],
  },
];
const AUTOS_TODAS = GRUPOS_AUTO.flatMap((g) => g.items.map((i) => ({ ...i, grupo: g })));

type AccionAuto = { key: string; auto: string; titulo: string; detalle: string; tipo: "wa" | "alerta"; tel?: string; msg?: string; ir?: Tab };

function calcularAcciones(activas: Record<string, boolean>, d: {
  turnos: Turno[]; pacientes: PacienteHC[]; evols: Evolucion[]; estudios: Estudio[]; controles: Control[]; recetas: Receta[]; labs: PedidoLab[]; cobros: Cobro[]; facturas: Factura[];
}): AccionAuto[] {
  const out: AccionAuto[] = [];
  const hoy = isoDe(new Date());
  const man = isoDe(new Date(Date.now() + 86400000));
  const ayer = isoDe(new Date(Date.now() - 86400000));
  const semana = `${new Date().getFullYear()}-s${Math.ceil(((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7)}`;
  const tel = (nombre: string, t?: string) => t || d.pacientes.find((p) => norm(p.nombre) === norm(nombre))?.telefono;
  const on = (id: string) => activas[id] ?? false;
  const nom = (n: string) => n.split(" ")[0];

  const pasado = isoDe(new Date(Date.now() + 2 * 86400000));
  for (const [id, fecha, cuando, marca] of [["recordatorio48", pasado, "pasado mañana", "recordado2"], ["recordatorio24", man, "mañana", "recordado1"]] as const) {
    if (!on(id)) continue;
    d.turnos.filter((t) => t.fecha === fecha && t.estado !== "Cancelado" && t.estado !== "Atendido").forEach((t) => {
      const tl = tel(t.paciente, t.telefono);
      const ya = t[marca] ? ` · correo enviado` : "";
      if (tl) out.push({ key: `${id}-${t.id}`, auto: id, titulo: `Recordatorio a ${t.paciente}`, detalle: `${cuando === "mañana" ? "Mañana" : "Pasado mañana"} ${hora12(t.hora)} · ${t.motivo || "Consulta"}${ya}`, tipo: "wa", tel: tl, msg: `Hola ${nom(t.paciente)}, le recordamos su cita de ${cuando} (${fechaCorta(t.fecha)}) a las ${hora12(t.hora)} con ${t.doctor} en el Centro HEGO.\n\n${indicacionesTexto(t.motivo)}\n\nSi no puede venir, avísenos por aquí.` });
    });
  }
  if (on("confirmar"))
    d.turnos.filter((t) => t.estado === "Pendiente" && t.fecha >= hoy).forEach((t) => {
      const tl = tel(t.paciente, t.telefono);
      if (tl) out.push({ key: `conf-${t.id}`, auto: "confirmar", titulo: `Confirmar cita de ${t.paciente}`, detalle: `${fechaCorta(t.fecha)} ${hora12(t.hora)}`, tipo: "wa", tel: tl, msg: `Hola ${nom(t.paciente)}, ¿nos confirma su cita del ${fechaCorta(t.fecha)} a las ${hora12(t.hora)} con ${t.doctor}? Responda SÍ para confirmar o escríbanos para cambiarlo.` });
    });
  if (on("ausentes"))
    d.turnos.filter((t) => t.estado === "Cancelado" && t.fecha >= isoDe(new Date(Date.now() - 14 * 86400000)) && t.fecha <= hoy).forEach((t) => {
      const tl = tel(t.paciente, t.telefono);
      if (tl) out.push({ key: `aus-${t.id}`, auto: "ausentes", titulo: `Ofrecer nueva cita a ${t.paciente}`, detalle: `Canceló el ${fechaCorta(t.fecha)}`, tipo: "wa", tel: tl, msg: `Hola ${nom(t.paciente)}, vimos que no pudo venir a su cita. ¿Quiere que le busquemos un nuevo horario con ${t.doctor}?` });
    });
  if (on("encuesta"))
    d.turnos.filter((t) => t.estado === "Atendido" && t.fecha === ayer).forEach((t) => {
      const tl = tel(t.paciente, t.telefono);
      if (tl) out.push({ key: `enc-${t.id}`, auto: "encuesta", titulo: `Encuesta a ${t.paciente}`, detalle: "Consulta de ayer", tipo: "wa", tel: tl, msg: `Hola ${nom(t.paciente)}, gracias por atenderlo ayer en el Centro HEGO. Del 1 al 5, ¿cómo fue su experiencia?` });
    });

  // Último valor por paciente
  const ult = <T extends { f: string }>(arr: (T & { id: string })[]) => {
    const m = new Map<string, T & { id: string }>();
    arr.forEach((x) => { const y = m.get(x.id); if (!y || x.f > y.f) m.set(x.id, x); });
    return m;
  };
  const tas = ult([...d.controles.map((c) => ({ id: c.pacienteId, f: c.fecha, s: c.sistolica, dd: c.diastolica })), ...d.evols.filter((e) => e.signos.sistolica && e.signos.diastolica).map((e) => ({ id: e.pacienteId, f: e.fecha, s: e.signos.sistolica!, dd: e.signos.diastolica! }))]);
  const nombreDe = (id: string) => d.pacientes.find((p) => p.id === id)?.nombre ?? "Paciente";
  if (on("crisisTA"))
    tas.forEach((x) => { if (x.s > 180 || x.dd > 120) out.push({ key: `crisis-${x.id}-${x.f}`, auto: "crisisTA", titulo: `Presión en crisis: ${nombreDe(x.id)}`, detalle: `${x.s}/${x.dd} mmHg · ${fechaDe(x.f)}`, tipo: "alerta", ir: "historia" }); });
  if (on("controlTA"))
    d.pacientes.filter((p) => (p.ficha?.antecedentes ?? []).includes("Hipertensión arterial") && p.telefono).forEach((p) => {
      out.push({ key: `ctrlta-${p.id}-${semana}`, auto: "controlTA", titulo: `Control de presión: ${p.nombre}`, detalle: "Recordatorio semanal", tipo: "wa", tel: p.telefono!, msg: `Hola ${nom(p.nombre)}, ¿le midió la presión esta semana? Cárguela en su portal del Centro HEGO así su médico la ve.` });
    });
  if (on("feviBaja")) {
    const fv = ult(d.evols.filter((e) => e.cardio?.fevi).map((e) => ({ id: e.pacienteId, f: e.fecha, v: e.cardio!.fevi! })));
    fv.forEach((x) => { if (x.v < 41 && x.f.slice(0, 10) < isoDe(new Date(Date.now() - 90 * 86400000))) out.push({ key: `fevi-${x.id}-${x.f}`, auto: "feviBaja", titulo: `FEVI reducida sin control: ${nombreDe(x.id)}`, detalle: `FEVI ${x.v}% · último control ${fechaDe(x.f)}`, tipo: "alerta", ir: "historia" }); });
  }
  const labsVal = [...d.estudios.map((e) => ({ id: e.pacienteId, f: e.fecha, v: e.valores })), ...d.evols.filter((e) => e.nefro).map((e) => ({ id: e.pacienteId, f: e.fecha, v: { egfr: e.nefro?.egfr, potasio: e.nefro?.potasio } as ValoresEstudio }))];
  if (on("potasio")) {
    const k = ult(labsVal.filter((x) => x.v.potasio).map((x) => ({ id: x.id, f: x.f, k: x.v.potasio! })));
    k.forEach((x) => { if (x.k > 5.5) out.push({ key: `k-${x.id}-${x.f}`, auto: "potasio", titulo: `Potasio alto: ${nombreDe(x.id)}`, detalle: `K ${x.k} mEq/l · ${fechaDe(x.f)}`, tipo: "alerta", ir: "historia" }); });
  }
  const egfrs = labsVal.filter((x) => x.v.egfr).map((x) => ({ id: x.id, f: x.f, v: x.v.egfr! }));
  if (on("egfrCae")) {
    const porPac = new Map<string, { f: string; v: number }[]>();
    egfrs.forEach((x) => porPac.set(x.id, [...(porPac.get(x.id) ?? []), x]));
    porPac.forEach((arr, id) => {
      const s = arr.sort((a, b) => b.f.localeCompare(a.f));
      if (s.length >= 2 && s[1]!.v > 0 && (s[1]!.v - s[0]!.v) / s[1]!.v > 0.25) out.push({ key: `egfr-${id}-${s[0]!.f}`, auto: "egfrCae", titulo: `Caída del filtrado: ${nombreDe(id)}`, detalle: `${s[1]!.v} → ${s[0]!.v} ml/min`, tipo: "alerta", ir: "historia" });
    });
  }
  if (on("g4")) ult(egfrs).forEach((x) => { if (x.v < 30) out.push({ key: `g4-${x.id}-${x.f}`, auto: "g4", titulo: `Estadio ${estadioRenal(x.v).estadio}: ${nombreDe(x.id)}`, detalle: `eGFR ${x.v} ml/min · evaluar plan de tratamiento`, tipo: "alerta", ir: "historia" }); });
  if (on("labTrimestral"))
    d.pacientes.filter((p) => esNefro(p.ficha?.antecedentes) && p.telefono).forEach((p) => {
      const u = egfrs.filter((x) => x.id === p.id).sort((a, b) => b.f.localeCompare(a.f))[0];
      if (!u || u.f.slice(0, 10) < isoDe(new Date(Date.now() - 90 * 86400000)))
        out.push({ key: `labtri-${p.id}-${hoy.slice(0, 7)}`, auto: "labTrimestral", titulo: `Laboratorio renal: ${p.nombre}`, detalle: u ? `Último ${fechaDe(u.f)}` : "Sin laboratorio registrado", tipo: "wa", tel: p.telefono!, msg: `Hola ${nom(p.nombre)}, ya le toca el control de laboratorio renal. Escríbanos y le pasamos la orden.` });
    });
  if (on("recetaLista"))
    d.recetas.filter((r) => !r.anulada && isoDe(new Date(r.fecha)) === hoy).forEach((r) => {
      const tl = tel(r.paciente);
      if (tl) out.push({ key: `rx-${r.id}`, auto: "recetaLista", titulo: `Enviar receta a ${r.paciente}`, detalle: `N° ${r.numero} · ${r.items.length} medicamentos`, tipo: "wa", tel: tl, msg: `Hola ${nom(r.paciente)}, su receta N° ${r.numero} ya está lista:\n${r.items.map((i) => `• ${i.droga} ${i.presentacion} — ${i.posologia}`).join("\n")}\nCódigo: ${r.codigo}` });
    });
  if (on("renovacion"))
    d.recetas.filter((r) => !r.anulada && isoDe(new Date(r.fecha)) === isoDe(new Date(Date.now() - 25 * 86400000))).forEach((r) => {
      const tl = tel(r.paciente);
      if (tl) out.push({ key: `ren-${r.id}`, auto: "renovacion", titulo: `Renovar medicación de ${r.paciente}`, detalle: `Receta N° ${r.numero} de hace 25 días`, tipo: "wa", tel: tl, msg: `Hola ${nom(r.paciente)}, se está por terminar su medicación (${r.items.map((i) => i.droga).join(", ")}). ¿Quiere que le preparemos la nueva receta?` });
    });
  if (on("labListo"))
    d.labs.filter((l) => l.estado === "Resultado" && (l.fechaResultado ?? "").slice(0, 10) >= isoDe(new Date(Date.now() - 3 * 86400000))).forEach((l) => {
      const tl = tel(l.paciente);
      if (tl) out.push({ key: `labok-${l.id}`, auto: "labListo", titulo: `Resultados listos: ${l.paciente}`, detalle: "Avisar que están en el portal", tipo: "wa", tel: tl, msg: `Hola ${nom(l.paciente)}, ya están sus resultados de laboratorio. Puede verlos en su portal del Centro HEGO.` });
    });
  if (on("labDemorado"))
    d.labs.filter((l) => l.estado !== "Resultado" && l.fecha.slice(0, 10) < isoDe(new Date(Date.now() - 7 * 86400000))).forEach((l) => out.push({ key: `labdem-${l.id}`, auto: "labDemorado", titulo: `Laboratorio demorado: ${l.paciente}`, detalle: `Pedido el ${fechaDe(l.fecha)}`, tipo: "alerta", ir: "laboratorio" }));
  if (on("saldo"))
    d.cobros.filter((c) => saldoDe(c) > 0).forEach((c) => {
      const tl = tel(c.paciente);
      if (tl) out.push({ key: `saldo-${c.id}-${hoy.slice(0, 7)}`, auto: "saldo", titulo: `Saldo de ${c.paciente}`, detalle: `${dinero(saldoDe(c))} · ${c.concepto}`, tipo: "wa", tel: tl, msg: `Hola ${nom(c.paciente)}, le recordamos que quedó un saldo de ${dinero(saldoDe(c))} por ${c.concepto}. Puede abonarlo en su próxima visita o por transferencia. ¡Gracias!` });
    });
  if (on("sinFacturar")) {
    const n = d.cobros.filter((c) => !c.anulado && pagadoDe(c) > 0 && !d.facturas.some((f) => f.cobroId === c.id && f.estado !== "Anulada")).length;
    if (n > 0) out.push({ key: `sinfact-${hoy}`, auto: "sinFacturar", titulo: `${n} cobros sin facturar`, detalle: "Emite los comprobantes pendientes", tipo: "alerta", ir: "facturacion" });
  }
  if (on("liquidacion") && new Date().getDate() >= 25) {
    const pend = d.facturas.filter((f) => f.estado === "Emitida" && f.cobertura !== "Particular");
    if (pend.length) out.push({ key: `liq-${hoy.slice(0, 7)}`, auto: "liquidacion", titulo: "Liquidación de EPS", detalle: `${pend.length} comprobantes · ${dinero(pend.reduce((a, f) => a + f.total, 0))}`, tipo: "alerta", ir: "facturacion" });
  }
  if (on("cumple"))
    d.pacientes.filter((p) => p.ficha?.nacimiento && p.ficha.nacimiento.slice(5, 10) === hoy.slice(5, 10) && p.telefono).forEach((p) => out.push({ key: `cumple-${p.id}-${hoy}`, auto: "cumple", titulo: `Cumpleaños de ${p.nombre}`, detalle: "Hoy", tipo: "wa", tel: p.telefono!, msg: `¡Feliz cumpleaños, ${nom(p.nombre)}! Le saludamos con mucho cariño desdel Centro HEGO.` }));
  if (on("invitarPortal")) {
    const sin = d.pacientes.filter((p) => !p.portal && d.turnos.some((t) => norm(t.paciente) === norm(p.nombre) && t.fecha >= hoy));
    if (sin.length) out.push({ key: `inv-${hoy}`, auto: "invitarPortal", titulo: `${sin.length} pacientes con cita sin portal`, detalle: sin.slice(0, 3).map((p) => p.nombre).join(", "), tipo: "alerta", ir: "pacientes" });
  }
  return out;
}

type VistaAuto = "bandeja" | "catalogo" | "flujos";

function AutomatizacionesTab({ log, turnos, irA }: { log: LogFn; turnos: Turno[]; irA: (t: Tab) => void }) {
  const pacientes = usePacientesClinica(turnos);
  const [guardadas, setActivas] = useDato<Record<string, boolean>>(KEY_AUTOS, {});
  const activas: Record<string, boolean> = { ...ACTIVAS_POR_DEFECTO, ...guardadas };
  const [qN, setQN] = useState("");
  const [canalF, setCanalF] = useState<"Todos" | CanalNotif>("Todos");
  const [paraF, setParaF] = useState<"Todos" | ParaNotif>("Todos");
  const [soloActivas, setSoloActivas] = useState(false);
  const [hechas, setHechas] = useDato<Record<string, string>>(KEY_AUTOS_HECHAS, {});
  const [evols] = useDato<Evolucion[]>(KEY_EVOLUCIONES, []);
  const [estudios] = useDato<Estudio[]>(KEY_ESTUDIOS, []);
  const [controles] = useDato<Control[]>(KEY_CONTROLES, []);
  const [recetas] = useDato<Receta[]>(KEY_RECETAS, []);
  const [labs] = useDato<PedidoLab[]>(KEY_LAB, []);
  const [cobros] = useDato<Cobro[]>(KEY_COBROS, []);
  const [facturas] = useDato<Factura[]>(KEY_FACTURAS, []);
  const [vista, setVista] = useState<VistaAuto>("bandeja");
  const [grupoAbierto, setGrupoAbierto] = useState<string>("agenda");

  const acciones = calcularAcciones(activas, { turnos, pacientes, evols, estudios, controles, recetas, labs, cobros, facturas });
  const pendientes = acciones.filter((a) => !hechas[a.key]);
  const nActivas = NOTIFICACIONES.filter((a) => activas[a.id]).length;
  const nHechas = Object.keys(hechas).length;
  const marcar = (a: AccionAuto) => {
    setHechas((p) => ({ ...p, [a.key]: new Date().toISOString() }));
    log("Automatización ejecutada", `${AUTOS_TODAS.find((x) => x.id === a.auto)?.nombre} · ${a.titulo}`);
  };
  const alternar = (id: string, v: boolean) => {
    setActivas((p) => ({ ...p, [id]: v }));
    log(v ? "Notificación activada" : "Notificación pausada", NOTIFICACIONES.find((x) => x.id === id)?.nombre ?? id);
  };
  const alternarVarias = (ids: string[], v: boolean) => {
    setActivas((p) => ({ ...p, ...Object.fromEntries(ids.map((i) => [i, v])) }));
    log(v ? "Notificaciones activadas" : "Notificaciones pausadas", `${ids.length} notificaciones`);
  };
  const ICONO_GRUPO: Record<string, LucideIcon> = { calendar: CalendarDays, clipboard: ClipboardList, stethoscope: Stethoscope, heart: HeartPulse, droplets: Droplets, activity: Activity, flask: FlaskConical, pill: Pill, user: UserRound, wallet: Wallet, receipt: Receipt, gift: Gift, users: Users };
  const ICONO_CANAL: Record<CanalNotif, LucideIcon> = { WhatsApp: MessageCircle, Correo: Mail, SMS: Smartphone, Panel: Monitor };
  const coincide = (n: (typeof NOTIFICACIONES)[number]) =>
    (canalF === "Todos" || n.canales.includes(canalF)) && (paraF === "Todos" || n.para === paraF) && (!soloActivas || activas[n.id]) && (!qN || norm(`${n.nombre} ${n.cuando} ${n.grupo}`).includes(norm(qN)));
  const visiblesN = NOTIFICACIONES.filter(coincide);
  const porCanal = (["WhatsApp", "Correo", "SMS", "Panel"] as CanalNotif[]).map((c) => ({ c, n: NOTIFICACIONES.filter((x) => activas[x.id] && x.canales.includes(c)).length }));

  const FLUJOS: { t: string; pasos: { icon: LucideIcon; l: string; auto?: string }[] }[] = [
    { t: "Ciclo de la cita", pasos: [{ icon: CalendarCheck, l: "Cita reservada" }, { icon: Send, l: "Pida confirmación", auto: "confirmar" }, { icon: Bell, l: "Recordatorio 2 días antes", auto: "recordatorio48" }, { icon: Bell, l: "Recordatorio 1 día antes", auto: "recordatorio24" }, { icon: Stethoscope, l: "Consulta" }, { icon: Send, l: "Encuesta", auto: "encuesta" }] },
    { t: "Control renal", pasos: [{ icon: FlaskConical, l: "Resultado de laboratorio" }, { icon: AlertTriangle, l: "Potasio alto", auto: "potasio" }, { icon: TrendingDown, l: "Caída del filtrado", auto: "egfrCae" }, { icon: Bell, l: "Alerta al nefrólogo" }, { icon: Send, l: "Aviso al paciente", auto: "labListo" }] },
    { t: "Paciente hipertenso", pasos: [{ icon: Activity, l: "Presión registrada" }, { icon: AlertTriangle, l: "TA en crisis", auto: "crisisTA" }, { icon: Bell, l: "Alerta al cardiólogo" }, { icon: Send, l: "Control semanal", auto: "controlTA" }] },
    { t: "Receta crónica", pasos: [{ icon: Pill, l: "Receta firmada" }, { icon: Send, l: "Envío al paciente", auto: "recetaLista" }, { icon: Clock, l: "Esperar 25 días" }, { icon: Send, l: "Renovación", auto: "renovacion" }] },
  ];

  return (
    <div className="space-y-6">
      <section className="pn-up relative overflow-hidden rounded-[1.75rem] gradient-deep p-6 text-white shadow-elevated sm:p-7">
        <div className="pn-cross pointer-events-none absolute inset-0" />
        <div className="pn-orb pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-rose-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ring-1 ring-white/20"><Zap className="size-3.5" /> Automatizaciones</span>
            <h2 className="mt-3 text-3xl font-semibold">Notificaciones de la clínica</h2>
            <p className="mt-2 text-sm text-white/70">
              {NOTIFICACIONES.length} notificaciones para pacientes, médicos y equipo: citas, recordatorios, resultados, recetas, pagos, EPS, cumpleaños y más. Active las que la clínica quiere usar; las activas quedan habilitadas para el envío automático por WhatsApp, correo, SMS o aviso en el panel.
            </p>
          </div>
        </div>
        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { l: "Activas", v: `${nActivas}/${NOTIFICACIONES.length}`, i: Zap },
            { l: "Para hacer ahora", v: String(pendientes.length), i: Bell },
            { l: "Ejecutadas", v: String(nHechas), i: Check },
            { l: "Tiempo ahorrado", v: `${((nHechas * 4) / 60).toFixed(1).replace(".", ",")} h`, i: Clock },
          ].map((k) => (
            <div key={k.l} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">{k.l}</p>
                <k.i className="size-4 text-white/70" />
              </div>
              <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{k.v}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="pn-card inline-flex flex-wrap gap-1 p-1.5">
        {([["bandeja", `Para hacer (${pendientes.length})`, Bell], ["catalogo", `Notificaciones (${nActivas}/${NOTIFICACIONES.length})`, ClipboardList], ["flujos", "Flujos", Workflow]] as [VistaAuto, string, LucideIcon][]).map(([id, l, Ic]) => (
          <button key={id} onClick={() => setVista(id)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${vista === id ? "pn-acc-tile text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
            <Ic className="size-4" /> {l}
          </button>
        ))}
      </div>

      {vista === "bandeja" && (
        <Seccion icon={Bell} titulo="Acciones preparadas" sub="Generadas por las automatizaciones activas">
          {nActivas === 0 ? (
            <Vacio icon={Zap} titulo="No hay automatizaciones activas" texto="Actívelas en el Catálogo y aquí aparecen los avisos y alertas listos." accion={<Button className="rounded-xl" onClick={() => setVista("catalogo")}>Ir al catálogo</Button>} />
          ) : pendientes.length === 0 ? (
            <Vacio icon={Check} titulo="Todo al día" texto="No hay avisos ni alertas pendientes por ahora." />
          ) : (
            <ul className="space-y-2.5">
              {pendientes.map((a) => {
                const def = AUTOS_TODAS.find((x) => x.id === a.auto)!;
                return (
                  <li key={a.key} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card p-3.5 transition hover:shadow-md">
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${def.grupo.grad} text-white`}><def.grupo.icon className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{a.titulo}</p>
                      <p className="text-xs text-muted-foreground">{a.detalle} · <span className="font-medium">{def.nombre}</span></p>
                    </div>
                    {a.tipo === "wa" && a.tel && a.msg ? (
                      <a href={waDe(a.tel, a.msg)} target="_blank" rel="noreferrer" onClick={() => marcar(a)} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600">
                        <Send className="size-3.5" /> Enviar WhatsApp
                      </a>
                    ) : (
                      a.ir && <button onClick={() => irA(a.ir!)} className="rounded-xl bg-[rgba(var(--acc),.1)] px-3.5 py-2 text-xs font-semibold text-[rgb(var(--acc))]">Ver</button>
                    )}
                    <button onClick={() => marcar(a)} className="rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Listo</button>
                  </li>
                );
              })}
            </ul>
          )}
        </Seccion>
      )}

      {vista === "catalogo" && (
        <div className="space-y-4">
          <div className="pn-card space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input value={qN} onChange={(e) => setQN(e.target.value)} placeholder="Buscar notificación: cumpleaños, recordatorio, glosa…" className={inp + " h-10 pl-9"} />
              </div>
              <div className="w-full sm:w-52"><select value={paraF} onChange={(e) => setParaF(e.target.value as typeof paraF)} className={inp + " h-10"} aria-label="Para quién">
                {["Todos", "Paciente", "Médico", "Enfermería", "Recepción", "Administración", "Dirección"].map((x) => <option key={x} value={x}>{x === "Todos" ? "Para todos" : `Para: ${x}`}</option>)}
              </select></div>
              <button type="button" onClick={() => setSoloActivas((v) => !v)} className={`inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition ${soloActivas ? "bg-[#0b2a6b] text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10"}`}><Check className="size-3.5" /> Solo activas</button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {(["Todos", "WhatsApp", "Correo", "SMS", "Panel"] as const).map((c) => {
                const Ic = c === "Todos" ? Bell : ICONO_CANAL[c];
                return (
                  <button key={c} type="button" onClick={() => setCanalF(c)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${canalF === c ? "bg-[#0b2a6b] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300"}`}>
                    <Ic className="size-3.5" /> {c === "Todos" ? "Todos los canales" : c}{c !== "Todos" && <span className="opacity-70">· {porCanal.find((x) => x.c === c)?.n ?? 0} activas</span>}
                  </button>
                );
              })}
              <div className="ml-auto flex gap-1.5">
                <button type="button" onClick={() => alternarVarias(visiblesN.map((n) => n.id), true)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#0b2a6b] hover:bg-slate-100 dark:text-sky-200 dark:hover:bg-white/10">Activar las {visiblesN.length} que se ven</button>
                <button type="button" onClick={() => alternarVarias(visiblesN.map((n) => n.id), false)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">Pausar</button>
              </div>
            </div>
          </div>
          {GRUPOS_NOTIF.map((g) => {
            const items = g.items.filter((i) => coincide({ ...i, grupo: g.titulo }));
            if (!items.length) return null;
            const filtrando = !!qN || canalF !== "Todos" || paraF !== "Todos" || soloActivas;
            const abierto = filtrando || grupoAbierto === g.id;
            const act = g.items.filter((i) => activas[i.id]).length;
            const Ic = ICONO_GRUPO[g.icono] ?? Bell;
            return (
              <section key={g.id} className="pn-card overflow-hidden">
                <button onClick={() => setGrupoAbierto(grupoAbierto === g.id ? "" : g.id)} className="flex w-full items-center gap-4 p-4 text-left sm:p-5">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#0b2a6b] text-white shadow-sm"><Ic className="size-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{g.titulo}</p>
                    <div className="mt-1.5 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full rounded-full bg-[#0e7490] transition-all" style={{ width: `${(act / g.items.length) * 100}%` }} /></div>
                  </div>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-700 dark:bg-white/10 dark:text-slate-200">{act}/{g.items.length} activas</span>
                  <ChevronDown className={`size-4 text-muted-foreground transition-transform ${abierto ? "rotate-180" : ""}`} />
                </button>
                {abierto && (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-2 dark:border-white/10 sm:px-5">
                    <div className="mb-1 flex justify-end">
                      <button onClick={() => alternarVarias(g.items.map((i) => i.id), act < g.items.length)} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-[#0b2a6b] hover:bg-slate-100 dark:text-sky-200 dark:hover:bg-white/10">{act < g.items.length ? "Activar todo el grupo" : "Pausar todo el grupo"}</button>
                    </div>
                    <ul className="divide-y divide-slate-100 dark:divide-white/5">
                      {items.map((i) => (
                        <li key={i.id} className={`flex items-center gap-4 py-3 transition ${activas[i.id] ? "" : "opacity-75"}`}>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{i.nombre}</p>
                            <p className="text-xs text-muted-foreground">{i.cuando}</p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              <span className="rounded-md bg-[#0b2a6b]/[.06] px-2 py-0.5 text-[10px] font-semibold text-[#0b2a6b] dark:bg-white/10 dark:text-sky-200">Para: {i.para}</span>
                              {i.canales.map((c) => { const Ci = ICONO_CANAL[c]; return <span key={c} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300"><Ci className="size-3" /> {c}</span>; })}
                            </div>
                          </div>
                          <Interruptor on={!!activas[i.id]} onChange={(v) => alternar(i.id, v)} label="" />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            );
          })}
          {visiblesN.length === 0 && <Vacio icon={Search} titulo="Sin resultados" texto="Ninguna notificación coincide con la búsqueda o los filtros." />}
        </div>
      )}

      {vista === "flujos" && (
        <div className="grid gap-5 xl:grid-cols-2">
          {FLUJOS.map((f) => (
            <Seccion key={f.t} icon={Workflow} titulo={f.t} sub="Cómo se encadenan los pasos">
              <ol className="flex flex-wrap items-center gap-2">
                {f.pasos.map((p, i) => {
                  const on = !p.auto || activas[p.auto];
                  return (
                    <li key={p.l} className="flex items-center gap-2">
                      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition ${on ? "bg-[rgba(var(--acc),.1)] text-foreground ring-[rgba(var(--acc),.35)]" : "bg-secondary/60 text-muted-foreground ring-border line-through decoration-1"}`}>
                        <p.icon className="size-3.5" /> {p.l}
                      </div>
                      {i < f.pasos.length - 1 && <ArrowUpRight className="size-3.5 rotate-45 text-muted-foreground" />}
                    </li>
                  );
                })}
              </ol>
              <p className="mt-4 text-xs text-muted-foreground">Los pasos tachados están pausados: actívelos en el Catálogo.</p>
            </Seccion>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════ CARPETA DEL PACIENTE (estilo Cloud Esther: paciente + historial) ═══════════ */
type SecCarpeta = "resumen" | "historia" | "documentos" | "estudios" | "laboratorio" | "recetas" | "medicacion" | "turnos" | "cuenta";
const GRUPOS_CARPETA: { titulo: string; items: { id: SecCarpeta; label: string; icon: LucideIcon }[] }[] = [
  { titulo: "General", items: [{ id: "resumen", label: "Resumen", icon: LayoutDashboard }] },
  {
    titulo: "Clínico",
    items: [
      { id: "historia", label: "Historia clínica", icon: FileText },
      { id: "documentos", label: "Documentos del paciente", icon: Paperclip },
      { id: "estudios", label: "Estudios", icon: ScanLine },
      { id: "laboratorio", label: "Laboratorio", icon: FlaskConical },
      { id: "recetas", label: "Receta digital", icon: PenLine },
      { id: "medicacion", label: "Medicación", icon: Pill },
    ],
  },
  {
    titulo: "Gestión",
    items: [
      { id: "turnos", label: "Citas", icon: CalendarDays },
      { id: "cuenta", label: "Estado de cuenta", icon: Wallet },
    ],
  },
];

function CarpetaPaciente({ p, user, log, turnos, abrir, onEditar, soloLectura = false }: { p: PacienteHC; user: SessionUser; log: LogFn; turnos: Turno[]; abrir: (tab: Tab, pacienteId: string) => void; onEditar: () => void; soloLectura?: boolean }) {
  const [sec, setSec] = useState<SecCarpeta>("resumen");
  const [evolsTodas, setEvols] = useDato<Evolucion[]>(KEY_EVOLUCIONES, []);
  const [estTodos] = useDato<Estudio[]>(KEY_ESTUDIOS, []);
  const [ctrlTodos] = useDato<Control[]>(KEY_CONTROLES, []);
  const [medsTodos] = useDato<Medicamento[]>(KEY_MEDICACION, []);
  const [rxTodas] = useDato<Receta[]>(KEY_RECETAS, []);
  const [labTodos] = useDato<PedidoLab[]>(KEY_LAB, []);
  const [cobTodos] = useDato<Cobro[]>(KEY_COBROS, []);
  const [factTodas] = useDato<Factura[]>(KEY_FACTURAS, []);
  const [firmas] = useDato<Record<string, string>>(KEY_FIRMAS, {});
  const [nueva, setNueva] = useState(false);

  const esDe = (id?: string) => !!id && (id === p.id || id === p.portalId);
  const mismoNombre = (n: string) => norm(n) === norm(p.nombre);
  const evols = evolsTodas.filter((e) => esDe(e.pacienteId)).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const estudios = estTodos.filter((e) => esDe(e.pacienteId)).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const controles = ctrlTodos.filter((c) => esDe(c.pacienteId));
  const meds = medsTodos.filter((m) => esDe(m.pacienteId));
  const recetas = rxTodas.filter((r) => esDe(r.pacienteId));
  const labs = labTodos.filter((l) => esDe(l.pacienteId));
  const misTurnos = turnos.filter((t) => esDe(t.pacienteId) || mismoNombre(t.paciente)).sort((a, b) => `${b.fecha}${b.hora}`.localeCompare(`${a.fecha}${a.hora}`));
  const cobros = cobTodos.filter((c) => esDe(c.pacienteId) || mismoNombre(c.paciente));
  const facturas = factTodas.filter((f) => mismoNombre(f.receptor));
  const hoy = isoDe(new Date());
  const proximo = [...misTurnos].reverse().find((t) => t.fecha >= hoy && t.estado !== "Cancelado" && t.estado !== "Atendido");
  const saldo = cobros.reduce((a, c) => a + saldoDe(c), 0);
  const ultima = evols[0];
  const edad = edadDe(p.ficha?.nacimiento);

  const [docsTodos] = useDato<DocumentoPaciente[]>(KEY_DOCUMENTOS, []);
  const docsP = docsTodos.filter((d) => d.pacienteId === p.id || d.pacienteId === p.portalId);
  const contador: Partial<Record<SecCarpeta, number>> = {
    documentos: docsP.length,
    historia: evols.length,
    estudios: estudios.length,
    laboratorio: labs.length,
    recetas: recetas.filter((r) => !r.anulada).length,
    medicacion: meds.filter((m) => m.activo).length,
    turnos: misTurnos.length,
  };

  // Último valor clínico
  const ta = [
    ...evols.filter((e) => e.signos.sistolica && e.signos.diastolica).map((e) => ({ f: e.fecha, s: e.signos.sistolica!, d: e.signos.diastolica! })),
    ...controles.map((c) => ({ f: c.fecha, s: c.sistolica, d: c.diastolica })),
  ].sort((a, b) => b.f.localeCompare(a.f))[0];
  const conPesoP = evols.find((e) => e.signos.peso);
  const imcP = conPesoP ? calcularImc(conPesoP.signos.peso, conPesoP.signos.talla ?? evols.find((e) => e.signos.talla)?.signos.talla) : null;

  const [notasEnfC] = useDato<NotaEnfermeria[]>(KEY_NOTAS_ENF, []);
  const enfP = notasEnfC.filter((n) => !n.anulada && (n.pacienteId === p.id || n.pacienteId === p.portalId)).sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 4);
  const Indicador = ({ icon: Ic, l, v, d, ir, tono }: { icon: LucideIcon; l: string; v: string; d: string; ir: SecCarpeta; tono: string }) => (
    <button onClick={() => setSec(ir)} className="group relative overflow-hidden rounded-[1.4rem] border border-border/60 bg-card p-4 text-left shadow-[0_1px_0_rgba(255,255,255,.6)_inset] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-30px_rgba(15,23,42,.5)]">
      <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tono}`} />
      <span className={`pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-gradient-to-br ${tono} opacity-20 blur-2xl transition-transform duration-500 group-hover:scale-150`} />
      <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 group-hover:left-[130%]" />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{l}</p>
          <p className="mt-2 truncate font-display text-2xl font-semibold tracking-tight">{v}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{d}</p>
        </div>
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tono} text-white shadow-lg ring-4 ring-card transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}><Ic className="size-5" /></span>
      </div>
      <span className="relative mt-3 flex items-center gap-1 text-[11px] font-semibold text-[rgb(var(--acc))] opacity-0 transition-opacity group-hover:opacity-100">Ver detalle <ArrowRight className="size-3" /></span>
    </button>
  );

  const Fila = ({ children }: { children: ReactNode }) => <li className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-card px-3.5 py-3">{children}</li>;
  const Cab = ({ t, s, accion }: { t: string; s: string; accion?: ReactNode }) => (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h4 className="text-base font-semibold">{t}</h4>
        <p className="text-xs text-muted-foreground">{s}</p>
      </div>
      {accion}
    </div>
  );

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-[rgba(var(--acc),.25)] bg-card animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)]">
        {/* Menú de la carpeta */}
        <nav aria-label="Secciones de la carpeta" className="border-b border-border/60 bg-gradient-to-b from-[rgba(var(--acc),.08)] via-[rgba(var(--acc),.03)] to-transparent p-3 md:border-b-0 md:border-r">
          <div className="md:sticky md:top-4">
            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[rgb(var(--acc))]">Carpeta del paciente</p>
            <div className="pn-noscroll flex gap-1 overflow-x-auto md:block md:space-y-3 md:overflow-visible">
              {GRUPOS_CARPETA.map((g) => (
                <div key={g.titulo} className="flex shrink-0 gap-1 md:block">
                  <p className="hidden px-2 pb-1 pt-2 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:block">{g.titulo}</p>
                  <div className="flex gap-1 md:flex-col md:gap-0.5">
                    {g.items.map((s) => {
                      const on = s.id === sec;
                      const n = contador[s.id] ?? 0;
                      const alerta = s.id === "cuenta" && saldo > 0;
                      return (
                        <button
                          key={s.id}
                          onClick={() => { setSec(s.id); setNueva(false); }}
                          aria-current={on ? "page" : undefined}
                          className={`group flex shrink-0 items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] font-medium transition-all ${on ? "pn-acc-tile text-white" : "text-foreground/70 hover:bg-card hover:text-foreground hover:shadow-sm"}`}
                        >
                          <span className={`grid size-7 shrink-0 place-items-center rounded-lg ${on ? "bg-white/20" : "bg-[rgba(var(--acc),.1)] text-[rgb(var(--acc))]"}`}><s.icon className="size-3.5" /></span>
                          <span className="min-w-0 flex-1 truncate">{s.label}</span>
                          {alerta ? <span className={`size-2 rounded-full ${on ? "bg-white" : "bg-rose-500"}`} title="Saldo pendiente" /> : n > 0 ? <span className={`min-w-5 rounded-full px-1.5 text-center text-[10px] font-bold tabular-nums ${on ? "bg-white/25" : "bg-[rgba(var(--acc),.1)] text-[rgb(var(--acc))]"}`}>{n}</span> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Contenido */}
        <div key={sec} className="min-w-0 p-3 animate-in fade-in duration-300 sm:p-5">
          {sec === "resumen" && (
            <div className="space-y-4">
              <section className="relative overflow-hidden rounded-[1.6rem] gradient-deep p-6 text-white shadow-[0_30px_60px_-35px_rgba(10,25,70,.9)]">
                <div className="pn-cross pointer-events-none absolute inset-0 opacity-60" />
                <span className="pn-orb pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-[rgba(var(--acc),.45)] blur-3xl" />
                <span className="pointer-events-none absolute -bottom-20 left-1/3 size-48 rounded-full bg-sky-400/20 blur-3xl" />
                <Electro latidos={4} grilla={false} color="#ffffff" className="pointer-events-none absolute inset-x-0 bottom-2 h-12 w-full opacity-25" />
                <div className="relative flex flex-wrap items-center gap-5">
                  <span className="relative shrink-0">
                    <span className="absolute -inset-1.5 rounded-[1.6rem] bg-gradient-to-br from-white/60 to-[rgba(var(--acc),.6)] opacity-70 blur-[2px]" />
                    <span className="relative grid size-[4.5rem] place-items-center rounded-[1.4rem] pn-acc-tile text-2xl font-bold text-white ring-2 ring-white/40">{iniciales(p.nombre)}</span>
                    <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-400 ring-4 ring-[#0b1f4d]" title="Paciente activo" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">Carpeta del paciente</p>
                    <h4 className="mt-1 truncate font-display text-[28px] font-semibold leading-tight tracking-tight">{p.nombre}</h4>
                    <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                      {p.dni && <span className="rounded-full bg-white/12 px-2.5 py-1 ring-1 ring-white/20">C.C. {p.dni}</span>}
                      {edad !== null && <span className="rounded-full bg-white/12 px-2.5 py-1 ring-1 ring-white/20">{edad} años</span>}
                      <span className="rounded-full bg-white/12 px-2.5 py-1 ring-1 ring-white/20">{p.ficha?.obraSocial || "Particular"}{p.ficha?.afiliado ? ` · ${p.ficha.afiliado}` : ""}</span>
                      {p.portal && <span className="rounded-full bg-violet-400/30 px-2.5 py-1 ring-1 ring-violet-200/40">Portal activo</span>}
                      {p.ficha?.alergias ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 shadow-[0_6px_16px_-6px_rgba(239,68,68,.9)]"><AlertTriangle className="size-3" /> Alergia: {p.ficha.alergias}</span>
                      ) : (
                        <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-emerald-100 ring-1 ring-emerald-300/30">Sin alergias registradas</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.telefono && (
                      <a href={waDe(p.telefono, `Hola ${p.nombre.split(" ")[0]}, le escribimos del Centro HEGO.`)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_10px_24px_-10px_rgba(16,185,129,.9)] transition hover:-translate-y-0.5 hover:bg-emerald-400"><Send className="size-3.5" /> WhatsApp</a>
                    )}
                    <button onClick={onEditar} className="inline-flex items-center gap-1.5 rounded-xl bg-white/12 px-4 py-2.5 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"><Pencil className="size-3.5" /> Editar paciente</button>
                  </div>
                </div>
                {(p.ficha?.antecedentes ?? []).length > 0 && (
                  <div className="relative mt-5 flex flex-wrap items-center gap-1.5 border-t border-white/10 pt-4">
                    <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Antecedentes</span>
                    {(p.ficha?.antecedentes ?? []).map((a) => (
                      <span key={a} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${esCardio([a]) ? "bg-rose-400/25 text-rose-50 ring-rose-200/30" : esNefro([a]) ? "bg-sky-400/25 text-sky-50 ring-sky-200/30" : "bg-white/10 text-white/90 ring-white/20"}`}>{a}</span>
                    ))}
                  </div>
                )}
              </section>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                <Indicador icon={CalendarDays} l="Próxima cita" v={proximo ? `${fechaCorta(proximo.fecha).slice(0, 5)} · ${hora12(proximo.hora)}` : "Sin cita"} d={proximo ? `${nombreCorto(proximo.doctor)} · ${proximo.motivo}` : "Agende el próximo control"} ir="turnos" tono="from-sky-500 to-blue-700" />
                <Indicador icon={Activity} l="Presión arterial" v={ta ? `${ta.s}/${ta.d}` : "—"} d={ta ? clasificarPresion(ta.s, ta.d).nivel : "Sin registros"} ir="historia" tono="from-rose-500 to-red-600" />
                <Indicador icon={Scale} l="Índice de masa corporal" v={imcP ? `${imcP.valor} kg/m²` : "—"} d={imcP ? imcP.texto : "Sin peso y talla"} ir="historia" tono="from-cyan-400 to-sky-600" />
                <Indicador icon={Wallet} l="Estado de cuenta" v={saldo > 0 ? dinero(saldo) : "Al día"} d={saldo > 0 ? "Saldo pendiente" : `${cobros.length} cobros registrados`} ir="cuenta" tono={saldo > 0 ? "from-amber-400 to-orange-600" : "from-emerald-400 to-teal-600"} />
              </div>

              {enfP.length > 0 && (
                <div className="rounded-[1.4rem] border border-emerald-200/70 bg-gradient-to-br from-emerald-50/80 via-card to-card p-5 shadow-sm dark:border-emerald-500/20 dark:from-emerald-500/5">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-md"><Syringe className="size-[18px]" /></span>
                    <div className="flex-1">
                      <p className="font-semibold">Enfermería reciente</p>
                      <p className="text-[11px] text-muted-foreground">Lo último que registró enfermería</p>
                    </div>
                    <button onClick={() => setSec("historia")} className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:gap-2">Ver todo <ArrowRight className="size-3" /></button>
                  </div>
                  <ul className="grid gap-2 md:grid-cols-2">
                    {enfP.map((n) => (
                      <li key={n.id} className="rounded-xl bg-card px-3 py-2.5 ring-1 ring-border/60">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className={`rounded-full px-2 py-0.5 font-bold ring-1 ${COLOR_NOTA[n.tipo] ?? COLOR_NOTA["Nota de enfermería"]}`}>{n.tipo}</span>
                          <span className="ml-auto text-muted-foreground">{fechaHora(n.fecha)}</span>
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-sm">{limpiarTextoNota(n.texto)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-[1.4rem] border border-border/60 bg-card p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-700 text-white shadow-md"><Stethoscope className="size-[18px]" /></span>
                    <div className="flex-1">
                      <p className="font-semibold">Últimas consultas</p>
                      <p className="text-[11px] text-muted-foreground">{evols.length} {evols.length === 1 ? "consulta" : "consultas"} en la historia</p>
                    </div>
                    <button onClick={() => setSec("historia")} className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--acc),.1)] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--acc))] transition hover:gap-2">Ver historia <ArrowRight className="size-3" /></button>
                  </div>
                  {evols.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-6 text-center"><NotebookPen className="size-6 text-muted-foreground/60" /><p className="text-sm text-muted-foreground">Sin evoluciones cargadas.</p></div>
                  ) : (
                    <ul className="space-y-2">
                      {evols.slice(0, 3).map((e) => {
                        const dx0 = dxDe(e)[0];
                        return (
                          <li key={e.id} className="flex items-center gap-3 rounded-xl border-l-4 border-indigo-400 bg-secondary/40 px-3 py-2.5 transition hover:bg-secondary/70">
                            <span className="pn-acc-tile flex size-8 shrink-0 items-center justify-center rounded-lg text-white"><Stethoscope className="size-3.5" /></span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{e.motivo || "Consulta"}</p>
                              <p className="truncate text-[11px] text-muted-foreground">{fechaDe(e.fecha)} · {nombreCorto(e.doctor)}{dx0 ? ` · ${dx0.codigo ? `${dx0.codigo} ` : ""}${dx0.descripcion}` : ""}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <div className="rounded-[1.4rem] border border-border/60 bg-card p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-md"><Pill className="size-[18px]" /></span>
                    <div className="flex-1">
                      <p className="font-semibold">Medicación activa</p>
                      <p className="text-[11px] text-muted-foreground">Recetas vigentes y medicación del portal</p>
                    </div>
                    <button onClick={() => abrir("recetas", p.id)} className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--acc),.1)] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--acc))] transition hover:gap-2"><Plus className="size-3" /> Nueva receta</button>
                  </div>
                  {meds.filter((m) => m.activo).length === 0 && recetas.filter((r) => !r.anulada).length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-6 text-center"><Pill className="size-6 text-muted-foreground/60" /><p className="text-sm text-muted-foreground">Sin medicación registrada.</p></div>
                  ) : (
                    <ul className="space-y-2">
                      {meds.filter((m) => m.activo).map((m) => (
                        <li key={m.id} className="rounded-xl border-l-4 border-emerald-400 bg-secondary/40 px-3 py-2.5 text-sm"><span className="font-medium">{m.nombre}</span> <span className="text-muted-foreground">{m.dosis} · {m.horarios.join(" · ")}</span></li>
                      ))}
                      {recetas.filter((r) => !r.anulada).slice(0, 3).flatMap((r) => r.items.map((i, k) => (
                        <li key={`${r.id}-${k}`} className="flex items-center gap-2 rounded-xl border-l-4 border-emerald-400 bg-secondary/40 px-3 py-2.5 text-sm"><Pill className="size-3.5 shrink-0 text-emerald-600" /><span className="font-medium">{i.droga} {i.presentacion}</span> <span className="text-muted-foreground">{i.posologia} · Receta {fechaDe(r.fecha)}</span></li>
                      )))}
                    </ul>
                  )}
                </div>
              </div>
              {ultima?.plan && (
                <div className="rounded-2xl bg-[rgba(var(--acc),.07)] px-4 py-3 text-sm"><span className="font-semibold">Último plan indicado: </span>{ultima.plan}</div>
              )}
            </div>
          )}

          {sec === "historia" && (
            <div className="space-y-4">
              <FichaHC
                soloLectura={soloLectura}
                log={log}
                p={p}
                evols={evols}
                estudios={estudios}
                controles={controles}
                meds={meds.filter((m) => m.activo)}
                nueva={nueva}
                setNueva={setNueva}
                onGuardar={(ev) => {
                  setEvols((prev) => [ev, ...prev]);
                  log("Evolución registrada", ev.paciente);
                  toast.success("Evolución guardada en la historia clínica");
                  setNueva(false);
                }}
                onBorrar={(id) => {
                  setEvols((prev) => prev.filter((e) => e.id !== id));
                  log("Evolución eliminada", p.nombre);
                }}
                user={user}
              />
            </div>
          )}

          {sec === "documentos" && <DocumentosPaciente p={p} user={user} log={log} soloLectura={soloLectura} />}

          {sec === "estudios" && (
            <>
              <Cab t="Estudios" s="Ecocardiogramas, Holter, MAPA, laboratorios e imágenes" accion={<Button size="sm" variant="outline" className="rounded-xl" onClick={() => abrir("pacientes", p.id)}><Plus className="size-3.5" /> Subir desde el portal</Button>} />
              {estudios.length === 0 ? <Vacio icon={ScanLine} texto="Todavía no hay estudios cargados para este paciente." /> : (
                <ul className="space-y-2">
                  {estudios.map((e) => (
                    <Fila key={e.id}>
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 text-white"><ScanLine className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{e.titulo || e.tipo} <span className="text-xs font-normal text-muted-foreground">· {e.tipo}</span></p>
                        {e.informe && <p className="line-clamp-2 text-xs text-muted-foreground">{e.informe}</p>}
                      </div>
                      <span className="text-xs text-muted-foreground">{fechaDe(e.fecha)}</span>
                    </Fila>
                  ))}
                </ul>
              )}
            </>
          )}

          {sec === "laboratorio" && (
            <>
              <SeguimientoLab labs={labs} />
              <Cab t="Laboratorio" s="Pedidos y resultados con valores fuera de rango" accion={<Button size="sm" className="rounded-xl" onClick={() => abrir("laboratorio", p.id)}><Plus className="size-3.5" /> Nuevo pedido</Button>} />
              {labs.length === 0 ? <Vacio icon={FlaskConical} texto="Sin pedidos de laboratorio." /> : (
                <ul className="space-y-3">
                  {labs.map((l) => (
                    <li key={l.id} className="rounded-xl border border-border/60 p-3.5">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                        {l.paneles.map((id) => PANELES_LAB.find((x) => x.id === id)?.nombre).join(", ")}
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${ESTADO_LAB[l.estado]}`}>{l.estado}</span>
                        <span className="ml-auto text-xs font-normal text-muted-foreground">{fechaDe(l.fecha)}</span>
                      </p>
                      {Object.keys(l.resultados).length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {Object.entries(l.resultados).map(([k, v]) => {
                            const d = DET_TODAS.find((x) => x.id === k);
                            if (!d) return null;
                            const f = flagDe(d, v);
                            return <span key={k} className={`rounded-lg px-2 py-1 text-[11px] ring-1 ${f === "ok" ? "bg-secondary/60 ring-border/60" : f === "alto" ? "bg-red-50 font-semibold text-red-700 ring-red-200" : "bg-amber-50 font-semibold text-amber-800 ring-amber-200"}`}>{d.nombre}: {v} {d.unidad}</span>;
                          })}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {sec === "recetas" && (
            <>
              <Cab t="Receta digital" s="Recetas firmadas para este paciente" accion={<Button size="sm" className="rounded-xl" onClick={() => abrir("recetas", p.id)}><PenLine className="size-3.5" /> Nueva receta</Button>} />
              {recetas.length === 0 ? <Vacio icon={Pill} texto="Sin recetas emitidas." /> : (
                <ul className="space-y-2">
                  {recetas.map((r) => (
                    <Fila key={r.id}>
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-700 font-display text-xs italic text-white">Rp</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">N° {String(r.numero).padStart(6, "0")} {r.anulada && <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">Anulada</span>}</p>
                        <p className="truncate text-xs text-muted-foreground">{r.items.map((i) => `${i.droga} ${i.presentacion}`).join(" · ")}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{fechaDe(r.fecha)}</span>
                      <button onClick={() => imprimirHtml(htmlReceta(r, firmas[r.doctorId]))} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Ver</button>
                    </Fila>
                  ))}
                </ul>
              )}
            </>
          )}

          {sec === "medicacion" && (
            <>
              <Cab t="Medicación" s="Plan de medicación del portal y lo recetado" />
              {meds.length === 0 && recetas.length === 0 ? <Vacio icon={Pill} texto="Sin medicación registrada." /> : (
                <ul className="space-y-2">
                  {meds.map((m) => (
                    <Fila key={m.id}>
                      <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${m.activo ? "bg-gradient-to-br from-sky-500 to-blue-700 text-white" : "bg-secondary text-muted-foreground"}`}><Pill className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{m.nombre} <span className="font-normal text-muted-foreground">{m.dosis}</span></p>
                        <p className="text-xs text-muted-foreground">{m.horarios.join(" · ")}{m.indicacion ? ` — ${m.indicacion}` : ""}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.activo ? "bg-emerald-100 text-emerald-800" : "bg-secondary text-muted-foreground"}`}>{m.activo ? "Activa" : "Suspendida"}</span>
                    </Fila>
                  ))}
                  {recetas.filter((r) => !r.anulada).flatMap((r) => r.items.map((i, k) => (
                    <Fila key={`${r.id}-${k}`}>
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-700 text-white"><PenLine className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{i.droga} <span className="font-normal text-muted-foreground">{i.presentacion}</span></p>
                        <p className="text-xs text-muted-foreground">{i.posologia}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">Recetado {fechaDe(r.fecha)}</span>
                    </Fila>
                  )))}
                </ul>
              )}
            </>
          )}

          {sec === "turnos" && (
            <>
              <Cab t="Citas" s={`${misTurnos.length} citas en total`} />
              {misTurnos.length === 0 ? <Vacio icon={CalendarDays} texto="Este paciente todavía no tiene citas." /> : (
                <ul className="space-y-2">
                  {misTurnos.map((t) => (
                    <Fila key={t.id}>
                      <span className={`flex size-9 shrink-0 flex-col items-center justify-center rounded-lg text-white ${t.fecha >= hoy ? "bg-gradient-to-br from-sky-500 to-blue-700" : "bg-slate-400"}`}>
                        <span className="text-[11px] font-bold leading-none">{t.fecha.slice(8, 10)}</span>
                        <span className="text-[8px] uppercase leading-none">{new Date(`${t.fecha}T12:00`).toLocaleDateString("es-CO", { month: "short" })}</span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{hora12(t.hora)} · {t.motivo || "Consulta"}</p>
                        <p className="text-xs text-muted-foreground">{t.doctor}{t.origen ? ` · desde ${t.origen}` : ""}</p>
                      </div>
                      <Estadito estado={t.estado} />
                    </Fila>
                  ))}
                </ul>
              )}
            </>
          )}

          {sec === "cuenta" && (
            <>
              <Cab t="Estado de cuenta" s="Cobros, pagos, saldo y comprobantes" accion={<Button size="sm" variant="outline" className="rounded-xl" onClick={() => abrir("facturacion", p.id)}><Receipt className="size-3.5" /> Facturación</Button>} />
              <div className="mb-4 grid gap-3 sm:grid-cols-3">
                {[
                  { l: "Total cobrado", v: dinero(cobros.reduce((a, c) => a + pagadoDe(c), 0)), c: "text-emerald-700" },
                  { l: "Saldo pendiente", v: dinero(saldo), c: saldo > 0 ? "text-amber-700" : "" },
                  { l: "Comprobantes", v: String(facturas.length), c: "" },
                ].map((x) => (
                  <div key={x.l} className="rounded-xl bg-secondary/40 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{x.l}</p>
                    <p className={`mt-1 font-display text-xl font-semibold tabular-nums ${x.c}`}>{x.v}</p>
                  </div>
                ))}
              </div>
              {cobros.length === 0 && facturas.length === 0 ? <Vacio icon={Wallet} texto="Sin movimientos. Los cobros se registran en Pagos y caja." /> : (
                <ul className="space-y-2">
                  {cobros.map((c) => (
                    <Fila key={c.id}>
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 text-white"><Wallet className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{c.concepto}</p>
                        <p className="text-xs text-muted-foreground">{fechaHora(c.fecha)} · {c.profesional} · {c.obraSocial || "Particular"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">{dinero(pagadoDe(c))}</p>
                        {saldoDe(c) > 0 && <p className="text-[11px] font-semibold text-amber-700">Debe {dinero(saldoDe(c))}</p>}
                      </div>
                    </Fila>
                  ))}
                  {facturas.map((f) => (
                    <Fila key={f.id}>
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-bold">{siglaComp(f.tipo)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{f.tipo} {f.numero}</p>
                        <p className="text-xs text-muted-foreground">{fechaHora(f.fecha)} · {f.cobertura}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${ESTADO_FACT[f.estado]}`}>{f.estado}</span>
                      <p className="text-sm font-semibold tabular-nums">{dinero(f.total)}</p>
                    </Fila>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ ENFERMERÍA – TRIAGE ═══════════════════════ */
/** Niveles de triage (Resolución 5596 de 2015, Colombia). */
const NIVELES_TRIAGE: { id: NivelTriage; nombre: string; desc: string; espera: string; clase: string; punto: string }[] = [
  { id: "I", nombre: "Triage I", desc: "Riesgo vital inmediato", espera: "Atención inmediata", clase: "bg-red-600 text-white ring-red-700", punto: "bg-red-600" },
  { id: "II", nombre: "Triage II", desc: "Riesgo de deterioro rápido", espera: "Hasta 30 min", clase: "bg-orange-500 text-white ring-orange-600", punto: "bg-orange-500" },
  { id: "III", nombre: "Triage III", desc: "Requiere estudios o tratamiento, estable", espera: "Según disponibilidad", clase: "bg-amber-400 text-amber-950 ring-amber-500", punto: "bg-amber-400" },
  { id: "IV", nombre: "Triage IV", desc: "Sin riesgo de deterioro", espera: "Consulta prioritaria", clase: "bg-emerald-500 text-white ring-emerald-600", punto: "bg-emerald-500" },
  { id: "V", nombre: "Triage V", desc: "Problema crónico o consulte programada", espera: "Consulta programada", clase: "bg-sky-500 text-white ring-sky-600", punto: "bg-sky-500" },
];
const nivelTriage = (n?: NivelTriage) => NIVELES_TRIAGE.find((x) => x.id === n);
function fueraSpo2(v?: number) {
  return v !== undefined && v < 94;
}

/** Chips de signos vitales, para triage y evoluciones. */
function ChipsSignos({ s }: { s: Triage["signos"] }) {
  const pr = s.sistolica && s.diastolica ? clasificarPresion(s.sistolica, s.diastolica) : null;
  const im = calcularImc(s.peso, s.talla);
  return (
    <div className="flex flex-wrap gap-1.5 text-xs">
      {pr && <span className={`rounded-full px-2.5 py-1 font-semibold ring-1 ${TONO_HC[pr.tono]}`}>TA {s.sistolica}/{s.diastolica} · {pr.nivel}</span>}
      {s.pulso !== undefined && <span className={`rounded-full px-2.5 py-1 ring-1 ${fueraDeRango("fc", s.pulso) ? TONO_HC["ambar"] : TONO_HC["gris"]}`}>FC {s.pulso} lpm</span>}
      {s.fr !== undefined && <span className={`rounded-full px-2.5 py-1 ring-1 ${fueraDeRango("fr", s.fr) ? TONO_HC["ambar"] : TONO_HC["gris"]}`}>FR {s.fr} rpm</span>}
      {s.temp !== undefined && <span className={`rounded-full px-2.5 py-1 ring-1 ${fueraDeRango("temp", s.temp) ? TONO_HC["ambar"] : TONO_HC["gris"]}`}>T° {s.temp} °C</span>}
      {s.spo2 !== undefined && <span className={`rounded-full px-2.5 py-1 ring-1 ${fueraSpo2(s.spo2) ? TONO_HC["ambar"] : TONO_HC["gris"]}`}>SpO₂ {s.spo2}%</span>}
      {s.peso !== undefined && <span className={`rounded-full px-2.5 py-1 ring-1 ${TONO_HC["gris"]}`}>Peso {s.peso} kg</span>}
      {s.talla !== undefined && <span className={`rounded-full px-2.5 py-1 ring-1 ${TONO_HC["gris"]}`}>Talla {s.talla} cm</span>}
      {im && <span className={`rounded-full px-2.5 py-1 font-semibold ring-1 ${TONO_HC[im.tono]}`}>IMC {im.valor} · {im.texto}</span>}
    </div>
  );
}

/** Grilla de signos vitales (enfermería → historia clínica). */
function GrillaSignos({ s, compacta = false }: { s: Triage["signos"]; compacta?: boolean }) {
  const pr = s.sistolica && s.diastolica ? clasificarPresion(s.sistolica, s.diastolica) : null;
  const im = calcularImc(s.peso, s.talla);
  const celdas: { l: string; v: string; u?: string; alerta?: boolean; tono?: string }[] = [
    { l: "Presión arterial", v: s.sistolica && s.diastolica ? `${s.sistolica}/${s.diastolica}` : "—", u: "mmHg", ...(pr ? { tono: pr.tono } : {}) },
    { l: "Frec. cardíaca", v: s.pulso !== undefined ? String(s.pulso) : "—", u: "lpm", alerta: fueraDeRango("fc", s.pulso) },
    { l: "Frec. respiratoria", v: s.fr !== undefined ? String(s.fr) : "—", u: "rpm", alerta: fueraDeRango("fr", s.fr) },
    { l: "Temperatura", v: s.temp !== undefined ? String(s.temp) : "—", u: "°C", alerta: fueraDeRango("temp", s.temp) },
    { l: "Talla", v: s.talla !== undefined ? String(s.talla) : "—", u: "cm" },
    { l: "Peso", v: s.peso !== undefined ? String(s.peso) : "—", u: "kg" },
    { l: "IMC", v: im ? String(im.valor) : "—", u: "kg/m²", ...(im ? { tono: im.tono } : {}) },
    { l: "Clasificación IMC", v: im ? im.texto : "—", ...(im ? { tono: im.tono } : {}) },
  ];
  return (
    <div className={`grid grid-cols-2 overflow-hidden rounded-2xl border border-border/70 bg-card sm:grid-cols-4 ${compacta ? "text-xs" : ""}`}>
      {celdas.map((c, i) => (
        <div key={c.l} className={`border-border/60 px-3.5 py-2.5 ${i % 2 === 1 ? "border-l" : ""} ${i % 4 !== 0 ? "sm:border-l" : "sm:border-l-0"} ${i >= 2 ? "border-t" : ""} ${i >= 4 ? "sm:border-t" : "sm:border-t-0"}`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{c.l}</p>
          <p className={`mt-0.5 font-semibold tabular-nums ${compacta ? "text-sm" : "text-base"}`}>
            {c.tono && c.v !== "—" ? (
              <span className={`inline-flex rounded-full px-2 py-0.5 ring-1 ${TONO_HC[c.tono]}`}>{c.v}{c.u && c.l !== "Clasificación IMC" ? <span className="ml-1 text-[10px] font-normal opacity-80">{c.u}</span> : null}</span>
            ) : (
              <span className={c.alerta ? "text-amber-600" : ""}>
                {c.v}
                {c.u && c.v !== "—" && <span className="ml-1 text-[11px] font-normal text-muted-foreground">{c.u}</span>}
              </span>
            )}
          </p>
          {c.l === "Presión arterial" && pr && <p className="mt-0.5 text-[10px] text-muted-foreground">{pr.nivel}</p>}
        </div>
      ))}
    </div>
  );
}

/** Ventana de toma de signos vitales (se abre desde la card «Turnos de hoy»). */
function VentanaSignos({ user, log, turnos, soloLectura, onCerrar, inicial = "" }: { user: SessionUser; log: LogFn; turnos: Turno[]; soloLectura: boolean; onCerrar: () => void; inicial?: string }) {
  const pacientes = usePacientesClinica(turnos);
  const [triages, setTriages] = useDato<Triage[]>(KEY_TRIAGE, []);
  const [pacId, setPacId] = useState("");
  const esMedicoV = false; // los médicos (dueños) también pueden registrar
  const bloqueado = soloLectura || esMedicoV;
  const vacio = { s: "", d: "", fc: "", fr: "", temp: "", peso: "", talla: "" };
  const [f, setF] = useState(vacio);
  const set = (k: keyof typeof vacio) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = prev;
    };
  }, [onCerrar]);

  const hoyIso = isoDe(new Date());
  const deHoy = triages.filter((t) => diaLocal(t.fecha) === hoyIso);
  const turnosHoy = turnos.filter((t) => t.fecha === hoyIso && t.estado !== "Cancelado").sort((a, b) => a.hora.localeCompare(b.hora));
  const esDe = (p: PacienteHC, id: string) => id === p.id || id === p.portalId;
  const pacDeTurno = (t: Turno) => pacientes.find((p) => (t.pacienteId && esDe(p, t.pacienteId)) || norm(p.nombre) === norm(t.paciente));
  const triageHoyDe = (p?: PacienteHC) => (p ? deHoy.find((x) => esDe(p, x.pacienteId)) : undefined);
  const pac = pacientes.find((p) => p.id === pacId);
  const previos = pac ? triages.filter((t) => esDe(pac, t.pacienteId)).sort((a, b) => b.fecha.localeCompare(a.fecha)) : [];
  const imc = calcularImc(num(f.peso), num(f.talla));
  const pr = num(f.s) && num(f.d) ? clasificarPresion(num(f.s)!, num(f.d)!) : null;

  const elegir = (id: string) => {
    setPacId(id);
    const p = pacientes.find((x) => x.id === id);
    const ult = p ? triages.filter((t) => esDe(p, t.pacienteId) && t.signos.talla).sort((a, b) => b.fecha.localeCompare(a.fecha))[0] : undefined;
    setF({ ...vacio, talla: ult?.signos.talla ? String(ult.signos.talla) : "" });
  };
  useEffect(() => {
    if (inicial) elegir(inicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const guardar = (e: FormEvent) => {
    e.preventDefault();
    if (esMedicoV) { toast.error("Los signos vitales los registra enfermería"); return; }
    if (soloLectura) { toast.error("Su permiso en Enfermería – Triage es solo de lectura"); return; }
    if (!pac) { toast.error("Seleccione un paciente"); return; }
    const signos = { sistolica: num(f.s), diastolica: num(f.d), pulso: num(f.fc), fr: num(f.fr), temp: num(f.temp), peso: num(f.peso), talla: num(f.talla), imc: imc?.valor };
    if (Object.values(signos).every((v) => v === undefined)) { toast.error("Registre al menos un signo vital"); return; }
    const t = JSON.parse(JSON.stringify({ id: nuevoId(), pacienteId: pac.id, paciente: pac.nombre, fecha: new Date().toISOString(), enfermeraId: user.id, enfermera: user.nombre, signos })) as Triage;
    setTriages((prev) => [t, ...prev]);
    log("Signos vitales registrados", pac.nombre);
    toast.success(`Signos vitales de ${pac.nombre} guardados en su Historia Clínica.`);
    setPacId("");
    setF(vacio);
  };

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Toma de signos vitales">
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm animate-in fade-in duration-200" onClick={onCerrar} />
      <div className="pn-root relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-[1.75rem] bg-background shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 sm:rounded-[1.75rem]">
        {/* Encabezado */}
        <div className="relative flex items-center justify-between gap-3 overflow-hidden gradient-deep px-6 py-5 text-white">
          <div className="pn-orb pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25"><Syringe className="size-5" /></span>
            <div>
              <h2 className="font-display text-xl font-semibold">Toma de signos vitales</h2>
              <p className="text-xs text-white/75"><span className="inline-block first-letter:uppercase">{new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}</span> · {nombreCorto(user.nombre)}</p>
            </div>
          </div>
          <button onClick={onCerrar} aria-label="Cerrar" className="relative flex size-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 transition hover:bg-white/20"><X className="size-5" /></button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[320px_minmax(0,1fr)] lg:overflow-hidden">
          {/* Pacientes de hoy */}
          <aside className="dark flex min-h-0 flex-col border-b border-white/10 bg-gradient-to-b from-[#0b1d4a] via-[#0a1838] to-[#081229] p-4 text-foreground lg:border-b-0 lg:border-r">
            <p className="flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">Citas de hoy <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] tracking-normal text-white">{turnosHoy.length}</span></p>
            <ul className="pn-noscroll mt-2 max-h-64 space-y-1.5 overflow-y-auto lg:max-h-none lg:flex-1">
              {turnosHoy.map((t) => {
                const p = pacDeTurno(t);
                const tr = triageHoyDe(p);
                const on = !!p && p.id === pacId;
                return (
                  <li key={t.id}>
                    <button
                      disabled={!p}
                      onClick={() => p && elegir(p.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left transition-all ${on ? "bg-white/12 shadow-lg ring-1 ring-sky-400/60" : "hover:bg-white/[0.06]"}`}
                    >
                      <HoraMini hora={t.hora} activo={on} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white">{nombreCorto(t.paciente)}</span>
                        <span className="block truncate text-[11px] text-white/55">{(t.motivo || "Consulta").split(" · ")[0]} · {nombreCorto(t.doctor).replace(/^Dr\. Carlos /, "Dr. ")}</span>
                      </span>
                      {tr ? (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${tr.evolucionId ? "bg-violet-100 text-violet-700 ring-violet-200" : "bg-emerald-100 text-emerald-800 ring-emerald-200"}`}>{tr.evolucionId ? "Atendido" : "Tomados"}</span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200">Pendiente</span>
                      )}
                    </button>
                  </li>
                );
              })}
              {turnosHoy.length === 0 && <li className="px-2 py-6 text-center text-sm text-muted-foreground">No hay citas para hoy.</li>}
            </ul>
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">Otro paciente</p>
              <SelectorPaciente pacientes={pacientes} valor={pacId} onChange={elegir} arriba />
            </div>
          </aside>

          {/* Formulario */}
          <form onSubmit={guardar} className="flex min-h-0 flex-col lg:overflow-y-auto">
            {!pac ? (
              <div className="flex flex-1 items-center justify-center p-8">
                <Vacio icon={Users} titulo="Elija un paciente" texto="Seleccione una cita de hoy o busque otro paciente para registrar sus signos vitales." />
              </div>
            ) : (
              <div className="flex-1 space-y-6 p-6">
                <div className="flex flex-wrap items-center gap-4">
                  <Avatar nombre={pac.nombre} size="size-12" />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold">{pac.nombre}</p>
                    <p className="text-xs text-muted-foreground">{[pac.dni ? `C.C. ${pac.dni}` : null, edadDe(pac.ficha?.nacimiento) !== null ? `${edadDe(pac.ficha?.nacimiento)} años` : null, pac.ficha?.obraSocial].filter(Boolean).join(" · ") || "Sin datos de ficha"}</p>
                  </div>
                  {pac.ficha?.alergias && <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200"><AlertTriangle className="size-3.5" /> Alergias: {pac.ficha.alergias}</span>}
                </div>

                {esMedicoV && (
                  <div className="flex items-center gap-2.5 rounded-xl bg-amber-50 px-4 py-2.5 text-xs text-amber-900 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/30">
                    <Lock className="size-4 shrink-0" /> Solo el personal de enfermería puede cargar signos vitales. Como médico los ve en la Historia Clínica al iniciar la evolución.
                  </div>
                )}
                <fieldset disabled={bloqueado} className={`min-w-0 border-0 p-0 ${bloqueado ? "pointer-events-none opacity-60" : ""}`}>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  <div className="col-span-2 md:col-span-1">
                    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Presión arterial</span>
                    <div className="flex items-center gap-2">
                      <input inputMode="numeric" aria-label="TA sistólica" value={f.s} onChange={set("s")} placeholder="120" className={inp + " text-center tabular-nums"} />
                      <span className="text-lg font-semibold text-muted-foreground">/</span>
                      <input inputMode="numeric" aria-label="TA diastólica" value={f.d} onChange={set("d")} placeholder="80" className={inp + " text-center tabular-nums"} />
                      <span className="text-xs text-muted-foreground">mmHg</span>
                    </div>
                  </div>
                  <CampoVital value={f.fc} onChange={set("fc")} l="Frecuencia cardíaca" u="lpm" ph="72" alerta={fueraDeRango("fc", num(f.fc))} />
                  <CampoVital value={f.fr} onChange={set("fr")} l="Frecuencia respiratoria" u="rpm" ph="16" alerta={fueraDeRango("fr", num(f.fr))} />
                  <CampoVital value={f.temp} onChange={set("temp")} l="Temperatura" u="°C" ph="36.5" alerta={fueraDeRango("temp", num(f.temp))} />
                  <CampoVital value={f.talla} onChange={set("talla")} l="Talla" u="cm" ph="170" />
                  <CampoVital value={f.peso} onChange={set("peso")} l="Peso" u="kg" ph="70" />
                </div>
                </fieldset>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className={`rounded-2xl p-4 ring-1 transition-colors ${imc ? TONO_HC[imc.tono] : "bg-secondary/60 ring-border"}`}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-80">Índice de masa corporal</p>
                    <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{imc ? imc.valor : "—"} <span className="text-sm font-normal opacity-70">{imc ? "kg/m²" : ""}</span></p>
                    <p className="text-sm font-semibold">{imc ? imc.texto : "Ingrese talla y peso"}</p>
                  </div>
                  <div className="rounded-2xl bg-secondary/40 p-4 ring-1 ring-border/70">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Clasificación del IMC (OMS)</p>
                    <ul className="space-y-1 text-xs">
                      {[["< 18,5", "Bajo peso"], ["18,5 – 24,9", "Peso normal"], ["25 – 29,9", "Sobrepeso"], ["30 – 34,9", "Obesidad grado I"], ["35 – 39,9", "Obesidad grado II"], ["≥ 40", "Obesidad grado III"]].map(([r, t]) => (
                        <li key={t} className={`flex justify-between rounded-md px-2 py-0.5 ${imc?.texto === t ? "bg-[rgba(var(--acc),.12)] font-semibold text-foreground" : "text-muted-foreground"}`}><span>{t}</span><span className="tabular-nums">{r}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
                {pr && <p className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${TONO_HC[pr.tono]}`}>Presión arterial: {pr.nivel}</p>}

                {previos.length > 0 && (
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Última medición · {fechaHora(previos[0]!.fecha)} · {previos[0]!.enfermera}</p>
                    <GrillaSignos s={previos[0]!.signos} compacta />
                  </div>
                )}
              </div>
            )}
            <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-secondary/60 px-6 py-4 backdrop-blur">
              <p className="text-xs text-muted-foreground">{esMedicoV ? "Vista de consulta: los signos vitales los carga únicamente el personal de enfermería." : `Se guarda a nombre de ${user.nombre}, con fecha y hora, en la Historia Clínica del paciente.`}</p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="rounded-xl" onClick={onCerrar}>Cerrar</Button>
                {!bloqueado && <Button type="submit" disabled={!pac} className="rounded-xl px-6"><Check className="size-4" /> Guardar signos vitales</Button>}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function TriageTab({ user, log, turnos, esMedico, abrirHistoria, soloLectura = false }: { user: SessionUser; log: LogFn; turnos: Turno[]; esMedico: boolean; abrirHistoria: (pacienteId: string) => void; soloLectura?: boolean }) {
  const [triages] = useDato<Triage[]>(KEY_TRIAGE, []);
  const [ventana, setVentana] = useState(false);
  const [pacSignos, setPacSignos] = useState("");
  const pacientes = usePacientesClinica(turnos);
  const hoyIso = isoDe(new Date());
  const deHoy = triages.filter((t) => diaLocal(t.fecha) === hoyIso).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const turnosHoy = turnos.filter((t) => t.fecha === hoyIso && t.estado !== "Cancelado");
  const esDe = (p: PacienteHC, id: string) => id === p.id || id === p.portalId;
  const sinSignos = turnosHoy.filter((t) => {
    const p = pacientes.find((x) => (t.pacienteId && esDe(x, t.pacienteId)) || norm(x.nombre) === norm(t.paciente));
    return !p || !deHoy.some((x) => esDe(p, x.pacienteId));
  }).length;

  return (
    <div className="space-y-6">
      <AccionesEnfermeria user={user} log={log} turnos={turnos} pacientes={pacientes} citasHoy={turnosHoy.length} sinSignos={sinSignos} soloLectura={soloLectura} abrirSignos={(id) => { setPacSignos(id ?? ""); setVentana(true); }} abrirHistoria={abrirHistoria} />

      <div className="hidden">
        <Kpi
          icon={CalendarDays}
          label="Citas de hoy"
          value={String(turnosHoy.length)}
          hint={turnosHoy.length ? `${sinSignos} sin signos vitales · toque para registrar` : "Toque para registrar signos vitales"}
          tono="verde"
          onClick={() => setVentana(true)}
          accion="Tomar signos vitales"
        />
      </div>

      {ventana && <VentanaSignos user={user} log={log} turnos={turnos} soloLectura={soloLectura} inicial={pacSignos} onCerrar={() => setVentana(false)} />}

      <ProcedimientosHoy user={user} log={log} turnos={turnosHoy} pacientes={pacientes} soloLectura={soloLectura} />

      <RegistrosEnfHoy pacientes={pacientes} esMedico={esMedico} abrirHistoria={abrirHistoria} user={user} log={log} soloLectura={soloLectura} />

      <Seccion icon={ClipboardList} titulo="Signos vitales registrados hoy" sub={`${deHoy.length} ${deHoy.length === 1 ? "registro" : "registros"} · quedan en la Historia Clínica de cada paciente`}>
        {deHoy.length === 0 ? (
          <Vacio icon={Activity} texto="Todavía no se registraron signos vitales hoy. Toque «Citas de hoy» para empezar." />
        ) : (
          <ul className="space-y-3">
            {deHoy.map((t) => (
              <li key={t.id} className="rounded-2xl border border-border/70 bg-card p-4">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <Avatar nombre={t.paciente} size="size-10" />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 truncate font-semibold">{t.paciente}{(() => { const al = pacientes.find((x) => esDe(x, t.pacienteId))?.ficha?.alergias; return al ? <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 ring-1 ring-red-200"><AlertTriangle className="size-3" /> Alergia: {al}</span> : null; })()}</p>
                    <p className="text-[11px] text-muted-foreground">{horaDeIso(t.fecha)} · {t.enfermera}</p>
                  </div>
                  {t.evolucionId ? (
                    <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-200">Atendido · {nombreCorto(t.atendidoPor ?? "")}</span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200">Esperando médico</span>
                  )}
                  {esMedico && <Button size="sm" className="rounded-xl" onClick={() => abrirHistoria(t.pacienteId)}><FileText className="size-3.5" /> Atender</Button>}
                </div>
                <GrillaSignos s={t.signos} compacta />
              </li>
            ))}
          </ul>
        )}
      </Seccion>

      {user.rol === "medico" && <PersonalEquipo user={user} log={log} areaFija="Enfermería" />}
    </div>
  );
}

/** Alta del personal de cada departamento, con link de invitación para crear la contraseña (solo médicos). */
function PersonalEquipo({ user, log, areaFija }: { user: SessionUser; log: LogFn; areaFija?: string }) {
  const [lista, setLista] = useDato<Personal[]>(KEY_ENFERMERIA, []);
  const [nombre, setNombre] = useState("");
  const [doc, setDoc] = useState("");
  const [area, setArea] = useState(areaFija ?? AREAS[0]!.nombre);
  const [nuevoLink, setNuevoLink] = useState<string | null>(null);
  const [, refrescar] = useState(0);
  const [permisos, setPermisos] = useDato<Permisos>("gb_permisos", SEED_PERMISOS);
  const [verPermisos, setVerPermisos] = useState<string | null>(null);
  const puedePermisos = user.rol === "medico";
  const propios = (id: string) => permisos[clavePersona(id)];
  const cambiarNivel = (n: Personal, m: string, nivel: Nivel) => {
    const base = nivelDe(permisos, areaDe(n), m);
    setPermisos((p) => {
      const actual = { ...(p[clavePersona(n.id)] ?? {}) };
      if (nivel === base) delete actual[m];
      else actual[m] = nivel;
      const out = { ...p };
      if (Object.keys(actual).length) out[clavePersona(n.id)] = actual;
      else delete out[clavePersona(n.id)];
      return out;
    });
    log("Permiso personal cambiado", `${n.nombre} · ${m}: ${nivel === "ninguno" ? "sin acceso" : nivel}`);
  };
  const volverAlArea = (n: Personal) => {
    setPermisos((p) => { const out = { ...p }; delete out[clavePersona(n.id)]; return out; });
    log("Permisos personales quitados", `${n.nombre} · vuelve a los de ${areaDe(n)}`);
    toast.success(`${n.nombre.split(" ")[0]} vuelve a tener los permisos de ${areaDe(n)}.`);
  };
  const origen = typeof window === "undefined" ? "" : window.location.origin;
  const visibles = (areaFija ? lista.filter((x) => areaDe(x) === areaFija) : lista).slice().sort((a, b) => areaDe(a).localeCompare(areaDe(b)) || a.nombre.localeCompare(b.nombre));
  const vmPer = useVerMas(visibles, 5);

  const mensaje = (p: Personal) =>
    `Hola ${p.nombre.replace(/^(Enf\.|Lic\.|Sr\.|Sra\.)\s*/i, "").split(" ")[0]}, le damos acceso al panel del Centro HEGO como ${areaDe(p)}.\n\nEntre a este link y cree su contraseña:\n${linkInvitacion(p, origen)}`;
  const copiar = async (p: Personal) => {
    try {
      await navigator.clipboard.writeText(linkInvitacion(p, origen));
      toast.success("Link copiado");
    } catch {
      setNuevoLink(linkInvitacion(p, origen));
    }
  };

  const agregar = (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    const n = JSON.parse(JSON.stringify({ id: `enf-${nuevoId()}`, nombre: nombre.trim(), documento: doc.trim() || undefined, area, activo: true, creado: new Date().toISOString(), creadoPor: user.nombre, invitacion: nuevoTokenInvitacion() })) as Personal;
    setLista((p) => [...p, n]);
    log("Acceso al panel creado", `${n.nombre} · ${area}`);
    setNuevoLink(linkInvitacion(n, origen));
    toast.success("Listo. Envíele el link para que cree su contraseña.");
    setNombre("");
    setDoc("");
  };
  const nuevaInvitacion = (p: Personal) => {
    borrarClave(p.id);
    const act = { ...p, invitacion: nuevoTokenInvitacion() };
    setLista((l) => l.map((x) => (x.id === p.id ? act : x)));
    setNuevoLink(linkInvitacion(act, origen));
    log("Link de invitación nuevo", `${p.nombre} · ${areaDe(p)}`);
    toast.success("Se generó un link nuevo. El anterior ya no sirve.");
  };

  return (
    <Seccion
      icon={UserCog}
      titulo={areaFija ? `Personal de ${areaFija.toLowerCase()}` : "Personal y accesos"}
      sub={areaFija ? "Alta del equipo y link para que cada persona cree su contraseña" : "Cada persona entra con los permisos de su departamento"}
    >
      <form onSubmit={agregar} className={`mb-5 grid gap-3 ${areaFija ? "sm:grid-cols-[1fr_200px_auto]" : "sm:grid-cols-2 lg:grid-cols-[1fr_180px_220px_auto]"}`}>
        <input value={nombre} onChange={(e) => setNombre(nombrePropio(e.target.value))} placeholder="Nombre y apellido" className={inp} />
        <input value={doc} onChange={(e) => setDoc(e.target.value)} placeholder="Cédula (opcional)" className={inp} />
        {!areaFija && (
          <select value={area} onChange={(e) => setArea(e.target.value)} className={inp} aria-label="Departamento">
            <optgroup label="Especialidades médicas (médicos invitados)">{ESPECIALIDADES_MED.map((a) => <option key={a.nombre}>{a.nombre}</option>)}</optgroup>
            <optgroup label="Áreas de la clínica">{AREAS.map((a) => <option key={a.nombre}>{a.nombre}</option>)}</optgroup>
          </select>
        )}
        <Button type="submit" className="h-11 rounded-xl"><Plus className="size-4" /> Dar acceso</Button>
      </form>

      {nuevoLink && (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/25 dark:bg-emerald-500/10">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Link de invitación listo</p>
          <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-300/80">La persona lo abre, crea su contraseña y entra. Sirve una sola vez.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <input readOnly value={nuevoLink} onFocus={(e) => e.currentTarget.select()} className={inp + " h-10 min-w-0 flex-1 font-mono text-xs"} />
            <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={() => { void navigator.clipboard?.writeText(nuevoLink).then(() => toast.success("Link copiado")); }}>Copiar</Button>
            <Button type="button" variant="ghost" className="h-10 rounded-xl" onClick={() => setNuevoLink(null)}>Cerrar</Button>
          </div>
        </div>
      )}

      {visibles.length === 0 ? (
        <Vacio icon={UserCog} texto="Todavía no hay personal con acceso. Dele acceso arriba y envíele el link de invitación." />
      ) : (
        <ul className="divide-y divide-border/60">
          {vmPer.items.map((n) => {
            const conClave = tieneClave(n.id);
            const estado = !n.activo ? "Bloqueado" : conClave ? "Activo" : "Invitación pendiente";
            return (
              <li key={n.id} className="py-3">
               <div className="flex flex-wrap items-center gap-3">
                <Avatar nombre={n.nombre} size="size-9" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{n.nombre} {!areaFija && <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{areaDe(n)}</span>}{propios(n.id) && <span className="ml-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700 ring-1 ring-violet-200">Permisos personalizados</span>}</p>
                  <p className="text-xs text-muted-foreground">{n.documento ? `C.C. ${n.documento} · ` : ""}Alta {fechaHora(n.creado)} por {nombreCorto(n.creadoPor)}</p>
                  {(() => {
                    const mods = MODULOS.map((m) => ({ m, nv: nivelPersona(permisos, n.id, areaDe(n), m) })).filter((x) => x.nv !== "ninguno");
                    return (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        {mods.length === 0 && <span className="text-[11px] text-rose-600">No ve ningún módulo</span>}
                        {mods.map(({ m, nv }) => (
                          <span key={m} title={nv === "editar" ? "Puede ver y modificar" : "Solo ver"} className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${nv === "editar" ? "bg-[rgba(var(--acc),.12)] text-[rgb(var(--acc))]" : "bg-secondary text-muted-foreground"}`}>
                            {nv === "editar" ? <Pencil className="size-2.5" /> : <Eye className="size-2.5" />} {m}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                <button onClick={() => setVerPermisos(verPermisos === n.id ? null : n.id)} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${verPermisos === n.id ? "pn-acc-tile text-white" : "bg-[rgba(var(--acc),.1)] text-[rgb(var(--acc))] hover:bg-[rgba(var(--acc),.18)]"}`}>
                  <ShieldCheck className="size-3.5" /> Permisos
                </button>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${estado === "Activo" ? "bg-emerald-100 text-emerald-800 ring-emerald-200" : estado === "Bloqueado" ? "bg-red-100 text-red-700 ring-red-200" : "bg-amber-100 text-amber-800 ring-amber-200"}`}>{estado}</span>
                {n.activo && !conClave && n.invitacion && (
                  <>
                    <button onClick={() => void copiar(n)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Copiar link</button>
                    <a href={`https://wa.me/?text=${encodeURIComponent(mensaje(n))}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"><Send className="size-3.5" /> Enviar por WhatsApp</a>
                  </>
                )}
                {n.activo && conClave && (
                  <>
                    <button onClick={() => { void navigator.clipboard?.writeText(`${origen}/login`).then(() => toast.success("Link del panel copiado")); }} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Copiar link del panel</button>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`Hola ${n.nombre.split(" ")[0]}, este es el link para entrar al panel de HEGO: ${origen}/login (en "Equipo" elija su nombre y ponga su contraseña).`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"><Send className="size-3.5" /> WhatsApp</a>
                  </>
                )}
                {n.activo && conClave && (
                  <button
                    title="Si perdió o cambió el celular: la próxima vez que entre configura la verificación de nuevo"
                    onClick={async () => {
                      if (!(await preguntar({ tono: "aviso", titulo: "¿Restablecer la verificación en dos pasos?", texto: `${n.nombre} la configura de nuevo al entrar. Úselo si perdió o cambió el celular.`, aceptar: "Restablecer" }))) return;
                      const r = await restablecer2fa(n.id);
                      if (!r.ok) return toast.error(r.error);
                      log("Restableció la verificación en dos pasos", n.nombre);
                      toast.success("Listo. Ya puede entrar solo con su contraseña y volver a activarla.");
                    }}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    Perdió el celular
                  </button>
                )}
                {n.activo && (conClave || !n.invitacion) && (
                  <button onClick={() => { nuevaInvitacion(n); refrescar((x) => x + 1); }} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">{conClave ? "Reiniciar contraseña" : "Generar link"}</button>
                )}
                <button onClick={() => { setLista((p) => p.map((x) => (x.id === n.id ? { ...x, activo: !x.activo } : x))); log(n.activo ? "Acceso bloqueado" : "Acceso habilitado", `${n.nombre} · ${areaDe(n)}`); }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[rgb(var(--acc))] hover:bg-[rgba(var(--acc),.08)]">
                  {n.activo ? "Bloquear" : "Habilitar"}
                </button>
               </div>
                {verPermisos === n.id && (
                  <div className="mt-3 rounded-2xl border border-border/70 bg-secondary/30 p-4 animate-in fade-in slide-in-from-top-1 duration-200 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">Permisos de {n.nombre.split(" ")[0]}</p>
                        <p className="text-xs text-muted-foreground">Arranca con los de <b>{areaDe(n)}</b>. Si cambia algo, vale solo para esta persona. Lo distinto al departamento se marca en violeta.</p>
                      </div>
                      {puedePermisos && propios(n.id) && <Button size="sm" variant="outline" className="rounded-lg" onClick={() => volverAlArea(n)}><RefreshCw className="size-3.5" /> Volver a los de {areaDe(n)}</Button>}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {MODULOS.map((m) => {
                        const nv = nivelPersona(permisos, n.id, areaDe(n), m);
                        const distinto = propios(n.id)?.[m] !== undefined;
                        return (
                          <div key={m} className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 ring-1 ${distinto ? "bg-violet-50 ring-violet-200 dark:bg-violet-500/10 dark:ring-violet-500/30" : "bg-card ring-border/70 dark:ring-white/10"}`}>
                            <span className="min-w-0 truncate text-xs font-medium">{m}</span>
                            <div className="flex shrink-0 rounded-lg bg-secondary p-0.5 dark:bg-white/5">
                              {(["ninguno", "ver", "editar"] as Nivel[]).map((op) => (
                                <button key={op} type="button" disabled={!puedePermisos} onClick={() => cambiarNivel(n, m, op)}
                                  className={`rounded-md px-2 py-1 text-[10px] font-semibold transition ${nv === op ? (op === "ninguno" ? "bg-slate-500 text-white" : op === "ver" ? "bg-sky-500 text-white" : "bg-emerald-500 text-white") : "text-muted-foreground hover:text-foreground"} disabled:cursor-not-allowed`}>
                                  {op === "ninguno" ? "No" : op === "ver" ? "Ver" : "Editar"}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {!puedePermisos && <p className="mt-3 text-xs text-muted-foreground">Solo los médicos administradores pueden cambiar permisos.</p>}
                  </div>
                )}
              </li>
            );
          })}
          {vmPer.boton && <li className="list-none">{vmPer.boton}</li>}
        </ul>
      )}
      <p className="mt-4 text-[11px] text-muted-foreground">{areaFija ? `Los módulos que ve se configuran en Permisos y accesos → ${areaFija}.` : "Cada persona tiene los permisos de su departamento. Con el botón Permisos puede ver y cambiar los de una persona en particular."}</p>
    </Seccion>
  );
}

/** Agenda en solo lectura (para áreas con permiso "Ver" en Turnos). */
function TurnosLectura({ turnos }: { turnos: Turno[] }) {
  const [dia, setDia] = useState(hoy());
  const lista = turnos.filter((t) => t.fecha === dia).sort((a, b) => a.hora.localeCompare(b.hora));
  return (
    <Seccion
      icon={CalendarDays}
      titulo="Agenda del día"
      sub="Solo lectura"
      acciones={<DiaNav dia={dia} setDia={setDia} />}
    >
      {lista.length === 0 ? (
        <Vacio icon={CalendarDays} titulo="Día libre" texto="No hay citas para este día." />
      ) : (
        <ul className="space-y-2.5">
          {lista.map((t) => (
            <li key={t.id} className={`group relative flex flex-wrap items-center gap-3.5 overflow-hidden rounded-2xl border border-border/70 bg-card p-3 pr-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 ${t.estado === "Cancelado" ? "opacity-60" : ""}`}>
              <span className={`absolute inset-y-0 left-0 w-1 ${ESTADO_DOT[t.estado]}`} />
              <HoraChip hora={t.hora} className="ml-1" />
              <Avatar nombre={t.paciente} size="size-10" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{nombreCorto(t.paciente)}</p>
                <p className="truncate text-xs text-muted-foreground"><span className="font-medium text-foreground/70">{(t.motivo || "Consulta").split(" · ")[0]}</span>{t.motivo?.includes(" · ") ? ` · ${t.motivo.split(" · ").slice(1).join(" · ")}` : ""} · {nombreCorto(t.doctor)}</p>
              </div>
              <Estadito estado={t.estado} />
            </li>
          ))}
        </ul>
      )}
    </Seccion>
  );
}


/* ===================================================================== */
/* Sitio web: contacto, horario de la clínica y música de espera           */
/* ===================================================================== */

const MAX_AUDIO_MB = 4;
const DIAS_ORDEN = [1, 2, 3, 4, 5, 6, 0];

function SitioTab({ log }: { log: LogFn }) {
  const [guardado, setGuardado] = useDato<Partial<DatosSitio>>(KEY_SITIO, {});
  const base = sitioDe(guardado);
  const [d, setD] = useState<DatosSitio>(base);
  const firma = JSON.stringify(base);
  useEffect(() => {
    setD(sitioDe(guardado));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firma]);
  const cambios = JSON.stringify(d) !== firma;
  const set = (patch: Partial<DatosSitio>) => setD((x) => ({ ...x, ...patch }));
  const setDia = (dia: number, patch: Partial<DiaClinica>) => set({ semana: d.semana.map((x) => (x.dia === dia ? { ...x, ...patch } : x)) });
  const [nueva, setNueva] = useState({ nombre: "", sub: "", url: "" });
  const [cargando, setCargando] = useState(false);

  const guardar = () => {
    for (const x of d.semana) if (x.abierto && x.desde >= x.hasta) { toast.error(`Revise el horario del ${NOMBRES_DIA[x.dia]}`); return; }
    try {
      setGuardado(() => d);
      log("Sitio web actualizado", "Contacto, horarios y música");
      toast.success("Cambios publicados en la web.");
    } catch {
      toast.error("No hay espacio suficiente en este navegador. Use un enlace en lugar de subir el audio.");
    }
  };

  const subirAudio = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("audio/")) { toast.error("Elija un archivo de audio (mp3, ogg, wav)."); return; }
    const enServidor = modoServidor();
    const max = enServidor ? 15 : MAX_AUDIO_MB;
    if (f.size > max * 1024 * 1024) { toast.error(`El archivo supera ${max} MB. Use un enlace o un archivo más liviano.`); return; }
    setCargando(true);
    if (enServidor) {
      // Con backend: el archivo se sube a Vercel Blob y queda disponible para todos los visitantes
      void f.arrayBuffer().then(async (buf) => {
        let bin = "";
        const bytes = new Uint8Array(buf);
        for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        const r = await subirAudioServidor({ data: { nombre: f.name, tipo: f.type, base64: btoa(bin) } }).catch((e: Error) => ({ ok: false as const, error: e.message }));
        setCargando(false);
        if (!r.ok) { toast.error(r.error); return; }
        setNueva((n) => ({ ...n, url: r.url, nombre: n.nombre || f.name.replace(/\.[^.]+$/, "") }));
        toast.success("Archivo subido.");
      });
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      setNueva((n) => ({ ...n, url: String(fr.result), nombre: n.nombre || f.name.replace(/\.[^.]+$/, "") }));
      setCargando(false);
    };
    fr.onerror = () => { setCargando(false); toast.error("No se pudo leer el archivo."); };
    fr.readAsDataURL(f);
  };

  const agregar = () => {
    if (!nueva.nombre.trim()) { toast.error("Ponga un nombre para el tema"); return; }
    if (!nueva.url) { toast.error("Suba un archivo o pegue un enlace de audio"); return; }
    const p: PistaMusica = { id: nuevoId(), nombre: nueva.nombre.trim(), sub: nueva.sub.trim() || "Instrumental", url: nueva.url.trim(), color: COLORES_PISTA[d.pistas.length % COLORES_PISTA.length]! };
    set({ pistas: [...d.pistas, p] });
    setNueva({ nombre: "", sub: "", url: "" });
  };
  const mover = (i: number, k: number) => {
    const l = [...d.pistas];
    const j = i + k;
    if (j < 0 || j >= l.length) return;
    [l[i], l[j]] = [l[j]!, l[i]!];
    set({ pistas: l });
  };

  const total = d.pistas.length + (d.musicaEjemplo ? 4 : 0);
  const [cierre, setCierre] = useState({ fecha: "", motivo: "" });
  const redes = d.redes ?? {};
  const aviso = d.aviso ?? { activo: false, texto: "", tono: "info" as const };
  const setAviso = (patch: Partial<NonNullable<DatosSitio["aviso"]>>) => set({ aviso: { ...aviso, ...patch } });
  const checklist = [
    { ok: !!d.direccion.trim(), t: "Dirección", d: "Aparece en el mapa de Contacto y Clínica" },
    { ok: !!d.telefono.trim(), t: "Teléfono", d: "Botón de llamar" },
    { ok: !!d.whatsapp.trim(), t: "WhatsApp", d: "Botón flotante y citas" },
    { ok: !!d.email.trim(), t: "Correo", d: "Contacto y pie de página" },
    { ok: d.semana.some((x) => x.abierto), t: "Horario de atención", d: "Encabezado y Contacto" },
    { ok: Object.values(redes).some((v) => v?.trim()), t: "Redes sociales", d: "Íconos del pie de página" },
  ];
  const completo = Math.round((checklist.filter((c) => c.ok).length / checklist.length) * 100);
  const PAGINAS = [["Inicio", "/"], ["Nosotros", "/nosotros"], ["Especialidades", "/especialidades"], ["Especialistas", "/especialistas"], ["Servicios", "/servicios"], ["Clínica", "/clinica"], ["Preguntas", "/preguntas-frecuentes"], ["Contacto", "/contacto"], ["Pedir cita", "/turnos"], ["Portal", "/portal"]] as const;
  const fechaLarga = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const agregarCierre = () => {
    if (!cierre.fecha) { toast.error("Elija la fecha."); return; }
    if ((d.cierres ?? []).some((c) => c.fecha === cierre.fecha)) { toast.error("Esa fecha ya está cargada."); return; }
    set({ cierres: [...(d.cierres ?? []), { fecha: cierre.fecha, motivo: cierre.motivo.trim() }].sort((a, b) => a.fecha.localeCompare(b.fecha)) });
    setCierre({ fecha: "", motivo: "" });
  };
  const FESTIVOS_CO: { fecha: string; motivo: string }[] = (() => {
    const y = new Date().getFullYear();
    return [[`${y}-12-08`, "Día de la Inmaculada Concepción"], [`${y}-12-25`, "Navidad"], [`${y + 1}-01-01`, "Año Nuevo"]].map(([fecha, motivo]) => ({ fecha: fecha!, motivo: motivo! })).filter((x) => x.fecha >= isoDe(new Date()));
  })();

  return (
    <div className="space-y-6">
      {/* Resumen de la web */}
      <section className="pn-up relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#071a46] via-[#0b2a6b] to-[#0e7490] p-6 text-white shadow-elevated sm:p-7">
        <div className="pn-cross pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_340px]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ring-1 ring-white/20"><Globe className="size-3.5" /> Sitio web público</span>
            <h2 className="mt-3 text-3xl font-semibold">Lo que ven los pacientes</h2>
            <p className="mt-2 max-w-xl text-sm text-white/75">Contacto, horarios, avisos, redes, días de cierre y música de espera. Lo que publique aquí se actualiza en toda la web al instante.</p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {PAGINAS.map(([l, h]) => (
                <a key={h} href={h} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold ring-1 ring-white/15 transition hover:bg-white/20">{l} <ArrowUpRight className="size-3" /></a>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
            <div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">Información completa</p><p className="font-display text-2xl font-semibold tabular-nums">{completo}%</p></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${completo}%` }} /></div>
            <ul className="mt-3 space-y-1.5">
              {checklist.map((c) => (
                <li key={c.t} className="flex items-center gap-2 text-xs">
                  <span className={`grid size-4 place-items-center rounded-full ${c.ok ? "bg-white text-[#0b2a6b]" : "ring-1 ring-white/40"}`}>{c.ok && <Check className="size-3" strokeWidth={3} />}</span>
                  <span className={c.ok ? "font-semibold" : "text-white/70"}>{c.t}</span>
                  <span className="ml-auto truncate text-[10px] text-white/55">{c.d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Barra de guardado */}
      <div className={`pn-card pn-up sticky top-3 z-20 flex flex-wrap items-center justify-between gap-3 p-4 ${cambios ? "ring-2 ring-[rgba(var(--acc),.35)]" : ""}`}>
        <p className="flex items-center gap-2 text-sm">
          <Globe className="size-4 text-[rgb(var(--acc))]" />
          {cambios ? <span className="font-semibold">Tiene cambios sin publicar</span> : <span className="text-muted-foreground">Todo lo que guarde aquí se ve en la web pública.</span>}
        </p>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${modoServidor() ? "bg-[#0b2a6b]/[.06] text-[#0b2a6b] ring-[#0b2a6b]/15 dark:bg-white/10 dark:text-sky-200" : "bg-slate-50 text-slate-600 ring-slate-200"}`}>
          <span className={`size-1.5 rounded-full ${modoServidor() ? "bg-[#0e7490]" : "bg-slate-400"}`} />
          {modoServidor() ? "Conectado al servidor: lo ven todos" : "Modo local: solo en este navegador"}
        </span>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-xl"><a href="/contacto" target="_blank" rel="noreferrer"><Eye className="size-4" /> Ver la web</a></Button>
          {cambios && <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setD(base)}>Descartar</Button>}
          <Button size="sm" className="rounded-xl" disabled={!cambios} onClick={guardar}><Check className="size-4" /> Publicar cambios</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Seccion icon={Phone} titulo="Datos de contacto" sub="Se muestran en el encabezado, el pie, Contacto y Clínica. Lo que quede vacío no aparece.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Dirección" className="sm:col-span-2"><input value={d.direccion} onChange={(e) => set({ direccion: e.target.value })} placeholder="Calle, número, piso — Ciudad" className={inp} /></Campo>
            <Campo label="Teléfono"><input value={d.telefono} onChange={(e) => set({ telefono: e.target.value })} placeholder="+57 601 000 0000" className={inp} /></Campo>
            <Campo label="WhatsApp"><input value={d.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} placeholder="+57 300 000 0000" className={inp} /></Campo>
            <Campo label="Email" className="sm:col-span-2"><input type="email" value={d.email} onChange={(e) => set({ email: e.target.value })} placeholder="contacto@clinica.com" className={inp} /></Campo>
          </div>
        </Seccion>

        <Seccion icon={Clock} titulo="Horario de apertura del centro" sub={resumenHorarioClinica(d) || "Cuándo está abierta la recepción. Los horarios de cada médico se cargan en «Mis horarios»."}>
          <ul className="space-y-2">
            {DIAS_ORDEN.map((dia) => {
              const x = d.semana.find((y) => y.dia === dia)!;
              return (
                <li key={dia} className={`flex flex-wrap items-center gap-3 rounded-xl px-3 py-2 transition-colors ${x.abierto ? "bg-[rgba(var(--acc),.06)]" : "bg-secondary/40"}`}>
                  <span className="w-24 text-sm font-semibold">{NOMBRES_DIA[dia]}</span>
                  <Interruptor on={x.abierto} onChange={(v) => setDia(dia, { abierto: v })} label={x.abierto ? "Abierto" : "Cerrado"} />
                  {x.abierto && (
                    <span className="ml-auto flex items-center gap-2">
                      <input type="time" value={x.desde} onChange={(e) => setDia(dia, { desde: e.target.value })} className={inp + " h-9 w-32 py-1"} />
                      <span className="text-muted-foreground">a</span>
                      <input type="time" value={x.hasta} onChange={(e) => setDia(dia, { hasta: e.target.value })} className={inp + " h-9 w-32 py-1"} />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </Seccion>
      </div>

      <Seccion icon={Megaphone} titulo="Aviso destacado en la web" sub="Una franja arriba de todas las páginas: festivos, cambios de horario, campañas de vacunación…"
        acciones={<Interruptor on={aviso.activo} onChange={(v) => setAviso({ activo: v })} label={aviso.activo ? "Visible" : "Oculto"} />}>
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <Campo label="Texto del aviso"><input value={aviso.texto} maxLength={160} onChange={(e) => setAviso({ texto: e.target.value })} placeholder="Ej.: El lunes 8 de diciembre no hay atención por el festivo." className={inp} /></Campo>
            <div className="grid gap-4 sm:grid-cols-3">
              <Campo label="Tipo">
                <select value={aviso.tono} onChange={(e) => setAviso({ tono: e.target.value as "info" | "importante" })} className={inp}><option value="info">Informativo</option><option value="importante">Importante</option></select>
              </Campo>
              <Campo label="Mostrar hasta (opcional)"><input type="date" value={aviso.hasta ?? ""} onChange={(e) => setAviso({ hasta: e.target.value || undefined })} className={inp} /></Campo>
              <Campo label="Botón (opcional)"><input value={aviso.textoEnlace ?? ""} onChange={(e) => setAviso({ textoEnlace: e.target.value || undefined })} placeholder="Ej.: Pedir cita" className={inp} /></Campo>
            </div>
            <Campo label="Enlace del botón (opcional)"><input value={aviso.enlace ?? ""} onChange={(e) => setAviso({ enlace: e.target.value || undefined })} placeholder="/turnos o https://…" className={inp} /></Campo>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vista previa</p>
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
              <div className={`${aviso.tono === "importante" ? "bg-[#7f1d1d]" : "bg-[#0e7490]"} flex flex-wrap items-center justify-center gap-2 px-3 py-2 text-center text-xs text-white ${aviso.activo ? "" : "opacity-50"}`}>
                <Megaphone className="size-3.5" /> <span className="font-medium">{aviso.texto || "Su aviso aparece aquí"}</span>
                {aviso.enlace && <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold ring-1 ring-white/30">{aviso.textoEnlace || "Ver más"}</span>}
              </div>
              <div className="space-y-2 bg-slate-50 p-4 dark:bg-white/5"><div className="h-2.5 w-24 rounded bg-slate-300 dark:bg-white/20" /><div className="h-2 w-3/4 rounded bg-slate-200 dark:bg-white/10" /><div className="h-2 w-1/2 rounded bg-slate-200 dark:bg-white/10" /></div>
            </div>
            {aviso.activo && aviso.hasta && <p className="mt-2 text-xs text-muted-foreground">Se oculta solo después del {fechaDe(aviso.hasta)}.</p>}
          </div>
        </div>
      </Seccion>

      <div className="grid gap-6 xl:grid-cols-2">
        <Seccion icon={CalendarX} titulo="Días sin atención" sub="Festivos y cierres especiales. Se muestran en la web para que nadie llegue con el centro cerrado.">
          <div className="flex flex-wrap items-end gap-2">
            <Campo label="Fecha"><input type="date" value={cierre.fecha} min={isoDe(new Date())} onChange={(e) => setCierre({ ...cierre, fecha: e.target.value })} className={inp + " h-10"} /></Campo>
            <div className="min-w-[180px] flex-1"><Campo label="Motivo"><input value={cierre.motivo} onChange={(e) => setCierre({ ...cierre, motivo: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") agregarCierre(); }} placeholder="Ej.: Festivo, capacitación…" className={inp + " h-10"} /></Campo></div>
            <Button className="h-10 rounded-xl" onClick={agregarCierre}><Plus className="size-4" /> Agregar</Button>
          </div>
          {FESTIVOS_CO.some((f) => !(d.cierres ?? []).some((c) => c.fecha === f.fecha)) && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">Próximos festivos:</span>
              {FESTIVOS_CO.filter((f) => !(d.cierres ?? []).some((c) => c.fecha === f.fecha)).map((f) => (
                <button key={f.fecha} type="button" onClick={() => set({ cierres: [...(d.cierres ?? []), f].sort((a, b) => a.fecha.localeCompare(b.fecha)) })} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300"><Plus className="size-3" /> {fechaCorta(f.fecha)} · {f.motivo}</button>
              ))}
            </div>
          )}
          <ul className="mt-4 space-y-2">
            {(d.cierres ?? []).length === 0 && <li className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted-foreground dark:bg-white/5">No hay días de cierre cargados.</li>}
            {(d.cierres ?? []).map((c) => {
              const pasado = c.fecha < isoDe(new Date());
              return (
                <li key={c.fecha} className={`flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 ${pasado ? "opacity-50" : ""}`}>
                  <span className="grid size-10 place-items-center rounded-xl bg-[#0b2a6b]/[.07] text-center leading-none text-[#0b2a6b] dark:bg-white/10 dark:text-sky-200"><span><span className="block text-sm font-bold">{c.fecha.slice(8, 10)}</span><span className="text-[9px] uppercase">{new Date(`${c.fecha}T12:00:00`).toLocaleDateString("es-CO", { month: "short" }).replace(".", "")}</span></span></span>
                  <div className="min-w-0 flex-1"><p className="text-sm font-semibold first-letter:uppercase">{fechaLarga(c.fecha)}</p><p className="truncate text-xs text-muted-foreground">{c.motivo || "Sin atención"}{pasado ? " · ya pasó" : ""}</p></div>
                  <button onClick={() => set({ cierres: (d.cierres ?? []).filter((x) => x.fecha !== c.fecha) })} className="rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600" aria-label="Quitar"><Trash2 className="size-4" /></button>
                </li>
              );
            })}
          </ul>
        </Seccion>

        <Seccion icon={Share2} titulo="Redes sociales" sub="Escriba el usuario (@clinica) o pegue el enlace. Lo que quede vacío no aparece.">
          <div className="space-y-3">
            {([["instagram", "Instagram", Instagram, "@hegoclinica"], ["facebook", "Facebook", Facebook, "hegoclinica"], ["tiktok", "TikTok", Music2, "@hegoclinica"], ["youtube", "YouTube", Youtube, "@hegoclinica"], ["linkedin", "LinkedIn", Linkedin, "hego"]] as const).map(([k, l, I, ph]) => (
              <label key={k} className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#0b2a6b] text-white"><I className="size-4" /></span>
                <span className="w-24 text-sm font-semibold">{l}</span>
                <input value={redes[k] ?? ""} onChange={(e) => set({ redes: { ...redes, [k]: e.target.value } })} placeholder={ph} className={inp + " h-10 flex-1"} />
              </label>
            ))}
          </div>
        </Seccion>
      </div>

      <Seccion icon={Music2} titulo="Música de espera" sub="El reproductor del pie de la web. Suba sus temas o use las pistas de ejemplo.">
        <div className="flex flex-wrap gap-x-8 gap-y-3 rounded-2xl bg-secondary/40 p-4">
          <Interruptor on={d.musicaActiva} onChange={(v) => set({ musicaActiva: v })} label="Mostrar el reproductor en la web" />
          <Interruptor on={d.musicaEjemplo} onChange={(v) => set({ musicaEjemplo: v })} label="Incluir las 4 pistas de ejemplo" />
          <span className="ml-auto self-center text-xs text-muted-foreground">{d.musicaActiva ? `${total} ${total === 1 ? "tema" : "temas"} en la web` : "Reproductor oculto"}</span>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sus temas</p>
            {d.pistas.length === 0 ? (
              <Vacio icon={Music2} titulo="Todavía no subió música" texto="Agregue su primer tema con el formulario. Mientras tanto se usan las pistas de ejemplo." />
            ) : (
              <ol className="space-y-2">
                {d.pistas.map((p, i) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card p-3">
                    <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${p.color} text-white`}><Music2 className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <input value={p.nombre} onChange={(e) => set({ pistas: d.pistas.map((y) => (y.id === p.id ? { ...y, nombre: e.target.value } : y)) })} className="w-full bg-transparent text-sm font-semibold outline-none" />
                      <input value={p.sub} onChange={(e) => set({ pistas: d.pistas.map((y) => (y.id === p.id ? { ...y, sub: e.target.value } : y)) })} className="w-full bg-transparent text-xs text-muted-foreground outline-none" />
                    </div>
                    <audio src={p.url} controls preload="none" className="h-9 w-56 max-w-full" />
                    <div className="flex items-center gap-1">
                      <select value={p.color} onChange={(e) => set({ pistas: d.pistas.map((y) => (y.id === p.id ? { ...y, color: e.target.value } : y)) })} className="h-9 rounded-lg border border-input bg-background px-2 text-xs" aria-label="Color">
                        {COLORES_PISTA.map((c, k) => <option key={c} value={c}>Color {k + 1}</option>)}
                      </select>
                      <Button size="icon" variant="ghost" className="size-9 rounded-lg" disabled={i === 0} onClick={() => mover(i, -1)} aria-label="Subir"><ChevronUp className="size-4" /></Button>
                      <Button size="icon" variant="ghost" className="size-9 rounded-lg" disabled={i === d.pistas.length - 1} onClick={() => mover(i, 1)} aria-label="Bajar"><ChevronDown className="size-4" /></Button>
                      <Button size="icon" variant="ghost" className="size-9 rounded-lg text-rose-600 hover:bg-rose-50" onClick={() => set({ pistas: d.pistas.filter((y) => y.id !== p.id) })} aria-label="Quitar"><Trash2 className="size-4" /></Button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="rounded-2xl border border-dashed border-border p-5">
            <p className="text-sm font-semibold">Agregar un tema</p>
            <div className="mt-4 space-y-3">
              <Campo label="Nombre"><input value={nueva.nombre} onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })} placeholder="Ej.: Calma" className={inp} /></Campo>
              <Campo label="Descripción"><input value={nueva.sub} onChange={(e) => setNueva({ ...nueva, sub: e.target.value })} placeholder="Ej.: Piano suave" className={inp} /></Campo>
              <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-border bg-secondary/40 px-4 py-5 text-center text-sm transition hover:bg-secondary">
                <Upload className="size-5 text-[rgb(var(--acc))]" />
                <span className="font-medium">{cargando ? "Subiendo archivo…" : nueva.url.startsWith("data:") || nueva.url.includes("blob.vercel-storage.com") ? "Archivo listo ✓" : "Subir archivo de audio"}</span>
                <span className="text-xs text-muted-foreground">mp3, ogg o wav · hasta {modoServidor() ? 15 : MAX_AUDIO_MB} MB</span>
                <input type="file" accept="audio/*" className="hidden" onChange={(e) => subirAudio(e.target.files?.[0])} />
              </label>
              <Campo label="…o enlace de audio"><input value={nueva.url.startsWith("data:") || nueva.url.includes("blob.vercel-storage.com") ? "" : nueva.url} onChange={(e) => setNueva({ ...nueva, url: e.target.value })} placeholder="https://…/tema.mp3" className={inp} /></Campo>
              {nueva.url && <audio src={nueva.url} controls className="h-9 w-full" />}
              <Button className="w-full rounded-xl" onClick={agregar}><Plus className="size-4" /> Agregar a la lista</Button>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{modoServidor() ? "La música se sube al servidor y la escuchan todos los visitantes." : "Por ahora la música se guarda en este navegador. Cuando conectemos el servidor, se sube una sola vez y la escuchan todos los visitantes."} Use solo música con permiso de uso.</p>
            </div>
          </div>
        </div>
      </Seccion>
    </div>
  );
}


/**
 * Fondo animado del encabezado del panel según el médico:
 * cardiólogo → corazón + electro con latido; nefrólogo → riñones con pulso y flujo.
 */
function FondoEspecialidadMedico({ id }: { id: string }) {
  if (id === "alonso") {
    // Cardiología: corazón que late + electro rojo brillante
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 right-0 w-[55%] bg-[radial-gradient(circle_at_78%_45%,rgba(244,63,94,.45),transparent_60%)] pn-latido-glow" />
        <img src={fondoCorazonPanel} alt="" className="pn-latido absolute right-2 top-1/2 h-[135%] max-w-none -translate-y-1/2 opacity-45 mix-blend-screen [mask-image:radial-gradient(closest-side,#000_60%,transparent)] sm:right-10" />
        <Electro latidos={6} grilla={false} color="#fb7185" className="absolute inset-x-0 bottom-1 h-20 w-full opacity-95" />
      </div>
    );
  }
  if (id === "alberto") {
    // Nefrología: riñones que "filtran" + ondas de flujo celestes
    const onda = (k: number) =>
      `M0 ${50 + k * 8} ` +
      Array.from({ length: 8 }, (_, i) => `C ${i * 100 + 25} ${30 + k * 8}, ${i * 100 + 75} ${70 + k * 8}, ${(i + 1) * 100} ${50 + k * 8}`).join(" ");
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 right-0 w-[55%] bg-[radial-gradient(circle_at_78%_45%,rgba(56,189,248,.5),transparent_60%)] pn-latido-glow" />
        <img src={fondoRinonesPanel} alt="" className="pn-rinon absolute right-2 top-1/2 h-[125%] max-w-none -translate-y-1/2 opacity-55 mix-blend-screen [mask-image:radial-gradient(closest-side,#000_62%,transparent)] sm:right-10" />
        <svg viewBox="0 0 800 100" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-20 w-full">
          <defs>
            <filter id="flujo-glow" x="-5%" y="-50%" width="110%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {[0, 1, 2].map((k) => (
            <g key={k}>
              <path d={onda(k)} fill="none" stroke="#7dd3fc" strokeOpacity={0.28 - k * 0.06} strokeWidth="2" vectorEffect="non-scaling-stroke" />
              <path className="electro-barrido" pathLength={1000} style={{ animationDelay: `${-k * 1.4}s`, animationDuration: `${5 + k}s` }} d={onda(k)} fill="none" stroke="#bae6fd" strokeWidth={3 - k * 0.6} strokeLinecap="round" vectorEffect="non-scaling-stroke" filter="url(#flujo-glow)" />
            </g>
          ))}
        </svg>
      </div>
    );
  }
  return <Electro latidos={4} grilla={false} color="#7dd3fc" className="pointer-events-none absolute inset-x-0 -bottom-1 h-9 w-full" />;
}

/* ---------- Comunicación interna (chat del equipo) ---------- */
type Mensaje = { id: string; canal: string; deId: string; de: string; area: string; texto: string; fecha: string; importante?: boolean };
const KEY_MENSAJES = "gb_mensajes";
const CANALES: { id: string; nombre: string; desc: string; icon: LucideIcon; color: string; soloJefes?: boolean; medicos?: boolean }[] = [
  { id: "general", nombre: "General", desc: "Todo el equipo de la clínica", icon: MessagesSquare, color: "#0ea5e9" },
  { id: "avisos", nombre: "Avisos de dirección", desc: "Publican los médicos y Dirección; todos leen", icon: Megaphone, color: "#f59e0b", soloJefes: true },
  { id: "turnos", nombre: "Citas y recepción", desc: "Agenda, pacientes que llegan, cambios de horario", icon: CalendarDays, color: "#8b5cf6" },
  { id: "enfermeria", nombre: "Enfermería", desc: "Triage, insumos y novedades de la cita", icon: Syringe, color: "#10b981" },
  { id: "medicos", nombre: "Médicos", desc: "Solo médicos y Dirección", icon: Stethoscope, color: "#f43f5e", medicos: true },
];
const FONDOS_CHAT: { id: string; nombre: string; css: CSSProperties; oscuro?: boolean }[] = [
  { id: "clinico", nombre: "Clínico", css: { backgroundColor: "#f4f8fc", backgroundImage: "radial-gradient(circle at 1px 1px, rgba(14,99,180,.12) 1px, transparent 0)", backgroundSize: "22px 22px" } },
  { id: "aurora", nombre: "Aurora", css: { backgroundImage: "radial-gradient(at 15% 10%, rgba(56,189,248,.25), transparent 45%), radial-gradient(at 85% 90%, rgba(244,114,182,.22), transparent 45%), linear-gradient(180deg,#f8fbff,#f3f0ff)" } },
  { id: "corazon", nombre: "Corazón", css: { backgroundImage: `linear-gradient(rgba(255,255,255,.82),rgba(255,255,255,.88)), url(${fondoCorazonPanel})`, backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "rinones", nombre: "Riñones", css: { backgroundImage: `linear-gradient(rgba(255,255,255,.82),rgba(255,255,255,.88)), url(${fondoRinonesPanel})`, backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "noche", nombre: "Noche", oscuro: true, css: { backgroundImage: "radial-gradient(at 20% 0%, rgba(56,189,248,.18), transparent 50%), linear-gradient(180deg,#0b1430,#0a1024)" } },
  { id: "liso", nombre: "Liso", css: { backgroundColor: "var(--card)" } },
];
const EMOJIS = ["👍", "✅", "🙏", "⚠️", "❤️", "😊", "📌", "🩺"];

function puedeVerCanal(c: (typeof CANALES)[number], user: SessionUser) {
  return !c.medicos || user.rol === "medico" || user.area === "Dirección general" || esAreaMedica(user.area);
}
/** Mensajes privados: el canal es "dm:" + los dos ids ordenados. */
const canalDM = (a: string, b: string) => `dm:${[a, b].sort().join("|")}`;
const participantesDM = (canal: string) => (canal.startsWith("dm:") ? canal.slice(3).split("|") : []);
function veMensaje(canal: string, user: SessionUser) {
  if (canal.startsWith("dm:")) return participantesDM(canal).includes(user.id);
  return CANALES.some((c) => c.id === canal && puedeVerCanal(c, user));
}
function esJefe(user: SessionUser) {
  return user.rol === "medico" || user.area === "Dirección general";
}
function leerVistos(id: string): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(`gb_chat_visto_${id}`) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}
/** Mensajes sin leer (para el número del menú). */
function useNoLeidos(user: SessionUser | null) {
  const [msgs] = useDato<Mensaje[]>(KEY_MENSAJES, []);
  const [, tick] = useState(0);
  useEffect(() => {
    const f = () => tick((x) => x + 1);
    window.addEventListener("gb-chat-visto", f);
    return () => window.removeEventListener("gb-chat-visto", f);
  }, []);
  if (typeof window === "undefined" || !user) return 0;
  const vistos = leerVistos(user.id);
  return msgs.filter((m) => m.deId !== user.id && m.fecha > (vistos[m.canal] ?? "") && veMensaje(m.canal, user)).length;
}

function ComunicacionTab({ user, log }: { user: SessionUser; log: LogFn }) {
  const [msgs, setMsgs] = useDato<Mensaje[]>(KEY_MENSAJES, []);
  const canales = CANALES.filter((c) => puedeVerCanal(c, user));
  const [canal, setCanal] = useState(canales[0]!.id);
  const [equipo] = useDato<Personal[]>(KEY_ENFERMERIA, []);
  // Personas para mensajes privados: los médicos y todo el personal activo (menos yo)
  const personas = [
    ...ADMINS.map((a) => ({ id: a.id, nombre: a.nombre, area: a.id === "alonso" ? "Cardiología" : "Nefrología" })),
    ...equipo.filter((p) => p.activo).map((p) => ({ id: p.id, nombre: p.nombre, area: areaDe(p) })),
  ].filter((p) => p.id !== user.id);
  const ultimoDe = (id: string) => msgs.filter((m) => m.canal === id).reduce((a, m) => (m.fecha > a ? m.fecha : a), "");
  const directos = personas
    .map((p) => ({ ...p, canal: canalDM(user.id, p.id) }))
    .sort((a, b) => ultimoDe(b.canal).localeCompare(ultimoDe(a.canal)) || a.nombre.localeCompare(b.nombre));
  const [buscar, setBuscar] = useState("");
  const [texto, setTexto] = useState("");
  const [importante, setImportante] = useState(false);
  const [emojis, setEmojis] = useState(false);
  const [fondoId, setFondoId] = useState(() => (typeof window === "undefined" ? "clinico" : localStorage.getItem(`gb_chat_fondo_${user.id}`) ?? "clinico"));
  const [elegirFondo, setElegirFondo] = useState(false);
  const [verCanales, setVerCanales] = useState(false);
  const [vistos, setVistos] = useState<Record<string, string>>(() => (typeof window === "undefined" ? {} : leerVistos(user.id)));
  const lista = useRef<HTMLDivElement>(null);
  const fondo = FONDOS_CHAT.find((f) => f.id === fondoId) ?? FONDOS_CHAT[0]!;
  const dm = directos.find((d) => d.canal === canal);
  const c: (typeof CANALES)[number] = dm
    ? { id: dm.canal, nombre: dm.nombre, desc: `Mensaje privado · ${dm.area}`, icon: UserRound, color: "#6366f1" }
    : (canales.find((x) => x.id === canal) ?? canales[0]!);
  const jefe = esJefe(user);
  const puedeEscribir = !c.soloJefes || jefe;

  useEffect(() => refrescoRapido(KEY_MENSAJES), []);
  const delCanal = useMemo(() => msgs.filter((m) => m.canal === c.id).sort((a, b) => a.fecha.localeCompare(b.fecha)), [msgs, c.id]);
  const fijado = [...delCanal].reverse().find((m) => m.importante);

  // Marca el canal como leído y baja hasta el último mensaje
  useEffect(() => {
    const ultimo = delCanal[delCanal.length - 1]?.fecha;
    if (ultimo && ultimo > (vistos[c.id] ?? "")) {
      const v = { ...leerVistos(user.id), [c.id]: ultimo };
      localStorage.setItem(`gb_chat_visto_${user.id}`, JSON.stringify(v));
      setVistos(v);
      window.dispatchEvent(new Event("gb-chat-visto"));
    }
    requestAnimationFrame(() => lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: "smooth" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delCanal.length, c.id]);

  const sinLeer = (id: string) => msgs.filter((m) => m.canal === id && m.deId !== user.id && m.fecha > (vistos[id] ?? "")).length;
  const cambiarFondo = (id: string) => {
    setFondoId(id);
    localStorage.setItem(`gb_chat_fondo_${user.id}`, id);
    setElegirFondo(false);
  };
  const enviar = (e?: FormEvent) => {
    e?.preventDefault();
    const t = texto.trim();
    if (!t || !puedeEscribir) return;
    const m: Mensaje = { id: uid(), canal: c.id, deId: user.id, de: user.nombre, area: user.rol === "medico" ? "Médico" : (user.area ?? ""), texto: t.slice(0, 2000), fecha: new Date().toISOString(), ...(importante && !dm ? { importante: true } : {}) };
    setMsgs((p) => [...p, m]);
    if (importante && !dm) log("Aviso importante en comunicación interna", `${c.nombre}: ${t.slice(0, 80)}`);
    setTexto("");
    setImportante(false);
    setEmojis(false);
  };
  const borrar = async (m: Mensaje) => {
    if (!(await preguntar({ titulo: "¿Borrar este mensaje?", texto: "Se borra para todo el equipo.", aceptar: "Sí, borrar" }))) return;
    setMsgs((p) => p.filter((x) => x.id !== m.id));
  };
  const diaTxt = (iso: string) => {
    const d = new Date(iso);
    const h = new Date();
    const ay = new Date();
    ay.setDate(h.getDate() - 1);
    if (d.toDateString() === h.toDateString()) return "Hoy";
    if (d.toDateString() === ay.toDateString()) return "Ayer";
    return d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  };
  const horaTxt = (iso: string) => new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="pn-card pn-up grid overflow-hidden lg:grid-cols-[17rem_1fr]" style={{ height: "min(78vh, 760px)" }}>
      {/* Canales */}
      <aside className={`dark ${verCanales ? "flex" : "hidden"} relative flex-col overflow-hidden border-r border-white/10 bg-gradient-to-b from-[#0b1d4a] via-[#0a1838] to-[#081229] text-foreground lg:flex`}>
        <div className="border-b border-border/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Canales</p>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {canales.map((x) => {
            const on = x.id === c.id;
            const n = sinLeer(x.id);
            return (
              <button key={x.id} type="button" onClick={() => { setCanal(x.id); setVerCanales(false); }}
                className={`group flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-all ${on ? "bg-card shadow-md ring-1 ring-border" : "hover:bg-card/70"}`}>
                <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm" style={{ background: `linear-gradient(140deg, ${x.color}, ${x.color}b3)` }}>
                  <x.icon className="size-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{x.nombre}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{x.desc}</span>
                </span>
                {n > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{n}</span>}
              </button>
            );
          })}
          <p className="px-2 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Mensajes privados</p>
          {personas.length > 6 && (
            <input value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar persona…" className="mb-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-[rgb(var(--acc))]" />
          )}
          {directos.length === 0 && <p className="px-2 text-xs text-muted-foreground">Cuando haya personal con acceso, va a poder escribirles en privado.</p>}
          {directos.filter((d) => norm(d.nombre).includes(norm(buscar))).map((d) => {
            const on = d.canal === canal;
            const n = sinLeer(d.canal);
            const foto = fotoDe(d.id);
            return (
              <button key={d.id} type="button" onClick={() => { setCanal(d.canal); setVerCanales(false); }}
                className={`flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-all ${on ? "bg-card shadow-md ring-1 ring-border" : "hover:bg-card/70"}`}>
                {foto ? <img src={foto} alt="" className="size-9 shrink-0 rounded-full object-cover object-top" /> : <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[11px] font-semibold text-white">{iniciales(d.nombre)}</span>}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{d.nombre}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{d.area}</span>
                </span>
                {n > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{n}</span>}
              </button>
            );
          })}
        </div>
        <p className="border-t border-border/60 p-3 text-[11px] leading-relaxed text-muted-foreground">Para información del equipo. No comparta aquí datos clínicos de pacientes: eso va en su historia clínica.</p>
      </aside>

      {/* Conversación */}
      <section className={`${verCanales ? "hidden" : "flex"} min-h-0 flex-col lg:flex`}>
        <header className="relative flex items-center gap-3 border-b border-border/60 bg-card px-4 py-3">
          <button type="button" onClick={() => setVerCanales(true)} className="rounded-xl p-2 text-muted-foreground hover:bg-secondary lg:hidden" aria-label="Ver canales"><ChevronLeft className="size-5" /></button>
          {dm && fotoDe(dm.id) ? (
            <img src={fotoDe(dm.id)!} alt="" className="size-10 rounded-full object-cover object-top" />
          ) : (
            <span className={`flex size-10 items-center justify-center text-white ${dm ? "rounded-full text-xs font-semibold" : "rounded-xl"}`} style={{ background: `linear-gradient(140deg, ${c.color}, ${c.color}b3)` }}>{dm ? iniciales(dm.nombre) : <c.icon className="size-[18px]" />}</span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{c.nombre}</p>
            <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground"><span className="size-1.5 rounded-full bg-emerald-500 pulse-dot" /> {c.desc}</p>
          </div>
          <div className="relative">
            <button type="button" onClick={() => setElegirFondo((v) => !v)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground">
              <Palette className="size-4" /> <span className="hidden sm:inline">Fondo</span>
            </button>
            {elegirFondo && (
              <div className="absolute right-0 top-11 z-20 grid w-64 grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-3 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200">
                {FONDOS_CHAT.map((f) => (
                  <button key={f.id} type="button" onClick={() => cambiarFondo(f.id)} className={`group flex flex-col items-center gap-1 rounded-xl p-1 text-[11px] font-medium ${f.id === fondo.id ? "text-[rgb(var(--acc))]" : "text-muted-foreground"}`}>
                    <span className={`h-12 w-full rounded-lg ring-2 transition ${f.id === fondo.id ? "ring-[rgb(var(--acc))]" : "ring-border group-hover:ring-foreground/30"}`} style={f.css} />
                    {f.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {fijado && (
          <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            <Pin className="mt-0.5 size-3.5 shrink-0" /> <span className="line-clamp-2"><b>{fijado.de}:</b> {fijado.texto}</span>
          </div>
        )}

        <div ref={lista} className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6" style={fondo.css}>
          {delCanal.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="flex size-16 items-center justify-center rounded-3xl text-white shadow-lg vz-flota" style={{ background: `linear-gradient(140deg, ${c.color}, ${c.color}b3)` }}><c.icon className="size-7" /></span>
              <p className={`mt-4 font-semibold ${fondo.oscuro ? "text-white" : ""}`}>{dm ? `Escríbale a ${dm.nombre}` : `Todavía no hay mensajes en ${c.nombre}`}</p>
              <p className={`mt-1 text-sm ${fondo.oscuro ? "text-white/60" : "text-muted-foreground"}`}>{dm ? "Solo ustedes dos ven esta conversación." : puedeEscribir ? "Escriba el primero." : "Aquí va a ver los avisos de los médicos y Dirección."}</p>
            </div>
          )}
          {delCanal.map((m, i) => {
            const mio = m.deId === user.id;
            const ant = delCanal[i - 1];
            const nuevoDia = !ant || new Date(ant.fecha).toDateString() !== new Date(m.fecha).toDateString();
            const seguido = !!ant && !nuevoDia && ant.deId === m.deId && new Date(m.fecha).getTime() - new Date(ant.fecha).getTime() < 5 * 60000;
            const foto = fotoDe(m.deId);
            return (
              <div key={m.id}>
                {nuevoDia && (
                  <div className="my-4 flex justify-center">
                    <span className={`rounded-full px-3 py-1 text-[11px] inline-block font-semibold shadow-sm first-letter:uppercase ${fondo.oscuro ? "bg-white/10 text-white/80" : "bg-card/90 text-muted-foreground ring-1 ring-border"}`}>{diaTxt(m.fecha)}</span>
                  </div>
                )}
                <div className={`group flex items-end gap-2 ${mio ? "flex-row-reverse" : ""} ${seguido ? "mt-1" : "mt-3"} animate-in fade-in slide-in-from-bottom-1 duration-300`}>
                  {!mio && (
                    <span className="size-8 shrink-0">
                      {!seguido && (foto ? <img src={foto} alt="" className="size-8 rounded-full object-cover object-top ring-2 ring-card" /> : <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-[11px] font-semibold text-white">{iniciales(m.de)}</span>)}
                    </span>
                  )}
                  <div className={`max-w-[80%] sm:max-w-[65%] ${mio ? "items-end" : "items-start"} flex flex-col`}>
                    {!mio && !seguido && <span className={`mb-0.5 px-1 text-[11px] font-semibold ${fondo.oscuro ? "text-white/70" : "text-muted-foreground"}`}>{m.de} <span className="font-normal opacity-70">· {m.area}</span></span>}
                    <div className={`relative whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm shadow-sm ${m.importante ? "ring-2 ring-amber-400" : ""} ${mio ? "rounded-br-md text-white" : "rounded-bl-md bg-card text-foreground ring-1 ring-border/60"}`}
                      style={mio ? { background: `linear-gradient(140deg, rgb(var(--acc)), rgba(var(--acc),.8))` } : undefined}>
                      {m.importante && <span className={`mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${mio ? "text-amber-200" : "text-amber-600"}`}><Pin className="size-3" /> Importante</span>}
                      {m.texto}
                      <span className={`ml-2 inline-block translate-y-0.5 text-[10px] ${mio ? "text-white/70" : "text-muted-foreground"}`}>{horaTxt(m.fecha)}</span>
                    </div>
                  </div>
                  {(mio || (jefe && !dm)) && (
                    <button type="button" onClick={() => borrar(m)} aria-label="Borrar mensaje" className="mb-1 rounded-lg p-1 text-muted-foreground opacity-0 transition hover:bg-rose-100 hover:text-rose-600 group-hover:opacity-100"><Trash2 className="size-3.5" /></button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {puedeEscribir ? (
          <form onSubmit={enviar} className="relative border-t border-border/60 bg-card p-3">
            {emojis && (
              <div className="absolute bottom-full left-3 mb-2 flex gap-1 rounded-2xl border border-border bg-card p-2 shadow-xl animate-in fade-in slide-in-from-bottom-1 duration-200">
                {EMOJIS.map((em) => <button key={em} type="button" onClick={() => setTexto((t) => t + em)} className="rounded-lg p-1.5 text-lg transition hover:scale-125 hover:bg-secondary">{em}</button>)}
              </div>
            )}
            <div className="flex items-end gap-2">
              <button type="button" onClick={() => setEmojis((v) => !v)} aria-label="Emojis" className="rounded-xl p-2.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"><Smile className="size-5" /></button>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
                rows={1}
                placeholder={dm ? `Mensaje privado a ${dm.nombre}…` : `Escribir en ${c.nombre}…`}
                className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-[rgb(var(--acc))] focus:ring-4 focus:ring-[rgba(var(--acc),.15)]"
              />
              {jefe && !dm && (
                <button type="button" onClick={() => setImportante((v) => !v)} aria-pressed={importante} title="Marcar como importante (queda fijado arriba)"
                  className={`rounded-xl p-2.5 transition ${importante ? "bg-amber-100 text-amber-700" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}><Pin className="size-5" /></button>
              )}
              <Button type="submit" disabled={!texto.trim()} className="h-11 w-11 shrink-0 rounded-2xl p-0" aria-label="Enviar"><Send className="size-4" /></Button>
            </div>
            <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">Enter para enviar · Shift + Enter para un renglón nuevo{jefe ? " · 📌 marca el mensaje como importante" : ""}</p>
          </form>
        ) : (
          <p className="border-t border-border/60 bg-card p-4 text-center text-sm text-muted-foreground"><Lock className="mr-1 inline size-4" /> En este canal publican los médicos y Dirección.</p>
        )}
      </section>
    </div>
  );
}


/* ---------- Seguridad de la cuenta: 2FA, correo y contraseña ---------- */
function Activar2FA({ onListo }: { onListo: () => void }) {
  const [qr, setQr] = useState<{ qr: string; secreto: string } | null>(null);
  const [codigo, setCodigo] = useState("");
  const [respaldo, setRespaldo] = useState<string[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const generar = async () => {
    setCargando(true);
    const r = await iniciar2fa();
    setCargando(false);
    if (!r.ok) return toast.error(r.error);
    setQr({ qr: r.qr, secreto: r.secreto });
  };
  const confirmar = async (e: FormEvent) => {
    e.preventDefault();
    setCargando(true);
    const r = await confirmar2fa(codigo);
    setCargando(false);
    if (!r.ok) return toast.error(r.error);
    setRespaldo(r.respaldo);
    toast.success("Verificación en dos pasos activada.");
  };
  if (respaldo)
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200">
          <p className="font-semibold">Guarde estos códigos de respaldo</p>
          <p className="mt-1">Sirven para entrar si pierde el celular. Cada uno se usa una sola vez y no se vuelven a mostrar: sáqueles captura o anótelos en un lugar seguro.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono text-sm">
          {respaldo.map((c) => <span key={c} className="rounded-xl bg-secondary px-3 py-2 text-center tracking-wider">{c}</span>)}
        </div>
        <Button onClick={() => { void navigator.clipboard?.writeText(respaldo.join("\n")); toast.success("Códigos copiados."); }} variant="outline" className="w-full rounded-xl"><Copy className="size-4" /> Copiar códigos</Button>
        <Button onClick={onListo} className="w-full rounded-xl"><Check className="size-4" /> Ya los guardé, continuar</Button>
      </div>
    );
  if (!qr)
    return (
      <div className="space-y-4">
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">1</span> <span>Instale en su celular <b>Google Authenticator</b> o <b>Microsoft Authenticator</b> (gratis, en Play Store o App Store).</span></li>
          <li className="flex gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">2</span> <span>Toque el botón de abajo y escanee el código QR con la app.</span></li>
          <li className="flex gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">3</span> <span>Escriba el número de 6 dígitos que aparece en la app.</span></li>
        </ol>
        <Button onClick={() => void generar()} disabled={cargando} className="h-11 w-full rounded-xl"><Smartphone className="size-4" /> {cargando ? "Generando..." : "Mostrar código QR"}</Button>
      </div>
    );
  return (
    <form onSubmit={confirmar} className="space-y-4">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-secondary/60 p-4 sm:flex-row">
        <img src={qr.qr} alt="Código QR para la app" className="size-44 rounded-xl bg-white p-1" />
        <div className="text-sm">
          <p className="font-semibold">Escanee este QR con la app</p>
          <p className="mt-1 text-muted-foreground">¿No puede escanear? En la app elija “ingresar clave” y escriba:</p>
          <p className="mt-2 select-all break-all rounded-lg bg-card px-2 py-1.5 font-mono text-xs">{qr.secreto}</p>
        </div>
      </div>
      <input autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))} placeholder="000000"
        className="h-14 w-full rounded-2xl border border-input bg-background text-center font-mono text-2xl tracking-[0.5em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
      <Button type="submit" disabled={cargando || codigo.length !== 6} className="h-11 w-full rounded-xl"><ShieldCheck className="size-4" /> {cargando ? "Verificando..." : "Activar"}</Button>
    </form>
  );
}

function MiSeguridad({ user, onCerrar }: { user: SessionUser; onCerrar: () => void }) {
  const [estado, setEstado] = useState<Awaited<ReturnType<typeof estadoSeguridad>>>(null);
  const [cargado, setCargado] = useState(false);
  const [email, setEmail] = useState("");
  const [activando, setActivando] = useState(false);
  const [codigoOff, setCodigoOff] = useState("");
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const cargar = async () => {
    const e = await estadoSeguridad();
    setEstado(e);
    setEmail(e?.email ?? "");
    setCargado(true);
  };
  useEffect(() => {
    void cargar();
  }, []);
  const guardarCorreo = async (ev: FormEvent) => {
    ev.preventDefault();
    const r = await guardarEmail(email);
    if (!r.ok) return toast.error(r.error);
    toast.success("Correo guardado.");
  };
  const apagar = async (ev: FormEvent) => {
    ev.preventDefault();
    const r = await desactivar2fa(codigoOff);
    if (!r.ok) return toast.error(r.error);
    setCodigoOff("");
    if (estado?.obligatorio) {
      toast.success("Listo. Al volver a entrar se va a pedir escanear el QR de nuevo.");
      cerrarSesion();
      window.location.href = "/login";
      return;
    }
    toast.success("Verificación en dos pasos desactivada.");
    void cargar();
  };
  const cambiar = async (ev: FormEvent) => {
    ev.preventDefault();
    const r = await cambiarClave(user.id, actual, nueva);
    if (!r.ok) return toast.error(r.error);
    toast.success("Contraseña actualizada.");
    setActual("");
    setNueva("");
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center" onClick={onCerrar}>
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-card p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <span className="pn-acc-tile flex size-11 items-center justify-center rounded-2xl text-white"><ShieldCheck className="size-5" /></span>
          <div className="flex-1">
            <p className="text-lg font-semibold">Mi seguridad</p>
            <p className="text-xs text-muted-foreground">{user.nombre}</p>
          </div>
          <button onClick={onCerrar} aria-label="Cerrar" className="rounded-xl p-2 text-muted-foreground hover:bg-secondary"><X className="size-5" /></button>
        </div>

        {!cargado ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Cargando…</p>
        ) : !estado ? (
          <p className="mt-6 rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">La verificación en dos pasos y la recuperación por correo funcionan con la base de datos conectada.</p>
        ) : (
          <div className="mt-6 space-y-6">
            <section className="rounded-2xl border border-border p-4">
              <div className="flex items-center gap-3">
                <Smartphone className="size-5 text-primary" />
                <p className="flex-1 font-semibold">Verificación en dos pasos</p>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${estado.activo ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{estado.activo ? "Activa" : "Apagada"}</span>
              </div>
              {estado.activo ? (
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <p>Al entrar le pedimos el código de su app. Le quedan <b>{estado.respaldos}</b> códigos de respaldo.</p>
                  {estado.obligatorio && <p className="text-xs">Para médicos y Dirección es obligatoria. ¿Cambia de celular o se la pasa a otra persona? Reiníciela: se cierra la sesión y al volver a entrar aparece el QR para escanear con el celular nuevo.</p>}
                  <form onSubmit={apagar} className="flex gap-2">
                    <input inputMode="numeric" maxLength={6} value={codigoOff} onChange={(e) => setCodigoOff(e.target.value.replace(/\D/g, ""))} placeholder="Código actual" className={inp + " h-10"} />
                    <Button type="submit" variant="outline" className="h-10 shrink-0 rounded-xl text-rose-600">{estado.obligatorio ? "Reiniciar" : "Desactivar"}</Button>
                  </form>
                </div>
              ) : activando ? (
                <div className="mt-4"><Activar2FA onListo={() => { setActivando(false); void cargar(); }} /></div>
              ) : (
                <div className="mt-3 space-y-3">
                  <p className="text-sm text-muted-foreground">Además de la contraseña, le pedimos un código de su celular. Aunque alguien sepa su contraseña, no puede entrar.</p>
                  <Button onClick={() => setActivando(true)} className="rounded-xl"><ShieldCheck className="size-4" /> Activar</Button>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-border p-4">
              <div className="flex items-center gap-3">
                <Mail className="size-5 text-primary" />
                <p className="flex-1 font-semibold">Correo para recuperar la contraseña</p>
              </div>
              <form onSubmit={guardarCorreo} className="mt-3 flex gap-2">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className={inp + " h-10"} />
                <Button type="submit" className="h-10 shrink-0 rounded-xl">Guardar</Button>
              </form>
              {!estado.correoListo && <p className="mt-2 text-xs text-amber-700">El envío de correos todavía no está configurado en el servidor (falta la clave de Resend).</p>}
            </section>

            {(user.rol === "medico" || user.area === "Dirección general") && <RestablecerOtro user={user} />}

            <section className="rounded-2xl border border-border p-4">
              <div className="flex items-center gap-3">
                <KeyRound className="size-5 text-primary" />
                <p className="flex-1 font-semibold">Cambiar contraseña</p>
              </div>
              <form onSubmit={cambiar} className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input type="password" required value={actual} onChange={(e) => setActual(e.target.value)} placeholder="Actual" className={inp + " h-10"} />
                <input type="password" required value={nueva} onChange={(e) => setNueva(e.target.value)} placeholder="Nueva (8+ caracteres)" className={inp + " h-10"} />
                <Button type="submit" className="h-10 rounded-xl">Guardar</Button>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

/** Para cuando alguien del equipo cambia o pierde el celular. */
function RestablecerOtro({ user }: { user: SessionUser }) {
  const [equipo] = useDato<Personal[]>(KEY_ENFERMERIA, []);
  const opciones = [
    ...(user.rol === "medico" ? ADMINS.filter((a) => a.id !== user.id).map((a) => ({ id: a.id, nombre: a.nombre })) : []),
    ...equipo.filter((p) => p.activo).map((p) => ({ id: p.id, nombre: `${p.nombre} · ${areaDe(p)}` })),
  ];
  const [id, setId] = useState("");
  const ir = async (ev: FormEvent) => {
    ev.preventDefault();
    const o = opciones.find((x) => x.id === id);
    if (!o || !(await preguntar({ tono: "aviso", titulo: "¿Restablecer la verificación en dos pasos?", texto: `${o.nombre} va a tener que configurarla de nuevo al entrar.`, aceptar: "Restablecer" }))) return;
    const r = await restablecer2fa(id);
    if (!r.ok) return toast.error(r.error);
    toast.success("Listo. La próxima vez que entre, la configura de nuevo.");
    setId("");
  };
  return (
    <section className="rounded-2xl border border-border p-4">
      <div className="flex items-center gap-3">
        <Users className="size-5 text-primary" />
        <p className="flex-1 font-semibold">¿Alguien cambió o perdió el celular?</p>
      </div>
      <form onSubmit={ir} className="mt-3 flex gap-2">
        <select value={id} onChange={(e) => setId(e.target.value)} className={inp + " h-10"}>
          <option value="">Elija a la persona…</option>
          {opciones.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
        </select>
        <Button type="submit" variant="outline" disabled={!id} className="h-10 shrink-0 rounded-xl">Restablecer 2FA</Button>
      </form>
    </section>
  );
}


/* ---------- Enfermería: notas y procedimientos ---------- */
const TIPOS_NOTA_ENF = ["Nota de enfermería", "Procedimiento realizado", "Toma de muestra", "Administración de medicamento", "Educación al paciente", "Novedad / incidente"] as const;
// (Glucometría, Electrocardiograma, Curación y Holter / MAPA se registran desde los botones de Enfermería)
const COLOR_NOTA: Record<string, string> = {
  "Nota de enfermería": "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10",
};

/** Registro de enfermería del paciente (dentro de la Historia Clínica). Solo enfermería escribe; los médicos lo leen. */
function NotasEnfermeria({ ids, paciente, user, log, puede }: { ids: string[]; paciente: string; user: SessionUser; log: LogFn; puede: boolean }) {
  const [notas, setNotas] = useDato<NotaEnfermeria[]>(KEY_NOTAS_ENF, []);
  const [tipo, setTipo] = useState<string>(TIPOS_NOTA_ENF[0]);
  const [texto, setTexto] = useState("");
  const [abierto, setAbierto] = useState(false);
  const mias = notas.filter((n) => !n.anulada && ids.includes(n.pacienteId)).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const guardar = (e: FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    const n: NotaEnfermeria = { id: uid(), pacienteId: ids[0]!, paciente, fecha: new Date().toISOString(), enfermeraId: user.id, enfermera: user.nombre, tipo, texto: texto.trim() };
    setNotas((p) => [...p, n]);
    log("Nota de enfermería", `${paciente} · ${tipo}`);
    toast.success("Nota guardada en la historia clínica.");
    setTexto("");
    setAbierto(false);
  };
  if (!puede) return null; // los registros se ven en el Historial del paciente
  return (
    <Seccion
      icon={Syringe}
      titulo="Notas de enfermería"
      sub={`${mias.length} ${mias.length === 1 ? "registro" : "registros"} · procedimientos, muestras, medicación y novedades`}
      acciones={puede && !abierto ? <Button size="sm" className="rounded-xl" onClick={() => setAbierto(true)}><Plus className="size-4" /> Nueva nota</Button> : undefined}
    >
      {puede && abierto && (
        <form onSubmit={guardar} className="mb-5 space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-500/25 dark:bg-emerald-500/5">
          <div className="flex flex-wrap gap-1.5">
            {TIPOS_NOTA_ENF.map((t) => (
              <button key={t} type="button" onClick={() => setTipo(t)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${tipo === t ? COLOR_NOTA[t] : "bg-card text-muted-foreground ring-border hover:text-foreground"}`}>{t}</button>
            ))}
          </div>
          <textarea autoFocus rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} className={inp + " h-auto py-2.5"}
            placeholder={tipo === "Administración de medicamento" ? "Medicamento, dosis, vía y hora. Ej.: Furosemida 20 mg IV 10:30, indicada por el Dr. …" : tipo === "Toma de muestra" ? "Qué muestra se tomó y cómo quedó rotulada. Ej.: Sangre venosa para creatinina y potasio, 08:15." : tipo === "Procedimiento realizado" ? "Ej.: Electrocardiograma de 12 derivaciones tomado. Colocación de Holter 24 h a las 09:00." : "Estado del paciente, observaciones, indicaciones dadas…"} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setAbierto(false)}>Cancelar</Button>
            <Button type="submit" disabled={!texto.trim()} className="rounded-xl"><Check className="size-4" /> Guardar nota</Button>
          </div>
        </form>
      )}
      {!abierto && <p className="text-sm text-muted-foreground">Lo que registre aparece en el <b>Historial del paciente</b>, abajo, y lo ve el médico.</p>}
    </Seccion>
  );
}

/** Procedimientos del día que hace enfermería (electro, Holter, MAPA, muestras…), con marca de realizado. */
function ProcedimientosHoy({ user, log, turnos, pacientes, soloLectura }: { user: SessionUser; log: LogFn; turnos: Turno[]; pacientes: PacienteHC[]; soloLectura: boolean }) {
  const [notas, setNotas] = useDato<NotaEnfermeria[]>(KEY_NOTAS_ENF, []);
  const procs = turnos.filter((t) => esProcedimiento(t.motivo)).sort((a, b) => a.hora.localeCompare(b.hora));
  const pacDe = (t: Turno) => pacientes.find((x) => (t.pacienteId && (x.id === t.pacienteId || x.portalId === t.pacienteId)) || norm(x.nombre) === norm(t.paciente));
  const hecho = (t: Turno) => notas.find((n) => n.turnoId === t.id);
  const marcar = (t: Turno) => {
    const p = pacDe(t);
    const n: NotaEnfermeria = { id: uid(), pacienteId: p?.id ?? t.pacienteId ?? t.id, paciente: t.paciente, fecha: new Date().toISOString(), enfermeraId: user.id, enfermera: user.nombre, tipo: "Procedimiento realizado", texto: `${t.motivo} realizado (cita de las ${hora12(t.hora)} con ${nombreCorto(t.doctor)}).`, turnoId: t.id };
    setNotas((x) => [...x, n]);
    log("Procedimiento realizado", `${t.paciente} · ${t.motivo}`);
    toast.success("Marcado como realizado. Quedó en la historia clínica.");
  };
  return (
    <Seccion icon={Stethoscope} titulo="Procedimientos de hoy" sub={`${procs.length} ${procs.length === 1 ? "procedimiento" : "procedimientos"} · electrocardiograma, Holter, MAPA, ecografías y muestras`}>
      {procs.length === 0 ? (
        <Vacio icon={Stethoscope} texto="Hoy no hay procedimientos agendados." />
      ) : (
        <ul className="space-y-2.5">
          {procs.map((t) => {
            const h = hecho(t);
            const al = pacDe(t)?.ficha?.alergias;
            return (
              <li key={t.id} className={`flex flex-wrap items-center gap-3 rounded-2xl border p-3.5 ${h ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/25 dark:bg-emerald-500/5" : "border-border/70 bg-card"}`}>
                <HoraMini hora={t.hora} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">{t.paciente}{al && <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 ring-1 ring-red-200"><AlertTriangle className="size-3" /> Alergia: {al}</span>}</p>
                  <p className="text-xs text-muted-foreground">{t.motivo} · {nombreCorto(t.doctor)}</p>
                </div>
                {h ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"><Check className="size-3.5" /> Realizado · {h.enfermera.split(" ")[0]}</span>
                ) : !soloLectura ? (
                  <Button size="sm" className="rounded-xl" onClick={() => marcar(t)}><Check className="size-3.5" /> Marcar realizado</Button>
                ) : (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Pendiente</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Seccion>
  );
}


/* ---------- Botones de lo que hace enfermería ---------- */
type AccionEnf = { id: string; t: string; d: string; icon: LucideIcon; c: string };
const ACCIONES_ENF: AccionEnf[] = [
  { id: "signos", t: "Signos vitales", d: "Presión arterial, pulso, temperatura, saturación, peso y talla", icon: HeartPulse, c: "#0ea5e9" },
  { id: "Glucometría", t: "Glucometría", d: "Glucosa capilar en mg/dL", icon: Droplets, c: "#f97316" },
  { id: "Electrocardiograma", t: "Electrocardiograma", d: "Toma del ECG de 12 derivaciones", icon: Activity, c: "#ef4444" },
  { id: "Toma de muestra", t: "Toma de muestra", d: "Muestra de sangre para laboratorio", icon: FlaskConical, c: "#eab308" },
  { id: "Administración de medicamento", t: "Medicamento aplicado", d: "Medicamento, dosis, vía y hora", icon: Pill, c: "#10b981" },
  { id: "Holter / MAPA", t: "Holter / MAPA", d: "Colocación o retiro del equipo", icon: Clock, c: "#6366f1" },
  { id: "Curación", t: "Curación", d: "Curaciones y procedimientos menores", icon: Syringe, c: "#ec4899" },
  { id: "Nota de enfermería", t: "Nota de enfermería", d: "Observaciones, educación al paciente o novedades", icon: NotebookPen, c: "#14b8a6" },
];

function AccionesEnfermeria({ user, log, turnos, pacientes, citasHoy, sinSignos, soloLectura, abrirSignos, abrirHistoria }: { user: SessionUser; log: LogFn; turnos: Turno[]; pacientes: PacienteHC[]; citasHoy: number; sinSignos: number; soloLectura: boolean; abrirSignos: (pacId?: string) => void; abrirHistoria: (id: string) => void }) {
  const [accion, setAccion] = useState<AccionEnf | null>(null);
  const [pacSel, setPacSel] = useState("");
  const [q, setQ] = useState("");
  const [triages] = useDato<Triage[]>(KEY_TRIAGE, []);
  const [notas] = useDato<NotaEnfermeria[]>(KEY_NOTAS_ENF, []);
  const hoyIso = isoDe(new Date());
  const conCitaHoy = new Set(turnos.filter((t) => t.fecha === hoyIso && t.estado !== "Cancelado").map((t) => norm(t.paciente)));
  const visibles = pacientes
    .filter((p) => norm(`${p.nombre} ${p.dni ?? ""}`).includes(norm(q)))
    .sort((a, b) => Number(conCitaHoy.has(norm(b.nombre))) - Number(conCitaHoy.has(norm(a.nombre))) || a.nombre.localeCompare(b.nombre))
    .slice(0, q ? 20 : 12);
  const pac = pacientes.find((p) => p.id === pacSel);
  const esDeP = (id: string) => !!pac && (id === pac.id || id === pac.portalId);
  const ultSignos = pac ? triages.filter((t) => esDeP(t.pacienteId)).sort((a, b) => b.fecha.localeCompare(a.fecha))[0] : undefined;
  const ultNotas = pac ? notas.filter((n) => !n.anulada && esDeP(n.pacienteId)).sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 3) : [];
  return (
    <section className="pn-card pn-up overflow-hidden p-5 sm:p-6">
      <div className="pn-sec-top dark relative -mx-5 -mt-5 flex flex-wrap items-end justify-between gap-3 overflow-hidden px-5 py-6 text-foreground sm:-mx-6 sm:-mt-6 sm:px-6">
        <div className="pn-cross pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute -right-10 -top-16 size-52 rounded-full bg-white/15 blur-3xl" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">Enfermería</p>
          <h2 className="mt-1 font-display text-3xl font-semibold text-white">¿Qué va a registrar?</h2>
          <p className="mt-1 max-w-2xl text-sm text-white/75">Elija al paciente, toque lo que va a registrar y complete los datos. Todo queda en su historia clínica y lo ven los médicos.</p>
        </div>
        <div className="relative flex gap-2 text-xs">
          <span className="rounded-full bg-white/15 px-3 py-1.5 font-semibold text-white ring-1 ring-white/25">{citasHoy} {citasHoy === 1 ? "cita" : "citas"} hoy</span>
          {sinSignos > 0 && <span className="rounded-full bg-amber-400 px-3 py-1.5 font-semibold text-amber-950 shadow">{sinSignos} sin signos vitales</span>}
        </div>
      </div>
      {/* 1. Paciente */}
      <div className="mt-5 rounded-2xl border border-border/70 bg-secondary/30 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex size-7 items-center justify-center rounded-full bg-[rgb(var(--acc))] text-xs font-bold text-white">1</span>
          <p className="font-semibold">Paciente</p>
          <div className="relative ml-auto w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o cédula" className={inp + " h-10 pl-9"} />
          </div>
        </div>
        {pacientes.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Todavía no hay pacientes registrados. Se cargan en <b>Pacientes</b> o al agendar una cita.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {visibles.map((p) => (
              <button key={p.id} type="button" onClick={() => setPacSel(p.id === pacSel ? "" : p.id)}
                className={`inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3.5 text-sm font-medium ring-1 transition ${p.id === pacSel ? "bg-[rgb(var(--acc))] text-white ring-transparent shadow-md" : "bg-card ring-border hover:bg-secondary"}`}>
                <Avatar nombre={p.nombre} size="size-7" />
                {p.nombre}
                {conCitaHoy.has(norm(p.nombre)) && <span className={`rounded-full px-1.5 text-[10px] font-bold ${p.id === pacSel ? "bg-white/25" : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"}`}>cita hoy</span>}
                {p.ficha?.alergias && <AlertTriangle className={`size-3.5 ${p.id === pacSel ? "text-white" : "text-red-500"}`} />}
              </button>
            ))}
            {visibles.length === 0 && <p className="text-sm text-muted-foreground">No se encontró ese paciente.</p>}
          </div>
        )}
        {pac && (
          <div className="mt-4 grid gap-3 rounded-2xl bg-card p-4 ring-1 ring-border animate-in fade-in slide-in-from-top-1 duration-300 lg:grid-cols-[1fr_1.2fr]">
            <div className="flex items-start gap-3">
              <Avatar nombre={pac.nombre} size="size-12" />
              <div className="min-w-0">
                <p className="text-lg font-semibold">{pac.nombre}</p>
                <p className="text-xs text-muted-foreground">{pac.dni ? `C.C. ${pac.dni}` : "Sin cédula"}{pac.telefono ? ` · ${pac.telefono}` : ""}</p>
                {pac.ficha?.alergias ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 ring-1 ring-red-200"><AlertTriangle className="size-3.5" /> Alergias: {pac.ficha.alergias}</p>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">Sin alergias registradas</p>
                )}
                <Button size="sm" variant="outline" className="mt-3 rounded-xl" onClick={() => abrirHistoria(pac.id)}><FileText className="size-3.5" /> Ver historia clínica</Button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Últimos signos vitales</p>
              {ultSignos ? <div><GrillaSignos s={ultSignos.signos} compacta /><p className="mt-1 text-[11px] text-muted-foreground">{fechaHora(ultSignos.fecha)} · {ultSignos.enfermera}</p></div> : <p className="text-xs text-muted-foreground">Sin registros.</p>}
              <p className="pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Últimos registros de enfermería</p>
              {ultNotas.length ? (
                <ul className="space-y-1">
                  {ultNotas.map((n) => <li key={n.id} className="text-xs"><span className={`mr-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${COLOR_NOTA[n.tipo] ?? COLOR_NOTA["Nota de enfermería"]}`}>{n.tipo}</span>{limpiarTextoNota(n.texto)}</li>)}
                </ul>
              ) : <p className="text-xs text-muted-foreground">Sin registros.</p>}
            </div>
          </div>
        )}
      </div>

      {/* 2. Qué registrar */}
      <div className="mt-4 flex items-center gap-3">
        <span className="flex size-7 items-center justify-center rounded-full bg-[rgb(var(--acc))] text-xs font-bold text-white">2</span>
        <p className="font-semibold">{pac ? `¿Qué le va a registrar a ${pac.nombre.split(" ")[0]}?` : "¿Qué va a registrar?"}</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {ACCIONES_ENF.map((a, i) => (
          <button
            key={a.id}
            type="button"
            disabled={soloLectura}
            onClick={() => (a.id === "signos" ? abrirSignos(pacSel || undefined) : setAccion(a))}
            className="group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_var(--c)] disabled:opacity-50"
            style={{ ["--c" as string]: a.c, animationDelay: `${i * 40}ms` } as CSSProperties}
          >
            <span className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30" style={{ background: a.c }} />
            <span className="flex size-12 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110" style={{ background: `linear-gradient(140deg, ${a.c}, ${a.c}b3)` }}>
              <a.icon className="size-6" />
            </span>
            <span>
              <span className="block font-semibold">{a.t}</span>
              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{a.d}</span>
            </span>
          </button>
        ))}
      </div>
      {soloLectura && <p className="mt-3 text-xs text-muted-foreground">Los registros de enfermería los carga el personal de enfermería.</p>}
      {accion && <VentanaRegistroEnf accion={accion} user={user} log={log} turnos={turnos} pacientes={pacientes} inicial={pacSel} onCerrar={() => setAccion(null)} />}
    </section>
  );
}

function VentanaRegistroEnf({ accion, user, log, turnos, pacientes, onCerrar, inicial = "" }: { accion: AccionEnf; user: SessionUser; log: LogFn; turnos: Turno[]; pacientes: PacienteHC[]; onCerrar: () => void; inicial?: string }) {
  const [, setNotas] = useDato<NotaEnfermeria[]>(KEY_NOTAS_ENF, []);
  const [pacId, setPacId] = useState(inicial);
  const hora = () => new Date().toTimeString().slice(0, 5);
  type CamposEnf = { hora: string; valor?: string; momento?: string; obs?: string; entregado?: string; muestra?: string; examenes?: string; med?: string; dosis?: string; via?: string; indica?: string; tipo?: string; zona?: string; desc?: string };
  const [f, setF] = useState<CamposEnf>(accion.id === "Toma de muestra" ? { hora: hora(), muestra: "Sangre venosa" } : { hora: hora() });
  const set = (k: keyof CamposEnf) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));
  const pac = pacientes.find((p) => p.id === pacId);
  const hoyIso = isoDe(new Date());
  const citasHoy = turnos.filter((t) => t.fecha === hoyIso && t.estado !== "Cancelado").sort((a, b) => a.hora.localeCompare(b.hora));
  const pacDe = (t: Turno) => pacientes.find((x) => (t.pacienteId && (x.id === t.pacienteId || x.portalId === t.pacienteId)) || norm(x.nombre) === norm(t.paciente));
  const glu = Number(f.valor);
  const gluNivel = !f.valor ? null : glu < 70 ? { t: "Baja (hipoglucemia)", c: "bg-red-100 text-red-700" } : glu > 180 ? { t: "Alta", c: "bg-red-100 text-red-700" } : glu > 140 && f.momento === "En ayunas" ? { t: "Elevada en ayunas", c: "bg-amber-100 text-amber-800" } : { t: "En rango", c: "bg-emerald-100 text-emerald-700" };

  const Chips = ({ k, ops }: { k: keyof CamposEnf; ops: string[] }) => (
    <div className="flex flex-wrap gap-1.5">
      {ops.map((o) => (
        <button key={o} type="button" onClick={() => setF((x) => ({ ...x, [k]: o }))} className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${f[k] === o ? "bg-[#0b2a6b] text-white shadow-md ring-transparent" : "bg-card text-muted-foreground ring-border hover:text-foreground"}`}>{o}</button>
      ))}
    </div>
  );

  const texto = (): string | null => {
    const obs = f.obs?.trim() ? ` Observaciones: ${f.obs.trim()}` : "";
    switch (accion.id) {
      case "Glucometría":
        if (!f.valor) return null;
        return `Glucometría: ${f.valor} mg/dL${f.momento ? ` (${f.momento.toLowerCase()})` : ""} a las ${hora12(f.hora).replace(/\.$/, "")}.${gluNivel ? ` ${gluNivel.t}.` : ""}${obs}`;
      case "Electrocardiograma":
        return `Electrocardiograma de 12 derivaciones tomado a las ${hora12(f.hora).replace(/\.$/, "")}.${f.entregado ? ` ${f.entregado}.` : ""}${obs}`;
      case "Toma de muestra":
        if (!f.muestra) return null;
        return `Toma de muestra: ${f.muestra.trim()}${f.examenes?.replace(/[,\s]+$/, "").trim() ? ` para ${f.examenes.replace(/[,\s]+$/, "").trim()}` : ""}, a las ${hora12(f.hora).replace(/\.$/, "")}.${obs}`;
      case "Administración de medicamento":
        if (!f.med || !f.dosis || !f.via) return null;
        return `${f.med} ${f.dosis}, vía ${f.via.toLowerCase()}, a las ${hora12(f.hora).replace(/\.$/, "")}${f.indica ? `. Indicado por ${f.indica}` : ""}.${obs}`;
      case "Holter / MAPA":
        if (!f.tipo) return null;
        return `${f.tipo} a las ${hora12(f.hora).replace(/\.$/, "")}.${obs}`;
      case "Curación":
        if (!f.zona) return null;
        return `Curación en ${f.zona} a las ${hora12(f.hora).replace(/\.$/, "")}.${f.desc ? ` ${f.desc}` : ""}${obs}`;
      default:
        return f.obs?.trim() ? f.obs.trim() : null;
    }
  };
  const guardar = (e: FormEvent) => {
    e.preventDefault();
    if (!pac) return toast.error("Elija el paciente.");
    const t = texto();
    if (!t) return toast.error("Complete los datos marcados con *.");
    const n: NotaEnfermeria = { id: uid(), pacienteId: pac.id, paciente: pac.nombre, fecha: new Date().toISOString(), enfermeraId: user.id, enfermera: user.nombre, tipo: accion.id, texto: t };
    setNotas((x) => [...x, n]);
    log(accion.t, pac.nombre);
    toast.success(`${accion.t} de ${pac.nombre} guardado en su historia clínica.`);
    onCerrar();
  };
  const campo = (label: string, el: ReactNode, req = false) => (
    <label className="block space-y-1.5"><span className="text-xs font-semibold text-muted-foreground">{label}{req && " *"}</span>{el}</label>
  );

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm animate-in fade-in duration-200" onClick={onCerrar} />
      <form onSubmit={guardar} className="pn-root relative flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[1.75rem] bg-background shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 sm:rounded-[1.75rem]">
        <div className="flex items-center gap-3 px-6 py-5 text-white" style={{ background: `linear-gradient(120deg, ${accion.c}, ${accion.c}cc)` }}>
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white/20"><accion.icon className="size-5" /></span>
          <div className="flex-1">
            <p className="text-lg font-semibold">{accion.t}</p>
            <p className="text-xs text-white/80">{accion.d}</p>
          </div>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="rounded-xl p-2 hover:bg-white/15"><X className="size-5" /></button>
        </div>
        <div className="space-y-5 overflow-y-auto p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Paciente *</p>
            {citasHoy.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {citasHoy.map((t) => {
                  const p = pacDe(t);
                  if (!p) return null;
                  return <button key={t.id} type="button" onClick={() => setPacId(p.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${pacId === p.id ? "bg-[rgb(var(--acc))] text-white ring-transparent" : "bg-card ring-border hover:bg-secondary"}`}>{hora12(t.hora)} · {t.paciente}</button>;
                })}
              </div>
            )}
            <SelectorPaciente pacientes={pacientes} valor={pacId} onChange={setPacId} />
            {pac?.ficha?.alergias && <p className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 ring-1 ring-red-200"><AlertTriangle className="size-3.5" /> Alergias: {pac.ficha.alergias}</p>}
          </div>

          {accion.id === "Glucometría" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {campo("Glucosa (mg/dL)", <input type="number" inputMode="numeric" value={f.valor ?? ""} onChange={set("valor")} placeholder="Ej.: 98" className={inp} />, true)}
              {campo("Hora", <input type="time" value={f.hora} onChange={set("hora")} className={inp} />)}
              <div className="sm:col-span-2">{campo("Momento", <Chips k="momento" ops={["En ayunas", "Postprandial", "Al azar"]} />)}</div>
              {gluNivel && <p className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${gluNivel.c}`}>{gluNivel.t}</p>}
            </div>
          )}
          {accion.id === "Electrocardiograma" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {campo("Hora", <input type="time" value={f.hora} onChange={set("hora")} className={inp} />)}
              <div className="sm:col-span-2">{campo("Trazado", <Chips k="entregado" ops={["Entregado al médico", "Subido a la historia", "Queda para lectura"]} />)}</div>
            </div>
          )}
          {accion.id === "Toma de muestra" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">{campo("Tipo de muestra (sangre)", <Chips k="muestra" ops={["Sangre venosa", "Sangre capilar", "Sangre arterial"]} />, true)}</div>
              <div className="sm:col-span-2">{campo("Exámenes", <ExamenesSangre valor={f.examenes ?? ""} onChange={(v) => setF((x) => ({ ...x, examenes: v }))} />)}</div>
              {campo("Hora", <input type="time" value={f.hora} onChange={set("hora")} className={inp} />)}
            </div>
          )}
          {accion.id === "Administración de medicamento" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {campo("Medicamento", <input value={f.med ?? ""} onChange={set("med")} placeholder="Ej.: Furosemida" className={inp} />, true)}
              {campo("Dosis", <input value={f.dosis ?? ""} onChange={set("dosis")} placeholder="Ej.: 20 mg" className={inp} />, true)}
              <div className="sm:col-span-2">{campo("Vía", <Chips k="via" ops={["Oral", "Intravenosa", "Intramuscular", "Subcutánea", "Sublingual", "Inhalada", "Tópica"]} />, true)}</div>
              {campo("Indicado por", <input value={f.indica ?? ""} onChange={set("indica")} placeholder="Médico que lo indicó" list="medicos-hego" className={inp} />)}
              <datalist id="medicos-hego">{ADMINS.map((a) => <option key={a.id} value={a.nombre} />)}</datalist>
              {campo("Hora", <input type="time" value={f.hora} onChange={set("hora")} className={inp} />)}
            </div>
          )}
          {accion.id === "Holter / MAPA" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">{campo("Qué se hizo", <Chips k="tipo" ops={["Colocación de Holter 24 h", "Retiro de Holter", "Colocación de MAPA 24 h", "Retiro de MAPA"]} />, true)}</div>
              {campo("Hora", <input type="time" value={f.hora} onChange={set("hora")} className={inp} />)}
            </div>
          )}
          {accion.id === "Curación" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {campo("Zona", <input value={f.zona ?? ""} onChange={set("zona")} placeholder="Ej.: sitio de punción brazo izquierdo" className={inp} />, true)}
              {campo("Hora", <input type="time" value={f.hora} onChange={set("hora")} className={inp} />)}
              <div className="sm:col-span-2">{campo("Descripción", <input value={f.desc ?? ""} onChange={set("desc")} placeholder="Estado de la herida y material usado" className={inp} />)}</div>
            </div>
          )}
          {campo(accion.id === "Nota de enfermería" ? "Nota" : "Observaciones", <textarea rows={3} value={f.obs ?? ""} onChange={set("obs")} placeholder={accion.id === "Nota de enfermería" ? "Estado del paciente, educación brindada, novedades…" : "Opcional"} className={inp + " h-auto py-2.5"} />, accion.id === "Nota de enfermería")}
        </div>
        <div className="flex justify-end gap-2 border-t border-border/60 bg-card px-6 py-4">
          <Button type="button" variant="ghost" onClick={onCerrar} className="rounded-xl">Cancelar</Button>
          <Button type="submit" className="rounded-xl"><Check className="size-4" /> Guardar en la historia</Button>
        </div>
      </form>
    </div>,
    document.body,
  );
}


function EstadoNota({ n }: { n: NotaEnfermeria }) {
  return n.estado === "Confirmado" ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-[#0b2a6b]/[.06] px-2 py-0.5 text-[11px] font-semibold text-[#0b2a6b] ring-1 ring-[#0b2a6b]/15 dark:bg-white/10 dark:text-sky-200 dark:ring-white/10"><Check className="size-3" strokeWidth={3} /> Confirmado</span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10"><span className="size-1.5 rounded-full bg-slate-400" /> Pendiente</span>
  );
}

/** Lo que registró enfermería hoy: lo ven la enfermera y los médicos (sincronizado). Aquí se confirma, corrige o elimina. */
function RegistrosEnfHoy({ pacientes, esMedico, abrirHistoria, user, log, soloLectura = false }: { pacientes: PacienteHC[]; esMedico: boolean; abrirHistoria: (id: string) => void; user: SessionUser; log: LogFn; soloLectura?: boolean }) {
  const [notas, setNotas] = useDato<NotaEnfermeria[]>(KEY_NOTAS_ENF, []);
  const hoyIso = isoDe(new Date());
  const deHoy = notas.filter((n) => !n.anulada && diaLocal(n.fecha) === hoyIso).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const vm = useVerMas(deHoy, 6);
  const [sel, setSel] = useState<Set<string>>(() => new Set());
  const [edit, setEdit] = useState<{ id: string; texto: string } | null>(null);
  const puede = !soloLectura;
  const ahora = () => new Date().toISOString();
  const cambiar = (ids: string[], patch: (n: NotaEnfermeria) => Partial<NotaEnfermeria>, accion: string) => {
    setNotas((l) => l.map((n) => (ids.includes(n.id) ? { ...n, ...patch(n) } : n)));
    const quienes = [...new Set(deHoy.filter((n) => ids.includes(n.id)).map((n) => n.paciente))].join(", ");
    log(accion, `${quienes} · ${ids.length} registro${ids.length === 1 ? "" : "s"} de enfermería`);
    setSel(new Set());
  };
  const confirmar = (ids: string[]) => cambiar(ids, () => ({ estado: "Confirmado", confirmadoPor: user.nombre, confirmadoEl: ahora() }), "Registro de enfermería confirmado");
  const pendiente = (ids: string[]) => cambiar(ids, () => ({ estado: "Pendiente" }), "Registro de enfermería marcado pendiente");
  const borrar = async (ids: string[]) => {
    if (!(await preguntar({ titulo: ids.length === 1 ? "¿Eliminar este registro?" : `¿Eliminar ${ids.length} registros?`, texto: "Deja de mostrarse en la historia, pero queda guardado en la auditoría de la clínica." }))) return;
    cambiar(ids, () => ({ anulada: true, anuladaPor: user.nombre, anuladaEl: ahora() }), "Registro de enfermería eliminado");
    toast.success(ids.length === 1 ? "Registro eliminado." : `${ids.length} registros eliminados.`);
  };
  const guardar = () => {
    if (!edit || !edit.texto.trim()) return;
    const { id, texto } = edit;
    cambiar([id], (n) => ({ texto: texto.trim(), textoOriginal: n.textoOriginal ?? n.texto, editadoPor: user.nombre, editadoEl: ahora() }), "Registro de enfermería corregido");
    setEdit(null);
    toast.success("Registro corregido. El texto original queda guardado.");
  };
  const alternar = (id: string) => setSel((s) => { const x = new Set(s); if (x.has(id)) x.delete(id); else x.add(id); return x; });
  const pend = deHoy.filter((n) => n.estado !== "Confirmado").length;
  const btn = "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition";
  const caja = (on: boolean) => `grid size-5 shrink-0 place-items-center rounded-md border transition ${on ? "border-[#0b2a6b] bg-[#0b2a6b] text-white" : "border-slate-300 bg-white text-transparent hover:border-[#0b2a6b]/60 dark:border-white/20 dark:bg-transparent"}`;
  return (
    <Seccion icon={NotebookPen} titulo="Registros de enfermería de hoy" sub={`${deHoy.length} ${deHoy.length === 1 ? "registro" : "registros"} · ${pend ? `${pend} ${pend === 1 ? "pendiente" : "pendientes"} de confirmar` : "todo confirmado"}`}>
      {deHoy.length === 0 ? (
        <Vacio icon={NotebookPen} texto="Todavía no hay registros de enfermería hoy." />
      ) : (
        <>
          {puede && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-2 dark:border-white/10 dark:bg-white/5">
              <button type="button" onClick={() => setSel(sel.size === deHoy.length ? new Set() : new Set(deHoy.map((n) => n.id)))} className={`${btn} text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-white/10`}>
                <span className={caja(sel.size > 0 && sel.size === deHoy.length)}><Check className="size-3.5" strokeWidth={3} /></span>
                {sel.size ? `${sel.size} seleccionado${sel.size === 1 ? "" : "s"}` : "Seleccionar todos"}
              </button>
              {sel.size > 0 && (
                <div className="ml-auto flex flex-wrap gap-1.5">
                  <button type="button" onClick={() => confirmar([...sel])} className={`${btn} bg-[#0b2a6b] text-white shadow-sm hover:bg-[#0a2459]`}><Check className="size-3.5" strokeWidth={3} /> Confirmar</button>
                  <button type="button" onClick={() => pendiente([...sel])} className={`${btn} bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10`}><Clock className="size-3.5" /> Pendiente</button>
                  <button type="button" onClick={() => borrar([...sel])} className={`${btn} text-slate-500 hover:bg-red-50 hover:text-red-700`}><Trash2 className="size-3.5" /> Eliminar</button>
                </div>
              )}
            </div>
          )}
          <ul className="space-y-2.5">
            {vm.items.map((n) => {
              const al = pacientes.find((p) => p.id === n.pacienteId || p.portalId === n.pacienteId)?.ficha?.alergias;
              const on = sel.has(n.id);
              return (
                <li key={n.id} className={`rounded-2xl border bg-card p-3.5 transition ${on ? "border-[#0b2a6b]/50 ring-2 ring-[#0b2a6b]/10" : "border-slate-200 dark:border-white/10"}`}>
                  <div className="flex flex-wrap items-start gap-3">
                    {puede && <button type="button" onClick={() => alternar(n.id)} aria-label="Seleccionar" aria-pressed={on} className={caja(on) + " mt-2.5"}><Check className="size-3.5" strokeWidth={3} /></button>}
                    <Avatar nombre={n.paciente} size="size-10" />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 font-semibold">
                        {n.paciente}
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ${COLOR_NOTA[n.tipo] ?? COLOR_NOTA["Nota de enfermería"]}`}>{n.tipo}</span>
                        <EstadoNota n={n} />
                        {al && <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 ring-1 ring-red-100"><AlertTriangle className="size-3" /> {al}</span>}
                      </p>
                      {edit?.id === n.id ? (
                        <div className="mt-2 space-y-2">
                          <textarea autoFocus rows={3} value={edit.texto} onChange={(e) => setEdit({ id: n.id, texto: e.target.value })} className={inp + " h-auto py-2.5"} />
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={() => setEdit(null)}>Cancelar</Button>
                            <Button type="button" size="sm" className="rounded-lg" onClick={guardar}><Check className="size-4" /> Guardar corrección</Button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{limpiarTextoNota(n.texto)}</p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground">{horaDeIso(n.fecha)} · {nombreCorto(n.enfermera)}{n.editadoPor ? ` · corregido por ${nombreCorto(n.editadoPor)}` : ""}{n.estado === "Confirmado" && n.confirmadoPor ? ` · confirmado por ${nombreCorto(n.confirmadoPor)}` : ""}</p>
                    </div>
                    {esMedico && <Button size="sm" variant="outline" className="rounded-xl" onClick={() => abrirHistoria(n.pacienteId)}><FileText className="size-3.5" /> Ver historia</Button>}
                  </div>
                  {puede && edit?.id !== n.id && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2.5 dark:border-white/10">
                      {n.estado === "Confirmado" ? (
                        <button type="button" onClick={() => pendiente([n.id])} className={`${btn} bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10`}><Clock className="size-3.5" /> Marcar pendiente</button>
                      ) : (
                        <button type="button" onClick={() => confirmar([n.id])} className={`${btn} bg-[#0b2a6b] text-white shadow-sm hover:bg-[#0a2459]`}><Check className="size-3.5" strokeWidth={3} /> Confirmar</button>
                      )}
                      <button type="button" onClick={() => setEdit({ id: n.id, texto: n.texto })} className={`${btn} bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10`}><Pencil className="size-3.5" /> Editar</button>
                      <button type="button" onClick={() => borrar([n.id])} className={`${btn} ml-auto text-slate-500 hover:bg-red-50 hover:text-red-700`}><Trash2 className="size-3.5" /> Eliminar</button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {vm.boton}
        </>
      )}
    </Seccion>
  );
}


/** Dentro de la historia clínica: botones para registrar lo de enfermería de ESTE paciente. */
function RegistrarEnHC({ p, user, log, turnos, pacientes, puede }: { p: PacienteHC; user: SessionUser; log: LogFn; turnos: Turno[]; pacientes: PacienteHC[]; puede: boolean }) {
  const [accion, setAccion] = useState<AccionEnf | null>(null);
  const [signos, setSignos] = useState(false);
  if (!puede) return null;
  return (
    <section className="pn-card pn-up overflow-hidden p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-md"><Syringe className="size-5" /></span>
        <div className="flex-1">
          <p className="font-semibold">Registrar para {p.nombre.split(" ")[0]}</p>
          <p className="text-xs text-muted-foreground">Toque lo que va a registrar. Se guarda en el historial de abajo y lo ven los médicos.</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] gap-2">
        {ACCIONES_ENF.map((a) => (
          <button key={a.id} type="button" onClick={() => (a.id === "signos" ? setSignos(true) : setAccion(a))}
            className="group flex items-center gap-2.5 rounded-xl border border-border/70 bg-card p-2.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white transition-transform group-hover:scale-110" style={{ background: `linear-gradient(140deg, ${a.c}, ${a.c}b3)` }}><a.icon className="size-4" /></span>
            <span className="min-w-0 text-[13px] font-semibold leading-tight [hyphens:auto]" lang="es">{a.t}</span>
          </button>
        ))}
      </div>
      {signos && <VentanaSignos user={user} log={log} turnos={turnos} soloLectura={false} inicial={p.id} onCerrar={() => setSignos(false)} />}
      {accion && <VentanaRegistroEnf accion={accion} user={user} log={log} turnos={turnos} pacientes={pacientes} inicial={p.id} onCerrar={() => setAccion(null)} />}
    </section>
  );
}

/* ---------- Ministerio de Salud: MIPRES y RDA ---------- */
const MIPRES_URL = "https://mipres.sispro.gov.co/MIPRESNOPBS";
const LINKS_MINSALUD = [
  { t: "MIPRES (prescripción no PBS)", u: MIPRES_URL },
  { t: "Mi Seguridad Social (registro de usuarios)", u: "https://www.miseguridadsocial.gov.co/" },
  { t: "SISPRO · registro de usuarios", u: "https://hercules.sispro.gov.co/SecurityWeb2/ALCANCE_USER_ESQ2/RegistrarUsuario.aspx" },
  { t: "Interoperabilidad de la historia clínica (IHCE)", u: "https://www.minsalud.gov.co/ihce/Paginas/Normatividad.aspx" },
];

function MinisterioTab({ user, log, turnos, abrirPaciente }: { user: SessionUser; log: LogFn; turnos: Turno[]; abrirPaciente: (id: string) => void }) {
  const [interop, setInterop] = useDato<Interop>(KEY_INTEROP, {});
  const [f, setF] = useState<Interop>(interop);
  useEffect(() => setF(interop), [interop]);
  const [padron] = useDato<PacienteClinica[]>(KEY_PADRON, []);
  const [evols] = useDato<Evolucion[]>(KEY_EVOLUCIONES, []);
  const pacientes = usePacientesClinica(turnos);
  const [firmas] = useDato<Record<string, string>>(KEY_FIRMAS, {});
  const puede = user.rol === "medico" || user.area === "Dirección general";

  // Calidad de datos para el RDA
  const porId = new Map(padron.map((p) => [p.id, p]));
  const faltan = pacientes
    .map((p) => {
      const pd = porId.get(p.id);
      const f: string[] = [];
      if (!p.dni) f.push("documento");
      if (!p.ficha?.nacimiento || edadDe(p.ficha.nacimiento) === null) f.push("fecha de nacimiento");
      if (!pd?.sexo) f.push("sexo");
      return { p, f };
    })
    .filter((x) => x.f.length > 0);
  const sinCie = evols.filter((e) => !(e.cie10 ?? []).some((c) => c.codigo));
  const rmFaltan = ADMINS.filter((a) => !firmas[`rm:${a.id}`]?.trim());

  const pasos: { t: string; d: string; ok: boolean }[] = [
    { t: "Inscripción en el REPS", d: "HEGO (o cada médico) debe figurar como prestador habilitado.", ok: !!f.habilitacion },
    { t: "NIT del prestador", d: "El NIT de la clínica o el documento del profesional independiente.", ok: !!f.nit },
    { t: "Delegado administrativo", d: "La persona que pide las llaves en SISPRO a nombre del prestador.", ok: !!f.delegado },
    { t: "Llaves de interoperabilidad (IHCE)", d: "Las da el Ministerio. Se cargan en el servidor como dato secreto, no aquí.", ok: f.llaves === "Recibidas" },
    { t: "Registro médico de cada doctor", d: "Se carga en Receta digital → Firma y sello.", ok: rmFaltan.length === 0 },
    { t: "Datos completos de los pacientes", d: "Documento, fecha de nacimiento y sexo.", ok: faltan.length === 0 },
    { t: "Diagnóstico CIE-10 en cada consulta", d: "El RDA exige el diagnóstico codificado.", ok: sinCie.length === 0 },
  ];
  const hechos = pasos.filter((p) => p.ok).length;

  const guardar = (e: FormEvent) => {
    e.preventDefault();
    const limpio: Interop = { ...f, nit: f.nit?.trim() ?? "", habilitacion: f.habilitacion?.trim() ?? "", delegado: f.delegado?.trim() ?? "", actualizado: new Date().toISOString(), por: user.nombre };
    setInterop(() => limpio);
    log("Datos del prestador actualizados", [limpio.nit, limpio.habilitacion].filter(Boolean).join(" · "));
    toast.success("Datos guardados");
  };

  return (
    <div className="space-y-5">
      <section className="pn-up relative overflow-hidden rounded-[1.6rem] gradient-deep p-6 text-white shadow-[0_30px_60px_-35px_rgba(10,25,70,.9)]">
        <div className="pn-cross pointer-events-none absolute inset-0 opacity-60" />
        <span className="pn-orb pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-amber-400/30 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-5">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/25 backdrop-blur"><Landmark className="size-8" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">Colombia · Ministerio de Salud</p>
            <h3 className="font-display text-2xl font-semibold tracking-tight">Conexión con el Ministerio</h3>
            <p className="mt-1 max-w-2xl text-sm text-white/75">Desde abril de 2026 cada consulta debe generar un Resumen Digital de Atención (RDA) y enviarse al Ministerio. El panel ya guarda la historia clínica; falta que la clínica obtenga las llaves para activar el envío.</p>
          </div>
          <div className="text-right">
            <p className="font-display text-4xl font-semibold">{hechos}/{pasos.length}</p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/60">pasos listos</p>
          </div>
        </div>
        <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-400 transition-all" style={{ width: `${(hechos / pasos.length) * 100}%` }} /></div>
        <div className="relative mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
          <span className={`rounded-full px-3 py-1 ring-1 ${f.llaves === "Recibidas" ? "bg-emerald-400/20 text-emerald-100 ring-emerald-300/30" : "bg-amber-400/20 text-amber-100 ring-amber-300/30"}`}>RDA: {f.llaves === "Recibidas" ? "listo para activar el envío" : "esperando llaves del Ministerio"}</span>
          <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-100 ring-1 ring-emerald-300/30">MIPRES: se usa desde la web del Ministerio</span>
          <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-100 ring-1 ring-emerald-300/30">Recetas comunes: listas (firma, sello y R.M.)</span>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
        <Seccion icon={ListChecks} titulo="Qué falta" sub="Se actualiza solo a medida que completan los datos">
          <ol className="space-y-2">
            {pasos.map((p, i) => (
              <li key={p.t} className={`flex items-start gap-3 rounded-xl px-3 py-2.5 ring-1 ${p.ok ? "bg-emerald-50/70 ring-emerald-200 dark:bg-emerald-500/5 dark:ring-emerald-500/20" : "bg-card ring-border"}`}>
                <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${p.ok ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground"}`}>{p.ok ? <Check className="size-3.5" /> : i + 1}</span>
                <div className="min-w-0"><p className="text-sm font-semibold">{p.t}</p><p className="text-xs text-muted-foreground">{p.d}</p></div>
              </li>
            ))}
          </ol>
        </Seccion>

        <div className="space-y-5">
          <Seccion icon={Building2} titulo="Datos del prestador" sub={interop.actualizado ? `Actualizado por ${interop.por} · ${fechaHora(interop.actualizado)}` : "Los pide el Ministerio para habilitar la conexión"}>
            <form onSubmit={guardar} className="grid gap-3 sm:grid-cols-2">
              <Campo label="Tipo de prestador">
                <select disabled={!puede} value={f.tipo ?? "IPS"} onChange={(e) => setF({ ...f, tipo: e.target.value as NonNullable<Interop["tipo"]> })} className={inp}>
                  <option value="IPS">IPS (la clínica)</option><option value="Profesional independiente">Profesional independiente</option>
                </select>
              </Campo>
              <Campo label="NIT"><input disabled={!puede} value={f.nit ?? ""} onChange={(e) => setF({ ...f, nit: e.target.value })} placeholder="900.000.000-0" className={inp} /></Campo>
              <Campo label="Código de habilitación (REPS)"><input disabled={!puede} value={f.habilitacion ?? ""} onChange={(e) => setF({ ...f, habilitacion: e.target.value })} placeholder="Ej.: 080010000001" className={inp} /></Campo>
              <Campo label="Delegado administrativo"><input disabled={!puede} value={f.delegado ?? ""} onChange={(e) => setF({ ...f, delegado: e.target.value })} placeholder="Nombre de quien hace el trámite" className={inp} /></Campo>
              <Campo label="Llaves de interoperabilidad" className="sm:col-span-2">
                <select disabled={!puede} value={f.llaves ?? "Sin solicitar"} onChange={(e) => setF({ ...f, llaves: e.target.value as NonNullable<Interop["llaves"]> })} className={inp}>
                  <option>Sin solicitar</option><option>Solicitadas</option><option>Recibidas</option>
                </select>
              </Campo>
              {puede && <div className="sm:col-span-2"><Button type="submit" className="rounded-xl"><Check className="size-4" /> Guardar datos</Button></div>}
            </form>
            {f.llaves === "Recibidas" && (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200">Avísenle al desarrollador: la llave se carga como variable secreta del servidor y ahí se activa el envío automático del RDA. No la escriban en el panel ni por chat.</p>
            )}
          </Seccion>

          <Seccion icon={Globe} titulo="Accesos del Ministerio" sub="Se abren en una pestaña nueva">
            <div className="grid gap-2">
              {LINKS_MINSALUD.map((l) => (
                <a key={l.u} href={l.u} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1 ring-border transition hover:bg-secondary">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 text-white"><Landmark className="size-4" /></span>
                  <span className="flex-1 text-sm font-medium">{l.t}</span>
                  <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
                </a>
              ))}
            </div>
          </Seccion>
        </div>
      </div>

      <Seccion icon={ClipboardList} titulo="Datos que faltan para el RDA" sub="Complételos para que cada consulta se pueda enviar al Ministerio">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl p-4 ring-1 ring-border">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Pacientes incompletos</p>
            <p className="mt-1 font-display text-3xl font-semibold">{faltan.length}</p>
            <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto">
              {faltan.slice(0, 30).map(({ p, f: fx }) => (
                <li key={p.id}><button onClick={() => abrirPaciente(p.id)} className="w-full rounded-lg px-2 py-1.5 text-left text-xs hover:bg-secondary"><b>{p.nombre}</b><span className="block text-muted-foreground">Falta: {fx.join(", ")}</span></button></li>
              ))}
              {faltan.length === 0 && <li className="text-xs text-emerald-600">Todos completos.</li>}
            </ul>
          </div>
          <div className="rounded-2xl p-4 ring-1 ring-border">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Consultas sin CIE-10</p>
            <p className="mt-1 font-display text-3xl font-semibold">{sinCie.length}</p>
            <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto">
              {sinCie.slice(0, 30).map((e) => (
                <li key={e.id}><button onClick={() => abrirPaciente(e.pacienteId)} className="w-full rounded-lg px-2 py-1.5 text-left text-xs hover:bg-secondary"><b>{e.paciente}</b><span className="block text-muted-foreground">{fechaDe(e.fecha)} · {e.doctor}</span></button></li>
              ))}
              {sinCie.length === 0 && <li className="text-xs text-emerald-600">Todas con diagnóstico codificado.</li>}
            </ul>
          </div>
          <div className="rounded-2xl p-4 ring-1 ring-border">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Médicos sin registro (R.M.)</p>
            <p className="mt-1 font-display text-3xl font-semibold">{rmFaltan.length}</p>
            <ul className="mt-2 space-y-1">
              {rmFaltan.map((a) => <li key={a.id} className="rounded-lg px-2 py-1.5 text-xs"><b>{a.nombre}</b><span className="block text-muted-foreground">Cargarlo en Receta digital → Firma y sello</span></li>)}
              {rmFaltan.length === 0 && <li className="text-xs text-emerald-600">Todos cargados.</li>}
            </ul>
          </div>
        </div>
      </Seccion>
    </div>
  );
}

/* ---------- Asistente de IA por voz (médicos y Dirección) ---------- */
/** Abre el asistente desde cualquier parte del panel, opcionalmente con un texto sugerido. */
const abrirIA = (texto?: string) => window.dispatchEvent(new CustomEvent("gb-abrir-ia", { detail: texto ?? "" }));

type MsgIA = { id: string; de: "yo" | "ia"; texto: string; audio?: boolean; acciones?: AccionIA[]; estado?: "pendiente" | "hecho" | "descartado" };

const SUGERENCIAS_IA = [
  "Atiendo de lunes a viernes de 8 a 12, citas de 20 minutos",
  "¿Qué pacientes tengo mañana?",
  "¿Qué horarios libres tengo el lunes?",
  "Me voy de vacaciones del 20 al 27 de diciembre",
  "Dele una cita a Ana Ruiz el lunes a las 9, teléfono 3001234567",
];

function AsistenteVoz({ user, log }: { user: SessionUser; log: LogFn }) {
  const [abierto, setAbierto] = useState(false);
  const [msgs, setMsgs] = useState<MsgIA[]>([]);
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const [grabando, setGrabando] = useState(false);
  const [segs, setSegs] = useState(0);
  const [voz, setVoz] = useState(() => {
    try { return localStorage.getItem("gb_ia_voz") !== "0"; } catch { return true; }
  });
  const rec = useRef<MediaRecorder | null>(null);
  const partes = useRef<Blob[]>([]);
  const reloj = useRef<number | null>(null);
  const fin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const f = (e: Event) => {
      setAbierto(true);
      const t = (e as CustomEvent<string>).detail;
      if (t) setTexto(t);
    };
    window.addEventListener("gb-abrir-ia", f);
    return () => window.removeEventListener("gb-abrir-ia", f);
  }, []);
  useEffect(() => fin.current?.scrollIntoView({ behavior: "smooth", block: "end" }), [msgs, pensando]);
  useEffect(() => () => { if (reloj.current) window.clearInterval(reloj.current); }, []);

  const hablar = (t: string) => {
    if (!voz || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(t.replace(/[*_#`]/g, ""));
      u.lang = "es-CO";
      const es = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("es"));
      if (es) u.voice = es;
      window.speechSynthesis.speak(u);
    } catch { /* sin voz */ }
  };

  const preguntar = async (entrada: { texto?: string; audio?: string }) => {
    if (pensando) return;
    const historial = msgs.slice(-8).map((m) => ({ de: m.de, texto: m.texto }));
    if (entrada.texto) setMsgs((m) => [...m, { id: uid(), de: "yo", texto: entrada.texto! }]);
    setTexto("");
    setPensando(true);
    try {
      const r = await asistenteIA({ data: { ...entrada, historial } });
      if (!r.ok) {
        setMsgs((m) => [...m, { id: uid(), de: "ia", texto: r.error }]);
        return;
      }
      setMsgs((m) => [
        ...m,
        ...(r.transcripcion ? [{ id: uid(), de: "yo" as const, texto: r.transcripcion, audio: true }] : []),
        { id: uid(), de: "ia", texto: r.respuesta, ...(r.acciones.length ? { acciones: r.acciones, estado: "pendiente" as const } : {}) },
      ]);
      if (entrada.audio) hablar(r.respuesta);
    } catch {
      setMsgs((m) => [...m, { id: uid(), de: "ia", texto: "No me pude conectar. Revise la conexión e intente de nuevo." }]);
    } finally {
      setPensando(false);
    }
  };

  const grabar = async () => {
    if (grabando) {
      rec.current?.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("Este navegador no permite grabar audio. Escriba el pedido.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const tipo = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t));
      const r = new MediaRecorder(stream, tipo ? { mimeType: tipo } : undefined);
      partes.current = [];
      r.ondataavailable = (e) => e.data.size && partes.current.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (reloj.current) window.clearInterval(reloj.current);
        setGrabando(false);
        const blob = new Blob(partes.current, { type: r.mimeType || "audio/webm" });
        if (blob.size < 1500) {
          toast.error("El audio quedó muy corto. Mantenga la grabación un poco más.");
          return;
        }
        const fr = new FileReader();
        fr.onload = () => void preguntar({ audio: String(fr.result).split(",")[1] ?? "" });
        fr.readAsDataURL(blob);
      };
      rec.current = r;
      r.start();
      setSegs(0);
      setGrabando(true);
      window.speechSynthesis?.cancel();
      reloj.current = window.setInterval(() => setSegs((x) => {
        if (x + 1 >= 120) rec.current?.stop();
        return x + 1;
      }), 1000);
    } catch {
      toast.error("Necesito permiso para usar el micrófono. Actívelo en el navegador.");
    }
  };

  const confirmar = async (m: MsgIA) => {
    if (!m.acciones) return;
    setMsgs((x) => x.map((y) => (y.id === m.id ? { ...y, estado: "hecho" } : y)));
    const r = await ejecutarIA({ data: { acciones: m.acciones } }).catch(() => null);
    if (!r || !r.ok) {
      toast.error(r && !r.ok ? r.error : "No se pudo guardar.");
      setMsgs((x) => x.map((y) => (y.id === m.id ? { ...y, estado: "pendiente" } : y)));
      return;
    }
    await refrescarAgendaYCitas();
    r.hechas.forEach((h) => log("Cambio hecho con la IA", h));
    if (r.hechas.length) toast.success(r.hechas.length === 1 ? "Listo, guardado." : `Listo: ${r.hechas.length} cambios guardados.`);
    const aviso = r.errores.length ? `No pude hacer: ${r.errores.join(" · ")}` : "Listo, quedó guardado. Ya se ve en la agenda y en la web.";
    setMsgs((x) => [...x, { id: uid(), de: "ia", texto: aviso }]);
  };

  const mmss = `${Math.floor(segs / 60)}:${String(segs % 60).padStart(2, "0")}`;

  return (
    <>
      {!abierto && (
        <button onClick={() => setAbierto(true)} aria-label="Asistente de IA" className="group fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-600 p-1.5 pr-4 text-white shadow-[0_18px_40px_-12px_rgba(124,58,237,.8)] transition hover:-translate-y-0.5 lg:bottom-6 lg:right-6">
          <span className="relative flex size-11 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
            <Mic className="relative size-5" />
          </span>
          <span className="text-left leading-tight"><span className="block text-sm font-semibold">Asistente IA</span><span className="block text-[10px] text-white/75">Háblele o escríbale</span></span>
        </button>
      )}

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/30 backdrop-blur-[2px] sm:p-4" onClick={() => !grabando && setAbierto(false)}>
          <div onClick={(e) => e.stopPropagation()} className="flex h-[88dvh] w-full flex-col overflow-hidden rounded-t-[1.6rem] bg-card shadow-2xl ring-1 ring-border animate-in slide-in-from-bottom-6 duration-300 sm:h-[min(720px,90dvh)] sm:max-w-md sm:rounded-[1.6rem]">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-700 to-fuchsia-700 px-5 py-4 text-white">
              <span className="pointer-events-none absolute -right-10 -top-16 size-44 rounded-full bg-white/15 blur-2xl" />
              <div className="relative flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25"><Sparkles className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Asistente IA</p>
                  <p className="truncate text-[11px] text-white/75">Agenda, horarios y citas · {nombreCorto(user.nombre)}</p>
                </div>
                <button onClick={() => { const v = !voz; setVoz(v); try { localStorage.setItem("gb_ia_voz", v ? "1" : "0"); } catch { /* */ } if (!v) window.speechSynthesis?.cancel(); }} aria-label={voz ? "Silenciar respuestas" : "Leer respuestas en voz alta"} className="rounded-xl p-2 hover:bg-white/15">{voz ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}</button>
                <button onClick={() => { window.speechSynthesis?.cancel(); setAbierto(false); }} aria-label="Cerrar" className="rounded-xl p-2 hover:bg-white/15"><X className="size-4" /></button>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-secondary/30 p-4">
              {msgs.length === 0 && (
                <div className="space-y-3">
                  <p className="rounded-2xl bg-card p-3 text-sm leading-relaxed ring-1 ring-border">Hola, {nombreCorto(user.nombre)}. Toque el micrófono y dígame lo que necesita: sus horarios, vacaciones, dar o mover citas, o qué pacientes tiene. <b>Nada se guarda hasta que usted toque Confirmar.</b></p>
                  <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Por ejemplo</p>
                  {SUGERENCIAS_IA.map((q) => (
                    <button key={q} onClick={() => void preguntar({ texto: q })} className="block w-full rounded-xl bg-card px-3 py-2.5 text-left text-sm ring-1 ring-border transition hover:ring-violet-300">“{q}”</button>
                  ))}
                </div>
              )}
              {msgs.map((m) => (
                <div key={m.id} className={`flex ${m.de === "yo" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1 duration-200`}>
                  <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${m.de === "yo" ? "rounded-br-sm bg-gradient-to-br from-indigo-600 to-violet-700 text-white" : "rounded-bl-sm bg-card ring-1 ring-border"}`}>
                    {m.audio && <p className="mb-0.5 flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/70"><Mic className="size-3" /> Audio</p>}
                    <p className="whitespace-pre-line">{m.texto}</p>
                    {m.acciones && (
                      <div className="mt-2.5 space-y-1.5 rounded-xl bg-violet-50 p-2.5 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:ring-violet-500/30">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-700 dark:text-violet-300">Para confirmar</p>
                        {m.acciones.map((x, i) => <p key={i} className="flex gap-1.5 text-[13px]"><Check className="mt-0.5 size-3.5 shrink-0 text-violet-600" />{x.descripcion}</p>)}
                        {m.estado === "pendiente" && (
                          <div className="flex gap-2 pt-1">
                            <button onClick={() => void confirmar(m)} className="flex-1 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-700 py-2 text-xs font-semibold text-white">Confirmar</button>
                            <button onClick={() => setMsgs((x) => x.map((y) => (y.id === m.id ? { ...y, estado: "descartado" } : y)))} className="rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground ring-1 ring-border">Descartar</button>
                          </div>
                        )}
                        {m.estado === "hecho" && <p className="pt-1 text-xs font-semibold text-emerald-700">Guardado</p>}
                        {m.estado === "descartado" && <p className="pt-1 text-xs text-muted-foreground">Descartado</p>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {pensando && <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Pensando…</div>}
              <div ref={fin} />
            </div>

            <div className="border-t border-border bg-card p-3">
              {grabando ? (
                <div className="flex items-center gap-3">
                  <span className="flex h-8 flex-1 items-center justify-center gap-1">
                    {Array.from({ length: 18 }, (_, i) => <span key={i} className="w-1 rounded-full bg-gradient-to-t from-violet-500 to-fuchsia-500 [animation:pn-ola_0.9s_ease-in-out_infinite]" style={{ height: `${30 + ((i * 37) % 60)}%`, animationDelay: `${i * 0.06}s` }} />)}
                  </span>
                  <span className="w-12 text-center font-mono text-sm tabular-nums text-rose-600">{mmss}</span>
                  <button onClick={() => void grabar()} aria-label="Terminar y enviar" className="flex size-14 items-center justify-center rounded-full bg-rose-500 text-white shadow-[0_10px_24px_-8px_rgba(244,63,94,.9)]"><Square className="size-5 fill-current" /></button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); if (texto.trim()) void preguntar({ texto: texto.trim() }); }} className="flex items-center gap-2">
                  <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escriba o toque el micrófono…" className={inp + " h-12 flex-1 rounded-full px-4"} />
                  {texto.trim() ? (
                    <button type="submit" disabled={pensando} aria-label="Enviar" className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 text-white disabled:opacity-50"><Send className="size-5" /></button>
                  ) : (
                    <button type="button" disabled={pensando} onClick={() => void grabar()} aria-label="Grabar audio" className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-600 text-white shadow-[0_12px_28px_-10px_rgba(124,58,237,.9)] disabled:opacity-50"><Mic className="size-6" /></button>
                  )}
                </form>
              )}
              <p className="mt-2 text-center text-[10px] text-muted-foreground">La IA propone; usted confirma. Puede equivocarse: revise antes de confirmar.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ===================================================================== */
/* Carga masiva de pacientes (listados de EPS, convenios, empresas)       */
/* ===================================================================== */

type CampoImp = "nombre" | "apellido" | "tipoDoc" | "dni" | "eps" | "afiliado" | "telefono" | "email" | "nacimiento" | "sexo" | "domicilio";
const CAMPOS_IMP: { id: CampoImp; label: string; obligatorio?: boolean; claves: string[] }[] = [
  { id: "nombre", label: "Nombre(s) o nombre completo", obligatorio: true, claves: ["nombre completo", "nombres y apellidos", "apellidos y nombres", "nombre y apellido", "nombres", "nombre", "paciente", "afiliado nombre", "usuario", "beneficiario", "primer nombre"] },
  { id: "apellido", label: "Apellido(s)", claves: ["apellidos", "apellido", "primer apellido"] },
  { id: "tipoDoc", label: "Tipo de documento", claves: ["tipo documento", "tipo de documento", "tipo doc", "tipo id", "tipo identificacion", "tipodoc", "td"] },
  { id: "dni", label: "Número de documento", obligatorio: true, claves: ["numero documento", "numero de documento", "no documento", "nro documento", "documento", "identificacion", "numero identificacion", "cedula", "cc", "id", "num doc", "nro doc"] },
  { id: "eps", label: "EPS / aseguradora / convenio", claves: ["eps", "aseguradora", "entidad", "empresa", "convenio", "eapb", "administradora", "obra social", "prepagada", "plan"] },
  { id: "afiliado", label: "Régimen o N.º de afiliación", claves: ["regimen", "tipo afiliado", "numero afiliacion", "afiliacion", "carnet", "no afiliado", "categoria", "nivel"] },
  { id: "telefono", label: "Celular / teléfono", claves: ["celular", "telefono", "movil", "whatsapp", "tel", "contacto"] },
  { id: "email", label: "Correo", claves: ["correo", "email", "e-mail", "correo electronico", "mail"] },
  { id: "nacimiento", label: "Fecha de nacimiento", claves: ["fecha nacimiento", "fecha de nacimiento", "nacimiento", "f nacimiento", "fec nac", "fecha nac"] },
  { id: "sexo", label: "Sexo", claves: ["sexo", "genero", "género"] },
  { id: "domicilio", label: "Dirección", claves: ["direccion", "dirección", "domicilio", "residencia", "barrio", "municipio", "ciudad"] },
];
const normCol = (x: unknown) => String(x ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

/** Adivina qué columna del archivo corresponde a cada dato. */
function adivinarColumnas(encabezados: string[]): Partial<Record<CampoImp, number>> {
  const out: Partial<Record<CampoImp, number>> = {};
  const usados = new Set<number>();
  const hs = encabezados.map(normCol);
  for (const c of CAMPOS_IMP) {
    for (const clave of c.claves) {
      const k = normCol(clave);
      const i = hs.findIndex((h, j) => !usados.has(j) && (h === k || (k.length > 3 && h.includes(k))));
      if (i >= 0) {
        out[c.id] = i;
        usados.add(i);
        break;
      }
    }
  }
  return out;
}

const tipoDocDe = (x: string) => {
  const v = normCol(x).replace(/ /g, "");
  if (!v) return undefined;
  if (/^(cc|cedula|cedulaciudadania|cedulade ciudadania)/.test(v) || v === "cedulaciudadania") return "CC";
  if (/^(ti|tarjeta)/.test(v)) return "TI";
  if (/^(rc|registro)/.test(v)) return "RC";
  if (/^(ce|cedulaextranjeria|extranjeria)/.test(v)) return "CE";
  if (/^(pa|pasaporte)/.test(v)) return "PA";
  if (/^(ppt|pep|permiso)/.test(v)) return "PPT";
  return TIPOS_DOC.some(([k]) => k === x.trim().toUpperCase()) ? x.trim().toUpperCase() : "CC";
};
const sexoDe = (x: string): PacienteClinica["sexo"] => {
  const v = normCol(x);
  if (/^(f|fem|mujer)/.test(v)) return "F";
  if (/^(m|masc|hombre|varon)/.test(v)) return "M";
  return v ? "X" : undefined;
};
const fechaImp = (x: unknown): string | undefined => {
  if (x instanceof Date && !Number.isNaN(x.getTime())) return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  const t = String(x ?? "").trim();
  let m = t.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return `${m[1]}-${m[2]!.padStart(2, "0")}-${m[3]!.padStart(2, "0")}`;
  m = t.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (m) return `${m[3]}-${m[2]!.padStart(2, "0")}-${m[1]!.padStart(2, "0")}`;
  return undefined;
};
const tituloNombre = (x: string) => x.toLowerCase().replace(/\s+/g, " ").trim().replace(/(^|\s)(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase());

type FilaImp = { fila: number; p: PacienteClinica | null; error?: string; existe?: boolean };

function ImportarPacientes({ user, log, existentes, onCerrar, onImportar }: { user: SessionUser; log: LogFn; existentes: PacienteClinica[]; onCerrar: () => void; onImportar: (nuevos: PacienteClinica[], actualizar: boolean) => void }) {
  const [archivo, setArchivo] = useState<string>("");
  const [hojas, setHojas] = useState<{ nombre: string; filas: unknown[][] }[]>([]);
  const [hoja, setHoja] = useState(0);
  const [inicio, setInicio] = useState(0);
  const [mapa, setMapa] = useState<Partial<Record<CampoImp, number>>>({});
  const [epsTodos, setEpsTodos] = useState("");
  const [actualizar, setActualizar] = useState(true);
  const [leyendo, setLeyendo] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filas = hojas[hoja]?.filas ?? [];
  const encabezados = (filas[inicio] ?? []).map((x) => String(x ?? "").trim());

  /** Busca la fila de títulos (a veces el archivo trae logos o títulos arriba). */
  const elegirHoja = (lista: { nombre: string; filas: unknown[][] }[], i: number) => {
    const fs = lista[i]?.filas ?? [];
    let mejor = 0;
    let puntos = -1;
    fs.slice(0, 15).forEach((f, j) => {
      const n = Object.keys(adivinarColumnas(f.map((x) => String(x ?? "")))).length;
      if (n > puntos) {
        puntos = n;
        mejor = j;
      }
    });
    setHoja(i);
    setInicio(mejor);
    setMapa(adivinarColumnas((fs[mejor] ?? []).map((x) => String(x ?? ""))));
  };

  const leer = async (f: File) => {
    setLeyendo(true);
    try {
      let lista: { nombre: string; filas: unknown[][] }[];
      if (/\.json$/i.test(f.name)) {
        const datos = JSON.parse(await f.text()) as unknown;
        const arr = (Array.isArray(datos) ? datos : Object.values(datos as object).find(Array.isArray) ?? []) as Record<string, unknown>[];
        const cols = [...new Set(arr.flatMap((o) => Object.keys(o ?? {})))];
        lista = [{ nombre: "Datos", filas: [cols, ...arr.map((o) => cols.map((c) => o?.[c] ?? ""))] }];
      } else {
        const XLSX = await import("@e965/xlsx");
        const wb = XLSX.read(await f.arrayBuffer(), { type: "array", cellDates: true, codepage: 65001 });
        lista = wb.SheetNames.map((n) => ({ nombre: n, filas: XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[n]!, { header: 1, raw: true, defval: "", blankrows: false }) })).filter((h) => h.filas.length > 0);
      }
      if (!lista.length) throw new Error("vacío");
      setArchivo(f.name);
      setHojas(lista);
      const conDatos = lista.reduce((b, h, i) => (h.filas.length > (lista[b]?.filas.length ?? 0) ? i : b), 0);
      elegirHoja(lista, conDatos);
    } catch {
      toast.error("No se pudo leer el archivo. Pruebe guardarlo como Excel (.xlsx) o CSV.");
    } finally {
      setLeyendo(false);
    }
  };

  const porDoc = useMemo(() => new Map(existentes.map((p) => [p.dni.replace(/\W/g, "").toUpperCase(), p])), [existentes]);

  const procesadas: FilaImp[] = useMemo(() => {
    const vistos = new Set<string>();
    const val = (fila: unknown[], c: CampoImp): unknown => (mapa[c] === undefined ? "" : fila[mapa[c]!]);
    const txt = (fila: unknown[], c: CampoImp) => String(val(fila, c) ?? "").trim();
    return filas.slice(inicio + 1).map((fila, i) => {
      const nombre = tituloNombre(`${txt(fila, "nombre")} ${txt(fila, "apellido")}`);
      const dniCrudo = txt(fila, "dni").replace(/\.0$/, "");
      const dni = dniCrudo.replace(/[^\dA-Za-z]/g, "").toUpperCase();
      const n = i + inicio + 2;
      if (!nombre && !dni) return { fila: n, p: null, error: "Fila vacía" };
      if (nombre.length < 3) return { fila: n, p: null, error: "Falta el nombre" };
      if (dni.length < 4) return { fila: n, p: null, error: "Falta el documento" };
      if (vistos.has(dni)) return { fila: n, p: null, error: "Documento repetido en el archivo" };
      vistos.add(dni);
      const previo = porDoc.get(dni);
      const tel = txt(fila, "telefono").replace(/\.0$/, "");
      const correo = txt(fila, "email").toLowerCase();
      const td = tipoDocDe(txt(fila, "tipoDoc")) ?? previo?.tipoDoc ?? "CC";
      const nac = fechaImp(val(fila, "nacimiento"));
      const sx = sexoDe(txt(fila, "sexo"));
      const p: PacienteClinica = {
        ...(previo ?? { id: nuevoId(), antecedentes: [], creado: new Date().toISOString(), medicoCabecera: user.nombre }),
        nombre: previo && !actualizar ? previo.nombre : nombre,
        dni,
        tipoDoc: td,
        ...(tel ? { telefono: tel } : {}),
        ...(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) ? { email: correo } : {}),
        ...((txt(fila, "eps") || epsTodos.trim()) ? { obraSocial: txt(fila, "eps") || epsTodos.trim() } : {}),
        ...(txt(fila, "afiliado") ? { afiliado: txt(fila, "afiliado") } : {}),
        ...(nac ? { nacimiento: nac } : {}),
        ...(sx ? { sexo: sx } : {}),
        ...(txt(fila, "domicilio") ? { domicilio: txt(fila, "domicilio") } : {}),
      };
      return { fila: n, p, existe: !!previo };
    }).filter((x) => x.error !== "Fila vacía");
  }, [filas, inicio, mapa, epsTodos, actualizar, porDoc, user.nombre]);

  const validas = procesadas.filter((x) => x.p);
  const nuevos = validas.filter((x) => !x.existe).length;
  const yaEstan = validas.length - nuevos;
  const errores = procesadas.filter((x) => x.error);
  const faltaObligatorio = mapa.nombre === undefined || mapa.dni === undefined;

  const importar = () => {
    const lista = validas.filter((x) => actualizar || !x.existe).map((x) => x.p!);
    if (!lista.length) return;
    onImportar(lista, actualizar);
    log("Carga masiva de pacientes", `${archivo} · ${nuevos} nuevos${actualizar && yaEstan ? ` · ${yaEstan} actualizados` : ""}${epsTodos ? ` · ${epsTodos}` : ""}`);
    toast.success(`Listo: ${nuevos} paciente${nuevos === 1 ? "" : "s"} nuevo${nuevos === 1 ? "" : "s"}${actualizar && yaEstan ? ` y ${yaEstan} actualizado${yaEstan === 1 ? "" : "s"}` : ""}.`);
    onCerrar();
  };

  const plantilla = async () => {
    const XLSX = await import("@e965/xlsx");
    const ws = XLSX.utils.aoa_to_sheet([
      ["Tipo de documento", "Número de documento", "Nombres", "Apellidos", "EPS", "Régimen", "Celular", "Correo", "Fecha de nacimiento", "Sexo", "Dirección"],
      ["CC", "1002240625", "María Fernanda", "López Gómez", "Nueva EPS", "Contributivo", "3001234567", "maria@correo.com", "1975-04-23", "F", "Cra 10 # 20-30, Valledupar"],
    ]);
    ws["!cols"] = Array(11).fill({ wch: 20 });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pacientes");
    XLSX.writeFile(wb, "Plantilla pacientes HEGO.xlsx");
  };

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Cargar pacientes desde un archivo">
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm animate-in fade-in duration-200" onClick={onCerrar} />
      <div className="pn-root relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[1.75rem] bg-background shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 sm:rounded-[1.75rem]">
        <div className="relative flex items-center justify-between gap-3 overflow-hidden gradient-deep px-6 py-5 text-white">
          <div className="pn-cross pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25"><FileSpreadsheet className="size-5" /></span>
            <div>
              <p className="text-lg font-semibold">Cargar pacientes desde un archivo</p>
              <p className="text-xs text-white/70">Listados de EPS, convenios o empresas: Excel, CSV, ODS, TXT o JSON</p>
            </div>
          </div>
          <button onClick={onCerrar} className="relative rounded-xl p-2 text-white/80 hover:bg-white/15" aria-label="Cerrar"><X className="size-5" /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          {!hojas.length ? (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
                onDragLeave={() => setArrastrando(false)}
                onDrop={(e) => { e.preventDefault(); setArrastrando(false); const f = e.dataTransfer.files[0]; if (f) void leer(f); }}
                className={`flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 py-14 text-center transition-colors ${arrastrando ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/40"}`}
              >
                <span className="grid size-16 place-items-center rounded-3xl bg-primary/10 text-primary">{leyendo ? <Loader2 className="size-7 animate-spin" /> : <Upload className="size-7" />}</span>
                <span className="text-base font-semibold">{leyendo ? "Leyendo el archivo…" : "Arrastre el archivo aquí o toque para elegirlo"}</span>
                <span className="text-sm text-muted-foreground">.xlsx · .xls · .csv · .ods · .txt · .json — el sistema reconoce solo las columnas</span>
              </button>
              <input ref={inputRef} type="file" hidden accept=".xlsx,.xls,.xlsm,.xlsb,.ods,.csv,.tsv,.txt,.json,.xml,.numbers" onChange={(e) => { const f = e.target.files?.[0]; if (f) void leer(f); e.target.value = ""; }} />
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["1", "Suba el archivo", "Tal como se lo manda la EPS o la empresa."],
                  ["2", "Revise las columnas", "El sistema las reconoce; usted puede corregirlas."],
                  ["3", "Importe", "Los repetidos no se duplican: se actualizan."],
                ].map(([n, t, d]) => (
                  <div key={n} className="rounded-2xl bg-secondary/50 p-4 dark:bg-white/5">
                    <span className="grid size-7 place-items-center rounded-full gradient-deep text-xs font-bold text-white">{n}</span>
                    <p className="mt-2 text-sm font-semibold">{t}</p>
                    <p className="text-xs text-muted-foreground">{d}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => void plantilla()} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><Download className="size-4" /> Descargar plantilla de Excel de ejemplo</button>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-secondary/50 p-3 dark:bg-white/5">
                <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600"><FileSpreadsheet className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{archivo}</p>
                  <p className="text-xs text-muted-foreground">{procesadas.length} filas con datos</p>
                </div>
                {hojas.length > 1 && (
                  <select value={hoja} onChange={(e) => elegirHoja(hojas, Number(e.target.value))} className={inp + " h-10 w-auto"}>
                    {hojas.map((h, i) => <option key={h.nombre} value={i}>Hoja: {h.nombre}</option>)}
                  </select>
                )}
                <Button variant="outline" className="h-10 rounded-xl" onClick={() => { setHojas([]); setArchivo(""); }}><RefreshCw className="size-4" /> Otro archivo</Button>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold">¿Qué columna es cada dato?</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {CAMPOS_IMP.map((c) => (
                    <label key={c.id} className="min-w-0 space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">{c.label}{c.obligatorio && <span className="text-rose-500"> *</span>}</span>
                      <select value={mapa[c.id] ?? ""} onChange={(e) => setMapa({ ...mapa, [c.id]: e.target.value === "" ? undefined : Number(e.target.value) })} className={`${inp} ${mapa[c.id] !== undefined ? "!border-emerald-300 dark:!border-emerald-500/40" : ""}`}>
                        <option value="">— No viene en el archivo —</option>
                        {encabezados.map((h, i) => <option key={i} value={i}>{h || `Columna ${i + 1}`}</option>)}
                      </select>
                    </label>
                  ))}
                  {mapa.eps === undefined && (
                    <label className="min-w-0 space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">EPS para todos los de este archivo</span>
                      <input value={epsTodos} onChange={(e) => setEpsTodos(e.target.value)} placeholder="Ej.: Nueva EPS" className={inp} />
                    </label>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Si el archivo trae nombre y apellido juntos, elija esa columna en "Nombre" y deje "Apellido" vacío.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:ring-emerald-500/20"><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Nuevos</p><p className="font-display text-3xl font-semibold text-emerald-800 dark:text-emerald-200">{faltaObligatorio ? "—" : nuevos}</p></div>
                <div className="rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100 dark:bg-sky-500/10 dark:ring-sky-500/20"><p className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">Ya estaban</p><p className="font-display text-3xl font-semibold text-sky-800 dark:text-sky-200">{faltaObligatorio ? "—" : yaEstan}</p></div>
                <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100 dark:bg-amber-500/10 dark:ring-amber-500/20"><p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">Con problemas</p><p className="font-display text-3xl font-semibold text-amber-800 dark:text-amber-200">{faltaObligatorio ? "—" : errores.length}</p></div>
              </div>

              {faltaObligatorio ? (
                <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700 ring-1 ring-rose-100 dark:bg-rose-500/10 dark:text-rose-300">Elija arriba la columna del <b>nombre</b> y la del <b>número de documento</b>: son las dos obligatorias.</p>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-2xl border border-border dark:border-white/10">
                    <table className="w-full min-w-[640px] text-sm">
                      <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground dark:bg-white/5">
                        <tr><th className="px-3 py-2">Paciente</th><th className="px-3 py-2">Documento</th><th className="px-3 py-2">EPS</th><th className="px-3 py-2">Celular</th><th className="px-3 py-2">Estado</th></tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 dark:divide-white/5">
                        {validas.slice(0, 8).map(({ p, existe, fila }) => (
                          <tr key={fila}>
                            <td className="px-3 py-2 font-medium">{p!.nombre}</td>
                            <td className="px-3 py-2 tabular-nums">{p!.tipoDoc} {p!.dni}</td>
                            <td className="px-3 py-2">{p!.obraSocial ?? "—"}</td>
                            <td className="px-3 py-2 tabular-nums">{p!.telefono ?? "—"}</td>
                            <td className="px-3 py-2">{existe ? <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">Se actualiza</span> : <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Nuevo</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {validas.length > 8 && <p className="border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">… y {validas.length - 8} más</p>}
                  </div>
                  {errores.length > 0 && (
                    <details className="rounded-2xl bg-amber-50/60 p-3 text-sm ring-1 ring-amber-100 dark:bg-amber-500/5 dark:ring-amber-500/20">
                      <summary className="cursor-pointer font-semibold text-amber-800 dark:text-amber-300">{errores.length} fila{errores.length === 1 ? "" : "s"} no se van a importar (ver cuáles)</summary>
                      <ul className="mt-2 max-h-40 space-y-0.5 overflow-y-auto text-xs text-amber-900 dark:text-amber-200">
                        {errores.slice(0, 200).map((e) => <li key={e.fila}>Fila {e.fila}: {e.error}</li>)}
                      </ul>
                    </details>
                  )}
                  {yaEstan > 0 && (
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={actualizar} onChange={(e) => setActualizar(e.target.checked)} className="size-4 accent-[var(--primary)]" />
                      Actualizar los {yaEstan} que ya estaban con los datos del archivo (EPS, celular, correo…)
                    </label>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {hojas.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 bg-card/80 px-5 py-4 dark:border-white/10">
            <Button variant="ghost" className="rounded-xl" onClick={onCerrar}>Cancelar</Button>
            <Button className="h-11 rounded-xl px-6 shadow-md" disabled={faltaObligatorio || !(nuevos + (actualizar ? yaEstan : 0))} onClick={importar}>
              <Upload className="size-4" /> Importar {faltaObligatorio ? "" : nuevos + (actualizar ? yaEstan : 0)} paciente{nuevos + (actualizar ? yaEstan : 0) === 1 ? "" : "s"}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
