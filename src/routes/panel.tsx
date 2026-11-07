import { useEffect, useMemo, useRef, useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Ban,
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
import {
  ADMINS,
  auditar,
  cambiarClave,
  cerrarSesion,
  leerAuditoria,
  sesionActual,
  type Evento,
  type SessionUser,
} from "@/lib/auth-local";
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
type Turno = { id: string; fecha: string; hora: string; paciente: string; doctor: string; motivo: string; estado: Estado; telefono?: string; email?: string; origen?: "web" | "panel" };
type Mov = { id: string; fecha: string; concepto: string; tipo: "Ingreso" | "Egreso"; monto: number };
type Nivel = "ninguno" | "ver" | "editar";
type Permisos = Record<string, Record<string, Nivel>>;
type Tab = "resumen" | "turnos" | "finanzas" | "permisos" | "asistente" | "auditoria";
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
  "Recepción": mk({ Turnos: "editar", Pacientes: "ver", "Asistente IA": "ver" }),
  "Secretaría médica": mk({ Turnos: "editar", Pacientes: "editar", "Historias clínicas": "ver", Estudios: "ver", "Asistente IA": "ver" }),
  "Atención al paciente": mk({ Turnos: "editar", Pacientes: "ver", "Asistente IA": "ver" }),
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
  { id: "finanzas", label: "Finanzas", icon: Wallet },
  { id: "permisos", label: "Permisos", icon: KeyRound },
  { id: "asistente", label: "Asistente IA", icon: Bot },
  { id: "auditoria", label: "Auditoría", icon: ClipboardList },
];

const TITULOS: Record<Tab, [string, string]> = {
  resumen: ["Resumen general", "Vista rápida de la actividad de la clínica."],
  turnos: ["Turnos", "Creá y gestioná la agenda de los profesionales."],
  finanzas: ["Finanzas", "Ingresos, egresos y balance de la clínica."],
  permisos: ["Permisos", "Definí qué puede ver y hacer cada departamento."],
  asistente: ["Asistente IA", "Consultas rápidas sobre turnos, finanzas, permisos y actividad."],
  auditoria: ["Auditoría", "Registro de todas las acciones realizadas en el panel."],
};

