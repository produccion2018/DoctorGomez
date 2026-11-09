import { useEffect, useMemo, useRef, useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from "react";
import { createPortal } from "react-dom";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  X,
  Menu,
  ArrowDownLeft,
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
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-provider";
import {
  ADMINS,
  auditar,
  cambiarClave,
  cerrarSesion,
  leerAuditoria,
  sesionActual,
  useDato,
  leerDato,
  agendaDe,
  horariosDelDia,
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
  estadioRenal,
  KEY_MEDICACION,
  KEY_EVOLUCIONES,
  ESPECIALIDADES_HC,
  type EspecialidadHC,
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
} from "@/lib/auth-local";
import { DOCTORS, SERVICIOS } from "@/data/clinic";
import fotoAlberto from "@/assets/doctor-alberto.jpg";
import fotoAlonso from "@/assets/doctor-alonso.jpg";

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [
      { title: "Panel administrativo | Clínica Gómez Bolaño" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Panel,
});

/* ---------- Tipos y datos de ejemplo ---------- */
type Estado = "Pendiente" | "Confirmado" | "Atendido" | "Cancelado";
type Turno = { id: string; fecha: string; hora: string; paciente: string; doctor: string; motivo: string; estado: Estado; telefono?: string; email?: string; origen?: "web" | "panel" | "portal"; pacienteId?: string };
type Mov = { id: string; fecha: string; concepto: string; tipo: "Ingreso" | "Egreso"; monto: number };
type Nivel = "ninguno" | "ver" | "editar";
type Permisos = Record<string, Record<string, Nivel>>;
type Tab = "resumen" | "turnos" | "historia" | "horarios" | "pacientes" | "finanzas" | "permisos" | "asistente" | "auditoria";
type LogFn = (accion: string, detalle?: string) => void;
type Tono = "azul" | "ambar" | "verde" | "violeta" | "rojo";

const ESTADOS: Estado[] = ["Pendiente", "Confirmado", "Atendido", "Cancelado"];

const MODULOS = [
  "Turnos",
  "Pacientes",
  "Historias clínicas",
  "Estudios",
  "Finanzas",
  "Facturación",
  "Reportes",
  "Asistente IA",
  "Horarios",
  "Portal del paciente",
  "Auditoría",
  "Permisos",
];

type Area = { nombre: string; desc: string; icon: LucideIcon };
const AREAS: Area[] = [
  { nombre: "Recepción", desc: "Atención al público, agenda y admisión de pacientes", icon: ConciergeBell },
  { nombre: "Secretaría médica", desc: "Agenda de los doctores, recetas y documentación", icon: NotebookPen },
  { nombre: "Atención al paciente", desc: "WhatsApp, llamadas y consultas de pacientes", icon: Headphones },
  { nombre: "Enfermería", desc: "Controles, preparación y seguimiento de pacientes", icon: Syringe },
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

const mk = (p: Partial<Record<string, Nivel>>): Record<string, Nivel> =>
  Object.fromEntries(MODULOS.map((m) => [m, p[m] ?? "ninguno"])) as Record<string, Nivel>;

const SEED_PERMISOS: Permisos = {
  "Recepción": mk({ Turnos: "editar", Pacientes: "ver", "Asistente IA": "ver", Horarios: "ver", "Portal del paciente": "editar" }),
  "Secretaría médica": mk({ Turnos: "editar", Pacientes: "editar", "Historias clínicas": "ver", Estudios: "ver", "Asistente IA": "ver", Horarios: "editar", "Portal del paciente": "editar" }),
  "Atención al paciente": mk({ Turnos: "editar", Pacientes: "ver", "Asistente IA": "ver", "Portal del paciente": "editar" }),
  "Enfermería": mk({ Turnos: "ver", Pacientes: "editar", "Historias clínicas": "ver", Estudios: "ver", "Asistente IA": "ver" }),
  "Cardiología": mk({ Turnos: "ver", Pacientes: "ver", "Historias clínicas": "ver", Estudios: "editar", "Asistente IA": "ver" }),
  "Nefrología": mk({ Turnos: "ver", Pacientes: "ver", "Historias clínicas": "ver", Estudios: "editar", "Asistente IA": "ver" }),
  "Estudios y laboratorio": mk({ Turnos: "ver", Pacientes: "ver", Estudios: "editar", "Asistente IA": "ver" }),
  "Diagnóstico por imágenes": mk({ Turnos: "ver", Pacientes: "ver", Estudios: "editar", "Asistente IA": "ver" }),
  "Farmacia e insumos": mk({ Finanzas: "ver", Reportes: "ver" }),
  "Administración": mk({ Turnos: "editar", Pacientes: "ver", Finanzas: "ver", Reportes: "ver", "Asistente IA": "ver" }),
  "Facturación": mk({ Turnos: "ver", Finanzas: "editar", Facturación: "editar", Reportes: "ver", "Asistente IA": "ver" }),
  "Recursos Humanos": mk({ Reportes: "ver" }),
  "Sistemas": mk({ Auditoría: "ver", Reportes: "ver" }),
};

const nivelDe = (p: Permisos, area: string, modulo: string): Nivel =>
  p[area]?.[modulo] ?? SEED_PERMISOS[area]?.[modulo] ?? "ninguno";

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
      {
        id: "historia",
        label: "Historia clínica",
        icon: FileText,
        tono: "text-rose-300",
        sub: [
          { id: "todas", label: "Todas las historias" },
          { id: "Cardiología", label: "Cardiología" },
          { id: "Nefrología", label: "Nefrología" },
          { id: "Medicina Interna", label: "Medicina Interna" },
        ],
      },
      { id: "pacientes", label: "Pacientes y portal", icon: Users, tono: "text-sky-300" },
    ],
  },
  { grupo: "Agenda médica", items: [{ id: "horarios", label: "Mis horarios", icon: Clock, tono: "text-teal-300" }] },
  {
    grupo: "Administración",
    items: [
      {
        id: "finanzas",
        label: "Finanzas",
        icon: Wallet,
        tono: "text-emerald-300",
        sub: [
          { id: "cobros", label: "Cobros a pacientes" },
          { id: "caja", label: "Control de caja" },
          { id: "resumen", label: "Resumen financiero" },
        ],
      },
      { id: "permisos", label: "Permisos y accesos", icon: KeyRound, tono: "text-violet-300" },
    ],
  },
  { grupo: "Inteligencia", items: [{ id: "asistente", label: "Asistente IA", icon: Bot, tono: "text-violet-300" }] },
  { grupo: "Sistema", items: [{ id: "auditoria", label: "Auditoría", icon: ClipboardList, tono: "text-slate-300" }] },
];

const TITULOS: Record<Tab, [string, string]> = {
  resumen: ["Resumen general", "Vista rápida de la actividad de la clínica."],
  turnos: ["Turnos", "La agenda de cada doctor: quién tomó cada horario y qué queda libre."],
  historia: ["Historia clínica", "Evoluciones, presión arterial, función renal y estudios de cada paciente."],
  horarios: ["Mis horarios", "Días, horarios y vacaciones de cada doctor: se publican en la web."],
  pacientes: ["Portal del paciente", "Accesos de pacientes y autorizaciones."],
  finanzas: ["Finanzas", "Cobros a pacientes, control de la caja e ingresos y egresos de la clínica."],
  permisos: ["Permisos", "Definí qué puede ver y hacer cada departamento."],
  asistente: ["Asistente IA", "Consultas rápidas sobre turnos, finanzas, permisos y actividad."],
  auditoria: ["Auditoría", "Registro de todas las acciones realizadas en el panel."],
};

