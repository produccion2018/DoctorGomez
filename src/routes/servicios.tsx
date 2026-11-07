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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lista.map((s, i) => {
            const Icon = ICONOS[s.icono] ?? Stethoscope;
            const doc = DOCTORS.find((d) => d.id === s.doctorId);
            return (
              <div key={s.id} data-reveal style={{ transitionDelay: `${(i % 3) * 80}ms` }} className="card-lift group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-card">
                <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-[var(--clinic)]/10 blur-2xl transition-transform duration-700 group-hover:scale-150" />
                <div className="relative flex items-start justify-between">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--clinic)] to-[var(--deep)] text-white shadow-lg transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105">
                    <Icon className="size-6" />
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">{s.especialidad}</span>
                </div>
                <h2 className="relative mt-6 font-sans text-lg font-semibold">{s.nombre}</h2>
                <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s.descripcion}</p>
                {doc && (
                  <div className="relative mt-5 flex items-center gap-2.5 text-xs text-muted-foreground">
                    <img src={fotoDoctor(doc.foto)} alt="" className="size-7 rounded-full object-cover object-top" />
                    {doc.nombre}
                  </div>
                )}
                <div className="relative mt-5 flex items-end justify-between border-t border-border pt-5">
                  <div>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3.5" /> {s.duracion} min</p>
                    <p className="font-display text-2xl font-semibold">${s.precio.toLocaleString("es-AR")}</p>
                  </div>
                  <Button asChild size="sm" className="rounded-full px-4"><Link to="/turnos" search={{ doctor: s.doctorId }}><CalendarPlus className="size-4" /> Reservar</Link></Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </PublicLayout>
  );
}
