import { useState, type CSSProperties } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  CalendarCheck,
  CalendarPlus,
  ClipboardList,
  MessageCircle,
  Droplets,
  FlaskConical,
  HeartPulse,
  LineChart,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FondoEspecialidades, PageHero, PublicLayout, useReveal, waLink } from "@/components/site/PublicLayout";
import { DOCTORS, SERVICIOS, fotoDoctor } from "@/data/clinic";

export const Route = createFileRoute("/servicios")({
  head: () => ({
    meta: [
      { title: "Servicios | Clínica Gómez Bolaño" },
      { name: "description", content: "Consultas, evaluaciones y estudios de cada especialidad. Reservá tu turno online." },
    ],
  }),
  component: Servicios,
});

const ICONOS: Record<string, LucideIcon> = {
  stethoscope: Stethoscope,
  droplets: Droplets,
  heart: HeartPulse,
  activity: Activity,
  "flask-conical": FlaskConical,
  "clipboard-list": ClipboardList,
  "shield-check": ShieldCheck,
  "line-chart": LineChart,
  waves: Waves,
  users: Users,
  "calendar-check": CalendarCheck,
};

/** Color de acento por especialidad (mismo criterio que el inicio). */
const COLOR: Record<string, { c: string; c2: string }> = {
  "Medicina Interna": { c: "#10b981", c2: "#047857" },
  Nefrología: { c: "#0ea5e9", c2: "#0369a1" },
  Cardiología: { c: "#ef4444", c2: "#b91c1c" },
  Ecocardiografía: { c: "#8b5cf6", c2: "#6d28d9" },
};
const colorDe = (e: string) => COLOR[e] ?? { c: "#3b82f6", c2: "#1d4ed8" };

