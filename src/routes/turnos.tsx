import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  MessageCircle,
  ShieldCheck,
  Stethoscope,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHero, PublicLayout, waLink } from "@/components/site/PublicLayout";
import { DOCTORS, ESPECIALIDADES, fotoDoctor, iconoEspecialidad } from "@/data/clinic";
import { ADMINS, KEY_AGENDA, agendaDe, atiendeEl, auditar, horariosDelDia, proximosDias, resumenAgenda, proximoDiaTexto, profesionalesAgenda, useDato, type Agendas, ocupadosServidor, reservarTurnoWeb } from "@/lib/auth-local";

type Busqueda = { doctor?: string | undefined; especialidad?: string | undefined };

export const Route = createFileRoute("/turnos")({
  validateSearch: (s: Record<string, unknown>): Busqueda => ({
    doctor: typeof s["doctor"] === "string" ? s["doctor"] : undefined,
    especialidad: typeof s["especialidad"] === "string" ? s["especialidad"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Solicitar cita | HEGO · Centro de especialidades médicas" },
      { name: "description", content: "Reserva tu cita en línea: elige especialidad, profesional, día y horario." },
    ],
  }),
  component: Turnos,
});

type TurnoGuardado = {
  id: string;
  fecha: string;
  hora: string;
  paciente: string;
  doctor: string;
  motivo: string;
  estado: "Pendiente" | "Confirmado" | "Atendido" | "Cancelado";
  telefono?: string;
  email?: string;
  origen?: "web" | "panel";
};

const KEY = "gb_turnos";
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const PASOS = ["Especialidad", "Profesional", "Día y hora", "Tus datos"];

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const leer = (): TurnoGuardado[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as TurnoGuardado[];
  } catch {
    return [];
  }
};
const nombrePanel = (doctorId: string) => {
  const d = DOCTORS.find((x) => x.id === doctorId);
  return ADMINS.find((a) => a.id === d?.foto)?.nombre ?? d?.nombre ?? "";
};

type Prof = { id: string; nombre: string; titulo: string; img: string | null; agendaId: string; panel: string; esp: string | null };

const inp =
  "h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15";

