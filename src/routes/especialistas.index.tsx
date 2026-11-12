import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Award, CalendarPlus, CheckCircle2, Clock, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, PublicLayout, useReveal, FondoDoctor } from "@/components/site/PublicLayout";
import { DOCTORS, fotoDoctor } from "@/data/clinic";
import { KEY_AGENDA, agendaDe, resumenAgenda, useDato, type Agendas } from "@/lib/auth-local";

export const Route = createFileRoute("/especialistas/")({
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
  useReveal();
  const [agendas] = useDato<Agendas>(KEY_AGENDA, {});
  return (
    <PublicLayout>
      <PageHero
        kicker="Equipo médico"
        title={<>Nuestros <span className="text-shine italic">especialistas</span></>}
        text="Formación, experiencia y áreas de atención de los directores médicos de la clínica."
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Especialistas" }]}
      />

      <section className="mx-auto max-w-7xl space-y-10 px-4 py-16 lg:px-8">
        {DOCTORS.map((d, i) => (
          <article
            key={d.id}
            data-reveal
            className={`group grid overflow-hidden rounded-[2rem] border border-border bg-card shadow-elevated md:grid-cols-[340px_1fr] ${i % 2 ? "md:grid-cols-[1fr_340px]" : ""}`}
          >
            <div className={`relative min-h-80 overflow-hidden ${i % 2 ? "md:order-2" : ""}`}>
              <img src={fotoDoctor(d.foto)} alt={d.nombre} loading="lazy" className="absolute inset-0 size-full object-cover object-top transition-transform duration-1000 group-hover:scale-105" />
              <FondoDoctor foto={d.foto} suave />
            </div>
            <div className="space-y-6 p-7 md:p-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinic">{agendaDe(agendas, d.foto).consultorio || d.consultorio}</p>
                <h2 className="mt-2 text-3xl">{d.nombre}</h2>
                <p className="mt-1 font-medium text-primary">{d.titulo}</p>
              </div>
              <p className="flex items-start gap-2 rounded-2xl bg-secondary/60 px-4 py-3 text-sm">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                <span><b>Atención:</b> {resumenAgenda(agendaDe(agendas, d.foto))}{agendaDe(agendas, d.foto).nota ? ` · ${agendaDe(agendas, d.foto).nota}` : ""}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {d.especialidades.map((e) => (
                  <span key={e} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">{e}</span>
                ))}
              </div>
              <p className="leading-relaxed text-muted-foreground">{d.bio}</p>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><GraduationCap className="size-4 text-primary" /> Formación</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {d.formacion.map((f) => <li key={f} className="flex gap-2"><Award className="mt-0.5 size-3.5 shrink-0 text-[var(--clinic)]" />{f}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="size-4 text-primary" /> Áreas de atención</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {d.areas.map((a) => <li key={a} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--clinic)]" />{a}</li>)}
                  </ul>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild className="btn-glow rounded-full px-6"><Link to="/turnos" search={{ doctor: d.id }}><CalendarPlus className="size-4" /> Solicitar turno</Link></Button>
                <Button asChild variant="outline" className="rounded-full px-6"><Link to="/especialistas/$id" params={{ id: d.id }}>Perfil completo <ArrowUpRight className="size-4" /></Link></Button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </PublicLayout>
  );
}
