import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, ArrowRight, CalendarPlus, Clock, Lock, Mail, MapPin, Menu, MessageCircle, Phone, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-provider";
import { ScrollTop } from "./ScrollTop";
import { Crumbs } from "./Crumbs";
import { CLINICA } from "@/data/clinic";

const LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/especialidades", label: "Especialidades" },
  { to: "/especialistas", label: "Especialistas" },
  { to: "/servicios", label: "Servicios" },
  { to: "/clinica", label: "Clínica" },
  { to: "/preguntas-frecuentes", label: "Preguntas" },
  { to: "/contacto", label: "Contacto" },
];

/* Link de WhatsApp con mensaje armado */
export function waLink(texto: string) {
  return `https://wa.me/${CLINICA.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(texto)}`;
}

/* Aparición suave al hacer scroll (elementos con data-reveal) */
export function useReveal(dep?: unknown) {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [dep]);
}

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="flex size-10 items-center justify-center rounded-xl gradient-deep shadow-[0_8px_20px_-8px_rgba(20,50,120,.7)] transition-transform duration-500 group-hover:rotate-6">
        <Activity className="size-5 text-deep-foreground" />
      </span>
      <span className="whitespace-nowrap leading-tight">
        <span className={`block text-sm font-bold tracking-tight ${light ? "text-deep-foreground" : "text-foreground"}`}>Gómez Bolaño</span>
        <span className={`block text-[10px] uppercase tracking-[0.2em] ${light ? "text-deep-foreground/70" : "text-muted-foreground"}`}>Clínica médica</span>
      </span>
    </Link>
  );
}

