import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, CalendarPlus, HeartHandshake, Microscope, Quote, Radar, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, PublicLayout, useReveal } from "@/components/site/PublicLayout";
import { DOCTORS } from "@/data/clinic";
import clinicaImg from "@/assets/clinica.jpg";
import heroDoctors from "@/assets/hero-doctors.jpg";
import fotoAlberto from "@/assets/doctor-alberto.jpg";
import fotoAlonso from "@/assets/doctor-alonso.jpg";

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

const HITOS = [
  { t: "La formación", d: "Dos hermanos que eligen la medicina y se forman en clínica médica, nefrología y cardiología." },
  { t: "Los primeros consultorios", d: "Nace la idea de atender con tiempo, escucha y un seguimiento que no se corta." },
  { t: "Unidad cardiológica", d: "Se suman la ecocardiografía doppler, el Holter y el MAPA con informe en el día." },
  { t: "Cuidado del riñón", d: "Programas de nefroprotección coordinados con cardiología y medicina interna." },
  { t: "Clínica digital", d: "Turnos online, historia clínica digital y portal del paciente en el celular." },
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

      {/* ───────── HISTORIA ───────── */}
      <section className="mx-auto grid max-w-7xl items-center gap-16 overflow-x-clip px-4 py-24 lg:grid-cols-[1fr_1.05fr] lg:px-8">
        <div data-reveal>
          <span className="section-kicker">Nuestra historia</span>
          <h2 className="mt-4 text-4xl leading-[1.1] sm:text-5xl">
            Medicina especializada, <span className="text-gradient-clinic italic">con trato humano</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            La Clínica Gómez Bolaño nació del trabajo conjunto de dos hermanos médicos que compartieron formación, guardias y la misma convicción:
            que la medicina especializada sólo tiene sentido cuando se acompaña de tiempo, escucha y continuidad.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Hoy la clínica integra Medicina Interna, Nefrología y Cardiología en un mismo circuito de atención, con historia clínica digital,
            estudios propios y un equipo que ordena cada paso del proceso.
          </p>

          <div className="mt-10 grid grid-cols-3 divide-x divide-border border-y border-border">
            {[["+25", "años de experiencia"], ["+12.000", "consultas"], ["13", "especialidades"]].map(([n, l]) => (
              <div key={l} className="px-3 py-6 text-center first:pl-0 last:pr-0">
                <p className="font-display text-3xl font-semibold text-gradient-clinic sm:text-4xl">{n}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" className="btn-glow rounded-full px-7"><Link to="/turnos"><CalendarPlus className="size-4" /> Solicitar turno</Link></Button>
            <Link to="/especialistas" className="inline-flex items-center gap-2 px-3 text-sm font-semibold text-primary transition-all hover:gap-3">
              Conocer a los especialistas <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Collage de fotos */}
        <div data-reveal className="relative mx-auto w-full max-w-xl pb-16 pl-10 lg:max-w-none">
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-tr from-sky-400/25 via-transparent to-rose-400/25 blur-3xl" />
          <div className="group relative overflow-hidden rounded-[2.25rem] shadow-[0_50px_100px_-50px_rgba(10,25,70,.9)] ring-1 ring-black/5">
            <img src={heroDoctors} alt="Los doctores Gómez Bolaño" loading="lazy" className="aspect-[4/5] w-full object-cover object-top transition-transform duration-[1500ms] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.15_0.05_262/0.8)] via-transparent to-transparent" />
            <p className="absolute bottom-6 right-6 text-right text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Dirección médica</p>
          </div>
          <div className="absolute bottom-0 left-0 w-[46%] overflow-hidden rounded-[1.75rem] border-[6px] border-background shadow-2xl">
            <img src={clinicaImg} alt="Instalaciones de la clínica" loading="lazy" className="aspect-square w-full object-cover" />
          </div>
          <div className="glass absolute right-4 top-6 flex items-center gap-3 rounded-2xl px-4 py-3 text-white shadow-xl">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-700"><HeartHandshake className="size-4" /></span>
            <div className="text-xs leading-tight">
              <p className="font-semibold">Atención de 40 min</p>
              <p className="text-white/70">por consulta</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── CITA ───────── */}
      <section className="mx-auto max-w-5xl px-4 pb-24 text-center lg:px-8" data-reveal>
        <Quote className="mx-auto size-10 text-clinic/40" />
        <blockquote className="mt-6 font-display text-2xl italic leading-snug sm:text-4xl">
          “No atendemos estudios ni enfermedades sueltas: atendemos personas, y las acompañamos en el tiempo.”
        </blockquote>
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="flex -space-x-3">
            <img src={fotoAlberto} alt="" className="size-11 rounded-full object-cover object-top ring-4 ring-background" />
            <img src={fotoAlonso} alt="" className="size-11 rounded-full object-cover object-top ring-4 ring-background" />
          </div>
          <p className="text-left text-sm">
            <span className="block font-semibold">Dres. Gómez Bolaño</span>
            <span className="text-muted-foreground">Directores médicos</span>
          </p>
        </div>
      </section>

      {/* ───────── FILOSOFÍA (oscuro) ───────── */}
      <section className="relative overflow-hidden bg-[oklch(0.17_0.05_262)] py-24 text-white">
        <div className="pointer-events-none absolute -left-32 top-0 size-[28rem] rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 size-[28rem] rounded-full bg-rose-500/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div data-reveal className="lg:sticky lg:top-28 lg:self-start">
            <span className="glass inline-flex rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em]">Filosofía</span>
            <h2 className="mt-5 text-4xl leading-tight text-white sm:text-5xl">
              Cómo entendemos <span className="italic text-sky-300">la atención</span>
            </h2>
            <p className="mt-5 max-w-md text-white/65">Seis principios que guían cada consulta, cada estudio y cada control.</p>
          </div>
          <div className="grid gap-x-10 sm:grid-cols-2">
            {PILARES.map((p, i) => (
              <div
                key={p.t}
                data-reveal
                style={{ transitionDelay: `${(i % 2) * 90}ms` }}
                className="group relative border-t border-white/10 py-8 transition-colors duration-500 hover:border-sky-400/60"
              >
                <span className="absolute left-0 top-0 h-px w-0 bg-gradient-to-r from-sky-400 to-rose-400 transition-all duration-700 group-hover:w-full" />
                <div className="flex items-start gap-5">
                  <span className="font-display text-sm text-white/30">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 transition-all duration-500 group-hover:-rotate-6 group-hover:bg-gradient-to-br group-hover:from-sky-500 group-hover:to-blue-700 group-hover:shadow-[0_15px_35px_-12px_rgba(56,189,248,.7)]">
                      <p.icon className="size-5" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-white">{p.t}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/60">{p.d}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── TRAYECTORIA ───────── */}
      <section className="mx-auto max-w-5xl px-4 py-24 lg:px-8">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <span className="section-kicker">Trayectoria</span>
          <h2 className="mt-4 text-4xl leading-tight sm:text-5xl">Un camino <span className="text-gradient-clinic italic">compartido</span></h2>
        </div>
        <ol className="relative mt-16">
          <span className="absolute bottom-0 left-5 top-0 w-px bg-gradient-to-b from-[var(--clinic)] via-border to-rose-400 md:left-1/2" />
          {HITOS.map((h, i) => (
            <li
              key={h.t}
              data-reveal
              style={{ transitionDelay: `${i * 80}ms` }}
              className={`group relative mb-12 pl-16 last:mb-0 md:w-1/2 md:pl-0 ${i % 2 ? "md:ml-auto md:pl-14" : "md:pr-14 md:text-right"}`}
            >
              <span
                className={`absolute left-0 top-0 flex size-10 items-center justify-center rounded-full gradient-deep font-display text-sm font-semibold text-white shadow-lg ring-8 ring-background transition-transform duration-500 group-hover:scale-110 ${i % 2 ? "md:-left-5" : "md:left-auto md:-right-5"}`}
              >
                {i + 1}
              </span>
              <h3 className="text-xl font-semibold transition-colors group-hover:text-clinic">{h.t}</h3>
              <p className="mt-2 text-muted-foreground">{h.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────── DIRECCIÓN MÉDICA ───────── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 lg:px-8">
        <div data-reveal className="max-w-3xl">
          <span className="section-kicker">Dirección médica</span>
          <h2 className="mt-4 text-4xl leading-tight sm:text-5xl">Los hermanos Gómez Bolaño</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Dos trayectorias complementarias: la mirada global de la medicina interna con la profundidad de la nefrología, y la precisión de la
            cardiología crítica con la ecocardiografía como herramienta diagnóstica.
          </p>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {DOCTORS.map((d, i) => (
            <Link
              key={d.id}
              to="/especialistas/$id"
              params={{ id: d.id }}
              data-reveal
              style={{ transitionDelay: `${i * 120}ms` }}
              className="group relative h-[480px] overflow-hidden rounded-[2rem] shadow-[0_50px_90px_-50px_rgba(10,25,70,.85)] ring-1 ring-black/5"
            >
              <img src={d.foto === "alberto" ? fotoAlberto : fotoAlonso} alt={d.nombre} loading="lazy" className="absolute inset-0 size-full object-cover object-top transition-transform duration-[1400ms] group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.15_0.05_262)] via-[oklch(0.15_0.05_262/0.35)] to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/90">{d.titulo}</p>
                <h3 className="mt-2 font-display text-3xl font-semibold">{d.nombre}</h3>
                <ul className="mt-4 max-h-0 space-y-1 overflow-hidden text-sm text-white/75 opacity-0 transition-all duration-700 group-hover:max-h-40 group-hover:opacity-100">
                  {d.formacion.slice(0, 3).map((f) => (
                    <li key={f} className="line-clamp-1">· {f}</li>
                  ))}
                </ul>
                <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[oklch(0.25_0.08_260)] transition-all group-hover:gap-3">
                  Ver perfil <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
