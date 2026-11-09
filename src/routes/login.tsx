import { useEffect, useState, type FormEvent } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
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
import { ADMINS, crearClave, ingresar, listarEnfermeras, sesionActual, tieneClave, type Enfermera, type Rol } from "@/lib/auth-local";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acceso administrativo | Clínica Gómez Bolaño" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

const inputClass =
  "h-12 w-full rounded-xl border border-input bg-background pl-10 pr-11 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15";

function Login() {
  const navigate = useNavigate();
  const [rol, setRol] = useState<Rol>("medico");
  const [enfermeras, setEnfermeras] = useState<Enfermera[]>([]);
  const [adminId, setAdminId] = useState<string>(ADMINS[0]!.id);
  const [primera, setPrimera] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sesionActual()) navigate({ to: "/panel" });
    setEnfermeras(listarEnfermeras().filter((e) => e.activo));
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
  }, [adminId]);

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
          <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
            <Activity className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="font-semibold">Gómez Bolaño</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-deep-foreground/70">Clínica médica</p>
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

        <svg viewBox="0 0 600 60" className="relative h-12 w-full max-w-md text-white/70" aria-hidden="true">
          <polyline
            className="lg-ecg"
            points="0,30 80,30 100,10 120,50 140,30 220,30 240,5 260,55 280,30 380,30 400,14 420,46 440,30 600,30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
        </svg>
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
              {([["medico", "Médicos", Stethoscope], ["enfermeria", "Enfermería", Syringe]] as const).map(([r, l, Ic]) => (
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
              {(rol === "medico" ? ADMINS.map((a) => ({ id: a.id, nombre: a.nombre, sub: "Médico · Administrador" })) : enfermeras.map((e) => ({ id: e.id, nombre: e.nombre, sub: "Enfermería · Triage" }))).map((a) => {
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
                  Todavía no hay personal de enfermería habilitado. Un médico lo da de alta desde <b>Enfermería – Triage</b> en el panel.
                </div>
              )}
            </div>

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
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Acceso solo para médicos y personal de enfermería habilitado. Cada ingreso queda registrado en la auditoría.
          </p>
        </div>
      </div>
    </div>
  );
}