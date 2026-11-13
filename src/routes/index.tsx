import { useEffect, useState, type CSSProperties } from "react";
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
import { PublicLayout, FondoDoctor, Electro } from "@/components/site/PublicLayout";
import { DOCTORS, ESPECIALIDADES, SERVICIOS, imagenEspecialidad } from "@/data/clinic";
import heroDoctors from "@/assets/hero-doctors.jpg";
import imgInterna from "@/assets/esp-medicina-interna.jpg";
import imgNefro from "@/assets/nefrologia.jpg";
import imgCardio from "@/assets/cardiologia.jpg";
import fotoAlberto from "@/assets/doctor-alberto.jpg";
import fotoAlonso from "@/assets/doctor-alonso.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HEGO · Centro de especialidades médicas | Medicina Interna, Cardiología y Nefrología" },
      { name: "description", content: "Ciencia, experiencia y compromiso con tu salud. Turnos online y atención especializada en Medicina Interna, Cardiología y Nefrología." },
      { property: "og:title", content: "HEGO · Centro de especialidades médicas | Atención médica especializada" },
      { property: "og:description", content: "Medicina Interna, Cardiología, Nefrología, Cardiología Crítica y Ecocardiografía." },
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
    <div className="relative overflow-hidden bg-[oklch(0.16_0.05_262)] py-7">
      {/* Brillos y líneas finas arriba y abajo */}
      <div className="pointer-events-none absolute -left-20 top-1/2 size-72 -translate-y-1/2 rounded-full bg-sky-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/2 size-72 -translate-y-1/2 rounded-full bg-rose-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-rose-300/40 to-transparent" />

      <div className="marquee-wrap marquee-mask relative overflow-hidden">
        <div className="marquee items-center">
          {items.map((e, idx) => {
            const Icon = iconFor(e.icono);
            return (
              <span key={`${e.slug}-${idx}`} className="group inline-flex shrink-0 items-center">
                <Link
                  to="/especialidades/$slug"
                  params={{ slug: e.slug }}
                  className="inline-flex items-center gap-3 px-6 text-white/75 transition-colors duration-300 hover:text-white"
                >
                  <span className="relative flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-white/15 to-white/5 ring-1 ring-white/15 transition-all duration-500 group-hover:scale-110 group-hover:from-sky-400 group-hover:to-blue-700 group-hover:shadow-[0_0_25px_rgba(56,189,248,.65)] group-hover:ring-sky-300/50">
                    <Icon className="size-[18px] text-sky-200 transition-colors group-hover:text-white" />
                  </span>
                  <span className="font-display text-xl tracking-tight sm:text-2xl">{e.nombre}</span>
                </Link>
                <span className="text-sm text-sky-300/50" aria-hidden="true">✦</span>
              </span>
            );
          })}
        </div>
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
            className={`absolute inset-0 size-full object-cover object-[center_22%] transition-all duration-[1400ms] ease-out ${
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

  return (
    <PublicLayout>
      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden border-b border-border bg-deep">
        {/* Foto de los médicos ocupando todo el hero */}
        <div className="relative lg:min-h-[780px]">
          <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/9] lg:absolute lg:inset-0 lg:left-[16%] lg:aspect-auto lg:[mask-image:linear-gradient(to_right,transparent,#000_22%)]">
            <img
              src={heroDoctors}
              alt="Dr. Carlos Alonso y Dr. Carlos Alberto Gómez Bolaño"
              width={1536}
              height={1024}
              className="hero-kenburns absolute inset-0 size-full object-cover object-center"
            />
            <div className="hero-shine pointer-events-none absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-deep to-transparent lg:hidden" />
          </div>
          {/* Velo azul suave, solo detrás del texto (escritorio) */}
          <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-deep/90 via-deep/45 via-30% to-transparent to-55% lg:block" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-32 bg-gradient-to-t from-deep to-transparent lg:block" />

          <div className="relative mx-auto -mt-10 max-w-7xl px-4 pb-14 lg:mt-0 lg:flex lg:min-h-[780px] lg:items-center lg:px-8 lg:py-24">
            <div className="max-w-xl space-y-7">
              <span className="hero-word glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-deep-foreground" style={{ animationDelay: "0.05s" }}>
                <span className="pulse-dot size-2 rounded-full bg-[oklch(0.75_0.17_155)]" />
                <ShieldCheck className="size-3.5" /> Centro de especialidades médicas
              </span>

              <h1 className="text-4xl leading-[1.05] text-deep-foreground drop-shadow-[0_4px_24px_rgba(0,0,0,.35)] sm:text-5xl lg:text-[4.25rem]">
                {["Ciencia,", "experiencia", "y"].map((w, k) => (
                  <span key={w} className="hero-word mr-[0.25em] inline-block" style={{ animationDelay: `${0.2 + k * 0.12}s` }}>{w}</span>
                ))}
                <span className="hero-word mr-[0.25em] inline-block" style={{ animationDelay: "0.56s" }}><span className="text-shine italic">compromiso</span></span>
                {["con", "tu", "salud."].map((w, k) => (
                  <span key={w} className="hero-word mr-[0.25em] inline-block" style={{ animationDelay: `${0.68 + k * 0.12}s` }}>{w}</span>
                ))}
              </h1>
              <p className="hero-word max-w-lg text-lg text-deep-foreground/85" style={{ animationDelay: "1.05s" }}>
                Atención médica especializada en Medicina Interna, Cardiología y Nefrología.
              </p>
              <div className="hero-word flex flex-wrap gap-3" style={{ animationDelay: "1.2s" }}>
                <Button asChild size="lg" className="btn-glow rounded-full !bg-[var(--clinic)] px-6 text-white hover:!bg-[var(--clinic)]/90"><Link to="/turnos"><CalendarPlus className="size-4" /> Solicitar turno</Link></Button>
                <Button asChild size="lg" variant="outline" className="glass !border-white/30 !bg-white/10 rounded-full px-6 text-deep-foreground hover:bg-white/20 hover:text-deep-foreground">
                  <Link to="/especialistas">Conocer a nuestros especialistas</Link>
                </Button>
              </div>

              <div className="hero-word flex items-center gap-4 pt-2" style={{ animationDelay: "1.35s" }}>
                <div className="flex -space-x-3">
                  {[fotoAlonso, fotoAlberto].map((f, idx) => (
                    <img key={idx} src={f} alt="" className="size-11 rounded-full object-cover object-top ring-2 ring-deep" />
                  ))}
                </div>
                <p className="text-sm leading-snug text-deep-foreground/85">
                  <span className="block font-semibold text-deep-foreground">Directores médicos</span>
                  Atención personalizada con turno previo
                </p>
              </div>

              <Electro latidos={3} className="h-24 w-full max-w-xl" />
            </div>
          </div>

          {/* Insignias flotantes sobre la foto */}
          <div className="animate-hero-float absolute right-6 top-8 hidden items-center gap-2.5 rounded-2xl border border-white/15 bg-deep/80 px-3.5 py-2.5 shadow-lg backdrop-blur-md lg:right-10 lg:flex">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--clinic)]"><CalendarPlus className="size-4 text-white" /></span>
            <span className="text-xs leading-tight text-white"><b className="block text-sm">Turnos online</b>Pedilo en minutos</span>
          </div>
          <div className="animate-hero-float absolute bottom-32 right-6 hidden items-center gap-2.5 rounded-2xl border border-white/15 bg-deep/80 px-3.5 py-2.5 shadow-lg backdrop-blur-md lg:right-10 lg:flex" style={{ animationDelay: "1.2s" }}>
            <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--accent)]"><HeartPulse className="size-4 text-white" /></span>
            <span className="text-xs leading-tight text-white"><b className="block text-sm">Informes claros</b>Explicados por tu médico</span>
          </div>
          <div className="glass absolute bottom-6 right-6 hidden rounded-xl px-3 py-2 text-right lg:right-10 lg:block">
            <p className="text-xs font-semibold leading-snug text-white">Dr. Carlos Alonso Gómez Bolaño<br />Dr. Carlos Alberto Gómez Bolaño</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/75">Directores médicos</p>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-16 lg:px-8">
          {/* Tarjetas de especialidades: fila aparte, bien separada de la foto */}
          <div className="-mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {[
              { icon: Stethoscope, t: "Medicina Interna", d: "Visión clínica integral", slug: "medicina-interna", c: "#10b981", c2: "#047857" },
              { icon: HeartPulse, t: "Cardiología", d: "Prevención y tratamiento", slug: "cardiologia", c: "#ef4444", c2: "#b91c1c" },
              { icon: Droplets, t: "Nefrología", d: "Salud renal y nefroprotección", slug: "nefrologia", c: "#0ea5e9", c2: "#0369a1" },
              { icon: Waves, t: "Ecocardiografía", d: "Diagnóstico por imágenes", slug: "ecocardiografia", c: "#8b5cf6", c2: "#6d28d9" },
            ].map((c, idx) => (
              <Link
                key={c.t}
                to="/especialidades/$slug"
                params={{ slug: c.slug }}
                className="esp-card hero-word group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:border-transparent hover:bg-white/[0.1] hover:shadow-[0_30px_60px_-25px_var(--c)]"
                style={{ "--c": c.c, animationDelay: `${1.4 + idx * 0.12}s` } as CSSProperties}
              >
                {/* Línea de color arriba y halo */}
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[var(--c)] to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                <span className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full opacity-25 blur-2xl transition-opacity duration-500 group-hover:opacity-50" style={{ background: c.c }} />
                <c.icon className="pointer-events-none absolute -bottom-4 -right-3 size-24 opacity-[0.06] transition-all duration-700 group-hover:-rotate-6 group-hover:opacity-[0.12]" style={{ color: c.c }} />

                <div className="relative flex items-start justify-between">
                  <span
                    className="relative flex size-12 items-center justify-center rounded-xl text-white shadow-lg ring-1 ring-white/25 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                    style={{ background: `linear-gradient(135deg, ${c.c}, ${c.c2})`, boxShadow: `0 12px 28px -10px ${c.c}` }}
                  >
                    <c.icon className={`size-6 ${c.slug === "cardiologia" ? "animate-heartbeat" : ""}`} />
                  </span>
                  <span className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white/70 ring-1 ring-white/15 transition-all duration-500 group-hover:translate-x-0.5 group-hover:text-white">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
                <p className="relative mt-5 text-lg font-semibold text-white">{c.t}</p>
                <p className="relative text-sm text-white/70">{c.d}</p>
                <span className="relative mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: c.c }}>
                  <span className="h-px w-6 transition-all duration-500 group-hover:w-10" style={{ background: c.c }} /> Ver especialidad
                </span>
              </Link>
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
              <article key={d.id} data-reveal style={{ transitionDelay: `${idx * 140}ms` }} className="group">
                <div className="relative h-[440px] overflow-hidden rounded-[2rem] shadow-[0_50px_90px_-50px_rgba(10,25,70,.85)] ring-1 ring-black/5 sm:h-[520px]">
                  <img
                    src={d.foto === "alberto" ? fotoAlberto : fotoAlonso}
                    alt={d.nombre}
                    width={900}
                    height={1100}
                    loading="lazy"
                    className="size-full object-cover object-top transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                  />
                  <FondoDoctor foto={d.foto} />
                  <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-8">
                    <p className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-lg ring-1 ring-white/30 ${d.foto === "alonso" ? "bg-rose-600/90" : "bg-sky-600/90"}`}>{d.titulo}</p>
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
            text="Consultas y estudios con turno online. La clínica te confirma el horario."
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
                <Button asChild size="sm" variant="outline" className="ml-auto rounded-full transition-all group-hover:border-transparent group-hover:bg-primary group-hover:text-primary-foreground">
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
        <div className="relative grid gap-3 md:grid-cols-3 md:gap-6">
          <div className="premium-divider absolute left-[16%] right-[16%] top-10 hidden md:block" />
          {[
            { n: "01", icon: Stethoscope, t: "Elegí la especialidad", d: "Cardiología, nefrología, medicina interna y más." },
            { n: "02", icon: Clock, t: "Elegí día y horario", d: "Ves solo los horarios libres, actualizados por cada doctor." },
            { n: "03", icon: ShieldCheck, t: "Confirmamos tu turno", d: "Te escribimos por WhatsApp con las indicaciones." },
          ].map((p, i) => (
            <div key={p.n} data-reveal style={{ transitionDelay: `${i * 120}ms` }} className="relative flex items-center gap-5 rounded-3xl border border-border/60 bg-card/60 p-4 text-left md:block md:border-0 md:bg-transparent md:p-8 md:text-center">
              <span className="relative flex size-16 shrink-0 items-center justify-center rounded-3xl gradient-deep text-white shadow-[0_20px_40px_-15px_rgba(20,50,120,.8)] md:mx-auto md:size-20">
                <p.icon className="size-8" />
                <span className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full bg-white font-display text-sm font-bold text-[var(--deep)] shadow-md">{p.n}</span>
              </span>
              <div><h3 className="text-lg font-semibold md:mt-6">{p.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground md:mt-2">{p.d}</p></div>
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
                  <Electro latidos={2} grilla={false} color="#fb7185" className="h-8 w-full" />
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