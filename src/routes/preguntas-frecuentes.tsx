import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarPlus,
  ChevronsDownUp,
  ChevronsUpDown,
  CreditCard,
  FlaskConical,
  HeartPulse,
  LayoutGrid,
  MessageCircle,
  Phone,
  Plus,
  Search,
  ThumbsDown,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, PublicLayout, useReveal, waLink } from "@/components/site/PublicLayout";
import { CLINICA, FAQS } from "@/data/clinic";

export const Route = createFileRoute("/preguntas-frecuentes")({
  head: () => ({
    meta: [
      { title: "Preguntas frecuentes | Clínica Gómez Bolaño" },
      { name: "description", content: "Turnos, estudios, coberturas, pagos y preparación para la consulta." },
    ],
  }),
  component: Faq,
});

type Cat = "Todas" | "Turnos" | "Estudios" | "Pagos y coberturas" | "Atención";

const CATS: { id: Cat; icon: LucideIcon }[] = [
  { id: "Todas", icon: LayoutGrid },
  { id: "Turnos", icon: CalendarPlus },
  { id: "Estudios", icon: FlaskConical },
  { id: "Pagos y coberturas", icon: CreditCard },
  { id: "Atención", icon: HeartPulse },
];

function categoria(q: string): Exclude<Cat, "Todas"> {
  const t = q.toLowerCase();
  if (/pago|obra social|prepaga/.test(t)) return "Pagos y coberturas";
  if (/estudio|holter|mapa|ayuno|análisis|resultado/.test(t)) return "Estudios";
  if (/turno|derivación|reprogramar/.test(t)) return "Turnos";
  return "Atención";
}

function Resaltar({ texto, q }: { texto: string; q: string }) {
  if (!q.trim()) return <>{texto}</>;
  const i = texto.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, i)}
      <mark className="rounded bg-sky-200/70 px-0.5 text-inherit dark:bg-sky-500/30">{texto.slice(i, i + q.length)}</mark>
      {texto.slice(i + q.length)}
    </>
  );
}