/* ---------- Panel principal ---------- */
function Panel() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [tab, setTab] = useState<Tab>("resumen");
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
  const badges: Partial<Record<Tab, number>> = { turnos: pendientes, auditoria: eventosHoy };
  const fechaLarga = ahora.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  const hora = ahora.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="isolate min-h-screen bg-[#f4f7fc] lg:grid lg:grid-cols-[280px_1fr]">
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
        .pn-card { border: 1px solid transparent; -webkit-backdrop-filter: blur(14px) saturate(160%); backdrop-filter: blur(14px) saturate(160%); background: linear-gradient(color-mix(in oklab, var(--color-card) 84%, transparent), color-mix(in oklab, var(--color-card) 74%, transparent)) padding-box, linear-gradient(140deg, rgba(56,132,246,.35), rgba(148,163,184,.18) 35%, rgba(148,163,184,.12) 65%, rgba(139,92,246,.3)) border-box; transition: transform .45s cubic-bezier(.22,1,.36,1), box-shadow .45s cubic-bezier(.22,1,.36,1); }
        .pn-card { box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 1px 2px rgba(15,35,80,.04), 0 16px 40px -18px rgba(15,35,80,.18); }
        .pn-card:hover { box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 1px 2px rgba(15,35,80,.05), 0 28px 56px -18px rgba(30,64,175,.25); }
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
        @media (prefers-reduced-motion: reduce) { .pn-up, .pn-orb, .pn-wave, .pn-dot, .pn-bar, .pn-sheen::after, .pn-online::after, .pn-ecg, .pn-draw, .pn-area, .pn-beat, .pn-scan { animation: none; } }
      `}</style>

      {/* ───────── SIDEBAR ───────── */}
      <aside className="pn-noscroll relative overflow-hidden gradient-deep text-deep-foreground lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="pn-orb pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pn-orb pointer-events-none absolute -bottom-20 -left-16 size-64 rounded-full bg-sky-300/10 blur-3xl" style={{ animationDelay: "-5s" }} />

        <div className="relative flex items-center justify-between gap-3 px-5 pb-2 pt-5 lg:px-6 lg:pt-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
              <Activity className="size-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Gómez Bolaño</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-deep-foreground/65">Administración</p>
            </div>
          </div>
          <button onClick={salir} aria-label="Cerrar sesión" className="rounded-lg p-2 text-deep-foreground/80 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40 lg:hidden">
            <LogOut className="size-5" />
          </button>
        </div>

        <div className="relative mx-4 mt-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              {foto ? (
                <img src={foto} alt={user.nombre} className="size-12 rounded-xl object-cover object-top ring-2 ring-white/30" />
              ) : (
                <span className="flex size-12 items-center justify-center rounded-xl bg-white/20 text-sm font-semibold">{iniciales(user.nombre)}</span>
              )}
              <span className="pn-online absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 ring-2 ring-[var(--deep)]" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">{corto}</p>
              <p className="truncate text-[11px] text-deep-foreground/70">{user.nombre.replace(/^Dr\.\s*/, "")}</p>
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]">
                <ShieldCheck className="size-3" /> Administrador
              </span>
            </div>
          </div>
        </div>

        <p className="relative hidden px-7 pb-2 pt-6 text-[10px] [@media(max-height:700px)]:pt-3 font-semibold uppercase tracking-[0.22em] text-deep-foreground/50 lg:block">Gestión</p>
        <nav className="pn-noscroll relative flex gap-1.5 overflow-x-auto px-3 py-3 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:px-4 lg:py-0">
          {NAV.map((n) => {
            const activo = tab === n.id;
            const badge = badges[n.id];
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                aria-current={activo ? "page" : undefined}
                className={`group relative flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white/40 ${
                  activo
                    ? "bg-white text-[var(--deep)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
                    : "text-deep-foreground/75 hover:translate-x-1 hover:bg-white/10 hover:text-deep-foreground"
                }`}
              >
                <span className={`flex size-8 items-center justify-center rounded-lg transition-colors ${activo ? "gradient-deep text-white" : "bg-white/10 text-deep-foreground group-hover:bg-white/15"}`}>
                  <n.icon className="size-4" />
                </span>
                <span className="pr-1">{n.label}</span>
                {n.id === "asistente" && !activo && (
                  <span className="ml-auto rounded-full bg-gradient-to-r from-sky-400 to-violet-400 px-2 py-0.5 text-[10px] font-bold text-white">IA</span>
                )}
                {!!badge && (
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold ${activo ? "bg-[var(--deep)] text-white" : "bg-white/20 text-deep-foreground"}`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="relative hidden space-y-3 p-4 lg:block">
          <div className="rounded-2xl bg-black/15 p-4 ring-1 ring-white/10 [@media(max-height:760px)]:hidden">
            <p className="font-display text-2xl font-semibold tabular-nums">{hora}</p>
            <p className="text-xs capitalize text-deep-foreground/70">{fechaLarga}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline" className="flex-1 rounded-xl !border-white/25 !bg-white/10 text-deep-foreground hover:!bg-white/20 hover:text-deep-foreground">
              <Link to="/"><ExternalLink className="size-4" /> Ver sitio</Link>
            </Button>
            <Button size="sm" variant="outline" onClick={salir} className="flex-1 rounded-xl !border-red-300/30 !bg-red-500/15 text-deep-foreground hover:!bg-red-500/30 hover:text-deep-foreground">
              <LogOut className="size-4" /> Salir
            </Button>
          </div>
        </div>
      </aside>

      {/* ───────── CONTENIDO ───────── */}
      <FondoModulo tab={tab} />
      <main className="relative min-w-0 p-4 sm:p-8">
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
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setTab("asistente")} variant="outline" className="rounded-xl !border-white/25 !bg-white/10 text-deep-foreground hover:!bg-white/20 hover:text-deep-foreground">
                <Bot className="size-4" /> Preguntar a la IA
              </Button>
              <Button onClick={() => setTab("turnos")} className="rounded-xl !bg-white text-[var(--deep)] hover:!bg-white/90">
                <Plus className="size-4" /> Nuevo turno
              </Button>
            </div>
          </div>
        </div>

        <div key={tab} className="pn-up mb-6">
          <h2 className="text-2xl font-semibold sm:text-3xl">{titulo}</h2>
          <p className="text-sm text-muted-foreground">{subtitulo}</p>
        </div>

        {tab === "resumen" && <Resumen turnos={turnos} movs={movs} audit={audit} irA={setTab} />}
        {tab === "turnos" && <TurnosTab turnos={turnos} setTurnos={setTurnos} log={log} />}
        {tab === "finanzas" && <FinanzasTab movs={movs} setMovs={setMovs} log={log} />}
        {tab === "permisos" && <PermisosTab permisos={permisos} setPermisos={setPermisos} log={log} user={user} />}
        {tab === "asistente" && <AsistenteTab turnos={turnos} movs={movs} permisos={permisos} audit={audit} log={log} user={user} />}
        {tab === "auditoria" && <AuditoriaTab audit={audit} log={log} />}
      </main>
    </div>
  );
}

