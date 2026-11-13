import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type FormEvent, type PointerEvent as RPointerEvent, type ReactNode, type SetStateAction, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { subirAudioServidor } from "@/lib/servidor";
import { Electro } from "@/components/site/PublicLayout";
import fondoRinonesPanel from "@/assets/fondo-rinones.jpg";
import fondoCorazonPanel from "@/assets/fondo-corazon.jpg";
import type { LucideIcon } from "lucide-react";
import {
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
  UserRound,
  ChevronLeft,
  Pin,
  Palette,
  Megaphone,
  MessagesSquare,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-provider";
import {
  ADMINS,
  ADMIN_IDS,
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
  KEY_CONTROLES,
  clasificarPresion,
  clasificarFevi,
  ANTECEDENTES,
  KEY_PADRON,
  KEY_RECETAS,
  KEY_FIRMAS,
  KEY_LAB,
  KEY_FACTURAS,
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
import { MODULOS, SEED_PERMISOS, nivelDe, mk, type Nivel, type Permisos } from "@/lib/permisos";
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
type Turno = { id: string; fecha: string; hora: string; paciente: string; doctor: string; motivo: string; estado: Estado; telefono?: string; email?: string; origen?: "web" | "panel" | "portal"; pacienteId?: string };
type Mov = { id: string; fecha: string; concepto: string; tipo: "Ingreso" | "Egreso"; monto: number };
type Tab = "resumen" | "turnos" | "triage" | "padron" | "historia" | "recetas" | "laboratorio" | "horarios" | "pacientes" | "finanzas" | "facturacion" | "analitica" | "automatizaciones" | "permisos" | "asistente" | "auditoria" | "sitio" | "comunicacion";
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
  { nombre: "Facturación", desc: "Cobros, obras sociales y comprobantes", icon: Receipt },
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
const dinero = (n: number) => "$ " + n.toLocaleString("es-AR");
const fechaCorta = (iso: string) => iso.split("-").reverse().join("/");
const fechaHora = (iso: string) => new Date(iso).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const SEED_TURNOS: Turno[] = [];
const IDS_EJEMPLO = ["t1", "t2", "t3", "t4"];

const SEED_MOVS: Mov[] = [
  { id: "m1", fecha: hoy(), concepto: "Consultas de la mañana", tipo: "Ingreso", monto: 185000 },
  { id: "m2", fecha: hoy(), concepto: "Estudios de ecocardiografía", tipo: "Ingreso", monto: 120000 },
  { id: "m3", fecha: hoy(), concepto: "Insumos médicos", tipo: "Egreso", monto: 48000 },
  { id: "m4", fecha: hoy(), concepto: "Servicios del consultorio", tipo: "Egreso", monto: 32000 },
];


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
  "h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15";

const NAV: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "turnos", label: "Turnos", icon: CalendarDays },
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
      { id: "turnos", label: "Agenda y turnos", icon: CalendarDays, tono: "text-sky-300" },
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
          { id: "obras", label: "Obras sociales" },
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
      { id: "sitio", label: "Sitio web", icon: Globe, tono: "text-sky-300" },
      { id: "permisos", label: "Permisos y accesos", icon: KeyRound, tono: "text-violet-300" },
      { id: "auditoria", label: "Auditoría", icon: ClipboardList, tono: "text-slate-300" },
    ],
  },
];

const TITULOS: Record<Tab, [string, string]> = {
  resumen: ["Resumen general", "Vista rápida de la actividad de la clínica."],
  turnos: ["Turnos", "La agenda de cada doctor: quién tomó cada horario y qué queda libre."],
  triage: ["Enfermería – Triage", "Toma de signos vitales y clasificación de pacientes antes de la consulta médica."],
  padron: ["Pacientes", "Padrón de pacientes: datos, cobertura, antecedentes y accesos rápidos."],
  recetas: ["Receta digital", "Recetas con tu firma digitalizada, código de verificación y envío por WhatsApp."],
  laboratorio: ["Laboratorio", "Pedidos, órdenes firmadas y resultados con valores fuera de rango marcados."],
  facturacion: ["Facturación", "Comprobantes, cobros por facturar y liquidación de obras sociales."],
  analitica: ["Analítica y reportes", "Indicadores de la clínica, clínicos y reportes para descargar."],
  automatizaciones: ["Automatizaciones", "Recordatorios, alertas clínicas y avisos que se preparan solos."],
  historia: ["Historia Clínica", "Historia clínica general: evoluciones, signos vitales, diagnósticos CIE-10 e indicaciones."],
  comunicacion: ["Comunicación interna", "Chat del equipo: avisos, novedades y coordinación del día."],
  horarios: ["Mis horarios", "Días, horarios y vacaciones de cada doctor: se publican en la web."],
  pacientes: ["Portal del paciente", "Accesos de pacientes y autorizaciones."],
  finanzas: ["Finanzas", "Cobros a pacientes, control de la caja e ingresos y egresos de la clínica."],
  permisos: ["Permisos", "Definí qué puede ver y hacer cada departamento."],
  asistente: ["Asistente IA", "Consultas rápidas sobre turnos, finanzas, permisos y actividad."],
  auditoria: ["Auditoría", "Registro de todas las acciones realizadas en el panel."],
  sitio: ["Sitio web", "Datos de contacto, horario de la clínica y música de espera que se ven en la web."],
};

/* ---------- Panel principal ---------- */
function Panel() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [tab, setTab] = useState<Tab>("resumen");
  const [menu, setMenu] = useState(false);
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({});
  const [finVista, setFinVista] = useState<VistaFin>("cobros");
  const [factVista, setFactVista] = useState<VistaFact>("comprobantes");
  const [pacSel, setPacSel] = useState<string | null>(null);
  const [focoTurnos, setFocoTurnos] = useState<FocoTurnos>(null);
  const [turnos, setTurnosDato] = useDato<Turno[]>("gb_turnos", SEED_TURNOS);
  const setTurnos = useCallback((v: SetStateAction<Turno[]>) => setTurnosDato((p) => (typeof v === "function" ? (v as (x: Turno[]) => Turno[])(p) : v)), [setTurnosDato]);
  const [movs, setMovsDato] = useDato<Mov[]>("gb_movs", SEED_MOVS);
  const setMovs = useCallback((v: SetStateAction<Mov[]>) => setMovsDato((p) => (typeof v === "function" ? (v as (x: Mov[]) => Mov[])(p) : v)), [setMovsDato]);
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
        toast.error("Tu sesión venció. Volvé a ingresar.");
        navigate({ to: "/login" });
        return;
      }
      setUser(v);
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
  if (!user) return null;

  // Permisos: enfermería ve solo los módulos habilitados en Permisos → Enfermería
  // Cualquier persona del equipo que no es médico usa los permisos de su área
  const esEnf = user.rol !== "medico";
  const areaUsuario = user.area ?? "Enfermería";
  const nivelEnf = (m: string) => nivelDe(permisos, areaUsuario, m);
  const TABS_ENF: Tab[] = [
    ...(areaUsuario === "Dirección general" ? (["resumen"] as Tab[]) : []),
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
  const fechaLarga = ahora.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  const hora = ahora.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

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
              <p className="text-[11px] capitalize text-white/55">{fechaLarga}</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-semibold text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-400" /> En línea
            </span>
          </div>
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
    <div className="pn-root isolate min-h-screen bg-[#f4f7fc] text-foreground lg:grid lg:grid-cols-[280px_1fr] dark:bg-[#070d1a]" style={{ ["--acc" as string]: FONDOS[tab].a }}>
      <style>{`
        @keyframes pn-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pn-orb { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(18px,-24px) scale(1.15); } }
        @keyframes pn-ring { 0% { transform: scale(1); opacity: .7; } 100% { transform: scale(2.4); opacity: 0; } }
        @keyframes pn-wave { 0%,60%,100% { transform: rotate(0deg); } 10%,30% { transform: rotate(14deg); } 20%,40% { transform: rotate(-8deg); } }
        @keyframes pn-dot { 0%,80%,100% { opacity: .25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
        @keyframes pn-bar { from { width: 0; } }
        @keyframes pn-shine { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
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
        .pn-card { border: 1px solid transparent; background: linear-gradient(var(--color-card), color-mix(in oklab, var(--color-card) 96%, rgb(var(--acc))) ) padding-box, linear-gradient(160deg, rgba(var(--acc),.45), rgba(203,213,225,.7) 28%, rgba(226,232,240,.8) 72%, rgba(var(--acc),.28)) border-box; transition: transform .45s cubic-bezier(.22,1,.36,1), box-shadow .45s cubic-bezier(.22,1,.36,1); }
        .pn-card::before { content: ""; position: absolute; top: 0; left: 14%; right: 14%; height: 1px; background: linear-gradient(90deg, transparent, rgba(var(--acc),.8), transparent); pointer-events: none; }
        .pn-card { box-shadow: inset 0 1px 0 rgba(255,255,255,.95), 0 1px 1px rgba(15,23,42,.04), 0 2px 6px rgba(15,23,42,.04), 0 14px 28px -10px rgba(15,23,42,.10), 0 34px 70px -30px rgba(var(--acc),.35); }
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
                <p className="text-sm capitalize text-deep-foreground/70">{fechaLarga}</p>
                <h1 className="text-2xl font-semibold sm:text-3xl">
                  {saludo(ahora)}, {corto}
                </h1>
                <p className="mt-1 text-sm text-deep-foreground/75">
                  {esEnf && esAreaMedica(areaUsuario)
                    ? `Panel médico · ${areaUsuario}. Atendé a tus pacientes desde la Historia Clínica.`
                    : esEnf && areaUsuario !== "Enfermería"
                    ? `Panel de ${areaUsuario}: ves los módulos que tu área tiene habilitados.`
                    : esEnf
                    ? `Hay ${turnos.filter((t) => t.fecha === isoDe(new Date()) && t.estado !== "Cancelado").length} pacientes con turno hoy. Registrá sus signos vitales antes de la consulta.`
                    : pendientes > 0
                    ? `Tenés ${pendientes} turno${pendientes === 1 ? "" : "s"} pendiente${pendientes === 1 ? "" : "s"} de confirmar.`
                    : "Todo al día: no hay turnos pendientes."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ThemeToggle className="size-10 rounded-xl bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20 hover:text-white" />
              {!esEnf && <CampanaPanel turnos={turnos} user={user} irA={setTab} />}
              {!esEnf && <Button onClick={() => setTab("asistente")} variant="outline" className="rounded-xl !border-white/25 !bg-white/10 text-deep-foreground hover:!bg-white/20 hover:text-deep-foreground">
                <Bot className="size-4" /> Preguntar a la IA
              </Button>}
              {!esEnf && <Button onClick={() => setTab("turnos")} className="rounded-xl !bg-white text-[var(--deep)] hover:!bg-white/90">
                <Plus className="size-4" /> Nuevo turno
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
          <section className="pn-card p-6"><Vacio icon={KeyRound} titulo="Sin módulos habilitados" texto={`Pedile a un médico que te habilite módulos en Permisos → ${areaUsuario}.`} /></section>
        )}
        {(!esEnf || TABS_ENF.length > 0) && tabVisible === "resumen" && <Resumen turnos={turnos} movs={movs} audit={audit} irA={setTab} abrirTurnos={(f) => { setFocoTurnos(f); irTab("turnos"); }} />}
        {tabVisible === "turnos" && soloLectura("turnos") && <TurnosLectura turnos={turnos} />}
        {tabVisible === "turnos" && !soloLectura("turnos") && <TurnosTab key={focoTurnos ?? "t"} turnos={turnos} setTurnos={setTurnos} log={log} foco={focoTurnos} />}
        {tabVisible === "triage" && <TriageTab user={user} log={log} turnos={turnos} esMedico={!esEnf || esAreaMedica(user.area)} soloLectura={soloLectura("triage")} abrirHistoria={(id) => abrirPaciente("historia", id)} />}
        {tabVisible === "padron" && <PadronTab key={pacSel ?? "pad"} user={user} log={log} turnos={turnos} abrir={abrirPaciente} inicial={pacSel} soloLectura={soloLectura("padron")} />}
        {tabVisible === "historia" && <HistoriaTab key={pacSel ?? "hc"} user={user} log={log} turnos={turnos} inicial={pacSel} soloLectura={soloLectura("historia") || (esEnf && !esAreaMedica(user.area))} />}
        {tabVisible === "recetas" && <RecetasTab key={pacSel ?? "rx"} user={user} log={log} turnos={turnos} inicial={pacSel} />}
        {tabVisible === "laboratorio" && <LaboratorioTab key={pacSel ?? "lab"} user={user} log={log} turnos={turnos} inicial={pacSel} />}
        {tabVisible === "facturacion" && <FacturacionTab user={user} log={log} turnos={turnos} vista={factVista} setVista={setFactVista} />}
        {tabVisible === "analitica" && <AnaliticaTab log={log} turnos={turnos} />}
        {tabVisible === "automatizaciones" && <AutomatizacionesTab log={log} turnos={turnos} irA={irTab} />}
        {tabVisible === "horarios" && <HorariosTab user={user} log={log} puedeEditarOtros={!soloLectura("horarios")} />}
        {tabVisible === "pacientes" && <PacientesTab user={user} log={log} turnos={turnos} />}
        {tabVisible === "finanzas" && <FinanzasTab movs={movs} setMovs={setMovs} log={log} turnos={turnos} user={user} vista={finVista} setVista={setFinVista} />}
        {tabVisible === "permisos" && <PermisosTab permisos={permisos} setPermisos={setPermisos} log={log} user={user} />}
        {tabVisible === "asistente" && <AsistenteTab turnos={turnos} movs={movs} permisos={permisos} audit={audit} log={log} user={user} />}
        {tabVisible === "auditoria" && <AuditoriaTab audit={audit} log={log} />}
        {tabVisible === "sitio" && <SitioTab log={log} />}
        {tabVisible === "comunicacion" && <ComunicacionTab user={user} log={log} />}
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

  const ahora = Date.now();
  const nombreP = (id: string) => pacientes.find((p) => p.id === id)?.nombre ?? "Paciente";
  const items: Notif[] = [
    ...turnos
      .filter((t) => t.estado === "Pendiente" && (t.origen === "web" || t.origen === "portal") && t.fecha >= hoy())
      .map((t) => ({ id: `turno-${t.id}`, titulo: `Nuevo turno ${t.origen === "portal" ? "desde el portal" : "desde la web"}`, texto: `${t.paciente} · ${fechaCorta(t.fecha)} ${t.hora} · ${nombreCorto(t.doctor)}`, icon: CalendarCheck, tono: "azul" as Tono, tab: "turnos" as Tab, fecha: `${t.fecha}T${t.hora}` })),
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
                      <span className="block truncate text-xs text-muted-foreground">{n.texto}</span>
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
  analitica: { a: "217,119,6", b: "56,132,246", c: "16,185,129" },
  automatizaciones: { a: "234,88,12", b: "225,29,72", c: "139,92,246" },
  historia: { a: "225,29,72", b: "56,132,246", c: "14,165,233" },
  horarios: { a: "13,148,136", b: "14,165,233", c: "16,185,129" },
  pacientes: { a: "219,39,119", b: "139,92,246", c: "56,132,246" },
  finanzas: { a: "16,185,129", b: "14,165,233", c: "20,184,166" },
  permisos: { a: "139,92,246", b: "79,70,229", c: "56,132,246" },
  asistente: { a: "99,102,241", b: "168,85,247", c: "14,165,233" },
  auditoria: { a: "79,70,229", b: "56,132,246", c: "100,116,139" },
  sitio: { a: "14,165,233", b: "56,132,246", c: "236,72,153" },
  comunicacion: { a: "14,165,233", b: "139,92,246", c: "16,185,129" },
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
  return nombre;
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
  "from-sky-500 to-blue-700",
  "from-violet-500 to-indigo-700",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-600",
  "from-rose-500 to-pink-700",
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
    <section className={`pn-card pn-up p-6 ${className}`} style={{ animationDelay: `${delay}s` }}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <span className="pn-acc-tile flex size-10 items-center justify-center rounded-xl text-white">
            <Icon className="size-[18px]" />
          </span>
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight">{titulo}</h3>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
        </div>
        {acciones}
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
      className={`pn-card pn-lift pn-up group block w-full overflow-hidden p-5 text-left ${onClick ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--acc))]" : ""} ${activo ? "ring-2 ring-[rgba(var(--acc),.55)]" : ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={`pointer-events-none absolute -right-10 -top-10 size-36 rounded-full ${t.glow} blur-2xl transition-transform duration-700 group-hover:scale-150`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <p className="mt-2 truncate font-display text-[1.9rem] font-semibold leading-none tabular-nums">{value}</p>
          {hint && <p className={`mt-2 text-xs font-medium ${t.text}`}>{hint}</p>}
        </div>
        <span className={`relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${t.tile} text-white shadow-lg ring-4 ring-white/60 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110`}>
          <Icon className="size-5" />
        </span>
      </div>
      <svg viewBox="0 0 300 36" preserveAspectRatio="none" className="relative mt-4 h-8 w-full opacity-70 transition-opacity group-hover:opacity-100" aria-hidden="true">
        <polyline points="0,20 60,20 75,20 85,8 95,30 105,20 170,20 180,20 190,3 200,34 210,20 300,20" fill="none" stroke={TONO_HEX[tono]} strokeOpacity=".22" strokeWidth="2" strokeLinejoin="round" />
        <polyline
          className="pn-pulse"
          style={{ animationDelay: `${delay * 4}s`, filter: `drop-shadow(0 0 4px ${TONO_HEX[tono]})` }}
          points="0,20 60,20 75,20 85,8 95,30 105,20 170,20 180,20 190,3 200,34 210,20 300,20"
          fill="none"
          stroke={TONO_HEX[tono]}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {desglose && (
        <div className="relative mt-3 grid grid-cols-3 gap-2 border-t border-border/60 pt-3">
          {desglose.map((d) => (
            <div key={d.l} className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{d.l}</p>
              <p className="font-display text-lg font-semibold tabular-nums">{d.v}</p>
            </div>
          ))}
        </div>
      )}
      {onClick && (
        <p className={`relative mt-3 inline-flex items-center gap-1 text-xs font-semibold ${t.text}`}>
          {accion ?? (activo ? "Ocultar detalle" : "Ver detalle")} {accion ? <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" /> : <ChevronDown className={`size-3.5 transition-transform ${activo ? "rotate-180" : ""}`} />}
        </p>
      )}
    </Raiz>
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
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
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
      className="pn-up group relative w-full overflow-hidden rounded-[1.4rem] border border-violet-100 bg-gradient-to-br from-white via-white to-fuchsia-50 p-5 text-left shadow-[0_18px_40px_-28px_rgba(124,58,237,.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-26px_rgba(124,58,237,.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 dark:border-violet-500/20 dark:from-[#151a33] dark:via-[#151a33] dark:to-[#2a1640]"
    >
      <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-fuchsia-300/25 blur-2xl transition-transform duration-500 group-hover:scale-125" />
      <div className="relative flex items-start justify-between gap-3">
        <p className="pt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">{label}</p>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-[0_10px_22px_-8px_rgba(192,38,211,.75)] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
          <Icon className="size-5" />
        </span>
      </div>
      <p className="relative mt-1 font-display text-4xl font-bold tabular-nums text-violet-600 dark:text-violet-300">{valor}</p>
      <div className="relative mt-1 flex items-center justify-between gap-2">
        <p className="text-sm text-slate-500 dark:text-slate-300">{detalle}</p>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-violet-300">
          Ver agenda <ArrowRight className="size-3.5" />
        </span>
      </div>
    </button>
  );
}

const plural = (n: number, palabra: string) => `${n} ${palabra}${n === 1 ? "" : "s"}`;

type FocoTurnos = "agenda" | "procedimientos" | null;

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
          detalle={`${plural(deHoy.filter((t) => t.estado === "Confirmado").length, "confirmado")} · ${plural(deHoy.filter((t) => t.estado === "Pendiente").length, "pendiente")}`}
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
        <Seccion icon={CalendarCheck} titulo="Próximos turnos" sub="Pendientes y confirmados" delay={0.25} className="xl:col-span-3"
          acciones={<Button size="sm" variant="ghost" className="rounded-lg text-primary" onClick={() => irA("turnos")}>Ver agenda <ArrowUpRight className="size-4" /></Button>}>
          {proximos.length === 0 && <Vacio icon={CalendarDays} titulo="Agenda libre" texto="Todavía no hay turnos. Los que se reserven desde la web o se creen acá van a aparecer en esta lista." accion={<Button onClick={() => irA("turnos")} className="rounded-xl"><Plus className="size-4" /> Crear turno</Button>} />}
          <div className="space-y-2">
            {proximos.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl border border-transparent p-2.5 transition-colors hover:border-border hover:bg-secondary/40">
                <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-secondary py-1.5">
                  <span className="text-sm font-bold tabular-nums text-primary">{t.hora}</span>
                  <span className="text-[10px] text-muted-foreground">{fechaCorta(t.fecha).slice(0, 5)}</span>
                </div>
                <Avatar nombre={t.paciente} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{t.paciente}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.motivo} · {nombreCorto(t.doctor)}</p>
                </div>
                <Estadito estado={t.estado} />
              </div>
            ))}
          </div>
        </Seccion>

        <div className="space-y-6 xl:col-span-2">
          <Seccion icon={Activity} titulo="Estado de la agenda" sub={`${turnos.length} turnos en total`} delay={0.3}>
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
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">turnos</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {turnos.length
                  ? `${Math.round((conteo.find((c) => c.e === "Confirmado")!.n / totalT) * 100)}% de la agenda está confirmada.`
                  : "Cuando haya turnos vas a ver acá cómo se reparten por estado."}
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
            {audit.length === 0 && <Vacio icon={ClipboardList} titulo="Sin actividad" texto="Acá vas a ver cada acción del panel." />}
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
  if (n && n.length <= 10) n = "549" + n.replace(/^0/, "");
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}

