import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  Download,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
type Turno = { id: string; fecha: string; hora: string; paciente: string; doctor: string; motivo: string; estado: Estado };
type Mov = { id: string; fecha: string; concepto: string; tipo: "Ingreso" | "Egreso"; monto: number };
type Nivel = "ninguno" | "ver" | "editar";
type Permisos = Record<string, Record<string, Nivel>>;
type Tab = "resumen" | "turnos" | "finanzas" | "permisos" | "auditoria";
type LogFn = (accion: string, detalle?: string) => void;

const ESTADOS: Estado[] = ["Pendiente", "Confirmado", "Atendido", "Cancelado"];
const MODULOS = ["Turnos", "Pacientes", "Finanzas", "Auditoría", "Permisos"];
const AREAS = ["Recepción", "Enfermería", "Administración", "Estudios y laboratorio", "Facturación"];
const NIVELES: Record<Nivel, string> = { ninguno: "Sin acceso", ver: "Solo ver", editar: "Ver y editar" };

const ESTADO_CLASE: Record<Estado, string> = {
  Pendiente: "bg-amber-100 text-amber-800",
  Confirmado: "bg-secondary text-primary",
  Atendido: "bg-emerald-100 text-emerald-800",
  Cancelado: "bg-red-100 text-red-800",
};

const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const uid = () => Math.random().toString(36).slice(2, 10);
const dinero = (n: number) => "$ " + n.toLocaleString("es-AR");
const fechaCorta = (iso: string) => iso.split("-").reverse().join("/");
const fechaHora = (iso: string) => new Date(iso).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });

const SEED_TURNOS: Turno[] = [
  { id: "t1", fecha: hoy(), hora: "09:00", paciente: "María Fernández", doctor: ADMINS[0]!.nombre, motivo: "Control cardiológico", estado: "Confirmado" },
  { id: "t2", fecha: hoy(), hora: "10:30", paciente: "Carlos Benítez", doctor: ADMINS[1]!.nombre, motivo: "Consulta de nefrología", estado: "Confirmado" },
  { id: "t3", fecha: hoy(), hora: "11:30", paciente: "Lucía Ramos", doctor: ADMINS[0]!.nombre, motivo: "Ecocardiograma", estado: "Pendiente" },
  { id: "t4", fecha: hoy(), hora: "15:00", paciente: "Jorge Almada", doctor: ADMINS[1]!.nombre, motivo: "Medicina interna", estado: "Pendiente" },
];

const SEED_MOVS: Mov[] = [
  { id: "m1", fecha: hoy(), concepto: "Consultas de la mañana", tipo: "Ingreso", monto: 185000 },
  { id: "m2", fecha: hoy(), concepto: "Estudios de ecocardiografía", tipo: "Ingreso", monto: 120000 },
  { id: "m3", fecha: hoy(), concepto: "Insumos médicos", tipo: "Egreso", monto: 48000 },
  { id: "m4", fecha: hoy(), concepto: "Servicios del consultorio", tipo: "Egreso", monto: 32000 },
];

const mk = (p: Partial<Record<string, Nivel>>): Record<string, Nivel> =>
  Object.fromEntries(MODULOS.map((m) => [m, p[m] ?? "ninguno"])) as Record<string, Nivel>;

const SEED_PERMISOS: Permisos = {
  "Recepción": mk({ Turnos: "editar", Pacientes: "ver" }),
  "Enfermería": mk({ Turnos: "ver", Pacientes: "editar" }),
  "Administración": mk({ Turnos: "editar", Pacientes: "ver", Finanzas: "ver" }),
  "Estudios y laboratorio": mk({ Turnos: "ver", Pacientes: "ver" }),
  "Facturación": mk({ Turnos: "ver", Finanzas: "editar" }),
};

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
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15";

const NAV: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "turnos", label: "Turnos", icon: CalendarDays },
  { id: "finanzas", label: "Finanzas", icon: Wallet },
  { id: "permisos", label: "Permisos", icon: KeyRound },
  { id: "auditoria", label: "Auditoría", icon: ClipboardList },
];

