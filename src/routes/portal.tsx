import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowLeft,
  Ban,
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Home,
  KeyRound,
  LogOut,
  MessageCircle,
  Plus,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { waLink } from "@/components/site/PublicLayout";
import { CLINICA, DOCTORS, ESPECIALIDADES, fotoDoctor, iconoEspecialidad } from "@/data/clinic";
import {
  ADMINS,
  KEY_AGENDA,
  KEY_AUT,
  KEY_COBROS,
  estadoCobro,
  pagadoDe,
  saldoDe,
  type Cobro,
  KEY_PACIENTES,
  KEY_SESION_PACIENTE,
  KEY_TURNOS,
  TIPOS_AUT,
  agendaDe,
  atiendeEl,
  auditar,
  hashTexto,
  horariosDelDia,
  ingresarPaciente,
  isoDe,
  nuevoId,
  proximosDias,
  resumenAgenda,
  sesionActual,
  useDato,
  type Agendas,
  type Autorizacion,
  type PacientePortal,
  type TurnoClinica,
} from "@/lib/auth-local";
import heroDoctors from "@/assets/hero-doctors.jpg";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Portal del paciente | Clínica Gómez Bolaño" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Portal,
});

type Seccion = "inicio" | "turnos" | "pagos" | "autorizaciones" | "datos";
const SECCIONES: { id: Seccion; label: string; icon: LucideIcon }[] = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "turnos", label: "Mis turnos", icon: CalendarDays },
  { id: "pagos", label: "Mis pagos", icon: Wallet },
  { id: "autorizaciones", label: "Autorizaciones", icon: ShieldCheck },
  { id: "datos", label: "Mis datos", icon: UserRound },
];

const inp =
  "h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15";

