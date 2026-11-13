import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowUpRight, CalendarDays, CalendarPlus, Check, CheckCircle2, GraduationCap, MessageCircle, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Curriculum, FondoInfo, PageHero, PublicLayout, acentoDoctor, useReveal, waLink } from "@/components/site/PublicLayout";
import { DOCTORS, ESPECIALIDADES, fotoDoctor, iconoEspecialidad } from "@/data/clinic";
import { KEY_AGENDA, agendaDe, horariosDelDia, isoDe, proximosDias, resumenAgenda, useDato, type Agendas } from "@/lib/auth-local";

import fondoCorazon from "@/assets/fondo-corazon.jpg";
import fondoRinones from "@/assets/fondo-rinones.jpg";
export const Route = createFileRoute("/especialistas/$id")({
  loader: ({ params }) => {
    const doctor = DOCTORS.find((d) => d.id === params.id);
    if (!doctor) throw notFound();
    return doctor;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.nombre ?? "Perfil profesional"} | HEGO · Centro de especialidades médicas` },
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
  const ac = acentoDoctor(doctor.foto);
  const ausente = agenda.bloqueos.find((b) => b.hasta >= isoDe(new Date()));

  return (
    <PublicLayout>
      <PageHero
        kicker={doctor.titulo}
        fondo={doctor.foto === "alonso" ? fondoCorazon : fondoRinones}
        title={doctor.nombre}
        text={doctor.bio}
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Especialistas", to: "/especialistas" }, { label: doctor.nombre }]}
      />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[340px_1fr] lg:px-8">
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="relative overflow-hidden rounded-[2rem] border-4 border-background shadow-elevated">
            <img src={fotoDoctor(doctor.foto)} alt={doctor.nombre} className="aspect-[4/5] w-full object-cover object-top" />
          </div>
          <div className="space-y-3 rounded-3xl border border-border bg-card p-6 shadow-card">
            <p className="flex items-center gap-3 text-sm"><span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary"><Stethoscope className="size-4" /></span>{doctor.titulo}</p>
            <p className="flex items-center gap-3 text-sm"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><CalendarDays className="size-4" /></span>{resumenAgenda(agenda)}</p>
            <Button asChild className="btn-glow mt-2 h-12 w-full rounded-xl"><Link to="/turnos" search={{ doctor: doctor.id }}><CalendarPlus className="size-4" /> Solicitar cita</Link></Button>
            <Button asChild variant="outline" className="h-11 w-full rounded-xl">
              <a href={waLink(`Hola, quiero una cita con ${doctor.nombre}.`)} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> WhatsApp</a>
            </Button>
          </div>
        </aside>

        <div className="relative space-y-8 rounded-[2.25rem] p-0 lg:-m-6 lg:p-6">
          <FondoInfo foto={doctor.foto} />
          <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/85 shadow-card backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 gradient-deep px-7 py-5 text-white">
              <h2 className="flex items-center gap-2 font-sans text-lg font-semibold text-white"><CalendarDays className="size-5" /> Días y horarios de atención</h2>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${agenda.activo && agenda.dias.length ? "bg-emerald-400/20 text-emerald-100" : "bg-white/15 text-white/80"}`}>
                <span className={`size-2 rounded-full ${agenda.activo && agenda.dias.length ? "bg-emerald-400" : "bg-white/60"}`} /> {!agenda.activo ? "Agenda pausada" : agenda.dias.length ? "Agenda abierta" : "Horarios a confirmar"}
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
              {agenda.dias.length === 0 ? (
                <p className="rounded-xl bg-secondary/70 px-4 py-3 text-sm text-muted-foreground">Los días y horarios de atención se publicarán próximamente. Mientras tanto, puede consultar por WhatsApp.</p>
              ) : (
                <p className="text-sm text-muted-foreground">{resumenAgenda(agenda)} · citas de {agenda.duracion} minutos</p>
              )}
              {agenda.nota && <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800 ring-1 ring-amber-100">{agenda.nota}</p>}
              {ausente && <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700 ring-1 ring-rose-100">No atiende del {ausente.desde.split("-").reverse().join("/")} al {ausente.hasta.split("-").reverse().join("/")} ({ausente.motivo}).</p>}
              {proximos.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Próximos días con citas</p>
                  <div className="flex flex-wrap gap-2">
                    {proximos.map((f) => (
                      <Link key={f} to="/turnos" search={{ doctor: doctor.id }} className="rounded-xl border border-border px-3 py-1.5 text-sm font-medium capitalize transition-colors hover:border-primary/40 hover:text-primary">
                        {new Date(f + "T12:00:00").toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" })}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-[1.1fr_1fr]">
            <div data-reveal className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-7 shadow-card backdrop-blur-sm">
              <span className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${ac.c}, transparent)` }} />
              <div className="mb-6 flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${ac.c}, ${ac.c}bb)`, boxShadow: `0 14px 28px -14px ${ac.c}` }}><GraduationCap className="size-5" /></span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Currículum</p>
                  <h2 className="font-sans text-lg font-semibold">Formación académica</h2>
                </div>
              </div>
              <Curriculum items={doctor.formacion} color={ac.c} grande />
            </div>

            <div data-reveal className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-7 shadow-card backdrop-blur-sm">
              <span className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${ac.c}, transparent)` }} />
              <div className="mb-6 flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${ac.c}, ${ac.c}bb)`, boxShadow: `0 14px 28px -14px ${ac.c}` }}><CheckCircle2 className="size-5" /></span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Experiencia</p>
                  <h2 className="font-sans text-lg font-semibold">Áreas de atención</h2>
                </div>
              </div>
              <ul className="grid gap-2.5">
                {doctor.areas.map((a) => (
                  <li key={a} className="group/a flex items-center gap-3 rounded-xl border border-transparent bg-secondary/50 px-3.5 py-2.5 text-sm transition-all hover:bg-card" style={{ ["--b" as string]: ac.borde }}>
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg" style={{ background: ac.suave, color: ac.c }}><Check className="size-3.5" /></span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div data-reveal>
            <h2 className="text-2xl">Especialidades a cargo</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {especialidades.map((e) => {
                const I = iconoEspecialidad(e.icono);
                return (
                  <Link key={e.slug} to="/especialidades/$slug" params={{ slug: e.slug }} className="card-lift group relative flex gap-4 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-card backdrop-blur-sm">
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
