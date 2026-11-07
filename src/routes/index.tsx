import { useEffect, useState, type MouseEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Droplets,
  Dumbbell,
  FlaskConical,
  Gauge,
  HeartPulse,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TestTube,
  Video,
  Watch,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/site/PublicLayout";
import { DOCTORS, ESPECIALIDADES, SERVICIOS } from "@/data/clinic";
import heroDoctors from "@/assets/hero-doctors.jpg";
import imgInterna from "@/assets/medicina-interna.jpg";
import imgNefro from "@/assets/nefrologia.jpg";
import imgCardio from "@/assets/cardiologia.jpg";
import fotoAlberto from "@/assets/doctor-alberto.jpg";
import fotoAlonso from "@/assets/doctor-alonso.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clínica Gómez Bolaño | Medicina Interna, Nefrología y Cardiología" },
      { name: "description", content: "Ciencia, experiencia y compromiso con tu salud. Turnos online y atención especializada en Medicina Interna, Nefrología y Cardiología." },
      { property: "og:title", content: "Clínica Gómez Bolaño | Atención médica especializada" },
      { property: "og:description", content: "Medicina Interna, Nefrología, Cardiología, Cardiología Crítica y Ecocardiografía." },
    ],
  }),
  component: Home,
});

const SLIDES = [
  { img: imgInterna, titulo: "Medicina Interna", desc: "Diagnóstico integral del paciente adulto, con seguimiento clínico continuo y coordinación entre especialidades.", to: "/especialidades/medicina-interna" },
  { img: imgNefro, titulo: "Nefrología", desc: "Prevención, diagnóstico y tratamiento de la enfermedad renal, con planes de nefroprotección personalizados.", to: "/especialidades/nefrologia" },
  { img: imgCardio, titulo: "Cardiología", desc: "Evaluación cardiovascular completa, ecocardiografía y programas de prevención del riesgo cardíaco.", to: "/especialidades/cardiologia" },
];

const ICONS = {
  stethoscope: Stethoscope,
  kidney: Droplets,
  heart: HeartPulse,
  activity: Activity,
  waves: Waves,
  gauge: Gauge,
  flask: FlaskConical,
  watch: Watch,
  scan: ScanLine,
  "test-tube": TestTube,
  clipboard: ClipboardCheck,
  dumbbell: Dumbbell,
  video: Video,
} as const;

function iconFor(key: string) {
  return ICONS[key as keyof typeof ICONS] ?? Stethoscope;
}