const fechaTxt = (f: string) => new Date(f + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
const fechaCorta = (f: string) => f.split("-").reverse().join("/");
const nombrePanel = (doctorId: string) => {
  const d = DOCTORS.find((x) => x.id === doctorId);
  return ADMINS.find((a) => a.id === d?.foto)?.nombre ?? d?.nombre ?? "";
};
const doctorDePanel = (nombre: string) => {
  const a = ADMINS.find((x) => x.nombre === nombre);
  return DOCTORS.find((d) => d.foto === a?.id);
};

const ESTADO_T: Record<TurnoClinica["estado"], string> = {
  Pendiente: "bg-amber-100 text-amber-800",
  Confirmado: "bg-sky-100 text-sky-800",
  Atendido: "bg-emerald-100 text-emerald-800",
  Cancelado: "bg-slate-100 text-slate-600",
};
const ESTADO_A: Record<Autorizacion["estado"], string> = {
  Pendiente: "bg-amber-100 text-amber-800",
  Autorizada: "bg-emerald-100 text-emerald-800",
  Rechazada: "bg-rose-100 text-rose-700",
};

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
        localStorage.removeItem(KEY_SESION_PACIENTE);
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
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur"><Activity className="size-5" /></span>
            <span className="leading-tight"><span className="block text-sm font-bold">Gómez Bolaño</span><span className="block text-[10px] uppercase tracking-[0.2em] text-white/70">Clínica médica</span></span>
          </Link>
          <div className="max-w-md space-y-5">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em]"><span className="pulse-dot size-1.5 rounded-full bg-emerald-400" /> Portal del paciente</span>
            <h1 className="text-5xl leading-[1.05] text-white">Tus turnos y autorizaciones, <span className="text-shine italic">en un solo lugar</span>.</h1>
            <ul className="space-y-3 text-sm text-white/85">
              {["Sacá y cancelá turnos con los horarios reales de cada doctor", "Aceptá o pedí autorizaciones sin ir a la clínica", "Mantené tus datos de contacto al día"].map((t) => (
                <li key={t} className="flex gap-3"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" /> {t}</li>
              ))}
            </ul>
          </div>
          <svg viewBox="0 0 600 60" className="h-10 w-full max-w-md text-sky-300/60" aria-hidden="true">
            <polyline className="ecg-line" points="0,30 80,30 100,10 120,50 140,30 220,30 240,5 260,55 280,30 380,30 400,14 420,46 440,30 600,30" fill="none" stroke="currentColor" strokeWidth="2.5" />
          </svg>
        </div>
      </div>

      <div className="flex min-h-screen flex-col px-6 py-8 sm:px-12">
        <Link to="/" className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Volver al sitio</Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="flex size-14 items-center justify-center rounded-2xl gradient-deep text-white shadow-lg"><KeyRound className="size-6" /></span>
          <h2 className="mt-6 text-3xl">Ingresá a tu portal</h2>
          <p className="mt-1 text-sm text-muted-foreground">Usá tu DNI y el código que te envió la clínica por WhatsApp.</p>
          <form onSubmit={ingresar} className="mt-8 space-y-4">
            <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">DNI o correo</span>
              <input autoFocus required value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Ej: 30123456" className={inp} /></label>
            <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Código de acceso o contraseña</span>
              <span className="relative block">
                <input required type={ver ? "text" : "password"} value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Código de 6 números" className={inp + " pr-11"} />
                <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? "Ocultar" : "Mostrar"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {ver ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
            </label>
            {error && <p className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-rose-100">{error}</p>}
            <Button type="submit" disabled={cargando} className="btn-glow h-12 w-full rounded-xl">{cargando ? "Verificando…" : "Ingresar"}</Button>
          </form>
          <div className="mt-8 rounded-2xl border border-dashed border-border p-4 text-xs leading-relaxed text-muted-foreground">
            ¿Todavía no tenés código? La clínica te lo envía cuando habilita tu acceso.{" "}
            <a href={waLink("Hola, quiero acceso al Portal del paciente.")} target="_blank" rel="noreferrer" className="font-semibold text-emerald-600 hover:underline">Pedilo por WhatsApp</a>.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Interior del portal ---------- */
type Ctx = {
  paciente: PacientePortal;
  turnos: TurnoClinica[];
  setTurnos: (fn: (p: TurnoClinica[]) => TurnoClinica[]) => void;
  auts: Autorizacion[];
  setAuts: (fn: (p: Autorizacion[]) => Autorizacion[]) => void;
  ir: (s: Seccion) => void;
};

function Interior({ paciente, onSalir, vista = false }: { paciente: PacientePortal; onSalir: () => void; vista?: boolean }) {
  const [sec, setSec] = useState<Seccion>("inicio");
  const [todos, setTodos] = useDato<TurnoClinica[]>(KEY_TURNOS, []);
  const [autsTodas, setAuts] = useDato<Autorizacion[]>(KEY_AUT, []);
  const turnos = todos.filter((t) => t.pacienteId === paciente.id);
  const auts = autsTodas.filter((a) => a.pacienteId === paciente.id);
  const pendAut = auts.filter((a) => a.estado === "Pendiente" && a.origen === "Clínica").length;
  const ctx: Ctx = { paciente, turnos, setTurnos: setTodos, auts, setAuts, ir: setSec };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,rgba(56,132,246,.12),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(219,39,119,.06),transparent_50%)] bg-secondary/30">
      {vista && (
        <div className="sticky top-0 z-40 bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-center text-sm font-semibold text-amber-950 shadow">
          <Eye className="mr-1.5 inline size-4 -translate-y-px" />
          Vista previa del portal {paciente.id === "__ejemplo" ? "con un paciente de ejemplo" : `de ${paciente.nombre}`}. Podés recorrerlo, pero no se guarda nada.
          <button onClick={onSalir} className="ml-3 rounded-lg bg-amber-950/10 px-2.5 py-0.5 text-xs hover:bg-amber-950/20">Cerrar vista</button>
        </div>
      )}
      <header className={`sticky ${vista ? "top-10" : "top-0"} z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl`}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 lg:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl gradient-deep text-white"><Activity className="size-4" /></span>
            <span className="leading-tight"><span className="block text-sm font-bold">Gómez Bolaño</span><span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Portal del paciente</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-right text-xs leading-tight sm:block"><span className="block font-semibold">{paciente.nombre}</span><span className="text-muted-foreground">DNI {paciente.dni}</span></span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 text-xs font-bold text-white">{paciente.nombre.split(" ").slice(0, 2).map((x) => x[0]).join("")}</span>
            <Button variant="ghost" size="icon" onClick={onSalir} aria-label="Salir"><LogOut className="size-4" /></Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 lg:px-6" style={{ scrollbarWidth: "none" }}>
          {SECCIONES.map((s) => (
            <button key={s.id} onClick={() => setSec(s.id)} className={`relative inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${sec === s.id ? "gradient-deep text-white shadow-md" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
              <s.icon className="size-4" /> {s.label}
              {s.id === "autorizaciones" && pendAut > 0 && <span className="rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-amber-950">{pendAut}</span>}
            </button>
          ))}
        </nav>
      </header>

      <main key={sec} inert={vista} className="mx-auto max-w-6xl px-4 py-8 animate-in fade-in slide-in-from-bottom-3 duration-500 lg:px-6">
        {sec === "inicio" && <Inicio ctx={ctx} />}
        {sec === "turnos" && <Turnos ctx={ctx} />}
        {sec === "pagos" && <Pagos ctx={ctx} />}
        {sec === "autorizaciones" && <Autorizaciones ctx={ctx} />}
        {sec === "datos" && <Datos ctx={ctx} />}
      </main>
    </div>
  );
}

function Tarjeta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,.04),0_16px_40px_-20px_rgba(15,35,80,.22)] ${className}`}>{children}</div>;
}

function FilaTurno({ t, onCancelar }: { t: TurnoClinica; onCancelar?: () => void }) {
  const d = doctorDePanel(t.doctor);
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/70 p-4 transition-colors hover:bg-secondary/40">
      <div className="flex w-16 shrink-0 flex-col items-center rounded-2xl gradient-deep py-2 text-white">
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
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTADO_T[t.estado]}`}>{t.estado === "Pendiente" ? "Pendiente de confirmación" : t.estado}</span>
      {onCancelar && (t.estado === "Pendiente" || t.estado === "Confirmado") && (
        <Button variant="ghost" size="sm" onClick={onCancelar} className="rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"><X className="size-4" /> Cancelar</Button>
      )}
    </div>
  );
}

function Inicio({ ctx }: { ctx: Ctx }) {
  const hoyIso = isoDe(new Date());
  const proximos = ctx.turnos.filter((t) => t.fecha >= hoyIso && t.estado !== "Cancelado" && t.estado !== "Atendido").sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  const pend = ctx.auts.filter((a) => a.estado === "Pendiente" && a.origen === "Clínica");
  const hora = new Date().getHours();
  return (
    <div className="space-y-6">
      <div className="pn-sheen relative overflow-hidden rounded-3xl gradient-deep p-7 text-white shadow-elevated sm:p-9">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="blob -right-10 -top-10 size-60 bg-white/20" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm text-white/70">{hora < 12 ? "Buenos días" : hora < 20 ? "Buenas tardes" : "Buenas noches"}</p>
            <h1 className="text-3xl text-white sm:text-4xl">{ctx.paciente.nombre.split(" ")[0]}, ¿en qué te ayudamos hoy?</h1>
          </div>
          <Button onClick={() => ctx.ir("turnos")} size="lg" className="rounded-full !bg-white px-6 text-[var(--deep)] hover:!bg-white/90"><CalendarPlus className="size-4" /> Sacar turno</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Tarjeta>
          <h2 className="flex items-center gap-2 font-sans text-lg font-semibold"><CalendarCheck className="size-5 text-primary" /> Próximo turno</h2>
          <div className="mt-4">
            {proximos[0] ? (
              <FilaTurno t={proximos[0]} />
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">No tenés turnos próximos.</p>
                <Button onClick={() => ctx.ir("turnos")} className="mt-4 rounded-xl"><Plus className="size-4" /> Pedir un turno</Button>
              </div>
            )}
            {proximos.length > 1 && <button onClick={() => ctx.ir("turnos")} className="mt-3 text-sm font-semibold text-primary hover:underline">Ver mis {proximos.length} turnos</button>}
          </div>
        </Tarjeta>

        <Tarjeta>
          <h2 className="flex items-center gap-2 font-sans text-lg font-semibold"><ShieldCheck className="size-5 text-primary" /> Pendientes</h2>
          <div className="mt-4 space-y-3">
            {pend.length === 0 && <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="size-4" /> No tenés nada pendiente.</p>}
            {pend.map((a) => (
              <button key={a.id} onClick={() => ctx.ir("autorizaciones")} className="flex w-full items-center gap-3 rounded-2xl bg-amber-50 p-4 text-left ring-1 ring-amber-100 transition-colors hover:bg-amber-100/70">
                <KeyRound className="size-5 shrink-0 text-amber-700" />
                <span className="min-w-0"><span className="block truncate text-sm font-semibold text-amber-900">{a.titulo}</span><span className="text-xs text-amber-800/80">La clínica necesita tu autorización</span></span>
              </button>
            ))}
          </div>
        </Tarjeta>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: CalendarPlus, t: "Sacar turno", d: "Con horarios reales", s: "turnos" as Seccion },
          { icon: ShieldCheck, t: "Autorizaciones", d: "Aceptá o pedí", s: "autorizaciones" as Seccion },
          { icon: UserRound, t: "Mis datos", d: "Contacto y contraseña", s: "datos" as Seccion },
        ].map((x) => (
          <button key={x.t} onClick={() => ctx.ir(x.s)} className="card-lift group flex items-center gap-4 rounded-3xl border border-border bg-card p-5 text-left shadow-card">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary transition-all group-hover:gradient-deep group-hover:text-white"><x.icon className="size-5" /></span>
            <span><span className="block font-semibold">{x.t}</span><span className="text-xs text-muted-foreground">{x.d}</span></span>
          </button>
        ))}
      </div>
      <a href={waLink(`Hola, soy ${ctx.paciente.nombre} (DNI ${ctx.paciente.dni}). Tengo una consulta.`)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-700 hover:underline">
        <MessageCircle className="size-4" /> ¿Necesitás hablar con la clínica? Escribinos por WhatsApp
      </a>
    </div>
  );
}

function Turnos({ ctx }: { ctx: Ctx }) {
  const [agendas] = useDato<Agendas>(KEY_AGENDA, {});
  const [todos] = useDato<TurnoClinica[]>(KEY_TURNOS, []);
  const [pidiendo, setPidiendo] = useState(false);
  const [esp, setEsp] = useState<string>("");
  const [doc, setDoc] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");
  const [hora, setHora] = useState<string>("");
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
    return horariosDelDia(agenda).map((h) => ({
      h,
      libre: !todos.some((t) => t.doctor === nom && t.fecha === fecha && t.hora === h && t.estado !== "Cancelado") && !(fecha === isoDe(ahora) && h <= hhmm),
    }));
  }, [agenda, doctor, fecha, todos]);

  const reset = () => {
    setPidiendo(false);
    setEsp("");
    setDoc("");
    setFecha("");
    setHora("");
    setNota("");
  };

  const confirmar = () => {
    if (!doctor || !especialidad || !fecha || !hora) return;
    const nom = nombrePanel(doctor.id);
    if (todos.some((t) => t.doctor === nom && t.fecha === fecha && t.hora === hora && t.estado !== "Cancelado")) {
      toast.error("Ese horario se acaba de ocupar. Elegí otro.");
      setHora("");
      return;
    }
    const nuevo: TurnoClinica = {
      id: nuevoId(),
      fecha,
      hora,
      paciente: ctx.paciente.nombre,
      doctor: nom,
      motivo: especialidad.nombre + (nota.trim() ? ` · ${nota.trim()}` : ""),
      estado: "Pendiente",
      telefono: ctx.paciente.telefono,
      email: ctx.paciente.email,
      origen: "portal",
      pacienteId: ctx.paciente.id,
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

  const hoyIso = isoDe(new Date());
  const proximos = ctx.turnos.filter((t) => t.fecha >= hoyIso && t.estado !== "Cancelado" && t.estado !== "Atendido").sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  const historial = ctx.turnos.filter((t) => !proximos.includes(t)).sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Mis turnos</h1>
          <p className="text-sm text-muted-foreground">Pedí, mirá y cancelá tus turnos.</p>
        </div>
        {!pidiendo && <Button onClick={() => setPidiendo(true)} className="btn-glow rounded-full px-6"><CalendarPlus className="size-4" /> Pedir turno</Button>}
      </div>

      {pidiendo && (
        <Tarjeta className="animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-lg font-semibold">Nuevo turno</h2>
            <Button variant="ghost" size="icon" onClick={reset} aria-label="Cerrar"><X className="size-4" /></Button>
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">1 · Especialidad</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ESPECIALIDADES.map((e) => {
              const I = iconoEspecialidad(e.icono);
              return (
                <button key={e.slug} onClick={() => { setEsp(e.slug); setDoc(""); setFecha(""); setHora(""); }} className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm font-medium transition-all ${esp === e.slug ? "border-primary bg-secondary/60 ring-4 ring-primary/10" : "border-border hover:border-primary/30"}`}>
                  <span className={`flex size-9 items-center justify-center rounded-lg ${esp === e.slug ? "gradient-deep text-white" : "bg-secondary text-primary"}`}><I className="size-4" /></span>{e.nombre}
                </button>
              );
            })}
          </div>

          {especialidad && (
            <>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">2 · Profesional</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {doctores.map((d) => {
                  const ag = agendaDe(agendas, d.foto);
                  return (
                    <button key={d.id} disabled={!ag.activo} onClick={() => { setDoc(d.id); setFecha(""); setHora(""); }} className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all disabled:opacity-50 ${doc === d.id ? "border-primary bg-secondary/60 ring-4 ring-primary/10" : "border-border hover:border-primary/30"}`}>
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
              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">3 · Día y horario</p>
              {agenda.nota && <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-100">{agenda.nota}</p>}
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {dias.length === 0 && <p className="text-sm text-muted-foreground">No hay días disponibles por ahora.</p>}
                {dias.map((f) => {
                  const d = new Date(f + "T12:00:00");
                  return (
                    <button key={f} onClick={() => { setFecha(f); setHora(""); }} className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border py-2.5 transition-all ${fecha === f ? "border-transparent gradient-deep text-white shadow-lg" : "border-border hover:border-primary/40"}`}>
                      <span className="text-[10px] font-semibold uppercase opacity-70">{d.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "")}</span>
                      <span className="font-display text-xl font-semibold">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
              {fecha && (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {libres.map(({ h, libre }) => (
                    <button key={h} disabled={!libre} onClick={() => setHora(h)} className={`rounded-xl border py-2.5 text-sm font-semibold tabular-nums transition-all ${!libre ? "border-border bg-secondary/40 text-muted-foreground/40 line-through" : hora === h ? "border-transparent gradient-deep text-white shadow-md" : "border-border hover:border-primary/50"}`}>{h}</button>
                  ))}
                </div>
              )}
            </>
          )}

          {hora && (
            <div className="mt-6 space-y-3 animate-in fade-in duration-300">
              <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Motivo o comentario (opcional)" className={inp} />
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/60 p-4">
                <p className="text-sm"><b className="capitalize">{fechaTxt(fecha)}</b> a las <b>{hora}</b> con {doctor?.nombre}</p>
                <Button onClick={confirmar} className="btn-glow rounded-xl"><Check className="size-4" /> Confirmar pedido</Button>
              </div>
            </div>
          )}
        </Tarjeta>
      )}

      <Tarjeta>
        <h2 className="font-sans text-lg font-semibold">Próximos</h2>
        <div className="mt-4 space-y-3">
          {proximos.length === 0 && <p className="text-sm text-muted-foreground">No tenés turnos próximos.</p>}
          {proximos.map((t) => <FilaTurno key={t.id} t={t} onCancelar={() => cancelar(t)} />)}
        </div>
      </Tarjeta>

      {historial.length > 0 && (
        <Tarjeta>
          <h2 className="font-sans text-lg font-semibold">Historial</h2>
          <div className="mt-4 space-y-3 opacity-80">{historial.map((t) => <FilaTurno key={t.id} t={t} />)}</div>
        </Tarjeta>
      )}
    </div>
  );
}

