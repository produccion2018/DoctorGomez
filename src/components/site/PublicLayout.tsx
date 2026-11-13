import { useEffect, useState, type ReactNode, Fragment, isValidElement } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, ArrowRight, CalendarPlus, Clock, Headphones, Lock, Mail, MapPin, Menu, MessageCircle, Music2, Pause, Phone, Play, SkipBack, SkipForward, UserRound, Volume2, X, Download, Share, SquarePlus } from "lucide-react";
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

/** Trazo de un latido (P, QRS, T) de 200 de ancho, línea base en y=50. */
function latido(x: number) {
  const X = (n: number) => (x + n).toFixed(1);
  return `L${X(28)},50 C${X(33)},50 ${X(36)},38 ${X(42)},38 C${X(48)},38 ${X(51)},50 ${X(56)},50 L${X(66)},50 L${X(70)},57 L${X(78)},4 L${X(86)},82 L${X(91)},50 L${X(106)},50 C${X(114)},50 ${X(118)},30 ${X(130)},30 C${X(142)},30 ${X(146)},50 ${X(154)},50 L${X(200)},50`;
}

/**
 * Electrocardiograma propio (dibujado en SVG): línea azul brillante sobre cuadrícula,
 * con un barrido luminoso que recorre el trazo como en un monitor.
 */
export function Electro({ latidos = 4, className = "", grilla = true, color = "#38bdf8" }: { latidos?: number; className?: string; grilla?: boolean; color?: string }) {
  const ancho = latidos * 200;
  const d = `M0,50 ${Array.from({ length: latidos }, (_, i) => latido(i * 200)).join(" ")}`;
  const id = `ecg-${latidos}-${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${ancho} 100`} preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <filter id={`${id}-glow`} x="-5%" y="-40%" width="110%" height="180%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {grilla && (
          <pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke={color} strokeOpacity="0.12" strokeWidth="0.6" />
          </pattern>
        )}
      </defs>
      {grilla && <rect width={ancho} height="100" fill={`url(#${id}-grid)`} />}
      {/* trazo tenue */}
      <path d={d} fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {/* barrido brillante */}
      <path className="electro-barrido" pathLength={1000} d={d} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" filter={`url(#${id}-glow)`} />
    </svg>
  );
}

/* ===================================================================== */
/* Visual animado de cada especialidad (reemplaza las imágenes fijas)      */
/* ===================================================================== */

const VISUAL: Record<string, { c: string; c2: string; motivo: string; foto?: string }> = {
  "medicina-interna": { c: "#10b981", c2: "#065f46", motivo: "interna" },
  cardiologia: { c: "#ef4444", c2: "#7f1d1d", motivo: "corazon", foto: "foto" },
  nefrologia: { c: "#0ea5e9", c2: "#0c4a6e", motivo: "flujo", foto: "foto" },
  "cardiologia-critica": { c: "#f43f5e", c2: "#7f1d1d", motivo: "monitor" },
  ecocardiografia: { c: "#a78bfa", c2: "#4c1d95", motivo: "eco" },
  "hipertension-arterial": { c: "#fb923c", c2: "#7c2d12", motivo: "presion" },
  "diabetes-metabolismo": { c: "#2dd4bf", c2: "#134e4a", motivo: "glucosa" },
  "holter-mapa": { c: "#f472b6", c2: "#831843", motivo: "holter" },
  "diagnostico-por-imagenes": { c: "#22d3ee", c2: "#164e63", motivo: "scan" },
  laboratorio: { c: "#34d399", c2: "#064e3b", motivo: "lab" },
  "chequeos-preventivos": { c: "#38bdf8", c2: "#0c4a6e", motivo: "check" },
  "medicina-deporte": { c: "#a3e635", c2: "#365314", motivo: "deporte" },
  teleconsulta: { c: "#818cf8", c2: "#312e81", motivo: "video" },
};