const TITULOS: Record<Tab, [string, string]> = {
  resumen: ["Resumen general", "Vista rápida de la actividad de la clínica."],
  turnos: ["Turnos", "Creá y gestioná la agenda de los profesionales."],
  finanzas: ["Finanzas", "Ingresos, egresos y balance de la clínica."],
  permisos: ["Permisos", "Definí qué puede hacer cada departamento."],
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

  useEffect(() => {
    const s = sesionActual();
    if (!s) {
      navigate({ to: "/login" });
      return;
    }
    setUser(s);
    setAudit(leerAuditoria());
  }, [navigate]);

  if (!user) return null;

  const log: LogFn = (accion, detalle = "") => setAudit(auditar(user.nombre, accion, detalle));
  const salir = () => {
    log("Cierre de sesión");
    cerrarSesion();
    navigate({ to: "/login" });
  };
  const [titulo, subtitulo] = TITULOS[tab];

  return (
    <div className="min-h-screen bg-secondary/40 lg:grid lg:grid-cols-[260px_1fr]">
      <style>{`
        @keyframes pn-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .pn-up { animation: pn-up .55s ease-out both; }
      `}</style>

      <aside className="gradient-deep text-deep-foreground lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="flex items-center justify-between gap-3 p-4 lg:p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/10">
              <Activity className="size-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Gómez Bolaño</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-deep-foreground/70">Administración</p>
            </div>
          </div>
          <button onClick={salir} aria-label="Cerrar sesión" className="rounded-lg p-2 text-deep-foreground/80 hover:bg-white/10 lg:hidden">
            <LogOut className="size-5" />
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === n.id ? "bg-white/15 text-deep-foreground" : "text-deep-foreground/70 hover:bg-white/10 hover:text-deep-foreground"
              }`}
            >
              <n.icon className="size-4" /> {n.label}
            </button>
          ))}
        </nav>

        <div className="hidden space-y-3 border-t border-white/10 p-5 lg:block">
          <div className="leading-tight">
            <p className="text-sm font-semibold">{user.nombre}</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-deep-foreground/60">Administrador</p>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline" className="flex-1 border-white/30 bg-white/10 text-deep-foreground hover:bg-white/20">
              <Link to="/">Ver sitio</Link>
            </Button>
            <Button size="sm" variant="outline" onClick={salir} className="flex-1 border-white/30 bg-white/10 text-deep-foreground hover:bg-white/20">
              <LogOut className="size-4" /> Salir
            </Button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 p-4 sm:p-8">
        <div className="pn-up mb-6">
          <h1 className="text-2xl font-semibold sm:text-3xl">{titulo}</h1>
          <p className="text-sm text-muted-foreground">{subtitulo}</p>
        </div>

        {tab === "resumen" && <Resumen turnos={turnos} movs={movs} audit={audit} />}
        {tab === "turnos" && <TurnosTab turnos={turnos} setTurnos={setTurnos} log={log} />}
        {tab === "finanzas" && <FinanzasTab movs={movs} setMovs={setMovs} log={log} />}
        {tab === "permisos" && <PermisosTab permisos={permisos} setPermisos={setPermisos} log={log} user={user} />}
        {tab === "auditoria" && <AuditoriaTab audit={audit} log={log} />}
      </main>
    </div>
  );
}

/* ---------- Componentes comunes ---------- */
function Kpi({ icon: Icon, label, value, delay = 0 }: { icon: LucideIcon; label: string; value: string; delay?: number }) {
  return (
    <Card className="pn-up shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated" style={{ animationDelay: `${delay}s` }}>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-2xl font-semibold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Estadito({ estado }: { estado: Estado }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${ESTADO_CLASE[estado]}`}>{estado}</span>;
}

