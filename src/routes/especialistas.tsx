import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Crumbs } from "@/components/site/Crumbs";
import { DOCTORS } from "@/data/clinic";
import fotoAlberto from "@/assets/doctor-alberto.jpg";
import fotoAlonso from "@/assets/doctor-alonso.jpg";

export const Route = createFileRoute("/especialistas")({
  head: () => ({
    meta: [
      { title: "Especialistas | Clínica Gómez Bolaño" },
      { name: "description", content: "Perfiles profesionales del Dr. Carlos Alberto Gómez Bolaño y del Dr. Carlos Alonso Gómez Bolaño." },
      { property: "og:title", content: "Nuestros especialistas | Clínica Gómez Bolaño" },
      { property: "og:description", content: "Medicina Interna, Nefrología, Cardiología y Ecocardiografía." },
    ],
  }),
  component: Especialistas,
});

function Especialistas() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <Crumbs items={[{ label: "Inicio", to: "/" }, { label: "Especialistas" }]} />
        <h1 className="text-4xl font-semibold">Nuestros especialistas</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Formación, experiencia y áreas de atención de los directores médicos de la clínica.</p>

        <div className="mt-10 space-y-8">
          {DOCTORS.map((d) => (
            <Card key={d.id} className="overflow-hidden shadow-card">
              <CardContent className="grid gap-8 p-6 md:grid-cols-[220px_1fr] md:p-8">
                <img src={d.foto === "alberto" ? fotoAlberto : fotoAlonso} alt={d.nombre} width={900} height={1100} loading="lazy" className="h-64 w-full rounded-2xl object-cover md:h-full" />
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-semibold">{d.nombre}</h2>
                    <p className="text-primary">{d.titulo}</p>
                    <p className="text-sm text-muted-foreground">Matrícula {d.matricula} · {d.consultorio}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {d.especialidades.map((e) => <Badge key={e} variant="secondary">{e}</Badge>)}
                  </div>
                  <p className="text-muted-foreground">{d.bio}</p>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Formación</h3>
                      <ul className="space-y-1.5 text-sm">{d.formacion.map((f) => <li key={f}>· {f}</li>)}</ul>
                    </div>
                    <div>
                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Áreas de atención</h3>
                      <ul className="space-y-1.5 text-sm">{d.areas.map((a) => <li key={a}>· {a}</li>)}</ul>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="outline"><Link to="/especialistas/$id" params={{ id: d.id }}>Ver perfil completo</Link></Button>
                    <Button asChild><Link to="/turnos" search={{ doctor: d.id }}>Solicitar turno</Link></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