function Motivo({ m, c }: { m: string; c: string }) {

  switch (m) {
    case "monitor":
    case "deporte":
      return <Electro latidos={m === "deporte" ? 5 : 3} color={c} className="size-full" />;
    case "holter":
      return (
        <svg viewBox="0 0 600 300" className="size-full">
          <rect x="190" y="30" width="220" height="240" rx="56" fill="#ffffff10" stroke="#ffffff40" strokeWidth="2" />
          <rect x="215" y="70" width="170" height="120" rx="20" fill={`${c}22`} />
          <foreignObject x="220" y="85" width="160" height="90"><Electro latidos={2} grilla={false} color={c} className="size-full" /></foreignObject>
          <text className="vz-num" x="300" y="232" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="800" fontFamily="Inter,Arial">24 h</text>
        </svg>
      );
    case "eco":
      return (
        <svg viewBox="0 0 600 300" className="size-full">
          <path d="M300 20 L120 280 Q300 330 480 280 Z" fill={`${c}18`} stroke={`${c}55`} strokeWidth="2" />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} className="vz-onda" style={{ animationDelay: `${i * 0.6}s` }} d="M170 240 Q300 300 430 240" fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" />
          ))}
          <ellipse className="vz-latido" cx="300" cy="170" rx="46" ry="38" fill={`${c}55`} stroke="#fff" strokeOpacity=".6" strokeWidth="2" />
        </svg>
      );
    case "presion":
      return (
        <svg viewBox="0 0 600 300" className="size-full">
          <path d="M150 250 A150 150 0 0 1 450 250" fill="none" stroke="#ffffff22" strokeWidth="26" strokeLinecap="round" />
          <path className="vz-arco" d="M150 250 A150 150 0 0 1 450 250" fill="none" stroke={c} strokeWidth="26" strokeLinecap="round" pathLength={100} />
          <g className="vz-aguja" style={{ transformOrigin: "300px 250px" }}>
            <line x1="300" y1="250" x2="300" y2="135" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
          </g>
          <circle cx="300" cy="250" r="14" fill="#fff" />
          <text x="300" y="60" textAnchor="middle" fill="#fff" fontSize="40" fontWeight="800" fontFamily="Inter,Arial">120/80</text>
        </svg>
      );
    case "glucosa":
      return (
        <svg viewBox="0 0 600 300" className="size-full">
          <rect x="210" y="20" width="180" height="260" rx="36" fill="#ffffff12" stroke="#ffffff55" strokeWidth="2" />
          <rect x="232" y="48" width="136" height="90" rx="14" fill={`${c}40`} />
          <text className="vz-num" x="300" y="112" textAnchor="middle" fill="#fff" fontSize="46" fontWeight="800" fontFamily="Inter,Arial">98</text>
          <text x="300" y="166" textAnchor="middle" fill="#ffffffaa" fontSize="18" fontWeight="600" fontFamily="Inter,Arial">mg/dL</text>
          <path className="vz-gota" d="M300 190 C 286 210 282 220 282 230 a18 18 0 0 0 36 0 C 318 220 314 210 300 190 Z" fill={c} />
        </svg>
      );
    case "scan":
      return (
        <svg viewBox="0 0 600 300" className="size-full">
          <rect x="160" y="20" width="280" height="260" rx="26" fill="none" stroke="#ffffff33" strokeWidth="2" />
          <ellipse cx="300" cy="150" rx="95" ry="90" fill={`${c}20`} stroke={c} strokeWidth="3" />
          <ellipse cx="300" cy="150" rx="55" ry="50" fill="none" stroke={c} strokeOpacity=".6" strokeWidth="2" />
          <g className="vz-barrido">
            <rect x="170" y="0" width="260" height="34" fill={`${c}33`} />
            <line x1="170" y1="34" x2="430" y2="34" stroke="#fff" strokeWidth="3" />
          </g>
          <path d="M160 60 v-40 h40 M440 60 v-40 h-40 M160 240 v40 h40 M440 240 v40 h-40" fill="none" stroke="#fff" strokeWidth="5" />
        </svg>
      );
    case "lab":
      return (
        <svg viewBox="0 0 600 300" className="size-full">
          {[0, 1, 2, 3, 4].map((i) => {
            const x = 145 + i * 68;
            const col = i % 2 ? "#38bdf8" : c;
            return (
              <g key={i}>
                <rect x={x} y="30" width="42" height="240" rx="21" fill="#ffffff12" stroke="#ffffff55" strokeWidth="2" />
                <clipPath id={`tubo-${i}`}><rect x={x + 4} y="34" width="34" height="232" rx="17" /></clipPath>
                <g clipPath={`url(#tubo-${i})`}>
                  <rect className="vz-liquido" style={{ animationDelay: `${i * 0.5}s` }} x={x + 4} y="34" width="34" height="232" fill={col} fillOpacity=".8" />
                  {[0, 1, 2].map((k) => (
                    <circle key={k} className="vz-burbuja" style={{ animationDelay: `${i * 0.4 + k * 0.9}s` }} cx={x + 12 + k * 9} cy="262" r="4" fill="#fff" fillOpacity=".7" />
                  ))}
                </g>
              </g>
            );
          })}
        </svg>
      );
    case "check":
    case "interna":
      return (
        <svg viewBox="0 0 600 300" className="size-full">
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x="160" y={40 + i * 58} width="40" height="40" rx="11" fill={`${c}30`} stroke={c} strokeWidth="2" />
              <path className="vz-tilde" style={{ animationDelay: `${i * 0.7}s` }} d={`M170 ${60 + i * 58} l9 9 l15 -18`} fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
              <rect className="vz-renglon" style={{ animationDelay: `${i * 0.7}s` }} x="220" y={52 + i * 58} width={240 - i * 30} height="16" rx="8" fill="#ffffff55" />
            </g>
          ))}
        </svg>
      );
    case "video":
      return (
        <svg viewBox="0 0 600 300" className="size-full">
          <rect x="120" y="20" width="360" height="260" rx="24" fill="#ffffff12" stroke="#ffffff45" strokeWidth="2" />
          <circle cx="300" cy="120" r="46" fill={`${c}aa`} />
          <path d="M220 260 q80 -96 160 0" fill={`${c}aa`} />
          <rect x="390" y="180" width="72" height="80" rx="12" fill="#ffffff30" stroke="#fff" strokeOpacity=".5" />
          <circle className="vz-rec" cx="148" cy="46" r="8" fill="#ef4444" />
          <g transform="translate(150 230)">
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} className="vz-voz" style={{ animationDelay: `${i * 0.12}s` }} x={i * 12} y="-30" width="7" height="30" rx="3" fill="#fff" />
            ))}
          </g>
        </svg>
      );
    default:
      return <Electro latidos={3} color={c} className="size-full" />;
  }
}