function Pagos({ ctx }: { ctx: Ctx }) {
  const [cobros] = useDato<Cobro[]>(KEY_COBROS, []);
  const mios = cobros
    .filter((c) => !c.anulado && (c.pacienteId === ctx.paciente.id || (!!c.dni && c.dni === ctx.paciente.dni)))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  const total = mios.reduce((a, c) => a + pagadoDe(c), 0);
  const saldo = mios.reduce((a, c) => a + saldoDe(c), 0);
  const ars = (n: number) => "$ " + n.toLocaleString("es-AR");
  const ESTADO: Record<string, string> = { Pagado: "bg-emerald-100 text-emerald-800", Parcial: "bg-sky-100 text-sky-800", Pendiente: "bg-amber-100 text-amber-800", Anulado: "bg-slate-100 text-slate-500" };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Mis pagos</h1>
        <p className="text-sm text-muted-foreground">Lo que pagaste en la clínica y si te queda algún saldo.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Tarjeta className="!p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total pagado</p>
          <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{ars(total)}</p>
        </Tarjeta>
        <Tarjeta className={`!p-5 ${saldo ? "!border-amber-200 !bg-amber-50/60" : ""}`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Saldo pendiente</p>
          <p className={`mt-1 font-display text-3xl font-semibold tabular-nums ${saldo ? "text-amber-700" : "text-emerald-700"}`}>{ars(saldo)}</p>
          {saldo > 0 && (
            <a href={waLink(`Hola, soy ${ctx.paciente.nombre} (DNI ${ctx.paciente.dni}). Quiero pagar mi saldo de ${ars(saldo)}.`)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline">
              <MessageCircle className="size-4" /> Coordinar el pago por WhatsApp
            </a>
          )}
        </Tarjeta>
      </div>
      <Tarjeta>
        <h2 className="font-sans text-lg font-semibold">Detalle</h2>
        <div className="mt-4 space-y-3">
          {mios.length === 0 && <p className="text-sm text-muted-foreground">Todavía no hay pagos registrados a tu nombre.</p>}
          {mios.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{c.concepto}</p>
                  <p className="text-xs text-muted-foreground">{new Date(c.fecha).toLocaleDateString("es-AR")} · {c.profesional}</p>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTADO[estadoCobro(c)]}`}>{estadoCobro(c)}</span>
                  <p className="mt-1 font-semibold tabular-nums">{ars(pagadoDe(c))} <span className="text-xs font-normal text-muted-foreground">de {ars(c.arancel)}</span></p>
                </div>
              </div>
              {c.pagos.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                  {c.pagos.map((p, i) => <li key={i}>{new Date(p.fecha).toLocaleDateString("es-AR")} · {p.metodo} · {ars(p.monto)}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Tarjeta>
    </div>
  );
}

function Autorizaciones({ ctx }: { ctx: Ctx }) {
  const [f, setF] = useState({ tipo: TIPOS_AUT[0] as string, titulo: "", detalle: "" });
  const [abierto, setAbierto] = useState(false);
  const pendientes = ctx.auts.filter((a) => a.estado === "Pendiente" && a.origen === "Clínica");
  const resto = ctx.auts.filter((a) => !pendientes.includes(a));

  const responder = (a: Autorizacion, estado: Autorizacion["estado"]) => {
    ctx.setAuts((l) => l.map((x) => (x.id === a.id ? { ...x, estado, respondidoPor: ctx.paciente.nombre, fechaRespuesta: new Date().toISOString() } : x)));
    auditar(ctx.paciente.nombre, `Autorización ${estado.toLowerCase()} por el paciente`, a.titulo);
    toast.success(estado === "Autorizada" ? "Autorizaste la solicitud." : "Rechazaste la solicitud.");
  };

  const pedir = (e: FormEvent) => {
    e.preventDefault();
    const nueva: Autorizacion = {
      id: nuevoId(),
      pacienteId: ctx.paciente.id,
      paciente: ctx.paciente.nombre,
      tipo: f.tipo,
      titulo: f.titulo.trim(),
      detalle: f.detalle.trim(),
      origen: "Paciente",
      solicitadoPor: ctx.paciente.nombre,
      fecha: new Date().toISOString(),
      estado: "Pendiente",
    };
    ctx.setAuts((l) => [nueva, ...l]);
    auditar(ctx.paciente.nombre, "Autorización pedida desde el portal", `${nueva.tipo}: ${nueva.titulo}`);
    toast.success("Pedido enviado a la clínica.");
    setF({ ...f, titulo: "", detalle: "" });
    setAbierto(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Autorizaciones</h1>
          <p className="text-sm text-muted-foreground">Respondé lo que te pide la clínica o pedí una autorización.</p>
        </div>
        <Button onClick={() => setAbierto((v) => !v)} variant={abierto ? "outline" : "default"} className="rounded-full px-6"><Plus className="size-4" /> Pedir autorización</Button>
      </div>

      {abierto && (
        <Tarjeta className="animate-in fade-in zoom-in-95 duration-300">
          <form onSubmit={pedir} className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Tipo</span>
              <select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })} className={inp}>{TIPOS_AUT.map((t) => <option key={t}>{t}</option>)}</select></label>
            <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">¿Qué necesitás?</span>
              <input required placeholder="Ej: orden para ecocardiograma" value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} className={inp} /></label>
            <label className="space-y-1.5 sm:col-span-2"><span className="text-xs font-medium text-muted-foreground">Detalle (obra social, número de afiliado, etc.)</span>
              <textarea rows={3} value={f.detalle} onChange={(e) => setF({ ...f, detalle: e.target.value })} className={inp + " h-auto py-3"} /></label>
            <div className="sm:col-span-2"><Button type="submit" className="rounded-xl"><Check className="size-4" /> Enviar pedido</Button></div>
          </form>
        </Tarjeta>
      )}

      <Tarjeta>
        <h2 className="font-sans text-lg font-semibold">Para responder</h2>
        <div className="mt-4 space-y-3">
          {pendientes.length === 0 && <p className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="size-4 text-emerald-600" /> No hay solicitudes pendientes.</p>}
          {pendientes.map((a) => (
            <div key={a.id} className="rounded-2xl bg-amber-50/70 p-5 ring-1 ring-amber-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">{a.tipo}</p>
              <p className="mt-1 text-lg font-semibold">{a.titulo}</p>
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

      {resto.length > 0 && (
        <Tarjeta>
          <h2 className="font-sans text-lg font-semibold">Historial</h2>
          <div className="mt-4 space-y-3">
            {resto.map((a) => (
              <div key={a.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border/70 p-4">
                <div className="min-w-0">
                  <p className="font-medium">{a.titulo}</p>
                  <p className="text-xs text-muted-foreground">{a.tipo} · {a.origen === "Paciente" ? "Pedida por vos" : `Pedida por ${a.solicitadoPor}`}</p>
                  {a.respuesta && <p className="mt-1 text-xs"><b>Respuesta de la clínica:</b> {a.respuesta}</p>}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTADO_A[a.estado]}`}>{a.estado === "Pendiente" ? "En revisión" : a.estado}</span>
              </div>
            ))}
          </div>
        </Tarjeta>
      )}
    </div>
  );
}

