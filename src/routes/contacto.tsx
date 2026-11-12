import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Navigation, Phone, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHero, PublicLayout, useReveal, useSitio, waLink } from "@/components/site/PublicLayout";
import { resumenHorarioClinica } from "@/lib/auth-local";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto | Clínica Gómez Bolaño" },
      { name: "description", content: "Teléfono, WhatsApp, email, dirección y horarios de la Clínica Gómez Bolaño." },
    ],
  }),
  component: Contacto,
});

const TEMAS = ["Consulta general", "Turnos", "Obras sociales", "Resultados de estudios", "Cardiología", "Nefrología"];

const inp =
  "peer h-14 w-full rounded-2xl border border-input bg-background/60 px-4 pt-5 text-sm outline-none transition placeholder:text-transparent focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/15";
const lbl =
  "pointer-events-none absolute left-4 top-2 text-[11px] font-medium text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-primary";

const NOMBRE_DIA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const aHoras = (h: string) => {
  const [a, b] = h.split(":").map(Number);
  return (a ?? 0) + (b ?? 0) / 60;
};

function Contacto() {
  useReveal();
  const sitio = useSitio();
  const horario = resumenHorarioClinica(sitio);
  const SEMANA = sitio.semana.map((x) => ({ d: NOMBRE_DIA[x.dia]!, dia: x.dia, abierto: x.abierto, desde: x.desde, hasta: x.hasta }));
  const cargado = SEMANA.some((x) => x.abierto);
  const [f, setF] = useState({ nombre: "", telefono: "", tema: "Consulta general", mensaje: "" });
  // La hora se lee recién en el navegador para no chocar con el render del servidor
  const [ahora, setAhora] = useState<Date | null>(null);
  useEffect(() => setAhora(new Date()), []);
  const hoy = ahora ? SEMANA.find((s) => s.dia === ahora.getDay()) : undefined;
  const h = ahora ? ahora.getHours() + ahora.getMinutes() / 60 : 0;
  const abierto = !!hoy?.abierto && h >= aHoras(hoy.desde) && h < aHoras(hoy.hasta);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const texto = `Hola, soy ${f.nombre.trim()} (tel. ${f.telefono.trim()}).\nTema: ${f.tema}\n\n${f.mensaje.trim()}`;
    window.open(waLink(texto), "_blank", "noopener");
    toast.success("Abrimos WhatsApp con tu mensaje listo para enviar.");
  };

  const canales = [
    { icon: MessageCircle, t: "WhatsApp", v: sitio.whatsapp, s: "Respuesta más rápida", href: sitio.whatsapp ? waLink("Hola, quisiera hacer una consulta.") : "", c: "from-emerald-400 to-green-600", glow: "group-hover:shadow-[0_18px_40px_-14px_rgba(16,185,129,.8)]" },
    { icon: Phone, t: "Teléfono", v: sitio.telefono, s: "Llamanos", href: sitio.telefono ? `tel:${sitio.telefono.replace(/\s/g, "")}` : "", c: "from-sky-500 to-blue-700", glow: "group-hover:shadow-[0_18px_40px_-14px_rgba(56,189,248,.8)]" },
    { icon: Mail, t: "Email", v: sitio.email, s: "Estudios y documentación", href: sitio.email ? `mailto:${sitio.email}` : "", c: "from-violet-500 to-indigo-700", glow: "group-hover:shadow-[0_18px_40px_-14px_rgba(139,92,246,.8)]" },
    { icon: MapPin, t: "Dirección", v: sitio.direccion, s: "Ver en el mapa", href: sitio.direccion ? `https://www.google.com/maps?q=${encodeURIComponent(sitio.direccion)}` : "", c: "from-rose-500 to-red-600", glow: "group-hover:shadow-[0_18px_40px_-14px_rgba(244,63,94,.8)]" },
  ];

  return (
    <PublicLayout>
      <PageHero
        kicker="Contacto"
        title={<>Estamos para <span className="text-shine italic">ayudarte</span></>}
        text="Escribinos, llamanos o acercate a la clínica. Te respondemos en horario de atención."
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Contacto" }]}
      >
        {ahora && cargado && (
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white">
            <span className={`size-2 rounded-full ${abierto ? "pulse-dot bg-emerald-400" : "bg-rose-400"}`} />
            {abierto ? `Abierto ahora · hasta las ${hoy?.hasta}` : "Cerrado ahora · dejanos tu mensaje"}
          </span>
        )}
      </PageHero>

      {/* ───────── CANALES: una franja, sin tarjetas ───────── */}
      <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 lg:px-8">
        <div data-reveal className="grid overflow-hidden rounded-[2rem] border border-border/70 bg-card/80 shadow-[0_40px_80px_-45px_rgba(10,25,70,.7)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
          {canales.map((c, i) => (
            <a
              key={c.t}
              href={c.href || undefined}
              aria-disabled={!c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className={`group relative flex items-start gap-4 p-6 xl:p-7 transition-colors duration-300 hover:bg-secondary/50 ${i > 0 ? "border-t border-border/70 sm:border-t-0" : ""} ${i % 2 === 1 ? "sm:border-l" : ""} ${i >= 2 ? "sm:border-t lg:border-t-0" : ""} ${i > 0 ? "lg:border-l" : ""} border-border/70`}
            >
              <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${c.c} text-white shadow-lg transition-all duration-500 group-hover:-translate-y-1 group-hover:rotate-6 ${c.glow}`}>
                <c.icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{c.t}</p>
                <p className={`mt-1 text-[15px] font-semibold leading-snug ${c.v ? "" : "text-muted-foreground/60"} ${c.t === "Email" ? "break-all" : c.t === "Dirección" ? "" : "whitespace-nowrap"}`}>{c.v || "Próximamente"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.v ? c.s : "Se publica al cargarlo en el panel"}</p>
              </div>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary group-hover:opacity-100" />
            </a>
          ))}
        </div>
      </section>

      {/* ───────── FORMULARIO + HORARIOS ───────── */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:px-8">
        <div data-reveal className="relative overflow-hidden rounded-[2rem] bg-[oklch(0.17_0.05_262)] p-8 text-white shadow-[0_50px_100px_-50px_rgba(10,25,70,.9)] sm:p-10">
          <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-sky-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full bg-rose-500/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-25 [mask-image:radial-gradient(ellipse_at_top,#000_20%,transparent_75%)]" />
          <div className="relative">
            <span className="glass inline-flex rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em]">Horarios</span>
            <h2 className="mt-5 text-4xl leading-tight text-white">Hablemos</h2>
            <p className="mt-3 text-white/65">Nuestro equipo te responde en horario de atención. Fuera de horario, dejanos tu mensaje y te escribimos.</p>

            {!cargado && <p className="mt-8 rounded-2xl bg-white/[0.06] px-5 py-4 text-sm text-white/70 ring-1 ring-white/10">Los horarios de atención se publicarán próximamente.</p>}
            <ul className={`mt-8 divide-y divide-white/10 border-y border-white/10 ${cargado ? "" : "hidden"}`}>
              {SEMANA.map((s) => {
                const esHoy = !!ahora && s.dia === ahora.getDay();
                return (
                  <li key={s.d} className={`flex items-center justify-between py-3 text-sm transition-colors ${esHoy ? "text-white" : "text-white/60"}`}>
                    <span className="flex items-center gap-2.5">
                      {esHoy && <span className={`size-2 rounded-full ${abierto ? "pulse-dot bg-emerald-400" : "bg-rose-400"}`} />}
                      <span className={esHoy ? "font-semibold" : ""}>{s.d}</span>
                      {esHoy && <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">Hoy</span>}
                    </span>
                    <span className="tabular-nums">{s.abierto ? `${s.desde} – ${s.hasta}` : "Cerrado"}</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={waLink("Hola, quisiera hacer una consulta.")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#1ebe5b]">
                <MessageCircle className="size-4" /> WhatsApp
              </a>
              {sitio.telefono && (
                <a href={`tel:${sitio.telefono.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium transition hover:bg-white/10">
                  <Phone className="size-4" /> Llamar
                </a>
              )}
            </div>
            <p className="mt-8 flex items-center gap-2 text-xs text-white/50"><ShieldCheck className="size-4" /> Tus datos se usan solo para responder tu consulta.</p>
          </div>
        </div>

        <form onSubmit={enviar} data-reveal className="rounded-[2rem] border border-border/70 bg-card/80 p-8 shadow-[0_40px_80px_-50px_rgba(10,25,70,.6)] backdrop-blur-xl sm:p-10">
          <span className="section-kicker">Mensaje</span>
          <h2 className="mt-4 text-3xl sm:text-4xl">Envianos tu consulta</h2>
          <p className="mt-2 text-sm text-muted-foreground">Se abre WhatsApp con tu mensaje listo para enviar.</p>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">¿Sobre qué querés consultar?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TEMAS.map((t) => {
              const on = f.tema === t;
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => setF({ ...f, tema: t })}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    on ? "gradient-deep text-white shadow-[0_10px_25px_-10px_rgba(20,50,120,.9)]" : "border border-border bg-background/60 text-muted-foreground hover:-translate-y-0.5 hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="relative block">
              <input required placeholder="Nombre" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} className={inp} />
              <span className={lbl}>Nombre y apellido</span>
            </label>
            <label className="relative block">
              <input required type="tel" placeholder="Teléfono" value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} className={inp} />
              <span className={lbl}>Teléfono</span>
            </label>
            <label className="relative block sm:col-span-2">
              <textarea required rows={5} maxLength={600} placeholder="Mensaje" value={f.mensaje} onChange={(e) => setF({ ...f, mensaje: e.target.value })} className={`${inp} h-auto resize-none pb-3 pt-7`} />
              <span className={lbl}>Tu mensaje</span>
              <span className="absolute bottom-3 right-4 text-[11px] tabular-nums text-muted-foreground">{f.mensaje.length}/600</span>
            </label>
          </div>
          <Button type="submit" size="lg" className="btn-glow mt-6 h-12 w-full rounded-2xl sm:w-auto sm:px-8">
            <Send className="size-4" /> Enviar por WhatsApp
          </Button>
        </form>
      </section>

      {/* ───────── MAPA ───────── */}
      {sitio.direccion && (
      <section className="mx-auto max-w-7xl px-4 pb-24 lg:px-8">
        <div data-reveal className="relative overflow-hidden rounded-[2rem] shadow-[0_50px_100px_-50px_rgba(10,25,70,.8)] ring-1 ring-black/5">
          <iframe title="Mapa" src={`https://www.google.com/maps?q=${encodeURIComponent(sitio.direccion)}&output=embed`} className="h-[420px] w-full border-0 grayscale-[35%]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          <div className="m-4 flex flex-wrap items-center gap-4 rounded-2xl bg-card/90 p-5 shadow-xl backdrop-blur-xl sm:absolute sm:bottom-6 sm:left-6 sm:m-0">
            <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white"><MapPin className="size-5" /></span>
            <div>
              <p className="font-semibold">{sitio.direccion}</p>
              {horario && <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="size-3.5" /> {horario}</p>}
            </div>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(sitio.direccion)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
              <Navigation className="size-4" /> Cómo llegar
            </a>
          </div>
        </div>
      </section>
      )}
    </PublicLayout>
  );
}
