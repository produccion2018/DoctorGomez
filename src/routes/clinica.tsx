import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accessibility,
  ArrowRight,
  CalendarPlus,
  ClipboardCheck,
  Clock,
  FileText,
  HeartPulse,
  MapPin,
  MonitorSmartphone,
  Navigation,
  ScanLine,
  ShieldCheck,
  Stethoscope,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FondoEspecialidades, PageHero, PublicLayout, useReveal, useSitio } from "@/components/site/PublicLayout";
import { resumenHorarioClinica } from "@/lib/auth-local";
import imgPasillo from "@/assets/hero-doctors.jpg";
import imgCardio from "@/assets/cardiologia.jpg";
import imgEco from "@/assets/esp-ecocardiografia.jpg";
import imgImagenes from "@/assets/esp-diagnostico-por-imagenes.jpg";
import imgHolter from "@/assets/esp-holter-mapa.jpg";
import imgDigital from "@/assets/esp-chequeos-preventivos.jpg";
import imgTele from "@/assets/esp-teleconsulta.jpg";
import imgNefro from "@/assets/nefrologia.jpg";
import imgInterna from "@/assets/esp-medicina-interna.jpg";

export const Route = createFileRoute("/clinica")({
  head: () => ({
    meta: [
      { title: "La clínica | HEGO · Centro de especialidades médicas" },
      { name: "description", content: "Instalaciones, tecnología médica, horarios y ubicación del Centro HEGO." },
    ],
  }),
  component: Clinica,
});

const EQUIPAMIENTO = [
  { icon: HeartPulse, t: "Ecocardiógrafo doppler color", d: "Estudios cardíacos de alta resolución, informados por el especialista.", img: imgEco, tag: "Cardiología", c: "#8b5cf6" },
  { icon: ScanLine, t: "Ecografía y doppler vascular", d: "Imágenes renales, abdominales y vasculares en la misma visita.", img: imgImagenes, tag: "Imágenes", c: "#06b6d4" },
  { icon: ClipboardCheck, t: "Holter y MAPA 24 h", d: "Monitoreo ambulatorio del ritmo cardíaco y la presión arterial.", img: imgHolter, tag: "Monitoreo", c: "#ec4899" },
  { icon: Stethoscope, t: "Consultorios equipados", d: "Electrocardiógrafo, balanza clínica y material de evaluación completo.", img: imgInterna, tag: "Consultorios", c: "#10b981" },
  { icon: FileText, t: "Historia clínica digital", d: "Cada consulta, estudio e indicación queda registrada y disponible.", img: imgDigital, tag: "Digital", c: "#0ea5e9" },
  { icon: MonitorSmartphone, t: "Teleconsulta", d: "Controles y lectura de estudios por videollamada.", img: imgTele, tag: "A distancia", c: "#6366f1" },
];

const PASOS = [
  { n: "01", icon: CalendarPlus, t: "Reservá tu turno", d: "Online, por WhatsApp o por teléfono." },
  { n: "02", icon: ShieldCheck, t: "Confirmación", d: "Te contactamos para confirmar día, hora e indicaciones." },
  { n: "03", icon: Stethoscope, t: "Consulta", d: "Atención personalizada con revisión de estudios previos." },
  { n: "04", icon: FileText, t: "Seguimiento", d: "Plan escrito, estudios y controles programados." },
];

const GALERIA = [
  { img: imgPasillo, cls: "md:col-span-2 md:row-span-2", pos: "object-[50%_40%]", t: "Recepción y pasillos", d: "Espacios amplios, luminosos y señalizados para moverte con tranquilidad." },
  { img: imgCardio, cls: "md:col-span-2", pos: "object-center", t: "Unidad cardiológica", d: "Ecocardiografía, Holter y ergometría." },
  { img: imgNefro, cls: "", pos: "object-center", t: "Sala de estudios", d: "Ecografía y doppler renal." },
  { img: imgInterna, cls: "", pos: "object-[center_25%]", t: "Consultorios", d: "Consultas con tiempo y escucha." },
];

const COMODIDADES = [
  { icon: Accessibility, t: "Accesibilidad", d: "Ingreso y circulación para personas con movilidad reducida." },
  { icon: Wifi, t: "Wi-Fi gratuito", d: "Conexión libre en la sala de espera." },
  { icon: ShieldCheck, t: "Bioseguridad", d: "Protocolos de higiene en cada consultorio." },
  { icon: Clock, t: "Puntualidad", d: "Agenda ordenada para que esperes lo menos posible." },
];

