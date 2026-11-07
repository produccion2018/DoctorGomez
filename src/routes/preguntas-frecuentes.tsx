import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus, ChevronDown, HelpCircle, MessageCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, PublicLayout, useReveal, waLink } from "@/components/site/PublicLayout";
import { FAQS } from "@/data/clinic";

export const Route = createFileRoute("/preguntas-frecuentes")({
  head: () => ({
    meta: [
      { title: "Preguntas frecuentes | Clínica Gómez Bolaño" },
      { name: "description", content: "Turnos, estudios, coberturas, pagos y preparación para la consulta." },
    ],
  }),
  component: Faq,
});

function Faq() {
  const [abierta, setAbierta] = useState<number | null>(0);
  const [q, setQ] = useState("");
  const lista = FAQS.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(q.toLowerCase()));
  useReveal(q);

  return (
    <PublicLayout>
      <PageHero
        kicker="Ayuda"
        title={<>Preguntas <span className="text-shine italic">frecuentes</span></>}
        text="Todo lo que necesitás saber antes de tu consulta."
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Preguntas frecuentes" }]}
      />

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1fr_320px] lg:px-8">
        <div>
          <div className="relative mb-8">
            <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscá tu pregunta..."
              className="h-14 w-full rounded-2xl border border-input bg-card pl-14 pr-4 text-base shadow-card outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>
          {lista.length === 0 && <p className="py-12 text-center text-muted-foreground">No encontramos esa pregunta. Escribinos y te respondemos.</p>}
          <div className="space-y-3">
            {lista.map((f, i) => {
              const on = abierta === i;
              return (
                <div key={f.q} data-reveal style={{ transitionDelay: `${i * 50}ms` }} className={`overflow-hidden rounded-2xl border bg-card transition-all duration-300 ${on ? "border-primary/30 shadow-elevated" : "border-border shadow-card hover:border-primary/20"}`}>
                  <button onClick={() => setAbierta(on ? null : i)} className="flex w-full items-center gap-4 p-5 text-left">
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ${on ? "gradient-deep text-white" : "bg-secondary text-primary"}`}>
                      <HelpCircle className="size-5" />
                    </span>
                    <span className="flex-1 font-semibold">{f.q}</span>
                    <ChevronDown className={`size-5 shrink-0 text-muted-foreground transition-transform duration-300 ${on ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`grid transition-all duration-300 ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 pl-[4.75rem] leading-relaxed text-muted-foreground">{f.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div data-reveal className="rounded-3xl gradient-deep p-7 text-deep-foreground shadow-elevated">
            <h2 className="text-2xl text-deep-foreground">¿Tenés otra duda?</h2>
            <p className="mt-2 text-sm text-deep-foreground/75">Te respondemos por WhatsApp en horario de atención.</p>
            <Button asChild className="mt-5 w-full rounded-xl !bg-[#25D366] text-white hover:!bg-[#1ebe5b]">
              <a href={waLink("Hola, tengo una consulta.")} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> Escribir por WhatsApp</a>
            </Button>
            <Button asChild variant="outline" className="mt-3 w-full rounded-xl !border-white/30 !bg-white/10 text-deep-foreground hover:!bg-white/20 hover:text-deep-foreground">
              <Link to="/turnos"><CalendarPlus className="size-4" /> Solicitar turno</Link>
            </Button>
          </div>
        </aside>
      </section>
    </PublicLayout>
  );
}