/* ---------- Panel principal ---------- */
function Panel() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [tab, setTab] = useState<Tab>("resumen");
  const [menu, setMenu] = useState(false);
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({});
  const [finVista, setFinVista] = useState<VistaFin>("cobros");
  const [hcFiltro, setHcFiltro] = useState<FiltroHC>("todas");
  const [turnos, setTurnos] = usePersist<Turno[]>("gb_turnos", SEED_TURNOS);
  const [movs, setMovs] = usePersist<Mov[]>("gb_movs", SEED_MOVS);
  const [permisos, setPermisos] = usePersist<Permisos>("gb_permisos", SEED_PERMISOS);
  const [audit, setAudit] = useState<Evento[]>([]);
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    const s = sesionActual();
    if (!s) {
      navigate({ to: "/login" });
      return;
    }
    setUser(s);
    setAudit(leerAuditoria());
  }, [navigate]);

  // Quita los turnos de ejemplo que pudieran haber quedado guardados
  useEffect(() => {
    setTurnos((p) => (p.some((t) => IDS_EJEMPLO.includes(t.id)) ? p.filter((t) => !IDS_EJEMPLO.includes(t.id)) : p));
  }, [setTurnos]);

  // Si se reserva un turno desde la web (otra pestaña), se actualiza solo
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "gb_turnos" && e.newValue) {
        try {
          setTurnos(JSON.parse(e.newValue) as Turno[]);
        } catch {
          /* ignorar */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [setTurnos]);

  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  if (!user) return null;

  const log: LogFn = (accion, detalle = "") => setAudit(auditar(user.nombre, accion, detalle));
  const salir = () => {
    log("Cierre de sesión");
    cerrarSesion();
    navigate({ to: "/login" });
  };
  const [titulo, subtitulo] = TITULOS[tab];
  const foto = fotoDe(user.id);
  const corto = nombreCorto(user.nombre);
  const pendientes = turnos.filter((t) => t.estado === "Pendiente").length;
  const eventosHoy = audit.filter((e) => new Date(e.fecha).toDateString() === new Date().toDateString()).length;
  const pedidosPacientes = leerDato<Autorizacion[]>(KEY_AUT, []).filter((x) => x.estado === "Pendiente" && x.origen === "Paciente").length;
  const badges: Partial<Record<Tab, number>> = { turnos: pendientes, pacientes: pedidosPacientes, auditoria: eventosHoy };
  const fechaLarga = ahora.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  const hora = ahora.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  const irTab = (t: Tab) => {
    setTab(t);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const subActual = (id: Tab) => (id === "finanzas" ? finVista : id === "historia" ? hcFiltro : "");
  const irSub = (id: Tab, sub: string) => {
    if (id === "finanzas") setFinVista(sub as VistaFin);
    if (id === "historia") setHcFiltro(sub as FiltroHC);
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
              <span className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-blue-600 to-blue-800 ring-1 ring-white/25">
                <Activity className="size-[18px]" />
              </span>
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[15px] font-semibold tracking-tight">Gómez Bolaño</span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-white/50">Cardio · Nefro</span>
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
            <p className="truncate font-display text-sm font-bold">{corto}</p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-white/80">
              {user.id === "alonso" ? <HeartPulse className="size-3 shrink-0" /> : <Droplets className="size-3 shrink-0" />}
              {user.id === "alonso" ? "Cardiología" : user.id === "alberto" ? "Nefrología" : "Clínica"} · Administrador
            </p>
          </div>
        </div>

        {/* Navegación agrupada */}
        <nav className="pn-noscroll min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 pb-6 pt-1 [mask-image:linear-gradient(to_bottom,transparent,#000_10px,#000_calc(100%-28px),transparent)]">
          {GRUPOS_NAV.map((g) => (
            <div key={g.grupo}>
              <p className="flex items-center gap-2 px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                <span className="h-1 w-3 rounded-full bg-gradient-to-r from-sky-400 to-rose-400" />
                {g.grupo}
              </p>
              <ul className="space-y-0.5">
                {g.items.map((n) => {
                  const activo = tab === n.id;
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
          {([...NAV.filter((n) => ["resumen", "turnos", "historia", "pacientes"].includes(n.id))] as typeof NAV).map((n) => {
            const on = tab === n.id;
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
      <FondoModulo tab={tab} />
      <main className="relative min-w-0 p-4 pb-28 sm:p-8 sm:pb-28 lg:pb-8">
        <div className="pn-up pn-sheen relative mb-8 overflow-hidden rounded-3xl gradient-deep p-6 text-deep-foreground shadow-elevated sm:p-8">
          <div className="pn-cross pointer-events-none absolute inset-0" />
          <div className="pn-orb pointer-events-none absolute -right-10 -top-16 size-64 rounded-full bg-white/10 blur-3xl" />
          <svg viewBox="0 0 600 60" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 -bottom-1 h-9 w-full text-sky-300/35" aria-hidden="true">
            <polyline className="pn-ecg" points="0,30 120,30 140,30 155,12 170,48 185,30 300,30 315,30 330,4 345,56 360,30 470,30 485,18 500,42 515,30 600,30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {foto && <img src={foto} alt="" className="hidden size-16 rounded-2xl object-cover object-top ring-2 ring-white/30 sm:block" />}
              <div>
                <p className="text-sm capitalize text-deep-foreground/70">{fechaLarga}</p>
                <h1 className="text-2xl font-semibold sm:text-3xl">
                  {saludo(ahora)}, {corto}
                </h1>
                <p className="mt-1 text-sm text-deep-foreground/75">
                  {pendientes > 0
                    ? `Tenés ${pendientes} turno${pendientes === 1 ? "" : "s"} pendiente${pendientes === 1 ? "" : "s"} de confirmar.`
                    : "Todo al día: no hay turnos pendientes."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ThemeToggle className="size-10 rounded-xl bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20 hover:text-white" />
              <CampanaPanel turnos={turnos} user={user} irA={setTab} />
              <Button onClick={() => setTab("asistente")} variant="outline" className="rounded-xl !border-white/25 !bg-white/10 text-deep-foreground hover:!bg-white/20 hover:text-deep-foreground">
                <Bot className="size-4" /> Preguntar a la IA
              </Button>
              <Button onClick={() => setTab("turnos")} className="rounded-xl !bg-white text-[var(--deep)] hover:!bg-white/90">
                <Plus className="size-4" /> Nuevo turno
              </Button>
            </div>
          </div>
        </div>

        <div key={tab} className="pn-up mb-7 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="pn-acc-tile flex size-12 items-center justify-center rounded-2xl text-white">
              {(() => {
                const I = NAV.find((n) => n.id === tab)!.icon;
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

        {tab === "resumen" && <Resumen turnos={turnos} movs={movs} audit={audit} irA={setTab} />}
        {tab === "turnos" && <TurnosTab turnos={turnos} setTurnos={setTurnos} log={log} />}
        {tab === "historia" && <HistoriaTab user={user} log={log} turnos={turnos} filtro={hcFiltro} setFiltro={setHcFiltro} />}
        {tab === "horarios" && <HorariosTab user={user} log={log} />}
        {tab === "pacientes" && <PacientesTab user={user} log={log} turnos={turnos} />}
        {tab === "finanzas" && <FinanzasTab movs={movs} setMovs={setMovs} log={log} turnos={turnos} user={user} vista={finVista} setVista={setFinVista} />}
        {tab === "permisos" && <PermisosTab permisos={permisos} setPermisos={setPermisos} log={log} user={user} />}
        {tab === "asistente" && <AsistenteTab turnos={turnos} movs={movs} permisos={permisos} audit={audit} log={log} user={user} />}
        {tab === "auditoria" && <AuditoriaTab audit={audit} log={log} />}
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
  historia: { a: "225,29,72", b: "56,132,246", c: "14,165,233" },
  horarios: { a: "13,148,136", b: "14,165,233", c: "16,185,129" },
  pacientes: { a: "219,39,119", b: "139,92,246", c: "56,132,246" },
  finanzas: { a: "16,185,129", b: "14,165,233", c: "20,184,166" },
  permisos: { a: "139,92,246", b: "79,70,229", c: "56,132,246" },
  asistente: { a: "99,102,241", b: "168,85,247", c: "14,165,233" },
  auditoria: { a: "79,70,229", b: "56,132,246", c: "100,116,139" },
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
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-10 h-24 w-full text-[rgba(56,132,246,.10)]">
        <polyline className="pn-ecg" style={{ animationDuration: "7s" }} points="0,60 260,60 290,60 310,25 330,95 350,60 640,60 670,60 690,10 710,110 730,60 960,60 985,40 1005,80 1025,60 1200,60" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      </svg>
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
  return nombre.split(" ").slice(0, 2).join(" ");
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
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tono?: Tono;
  delay?: number;
}) {
  const t = TONOS[tono];
  return (
    <div className="pn-card pn-lift pn-up group overflow-hidden p-5" style={{ animationDelay: `${delay}s` }}>
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
function Resumen({ turnos, movs, audit, irA }: { turnos: Turno[]; movs: Mov[]; audit: Evento[]; irA: (t: Tab) => void }) {
  const h = hoy();
  const deHoy = turnos.filter((t) => t.fecha === h);
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={CalendarDays} label="Turnos de hoy" value={String(turnosHoy)} hint={`${deHoy.filter((t) => t.estado === "Atendido").length} atendidos`} tono="azul" delay={0.05} />
        <Kpi icon={Users} label="Pendientes" value={String(pendientes)} hint={pendientes ? "Requieren confirmación" : "Todo confirmado"} tono="ambar" delay={0.1} />
        <Kpi icon={Wallet} label="Balance" value={dinero(balance)} hint={`${dinero(ingresos)} ingresados`} tono="verde" delay={0.15} />
        <Kpi icon={ClipboardList} label="Eventos de hoy" value={String(eventosHoy)} hint="Registrados en auditoría" tono="violeta" delay={0.2} />
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

  const columnas = ADMINS.map((a) => {
    const ag = agendaDe(agendas, a.id);
    const atiende = atiendeEl(ag, dia);
    const bloqueo = ag.bloqueos.find((b) => dia >= b.desde && dia <= b.hasta);
    const slots = atiende ? horariosDelDia(ag) : [];
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
          <a href={waDe(t.telefono, `Hola ${t.paciente.split(" ")[0]}, te escribimos de la Clínica Gómez Bolaño por tu turno del ${fechaCorta(t.fecha)} a las ${t.hora}.`)} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="rounded-lg p-1.5 text-emerald-600 opacity-60 transition-opacity hover:bg-emerald-50 group-hover:opacity-100">
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
                  <p className="truncate text-xs text-muted-foreground">{atiende ? `${ag.desde} a ${ag.hasta} · ${ag.consultorio}` : "No atiende este día"}</p>
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

function TurnosTab({ turnos, setTurnos, log }: { turnos: Turno[]; setTurnos: Dispatch<SetStateAction<Turno[]>>; log: LogFn }) {
  const [f, setF] = useState({ fecha: hoy(), hora: "", paciente: "", telefono: "", doctor: ADMINS[0]!.nombre, motivo: "" });
  const [agendas] = useDato<Agendas>(KEY_AGENDA, {});
  const [otraHora, setOtraHora] = useState(false);
  const [manual, setManual] = useState(false);
  const adminSel = ADMINS.find((a) => a.nombre === f.doctor) ?? ADMINS[0]!;
  const agendaSel = agendaDe(agendas, adminSel.id);
  const diasRapidos = Array.from({ length: 10 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return isoDe(d);
  });
  const atiende = atiendeEl(agendaSel, f.fecha);
  const slots = horariosDelDia(agendaSel).map((h) => ({
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
        .filter((t) => norm(`${t.paciente} ${t.motivo} ${t.doctor}`).includes(norm(q)))
        .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora)),
    [turnos, filtro, q],
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
                {ADMINS.map((a) => {
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
            <svg viewBox="0 0 300 40" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-24 h-10 w-full text-sky-300/30" aria-hidden="true">
              <polyline className="pn-ecg" points="0,20 70,20 85,20 95,6 105,34 115,20 190,20 200,20 210,2 220,38 230,20 300,20" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            <div className="relative space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">Resumen del turno</p>
              <div className="flex items-center gap-3">
                {fotoDe(adminSel.id) && <img src={fotoDe(adminSel.id)!} alt="" className="size-12 rounded-xl object-cover object-top ring-2 ring-white/25" />}
                <div className="min-w-0">
                  <p className="truncate font-semibold">{nombreCorto(adminSel.nombre)}</p>
                  <p className="text-xs text-white/65">{agendaSel.consultorio}</p>
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

      <Seccion icon={ClipboardList} titulo="Todos los turnos" sub={`${lista.length} turno${lista.length === 1 ? "" : "s"} · lista completa con filtros`} delay={0.08}
        acciones={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Buscar paciente, motivo..." value={q} onChange={(e) => setQ(e.target.value)} className={inp + " h-10 pl-9 sm:w-64"} />
          </div>
        }>
        <div className="mb-4 flex flex-wrap gap-2">
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
  <h1>Clínica Gómez Bolaño</h1><p class="m">Recibo N° ${c.id.toUpperCase()} · ${fechaHora(c.fecha)}</p>
  <p><b>Paciente:</b> ${c.paciente}${c.dni ? ` · DNI ${c.dni}` : ""}<br><b>Concepto:</b> ${c.concepto}<br><b>Profesional:</b> ${c.profesional}${c.obraSocial ? `<br><b>Obra social:</b> ${c.obraSocial}` : ""}</p>
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
              <Campo label="DNI"><input inputMode="numeric" value={f.dni} onChange={(e) => setF({ ...f, dni: e.target.value })} className={inp} /></Campo>
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
        acciones={<div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input placeholder="Paciente, DNI, servicio..." value={q} onChange={(e) => setQ(e.target.value)} className={inp + " h-10 pl-9 sm:w-60"} /></div>}>
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
                    <p className="text-xs text-muted-foreground">{c.concepto} · {nombreCorto(c.profesional)} · {fechaHora(c.fecha)}{c.dni ? ` · DNI ${c.dni}` : ""}</p>
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

  const areas = AREAS.filter((a) => norm(`${a.nombre} ${a.desc}`).includes(norm(q)));

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
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi icon={Building2} label="Departamentos" value={String(AREAS.length)} hint="Con permisos configurables" tono="azul" delay={0.05} />
        <Kpi icon={ShieldCheck} label="Módulos" value={String(MODULOS.length)} hint="Incluye el Asistente IA" tono="violeta" delay={0.1} />
        <Kpi icon={Bot} label="Con acceso a IA" value={String(AREAS.filter((a) => nivelDe(permisos, a.nombre, "Asistente IA") !== "ninguno").length)} hint="Departamentos que pueden consultar" tono="verde" delay={0.15} />
      </div>

      <Seccion icon={KeyRound} titulo="Permisos por departamento" sub="Los administradores (Dr. Alberto y Dr. Alonso) tienen acceso total." delay={0.2}
        acciones={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Buscar departamento..." value={q} onChange={(e) => setQ(e.target.value)} className={inp + " h-10 pl-9 sm:w-60"} />
          </div>
        }>
        <div className="space-y-3">
          {areas.map((a) => {
            const abiertaEsta = abierta === a.nombre;
            const conAcceso = MODULOS.filter((m) => nivelDe(permisos, a.nombre, m) !== "ninguno").length;
            return (
              <div key={a.nombre} className={`overflow-hidden rounded-2xl border transition-all ${abiertaEsta ? "border-primary/30 shadow-card ring-4 ring-primary/5" : "border-border hover:border-primary/20"}`}>
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
            );
          })}
          {areas.length === 0 && <Vacio icon={Search} texto="No se encontró ese departamento." />}
        </div>
      </Seccion>

      <Seccion icon={Lock} titulo="Seguridad" sub={`Cambiá tu contraseña de administrador (${user.nombre}).`} delay={0.25}>
        <form onSubmit={guardarClave} className="grid gap-4 sm:grid-cols-3">
          <Campo label="Contraseña actual"><input type="password" required value={actual} onChange={(e) => setActual(e.target.value)} className={inp} /></Campo>
          <Campo label="Nueva contraseña"><input type="password" required placeholder="Mínimo 6 caracteres" value={nueva} onChange={(e) => setNueva(e.target.value)} className={inp} /></Campo>
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
  "Agenda del Dr. Alonso",
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

function HorariosTab({ user, log }: { user: SessionUser; log: LogFn }) {
  const [agendas, setAgendas] = useDato<Agendas>(KEY_AGENDA, {});
  const [sel, setSel] = useState<string>(ADMINS.some((a) => a.id === user.id) ? user.id : ADMINS[0]!.id);
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
  const admin = ADMINS.find((a) => a.id === sel)!;
  const doctor = DOCTORS.find((d) => d.id === ADMIN_A_DOCTOR[sel]);
  const slots = horariosDelDia(draft);
  const proximos = proximosDias(draft, 6);

  const guardar = () => {
    if (draft.dias.length === 0) {
      toast.error("Elegí al menos un día de atención.");
      return;
    }
    if (draft.desde >= draft.hasta) {
      toast.error("La hora de inicio tiene que ser anterior a la de fin.");
      return;
    }
    setAgendas((p) => ({ ...p, [sel]: draft }));
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
      <div className="grid gap-4 sm:grid-cols-2">
        {ADMINS.map((a) => {
          const ag = agendaDe(agendas, a.id);
          const on = sel === a.id;
          const f = fotoDe(a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setSel(a.id)}
              className={`pn-card pn-up flex items-center gap-4 p-4 text-left transition-all ${on ? "ring-4 ring-[rgba(var(--acc),.18)]" : "opacity-80 hover:opacity-100"}`}
            >
              {f && <img src={f} alt="" className="size-14 rounded-2xl object-cover object-top" />}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold">
                  {a.nombre} {a.id === user.id && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vos</span>}
                </p>
                <p className="truncate text-xs text-muted-foreground">{resumenAgenda(ag)}</p>
              </div>
              <span className={`size-2.5 shrink-0 rounded-full ${ag.activo ? "bg-emerald-500" : "bg-slate-400"}`} />
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-3">
          <Seccion icon={CalendarDays} titulo="Días y horario de atención" sub={admin.nombre}
            acciones={<Interruptor on={draft.activo} onChange={(v) => set({ activo: v })} label={draft.activo ? "Agenda abierta" : "Agenda pausada"} />}>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Días</p>
            <div className="flex flex-wrap gap-2">
              {ORDEN_DIAS.map((d) => {
                const on = draft.dias.includes(d);
                return (
                  <button key={d} type="button" onClick={() => set({ dias: on ? draft.dias.filter((x) => x !== d) : [...draft.dias, d] })}
                    className={`h-11 w-14 rounded-xl text-sm font-semibold transition-all ${on ? "pn-acc-tile text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                    {NOMBRES_DIA[d]!.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Campo label="Desde"><input type="time" value={draft.desde} onChange={(e) => set({ desde: e.target.value })} className={inp} /></Campo>
              <Campo label="Hasta"><input type="time" value={draft.hasta} onChange={(e) => set({ hasta: e.target.value })} className={inp} /></Campo>
              <Campo label="Duración de cada turno">
                <select value={draft.duracion} onChange={(e) => set({ duracion: Number(e.target.value) })} className={inp}>
                  {[15, 20, 30, 40, 45, 60].map((m) => <option key={m} value={m}>{m} minutos</option>)}
                </select>
              </Campo>
            </div>
            <div className="mt-5 rounded-2xl bg-secondary/50 p-4">
              <Interruptor on={draft.pausa} onChange={(v) => set({ pausa: v })} label="Pausa (almuerzo / cirugías)" />
              {draft.pausa && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Campo label="Pausa desde"><input type="time" value={draft.pausaDesde} onChange={(e) => set({ pausaDesde: e.target.value })} className={inp} /></Campo>
                  <Campo label="Pausa hasta"><input type="time" value={draft.pausaHasta} onChange={(e) => set({ pausaHasta: e.target.value })} className={inp} /></Campo>
                </div>
              )}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Campo label="Consultorio"><input value={draft.consultorio} onChange={(e) => set({ consultorio: e.target.value })} className={inp} /></Campo>
              <Campo label="Aviso para pacientes (se ve en la web)"><input value={draft.nota} placeholder="Ej: traer estudios previos" onChange={(e) => set({ nota: e.target.value })} className={inp} /></Campo>
            </div>
          </Seccion>

          <Seccion icon={Ban} titulo="Vacaciones, congresos y días sin atención" sub="Esos días no se pueden reservar turnos" delay={0.05}>
            <form onSubmit={agregarBloqueo} className="grid gap-3 sm:grid-cols-[1fr_1fr_1.4fr_auto]">
              <Campo label="Desde"><input type="date" required value={bloq.desde} onChange={(e) => setBloq({ ...bloq, desde: e.target.value })} className={inp} /></Campo>
              <Campo label="Hasta"><input type="date" required value={bloq.hasta} onChange={(e) => setBloq({ ...bloq, hasta: e.target.value })} className={inp} /></Campo>
              <Campo label="Motivo"><input placeholder="Ej: vacaciones" value={bloq.motivo} onChange={(e) => setBloq({ ...bloq, motivo: e.target.value })} className={inp} /></Campo>
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
                  <p className="text-xs text-white/75">{draft.consultorio}</p>
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
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{slots.length} turnos por día</p>
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
  return `Hola ${p.nombre.split(" ")[0]}, te escribimos de la Clínica Gómez Bolaño. Te habilitamos el Portal del paciente para que saques tus turnos y gestiones tus autorizaciones.\n\nIngresá en: ${url}\nDNI: ${p.dni}\nCódigo de acceso: ${p.codigo}`;
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
  return `mailto:${p.email}?subject=${encodeURIComponent("Tu acceso al Portal del paciente · Clínica Gómez Bolaño")}&body=${encodeURIComponent(mensajeInvitacion(p))}`;
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
    if (dni.length < 7) {
      toast.error("Ingresá un DNI válido.");
      return;
    }
    if (pacientes.some((p) => p.dni === dni)) {
      toast.error("Ya existe un paciente con ese DNI.");
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
    log("Acceso al portal enviado", `${nuevo.nombre} · DNI ${dni}`);
    setRecien(nuevo);
    setF({ nombre: "", dni: "", telefono: "", email: "" });
  };

  const cambiarPaciente = (id: string, patch: Partial<PacientePortal>, accion: string) => {
    const p = pacientes.find((x) => x.id === id);
    setPacientes((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    if (p) log(accion, `${p.nombre} · DNI ${p.dni}`);
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
            <p className="mt-1 text-lg font-semibold">1. Creás el acceso · 2. Le enviás la invitación por WhatsApp o email · 3. El paciente entra con su DNI y el código y saca sus turnos.</p>
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
                <Campo label="DNI"><input required inputMode="numeric" value={f.dni} onChange={(e) => setF({ ...f, dni: e.target.value })} className={inp} /></Campo>
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
                      <p className="text-xs text-muted-foreground">DNI {p.dni} · {p.telefono}{n ? ` · ${n} turno${n === 1 ? "" : "s"}` : ""}{p.ultimoIngreso ? ` · último ingreso ${fechaHora(p.ultimoIngreso)}` : ""}</p>
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
                {pacientes.filter((p) => p.estado !== "Revocado").map((p) => <option key={p.id} value={p.id}>{p.nombre} · DNI {p.dni}</option>)}
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

/* ═══════════════════════ HISTORIA CLÍNICA ═══════════════════════ */
type FiltroHC = "todas" | EspecialidadHC;
type PacienteHC = { id: string; nombre: string; dni?: string; ficha?: PacientePortal["ficha"]; portal: boolean };

const TONO_HC: Record<string, string> = {
  verde: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  ambar: "bg-amber-100 text-amber-800 ring-amber-200",
  naranja: "bg-orange-100 text-orange-800 ring-orange-200",
  rojo: "bg-red-100 text-red-700 ring-red-200",
  critico: "bg-red-600 text-white ring-red-700",
};
const ESP_HC: Record<EspecialidadHC, { icon: LucideIcon; grad: string; chip: string }> = {
  Cardiología: { icon: HeartPulse, grad: "from-rose-500 to-red-600", chip: "bg-rose-100 text-rose-700 ring-rose-200" },
  Nefrología: { icon: Droplets, grad: "from-sky-500 to-blue-700", chip: "bg-sky-100 text-sky-800 ring-sky-200" },
  "Medicina Interna": { icon: Stethoscope, grad: "from-violet-500 to-indigo-600", chip: "bg-violet-100 text-violet-700 ring-violet-200" },
};
const DX_SUGERIDOS: Record<EspecialidadHC, string[]> = {
  Cardiología: ["Hipertensión arterial", "Cardiopatía isquémica", "Insuficiencia cardíaca", "Fibrilación auricular", "Dislipemia", "Valvulopatía"],
  Nefrología: ["Enfermedad renal crónica", "Nefropatía diabética", "Nefropatía hipertensiva", "Proteinuria", "Litiasis renal", "Trasplante renal"],
  "Medicina Interna": ["Diabetes tipo 2", "Hipertensión arterial", "Obesidad", "Anemia", "Hipotiroidismo", "Control de salud"],
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
const num = (v: string) => (v.trim() === "" ? undefined : Number(v.replace(",", ".")));

function HistoriaTab({ user, log, turnos, filtro, setFiltro }: { user: SessionUser; log: LogFn; turnos: Turno[]; filtro: FiltroHC; setFiltro: (f: FiltroHC) => void }) {
  const [portal] = useDato<PacientePortal[]>(KEY_PACIENTES, []);
  const [evols, setEvols] = useDato<Evolucion[]>(KEY_EVOLUCIONES, []);
  const [estudios] = useDato<Estudio[]>(KEY_ESTUDIOS, []);
  const [controles] = useDato<Control[]>(KEY_CONTROLES, []);
  const [meds] = useDato<Medicamento[]>(KEY_MEDICACION, []);
  const [q, setQ] = useState("");
  const [selId, setSelId] = useState<string | null>(null);
  const [nueva, setNueva] = useState(false);

  // Pacientes: los del portal + los que solo tienen turnos
  const pacientes: PacienteHC[] = useMemo(() => {
    const lista: PacienteHC[] = portal.map((p) => ({ id: p.id, nombre: p.nombre, dni: p.dni, ficha: p.ficha, portal: true }));
    const nombres = new Set(lista.map((p) => p.nombre.toLowerCase()));
    turnos.forEach((t) => {
      const n = t.paciente.trim();
      if (n && !nombres.has(n.toLowerCase())) {
        nombres.add(n.toLowerCase());
        lista.push({ id: t.pacienteId ?? `nombre:${n.toLowerCase()}`, nombre: n, portal: false });
      }
    });
    return lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [portal, turnos]);

  const ultimaDe = (id: string) => evols.filter((e) => e.pacienteId === id).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  const visibles = pacientes.filter((p) => {
    if (q && !`${p.nombre} ${p.dni ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (filtro === "todas") return true;
    return evols.some((e) => e.pacienteId === p.id && e.especialidad === filtro) || !evols.some((e) => e.pacienteId === p.id);
  });
  const sel = pacientes.find((p) => p.id === selId) ?? null;

  const espDoctor: EspecialidadHC = user.id === "alonso" ? "Cardiología" : "Nefrología";
  const totalCardio = evols.filter((e) => e.especialidad === "Cardiología").length;
  const totalNefro = evols.filter((e) => e.especialidad === "Nefrología").length;

  return (
    <div className="space-y-6">
      {/* Filtro por especialidad */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="pn-card inline-flex flex-wrap gap-1 p-1.5">
          {(["todas", "Cardiología", "Nefrología", "Medicina Interna"] as FiltroHC[]).map((f) => {
            const on = filtro === f;
            const Ic = f === "todas" ? FileText : ESP_HC[f].icon;
            return (
              <button key={f} onClick={() => setFiltro(f)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${on ? "pn-acc-tile text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <Ic className="size-4" /> {f === "todas" ? "Todas" : f}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1.5 font-semibold text-rose-700 ring-1 ring-rose-200"><HeartPulse className="size-3.5" /> {totalCardio} {totalCardio === 1 ? "evolución" : "evoluciones"} cardio</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1.5 font-semibold text-sky-800 ring-1 ring-sky-200"><Droplets className="size-3.5" /> {totalNefro} {totalNefro === 1 ? "evolución" : "evoluciones"} nefro</span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Lista de pacientes */}
        <section className="pn-card pn-up flex max-h-[calc(100vh-14rem)] min-h-[420px] flex-col p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o DNI" className={inp + " pl-10"} />
          </div>
          <p className="mt-4 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{visibles.length} pacientes</p>
          <ul className="pn-noscroll mt-2 flex-1 space-y-1 overflow-y-auto">
            {visibles.map((p) => {
              const u = ultimaDe(p.id);
              const on = p.id === selId;
              const ant = p.ficha?.antecedentes ?? [];
              return (
                <li key={p.id}>
                  <button
                    onClick={() => { setSelId(p.id); setNueva(false); }}
                    className={`group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all ${on ? "bg-[rgba(var(--acc),.12)] ring-1 ring-[rgba(var(--acc),.35)]" : "hover:translate-x-0.5 hover:bg-secondary"}`}
                  >
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${on ? "pn-acc-tile text-white" : "bg-secondary text-foreground"}`}>
                      {p.nombre.split(" ").slice(0, 2).map((x) => x[0]).join("").toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{p.nombre}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {u ? `${u.especialidad} · ${new Date(u.fecha).toLocaleDateString("es-AR")}` : "Sin evoluciones"}
                      </span>
                    </span>
                    <span className="flex shrink-0 gap-1">
                      {ant.some((a) => /card|infarto|arritmia|marcapasos|hipert/i.test(a)) && <HeartPulse className="size-3.5 text-rose-500" />}
                      {ant.some((a) => /renal|diálisis/i.test(a)) && <Droplets className="size-3.5 text-sky-500" />}
                    </span>
                  </button>
                </li>
              );
            })}
            {visibles.length === 0 && <li className="px-2 py-8 text-center text-sm text-muted-foreground">Todavía no hay pacientes. Aparecen al invitar al portal o al cargar turnos.</li>}
          </ul>
        </section>

        {/* Ficha del paciente */}
        {!sel ? (
          <section className="pn-card pn-up p-6">
            <Vacio icon={FileText} titulo="Elegí un paciente" texto="Abrí la historia clínica para ver antecedentes, presión, función renal, estudios y cargar la evolución de la consulta." />
          </section>
        ) : (
          <FichaHC
            key={sel.id}
            p={sel}
            evols={evols.filter((e) => e.pacienteId === sel.id)}
            estudios={estudios.filter((e) => e.pacienteId === sel.id)}
            controles={controles.filter((c) => c.pacienteId === sel.id)}
            meds={meds.filter((m) => m.pacienteId === sel.id && m.activo)}
            filtro={filtro}
            nueva={nueva}
            setNueva={setNueva}
            espDoctor={espDoctor}
            onGuardar={(ev) => {
              setEvols((prev) => [ev, ...prev]);
              log("Evolución cargada", `${ev.paciente} · ${ev.especialidad}`);
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

function FichaHC({
  p, evols, estudios, controles, meds, filtro, nueva, setNueva, espDoctor, onGuardar, onBorrar, user,
}: {
  p: PacienteHC; evols: Evolucion[]; estudios: Estudio[]; controles: Control[]; meds: Medicamento[]; filtro: FiltroHC;
  nueva: boolean; setNueva: (v: boolean) => void; espDoctor: EspecialidadHC; onGuardar: (e: Evolucion) => void; onBorrar: (id: string) => void; user: SessionUser;
}) {
  const edad = edadDe(p.ficha?.nacimiento);
  const ordenadas = [...evols].sort((a, b) => b.fecha.localeCompare(a.fecha));

  // Últimos valores clínicos (evoluciones, controles del portal y estudios)
  const presiones = [
    ...ordenadas.filter((e) => e.signos.sistolica && e.signos.diastolica).map((e) => ({ f: e.fecha, s: e.signos.sistolica!, d: e.signos.diastolica! })),
    ...controles.map((c) => ({ f: c.fecha, s: c.sistolica, d: c.diastolica })),
  ].sort((a, b) => b.f.localeCompare(a.f));
  const ta = presiones[0];
  const fevi = [
    ...ordenadas.filter((e) => e.cardio?.fevi).map((e) => ({ f: e.fecha, v: e.cardio!.fevi! })),
    ...estudios.filter((e) => e.valores.fevi).map((e) => ({ f: e.fecha, v: e.valores.fevi! })),
  ].sort((a, b) => b.f.localeCompare(a.f))[0];
  const egfr = [
    ...ordenadas.filter((e) => e.nefro?.egfr).map((e) => ({ f: e.fecha, v: e.nefro!.egfr!, cr: e.nefro?.creatinina, k: e.nefro?.potasio })),
    ...estudios.filter((e) => e.valores.egfr).map((e) => ({ f: e.fecha, v: e.valores.egfr!, cr: e.valores.creatinina, k: e.valores.potasio })),
  ].sort((a, b) => b.f.localeCompare(a.f))[0];

  // Línea de tiempo: evoluciones + estudios
  type Item = { tipo: "evol"; f: string; e: Evolucion } | { tipo: "estudio"; f: string; e: Estudio };
  const linea: Item[] = [
    ...ordenadas.filter((e) => filtro === "todas" || e.especialidad === filtro).map((e) => ({ tipo: "evol" as const, f: e.fecha, e })),
    ...estudios
      .filter((e) => filtro === "todas" || (filtro === "Cardiología" ? /eco|electro|holter|mapa|ergo/i.test(e.tipo) : filtro === "Nefrología" ? /renal|orina|laboratorio/i.test(e.tipo) : false))
      .map((e) => ({ tipo: "estudio" as const, f: e.fecha, e })),
  ].sort((a, b) => b.f.localeCompare(a.f));

  return (
    <div className="min-w-0 space-y-6">
      {/* Encabezado */}
      <section className="pn-up relative overflow-hidden rounded-[1.5rem] gradient-deep p-6 text-white shadow-elevated">
        <div className="pn-cross pointer-events-none absolute inset-0" />
        <div className="pn-orb pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold ring-1 ring-white/25">
              {p.nombre.split(" ").slice(0, 2).map((x) => x[0]).join("").toUpperCase()}
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Historia clínica</p>
              <h2 className="text-2xl font-semibold">{p.nombre}</h2>
              <p className="mt-0.5 text-sm text-white/70">
                {[edad !== null ? `${edad} años` : null, p.dni ? `DNI ${p.dni}` : null, p.ficha?.obraSocial ?? null, p.ficha?.grupo ? `Grupo ${p.ficha.grupo}` : null].filter(Boolean).join(" · ") || "Sin datos de ficha cargados"}
              </p>
            </div>
          </div>
          <Button onClick={() => setNueva(!nueva)} className="rounded-xl !bg-white text-[var(--deep)] hover:!bg-white/90">
            {nueva ? <X className="size-4" /> : <Plus className="size-4" />} {nueva ? "Cancelar" : "Nueva evolución"}
          </Button>
        </div>
        <div className="relative mt-5 flex flex-wrap gap-2">
          {p.ficha?.alergias && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold"><AlertTriangle className="size-3.5" /> Alergias: {p.ficha.alergias}</span>
          )}
          {(p.ficha?.antecedentes ?? []).map((a) => (
            <span key={a} className="rounded-full bg-white/12 px-3 py-1 text-xs ring-1 ring-white/20">{a}</span>
          ))}
          {!p.portal && <span className="rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold text-amber-950">Sin portal: invitalo para completar la ficha</span>}
        </div>
      </section>

      {/* Indicadores cardio / nefro */}
      <div className="grid gap-4 md:grid-cols-3">
        <IndicadorHC icon={Activity} titulo="Presión arterial" valor={ta ? `${ta.s}/${ta.d}` : "—"} unidad="mmHg" fecha={ta?.f} badge={ta ? { t: clasificarPresion(ta.s, ta.d).nivel, tono: clasificarPresion(ta.s, ta.d).tono } : undefined} grad="from-rose-500 to-red-600" />
        <IndicadorHC icon={HeartPulse} titulo="FEVI" valor={fevi ? `${fevi.v}` : "—"} unidad="%" fecha={fevi?.f} badge={fevi ? { t: clasificarFevi(fevi.v).texto, tono: clasificarFevi(fevi.v).tono } : undefined} grad="from-fuchsia-500 to-rose-600" />
        <IndicadorHC
          icon={Droplets}
          titulo="Filtrado glomerular"
          valor={egfr ? `${egfr.v}` : "—"}
          unidad="ml/min"
          fecha={egfr?.f}
          extra={egfr ? [egfr.cr ? `Creat. ${egfr.cr} mg/dl` : "", egfr.k ? `K ${egfr.k} mEq/l` : ""].filter(Boolean).join(" · ") : undefined}
          badge={egfr ? { t: `${estadioRenal(egfr.v).estadio} · ${estadioRenal(egfr.v).texto}`, tono: estadioRenal(egfr.v).tono } : undefined}
          grad="from-sky-500 to-blue-700"
        />
      </div>

      {nueva && <FormEvolucion p={p} espDoctor={espDoctor} user={user} onGuardar={onGuardar} />}

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* Línea de tiempo */}
        <Seccion icon={ClipboardList} titulo="Evoluciones y estudios" sub={filtro === "todas" ? "Todas las especialidades" : filtro}>
          {linea.length === 0 ? (
            <Vacio icon={NotebookPen} titulo="Sin registros" texto="Cargá la primera evolución de la consulta con el botón Nueva evolución." />
          ) : (
            <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-[19px] before:top-2 before:w-px before:bg-border">
              {linea.map((it) => {
                if (it.tipo === "estudio") {
                  const e = it.e;
                  return (
                    <li key={`es-${e.id}`} className="relative flex gap-4">
                      <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-md"><FlaskConical className="size-4" /></span>
                      <div className="min-w-0 flex-1 rounded-2xl border border-border/70 bg-secondary/40 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{e.titulo || e.tipo}</p>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 ring-1 ring-emerald-200">Estudio</span>
                          <span className="ml-auto text-xs text-muted-foreground">{new Date(e.fecha).toLocaleDateString("es-AR")}</span>
                        </div>
                        {e.informe && <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{e.informe}</p>}
                      </div>
                    </li>
                  );
                }
                const e = it.e;
                const cfg = ESP_HC[e.especialidad];
                const pr = e.signos.sistolica && e.signos.diastolica ? clasificarPresion(e.signos.sistolica, e.signos.diastolica) : null;
                return (
                  <li key={e.id} className="group relative flex gap-4">
                    <span className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.grad} text-white shadow-md`}><cfg.icon className="size-4" /></span>
                    <div className="min-w-0 flex-1 rounded-2xl border border-border/70 bg-card p-4 transition-shadow group-hover:shadow-md">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{e.motivo || "Consulta"}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${cfg.chip}`}>{e.especialidad}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {new Date(e.fecha).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })} · {nombreCorto(e.doctor)}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                        {pr && <span className={`rounded-full px-2.5 py-1 font-semibold ring-1 ${TONO_HC[pr.tono]}`}>TA {e.signos.sistolica}/{e.signos.diastolica} · {pr.nivel}</span>}
                        {e.signos.pulso && <span className="rounded-full bg-secondary px-2.5 py-1">FC {e.signos.pulso} lpm</span>}
                        {e.signos.peso && <span className="rounded-full bg-secondary px-2.5 py-1">Peso {e.signos.peso} kg</span>}
                        {e.cardio?.fevi && <span className={`rounded-full px-2.5 py-1 font-semibold ring-1 ${TONO_HC[clasificarFevi(e.cardio.fevi).tono]}`}>FEVI {e.cardio.fevi}%</span>}
                        {e.cardio?.ritmo && <span className="rounded-full bg-secondary px-2.5 py-1">{e.cardio.ritmo}</span>}
                        {e.cardio?.nyha && <span className="rounded-full bg-secondary px-2.5 py-1">NYHA {e.cardio.nyha}</span>}
                        {e.nefro?.egfr && <span className={`rounded-full px-2.5 py-1 font-semibold ring-1 ${TONO_HC[estadioRenal(e.nefro.egfr).tono]}`}>eGFR {e.nefro.egfr} · {estadioRenal(e.nefro.egfr).estadio}</span>}
                        {e.nefro?.creatinina && <span className="rounded-full bg-secondary px-2.5 py-1">Creat. {e.nefro.creatinina}</span>}
                        {e.nefro?.potasio && <span className={`rounded-full px-2.5 py-1 ${e.nefro.potasio > 5.5 || e.nefro.potasio < 3.5 ? "bg-red-100 font-semibold text-red-700 ring-1 ring-red-200" : "bg-secondary"}`}>K {e.nefro.potasio}</span>}
                        {e.nefro?.proteinuria !== undefined && <span className="rounded-full bg-secondary px-2.5 py-1">Proteinuria {e.nefro.proteinuria} g/24h</span>}
                      </div>
                      {e.diagnosticos.length > 0 && (
                        <p className="mt-3 text-xs"><span className="font-semibold">Diagnósticos:</span> <span className="text-muted-foreground">{e.diagnosticos.join(" · ")}</span></p>
                      )}
                      {e.nota && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{e.nota}</p>}
                      {e.plan && <p className="mt-2 rounded-xl bg-secondary/60 px-3 py-2 text-sm"><span className="font-semibold">Plan: </span>{e.plan}</p>}
                      {e.doctor === user.nombre && (
                        <button onClick={() => onBorrar(e.id)} className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground opacity-0 transition hover:text-red-600 group-hover:opacity-100">
                          <Trash2 className="size-3.5" /> Eliminar
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Seccion>

        {/* Medicación activa */}
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
  );
}

function IndicadorHC({ icon: Icon, titulo, valor, unidad, fecha, badge, extra, grad }: { icon: LucideIcon; titulo: string; valor: string; unidad: string; fecha?: string | undefined; badge?: { t: string; tono: string } | undefined; extra?: string | undefined; grad: string }) {
  return (
    <div className="pn-card pn-up pn-lift p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{titulo}</p>
        <span className={`flex size-9 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white shadow-md`}><Icon className="size-4" /></span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tabular-nums">
        {valor} <span className="text-sm font-normal text-muted-foreground">{valor !== "—" ? unidad : ""}</span>
      </p>
      {extra && <p className="text-xs text-muted-foreground">{extra}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {badge ? <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${TONO_HC[badge.tono] ?? TONO_HC["verde"]}`}>{badge.t}</span> : <span className="text-xs text-muted-foreground">Sin registros</span>}
        {fecha && <span className="text-[11px] text-muted-foreground">{new Date(fecha).toLocaleDateString("es-AR")}</span>}
      </div>
    </div>
  );
}

function FormEvolucion({ p, espDoctor, user, onGuardar }: { p: PacienteHC; espDoctor: EspecialidadHC; user: SessionUser; onGuardar: (e: Evolucion) => void }) {
  const [esp, setEsp] = useState<EspecialidadHC>(espDoctor);
  const [f, setF] = useState({ motivo: "", nota: "", plan: "", s: "", d: "", fc: "", peso: "", fevi: "", ritmo: "Sinusal", nyha: "", cr: "", egfr: "", k: "", prot: "" });
  const [dx, setDx] = useState<string[]>([]);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const s = num(f.s), d = num(f.d);
  const pr = s && d ? clasificarPresion(s, d) : null;
  const eg = num(f.egfr);

  const guardar = (e: FormEvent) => {
    e.preventDefault();
    const ev: Evolucion = {
      id: nuevoId(),
      pacienteId: p.id,
      paciente: p.nombre,
      fecha: new Date().toISOString(),
      doctor: user.nombre,
      especialidad: esp,
      motivo: f.motivo.trim(),
      nota: f.nota.trim(),
      diagnosticos: dx,
      signos: { sistolica: s, diastolica: d, pulso: num(f.fc), peso: num(f.peso) },
      ...(f.plan.trim() ? { plan: f.plan.trim() } : {}),
      ...(esp === "Cardiología" ? { cardio: { fevi: num(f.fevi), ritmo: f.ritmo || undefined, nyha: f.nyha || undefined } } : {}),
      ...(esp === "Nefrología" ? { nefro: { creatinina: num(f.cr), egfr: eg, potasio: num(f.k), proteinuria: num(f.prot) } } : {}),
    } as Evolucion;
    onGuardar(JSON.parse(JSON.stringify(ev)) as Evolucion);
  };
  const lbl = "mb-1.5 block text-xs font-semibold text-muted-foreground";

  return (
    <form onSubmit={guardar} className="pn-card pn-up space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div>
          <h3 className="text-[15px] font-semibold">Nueva evolución</h3>
          <p className="text-xs text-muted-foreground">{p.nombre} · {new Date().toLocaleDateString("es-AR")}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ESPECIALIDADES_HC.map((x) => {
            const cfg = ESP_HC[x];
            const on = esp === x;
            return (
              <button type="button" key={x} onClick={() => setEsp(x)} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${on ? `bg-gradient-to-br ${cfg.grad} text-white shadow-md` : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                <cfg.icon className="size-3.5" /> {x}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2"><span className={lbl}>Motivo de consulta</span><input required value={f.motivo} onChange={set("motivo")} placeholder={esp === "Cardiología" ? "Control de hipertensión, palpitaciones…" : esp === "Nefrología" ? "Control de función renal, edemas…" : "Control clínico"} className={inp} /></label>
      </div>

      <div>
        <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"><Activity className="size-3.5" /> Signos vitales</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label><span className={lbl}>TA sistólica</span><input inputMode="numeric" value={f.s} onChange={set("s")} placeholder="120" className={inp} /></label>
          <label><span className={lbl}>TA diastólica</span><input inputMode="numeric" value={f.d} onChange={set("d")} placeholder="80" className={inp} /></label>
          <label><span className={lbl}>Frecuencia cardíaca</span><input inputMode="numeric" value={f.fc} onChange={set("fc")} placeholder="72" className={inp} /></label>
          <label><span className={lbl}>Peso (kg)</span><input inputMode="decimal" value={f.peso} onChange={set("peso")} placeholder="78" className={inp} /></label>
        </div>
        {pr && <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${TONO_HC[pr.tono]}`}>{pr.nivel}</p>}
      </div>

      {esp === "Cardiología" && (
        <div className="rounded-2xl border border-rose-200/70 bg-rose-50/50 p-4 dark:border-rose-500/20 dark:bg-rose-500/5">
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-rose-700"><HeartPulse className="size-3.5" /> Cardiología</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <label><span className={lbl}>FEVI (%)</span><input inputMode="numeric" value={f.fevi} onChange={set("fevi")} placeholder="60" className={inp} /></label>
            <label><span className={lbl}>Ritmo</span>
              <select value={f.ritmo} onChange={set("ritmo")} className={inp}>
                {["Sinusal", "Fibrilación auricular", "Aleteo auricular", "Extrasistolia", "Marcapasos"].map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
            <label><span className={lbl}>Clase funcional NYHA</span>
              <select value={f.nyha} onChange={set("nyha")} className={inp}>
                <option value="">No aplica</option>
                {["I", "II", "III", "IV"].map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </label>
          </div>
        </div>
      )}

      {esp === "Nefrología" && (
        <div className="rounded-2xl border border-sky-200/70 bg-sky-50/50 p-4 dark:border-sky-500/20 dark:bg-sky-500/5">
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-sky-800"><Droplets className="size-3.5" /> Nefrología</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label><span className={lbl}>Creatinina (mg/dl)</span><input inputMode="decimal" value={f.cr} onChange={set("cr")} placeholder="1.1" className={inp} /></label>
            <label><span className={lbl}>eGFR (ml/min)</span><input inputMode="numeric" value={f.egfr} onChange={set("egfr")} placeholder="75" className={inp} /></label>
            <label><span className={lbl}>Potasio (mEq/l)</span><input inputMode="decimal" value={f.k} onChange={set("k")} placeholder="4.5" className={inp} /></label>
            <label><span className={lbl}>Proteinuria (g/24 h)</span><input inputMode="decimal" value={f.prot} onChange={set("prot")} placeholder="0.2" className={inp} /></label>
          </div>
          {eg && <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${TONO_HC[estadioRenal(eg).tono]}`}>Estadio {estadioRenal(eg).estadio} · {estadioRenal(eg).texto}</p>}
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Diagnósticos</p>
        <div className="flex flex-wrap gap-1.5">
          {DX_SUGERIDOS[esp].map((x) => {
            const on = dx.includes(x);
            return (
              <button type="button" key={x} onClick={() => setDx(on ? dx.filter((y) => y !== x) : [...dx, x])} className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${on ? "pn-acc-tile text-white ring-transparent" : "bg-background text-muted-foreground ring-border hover:text-foreground"}`}>
                {on && <Check className="size-3" />} {x}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label><span className={lbl}>Evolución / examen físico</span><textarea rows={5} value={f.nota} onChange={set("nota")} placeholder="Refiere… Al examen…" className={inp + " h-auto resize-none py-3"} /></label>
        <label><span className={lbl}>Plan e indicaciones</span><textarea rows={5} value={f.plan} onChange={set("plan")} placeholder="Ajuste de medicación, estudios a solicitar, próximo control…" className={inp + " h-auto resize-none py-3"} /></label>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="rounded-xl px-6"><Check className="size-4" /> Guardar evolución</Button>
      </div>
    </form>
  );
}
