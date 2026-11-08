import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowUpRight, Award, CalendarDays, CalendarPlus, CheckCircle2, GraduationCap, MessageCircle, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, PublicLayout, useReveal, waLink } from "@/components/site/PublicLayout";
import { DOCTORS, ESPECIALIDADES, fotoDoctor, iconoEspecialidad } from "@/data/clinic";
import { KEY_AGENDA, agendaDe, horariosDelDia, isoDe, proximosDias, resumenAgenda, useDato, type Agendas } from "@/lib/auth-local";

export const Route = createFileRoute("/especialistas/$id")({
  loader: ({ params }) => {
    const doctor = DOCTORS.find((d) => d.id === params.id);
    if (!doctor) throw notFound();
    return doctor;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.nombre ?? "Perfil profesional"} | Clínica Gómez Bolaño` },
      { name: "description", content: loaderData?.bio ?? "Perfil del especialista." },
    ],
  }),
  component: PerfilDoctor,
});

function PerfilDoctor() {
  const doctor = Route.useLoaderData();
  useReveal(doctor.id);
  const especialidades = ESPECIALIDADES.filter((e) => e.doctorIds.includes(doctor.id));
  const [agendas] = useDato<Agendas>(KEY_AGENDA, {});
  const agenda = agendaDe(agendas, doctor.foto);
  const proximos = proximosDias(agenda, 5);
  const ausente = agenda.bloqueos.find((b) => b.hasta >= isoDe(new Date()));

  return (
    <PublicLayout>
      <PageHero
        kicker={doctor.titulo}
        title={doctor.nombre}
        text={doctor.bio}
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Especialistas", to: "/especialistas" }, { label: doctor.nombre }]}
      />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[340px_1fr] lg:px-8">
        <aside className="space-y-5 lg:sticky lg:top-24 lg:-mt-40 lg:self-start">
          <div className="relative overflow-hidden rounded-[2rem] border-4 border-background shadow-elevated">
            <img src={fotoDoctor(doctor.foto)} alt={doctor.nombre} className="aspect-[4/5] w-full object-cover object-top" />
          </div>
          <div className="space-y-3 rounded-3xl border border-border bg-card p-6 shadow-card">
            <p className="flex items-center gap-3 text-sm"><span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary"><Stethoscope className="size-4" /></span>{agenda.consultorio || doctor.consultorio}</p>
            <p className="flex items-center gap-3 text-sm"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><CalendarDays className="size-4" /></span>{resumenAgenda(agenda)}</p>
            <p className="flex items-center gap-3 text-sm"><span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary"><GraduationCap className="size-4" /></span>Matrícula {doctor.matricula}</p>
            <Button asChild className="btn-glow mt-2 h-12 w-full rounded-xl"><Link to="/turnos" search={{ doctor: doctor.id }}><CalendarPlus className="size-4" /> Solicitar turno</Link></Button>
            <Button asChild variant="outline" className="h-11 w-full rounded-xl">
              <a href={waLink(`Hola, quiero un turno con ${doctor.nombre}.`)} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> WhatsApp</a>
            </Button>
          </div>
        </aside>

        <div className="space-y-8">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 gradient-deep px-7 py-5 text-white">
              <h2 className="flex items-center gap-2 font-sans text-lg font-semibold text-white"><CalendarDays className="size-5" /> Días y horarios de atención</h2>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${agenda.activo ? "bg-emerald-400/20 text-emerald-100" : "bg-white/15 text-white/80"}`}>
                <span className={`size-2 rounded-full ${agenda.activo ? "bg-emerald-400" : "bg-white/60"}`} /> {agenda.activo ? "Agenda abierta" : "Agenda pausada"}
              </span>
            </div>
            <div className="space-y-5 p-7">
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                  <span key={d} className={`flex h-12 w-14 flex-col items-center justify-center rounded-xl text-xs font-semibold ${agenda.dias.includes(d) && agenda.activo ? "gradient-deep text-white shadow-md" : "bg-secondary text-muted-foreground/60"}`}>
                    {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][d]}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{resumenAgenda(agenda)} · turnos de {agenda.duracion} minutos · {horariosDelDia(agenda).length} turnos por día</p>
              {agenda.nota && <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800 ring-1 ring-amber-100">{agenda.nota}</p>}
              {ausente && <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700 ring-1 ring-rose-100">No atiende del {ausente.desde.split("-").reverse().join("/")} al {ausente.hasta.split("-").reverse().join("/")} ({ausente.motivo}).</p>}
              {proximos.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Próximos días con turnos</p>
                  <div className="flex flex-wrap gap-2">
                    {proximos.map((f) => (
                      <Link key={f} to="/turnos" search={{ doctor: doctor.id }} className="rounded-xl border border-border px-3 py-1.5 text-sm font-medium capitalize transition-colors hover:border-primary/40 hover:text-primary">
                        {new Date(f + "T12:00:00").toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div data-reveal className="rounded-3xl border border-border bg-card p-7 shadow-card">
            <h2 className="flex items-center gap-2 font-sans text-lg font-semibold"><GraduationCap className="size-5 text-primary" /> Formación</h2>
            <ol className="relative mt-5 space-y-5 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-border">
              {doctor.formacion.map((f) => (
                <li key={f} className="relative flex gap-4">
                  <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full gradient-deep text-white ring-4 ring-card"><Award className="size-3" /></span>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f}</p>
                </li>
              ))}
            </ol>
          </div>

          <div data-reveal className="rounded-3xl border border-border bg-card p-7 shadow-card">
            <h2 className="flex items-center gap-2 font-sans text-lg font-semibold"><CheckCircle2 className="size-5 text-primary" /> Áreas de atención</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {doctor.areas.map((a) => (
                <p key={a} className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3 text-sm"><span className="size-2 rounded-full bg-[var(--clinic)]" />{a}</p>
              ))}
            </div>
          </div>

          <div data-reveal>
            <h2 className="text-2xl">Especialidades a cargo</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {especialidades.map((e) => {
                const I = iconoEspecialidad(e.icono);
                return (
                  <Link key={e.slug} to="/especialidades/$slug" params={{ slug: e.slug }} className="card-lift group flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:gradient-deep group-hover:text-white"><I className="size-5" /></span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 font-semibold">{e.nombre} <ArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" /></p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{e.descripcion}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
