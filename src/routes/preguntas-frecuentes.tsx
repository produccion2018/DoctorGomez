import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FlaskConical,
  HeartPulse,
  LayoutGrid,
  MessageCircle,
  Phone,
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

const DESC: Record<Cat, string> = {
  Todas: "Todas las preguntas",
  Turnos: "Reservar, cambiar o cancelar",
  Estudios: "Preparación y resultados",
  "Pagos y coberturas": "EPS, prepagadas y medios de pago",
  Atención: "Antes y durante la consulta",
};
const COLOR_CAT: Record<Cat, string> = {
  Todas: "#1e40af",
  Turnos: "#0ea5e9",
  Estudios: "#8b5cf6",
  "Pagos y coberturas": "#10b981",
  Atención: "#ef4444",
};

function Faq() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Cat>("Todas");
  const [sel, setSel] = useState<string>(FAQS[0]!.q);
  const [voto, setVoto] = useState<Record<string, "si" | "no">>({});

  const conCat = useMemo(() => FAQS.map((f) => ({ ...f, cat: categoria(f.q) })), []);
  const lista = conCat.filter(
    (f) => (cat === "Todas" || f.cat === cat) && `${f.q} ${f.a}`.toLowerCase().includes(q.toLowerCase()),
  );
  useReveal(`${cat}`);
  const actual = lista.find((f) => f.q === sel) ?? lista[0];
  const pos = actual ? lista.indexOf(actual) : -1;
  const color = COLOR_CAT[actual?.cat ?? "Todas"];

  const elegirCat = (c: Cat) => {
    setCat(c);
    const primera = conCat.find((f) => c === "Todas" || f.cat === c);
    if (primera) setSel(primera.q);
  };

  const Respuesta = ({ f }: { f: (typeof conCat)[number] }) => (
    <>
      <p className="leading-relaxed text-muted-foreground sm:text-[17px]"><Resaltar texto={f.a} q={q} /></p>
      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border/70 pt-5 text-sm">
        {voto[f.q] ? (
          <span className="text-muted-foreground">¡Gracias por tu respuesta!</span>
        ) : (
          <>
            <span className="mr-1 text-muted-foreground">¿Te sirvió esta respuesta?</span>
            <button onClick={() => setVoto({ ...voto, [f.q]: "si" })} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 transition hover:border-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-600"><ThumbsUp className="size-3.5" /> Sí</button>
            <button onClick={() => setVoto({ ...voto, [f.q]: "no" })} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 transition hover:border-rose-400 hover:bg-rose-500/10 hover:text-rose-600"><ThumbsDown className="size-3.5" /> No</button>
          </>
        )}
        {voto[f.q] === "no" && (
          <a href={waLink(`Hola, tengo una duda sobre: ${f.q}`)} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1.5 font-semibold text-primary"><MessageCircle className="size-4" /> Consultanos por WhatsApp</a>
        )}
      </div>
    </>
  );

  return (
    <PublicLayout>
      <PageHero
        kicker="Ayuda"
        title={<>Preguntas <span className="text-shine italic">frecuentes</span></>}
        text="Elegí un tema, tocá una pregunta y leé la respuesta. Así de simple."
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Preguntas frecuentes" }]}
      >
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-white/60" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setCat("Todas"); }}
            placeholder="Buscá tu pregunta: turnos, ayuno, Holter..."
            className="h-14 w-full rounded-2xl border border-white/20 bg-white/10 pl-14 pr-4 text-base text-white shadow-2xl outline-none backdrop-blur-xl transition placeholder:text-white/50 focus:border-white/50 focus:bg-white/15 focus:ring-4 focus:ring-white/10"
          />
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        {/* PASO 1 — TEMA */}
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-full gradient-deep font-display text-sm font-semibold text-white">1</span>
          <h2 className="font-sans text-lg font-semibold">Elegí un tema</h2>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
          {CATS.map((c) => {
            const n = c.id === "Todas" ? conCat.length : conCat.filter((f) => f.cat === c.id).length;
            const on = cat === c.id;
            const col = COLOR_CAT[c.id];
            return (
              <button
                key={c.id}
                onClick={() => elegirCat(c.id)}
                className={`group relative overflow-hidden rounded-3xl border p-5 text-left transition-all duration-300 ${on ? "border-transparent text-white shadow-xl" : "border-border/70 bg-card hover:-translate-y-1 hover:shadow-[0_20px_45px_-30px_rgba(20,50,120,.55)]"}`}
                style={on ? { background: `linear-gradient(140deg, ${col}, ${col}cc)`, boxShadow: `0 22px 45px -22px ${col}` } : undefined}
              >
                <span className={`flex size-11 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:-rotate-6 ${on ? "bg-white/20" : ""}`} style={on ? undefined : { background: `${col}14`, color: col }}>
                  <c.icon className="size-5" />
                </span>
                <p className="mt-4 font-semibold leading-tight">{c.id}</p>
                <p className={`mt-1 text-xs ${on ? "text-white/80" : "text-muted-foreground"}`}>{DESC[c.id]}</p>
                <span className={`absolute right-4 top-4 rounded-full px-2 py-0.5 text-[11px] font-semibold ${on ? "bg-white/25" : "bg-secondary text-muted-foreground"}`}>{n}</span>
              </button>
            );
          })}
        </div>

        {/* PASO 2 y 3 — PREGUNTA Y RESPUESTA */}
        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full gradient-deep font-display text-sm font-semibold text-white">2</span>
              <h2 className="font-sans text-lg font-semibold">Tocá una pregunta</h2>
              <span className="ml-auto text-sm text-muted-foreground">{lista.length} {lista.length === 1 ? "pregunta" : "preguntas"}</span>
            </div>

            {lista.length === 0 && (
              <div className="mt-5 rounded-3xl border border-dashed border-border p-10 text-center">
                <p className="text-muted-foreground">No encontramos esa pregunta. Escribinos y te respondemos.</p>
                <Button asChild className="mt-4 rounded-full !bg-[#25D366] text-white hover:!bg-[#1ebe5b]">
                  <a href={waLink(`Hola, tengo una consulta: ${q}`)} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> Preguntar por WhatsApp</a>
                </Button>
              </div>
            )}

            <ol className="mt-5 space-y-2">
              {lista.map((f, i) => {
                const on = actual?.q === f.q;
                const col = COLOR_CAT[f.cat];
                return (
                  <li key={f.q}>
                    <button
                      onClick={() => setSel(f.q)}
                      aria-expanded={on}
                      className={`group flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ${on ? "border-transparent bg-card shadow-[0_20px_45px_-28px_rgba(20,50,120,.7)]" : "border-border/60 bg-card/50 hover:border-border hover:bg-card"}`}
                      style={on ? { boxShadow: `inset 3px 0 0 ${col}, 0 20px 45px -28px rgba(20,50,120,.7)` } : undefined}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl font-display text-xs font-semibold transition-colors" style={on ? { background: col, color: "#fff" } : { background: `${col}14`, color: col }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={`min-w-0 flex-1 text-[15px] font-medium leading-snug ${on ? "text-foreground" : "text-foreground/75 group-hover:text-foreground"}`}>
                        <Resaltar texto={f.q} q={q} />
                      </span>
                      <ChevronRight className={`size-4 shrink-0 transition-all ${on ? "translate-x-0.5 text-foreground lg:opacity-100" : "text-muted-foreground/50 group-hover:translate-x-0.5"} max-lg:rotate-90 ${on ? "max-lg:-rotate-90" : ""}`} />
                    </button>
                    {/* En celular la respuesta se abre debajo */}
                    {on && (
                      <div className="mt-2 rounded-2xl border border-border/70 bg-card p-5 animate-in fade-in slide-in-from-top-2 duration-300 lg:hidden">
                        <Respuesta f={f} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="hidden lg:block">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full gradient-deep font-display text-sm font-semibold text-white">3</span>
              <h2 className="font-sans text-lg font-semibold">Leé la respuesta</h2>
            </div>
            {actual && (
              <div className="sticky top-24 mt-5">
                <article key={actual.q} className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card p-9 shadow-[0_40px_80px_-50px_rgba(20,50,120,.7)] animate-in fade-in slide-in-from-right-4 duration-500">
                  <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
                  <span className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full opacity-10 blur-3xl" style={{ background: color }} />
                  <div className="relative">
                    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${color}14`, color }}>
                      {(() => { const I = CATS.find((c) => c.id === actual.cat)!.icon; return <I className="size-3.5" />; })()} {actual.cat}
                    </span>
                    <h3 className="mt-5 font-display text-3xl font-semibold leading-tight">
                      <Resaltar texto={actual.q} q={q} />
                    </h3>
                    <div className="mt-5"><Respuesta f={actual} /></div>
                    <div className="mt-6 flex items-center justify-between gap-3">
                      <button disabled={pos <= 0} onClick={() => setSel(lista[pos - 1]!.q)} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:border-primary/40 hover:text-primary disabled:opacity-40"><ChevronLeft className="size-4" /> Anterior</button>
                      <span className="text-xs text-muted-foreground">{pos + 1} de {lista.length}</span>
                      <button disabled={pos >= lista.length - 1} onClick={() => setSel(lista[pos + 1]!.q)} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:border-primary/40 hover:text-primary disabled:opacity-40">Siguiente <ChevronRight className="size-4" /></button>
                    </div>
                  </div>
                </article>
              </div>
            )}
          </div>
        </div>

        {/* CONTACTO */}
        <div data-reveal className="relative mt-16 overflow-hidden rounded-[2rem] gradient-deep p-8 text-white shadow-[0_40px_80px_-40px_rgba(10,25,70,.9)] sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-sky-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-10 size-52 rounded-full bg-rose-500/25 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20"><MessageCircle className="size-6" /></span>
              <div>
                <h2 className="text-2xl text-white sm:text-3xl">¿No encontraste tu respuesta?</h2>
                <p className="mt-1 text-white/70">Te respondemos por WhatsApp en horario de atención.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-full !bg-[#25D366] px-6 text-white hover:!bg-[#1ebe5b]"><a href={waLink("Hola, tengo una consulta.")} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> WhatsApp</a></Button>
              <a href={`tel:${CLINICA.telefono.replace(/\s/g, "")}`} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-5 text-sm font-medium transition hover:bg-white/10"><Phone className="size-4" /> {CLINICA.telefono}</a>
              <Link to="/turnos" className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[oklch(0.25_0.08_260)] transition hover:bg-white/90"><CalendarPlus className="size-4" /> Solicitar turno</Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
