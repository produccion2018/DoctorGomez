import { useEffect, useState, type FormEvent } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  CalendarCheck,
  ClipboardList,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import heroDoctors from "@/assets/hero-doctors.jpg";
import { ADMINS, aceptarInvitacion, areaDe, crearClave, iniciarBackend, ingresar, leerInvitacion, listarEnfermeras, sesionActual, tieneClave, validarSesion, type Enfermera, type Personal, type Rol } from "@/lib/auth-local";

import logoClinica from "@/assets/logo.png";
import { Electro } from "@/components/site/PublicLayout";
export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acceso administrativo | HEGO · Centro de especialidades médicas" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { invitacion?: string } => (typeof s["invitacion"] === "string" ? { invitacion: s["invitacion"] } : {}),
  component: Login,
});

const inputClass =
  "h-12 w-full rounded-xl border border-input bg-background pl-10 pr-11 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15";

function Login() {
  const { invitacion } = Route.useSearch();
  if (invitacion) return <AceptarInvitacion codigo={invitacion} />;
  return <LoginNormal />;
}

const capitalizar = (t: string) => t.toLowerCase().replace(/(^|\s|\.)(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase());

/** Fuerza de la contraseña: 0 a 4. */
function fuerzaClave(c: string) {
  let n = 0;
  if (c.length >= 6) n++;
  if (c.length >= 10) n++;
  if (/[A-Z]/.test(c) && /[a-z]/.test(c)) n++;
  if (/\d/.test(c) && /[^A-Za-z0-9]/.test(c)) n++;
  else if (/\d/.test(c)) n += 0.5;
  return Math.min(4, Math.floor(n));
}
const FUERZA = [
  { t: "Muy débil", c: "bg-red-500" },
  { t: "Débil", c: "bg-orange-500" },
  { t: "Aceptable", c: "bg-amber-400" },
  { t: "Buena", c: "bg-emerald-500" },
  { t: "Excelente", c: "bg-emerald-600" },
];

/** Pantalla que abre el link de invitación: la persona crea su contraseña y entra. */
function AceptarInvitacion({ codigo }: { codigo: string }) {
  const navigate = useNavigate();
  const [persona, setPersona] = useState<Personal | null | undefined>(undefined);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    void iniciarBackend().then(() => setPersona(leerInvitacion(codigo)));
  }, [codigo]);

  const nombre = persona ? capitalizar(persona.nombre) : "";
  const iniciales = nombre.replace(/^(Enf\.|Lic\.|Dr\.|Dra\.)\s*/i, "").split(" ").filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase();
  const fuerza = fuerzaClave(p1);
  const reglas = [
    { ok: p1.length >= 6, t: "Al menos 6 caracteres" },
    { ok: /\d/.test(p1), t: "Un número" },
    { ok: /[A-Z]/.test(p1), t: "Una mayúscula" },
    { ok: p1.length > 0 && p1 === p2, t: "Las dos contraseñas coinciden" },
  ];

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!persona) return;
    if (p1.length < 6) { toast.error("La contraseña debe tener al menos 6 caracteres."); return; }
    if (p1 !== p2) { toast.error("Las contraseñas no coinciden."); return; }
    setLoading(true);
    const r = await aceptarInvitacion(persona, p1);
    setLoading(false);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success(`¡Bienvenida/o, ${nombre}!`);
    navigate({ to: "/panel" });
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[1.05fr_1fr]">
      <style>{`
        @keyframes iv-up { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes iv-orb { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-34px) scale(1.12); } }
        @keyframes iv-ecg { from { stroke-dashoffset: 900; } to { stroke-dashoffset: 0; } }
        @keyframes iv-ring { 0% { transform: scale(.9); opacity: .7; } 100% { transform: scale(1.5); opacity: 0; } }
        @keyframes iv-shine { from { transform: translateX(-120%) skewX(-20deg); } to { transform: translateX(260%) skewX(-20deg); } }
        @keyframes iv-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .iv-up { animation: iv-up .8s cubic-bezier(.2,.8,.2,1) both; }
        .iv-orb { animation: iv-orb 11s ease-in-out infinite; }
        .iv-ecg { stroke-dasharray: 900; animation: iv-ecg 4s linear infinite; }
        .iv-ring::before { content: ""; position: absolute; inset: -6px; border-radius: 2rem; border: 2px solid rgba(125,211,252,.6); animation: iv-ring 2.4s ease-out infinite; }
        .iv-float { animation: iv-float 5s ease-in-out infinite; }
        .iv-btn { position: relative; overflow: hidden; }
        .iv-btn::after { content: ""; position: absolute; inset: 0; width: 35%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent); transform: translateX(-120%) skewX(-20deg); }
        .iv-btn:hover::after { animation: iv-shine .9s ease-out; }
        @media (prefers-reduced-motion: reduce) { .iv-up, .iv-orb, .iv-ecg, .iv-ring::before, .iv-float { animation: none; } }
      `}</style>

      {/* Panel institucional con foto */}
      <div className="relative hidden overflow-hidden lg:block">
        <img src={heroDoctors} alt="" className="absolute inset-0 size-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.2_0.08_262/0.96)] via-[oklch(0.24_0.1_258/0.88)] to-[oklch(0.3_0.12_250/0.7)]" />
        <div className="iv-orb pointer-events-none absolute -left-24 top-10 size-96 rounded-full bg-sky-400/25 blur-3xl" />
        <div className="iv-orb pointer-events-none absolute -bottom-32 right-0 size-96 rounded-full bg-rose-500/20 blur-3xl" style={{ animationDelay: "-5s" }} />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link to="/" className="flex w-fit items-center gap-3">
            <span className="flex size-11 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-white/25"><img src={logoClinica} alt="" className="size-full object-cover" /></span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-semibold">HEGO</span>
              <span className="block text-[11px] uppercase tracking-[0.2em] text-white/60">Especialidades médicas</span>
            </span>
          </Link>

          <div className="iv-up max-w-lg" style={{ animationDelay: ".1s" }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ring-1 ring-white/20 backdrop-blur">
              <ShieldCheck className="size-3.5" /> Invitación personal
            </span>
            <h2 className="mt-6 font-display text-5xl font-semibold leading-[1.08]">
              Bienvenida/o al <span className="italic text-sky-300">equipo</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/75">
              Un médico de la clínica te dio acceso al panel. Creá tu contraseña y empezá a trabajar con tu área.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-white/85">
              {["Acceso solo a los módulos de tu área", "Cada acción queda registrada a tu nombre", "Tus datos de ingreso son personales"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-emerald-400/20 ring-1 ring-emerald-300/40"><Check className="size-3.5 text-emerald-300" /></span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <Electro latidos={3} grilla={false} color="#7dd3fc" className="h-12 w-full max-w-lg" />
        </div>
      </div>

      {/* Formulario */}
      <div className="relative flex min-h-screen flex-col overflow-hidden px-6 py-8 sm:px-12">
        <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 size-96 rounded-full bg-fuchsia-400/10 blur-3xl" />

        <div className="relative flex items-center gap-3 lg:hidden">
          <span className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-black/5"><img src={logoClinica} alt="" className="size-full object-cover" /></span>
          <span className="leading-tight">
            <span className="block font-semibold">HEGO</span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Especialidades médicas</span>
          </span>
        </div>

        <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          {persona === undefined ? null : persona === null ? (
            <div className="iv-up rounded-[2rem] border border-border/70 bg-card/80 p-10 text-center shadow-[0_40px_80px_-40px_rgba(10,25,70,.45)] backdrop-blur-xl">
              <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100"><ShieldCheck className="size-7" /></span>
              <h1 className="mt-5 font-display text-3xl font-semibold">Invitación no válida</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">El link ya se usó, venció o el acceso fue bloqueado. Pedile a un médico de la clínica que te envíe uno nuevo.</p>
              <Button asChild className="mt-7 h-11 rounded-xl px-6"><Link to="/login">Ir al acceso</Link></Button>
            </div>
          ) : (
            <>
              {/* Pasos */}
              <ol className="iv-up mb-8 flex items-center gap-2 text-xs font-semibold" style={{ animationDelay: ".05s" }}>
                {["Invitación", "Contraseña", "Ingreso"].map((t, i) => (
                  <li key={t} className="flex flex-1 items-center gap-2">
                    <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${i === 0 ? "bg-emerald-500 text-white" : i === 1 ? "gradient-deep text-white shadow-lg" : "bg-secondary text-muted-foreground"}`}>
                      {i === 0 ? <Check className="size-3.5" /> : i + 1}
                    </span>
                    <span className={i === 2 ? "text-muted-foreground" : ""}>{t}</span>
                    {i < 2 && <span className={`h-px flex-1 ${i === 0 ? "bg-emerald-400" : "bg-border"}`} />}
                  </li>
                ))}
              </ol>

              <form onSubmit={enviar} className="iv-up relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 p-8 shadow-[0_50px_100px_-45px_rgba(10,25,70,.55)] backdrop-blur-xl sm:p-10" style={{ animationDelay: ".12s" }}>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-blue-600 to-fuchsia-500" />
                <div className="flex items-center gap-4">
                  <span className="iv-ring iv-float relative flex size-16 shrink-0 items-center justify-center rounded-[1.4rem] gradient-deep font-display text-xl font-semibold text-white shadow-[0_18px_40px_-14px_rgba(20,50,120,.9)]">
                    {iniciales}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Hola,</p>
                    <h1 className="truncate font-display text-3xl font-semibold leading-tight">{nombre}</h1>
                    <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800 ring-1 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-500/30">
                      {areaDe(persona) === "Enfermería" ? <Syringe className="size-3.5" /> : <ShieldCheck className="size-3.5" />} {areaDe(persona)}
                    </span>
                  </div>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">Creá tu contraseña personal. La vas a usar cada vez que entres al panel.</p>

                <div className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="inv1" className="text-sm font-medium">Nueva contraseña</label>
                    <div className="group relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <input id="inv1" type={show ? "text" : "password"} required autoComplete="new-password" placeholder="Mínimo 6 caracteres" value={p1} onChange={(e) => setP1(e.target.value)} className={inputClass} />
                      <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
                    </div>
                    {p1 && (
                      <div className="flex items-center gap-3 pt-1">
                        <div className="grid flex-1 grid-cols-4 gap-1">
                          {[0, 1, 2, 3].map((i) => (
                            <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i < Math.max(1, fuerza) ? FUERZA[fuerza]!.c : "bg-secondary"}`} />
                          ))}
                        </div>
                        <span className="w-20 text-right text-[11px] font-semibold text-muted-foreground">{FUERZA[fuerza]!.t}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="inv2" className="text-sm font-medium">Repetir contraseña</label>
                    <div className="group relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <input id="inv2" type={show ? "text" : "password"} required autoComplete="new-password" placeholder="Repetí la contraseña" value={p2} onChange={(e) => setP2(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </div>

                <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-2 rounded-2xl bg-secondary/50 p-4">
                  {reglas.map((r) => (
                    <li key={r.t} className={`flex items-center gap-2 text-xs transition-colors ${r.ok ? "font-medium text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}`}>
                      <span className={`flex size-4 shrink-0 items-center justify-center rounded-full transition-all ${r.ok ? "scale-110 bg-emerald-500 text-white" : "bg-background ring-1 ring-border"}`}>{r.ok && <Check className="size-2.5" />}</span>
                      {r.t}
                    </li>
                  ))}
                </ul>

                <Button type="submit" size="lg" disabled={loading} className="iv-btn mt-6 h-12 w-full rounded-xl text-[15px] shadow-[0_18px_40px_-16px_rgba(20,50,120,.9)] transition-transform hover:-translate-y-0.5">
                  {loading ? "Creando tu acceso..." : <>Crear contraseña e ingresar <ArrowRight className="size-4" /></>}
                </Button>
                <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5 shrink-0" /> <span>Después entrás desde el acceso eligiendo <b>Equipo</b> y tu nombre.</span>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LoginNormal() {
  const navigate = useNavigate();
  const [rol, setRol] = useState<Rol>("medico");
  const [enfermeras, setEnfermeras] = useState<Enfermera[]>([]);
  const [adminId, setAdminId] = useState<string>(ADMINS[0]!.id);
  const [primera, setPrimera] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const [listo, setListo] = useState(0);
  useEffect(() => {
    if (sesionActual()) navigate({ to: "/panel" });
    setEnfermeras(listarEnfermeras().filter((e) => e.activo));
    // Con backend: trae quién ya tiene contraseña y el personal habilitado
    void iniciarBackend().then(async () => {
      if (await validarSesion()) {
        navigate({ to: "/panel" });
        return;
      }
      setEnfermeras(listarEnfermeras().filter((e) => e.activo));
      setListo((n) => n + 1);
    });
  }, [navigate]);

  const cambiarRol = (r: Rol) => {
    setRol(r);
    const primeraId = r === "medico" ? ADMINS[0]!.id : (listarEnfermeras().find((e) => e.activo)?.id ?? "");
    setAdminId(primeraId);
  };

  useEffect(() => {
    if (!adminId) return;
    setPrimera(!tieneClave(adminId));
    setPassword("");
    setPassword2("");
  }, [adminId, listo]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminId) return toast.error("Elegí tu usuario.");
    if (primera) {
      if (password.length < 6) return toast.error("La contraseña debe tener al menos 6 caracteres.");
      if (password !== password2) return toast.error("Las contraseñas no coinciden.");
    }
    setLoading(true);
    if (primera) {
      const creada = await crearClave(adminId, password);
      if (!creada.ok) {
        setLoading(false);
        return toast.error(creada.error);
      }
    }
    const res = await ingresar(adminId, password);
    setLoading(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(primera ? "Contraseña creada. ¡Bienvenido!" : "Bienvenido al panel.");
    navigate({ to: "/panel" });
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <style>{`
        @keyframes lg-up { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes lg-orb { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(26px,-30px) scale(1.12); } }
        @keyframes lg-ecg { from { stroke-dashoffset: 700; } to { stroke-dashoffset: 0; } }
        @keyframes lg-shine { from { transform: translateX(-120%) skewX(-20deg); } to { transform: translateX(260%) skewX(-20deg); } }
        .lg-up { animation: lg-up .7s ease-out both; }
        .lg-orb { animation: lg-orb 10s ease-in-out infinite; }
        .lg-orb-b { animation: lg-orb 13s ease-in-out infinite reverse; }
        .lg-ecg { stroke-dasharray: 700; animation: lg-ecg 3.5s linear infinite; }
        .lg-btn { position: relative; overflow: hidden; }
        .lg-btn::after { content: ""; position: absolute; inset: 0; width: 35%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent); transform: translateX(-120%) skewX(-20deg); }
        .lg-btn:hover::after { animation: lg-shine .9s ease-out; }
      `}</style>

      {/* Panel institucional */}
      <div className="gradient-deep relative hidden overflow-hidden p-12 text-deep-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="lg-orb pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-white/10 blur-3xl" />
        <div className="lg-orb-b pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="flex size-11 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-white/25">
            <img src={logoClinica} alt="" className="size-full object-cover" />
          </span>
          <div className="leading-tight">
            <p className="font-semibold">HEGO</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-deep-foreground/70">Especialidades médicas</p>
          </div>
        </div>

        <div className="relative space-y-6">
          <h2 className="max-w-md text-4xl font-semibold leading-tight">Toda la clínica, en un solo panel.</h2>
          <p className="max-w-md text-deep-foreground/75">
            Gestión de turnos, finanzas, permisos por área y auditoría completa de cada movimiento.
          </p>
          <ul className="grid max-w-md gap-3 text-sm">
            <li className="flex items-center gap-3"><CalendarCheck className="size-5" /> Agenda y turnos</li>
            <li className="flex items-center gap-3"><Wallet className="size-5" /> Finanzas e ingresos</li>
            <li className="flex items-center gap-3"><KeyRound className="size-5" /> Permisos por departamento</li>
            <li className="flex items-center gap-3"><ClipboardList className="size-5" /> Auditoría de todas las acciones</li>
          </ul>
        </div>

        <Electro latidos={3} grilla={false} color="#ffffff" className="relative h-12 w-full max-w-md" />
      </div>

      {/* Formulario */}
      <div className="flex min-h-screen flex-col px-6 py-8 sm:px-12">
        <Link to="/" className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" /> Volver al sitio
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="lg-up space-y-2" style={{ animationDelay: ".05s" }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-primary">
              <ShieldCheck className="size-3.5" /> Acceso restringido
            </span>
            <h1 className="text-3xl font-semibold">{primera ? "Creá tu contraseña" : rol === "enfermeria" ? "Enfermería – Triage" : "Panel administrativo"}</h1>
            <p className="text-sm text-muted-foreground">
              {primera
                ? "Es tu primer ingreso. Elegí una contraseña personal para entrar al panel."
                : "Seleccioná tu usuario e ingresá tu contraseña."}
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-6">
            <div className="lg-up grid grid-cols-2 gap-1 rounded-2xl bg-secondary p-1" style={{ animationDelay: ".1s" }} role="tablist">
              {([["medico", "Médicos", Stethoscope], ["enfermeria", "Equipo", Syringe]] as const).map(([r, l, Ic]) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={rol === r}
                  onClick={() => cambiarRol(r)}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${rol === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Ic className="size-4" /> {l}
                </button>
              ))}
            </div>

            <div className="lg-up grid gap-3" style={{ animationDelay: ".15s" }}>
              {(rol === "medico" ? ADMINS.map((a) => ({ id: a.id, nombre: a.nombre, sub: "Médico · Administrador" })) : enfermeras.map((e) => ({ id: e.id, nombre: e.nombre, sub: tieneClave(e.id) ? areaDe(e) : `${areaDe(e)} · primer ingreso` }))).map((a) => {
                const activo = a.id === adminId;
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => setAdminId(a.id)}
                    className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-card ${
                      activo ? "border-primary bg-secondary/60 ring-4 ring-primary/10" : "border-border bg-card"
                    }`}
                  >
                    <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors ${activo ? "gradient-deep text-deep-foreground" : "bg-secondary text-primary"}`}>
                      {rol === "medico" ? <Stethoscope className="size-5" /> : <Syringe className="size-5" />}
                    </span>
                    <span className="leading-tight">
                      <span className="block font-semibold">{a.nombre}</span>
                      <span className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{a.sub}</span>
                    </span>
                  </button>
                );
              })}
              {rol === "enfermeria" && enfermeras.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Todavía no hay personal habilitado en esta computadora.</p>
                  <ol className="mx-auto mt-3 max-w-xs space-y-1.5 text-left">
                    <li>1. Un médico entra a <b>Permisos y accesos</b> → <b>Personal y accesos</b>.</li>
                    <li>2. Da de alta a la persona y elige su área (Enfermería, Recepción…).</li>
                    <li>3. Le envía el <b>link de invitación</b> por WhatsApp.</li>
                    <li>4. La persona abre el link, crea su contraseña y entra.</li>
                  </ol>
                  <button type="button" onClick={() => cambiarRol("medico")} className="mt-4 text-sm font-semibold text-primary hover:underline">Ingresar como médico</button>
                </div>
              )}
            </div>

            {(rol === "medico" || enfermeras.length > 0) && (<>
            <div className="lg-up space-y-1.5" style={{ animationDelay: ".25s" }}>
              <label htmlFor="password" className="text-sm font-medium">
                {primera ? "Nueva contraseña" : "Contraseña"}
              </label>
              <div className="group relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  required
                  autoComplete={primera ? "new-password" : "current-password"}
                  placeholder={primera ? "Mínimo 6 caracteres" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {primera && (
              <div className="lg-up space-y-1.5" style={{ animationDelay: ".05s" }}>
                <label htmlFor="password2" className="text-sm font-medium">Repetir contraseña</label>
                <div className="group relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    id="password2"
                    type={show ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Repetí la contraseña"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            <div className="lg-up" style={{ animationDelay: ".35s" }}>
              <Button type="submit" size="lg" disabled={loading} className="lg-btn h-12 w-full rounded-xl transition-transform hover:-translate-y-0.5 active:translate-y-0">
                {loading ? "Verificando..." : primera ? "Crear contraseña e ingresar" : "Ingresar al panel"}
              </Button>
            </div>
            </>)}
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Acceso solo para médicos y personal de enfermería habilitado. Cada ingreso queda registrado en la auditoría.
          </p>
        </div>
      </div>
    </div>
  );
}