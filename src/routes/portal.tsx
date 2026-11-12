import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Ban,
  Bell,
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Droplets,
  Eye,
  EyeOff,
  FileText,
  FlaskConical,
  Gauge,
  HeartPulse,
  Home,
  KeyRound,
  LogOut,
  Menu,
  MessageCircle,
  Pill,
  Plus,
  Scale,
  ShieldCheck,
  Stethoscope,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-provider";
import { waLink, Electro } from "@/components/site/PublicLayout";
import { CLINICA, DOCTORS, ESPECIALIDADES, fotoDoctor, iconoEspecialidad } from "@/data/clinic";
import {
  ADMINS,
  ANTECEDENTES,
  KEY_AGENDA,
  KEY_AUT,
  KEY_COBROS,
  KEY_CONTROLES,
  KEY_ESTUDIOS,
  KEY_MEDICACION,
  KEY_PACIENTES,
  KEY_SESION_PACIENTE,
  KEY_TURNOS,
  TIPOS_AUT,
  agendaDe,
  atiendeEl,
  auditar,
  clasificarFevi,
  clasificarPresion,
  estadioRenal,
  estadoCobro,
  hashTexto,
  horariosDelDia,
  ingresarPaciente,
  isoDe,
  nuevoId,
  pagadoDe,
  proximosDias,
  resumenAgenda,
  saldoDe,
  sesionActual,
  useDato,
  type Agendas,
  type Autorizacion,
  type Cobro,
  type Control,
  type Estudio,
  type FichaMedica,
  type Medicamento,
  type PacientePortal,
  type TurnoClinica,
  KEY_SITIO,
  sitioDe,
  leerDato, ocupadosServidor, salirPortal } from "@/lib/auth-local";
import heroDoctors from "@/assets/hero-doctors.jpg";

import logoClinica from "@/assets/logo.png";
export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Portal del paciente | HEGO · Centro de especialidades médicas" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Portal,
});

/* ===================================================================== */
/* Utilidades                                                              */
/* ===================================================================== */

type Seccion = "inicio" | "turnos" | "controles" | "medicacion" | "estudios" | "pagos" | "autorizaciones" | "ficha";
type Tono = "verde" | "ambar" | "naranja" | "rojo" | "critico" | "azul" | "violeta";

const SECCIONES: { id: Seccion; label: string; icon: LucideIcon; grupo: string }[] = [
  { id: "inicio", label: "Inicio", icon: Home, grupo: "Mi salud" },
  { id: "turnos", label: "Mis turnos", icon: CalendarDays, grupo: "Mi salud" },
  { id: "controles", label: "Presión y peso", icon: Gauge, grupo: "Mi salud" },
  { id: "medicacion", label: "Medicación", icon: Pill, grupo: "Mi salud" },
  { id: "estudios", label: "Estudios y resultados", icon: FileText, grupo: "Mi salud" },
  { id: "pagos", label: "Mis pagos", icon: Wallet, grupo: "Trámites" },
  { id: "autorizaciones", label: "Autorizaciones", icon: ShieldCheck, grupo: "Trámites" },
  { id: "ficha", label: "Mi ficha y datos", icon: UserRound, grupo: "Mi cuenta" },
];

const TONO: Record<Tono, string> = {
  verde: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
  ambar: "bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300",
  naranja: "bg-orange-500/10 text-orange-700 ring-orange-500/25 dark:text-orange-300",
  rojo: "bg-rose-500/10 text-rose-700 ring-rose-500/25 dark:text-rose-300",
  critico: "bg-red-600 text-white ring-red-600",
  azul: "bg-sky-500/10 text-sky-700 ring-sky-500/25 dark:text-sky-300",
  violeta: "bg-violet-500/10 text-violet-700 ring-violet-500/25 dark:text-violet-300",
};

const inp =
  "h-12 w-full rounded-xl border border-input bg-background/70 px-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15 dark:bg-white/5";