function Servicios() {
  const categorias = ["Todos", ...Array.from(new Set(SERVICIOS.map((s) => s.especialidad)))];
  const [cat, setCat] = useState("Todos");
  const [q, setQ] = useState("");
  const lista = SERVICIOS.filter(
    (s) => (cat === "Todos" || s.especialidad === cat) && `${s.nombre} ${s.descripcion} ${s.especialidad}`.toLowerCase().includes(q.toLowerCase()),
  );
  useReveal(cat + q);

  return (
    <PublicLayout>
      <PageHero
        kicker="Servicios"
        decoracion={<FondoEspecialidades />}
        title={<>Consultas y estudios con <span className="text-shine italic">turno online</span></>}
        text="Consultas y estudios de cada especialidad. El arancel y la cobertura de tu EPS o prepagada te los confirmamos al reservar."
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Servicios" }]}
      />

      <section className="relative mx-auto max-w-7xl px-4 py-14 lg:px-8">
        {/* Barra de filtros */}
        <div className="sticky top-20 z-20 -mx-2 mb-10 rounded-3xl border border-border/70 bg-card/80 p-2 shadow-[0_20px_50px_-35px_rgba(10,25,70,.6)] backdrop-blur-xl sm:mx-0">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex flex-1 gap-1.5 overflow-x-auto p-1 [scrollbar-width:none]">
              {categorias.map((c) => {
                const on = cat === c;
                const col = colorDe(c);
                const n = c === "Todos" ? SERVICIOS.length : SERVICIOS.filter((s) => s.especialidad === c).length;
                return (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${on ? "text-white shadow-lg" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                    style={on ? { background: c === "Todos" ? "linear-gradient(135deg,#1e3a8a,#0b1f4d)" : `linear-gradient(135deg, ${col.c}, ${col.c2})`, boxShadow: `0 12px 26px -14px ${c === "Todos" ? "#1e3a8a" : col.c}` } : undefined}
                  >
                    {c !== "Todos" && <span className="size-2 rounded-full" style={{ background: on ? "#fff" : col.c }} />}
                    {c}
                    <span className={`rounded-full px-1.5 text-[11px] ${on ? "bg-white/25" : "bg-secondary"}`}>{n}</span>
                  </button>
                );
              })}
            </div>
            <div className="relative md:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar servicio..." className="h-12 w-full rounded-2xl border border-input bg-background/70 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15" />
            </div>
          </div>
        </div>

        {lista.length === 0 && <p className="py-20 text-center text-muted-foreground">No hay servicios con esa búsqueda.</p>}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((s, i) => {
            const Icon = ICONOS[s.icono] ?? Stethoscope;
            const doc = DOCTORS.find((d) => d.id === s.doctorId);
            const col = colorDe(s.especialidad);
            return (
              <article
                key={s.id}
                data-reveal
                style={{ transitionDelay: `${Math.min(i, 6) * 60}ms`, ["--c" as string]: col.c } as CSSProperties}
                className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-card p-7 shadow-[0_25px_60px_-45px_rgba(10,25,70,.7)] transition-all duration-500 hover:-translate-y-1.5 hover:border-transparent hover:shadow-[0_40px_80px_-40px_var(--c)]"
              >
                <span className="absolute inset-x-0 top-0 h-1 opacity-70 transition-opacity group-hover:opacity-100" style={{ background: `linear-gradient(90deg, ${col.c}, transparent)` }} />
                <span className="pointer-events-none absolute -right-14 -top-14 size-44 rounded-full opacity-[0.08] blur-2xl transition-opacity duration-500 group-hover:opacity-25" style={{ background: col.c }} />
                <Icon className="pointer-events-none absolute -bottom-6 -right-6 size-32 opacity-[0.04] transition-all duration-700 group-hover:-rotate-12 group-hover:opacity-[0.09]" style={{ color: col.c }} />

                <div className="relative flex items-start justify-between gap-3">
                  <span
                    className="flex size-14 items-center justify-center rounded-2xl text-white ring-1 ring-white/30 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
                    style={{ background: `linear-gradient(135deg, ${col.c}, ${col.c2})`, boxShadow: `0 16px 30px -14px ${col.c}` }}
                  >
                    <Icon className="size-6" />
                  </span>
                  <span className="font-display text-sm text-muted-foreground/50">{String(i + 1).padStart(2, "0")}</span>
                </div>

                <p className="relative mt-6 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: col.c }}>{s.especialidad}</p>
                <h2 className="relative mt-1.5 font-display text-2xl font-semibold leading-tight">{s.nombre}</h2>
                <p className="relative mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{s.descripcion}</p>

                <div className="relative mt-6 flex items-center justify-between gap-3 border-t border-border/70 pt-5">
                  {doc ? (
                    <Link to="/especialistas/$id" params={{ id: doc.id }} className="flex min-w-0 items-center gap-2.5">
                      <img src={fotoDoctor(doc.foto)} alt="" className="size-9 shrink-0 rounded-full object-cover object-top ring-2 ring-background" />
                      <span className="min-w-0 text-xs leading-tight">
                        <span className="block text-muted-foreground">Atiende</span>
                        <span className="block truncate font-semibold">{doc.nombre.replace("Dr. Carlos ", "Dr. ").replace(" Gómez Bolaño", "")}</span>
                      </span>
                    </Link>
                  ) : <span />}
                  <Button asChild size="sm" className="shrink-0 rounded-full px-4"><Link to="/turnos" search={{ doctor: s.doctorId }}><CalendarPlus className="size-4" /> Reservar</Link></Button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Ayuda para elegir */}
        <div data-reveal className="relative mt-14 overflow-hidden rounded-[2rem] gradient-deep p-8 text-white shadow-[0_40px_80px_-40px_rgba(10,25,70,.9)] sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-sky-400/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 size-64 rounded-full bg-rose-500/20 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl text-white">¿No sabés qué servicio necesitás?</h2>
              <p className="mt-2 max-w-xl text-white/70">Empezá por una consulta de Medicina Interna: evaluamos tu caso y te derivamos dentro de la clínica.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full !bg-white px-6 text-[oklch(0.25_0.08_260)] hover:!bg-white/90"><Link to="/turnos"><CalendarPlus className="size-4" /> Pedir turno</Link></Button>
              <Button asChild size="lg" variant="outline" className="glass !border-white/30 !bg-white/10 rounded-full px-6 text-white hover:!bg-white/20 hover:text-white"><a href={waLink("Hola, quiero saber qué servicio necesito.")} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> WhatsApp</a></Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
