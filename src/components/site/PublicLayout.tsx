import { useEffect, useState, type ReactNode, Fragment, isValidElement } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, ArrowRight, CalendarPlus, Clock, Headphones, Lock, Mail, MapPin, Menu, MessageCircle, Music2, Pause, Phone, Play, SkipBack, SkipForward, UserRound, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-provider";
import { ScrollTop } from "./ScrollTop";
import { Crumbs } from "./Crumbs";
import { CLINICA, ESPECIALIDADES, iconoEspecialidad, imagenEspecialidad } from "@/data/clinic";

import logoClinica from "@/assets/logo.png";
import fondoCorazonDoc from "@/assets/fondo-corazon.jpg";
import fondoRinonesDoc from "@/assets/fondo-rinones.jpg";
import { KEY_SITIO, leerDato, resumenHorarioClinica, sitioDe, useDato, type DatosSitio } from "@/lib/auth-local";
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

/** Datos de contacto y música que cargan los administradores en el panel. */
export function useSitio(): DatosSitio {
  const [d] = useDato<Partial<DatosSitio>>(KEY_SITIO, {});
  return sitioDe(d);
}

/* Link de WhatsApp con mensaje armado (usa el número cargado en el panel) */
export function waLink(texto: string) {
  const numero = typeof window === "undefined" ? "" : sitioDe(leerDato<Partial<DatosSitio>>(KEY_SITIO, {})).whatsapp.replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
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
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_8px_20px_-8px_rgba(20,50,120,.7)] ring-1 ring-black/5 transition-transform duration-500 group-hover:rotate-6">
        <img src={logoClinica} alt="" className="size-full object-cover" />
      </span>
      <span className="whitespace-nowrap leading-tight">
        <span className={`block text-sm font-bold tracking-tight ${light ? "text-deep-foreground" : "text-foreground"}`}>HEGO</span>
        <span className={`block text-[10px] uppercase tracking-[0.2em] ${light ? "text-deep-foreground/70" : "text-muted-foreground"}`}>Especialidades médicas</span>
      </span>
    </Link>
  );
}

/* Encabezado premium para páginas internas */
/**
 * Degradé inferior de la foto de cada profesional, con el color e ilustración de su especialidad:
 * corazón (rojo) para el cardiólogo y riñones (azul) para el nefrólogo.
 */
export function FondoDoctor({ foto, suave = false }: { foto: string; suave?: boolean }) {
  const cardio = foto === "alonso";
  return (
    <>
      <img
        src={cardio ? fondoCorazonDoc : fondoRinonesDoc}
        alt=""
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-[38%] w-full object-cover mix-blend-luminosity [mask-image:linear-gradient(to_top,#000_30%,transparent)] ${suave ? "opacity-20" : "opacity-30"}`}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: cardio
            ? `linear-gradient(to top, rgba(76,10,24,${suave ? 0.75 : 0.95}) 0%, rgba(127,29,29,${suave ? 0.35 : 0.55}) 28%, transparent 55%)`
            : `linear-gradient(to top, rgba(8,30,70,${suave ? 0.75 : 0.95}) 0%, rgba(3,105,161,${suave ? 0.35 : 0.55}) 28%, transparent 55%)`,
        }}
      />
    </>
  );
}

/**
 * Fondo sutil con todas las especialidades de la clínica: mosaico de fotos + íconos flotantes.
 * Se arma solo con la lista ESPECIALIDADES, así que crece cuando se agregan nuevas.
 */
