import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, CalendarPlus, Check, Compass, Eye, Gauge, HeartHandshake, HeartPulse, Lightbulb, Quote, Scale, ShieldCheck, Smile, Sparkles, Stethoscope, Target, TrendingUp, Waves, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, PublicLayout, useReveal, FondoDoctor, FondoEspecialidades, Electro } from "@/components/site/PublicLayout";
import { DOCTORS } from "@/data/clinic";
import heroDoctors from "@/assets/hero-doctors.jpg";
import fotoAlberto from "@/assets/doctor-alberto.jpg";
import fotoAlonso from "@/assets/doctor-alonso.jpg";

export const Route = createFileRoute("/nosotros")({
  head: () => ({
    meta: [
      { title: "Nosotros | HEGO · Centro de especialidades médicas" },
      { name: "description", content: "Historia, filosofía de atención y tecnología de una clínica dirigida por dos hermanos médicos especialistas." },
      { property: "og:title", content: "Nosotros | HEGO · Centro de especialidades médicas" },
      { property: "og:description", content: "Historia, filosofía de atención, experiencia y tecnología médica." },
    ],
  }),
  component: Nosotros,
});

const VALORES = [
  { icon: HeartHandshake, t: "Compromiso", d: "Dedicación al bienestar de nuestros pacientes.", c: "#ef4444" },
  { icon: ShieldCheck, t: "Calidad", d: "Atención médica con altos estándares.", c: "#0ea5e9" },
  { icon: Smile, t: "Humanización", d: "Trato cálido, empático y respetuoso.", c: "#f59e0b" },
  { icon: Scale, t: "Ética", d: "Actuamos con responsabilidad y transparencia.", c: "#10b981" },
  { icon: Lightbulb, t: "Innovación", d: "Uso de tecnología y actualización constante.", c: "#8b5cf6" },
];

const SERVICIOS_OFRECIDOS = [
  { icon: Stethoscope, t: "Consulta de cardiología general", area: "cardio" },
  { icon: Gauge, t: "Evaluación de riesgo cardiovascular", area: "cardio" },
  { icon: Activity, t: "Electrocardiograma (ECG)", area: "cardio" },
  { icon: Waves, t: "Ecocardiograma", area: "cardio" },
  { icon: HeartPulse, t: "Monitoreo Holter", area: "cardio" },
  { icon: Zap, t: "Prueba de esfuerzo", area: "cardio" },
  { icon: TrendingUp, t: "Control y seguimiento de hipertensión arterial", area: "cardio" },
  { icon: HeartHandshake, t: "Manejo de insuficiencia cardíaca", area: "cardio" },
  { icon: ShieldCheck, t: "Programa de prevención cardiovascular", area: "cardio" },
];

const OBJETIVOS = [
  "Brindar atención oportuna y de calidad en salud cardiovascular y medicina interna.",
  "Promover la prevención de enfermedades del corazón y en general.",
  "Mejorar la calidad de vida de nuestros pacientes.",
  "Generar confianza y seguridad en cada atención.",
];

const HITOS = [
  { t: "La formación", d: "Dos hermanos que eligen la medicina y se forman en clínica médica, nefrología y cardiología." },
  { t: "Los primeros consultorios", d: "Nace la idea de atender con tiempo, escucha y un seguimiento que no se corta." },
  { t: "Unidad cardiológica", d: "Se suman la ecocardiografía doppler, el Holter y el MAPA." },
  { t: "Cuidado del riñón", d: "Programas de nefroprotección coordinados con cardiología y medicina interna." },
  { t: "Clínica digital", d: "Turnos online, historia clínica digital y portal del paciente en el celular." },
];