/* Aparición suave de los elementos con data-reveal al hacer scroll */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* Foco de luz que sigue al mouse */
function trackSpot(e: MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

function SectionTitle({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  return (
    <div className="max-w-2xl" data-reveal>
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-clinic">
        <span className="h-px w-8 bg-clinic" /> {kicker}
      </span>
      <h2 className="mt-3 text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]">{title}</h2>
      <p className="mt-3 text-base text-muted-foreground sm:text-lg">{text}</p>
    </div>
  );
}

function DepartmentsMarquee() {
  const items = [...ESPECIALIDADES, ...ESPECIALIDADES];
  return (
    <div className="marquee-wrap marquee-mask overflow-hidden border-y border-border bg-card/60 py-5">
      <div className="marquee gap-4">
        {items.map((e, idx) => {
          const Icon = iconFor(e.icono);
          return (
            <span
              key={`${e.slug}-${idx}`}
              className="mx-2 inline-flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground shadow-card"
            >
              <Icon className="size-4 text-clinic" />
              {e.nombre}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function HeroCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="mx-auto max-w-7xl px-4 lg:px-8" data-reveal>
      <div className="relative h-[380px] overflow-hidden rounded-[2rem] border border-border shadow-elevated sm:h-[460px]">
        {SLIDES.map((s, idx) => (
          <img
            key={s.titulo}
            src={s.img}
            alt={s.titulo}
            width={1600}
            height={1000}
            loading="lazy"
            className={`absolute inset-0 size-full object-cover transition-all duration-[1400ms] ease-out ${
              idx === i ? "scale-100 opacity-100" : "scale-110 opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-deep via-deep/75 to-deep/10" />
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div key={i} className="absolute inset-0 flex flex-col justify-center gap-4 p-7 sm:p-14 animate-in fade-in slide-in-from-left-6 duration-700">
          <span className="glass w-fit rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-deep-foreground">
            Especialidad destacada · {String(i + 1).padStart(2, "0")}/{String(SLIDES.length).padStart(2, "0")}
          </span>
          <h2 className="max-w-lg text-4xl text-deep-foreground sm:text-5xl">{SLIDES[i]!.titulo}</h2>
          <p className="max-w-lg text-sm text-deep-foreground/80 sm:text-base">{SLIDES[i]!.desc}</p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button asChild className="btn-glow rounded-full"><Link to={SLIDES[i]!.to}>Conocer más <ArrowRight className="size-4" /></Link></Button>
            <Button asChild variant="outline" className="glass !border-white/30 !bg-white/10 rounded-full text-deep-foreground hover:bg-white/20 hover:text-deep-foreground">
              <Link to="/turnos">Solicitar turno</Link>
            </Button>
          </div>
        </div>
        <div className="absolute bottom-6 right-6 flex items-center gap-2">
          <Button size="icon" variant="outline" className="glass !border-white/30 !bg-white/10 rounded-full text-deep-foreground hover:bg-white/20 hover:text-deep-foreground" aria-label="Slide anterior" onClick={() => setI((v) => (v - 1 + SLIDES.length) % SLIDES.length)}>
            <ChevronLeft className="size-4" />
          </Button>
          {SLIDES.map((s, idx) => (
            <button key={s.titulo} aria-label={`Ir al slide ${idx + 1}`} onClick={() => setI(idx)} className={`h-2 rounded-full transition-all duration-500 ${idx === i ? "w-8 bg-white" : "w-2 bg-white/45 hover:bg-white/70"}`} />
          ))}
          <Button size="icon" variant="outline" className="glass !border-white/30 !bg-white/10 rounded-full text-deep-foreground hover:bg-white/20 hover:text-deep-foreground" aria-label="Slide siguiente" onClick={() => setI((v) => (v + 1) % SLIDES.length)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function Home() {
  useReveal();

  const stats = [
    { n: "+25", l: "Años de experiencia combinada" },
    { n: String(ESPECIALIDADES.length), l: "Departamentos y especialidades" },
    { n: "+12.000", l: "Consultas realizadas" },
    { n: "24 h", l: "Entrega de informes" },
  ];

  return (
    <PublicLayout>
      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden border-b border-border bg-deep">
        {/* Fondo: la misma foto muy desenfocada, solo como ambiente */}
        <img src={heroDoctors} alt="" aria-hidden="true" width={1600} height={1000} className="absolute inset-0 size-full scale-110 object-cover opacity-25 blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-deep via-deep/90 to-deep/60" />
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top_left,#000_30%,transparent_75%)]" />
        <div className="blob -left-24 top-10 size-80 bg-[var(--clinic)]" />
        <div className="blob bottom-0 right-10 size-72 bg-[var(--accent)] opacity-30" style={{ animationDelay: "-6s" }} />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          {/* ── Foto de los dos médicos: SIEMPRE visible, nítida y completa ── */}
          <div className="relative order-first px-2 sm:px-6 lg:order-2 lg:px-0 animate-in fade-in zoom-in-95 duration-1000">
            <div className="hero-glow absolute -inset-3 rounded-[2.5rem] bg-gradient-to-tr from-[var(--clinic)] via-white/10 to-[var(--accent)] blur-2xl sm:-inset-5" />
            <div className="relative overflow-hidden rounded-[2rem] ring-1 ring-white/30 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
              <img
                src={heroDoctors}
                alt="Dr. Carlos Alberto y Dr. Carlos Alonso Gómez Bolaño"
                width={1536}
                height={1024}
                className="hero-kenburns block aspect-[3/2] w-full object-cover"
              />
              <div className="hero-shine pointer-events-none absolute inset-0" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-deep/60 to-transparent" />
              <div className="glass absolute bottom-3 right-3 rounded-xl px-3 py-2 text-right sm:bottom-4 sm:right-4">
                <p className="text-[11px] font-semibold leading-tight text-white sm:text-xs">Dr. Alberto · Dr. Alonso</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/75">Directores médicos</p>
              </div>
            </div>

            {/* Insignias flotantes (ubicadas en los bordes, sin tapar a los médicos) */}
            <div className="animate-hero-float absolute border border-white/15 bg-deep/90 backdrop-blur-md -right-1 -top-4 hidden items-center gap-2.5 rounded-2xl px-3.5 py-2.5 shadow-lg sm:flex lg:-right-6">
              <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--clinic)]"><CalendarPlus className="size-4 text-white" /></span>
              <span className="text-xs leading-tight text-white"><b className="block text-sm">Turnos online</b>Confirmación inmediata</span>
            </div>
            <div className="animate-hero-float absolute border border-white/15 bg-deep/90 backdrop-blur-md -bottom-5 -left-1 hidden items-center gap-2.5 rounded-2xl px-3.5 py-2.5 shadow-lg sm:flex lg:-left-8" style={{ animationDelay: "1.2s" }}>
              <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--accent)]"><HeartPulse className="size-4 text-white" /></span>
              <span className="text-xs leading-tight text-white"><b className="block text-sm">Informes en 24 h</b>Rápidos y claros</span>
            </div>
          </div>

          <div className="space-y-7 lg:order-1 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-deep-foreground">
              <span className="pulse-dot size-2 rounded-full bg-[oklch(0.75_0.17_155)]" />
              <ShieldCheck className="size-3.5" /> Clínica médica especializada
            </span>

            <h1 className="text-4xl leading-[1.05] text-deep-foreground sm:text-5xl lg:text-[4.25rem]">
              Ciencia, experiencia y <span className="text-shine italic">compromiso</span> con tu salud.
            </h1>
            <p className="max-w-xl text-lg text-deep-foreground/80">
              Atención médica especializada en Medicina Interna, Nefrología y Cardiología.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="btn-glow rounded-full !bg-[var(--clinic)] px-6 text-white hover:!bg-[var(--clinic)]/90"><Link to="/turnos"><CalendarPlus className="size-4" /> Solicitar turno</Link></Button>
              <Button asChild size="lg" variant="outline" className="glass !border-white/30 !bg-white/10 rounded-full px-6 text-deep-foreground hover:bg-white/20 hover:text-deep-foreground">
                <Link to="/especialistas">Conocer a nuestros especialistas</Link>
              </Button>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-3">
                {[fotoAlberto, fotoAlonso].map((f, idx) => (
                  <img key={idx} src={f} alt="" className="size-11 rounded-full object-cover object-top ring-2 ring-deep" />
                ))}
              </div>
              <p className="text-sm leading-snug text-deep-foreground/80">
                <span className="block font-semibold text-deep-foreground">Directores médicos</span>
                Atención personalizada de lunes a sábado
              </p>
            </div>

            <svg viewBox="0 0 600 60" className="h-12 w-full max-w-md text-[var(--clinic)]" aria-hidden="true">
              <polyline className="ecg-line" points="0,30 80,30 100,10 120,50 140,30 220,30 240,5 260,55 280,30 380,30 400,14 420,46 440,30 600,30" fill="none" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </div>

          {/* Tarjetas de especialidades: fila aparte, bien separada de la foto */}
          <div className="grid gap-5 sm:grid-cols-2 lg:order-3 lg:col-span-2 lg:mt-6 lg:grid-cols-4 lg:gap-6">
            {[
              { icon: Stethoscope, t: "Medicina Interna", d: "Visión clínica integral" },
              { icon: Droplets, t: "Nefrología", d: "Salud renal y nefroprotección" },
              { icon: HeartPulse, t: "Cardiología", d: "Prevención y tratamiento" },
              { icon: Waves, t: "Ecocardiografía", d: "Diagnóstico por imágenes" },
            ].map((c, idx) => (
              <div
                key={c.t}
                className="glass group rounded-2xl p-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] transition-colors hover:bg-white/15 animate-hero-float"
                style={{ animationDelay: `${idx * 0.6}s` }}
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--clinic)] to-[var(--deep)] ring-1 ring-white/20 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                  <c.icon className="size-5 text-deep-foreground" />
                </span>
                <p className="mt-4 font-semibold text-deep-foreground">{c.t}</p>
                <p className="text-sm text-deep-foreground/70">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CINTA DE DEPARTAMENTOS ───────── */}
      <DepartmentsMarquee />

      {/* ───────── CARRUSEL ───────── */}
      <div className="py-16">
        <HeroCarousel />
      </div>

      {/* ───────── ESTADÍSTICAS ───────── */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, idx) => (
            <div
              key={s.l}
              data-reveal
              style={{ transitionDelay: `${idx * 90}ms` }}
              className="card-lift relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-card"
            >
              <div className="absolute -right-8 -top-8 size-24 rounded-full bg-[var(--clinic)]/10 blur-2xl" />
              <p className="font-display text-4xl font-semibold text-gradient-clinic">{s.n}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── DEPARTAMENTOS / ESPECIALIDADES ───────── */}
      <section className="relative mx-auto max-w-7xl px-4 py-24 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-10 -z-10 h-96 bg-dots [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_70%)]" />
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <SectionTitle
            kicker="Departamentos"
            title="Especialidades y unidades de la clínica"
            text={`${ESPECIALIDADES.length} áreas médicas coordinadas por los directores de la clínica, con estudios e informes en el mismo lugar.`}
          />
          <Button asChild variant="outline" className="rounded-full" data-reveal>
            <Link to="/especialidades">Ver todas <ArrowRight className="size-4" /></Link>
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ESPECIALIDADES.map((e, idx) => {
            const Icon = iconFor(e.icono);
            const docs = DOCTORS.filter((d) => e.doctorIds.includes(d.id));
            return (
              <Link
                key={e.slug}
                to="/especialidades/$slug"
                params={{ slug: e.slug }}
                onMouseMove={trackSpot}
                data-reveal
                style={{ transitionDelay: `${(idx % 4) * 80}ms` }}
                className="spotlight card-lift group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-[var(--clinic)] group-hover:to-[var(--deep)] group-hover:text-white group-hover:shadow-[var(--shadow-glow)]">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-display text-sm text-muted-foreground/60">{String(idx + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{e.nombre}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{e.descripcion}</p>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <div className="flex -space-x-2">
                    {docs.map((d) => (
                      <img
                        key={d.id}
                        src={d.foto === "alberto" ? fotoAlberto : fotoAlonso}
                        alt={d.nombre}
                        title={d.nombre}
                        className="size-7 rounded-full object-cover object-top ring-2 ring-card"
                      />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Ver más <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ───────── ESPECIALISTAS ───────── */}
      <section className="relative overflow-hidden border-y border-border bg-secondary/50 py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-12">
            <SectionTitle
              kicker="Equipo médico"
              title="Nuestros especialistas"
              text="Dos hermanos médicos al frente de la dirección clínica y asistencial."
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {DOCTORS.map((d, idx) => (
              <div
                key={d.id}
                data-reveal
                style={{ transitionDelay: `${idx * 120}ms` }}
                className="card-lift group overflow-hidden rounded-3xl border border-border bg-card shadow-card"
              >
                <div className="flex flex-col gap-6 p-6 sm:flex-row">
                  <div className="relative h-56 w-full shrink-0 overflow-hidden rounded-2xl sm:h-48 sm:w-40">
                    <img
                      src={d.foto === "alberto" ? fotoAlberto : fotoAlonso}
                      alt={d.nombre}
                      width={900}
                      height={1100}
                      loading="lazy"
                      className="size-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep/50 to-transparent" />
                    <span className="glass absolute bottom-2 left-2 rounded-full px-2.5 py-0.5 text-[11px] font-medium text-white">{d.matricula}</span>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <h3 className="font-display text-xl font-semibold">{d.nombre}</h3>
                    <p className="text-sm font-medium text-clinic">{d.titulo}</p>
                    <p className="text-sm text-muted-foreground">{d.bio}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {d.especialidades.map((esp) => (
                        <span key={esp} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{esp}</span>
                      ))}
                    </div>
                    <div className="mt-auto flex flex-wrap gap-2 pt-3">
                      <Button asChild size="sm" variant="outline" className="rounded-full"><Link to="/especialistas/$id" params={{ id: d.id }}>Ver perfil completo</Link></Button>
                      <Button asChild size="sm" className="rounded-full"><Link to="/turnos" search={{ doctor: d.id }}>Solicitar turno</Link></Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── SERVICIOS ───────── */}
      <section className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <SectionTitle
            kicker="Servicios"
            title="Servicios destacados"
            text="Consultas y estudios con turno online y confirmación inmediata."
          />
          <Button asChild variant="outline" className="rounded-full" data-reveal><Link to="/servicios">Ver todos los servicios</Link></Button>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SERVICIOS.slice(0, 6).map((s, idx) => (
            <div
              key={s.id}
              onMouseMove={trackSpot}
              data-reveal
              style={{ transitionDelay: `${(idx % 3) * 90}ms` }}
              className="spotlight card-lift flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">{s.especialidad}</span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3.5" /> {s.duracion} min</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.nombre}</h3>
              <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{s.descripcion}</p>
              <div className="mt-5 flex items-center justify-between">
                <p className="font-display text-2xl font-semibold">${s.precio.toLocaleString("es-AR")}</p>
                <Button asChild size="sm" className="rounded-full"><Link to="/turnos" search={{ doctor: s.doctorId }}>Solicitar turno</Link></Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── CTA FINAL ───────── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 lg:px-8">
        <div data-reveal className="relative overflow-hidden rounded-[2rem] gradient-deep p-10 text-center shadow-elevated sm:p-16">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div className="blob -left-10 -top-10 size-64 bg-white/30" />
          <div className="blob -bottom-16 right-0 size-72 bg-[var(--accent)] opacity-40" style={{ animationDelay: "-8s" }} />
          <div className="relative">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-deep-foreground">
              <Sparkles className="size-3.5" /> Atención personalizada
            </span>
            <h2 className="mt-5 text-3xl text-deep-foreground sm:text-5xl">Tu salud, con seguimiento real</h2>
            <p className="mx-auto mt-4 max-w-2xl text-deep-foreground/80">
              Reservá tu turno online en minutos o escribinos por WhatsApp. Te acompañamos en cada control y estudio.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary" className="rounded-full px-7 transition-transform hover:-translate-y-0.5"><Link to="/turnos"><CalendarPlus className="size-4" /> Solicitar turno</Link></Button>
              <Button asChild size="lg" variant="outline" className="glass !border-white/30 !bg-white/10 rounded-full px-7 text-deep-foreground hover:bg-white/20 hover:text-deep-foreground">
                <Link to="/contacto">Contactanos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}