function Datos({ ctx }: { ctx: Ctx }) {
  const [, setPacientes] = useDato<PacientePortal[]>(KEY_PACIENTES, []);
  const [f, setF] = useState({ telefono: ctx.paciente.telefono, email: ctx.paciente.email });
  const [c, setC] = useState({ nueva: "", repetir: "" });

  const guardar = (e: FormEvent) => {
    e.preventDefault();
    setPacientes((l) => l.map((x) => (x.id === ctx.paciente.id ? { ...x, telefono: f.telefono.trim(), email: f.email.trim() } : x)));
    auditar(ctx.paciente.nombre, "Datos de contacto actualizados", "Desde el portal");
    toast.success("Datos guardados.");
  };

  const clave = async (e: FormEvent) => {
    e.preventDefault();
    if (c.nueva.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (c.nueva !== c.repetir) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    const h = await hashTexto(c.nueva);
    setPacientes((l) => l.map((x) => (x.id === ctx.paciente.id ? { ...x, clave: h } : x)));
    toast.success("Contraseña creada. Ya podés entrar con ella.");
    setC({ nueva: "", repetir: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Mis datos</h1>
        <p className="text-sm text-muted-foreground">Mantené tu contacto al día para recibir avisos de la clínica.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta>
          <h2 className="flex items-center gap-2 font-sans text-lg font-semibold"><UserRound className="size-5 text-primary" /> Contacto</h2>
          <form onSubmit={guardar} className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-secondary/50 p-4 text-sm">
              <div><p className="text-xs text-muted-foreground">Nombre</p><p className="font-medium">{ctx.paciente.nombre}</p></div>
              <div><p className="text-xs text-muted-foreground">DNI</p><p className="font-medium">{ctx.paciente.dni}</p></div>
            </div>
            <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">WhatsApp</span><input required value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} className={inp} /></label>
            <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Email</span><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={inp} /></label>
            <Button type="submit" className="rounded-xl"><Check className="size-4" /> Guardar</Button>
          </form>
        </Tarjeta>
        <Tarjeta>
          <h2 className="flex items-center gap-2 font-sans text-lg font-semibold"><KeyRound className="size-5 text-primary" /> {ctx.paciente.clave ? "Cambiar contraseña" : "Crear contraseña"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Así no dependés del código: entrás con tu DNI y tu contraseña.</p>
          <form onSubmit={clave} className="mt-5 space-y-4">
            <input type="password" required placeholder="Nueva contraseña" value={c.nueva} onChange={(e) => setC({ ...c, nueva: e.target.value })} className={inp} />
            <input type="password" required placeholder="Repetir contraseña" value={c.repetir} onChange={(e) => setC({ ...c, repetir: e.target.value })} className={inp} />
            <Button type="submit" className="rounded-xl"><Check className="size-4" /> Guardar contraseña</Button>
          </form>
        </Tarjeta>
      </div>
      <p className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="size-3.5" /> {CLINICA.horarios} · <Stethoscope className="size-3.5" /> {CLINICA.telefono}</p>
    </div>
  );
}