const ars = (n: number) => "$ " + n.toLocaleString("es-AR");
const fechaTxt = (f: string) => new Date(f + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
const fechaCorta = (f: string) => f.split("-").reverse().join("/");
const fechaHoraTxt = (iso: string) => new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const hoyIso = () => isoDe(new Date());
const nombrePanel = (doctorId: string) => {
  const d = DOCTORS.find((x) => x.id === doctorId);
  return ADMINS.find((a) => a.id === d?.foto)?.nombre ?? d?.nombre ?? "";
};
const doctorDePanel = (nombre: string) => {
  const a = ADMINS.find((x) => x.nombre === nombre);
  return DOCTORS.find((d) => d.foto === a?.id);
};

function cuandoFalta(fecha: string, hora: string) {
  const ms = new Date(`${fecha}T${hora}:00`).getTime() - Date.now();
  if (ms < 0) return "ahora";
  const h = Math.round(ms / 3600000);
  if (h < 1) return "en menos de una hora";
  if (h < 24) return `en ${h} hora${h === 1 ? "" : "s"}`;
  const d = Math.round(h / 24);
  return d === 1 ? "mañana" : `en ${d} días`;
}

function descargarICS(t: TurnoClinica) {
  const d = doctorDePanel(t.doctor);
  const ini = new Date(`${t.fecha}T${t.hora}:00`);
  const fin = new Date(ini.getTime() + 40 * 60000);
  const f = (x: Date) => x.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Clinica Gomez Bolano//Portal//ES",
    "BEGIN:VEVENT",
    `UID:${t.id}@clinicagomezbolano`,
    `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(ini)}`,
    `DTEND:${f(fin)}`,
    `SUMMARY:Turno ${t.motivo.split(" · ")[0]} - ${d?.nombre ?? t.doctor}`,
    `LOCATION:${sitioDe(leerDato(KEY_SITIO, {})).direccion}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Recordatorio de turno",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `turno-${t.fecha}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

/* Indicaciones generales de preparación (siempre prima la indicación médica) */
const PREPARACION: { clave: string[]; titulo: string; icon: LucideIcon; pasos: string[] }[] = [
  { clave: ["laboratorio", "analisis", "renal", "nefro"], titulo: "Análisis de sangre", icon: FlaskConical, pasos: ["Ayuno de 8 a 12 horas (podés tomar agua).", "Tomá tu medicación habitual salvo que te indiquen lo contrario.", "Traé la orden médica y tu documento."] },
  { clave: ["orina"], titulo: "Orina de 24 horas", icon: Droplets, pasos: ["Al levantarte, descartá la primera orina del día y anotá la hora.", "Juntá toda la orina de las 24 horas siguientes en el frasco, guardado en la heladera.", "Incluí la primera orina del día siguiente a la misma hora y traé el frasco a la clínica."] },
  { clave: ["holter"], titulo: "Holter 24 horas", icon: HeartPulse, pasos: ["Vení bañado y con ropa cómoda, abotonada adelante.", "No uses cremas en el pecho.", "Durante el estudio no podés mojar el equipo. Anotá síntomas y actividades con la hora."] },
  { clave: ["mapa", "presion"], titulo: "MAPA (presión 24 horas)", icon: Gauge, pasos: ["Usá ropa con mangas amplias.", "Mientras mide, quedate quieto con el brazo relajado.", "Seguí tu rutina y tu medicación habitual, salvo otra indicación."] },
  { clave: ["ergometria", "esfuerzo"], titulo: "Ergometría", icon: Activity, pasos: ["Traé ropa y calzado deportivo.", "Comé algo liviano 2 horas antes. No fumes ese día.", "Consultá con tu médico si debés suspender algún medicamento."] },
  { clave: ["eco", "ecocardio", "doppler", "cardio"], titulo: "Ecocardiograma / Doppler", icon: HeartPulse, pasos: ["No requiere ayuno ni preparación especial.", "Traé estudios cardiológicos anteriores si tenés."] },
];

function preparacionPara(texto: string) {
  const t = texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return PREPARACION.find((p) => p.clave.some((k) => t.includes(k)));
}

/* ===================================================================== */
/* Entrada                                                                 */
/* ===================================================================== */

function Portal() {
  const [montado, setMontado] = useState(false);
  const [sesion, setSesion] = useState<string | null>(null);
  const [vista, setVista] = useState<string | null>(null);
  const [pacientes] = useDato<PacientePortal[]>(KEY_PACIENTES, []);

  useEffect(() => {
    setSesion(localStorage.getItem(KEY_SESION_PACIENTE));
    // Vista previa: solo si hay un doctor con sesión iniciada en el panel
    const v = new URLSearchParams(window.location.search).get("vista");
    if (v && sesionActual()) setVista(v);
    setMontado(true);
  }, []);

  if (!montado) return <div className="min-h-screen bg-background" />;
  if (vista) {
    const real = pacientes.find((p) => p.id === vista);
    const ejemplo: PacientePortal = {
      id: "__ejemplo",
      nombre: "Paciente de ejemplo",
      dni: "30123456",
      telefono: "11 5555-0000",
      email: "paciente@ejemplo.com",
      codigo: "000000",
      estado: "Activo",
      invitadoPor: "",
      fecha: new Date().toISOString(),
    };
    return <Interior paciente={real ?? ejemplo} vista onSalir={() => window.close()} />;
  }
  const paciente = pacientes.find((p) => p.id === sesion && p.estado !== "Revocado");
  if (!paciente) return <Login onOk={(id) => setSesion(id)} />;
  return (
    <Interior
      paciente={paciente}
      onSalir={() => {
        void salirPortal();
        setSesion(null);
      }}
    />
  );
}

/* ---------- Ingreso ---------- */
function Login({ onOk }: { onOk: (id: string) => void }) {
  const [usuario, setUsuario] = useState("");
  const [codigo, setCodigo] = useState("");
  const [ver, setVer] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const ingresar = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    const r = await ingresarPaciente(usuario, codigo);
    setCargando(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    toast.success(`¡Hola, ${r.paciente.nombre.split(" ")[0]}!`);
    onOk(r.paciente.id);
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-deep lg:block">
        <img src={heroDoctors} alt="" className="hero-kenburns absolute inset-0 size-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-br from-deep via-deep/80 to-deep/30" />
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top_left,#000_25%,transparent_75%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-white/25"><img src={logoClinica} alt="" className="size-full object-cover" /></span>
            <span className="leading-tight"><span className="block text-sm font-bold">HEGO</span><span className="block text-[10px] uppercase tracking-[0.2em] text-white/70">Especialidades médicas</span></span>
          </Link>
          <div className="max-w-md space-y-5">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em]"><span className="pulse-dot size-1.5 rounded-full bg-emerald-400" /> Portal del paciente</span>
            <h1 className="text-5xl leading-[1.05] text-white">Tu salud del corazón y los riñones, <span className="text-shine italic">en un solo lugar</span>.</h1>
            <ul className="space-y-3 text-sm text-white/85">
              {[
                "Sacá y cancelá turnos con los horarios reales de cada doctor",
                "Registrá tu presión, pulso y peso, y seguí tu evolución",
                "Mirá tus estudios: función renal, ecocardiograma y más",
                "Recordatorios de medicación, pagos y autorizaciones",
              ].map((t) => (
                <li key={t} className="flex gap-3"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" /> {t}</li>
              ))}
            </ul>
          </div>
          <Electro latidos={3} grilla={false} className="h-10 w-full max-w-md" />
        </div>
      </div>

      <div className="flex min-h-screen flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Volver al sitio</Link>
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="flex size-14 items-center justify-center rounded-2xl gradient-deep text-white shadow-lg"><KeyRound className="size-6" /></span>
          <h2 className="mt-6 text-3xl">Ingresá a tu portal</h2>
          <p className="mt-1 text-sm text-muted-foreground">Usá tu cédula y el código que te envió la clínica por WhatsApp.</p>
          <form onSubmit={ingresar} className="mt-8 space-y-4">
            <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Cédula o correo</span>
              <input autoFocus required value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Ej: 30123456" className={inp} /></label>
            <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Código de acceso o contraseña</span>
              <span className="relative block">
                <input required type={ver ? "text" : "password"} value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Código de 6 números" className={inp + " pr-11"} />
                <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? "Ocultar" : "Mostrar"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {ver ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
            </label>
            {error && <p className={`rounded-xl px-3 py-2.5 text-sm ring-1 ${TONO.rojo}`}>{error}</p>}
            <Button type="submit" disabled={cargando} className="btn-glow h-12 w-full rounded-xl">{cargando ? "Verificando…" : "Ingresar"}</Button>
          </form>
          <div className="mt-8 rounded-2xl border border-dashed border-border p-4 text-xs leading-relaxed text-muted-foreground">
            ¿Todavía no tenés código? La clínica te lo envía cuando habilita tu acceso.{" "}
            <a href={waLink("Hola, quiero acceso al Portal del paciente.")} target="_blank" rel="noreferrer" className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400">Pedilo por WhatsApp</a>.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================== */
/* Interior                                                                */
/* ===================================================================== */

type Ctx = {
  paciente: PacientePortal;
  turnos: TurnoClinica[];
  setTurnos: (fn: (p: TurnoClinica[]) => TurnoClinica[]) => void;
  auts: Autorizacion[];
  setAuts: (fn: (p: Autorizacion[]) => Autorizacion[]) => void;
  controles: Control[];
  setControles: (fn: (p: Control[]) => Control[]) => void;
  meds: Medicamento[];
  setMeds: (fn: (p: Medicamento[]) => Medicamento[]) => void;
  estudios: Estudio[];
  cobros: Cobro[];
  ir: (s: Seccion) => void;
};

function Interior({ paciente, onSalir, vista = false }: { paciente: PacientePortal; onSalir: () => void; vista?: boolean }) {
  const [sec, setSec] = useState<Seccion>("inicio");
  const [campana, setCampana] = useState(false);
  const [menu, setMenu] = useState(false);
  const [todosT, setTurnos] = useDato<TurnoClinica[]>(KEY_TURNOS, []);
  const [todasA, setAuts] = useDato<Autorizacion[]>(KEY_AUT, []);
  const [todosC, setControles] = useDato<Control[]>(KEY_CONTROLES, []);
  const [todosM, setMeds] = useDato<Medicamento[]>(KEY_MEDICACION, []);
  const [todosE] = useDato<Estudio[]>(KEY_ESTUDIOS, []);
  const [todosCob] = useDato<Cobro[]>(KEY_COBROS, []);

  const id = paciente.id;
  const ctx: Ctx = {
    paciente,
    turnos: todosT.filter((t) => t.pacienteId === id),
    setTurnos,
    auts: todasA.filter((a) => a.pacienteId === id),
    setAuts,
    controles: todosC.filter((c) => c.pacienteId === id).sort((a, b) => b.fecha.localeCompare(a.fecha)),
    setControles,
    meds: todosM.filter((m) => m.pacienteId === id),
    setMeds,
    estudios: todosE.filter((e) => e.pacienteId === id).sort((a, b) => b.fecha.localeCompare(a.fecha)),
    cobros: todosCob.filter((c) => !c.anulado && (c.pacienteId === id || (!!c.dni && c.dni === paciente.dni))),
    ir: (s) => {
      setSec(s);
      setCampana(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  };

  const avisos = useAvisos(ctx);
  const iniciales = paciente.nombre.split(" ").slice(0, 2).map((x) => x[0]).join("");
  const grupos = Array.from(new Set(SECCIONES.map((s) => s.grupo)));
  const badge = (s: Seccion) =>
    s === "autorizaciones" ? ctx.auts.filter((a) => a.estado === "Pendiente" && a.origen === "Clínica").length : s === "pagos" ? (ctx.cobros.some((c) => saldoDe(c) > 0) ? 1 : 0) : 0;

  const interiorSidebar = (
    <>
          <div className="flex items-center justify-between gap-2 px-6 pb-4 pt-6"><Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5"><img src={logoClinica} alt="" className="size-full object-cover" /></span>
            <span className="leading-tight"><span className="block text-sm font-bold">HEGO</span><span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Portal del paciente</span></span>
          </Link><button onClick={() => setMenu(false)} aria-label="Cerrar menú" className="rounded-lg p-2 text-muted-foreground hover:bg-secondary lg:hidden"><X className="size-5" /></button></div>
          <div className="mx-4 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 p-3 dark:bg-white/5">
            <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-violet-600 text-sm font-bold text-white shadow-md">{iniciales}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{paciente.nombre}</p>
              <p className="text-xs text-muted-foreground">C.C. {paciente.dni}</p>
            </div>
          </div>
          <nav className="pn-noscroll mt-4 flex-1 space-y-5 overflow-y-auto px-3 pb-4" style={{ scrollbarWidth: "none" }}>
            {grupos.map((g) => (
              <div key={g}>
                <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">{g}</p>
                {SECCIONES.filter((s) => s.grupo === g).map((s) => {
                  const on = sec === s.id;
                  const n = badge(s.id);
                  return (
                    <button key={s.id} onClick={() => { ctx.ir(s.id); setMenu(false); }}
                      className={`group mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${on ? "gradient-deep text-white shadow-[0_10px_24px_-10px_rgba(20,50,120,.8)]" : "text-muted-foreground hover:bg-secondary hover:text-foreground dark:hover:bg-white/5"}`}>
                      <s.icon className={`size-[18px] ${on ? "" : "transition-transform group-hover:scale-110"}`} />
                      <span className="flex-1 text-left">{s.label}</span>
                      {n > 0 && <span className={`rounded-full px-1.5 text-[10px] font-bold ${on ? "bg-white/25" : "bg-amber-400 text-amber-950"}`}>{s.id === "pagos" ? "!" : n}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="space-y-2 border-t border-border/60 p-4">
            <a href={waLink(`Hola, soy ${paciente.nombre} (C.C. ${paciente.dni}). Tengo una consulta.`)} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-[#25D366]/10 px-3 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-[#25D366]/20 dark:text-emerald-300">
              <MessageCircle className="size-4" /> Escribir a la clínica
            </a>
            <button onClick={onSalir} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600"><LogOut className="size-4" /> Salir</button>
          </div>
            </>
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb] dark:bg-[#070d1a]">
      {/* fondo */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 size-[520px] rounded-full bg-sky-400/15 blur-[120px] dark:bg-sky-500/10" />
        <div className="absolute -right-40 top-1/3 size-[460px] rounded-full bg-rose-400/10 blur-[120px] dark:bg-rose-500/10" />
        <div className="absolute bottom-0 left-1/3 size-[420px] rounded-full bg-violet-400/10 blur-[120px] dark:bg-violet-500/10" />
      </div>

      {vista && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-center text-sm font-semibold text-amber-950 shadow">
          <Eye className="mr-1.5 inline size-4 -translate-y-px" />
          Vista previa del portal {paciente.id === "__ejemplo" ? "con un paciente de ejemplo" : `de ${paciente.nombre}`}. Podés recorrerlo, pero no se guarda nada.
          <button onClick={onSalir} className="ml-3 rounded-lg bg-amber-950/10 px-2.5 py-0.5 text-xs hover:bg-amber-950/20">Cerrar vista</button>
        </div>
      )}

      <div className="relative lg:grid lg:grid-cols-[272px_1fr]">
        {/* Sidebar (escritorio) */}
        <aside className={`hidden border-r border-border/60 bg-card/70 backdrop-blur-xl lg:sticky lg:flex lg:h-screen lg:flex-col dark:bg-white/[0.03] ${vista ? "lg:top-10 lg:h-[calc(100vh-2.5rem)]" : "lg:top-0"}`}>
          {interiorSidebar}
        </aside>

        {/* Menú lateral (celular) */}
        {menu && (
          <div className="fixed inset-0 z-[80] lg:hidden">
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setMenu(false)} />
            <aside className="absolute inset-y-0 left-0 flex w-[86%] max-w-[320px] flex-col overflow-y-auto bg-background shadow-2xl animate-in slide-in-from-left duration-300 dark:bg-[#0b1324]">
              {interiorSidebar}
            </aside>
          </div>
        )}

        <div className="min-w-0">
          {/* Barra superior */}
          <header className={`sticky z-30 border-b border-border/50 bg-background/70 backdrop-blur-xl ${vista ? "top-10" : "top-0"}`}>
            <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-8">
              <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
                <button onClick={() => setMenu(true)} aria-label="Abrir menú" className="flex size-10 shrink-0 items-center justify-center rounded-xl gradient-deep text-white shadow-md"><Menu className="size-5" /></button>
                <span className="min-w-0 leading-tight"><span className="block truncate text-sm font-bold">{SECCIONES.find((x) => x.id === sec)?.label}</span><span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Mi portal</span></span>
              </div>
              <p className="hidden text-sm text-muted-foreground lg:block">
                <span className="capitalize">{new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}</span>
              </p>
              <div className="relative flex items-center gap-1">
                <ThemeToggle />
                <Button variant="ghost" size="icon" onClick={() => setCampana((v) => !v)} aria-label="Avisos" className="relative">
                  <Bell className="size-5" />
                  {avisos.length > 0 && <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">{avisos.length}</span>}
                </Button>
                <Button variant="ghost" size="icon" onClick={onSalir} aria-label="Salir" className="lg:hidden"><LogOut className="size-4" /></Button>
                {campana && (
                  <div className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <p className="border-b border-border px-4 py-3 text-sm font-semibold">Avisos</p>
                    {avisos.length === 0 && <p className="px-4 py-6 text-center text-sm text-muted-foreground">No tenés avisos nuevos.</p>}
                    {avisos.map((a, i) => (
                      <button key={i} onClick={() => ctx.ir(a.ir)} className="flex w-full gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-secondary/60">
                        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ${TONO[a.tono]}`}><a.icon className="size-4" /></span>
                        <span className="min-w-0"><span className="block text-sm font-medium">{a.titulo}</span><span className="block text-xs text-muted-foreground">{a.texto}</span></span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </header>

          <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-xl lg:hidden">
            <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
              {SECCIONES.filter((x) => ["inicio", "turnos", "controles", "estudios"].includes(x.id)).map((x) => {
                const on = sec === x.id;
                return (
                  <button key={x.id} onClick={() => ctx.ir(x.id)} className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition-colors ${on ? "text-primary dark:text-sky-400" : "text-muted-foreground"}`}>
                    <span className={`flex h-8 w-12 items-center justify-center rounded-full transition-all ${on ? "bg-primary/10 dark:bg-sky-400/15" : ""}`}><x.icon className="size-5" /></span>
                    {x.id === "controles" ? "Presión" : x.id === "estudios" ? "Estudios" : x.id === "turnos" ? "Turnos" : x.label}
                  </button>
                );
              })}
              <button onClick={() => setMenu(true)} className="relative flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold text-muted-foreground">
                <span className="flex h-8 w-12 items-center justify-center rounded-full"><Menu className="size-5" /></span>
                Más
                {(badge("autorizaciones") > 0 || badge("pagos") > 0) && <span className="absolute right-3 top-1 size-2 rounded-full bg-amber-400" />}
              </button>
            </div>
          </nav>

          <main key={sec} inert={vista} className="mx-auto max-w-6xl px-4 pb-28 pt-8 animate-in fade-in slide-in-from-bottom-3 duration-500 lg:px-8 lg:pb-8">
            {sec === "inicio" && <Inicio ctx={ctx} />}
            {sec === "turnos" && <Turnos ctx={ctx} />}
            {sec === "controles" && <Controles ctx={ctx} />}
            {sec === "medicacion" && <Medicacion ctx={ctx} />}
            {sec === "estudios" && <Estudios ctx={ctx} />}
            {sec === "pagos" && <Pagos ctx={ctx} />}
            {sec === "autorizaciones" && <Autorizaciones ctx={ctx} />}
            {sec === "ficha" && <Ficha ctx={ctx} />}
            <p className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-xs text-muted-foreground">
              <span>{CLINICA.nombre}</span>{sitioDe(leerDato(KEY_SITIO, {})).telefono && <span>{sitioDe(leerDato(KEY_SITIO, {})).telefono}</span>}<span>Ante una emergencia llamá al 107</span>
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}

/* ---------- Avisos (campana) ---------- */
function useAvisos(ctx: Ctx) {
  const out: { titulo: string; texto: string; icon: LucideIcon; tono: Tono; ir: Seccion }[] = [];
  const hoy = hoyIso();
  const prox = proximos(ctx.turnos)[0];
  if (prox) out.push({ titulo: `Turno ${cuandoFalta(prox.fecha, prox.hora)}`, texto: `${fechaCorta(prox.fecha)} ${prox.hora} · ${doctorDePanel(prox.doctor)?.nombre ?? prox.doctor}`, icon: CalendarCheck, tono: "azul", ir: "turnos" });
  ctx.auts.filter((a) => a.estado === "Pendiente" && a.origen === "Clínica").forEach((a) => out.push({ titulo: "Autorización pendiente", texto: a.titulo, icon: ShieldCheck, tono: "ambar", ir: "autorizaciones" }));
  ctx.auts
    .filter((a) => a.origen === "Paciente" && a.estado !== "Pendiente" && a.fechaRespuesta && Date.now() - new Date(a.fechaRespuesta).getTime() < 7 * 86400000)
    .forEach((a) => out.push({ titulo: a.estado === "Autorizada" ? "¡Te autorizaron!" : "Tu pedido fue rechazado", texto: a.titulo + (a.respuesta ? ` · ${a.respuesta}` : ""), icon: a.estado === "Autorizada" ? CheckCircle2 : Ban, tono: a.estado === "Autorizada" ? "verde" : "rojo", ir: "autorizaciones" }));
  const saldo = ctx.cobros.reduce((a, c) => a + saldoDe(c), 0);
  if (saldo > 0) out.push({ titulo: "Tenés un saldo pendiente", texto: ars(saldo), icon: Wallet, tono: "naranja", ir: "pagos" });
  const ahora = `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`;
  const faltan = ctx.meds.filter((m) => m.activo).flatMap((m) => m.horarios.filter((h) => h <= ahora && !m.tomas[`${hoy}|${h}`]).map((h) => `${m.nombre} ${h}`));
  if (faltan.length) out.push({ titulo: "Medicación sin marcar", texto: faltan.slice(0, 2).join(" · ") + (faltan.length > 2 ? "…" : ""), icon: Pill, tono: "violeta", ir: "medicacion" });
  const ult = ctx.controles[0];
  if (ult) {
    const c = clasificarPresion(ult.sistolica, ult.diastolica);
    if (c.tono === "rojo" || c.tono === "critico") out.push({ titulo: `Última presión: ${ult.sistolica}/${ult.diastolica}`, texto: c.nivel, icon: AlertTriangle, tono: "rojo", ir: "controles" });
  }
  const nuevo = ctx.estudios.find((e) => Date.now() - new Date(e.creado).getTime() < 7 * 86400000);
  if (nuevo) out.push({ titulo: "Nuevo resultado disponible", texto: nuevo.titulo, icon: FileText, tono: "verde", ir: "estudios" });
  return out;
}

/* ===================================================================== */
/* Componentes visuales                                                    */
/* ===================================================================== */

function Tarjeta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-3xl border border-border/70 bg-card/85 p-6 shadow-[0_1px_2px_rgba(15,23,42,.04),0_18px_40px_-22px_rgba(15,35,80,.25)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none ${className}`}>
      {children}
    </div>
  );
}

function Titulo({ icon: Icon, titulo, sub, accion }: { icon: LucideIcon; titulo: string; sub?: string; accion?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-2xl gradient-deep text-white shadow-[0_12px_24px_-12px_rgba(20,50,120,.9)]"><Icon className="size-5" /></span>
        <div>
          <h1 className="text-3xl leading-tight">{titulo}</h1>
          {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
        </div>
      </div>
      {accion}
    </div>
  );
}

function Subtitulo({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return <h2 className="mb-4 flex items-center gap-2 font-sans text-base font-semibold"><Icon className="size-[18px] text-primary dark:text-sky-400" /> {children}</h2>;
}

function Pastilla({ tono, children }: { tono: Tono; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${TONO[tono]}`}>{children}</span>;
}

function Sparkline({ valores, color, alto = 36 }: { valores: number[]; color: string; alto?: number }) {
  if (valores.length < 2) return <div style={{ height: alto }} />;
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const r = max - min || 1;
  const pts = valores.map((v, i) => `${(i / (valores.length - 1)) * 100},${alto - 4 - ((v - min) / r) * (alto - 8)}`).join(" ");
  return (
    <svg viewBox={`0 0 100 ${alto}`} preserveAspectRatio="none" className="w-full" style={{ height: alto }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Vacio({ icon: Icon, texto, accion }: { icon: LucideIcon; texto: string; accion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border p-8 text-center dark:border-white/10">
      <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground dark:bg-white/5"><Icon className="size-5" /></span>
      <p className="max-w-sm text-sm text-muted-foreground">{texto}</p>
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
}

const ESTADO_T: Record<TurnoClinica["estado"], Tono> = { Pendiente: "ambar", Confirmado: "azul", Atendido: "verde", Cancelado: "rojo" };

function proximos(turnos: TurnoClinica[]) {
  const h = hoyIso();
  return turnos.filter((t) => t.fecha >= h && (t.estado === "Pendiente" || t.estado === "Confirmado")).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
}

function FilaTurno({ t, onCancelar }: { t: TurnoClinica; onCancelar?: () => void }) {
  const d = doctorDePanel(t.doctor);
  const prep = preparacionPara(t.motivo);
  return (
    <div className="rounded-2xl border border-border/70 bg-background/50 p-4 transition-colors hover:bg-secondary/40 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex w-16 shrink-0 flex-col items-center rounded-2xl gradient-deep py-2 text-white shadow-md">
          <span className="text-[10px] font-semibold uppercase text-white/70">{new Date(t.fecha + "T12:00:00").toLocaleDateString("es-AR", { month: "short" }).replace(".", "")}</span>
          <span className="font-display text-2xl font-semibold leading-none">{Number(t.fecha.slice(8))}</span>
          <span className="text-[11px] tabular-nums">{t.hora}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{t.motivo.split(" · ")[0]}</p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            {d && <img src={fotoDoctor(d.foto)} alt="" className="size-5 rounded-full object-cover object-top" />}
            {d?.nombre ?? t.doctor}
          </p>
          <p className="text-xs capitalize text-muted-foreground">{fechaTxt(t.fecha)}</p>
        </div>
        <Pastilla tono={ESTADO_T[t.estado]}>{t.estado === "Pendiente" ? "A confirmar" : t.estado}</Pastilla>
        {onCancelar && (t.estado === "Pendiente" || t.estado === "Confirmado") && (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => descargarICS(t)} className="rounded-lg"><CalendarPlus className="size-4" /> Agendar</Button>
            <Button variant="ghost" size="sm" onClick={onCancelar} className="rounded-lg text-rose-600 hover:bg-rose-500/10 hover:text-rose-700"><X className="size-4" /> Cancelar</Button>
          </div>
        )}
      </div>
      {prep && onCancelar && (t.estado === "Pendiente" || t.estado === "Confirmado") && (
        <details className="group mt-3 rounded-xl bg-sky-500/5 px-4 py-2.5 ring-1 ring-sky-500/15">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold text-sky-700 dark:text-sky-300">
            <prep.icon className="size-4" /> Cómo prepararte: {prep.titulo} <ChevronDown className="ml-auto size-4 transition-transform group-open:rotate-180" />
          </summary>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">{prep.pasos.map((p) => <li key={p}>• {p}</li>)}</ul>
        </details>
      )}
    </div>
  );
}

/* ===================================================================== */
/* Inicio                                                                  */
/* ===================================================================== */

function Inicio({ ctx }: { ctx: Ctx }) {
  const prox = proximos(ctx.turnos);
  const p0 = prox[0];
  const ult = ctx.controles[0];
  const clase = ult ? clasificarPresion(ult.sistolica, ult.diastolica) : null;
  const ultimos = [...ctx.controles].slice(0, 10).reverse();
  const pesos = ctx.controles.filter((c) => c.peso).slice(0, 10).reverse();
  const pulso = ctx.controles.find((c) => c.pulso);
  const renal = ctx.estudios.find((e) => e.valores.egfr);
  const corazon = ctx.estudios.find((e) => e.valores.fevi);
  const hoy = hoyIso();
  const tomasHoy = ctx.meds.filter((m) => m.activo).flatMap((m) => m.horarios.map((h) => ({ m, h, ok: !!m.tomas[`${hoy}|${h}`] }))).sort((a, b) => a.h.localeCompare(b.h));
  const hechas = tomasHoy.filter((x) => x.ok).length;
  const pend = ctx.auts.filter((a) => a.estado === "Pendiente" && a.origen === "Clínica");
  const saldo = ctx.cobros.reduce((a, c) => a + saldoDe(c), 0);
  const hora = new Date().getHours();
  const d0 = p0 ? doctorDePanel(p0.doctor) : undefined;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2rem] gradient-deep p-7 text-white shadow-[0_30px_60px_-30px_rgba(10,30,80,.8)] sm:p-9">
        <div className="pn-cross pointer-events-none absolute inset-0 opacity-60" />
        <div className="blob -right-16 -top-16 size-72 bg-white/20" />
        <Electro latidos={3} grilla={false} className="pointer-events-none absolute inset-x-0 bottom-2 h-12 w-full" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="text-sm text-white/70">{hora < 12 ? "Buenos días" : hora < 20 ? "Buenas tardes" : "Buenas noches"}</p>
            <h1 className="text-3xl text-white sm:text-4xl">{ctx.paciente.nombre.split(" ")[0]}, ¿cómo te sentís hoy?</h1>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={() => ctx.ir("turnos")} className="rounded-full !bg-white px-5 text-[var(--deep)] hover:!bg-white/90"><CalendarPlus className="size-4" /> Sacar turno</Button>
              <Button onClick={() => ctx.ir("controles")} variant="outline" className="rounded-full !border-white/30 !bg-white/10 px-5 text-white hover:!bg-white/20 hover:text-white"><Gauge className="size-4" /> Registrar presión</Button>
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">Próximo turno</p>
            {p0 ? (
              <div className="mt-3 flex items-center gap-4">
                {d0 && <img src={fotoDoctor(d0.foto)} alt="" className="size-14 rounded-2xl object-cover object-top ring-2 ring-white/30" />}
                <div className="min-w-0">
                  <p className="font-semibold">{p0.motivo.split(" · ")[0]}</p>
                  <p className="text-sm capitalize text-white/80">{fechaTxt(p0.fecha)} · {p0.hora}</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-100"><Clock className="size-3" /> {cuandoFalta(p0.fecha, p0.hora)}</p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-white/80">No tenés turnos agendados.</p>
            )}
          </div>
        </div>
      </div>

      {/* Indicadores de salud */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button onClick={() => ctx.ir("controles")} className="text-left">
          <Tarjeta className="h-full !p-5 transition-transform hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Presión arterial</p>
              <span className="flex size-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400"><HeartPulse className="pn-beat size-4" /></span>
            </div>
            {ult && clase ? (
              <>
                <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{ult.sistolica}/{ult.diastolica} <span className="text-sm font-normal text-muted-foreground">mmHg</span></p>
                <div className="mt-2"><Pastilla tono={clase.tono}>{clase.nivel}</Pastilla></div>
                <div className="mt-3"><Sparkline valores={ultimos.map((c) => c.sistolica)} color="#f43f5e" /></div>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Registrá tu primera medición.</p>
            )}
          </Tarjeta>
        </button>
        <button onClick={() => ctx.ir("controles")} className="text-left">
          <Tarjeta className="h-full !p-5 transition-transform hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pulso y peso</p>
              <span className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400"><Scale className="size-4" /></span>
            </div>
            <div className="mt-2 flex items-baseline gap-4">
              <p className="font-display text-3xl font-semibold tabular-nums">{pulso?.pulso ?? "—"} <span className="text-sm font-normal text-muted-foreground">lpm</span></p>
              <p className="font-display text-xl font-semibold tabular-nums text-muted-foreground">{pesos.length ? `${pesos[pesos.length - 1]!.peso} kg` : ""}</p>
            </div>
            {pesos.length >= 2 && (() => {
              const dif = (pesos[pesos.length - 1]!.peso ?? 0) - (pesos[0]!.peso ?? 0);
              return <p className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${Math.abs(dif) >= 2 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>{dif >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />} {dif > 0 ? "+" : ""}{dif.toFixed(1)} kg en tus registros</p>;
            })()}
            <div className="mt-3"><Sparkline valores={pesos.map((c) => c.peso ?? 0)} color="#0ea5e9" /></div>
          </Tarjeta>
        </button>
        <button onClick={() => ctx.ir("estudios")} className="text-left">
          <Tarjeta className="h-full !p-5 transition-transform hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Función renal</p>
              <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400"><Droplets className="size-4" /></span>
            </div>
            {renal?.valores.egfr ? (() => {
              const e = estadioRenal(renal.valores.egfr);
              return (
                <>
                  <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{renal.valores.egfr} <span className="text-sm font-normal text-muted-foreground">ml/min</span></p>
                  <div className="mt-2"><Pastilla tono={e.tono}>Estadio {e.estadio}</Pastilla></div>
                  <p className="mt-2 text-xs text-muted-foreground">{fechaCorta(renal.fecha)} · filtrado glomerular</p>
                </>
              );
            })() : <p className="mt-3 text-sm text-muted-foreground">Cuando la clínica cargue tu análisis renal lo vas a ver acá.</p>}
          </Tarjeta>
        </button>
        <button onClick={() => ctx.ir("estudios")} className="text-left">
          <Tarjeta className="h-full !p-5 transition-transform hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Corazón</p>
              <span className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400"><Activity className="size-4" /></span>
            </div>
            {corazon?.valores.fevi ? (() => {
              const f = clasificarFevi(corazon.valores.fevi);
              return (
                <>
                  <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{corazon.valores.fevi}% <span className="text-sm font-normal text-muted-foreground">FEVI</span></p>
                  <div className="mt-2"><Pastilla tono={f.tono}>{f.texto}</Pastilla></div>
                  <p className="mt-2 text-xs text-muted-foreground">{fechaCorta(corazon.fecha)} · {corazon.tipo}</p>
                </>
              );
            })() : <p className="mt-3 text-sm text-muted-foreground">Tus resultados de ecocardiograma aparecen acá.</p>}
          </Tarjeta>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Tarjeta>
          <div className="mb-4 flex items-center justify-between">
            <Subtitulo icon={Pill}>Medicación de hoy</Subtitulo>
            {tomasHoy.length > 0 && <span className="text-sm font-semibold tabular-nums text-muted-foreground">{hechas}/{tomasHoy.length}</span>}
          </div>
          {tomasHoy.length === 0 ? (
            <Vacio icon={Pill} texto="Cargá tus medicamentos y te recordamos cada toma." accion={<Button onClick={() => ctx.ir("medicacion")} className="rounded-xl"><Plus className="size-4" /> Agregar medicación</Button>} />
          ) : (
            <>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-secondary dark:bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700" style={{ width: `${(hechas / tomasHoy.length) * 100}%` }} /></div>
              <div className="space-y-2">
                {tomasHoy.map(({ m, h, ok }) => (
                  <button key={m.id + h} onClick={() => ctx.setMeds((l) => l.map((x) => (x.id === m.id ? { ...x, tomas: { ...x.tomas, [`${hoy}|${h}`]: !ok } } : x)))}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all ${ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/70 hover:bg-secondary/50 dark:border-white/10"}`}>
                    <span className={`flex size-7 items-center justify-center rounded-full border-2 transition-all ${ok ? "border-emerald-500 bg-emerald-500 text-white" : "border-border"}`}>{ok && <Check className="size-4" />}</span>
                    <span className="w-12 text-sm font-semibold tabular-nums">{h}</span>
                    <span className={`flex-1 text-sm ${ok ? "text-muted-foreground line-through" : "font-medium"}`}>{m.nombre} <span className="text-muted-foreground">· {m.dosis}</span></span>
                  </button>
                ))}
              </div>
            </>
          )}
        </Tarjeta>

        <div className="space-y-6">
          <Tarjeta>
            <Subtitulo icon={Bell}>Para hacer</Subtitulo>
            <div className="space-y-2">
              {pend.length === 0 && saldo === 0 && <p className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ring-1 ${TONO.verde}`}><CheckCircle2 className="size-4" /> Estás al día.</p>}
              {pend.map((a) => (
                <button key={a.id} onClick={() => ctx.ir("autorizaciones")} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ring-1 ${TONO.ambar}`}>
                  <KeyRound className="size-4 shrink-0" /><span className="min-w-0 text-sm"><b className="block truncate">{a.titulo}</b>Necesita tu autorización</span>
                </button>
              ))}
              {saldo > 0 && (
                <button onClick={() => ctx.ir("pagos")} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ring-1 ${TONO.naranja}`}>
                  <Wallet className="size-4 shrink-0" /><span className="text-sm"><b className="block">Saldo pendiente {ars(saldo)}</b>Ver detalle</span>
                </button>
              )}
            </div>
          </Tarjeta>
          <Tarjeta>
            <Subtitulo icon={Stethoscope}>Consejos de tus médicos</Subtitulo>
            <ul className="space-y-3 text-sm">
              {[
                { i: HeartPulse, c: "text-rose-500", t: "Medí tu presión siempre a la misma hora, sentado y después de 5 minutos de reposo." },
                { i: Droplets, c: "text-sky-500", t: "Cuidá tus riñones: evitá los antiinflamatorios sin indicación médica y moderá la sal." },
                { i: Scale, c: "text-amber-500", t: "Si subís más de 2 kg en pocos días o se te hinchan los pies, avisale a tu médico." },
              ].map((x) => (
                <li key={x.t} className="flex gap-3"><x.i className={`mt-0.5 size-4 shrink-0 ${x.c}`} /><span className="text-muted-foreground">{x.t}</span></li>
              ))}
            </ul>
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================== */
/* Turnos                                                                  */
/* ===================================================================== */

function Turnos({ ctx }: { ctx: Ctx }) {
  const [agendas] = useDato<Agendas>(KEY_AGENDA, {});
  const [propios] = useDato<TurnoClinica[]>(KEY_TURNOS, []);
  const [ajenos, setAjenos] = useState<TurnoClinica[]>([]);
  useEffect(() => {
    // Con backend el paciente solo ve sus turnos: los horarios tomados por otros vienen aparte
    void ocupadosServidor(isoDe(new Date())).then((r) => r && setAjenos(r.map((x, i) => ({ id: `o${i}`, ...x, paciente: "", motivo: "", estado: "Pendiente" as const }))));
  }, [propios.length]);
  const todos = useMemo(() => [...propios, ...ajenos], [propios, ajenos]);
  const [pidiendo, setPidiendo] = useState(false);
  const [esp, setEsp] = useState("");
  const [doc, setDoc] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [nota, setNota] = useState("");

  const especialidad = ESPECIALIDADES.find((e) => e.slug === esp);
  const doctores = especialidad ? DOCTORS.filter((d) => especialidad.doctorIds.includes(d.id)) : [];
  const doctor = DOCTORS.find((d) => d.id === doc);
  const agenda = doctor ? agendaDe(agendas, doctor.foto) : null;
  const dias = agenda ? proximosDias(agenda, 14) : [];
  const libres = useMemo(() => {
    if (!agenda || !doctor || !fecha || !atiendeEl(agenda, fecha)) return [] as { h: string; libre: boolean }[];
    const nom = nombrePanel(doctor.id);
    const ahora = new Date();
    const hhmm = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
    return horariosDelDia(agenda).map((h) => ({ h, libre: !todos.some((t) => t.doctor === nom && t.fecha === fecha && t.hora === h && t.estado !== "Cancelado") && !(fecha === isoDe(ahora) && h <= hhmm) }));
  }, [agenda, doctor, fecha, todos]);

  const reset = () => { setPidiendo(false); setEsp(""); setDoc(""); setFecha(""); setHora(""); setNota(""); };

  const confirmar = () => {
    if (!doctor || !especialidad || !fecha || !hora) return;
    const nom = nombrePanel(doctor.id);
    if (todos.some((t) => t.doctor === nom && t.fecha === fecha && t.hora === hora && t.estado !== "Cancelado")) {
      toast.error("Ese horario se acaba de ocupar. Elegí otro.");
      setHora("");
      return;
    }
    const nuevo: TurnoClinica = {
      id: nuevoId(), fecha, hora, paciente: ctx.paciente.nombre, doctor: nom,
      motivo: especialidad.nombre + (nota.trim() ? ` · ${nota.trim()}` : ""), estado: "Pendiente",
      telefono: ctx.paciente.telefono, email: ctx.paciente.email, origen: "portal", pacienteId: ctx.paciente.id,
    };
    ctx.setTurnos((p) => [...p, nuevo]);
    auditar(ctx.paciente.nombre, "Turno pedido desde el portal", `${fechaCorta(fecha)} ${hora} · ${nom}`);
    toast.success("¡Turno pedido! La clínica te lo confirma.");
    reset();
  };

  const cancelar = (t: TurnoClinica) => {
    ctx.setTurnos((p) => p.map((x) => (x.id === t.id ? { ...x, estado: "Cancelado" } : x)));
    auditar(ctx.paciente.nombre, "Turno cancelado desde el portal", `${fechaCorta(t.fecha)} ${t.hora} · ${t.doctor}`);
    toast.success("Turno cancelado. El horario quedó libre.");
  };

  const prox = proximos(ctx.turnos);
  const historial = ctx.turnos.filter((t) => !prox.includes(t)).sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora));
  const paso = (n: number, t: string) => <p className="mb-2 mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><span className="flex size-5 items-center justify-center rounded-full gradient-deep text-[10px] text-white">{n}</span> {t}</p>;

  return (
    <div className="space-y-6">
      <Titulo icon={CalendarDays} titulo="Mis turnos" sub="Pedí, agendá y cancelá tus turnos. Te mostramos cómo prepararte para cada estudio."
        accion={!pidiendo && <Button onClick={() => setPidiendo(true)} className="btn-glow rounded-full px-6"><CalendarPlus className="size-4" /> Pedir turno</Button>} />

      {pidiendo && (
        <Tarjeta className="animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-lg font-semibold">Nuevo turno</h2>
            <Button variant="ghost" size="icon" onClick={reset} aria-label="Cerrar"><X className="size-4" /></Button>
          </div>
          {paso(1, "Especialidad")}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ESPECIALIDADES.map((e) => {
              const I = iconoEspecialidad(e.icono);
              const on = esp === e.slug;
              return (
                <button key={e.slug} onClick={() => { setEsp(e.slug); setDoc(""); setFecha(""); setHora(""); }} className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm font-medium transition-all ${on ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-border hover:border-primary/30 dark:border-white/10"}`}>
                  <span className={`flex size-9 items-center justify-center rounded-lg ${on ? "gradient-deep text-white" : "bg-secondary text-primary dark:bg-white/5 dark:text-sky-400"}`}><I className="size-4" /></span>{e.nombre}
                </button>
              );
            })}
          </div>
          {especialidad && (
            <>
              {paso(2, "Profesional")}
              <div className="grid gap-3 sm:grid-cols-2">
                {doctores.map((d) => {
                  const ag = agendaDe(agendas, d.foto);
                  return (
                    <button key={d.id} disabled={!ag.activo} onClick={() => { setDoc(d.id); setFecha(""); setHora(""); }} className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all disabled:opacity-50 ${doc === d.id ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-border hover:border-primary/30 dark:border-white/10"}`}>
                      <img src={fotoDoctor(d.foto)} alt="" className="size-14 rounded-xl object-cover object-top" />
                      <span className="min-w-0"><span className="block font-semibold leading-tight">{d.nombre}</span><span className="block text-xs text-muted-foreground">{resumenAgenda(ag)}</span></span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {agenda && (
            <>
              {paso(3, "Día y horario")}
              {agenda.nota && <p className={`mb-2 rounded-xl px-3 py-2 text-xs ring-1 ${TONO.ambar}`}>{agenda.nota}</p>}
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {dias.length === 0 && <p className="text-sm text-muted-foreground">No hay días disponibles por ahora.</p>}
                {dias.map((f) => {
                  const d = new Date(f + "T12:00:00");
                  return (
                    <button key={f} onClick={() => { setFecha(f); setHora(""); }} className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border py-2.5 transition-all ${fecha === f ? "border-transparent gradient-deep text-white shadow-lg" : "border-border hover:border-primary/40 dark:border-white/10"}`}>
                      <span className="text-[10px] font-semibold uppercase opacity-70">{d.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "")}</span>
                      <span className="font-display text-xl font-semibold">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
              {fecha && (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {libres.map(({ h, libre }) => (
                    <button key={h} disabled={!libre} onClick={() => setHora(h)} className={`rounded-xl border py-2.5 text-sm font-semibold tabular-nums transition-all ${!libre ? "border-border bg-secondary/40 text-muted-foreground/40 line-through dark:border-white/5 dark:bg-white/[0.02]" : hora === h ? "border-transparent gradient-deep text-white shadow-md" : "border-border hover:border-primary/50 dark:border-white/10"}`}>{h}</button>
                  ))}
                </div>
              )}
            </>
          )}
          {hora && (
            <div className="mt-6 space-y-3 animate-in fade-in duration-300">
              <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Motivo o comentario (opcional)" className={inp} />
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/60 p-4 dark:bg-white/5">
                <p className="text-sm"><b className="capitalize">{fechaTxt(fecha)}</b> a las <b>{hora}</b> con {doctor?.nombre}</p>
                <Button onClick={confirmar} className="btn-glow rounded-xl"><Check className="size-4" /> Confirmar pedido</Button>
              </div>
            </div>
          )}
        </Tarjeta>
      )}

      <Tarjeta>
        <Subtitulo icon={CalendarCheck}>Próximos</Subtitulo>
        <div className="space-y-3">
          {prox.length === 0 && <Vacio icon={CalendarDays} texto="No tenés turnos próximos." />}
          {prox.map((t) => <FilaTurno key={t.id} t={t} onCancelar={() => cancelar(t)} />)}
        </div>
      </Tarjeta>

      {historial.length > 0 && (
        <Tarjeta>
          <Subtitulo icon={Clock}>Historial de consultas</Subtitulo>
          <div className="space-y-3 opacity-90">{historial.map((t) => <FilaTurno key={t.id} t={t} />)}</div>
        </Tarjeta>
      )}
    </div>
  );
}

/* ===================================================================== */
/* Presión y peso                                                          */
/* ===================================================================== */

function GraficoPresion({ datos }: { datos: Control[] }) {
  const W = 640;
  const H = 220;
  const P = 28;
  const lista = [...datos].slice(0, 20).reverse();
  if (lista.length < 2) return <Vacio icon={Activity} texto="Con dos mediciones o más vas a ver tu gráfico de evolución." />;
  const min = 50;
  const max = Math.max(190, ...lista.map((d) => d.sistolica + 10));
  const x = (i: number) => P + (i * (W - P * 2)) / (lista.length - 1);
  const y = (v: number) => H - P - ((v - min) / (max - min)) * (H - P * 2);
  const linea = (k: "sistolica" | "diastolica") => lista.map((d, i) => `${i ? "L" : "M"} ${x(i)} ${y(d[k])}`).join(" ");
  return (
    <div className="overflow-hidden rounded-2xl bg-slate-950 p-3 ring-1 ring-white/10">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-56 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fb7185" stopOpacity=".35" /><stop offset="100%" stopColor="#fb7185" stopOpacity="0" /></linearGradient>
        </defs>
        {/* franjas de referencia */}
        <rect x={P} y={y(140)} width={W - P * 2} height={y(130) - y(140)} fill="#f97316" opacity=".08" />
        <rect x={P} y={y(max)} width={W - P * 2} height={y(140) - y(max)} fill="#ef4444" opacity=".08" />
        {[80, 120, 140].map((v) => (
          <g key={v}>
            <line x1={P} x2={W - P} y1={y(v)} y2={y(v)} stroke="#94a3b8" strokeOpacity=".25" strokeDasharray="4 6" />
            <text x={4} y={y(v) + 4} fill="#94a3b8" fontSize="11">{v}</text>
          </g>
        ))}
        <path d={`${linea("sistolica")} L ${x(lista.length - 1)} ${H - P} L ${x(0)} ${H - P} Z`} fill="url(#gs)" className="pn-area" />
        <path d={linea("sistolica")} fill="none" stroke="#fb7185" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="pn-draw" style={{ ["--len" as string]: 2000 }} />
        <path d={linea("diastolica")} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="pn-draw" style={{ ["--len" as string]: 2000, animationDelay: ".2s" }} />
        {lista.map((d, i) => (
          <g key={d.id}>
            <circle cx={x(i)} cy={y(d.sistolica)} r="4" fill="#0f172a" stroke="#fb7185" strokeWidth="2" />
            <circle cx={x(i)} cy={y(d.diastolica)} r="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
          </g>
        ))}
      </svg>
      <div className="flex justify-center gap-5 pb-1 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-rose-400" /> Sistólica (máxima)</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-sky-400" /> Diastólica (mínima)</span>
      </div>
    </div>
  );
}

function Controles({ ctx }: { ctx: Ctx }) {
  const ahoraLocal = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };
  const [f, setF] = useState({ sistolica: "", diastolica: "", pulso: "", peso: "", nota: "", fecha: ahoraLocal() });
  const s = Number(f.sistolica);
  const d = Number(f.diastolica);
  const preview = s && d ? clasificarPresion(s, d) : null;
  const semana = ctx.controles.filter((c) => Date.now() - new Date(c.fecha).getTime() < 7 * 86400000);
  const prom = (k: "sistolica" | "diastolica") => (semana.length ? Math.round(semana.reduce((a, c) => a + c[k], 0) / semana.length) : 0);
  const enRango = semana.length ? Math.round((semana.filter((c) => c.sistolica < 130 && c.diastolica < 80).length / semana.length) * 100) : 0;

  const guardar = (e: FormEvent) => {
    e.preventDefault();
    if (s < 60 || s > 260 || d < 30 || d > 160 || d >= s) {
      toast.error("Revisá los valores: la máxima tiene que ser mayor que la mínima.");
      return;
    }
    const nuevo: Control = {
      id: nuevoId(),
      pacienteId: ctx.paciente.id,
      fecha: new Date(f.fecha).toISOString(),
      sistolica: s,
      diastolica: d,
      ...(f.pulso ? { pulso: Number(f.pulso) } : {}),
      ...(f.peso ? { peso: Number(f.peso) } : {}),
      ...(f.nota.trim() ? { nota: f.nota.trim() } : {}),
    };
    ctx.setControles((l) => [nuevo, ...l]);
    const c = clasificarPresion(s, d);
    if (c.tono === "critico") toast.error(`${c.nivel}. ${c.consejo}`, { duration: 12000 });
    else toast.success(`Registrado: ${c.nivel}.`);
    setF({ sistolica: "", diastolica: "", pulso: "", peso: f.peso, nota: "", fecha: ahoraLocal() });
  };

  return (
    <div className="space-y-6">
      <Titulo icon={Gauge} titulo="Presión y peso" sub="Tus mediciones en casa ayudan a tus médicos a ajustar el tratamiento." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Tarjeta>
          <Subtitulo icon={Plus}>Nueva medición</Subtitulo>
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Máxima (sistólica)</span>
                <input required type="number" inputMode="numeric" placeholder="120" value={f.sistolica} onChange={(e) => setF({ ...f, sistolica: e.target.value })} className={inp + " text-center font-display text-2xl font-semibold"} /></label>
              <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Mínima (diastólica)</span>
                <input required type="number" inputMode="numeric" placeholder="80" value={f.diastolica} onChange={(e) => setF({ ...f, diastolica: e.target.value })} className={inp + " text-center font-display text-2xl font-semibold"} /></label>
              <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Pulso (lpm)</span>
                <input type="number" inputMode="numeric" placeholder="72" value={f.pulso} onChange={(e) => setF({ ...f, pulso: e.target.value })} className={inp} /></label>
              <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Peso (kg)</span>
                <input type="number" step="0.1" inputMode="decimal" placeholder="Opcional" value={f.peso} onChange={(e) => setF({ ...f, peso: e.target.value })} className={inp} /></label>
            </div>
            <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Fecha y hora</span>
              <input type="datetime-local" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} className={inp} /></label>
            <input placeholder="¿Algún síntoma? (opcional)" value={f.nota} onChange={(e) => setF({ ...f, nota: e.target.value })} className={inp} />
            {preview && (
              <div className={`rounded-2xl p-4 ring-1 animate-in fade-in duration-200 ${TONO[preview.tono]}`}>
                <p className="font-semibold">{preview.nivel}</p>
                <p className="text-xs opacity-90">{preview.consejo}</p>
              </div>
            )}
            <Button type="submit" className="btn-glow h-12 w-full rounded-xl"><Check className="size-4" /> Guardar medición</Button>
          </form>
        </Tarjeta>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { l: "Promedio 7 días", v: semana.length ? `${prom("sistolica")}/${prom("diastolica")}` : "—" },
              { l: "En rango", v: semana.length ? `${enRango}%` : "—" },
              { l: "Mediciones", v: String(ctx.controles.length) },
            ].map((x) => (
              <Tarjeta key={x.l} className="!p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{x.l}</p>
                <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{x.v}</p>
              </Tarjeta>
            ))}
          </div>
          <Tarjeta className="!p-4"><GraficoPresion datos={ctx.controles} /></Tarjeta>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Tarjeta>
          <Subtitulo icon={Clock}>Historial</Subtitulo>
          {ctx.controles.length === 0 && <Vacio icon={Gauge} texto="Todavía no registraste mediciones." />}
          <div className="space-y-2">
            {ctx.controles.slice(0, 30).map((c) => {
              const k = clasificarPresion(c.sistolica, c.diastolica);
              return (
                <div key={c.id} className="group flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 p-3 dark:border-white/10">
                  <span className="w-28 text-xs text-muted-foreground">{fechaHoraTxt(c.fecha)}</span>
                  <span className="font-display text-lg font-semibold tabular-nums">{c.sistolica}/{c.diastolica}</span>
                  {c.pulso && <span className="text-xs text-muted-foreground">{c.pulso} lpm</span>}
                  {c.peso && <span className="text-xs text-muted-foreground">{c.peso} kg</span>}
                  <span className="ml-auto"><Pastilla tono={k.tono}>{k.nivel}</Pastilla></span>
                  <button onClick={() => ctx.setControles((l) => l.filter((x) => x.id !== c.id))} aria-label="Borrar" className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-rose-600 group-hover:opacity-100"><Trash2 className="size-4" /></button>
                  {c.nota && <p className="w-full pl-28 text-xs text-muted-foreground">“{c.nota}”</p>}
                </div>
              );
            })}
          </div>
        </Tarjeta>
        <Tarjeta>
          <Subtitulo icon={HeartPulse}>Cómo medirte bien</Subtitulo>
          <ol className="space-y-3 text-sm text-muted-foreground">
            {[
              "No fumes, no tomes café ni hagas ejercicio 30 minutos antes.",
              "Sentate 5 minutos con la espalda apoyada y los pies en el piso.",
              "Brazo apoyado a la altura del corazón, sin ropa ajustada.",
              "Tomá 2 mediciones con 1 minuto de diferencia y registrá ambas.",
              "Medite a la mañana antes de la medicación y a la noche.",
            ].map((t, i) => (
              <li key={t} className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full gradient-deep text-[11px] font-bold text-white">{i + 1}</span>{t}</li>
            ))}
          </ol>
          <p className={`mt-5 rounded-2xl p-3 text-xs ring-1 ${TONO.rojo}`}><AlertTriangle className="mr-1 inline size-3.5" /> Si tenés dolor de pecho, falta de aire o la presión supera 180/120, llamá al 107.</p>
        </Tarjeta>
      </div>
    </div>
  );
}

/* ===================================================================== */
/* Medicación                                                              */
/* ===================================================================== */

function Medicacion({ ctx }: { ctx: Ctx }) {
  const [f, setF] = useState({ nombre: "", dosis: "", indicacion: "", horarios: ["08:00"] as string[], nuevaHora: "20:00" });
  const hoy = hoyIso();
  const ultimos7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return isoDe(d);
  });
  const activos = ctx.meds.filter((m) => m.activo);
  const esperadas = activos.reduce((a, m) => a + m.horarios.length * 7, 0);
  const tomadas = activos.reduce((a, m) => a + ultimos7.reduce((b, dia) => b + m.horarios.filter((h) => m.tomas[`${dia}|${h}`]).length, 0), 0);
  const adherencia = esperadas ? Math.round((tomadas / esperadas) * 100) : 0;

  const agregar = (e: FormEvent) => {
    e.preventDefault();
    if (f.horarios.length === 0) {
      toast.error("Agregá al menos un horario.");
      return;
    }
    const m: Medicamento = { id: nuevoId(), pacienteId: ctx.paciente.id, nombre: f.nombre.trim(), dosis: f.dosis.trim(), indicacion: f.indicacion.trim(), horarios: [...f.horarios].sort(), activo: true, tomas: {} };
    ctx.setMeds((l) => [...l, m]);
    toast.success("Medicamento agregado.");
    setF({ nombre: "", dosis: "", indicacion: "", horarios: ["08:00"], nuevaHora: "20:00" });
  };

  const marcar = (m: Medicamento, h: string) => {
    const k = `${hoy}|${h}`;
    ctx.setMeds((l) => l.map((x) => (x.id === m.id ? { ...x, tomas: { ...x.tomas, [k]: !x.tomas[k] } } : x)));
  };

  return (
    <div className="space-y-6">
      <Titulo icon={Pill} titulo="Medicación" sub="Tus remedios y recordatorios de cada toma." />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Tarjeta>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Subtitulo icon={CalendarCheck}>Hoy</Subtitulo>
              <div className="flex items-center gap-3">
                <div className="relative size-14">
                  <svg viewBox="0 0 36 36" className="size-14 -rotate-90"><circle cx="18" cy="18" r="15" fill="none" className="stroke-secondary dark:stroke-white/10" strokeWidth="4" /><circle cx="18" cy="18" r="15" fill="none" stroke="url(#ga)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(adherencia / 100) * 94.2} 94.2`} className="pn-donut" /><defs><linearGradient id="ga"><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#0ea5e9" /></linearGradient></defs></svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{adherencia}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Cumplimiento<br />últimos 7 días</p>
              </div>
            </div>
            {activos.length === 0 && <Vacio icon={Pill} texto="Agregá tus medicamentos para recibir recordatorios." />}
            <div className="space-y-3">
              {activos.map((m) => (
                <div key={m.id} className="rounded-2xl border border-border/60 p-4 dark:border-white/10">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300"><Pill className="size-5" /></span>
                    <div className="min-w-0 flex-1"><p className="font-semibold">{m.nombre} <span className="font-normal text-muted-foreground">· {m.dosis}</span></p>{m.indicacion && <p className="text-xs text-muted-foreground">{m.indicacion}</p>}</div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 pl-[52px]">
                    {m.horarios.map((h) => {
                      const ok = !!m.tomas[`${hoy}|${h}`];
                      return (
                        <button key={h} onClick={() => marcar(m, h)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${ok ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30" : "bg-secondary text-foreground hover:bg-secondary/70 dark:bg-white/5"}`}>
                          {ok ? <CheckCircle2 className="size-4" /> : <Clock className="size-4" />} {h}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Tarjeta>
          {ctx.meds.length > 0 && (
            <Tarjeta>
              <Subtitulo icon={FileText}>Mis medicamentos</Subtitulo>
              <div className="space-y-2">
                {ctx.meds.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border/60 p-3 text-sm dark:border-white/10">
                    <span className={`size-2 rounded-full ${m.activo ? "bg-emerald-500" : "bg-slate-400"}`} />
                    <span className="flex-1">{m.nombre} · {m.dosis} · {m.horarios.join(", ")}</span>
                    <button onClick={() => ctx.setMeds((l) => l.map((x) => (x.id === m.id ? { ...x, activo: !x.activo } : x)))} className="rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary">{m.activo ? "Pausar" : "Reanudar"}</button>
                    <button onClick={() => ctx.setMeds((l) => l.filter((x) => x.id !== m.id))} aria-label="Eliminar" className="rounded-lg p-1.5 text-muted-foreground hover:text-rose-600"><Trash2 className="size-4" /></button>
                  </div>
                ))}
              </div>
            </Tarjeta>
          )}
        </div>

        <Tarjeta>
          <Subtitulo icon={Plus}>Agregar medicamento</Subtitulo>
          <form onSubmit={agregar} className="space-y-4">
            <input required placeholder="Nombre (ej: Enalapril)" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} className={inp} />
            <input required placeholder="Dosis (ej: 10 mg, 1 comprimido)" value={f.dosis} onChange={(e) => setF({ ...f, dosis: e.target.value })} className={inp} />
            <input placeholder="Indicación (ej: con el desayuno)" value={f.indicacion} onChange={(e) => setF({ ...f, indicacion: e.target.value })} className={inp} />
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Horarios</p>
              <div className="flex flex-wrap gap-2">
                {f.horarios.map((h) => (
                  <span key={h} className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-1.5 text-sm font-semibold tabular-nums dark:bg-white/5">{h}
                    <button type="button" onClick={() => setF({ ...f, horarios: f.horarios.filter((x) => x !== h) })} aria-label="Quitar"><X className="size-3.5" /></button>
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input type="time" value={f.nuevaHora} onChange={(e) => setF({ ...f, nuevaHora: e.target.value })} className={inp + " h-10"} />
                <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={() => f.nuevaHora && !f.horarios.includes(f.nuevaHora) && setF({ ...f, horarios: [...f.horarios, f.nuevaHora] })}><Plus className="size-4" /> Hora</Button>
              </div>
            </div>
            <Button type="submit" className="h-12 w-full rounded-xl"><Check className="size-4" /> Guardar</Button>
            <p className={`rounded-2xl p-3 text-xs ring-1 ${TONO.azul}`}>Nunca suspendas ni cambies la dosis sin hablar con tu médico. Llevá esta lista a cada consulta.</p>
          </form>
        </Tarjeta>
      </div>
    </div>
  );
}

/* ===================================================================== */
/* Estudios                                                                */
/* ===================================================================== */

function imprimirEstudio(e: Estudio, paciente: PacientePortal) {
  const w = window.open("", "_blank", "width=760,height=900");
  if (!w) return;
  const v = e.valores;
  const filas = [
    v.creatinina !== undefined && ["Creatinina", `${v.creatinina} mg/dl`],
    v.egfr !== undefined && ["Filtrado glomerular (eGFR)", `${v.egfr} ml/min/1,73m²`],
    v.urea !== undefined && ["Urea", `${v.urea} mg/dl`],
    v.potasio !== undefined && ["Potasio", `${v.potasio} mEq/l`],
    v.proteinuria !== undefined && ["Proteinuria", `${v.proteinuria} mg/24h`],
    v.hemoglobina !== undefined && ["Hemoglobina", `${v.hemoglobina} g/dl`],
    v.ldl !== undefined && ["Colesterol LDL", `${v.ldl} mg/dl`],
    v.fevi !== undefined && ["Fracción de eyección (FEVI)", `${v.fevi} %`],
  ].filter(Boolean) as string[][];
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${e.titulo}</title><style>body{font-family:system-ui,sans-serif;color:#0f172a;padding:40px}h1{font-size:20px;margin:0}td{border-bottom:1px solid #e2e8f0;padding:8px;font-size:14px}.m{color:#64748b;font-size:13px}</style></head><body>
  <h1>${CLINICA.nombre}</h1><p class="m">${e.tipo} · ${fechaCorta(e.fecha)}</p>
  <p><b>Paciente:</b> ${paciente.nombre} · C.C. ${paciente.dni}</p><h2 style="font-size:17px">${e.titulo}</h2>
  ${filas.length ? `<table>${filas.map((f) => `<tr><td>${f[0]}</td><td><b>${f[1]}</b></td></tr>`).join("")}</table>` : ""}
  <p style="white-space:pre-line">${e.informe}</p><p class="m">Cargado por ${e.cargadoPor}</p><script>window.print()</script></body></html>`);
  w.document.close();
}

function Valor({ label, valor, unidad, tono, nota }: { label: string; valor: number; unidad: string; tono: Tono; nota?: string }) {
  return (
    <div className={`rounded-2xl p-3 ring-1 ${TONO[tono]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</p>
      <p className="font-display text-xl font-semibold tabular-nums">{valor} <span className="text-xs font-normal opacity-80">{unidad}</span></p>
      {nota && <p className="text-[11px] opacity-90">{nota}</p>}
    </div>
  );
}

function Estudios({ ctx }: { ctx: Ctx }) {
  const [filtro, setFiltro] = useState<"todos" | "renal" | "cardio">("todos");
  const esRenal = (e: Estudio) => /renal|orina|laboratorio/i.test(e.tipo) || e.valores.egfr !== undefined || e.valores.creatinina !== undefined;
  const lista = ctx.estudios.filter((e) => filtro === "todos" || (filtro === "renal" ? esRenal(e) : !esRenal(e)));
  const egfrs = [...ctx.estudios].filter((e) => e.valores.egfr !== undefined).reverse();

  return (
    <div className="space-y-6">
      <Titulo icon={FileText} titulo="Estudios y resultados" sub="Tus análisis e informes de nefrología y cardiología, explicados." />

      {egfrs.length >= 2 && (
        <Tarjeta>
          <Subtitulo icon={Droplets}>Evolución de tu función renal</Subtitulo>
          <div className="grid items-center gap-6 sm:grid-cols-[1fr_200px]">
            <Sparkline valores={egfrs.map((e) => e.valores.egfr ?? 0)} color="#f59e0b" alto={90} />
            <div className="text-sm">
              <p className="text-muted-foreground">De <b className="text-foreground">{egfrs[0]!.valores.egfr}</b> a <b className="text-foreground">{egfrs[egfrs.length - 1]!.valores.egfr}</b> ml/min</p>
              <p className="text-xs text-muted-foreground">{fechaCorta(egfrs[0]!.fecha)} → {fechaCorta(egfrs[egfrs.length - 1]!.fecha)}</p>
            </div>
          </div>
        </Tarjeta>
      )}

      <div className="flex flex-wrap gap-2">
        {([["todos", "Todos"], ["renal", "Riñón y laboratorio"], ["cardio", "Corazón"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setFiltro(k)} className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${filtro === k ? "gradient-deep text-white shadow-md" : "bg-card text-muted-foreground ring-1 ring-border hover:text-foreground dark:bg-white/5 dark:ring-white/10"}`}>{l}</button>
        ))}
      </div>

      {lista.length === 0 && <Tarjeta><Vacio icon={FileText} texto="Cuando la clínica cargue tus resultados, los vas a ver acá con una explicación de cada valor." /></Tarjeta>}
      <div className="grid gap-5 lg:grid-cols-2">
        {lista.map((e) => {
          const v = e.valores;
          const renal = esRenal(e);
          return (
            <Tarjeta key={e.id}>
              <div className="flex items-start gap-3">
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${renal ? "bg-amber-500/10 text-amber-600 dark:text-amber-300" : "bg-rose-500/10 text-rose-600 dark:text-rose-300"}`}>{renal ? <Droplets className="size-5" /> : <HeartPulse className="size-5" />}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{e.tipo} · {fechaCorta(e.fecha)}</p>
                  <p className="font-semibold">{e.titulo}</p>
                </div>
                <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => imprimirEstudio(e, ctx.paciente)}><Download className="size-4" /> PDF</Button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {v.egfr !== undefined && (() => { const k = estadioRenal(v.egfr); return <Valor label="Filtrado (eGFR)" valor={v.egfr} unidad="ml/min" tono={k.tono === "critico" ? "rojo" : k.tono} nota={`Estadio ${k.estadio}`} />; })()}
                {v.creatinina !== undefined && <Valor label="Creatinina" valor={v.creatinina} unidad="mg/dl" tono={v.creatinina <= 1.3 ? "verde" : "naranja"} />}
                {v.potasio !== undefined && <Valor label="Potasio" valor={v.potasio} unidad="mEq/l" tono={v.potasio >= 3.5 && v.potasio <= 5 ? "verde" : "rojo"} nota={v.potasio > 5 ? "Alto" : v.potasio < 3.5 ? "Bajo" : "Normal"} />}
                {v.urea !== undefined && <Valor label="Urea" valor={v.urea} unidad="mg/dl" tono={v.urea <= 50 ? "verde" : "naranja"} />}
                {v.proteinuria !== undefined && <Valor label="Proteinuria" valor={v.proteinuria} unidad="mg/24h" tono={v.proteinuria < 150 ? "verde" : "naranja"} />}
                {v.hemoglobina !== undefined && <Valor label="Hemoglobina" valor={v.hemoglobina} unidad="g/dl" tono={v.hemoglobina >= 12 ? "verde" : "ambar"} />}
                {v.ldl !== undefined && <Valor label="Colesterol LDL" valor={v.ldl} unidad="mg/dl" tono={v.ldl < 100 ? "verde" : v.ldl < 160 ? "ambar" : "rojo"} />}
                {v.fevi !== undefined && (() => { const k = clasificarFevi(v.fevi); return <Valor label="FEVI" valor={v.fevi} unidad="%" tono={k.tono} nota={k.texto} />; })()}
              </div>
              {e.informe && <p className="mt-4 whitespace-pre-line rounded-2xl bg-secondary/50 p-4 text-sm leading-relaxed dark:bg-white/5">{e.informe}</p>}
              <p className="mt-3 text-xs text-muted-foreground">Informado por {e.cargadoPor}. Los colores son orientativos: tu médico interpreta los resultados en tu contexto.</p>
            </Tarjeta>
          );
        })}
      </div>

      <Tarjeta>
        <Subtitulo icon={FlaskConical}>Cómo prepararte para tus estudios</Subtitulo>
        <div className="grid gap-3 md:grid-cols-2">
          {PREPARACION.map((p) => (
            <details key={p.titulo} className="group rounded-2xl border border-border/60 p-4 open:bg-secondary/30 dark:border-white/10 dark:open:bg-white/[0.03]">
              <summary className="flex cursor-pointer list-none items-center gap-3 font-medium">
                <span className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-300"><p.icon className="size-4" /></span>
                {p.titulo}
                <ChevronDown className="ml-auto size-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <ul className="mt-3 space-y-1.5 pl-12 text-sm text-muted-foreground">{p.pasos.map((s) => <li key={s}>• {s}</li>)}</ul>
            </details>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Son indicaciones generales. Si tu médico te dio otras, seguí las de tu médico.</p>
      </Tarjeta>
    </div>
  );
}

/* ===================================================================== */
/* Pagos                                                                   */
/* ===================================================================== */

function Pagos({ ctx }: { ctx: Ctx }) {
  const mios = [...ctx.cobros].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const total = mios.reduce((a, c) => a + pagadoDe(c), 0);
  const saldo = mios.reduce((a, c) => a + saldoDe(c), 0);
  const TONO_EST: Record<string, Tono> = { Pagado: "verde", Parcial: "azul", Pendiente: "ambar", Anulado: "rojo" };
  return (
    <div className="space-y-6">
      <Titulo icon={Wallet} titulo="Mis pagos" sub="Lo que pagaste en la clínica y si te queda algún saldo." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Tarjeta className="!p-5"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total pagado</p><p className="mt-1 font-display text-3xl font-semibold tabular-nums">{ars(total)}</p></Tarjeta>
        <Tarjeta className={`!p-5 ${saldo ? "ring-1 ring-amber-500/30" : ""}`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Saldo pendiente</p>
          <p className={`mt-1 font-display text-3xl font-semibold tabular-nums ${saldo ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>{ars(saldo)}</p>
          {saldo > 0 && <a href={waLink(`Hola, soy ${ctx.paciente.nombre} (C.C. ${ctx.paciente.dni}). Quiero pagar mi saldo de ${ars(saldo)}.`)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400"><MessageCircle className="size-4" /> Coordinar el pago por WhatsApp</a>}
        </Tarjeta>
      </div>
      <Tarjeta>
        <Subtitulo icon={FileText}>Detalle</Subtitulo>
        <div className="space-y-3">
          {mios.length === 0 && <Vacio icon={Wallet} texto="Todavía no hay pagos registrados a tu nombre." />}
          {mios.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border/70 p-4 dark:border-white/10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="font-semibold">{c.concepto}</p><p className="text-xs text-muted-foreground">{new Date(c.fecha).toLocaleDateString("es-AR")} · {c.profesional}</p></div>
                <div className="text-right">
                  <Pastilla tono={TONO_EST[estadoCobro(c)] ?? "azul"}>{estadoCobro(c)}</Pastilla>
                  <p className="mt-1 font-semibold tabular-nums">{ars(pagadoDe(c))} <span className="text-xs font-normal text-muted-foreground">de {ars(c.arancel)}</span></p>
                </div>
              </div>
              {c.pagos.length > 0 && <ul className="mt-3 space-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground dark:border-white/10">{c.pagos.map((p, i) => <li key={i}>{new Date(p.fecha).toLocaleDateString("es-AR")} · {p.metodo} · {ars(p.monto)}</li>)}</ul>}
            </div>
          ))}
        </div>
      </Tarjeta>
    </div>
  );
}

/* ===================================================================== */
/* Autorizaciones                                                          */
/* ===================================================================== */

function Autorizaciones({ ctx }: { ctx: Ctx }) {
  const [f, setF] = useState({ tipo: TIPOS_AUT[0] as string, titulo: "", detalle: "" });
  const [abierto, setAbierto] = useState(false);
  const pendientes = ctx.auts.filter((a) => a.estado === "Pendiente" && a.origen === "Clínica");
  const resto = ctx.auts.filter((a) => !pendientes.includes(a));
  const TONO_A: Record<Autorizacion["estado"], Tono> = { Pendiente: "ambar", Autorizada: "verde", Rechazada: "rojo" };

  const responder = (a: Autorizacion, estado: Autorizacion["estado"]) => {
    ctx.setAuts((l) => l.map((x) => (x.id === a.id ? { ...x, estado, respondidoPor: ctx.paciente.nombre, fechaRespuesta: new Date().toISOString() } : x)));
    auditar(ctx.paciente.nombre, `Autorización ${estado.toLowerCase()} por el paciente`, a.titulo);
    toast.success(estado === "Autorizada" ? "Autorizaste la solicitud." : "Rechazaste la solicitud.");
  };

  const pedir = (e: FormEvent) => {
    e.preventDefault();
    const nueva: Autorizacion = { id: nuevoId(), pacienteId: ctx.paciente.id, paciente: ctx.paciente.nombre, tipo: f.tipo, titulo: f.titulo.trim(), detalle: f.detalle.trim(), origen: "Paciente", solicitadoPor: ctx.paciente.nombre, fecha: new Date().toISOString(), estado: "Pendiente" };
    ctx.setAuts((l) => [nueva, ...l]);
    auditar(ctx.paciente.nombre, "Autorización pedida desde el portal", `${nueva.tipo}: ${nueva.titulo}`);
    toast.success("Pedido enviado a la clínica.");
    setF({ ...f, titulo: "", detalle: "" });
    setAbierto(false);
  };

  return (
    <div className="space-y-6">
      <Titulo icon={ShieldCheck} titulo="Autorizaciones" sub="Respondé lo que te pide la clínica o pedí órdenes, recetas y autorizaciones."
        accion={<Button onClick={() => setAbierto((v) => !v)} variant={abierto ? "outline" : "default"} className="rounded-full px-6"><Plus className="size-4" /> Pedir autorización</Button>} />
      {abierto && (
        <Tarjeta className="animate-in fade-in zoom-in-95 duration-300">
          <form onSubmit={pedir} className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Tipo</span><select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })} className={inp}>{TIPOS_AUT.map((t) => <option key={t}>{t}</option>)}</select></label>
            <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">¿Qué necesitás?</span><input required placeholder="Ej: receta de enalapril" value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} className={inp} /></label>
            <label className="space-y-1.5 sm:col-span-2"><span className="text-xs font-medium text-muted-foreground">Detalle (obra social, número de afiliado, etc.)</span><textarea rows={3} value={f.detalle} onChange={(e) => setF({ ...f, detalle: e.target.value })} className={inp + " h-auto py-3"} /></label>
            <div className="sm:col-span-2"><Button type="submit" className="rounded-xl"><Check className="size-4" /> Enviar pedido</Button></div>
          </form>
        </Tarjeta>
      )}
      <Tarjeta>
        <Subtitulo icon={Bell}>Para responder</Subtitulo>
        <div className="space-y-3">
          {pendientes.length === 0 && <p className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="size-4 text-emerald-500" /> No hay solicitudes pendientes.</p>}
          {pendientes.map((a) => (
            <div key={a.id} className={`rounded-2xl p-5 ring-1 ${TONO.ambar}`}>
              <p className="text-xs font-semibold uppercase tracking-wider">{a.tipo}</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{a.titulo}</p>
              {a.detalle && <p className="mt-1 text-sm text-muted-foreground">{a.detalle}</p>}
              <p className="mt-2 text-xs text-muted-foreground">Pedida por {a.solicitadoPor}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => responder(a, "Autorizada")} className="rounded-xl !bg-emerald-600 text-white hover:!bg-emerald-700"><Check className="size-4" /> Autorizo</Button>
                <Button onClick={() => responder(a, "Rechazada")} variant="outline" className="rounded-xl text-rose-600"><Ban className="size-4" /> No autorizo</Button>
              </div>
            </div>
          ))}
        </div>
      </Tarjeta>
      {ctx.auts.some((a) => a.origen === "Paciente") && (
        <Tarjeta>
          <Subtitulo icon={ShieldCheck}>Tus pedidos a la clínica</Subtitulo>
          <div className="space-y-3">
            {ctx.auts.filter((a) => a.origen === "Paciente").map((a) => (
              <div key={a.id} className={`rounded-2xl p-4 ring-1 ${a.estado === "Autorizada" ? TONO.verde : a.estado === "Rechazada" ? TONO.rojo : "bg-secondary/40 ring-border dark:bg-white/[0.03] dark:ring-white/10"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{a.titulo}</p>
                    <p className="text-xs text-muted-foreground">{a.tipo} · pedido el {new Date(a.fecha).toLocaleDateString("es-AR")}</p>
                  </div>
                  <Pastilla tono={a.estado === "Autorizada" ? "verde" : a.estado === "Rechazada" ? "rojo" : "ambar"}>
                    {a.estado === "Autorizada" ? <><CheckCircle2 className="size-3.5" /> Autorizada</> : a.estado === "Rechazada" ? <><Ban className="size-3.5" /> Rechazada</> : <><Clock className="size-3.5" /> En revisión</>}
                  </Pastilla>
                </div>
                {/* Línea de tiempo del pedido */}
                <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                  <span className="flex items-center gap-1"><Check className="size-3 text-emerald-500" /> Enviado</span>
                  <span className="h-px flex-1 bg-border" />
                  <span className="flex items-center gap-1"><Check className="size-3 text-emerald-500" /> Recibido por la clínica</span>
                  <span className="h-px flex-1 bg-border" />
                  <span className={`flex items-center gap-1 ${a.estado === "Pendiente" ? "opacity-50" : ""}`}>{a.estado === "Pendiente" ? <Clock className="size-3" /> : <Check className="size-3 text-emerald-500" />} Respondido</span>
                </div>
                {a.estado !== "Pendiente" && (
                  <p className="mt-3 rounded-xl bg-background/70 px-3 py-2 text-sm text-foreground dark:bg-white/5">
                    <b>{a.respondidoPor ?? "La clínica"}</b>{a.fechaRespuesta ? ` · ${new Date(a.fechaRespuesta).toLocaleDateString("es-AR")}` : ""}{a.respuesta ? `: ${a.respuesta}` : a.estado === "Autorizada" ? ": autorizado." : ": no autorizado."}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Tarjeta>
      )}

      {resto.filter((a) => a.origen !== "Paciente").length > 0 && (
        <Tarjeta>
          <Subtitulo icon={Clock}>Historial</Subtitulo>
          <div className="space-y-3">
            {resto.filter((a) => a.origen !== "Paciente").map((a) => (
              <div key={a.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border/70 p-4 dark:border-white/10">
                <div className="min-w-0"><p className="font-medium">{a.titulo}</p><p className="text-xs text-muted-foreground">{a.tipo} · {a.origen === "Paciente" ? "Pedida por vos" : `Pedida por ${a.solicitadoPor}`}</p>{a.respuesta && <p className="mt-1 text-xs"><b>Respuesta de la clínica:</b> {a.respuesta}</p>}</div>
                <Pastilla tono={TONO_A[a.estado]}>{a.estado === "Pendiente" ? "En revisión" : a.estado}</Pastilla>
              </div>
            ))}
          </div>
        </Tarjeta>
      )}
    </div>
  );
}

/* ===================================================================== */
/* Ficha y datos                                                           */
/* ===================================================================== */

function Ficha({ ctx }: { ctx: Ctx }) {
  const [, setPacientes] = useDato<PacientePortal[]>(KEY_PACIENTES, []);
  const fi = ctx.paciente.ficha ?? {};
  const [f, setF] = useState({
    telefono: ctx.paciente.telefono,
    email: ctx.paciente.email,
    nacimiento: fi.nacimiento ?? "",
    obraSocial: fi.obraSocial ?? "",
    afiliado: fi.afiliado ?? "",
    grupo: fi.grupo ?? "",
    alergias: fi.alergias ?? "",
    antecedentes: fi.antecedentes ?? ([] as string[]),
    emergenciaNombre: fi.emergenciaNombre ?? "",
    emergenciaTel: fi.emergenciaTel ?? "",
  });
  const [c, setC] = useState({ nueva: "", repetir: "" });

  const guardar = (e: FormEvent) => {
    e.preventDefault();
    const ficha: FichaMedica = {
      antecedentes: f.antecedentes,
      ...(f.nacimiento ? { nacimiento: f.nacimiento } : {}),
      ...(f.obraSocial.trim() ? { obraSocial: f.obraSocial.trim() } : {}),
      ...(f.afiliado.trim() ? { afiliado: f.afiliado.trim() } : {}),
      ...(f.grupo ? { grupo: f.grupo } : {}),
      ...(f.alergias.trim() ? { alergias: f.alergias.trim() } : {}),
      ...(f.emergenciaNombre.trim() ? { emergenciaNombre: f.emergenciaNombre.trim() } : {}),
      ...(f.emergenciaTel.trim() ? { emergenciaTel: f.emergenciaTel.trim() } : {}),
    };
    setPacientes((l) => l.map((x) => (x.id === ctx.paciente.id ? { ...x, telefono: f.telefono.trim(), email: f.email.trim(), ficha } : x)));
    auditar(ctx.paciente.nombre, "Ficha del paciente actualizada", "Desde el portal");
    toast.success("Tu ficha quedó guardada.");
  };

  const clave = async (e: FormEvent) => {
    e.preventDefault();
    if (c.nueva.length < 6) { toast.error("La contraseña debe tener al menos 6 caracteres."); return; }
    if (c.nueva !== c.repetir) { toast.error("Las contraseñas no coinciden."); return; }
    const h = await hashTexto(c.nueva);
    setPacientes((l) => l.map((x) => (x.id === ctx.paciente.id ? { ...x, clave: h } : x)));
    toast.success("Contraseña guardada. Ya podés entrar con ella.");
    setC({ nueva: "", repetir: "" });
  };

  const toggleAnt = (a: string) => setF({ ...f, antecedentes: f.antecedentes.includes(a) ? f.antecedentes.filter((x) => x !== a) : [...f.antecedentes, a] });

  return (
    <div className="space-y-6">
      <Titulo icon={UserRound} titulo="Mi ficha y datos" sub="Tu información médica básica ayuda a tus doctores a atenderte mejor." />
      <form onSubmit={guardar} className="grid gap-6 lg:grid-cols-2">
        <Tarjeta>
          <Subtitulo icon={UserRound}>Datos personales</Subtitulo>
          <div className="mb-4 grid grid-cols-2 gap-3 rounded-2xl bg-secondary/50 p-4 text-sm dark:bg-white/5">
            <div><p className="text-xs text-muted-foreground">Nombre</p><p className="font-medium">{ctx.paciente.nombre}</p></div>
            <div><p className="text-xs text-muted-foreground">Cédula</p><p className="font-medium">{ctx.paciente.dni}</p></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Fecha de nacimiento</span><input type="date" value={f.nacimiento} onChange={(e) => setF({ ...f, nacimiento: e.target.value })} className={inp} /></label>
            <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Grupo sanguíneo</span>
              <select value={f.grupo} onChange={(e) => setF({ ...f, grupo: e.target.value })} className={inp}><option value="">No sé</option>{["0+", "0-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((g) => <option key={g}>{g}</option>)}</select></label>
            <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">WhatsApp</span><input required value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} className={inp} /></label>
            <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Email</span><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={inp} /></label>
            <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Obra social / prepaga</span><input value={f.obraSocial} onChange={(e) => setF({ ...f, obraSocial: e.target.value })} className={inp} /></label>
            <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">N° de afiliado</span><input value={f.afiliado} onChange={(e) => setF({ ...f, afiliado: e.target.value })} className={inp} /></label>
          </div>
        </Tarjeta>
        <Tarjeta>
          <Subtitulo icon={Stethoscope}>Información médica</Subtitulo>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Antecedentes</p>
          <div className="flex flex-wrap gap-2">
            {ANTECEDENTES.map((a) => {
              const on = f.antecedentes.includes(a);
              return <button type="button" key={a} onClick={() => toggleAnt(a)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${on ? "gradient-deep text-white shadow" : "bg-secondary text-muted-foreground hover:text-foreground dark:bg-white/5"}`}>{on && <Check className="mr-1 inline size-3" />}{a}</button>;
            })}
          </div>
          <label className="mt-4 block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Alergias (medicamentos, contraste, alimentos)</span><input placeholder="Ej: penicilina" value={f.alergias} onChange={(e) => setF({ ...f, alergias: e.target.value })} className={inp} /></label>
          <p className="mb-2 mt-5 text-xs font-medium text-muted-foreground">Contacto de emergencia</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Nombre" value={f.emergenciaNombre} onChange={(e) => setF({ ...f, emergenciaNombre: e.target.value })} className={inp} />
            <input placeholder="Teléfono" value={f.emergenciaTel} onChange={(e) => setF({ ...f, emergenciaTel: e.target.value })} className={inp} />
          </div>
          <Button type="submit" className="mt-5 h-12 w-full rounded-xl"><Check className="size-4" /> Guardar mi ficha</Button>
        </Tarjeta>
      </form>
      <Tarjeta className="max-w-xl">
        <Subtitulo icon={KeyRound}>{ctx.paciente.clave ? "Cambiar contraseña" : "Crear contraseña"}</Subtitulo>
        <p className="-mt-2 mb-4 text-sm text-muted-foreground">Así no dependés del código: entrás con tu cédula y tu contraseña.</p>
        <form onSubmit={clave} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input type="password" required placeholder="Nueva contraseña" value={c.nueva} onChange={(e) => setC({ ...c, nueva: e.target.value })} className={inp} />
          <input type="password" required placeholder="Repetir" value={c.repetir} onChange={(e) => setC({ ...c, repetir: e.target.value })} className={inp} />
          <Button type="submit" className="h-12 rounded-xl"><Check className="size-4" /> Guardar</Button>
        </form>
      </Tarjeta>
    </div>
  );
}
