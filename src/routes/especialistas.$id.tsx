import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { CalendarDays, GraduationCap, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Crumbs } from "@/components/site/Crumbs";
import { DOCTORS, ESPECIALIDADES } from "@/data/clinic";
import fotoAlberto from "@/assets/doctor-alberto.jpg";
import fotoAlonso from "@/assets/doctor-alonso.jpg";

export const Route = createFileRoute("/especialistas/$id")({
  head: () => ({
    meta: [
      { title: "Perfil profesional | Clínica Gómez Bolaño" },
      { name: "description", content: "Perfil completo del especialista: formación, experiencia, áreas de atención y agenda disponible." },
      { property: "og:title", content: "Perfil profesional | Clínica Gómez Bolaño" },
      { property: "og:description", content: "Formación, experiencia y áreas de atención del especialista." },
    ],
  }),
  component: PerfilDoctor,
});

function PerfilDoctor() {
  const { id } = useParams({ from: "/especialistas/$id" });
  const doctor = DOCTORS.find((d) => d.id === id);

  if (!doctor) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="text-2xl font-semibold">Profesional no encontrado</h1>
          <Button asChild className="mt-6"><Link to="/especialistas">Ver especialistas</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  const especialidades = ESPECIALIDADES.filter((e) => e.doctorIds.includes(doctor.id));

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
        <Crumbs items={[{ label: "Inicio", to: "/" }, { label: "Especialistas", to: "/especialistas" }, { label: doctor.nombre }]} />
        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          <div className="space-y-4">
            <img src={doctor.foto === "alberto" ? fotoAlberto : fotoAlonso} alt={doctor.nombre} width={900} height={1100} className="w-full rounded-3xl border border-border object-cover shadow-card" />
            <Button asChild className="w-full"><Link to="/turnos" search={{ doctor: doctor.id }}>Solicitar turno</Link></Button>
            <Card className="shadow-card">
              <CardContent className="space-y-2 p-5 text-sm">
                <p className="flex items-center gap-2"><Stethoscope className="size-4 text-primary" /> {doctor.consultorio}</p>
                <p className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" /> {doctor.dias.join(" · ")}</p>
                <p className="flex items-center gap-2"><GraduationCap className="size-4 text-primary" /> Matrícula {doctor.matricula}</p>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-semibold">{doctor.nombre}</h1>
              <p className="mt-1 text-primary">{doctor.titulo}</p>
              <p className="mt-4 text-muted-foreground">{doctor.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">{doctor.especialidades.map((e) => <Badge key={e} variant="secondary">{e}</Badge>)}</div>
            </div>
            <Card className="shadow-card">
              <CardContent className="space-y-3 p-6">
                <h2 className="font-semibold">Formación</h2>
                <ul className="space-y-1.5 text-sm text-muted-foreground">{doctor.formacion.map((f) => <li key={f}>· {f}</li>)}</ul>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="space-y-3 p-6">
                <h2 className="font-semibold">Áreas de atención</h2>
                <ul className="grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">{doctor.areas.map((a) => <li key={a}>· {a}</li>)}</ul>
              </CardContent>
            </Card>
            <div>
              <h2 className="mb-4 font-semibold">Especialidades a cargo</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {especialidades.map((e) => (
                  <Card key={e.slug} className="shadow-card">
                    <CardContent className="space-y-2 p-5">
                      <h3 className="font-semibold">{e.nombre}</h3>
                      <p className="text-sm text-muted-foreground">{e.descripcion}</p>
                      <Button asChild size="sm" variant="outline"><Link to="/especialidades/$slug" params={{ slug: e.slug }}>Ver detalle</Link></Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
