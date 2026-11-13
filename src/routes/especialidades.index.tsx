import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, PublicLayout, useReveal, FondoEspecialidades, VisualEspecialidad } from "@/components/site/PublicLayout";
import { DOCTORS, ESPECIALIDADES, fotoDoctor, iconoEspecialidad, imagenEspecialidad } from "@/data/clinic";

export const Route = createFileRoute("/especialidades/")({
  head: () => ({
    meta: [
      { title: "Especialidades | HEGO · Centro de especialidades médicas" },
      { name: "description", content: "Medicina Interna, Cardiología, Nefrología, Ecocardiografía, Holter, Laboratorio y más unidades de la clínica." },
    ],
  }),
  component: Especialidades,
});

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
        decoracion={<FondoEspecialidades />}
        kicker="Departamentos médicos"
        title={<>Especialidades y <span className="text-shine italic">unidades</span></>}
        text={`${ESPECIALIDADES.length} áreas coordinadas por los directores médicos, con estudios e informes en el mismo lugar.`}
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Especialidades" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {[{ id: "todos", label: "Todas" }, ...DOCTORS.map((d) => ({ id: d.id, label: d.nombre }))].map((o) => (
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

        <div className="grid auto-rows-[340px] gap-5 sm:grid-cols-2 lg:grid-flow-dense lg:grid-cols-3">
          {lista.map((e, idx) => {
            const Icon = iconoEspecialidad(e.icono);
            const docs = DOCTORS.filter((d) => e.doctorIds.includes(d.id));
            const grande = !q && idx % 7 === 0;
            return (
              <Link
                key={e.slug}
                to="/especialidades/$slug"
                params={{ slug: e.slug }}
                data-reveal
                style={{ transitionDelay: `${(idx % 3) * 80}ms` }}
                className={`group relative overflow-hidden rounded-[1.75rem] shadow-[0_35px_70px_-45px_rgba(10,25,70,.9)] ring-1 ring-black/5 ${grande ? "lg:col-span-2" : ""}`}
              >
                <div className="absolute inset-0 transition-transform duration-[1400ms] ease-out group-hover:scale-105"><VisualEspecialidad slug={e.slug} foto={imagenEspecialidad(e.slug)} /></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.05_262)] via-[oklch(0.16_0.05_262/0.45)] via-40% to-transparent to-75% transition-opacity duration-500" />
                <div className="absolute -bottom-20 -left-16 size-64 rounded-full bg-sky-500/25 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100" />
                <div className="relative flex h-full flex-col p-7 text-white">
                  <div className="flex items-start justify-between">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-md transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-display text-sm text-white/50">{String(idx + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="mt-auto">
                    <h2 className="font-display text-2xl font-semibold leading-tight">{e.nombre}</h2>
                    <p className={`mt-2 text-sm leading-relaxed text-white/75 ${grande ? "line-clamp-3 max-w-xl" : "line-clamp-2"}`}>{e.descripcion}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {docs.map((d) => (
                          <img key={d.id} src={fotoDoctor(d.foto)} alt={d.nombre} title={d.nombre} className="size-8 rounded-full object-cover object-top ring-2 ring-white/70" />
                        ))}
                      </div>
                      <span className="flex size-10 items-center justify-center rounded-full bg-white text-[oklch(0.25_0.08_260)] transition-transform duration-500 group-hover:rotate-45">
                        <ArrowUpRight className="size-5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div data-reveal className="mt-16 flex flex-col items-center justify-between gap-5 rounded-3xl border border-border bg-secondary/50 p-8 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="text-2xl">¿No sabe qué especialidad necesita?</h3>
            <p className="mt-1 text-muted-foreground">Empiece por Medicina Interna: evaluamos su caso y le derivamos dentro de la clínica.</p>
          </div>
          <Button asChild size="lg" className="btn-glow rounded-full px-6"><Link to="/turnos" search={{ especialidad: "medicina-interna" }}><CalendarPlus className="size-4" /> Pedir cita</Link></Button>
        </div>
      </section>
    </PublicLayout>
  );
}