/**
 * Imagen animada de una especialidad: ilustración en movimiento, o foto real con una capa
 * animada (electro sobre Cardiología, flujo renal sobre Nefrología).
 */
export function VisualEspecialidad({ slug, foto, className = "", sinIcono = false }: { slug: string; foto?: string; className?: string; sinIcono?: boolean }) {
  const v = VISUAL[slug] ?? { c: "#3b82f6", c2: "#1e3a8a", motivo: "monitor" };
  const esp = ESPECIALIDADES.find((e) => e.slug === slug);
  const Icono = iconoEspecialidad(esp?.icono ?? "");
  if (v.foto && foto) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <img src={foto} alt={esp?.nombre ?? ""} className="hero-kenburns absolute inset-0 size-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: `linear-gradient(to top, ${v.c2}cc, transparent)` }} />
        {v.motivo === "corazon" ? (
          <Electro latidos={4} grilla={false} color="#fb7185" className="absolute inset-x-0 bottom-[18%] h-24 w-full" />
        ) : (
          <svg viewBox="0 0 800 100" preserveAspectRatio="none" className="absolute inset-x-0 bottom-[18%] h-24 w-full">
            {[0, 1, 2].map((k) => {
              const d = `M0 ${50 + k * 8} ` + Array.from({ length: 8 }, (_, i) => `C ${i * 100 + 25} ${30 + k * 8}, ${i * 100 + 75} ${70 + k * 8}, ${(i + 1) * 100} ${50 + k * 8}`).join(" ");
              return (
                <g key={k}>
                  <path d={d} fill="none" stroke="#7dd3fc" strokeOpacity={0.3} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  <path className="electro-barrido" pathLength={1000} style={{ animationDelay: `${-k * 1.4}s`, animationDuration: `${5 + k}s` }} d={d} fill="none" stroke="#bae6fd" strokeWidth={3 - k * 0.6} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                </g>
              );
            })}
          </svg>
        )}
      </div>
    );
  }
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} style={{ background: `radial-gradient(70% 70% at 70% 45%, ${v.c2}, transparent 70%), linear-gradient(135deg, #06122b, #0a1f4a 60%, #06122b)` }}>
      <div className="absolute inset-0 [background-image:linear-gradient(#ffffff0a_1px,transparent_1px),linear-gradient(90deg,#ffffff0a_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_65%_50%,#000_30%,transparent_75%)]" />
      <div className="vz-orbe absolute right-[18%] top-[22%] size-64 rounded-full opacity-40 blur-3xl" style={{ background: v.c }} />
      {/* Tarjeta de vidrio con el motivo animado */}
      <div className="absolute right-[6%] top-1/2 aspect-[2/1] w-[62%] -translate-y-[58%] rotate-[-3deg] rounded-[1.6rem] border border-white/20 bg-white/[0.06] p-[3%] shadow-2xl backdrop-blur-md">
        <div className="mb-[2%] flex gap-1.5"><i className="size-2 rounded-full bg-white/30" /><i className="size-2 rounded-full bg-white/30" /><i className="size-2 rounded-full bg-white/30" /></div>
        <div className="h-[85%]"><Motivo m={v.motivo} c={v.c} /></div>
      </div>
      {/* Ícono */}
      {!sinIcono && <span className="vz-flota absolute left-[20%] top-[34%] flex size-[18%] min-h-16 min-w-16 items-center justify-center rounded-[28%] text-white shadow-2xl ring-1 ring-white/30" style={{ background: `linear-gradient(145deg, ${v.c}, ${v.c2})`, boxShadow: `0 30px 60px -20px ${v.c}` }}>
        <Icono className="size-[45%]" />
      </span>}
    </div>
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
      <Electro latidos={6} className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full opacity-80" grilla={false} />
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