/* ---------- Fondo premium de cada módulo ---------- */
const FONDOS: Record<Tab, { a: string; b: string; c: string }> = {
  resumen: { a: "56,132,246", b: "99,102,241", c: "14,165,233" },
  turnos: { a: "14,165,233", b: "20,184,166", c: "59,130,246" },
  finanzas: { a: "16,185,129", b: "14,165,233", c: "20,184,166" },
  permisos: { a: "139,92,246", b: "79,70,229", c: "56,132,246" },
  asistente: { a: "99,102,241", b: "168,85,247", c: "14,165,233" },
  auditoria: { a: "71,85,105", b: "56,132,246", c: "100,116,139" },
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
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary ring-1 ring-primary/10">
            <Icon className="size-[18px]" />
          </span>
          <div>
            <h3 className="text-base font-semibold">{titulo}</h3>
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
        <polyline
          className="pn-ecg"
          style={{ animationDelay: `${delay * 4}s`, animationDuration: "4s" }}
          points="0,20 60,20 75,20 85,8 95,30 105,20 170,20 180,20 190,3 200,34 210,20 300,20"
          fill="none"
          stroke={TONO_HEX[tono]}
          strokeWidth="2"
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

function Vacio({ icon: Icon, texto }: { icon: LucideIcon; texto: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary"><Icon className="size-5" /></span>
      {texto}
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
          <Button onClick={() => irA("asistente")} className="rounded-xl !bg-white text-indigo-700 hover:!bg-white/90">
            Hacer una consulta
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Seccion icon={CalendarCheck} titulo="Próximos turnos" sub="Pendientes y confirmados" delay={0.25} className="xl:col-span-3"
          acciones={<Button size="sm" variant="ghost" className="rounded-lg text-primary" onClick={() => irA("turnos")}>Ver agenda <ArrowUpRight className="size-4" /></Button>}>
          {proximos.length === 0 && <Vacio icon={CalendarDays} texto="Todavía no hay turnos. Los que se reserven desde la web o se creen acá van a aparecer en esta lista." />}
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
            {audit.length === 0 && <Vacio icon={ClipboardList} texto="Todavía no hay actividad." />}
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
function TurnosTab({ turnos, setTurnos, log }: { turnos: Turno[]; setTurnos: Dispatch<SetStateAction<Turno[]>>; log: LogFn }) {
  const [f, setF] = useState({ fecha: hoy(), hora: "09:00", paciente: "", doctor: ADMINS[0]!.nombre, motivo: "" });
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
    const nuevo: Turno = { id: uid(), ...f, paciente: f.paciente.trim(), motivo: f.motivo.trim(), estado: "Pendiente", origen: "panel" };
    setTurnos((p) => [...p, nuevo]);
    log("Turno creado", `${nuevo.paciente} · ${fechaCorta(nuevo.fecha)} ${nuevo.hora} · ${nuevo.doctor}`);
    toast.success("Turno creado.");
    setF({ ...f, paciente: "", motivo: "" });
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
      <Seccion icon={Plus} titulo="Nuevo turno" sub="Se crea como pendiente hasta confirmarlo">
        <form onSubmit={agregar} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Campo label="Fecha"><input type="date" required value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} className={inp} /></Campo>
          <Campo label="Hora"><input type="time" required value={f.hora} onChange={(e) => setF({ ...f, hora: e.target.value })} className={inp} /></Campo>
          <Campo label="Paciente" className="lg:col-span-2"><input required placeholder="Nombre y apellido" value={f.paciente} onChange={(e) => setF({ ...f, paciente: e.target.value })} className={inp} /></Campo>
          <Campo label="Profesional" className="lg:col-span-2">
            <select value={f.doctor} onChange={(e) => setF({ ...f, doctor: e.target.value })} className={inp}>
              {ADMINS.map((a) => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
            </select>
          </Campo>
          <Campo label="Motivo de la consulta" className="sm:col-span-2 lg:col-span-5"><input required placeholder="Ej: control cardiológico" value={f.motivo} onChange={(e) => setF({ ...f, motivo: e.target.value })} className={inp} /></Campo>
          <div className="flex items-end"><Button type="submit" className="h-11 w-full rounded-xl"><Plus className="size-4" /> Crear turno</Button></div>
        </form>
      </Seccion>

      <Seccion icon={CalendarDays} titulo="Agenda" sub={`${lista.length} turno${lista.length === 1 ? "" : "s"}`} delay={0.08}
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
                <tr><td colSpan={5}><Vacio icon={CalendarDays} texto="No hay turnos con ese filtro." /></td></tr>
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

function FinanzasTab({ movs, setMovs, log }: { movs: Mov[]; setMovs: Dispatch<SetStateAction<Mov[]>>; log: LogFn }) {
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
                  <button onClick={() => borrar(m)} aria-label="Eliminar movimiento" className="rounded-lg p-2 text-muted-foreground opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100">
                    <Trash2 className="size-4" />
                  </button>
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
