import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Droplets,
  ShieldCheck,
  Stethoscope,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      { name: "description", content: "Ciencia, experiencia y compromiso con tu salud. Turnos online, portal del paciente y atención especializada en Medicina Interna, Nefrología y Cardiología." },
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

const ICONS = { stethoscope: Stethoscope, kidney: Droplets, heart: HeartPulse, activity: Activity, waves: Waves } as const;

function HeroCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 3000);
    return () => clearInterval(t);
  }, []);
  const slide = SLIDES[i]!;
  return (
    <section className="mx-auto max-w-7xl px-4 pb-4 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-border shadow-elevated">
        <img src={slide.img} alt={slide.titulo} width={1600} height={1000} loading="lazy" className="h-[340px] w-full object-cover sm:h-[420px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-deep/95 via-deep/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center gap-4 p-6 sm:p-12">
          <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-deep-foreground">Especialidad destacada</span>
          <h2 className="max-w-lg text-3xl font-semibold text-deep-foreground sm:text-4xl">{slide.titulo}</h2>
          <p className="max-w-lg text-sm text-deep-foreground/80 sm:text-base">{slide.desc}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild><Link to={slide.to}>Conocer más</Link></Button>
            <Button asChild variant="outline" className="border-white/40 bg-white/10 text-deep-foreground hover:bg-white/20">
              <Link to="/turnos">Solicitar turno</Link>
            </Button>
          </div>
        </div>
        <div className="absolute bottom-5 right-5 flex items-center gap-2">
          <Button size="icon" variant="outline" className="border-white/40 bg-white/10 text-deep-foreground hover:bg-white/20" aria-label="Slide anterior" onClick={() => setI((v) => (v - 1 + SLIDES.length) % SLIDES.length)}>
            <ChevronLeft className="size-4" />
          </Button>
          {SLIDES.map((s, idx) => (
            <button key={s.titulo} aria-label={`Ir al slide ${idx + 1}`} onClick={() => setI(idx)} className={`h-2 rounded-full transition-all ${idx === i ? "w-7 bg-white" : "w-2 bg-white/50"}`} />
          ))}
          <Button size="icon" variant="outline" className="border-white/40 bg-white/10 text-deep-foreground hover:bg-white/20" aria-label="Slide siguiente" onClick={() => setI((v) => (v + 1) % SLIDES.length)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function Home() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-border bg-deep">
        <img src={heroDoctors} alt="Equipo médico de la clínica" width={1600} height={1000} className="absolute inset-0 size-full object-cover opacity-35" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-deep-foreground">
              <ShieldCheck className="size-3.5" /> Clínica médica especializada
            </span>

            {/* Foto de los doctores, visible SOLO en celular (nítida, no la de fondo) */}
            <img
              src={heroDoctors}
              alt="Dr. Alberto y Dr. Alonso Gómez Bolaño"
              width={800}
              height={500}
              className="block w-full rounded-2xl object-cover object-top sm:hidden"
              style={{ maxHeight: "220px" }}
            />

            <h1 className="text-4xl font-semibold leading-tight text-deep-foreground sm:text-5xl lg:text-6xl">
              Ciencia, experiencia y compromiso con tu salud.
            </h1>
            <p className="max-w-xl text-lg text-deep-foreground/80">
              Atención médica especializada en Medicina Interna, Nefrología y Cardiología.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/turnos"><CalendarPlus className="size-4" /> Solicitar turno</Link></Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-deep-foreground hover:bg-white/20">
                <Link to="/especialistas">Conocer a nuestros especialistas</Link>
              </Button>
            </div>
            <svg viewBox="0 0 600 60" className="h-12 w-full max-w-md text-[var(--clinic)]" aria-hidden="true">
              <polyline className="ecg-line" points="0,30 80,30 100,10 120,50 140,30 220,30 240,5 260,55 280,30 380,30 400,14 420,46 440,30 600,30" fill="none" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="grid gap-6 self-end mt-4 sm:grid-cols-2 sm:mt-10 lg:mt-40 lg:gap-8">
            {[
              { icon: Stethoscope, t: "Medicina Interna", d: "Visión clínica integral" },
              { icon: Droplets, t: "Nefrología", d: "Salud renal y nefroprotección" },
              { icon: HeartPulse, t: "Cardiología", d: "Prevención y tratamiento" },
              { icon: Waves, t: "Ecocardiografía", d: "Diagnóstico por imágenes" },
            ].map((c, idx) => (
              <div
                key={c.t}
                className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur animate-hero-float"
                style={{ animationDelay: `${idx * 0.6}s` }}
              >
                <c.icon className="size-6 text-deep-foreground" />
                <p className="mt-3 font-semibold text-deep-foreground">{c.t}</p>
                <p className="text-sm text-deep-foreground/70">{c.d}</p>
              </div>
            ))}
          </div>
          <style>{`
            @keyframes hero-float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            .animate-hero-float {
              animation: hero-float 4.5s ease-in-out infinite;
            }
          `}</style>
        </div>
      </section>

      <div className="py-14">
        <HeroCarousel />
      </div>

      <section className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: "+25", l: "Años de experiencia combinada" },
            { n: "5", l: "Especialidades médicas" },
            { n: "+12.000", l: "Consultas realizadas" },
            { n: "24 h", l: "Entrega de informes" },
          ].map((s) => (
            <Card key={s.l} className="shadow-card">
              <CardContent className="p-6">
                <p className="text-3xl font-semibold text-gradient-clinic">{s.n}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold">Especialidades</h2>
          <p className="mt-2 text-muted-foreground">Cinco áreas de alta complejidad coordinadas por los directores médicos de la clínica.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ESPECIALIDADES.map((e) => {
            const Icon = ICONS[e.icono as keyof typeof ICONS] ?? Stethoscope;
            return (
              <Card key={e.slug} className="group shadow-card transition-shadow hover:shadow-elevated">
                <CardContent className="space-y-3 p-6">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary"><Icon className="size-5" /></span>
                  <h3 className="text-lg font-semibold">{e.nombre}</h3>
                  <p className="text-sm text-muted-foreground">{e.descripcion}</p>
                  <Link to="/especialidades/$slug" params={{ slug: e.slug }} className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Ver especialidad <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/50 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-semibold">Nuestros especialistas</h2>
            <p className="mt-2 text-muted-foreground">Dos hermanos médicos al frente de la dirección clínica y asistencial.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {DOCTORS.map((d) => (
              <Card key={d.id} className="overflow-hidden shadow-card">
                <div className="flex flex-col gap-5 p-6 sm:flex-row">
                  <img src={d.foto === "alberto" ? fotoAlberto : fotoAlonso} alt={d.nombre} width={900} height={1100} loading="lazy" className="h-40 w-32 shrink-0 rounded-xl object-cover" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{d.nombre}</h3>
                    <p className="text-sm text-primary">{d.titulo}</p>
                    <p className="text-sm text-muted-foreground">{d.bio}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button asChild size="sm" variant="outline"><Link to="/especialistas/$id" params={{ id: d.id }}>Ver perfil completo</Link></Button>
                      <Button asChild size="sm"><Link to="/turnos" search={{ doctor: d.id }}>Solicitar turno</Link></Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold">Servicios destacados</h2>
            <p className="mt-2 text-muted-foreground">Consultas y estudios con turno online y confirmación inmediata.</p>
          </div>
          <Button asChild variant="outline"><Link to="/servicios">Ver todos los servicios</Link></Button>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SERVICIOS.slice(0, 6).map((s) => (
            <Card key={s.id} className="shadow-card">
              <CardContent className="space-y-2 p-6">
                <h3 className="font-semibold">{s.nombre}</h3>
                <p className="text-sm text-muted-foreground">{s.descripcion}</p>
                <p className="text-sm">{s.duracion} min · <span className="font-semibold">${s.precio.toLocaleString("es-AR")}</span></p>
                <Button asChild size="sm" className="mt-2"><Link to="/turnos" search={{ doctor: s.doctorId }}>Solicitar turno</Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
        <div className="overflow-hidden rounded-3xl gradient-deep p-10 text-center sm:p-16">
          <h2 className="text-3xl font-semibold text-deep-foreground">Tu salud, con seguimiento real</h2>
          <p className="mx-auto mt-3 max-w-2xl text-deep-foreground/80">
            Reservá tu turno online y accedé a tu portal del paciente para consultar estudios, documentos e historial de consultas.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg"><Link to="/turnos">Solicitar turno</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-deep-foreground hover:bg-white/20">
              <Link to="/login">Ingresar al portal</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}