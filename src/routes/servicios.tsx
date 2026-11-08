import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  CalendarCheck,
  CalendarPlus,
  ClipboardList,
  Clock,
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
import { PageHero, PublicLayout, useReveal } from "@/components/site/PublicLayout";
import { DOCTORS, SERVICIOS, fotoDoctor } from "@/data/clinic";

export const Route = createFileRoute("/servicios")({
  head: () => ({
    meta: [
      { title: "Servicios y aranceles | Clínica Gómez Bolaño" },
      { name: "description", content: "Consultas, evaluaciones y estudios con duración y arancel. Reservá tu turno online." },
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

function Servicios() {
  const categorias = ["Todos", ...Array.from(new Set(SERVICIOS.map((s) => s.especialidad)))];
  const [cat, setCat] = useState("Todos");
  const [q, setQ] = useState("");
  const lista = SERVICIOS.filter(
    (s) => (cat === "Todos" || s.especialidad === cat) && `${s.nombre} ${s.descripcion}`.toLowerCase().includes(q.toLowerCase()),
  );
  useReveal(cat + q);

  return (
    <PublicLayout>
      <PageHero
        kicker="Servicios"
        title={<>Consultas y estudios con <span className="text-shine italic">turno online</span></>}
        text="Aranceles particulares de referencia. Consultá por la cobertura de tu obra social o prepaga."
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Servicios" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {categorias.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${cat === c ? "gradient-deep text-white shadow-lg" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="relative md:w-72">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar servicio..." className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-4 text-sm shadow-card outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15" />
          </div>
        </div>

        {lista.length === 0 && <p className="py-20 text-center text-muted-foreground">No hay servicios con esa búsqueda.</p>}

        {lista.length > 0 && (
          <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/70 shadow-[0_30px_70px_-45px_rgba(10,25,70,.5)] backdrop-blur-xl">
            {lista.map((s, i) => {
              const Icon = ICONOS[s.icono] ?? Stethoscope;
              const doc = DOCTORS.find((d) => d.id === s.doctorId);
              return (
                <div key={s.id} data-reveal style={{ transitionDelay: `${Math.min(i, 6) * 50}ms` }} className="group relative flex flex-col gap-4 border-b border-border/60 px-6 py-6 transition-colors last:border-0 hover:bg-secondary/40 md:flex-row md:items-center md:gap-6 md:px-8">
                  <span className="absolute inset-y-5 left-0 w-[3px] rounded-full bg-gradient-to-b from-[var(--clinic)] to-rose-500 opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-[var(--clinic)] group-hover:to-[var(--deep)] group-hover:text-white group-hover:shadow-lg">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-sans text-base font-semibold sm:text-lg">{s.nombre}</h2>
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground">{s.especialidad}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.descripcion}</p>
                    {doc && (
                      <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <img src={fotoDoctor(doc.foto)} alt="" className="size-5 rounded-full object-cover object-top" /> {doc.nombre}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-5 md:gap-6">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3.5" /> {s.duracion} min</span>
                    <p className="ml-auto font-display text-2xl font-semibold tabular-nums md:w-32 md:text-right">${s.precio.toLocaleString("es-AR")}</p>
                    <Button asChild size="sm" className="rounded-full px-4"><Link to="/turnos" search={{ doctor: s.doctorId }}><CalendarPlus className="size-4" /> Reservar</Link></Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