function Faq() {
  const [abiertas, setAbiertas] = useState<Set<string>>(() => new Set([FAQS[0]!.q]));
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Cat>("Todas");
  const [voto, setVoto] = useState<Record<string, "si" | "no">>({});

  const conCat = useMemo(() => FAQS.map((f) => ({ ...f, cat: categoria(f.q) })), []);
  const lista = conCat.filter(
    (f) => (cat === "Todas" || f.cat === cat) && `${f.q} ${f.a}`.toLowerCase().includes(q.toLowerCase()),
  );
  useReveal(`${q}${cat}`);

  const alternar = (k: string) =>
    setAbiertas((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  const todasAbiertas = lista.length > 0 && lista.every((f) => abiertas.has(f.q));

  const irA = (k: string) => {
    setCat("Todas");
    setQ("");
    setAbiertas((s) => new Set(s).add(k));
    setTimeout(() => document.getElementById(`faq-${conCat.findIndex((f) => f.q === k)}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  };

  return (
    <PublicLayout>
      <PageHero
        kicker="Ayuda"
        title={<>Preguntas <span className="text-shine italic">frecuentes</span></>}
        text="Todo lo que necesitás saber antes de tu consulta."
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Preguntas frecuentes" }]}
      >
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-white/60" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscá tu pregunta: turnos, ayuno, Holter..."
            className="h-14 w-full rounded-2xl border border-white/20 bg-white/10 pl-14 pr-4 text-base text-white shadow-2xl outline-none backdrop-blur-xl transition placeholder:text-white/50 focus:border-white/50 focus:bg-white/15 focus:ring-4 focus:ring-white/10"
          />
        </div>
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <div>
          {/* Categorías */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {CATS.map((c) => {
                const n = c.id === "Todas" ? conCat.length : conCat.filter((f) => f.cat === c.id).length;
                const on = cat === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCat(c.id)}
                    className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      on
                        ? "gradient-deep text-white shadow-[0_12px_30px_-12px_rgba(20,50,120,.9)]"
                        : "border border-border bg-card/70 text-muted-foreground backdrop-blur hover:-translate-y-0.5 hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    <c.icon className="size-4" /> {c.id}
                    <span className={`rounded-full px-1.5 text-[11px] ${on ? "bg-white/20" : "bg-secondary"}`}>{n}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setAbiertas(todasAbiertas ? new Set() : new Set(lista.map((f) => f.q)))}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-primary"
            >
              {todasAbiertas ? <ChevronsDownUp className="size-4" /> : <ChevronsUpDown className="size-4" />}
              {todasAbiertas ? "Cerrar todas" : "Abrir todas"}
            </button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            {lista.length} {lista.length === 1 ? "pregunta" : "preguntas"}
            {q && <> para “{q}”</>}
          </p>

          {lista.length === 0 && (
            <div className="mt-6 rounded-3xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">No encontramos esa pregunta. Escribinos y te respondemos.</p>
              <Button asChild className="mt-4 rounded-full !bg-[#25D366] text-white hover:!bg-[#1ebe5b]">
                <a href={waLink(`Hola, tengo una consulta: ${q}`)} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> Preguntar por WhatsApp</a>
              </Button>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {lista.map((f, i) => {
              const on = abiertas.has(f.q);
              const idx = conCat.findIndex((x) => x.q === f.q);
              const Icon = CATS.find((c) => c.id === f.cat)!.icon;
              return (
                <div
                  key={f.q}
                  id={`faq-${idx}`}
                  data-reveal
                  style={{ transitionDelay: `${Math.min(i, 8) * 45}ms` }}
                  className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ${
                    on
                      ? "border-primary/25 bg-card shadow-[0_30px_60px_-35px_rgba(20,50,120,.6)]"
                      : "border-border/70 bg-card/60 backdrop-blur hover:-translate-y-0.5 hover:border-primary/25 hover:bg-card hover:shadow-[0_20px_45px_-30px_rgba(20,50,120,.55)]"
                  }`}
                >
                  <span className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[var(--clinic)] to-rose-500 transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`} />
                  <button onClick={() => alternar(f.q)} aria-expanded={on} className="flex w-full items-center gap-4 p-5 text-left sm:p-6">
                    <span
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-all duration-500 ${
                        on ? "gradient-deep text-white shadow-lg" : "bg-secondary text-primary group-hover:scale-110 group-hover:-rotate-6"
                      }`}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">{f.cat}</span>
                      <span className={`mt-0.5 block font-semibold transition-colors sm:text-[17px] ${on ? "text-foreground" : "group-hover:text-primary"}`}>
                        <Resaltar texto={f.q} q={q} />
                      </span>
                    </span>
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
                        on ? "rotate-45 border-transparent bg-primary text-primary-foreground" : "border-border text-muted-foreground group-hover:border-primary/40 group-hover:text-primary"
                      }`}
                    >
                      <Plus className="size-4" />
                    </span>
                  </button>
                  <div className={`grid transition-all duration-500 ${on ? "visible grid-rows-[1fr] opacity-100" : "invisible grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <div className="px-5 pb-6 sm:pl-[5.25rem] sm:pr-8">
                        <p className="leading-relaxed text-muted-foreground"><Resaltar texto={f.a} q={q} /></p>
                        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4 text-sm">
                          {voto[f.q] ? (
                            <span className="text-muted-foreground">¡Gracias por tu respuesta!</span>
                          ) : (
                            <>
                              <span className="mr-1 text-muted-foreground">¿Te sirvió?</span>
                              <button onClick={() => setVoto({ ...voto, [f.q]: "si" })} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 transition hover:border-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-600">
                                <ThumbsUp className="size-3.5" /> Sí
                              </button>
                              <button onClick={() => setVoto({ ...voto, [f.q]: "no" })} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 transition hover:border-rose-400 hover:bg-rose-500/10 hover:text-rose-600">
                                <ThumbsDown className="size-3.5" /> No
                              </button>
                            </>
                          )}
                          {voto[f.q] === "no" && (
                            <a href={waLink(`Hola, tengo una duda sobre: ${f.q}`)} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1.5 font-semibold text-primary">
                              <MessageCircle className="size-4" /> Consultanos por WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div data-reveal className="relative overflow-hidden rounded-[2rem] gradient-deep p-8 text-white shadow-[0_40px_80px_-40px_rgba(10,25,70,.9)]">
            <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-sky-400/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-10 size-44 rounded-full bg-rose-500/25 blur-3xl" />
            <div className="relative">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20"><MessageCircle className="size-5" /></span>
              <h2 className="mt-5 text-2xl text-white">¿Tenés otra duda?</h2>
              <p className="mt-2 text-sm text-white/70">Te respondemos por WhatsApp en horario de atención.</p>
              <Button asChild className="mt-6 h-11 w-full rounded-xl !bg-[#25D366] text-white hover:!bg-[#1ebe5b]">
                <a href={waLink("Hola, tengo una consulta.")} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> Escribir por WhatsApp</a>
              </Button>
              <a href={`tel:${CLINICA.telefono.replace(/\s/g, "")}`} className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 text-sm font-medium transition hover:bg-white/10">
                <Phone className="size-4" /> {CLINICA.telefono}
              </a>
              <Link to="/turnos" className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-[oklch(0.25_0.08_260)] transition hover:bg-white/90">
                <CalendarPlus className="size-4" /> Solicitar turno
              </Link>
            </div>
          </div>

          <div data-reveal className="rounded-[2rem] border border-border/70 bg-card/70 p-7 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Las más consultadas</p>
            <ul className="mt-4 space-y-1">
              {[0, 7, 8, 6].map((n) => {
                const f = FAQS[n];
                if (!f) return null;
                return (
                  <li key={f.q}>
                    <button onClick={() => irA(f.q)} className="group flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left text-sm transition hover:bg-secondary">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--clinic)] transition-transform group-hover:scale-150" />
                      <span className="text-muted-foreground transition-colors group-hover:text-foreground">{f.q}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </section>
    </PublicLayout>
  );
}
