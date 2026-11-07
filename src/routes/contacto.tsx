import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHero, PublicLayout, useReveal, waLink } from "@/components/site/PublicLayout";
import { CLINICA, ESPECIALIDADES } from "@/data/clinic";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto | Clínica Gómez Bolaño" },
      { name: "description", content: "Teléfono, WhatsApp, email, dirección y horarios de la Clínica Gómez Bolaño." },
    ],
  }),
  component: Contacto,
});

const inp =
  "h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15";

function Contacto() {
  useReveal();
  const [f, setF] = useState({ nombre: "", telefono: "", tema: "Consulta general", mensaje: "" });

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const texto = `Hola, soy ${f.nombre.trim()} (tel. ${f.telefono.trim()}).\nTema: ${f.tema}\n\n${f.mensaje.trim()}`;
    window.open(waLink(texto), "_blank", "noopener");
    toast.success("Abrimos WhatsApp con tu mensaje listo para enviar.");
  };

  const canales = [
    { icon: Phone, t: "Teléfono", v: CLINICA.telefono, href: `tel:${CLINICA.telefono.replace(/\s/g, "")}`, c: "from-sky-500 to-blue-700" },
    { icon: MessageCircle, t: "WhatsApp", v: CLINICA.whatsapp, href: waLink("Hola, quisiera hacer una consulta."), c: "from-emerald-400 to-green-600" },
    { icon: Mail, t: "Email", v: CLINICA.email, href: `mailto:${CLINICA.email}`, c: "from-violet-500 to-indigo-700" },
    { icon: MapPin, t: "Dirección", v: CLINICA.direccion, href: `https://www.google.com/maps?q=${encodeURIComponent(CLINICA.direccion)}`, c: "from-rose-500 to-red-600" },
  ];

  return (
    <PublicLayout>
      <PageHero
        kicker="Contacto"
        title={<>Estamos para <span className="text-shine italic">ayudarte</span></>}
        text="Escribinos, llamanos o acercate a la clínica. Te respondemos en horario de atención."
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Contacto" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {canales.map((c, i) => (
            <a key={c.t} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" data-reveal style={{ transitionDelay: `${i * 80}ms` }} className="card-lift group rounded-3xl border border-border bg-card p-6 shadow-card">
              <span className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${c.c} text-white shadow-lg transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`}><c.icon className="size-5" /></span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{c.t}</p>
              <p className="mt-1 font-semibold">{c.v}</p>
            </a>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <form onSubmit={enviar} data-reveal className="rounded-3xl border border-border bg-card p-7 shadow-elevated sm:p-9">
            <h2 className="text-3xl">Envianos un mensaje</h2>
            <p className="mt-1 text-sm text-muted-foreground">Se abre WhatsApp con tu mensaje listo para enviar.</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Nombre y apellido</span>
                <input required value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} className={inp} /></label>
              <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Teléfono</span>
                <input required type="tel" value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} className={inp} /></label>
              <label className="space-y-1.5 sm:col-span-2"><span className="text-xs font-medium text-muted-foreground">Tema</span>
                <select value={f.tema} onChange={(e) => setF({ ...f, tema: e.target.value })} className={inp}>
                  <option>Consulta general</option>
                  <option>Turnos</option>
                  <option>Obras sociales y prepagas</option>
                  <option>Resultados de estudios</option>
                  {ESPECIALIDADES.map((e) => <option key={e.slug}>{e.nombre}</option>)}
                </select></label>
              <label className="space-y-1.5 sm:col-span-2"><span className="text-xs font-medium text-muted-foreground">Mensaje</span>
                <textarea required rows={5} value={f.mensaje} onChange={(e) => setF({ ...f, mensaje: e.target.value })} className={inp + " h-auto py-3"} /></label>
            </div>
            <Button type="submit" size="lg" className="btn-glow mt-6 h-12 w-full rounded-xl sm:w-auto sm:px-8"><Send className="size-4" /> Enviar mensaje</Button>
          </form>

          <div data-reveal className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card">
            <iframe title="Mapa" src={`https://www.google.com/maps?q=${encodeURIComponent(CLINICA.direccion)}&output=embed`} className="min-h-72 w-full flex-1 border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <div className="flex items-start gap-3 p-6">
              <Clock className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="font-semibold">Horarios de atención</p>
                <p className="text-sm text-muted-foreground">{CLINICA.horarios}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