function AgendaDia({ turnos, setTurnos, log, onCargaManual }: { turnos: Turno[]; setTurnos: Dispatch<SetStateAction<Turno[]>>; log: LogFn; onCargaManual: () => void }) {
  const [agendas] = useDato<Agendas>(KEY_AGENDA, {});
  const [dia, setDia] = useState(hoy());
  const [asignando, setAsignando] = useState<string | null>(null); // "doctor|hora"
  const [rapido, setRapido] = useState({ paciente: "", telefono: "", motivo: "Consulta" });
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

  const columnas = profesionalesAgenda(agendas).filter((p) => p.admin || agendaDe(agendas, p.id).dias.length > 0).map((a) => {
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
    log("Turno actualizado", `${t.paciente}: ${t.estado} → ${estado}`);
    toast.success(`${t.paciente}: ${estado.toLowerCase()}.`);
  };

  const asignar = (doctor: string, hora: string) => {
    if (!rapido.paciente.trim()) {
      toast.error("Escribí el nombre del paciente.");
      return;
    }
    const nuevo: Turno = {
      id: uid(),
      fecha: dia,
      hora,
      paciente: rapido.paciente.trim(),
      doctor,
      motivo: rapido.motivo.trim() || "Consulta",
      estado: "Confirmado",
      origen: "panel",
      ...(rapido.telefono.trim() ? { telefono: rapido.telefono.trim() } : {}),
    };
    setTurnos((p) => [...p, nuevo]);
    log("Turno creado", `${nuevo.paciente} · ${fechaCorta(dia)} ${hora} · ${doctor}`);
    toast.success("Turno asignado.");
    setAsignando(null);
    setRapido({ paciente: "", telefono: "", motivo: "Consulta" });
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
          <a href={waDe(t.telefono, `Hola ${t.paciente.split(" ")[0]}, te escribimos del Centro HEGO por tu turno del ${fechaCorta(t.fecha)} a las ${t.hora}.`)} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="rounded-lg p-1.5 text-emerald-600 opacity-60 transition-opacity hover:bg-emerald-50 group-hover:opacity-100">
            <Send className="size-3.5" />
          </a>
        )}
        {t.estado !== "Atendido" && (
          <button onClick={() => cambiar(t, "Cancelado")} aria-label="Cancelar turno" className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100">
            <Ban className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <section className="pn-card pn-up overflow-hidden">
      {/* Encabezado con navegación de días */}
      <div className="border-b border-border/60 p-6 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="pn-acc-tile flex size-11 items-center justify-center rounded-2xl text-white"><CalendarDays className="size-5" /></span>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Agenda del día</h3>
              <p className="text-sm capitalize text-muted-foreground">{new Date(dia + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}{esHoy ? " · hoy" : ""}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-xl" onClick={() => mover(-1)} aria-label="Día anterior"><ChevronDown className="size-4 rotate-90" /></Button>
            {!esHoy && <Button variant="outline" className="rounded-xl" onClick={() => setDia(hoy())}>Hoy</Button>}
            <input type="date" value={dia} onChange={(e) => e.target.value && setDia(e.target.value)} className="h-9 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary" />
            <Button variant="outline" size="icon" className="rounded-xl" onClick={() => mover(1)} aria-label="Día siguiente"><ChevronDown className="size-4 -rotate-90" /></Button>
            <Button onClick={onCargaManual} className="rounded-xl"><Plus className="size-4" /> Cargar turno</Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1.5">
          {semana.map((d) => {
            const f = new Date(d + "T12:00:00");
            const n = turnos.filter((t) => t.fecha === d && t.estado !== "Cancelado").length;
            const on = d === dia;
            return (
              <button key={d} onClick={() => { setDia(d); setAsignando(null); }} className={`flex flex-col items-center rounded-xl py-2 transition-all ${on ? "pn-acc-tile text-white" : "hover:bg-secondary"}`}>
                <span className={`text-[10px] font-semibold uppercase ${on ? "text-white/80" : "text-muted-foreground"}`}>{f.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "")}</span>
                <span className="font-display text-lg font-semibold leading-tight">{f.getDate()}</span>
                <span className={`mt-0.5 h-4 min-w-4 rounded-full px-1 text-[10px] font-bold leading-4 ${n ? (on ? "bg-white/25" : "bg-[rgba(var(--acc),.15)] text-[rgb(var(--acc))]") : "opacity-0"}`}>{n}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            { l: "Turnos", v: ocupados, c: "text-foreground" },
            { l: "Confirmados", v: confirmados, c: "text-sky-700" },
            { l: "Pendientes", v: pendientes, c: "text-amber-700" },
            { l: "Atendidos", v: atendidos, c: "text-emerald-700" },
            { l: "Libres", v: Math.max(0, totalSlots - columnas.reduce((acc, c) => acc + c.suyos.filter((t) => c.slots.includes(t.hora)).length, 0)), c: "text-muted-foreground" },
          ].map((x) => (
            <div key={x.l} className="rounded-xl bg-secondary/50 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{x.l}</p>
              <p className={`font-display text-xl font-semibold tabular-nums ${x.c}`}>{x.v}</p>
            </div>
          ))}
        </div>
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
                  <p className="truncate text-xs text-muted-foreground">{atiende ? `${ag.desde} a ${ag.hasta}` : "No atiende este día"}</p>
                </div>
                {atiende && <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">{suyos.length}/{slots.length}</span>}
              </div>

              {!atiende && (
                <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
                  {bloqueo ? <>No atiende: <b>{bloqueo.motivo}</b></> : !ag.activo ? "Agenda pausada." : "Este día no está en su agenda."}
                </div>
              )}

              {atiende && (
                <div className="space-y-1.5">
                  {slots.map((h) => {
                    const t = suyos.find((x) => x.hora === h);
                    const clave = `${a.nombre}|${h}`;
                    const pasado = esHoy && h < hhmm && h !== actual;
                    return (
                      <div key={h} className={`flex gap-3 ${pasado && !t ? "opacity-45" : ""}`}>
                        <div className="w-12 shrink-0 pt-3 text-right">
                          <span className={`text-xs font-semibold tabular-nums ${h === actual ? "" : "text-muted-foreground"}`} style={h === actual ? { color: `rgb(var(--acc))` } : undefined}>{h}</span>
                          {h === actual && <span className="block text-[9px] font-bold uppercase" style={{ color: `rgb(var(--acc))` }}>Ahora</span>}
                        </div>
                        <div className="min-w-0 flex-1">
                          {t ? (
                            <FilaPaciente t={t} ahoraEs={h === actual} />
                          ) : asignando === clave ? (
                            <div className="space-y-2 rounded-2xl border border-[rgba(var(--acc),.4)] bg-[rgba(var(--acc),.05)] p-3 animate-in fade-in duration-200">
                              <div className="grid gap-2 sm:grid-cols-2">
                                <input autoFocus placeholder="Paciente" value={rapido.paciente} onChange={(e) => setRapido({ ...rapido, paciente: e.target.value })} className={inp + " h-9"} />
                                <input placeholder="WhatsApp (opcional)" value={rapido.telefono} onChange={(e) => setRapido({ ...rapido, telefono: e.target.value })} className={inp + " h-9"} />
                              </div>
                              <div className="flex gap-2">
                                <input placeholder="Motivo" value={rapido.motivo} onChange={(e) => setRapido({ ...rapido, motivo: e.target.value })} className={inp + " h-9 flex-1"} />
                                <Button size="sm" className="h-9 rounded-xl" onClick={() => asignar(a.nombre, h)}><Check className="size-4" /> Asignar</Button>
                                <Button size="sm" variant="ghost" className="h-9 rounded-xl" onClick={() => setAsignando(null)}>Cancelar</Button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => { setAsignando(clave); setRapido({ paciente: "", telefono: "", motivo: "Consulta" }); }} disabled={pasado}
                              className={`group flex w-full items-center justify-between rounded-2xl border border-dashed px-4 py-3 text-left text-sm transition-all ${h === actual ? "border-[rgba(var(--acc),.5)]" : "border-border"} ${pasado ? "cursor-default" : "hover:border-[rgba(var(--acc),.5)] hover:bg-[rgba(var(--acc),.04)]"}`}>
                              <span className="text-muted-foreground">Libre</span>
                              {!pasado && <span className="inline-flex items-center gap-1 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100" style={{ color: `rgb(var(--acc))` }}><Plus className="size-3.5" /> Asignar paciente</span>}
                            </button>
                          )}
                        </div>
                      </div>
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
                        <span className="w-12 shrink-0 pt-3 text-right text-xs font-semibold tabular-nums text-muted-foreground">{t.hora}</span>
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

function TurnosTab({ turnos, setTurnos, log, foco = null }: { turnos: Turno[]; setTurnos: Dispatch<SetStateAction<Turno[]>>; log: LogFn; foco?: FocoTurnos }) {
  const [procHoy, setProcHoy] = useState(foco === "procedimientos");
  useEffect(() => {
    if (!foco) return;
    const id = foco === "procedimientos" ? "lista-turnos" : "agenda-hoy";
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    return () => window.clearTimeout(t);
  }, [foco]);
  const [f, setF] = useState({ fecha: hoy(), hora: "", paciente: "", telefono: "", doctor: ADMINS[0]!.nombre, motivo: "" });
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
      toast.error("Elegí un horario.");
      return;
    }
    if (turnos.some((t) => t.doctor === f.doctor && t.fecha === f.fecha && t.hora === f.hora && t.estado !== "Cancelado")) {
      toast.error("Ese horario ya está ocupado para ese profesional.");
      return;
    }
    const nuevo: Turno = {
      id: uid(),
      fecha: f.fecha,
      hora: f.hora,
      paciente: f.paciente.trim(),
      doctor: f.doctor,
      motivo: f.motivo.trim(),
      estado: "Pendiente",
      origen: "panel",
      ...(f.telefono.trim() ? { telefono: f.telefono.trim() } : {}),
    };
    setTurnos((p) => [...p, nuevo]);
    log("Turno creado", `${nuevo.paciente} · ${fechaCorta(nuevo.fecha)} ${nuevo.hora} · ${nuevo.doctor}`);
    toast.success("Turno creado.");
    setF({ ...f, hora: "", paciente: "", telefono: "", motivo: "" });
  };

  const cambiarEstado = (t: Turno, estado: Estado) => {
    setTurnos((p) => p.map((x) => (x.id === t.id ? { ...x, estado } : x)));
    log("Turno actualizado", `${t.paciente}: ${t.estado} → ${estado}`);
  };

  const borrar = (t: Turno) => {
    setTurnos((p) => p.filter((x) => x.id !== t.id));
    log("Turno eliminado", `${t.paciente} · ${fechaCorta(t.fecha)} ${t.hora}`);
  };

  const filtros: ("Todos" | Estado)[] = ["Todos", ...ESTADOS];

  return (
    <div className="space-y-6">
      <div id="agenda-hoy" className="scroll-mt-24" />
      <AgendaDia turnos={turnos} setTurnos={setTurnos} log={log} onCargaManual={() => { setManual(true); window.setTimeout(() => document.getElementById("carga-manual")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }} />

      {!manual && (
        <button onClick={() => setManual(true)} className="pn-card flex w-full items-center gap-4 p-5 text-left transition-transform hover:-translate-y-0.5">
          <span className="pn-acc-tile flex size-11 items-center justify-center rounded-2xl text-white"><Plus className="size-5" /></span>
          <span className="flex-1">
            <span className="block font-semibold">Cargar un turno manualmente</span>
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
                <h3 className="text-lg font-semibold tracking-tight">Nuevo turno</h3>
                <p className="text-xs text-muted-foreground">Elegí profesional, día y horario libre. Se crea como pendiente hasta confirmarlo.</p>
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
                      <span className="text-[10px] font-semibold uppercase opacity-80">{d === hoy() ? "Hoy" : fecha.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "")}</span>
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
                <input type="time" value={f.hora} onChange={(e) => setF({ ...f, hora: e.target.value })} className={inp + " sm:w-48"} />
              ) : !atiende ? (
                <p className="rounded-2xl border border-dashed border-border bg-secondary/30 p-4 text-sm text-muted-foreground">{nombreCorto(adminSel.nombre)} no atiende este día según su agenda. Elegí otro día o usá "Otro horario".</p>
              ) : (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 xl:grid-cols-8">
                  {slots.map(({ h, ocupado }) => (
                    <button key={h} type="button" disabled={ocupado} onClick={() => setF({ ...f, hora: h })}
                      className={`rounded-xl border py-2 text-sm font-semibold tabular-nums transition-all duration-200 ${ocupado ? "cursor-not-allowed border-border bg-secondary/40 text-muted-foreground/40 line-through" : f.hora === h ? "pn-acc-tile scale-105 border-transparent text-white" : "border-border bg-card hover:border-[rgba(var(--acc),.5)]"}`}>
                      {h}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Paciente */}
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><span className="pn-acc-tile flex size-5 items-center justify-center rounded-full text-[10px] text-white">4</span> Paciente y motivo</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative">
                  <Users className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input id="nt-paciente" required placeholder="Nombre y apellido" value={f.paciente} onChange={(e) => setF({ ...f, paciente: e.target.value })} className={inp + " pl-10"} />
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">Resumen del turno</p>
              <div className="flex items-center gap-3">
                {fotoDe(adminSel.id) && <img src={fotoDe(adminSel.id)!} alt="" className="size-12 rounded-xl object-cover object-top ring-2 ring-white/25" />}
                <div className="min-w-0">
                  <p className="truncate font-semibold">{nombreCorto(adminSel.nombre)}</p>
                  
                </div>
              </div>
              <div className="space-y-3 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
                <p className="flex items-center gap-3 text-sm"><CalendarDays className="size-4 text-sky-300" /> <span className="capitalize">{new Date(f.fecha + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}</span></p>
                <p className="flex items-center gap-3 text-sm"><Clock className="size-4 text-sky-300" /> {f.hora ? `${f.hora} hs` : <span className="text-white/50">Elegí un horario</span>}</p>
                <p className="flex items-center gap-3 text-sm"><Users className="size-4 text-sky-300" /> {f.paciente.trim() || <span className="text-white/50">Paciente</span>}</p>
                <p className="flex items-center gap-3 text-sm"><Stethoscope className="size-4 text-sky-300" /> {f.motivo.trim() || <span className="text-white/50">Motivo</span>}</p>
              </div>
              {atiende && !otraHora && <p className="text-xs text-white/60">{slots.filter((x) => !x.ocupado).length} horarios libres este día</p>}
            </div>
            <Button type="submit" className="relative h-12 w-full rounded-xl !bg-white text-[var(--deep)] shadow-lg hover:!bg-white/90">
              <Plus className="size-4" /> Crear turno
            </Button>
          </aside>
        </form>
      </section>
      )}

      <div id="lista-turnos" className="scroll-mt-24" />
      <Seccion icon={ClipboardList} titulo={procHoy ? "Procedimientos de hoy" : "Todos los turnos"} sub={`${lista.length} turno${lista.length === 1 ? "" : "s"} · ${procHoy ? "estudios y procedimientos del día" : "lista completa con filtros"}`} delay={0.08}
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
                    <Vacio icon={CalendarDays} titulo="Sin turnos todavía" texto="Creá el primero arriba o esperá las reservas que lleguen desde la web." accion={<Button variant="outline" className="rounded-xl" onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); window.setTimeout(() => document.getElementById("nt-paciente")?.focus(), 400); }}><Plus className="size-4" /> Crear el primer turno</Button>} />
                  ) : (
                    <Vacio icon={Search} titulo="Sin resultados" texto="No hay turnos con ese filtro o búsqueda." />
                  )}
                </td></tr>
              )}
              {lista.map((t) => (
                <tr key={t.id} className="group border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40">
                  <td className="py-3 pr-3">
                    <p className="font-semibold tabular-nums">{t.hora}</p>
                    <p className="text-xs text-muted-foreground">{fechaCorta(t.fecha)}</p>
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
                    <button onClick={() => borrar(t)} aria-label="Eliminar turno" className="rounded-lg p-2 text-muted-foreground opacity-60 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100">
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
      label: d.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", ""),
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
      toast.error("Ingresá un monto válido.");
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
            <Campo label="Concepto"><input required placeholder="O escribí uno nuevo" value={f.concepto} onChange={(e) => setF({ ...f, concepto: e.target.value })} className={inp} /></Campo>
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
  Efectivo: "from-emerald-400 to-teal-600",
  Débito: "from-sky-400 to-blue-600",
  Crédito: "from-violet-500 to-indigo-700",
  Transferencia: "from-cyan-400 to-sky-600",
  "Mercado Pago": "from-sky-300 to-blue-500",
  "Obra social": "from-amber-400 to-orange-600",
};

function useQuienCobra() {
  const [equipo] = useDato<Persona[]>(KEY_EQUIPO, EQUIPO_INICIAL);
  return [...equipo.filter((p) => p.activo).map((p) => p.nombre), ...ADMINS.map((a) => a.nombre)];
}

function imprimirRecibo(c: Cobro) {
  const w = window.open("", "_blank", "width=720,height=900");
  if (!w) return;
  const filas = c.pagos.map((p) => `<tr><td>${fechaHora(p.fecha)}</td><td>${p.metodo}</td><td>${p.cobradoPor}</td><td style="text-align:right">${dinero(p.monto)}</td></tr>`).join("");
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Recibo ${c.id}</title>
  <style>body{font-family:system-ui,sans-serif;color:#0f172a;padding:40px}h1{margin:0;font-size:22px}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{border-bottom:1px solid #e2e8f0;padding:8px;text-align:left;font-size:13px}.t{font-size:20px;font-weight:700}.m{color:#64748b;font-size:13px}</style></head><body>
  <h1>HEGO · Centro de especialidades médicas</h1><p class="m">Recibo N° ${c.id.toUpperCase()} · ${fechaHora(c.fecha)}</p>
  <p><b>Paciente:</b> ${c.paciente}${c.dni ? ` · C.C. ${c.dni}` : ""}<br><b>Concepto:</b> ${c.concepto}<br><b>Profesional:</b> ${c.profesional}${c.obraSocial ? `<br><b>Obra social:</b> ${c.obraSocial}` : ""}</p>
  <table><thead><tr><th>Fecha</th><th>Medio</th><th>Cobró</th><th style="text-align:right">Monto</th></tr></thead><tbody>${filas}</tbody></table>
  <p class="t">Total pagado: ${dinero(pagadoDe(c))}</p><p class="m">Arancel ${dinero(c.arancel)} · Saldo ${dinero(saldoDe(c))}</p>
  <script>window.print()</script></body></html>`);
  w.document.close();
}

function CobrosVista({ turnos, user, log }: { turnos: Turno[]; user: SessionUser; log: LogFn }) {
  const [cobros, setCobros] = useDato<Cobro[]>(KEY_COBROS, []);
  const quienes = useQuienCobra();
  const vacio = { paciente: "", dni: "", concepto: SERVICIOS[0]!.nombre, profesional: ADMINS[0]!.nombre, arancel: String(SERVICIOS[0]!.precio), pagado: String(SERVICIOS[0]!.precio), metodo: "Efectivo" as MetodoPago, obraSocial: "", cobradoPor: quienes[0] ?? user.nombre, nota: "", turnoId: "", pacienteId: "" };
  const [f, setF] = useState(vacio);
  const [filtro, setFiltro] = useState<"Todos" | EstadoCobro>("Todos");
  const [q, setQ] = useState("");
  const [abonando, setAbonando] = useState<string | null>(null);
  const [abono, setAbono] = useState({ monto: "", metodo: "Efectivo" as MetodoPago, cobradoPor: quienes[0] ?? user.nombre });
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

  const porMetodo = METODOS_PAGO.map((m) => ({ m, total: pagosMes.filter((p) => p.metodo === m).reduce((a, p) => a + p.monto, 0) })).filter((x) => x.total > 0);
  const maxMetodo = Math.max(1, ...porMetodo.map((x) => x.total));

  const sinCobrar = turnos.filter((t) => t.estado === "Atendido" && !cobros.some((c) => c.turnoId === t.id));

  const lista = cobros
    .filter((c) => filtro === "Todos" || estadoCobro(c) === filtro)
    .filter((c) => norm(`${c.paciente} ${c.dni ?? ""} ${c.concepto} ${c.profesional}`).includes(norm(q)))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const elegirServicio = (nombre: string) => {
    const s = SERVICIOS.find((x) => x.nombre === nombre);
    setF((p) => ({ ...p, concepto: nombre, ...(s ? { arancel: String(s.precio), pagado: String(s.precio), profesional: nombrePanelDe(s.doctorId) } : {}) }));
  };

  const cobrarTurno = (t: Turno) => {
    const s = SERVICIOS.find((x) => t.motivo.startsWith(x.especialidad)) ?? SERVICIOS[0]!;
    setF({ ...vacio, paciente: t.paciente, concepto: s.nombre, profesional: t.doctor, arancel: String(s.precio), pagado: String(s.precio), turnoId: t.id, pacienteId: t.pacienteId ?? "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const registrar = (e: FormEvent) => {
    e.preventDefault();
    const arancel = Number(f.arancel);
    const pagado = Number(f.pagado || 0);
    if (!arancel || arancel <= 0) {
      toast.error("Ingresá el arancel.");
      return;
    }
    if (pagado < 0 || pagado > arancel) {
      toast.error("El monto pagado no puede superar el arancel.");
      return;
    }
    const ahora = new Date().toISOString();
    const nuevo: Cobro = {
      id: nuevoId(),
      fecha: ahora,
      paciente: f.paciente.trim(),
      concepto: f.concepto,
      profesional: f.profesional,
      arancel,
      pagos: pagado > 0 ? [{ fecha: ahora, monto: pagado, metodo: f.metodo, cobradoPor: f.cobradoPor }] : [],
      ...(f.dni.trim() ? { dni: f.dni.replace(/\D/g, "") } : {}),
      ...(f.turnoId ? { turnoId: f.turnoId } : {}),
      ...(f.pacienteId ? { pacienteId: f.pacienteId } : {}),
      ...(f.metodo === "Obra social" && f.obraSocial.trim() ? { obraSocial: f.obraSocial.trim() } : {}),
      ...(f.nota.trim() ? { nota: f.nota.trim() } : {}),
    };
    setCobros((l) => [nuevo, ...l]);
    log("Cobro registrado", `${nuevo.paciente} · ${dinero(pagado)} de ${dinero(arancel)} · ${f.metodo} · cobró ${f.cobradoPor}`);
    toast.success(pagado >= arancel ? "Cobro registrado." : "Cobro registrado con saldo pendiente.");
    setF({ ...vacio, cobradoPor: f.cobradoPor });
  };

  const agregarPago = (c: Cobro) => {
    const monto = Number(abono.monto);
    if (!monto || monto <= 0 || monto > saldoDe(c)) {
      toast.error(`Ingresá un monto entre $1 y ${dinero(saldoDe(c))}.`);
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
      toast.error("Escribí el motivo de la anulación.");
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
            {f.turnoId && <p className="flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-xs text-sky-800 ring-1 ring-sky-100"><CalendarCheck className="size-4" /> Cobro del turno atendido de {f.paciente}</p>}
            <div className="grid grid-cols-[1.5fr_1fr] gap-3">
              <Campo label="Paciente"><input required list="pacientes-cobro" value={f.paciente} onChange={(e) => setF({ ...f, paciente: e.target.value })} className={inp} /></Campo>
              <Campo label="Cédula"><input inputMode="numeric" value={f.dni} onChange={(e) => setF({ ...f, dni: e.target.value })} className={inp} /></Campo>
            </div>
            <datalist id="pacientes-cobro">{Array.from(new Set(turnos.map((t) => t.paciente))).map((p) => <option key={p} value={p} />)}</datalist>
            <Campo label="Servicio">
              <select value={f.concepto} onChange={(e) => elegirServicio(e.target.value)} className={inp}>
                {SERVICIOS.map((s) => <option key={s.id}>{s.nombre}</option>)}
                <option>Otro</option>
              </select>
            </Campo>
            <Campo label="Profesional">
              <select value={f.profesional} onChange={(e) => setF({ ...f, profesional: e.target.value })} className={inp}>{ADMINS.map((a) => <option key={a.id}>{a.nombre}</option>)}</select>
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Arancel"><input required type="number" min="1" value={f.arancel} onChange={(e) => setF({ ...f, arancel: e.target.value })} className={inp + " font-semibold tabular-nums"} /></Campo>
              <Campo label="Paga ahora"><input type="number" min="0" value={f.pagado} onChange={(e) => setF({ ...f, pagado: e.target.value })} className={inp + " font-semibold tabular-nums"} /></Campo>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Medio de pago</p>
              <div className="grid grid-cols-3 gap-1.5">
                {METODOS_PAGO.map((m) => (
                  <button key={m} type="button" onClick={() => setF({ ...f, metodo: m })} className={`rounded-xl px-2 py-2 text-xs font-semibold transition-all ${f.metodo === m ? `bg-gradient-to-br ${COLOR_METODO[m]} text-white shadow-md` : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{m}</button>
                ))}
              </div>
            </div>
            {f.metodo === "Obra social" && <Campo label="Obra social / prepaga"><input value={f.obraSocial} onChange={(e) => setF({ ...f, obraSocial: e.target.value })} className={inp} /></Campo>}
            <Campo label="Cobró">
              <select value={f.cobradoPor} onChange={(e) => setF({ ...f, cobradoPor: e.target.value })} className={inp}>{quienes.map((n) => <option key={n}>{n}</option>)}</select>
            </Campo>
            <Campo label="Nota (opcional)"><input value={f.nota} onChange={(e) => setF({ ...f, nota: e.target.value })} className={inp} /></Campo>
            {Number(f.pagado) < Number(f.arancel) && <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-100">Queda un saldo de {dinero(Number(f.arancel) - Number(f.pagado || 0))} a cobrar.</p>}
            <Button type="submit" className="h-12 w-full rounded-xl !bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"><Check className="size-4" /> Registrar cobro</Button>
          </form>
        </Seccion>

        <div className="space-y-6 xl:col-span-3">
          <Seccion icon={CalendarCheck} titulo="Turnos atendidos sin cobrar" sub="Marcá el turno como Atendido en Turnos y aparece acá" delay={0.15}>
            {sinCobrar.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="size-4 text-emerald-600" /> No hay turnos atendidos pendientes de cobro.</p>
            ) : (
              <div className="space-y-2">
                {sinCobrar.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl bg-amber-50/70 p-3 ring-1 ring-amber-100">
                    <Avatar nombre={t.paciente} size="size-9" />
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{t.paciente}</p><p className="text-xs text-muted-foreground">{fechaCorta(t.fecha)} {t.hora} · {t.motivo} · {nombreCorto(t.doctor)}</p></div>
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
        acciones={<div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input placeholder="Paciente, cédula, servicio..." value={q} onChange={(e) => setQ(e.target.value)} className={inp + " h-10 pl-9 sm:w-60"} /></div>}>
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
        {lista.length === 0 && <Vacio icon={Receipt} titulo="Sin cobros" texto="Los cobros que registres acá quedan con el nombre de quien cobró, para que los doctores puedan controlarlos." />}
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
                    {ult && <p className="text-xs text-muted-foreground">Último pago: {ult.metodo} · cobró <b className="text-foreground/80">{ult.cobradoPor}</b></p>}
                    {c.anulado && <p className="text-xs text-rose-700">Anulado por {nombreCorto(c.anulado.por)}: {c.anulado.motivo}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-semibold tabular-nums">{dinero(pagadoDe(c))}</p>
                    <p className="text-xs text-muted-foreground">de {dinero(c.arancel)}{saldoDe(c) > 0 ? <> · <span className="font-semibold text-amber-700">debe {dinero(saldoDe(c))}</span></> : null}</p>
                  </div>
                </div>
                {!c.anulado && (
                  <div className="mt-3 flex flex-wrap gap-1.5 pl-[52px]">
                    {saldoDe(c) > 0 && <button onClick={() => { setAbonando(abonando === c.id ? null : c.id); setAbono({ ...abono, monto: String(saldoDe(c)) }); }} className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">Registrar pago</button>}
                    <button onClick={() => imprimirRecibo(c)} className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium hover:bg-secondary/70">Recibo</button>
                    <button onClick={() => { setAnulando(anulando === c.id ? null : c.id); setMotivo(""); }} className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">Anular</button>
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
      toast.error("Ingresá el efectivo contado.");
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
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{r.n}</p><p className="text-xs text-muted-foreground">{r.ultimo ? `Último cobro ${new Date(r.ultimo).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}` : "Sin cobros este día"}</p></div>
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
        <Seccion icon={Wallet} titulo="Cierre de caja" sub="Compará el efectivo contado con lo registrado" className="xl:col-span-2" delay={0.1}>
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
                  <span className="w-20 shrink-0 whitespace-nowrap tabular-nums text-muted-foreground">{new Date(p.fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</span>
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
            <input placeholder="Nombre" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} className={inp} />
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

        <Seccion icon={ClipboardList} titulo="Historial de cierres" delay={0.25}>
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

      <Seccion icon={Lock} titulo="Seguridad" sub={`Cambiá tu contraseña de administrador (${user.nombre}).`} delay={0.25}>
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
  out.push(deHoy.length ? `Hoy hay ${deHoy.length} turno${deHoy.length === 1 ? "" : "s"}; el próximo es a las ${[...deHoy].sort((a, b) => a.hora.localeCompare(b.hora))[0]!.hora}.` : "Hoy no hay turnos agendados.");
  if (pend.length) out.push(`${pend.length} turno${pend.length === 1 ? "" : "s"} sigue${pend.length === 1 ? "" : "n"} pendiente${pend.length === 1 ? "" : "s"}: conviene confirmarlos para evitar ausencias.`);
  if (ing + egr > 0) out.push(`Los egresos representan el ${Math.round((egr / Math.max(1, ing)) * 100)}% de los ingresos; balance de ${dinero(ing - egr)}.`);
  return out;
}

function puede(ctx: Ctx, modulo: string) {
  return ctx.rol === ROL_ADMIN || nivelDe(ctx.permisos, ctx.rol, modulo) !== "ninguno";
}

function listaTurnos(ts: Turno[]) {
  return ts
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
    .map((t) => `• ${fechaCorta(t.fecha)} ${t.hora} — ${t.paciente} (${t.motivo}) · ${nombreCorto(t.doctor)} · ${t.estado}`)
    .join("\n");
}

function responder(pregunta: string, ctx: Ctx): string {
  const p = norm(pregunta);
  const tiene = (...ws: string[]) => ws.some((w) => p.includes(w));
  const sinPermiso = (m: string) => `🔒 El departamento ${ctx.rol} no tiene acceso al módulo "${m}". Pedile a un administrador que lo habilite en Permisos.`;

  if (ctx.rol !== ROL_ADMIN && nivelDe(ctx.permisos, ctx.rol, "Asistente IA") === "ninguno") {
    return `🔒 ${ctx.rol} no tiene habilitado el Asistente IA. Un administrador puede activarlo desde Permisos.`;
  }

  if (tiene("hola", "ayuda", "que podes", "que sabes", "buen dia", "buenas")) {
    return "¡Hola! Puedo responderte sobre:\n• Turnos de hoy, de mañana, pendientes o cancelados\n• Turnos de un paciente o de un doctor\n• Ingresos, egresos y balance\n• Permisos de cada departamento\n• Actividad reciente y quién hizo cada cambio\nProbá con: \"¿cuántos turnos hay hoy?\"";
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
    return `Turnos de ${paciente.paciente}:\n${listaTurnos(ts)}`;
  }

  const doctor = ADMINS.find((a) => p.includes(norm(a.id)));
  if (doctor) {
    const ts = ctx.turnos.filter((t) => t.doctor === doctor.nombre && t.estado !== "Cancelado");
    return ts.length ? `Agenda de ${nombreCorto(doctor.nombre)} (${ts.length}):\n${listaTurnos(ts)}` : `${nombreCorto(doctor.nombre)} no tiene turnos activos.`;
  }

  if (tiene("cancel")) {
    const ts = ctx.turnos.filter((t) => t.estado === "Cancelado");
    return ts.length ? `Turnos cancelados (${ts.length}):\n${listaTurnos(ts)}` : "No hay turnos cancelados. 👍";
  }
  if (tiene("pendiente", "confirmar", "sin confirmar")) {
    const ts = ctx.turnos.filter((t) => t.estado === "Pendiente");
    return ts.length ? `Hay ${ts.length} turno${ts.length === 1 ? "" : "s"} pendiente${ts.length === 1 ? "" : "s"}:\n${listaTurnos(ts)}` : "No hay turnos pendientes. Todo confirmado ✅";
  }
  if (tiene("manana")) {
    const ts = ctx.turnos.filter((t) => t.fecha === maniana() && t.estado !== "Cancelado");
    return ts.length ? `Mañana hay ${ts.length} turno${ts.length === 1 ? "" : "s"}:\n${listaTurnos(ts)}` : "Mañana no hay turnos agendados.";
  }
  if (tiene("hoy", "turno", "agenda", "proximo", "cuantos")) {
    const ts = ctx.turnos.filter((t) => t.fecha === hoy() && t.estado !== "Cancelado");
    if (!ts.length) return "Hoy no hay turnos agendados.";
    const prox = ts.filter((t) => t.hora >= new Date().toTimeString().slice(0, 5)).sort((a, b) => a.hora.localeCompare(b.hora))[0];
    return `Hoy hay ${ts.length} turno${ts.length === 1 ? "" : "s"}${prox ? ` (el próximo es ${prox.paciente} a las ${prox.hora})` : ""}:\n${listaTurnos(ts)}`;
  }
  if (tiene("resumen", "como viene", "como va", "estado", "dia")) {
    return generarInsights(ctx.turnos, puede(ctx, "Finanzas") ? ctx.movs : []).join("\n");
  }

  return "No estoy seguro de haber entendido 🤔. Probá preguntando por turnos de hoy, pendientes, un paciente, un doctor, el balance o los permisos de un departamento.";
}

const SUGERENCIAS = [
  "¿Cuántos turnos hay hoy?",
  "¿Qué turnos están pendientes?",
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
    { id: "hola", de: "ia", texto: `¡Hola, ${nombreCorto(user.nombre)}! Soy el asistente de la clínica. Preguntame por turnos, finanzas, permisos o actividad. Si elegís un departamento arriba, respondo solo con lo que ese departamento tiene permitido ver.` },
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
    log("Consulta al asistente", `${rol}: ${pregunta.slice(0, 80)}`);
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
              <p className="text-xs text-white/75">Responde con los datos del panel en tiempo real</p>
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
                { icon: CalendarDays, t: "Agenda de hoy", q: "¿Cuántos turnos hay hoy?" },
                { icon: Clock, t: "Pendientes", q: "¿Qué turnos están pendientes?" },
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
            <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribí tu consulta..." className={inp} />
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
          Por ahora el asistente funciona dentro del navegador con los datos del panel. Cuando conectes el backend se puede enlazar a una IA real para consultas libres.
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

function HorariosTab({ user, log, puedeEditarOtros }: { user: SessionUser; log: LogFn; puedeEditarOtros: boolean }) {
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
  const [sel, setSel] = useState<string>(esAdmin ? user.id : ADMINS[0]!.id);
  const [nuevo, setNuevo] = useState({ nombre: "", especialidad: "" });
  const [agregando, setAgregando] = useState(false);
  const guardada = agendaDe(agendas, sel);
  const [draft, setDraft] = useState<AgendaDoctor>(guardada);
  const [bloq, setBloq] = useState({ desde: hoy(), hasta: hoy(), motivo: "" });
  const firma = JSON.stringify(guardada);

  useEffect(() => {
    setDraft(agendaDe(agendas, sel));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, firma]);

  const cambios = JSON.stringify(draft) !== firma;
  const set = (patch: Partial<AgendaDoctor>) => setDraft((d) => ({ ...d, ...patch }));
  const prof = profesionales.find((p) => p.id === sel) ?? profesionales[0]!;
  const admin = { nombre: prof.nombre };
  const doctor = DOCTORS.find((d) => d.id === ADMIN_A_DOCTOR[sel]);
  /** Los médicos editan lo suyo; los demás profesionales los maneja la secretaría (o los médicos). */
  const editable = (id: string) => (ADMIN_IDS.includes(id) ? id === user.id : esAdmin || puedeEditarOtros);
  const proximos = proximosDias(draft, 6);
  const slots = horariosDelDia(draft, proximos[0]);
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
      toast.error("Completá el nombre y la especialidad.");
      return;
    }
    const id = "p-" + uid();
    setAgendas((p) => ({ ...p, [id]: { ...agendaDe({}, id), nombre, especialidad: nuevo.especialidad.trim() } }));
    log("Profesional agregado a la agenda", `${nombre} · ${nuevo.especialidad}`);
    setNuevo({ nombre: "", especialidad: "" });
    setAgregando(false);
    setSel(id);
    toast.success("Profesional agregado. Ahora cargá sus días y horarios.");
  };
  const quitarProfesional = () => {
    if (ADMIN_IDS.includes(sel) || !propia) return;
    if (!window.confirm(`¿Quitar a ${prof.nombre} de la agenda? Deja de aparecer para pedir turnos.`)) return;
    setAgendas((p) => {
      const c = { ...p };
      delete c[sel];
      return c;
    });
    log("Profesional quitado de la agenda", prof.nombre);
    setSel(ADMINS[0]!.id);
  };

  const guardar = () => {
    if (!propia) {
      toast.error("No podés modificar estos horarios.");
      return;
    }
    if (draft.dias.length === 0) {
      toast.error("Elegí al menos un día de atención.");
      return;
    }
    if (!draft.duracion || draft.duracion < 5 || draft.duracion > 240) {
      toast.error("Elegí cuánto dura cada turno (entre 5 y 240 minutos).");
      return;
    }
    const malo = draft.dias.find((d) => { const r = rangoDia(draft, d); return r.desde >= r.hasta; });
    if (malo !== undefined) {
      toast.error(`${NOMBRES_DIA[malo]}: la hora de inicio tiene que ser anterior a la de fin.`);
      return;
    }
    const pausaMala = draft.dias.find((d) => { const r = rangoDia(draft, d); return !!r.pausaDesde && (r.pausaDesde! >= r.pausaHasta! || r.pausaDesde! < r.desde || r.pausaHasta! > r.hasta); });
    if (pausaMala !== undefined) {
      toast.error(`${NOMBRES_DIA[pausaMala]}: la pausa tiene que quedar dentro del horario de ese día.`);
      return;
    }
    // desde / hasta generales = el rango más amplio (para resúmenes viejos)
    const rs = draft.dias.map((d) => rangoDia(draft, d));
    const final = { ...draft, ...(prof.admin ? {} : { nombre: prof.nombre, especialidad: prof.especialidad }), pausa: false, porDia: Object.fromEntries(draft.dias.map((d) => [String(d), rangoDia(draft, d)])), desde: rs.map((r) => r.desde).sort()[0]!, hasta: rs.map((r) => r.hasta).sort().reverse()[0]! };
    setAgendas((p) => ({ ...p, [sel]: final }));
    log("Horarios actualizados", `${admin.nombre}: ${resumenAgenda(draft)}`);
    toast.success("Horarios publicados en la web.");
  };

  const agregarBloqueo = (e: FormEvent) => {
    e.preventDefault();
    if (bloq.hasta < bloq.desde) {
      toast.error("La fecha de fin no puede ser anterior a la de inicio.");
      return;
    }
    set({ bloqueos: [...draft.bloqueos, { id: uid(), ...bloq, motivo: bloq.motivo.trim() || "No atiende" }] });
    setBloq({ desde: hoy(), hasta: hoy(), motivo: "" });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {profesionales.map((a) => {
          const ag = agendaDe(agendas, a.id);
          const on = sel === a.id;
          const f = fotoDe(a.id);
          const etiqueta = a.id === user.id ? "Tus horarios" : editable(a.id) ? "Podés editar" : "Solo ver";
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
          <Lock className="size-4 shrink-0" /> Estás viendo los horarios de {admin.nombre}. {prof.admin ? "Solo él puede modificarlos desde su usuario." : "Los carga la secretaría o un médico administrador."}
        </div>
      )}

      <fieldset disabled={!propia} className={`min-w-0 border-0 p-0 ${propia ? "" : "opacity-75"}`}>
      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-3">
          <Seccion icon={CalendarDays} titulo={propia ? "Tus días y horarios de consulta" : "Días y horarios de consulta"} sub={`${admin.nombre} · se publican en su perfil y en «Solicitar turno»`}
            acciones={<Interruptor on={draft.activo} onChange={(v) => set({ activo: v })} label={draft.activo ? "Agenda abierta" : "Agenda pausada"} />}>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Días y horario de cada día</p>
            <div className="space-y-2">
              {ORDEN_DIAS.map((d) => {
                const on = draft.dias.includes(d);
                const r = rangoDia(draft, d);
                return (
                  <div key={d} className={`flex flex-col gap-2 rounded-2xl p-2 transition-colors sm:flex-row sm:items-center sm:gap-3 ${on ? "bg-secondary/70" : ""}`}>
                    <button type="button" onClick={() => toggleDia(d)} aria-pressed={on}
                      className={`h-11 w-full shrink-0 rounded-xl text-sm font-semibold sm:w-28 transition-all ${on ? "pn-acc-tile text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                      {NOMBRES_DIA[d]}
                    </button>
                    {on ? (
                      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                        <input type="time" aria-label={`${NOMBRES_DIA[d]} desde`} value={r.desde} onChange={(e) => setRango(d, { desde: e.target.value })} className={inp.replace("w-full", "") + " h-11 w-[7.5rem] sm:w-32"} />
                        <span className="text-sm text-muted-foreground">a</span>
                        <input type="time" aria-label={`${NOMBRES_DIA[d]} hasta`} value={r.hasta} onChange={(e) => setRango(d, { hasta: e.target.value })} className={inp.replace("w-full", "") + " h-11 w-[7.5rem] sm:w-32"} />
                        <button type="button" onClick={() => togglePausa(d)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${r.pausaDesde ? "bg-amber-100 text-amber-800 ring-1 ring-amber-200" : "bg-background text-muted-foreground ring-1 ring-border hover:text-foreground"}`}>
                          {r.pausaDesde ? "Con pausa" : "+ Pausa"}
                        </button>
                        {r.pausaDesde && (
                          <span className="flex items-center gap-1.5">
                            <input type="time" aria-label={`${NOMBRES_DIA[d]} pausa desde`} value={r.pausaDesde} onChange={(e) => setRango(d, { pausaDesde: e.target.value })} className={inp.replace("w-full", "") + " h-9 w-[7.5rem] text-xs sm:w-32"} />
                            <span className="text-xs text-muted-foreground">a</span>
                            <input type="time" aria-label={`${NOMBRES_DIA[d]} pausa hasta`} value={r.pausaHasta} onChange={(e) => setRango(d, { pausaHasta: e.target.value })} className={inp.replace("w-full", "") + " h-9 w-[7.5rem] text-xs sm:w-32"} />
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground tabular-nums">{draft.duracion >= 5 ? `${horariosDelDia({ ...draft, porDia: { [String(d)]: r } }, isoDiaSemana(d)).length} turnos` : ""}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No atiende</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Campo label="Duración del turno">
                <div className="relative">
                  <input
                    type="number"
                    min={5}
                    max={240}
                    step={1}
                    inputMode="numeric"
                    value={draft.duracion || ""}
                    onChange={(e) => set({ duracion: Math.min(240, Math.max(0, Math.round(Number(e.target.value) || 0))) })}
                    placeholder="Elegí"
                    className={inp + " pr-14 tabular-nums"}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">min</span>
                </div>
              </Campo>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Rápido:</span>
              {[10, 15, 20, 25, 30, 40, 45, 60].map((m) => (
                <button key={m} type="button" onClick={() => set({ duracion: m })}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${draft.duracion === m ? "pn-acc-tile text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {m} min
                </button>
              ))}
              <span className="text-xs text-muted-foreground">o escribí el tiempo que quieras (5 a 240 min)</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">La duración, los días, los horarios y las pausas los define cada profesional. Si un día no hay pausa, no se toca nada.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Campo label="Aviso para pacientes (se ve en la web)"><input value={draft.nota} placeholder="Ej: traer estudios previos" onChange={(e) => set({ nota: e.target.value })} className={inp} /></Campo>
            </div>
          </Seccion>

          <Seccion icon={Ban} titulo="Vacaciones, ausencias y días sin atención" sub="Vacaciones, un trámite, un congreso: esos días no se pueden reservar turnos" delay={0.05}>
            <form onSubmit={agregarBloqueo} className="grid gap-3 sm:grid-cols-[1fr_1fr_1.4fr_auto]">
              <Campo label="Desde"><input type="date" required value={bloq.desde} onChange={(e) => setBloq({ ...bloq, desde: e.target.value })} className={inp} /></Campo>
              <Campo label="Hasta"><input type="date" required value={bloq.hasta} onChange={(e) => setBloq({ ...bloq, hasta: e.target.value })} className={inp} /></Campo>
              <Campo label="Motivo"><input placeholder="Ej: vacaciones, trámite personal" value={bloq.motivo} onChange={(e) => setBloq({ ...bloq, motivo: e.target.value })} className={inp} /></Campo>
              <div className="flex items-end"><Button type="submit" variant="outline" className="h-11 w-full rounded-xl"><Plus className="size-4" /> Agregar</Button></div>
            </form>
            <div className="mt-4 space-y-2">
              {draft.bloqueos.length === 0 && <p className="text-sm text-muted-foreground">No hay días bloqueados.</p>}
              {draft.bloqueos.map((b) => (
                <div key={b.id} className="flex items-center gap-3 rounded-xl bg-rose-50 px-3 py-2.5 ring-1 ring-rose-100">
                  <Ban className="size-4 text-rose-600" />
                  <span className="flex-1 text-sm"><b>{fechaCorta(b.desde)}{b.hasta !== b.desde ? ` al ${fechaCorta(b.hasta)}` : ""}</b> · {b.motivo}</span>
                  <button onClick={() => set({ bloqueos: draft.bloqueos.filter((x) => x.id !== b.id) })} aria-label="Quitar" className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-100"><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
          </Seccion>
        </div>

        <div className="space-y-6 xl:col-span-2">
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
                    <span key={f} className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium capitalize">{new Date(f + "T12:00:00").toLocaleDateString("es-AR", { weekday: "short", day: "numeric" })}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{draft.duracion >= 5 ? `${slots.length} turnos el próximo día` : "Elegí la duración del turno"}</p>
                <div className="flex flex-wrap gap-1.5">
                  {slots.map((h) => <span key={h} className="rounded-lg border border-border px-2 py-1 text-xs tabular-nums">{h}</span>)}
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
  if (n && n.length <= 10) n = "549" + n.replace(/^0/, "");
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}

function mensajeInvitacion(p: PacientePortal) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/portal` : "/portal";
  return `Hola ${p.nombre.split(" ")[0]}, te escribimos del Centro HEGO. Te habilitamos el Portal del paciente para que saques tus turnos y gestiones tus autorizaciones.\n\nIngresá en: ${url}\nCédula: ${p.dni}\nCódigo de acceso: ${p.codigo}`;
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
      toast.error("Elegí un paciente.");
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
                <option value="">Elegí un paciente</option>
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
                <a href={waPaciente(p!.telefono, `Hola ${p!.nombre.split(" ")[0]}, vimos en tu portal una presión de ${c.sistolica}/${c.diastolica}. ¿Cómo te sentís?`)} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"><Send className="size-4" /></a>
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

function mailInvitacion(p: PacientePortal) {
  return `mailto:${p.email}?subject=${encodeURIComponent("Tu acceso al Portal del paciente · HEGO · Centro de especialidades médicas")}&body=${encodeURIComponent(mensajeInvitacion(p))}`;
}

function PacientesTab({ user, log, turnos }: { user: SessionUser; log: LogFn; turnos: Turno[] }) {
  const [pacientes, setPacientes] = useDato<PacientePortal[]>(KEY_PACIENTES, []);
  const [auts, setAuts] = useDato<Autorizacion[]>(KEY_AUT, []);
  const [f, setF] = useState({ nombre: "", dni: "", telefono: "", email: "" });
  const [recien, setRecien] = useState<PacientePortal | null>(null);
  const [q, setQ] = useState("");
  const [fa, setFa] = useState({ pacienteId: "", tipo: TIPOS_AUT[0] as string, titulo: "", detalle: "" });
  const [verAut, setVerAut] = useState<"pendientes" | "resueltas">("pendientes");
  const [respuesta, setRespuesta] = useState<Record<string, string>>({});

  const lista = pacientes.filter((p) => norm(`${p.nombre} ${p.dni} ${p.email}`).includes(norm(q)));
  const autsLista = auts
    .filter((a) => (verAut === "pendientes" ? a.estado === "Pendiente" : a.estado !== "Pendiente"))
    .sort((x, y) => Number(y.origen === "Paciente") - Number(x.origen === "Paciente") || y.fecha.localeCompare(x.fecha));

  const invitar = (e: FormEvent) => {
    e.preventDefault();
    const dni = f.dni.replace(/\D/g, "");
    if (dni.length < 5) {
      toast.error("Ingresá una cédula válida.");
      return;
    }
    if (pacientes.some((p) => p.dni === dni)) {
      toast.error("Ya existe un paciente con esa cédula.");
      return;
    }
    const nuevo: PacientePortal = {
      id: nuevoId(),
      nombre: f.nombre.trim(),
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
      toast.error("Elegí un paciente.");
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
            <p className="mt-1 text-lg font-semibold">1. Creás el acceso · 2. Le enviás la invitación por WhatsApp o email · 3. El paciente entra con su cédula y el código y saca sus turnos.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => verPortal("demo")} className="rounded-xl !bg-white text-[#a21caf] hover:!bg-white/90"><Eye className="size-4" /> Ver cómo se ve el portal</Button>
            <Button onClick={() => document.getElementById("inv-nombre")?.focus()} variant="outline" className="rounded-xl !border-white/30 !bg-white/10 text-white hover:!bg-white/20 hover:text-white"><Send className="size-4" /> Invitar paciente</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Seccion icon={Send} titulo="Enviar acceso al portal" sub="El paciente recibe un código para entrar y sacar sus turnos" className="xl:col-span-2" delay={0.1}>
          {recien ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                <p className="flex items-center gap-2 font-semibold text-emerald-800"><Check className="size-4" /> Acceso creado para {recien.nombre}</p>
                <p className="mt-3 text-xs text-emerald-800/80">Código de acceso</p>
                <p className="font-display text-4xl font-semibold tracking-[0.2em] text-emerald-900">{recien.codigo}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button asChild className="rounded-xl !bg-[#25D366] text-white hover:!bg-[#1ebe5b]">
                  <a href={waPaciente(recien.telefono, mensajeInvitacion(recien))} target="_blank" rel="noreferrer"><Send className="size-4" /> Enviar por WhatsApp</a>
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={() => copiar(mensajeInvitacion(recien))}><ClipboardList className="size-4" /> Copiar mensaje</Button>
                {recien.email && (
                  <Button asChild variant="outline" className="rounded-xl"><a href={mailInvitacion(recien)}><Send className="size-4" /> Enviar por email</a></Button>
                )}
                <Button variant="outline" className="rounded-xl" onClick={() => verPortal(recien.id)}><Eye className="size-4" /> Ver su portal</Button>
              </div>
              <Button variant="ghost" className="w-full rounded-xl" onClick={() => setRecien(null)}><Plus className="size-4" /> Invitar a otro paciente</Button>
            </div>
          ) : (
            <form onSubmit={invitar} className="space-y-4">
              <Campo label="Nombre y apellido"><input id="inv-nombre" required value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} className={inp} /></Campo>
              <div className="grid grid-cols-2 gap-3">
                <Campo label="Cédula"><input required inputMode="numeric" value={f.dni} onChange={(e) => setF({ ...f, dni: e.target.value })} className={inp} /></Campo>
                <Campo label="WhatsApp"><input required type="tel" placeholder="11 1234-5678" value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} className={inp} /></Campo>
              </div>
              <Campo label="Email (opcional)"><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={inp} /></Campo>
              <Button type="submit" className="h-11 w-full rounded-xl"><Send className="size-4" /> Crear acceso y enviar invitación</Button>
            </form>
          )}
        </Seccion>

        <Seccion icon={Users} titulo="Pacientes del portal" sub={`${pacientes.length} con acceso`} className="xl:col-span-3" delay={0.15}
          acciones={<div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} className={inp + " h-10 pl-9 sm:w-52"} /></div>}>
          {pacientes.length === 0 && <Vacio icon={Users} titulo="Todavía no invitaste pacientes" texto="Creá un acceso y mandale el código por WhatsApp. Con eso entra al portal y saca sus turnos." />}
          <div className="space-y-2">
            {lista.map((p) => {
              const n = turnos.filter((t) => t.pacienteId === p.id).length;
              return (
                <div key={p.id} className="group rounded-2xl border border-border/70 p-3 transition-colors hover:bg-secondary/40">
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar nombre={p.nombre} />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 font-medium">{p.nombre} <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${ESTADO_ACCESO[p.estado]}`}>{p.estado}</span></p>
                      <p className="text-xs text-muted-foreground">C.C. {p.dni} · {p.telefono}{n ? ` · ${n} turno${n === 1 ? "" : "s"}` : ""}{p.ultimoIngreso ? ` · último ingreso ${fechaHora(p.ultimoIngreso)}` : ""}</p>
                      {(p.ficha?.antecedentes?.length || p.ficha?.alergias || p.ficha?.obraSocial) ? (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {p.ficha?.obraSocial && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">{p.ficha.obraSocial}</span>}
                          {p.ficha?.alergias && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">Alergia: {p.ficha.alergias}</span>}
                          {p.ficha?.antecedentes?.map((a) => <span key={a} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium">{a}</span>)}
                        </div>
                      ) : null}
                    </div>
                    <span className="rounded-lg bg-secondary px-2.5 py-1 font-mono text-sm tracking-widest">{p.codigo}</span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5 pl-[52px]">
                    <a href={waPaciente(p.telefono, mensajeInvitacion(p))} target="_blank" rel="noreferrer" onClick={() => log("Invitación enviada", `${p.nombre} · WhatsApp`)} className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#1ebe5b]"><Send className="size-3" /> Enviar invitación</a>
                    {p.email && <a href={mailInvitacion(p)} onClick={() => log("Invitación enviada", `${p.nombre} · email`)} className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 hover:bg-sky-100">Email</a>}
                    <button onClick={() => verPortal(p.id)} className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100"><Eye className="size-3" /> Ver su portal</button>
                    <button onClick={() => copiar(mensajeInvitacion(p))} className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium hover:bg-secondary/70">Copiar</button>
                    <button onClick={() => cambiarPaciente(p.id, { codigo: nuevoCodigo() }, "Nuevo código de portal")} className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium hover:bg-secondary/70">Nuevo código</button>
                    {p.estado === "Revocado" ? (
                      <button onClick={() => cambiarPaciente(p.id, { estado: "Invitado", codigo: nuevoCodigo() }, "Acceso al portal reactivado")} className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 hover:bg-sky-100">Reactivar</button>
                    ) : (
                      <button onClick={() => cambiarPaciente(p.id, { estado: "Revocado" }, "Acceso al portal quitado")} className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">Quitar acceso</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Seccion>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Seccion icon={ShieldCheck} titulo="Pedir una autorización" sub="El paciente la acepta o rechaza desde su portal" className="xl:col-span-2" delay={0.2}>
          <form onSubmit={pedirAut} className="space-y-4">
            <Campo label="Paciente">
              <select required value={fa.pacienteId} onChange={(e) => setFa({ ...fa, pacienteId: e.target.value })} className={inp}>
                <option value="">Elegí un paciente</option>
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
          {autsLista.length === 0 && <Vacio icon={ShieldCheck} titulo={verAut === "pendientes" ? "Nada pendiente" : "Sin historial"} texto="Las autorizaciones que pidas o que pidan los pacientes aparecen acá." />}
          <div className="space-y-3">
            {autsLista.map((a) => (
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
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-semibold text-pink-700 ring-1 ring-pink-100"><Bell className="size-3" /> Pedido del paciente desde su portal: respondé acá</p>
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
          </div>
        </Seccion>
      </div>
      <EstudiosPortal user={user} log={log} pacientes={pacientes} />
    </div>
  );
}

/* ---------- Auditoría ---------- */
function AuditoriaTab({ audit, log }: { audit: Evento[]; log: LogFn }) {
  const [q, setQ] = useState("");
  const lista = audit.filter((e) => norm(`${e.usuario} ${e.accion} ${e.detalle}`).includes(norm(q)));

  const exportar = () => {
    const filas = [
      ["Fecha", "Usuario", "Acción", "Detalle"],
      ...lista.map((e) => [fechaHora(e.fecha), e.usuario, e.accion, e.detalle]),
    ];
    const csv = filas.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "auditoria.csv";
    a.click();
    URL.revokeObjectURL(url);
    log("Auditoría exportada", `${lista.length} eventos a CSV`);
  };

  const hoyStr = new Date().toDateString();
  const deHoy = audit.filter((e) => new Date(e.fecha).toDateString() === hoyStr).length;
  const fallidos = audit.filter((e) => norm(e.accion).includes("fallido")).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi icon={ClipboardList} label="Eventos totales" value={String(audit.length)} tono="violeta" delay={0.05} />
        <Kpi icon={Activity} label="Eventos de hoy" value={String(deHoy)} tono="azul" delay={0.1} />
        <Kpi icon={Lock} label="Accesos fallidos" value={String(fallidos)} hint={fallidos ? "Revisar intentos" : "Sin incidentes"} tono={fallidos ? "rojo" : "verde"} delay={0.15} />
      </div>

      <Seccion icon={ClipboardList} titulo="Registro de eventos" sub={`${lista.length} resultado${lista.length === 1 ? "" : "s"}`} delay={0.2}
        acciones={
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} className={inp + " h-10 pl-9 sm:w-64"} />
            </div>
            <Button variant="outline" className="h-10 rounded-xl" onClick={exportar}><Download className="size-4" /> Exportar CSV</Button>
          </div>
        }>
        {lista.length === 0 && <Vacio icon={ClipboardList} texto="No hay eventos." />}
        <ol className="relative space-y-1 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-px before:bg-border">
          {lista.map((e) => {
            const { icon: I, clase } = iconoEvento(e.accion);
            return (
              <li key={e.id} className="relative flex gap-4 rounded-xl p-2 transition-colors hover:bg-secondary/40">
                <span className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ring-4 ring-card ${clase}`}><I className="size-4" /></span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="text-sm font-semibold">{e.accion}</p>
                    <p className="text-xs tabular-nums text-muted-foreground">{fechaHora(e.fecha)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">{e.usuario}</span>
                    {e.detalle ? ` · ${e.detalle}` : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Seccion>
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
  return e;
}
/** Fecha legible: respeta las fechas sin hora (AAAA-MM-DD) para no correrlas un día. */
const fechaDe = (f: string) => (f.length === 10 ? fechaCorta(f) : new Date(f).toLocaleDateString("es-AR"));
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
          placeholder="Buscá por código (I10, E11.9) o por descripción (hipertensión, diabetes…)"
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
        <p className="text-xs text-muted-foreground">Todavía no agregaste diagnósticos. El primero que agregues queda como principal.</p>
      )}
    </div>
  );
}

/** Diagnósticos de una evolución (CIE-10 o los de texto de evoluciones anteriores). */
const dxDe = (e: Evolucion): Cie[] => e.cie10 ?? e.diagnosticos.map((d) => ({ codigo: "", descripcion: d }));

function HistoriaTab({ user, log, turnos, inicial, soloLectura = false }: { user: SessionUser; log: LogFn; turnos: Turno[]; inicial: string | null; soloLectura?: boolean }) {
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
        <Seccion icon={FileText} titulo={vista === "hoy" ? "Consultas de hoy" : "Todas las evoluciones"} sub={`${listaKpi.length} ${listaKpi.length === 1 ? "evolución" : "evoluciones"} · tocá una para abrir la historia`}>
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
        <section className="pn-card pn-up flex max-h-[calc(100vh-10rem)] min-h-[420px] flex-col p-4 xl:sticky xl:top-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar paciente o cédula" className={inp + " pl-10"} />
          </div>
          <p className="mt-4 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{visibles.length} {visibles.length === 1 ? "paciente" : "pacientes"}</p>
          <ul className="pn-noscroll mt-2 flex-1 space-y-1 overflow-y-auto">
            {visibles.map((p) => {
              const u = ultimaDe(p);
              const on = p.id === selId;
              return (
                <li key={p.id}>
                  <button
                    onClick={() => { setSelId(p.id); setNueva(false); }}
                    className={`group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all ${on ? "bg-[rgba(var(--acc),.12)] ring-1 ring-[rgba(var(--acc),.35)]" : "hover:translate-x-0.5 hover:bg-secondary"}`}
                  >
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${on ? "pn-acc-tile text-white" : "bg-secondary text-foreground"}`}>{iniciales(p.nombre)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{p.nombre}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{u ? `Última consulta ${fechaDe(u.fecha)}` : p.dni ? `C.C. ${p.dni}` : "Sin consultas"}</span>
                    </span>
                    {p.ficha?.alergias && <AlertTriangle className="size-3.5 shrink-0 text-red-500" />}
                  </button>
                </li>
              );
            })}
            {visibles.length === 0 && <li className="px-2 py-8 text-center text-sm text-muted-foreground">Sin pacientes. Cargalos en Pacientes.</li>}
          </ul>
        </section>

        {!sel ? (
          <section className="pn-card pn-up p-6">
            <Vacio icon={FileText} titulo="Elegí un paciente" texto="Abrí su historia clínica para ver las consultas anteriores, signos vitales, diagnósticos e indicaciones, y registrar una nueva evolución." />
          </section>
        ) : (
          <FichaHC
            key={sel.id}
            soloLectura={soloLectura}
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
<h1>HEGO · Centro de especialidades médicas · Historia Clínica</h1><p class="m">${p.nombre}${p.dni ? ` · C.C. ${p.dni}` : ""} · ${new Date(e.fecha).toLocaleString("es-AR")} · ${e.doctor}</p>
<h2>Motivo de consulta</h2><p>${esc(e.motivo || "—")}</p>${vit ? `<h2>Signos vitales</h2><p>${vit}</p>` : ""}
${e.signosPor ? `<p class="m">Signos vitales tomados por ${e.signosPor.nombre} · ${new Date(e.signosPor.fecha).toLocaleString("es-AR")}</p>` : ""}
<h2>Evolución del cuadro clínico</h2><p>${esc(e.nota || "—")}</p>${e.sintomas ? `<h2>Signos y síntomas</h2><p>${esc(e.sintomas)}</p>` : ""}${e.semiologia ? `<h2>Semiología médica</h2><p>${esc(e.semiologia)}</p>` : ""}
<h2>Diagnósticos</h2>${dxDe(e).map((d, i) => `<p class="dx">${d.codigo ? `<b>${d.codigo}</b> ` : ""}${d.descripcion}${i === 0 ? " (principal)" : ""}</p>`).join("") || "<p>—</p>"}
<h2>Conducta médica</h2><p>${esc(e.plan || "—")}</p><script>setTimeout(()=>window.print(),300)</script></body></html>`;
}

function FichaHC({
  p, evols, estudios, controles, meds, nueva, setNueva, onGuardar, onBorrar, user, soloLectura = false,
}: {
  p: PacienteHC; evols: Evolucion[]; estudios: Estudio[]; controles: Control[]; meds: Medicamento[];
  nueva: boolean; setNueva: (v: boolean) => void; onGuardar: (e: Evolucion) => void; onBorrar: (id: string) => void; user: SessionUser; soloLectura?: boolean;
}) {
  const [ver, setVer] = useState<"todo" | "evoluciones" | "estudios">("todo");
  const [abiertas, setAbiertas] = useState<Set<string>>(() => new Set());
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

  type Item = { tipo: "evol"; f: string; e: Evolucion } | { tipo: "estudio"; f: string; e: Estudio } | { tipo: "triage"; f: string; e: Triage };
  const linea: Item[] = [
    ...(ver !== "estudios" ? ordenadas.map((e) => ({ tipo: "evol" as const, f: e.fecha, e })) : []),
    ...(ver !== "estudios" ? triages.filter((t) => !t.evolucionId).map((e) => ({ tipo: "triage" as const, f: e.fecha, e })) : []),
    ...(ver !== "evoluciones" ? estudios.map((e) => ({ tipo: "estudio" as const, f: e.fecha, e })) : []),
  ].sort((a, b) => b.f.localeCompare(a.f));
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
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold ring-1 ring-white/25"><Eye className="size-4" /> Solo lectura</span>
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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: Activity, l: "Presión arterial", v: ta ? `${ta.s}/${ta.d}` : "—", u: "mmHg", f: ta?.f, b: ta ? { t: clasificarPresion(ta.s, ta.d).nivel, tono: clasificarPresion(ta.s, ta.d).tono } : null },
          { icon: HeartPulse, l: "Frecuencia cardíaca", v: fc ? String(fc.signos.pulso) : "—", u: "lpm", f: fc?.fecha, b: fc ? (fueraDeRango("fc", fc.signos.pulso) ? { t: "Fuera de rango", tono: "ambar" } : { t: "Normal", tono: "verde" }) : null },
          { icon: Thermometer, l: "Temperatura", v: temp ? String(temp.signos.temp) : "—", u: "°C", f: temp?.fecha, b: temp ? (fueraDeRango("temp", temp.signos.temp) ? { t: "Fuera de rango", tono: "ambar" } : { t: "Normal", tono: "verde" }) : null },
          { icon: Scale, l: "Índice de masa corporal", v: imc ? String(imc.valor) : "—", u: "kg/m²", f: conPeso?.fecha, b: imc ? { t: imc.texto, tono: imc.tono } : null },
        ].map((x) => (
          <div key={x.l} className="pn-card pn-up p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{x.l}</p>
              <x.icon className="size-4 text-[rgb(var(--acc))]" />
            </div>
            <p className="mt-2 font-display text-2xl font-semibold tabular-nums">{x.v} <span className="text-xs font-normal text-muted-foreground">{x.v !== "—" ? x.u : ""}</span></p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {x.b ? <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${TONO_HC[x.b.tono] ?? TONO_HC["gris"]}`}>{x.b.t}</span> : <span className="text-[11px] text-muted-foreground">Sin registros</span>}
              {x.f && <span className="text-[10px] text-muted-foreground">{fechaDe(x.f)}</span>}
            </div>
          </div>
        ))}
      </div>

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

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* Registro de consultas */}
        <Seccion
          icon={ClipboardList}
          titulo="Registro de consultas"
          sub={`${ordenadas.length} ${ordenadas.length === 1 ? "evolución" : "evoluciones"} · ${estudios.length} ${estudios.length === 1 ? "estudio" : "estudios"}`}
          acciones={
            <div className="flex gap-1 rounded-xl bg-secondary p-1">
              {([["todo", "Todo"], ["evoluciones", "Evoluciones"], ["estudios", "Estudios"]] as const).map(([id, l]) => (
                <button key={id} onClick={() => setVer(id)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${ver === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{l}</button>
              ))}
            </div>
          }
        >
          {linea.length === 0 ? (
            <Vacio icon={NotebookPen} titulo="Sin registros" texto="Registrá la primera consulta con Nueva evolución." />
          ) : (
            <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[19px] before:top-2 before:w-px before:bg-border">
              {linea.map((it, i) => {
                if (it.tipo === "triage") {
                  const t = it.e;
                  const n = t.nivel ? NIVELES_TRIAGE.find((x) => x.id === t.nivel) : undefined;
                  return (
                    <li key={`tr-${t.id}`} className="relative flex gap-4">
                      <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md"><Syringe className="size-4" /></span>
                      <div className="min-w-0 flex-1 rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">Triage de enfermería</p>
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
                    <li key={`es-${e.id}`} className="relative flex gap-4">
                      <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-md"><FlaskConical className="size-4" /></span>
                      <div className="min-w-0 flex-1 rounded-2xl border border-border/70 bg-secondary/40 p-4">
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
                  <li key={e.id} className="group relative flex gap-4">
                    <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl pn-acc-tile text-white shadow-md"><Stethoscope className="size-4" /></span>
                    <article className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-border/70 bg-card transition-shadow group-hover:shadow-md">
                      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border/60 bg-secondary/40 px-4 py-2.5">
                        <p className="text-sm font-semibold">{new Date(e.fecha).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                        <span className="text-xs text-muted-foreground">{new Date(e.fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })} hs · {e.doctor}</span>
                        <div className="ml-auto flex items-center gap-1">
                          <button onClick={() => imprimirHtml(htmlEvolucion(p, e))} className="rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-card hover:text-foreground">Imprimir</button>
                          {e.doctor === user.nombre && (
                            <button onClick={() => { if (window.confirm("¿Eliminar esta evolución?")) onBorrar(e.id); }} className="rounded-lg p-1 text-muted-foreground opacity-0 transition hover:text-red-600 group-hover:opacity-100" aria-label="Eliminar evolución"><Trash2 className="size-3.5" /></button>
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
              })}
            </ol>
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
    if (!f.motivo.trim()) { toast.error("Completá el motivo de consulta"); return; }
    if (!f.nota.trim()) { toast.error("Escribí la evolución del cuadro clínico"); return; }
    if (dx.length === 0) { toast.error("Agregá al menos un diagnóstico"); return; }
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
            <p className="text-xs text-muted-foreground">{p.nombre} · {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {user.nombre}</p>
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
                <p className="mt-0.5 text-xs opacity-80">Los signos vitales los carga enfermería desde la pestaña «Enfermería – Triage». Cuando los registre, aparecen acá automáticamente. Podés guardar la evolución igual.</p>
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
    return lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
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
function SelectorPaciente({ pacientes, valor, onChange }: { pacientes: PacienteHC[]; valor: string; onChange: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState(false);
  const sel = pacientes.find((p) => p.id === valor);
  const lista = pacientes.filter((p) => `${p.nombre} ${p.dni ?? ""}`.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  return (
    <div className="relative">
      <button type="button" onClick={() => setAbierto(!abierto)} className={inp + " flex items-center justify-between text-left"}>
        <span className={sel ? "" : "text-muted-foreground"}>{sel ? `${sel.nombre}${sel.dni ? ` · C.C. ${sel.dni}` : ""}` : "Elegí un paciente"}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>
      {abierto && (
        <div className="absolute inset-x-0 top-12 z-30 rounded-xl border border-border bg-card p-2 shadow-2xl">
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
            {lista.length === 0 && <li className="px-2 py-3 text-center text-xs text-muted-foreground">Sin resultados. Cargalo en Pacientes.</li>}
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
  const [, setPadron] = useDato<PacienteClinica[]>(KEY_PADRON, []);
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
    const limpio = JSON.parse(JSON.stringify({ ...editando, nombre: editando.nombre.trim(), dni: editando.dni.replace(/\D/g, "") })) as PacienteClinica;
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
                    <CalendarDays className="size-3.5" /> {dia === "sin-fecha" ? "Sin fecha de registro" : new Date(`${dia}T12:00`).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
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
                          {p.origen === "padron" ? "Cargado en clínica" : p.origen === "portal" ? "Portal" : "Desde turno"}
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
            <Campo label="Nombre y apellido" className="sm:col-span-2"><input required value={editando.nombre} onChange={set("nombre")} className={inp} /></Campo>
            <Campo label="Cédula"><input required inputMode="numeric" value={editando.dni} onChange={set("dni")} className={inp} /></Campo>
            <Campo label="Fecha de nacimiento"><input type="date" value={editando.nacimiento ?? ""} onChange={set("nacimiento")} className={inp} /></Campo>
            <Campo label="Sexo">
              <select value={editando.sexo ?? ""} onChange={set("sexo")} className={inp}>
                <option value="">—</option><option value="F">Femenino</option><option value="M">Masculino</option><option value="X">X</option>
              </select>
            </Campo>
            <Campo label="WhatsApp / teléfono"><input type="tel" value={editando.telefono ?? ""} onChange={set("telefono")} className={inp} /></Campo>
            <Campo label="Email"><input type="email" value={editando.email ?? ""} onChange={set("email")} className={inp} /></Campo>
            <Campo label="Domicilio"><input value={editando.domicilio ?? ""} onChange={set("domicilio")} className={inp} /></Campo>
            <Campo label="Obra social / prepaga"><input value={editando.obraSocial ?? ""} onChange={set("obraSocial")} placeholder="Particular, OSDE, PAMI…" className={inp} /></Campo>
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
            <Button variant="outline" className="h-10 rounded-xl" onClick={() => exportarCSV("pacientes", [["Nombre", "Cédula", "Teléfono", "Email", "Obra social", "Afiliado", "Nacimiento", "Alergias", "Antecedentes", "Portal"], ...pacientes.map((p) => [p.nombre, p.dni, p.telefono, p.email, p.ficha?.obraSocial, p.ficha?.afiliado, p.ficha?.nacimiento, p.ficha?.alergias, (p.ficha?.antecedentes ?? []).join(" | "), p.portal ? "Sí" : "No"])])}>
              <Download className="size-4" /> Exportar
            </Button>
            {!soloLectura && <Button className="h-10 rounded-xl" onClick={() => setEditando(vacio())}><Plus className="size-4" /> Nuevo paciente</Button>}
          </div>
        }
      >
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
          <Vacio icon={Users} titulo="No hay pacientes" texto="Cargá el primero con Nuevo paciente. También aparecen los del portal y los que sacan turno." />
        ) : (
          <ul className="divide-y divide-border/60">
            {visibles.map((p) => {
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
                          {p.origen === "turno" && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200">Solo turno</span>}
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
                          <p className="flex items-center gap-1.5 font-semibold text-foreground/85"><CalendarDays className="size-3.5 text-[rgb(var(--acc))]" /> {proximo.fecha === hoyIso ? "Hoy" : fechaCorta(proximo.fecha).slice(0, 5)} · {proximo.hora}</p>
                          <p className="mt-1 truncate text-muted-foreground">{nombreCorto(proximo.doctor)}</p>
                        </>
                      ) : (
                        <p className="text-muted-foreground">Sin turno agendado</p>
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

function datosMedico(user: SessionUser) {
  const d = DOCTORS.find((x) => x.foto === user.id);
  return {
    nombre: d?.nombre ?? user.nombre,
    matricula: d?.matricula ?? "",
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
        {vacio && <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">Firmá acá con el mouse o el dedo</p>}
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

function htmlReceta(r: Receta, firma: string | undefined) {
  const items = r.items
    .map((it, i) => `<div class="it"><p class="n">${i + 1}. ${it.droga} ${it.presentacion}</p><p class="m">Cantidad: <b>${it.cantidad}</b></p><p class="m">${it.posologia}</p></div>`)
    .join("");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Receta N° ${r.numero}</title>
<style>
*{box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;color:#0f172a;margin:0;padding:32px;background:#f1f5f9}
.hoja{max-width:720px;margin:auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 20px 60px -30px rgba(15,23,42,.5)}
.top{background:linear-gradient(135deg,#0b2a6b,#1d4ed8);color:#fff;padding:26px 30px;display:flex;justify-content:space-between;gap:16px}
.top h1{margin:0;font-size:20px}.top p{margin:4px 0 0;font-size:12px;opacity:.8}.rx{font-family:Georgia,serif;font-size:44px;font-style:italic;opacity:.9}
.body{padding:26px 30px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 24px;font-size:13px;border-bottom:1px solid #e2e8f0;padding-bottom:16px}
.grid b{color:#475569;font-weight:600}.it{border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;margin-top:12px}.n{margin:0;font-weight:700;font-size:15px}.m{margin:4px 0 0;font-size:13px;color:#334155}
.dx{margin-top:16px;font-size:13px}.ind{margin-top:12px;font-size:13px;background:#f8fafc;border-radius:10px;padding:10px 12px}
.pie{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-top:28px}
.firma{text-align:center;min-width:220px}.firma img{height:70px}.firma .l{border-top:1px solid #334155;padding-top:6px;font-size:12px}
.cod{font-size:11px;color:#64748b}.cod b{font-family:ui-monospace,monospace;font-size:14px;color:#0f172a;letter-spacing:.12em}
.anulada{color:#dc2626;font-weight:800;border:2px solid #dc2626;padding:6px 10px;border-radius:8px;display:inline-block;margin-bottom:10px}
@media print{body{background:#fff;padding:0}.hoja{box-shadow:none;border-radius:0}}
</style></head><body><div class="hoja">
<div class="top"><div><h1>HEGO · Centro de especialidades médicas</h1><p>${r.doctor} · ${r.especialidad} · ${r.matricula}</p></div><div class="rx">Rp/</div></div>
<div class="body">${r.anulada ? `<div class="anulada">RECETA ANULADA</div>` : ""}
<div class="grid"><div><b>Paciente:</b> ${r.paciente}</div><div><b>Fecha:</b> ${fechaDe(r.fecha)}</div>
<div><b>Cédula:</b> ${r.dni ?? "—"}</div><div><b>Receta N°:</b> ${String(r.numero).padStart(6, "0")}</div>
<div><b>Cobertura:</b> ${r.obraSocial ?? "Particular"}</div><div><b>Afiliado:</b> ${r.afiliado ?? "—"}</div></div>
${items}
<p class="dx"><b>Diagnóstico:</b> ${r.diagnostico}</p>${r.indicaciones ? `<p class="ind"><b>Indicaciones:</b> ${r.indicaciones}</p>` : ""}
<div class="pie"><div class="cod">Código de verificación<br><b>${r.codigo}</b><br>Firmada digitalmente el ${new Date(r.fecha).toLocaleString("es-AR")}</div>
<div class="firma">${firma ? `<img src="${firma}" alt="Firma">` : ""}<div class="l">${r.doctor}<br>${r.matricula}</div></div></div>
</div></div><script>setTimeout(()=>window.print(),300)</script></body></html>`;
}
function imprimirHtml(html: string) {
  const w = window.open("", "_blank", "width=800,height=1000");
  if (!w) return;
  w.document.write(html);
  w.document.close();
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
  const med = datosMedico(user);
  const firma = firmas[user.id];
  const pac = pacientes.find((p) => p.id === pacId);

  const emitir = (e: FormEvent) => {
    e.preventDefault();
    if (!pac) { toast.error("Elegí un paciente"); return; }
    if (!firma) { toast.error("Primero registrá tu firma"); return; }
    const validos = items.filter((i) => i.droga.trim());
    if (validos.length === 0) { toast.error("Agregá al menos un medicamento"); return; }
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
        <Kpi icon={PenLine} label="Tu firma" value={firma ? "Registrada" : "Falta"} hint={firma ? "Se usa en cada receta" : "Registrala para emitir"} tono={firma ? "verde" : "ambar"} delay={0.15} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <form onSubmit={emitir} className="pn-card pn-up space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <span className="pn-acc-tile flex size-10 items-center justify-center rounded-xl font-display text-lg italic text-white">Rp</span>
              <div>
                <h3 className="text-[15px] font-semibold">Nueva receta digital</h3>
                <p className="text-xs text-muted-foreground">{med.nombre} · {med.especialidad} · {med.matricula}</p>
              </div>
            </div>
          </div>
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
              <div key={i} className="relative rounded-2xl border border-border/70 bg-secondary/30 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Medicamento {i + 1}</p>
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
              La receta sale con tu firma digitalizada y un código de verificación. Para que valga como receta electrónica ante farmacias y obras sociales, se tiene que emitir por una plataforma registrada (Ley 27.553); eso se conecta en el backend.
            </p>
            <Button type="submit" className="rounded-xl px-6" disabled={!firma}><PenLine className="size-4" /> Firmar y emitir</Button>
          </div>
        </form>

        <div className="space-y-6">
          <Seccion icon={PenLine} titulo="Firma del médico" sub={firma ? "Registrada" : "Dibujala una sola vez"} delay={0.05}>
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
                <div className="pn-keep rounded-2xl bg-white p-4 text-center ring-1 ring-border">
                  <img src={firma} alt="Firma" className="mx-auto h-20" />
                  <p className="mt-1 border-t border-slate-300 pt-1.5 text-xs text-slate-600">{med.nombre} · {med.matricula}</p>
                </div>
                <Button variant="outline" className="w-full rounded-xl" onClick={() => setFirmando(true)}><Pencil className="size-4" /> Cambiar firma</Button>
              </div>
            ) : (
              <Vacio icon={PenLine} titulo="Sin firma" texto="Registrá tu firma para poder emitir recetas y órdenes." accion={<Button className="rounded-xl" onClick={() => setFirmando(true)}><PenLine className="size-4" /> Registrar firma</Button>} />
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
          <Vacio icon={Pill} texto="Las recetas que emitas aparecen acá para reimprimir, enviar o anular." />
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
                        href={waDe(tel, `Hola ${r.paciente.split(" ")[0]}, te enviamos tu receta N° ${r.numero} del Centro HEGO:\n${r.items.map((i) => `• ${i.droga} ${i.presentacion} — ${i.posologia}`).join("\n")}\nCódigo de verificación: ${r.codigo}`)}
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
    ],
  },
  {
    id: "tiroides",
    nombre: "Tiroides",
    esp: "General",
    det: [{ id: "tsh", nombre: "TSH", unidad: "µUI/ml", min: 0.4, max: 4.5 }],
  },
];
const DET_TODAS = PANELES_LAB.flatMap((p) => p.det);
function flagDe(d: Determinacion, v: number): "alto" | "bajo" | "ok" {
  if (d.max !== undefined && v > d.max) return "alto";
  if (d.min !== undefined && v < d.min) return "bajo";
  return "ok";
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
.firma{text-align:right;margin-top:40px}.firma img{height:64px}.firma div{display:inline-block;border-top:1px solid #334155;padding-top:6px;font-size:12px;min-width:220px;text-align:center}</style></head><body>
<h1>HEGO · Centro de especialidades médicas · Orden de laboratorio</h1><p class="m">${fechaDe(p.fecha)} · ${med.nombre} · ${med.matricula}</p>
<p><b>Paciente:</b> ${p.paciente}</p>${p.urgente ? `<span class="tag">URGENTE</span>` : ""}${p.ayuno ? `<span class="tag" style="background:#e0f2fe;color:#075985">Con ayuno de 8 a 12 h</span>` : ""}
${paneles.map((x) => `<div class="box"><h3>${x.nombre}</h3><p>${x.det.map((d) => d.nombre).join(" · ")}</p></div>`).join("")}
${p.nota ? `<p class="m" style="margin-top:14px"><b>Nota:</b> ${p.nota}</p>` : ""}
<div class="firma">${firma ? `<img src="${firma}"><br>` : ""}<div>${med.nombre}<br>${med.matricula}</div></div><script>setTimeout(()=>window.print(),300)</script></body></html>`;
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
  const med = datosMedico(user);

  const crear = (e: FormEvent) => {
    e.preventDefault();
    const pac = pacientes.find((p) => p.id === pacId);
    if (!pac) { toast.error("Elegí un paciente"); return; }
    if (paneles.length === 0) { toast.error("Elegí al menos un panel"); return; }
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
              <p className="text-xs text-muted-foreground">Se imprime la orden con tu firma</p>
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
            <select value={verEstado} onChange={(e) => setVerEstado(e.target.value as "todos" | EstadoLab)} className={inp + " h-10 w-40"}>
              <option value="todos">Todos</option><option>Pedido</option><option>En proceso</option><option>Resultado</option>
            </select>
            <Button className="h-10 rounded-xl" onClick={() => { setNuevo(true); setCargando(null); }}><Plus className="size-4" /> Nuevo pedido</Button>
          </div>
        }
      >
        {lista.length === 0 ? (
          <Vacio icon={FlaskConical} texto="Creá un pedido, imprimí la orden y después cargá los resultados: se guardan en la historia clínica." />
        ) : (
          <ul className="space-y-3">
            {lista.map((p) => (
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
                    <button onClick={() => imprimirHtml(htmlOrdenLab(p, datosMedico({ id: ADMINS.find((a) => a.nombre === p.doctor)?.id ?? user.id, nombre: p.doctor }), firmas[ADMINS.find((a) => a.nombre === p.doctor)?.id ?? ""]))} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Orden</button>
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
          </ul>
        )}
      </Seccion>
    </div>
  );
}

/* ═══════════════════════ PAGOS Y FACTURACIÓN ═══════════════════════ */
type VistaFact = "comprobantes" | "porfacturar" | "obras";
const ESTADO_FACT: Record<Factura["estado"], string> = {
  Emitida: "bg-amber-100 text-amber-800 ring-amber-200",
  Cobrada: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Anulada: "bg-red-100 text-red-700 ring-red-200",
};

function htmlFactura(f: Factura) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${f.tipo} ${f.numero}</title>
<style>body{font-family:system-ui,sans-serif;color:#0f172a;padding:36px;max-width:760px;margin:auto}.cab{display:flex;justify-content:space-between;border:1px solid #cbd5e1;border-radius:12px;padding:18px}
.letra{font-size:34px;font-weight:800;border:2px solid #0f172a;border-radius:8px;width:56px;height:56px;display:flex;align-items:center;justify-content:center}
h1{margin:0;font-size:20px}.m{color:#64748b;font-size:12px;margin:3px 0}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{border-bottom:1px solid #e2e8f0;padding:9px;font-size:13px;text-align:left}
.tot{text-align:right;font-size:20px;font-weight:800;margin-top:14px}.nota{margin-top:26px;font-size:11px;color:#64748b;border-top:1px dashed #cbd5e1;padding-top:10px}</style></head><body>
<div class="cab"><div><h1>HEGO · Centro de especialidades médicas</h1><p class="m">Dirección médica: Dres. Gómez Bolaño</p></div><div class="letra">${f.tipo === "Recibo" ? "R" : f.tipo.slice(-1)}</div>
<div style="text-align:right"><b>${f.tipo}</b><p class="m">N° ${f.numero}</p><p class="m">${fechaDe(f.fecha)}</p></div></div>
<p style="margin-top:16px;font-size:14px"><b>Receptor:</b> ${f.receptor}${f.docReceptor ? ` · ${f.docReceptor}` : ""}<br><b>Cobertura:</b> ${f.cobertura}</p>
<table><thead><tr><th>Descripción</th><th>Cant.</th><th>Precio</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>
${f.items.map((i) => `<tr><td>${i.desc}</td><td>${i.cant}</td><td>${dinero(i.precio)}</td><td style="text-align:right">${dinero(i.cant * i.precio)}</td></tr>`).join("")}</tbody></table>
<p class="tot">Total ${dinero(f.total)}</p>${f.estado === "Anulada" ? `<p style="color:#dc2626;font-weight:800">COMPROBANTE ANULADO</p>` : ""}
<p class="nota">Comprobante interno de la clínica. La factura electrónica con CAE se emite al conectar ARCA (ex AFIP) en el sistema.</p><script>setTimeout(()=>window.print(),300)</script></body></html>`;
}

function FacturacionTab({ user, log, turnos, vista, setVista }: { user: SessionUser; log: LogFn; turnos: Turno[]; vista: VistaFact; setVista: (v: VistaFact) => void }) {
  const pacientes = usePacientesClinica(turnos);
  const [facturas, setFacturas] = useDato<Factura[]>(KEY_FACTURAS, []);
  const [cobros] = useDato<Cobro[]>(KEY_COBROS, []);
  const [form, setForm] = useState<Omit<Factura, "id" | "numero" | "estado" | "emitidaPor" | "total"> | null>(null);
  const [q, setQ] = useState("");

  const proximoNumero = (tipo: TipoComprobante) => {
    const n = facturas.filter((f) => f.tipo === tipo).length + 1;
    return `0001-${String(n).padStart(8, "0")}`;
  };
  const nuevo = (base?: Partial<Factura>) =>
    setForm({ tipo: "Factura C", fecha: new Date().toISOString(), receptor: "", cobertura: "Particular", items: [{ desc: SERVICIOS[0]?.nombre ?? "Consulta", cant: 1, precio: SERVICIOS[0]?.precio ?? 0 }], ...base } as Omit<Factura, "id" | "numero" | "estado" | "emitidaPor" | "total">);

  const emitir = (e: FormEvent) => {
    e.preventDefault();
    if (!form || !form.receptor.trim()) { toast.error("Completá el receptor"); return; }
    const total = form.items.reduce((a, i) => a + i.cant * i.precio, 0);
    const f = JSON.parse(JSON.stringify({ ...form, id: nuevoId(), numero: proximoNumero(form.tipo), estado: form.cobroId ? "Cobrada" : "Emitida", emitidaPor: user.nombre, total })) as Factura;
    setFacturas((prev) => [f, ...prev]);
    log("Comprobante emitido", `${f.tipo} ${f.numero} · ${f.receptor} · ${dinero(total)}`);
    toast.success(`${f.tipo} ${f.numero} emitida`);
    setForm(null);
    imprimirHtml(htmlFactura(f));
  };

  const mes = isoDe(new Date()).slice(0, 7);
  const delMes = facturas.filter((f) => f.estado !== "Anulada" && f.fecha.slice(0, 7) === mes);
  const sinFacturar = cobros.filter((c) => !c.anulado && pagadoDe(c) > 0 && !facturas.some((f) => f.cobroId === c.id && f.estado !== "Anulada"));
  const pendOS = facturas.filter((f) => f.estado === "Emitida" && f.cobertura !== "Particular");
  const porOS = Object.entries(
    facturas.filter((f) => f.estado !== "Anulada" && f.cobertura !== "Particular").reduce<Record<string, { total: number; pend: number; n: number }>>((acc, f) => {
      const k = f.cobertura;
      acc[k] ??= { total: 0, pend: 0, n: 0 };
      acc[k].total += f.total;
      acc[k].n += 1;
      if (f.estado === "Emitida") acc[k].pend += f.total;
      return acc;
    }, {}),
  ).sort((a, b) => b[1].pend - a[1].pend);
  const lista = facturas.filter((f) => !q || norm(`${f.receptor} ${f.numero} ${f.cobertura}`).includes(norm(q)));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Receipt} label="Facturado este mes" value={dinero(delMes.reduce((a, f) => a + f.total, 0))} hint={`${delMes.length} comprobantes`} tono="verde" />
        <Kpi icon={Wallet} label="Cobrado" value={dinero(delMes.filter((f) => f.estado === "Cobrada").reduce((a, f) => a + f.total, 0))} hint="Del mes" delay={0.05} />
        <Kpi icon={Building2} label="Pendiente obras sociales" value={dinero(pendOS.reduce((a, f) => a + f.total, 0))} hint={`${pendOS.length} por liquidar`} tono="ambar" delay={0.1} />
        <Kpi icon={AlertTriangle} label="Cobros sin facturar" value={String(sinFacturar.length)} hint="Pagos de pacientes" tono="rojo" delay={0.15} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="pn-card inline-flex flex-wrap gap-1 p-1.5">
          {([["comprobantes", "Comprobantes", Receipt], ["porfacturar", `Por facturar (${sinFacturar.length})`, Clock], ["obras", "Obras sociales", Building2]] as [VistaFact, string, LucideIcon][]).map(([id, l, Ic]) => (
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
              <p className="text-xs text-muted-foreground">N° {proximoNumero(form.tipo)}</p>
            </div>
            <button type="button" onClick={() => setForm(null)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><X className="size-4" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Campo label="Tipo">
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoComprobante })} className={inp}>
                <option>Factura C</option><option>Factura B</option><option>Recibo</option>
              </select>
            </Campo>
            <Campo label="Paciente / receptor">
              <input
                list="fact-pacientes"
                value={form.receptor}
                onChange={(e) => {
                  const p = pacientes.find((x) => x.nombre === e.target.value);
                  setForm({ ...form, receptor: e.target.value, ...(p ? { docReceptor: p.dni ? `C.C. ${p.dni}` : undefined, cobertura: p.ficha?.obraSocial || form.cobertura } : {}) } as typeof form);
                }}
                className={inp}
              />
              <datalist id="fact-pacientes">{pacientes.map((p) => <option key={p.id} value={p.nombre} />)}</datalist>
            </Campo>
            <Campo label="Cédula / NIT"><input value={form.docReceptor ?? ""} onChange={(e) => setForm({ ...form, docReceptor: e.target.value })} className={inp} /></Campo>
            <Campo label="Cobertura"><input value={form.cobertura} onChange={(e) => setForm({ ...form, cobertura: e.target.value })} placeholder="Particular u obra social" className={inp} /></Campo>
          </div>
          <datalist id="fact-servicios">{SERVICIOS.map((s) => <option key={s.id} value={s.nombre} />)}</datalist>
          <div className="space-y-2">
            {form.items.map((it, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_90px_160px_40px]">
                <input
                  list="fact-servicios"
                  value={it.desc}
                  onChange={(e) => {
                    const s = SERVICIOS.find((x) => x.nombre === e.target.value);
                    setForm({ ...form, items: form.items.map((x, j) => (j === i ? { ...x, desc: e.target.value, ...(s ? { precio: s.precio } : {}) } : x)) });
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
            <p className="font-display text-2xl font-semibold">Total {dinero(form.items.reduce((a, i) => a + i.cant * i.precio, 0))}</p>
            <Button type="submit" className="rounded-xl px-6"><Receipt className="size-4" /> Emitir e imprimir</Button>
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
              <Button variant="outline" className="h-10 rounded-xl" onClick={() => exportarCSV("facturacion", [["Tipo", "Número", "Fecha", "Receptor", "Documento", "Cobertura", "Total", "Estado"], ...facturas.map((f) => [f.tipo, f.numero, fechaHora(f.fecha), f.receptor, f.docReceptor, f.cobertura, f.total, f.estado])])}><Download className="size-4" /> Exportar</Button>
            </div>
          }
        >
          {lista.length === 0 ? (
            <Vacio icon={Receipt} texto="Todavía no emitiste comprobantes. Podés facturar los cobros de pacientes desde Por facturar." />
          ) : (
            <ul className="divide-y divide-border/60">
              {lista.map((f) => (
                <li key={f.id} className="flex flex-col gap-3 py-3.5 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-sm font-bold text-white">{f.tipo === "Recibo" ? "R" : f.tipo.slice(-1)}</span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-semibold">{f.receptor} <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${ESTADO_FACT[f.estado]}`}>{f.estado}</span></p>
                      <p className="text-xs text-muted-foreground">{f.tipo} {f.numero} · {fechaHora(f.fecha)} · {f.cobertura}</p>
                    </div>
                  </div>
                  <p className="font-display text-xl font-semibold tabular-nums lg:w-36 lg:text-right">{dinero(f.total)}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => imprimirHtml(htmlFactura(f))} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Imprimir</button>
                    {f.estado === "Emitida" && (
                      <button onClick={() => { setFacturas((p) => p.map((x) => (x.id === f.id ? { ...x, estado: "Cobrada" } : x))); log("Comprobante cobrado", `${f.numero}`); }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">Marcar cobrada</button>
                    )}
                    {f.estado !== "Anulada" && (
                      <button onClick={() => { setFacturas((p) => p.map((x) => (x.id === f.id ? { ...x, estado: "Anulada" } : x))); log("Comprobante anulado", `${f.tipo} ${f.numero}`); }} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600">Anular</button>
                    )}
                  </div>
                </li>
              ))}
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
              {sinFacturar.map((c) => (
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
            </ul>
          )}
        </Seccion>
      )}

      {vista === "obras" && (
        <Seccion icon={Building2} titulo="Liquidación por obra social" sub="Lo facturado a cada cobertura y lo que falta cobrar">
          {porOS.length === 0 ? (
            <Vacio icon={Building2} texto="Cuando factures a una obra social o prepaga, acá ves cuánto te deben." />
          ) : (
            <ul className="space-y-3">
              {porOS.map(([os, v]) => (
                <li key={os} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/70 p-4">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 text-white"><Building2 className="size-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{os}</p>
                    <p className="text-xs text-muted-foreground">{v.n} comprobantes · Facturado {dinero(v.total)}</p>
                    <div className="mt-2 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-secondary">
                      <div className="pn-bar h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-600" style={{ width: `${v.total ? ((v.total - v.pend) / v.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Pendiente</p>
                    <p className="font-display text-xl font-semibold tabular-nums text-amber-700">{dinero(v.pend)}</p>
                  </div>
                  {v.pend > 0 && (
                    <Button size="sm" variant="outline" className="rounded-xl" onClick={() => { setFacturas((p) => p.map((x) => (x.cobertura === os && x.estado === "Emitida" ? { ...x, estado: "Cobrada" } : x))); log("Liquidación cobrada", `${os} · ${dinero(v.pend)}`); toast.success(`${os}: liquidación marcada como cobrada`); }}>
                      <Check className="size-4" /> Marcar liquidada
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Seccion>
      )}
      <p className="text-center text-[11px] text-muted-foreground">Comprobantes internos. La factura electrónica con CAE se emite al conectar ARCA (ex AFIP) en el backend.</p>
    </div>
  );
}

/* ═══════════════════════ ANALÍTICA Y REPORTES ═══════════════════════ */
function BarrasV({ datos, color = "#3b82f6", fmt = (n: number) => String(n) }: { datos: { l: string; v: number }[]; color?: string; fmt?: (n: number) => string }) {
  const max = Math.max(1, ...datos.map((d) => d.v));
  return (
    <div className="flex h-48 items-end gap-2">
      {datos.map((d, i) => (
        <div key={d.l} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
          <span className="text-[10px] font-semibold tabular-nums text-muted-foreground opacity-0 transition group-hover:opacity-100">{fmt(d.v)}</span>
          <div className="w-full max-w-[44px] rounded-t-lg transition-all duration-700" style={{ height: `${Math.max(3, (d.v / max) * 100)}%`, background: `linear-gradient(180deg, ${color}, ${color}99)`, animation: `pn-up .6s ease-out ${i * 0.05}s both`, boxShadow: `0 10px 20px -12px ${color}` }} />
          <span className="w-full truncate text-center text-[10px] capitalize text-muted-foreground">{d.l}</span>
        </div>
      ))}
    </div>
  );
}
function BarrasH({ datos, colores }: { datos: { l: string; v: number }[]; colores: string[] }) {
  const max = Math.max(1, ...datos.map((d) => d.v));
  const total = datos.reduce((a, d) => a + d.v, 0);
  return (
    <ul className="space-y-3">
      {datos.map((d, i) => (
        <li key={d.l}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium">{d.l}</span>
            <span className="tabular-nums text-muted-foreground">{d.v}{total ? ` · ${Math.round((d.v / total) * 100)}%` : ""}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
            <div className="pn-bar h-full rounded-full" style={{ width: `${(d.v / max) * 100}%`, background: colores[i % colores.length], animationDelay: `${i * 0.08}s` }} />
          </div>
        </li>
      ))}
      {datos.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Sin datos en el período.</li>}
    </ul>
  );
}

function AnaliticaTab({ log, turnos }: { log: LogFn; turnos: Turno[] }) {
  const pacientes = usePacientesClinica(turnos);
  const [cobros] = useDato<Cobro[]>(KEY_COBROS, []);
  const [facturas] = useDato<Factura[]>(KEY_FACTURAS, []);
  const [evols] = useDato<Evolucion[]>(KEY_EVOLUCIONES, []);
  const [recetas] = useDato<Receta[]>(KEY_RECETAS, []);
  const [labs] = useDato<PedidoLab[]>(KEY_LAB, []);
  const [estudios] = useDato<Estudio[]>(KEY_ESTUDIOS, []);
  const [controles] = useDato<Control[]>(KEY_CONTROLES, []);
  const [dias, setDias] = useState(90);

  const desde = isoDe(new Date(Date.now() - dias * 86400000));
  const enRango = (iso: string) => dias >= 9999 || iso.slice(0, 10) >= desde;
  const ts = turnos.filter((t) => enRango(t.fecha));
  const atendidos = ts.filter((t) => t.estado === "Atendido").length;
  const cancelados = ts.filter((t) => t.estado === "Cancelado").length;
  const pagos = cobros.filter((c) => !c.anulado).flatMap((c) => c.pagos.map((p) => ({ ...p, c })));
  const pagosR = pagos.filter((p) => enRango(p.fecha));
  const ingresos = pagosR.reduce((a, p) => a + p.monto, 0);
  const nuevos = pacientes.filter((p) => p.creado && enRango(p.creado)).length;

  // Últimos 6 meses
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    return { k: isoDe(d).slice(0, 7), l: d.toLocaleDateString("es-AR", { month: "short" }) };
  });
  const turnosMes = meses.map((m) => ({ l: m.l, v: turnos.filter((t) => t.fecha.slice(0, 7) === m.k && t.estado !== "Cancelado").length }));
  const ingresosMes = meses.map((m) => ({ l: m.l, v: pagos.filter((p) => diaLocal(p.fecha).slice(0, 7) === m.k).reduce((a, p) => a + p.monto, 0) }));
  const porDoctor = ADMINS.map((a) => ({ l: nombreCorto(a.nombre), v: ts.filter((t) => t.doctor === a.nombre || norm(t.doctor).includes(norm(a.nombre.split(" ")[1] ?? ""))).length }));
  const porMetodo = Object.entries(pagosR.reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.metodo]: (acc[p.metodo] ?? 0) + p.monto }), {})).map(([l, v]) => ({ l, v })).sort((a, b) => b.v - a.v);
  const porEstado = (["Pendiente", "Confirmado", "Atendido", "Cancelado"] as Estado[]).map((e) => ({ l: e, v: ts.filter((t) => t.estado === e).length }));

  // Indicadores clínicos: último valor por paciente
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
  const porProf = ADMINS.map((a) => ({ l: nombreCorto(a.nombre), v: evols.filter((x) => x.doctor === a.nombre && enRango(x.fecha)).length }));

  const reportes: { t: string; d: string; icon: LucideIcon; run: () => void }[] = [
    { t: "Turnos", d: `${turnos.length} registros`, icon: CalendarDays, run: () => exportarCSV("turnos", [["Fecha", "Hora", "Paciente", "Doctor", "Motivo", "Estado", "Origen"], ...turnos.map((t) => [t.fecha, t.hora, t.paciente, t.doctor, t.motivo, t.estado, t.origen])]) },
    { t: "Pacientes", d: `${pacientes.length} pacientes`, icon: Users, run: () => exportarCSV("pacientes", [["Nombre", "Cédula", "Teléfono", "Obra social", "Antecedentes"], ...pacientes.map((p) => [p.nombre, p.dni, p.telefono, p.ficha?.obraSocial, (p.ficha?.antecedentes ?? []).join(" | ")])]) },
    { t: "Cobros", d: `${pagos.length} pagos`, icon: Wallet, run: () => exportarCSV("cobros", [["Fecha", "Paciente", "Concepto", "Medio", "Cobró", "Monto"], ...pagos.map((p) => [fechaHora(p.fecha), p.c.paciente, p.c.concepto, p.metodo, p.cobradoPor, p.monto])]) },
    { t: "Facturación", d: `${facturas.length} comprobantes`, icon: Receipt, run: () => exportarCSV("facturacion", [["Tipo", "Número", "Fecha", "Receptor", "Cobertura", "Total", "Estado"], ...facturas.map((f) => [f.tipo, f.numero, fechaHora(f.fecha), f.receptor, f.cobertura, f.total, f.estado])]) },
    { t: "Evoluciones", d: `${evols.length} consultas`, icon: FileText, run: () => exportarCSV("evoluciones", [["Fecha", "Paciente", "Especialidad", "Doctor", "Motivo", "TA", "Diagnósticos"], ...evols.map((e) => [fechaHora(e.fecha), e.paciente, e.especialidad, e.doctor, e.motivo, e.signos.sistolica ? `${e.signos.sistolica}/${e.signos.diastolica}` : "", e.diagnosticos.join(" | ")])]) },
    { t: "Recetas", d: `${recetas.length} recetas`, icon: Pill, run: () => exportarCSV("recetas", [["N°", "Fecha", "Paciente", "Doctor", "Medicamentos", "Estado"], ...recetas.map((r) => [r.numero, fechaHora(r.fecha), r.paciente, r.doctor, r.items.map((i) => i.droga).join(" | "), r.anulada ? "Anulada" : "Vigente"])]) },
    { t: "Laboratorio", d: `${labs.length} pedidos`, icon: FlaskConical, run: () => exportarCSV("laboratorio", [["Fecha", "Paciente", "Doctor", "Paneles", "Estado", "Resultados"], ...labs.map((l) => [fechaHora(l.fecha), l.paciente, l.doctor, l.paneles.join(" | "), l.estado, Object.entries(l.resultados).map(([k, v]) => `${k}=${v}`).join(" | ")])]) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="pn-card inline-flex flex-wrap gap-1 p-1.5">
          {[[30, "30 días"], [90, "3 meses"], [365, "12 meses"], [99999, "Todo"]].map(([d, l]) => (
            <button key={d} onClick={() => setDias(d as number)} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${dias === d ? "pn-acc-tile text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>{l}</button>
          ))}
        </div>
        <Button variant="outline" className="h-10 rounded-xl" onClick={() => { log("Reporte impreso", `Analítica · ${dias} días`); window.print(); }}><FileText className="size-4" /> Imprimir reporte</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={CalendarDays} label="Turnos" value={String(ts.length)} hint={`${atendidos} atendidos`} />
        <Kpi icon={Ban} label="Ausentismo" value={ts.length ? `${Math.round((cancelados / ts.length) * 100)}%` : "0%"} hint={`${cancelados} cancelados`} tono="ambar" delay={0.05} />
        <Kpi icon={Wallet} label="Ingresos" value={dinero(ingresos)} hint={pagosR.length ? `Ticket promedio ${dinero(Math.round(ingresos / pagosR.length))}` : "Sin cobros"} tono="verde" delay={0.1} />
        <Kpi icon={Users} label="Pacientes nuevos" value={String(nuevos)} hint={`${pacientes.length} en total`} tono="violeta" delay={0.15} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Seccion icon={CalendarDays} titulo="Turnos por mes" sub="Últimos 6 meses (sin cancelados)"><BarrasV datos={turnosMes} color="#3b82f6" /></Seccion>
        <Seccion icon={TrendingUp} titulo="Ingresos por mes" sub="Pagos de pacientes" delay={0.05}><BarrasV datos={ingresosMes} color="#10b981" fmt={dinero} /></Seccion>
        <Seccion icon={Stethoscope} titulo="Turnos por doctor" sub="En el período" delay={0.1}><BarrasH datos={porDoctor} colores={["linear-gradient(90deg,#0ea5e9,#1d4ed8)", "linear-gradient(90deg,#f43f5e,#be123c)"]} /></Seccion>
        <Seccion icon={ClipboardList} titulo="Estado de los turnos" sub="En el período" delay={0.15}><BarrasH datos={porEstado} colores={["#f59e0b", "#0ea5e9", "#10b981", "#ef4444"]} /></Seccion>
        <Seccion icon={Receipt} titulo="Medios de pago" sub="Monto cobrado por medio" delay={0.2}><BarrasH datos={porMetodo} colores={["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#06b6d4", "#64748b"]} /></Seccion>
        <Seccion icon={FileText} titulo="Consultas por profesional" sub="Evoluciones de historia clínica en el período" delay={0.25}><BarrasH datos={porProf} colores={["#0ea5e9", "#8b5cf6", "#f43f5e"]} /></Seccion>
      </div>

      <Seccion icon={Activity} titulo="Indicadores clínicos" sub="Último valor registrado de cada paciente">
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-sky-700"><Droplets className="size-3.5" /> Estadios de ERC (KDIGO)</p>
            <BarrasV datos={estadios} color="#0ea5e9" />
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl bg-secondary/40 p-6 text-center">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-rose-700"><HeartPulse className="size-3.5" /> Presión controlada</p>
            <div className="relative size-36">
              <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeOpacity=".1" strokeWidth="3.2" />
                <circle className="pn-donut" cx="18" cy="18" r="15.9" fill="none" stroke="#f43f5e" strokeWidth="3.2" strokeLinecap={controlados ? "round" : "butt"} strokeDasharray={`${conTA.length ? (controlados / conTA.length) * 100 : 0} 100`} />
              </svg>
              <p className="absolute inset-0 flex flex-col items-center justify-center font-display text-3xl font-semibold">{conTA.length ? Math.round((controlados / conTA.length) * 100) : 0}%<span className="font-sans text-[10px] font-normal text-muted-foreground">&lt; 140/90</span></p>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{controlados} de {conTA.length} pacientes con registros</p>
          </div>
          <div className="space-y-3">
            {[
              { l: "Pacientes con función renal medida", v: ultimoEgfr.size, c: "text-sky-700" },
              { l: "ERC estadio 3 o más (eGFR < 60)", v: [...ultimoEgfr.values()].filter((x) => x.v < 60).length, c: "text-amber-700" },
              { l: "Para evaluar derivación (eGFR < 30)", v: [...ultimoEgfr.values()].filter((x) => x.v < 30).length, c: "text-red-700" },
              { l: "Registros con FEVI reducida (< 41%)", v: feviRed, c: "text-rose-700" },
              { l: "Recetas emitidas en el período", v: recetas.filter((r) => enRango(r.fecha)).length, c: "text-violet-700" },
              { l: "Laboratorios en el período", v: labs.filter((l) => enRango(l.fecha)).length, c: "text-emerald-700" },
            ].map((x) => (
              <div key={x.l} className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-2.5">
                <span className="text-sm">{x.l}</span>
                <span className={`font-display text-xl font-semibold tabular-nums ${x.c}`}>{x.v}</span>
              </div>
            ))}
          </div>
        </div>
      </Seccion>

      <Seccion icon={Download} titulo="Reportes para descargar" sub="Planillas CSV que se abren en Excel o Google Sheets">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {reportes.map((r) => (
            <button key={r.t} onClick={() => { r.run(); log("Reporte exportado", r.t); }} className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <span className="pn-acc-tile flex size-10 items-center justify-center rounded-xl text-white"><r.icon className="size-4" /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{r.t}</span>
                <span className="block text-xs text-muted-foreground">{r.d}</span>
              </span>
              <Download className="size-4 text-muted-foreground transition group-hover:text-foreground" />
            </button>
          ))}
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
    id: "agenda", letra: "A", titulo: "Agenda y turnos", icon: CalendarDays, grad: "from-sky-500 to-blue-700",
    items: [
      { id: "recordatorio24", nombre: "Recordatorio 24 h antes del turno", desc: "Mensaje al paciente el día anterior con día, hora y doctor.", canal: "WhatsApp", motor: true },
      { id: "confirmar", nombre: "Pedir confirmación de turnos pendientes", desc: "Le pide al paciente que confirme o reprograme.", canal: "WhatsApp", motor: true },
      { id: "ausentes", nombre: "Recuperar turnos cancelados", desc: "Ofrece un nuevo horario a quien canceló en las últimas 2 semanas.", canal: "WhatsApp", motor: true },
      { id: "encuesta", nombre: "Encuesta después de la consulta", desc: "Pregunta cómo fue la atención al día siguiente.", canal: "WhatsApp", motor: true },
    ],
  },
  {
    id: "cardio", letra: "B", titulo: "Cardiología", icon: HeartPulse, grad: "from-rose-500 to-red-600",
    items: [
      { id: "crisisTA", nombre: "Alerta de presión en crisis", desc: "Avisa al cardiólogo si se registra una TA > 180/120.", canal: "Panel", motor: true },
      { id: "controlTA", nombre: "Recordatorio semanal de control de presión", desc: "Pide a los hipertensos que carguen su presión en el portal.", canal: "WhatsApp", motor: true },
      { id: "feviBaja", nombre: "Seguimiento de FEVI reducida", desc: "Marca a los pacientes con FEVI < 41% sin control en 90 días.", canal: "Panel", motor: true },
      { id: "prepHolter", nombre: "Preparación para Holter / MAPA", desc: "Envía las indicaciones el día anterior al estudio.", canal: "WhatsApp", motor: false },
    ],
  },
  {
    id: "nefro", letra: "C", titulo: "Nefrología", icon: Droplets, grad: "from-sky-400 to-cyan-600",
    items: [
      { id: "potasio", nombre: "Alerta de potasio alto", desc: "Avisa al nefrólogo si un resultado supera 5,5 mEq/l.", canal: "Panel", motor: true },
      { id: "egfrCae", nombre: "Caída del filtrado glomerular", desc: "Detecta una caída mayor al 25% entre dos resultados.", canal: "Panel", motor: true },
      { id: "g4", nombre: "Estadio G4–G5: evaluar derivación", desc: "Marca pacientes con eGFR < 30 para planificar el tratamiento.", canal: "Panel", motor: true },
      { id: "labTrimestral", nombre: "Laboratorio renal trimestral", desc: "Recuerda a pacientes con ERC hacer su control cada 3 meses.", canal: "WhatsApp", motor: true },
    ],
  },
  {
    id: "recetas", letra: "D", titulo: "Recetas y laboratorio", icon: Pill, grad: "from-violet-500 to-indigo-700",
    items: [
      { id: "recetaLista", nombre: "Aviso de receta emitida", desc: "Envía al paciente la receta del día con su código.", canal: "WhatsApp", motor: true },
      { id: "labListo", nombre: "Resultados de laboratorio disponibles", desc: "Avisa que ya puede ver sus resultados en el portal.", canal: "WhatsApp", motor: true },
      { id: "labDemorado", nombre: "Pedidos sin resultado hace más de 7 días", desc: "Avisa al equipo para reclamar al laboratorio.", canal: "Panel", motor: true },
      { id: "renovacion", nombre: "Renovación de medicación crónica", desc: "Recuerda renovar la receta a los 25 días.", canal: "WhatsApp", motor: true },
    ],
  },
  {
    id: "pagos", letra: "E", titulo: "Pagos y facturación", icon: Wallet, grad: "from-emerald-400 to-teal-600",
    items: [
      { id: "saldo", nombre: "Aviso de saldo pendiente", desc: "Recordatorio amable a pacientes con saldo.", canal: "WhatsApp", motor: true },
      { id: "sinFacturar", nombre: "Cobros sin facturar", desc: "Avisa a administración qué cobros no tienen comprobante.", canal: "Panel", motor: true },
      { id: "liquidacion", nombre: "Liquidación de obras sociales", desc: "A fin de mes muestra lo pendiente por cobertura.", canal: "Panel", motor: true },
    ],
  },
  {
    id: "pacientes", letra: "F", titulo: "Pacientes y portal", icon: Users, grad: "from-fuchsia-500 to-pink-600",
    items: [
      { id: "cumple", nombre: "Saludo de cumpleaños", desc: "Mensaje de la clínica el día del cumpleaños.", canal: "WhatsApp", motor: true },
      { id: "invitarPortal", nombre: "Invitar al portal a pacientes con turno", desc: "Detecta pacientes con turnos que todavía no tienen portal.", canal: "Panel", motor: true },
      { id: "bienvenida", nombre: "Bienvenida al portal", desc: "Explica cómo usar el portal en el primer ingreso.", canal: "Email", motor: false },
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

  if (on("recordatorio24"))
    d.turnos.filter((t) => t.fecha === man && t.estado !== "Cancelado").forEach((t) => {
      const tl = tel(t.paciente, t.telefono);
      if (tl) out.push({ key: `rec24-${t.id}`, auto: "recordatorio24", titulo: `Recordatorio a ${t.paciente}`, detalle: `Mañana ${t.hora} · ${t.doctor}`, tipo: "wa", tel: tl, msg: `Hola ${nom(t.paciente)}, te recordamos tu turno de mañana a las ${t.hora} con ${t.doctor} en el Centro HEGO. Si no podés venir, avisanos por acá.` });
    });
  if (on("confirmar"))
    d.turnos.filter((t) => t.estado === "Pendiente" && t.fecha >= hoy).forEach((t) => {
      const tl = tel(t.paciente, t.telefono);
      if (tl) out.push({ key: `conf-${t.id}`, auto: "confirmar", titulo: `Confirmar turno de ${t.paciente}`, detalle: `${fechaCorta(t.fecha)} ${t.hora}`, tipo: "wa", tel: tl, msg: `Hola ${nom(t.paciente)}, ¿nos confirmás tu turno del ${fechaCorta(t.fecha)} a las ${t.hora} con ${t.doctor}? Respondé SÍ para confirmar o escribinos para cambiarlo.` });
    });
  if (on("ausentes"))
    d.turnos.filter((t) => t.estado === "Cancelado" && t.fecha >= isoDe(new Date(Date.now() - 14 * 86400000)) && t.fecha <= hoy).forEach((t) => {
      const tl = tel(t.paciente, t.telefono);
      if (tl) out.push({ key: `aus-${t.id}`, auto: "ausentes", titulo: `Ofrecer nuevo turno a ${t.paciente}`, detalle: `Canceló el ${fechaCorta(t.fecha)}`, tipo: "wa", tel: tl, msg: `Hola ${nom(t.paciente)}, vimos que no pudiste venir a tu turno. ¿Querés que te busquemos un nuevo horario con ${t.doctor}?` });
    });
  if (on("encuesta"))
    d.turnos.filter((t) => t.estado === "Atendido" && t.fecha === ayer).forEach((t) => {
      const tl = tel(t.paciente, t.telefono);
      if (tl) out.push({ key: `enc-${t.id}`, auto: "encuesta", titulo: `Encuesta a ${t.paciente}`, detalle: "Consulta de ayer", tipo: "wa", tel: tl, msg: `Hola ${nom(t.paciente)}, gracias por atenderte ayer en el Centro HEGO. Del 1 al 5, ¿cómo fue tu experiencia?` });
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
      out.push({ key: `ctrlta-${p.id}-${semana}`, auto: "controlTA", titulo: `Control de presión: ${p.nombre}`, detalle: "Recordatorio semanal", tipo: "wa", tel: p.telefono!, msg: `Hola ${nom(p.nombre)}, ¿te mediste la presión esta semana? Cargala en tu portal del Centro HEGO así tu médico la ve.` });
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
        out.push({ key: `labtri-${p.id}-${hoy.slice(0, 7)}`, auto: "labTrimestral", titulo: `Laboratorio renal: ${p.nombre}`, detalle: u ? `Último ${fechaDe(u.f)}` : "Sin laboratorio registrado", tipo: "wa", tel: p.telefono!, msg: `Hola ${nom(p.nombre)}, ya te toca el control de laboratorio renal. Escribinos y te pasamos la orden.` });
    });
  if (on("recetaLista"))
    d.recetas.filter((r) => !r.anulada && isoDe(new Date(r.fecha)) === hoy).forEach((r) => {
      const tl = tel(r.paciente);
      if (tl) out.push({ key: `rx-${r.id}`, auto: "recetaLista", titulo: `Enviar receta a ${r.paciente}`, detalle: `N° ${r.numero} · ${r.items.length} medicamentos`, tipo: "wa", tel: tl, msg: `Hola ${nom(r.paciente)}, tu receta N° ${r.numero} ya está lista:\n${r.items.map((i) => `• ${i.droga} ${i.presentacion} — ${i.posologia}`).join("\n")}\nCódigo: ${r.codigo}` });
    });
  if (on("renovacion"))
    d.recetas.filter((r) => !r.anulada && isoDe(new Date(r.fecha)) === isoDe(new Date(Date.now() - 25 * 86400000))).forEach((r) => {
      const tl = tel(r.paciente);
      if (tl) out.push({ key: `ren-${r.id}`, auto: "renovacion", titulo: `Renovar medicación de ${r.paciente}`, detalle: `Receta N° ${r.numero} de hace 25 días`, tipo: "wa", tel: tl, msg: `Hola ${nom(r.paciente)}, se está por terminar tu medicación (${r.items.map((i) => i.droga).join(", ")}). ¿Querés que te preparemos la nueva receta?` });
    });
  if (on("labListo"))
    d.labs.filter((l) => l.estado === "Resultado" && (l.fechaResultado ?? "").slice(0, 10) >= isoDe(new Date(Date.now() - 3 * 86400000))).forEach((l) => {
      const tl = tel(l.paciente);
      if (tl) out.push({ key: `labok-${l.id}`, auto: "labListo", titulo: `Resultados listos: ${l.paciente}`, detalle: "Avisar que están en el portal", tipo: "wa", tel: tl, msg: `Hola ${nom(l.paciente)}, ya están tus resultados de laboratorio. Podés verlos en tu portal del Centro HEGO.` });
    });
  if (on("labDemorado"))
    d.labs.filter((l) => l.estado !== "Resultado" && l.fecha.slice(0, 10) < isoDe(new Date(Date.now() - 7 * 86400000))).forEach((l) => out.push({ key: `labdem-${l.id}`, auto: "labDemorado", titulo: `Laboratorio demorado: ${l.paciente}`, detalle: `Pedido el ${fechaDe(l.fecha)}`, tipo: "alerta", ir: "laboratorio" }));
  if (on("saldo"))
    d.cobros.filter((c) => saldoDe(c) > 0).forEach((c) => {
      const tl = tel(c.paciente);
      if (tl) out.push({ key: `saldo-${c.id}-${hoy.slice(0, 7)}`, auto: "saldo", titulo: `Saldo de ${c.paciente}`, detalle: `${dinero(saldoDe(c))} · ${c.concepto}`, tipo: "wa", tel: tl, msg: `Hola ${nom(c.paciente)}, te recordamos que quedó un saldo de ${dinero(saldoDe(c))} por ${c.concepto}. Podés abonarlo en tu próxima visita o por transferencia. ¡Gracias!` });
    });
  if (on("sinFacturar")) {
    const n = d.cobros.filter((c) => !c.anulado && pagadoDe(c) > 0 && !d.facturas.some((f) => f.cobroId === c.id && f.estado !== "Anulada")).length;
    if (n > 0) out.push({ key: `sinfact-${hoy}`, auto: "sinFacturar", titulo: `${n} cobros sin facturar`, detalle: "Emití los comprobantes pendientes", tipo: "alerta", ir: "facturacion" });
  }
  if (on("liquidacion") && new Date().getDate() >= 25) {
    const pend = d.facturas.filter((f) => f.estado === "Emitida" && f.cobertura !== "Particular");
    if (pend.length) out.push({ key: `liq-${hoy.slice(0, 7)}`, auto: "liquidacion", titulo: "Liquidación de obras sociales", detalle: `${pend.length} comprobantes · ${dinero(pend.reduce((a, f) => a + f.total, 0))}`, tipo: "alerta", ir: "facturacion" });
  }
  if (on("cumple"))
    d.pacientes.filter((p) => p.ficha?.nacimiento && p.ficha.nacimiento.slice(5, 10) === hoy.slice(5, 10) && p.telefono).forEach((p) => out.push({ key: `cumple-${p.id}-${hoy}`, auto: "cumple", titulo: `Cumpleaños de ${p.nombre}`, detalle: "Hoy", tipo: "wa", tel: p.telefono!, msg: `¡Feliz cumpleaños, ${nom(p.nombre)}! Te saludamos con mucho cariño desdel Centro HEGO.` }));
  if (on("invitarPortal")) {
    const sin = d.pacientes.filter((p) => !p.portal && d.turnos.some((t) => norm(t.paciente) === norm(p.nombre) && t.fecha >= hoy));
    if (sin.length) out.push({ key: `inv-${hoy}`, auto: "invitarPortal", titulo: `${sin.length} pacientes con turno sin portal`, detalle: sin.slice(0, 3).map((p) => p.nombre).join(", "), tipo: "alerta", ir: "pacientes" });
  }
  return out;
}

type VistaAuto = "bandeja" | "catalogo" | "flujos";

function AutomatizacionesTab({ log, turnos, irA }: { log: LogFn; turnos: Turno[]; irA: (t: Tab) => void }) {
  const pacientes = usePacientesClinica(turnos);
  const [activas, setActivas] = useDato<Record<string, boolean>>(KEY_AUTOS, {});
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
  const nActivas = AUTOS_TODAS.filter((a) => activas[a.id]).length;
  const nHechas = Object.keys(hechas).length;
  const marcar = (a: AccionAuto) => {
    setHechas((p) => ({ ...p, [a.key]: new Date().toISOString() }));
    log("Automatización ejecutada", `${AUTOS_TODAS.find((x) => x.id === a.auto)?.nombre} · ${a.titulo}`);
  };
  const alternar = (id: string, v: boolean) => {
    setActivas((p) => ({ ...p, [id]: v }));
    log(v ? "Automatización activada" : "Automatización pausada", AUTOS_TODAS.find((x) => x.id === id)?.nombre ?? id);
  };

  const FLUJOS: { t: string; pasos: { icon: LucideIcon; l: string; auto?: string }[] }[] = [
    { t: "Ciclo del turno", pasos: [{ icon: CalendarCheck, l: "Turno reservado" }, { icon: Send, l: "Pide confirmación", auto: "confirmar" }, { icon: Bell, l: "Recordatorio 24 h", auto: "recordatorio24" }, { icon: Stethoscope, l: "Consulta" }, { icon: Send, l: "Encuesta", auto: "encuesta" }] },
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
            <h2 className="mt-3 text-3xl font-semibold">La clínica trabaja sola</h2>
            <p className="mt-2 text-sm text-white/70">
              Cuando pasa algo —un turno, un resultado, una receta— la automatización prepara el aviso o la alerta. Los mensajes quedan listos para enviar por WhatsApp con un toque; el envío 100% automático se activa al conectar la API de WhatsApp en el backend.
            </p>
          </div>
        </div>
        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { l: "Activas", v: `${nActivas}/${AUTOS_TODAS.length}`, i: Zap },
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
        {([["bandeja", `Para hacer (${pendientes.length})`, Bell], ["catalogo", "Catálogo", ClipboardList], ["flujos", "Flujos", Workflow]] as [VistaAuto, string, LucideIcon][]).map(([id, l, Ic]) => (
          <button key={id} onClick={() => setVista(id)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${vista === id ? "pn-acc-tile text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
            <Ic className="size-4" /> {l}
          </button>
        ))}
      </div>

      {vista === "bandeja" && (
        <Seccion icon={Bell} titulo="Acciones preparadas" sub="Generadas por las automatizaciones activas">
          {nActivas === 0 ? (
            <Vacio icon={Zap} titulo="No hay automatizaciones activas" texto="Activalas en el Catálogo y acá aparecen los avisos y alertas listos." accion={<Button className="rounded-xl" onClick={() => setVista("catalogo")}>Ir al catálogo</Button>} />
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
        <div className="space-y-3">
          {GRUPOS_AUTO.map((g) => {
            const abierto = grupoAbierto === g.id;
            const act = g.items.filter((i) => activas[i.id]).length;
            return (
              <section key={g.id} className="pn-card pn-up overflow-hidden">
                <button onClick={() => setGrupoAbierto(abierto ? "" : g.id)} className="flex w-full items-center gap-4 p-5 text-left">
                  <span className={`flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br ${g.grad} text-white shadow-md`}><g.icon className="size-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Grupo {g.letra}</p>
                    <p className="font-semibold">{g.titulo}</p>
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">{act}/{g.items.length} activas</span>
                  <ChevronDown className={`size-4 text-muted-foreground transition-transform ${abierto ? "rotate-180" : ""}`} />
                </button>
                {abierto && (
                  <div className="border-t border-border/60 px-5 pb-5 pt-3 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="mb-2 flex justify-end">
                      <button onClick={() => g.items.forEach((i) => alternar(i.id, act < g.items.length))} className="text-xs font-semibold text-primary">{act < g.items.length ? "Activar todas" : "Pausar todas"}</button>
                    </div>
                    <ul className="divide-y divide-border/60">
                      {g.items.map((i) => (
                        <li key={i.id} className="flex items-center gap-4 py-3">
                          <div className="min-w-0 flex-1">
                            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                              {i.nombre}
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${i.canal === "WhatsApp" ? "bg-emerald-100 text-emerald-800 ring-emerald-200" : i.canal === "Email" ? "bg-sky-100 text-sky-800 ring-sky-200" : "bg-violet-100 text-violet-700 ring-violet-200"}`}>{i.canal}</span>
                              {!i.motor && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">Con el backend</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">{i.desc}</p>
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
              <p className="mt-4 text-xs text-muted-foreground">Los pasos tachados están pausados: activalos en el Catálogo.</p>
            </Seccion>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════ CARPETA DEL PACIENTE (estilo Cloud Esther: paciente + historial) ═══════════ */
type SecCarpeta = "resumen" | "historia" | "estudios" | "laboratorio" | "recetas" | "medicacion" | "turnos" | "cuenta";
const GRUPOS_CARPETA: { titulo: string; items: { id: SecCarpeta; label: string; icon: LucideIcon }[] }[] = [
  { titulo: "General", items: [{ id: "resumen", label: "Resumen", icon: LayoutDashboard }] },
  {
    titulo: "Clínico",
    items: [
      { id: "historia", label: "Historia clínica", icon: FileText },
      { id: "estudios", label: "Estudios", icon: ScanLine },
      { id: "laboratorio", label: "Laboratorio", icon: FlaskConical },
      { id: "recetas", label: "Receta digital", icon: PenLine },
      { id: "medicacion", label: "Medicación", icon: Pill },
    ],
  },
  {
    titulo: "Gestión",
    items: [
      { id: "turnos", label: "Turnos", icon: CalendarDays },
      { id: "cuenta", label: "Cuenta corriente", icon: Wallet },
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

  const contador: Partial<Record<SecCarpeta, number>> = {
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

  const Indicador = ({ icon: Ic, l, v, d, ir, tono }: { icon: LucideIcon; l: string; v: string; d: string; ir: SecCarpeta; tono: string }) => (
    <button onClick={() => setSec(ir)} className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <span className={`pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br ${tono} opacity-15 blur-xl transition-transform group-hover:scale-125`} />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{l}</p>
          <p className="mt-1.5 truncate font-display text-xl font-semibold">{v}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{d}</p>
        </div>
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tono} text-white shadow-md`}><Ic className="size-4" /></span>
      </div>
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
              <section className="relative overflow-hidden rounded-[22px] border border-[rgba(var(--acc),.2)] bg-gradient-to-br from-[rgba(var(--acc),.1)] via-card to-rose-500/[0.06] p-5">
                <span className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-[rgba(var(--acc),.1)] blur-2xl" />
                <div className="relative flex flex-wrap items-center gap-4">
                  <span className="grid size-16 shrink-0 place-items-center rounded-[20px] pn-acc-tile text-xl font-bold text-white ring-4 ring-card">{iniciales(p.nombre)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate text-[22px] font-semibold tracking-tight">{p.nombre}</h4>
                      {p.portal && <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-200">Portal activo</span>}
                      {p.ficha?.alergias && <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-700 ring-1 ring-red-200"><AlertTriangle className="size-3" /> Alergia: {p.ficha.alergias}</span>}
                    </div>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      {[p.dni ? `C.C. ${p.dni}` : null, edad !== null ? `${edad} años` : null, p.ficha?.obraSocial || "Particular", p.ficha?.afiliado ? `Afiliado ${p.ficha.afiliado}` : null].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.telefono && (
                      <a href={waDe(p.telefono, `Hola ${p.nombre.split(" ")[0]}, te escribimos del Centro HEGO.`)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600"><Send className="size-3.5" /> WhatsApp</a>
                    )}
                    <Button size="sm" variant="outline" className="rounded-xl" onClick={onEditar}><Pencil className="size-3.5" /> Editar paciente</Button>
                  </div>
                </div>
                {(p.ficha?.antecedentes ?? []).length > 0 && (
                  <div className="relative mt-4 flex flex-wrap gap-1.5">
                    {(p.ficha?.antecedentes ?? []).map((a) => (
                      <span key={a} className={`rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${esCardio([a]) ? "bg-rose-50 text-rose-700 ring-rose-200" : esNefro([a]) ? "bg-sky-50 text-sky-800 ring-sky-200" : "bg-secondary text-foreground/80 ring-border"}`}>{a}</span>
                    ))}
                  </div>
                )}
              </section>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                <Indicador icon={CalendarDays} l="Próximo turno" v={proximo ? `${fechaCorta(proximo.fecha).slice(0, 5)} · ${proximo.hora}` : "Sin turno"} d={proximo ? `${nombreCorto(proximo.doctor)} · ${proximo.motivo}` : "Agendá el próximo control"} ir="turnos" tono="from-sky-500 to-blue-700" />
                <Indicador icon={Activity} l="Presión arterial" v={ta ? `${ta.s}/${ta.d}` : "—"} d={ta ? clasificarPresion(ta.s, ta.d).nivel : "Sin registros"} ir="historia" tono="from-rose-500 to-red-600" />
                <Indicador icon={Scale} l="Índice de masa corporal" v={imcP ? `${imcP.valor} kg/m²` : "—"} d={imcP ? imcP.texto : "Sin peso y talla"} ir="historia" tono="from-cyan-400 to-sky-600" />
                <Indicador icon={Wallet} l="Cuenta corriente" v={saldo > 0 ? dinero(saldo) : "Al día"} d={saldo > 0 ? "Saldo pendiente" : `${cobros.length} cobros registrados`} ir="cuenta" tono={saldo > 0 ? "from-amber-400 to-orange-600" : "from-emerald-400 to-teal-600"} />
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-border/70 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold">Últimas consultas</p>
                    <button onClick={() => setSec("historia")} className="text-xs font-semibold text-[rgb(var(--acc))]">Ver historia</button>
                  </div>
                  {evols.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">Sin evoluciones cargadas.</p>
                  ) : (
                    <ul className="space-y-2">
                      {evols.slice(0, 3).map((e) => {
                        const dx0 = dxDe(e)[0];
                        return (
                          <li key={e.id} className="flex items-center gap-3 rounded-xl bg-secondary/40 px-3 py-2.5">
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
                <div className="rounded-2xl border border-border/70 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold">Medicación activa</p>
                    <button onClick={() => abrir("recetas", p.id)} className="text-xs font-semibold text-[rgb(var(--acc))]">Nueva receta</button>
                  </div>
                  {meds.filter((m) => m.activo).length === 0 && recetas.filter((r) => !r.anulada).length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">Sin medicación registrada.</p>
                  ) : (
                    <ul className="space-y-2">
                      {meds.filter((m) => m.activo).map((m) => (
                        <li key={m.id} className="rounded-xl bg-secondary/40 px-3 py-2 text-sm"><span className="font-medium">{m.nombre}</span> <span className="text-muted-foreground">{m.dosis} · {m.horarios.join(" · ")}</span></li>
                      ))}
                      {recetas.filter((r) => !r.anulada).slice(0, 3).flatMap((r) => r.items.map((i, k) => (
                        <li key={`${r.id}-${k}`} className="rounded-xl bg-secondary/40 px-3 py-2 text-sm"><span className="font-medium">{i.droga} {i.presentacion}</span> <span className="text-muted-foreground">{i.posologia} · Receta {fechaDe(r.fecha)}</span></li>
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
              <Cab t="Turnos" s={`${misTurnos.length} turnos en total`} />
              {misTurnos.length === 0 ? <Vacio icon={CalendarDays} texto="Este paciente todavía no tiene turnos." /> : (
                <ul className="space-y-2">
                  {misTurnos.map((t) => (
                    <Fila key={t.id}>
                      <span className={`flex size-9 shrink-0 flex-col items-center justify-center rounded-lg text-white ${t.fecha >= hoy ? "bg-gradient-to-br from-sky-500 to-blue-700" : "bg-slate-400"}`}>
                        <span className="text-[11px] font-bold leading-none">{t.fecha.slice(8, 10)}</span>
                        <span className="text-[8px] uppercase leading-none">{new Date(`${t.fecha}T12:00`).toLocaleDateString("es-AR", { month: "short" })}</span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{t.hora} · {t.motivo || "Consulta"}</p>
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
              <Cab t="Cuenta corriente" s="Cobros, pagos, saldo y comprobantes" accion={<Button size="sm" variant="outline" className="rounded-xl" onClick={() => abrir("facturacion", p.id)}><Receipt className="size-3.5" /> Facturación</Button>} />
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
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-bold">{f.tipo === "Recibo" ? "R" : f.tipo.slice(-1)}</span>
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
  { id: "V", nombre: "Triage V", desc: "Problema crónico o consulta programada", espera: "Consulta programada", clase: "bg-sky-500 text-white ring-sky-600", punto: "bg-sky-500" },
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
function VentanaSignos({ user, log, turnos, soloLectura, onCerrar }: { user: SessionUser; log: LogFn; turnos: Turno[]; soloLectura: boolean; onCerrar: () => void }) {
  const pacientes = usePacientesClinica(turnos);
  const [triages, setTriages] = useDato<Triage[]>(KEY_TRIAGE, []);
  const [pacId, setPacId] = useState("");
  const esMedicoV = user.rol === "medico";
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

  const guardar = (e: FormEvent) => {
    e.preventDefault();
    if (esMedicoV) { toast.error("Los signos vitales los registra enfermería"); return; }
    if (soloLectura) { toast.error("Tu permiso en Enfermería – Triage es solo de lectura"); return; }
    if (!pac) { toast.error("Seleccioná un paciente"); return; }
    const signos = { sistolica: num(f.s), diastolica: num(f.d), pulso: num(f.fc), fr: num(f.fr), temp: num(f.temp), peso: num(f.peso), talla: num(f.talla), imc: imc?.valor };
    if (Object.values(signos).every((v) => v === undefined)) { toast.error("Registrá al menos un signo vital"); return; }
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
              <h2 className="text-lg font-semibold">Toma de signos vitales</h2>
              <p className="text-xs text-white/70">{user.nombre} · {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}</p>
            </div>
          </div>
          <button onClick={onCerrar} aria-label="Cerrar" className="relative flex size-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 transition hover:bg-white/20"><X className="size-5" /></button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[320px_minmax(0,1fr)] lg:overflow-hidden">
          {/* Pacientes de hoy */}
          <aside className="flex min-h-0 flex-col border-b border-border/60 bg-secondary/30 p-4 lg:border-b-0 lg:border-r">
            <p className="px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Turnos de hoy · {turnosHoy.length}</p>
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
                      className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all ${on ? "bg-card shadow-sm ring-1 ring-[rgba(var(--acc),.4)]" : "hover:bg-card"}`}
                    >
                      <span className="w-11 shrink-0 text-center font-display text-sm font-semibold tabular-nums">{t.hora}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{t.paciente}</span>
                        <span className="block truncate text-[11px] text-muted-foreground">{nombreCorto(t.doctor)} · {t.motivo || "Consulta"}</span>
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
              {turnosHoy.length === 0 && <li className="px-2 py-6 text-center text-sm text-muted-foreground">No hay turnos para hoy.</li>}
            </ul>
            <div className="mt-3 border-t border-border/60 pt-3">
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Otro paciente</p>
              <SelectorPaciente pacientes={pacientes} valor={pacId} onChange={elegir} />
            </div>
          </aside>

          {/* Formulario */}
          <form onSubmit={guardar} className="flex min-h-0 flex-col lg:overflow-y-auto">
            {!pac ? (
              <div className="flex flex-1 items-center justify-center p-8">
                <Vacio icon={Users} titulo="Elegí un paciente" texto="Seleccioná un turno de hoy o buscá otro paciente para registrar sus signos vitales." />
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
                    <Lock className="size-4 shrink-0" /> Solo el personal de enfermería puede cargar signos vitales. Como médico los ves en la Historia Clínica al iniciar la evolución.
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
                    <p className="text-sm font-semibold">{imc ? imc.texto : "Ingresá talla y peso"}</p>
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
      <div className="max-w-md">
        <Kpi
          icon={CalendarDays}
          label="Turnos de hoy"
          value={String(turnosHoy.length)}
          hint={turnosHoy.length ? `${sinSignos} sin signos vitales · tocá para registrar` : "Tocá para registrar signos vitales"}
          tono="verde"
          onClick={() => setVentana(true)}
          accion="Tomar signos vitales"
        />
      </div>

      {ventana && <VentanaSignos user={user} log={log} turnos={turnos} soloLectura={soloLectura} onCerrar={() => setVentana(false)} />}

      <Seccion icon={ClipboardList} titulo="Signos vitales registrados hoy" sub={`${deHoy.length} ${deHoy.length === 1 ? "registro" : "registros"} · quedan en la Historia Clínica de cada paciente`}>
        {deHoy.length === 0 ? (
          <Vacio icon={Activity} texto="Todavía no se registraron signos vitales hoy. Tocá «Turnos de hoy» para empezar." />
        ) : (
          <ul className="space-y-3">
            {deHoy.map((t) => (
              <li key={t.id} className="rounded-2xl border border-border/70 bg-card p-4">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <Avatar nombre={t.paciente} size="size-10" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{t.paciente}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(t.fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })} hs · {t.enfermera}</p>
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
  const origen = typeof window === "undefined" ? "" : window.location.origin;
  const visibles = (areaFija ? lista.filter((x) => areaDe(x) === areaFija) : lista).slice().sort((a, b) => areaDe(a).localeCompare(areaDe(b)) || a.nombre.localeCompare(b.nombre));

  const mensaje = (p: Personal) =>
    `Hola ${p.nombre.replace(/^(Enf\.|Lic\.|Sr\.|Sra\.)\s*/i, "").split(" ")[0]}, te damos acceso al panel del Centro HEGO como ${areaDe(p)}.\n\nEntrá a este link y creá tu contraseña:\n${linkInvitacion(p, origen)}`;
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
    toast.success("Listo. Enviale el link para que cree su contraseña.");
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
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre y apellido" className={inp} />
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
        <Vacio icon={UserCog} texto="Todavía no hay personal con acceso. Dale acceso arriba y enviale el link de invitación." />
      ) : (
        <ul className="divide-y divide-border/60">
          {visibles.map((n) => {
            const conClave = tieneClave(n.id);
            const estado = !n.activo ? "Bloqueado" : conClave ? "Activo" : "Invitación pendiente";
            return (
              <li key={n.id} className="flex flex-wrap items-center gap-3 py-3">
                <Avatar nombre={n.nombre} size="size-9" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{n.nombre} {!areaFija && <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{areaDe(n)}</span>}</p>
                  <p className="text-xs text-muted-foreground">{n.documento ? `C.C. ${n.documento} · ` : ""}Alta {fechaHora(n.creado)} por {nombreCorto(n.creadoPor)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${estado === "Activo" ? "bg-emerald-100 text-emerald-800 ring-emerald-200" : estado === "Bloqueado" ? "bg-red-100 text-red-700 ring-red-200" : "bg-amber-100 text-amber-800 ring-amber-200"}`}>{estado}</span>
                {n.activo && !conClave && n.invitacion && (
                  <>
                    <button onClick={() => void copiar(n)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Copiar link</button>
                    <a href={`https://wa.me/?text=${encodeURIComponent(mensaje(n))}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"><Send className="size-3.5" /> Enviar por WhatsApp</a>
                  </>
                )}
                {n.activo && (conClave || !n.invitacion) && (
                  <button onClick={() => { nuevaInvitacion(n); refrescar((x) => x + 1); }} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">{conClave ? "Reiniciar contraseña" : "Generar link"}</button>
                )}
                <button onClick={() => { setLista((p) => p.map((x) => (x.id === n.id ? { ...x, activo: !x.activo } : x))); log(n.activo ? "Acceso bloqueado" : "Acceso habilitado", `${n.nombre} · ${areaDe(n)}`); }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[rgb(var(--acc))] hover:bg-[rgba(var(--acc),.08)]">
                  {n.activo ? "Bloquear" : "Habilitar"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-4 text-[11px] text-muted-foreground">{areaFija ? `Los módulos que ve se configuran en Permisos y accesos → ${areaFija}.` : "Los módulos que ve cada persona se configuran abajo, en los permisos de su departamento."}</p>
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
      acciones={<input type="date" value={dia} onChange={(e) => setDia(e.target.value)} className={inp + " h-10 w-44"} />}
    >
      {lista.length === 0 ? (
        <Vacio icon={CalendarDays} texto="No hay turnos para este día." />
      ) : (
        <ul className="divide-y divide-border/60">
          {lista.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="w-14 font-display text-lg font-semibold tabular-nums">{t.hora}</span>
              <Avatar nombre={t.paciente} size="size-9" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{t.paciente}</p>
                <p className="text-xs text-muted-foreground">{t.motivo || "Consulta"} · {nombreCorto(t.doctor)}</p>
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
    for (const x of d.semana) if (x.abierto && x.desde >= x.hasta) { toast.error(`Revisá el horario del ${NOMBRES_DIA[x.dia]}`); return; }
    try {
      setGuardado(() => d);
      log("Sitio web actualizado", "Contacto, horarios y música");
      toast.success("Cambios publicados en la web.");
    } catch {
      toast.error("No hay espacio suficiente en este navegador. Usá un enlace en lugar de subir el audio.");
    }
  };

  const subirAudio = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("audio/")) { toast.error("Elegí un archivo de audio (mp3, ogg, wav)."); return; }
    const enServidor = modoServidor();
    const max = enServidor ? 15 : MAX_AUDIO_MB;
    if (f.size > max * 1024 * 1024) { toast.error(`El archivo supera ${max} MB. Usá un enlace o un archivo más liviano.`); return; }
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
    if (!nueva.nombre.trim()) { toast.error("Poné un nombre para el tema"); return; }
    if (!nueva.url) { toast.error("Subí un archivo o pegá un enlace de audio"); return; }
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

  return (
    <div className="space-y-6">
      {/* Barra de guardado */}
      <div className={`pn-card pn-up sticky top-3 z-20 flex flex-wrap items-center justify-between gap-3 p-4 ${cambios ? "ring-2 ring-[rgba(var(--acc),.35)]" : ""}`}>
        <p className="flex items-center gap-2 text-sm">
          <Globe className="size-4 text-[rgb(var(--acc))]" />
          {cambios ? <span className="font-semibold">Tenés cambios sin publicar</span> : <span className="text-muted-foreground">Todo lo que guardes acá se ve en la web pública.</span>}
        </p>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${modoServidor() ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-800 ring-amber-200"}`}>
          <span className={`size-1.5 rounded-full ${modoServidor() ? "bg-emerald-500" : "bg-amber-500"}`} />
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

      <Seccion icon={Music2} titulo="Música de espera" sub="El reproductor del pie de la web. Subí tus temas o usá las pistas de ejemplo.">
        <div className="flex flex-wrap gap-x-8 gap-y-3 rounded-2xl bg-secondary/40 p-4">
          <Interruptor on={d.musicaActiva} onChange={(v) => set({ musicaActiva: v })} label="Mostrar el reproductor en la web" />
          <Interruptor on={d.musicaEjemplo} onChange={(v) => set({ musicaEjemplo: v })} label="Incluir las 4 pistas de ejemplo" />
          <span className="ml-auto self-center text-xs text-muted-foreground">{d.musicaActiva ? `${total} ${total === 1 ? "tema" : "temas"} en la web` : "Reproductor oculto"}</span>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tus temas</p>
            {d.pistas.length === 0 ? (
              <Vacio icon={Music2} titulo="Todavía no subiste música" texto="Agregá tu primer tema con el formulario. Mientras tanto se usan las pistas de ejemplo." />
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
              <p className="text-[11px] leading-relaxed text-muted-foreground">{modoServidor() ? "La música se sube al servidor y la escuchan todos los visitantes." : "Por ahora la música se guarda en este navegador. Cuando conectemos el servidor, se sube una sola vez y la escuchan todos los visitantes."} Usá solo música con permiso de uso.</p>
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
  { id: "turnos", nombre: "Turnos y recepción", desc: "Agenda, pacientes que llegan, cambios de horario", icon: CalendarDays, color: "#8b5cf6" },
  { id: "enfermeria", nombre: "Enfermería", desc: "Triage, insumos y novedades de guardia", icon: Syringe, color: "#10b981" },
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
  const borrar = (m: Mensaje) => {
    if (!window.confirm("¿Borrar este mensaje?")) return;
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
      <aside className={`${verCanales ? "flex" : "hidden"} flex-col border-r border-border/60 bg-secondary/30 lg:flex`}>
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
          {directos.length === 0 && <p className="px-2 text-xs text-muted-foreground">Cuando haya personal con acceso, vas a poder escribirles en privado.</p>}
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
        <p className="border-t border-border/60 p-3 text-[11px] leading-relaxed text-muted-foreground">Para información del equipo. No compartas acá datos clínicos de pacientes: eso va en su historia clínica.</p>
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
              <p className={`mt-4 font-semibold ${fondo.oscuro ? "text-white" : ""}`}>{dm ? `Escribile a ${dm.nombre}` : `Todavía no hay mensajes en ${c.nombre}`}</p>
              <p className={`mt-1 text-sm ${fondo.oscuro ? "text-white/60" : "text-muted-foreground"}`}>{dm ? "Solo ustedes dos ven esta conversación." : puedeEscribir ? "Escribí el primero." : "Acá vas a ver los avisos de los médicos y Dirección."}</p>
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
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize shadow-sm ${fondo.oscuro ? "bg-white/10 text-white/80" : "bg-card/90 text-muted-foreground ring-1 ring-border"}`}>{diaTxt(m.fecha)}</span>
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