function Clinica() {
  useReveal();
  const [eq, setEq] = useState(0);
  const sel = EQUIPAMIENTO[eq]!;
  const sitio = useSitio();
  const horario = resumenHorarioClinica(sitio);
  const mapa = sitio.direccion ? `https://www.google.com/maps?q=${encodeURIComponent(sitio.direccion)}&output=embed` : "";

  return (
    <PublicLayout>
      <PageHero
        kicker="Nuestra clínica"
        decoracion={<FondoEspecialidades />}
        title={<>Un espacio pensado para <span className="text-shine italic">tu cuidado</span></>}
        text="Consultorios, estudios y seguimiento en un solo lugar, con un circuito de atención ágil y cercano."
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Clínica" }]}
      />

      {/* ───────── GALERÍA ───────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div data-reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="section-kicker">Instalaciones</span>
            <h2 className="mt-4 text-4xl leading-tight sm:text-5xl">Conocé <span className="text-gradient-clinic italic">la clínica</span></h2>
          </div>
          <p className="max-w-sm text-muted-foreground">Consultorios, sala de estudios y unidad cardiológica en un mismo lugar.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-4 md:grid-rows-[270px_270px]">
          {GALERIA.map((g, i) => (
            <figure
              key={g.t}
              data-reveal
              style={{ transitionDelay: `${i * 90}ms` }}
              className={`group relative min-h-64 overflow-hidden rounded-[1.75rem] shadow-[0_35px_70px_-45px_rgba(10,25,70,.9)] ring-1 ring-black/5 ${g.cls}`}
            >
              <img src={g.img} alt={g.t} loading="lazy" className={`absolute inset-0 size-full object-cover ${g.pos} transition-transform duration-[1400ms] ease-out group-hover:scale-110`} />
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.15_0.05_262/0.9)] via-[oklch(0.15_0.05_262/0.15)] to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="font-display text-xl font-semibold">{g.t}</p>
                <p className="mt-1 max-w-sm text-sm text-white/75 transition-all duration-500 md:max-h-0 md:overflow-hidden md:opacity-0 md:group-hover:max-h-16 md:group-hover:opacity-100">{g.d}</p>
              </figcaption>
              <span className="glass absolute right-4 top-4 rounded-full px-2.5 py-0.5 font-display text-xs text-white">{String(i + 1).padStart(2, "0")}</span>
            </figure>
          ))}
        </div>
      </section>

      {/* ───────── COMODIDADES ───────── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COMODIDADES.map((x, i) => (
            <div key={x.t} data-reveal style={{ transitionDelay: `${i * 80}ms` }} className="group flex gap-4 rounded-3xl border border-border/70 bg-card p-6 shadow-[0_20px_50px_-40px_rgba(10,25,70,.6)] transition-all duration-500 hover:-translate-y-1 hover:border-primary/25">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary transition-all duration-500 group-hover:gradient-deep group-hover:text-white"><x.icon className="size-5" /></span>
              <div>
                <p className="font-semibold">{x.t}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{x.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── EQUIPAMIENTO INTERACTIVO ───────── */}
      <section className="relative overflow-hidden bg-[oklch(0.17_0.05_262)] py-24 text-white">
        <div className="pointer-events-none absolute -left-40 top-10 size-[30rem] rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 bottom-0 size-[30rem] rounded-full bg-rose-500/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <div data-reveal className="max-w-2xl">
            <span className="glass inline-flex rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em]">Tecnología</span>
            <h2 className="mt-5 text-4xl leading-tight text-white sm:text-5xl">
              Equipamiento <span className="italic text-sky-300">y servicios</span>
            </h2>
            <p className="mt-4 text-white/65">Pasá el cursor por cada equipo para conocerlo.</p>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <ul className="border-t border-white/10" data-reveal>
              {EQUIPAMIENTO.map((e, i) => {
                const on = i === eq;
                return (
                  <li key={e.t} className="border-b border-white/10">
                    <button
                      type="button"
                      onMouseEnter={() => setEq(i)}
                      onFocus={() => setEq(i)}
                      onClick={() => setEq(i)}
                      className={`group flex w-full items-center gap-4 py-5 text-left transition-all duration-300 ${on ? "lg:pl-4" : ""}`}
                    >
                      <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 ${on ? "" : "bg-white/10 ring-1 ring-white/15"}`} style={on ? { background: `linear-gradient(135deg, ${e.c}, ${e.c}aa)`, boxShadow: `0 15px 35px -12px ${e.c}` } : undefined}>
                        <e.icon className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`font-semibold transition-colors ${on ? "text-white" : "text-white/60 group-hover:text-white"}`}>{e.t}</p>
                        <p className={`overflow-hidden text-sm text-white/60 transition-all duration-500 lg:hidden ${on ? "mt-1 max-h-20" : "max-h-0"}`}>{e.d}</p>
                      </div>
                      <ArrowRight style={{ color: e.c }} className={`size-4 transition-all duration-300 ${on ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`} />
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="relative hidden lg:block">
              <div key={sel.t} className="relative h-full min-h-[440px] overflow-hidden rounded-[2rem] ring-1 ring-white/10 animate-in fade-in zoom-in-[0.98] duration-500">
                <img src={sel.img} alt="" className="hero-kenburns absolute inset-0 size-full object-cover object-[70%_15%]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.13_0.05_262)] via-[oklch(0.15_0.05_262/0.35)] to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-10">
                  <span className="glass inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">{sel.tag}</span>
                  <span className="mt-6 flex size-16 items-center justify-center rounded-3xl shadow-2xl" style={{ background: `linear-gradient(135deg, ${sel.c}, ${sel.c}aa)` }}>
                    <sel.icon className="size-7" />
                  </span>
                  <h3 className="mt-5 font-display text-3xl font-semibold text-white">{sel.t}</h3>
                  <p className="mt-2 max-w-md text-white/75">{sel.d}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── RECORRIDO ───────── */}
      <section className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <span className="section-kicker">Cómo te atendemos</span>
          <h2 className="mt-4 text-4xl leading-tight sm:text-5xl">Tu recorrido <span className="text-gradient-clinic italic">en la clínica</span></h2>
        </div>
        <div className="relative mt-12 grid gap-3 md:mt-16 md:grid-cols-4 md:gap-6">
          <div className="premium-divider absolute left-[12%] right-[12%] top-10 hidden md:block" />
          {PASOS.map((p, i) => (
            <div key={p.n} data-reveal style={{ transitionDelay: `${i * 110}ms` }} className="group relative flex items-center gap-5 rounded-3xl border border-border/60 bg-card/60 p-4 text-left md:block md:border-0 md:bg-transparent md:p-0 md:text-center">
              <span className="relative z-10 flex size-16 shrink-0 items-center justify-center rounded-[1.75rem] gradient-deep text-white md:mx-auto md:size-20 shadow-[0_20px_40px_-15px_rgba(20,50,120,.8)] ring-8 ring-background transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3">
                <p.icon className="size-7" />
                <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-rose-500 font-display text-[11px] font-semibold ring-4 ring-background">{p.n}</span>
              </span>
              <div>
                <h3 className="text-lg font-semibold md:mt-6">{p.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground md:mx-auto md:mt-1.5 md:max-w-[15rem]">{p.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── UBICACIÓN ───────── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 lg:px-8">
        <div data-reveal className="relative overflow-hidden rounded-[2rem] shadow-[0_50px_100px_-50px_rgba(10,25,70,.8)] ring-1 ring-black/5">
          {mapa ? (
            <iframe title="Ubicación de la clínica" src={mapa} className="h-[560px] w-full border-0 grayscale-[35%]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          ) : (
            <div className="relative h-[560px] w-full overflow-hidden bg-[oklch(0.2_0.05_262)]">
              <img src={imgPasillo} alt="" className="absolute inset-0 size-full object-cover opacity-35" />
              <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.15_0.05_262)] via-[oklch(0.15_0.05_262/0.6)] to-transparent" />
            </div>
          )}
          <div className="relative m-4 rounded-[1.75rem] bg-[oklch(0.17_0.05_262/0.94)] p-8 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-xl lg:absolute lg:left-6 lg:top-6 lg:m-0 lg:w-[400px]">
            <span className="glass inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">Visitanos</span>
            <h2 className="mt-4 text-3xl text-white">Te esperamos</h2>
            <ul className="mt-6 space-y-4">
              {[
                { icon: MapPin, t: sitio.direccion || "Dirección: próximamente" },
                { icon: Clock, t: horario || "Horarios: próximamente" },
                { icon: Accessibility, t: "Acceso para personas con movilidad reducida" },
                { icon: Wifi, t: "Wi-Fi gratuito en sala de espera" },
                { icon: ShieldCheck, t: "Protocolos de higiene y bioseguridad" },
              ].map((x) => (
                <li key={x.t} className="flex gap-3 text-sm text-white/80">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/10"><x.icon className="size-4 text-sky-300" /></span>
                  <span className="pt-1.5">{x.t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-2">
              <Button asChild className="rounded-full !bg-white px-5 text-[oklch(0.25_0.08_260)] hover:!bg-white/90">
                <Link to="/turnos"><CalendarPlus className="size-4" /> Solicitar turno</Link>
              </Button>
              {sitio.direccion && <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(sitio.direccion)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2 text-sm font-medium transition hover:bg-white/10"
              >
                <Navigation className="size-4" /> Cómo llegar
              </a>}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
