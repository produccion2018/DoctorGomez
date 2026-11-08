import { useEffect, useState } from "react";
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
  Smartphone,
  Sparkles,
  Stethoscope,
  TestTube,
  Video,
  Watch,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/site/PublicLayout";
import { DOCTORS, ESPECIALIDADES, SERVICIOS, imagenEspecialidad } from "@/data/clinic";
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
/* Número que cuenta hacia arriba cuando aparece en pantalla */
function Contador({ valor }: { valor: string }) {
  const m = valor.match(/^([^\d]*)([\d.]+)(.*)$/);
  const objetivo = m ? Number(m[2]!.replace(/\./g, "")) : 0;
  const [n, setN] = useState(0);
  const [ref, setRef] = useState<HTMLSpanElement | null>(null);
  useEffect(() => {
    if (!ref || !m) return;
    const io = new IntersectionObserver(([en]) => {
      if (!en?.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const paso = (t: number) => {
        const k = Math.min(1, (t - t0) / 1600);
        setN(Math.round(objetivo * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    });
    io.observe(ref);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
  if (!m) return <>{valor}</>;
  return <span ref={setRef}>{m[1]}{n.toLocaleString("es-AR")}{m[3]}</span>;
}

function SectionTitle({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  return (
    <div className="max-w-2xl" data-reveal>
      <span className="section-kicker">{kicker}</span>
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

/* Explorador de especialidades: lista elegante + panel grande con foto */
function ExploradorEspecialidades() {
  const [act, setAct] = useState(0);
  const e = ESPECIALIDADES[act]!;
  const Icon = iconFor(e.icono);
  const docs = DOCTORS.filter((d) => e.doctorIds.includes(d.id));
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14">
      <ol className="border-y border-border/70" data-reveal>
        {ESPECIALIDADES.map((x, i) => {
          const I = iconFor(x.icono);
          const on = i === act;
          return (
            <li key={x.slug} className="border-b border-border/70 last:border-0">
              <button
                type="button"
                onMouseEnter={() => setAct(i)}
                onFocus={() => setAct(i)}
                onClick={() => setAct(i)}
                aria-expanded={on}
                className={`group relative flex w-full items-center gap-4 py-3.5 text-left transition-all duration-300 ${on ? "lg:pl-4" : "hover:lg:pl-2"}`}
              >
                <span className={`absolute left-0 top-1/2 hidden h-8 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-[var(--clinic)] to-rose-500 transition-opacity lg:block ${on ? "opacity-100" : "opacity-0"}`} />
                <span className="w-7 font-display text-sm tabular-nums text-muted-foreground/60">{String(i + 1).padStart(2, "0")}</span>
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-all duration-500 ${on ? "gradient-deep text-white shadow-[0_10px_25px_-10px_rgba(20,50,120,.9)]" : "bg-secondary text-primary"}`}>
                  <I className="size-4" />
                </span>
                <span className={`flex-1 text-[15px] font-medium transition-colors sm:text-base ${on ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>{x.nombre}</span>
                <ArrowRight className={`size-4 text-clinic transition-all duration-300 ${on ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`} />
              </button>
              {on && (
                <div className="animate-in fade-in slide-in-from-top-1 pb-5 pl-11 duration-300 lg:hidden">
                  <p className="text-sm text-muted-foreground">{x.descripcion}</p>
                  <Link to="/especialidades/$slug" params={{ slug: x.slug }} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-clinic">
                    Conocer más <ArrowUpRight className="size-4" />
                  </Link>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="relative hidden lg:block">
        <div className="sticky top-28">
          <div key={e.slug} className="relative h-[640px] overflow-hidden rounded-[2rem] shadow-[0_50px_100px_-50px_rgba(10,25,70,.85)] ring-1 ring-white/10 animate-in fade-in zoom-in-[0.98] duration-500">
            <img src={imagenEspecialidad(e.slug)} alt={e.nombre} className="absolute inset-0 size-full scale-105 object-cover animate-in zoom-in-110 duration-[1400ms]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.05_262)] via-[oklch(0.16_0.05_262/0.7)] to-[oklch(0.16_0.05_262/0.05)]" />
            <div className="absolute -bottom-24 -left-16 size-80 rounded-full bg-sky-500/25 blur-3xl" />
            <div className="absolute -right-16 top-10 size-64 rounded-full bg-rose-500/15 blur-3xl" />
            <span className="glass absolute left-7 top-7 rounded-full px-3 py-1 font-display text-xs tracking-widest text-white">
              {String(act + 1).padStart(2, "0")} / {String(ESPECIALIDADES.length).padStart(2, "0")}
            </span>
            <div className="absolute inset-x-0 bottom-0 p-10 text-white">
              <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-md"><Icon className="size-6" /></span>
              <h3 className="font-display text-4xl font-semibold leading-tight">{e.nombre}</h3>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/75">{e.descripcion}</p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {docs.map((d) => (
                      <img key={d.id} src={d.foto === "alberto" ? fotoAlberto : fotoAlonso} alt={d.nombre} className="size-9 rounded-full object-cover object-top ring-2 ring-white/70" />
                    ))}
                  </div>
                  <p className="text-xs leading-snug text-white/70">
                    {docs.length > 1 ? "Ambos directores" : docs[0]?.nombre}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link to="/turnos" className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10">Solicitar turno</Link>
                  <Link to="/especialidades/$slug" params={{ slug: e.slug }} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[oklch(0.25_0.08_260)] transition-all hover:gap-2.5">
                    Conocer más <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
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
        <div data-reveal className="relative overflow-hidden rounded-[2rem] gradient-deep px-6 py-10 text-white shadow-[0_40px_80px_-40px_rgba(10,25,70,.8)] ring-1 ring-white/10 sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-0 size-80 rounded-full bg-rose-500/20 blur-3xl" />
          <div className="relative grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:divide-x lg:divide-white/10">
            {stats.map((s) => (
              <div key={s.l} className="px-3 text-center">
                <p className="font-display text-4xl font-semibold tracking-tight sm:text-5xl"><Contador valor={s.n} /></p>
                <p className="mx-auto mt-2 max-w-[12rem] text-xs uppercase tracking-[0.14em] text-white/60 sm:text-[13px]">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── DEPARTAMENTOS / ESPECIALIDADES ───────── */}
      <section className="relative mx-auto max-w-7xl px-4 py-24 lg:px-8">
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
        <ExploradorEspecialidades />
      </section>

      {/* ───────── CORAZÓN Y RIÑÓN ───────── */}
      <section className="relative mx-auto max-w-7xl px-4 py-24 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center" data-reveal>
          <span className="section-kicker"><HeartPulse className="size-3.5" /> Nuestras dos grandes áreas</span>
          <h2 className="mt-4 text-3xl leading-tight sm:text-5xl">El corazón y los riñones, <span className="text-gradient-clinic italic">cuidados juntos</span></h2>
          <p className="mt-4 text-lg text-muted-foreground">La hipertensión, la diabetes y la enfermedad renal afectan al corazón y al riñón a la vez. Por eso los atendemos de forma coordinada.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            {
              slug: "cardiologia",
              titulo: "Cardiología",
              img: imgCardio,
              icon: HeartPulse,
              color: "from-rose-500 to-red-700",
              glow: "bg-rose-500/30",
              doctor: "Dr. Carlos Alonso Gómez Bolaño",
              puntos: ["Ecocardiograma doppler color", "Holter 24 h y MAPA", "Ergometría y apto físico", "Insuficiencia cardíaca y arritmias"],
            },
            {
              slug: "nefrologia",
              titulo: "Nefrología",
              img: imgNefro,
              icon: Droplets,
              color: "from-sky-500 to-blue-700",
              glow: "bg-sky-500/30",
              doctor: "Dr. Carlos Alberto Gómez Bolaño",
              puntos: ["Enfermedad renal crónica", "Hipertensión de causa renal", "Ecografía y doppler renal", "Plan de nefroprotección"],
            },
          ].map((a, i) => (
            <Link
              key={a.slug}
              to="/especialidades/$slug"
              params={{ slug: a.slug }}
              data-reveal
              style={{ transitionDelay: `${i * 120}ms` }}
              className="group relative min-h-[520px] overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-40px_rgba(10,25,70,.7)] ring-1 ring-white/10"
            >
              <img src={a.img} alt={a.titulo} loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.15_0.05_260)] via-[oklch(0.15_0.05_260/0.75)] to-transparent" />
              <div className={`absolute -bottom-20 -left-10 size-72 rounded-full ${a.glow} blur-3xl transition-opacity duration-700 group-hover:opacity-100 opacity-60`} />
              <div className="relative flex h-full min-h-[520px] flex-col justify-end p-8 text-white sm:p-10">
                <span className={`mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${a.color} shadow-xl ring-1 ring-white/20 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110`}><a.icon className="size-6" /></span>
                <h3 className="font-display text-4xl font-semibold">{a.titulo}</h3>
                <p className="mt-1 text-sm text-white/70">A cargo del {a.doctor}</p>
                <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {a.puntos.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/10 backdrop-blur">
                      <span className="size-1.5 shrink-0 rounded-full bg-white" /> {p}
                    </li>
                  ))}
                </ul>
                <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[oklch(0.25_0.08_260)] transition-all group-hover:gap-3">
                  Conocer {a.titulo} <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ───────── ESPECIALISTAS ───────── */}
      <section className="relative overflow-hidden py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-14">
            <SectionTitle
              kicker="Equipo médico"
              title="Nuestros especialistas"
              text="Dos hermanos médicos al frente de la dirección clínica y asistencial."
            />
          </div>
          <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
            {DOCTORS.map((d, idx) => (
              <article key={d.id} data-reveal style={{ transitionDelay: `${idx * 140}ms` }} className={`group ${idx === 1 ? "md:mt-16" : ""}`}>
                <div className="relative h-[440px] overflow-hidden rounded-[2rem] shadow-[0_50px_90px_-50px_rgba(10,25,70,.85)] ring-1 ring-black/5 sm:h-[520px]">
                  <img
                    src={d.foto === "alberto" ? fotoAlberto : fotoAlonso}
                    alt={d.nombre}
                    width={900}
                    height={1100}
                    loading="lazy"
                    className="size-full object-cover object-top transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.15_0.05_262)] via-[oklch(0.15_0.05_262/0.25)] to-transparent" />
                  <span className="glass absolute left-6 top-6 rounded-full px-3 py-1 text-[11px] font-medium text-white">{d.matricula}</span>
                  <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/90">{d.titulo}</p>
                    <h3 className="mt-2 font-display text-3xl font-semibold leading-tight">{d.nombre}</h3>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {d.especialidades.map((esp) => (
                        <span key={esp} className="rounded-full bg-white/12 px-3 py-1 text-xs font-medium ring-1 ring-white/20 backdrop-blur">{esp}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">{d.bio}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button asChild className="rounded-full"><Link to="/turnos" search={{ doctor: d.id }}>Solicitar turno</Link></Button>
                  <Link to="/especialistas/$id" params={{ id: d.id }} className="inline-flex items-center gap-1.5 px-2 text-sm font-semibold text-primary transition-all hover:gap-2.5">
                    Ver perfil completo <ArrowRight className="size-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── SERVICIOS ───────── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 lg:px-8">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <SectionTitle
            kicker="Servicios"
            title="Servicios destacados"
            text="Consultas y estudios con turno online y confirmación inmediata."
          />
          <Button asChild variant="outline" className="rounded-full" data-reveal><Link to="/servicios">Ver todos los servicios</Link></Button>
        </div>
        <div data-reveal className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/70 shadow-[0_30px_70px_-45px_rgba(10,25,70,.5)] backdrop-blur-xl">
          {SERVICIOS.slice(0, 6).map((s, idx) => (
            <div key={s.id} className="group relative flex flex-col gap-3 border-b border-border/60 px-6 py-5 transition-colors last:border-0 hover:bg-secondary/40 sm:flex-row sm:items-center sm:gap-6 sm:px-8">
              <span className="absolute inset-y-4 left-0 w-[3px] rounded-full bg-gradient-to-b from-[var(--clinic)] to-rose-500 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="hidden w-6 font-display text-sm tabular-nums text-muted-foreground/60 sm:block">{String(idx + 1).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{s.nombre}</h3>
                <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{s.descripcion}</p>
              </div>
              <div className="flex items-center gap-4 sm:gap-6">
                <span className="hidden rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground md:inline">{s.especialidad}</span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3.5" /> {s.duracion} min</span>
                <p className="ml-auto font-display text-xl font-semibold tabular-nums sm:w-28 sm:text-right">${s.precio.toLocaleString("es-AR")}</p>
                <Button asChild size="sm" variant="outline" className="rounded-full transition-all group-hover:border-transparent group-hover:bg-primary group-hover:text-primary-foreground">
                  <Link to="/turnos" search={{ doctor: s.doctorId }}>Reservar</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── CÓMO SACAR TURNO ───────── */}
      <section className="relative mx-auto max-w-7xl px-4 pb-24 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center" data-reveal>
          <span className="section-kicker"><CalendarPlus className="size-3.5" /> Turnos online</span>
          <h2 className="mt-4 text-3xl leading-tight sm:text-5xl">Tu turno en <span className="text-gradient-clinic italic">tres pasos</span></h2>
        </div>
        <div className="relative grid gap-6 md:grid-cols-3">
          <div className="premium-divider absolute left-[16%] right-[16%] top-10 hidden md:block" />
          {[
            { n: "01", icon: Stethoscope, t: "Elegí la especialidad", d: "Cardiología, nefrología, medicina interna y más." },
            { n: "02", icon: Clock, t: "Elegí día y horario", d: "Ves solo los horarios libres, actualizados por cada doctor." },
            { n: "03", icon: ShieldCheck, t: "Confirmamos tu turno", d: "Te escribimos por WhatsApp con las indicaciones." },
          ].map((p, i) => (
            <div key={p.n} data-reveal style={{ transitionDelay: `${i * 120}ms` }} className="relative rounded-3xl p-8 text-center">
              <span className="relative mx-auto flex size-20 items-center justify-center rounded-3xl gradient-deep text-white shadow-[0_20px_40px_-15px_rgba(20,50,120,.8)]">
                <p.icon className="size-8" />
                <span className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full bg-white font-display text-sm font-bold text-[var(--deep)] shadow-md">{p.n}</span>
              </span>
              <h3 className="mt-6 text-lg font-semibold">{p.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center" data-reveal>
          <Button asChild size="lg" className="btn-glow rounded-full px-8"><Link to="/turnos"><CalendarPlus className="size-4" /> Reservar ahora</Link></Button>
        </div>
      </section>

      {/* ───────── PORTAL DEL PACIENTE ───────── */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-[oklch(0.17_0.05_260)]" />
        <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]" />
        <div className="blob -left-20 top-10 size-96 bg-[var(--clinic)] opacity-40" />
        <div className="blob -right-20 bottom-0 size-80 bg-fuchsia-500 opacity-25" style={{ animationDelay: "-7s" }} />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 lg:grid-cols-2 lg:px-8">
          <div data-reveal className="text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/85 ring-1 ring-white/15"><Smartphone className="size-3.5" /> Portal del paciente</span>
            <h2 className="mt-5 text-3xl leading-tight text-white sm:text-5xl">Tu salud, <span className="text-shine italic">en tu celular</span></h2>
            <p className="mt-4 max-w-lg text-lg text-white/70">Los pacientes de la clínica tienen su propio portal para seguir su tratamiento entre consulta y consulta.</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                { i: CalendarPlus, t: "Turnos y recordatorios" },
                { i: Gauge, t: "Registro de presión y peso" },
                { i: FlaskConical, t: "Resultados explicados" },
                { i: ClipboardCheck, t: "Autorizaciones y recetas" },
              ].map((x) => (
                <li key={x.t} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3.5 ring-1 ring-white/10 backdrop-blur">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600"><x.i className="size-4" /></span>
                  <span className="text-sm font-medium">{x.t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full !bg-white px-7 text-[var(--deep)] hover:!bg-white/90"><Link to="/portal">Entrar a mi portal <ArrowRight className="size-4" /></Link></Button>
            </div>
            <p className="mt-4 text-xs text-white/50">El acceso lo habilita la clínica: te enviamos tu código por WhatsApp.</p>
          </div>

          {/* Maqueta de teléfono */}
          <div data-reveal className="relative mx-auto w-full max-w-[330px]">
            <div className="absolute -inset-10 rounded-full bg-[var(--clinic)]/30 blur-3xl" />
            <div className="relative animate-hero-float rounded-[2.8rem] bg-gradient-to-b from-slate-700 to-slate-900 p-3 shadow-[0_50px_100px_-30px_rgba(0,0,0,.9)] ring-1 ring-white/15">
              <div className="overflow-hidden rounded-[2.2rem] bg-[#f5f7fb]">
                <div className="flex items-center justify-between px-6 pb-2 pt-4 text-[10px] font-semibold text-slate-500"><span>9:41</span><span className="h-5 w-20 rounded-full bg-slate-900" /><span>100%</span></div>
                <div className="space-y-3 p-4">
                  <div className="rounded-2xl gradient-deep p-4 text-white">
                    <p className="text-[10px] text-white/70">Buenos días</p>
                    <p className="font-display text-lg leading-tight">Laura, ¿cómo te sentís?</p>
                    <div className="mt-3 rounded-xl bg-white/15 p-2.5 text-[10px]">
                      <p className="text-white/70">Próximo turno · mañana</p>
                      <p className="font-semibold">Ecocardiograma · 10:00</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Presión</p>
                      <p className="font-display text-lg font-semibold text-slate-900">124/78</p>
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-bold text-amber-700">Elevada</span>
                    </div>
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Riñón</p>
                      <p className="font-display text-lg font-semibold text-slate-900">68 <span className="text-[9px] font-normal">ml/min</span></p>
                      <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-bold text-emerald-700">Estadio G2</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-slate-500">Medicación de hoy</p>
                    {[["08:00", "Enalapril 10 mg", true], ["20:00", "Enalapril 10 mg", false]].map(([h, n, ok]) => (
                      <div key={String(h)} className="flex items-center gap-2 py-1 text-[10px] text-slate-700">
                        <span className={`flex size-4 items-center justify-center rounded-full ${ok ? "bg-emerald-500 text-white" : "border border-slate-300"}`}>{ok ? "✓" : ""}</span>
                        <b>{String(h)}</b> {String(n)}
                      </div>
                    ))}
                  </div>
                  <svg viewBox="0 0 200 40" className="h-8 w-full text-rose-400"><polyline className="ecg-line" points="0,20 50,20 60,20 66,6 72,34 78,20 130,20 140,20 146,2 152,38 158,20 200,20" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                </div>
              </div>
            </div>
          </div>
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