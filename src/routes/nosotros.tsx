import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, HeartHandshake, Microscope, Radar, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, PublicLayout, useReveal } from "@/components/site/PublicLayout";
import { DOCTORS } from "@/data/clinic";
import clinicaImg from "@/assets/clinica.jpg";
import fotoAlberto from "@/assets/doctor-alberto.jpg";
import fotoAlonso from "@/assets/doctor-alonso.jpg";
import { ArrowUpRight, CalendarPlus } from "lucide-react";

export const Route = createFileRoute("/nosotros")({
  head: () => ({
    meta: [
      { title: "Nosotros | Clínica Gómez Bolaño" },
      { name: "description", content: "Historia, filosofía de atención y tecnología de una clínica dirigida por dos hermanos médicos especialistas." },
      { property: "og:title", content: "Nosotros | Clínica Gómez Bolaño" },
      { property: "og:description", content: "Historia, filosofía de atención, experiencia y tecnología médica." },
    ],
  }),
  component: Nosotros,
});

const PILARES = [
  { icon: HeartHandshake, t: "Atención personalizada", d: "Consultas de 40 minutos con escucha real y un plan escrito para cada paciente." },
  { icon: Microscope, t: "Diagnóstico integral", d: "Interpretación conjunta de laboratorio, imágenes y clínica para una respuesta precisa." },
  { icon: Radar, t: "Tecnología médica", d: "Ecocardiografía doppler, Holter, MAPA y registro clínico digital." },
  { icon: Users, t: "Seguimiento médico", d: "Controles programados y comunicación continua por WhatsApp y teléfono." },
  { icon: Sparkles, t: "Experiencia", d: "Más de 25 años combinados en medicina interna, nefrología y cardiología." },
  { icon: Building2, t: "Infraestructura", d: "Consultorios equipados, sala de estudios y circuito de atención ágil." },
];

function Nosotros() {
  useReveal();
  return (
    <PublicLayout>
      <PageHero
        kicker="Nosotros"
        title={<>Una clínica construida sobre la <span className="text-shine italic">confianza</span></>}
        text="Dos hermanos médicos, una misma convicción: la medicina especializada sólo tiene sentido con tiempo, escucha y continuidad."
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Nosotros" }]}
      />

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:px-8">
        <div data-reveal className="space-y-5">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clinic">Nuestra historia</span>
          <h2 className="text-3xl sm:text-4xl">Medicina especializada, con trato humano</h2>
          <p className="leading-relaxed text-muted-foreground">
            La Clínica Gómez Bolaño nació del trabajo conjunto de dos hermanos médicos que compartieron formación,
            guardias y la misma convicción: que la medicina especializada sólo tiene sentido cuando se acompaña de tiempo,
            escucha y continuidad.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Hoy la clínica integra Medicina Interna, Nefrología y Cardiología en un mismo circuito de atención, con historia
            clínica digital, estudios propios y un equipo que ordena cada paso del proceso.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[["+25", "años de experiencia"], ["+12.000", "consultas"], ["13", "especialidades"]].map(([n, l]) => (
              <div key={l} className="rounded-2xl border border-border bg-card p-4 text-center shadow-card">
                <p className="font-display text-2xl font-semibold text-gradient-clinic">{n}</p>
                <p className="text-xs text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild className="btn-glow rounded-full px-6"><Link to="/turnos"><CalendarPlus className="size-4" /> Solicitar turno</Link></Button>
            <Button asChild variant="outline" className="rounded-full px-6"><Link to="/especialistas">Conocer a los especialistas</Link></Button>
          </div>
        </div>
        <div data-reveal className="relative">
          <div className="hero-glow absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-[var(--clinic)] to-[var(--accent)] opacity-40 blur-2xl" />
          <img src={clinicaImg} alt="Instalaciones de la clínica" loading="lazy" className="relative aspect-[4/3] w-full rounded-[2rem] object-cover shadow-elevated" />
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div data-reveal className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clinic">Filosofía</span>
            <h2 className="mt-3 text-3xl sm:text-4xl">Cómo entendemos la atención</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PILARES.map((p, i) => (
              <div key={p.t} data-reveal style={{ transitionDelay: `${(i % 3) * 80}ms` }} className="card-lift group rounded-3xl border border-border bg-card p-7 shadow-card">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary transition-all duration-500 group-hover:rotate-6 group-hover:bg-gradient-to-br group-hover:from-[var(--clinic)] group-hover:to-[var(--deep)] group-hover:text-white"><p.icon className="size-5" /></span>
                <h3 className="mt-5 font-semibold">{p.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div data-reveal className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clinic">Dirección médica</span>
          <h2 className="mt-3 text-3xl sm:text-4xl">Los hermanos Gómez Bolaño</h2>
          <p className="mt-3 text-muted-foreground">
            Dos trayectorias complementarias: la mirada global de la medicina interna con la profundidad de la nefrología, y la
            precisión de la cardiología crítica con la ecocardiografía como herramienta diagnóstica.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {DOCTORS.map((d, i) => (
            <Link key={d.id} to="/especialistas/$id" params={{ id: d.id }} data-reveal style={{ transitionDelay: `${i * 120}ms` }} className="card-lift group flex gap-6 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-card">
              <img src={d.foto === "alberto" ? fotoAlberto : fotoAlonso} alt={d.nombre} loading="lazy" className="h-44 w-32 shrink-0 rounded-2xl object-cover object-top transition-transform duration-700 group-hover:scale-105" />
              <div className="min-w-0 space-y-2">
                <h3 className="text-lg font-semibold leading-tight">{d.nombre}</h3>
                <p className="text-sm text-primary">{d.titulo}</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {d.formacion.slice(0, 3).map((f) => <li key={f} className="line-clamp-1">· {f}</li>)}
                </ul>
                <span className="inline-flex items-center gap-1 pt-1 text-sm font-semibold text-primary">Ver perfil <ArrowUpRight className="size-4" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
