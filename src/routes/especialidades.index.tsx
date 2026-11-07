import { useState, type MouseEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, PublicLayout, useReveal } from "@/components/site/PublicLayout";
import { DOCTORS, ESPECIALIDADES, fotoDoctor, iconoEspecialidad } from "@/data/clinic";

export const Route = createFileRoute("/especialidades/")({
  head: () => ({
    meta: [
      { title: "Especialidades | Clínica Gómez Bolaño" },
      { name: "description", content: "Medicina Interna, Nefrología, Cardiología, Ecocardiografía, Holter, Laboratorio y más unidades de la clínica." },
    ],
  }),
  component: Especialidades,
});

function spot(e: MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

function Especialidades() {
  const [q, setQ] = useState("");
  const [doc, setDoc] = useState<string>("todos");
  const lista = ESPECIALIDADES.filter(
    (e) =>
      (doc === "todos" || e.doctorIds.includes(doc)) &&
      `${e.nombre} ${e.descripcion} ${e.aborda.join(" ")}`.toLowerCase().includes(q.toLowerCase()),
  );
  useReveal(lista.length + doc + q);

  return (
    <PublicLayout>
      <PageHero
        kicker="Departamentos médicos"
        title={<>Especialidades y <span className="text-shine italic">unidades</span></>}
        text={`${ESPECIALIDADES.length} áreas coordinadas por los directores médicos, con estudios e informes en el mismo lugar.`}
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Especialidades" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {[{ id: "todos", label: "Todas" }, ...DOCTORS.map((d) => ({ id: d.id, label: d.nombre.replace("Carlos ", "").split(" ").slice(0, 2).join(" ") }))].map((o) => (
              <button
                key={o.id}
                onClick={() => setDoc(o.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${doc === o.id ? "gradient-deep text-white shadow-lg" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="relative md:w-80">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar especialidad o síntoma..."
              className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-4 text-sm shadow-card outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>
        </div>

        {lista.length === 0 && <p className="py-20 text-center text-muted-foreground">No encontramos especialidades con esa búsqueda.</p>}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((e, idx) => {
            const Icon = iconoEspecialidad(e.icono);
            const docs = DOCTORS.filter((d) => e.doctorIds.includes(d.id));
            return (
              <Link
                key={e.slug}
                to="/especialidades/$slug"
                params={{ slug: e.slug }}
                onMouseMove={spot}
                data-reveal
                style={{ transitionDelay: `${(idx % 3) * 80}ms` }}
                className="spotlight card-lift group flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-card"
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary transition-all duration-500 group-hover:rotate-6 group-hover:bg-gradient-to-br group-hover:from-[var(--clinic)] group-hover:to-[var(--deep)] group-hover:text-white group-hover:shadow-[var(--shadow-glow)]">
                    <Icon className="size-6" />
                  </span>
                  <span className="font-display text-sm text-muted-foreground/50">{String(idx + 1).padStart(2, "0")}</span>
                </div>
                <h2 className="mt-6 font-sans text-xl font-semibold">{e.nombre}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{e.descripcion}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {e.aborda.slice(0, 3).map((a) => (
                    <span key={a} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">{a}</span>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                  <div className="flex -space-x-2">
                    {docs.map((d) => (
                      <img key={d.id} src={fotoDoctor(d.foto)} alt={d.nombre} title={d.nombre} className="size-8 rounded-full object-cover object-top ring-2 ring-card" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Ver detalle <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div data-reveal className="mt-16 flex flex-col items-center justify-between gap-5 rounded-3xl border border-border bg-secondary/50 p-8 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="text-2xl">¿No sabés qué especialidad necesitás?</h3>
            <p className="mt-1 text-muted-foreground">Empezá por Medicina Interna: evaluamos tu caso y te derivamos dentro de la clínica.</p>
          </div>
          <Button asChild size="lg" className="btn-glow rounded-full px-6"><Link to="/turnos" search={{ especialidad: "medicina-interna" }}><CalendarPlus className="size-4" /> Pedir turno</Link></Button>
        </div>
      </section>
    </PublicLayout>
  );
}