function Turnos() {
  const search = Route.useSearch();
  const [paso, setPaso] = useState(0);
  const [esp, setEsp] = useState<string | null>(null);
  const [doc, setDoc] = useState<string | null>(null);
  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [datos, setDatos] = useState({ nombre: "", telefono: "", email: "", comentario: "" });
  const [ocupados, setOcupados] = useState<TurnoGuardado[]>([]);
  const [listo, setListo] = useState<TurnoGuardado | null>(null);
  const [agendas] = useDato<Agendas>(KEY_AGENDA, {});

  // Preselección desde los links (?especialidad= o ?doctor=)
  useEffect(() => {
    if (search.especialidad && ESPECIALIDADES.some((e) => e.slug === search.especialidad)) {
      setEsp(search.especialidad);
      setPaso(1);
    }
    if (search.doctor && DOCTORS.some((d) => d.id === search.doctor)) {
      const d = search.doctor;
      setDoc(d);
      const primera = ESPECIALIDADES.find((e) => e.doctorIds.includes(d));
      setEsp((prev) => prev ?? primera?.slug ?? null);
      setPaso(2);
    }
    setOcupados(leer());
    void refrescarOcupados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.doctor, search.especialidad]);

  /** Con backend: trae los horarios tomados del servidor (sin datos de pacientes). */
  const refrescarOcupados = async () => {
    const r = await ocupadosServidor(iso(new Date()));
    if (r) setOcupados(r.map((x, i) => ({ id: `o${i}`, ...x, paciente: "", motivo: "", estado: "Pendiente" as const })));
  };

  const especialidad = ESPECIALIDADES.find((e) => e.slug === esp);
  // Profesionales: los dos médicos y los que la secretaría agregó a la agenda
  const todos: Prof[] = useMemo(
    () => [
      ...DOCTORS.map((d) => ({ id: d.id, nombre: d.nombre, titulo: d.titulo, img: fotoDoctor(d.foto), agendaId: d.foto, panel: nombrePanel(d.id), esp: null as string | null })),
      ...profesionalesAgenda(agendas)
        .filter((p) => !p.admin)
        .map((p) => ({ id: p.id, nombre: p.nombre, titulo: p.especialidad, img: null, agendaId: p.id, panel: p.nombre, esp: p.especialidad })),
    ],
    [agendas],
  );
  const doctor = todos.find((d) => d.id === doc);
  const sinTilde = (x: string) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const doctoresDisp = especialidad
    ? todos.filter((d) => (d.esp === null ? especialidad.doctorIds.includes(d.id) : sinTilde(d.esp) === sinTilde(especialidad.nombre)))
    : todos;

  const agenda = doctor ? agendaDe(agendas, doctor.agendaId) : null;
  const fechas = useMemo(() => (agenda ? proximosDias(agenda, 15).map((f) => new Date(f + "T12:00:00")) : ([] as Date[])), [agenda]);

  const horarios = useMemo(() => {
    if (!doctor || !fecha || !agenda || !atiendeEl(agenda, fecha)) return [] as { h: string; libre: boolean }[];
    const nom = doctor.panel;
    const ahora = new Date();
    const esHoy = fecha === iso(ahora);
    const hhmm = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
    return horariosDelDia(agenda, fecha).map((h) => ({
      h,
      libre: !ocupados.some((t) => t.doctor === nom && t.fecha === fecha && t.hora === h && t.estado !== "Cancelado") && !(esHoy && h <= hhmm),
    }));
  }, [doctor, fecha, ocupados, agenda]);

  const confirmar = async (e: FormEvent) => {
    e.preventDefault();
    if (!doctor || !fecha || !hora || !especialidad) return;
    const nom = doctor.panel;
    const motivo = especialidad.nombre + (datos.comentario.trim() ? ` · ${datos.comentario.trim()}` : "");
    const r = await reservarTurnoWeb({ fecha, hora, paciente: datos.nombre.trim(), doctor: nom, motivo, telefono: datos.telefono.trim(), email: datos.email.trim() });
    if (r) {
      if (!r.ok) {
        toast.error(r.error);
        void refrescarOcupados();
        setHora(null);
        setPaso(2);
        return;
      }
      setListo({ id: "web", fecha, hora, paciente: datos.nombre.trim(), doctor: nom, motivo, estado: "Pendiente", telefono: datos.telefono.trim(), email: datos.email.trim(), origen: "web" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const actuales = leer();
    if (actuales.some((t) => t.doctor === nom && t.fecha === fecha && t.hora === hora && t.estado !== "Cancelado")) {
      toast.error("Ese horario se acaba de ocupar. Elige otro, por favor.");
      setOcupados(actuales);
      setHora(null);
      setPaso(2);
      return;
    }
    const nuevo: TurnoGuardado = {
      id: Math.random().toString(36).slice(2, 10),
      fecha,
      hora,
      paciente: datos.nombre.trim(),
      doctor: nom,
      motivo: especialidad.nombre + (datos.comentario.trim() ? ` · ${datos.comentario.trim()}` : ""),
      estado: "Pendiente",
      telefono: datos.telefono.trim(),
      email: datos.email.trim(),
      origen: "web",
    };
    localStorage.setItem(KEY, JSON.stringify([...actuales, nuevo]));
    auditar("Web", "Cita solicitada desde la web", `${nuevo.paciente} · ${fecha.split("-").reverse().join("/")} ${hora} · ${nom}`);
    setListo(nuevo);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fechaTxt = (f: string) =>
    new Date(f + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

  if (listo) {
    const msg = `Hola, solicité una cita desde la web:\n• Paciente: ${listo.paciente}\n• ${especialidad?.nombre}\n• ${doctor?.nombre}\n• ${fechaTxt(listo.fecha)} a las ${listo.hora}\n¿Me lo confirman? Gracias.`;
    return (
      <PublicLayout>
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-dots opacity-60 [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_70%)]" />
          <div className="relative mx-auto max-w-xl px-4 text-center animate-in fade-in zoom-in-95 duration-700">
            <span className="mx-auto flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-[0_20px_50px_-15px_rgba(16,185,129,.7)]">
              <CheckCircle2 className="size-12" />
            </span>
            <h1 className="mt-8 text-4xl sm:text-5xl">¡Cita solicitada!</h1>
            <p className="mt-3 text-muted-foreground">Te vamos a contactar para confirmarlo. Si quieres, envíanos el detalle por WhatsApp para agilizar.</p>
            <div className="mt-8 space-y-3 rounded-3xl border border-border bg-card p-6 text-left shadow-elevated">
              {[
                { icon: User, t: listo.paciente },
                { icon: Stethoscope, t: `${especialidad?.nombre} · ${doctor?.nombre}` },
                { icon: CalendarDays, t: fechaTxt(listo.fecha) },
                { icon: Clock, t: `${listo.hora} hs` },
              ].map((x) => (
                <p key={x.t} className="flex items-center gap-3 text-sm"><span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary"><x.icon className="size-4" /></span>{x.t}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-full !bg-[#25D366] px-6 text-white hover:!bg-[#1ebe5b]">
                <a href={waLink(msg)} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> Enviar por WhatsApp</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6"><Link to="/">Volver al inicio</Link></Button>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  const puedeSeguir = [!!esp, !!doc, !!fecha && !!hora, true][paso];

  return (
    <PublicLayout>
      <PageHero
        kicker="Citas en línea"
        title={<>Reserva tu cita en <span className="text-shine italic">4 pasos</span></>}
        text="Elige la especialidad, el profesional y el horario que te queden mejor."
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Solicitar cita" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        {/* Progreso */}
        <div className="mb-10 grid grid-cols-4 gap-2 sm:gap-4">
          {PASOS.map((p, i) => (
            <button
              key={p}
              type="button"
              disabled={i > paso}
              onClick={() => i < paso && setPaso(i)}
              className="group text-left disabled:cursor-default"
            >
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className={`h-full rounded-full bg-gradient-to-r from-[var(--clinic)] to-[var(--deep)] transition-all duration-700 ${i <= paso ? "w-full" : "w-0"}`} />
              </div>
              <p className={`mt-2 flex items-center gap-1.5 text-xs font-medium sm:text-sm ${i <= paso ? "text-foreground" : "text-muted-foreground"}`}>
                <span className={`hidden size-5 items-center justify-center rounded-full text-[10px] sm:flex ${i < paso ? "bg-emerald-500 text-white" : i === paso ? "gradient-deep text-white" : "bg-secondary"}`}>
                  {i < paso ? <Check className="size-3" /> : i + 1}
                </span>
                {p}
              </p>
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div key={paso} className="min-w-0 animate-in fade-in slide-in-from-right-4 duration-500">
            {paso === 0 && (
              <div>
                <h2 className="text-2xl">¿Qué especialidad necesitas?</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {ESPECIALIDADES.map((e) => {
                    const I = iconoEspecialidad(e.icono);
                    const on = esp === e.slug;
                    return (
                      <button
                        key={e.slug}
                        type="button"
                        onClick={() => {
                          setEsp(e.slug);
                          setDoc(null);
                          setFecha(null);
                          setHora(null);
                        }}
                        className={`group flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${on ? "border-primary bg-secondary/60 shadow-elevated ring-4 ring-primary/10" : "border-border bg-card shadow-card hover:-translate-y-0.5 hover:border-primary/30"}`}
                      >
                        <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors ${on ? "gradient-deep text-white" : "bg-secondary text-primary"}`}><I className="size-5" /></span>
                        <span className="font-semibold leading-tight">{e.nombre}</span>
                        {on && <CheckCircle2 className="ml-auto size-5 shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {paso === 1 && (
              <div>
                <h2 className="text-2xl">Elige el profesional</h2>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {doctoresDisp.map((d) => {
                    const on = doc === d.id;
                    const ag = agendaDe(agendas, d.agendaId);
                    const sinAgenda = !ag.activo || proximosDias(ag, 15).length === 0;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        disabled={sinAgenda}
                        onClick={() => {
                          setDoc(d.id);
                          setFecha(null);
                          setHora(null);
                        }}
                        className={`group flex gap-5 overflow-hidden rounded-3xl border p-5 text-left transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${on ? "border-primary bg-secondary/60 shadow-elevated ring-4 ring-primary/10" : "border-border bg-card shadow-card hover:-translate-y-1 hover:border-primary/30"}`}
                      >
                        {d.img ? (
                          <img src={d.img} alt={d.nombre} className="h-28 w-24 shrink-0 rounded-2xl object-cover object-top" />
                        ) : (
                          <span className="flex h-28 w-24 shrink-0 items-center justify-center rounded-2xl gradient-deep font-display text-2xl text-white">{d.nombre.replace(/^(Dra?\.)\s*/, "").split(" ").slice(0, 2).map((x) => x[0]).join("")}</span>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold leading-tight">{d.nombre}</p>
                          <p className="mt-1 text-xs font-bold text-primary">{d.titulo}</p>
                          {sinAgenda ? (
                            <p className="mt-2 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">Sin citas en línea por ahora · pídelo por WhatsApp</p>
                          ) : (
                            <>
                              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{resumenAgenda(ag)}</p>
                              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                                <span className="size-1.5 rounded-full bg-emerald-500 pulse-dot" /> Próximo día: {proximoDiaTexto(ag)}
                              </p>
                            </>
                          )}
                        </div>
                        {on && <CheckCircle2 className="ml-auto size-6 shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {paso === 2 && (
              <div>
                <h2 className="text-2xl">Elige día y horario</h2>
                <div className="mt-6 flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                  {fechas.map((d) => {
                    const v = iso(d);
                    const on = fecha === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setFecha(v);
                          setHora(null);
                        }}
                        className={`flex w-20 shrink-0 flex-col items-center rounded-2xl border py-3 transition-all duration-300 ${on ? "border-transparent gradient-deep text-white shadow-lg" : "border-border bg-card hover:border-primary/40"}`}
                      >
                        <span className={`text-[11px] font-semibold uppercase ${on ? "text-white/75" : "text-muted-foreground"}`}>{DIAS[d.getDay()]!.slice(0, 3)}</span>
                        <span className="font-display text-2xl font-semibold">{d.getDate()}</span>
                        <span className={`text-[11px] ${on ? "text-white/75" : "text-muted-foreground"}`}>{d.toLocaleDateString("es-CO", { month: "short" }).replace(".", "")}</span>
                      </button>
                    );
                  })}
                </div>

                {agenda?.nota && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800 ring-1 ring-amber-100">{agenda.nota}</p>}
                {fechas.length === 0 && <p className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Este profesional no tiene días disponibles por ahora. Escríbenos por WhatsApp y te ayudamos.</p>}
                {!fecha && fechas.length > 0 && <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Selecciona un día para ver los horarios disponibles.</p>}
                {fecha && (
                  <div className="mt-8">
                    <p className="mb-3 text-sm font-medium capitalize text-muted-foreground">{fechaTxt(fecha)}</p>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
                      {horarios.map(({ h, libre }) => (
                        <button
                          key={h}
                          type="button"
                          disabled={!libre}
                          onClick={() => setHora(h)}
                          className={`rounded-xl border py-3 text-sm font-semibold tabular-nums transition-all duration-200 ${
                            !libre
                              ? "cursor-not-allowed border-border bg-secondary/50 text-muted-foreground/40 line-through"
                              : hora === h
                                ? "scale-105 border-transparent gradient-deep text-white shadow-lg"
                                : "border-border bg-card hover:border-primary/50 hover:text-primary"
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {paso === 3 && (
              <form id="form-turno" onSubmit={confirmar}>
                <h2 className="text-2xl">Completa tus datos</h2>
                <div className="mt-6 grid gap-4 rounded-3xl border border-border bg-card p-6 shadow-card sm:grid-cols-2">
                  <label className="space-y-1.5 sm:col-span-2"><span className="text-xs font-medium text-muted-foreground">Nombre y apellido *</span>
                    <input required value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} className={inp} /></label>
                  <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Teléfono / WhatsApp *</span>
                    <input required type="tel" value={datos.telefono} onChange={(e) => setDatos({ ...datos, telefono: e.target.value })} className={inp} /></label>
                  <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Email</span>
                    <input type="email" value={datos.email} onChange={(e) => setDatos({ ...datos, email: e.target.value })} className={inp} /></label>
                  <label className="space-y-1.5 sm:col-span-2"><span className="text-xs font-medium text-muted-foreground">Motivo de consulta (opcional)</span>
                    <textarea rows={3} value={datos.comentario} onChange={(e) => setDatos({ ...datos, comentario: e.target.value })} className={inp + " h-auto py-3"} /></label>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground sm:col-span-2"><ShieldCheck className="size-4 text-emerald-600" /> Tus datos se usan solo para gestionar la cita.</p>
                </div>
              </form>
            )}

            <div className="mt-8 flex items-center justify-between">
              <Button type="button" variant="ghost" disabled={paso === 0} onClick={() => setPaso((p) => p - 1)} className="rounded-full">
                <ArrowLeft className="size-4" /> Atrás
              </Button>
              {paso < 3 ? (
                <Button type="button" disabled={!puedeSeguir} onClick={() => setPaso((p) => p + 1)} className="btn-glow rounded-full px-7">
                  Continuar <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button type="submit" form="form-turno" className="btn-glow rounded-full px-7">
                  <CalendarCheck className="size-4" /> Confirmar cita
                </Button>
              )}
            </div>
          </div>

          {/* Resumen */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
              <div className="gradient-deep p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Tu cita</p>
                <p className="mt-1 font-display text-xl">{especialidad?.nombre ?? "Sin especialidad"}</p>
              </div>
              <div className="space-y-4 p-5 text-sm">
                <div className="flex items-center gap-3">
                  {doctor?.img ? (
                    <img src={doctor.img} alt="" className="size-11 rounded-xl object-cover object-top" />
                  ) : (
                    <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-muted-foreground"><Stethoscope className="size-5" /></span>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Profesional</p>
                    <p className="font-medium">{doctor?.nombre ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary"><CalendarDays className="size-5" /></span>
                  <div>
                    <p className="text-xs text-muted-foreground">Día</p>
                    <p className="font-medium capitalize">{fecha ? fechaTxt(fecha) : "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary"><Clock className="size-5" /></span>
                  <div>
                    <p className="text-xs text-muted-foreground">Horario</p>
                    <p className="font-medium">{hora ? `${hora} hs` : "—"}</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-border p-5 text-xs text-muted-foreground">
                ¿Prefieres hablar con alguien?{" "}
                <a href={waLink("Hola, quiero pedir una cita.")} target="_blank" rel="noreferrer" className="font-semibold text-emerald-600 hover:underline">Escríbenos por WhatsApp</a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