/* Encabezado premium para páginas internas */
export function PageHero({
  kicker,
  title,
  text,
  crumbs,
  children,
}: {
  kicker: string;
  title: ReactNode;
  text?: string;
  crumbs: { label: string; to?: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-deep">
      <div className="absolute inset-0 gradient-deep opacity-90" />
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top_left,#000_25%,transparent_75%)]" />
      <div className="blob -left-20 -top-10 size-72 bg-[var(--clinic)]" />
      <div className="blob -right-10 bottom-0 size-64 bg-[var(--accent)] opacity-25" style={{ animationDelay: "-7s" }} />
      <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-2 h-12 w-full text-sky-300/30" aria-hidden="true">
        <polyline className="ecg-line" points="0,40 260,40 290,40 310,15 330,65 350,40 640,40 670,40 690,8 710,72 730,40 960,40 985,25 1005,55 1025,40 1200,40" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:px-8">
        <div className="[&_a]:text-deep-foreground/70 [&_a:hover]:text-white [&_nav]:text-deep-foreground/60 [&_span.font-medium]:text-white">
          <Crumbs items={crumbs} />
        </div>
        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-deep-foreground">
            <span className="pulse-dot size-1.5 rounded-full bg-emerald-400" /> {kicker}
          </span>
          <h1 className="mt-5 text-4xl leading-[1.08] text-deep-foreground sm:text-5xl lg:text-6xl">{title}</h1>
          {text && <p className="mt-5 max-w-2xl text-lg text-deep-foreground/75">{text}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const activo = (to: string) => (to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/"));

  return (
    <div className="min-h-screen bg-background">
      {/* Barra superior */}
      <div className="hidden bg-deep text-deep-foreground/80 md:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs lg:px-8">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {CLINICA.direccion}</span>
            <span className="hidden items-center gap-1.5 lg:flex"><Clock className="size-3.5" /> {CLINICA.horarios}</span>
          </div>
          <div className="flex items-center gap-5">
            <a href={`tel:${CLINICA.telefono.replace(/\s/g, "")}`} className="flex items-center gap-1.5 transition-colors hover:text-white"><Phone className="size-3.5" /> {CLINICA.telefono}</a>
            <a href={`mailto:${CLINICA.email}`} className="hidden items-center gap-1.5 transition-colors hover:text-white lg:flex"><Mail className="size-3.5" /> {CLINICA.email}</a>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 border-b transition-all duration-300 ${
          scrolled ? "border-border/70 bg-background/80 shadow-[0_10px_30px_-20px_rgba(15,35,80,.35)] backdrop-blur-xl" : "border-transparent bg-background"
        }`}
      >
        <div className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-300 lg:px-8 ${scrolled ? "h-16" : "h-20"}`}>
          <Brand />
          <nav className="hidden items-center gap-0.5 xl:flex">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`group relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activo(l.to) ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {l.label}
                <span className={`absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-gradient-to-r from-[var(--clinic)] to-[var(--accent)] transition-transform duration-300 ${activo(l.to) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" variant="outline" className="hidden rounded-full px-3 lg:inline-flex 2xl:px-4" title="Portal del paciente">
              <Link to="/portal"><UserRound className="size-4" /> <span className="xl:hidden 2xl:inline">Portal del paciente</span></Link>
            </Button>
            <Button asChild size="sm" className="btn-glow hidden rounded-full px-5 sm:inline-flex">
              <Link to="/turnos"><CalendarPlus className="size-4" /> Solicitar turno</Link>
            </Button>
            <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menú">
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
        {open && (
          <div className="border-t border-border bg-background/95 backdrop-blur-xl xl:hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 p-3">
              {LINKS.map((l) => (
                <Link key={l.to} to={l.to} className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium ${activo(l.to) ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                  {l.label} <ArrowRight className="size-4 opacity-40" />
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="rounded-xl"><Link to="/portal"><UserRound className="size-4" /> Mi portal</Link></Button>
                <Button asChild className="rounded-xl"><Link to="/turnos"><CalendarPlus className="size-4" /> Pedir turno</Link></Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="relative mt-24 overflow-hidden bg-deep text-deep-foreground">
        <div className="absolute inset-0 bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,#000,transparent)]" />
        <div className="blob -right-20 -top-20 size-72 bg-[var(--clinic)] opacity-30" />

        <div className="relative mx-auto max-w-7xl px-4 pt-14 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-white/[0.06] p-8 ring-1 ring-white/10 backdrop-blur md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl text-deep-foreground sm:text-3xl">¿Necesitás una consulta?</h3>
              <p className="mt-1 text-deep-foreground/70">Reservá online en minutos o escribinos por WhatsApp.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full !bg-white px-6 text-[var(--deep)] hover:!bg-white/90"><Link to="/turnos"><CalendarPlus className="size-4" /> Solicitar turno</Link></Button>
              <Button asChild size="lg" variant="outline" className="rounded-full !border-white/30 !bg-white/10 px-6 text-deep-foreground hover:!bg-white/20 hover:text-deep-foreground">
                <a href={waLink("Hola, quisiera hacer una consulta.")} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> WhatsApp</a>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 lg:px-8">
          <div className="space-y-4">
            <Brand light />
            <p className="text-sm leading-relaxed text-deep-foreground/70">{CLINICA.claim}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-deep-foreground/60">Navegación</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-deep-foreground/80">
              {LINKS.slice(0, 5).map((l) => (
                <li key={l.to}><Link to={l.to} className="transition-colors hover:text-white">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-deep-foreground/60">Pacientes</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-deep-foreground/80">
              <li><Link to="/turnos" className="hover:text-white">Solicitar turno</Link></li>
              <li><Link to="/portal" className="hover:text-white">Portal del paciente</Link></li>
              <li><Link to="/servicios" className="hover:text-white">Servicios y aranceles</Link></li>
              <li><Link to="/preguntas-frecuentes" className="hover:text-white">Preguntas frecuentes</Link></li>
              <li><Link to="/contacto" className="hover:text-white">Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-deep-foreground/60">Contacto</h3>
            <ul className="mt-4 space-y-3 text-sm text-deep-foreground/80">
              <li className="flex gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-sky-300" />{CLINICA.direccion}</li>
              <li className="flex gap-2.5"><Phone className="mt-0.5 size-4 shrink-0 text-sky-300" />{CLINICA.telefono}</li>
              <li className="flex gap-2.5"><Mail className="mt-0.5 size-4 shrink-0 text-sky-300" />{CLINICA.email}</li>
              <li className="flex gap-2.5"><Clock className="mt-0.5 size-4 shrink-0 text-sky-300" />{CLINICA.horarios}</li>
            </ul>
          </div>
        </div>
        <div className="relative border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-deep-foreground/60 lg:px-8">
            <span>© {new Date().getFullYear()} {CLINICA.nombre}. Todos los derechos reservados.</span>
            <Link to="/login" className="inline-flex items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100">
              <Lock className="size-3" /> Acceso profesionales
            </Link>
          </div>
        </div>
      </footer>

      {/* WhatsApp flotante */}
      <a
        href={waLink("Hola, quisiera hacer una consulta.")}
        target="_blank"
        rel="noreferrer"
        aria-label="Escribir por WhatsApp"
        className="group fixed bottom-6 left-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,.7)] transition-transform hover:scale-110"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
        <MessageCircle className="relative size-6" />
      </a>
      <ScrollTop />
    </div>
  );
}
