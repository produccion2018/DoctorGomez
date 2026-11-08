import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accessibility,
  CalendarPlus,
  ClipboardCheck,
  Clock,
  FileText,
  HeartPulse,
  MapPin,
  MonitorSmartphone,
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
  { icon: HeartPulse, t: "Ecocardiógrafo doppler color", d: "Estudios cardíacos de alta resolución con informe en el día." },
  { icon: ScanLine, t: "Ecografía y doppler vascular", d: "Imágenes renales, abdominales y vasculares en la misma visita." },
  { icon: ClipboardCheck, t: "Holter y MAPA 24 h", d: "Monitoreo ambulatorio del ritmo cardíaco y la presión arterial." },
  { icon: Stethoscope, t: "Consultorios equipados", d: "Electrocardiógrafo, balanza clínica y material de evaluación completo." },
  { icon: FileText, t: "Historia clínica digital", d: "Cada consulta, estudio e indicación queda registrada y disponible." },
  { icon: MonitorSmartphone, t: "Teleconsulta", d: "Controles y lectura de estudios por videollamada." },
];

const PASOS = [
  { n: "01", t: "Reservá tu turno", d: "Online, por WhatsApp o por teléfono." },
  { n: "02", t: "Confirmación", d: "Te contactamos para confirmar día, hora e indicaciones." },
  { n: "03", t: "Consulta", d: "Atención de 40 minutos con revisión de estudios previos." },
  { n: "04", t: "Seguimiento", d: "Plan escrito, estudios y controles programados." },
];

function Clinica() {
  useReveal();
  const mapa = `https://www.google.com/maps?q=${encodeURIComponent(CLINICA.direccion)}&output=embed`;

  return (
    <PublicLayout>
      <PageHero
        kicker="Nuestra clínica"
        title={<>Un espacio pensado para <span className="text-shine italic">tu cuidado</span></>}
        text="Consultorios, estudios y seguimiento en un solo lugar, con un circuito de atención ágil y cercano."
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Clínica" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2">
          {[
            { img: imgClinica, cls: "md:col-span-2 md:row-span-2", t: "Recepción y sala de espera" },
            { img: imgCardio, cls: "md:col-span-2", t: "Unidad cardiológica" },
            { img: imgNefro, cls: "", t: "Estudios renales" },
            { img: imgInterna, cls: "", t: "Consultorios" },
          ].map((g, i) => (
            <div key={g.t} data-reveal style={{ transitionDelay: `${i * 90}ms` }} className={`group relative min-h-56 overflow-hidden rounded-3xl shadow-card ${g.cls}`}>
              <img src={g.img} alt={g.t} loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-deep/80 via-transparent to-transparent" />
              <p className="absolute bottom-4 left-5 font-semibold text-white">{g.t}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div data-reveal className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clinic">Tecnología</span>
            <h2 className="mt-3 text-3xl sm:text-4xl">Equipamiento y servicios</h2>
          </div>
          <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {EQUIPAMIENTO.map((e, i) => (
              <div key={e.t} data-reveal style={{ transitionDelay: `${(i % 3) * 80}ms` }} className="group relative border-t border-border pt-8 transition-colors hover:border-[var(--clinic)]">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-[var(--clinic)] group-hover:to-[var(--deep)] group-hover:text-white">
                  <e.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-semibold">{e.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{e.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div data-reveal className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clinic">Cómo te atendemos</span>
          <h2 className="mt-3 text-3xl sm:text-4xl">Tu recorrido en la clínica</h2>
        </div>
        <div className="relative mt-12 grid gap-6 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
          {PASOS.map((p, i) => (
            <div key={p.n} data-reveal style={{ transitionDelay: `${i * 100}ms` }} className="relative">
              <span className="relative z-10 flex size-16 items-center justify-center rounded-2xl gradient-deep font-display text-xl font-semibold text-white shadow-lg">{p.n}</span>
              <h3 className="mt-5 font-semibold">{p.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-[1fr_1.4fr] lg:px-8">
        <div data-reveal className="space-y-4 rounded-3xl gradient-deep p-8 text-deep-foreground shadow-elevated">
          <h2 className="text-3xl text-deep-foreground">Visitanos</h2>
          {[
            { icon: MapPin, t: CLINICA.direccion },
            { icon: Clock, t: CLINICA.horarios },
            { icon: Accessibility, t: "Acceso para personas con movilidad reducida" },
            { icon: Wifi, t: "Wi-Fi gratuito en sala de espera" },
            { icon: ShieldCheck, t: "Protocolos de higiene y bioseguridad" },
          ].map((x) => (
            <p key={x.t} className="flex gap-3 text-sm text-deep-foreground/85"><x.icon className="mt-0.5 size-4 shrink-0 text-sky-300" /> {x.t}</p>
          ))}
          <Button asChild size="lg" className="mt-4 rounded-full !bg-white px-6 text-[var(--deep)] hover:!bg-white/90"><Link to="/turnos"><CalendarPlus className="size-4" /> Solicitar turno</Link></Button>
        </div>
        <div data-reveal className="min-h-80 overflow-hidden rounded-3xl border border-border shadow-card">
          <iframe title="Ubicación de la clínica" src={mapa} className="size-full min-h-80 border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </section>
    </PublicLayout>
  );
}