/** Reproductor compacto y premium al final de cada página (se oculta si en el panel no hay música). */
export function Reproductor() {
  const e = useMusica();
  const [lista, setLista] = useState(false);
  const t = e.lista[e.tema];
  if (!t) return null;
  return (
    <section className="relative mx-auto max-w-3xl px-4 pt-20">
      {/* Borde degradé que gira */}
      <div className="relative overflow-hidden rounded-[1.6rem] p-[1.5px] shadow-[0_40px_80px_-40px_rgba(10,20,60,.9)]">
        <div className={`absolute -inset-[60%] bg-[conic-gradient(from_0deg,transparent_0%,#38bdf8_15%,transparent_30%,#f472b6_55%,transparent_70%)] ${e.sonando ? "spin-slow" : "opacity-50"}`} />
        <div className="relative overflow-hidden rounded-[calc(1.6rem-1.5px)] bg-[oklch(0.16_0.045_262)] text-white">
          <div className={`pointer-events-none absolute -left-10 top-1/2 size-48 -translate-y-1/2 rounded-full bg-gradient-to-br ${t.color} opacity-35 blur-3xl transition-all duration-1000`} />

          <div className="relative flex items-center gap-4 p-3 pr-4 sm:gap-5 sm:p-3.5 sm:pr-5">
            {/* Disco */}
            <button onClick={() => (e.sonando ? motor.pausa() : void motor.play())} aria-label={e.sonando ? "Pausar" : "Reproducir"} className="relative size-16 shrink-0 sm:size-[4.5rem]">
              <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${t.color} shadow-lg ${e.sonando ? "spin-slow" : ""}`} style={{ animationDuration: "6s" }}>
                <span className="absolute inset-[18%] rounded-full border border-white/25" />
                <span className="absolute inset-[32%] rounded-full border border-white/20" />
                <span className="absolute left-1/2 top-[6%] h-[18%] w-[3px] -translate-x-1/2 rounded-full bg-white/60" />
              </span>
              <span className="absolute inset-[38%] rounded-full bg-[oklch(0.16_0.045_262)] ring-2 ring-white/40" />
              {e.sonando && <span className={`absolute -inset-1.5 animate-ping rounded-full bg-gradient-to-br ${t.color} opacity-20`} style={{ animationDuration: "2.4s" }} />}
            </button>

            {/* Tema */}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                <span className={`size-1.5 rounded-full ${e.sonando ? "bg-emerald-400 pulse-dot" : "bg-white/40"}`} /> {e.sonando ? "Sonando" : "Música de espera"}
              </p>
              <p key={t.id} className="truncate font-display text-lg font-semibold animate-in fade-in slide-in-from-bottom-1 duration-500 sm:text-xl">{t.nombre}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="truncate text-xs text-white/55">{t.sub}</span>
                <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((k) => (
                    <span key={k} className={`w-[3px] rounded-full bg-gradient-to-t ${t.color} ${e.sonando ? "eq-bar" : ""}`} style={{ height: e.sonando ? "100%" : "30%", animationDelay: `${k * 0.13}s` }} />
                  ))}
                </span>
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button onClick={() => motor.elegir(e.tema - 1)} aria-label="Anterior" className="hidden size-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white sm:flex"><SkipBack className="size-4" /></button>
              <button
                onClick={() => (e.sonando ? motor.pausa() : void motor.play())}
                aria-label={e.sonando ? "Pausar" : "Reproducir"}
                className="flex size-12 items-center justify-center rounded-full bg-white text-[oklch(0.2_0.06_262)] shadow-[0_12px_30px_-10px_rgba(255,255,255,.6)] transition-transform hover:scale-105 active:scale-95"
              >
                {e.sonando ? <Pause className="size-5" /> : <Play className="ml-0.5 size-5" />}
              </button>
              <button onClick={() => motor.elegir(e.tema + 1)} aria-label="Siguiente" className="flex size-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"><SkipForward className="size-4" /></button>
              <label className="ml-1 hidden items-center gap-2 text-white/60 md:flex">
                <Volume2 className="size-4 shrink-0" />
                <input type="range" min={0} max={1} step={0.01} value={e.volumen} onChange={(ev) => motor.volumen(Number(ev.target.value))} className="h-1 w-20 cursor-pointer accent-white" aria-label="Volumen" />
              </label>
              <button onClick={() => setLista((v) => !v)} aria-label="Lista de temas" aria-expanded={lista} className={`ml-1 flex size-9 items-center justify-center rounded-full transition ${lista ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}><Headphones className="size-4" /></button>
            </div>
          </div>

          {/* Lista desplegable */}
          {lista && (
            <div className="relative flex gap-2 overflow-x-auto border-t border-white/10 px-3 py-3 [scrollbar-width:none] animate-in fade-in slide-in-from-top-1 duration-300">
              {e.lista.map((x, i) => {
                const on = i === e.tema;
                return (
                  <button key={x.id} onClick={() => (on && e.sonando ? motor.pausa() : motor.elegir(i))} className={`flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-xs font-semibold transition ${on ? "bg-white/15 ring-1 ring-white/25" : "bg-white/[0.05] text-white/70 hover:bg-white/10"}`}>
                    <span className={`flex size-6 items-center justify-center rounded-full bg-gradient-to-br ${x.color}`}>{on && e.sonando ? <Pause className="size-3" /> : <Play className="ml-px size-3" />}</span>
                    {x.nombre}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


/* ===================================================================== */
/* Instalar la app (panel y portal): botón visible + guía para iPhone       */
/* ===================================================================== */
type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
let pedidoInstalar: EventoInstalar | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    pedidoInstalar = e as EventoInstalar;
    window.dispatchEvent(new Event("gb-instalable"));
  });
  window.addEventListener("appinstalled", () => {
    pedidoInstalar = null;
    window.dispatchEvent(new Event("gb-instalable"));
  });
}

export function InstalarApp({ nombre = "la app", oscuro = false, className = "" }: { nombre?: string; oscuro?: boolean; className?: string }) {
  const [, tick] = useState(0);
  const [guia, setGuia] = useState(false);
  const [instalada, setInstalada] = useState(false);
  useEffect(() => {
    const f = () => tick((x) => x + 1);
    window.addEventListener("gb-instalable", f);
    setInstalada(window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    return () => window.removeEventListener("gb-instalable", f);
  }, []);
  if (instalada) return null;
  const ios = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const instalar = async () => {
    if (pedidoInstalar) {
      await pedidoInstalar.prompt();
      const r = await pedidoInstalar.userChoice.catch(() => ({ outcome: "" }));
      if (r.outcome === "accepted") setInstalada(true);
      pedidoInstalar = null;
      return;
    }
    setGuia(true);
  };
  return (
    <>
      <button
        type="button"
        onClick={() => void instalar()}
        className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${oscuro ? "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20" : "bg-primary/10 text-primary ring-1 ring-primary/20 hover:bg-primary/15"} ${className}`}
      >
        <Download className="size-4" /> Instalar {nombre}
      </button>
      {guia && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center" onClick={() => setGuia(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 text-foreground shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <img src={logoClinica} alt="" className="size-12 rounded-2xl" />
              <div>
                <p className="font-semibold">Instalar {nombre}</p>
                <p className="text-xs text-muted-foreground">Queda como un ícono en tu pantalla de inicio</p>
              </div>
            </div>
            {ios ? (
              <ol className="mt-5 space-y-3 text-sm">
                <li className="flex items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary"><Share className="size-4" /></span> Tocá <b>Compartir</b> abajo en Safari.</li>
                <li className="flex items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary"><SquarePlus className="size-4" /></span> Elegí <b>Agregar a pantalla de inicio</b>.</li>
                <li className="flex items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary"><Download className="size-4" /></span> Tocá <b>Agregar</b>. ¡Listo!</li>
              </ol>
            ) : (
              <ol className="mt-5 space-y-3 text-sm">
                <li>1. Abrí el menú del navegador (<b>⋮</b> arriba a la derecha).</li>
                <li>2. Elegí <b>Instalar aplicación</b> o <b>Agregar a pantalla de inicio</b>.</li>
                <li>3. Confirmá. En la compu también aparece un ícono de instalar en la barra de direcciones.</li>
              </ol>
            )}
            <Button onClick={() => setGuia(false)} className="mt-6 w-full rounded-xl">Entendido</Button>
          </div>
        </div>
      )}
    </>
  );
}
