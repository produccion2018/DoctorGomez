import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CalendarPlus, CheckCircle2, Clock, FlaskConical, HeartPulse, MessageCircle, Stethoscope, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, PublicLayout, useReveal, waLink, VisualEspecialidad } from "@/components/site/PublicLayout";
import { DOCTORS, ESPECIALIDADES, SERVICIOS, fotoDoctor, iconoEspecialidad, imagenEspecialidad } from "@/data/clinic";

import fondoCorazon from "@/assets/fondo-corazon.jpg";
import fondoRinones from "@/assets/fondo-rinones.jpg";

/** Fondo ilustrado suave del encabezado según la especialidad. */
const FONDOS: Record<string, string> = {
  cardiologia: fondoCorazon,
  "cardiologia-critica": fondoCorazon,
  ecocardiografia: fondoCorazon,
  "holter-mapa": fondoCorazon,
  nefrologia: fondoRinones,
};
export const Route = createFileRoute("/especialidades/$slug")({
  loader: ({ params }) => {
    const esp = ESPECIALIDADES.find((e) => e.slug === params.slug);
    if (!esp) throw notFound();
    return esp;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.nombre ?? "Especialidad"} | HEGO · Centro de especialidades médicas` },
      { name: "description", content: loaderData?.descripcion ?? "Especialidad del Centro HEGO." },
    ],
  }),
  component: Detalle,
});

type Bloque = { icon: LucideIcon; titulo: string; sub: string; items: readonly string[]; color: string; glow: string; dot: string };

/* Panel con pestañas animadas: Qué abordamos / Cuándo consultar / Estudios */
function BloquesInfo({ bloques }: { bloques: Bloque[] }) {
  const [act, setAct] = useState(0);
  const b = bloques[act]!;
  return (
    <div data-reveal className="relative overflow-hidden rounded-[2rem] bg-[oklch(0.17_0.05_262)] p-2 text-white shadow-[0_50px_100px_-50px_rgba(10,25,70,.9)] ring-1 ring-white/10">
      {/* brillo que cambia de color según la pestaña */}
      <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full blur-3xl transition-all duration-700" style={{ background: b.glow }} />
      <div className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_top_right,#000_15%,transparent_70%)]" />

      {/* Pestañas */}
      <div role="tablist" className="relative grid grid-cols-3 gap-1 rounded-[1.6rem] bg-white/5 p-1.5 ring-1 ring-white/10">
        {bloques.map((x, i) => {
          const on = i === act;
          return (
            <button
              key={x.titulo}
              role="tab"
              aria-selected={on}
              onClick={() => setAct(i)}
              onMouseEnter={() => setAct(i)}
              className={`group relative flex flex-col items-center gap-2 rounded-[1.25rem] px-2 py-3.5 text-center transition-all duration-500 sm:flex-row sm:gap-3 sm:px-4 sm:text-left ${on ? "bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.12)]" : "hover:bg-white/5"}`}
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${x.color} transition-all duration-500 ${on ? "scale-110" : "opacity-60 grayscale-[40%] group-hover:opacity-100"}`}
                style={on ? { boxShadow: `0 12px 30px -8px ${x.glow}` } : undefined}
              >
                <x.icon className={`size-5 ${on ? "animate-pulse" : ""}`} />
              </span>
              <span className="min-w-0">
                <span className={`block text-xs font-semibold transition-colors sm:text-sm ${on ? "text-white" : "text-white/55"}`}>{x.titulo}</span>
                <span className="hidden text-[11px] text-white/40 sm:block">{x.items.length} ítems</span>
              </span>
              {on && <span className={`absolute inset-x-6 -bottom-px h-0.5 rounded-full bg-gradient-to-r ${x.color} animate-in fade-in zoom-in-50 duration-500`} />}
            </button>
          );
        })}
      </div>

      {/* Contenido */}
      <div key={act} className="relative px-5 pb-6 pt-7 sm:px-8 sm:pb-8">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <h2 className="font-display text-2xl text-white sm:text-3xl">{b.titulo}</h2>
          <p className="mt-1 text-sm text-white/55">{b.sub}</p>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {b.items.map((it, i) => (
            <li
              key={it}
              style={{ animationDelay: `${120 + i * 70}ms`, animationFillMode: "both" }}
              className="group flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3.5 ring-1 ring-white/10 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 hover:-translate-y-0.5 hover:bg-white/[0.09] hover:ring-white/25"
            >
              <span className="font-display text-xs tabular-nums text-white/35">{String(i + 1).padStart(2, "0")}</span>
              <CheckCircle2 className={`size-[18px] shrink-0 ${b.dot} transition-transform duration-300 group-hover:scale-125`} />
              <span className="text-sm leading-snug text-white/85">{it}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Detalle() {
  const esp = Route.useLoaderData();
  useReveal(esp.slug);
  const Icon = iconoEspecialidad(esp.icono);
  const docs = DOCTORS.filter((d) => esp.doctorIds.includes(d.id));
  const servicios = SERVICIOS.filter((s) => s.especialidad === esp.nombre);
  const otras = ESPECIALIDADES.filter((e) => e.slug !== esp.slug).slice(0, 4);

  const bloques = [
    { icon: Target, titulo: "Qué abordamos", sub: "Enfermedades y situaciones que tratamos", items: esp.aborda, color: "from-sky-500 to-blue-700", glow: "rgba(56,189,248,.55)", dot: "text-sky-400" },
    { icon: HeartPulse, titulo: "Cuándo consultar", sub: "Señales para pedir un turno", items: esp.cuando, color: "from-rose-500 to-red-600", glow: "rgba(244,63,94,.55)", dot: "text-rose-400" },
    { icon: FlaskConical, titulo: "Estudios", sub: "Estudios que podés hacer en la clínica", items: esp.estudios, color: "from-emerald-400 to-teal-600", glow: "rgba(16,185,129,.55)", dot: "text-emerald-400" },
  ];

  return (
    <PublicLayout>
      <PageHero
        kicker="Especialidad"
        fondo={FONDOS[esp.slug]}
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
            <div className="relative aspect-[16/9] w-full"><VisualEspecialidad slug={esp.slug} foto={imagenEspecialidad(esp.slug)} /></div>
            <div className="absolute inset-0 bg-gradient-to-t from-deep/80 via-deep/10 to-transparent" />
            <div className="absolute bottom-5 left-5 flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/30 backdrop-blur"><Icon className="size-6" /></span>
              <p className="font-display text-2xl text-white">{esp.nombre}</p>
            </div>
          </div>

          <BloquesInfo bloques={bloques} />

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
                      <Link to="/turnos" search={{ doctor: s.doctorId }} className="text-sm font-semibold text-primary hover:underline">Reservar →</Link>
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
                    <p className="text-xs font-bold text-primary">{d.titulo}</p>
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
