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
import { PageHero, PublicLayout, useReveal } from "@/components/site/PublicLayout";
import { CLINICA } from "@/data/clinic";
import imgClinica from "@/assets/clinica.jpg";
import imgCardio from "@/assets/cardiologia.jpg";
import imgNefro from "@/assets/nefrologia.jpg";
import imgInterna from "@/assets/medicina-interna.jpg";

export const Route = createFileRoute("/clinica")({
  head: () => ({
    meta: [
      { title: "La clínica | Clínica Gómez Bolaño" },
      { name: "description", content: "Instalaciones, tecnología médica, horarios y ubicación de la Clínica Gómez Bolaño." },
    ],
  }),
  component: Clinica,
});

const EQUIPAMIENTO = [
  { icon: HeartPulse, t: "Ecocardiógrafo doppler color", d: "Estudios cardíacos de alta resolución con informe en el día.", img: imgCardio, tag: "Cardiología" },
  { icon: ScanLine, t: "Ecografía y doppler vascular", d: "Imágenes renales, abdominales y vasculares en la misma visita.", img: imgNefro, tag: "Imágenes" },
  { icon: ClipboardCheck, t: "Holter y MAPA 24 h", d: "Monitoreo ambulatorio del ritmo cardíaco y la presión arterial.", img: imgCardio, tag: "Monitoreo" },
  { icon: Stethoscope, t: "Consultorios equipados", d: "Electrocardiógrafo, balanza clínica y material de evaluación completo.", img: imgInterna, tag: "Consultorios" },
  { icon: FileText, t: "Historia clínica digital", d: "Cada consulta, estudio e indicación queda registrada y disponible.", img: imgClinica, tag: "Digital" },
  { icon: MonitorSmartphone, t: "Teleconsulta", d: "Controles y lectura de estudios por videollamada.", img: imgInterna, tag: "A distancia" },
];

const PASOS = [
  { n: "01", t: "Reservá tu turno", d: "Online, por WhatsApp o por teléfono." },
  { n: "02", t: "Confirmación", d: "Te contactamos para confirmar día, hora e indicaciones." },
  { n: "03", t: "Consulta", d: "Atención de 40 minutos con revisión de estudios previos." },
  { n: "04", t: "Seguimiento", d: "Plan escrito, estudios y controles programados." },
];

const GALERIA = [
  { img: imgClinica, cls: "md:col-span-2 md:row-span-2", t: "Recepción y sala de espera", d: "Un espacio cálido y luminoso para esperar tranquilo." },
  { img: imgCardio, cls: "md:col-span-2", t: "Unidad cardiológica", d: "Ecocardiografía, Holter y ergometría." },
  { img: imgNefro, cls: "", t: "Estudios renales", d: "Ecografía y doppler renal." },
  { img: imgInterna, cls: "", t: "Consultorios", d: "Consultas de 40 minutos." },
];

function Clinica() {
  useReveal();
  const [eq, setEq] = useState(0);
  const sel = EQUIPAMIENTO[eq]!;
  const mapa = `https://www.google.com/maps?q=${encodeURIComponent(CLINICA.direccion)}&output=embed`;

  return (
    <PublicLayout>
      <PageHero
        kicker="Nuestra clínica"
        title={<>Un espacio pensado para <span className="text-shine italic">tu cuidado</span></>}
        text="Consultorios, estudios y seguimiento en un solo lugar, con un circuito de atención ágil y cercano."
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Clínica" }]}
      />

      {/* ───────── GALERÍA ───────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="grid gap-5 md:grid-cols-4 md:grid-rows-[270px_270px]">
          {GALERIA.map((g, i) => (
            <figure
              key={g.t}
              data-reveal
              style={{ transitionDelay: `${i * 90}ms` }}
              className={`group relative min-h-64 overflow-hidden rounded-[1.75rem] shadow-[0_35px_70px_-45px_rgba(10,25,70,.9)] ring-1 ring-black/5 ${g.cls}`}
            >
              <img src={g.img} alt={g.t} loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.15_0.05_262/0.9)] via-[oklch(0.15_0.05_262/0.15)] to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="font-display text-xl font-semibold">{g.t}</p>
                <p className="max-h-0 overflow-hidden text-sm text-white/75 opacity-0 transition-all duration-500 group-hover:mt-1 group-hover:max-h-10 group-hover:opacity-100">{g.d}</p>
              </figcaption>
              <span className="glass absolute right-4 top-4 rounded-full px-2.5 py-0.5 font-display text-xs text-white">{String(i + 1).padStart(2, "0")}</span>
            </figure>
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
                      <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 ${on ? "bg-gradient-to-br from-sky-500 to-blue-700 shadow-[0_15px_35px_-12px_rgba(56,189,248,.8)]" : "bg-white/10 ring-1 ring-white/15"}`}>
                        <e.icon className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`font-semibold transition-colors ${on ? "text-white" : "text-white/60 group-hover:text-white"}`}>{e.t}</p>
                        <p className={`overflow-hidden text-sm text-white/60 transition-all duration-500 lg:hidden ${on ? "mt-1 max-h-20" : "max-h-0"}`}>{e.d}</p>
                      </div>
                      <ArrowRight className={`size-4 text-sky-300 transition-all duration-300 ${on ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`} />
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="relative hidden lg:block">
              <div key={sel.t} className="relative h-full min-h-[440px] overflow-hidden rounded-[2rem] ring-1 ring-white/10 animate-in fade-in zoom-in-[0.98] duration-500">
                <img src={sel.img} alt="" className="absolute inset-0 size-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.13_0.05_262)] via-[oklch(0.15_0.05_262/0.6)] to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-10">
                  <span className="glass inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">{sel.tag}</span>
                  <span className="mt-6 flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-blue-700 shadow-2xl">
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
        <div className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          <div className="premium-divider absolute left-[12%] right-[12%] top-10 hidden md:block" />
          {PASOS.map((p, i) => (
            <div key={p.n} data-reveal style={{ transitionDelay: `${i * 110}ms` }} className="group relative text-center">
              <span className="relative z-10 mx-auto flex size-20 items-center justify-center rounded-[1.75rem] gradient-deep font-display text-2xl font-semibold text-white shadow-[0_20px_40px_-15px_rgba(20,50,120,.8)] ring-8 ring-background transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3">
                {p.n}
              </span>
              <h3 className="mt-6 text-lg font-semibold">{p.t}</h3>
              <p className="mx-auto mt-1.5 max-w-[15rem] text-sm text-muted-foreground">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── UBICACIÓN ───────── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 lg:px-8">
        <div data-reveal className="relative overflow-hidden rounded-[2rem] shadow-[0_50px_100px_-50px_rgba(10,25,70,.8)] ring-1 ring-black/5">
          <iframe title="Ubicación de la clínica" src={mapa} className="h-[560px] w-full border-0 grayscale-[35%]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          <div className="relative m-4 rounded-[1.75rem] bg-[oklch(0.17_0.05_262/0.94)] p-8 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-xl lg:absolute lg:left-6 lg:top-6 lg:m-0 lg:w-[400px]">
            <span className="glass inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">Visitanos</span>
            <h2 className="mt-4 text-3xl text-white">Te esperamos</h2>
            <ul className="mt-6 space-y-4">
              {[
                { icon: MapPin, t: CLINICA.direccion },
                { icon: Clock, t: CLINICA.horarios },
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
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CLINICA.direccion)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2 text-sm font-medium transition hover:bg-white/10"
              >
                <Navigation className="size-4" /> Cómo llegar
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
