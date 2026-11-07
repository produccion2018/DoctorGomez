import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, CalendarPlus, CheckCircle2, Clock, FlaskConical, HeartPulse, MessageCircle, Stethoscope, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, PublicLayout, useReveal, waLink } from "@/components/site/PublicLayout";
import { DOCTORS, ESPECIALIDADES, SERVICIOS, fotoDoctor, iconoEspecialidad, imagenEspecialidad } from "@/data/clinic";

export const Route = createFileRoute("/especialidades/$slug")({
  loader: ({ params }) => {
    const esp = ESPECIALIDADES.find((e) => e.slug === params.slug);
    if (!esp) throw notFound();
    return esp;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.nombre ?? "Especialidad"} | Clínica Gómez Bolaño` },
      { name: "description", content: loaderData?.descripcion ?? "Especialidad de la Clínica Gómez Bolaño." },
    ],
  }),
  component: Detalle,
});

function Detalle() {
  const esp = Route.useLoaderData();
  useReveal(esp.slug);
  const Icon = iconoEspecialidad(esp.icono);
  const docs = DOCTORS.filter((d) => esp.doctorIds.includes(d.id));
  const servicios = SERVICIOS.filter((s) => s.especialidad === esp.nombre);
  const otras = ESPECIALIDADES.filter((e) => e.slug !== esp.slug).slice(0, 4);

  const bloques = [
    { icon: Target, titulo: "Qué abordamos", items: esp.aborda, color: "from-sky-500 to-blue-700" },
    { icon: HeartPulse, titulo: "Cuándo consultar", items: esp.cuando, color: "from-rose-500 to-red-600" },
    { icon: FlaskConical, titulo: "Estudios", items: esp.estudios, color: "from-emerald-400 to-teal-600" },
  ];

  return (
    <PublicLayout>
      <PageHero
        kicker="Especialidad"
        title={esp.nombre}
        text={esp.descripcion}
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Especialidades", to: "/especialidades" }, { label: esp.nombre }]}
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="btn-glow rounded-full !bg-[var(--clinic)] px-6 text-white">
            <Link to="/turnos" search={{ especialidad: esp.slug }}><CalendarPlus className="size-4" /> Solicitar turno</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="glass rounded-full !border-white/30 !bg-white/10 px-6 text-deep-foreground hover:!bg-white/20 hover:text-deep-foreground">
            <a href={waLink(`Hola, quiero consultar por ${esp.nombre}.`)} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> Consultar por WhatsApp</a>
          </Button>
        </div>
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.4fr_1fr] lg:px-8">
        <div className="space-y-8">
          <div data-reveal className="relative overflow-hidden rounded-[2rem] shadow-elevated">
            <img src={imagenEspecialidad(esp.slug)} alt={esp.nombre} className="hero-kenburns aspect-[16/9] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-deep/80 via-deep/10 to-transparent" />
            <div className="absolute bottom-5 left-5 flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/30 backdrop-blur"><Icon className="size-6" /></span>
              <p className="font-display text-2xl text-white">{esp.nombre}</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {bloques.map((b, i) => (
              <div key={b.titulo} data-reveal style={{ transitionDelay: `${i * 90}ms` }} className="card-lift rounded-3xl border border-border bg-card p-6 shadow-card">
                <span className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${b.color} text-white shadow-md`}><b.icon className="size-5" /></span>
                <h2 className="mt-4 font-sans text-base font-semibold">{b.titulo}</h2>
                <ul className="mt-3 space-y-2">
                  {b.items.map((it) => (
                    <li key={it} className="flex gap-2 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--clinic)]" /> {it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div data-reveal className="rounded-3xl border border-border bg-secondary/50 p-7">
            <h2 className="flex items-center gap-2 font-sans text-base font-semibold"><Clock className="size-5 text-primary" /> Seguimiento</h2>
            <p className="mt-2 text-muted-foreground">{esp.seguimiento}</p>
          </div>

          {servicios.length > 0 && (
            <div data-reveal>
              <h2 className="text-2xl">Servicios de {esp.nombre}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {servicios.map((s) => (
                  <div key={s.id} className="card-lift flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card">
                    <p className="font-semibold">{s.nombre}</p>
                    <p className="mt-1 flex-1 text-sm text-muted-foreground">{s.descripcion}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{s.duracion} min</span>
                      <span className="font-display text-xl font-semibold">${s.precio.toLocaleString("es-AR")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div data-reveal className="rounded-3xl border border-border bg-card p-6 shadow-elevated">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Profesionales a cargo</p>
            <div className="mt-4 space-y-4">
              {docs.map((d) => (
                <Link key={d.id} to="/especialistas/$id" params={{ id: d.id }} className="group flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-secondary">
                  <img src={fotoDoctor(d.foto)} alt={d.nombre} className="size-16 rounded-2xl object-cover object-top ring-2 ring-border" />
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight">{d.nombre}</p>
                    <p className="text-xs text-primary">{d.titulo}</p>
                    <p className="text-xs text-muted-foreground">MN {d.matricula.replace("MN ", "")}</p>
                  </div>
                  <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
            <Button asChild className="btn-glow mt-6 h-12 w-full rounded-xl">
              <Link to="/turnos" search={{ especialidad: esp.slug }}><CalendarPlus className="size-4" /> Reservar turno</Link>
            </Button>
          </div>

          <div data-reveal className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Otras especialidades</p>
            <div className="mt-3 space-y-1">
              {otras.map((o) => {
                const I = iconoEspecialidad(o.icono);
                return (
                  <Link key={o.slug} to="/especialidades/$slug" params={{ slug: o.slug }} className="flex items-center gap-3 rounded-xl p-2.5 text-sm font-medium transition-colors hover:bg-secondary">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary"><I className="size-4" /></span>
                    {o.nombre}
                  </Link>
                );
              })}
            </div>
            <Link to="/especialidades" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              <Stethoscope className="size-4" /> Ver todas
            </Link>
          </div>
        </aside>
      </section>
    </PublicLayout>
  );
}