export function FondoEspecialidades() {
  const fotos = Array.from(new Set(ESPECIALIDADES.map((e) => imagenEspecialidad(e.slug))));
  const mosaico = [fondoCorazonDoc, fondoRinonesDoc, ...fotos].slice(0, 6);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-y-0 right-0 hidden w-[58%] grid-cols-3 grid-rows-2 gap-3 p-3 opacity-[0.22] mix-blend-luminosity [mask-image:linear-gradient(to_right,transparent,#000_40%)] md:grid">
        {mosaico.map((src, i) => (
          <div key={i} className={`overflow-hidden rounded-2xl ${i % 2 ? "translate-y-6" : "-translate-y-4"}`}>
            <img src={src} alt="" className="hero-kenburns size-full object-cover" style={{ animationDelay: `${-i * 2.5}s` }} />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-deep via-deep/70 via-40% to-deep/10" />
      <div className="absolute inset-y-0 right-0 hidden w-[38%] lg:block">
        {ESPECIALIDADES.map((e, i) => {
          const Icono = iconoEspecialidad(e.icono);
          const col = i % 3;
          const fila = Math.floor(i / 3);
          return (
            <span
              key={e.slug}
              className="animate-hero-float absolute inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium text-white/40 ring-1 ring-white/[0.08]"
              style={{ left: `${2 + col * 29 + (fila % 2) * 3}%`, top: `${9 + fila * 17}%`, animationDelay: `${i * 0.45}s` }}
            >
              <Icono className="size-3.5" /> {e.nombre}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** Título que entra palabra por palabra (mismo efecto que el inicio). */
export function TituloAnimado({ children, inicio = 0.15 }: { children: ReactNode; inicio?: number }) {
  let n = 0;
  const palabra = (contenido: ReactNode, key: string | number) => (
    <span key={key} className="hero-word mr-[0.25em] inline-block last:mr-0" style={{ animationDelay: `${inicio + n++ * 0.1}s` }}>
      {contenido}
    </span>
  );
  const recorrer = (nodo: ReactNode): ReactNode[] => {
    if (typeof nodo === "string") return nodo.split(/\s+/).filter(Boolean).map((w) => palabra(w, `${n}-${w}`));
    if (Array.isArray(nodo)) return nodo.flatMap(recorrer);
    if (isValidElement(nodo) && nodo.type === Fragment) return recorrer((nodo.props as { children?: ReactNode }).children);
    if (nodo === null || nodo === undefined || typeof nodo === "boolean") return [];
    return [palabra(nodo, `el-${n}`)];
  };
  return <>{recorrer(children)}</>;
}

/** Colores de acento por profesional: cardiología (rojo) y nefrología (azul). */
export function acentoDoctor(foto: string) {
  return foto === "alonso"
    ? { c: "#e11d48", suave: "rgba(225,29,72,.07)", borde: "rgba(225,29,72,.18)", img: fondoCorazonDoc }
    : { c: "#0284c7", suave: "rgba(2,132,199,.07)", borde: "rgba(2,132,199,.18)", img: fondoRinonesDoc };
}

/** Fondo muy sutil del área de información del profesional (corazón o riñones). */
export function FondoInfo({ foto }: { foto: string }) {
  const a = acentoDoctor(foto);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <div className="absolute inset-0" style={{ background: `radial-gradient(900px 500px at 100% 0%, ${a.suave}, transparent 70%), radial-gradient(700px 400px at 0% 100%, ${a.suave}, transparent 70%)` }} />
      <img
        src={a.img}
        alt=""
        className="absolute -right-10 top-1/2 h-[115%] max-w-none -translate-y-1/2 opacity-[0.06] mix-blend-multiply grayscale-[30%] dark:opacity-[0.08] dark:mix-blend-screen [mask-image:radial-gradient(closest-side,#000_55%,transparent)]"
      />
    </div>
  );
}

/** Línea de tiempo de formación: separa "Título — Institución". */
export function Curriculum({ items, color, grande = false }: { items: string[]; color: string; grande?: boolean }) {
  return (
    <ol className="relative space-y-4">
      <span className="absolute bottom-3 left-[13px] top-3 w-px" style={{ background: `linear-gradient(${color}, transparent)` }} />
      {items.map((f, i) => {
        const [titulo, ...resto] = f.split(" — ");
        const lugar = resto.join(" — ");
        return (
          <li key={f} className="group/cv relative flex gap-4">
            <span
              className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ring-4 ring-card transition-transform duration-300 group-hover/cv:scale-110"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 8px 18px -8px ${color}` }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={`font-semibold leading-snug text-foreground ${grande ? "text-[15px]" : "text-sm"}`}>{titulo}</p>
              {lugar && <p className={`mt-0.5 leading-relaxed text-muted-foreground ${grande ? "text-sm" : "text-[13px]"}`}>{lugar}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function PageHero({
  kicker,
  title,
  text,
  crumbs,
  children,
  fondo,
  decoracion,
}: {
  fondo?: string | undefined;
  /** Capa decorativa de fondo (sutil) detrás del texto. */
  decoracion?: ReactNode;
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
      {fondo && (
        <img
          src={fondo}
          alt=""
          aria-hidden="true"
          className="hero-kenburns pointer-events-none absolute inset-y-0 right-0 h-full w-full object-cover opacity-30 mix-blend-luminosity sm:w-[70%] sm:opacity-40 lg:w-[55%] [mask-image:linear-gradient(to_right,transparent,#000_45%,#000_80%,transparent)]"
        />
      )}
      {fondo && <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-deep via-deep/60 to-transparent" />}
      {decoracion}
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
          <h1 className="mt-5 text-4xl leading-[1.08] text-deep-foreground sm:text-5xl lg:text-6xl"><TituloAnimado>{title}</TituloAnimado></h1>
          {text && <p className="mt-5 max-w-2xl text-lg text-deep-foreground/75">{text}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const sitio = useSitio();
  const horario = resumenHorarioClinica(sitio);
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
    <div className="public-bg min-h-screen">
      {/* Barra superior */}
      {(sitio.direccion || horario || sitio.telefono || sitio.email) && (
      <div className="hidden bg-deep text-deep-foreground/80 md:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs lg:px-8">
          <div className="flex items-center gap-5">
            {sitio.direccion && <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {sitio.direccion}</span>}
            {horario && <span className="hidden items-center gap-1.5 lg:flex"><Clock className="size-3.5" /> {horario}</span>}
          </div>
          <div className="flex items-center gap-5">
            {sitio.telefono && <a href={`tel:${sitio.telefono.replace(/\s/g, "")}`} className="flex items-center gap-1.5 transition-colors hover:text-white"><Phone className="size-3.5" /> {sitio.telefono}</a>}
            {sitio.email && <a href={`mailto:${sitio.email}`} className="hidden items-center gap-1.5 transition-colors hover:text-white lg:flex"><Mail className="size-3.5" /> {sitio.email}</a>}
          </div>
        </div>
      </div>
      )}

      <header
        className={`sticky top-0 z-40 border-b transition-all duration-300 ${
          scrolled ? "border-border/70 bg-background/75 shadow-[0_10px_30px_-20px_rgba(15,35,80,.35)] backdrop-blur-xl" : "border-transparent bg-background/40 backdrop-blur-md"
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

      <Reproductor />

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

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
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
              <li><Link to="/servicios" className="hover:text-white">Servicios y estudios</Link></li>
              <li><Link to="/preguntas-frecuentes" className="hover:text-white">Preguntas frecuentes</Link></li>
              <li><Link to="/contacto" className="hover:text-white">Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-deep-foreground/60">Contacto</h3>
            <ul className="mt-4 space-y-3 text-sm text-deep-foreground/80">
              {sitio.direccion && <li className="flex gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-sky-300" />{sitio.direccion}</li>}
              {sitio.telefono && <li className="flex gap-2.5"><Phone className="mt-0.5 size-4 shrink-0 text-sky-300" />{sitio.telefono}</li>}
              {sitio.email && <li className="flex gap-2.5"><Mail className="mt-0.5 size-4 shrink-0 text-sky-300" />{sitio.email}</li>}
              {horario && <li className="flex gap-2.5"><Clock className="mt-0.5 size-4 shrink-0 text-sky-300" />{horario}</li>}
              {!sitio.direccion && !sitio.telefono && !sitio.email && !horario && <li className="text-deep-foreground/55">Datos de contacto próximamente.</li>}
            </ul>
          </div>
        </div>
        <div className="relative border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 pb-24 pt-5 text-xs text-deep-foreground/60 lg:px-8 lg:pl-24">
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
      <MiniReproductor />
      <ScrollTop />
    </div>
  );
}

/* ===================================================================== */
/* Música de espera                                                        */
/* Las pistas las cargan los administradores en Panel → Sitio web.         */
/* Mientras tanto se pueden usar pistas de ejemplo generadas en vivo       */
/* con el navegador (Web Audio): son originales y sin derechos de autor.   */
/* ===================================================================== */

type TemaGenerado = { tipo: "generado"; id: string; nombre: string; sub: string; bpm: number; acordes: number[][]; color: string };
type TemaAudio = { tipo: "audio"; id: string; nombre: string; sub: string; url: string; color: string };
type Tema = TemaGenerado | TemaAudio;

const TEMAS_EJEMPLO: TemaGenerado[] = [
  { tipo: "generado", id: "ej-1", nombre: "Calma", sub: "Piano y pads suaves", bpm: 62, color: "from-sky-400 to-indigo-600", acordes: [[48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 53, 59]] },
  { tipo: "generado", id: "ej-2", nombre: "Amanecer", sub: "Luminoso y sereno", bpm: 70, color: "from-amber-300 to-rose-500", acordes: [[50, 57, 61, 66], [47, 54, 57, 62], [43, 50, 54, 59], [45, 52, 57, 61]] },
  { tipo: "generado", id: "ej-3", nombre: "Respirar", sub: "Lento, para relajarse", bpm: 54, color: "from-emerald-300 to-teal-600", acordes: [[45, 52, 55, 59, 60], [41, 48, 52, 55], [48, 55, 59, 62], [43, 50, 55, 59]] },
  { tipo: "generado", id: "ej-4", nombre: "Horizonte", sub: "Cálido y envolvente", bpm: 66, color: "from-violet-400 to-fuchsia-600", acordes: [[51, 58, 62, 67], [48, 55, 58, 63], [44, 51, 55, 60], [46, 53, 58, 62]] },
];

/** Lista que se escucha en la web según lo configurado en el panel. */
function listaMusica(sitio: DatosSitio): Tema[] {
  if (!sitio.musicaActiva) return [];
  const propias: Tema[] = sitio.pistas.filter((p) => p.url).map((p) => ({ tipo: "audio", ...p }));
  return [...propias, ...(sitio.musicaEjemplo ? TEMAS_EJEMPLO : [])];
}

const midiAHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

type EstadoMusica = { sonando: boolean; tema: number; volumen: number; lista: Tema[] };

const motor = (() => {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let timer: number | null = null;
  let audio: HTMLAudioElement | null = null;
  let fade: number | null = null;
  let paso = 0;
  let proximo = 0;
  const estado: EstadoMusica = { sonando: false, tema: 0, volumen: 0.6, lista: [] };
  const subs = new Set<() => void>();
  const avisar = () => subs.forEach((f) => f());
  const actual = () => estado.lista[estado.tema];

  const crear = () => {
    if (ctx) return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    const largo = ctx.sampleRate * 3.5;
    const imp = ctx.createBuffer(2, largo, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = imp.getChannelData(c);
      for (let i = 0; i < largo; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / largo, 2.6);
    }
    const reverb = ctx.createConvolver();
    reverb.buffer = imp;
    const humedo = ctx.createGain();
    humedo.gain.value = 0.55;
    const filtro = ctx.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.frequency.value = 4200;
    master.connect(filtro);
    filtro.connect(ctx.destination);
    filtro.connect(reverb);
    reverb.connect(humedo);
    humedo.connect(ctx.destination);
  };

  const nota = (hz: number, t: number, dur: number, vol: number, tipo: OscillatorType, ataque: number) => {
    if (!ctx || !master) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = tipo;
    o.frequency.value = hz;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + dur + 0.1);
  };

  const programar = () => {
    const tema = actual();
    if (!ctx || !tema || tema.tipo !== "generado") return;
    const corchea = 60 / tema.bpm / 2;
    while (proximo < ctx.currentTime + 0.4) {
      const compas = Math.floor(paso / 16);
      const acorde = tema.acordes[compas % tema.acordes.length]!;
      const p = paso % 16;
      if (p === 0) {
        acorde.forEach((m, i) => {
          nota(midiAHz(m + 12), proximo, corchea * 17, 0.035, "sine", 1.6);
          nota(midiAHz(m + 12) * 1.004, proximo, corchea * 17, 0.02, "triangle", 2.0 + i * 0.1);
        });
        nota(midiAHz(acorde[0]! - 12), proximo, corchea * 16, 0.07, "sine", 0.8);
      }
      if (p % 2 === 0 && Math.random() > 0.18) {
        const idx = [0, 2, 1, 3, 2, 4, 3, 1][(p / 2) % 8]! % acorde.length;
        const alt = Math.random() > 0.7 ? 24 : 12;
        const m = acorde[idx]! + alt;
        const vel = 0.05 + Math.random() * 0.035;
        nota(midiAHz(m), proximo, corchea * 6, vel, "triangle", 0.01);
        nota(midiAHz(m) * 2, proximo, corchea * 3, vel * 0.25, "sine", 0.01);
      }
      if (p === 10 && Math.random() > 0.5) nota(midiAHz(acorde[acorde.length - 1]! + 24), proximo, corchea * 8, 0.025, "sine", 0.3);
      proximo += corchea;
      paso++;
    }
  };

  const fundido = (destino: number, seg: number) => {
    if (ctx && master) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(destino, ctx.currentTime + seg);
    }
  };
  const fundidoAudio = (destino: number, seg: number, alTerminar?: () => void) => {
    if (!audio) return alTerminar?.();
    if (fade) window.clearInterval(fade);
    const a = audio;
    const ini = a.volume;
    const pasos = Math.max(1, Math.round(seg * 20));
    let k = 0;
    fade = window.setInterval(() => {
      k++;
      a.volume = Math.min(1, Math.max(0, ini + ((destino - ini) * k) / pasos));
      if (k >= pasos) {
        if (fade) window.clearInterval(fade);
        fade = null;
        alTerminar?.();
      }
    }, 50);
  };

  const detenerTodo = () => {
    fundido(0, 0.4);
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    if (audio) {
      const a = audio;
      audio = null;
      fundidoAudio(0, 0.3, () => a.pause());
      a.pause();
    }
  };

  const arrancar = async () => {
    const tema = actual();
    if (!tema) return;
    if (tema.tipo === "audio") {
      fundido(0, 0.4);
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      if (!audio || audio.src !== tema.url) {
        audio?.pause();
        audio = new Audio(tema.url);
        audio.loop = true;
        audio.volume = 0;
      }
      try {
        await audio.play();
      } catch {
        estado.sonando = false;
        avisar();
        return;
      }
      fundidoAudio(estado.volumen, 1.5);
    } else {
      audio?.pause();
      audio = null;
      crear();
      if (!ctx) return;
      await ctx.resume();
      if (!timer) {
        paso = 0;
        proximo = ctx.currentTime + 0.1;
        timer = window.setInterval(programar, 100);
      }
      fundido(estado.volumen * 0.9, 2);
    }
    estado.sonando = true;
    avisar();
  };

  return {
    estado,
    suscribir(f: () => void) {
      subs.add(f);
      return () => {
        subs.delete(f);
      };
    },
    fijarLista(lista: Tema[]) {
      const firma = (l: Tema[]) => l.map((t) => t.id + (t.tipo === "audio" ? t.url.length : "")).join("|");
      if (firma(lista) === firma(estado.lista)) return;
      const antes = actual()?.id;
      estado.lista = lista;
      const idx = lista.findIndex((t) => t.id === antes);
      if (idx >= 0) estado.tema = idx;
      else {
        estado.tema = 0;
        if (estado.sonando) {
          detenerTodo();
          estado.sonando = false;
        }
      }
      avisar();
    },
    play: arrancar,
    pausa() {
      fundido(0, 0.8);
      window.setTimeout(() => {
        if (!estado.sonando && timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }, 900);
      if (audio) {
        const a = audio;
        fundidoAudio(0, 0.6, () => {
          if (!estado.sonando) a.pause();
        });
      }
      estado.sonando = false;
      avisar();
    },
    elegir(i: number) {
      if (!estado.lista.length) return;
      const nuevo = (i + estado.lista.length) % estado.lista.length;
      const cambia = nuevo !== estado.tema;
      if (cambia) {
        detenerTodo();
        estado.tema = nuevo;
        paso = 0;
      }
      avisar();
      void arrancar();
    },
    volumen(v: number) {
      estado.volumen = v;
      if (estado.sonando) {
        fundido(v * 0.9, 0.2);
        if (audio) audio.volume = v;
      }
      avisar();
    },
  };
})();

function useMusica() {
  const sitio = useSitio();
  const [, setN] = useState(0);
  useEffect(() => motor.suscribir(() => setN((n) => n + 1)), []);
  const lista = listaMusica(sitio);
  useEffect(() => motor.fijarLista(lista));
  return { ...motor.estado, lista: motor.estado.lista.length ? motor.estado.lista : lista };
}

/** Botón flotante chico: aparece cuando la música está sonando, en todas las páginas. */
function MiniReproductor() {
  const e = useMusica();
  const t = e.lista[e.tema];
  if (!e.sonando || !t) return null;
  return (
    <button
      onClick={() => motor.pausa()}
      className="fixed bottom-24 left-6 z-50 flex items-center gap-2.5 rounded-full border border-white/20 bg-deep/90 py-2 pl-2 pr-4 text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-500"
      aria-label="Pausar música"
    >
      <span className={`flex size-8 items-center justify-center rounded-full bg-gradient-to-br ${t.color}`}><Pause className="size-3.5" /></span>
      <span className="flex h-4 items-end gap-0.5">{[0, 1, 2, 3].map((i) => <span key={i} className="eq-bar w-0.5 rounded-full bg-white" style={{ height: "100%", animationDelay: `${i * 0.15}s` }} />)}</span>
      <span className="text-xs font-semibold">{t.nombre}</span>
    </button>
  );
}

/** Reproductor premium al final de cada página (se oculta si en el panel no hay música). */
export function Reproductor() {
  const e = useMusica();
  const t = e.lista[e.tema];
  if (!t) return null;
  const barras = 56;
  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-20 lg:px-8">
      {/* Borde degradé */}
      <div className={`relative rounded-[2.4rem] bg-gradient-to-br ${t.color} p-px shadow-[0_50px_100px_-50px_rgba(10,20,60,.95)] transition-all duration-1000`}>
        <div className="relative overflow-hidden rounded-[calc(2.4rem-1px)] bg-[oklch(0.15_0.04_262)] text-white">
          {/* Ambiente */}
          <div className={`pointer-events-none absolute -left-32 -top-32 size-[28rem] rounded-full bg-gradient-to-br ${t.color} opacity-30 blur-[100px] transition-all duration-1000`} />
          <div className={`pointer-events-none absolute -bottom-40 right-10 size-[26rem] rounded-full bg-gradient-to-br ${t.color} opacity-20 blur-[110px] transition-all duration-1000`} />
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_30%_40%,#000_10%,transparent_70%)]" />

          <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14 lg:p-12">
            {/* Reproduciendo */}
            <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
              {/* Arte de tapa */}
              <div className="relative mx-auto size-56 sm:size-60">
                <div className={`absolute -inset-4 rounded-[2.2rem] bg-gradient-to-br ${t.color} opacity-40 blur-2xl transition-all duration-1000 ${e.sonando ? "animate-pulse" : ""}`} />
                <div className={`relative size-full overflow-hidden rounded-[2rem] bg-gradient-to-br ${t.color} shadow-2xl ring-1 ring-white/25 transition-all duration-1000`}>
                  <div className={`absolute -inset-1/2 bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,.35),transparent_40%)] ${e.sonando ? "spin-slow" : "opacity-40"}`} />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.45),transparent_45%)]" />
                  {[0.9, 0.7, 0.5].map((k) => (
                    <span key={k} className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" style={{ width: `${k * 100}%`, height: `${k * 100}%` }} />
                  ))}
                  <span className="absolute left-1/2 top-[42%] flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/40 backdrop-blur-md">
                    <Music2 className="size-7" />
                  </span>
                  {/* Visualizador */}
                  <div className="absolute inset-x-4 bottom-4 flex h-12 items-end justify-between gap-[3px]" aria-hidden="true">
                    {Array.from({ length: 22 }, (_, i) => (
                      <span
                        key={i}
                        className={`w-full rounded-full bg-white/85 ${e.sonando ? "eq-bar" : ""}`}
                        style={{ height: e.sonando ? "100%" : `${18 + ((i * 37) % 50)}%`, animationDelay: `${(i % 7) * 0.11}s`, animationDuration: `${0.7 + (i % 5) * 0.18}s`, opacity: e.sonando ? 0.9 : 0.45 }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 ring-1 ring-white/15">
                  <span className={`size-1.5 rounded-full ${e.sonando ? "bg-emerald-400 pulse-dot" : "bg-white/50"}`} />
                  {e.sonando ? "Sonando ahora" : "Música para tu espera"}
                </span>
                <h2 key={t.id} className="mt-4 truncate text-4xl text-white animate-in fade-in slide-in-from-bottom-2 duration-500 sm:text-5xl">{t.nombre}</h2>
                <p className="mt-1.5 text-white/60">{t.sub}</p>

                {/* Onda */}
                <div className="mt-6 flex h-10 items-center gap-[3px]" aria-hidden="true">
                  {Array.from({ length: barras }, (_, i) => {
                    const h = 18 + Math.abs(Math.sin(i * 0.55) * 60) + ((i * 13) % 22);
                    return (
                      <span
                        key={i}
                        className={`w-full rounded-full transition-colors duration-700 ${e.sonando ? "bg-gradient-to-t " + t.color : "bg-white/20"}`}
                        style={{ height: `${Math.min(100, h)}%`, animation: e.sonando ? `eq 1.${(i % 9) + 1}s ease-in-out ${(i % 6) * 0.08}s infinite` : undefined }}
                      />
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button onClick={() => motor.elegir(e.tema - 1)} aria-label="Anterior" className="flex size-12 items-center justify-center rounded-full bg-white/[0.08] ring-1 ring-white/15 transition-all hover:bg-white/15 hover:ring-white/30"><SkipBack className="size-4" /></button>
                  <button
                    onClick={() => (e.sonando ? motor.pausa() : void motor.play())}
                    aria-label={e.sonando ? "Pausar" : "Reproducir"}
                    className="relative flex size-[4.5rem] items-center justify-center rounded-full bg-white text-[oklch(0.2_0.06_262)] shadow-[0_20px_45px_-12px_rgba(255,255,255,.45)] transition-transform hover:scale-105 active:scale-95"
                  >
                    {e.sonando && <span className="absolute inset-0 animate-ping rounded-full bg-white/30" />}
                    {e.sonando ? <Pause className="relative size-7" /> : <Play className="relative ml-1 size-7" />}
                  </button>
                  <button onClick={() => motor.elegir(e.tema + 1)} aria-label="Siguiente" className="flex size-12 items-center justify-center rounded-full bg-white/[0.08] ring-1 ring-white/15 transition-all hover:bg-white/15 hover:ring-white/30"><SkipForward className="size-4" /></button>
                  <label className="ml-auto flex w-full items-center gap-3 rounded-full bg-white/[0.06] px-4 py-2.5 text-white/70 ring-1 ring-white/10 sm:w-48">
                    <Volume2 className="size-4 shrink-0" />
                    <input type="range" min={0} max={1} step={0.01} value={e.volumen} onChange={(ev) => motor.volumen(Number(ev.target.value))} className="h-1 w-full cursor-pointer accent-white" aria-label="Volumen" />
                  </label>
                </div>
              </div>
            </div>

            {/* Lista */}
            <div className="rounded-[1.75rem] bg-white/[0.04] p-3 ring-1 ring-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between px-3 pb-2 pt-1">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50"><Headphones className="size-3.5" /> Lista</p>
                <span className="text-xs text-white/40">{e.lista.length} {e.lista.length === 1 ? "tema" : "temas"}</span>
              </div>
              <ol className="max-h-80 space-y-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
                {e.lista.map((x, i) => {
                  const on = i === e.tema;
                  return (
                    <li key={x.id}>
                      <button
                        onClick={() => (on && e.sonando ? motor.pausa() : motor.elegir(i))}
                        className={`group flex w-full items-center gap-3.5 rounded-2xl p-2.5 text-left transition-all duration-300 ${on ? "bg-white/[0.12] shadow-lg ring-1 ring-white/20" : "hover:bg-white/[0.06]"}`}
                      >
                        <span className={`relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${x.color} shadow-md`}>
                          <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.4),transparent_55%)]" />
                          {on && e.sonando ? (
                            <span className="relative flex h-4 items-end gap-0.5">{[0, 1, 2].map((k) => <span key={k} className="eq-bar w-0.5 rounded-full bg-white" style={{ height: "100%", animationDelay: `${k * 0.2}s` }} />)}</span>
                          ) : (
                            <Play className="relative ml-0.5 size-4 transition-transform group-hover:scale-110" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate font-semibold ${on ? "text-white" : "text-white/85"}`}>{x.nombre}</span>
                          <span className="block truncate text-xs text-white/50">{x.sub}</span>
                        </span>
                        <span className="text-xs tabular-nums text-white/35">{String(i + 1).padStart(2, "0")}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