function Nosotros() {
  useReveal();
  return (
    <PublicLayout>
      <PageHero
        kicker="Nosotros"
        decoracion={<FondoEspecialidades />}
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
            <b className="font-semibold text-foreground">HEGO, Centro de especialidades médicas,</b> es un centro especializado en salud cardiovascular y medicina interna dedicado a la
            prevención, diagnóstico y tratamiento de enfermedades del corazón y en general.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Nuestro compromiso es brindar atención integral, con calidad médica, tecnología adecuada y avanzada, con enfoque humano que garantice
            bienestar y confianza a cada paciente.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" className="btn-glow rounded-full px-7"><Link to="/turnos"><CalendarPlus className="size-4" /> Solicitar turno</Link></Button>
            <Link to="/especialistas" className="inline-flex items-center gap-2 px-3 text-sm font-semibold text-primary transition-all hover:gap-3">
              Conocer a los especialistas <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Collage de fotos */}
        <div data-reveal className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-tr from-sky-400/25 via-transparent to-rose-400/25 blur-3xl" />
          <div className="group relative overflow-hidden rounded-[2.25rem] shadow-[0_50px_100px_-50px_rgba(10,25,70,.9)] ring-1 ring-black/5">
            <img src={heroDoctors} alt="Los doctores Gómez Bolaño" loading="lazy" className="aspect-[4/5] w-full object-cover object-top transition-transform duration-[1500ms] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.15_0.05_262/0.8)] via-transparent to-transparent" />
            <p className="absolute bottom-6 right-6 text-right text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Dirección médica</p>
          </div>
          <div className="glass absolute right-4 top-6 flex items-center gap-3 rounded-2xl px-4 py-3 text-white shadow-xl">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-700"><HeartHandshake className="size-4" /></span>
            <div className="text-xs leading-tight">
              <p className="font-semibold">Atención personalizada</p>
              <p className="text-white/70">con tiempo y escucha</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── CITA ───────── */}
      <section className="mx-auto max-w-5xl px-4 pb-24 text-center lg:px-8" data-reveal>
        <Quote className="mx-auto size-10 text-clinic/40" />
        <blockquote className="mt-6 font-display text-2xl italic leading-snug sm:text-4xl">
          “Más que tratar una enfermedad o revisar un estudio, cuidamos a cada persona y la acompañamos en el tiempo.”
        </blockquote>
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="flex -space-x-3">
            <img src={fotoAlonso} alt="" className="size-11 rounded-full object-cover object-top ring-4 ring-background" />
            <img src={fotoAlberto} alt="" className="size-11 rounded-full object-cover object-top ring-4 ring-background" />
          </div>
          <p className="text-left text-sm">
            <span className="block font-semibold">Dres. Gómez Bolaño</span>
            <span className="text-muted-foreground">Directores médicos</span>
          </p>
        </div>
      </section>

      {/* ───────── MISIÓN Y VISIÓN ───────── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            { icon: Target, k: "Misión", t: "Lo que hacemos cada día", d: "Ofrecer servicios integrales en salud cardiovascular con altos estándares de calidad, enfocados en la prevención, diagnóstico y tratamiento oportuno, a través de un equipo especializado y tecnología adecuada, brindando atención segura, humana y centrada en el paciente.", g: "from-rose-500 to-red-700", glow: "rgba(239,68,68,.45)" },
            { icon: Eye, k: "Visión", t: "Hacia dónde vamos", d: "Consolidarnos como un centro de referencia en atención integral y cardiovascular, reconocido por la excelencia en nuestros servicios, la confianza de nuestros pacientes y el compromiso continuo con la innovación y el cuidado de la vida.", g: "from-sky-500 to-blue-700", glow: "rgba(14,165,233,.45)" },
          ].map((m, i) => (
            <article
              key={m.k}
              data-reveal
              style={{ transitionDelay: `${i * 120}ms` }}
              className="group relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-[0_30px_70px_-45px_rgba(10,25,70,.6)] transition-all duration-500 hover:-translate-y-1 sm:p-10"
            >
              <span className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${m.g}`} />
              <span className={`pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gradient-to-br ${m.g} opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-25`} />
              <m.icon className="pointer-events-none absolute -bottom-6 -right-4 size-40 text-foreground/[0.04] transition-transform duration-700 group-hover:-rotate-6" />
              <div className="relative flex items-center gap-4">
                <span className={`flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${m.g} text-white ring-1 ring-white/30 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`} style={{ boxShadow: `0 18px 36px -14px ${m.glow}` }}>
                  <m.icon className="size-6" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{m.t}</p>
                  <h2 className="text-3xl leading-tight sm:text-4xl">{m.k}</h2>
                </div>
              </div>
              <p className="relative mt-6 text-lg leading-relaxed text-muted-foreground">{m.d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ───────── VALORES INSTITUCIONALES (oscuro) ───────── */}
      <section className="relative overflow-hidden bg-[oklch(0.17_0.05_262)] py-24 text-white">
        <div className="pointer-events-none absolute -left-32 top-0 size-[28rem] rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 size-[28rem] rounded-full bg-rose-500/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div data-reveal className="lg:sticky lg:top-28 lg:self-start">
            <span className="glass inline-flex rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em]">Valores institucionales</span>
            <h2 className="mt-5 text-4xl leading-tight text-white sm:text-5xl">
              Lo que nos <span className="italic text-sky-300">define</span>
            </h2>
            <p className="mt-5 max-w-md text-white/65">Cinco valores que guían cada consulta, cada estudio y cada control.</p>
          </div>
          <div className="grid gap-x-10 sm:grid-cols-2">
            {VALORES.map((p, i) => (
              <div
                key={p.t}
                data-reveal
                style={{ transitionDelay: `${(i % 2) * 90}ms` }}
                className={`group relative border-t border-white/10 py-8 transition-colors duration-500 ${i === VALORES.length - 1 ? "sm:col-span-2" : ""}`}
              >
                <span className="absolute left-0 top-0 h-px w-0 transition-all duration-700 group-hover:w-full" style={{ background: p.c }} />
                <div className="flex items-start gap-5">
                  <span className="font-display text-sm text-white/30">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <span className="flex size-12 items-center justify-center rounded-2xl ring-1 ring-white/15 transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110" style={{ background: `${p.c}26`, color: p.c, boxShadow: `0 15px 35px -18px ${p.c}` }}>
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

      {/* ───────── SERVICIOS OFRECIDOS + OBJETIVOS ───────── */}
      <section className="mx-auto grid max-w-7xl gap-14 px-4 py-24 lg:grid-cols-[1.25fr_0.75fr] lg:px-8">
        <div>
          <div data-reveal>
            <span className="section-kicker">Servicios ofrecidos</span>
            <h2 className="mt-4 text-4xl leading-tight sm:text-5xl">Cuidamos tu <span className="text-gradient-clinic italic">corazón</span> y tu salud</h2>
          </div>
          {/* Cardiología: los servicios del cardiólogo */}
          <div data-reveal className="relative mt-10 overflow-hidden rounded-[2rem] bg-[oklch(0.17_0.05_262)] p-6 text-white shadow-[0_40px_80px_-45px_rgba(10,25,70,.9)] sm:p-8">
            <span className="vz-orbe pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-rose-500/30 blur-3xl" />
            <Electro latidos={6} grilla={false} color="#fb7185" className="pointer-events-none absolute inset-x-0 top-6 h-16 w-full opacity-40" />
            <div className="relative flex items-center gap-4">
              <span className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 shadow-[0_16px_32px_-12px_rgba(244,63,94,.9)]">
                <span className="absolute inset-0 animate-ping rounded-2xl bg-rose-500/40" style={{ animationDuration: "1.6s" }} />
                <HeartPulse className="animate-heartbeat relative size-7" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-300">Cardiología</p>
                <p className="text-xl font-semibold">Diagnóstico, tratamiento y prevención</p>
              </div>
            </div>
            <ul className="relative mt-7 grid gap-2.5 sm:grid-cols-2">
              {SERVICIOS_OFRECIDOS.filter((x) => x.area === "cardio").map((sv, i) => (
                <li
                  key={sv.t}
                  className="group flex items-center gap-3 rounded-2xl bg-white/[0.06] px-3.5 py-3 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.12] hover:ring-rose-400/50"
                >
                  <span className="vz-pulso flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/30 transition-colors group-hover:bg-rose-500 group-hover:text-white" style={{ animationDelay: `${i * 0.35}s` }}>
                    <sv.icon className="size-[18px]" />
                  </span>
                  <span className="text-sm font-medium leading-snug text-white/90">{sv.t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Medicina Interna */}
          <div data-reveal className="group relative mt-5 flex flex-col gap-5 overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-card p-6 shadow-[0_30px_60px_-45px_rgba(16,185,129,.8)] sm:flex-row sm:items-center sm:p-8">
            <span className="vz-brillo pointer-events-none absolute inset-0" />
            <span className="pointer-events-none absolute -bottom-16 -right-10 size-56 rounded-full bg-emerald-400/15 blur-3xl" />
            <span className="vz-flota relative flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 text-white shadow-[0_16px_32px_-12px_rgba(16,185,129,.9)]">
              <Stethoscope className="size-7" />
            </span>
            <div className="relative flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Medicina Interna</p>
              <p className="mt-1 text-xl font-semibold">Atención integral del adulto</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">Consulta clínica general, chequeos y control de enfermedades crónicas como diabetes, hipertensión y colesterol.</p>
            </div>
            <Link to="/especialidades/$slug" params={{ slug: "medicina-interna" }} className="relative inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:gap-2.5 hover:bg-emerald-700">
              Conocer más <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <aside data-reveal className="relative self-start overflow-hidden rounded-[2rem] bg-[oklch(0.17_0.05_262)] p-8 text-white shadow-[0_40px_80px_-40px_rgba(10,25,70,.9)] sm:p-10 lg:sticky lg:top-28">
          <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-sky-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-rose-500/20 blur-3xl" />
          <div className="relative">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em]"><Compass className="size-3.5" /> Objetivos</span>
            <h2 className="mt-5 text-3xl leading-tight text-white sm:text-4xl">Nuestro <span className="italic text-sky-300">propósito</span></h2>
            <ol className="mt-8 space-y-5">
              {OBJETIVOS.map((o, i) => (
                <li key={o} className="group flex gap-4">
                  <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 font-display text-sm ring-1 ring-white/20 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-sky-400 group-hover:to-blue-600">
                    <span className="transition-opacity group-hover:opacity-0">{i + 1}</span>
                    <Check className="absolute size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                  <p className="pt-1.5 leading-relaxed text-white/80">{o}</p>
                </li>
              ))}
            </ol>
            <Button asChild size="lg" className="btn-glow mt-9 w-full rounded-full"><Link to="/turnos"><CalendarPlus className="size-4" /> Solicitar turno</Link></Button>
          </div>
        </aside>
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
              className="group relative h-[600px] overflow-hidden rounded-[2rem] shadow-[0_50px_90px_-50px_rgba(10,25,70,.85)] ring-1 ring-black/5"
            >
              <img src={d.foto === "alberto" ? fotoAlberto : fotoAlonso} alt={d.nombre} loading="lazy" className="absolute inset-0 size-full object-cover object-top transition-transform duration-[1400ms] group-hover:scale-105" />
              <FondoDoctor foto={d.foto} />
              <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                <p className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-lg ring-1 ring-white/30 ${d.foto === "alonso" ? "bg-rose-600/90" : "bg-sky-600/90"}`}>{d.titulo}</p>
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