/* ---------- Resumen ---------- */
function Resumen({ turnos, movs, audit }: { turnos: Turno[]; movs: Mov[]; audit: Evento[] }) {
  const h = hoy();
  const turnosHoy = turnos.filter((t) => t.fecha === h && t.estado !== "Cancelado").length;
  const pendientes = turnos.filter((t) => t.estado === "Pendiente").length;
  const balance = movs.reduce((acc, m) => acc + (m.tipo === "Ingreso" ? m.monto : -m.monto), 0);
  const eventosHoy = audit.filter((e) => e.fecha.slice(0, 10) === h || new Date(e.fecha).toDateString() === new Date().toDateString()).length;
  const proximos = [...turnos]
    .filter((t) => t.estado === "Pendiente" || t.estado === "Confirmado")
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={CalendarDays} label="Turnos de hoy" value={String(turnosHoy)} delay={0.05} />
        <Kpi icon={Users} label="Turnos pendientes" value={String(pendientes)} delay={0.1} />
        <Kpi icon={Wallet} label="Balance acumulado" value={dinero(balance)} delay={0.15} />
        <Kpi icon={ClipboardList} label="Eventos de hoy" value={String(eventosHoy)} delay={0.2} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="pn-up shadow-card" style={{ animationDelay: ".25s" }}>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Próximos turnos</h2>
            <div className="mt-3 divide-y divide-border">
              {proximos.length === 0 && <p className="py-4 text-sm text-muted-foreground">No hay turnos próximos.</p>}
              {proximos.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{t.paciente}</p>
                    <p className="text-sm text-muted-foreground">{fechaCorta(t.fecha)} · {t.hora} · {t.motivo}</p>
                  </div>
                  <Estadito estado={t.estado} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="pn-up shadow-card" style={{ animationDelay: ".3s" }}>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Actividad reciente</h2>
            <div className="mt-3 divide-y divide-border">
              {audit.length === 0 && <p className="py-4 text-sm text-muted-foreground">Todavía no hay actividad.</p>}
              {audit.slice(0, 6).map((e) => (
                <div key={e.id} className="py-3">
                  <p className="text-sm font-medium">{e.accion}</p>
                  <p className="text-xs text-muted-foreground">{e.usuario} · {fechaHora(e.fecha)}{e.detalle ? ` · ${e.detalle}` : ""}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Turnos ---------- */
function TurnosTab({ turnos, setTurnos, log }: { turnos: Turno[]; setTurnos: Dispatch<SetStateAction<Turno[]>>; log: LogFn }) {
  const [f, setF] = useState({ fecha: hoy(), hora: "09:00", paciente: "", doctor: ADMINS[0]!.nombre, motivo: "" });
  const [filtro, setFiltro] = useState<"Todos" | Estado>("Todos");

  const lista = useMemo(
    () =>
      [...turnos]
        .filter((t) => filtro === "Todos" || t.estado === filtro)
        .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora)),
    [turnos, filtro],
  );

  const agregar = (e: FormEvent) => {
    e.preventDefault();
    const nuevo: Turno = { id: uid(), ...f, paciente: f.paciente.trim(), motivo: f.motivo.trim(), estado: "Pendiente" };
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

  return (
    <div className="space-y-6">
      <Card className="pn-up shadow-card">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold">Nuevo turno</h2>
          <form onSubmit={agregar} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <input type="date" required value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} className={inp} />
            <input type="time" required value={f.hora} onChange={(e) => setF({ ...f, hora: e.target.value })} className={inp} />
            <input required placeholder="Paciente" value={f.paciente} onChange={(e) => setF({ ...f, paciente: e.target.value })} className={inp + " lg:col-span-2"} />
            <select value={f.doctor} onChange={(e) => setF({ ...f, doctor: e.target.value })} className={inp + " lg:col-span-2"}>
              {ADMINS.map((a) => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
            </select>
            <input required placeholder="Motivo de la consulta" value={f.motivo} onChange={(e) => setF({ ...f, motivo: e.target.value })} className={inp + " sm:col-span-2 lg:col-span-5"} />
            <Button type="submit"><Plus className="size-4" /> Crear</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="pn-up shadow-card" style={{ animationDelay: ".1s" }}>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Agenda ({lista.length})</h2>
            <select value={filtro} onChange={(e) => setFiltro(e.target.value as "Todos" | Estado)} className={inp + " !w-auto"}>
              <option value="Todos">Todos los estados</option>
              {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">Fecha</th>
                  <th className="py-2 pr-3">Paciente</th>
                  <th className="py-2 pr-3">Profesional</th>
                  <th className="py-2 pr-3">Motivo</th>
                  <th className="py-2 pr-3">Estado</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lista.length === 0 && (
                  <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">No hay turnos.</td></tr>
                )}
                {lista.map((t) => (
                  <tr key={t.id}>
                    <td className="py-3 pr-3 font-medium">{fechaCorta(t.fecha)} · {t.hora}</td>
                    <td className="py-3 pr-3">{t.paciente}</td>
                    <td className="py-3 pr-3 text-muted-foreground">{t.doctor}</td>
                    <td className="py-3 pr-3 text-muted-foreground">{t.motivo}</td>
                    <td className="py-3 pr-3">
                      <select value={t.estado} onChange={(e) => cambiarEstado(t, e.target.value as Estado)} className={`rounded-full border-0 px-3 py-1 text-xs font-medium outline-none ${ESTADO_CLASE[t.estado]}`}>
                        {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => borrar(t)} aria-label="Eliminar turno" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- Finanzas ---------- */
function FinanzasTab({ movs, setMovs, log }: { movs: Mov[]; setMovs: Dispatch<SetStateAction<Mov[]>>; log: LogFn }) {
  const [f, setF] = useState({ fecha: hoy(), concepto: "", tipo: "Ingreso" as Mov["tipo"], monto: "" });
  const ingresos = movs.filter((m) => m.tipo === "Ingreso").reduce((a, m) => a + m.monto, 0);
  const egresos = movs.filter((m) => m.tipo === "Egreso").reduce((a, m) => a + m.monto, 0);
  const total = ingresos + egresos;
  const pct = total === 0 ? 50 : Math.round((ingresos / total) * 100);
  const lista = [...movs].sort((a, b) => b.fecha.localeCompare(a.fecha));

  const agregar = (e: FormEvent) => {
    e.preventDefault();
    const monto = Number(f.monto);
    if (!monto || monto <= 0) return toast.error("Ingresá un monto válido.");
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi icon={TrendingUp} label="Ingresos" value={dinero(ingresos)} delay={0.05} />
        <Kpi icon={TrendingDown} label="Egresos" value={dinero(egresos)} delay={0.1} />
        <Kpi icon={Wallet} label="Balance" value={dinero(ingresos - egresos)} delay={0.15} />
      </div>

      <Card className="pn-up shadow-card" style={{ animationDelay: ".2s" }}>
        <CardContent className="space-y-3 p-6">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Ingresos {pct}%</span>
            <span className="font-medium text-muted-foreground">Egresos {100 - pct}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-red-100">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </CardContent>
      </Card>

      <Card className="pn-up shadow-card" style={{ animationDelay: ".25s" }}>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold">Registrar movimiento</h2>
          <form onSubmit={agregar} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <input type="date" required value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} className={inp} />
            <input required placeholder="Concepto" value={f.concepto} onChange={(e) => setF({ ...f, concepto: e.target.value })} className={inp + " lg:col-span-2"} />
            <select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value as Mov["tipo"] })} className={inp}>
              <option value="Ingreso">Ingreso</option>
              <option value="Egreso">Egreso</option>
            </select>
            <input required type="number" min="1" placeholder="Monto" value={f.monto} onChange={(e) => setF({ ...f, monto: e.target.value })} className={inp} />
            <Button type="submit" className="sm:col-span-2 lg:col-span-5 lg:w-fit"><Plus className="size-4" /> Registrar</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="pn-up shadow-card" style={{ animationDelay: ".3s" }}>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold">Movimientos</h2>
          <div className="mt-3 divide-y divide-border">
            {lista.length === 0 && <p className="py-4 text-sm text-muted-foreground">No hay movimientos.</p>}
            {lista.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{m.concepto}</p>
                  <p className="text-sm text-muted-foreground">{fechaCorta(m.fecha)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${m.tipo === "Ingreso" ? "text-emerald-600" : "text-red-600"}`}>
                    {m.tipo === "Ingreso" ? "+" : "−"} {dinero(m.monto)}
                  </span>
                  <button onClick={() => borrar(m)} aria-label="Eliminar movimiento" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- Permisos ---------- */
function PermisosTab({ permisos, setPermisos, log, user }: { permisos: Permisos; setPermisos: Dispatch<SetStateAction<Permisos>>; log: LogFn; user: SessionUser }) {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");

  const cambiar = (area: string, modulo: string, nivel: Nivel) => {
    setPermisos((p) => ({ ...p, [area]: { ...p[area], [modulo]: nivel } }));
    log("Permiso modificado", `${area} · ${modulo}: ${NIVELES[nivel]}`);
  };

  const guardarClave = async (e: FormEvent) => {
    e.preventDefault();
    const res = await cambiarClave(user.id, actual, nueva);
    if (!res.ok) return toast.error(res.error);
    log("Contraseña cambiada", "Cambio de contraseña del administrador");
    toast.success("Contraseña actualizada.");
    setActual("");
    setNueva("");
  };

  return (
    <div className="space-y-6">
      <Card className="pn-up shadow-card">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold">Permisos por departamento</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Los administradores (Dr. Alberto y Dr. Alonso) tienen acceso total y no se pueden modificar.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">Departamento</th>
                  {MODULOS.map((m) => <th key={m} className="py-2 pr-3">{m}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {AREAS.map((area) => (
                  <tr key={area}>
                    <td className="py-3 pr-3 font-medium">{area}</td>
                    {MODULOS.map((m) => (
                      <td key={m} className="py-3 pr-3">
                        <select
                          value={permisos[area]?.[m] ?? "ninguno"}
                          onChange={(e) => cambiar(area, m, e.target.value as Nivel)}
                          className={`h-9 rounded-lg border border-input bg-background px-2 text-xs outline-none focus:border-primary ${
                            permisos[area]?.[m] === "editar" ? "text-primary" : permisos[area]?.[m] === "ver" ? "" : "text-muted-foreground"
                          }`}
                        >
                          {(Object.keys(NIVELES) as Nivel[]).map((n) => <option key={n} value={n}>{NIVELES[n]}</option>)}
                        </select>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="pn-up shadow-card" style={{ animationDelay: ".1s" }}>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold">Seguridad</h2>
          <p className="mt-1 text-sm text-muted-foreground">Cambiá tu contraseña de administrador ({user.nombre}).</p>
          <form onSubmit={guardarClave} className="mt-4 grid gap-3 sm:grid-cols-3">
            <input type="password" required placeholder="Contraseña actual" value={actual} onChange={(e) => setActual(e.target.value)} className={inp} />
            <input type="password" required placeholder="Nueva contraseña" value={nueva} onChange={(e) => setNueva(e.target.value)} className={inp} />
            <Button type="submit">Guardar contraseña</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- Auditoría ---------- */
function AuditoriaTab({ audit, log }: { audit: Evento[]; log: LogFn }) {
  const [q, setQ] = useState("");
  const lista = audit.filter((e) => `${e.usuario} ${e.accion} ${e.detalle}`.toLowerCase().includes(q.toLowerCase()));

  const exportar = () => {
    const filas = [
      ["Fecha", "Usuario", "Acción", "Detalle"],
      ...lista.map((e) => [fechaHora(e.fecha), e.usuario, e.accion, e.detalle]),
    ];
    const csv = filas.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "auditoria.csv";
    a.click();
    URL.revokeObjectURL(url);
    log("Auditoría exportada", `${lista.length} eventos a CSV`);
  };

  return (
    <Card className="pn-up shadow-card">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Eventos ({lista.length})</h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} className={inp + " pl-9 sm:w-64"} />
            </div>
            <Button variant="outline" onClick={exportar}><Download className="size-4" /> Exportar CSV</Button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Fecha y hora</th>
                <th className="py-2 pr-3">Usuario</th>
                <th className="py-2 pr-3">Acción</th>
                <th className="py-2">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lista.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">No hay eventos.</td></tr>
              )}
              {lista.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap py-3 pr-3 text-muted-foreground">{fechaHora(e.fecha)}</td>
                  <td className="py-3 pr-3">{e.usuario}</td>
                  <td className="py-3 pr-3 font-medium">{e.accion}</td>
                  <td className="py-3 text-muted-foreground">{e.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}