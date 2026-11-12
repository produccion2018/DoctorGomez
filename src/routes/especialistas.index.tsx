import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarPlus, Check, CheckCircle2, Clock, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Curriculum, FondoInfo, PageHero, PublicLayout, acentoDoctor, useReveal } from "@/components/site/PublicLayout";
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
        {DOCTORS.map((d, i) => {
          const ac = acentoDoctor(d.foto);
          const ag = agendaDe(agendas, d.foto);
          return (
          <article
            key={d.id}
            data-reveal
            className={`group grid overflow-hidden rounded-[2rem] border border-border bg-card shadow-elevated ${i % 2 ? "md:grid-cols-[1fr_360px]" : "md:grid-cols-[360px_1fr]"}`}
          >
            <div className={`relative min-h-96 overflow-hidden ${i % 2 ? "md:order-2" : ""}`}>
              <img src={fotoDoctor(d.foto)} alt={d.nombre} loading="lazy" className="absolute inset-0 size-full object-cover object-top transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-card via-card/40 to-transparent" />
            </div>
            <div className="relative p-7 md:p-10">
              <FondoInfo foto={d.foto} />
              <div className="relative space-y-7">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: ac.c }}>
                    <span className="h-px w-6" style={{ background: ac.c }} /> {ag.consultorio || d.consultorio}
                  </p>
                  <h2 className="mt-2 text-3xl sm:text-4xl">{d.nombre}</h2>
                  <p className="mt-1.5 font-medium text-muted-foreground">{d.titulo}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {d.especialidades.map((e) => (
                    <span key={e} className="rounded-full bg-card/80 px-3 py-1 text-xs font-semibold ring-1 backdrop-blur" style={{ color: ac.c, boxShadow: `inset 0 0 0 1px ${ac.borde}` }}>{e}</span>
                  ))}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-3 py-1 text-xs text-muted-foreground">
                    <Clock className="size-3.5" /> {resumenAgenda(ag)}{ag.nota ? ` · ${ag.nota}` : ""}
                  </span>
                </div>

                <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{d.bio}</p>

                <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
                  <div className="rounded-2xl border border-border/70 bg-card/75 p-5 backdrop-blur-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground"><GraduationCap className="size-4" style={{ color: ac.c }} /> Formación académica</h3>
                    <Curriculum items={d.formacion} color={ac.c} />
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-card/75 p-5 backdrop-blur-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground"><CheckCircle2 className="size-4" style={{ color: ac.c }} /> Áreas de atención</h3>
                    <ul className="flex flex-wrap gap-2">
                      {d.areas.map((a) => (
                        <li key={a} className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/60 px-3 py-1.5 text-[13px] text-foreground/80 transition-colors hover:bg-secondary">
                          <Check className="size-3.5 shrink-0" style={{ color: ac.c }} /> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild className="btn-glow rounded-full px-6"><Link to="/turnos" search={{ doctor: d.id }}><CalendarPlus className="size-4" /> Solicitar turno</Link></Button>
                  <Button asChild variant="outline" className="rounded-full bg-card/80 px-6"><Link to="/especialistas/$id" params={{ id: d.id }}>Perfil completo <ArrowUpRight className="size-4" /></Link></Button>
                </div>
              </div>
            </div>
          </article>
          );
        })}
      </section>
    </PublicLayout>
  );
}
