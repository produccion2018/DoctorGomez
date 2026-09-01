import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, HeartHandshake, Microscope, Radar, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Crumbs } from "@/components/site/Crumbs";
import { DOCTORS } from "@/data/clinic";
import clinicaImg from "@/assets/clinica.jpg";
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
  { icon: Users, t: "Seguimiento médico", d: "Controles programados y comunicación continua a través del portal del paciente." },
  { icon: Sparkles, t: "Experiencia", d: "Más de 25 años combinados en medicina interna, nefrología y cardiología." },
  { icon: Building2, t: "Infraestructura", d: "Consultorios equipados, sala de estudios y circuito de atención ágil." },
];

function Nosotros() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <Crumbs items={[{ label: "Inicio", to: "/" }, { label: "Nosotros" }]} />

        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-5">
            <h1 className="text-4xl font-semibold">Una clínica construida sobre la confianza</h1>
            <p className="text-muted-foreground">
              La Clínica Gómez Bolaño nació del trabajo conjunto de dos hermanos médicos que compartieron formación,
              guardias y la misma convicción: que la medicina especializada sólo tiene sentido cuando se acompaña de tiempo,
              escucha y continuidad.
            </p>
            <p className="text-muted-foreground">
              Hoy la clínica integra Medicina Interna, Nefrología y Cardiología en un mismo circuito de atención, con historia
              clínica digital, estudios propios y un equipo administrativo que ordena cada paso del proceso.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild><Link to="/turnos">Solicitar turno</Link></Button>
              <Button asChild variant="outline"><Link to="/especialistas">Conocer a los especialistas</Link></Button>
            </div>
          </div>
          <img src={clinicaImg} alt="Instalaciones de la clínica" width={1600} height={1000} loading="lazy" className="rounded-3xl border border-border object-cover shadow-elevated" />
        </div>

        <section className="mt-20">
          <h2 className="text-2xl font-semibold">Filosofía de atención</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PILARES.map((p) => (
              <Card key={p.t} className="shadow-card">
                <CardContent className="space-y-3 p-6">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary"><p.icon className="size-5" /></span>
                  <h3 className="font-semibold">{p.t}</h3>
                  <p className="text-sm text-muted-foreground">{p.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-3xl border border-border bg-secondary/50 p-8 sm:p-12">
          <h2 className="text-2xl font-semibold">Los hermanos Gómez Bolaño</h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Dos trayectorias complementarias: la mirada global de la medicina interna con la profundidad de la nefrología, y la
            precisión de la cardiología crítica con la ecocardiografía como herramienta diagnóstica. Ambos dirigen la clínica y
            supervisan personalmente la operación asistencial y administrativa.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {DOCTORS.map((d) => (
              <Card key={d.id} className="shadow-card">
                <CardContent className="flex gap-5 p-6">
                  <img src={d.foto === "alberto" ? fotoAlberto : fotoAlonso} alt={d.nombre} width={900} height={1100} loading="lazy" className="h-36 w-28 shrink-0 rounded-xl object-cover" />
                  <div className="space-y-2">
                    <h3 className="font-semibold">{d.nombre}</h3>
                    <p className="text-sm text-primary">{d.titulo}</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {d.formacion.map((f) => <li key={f}>· {f}</li>)}
                    </ul>
                    <Button asChild size="sm" variant="outline" className="mt-2"><Link to="/especialistas/$id" params={{ id: d.id }}>Ver perfil</Link></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
