import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AlertTriangle, ShieldCheck, Trash2, X } from "lucide-react";

type Opciones = {
  titulo: string;
  texto?: string;
  aceptar?: string;
  cancelar?: string;
  /** "peligro" para borrar o quitar accesos; "aviso" para acciones delicadas. */
  tono?: "peligro" | "aviso" | "info";
};

/** Ventana de confirmación premium (reemplaza a window.confirm). Devuelve true si el usuario acepta. */
export function confirmar(op: Opciones): Promise<boolean> {
  if (typeof document === "undefined") return Promise.resolve(false);
  return new Promise((resolver) => {
    const nodo = document.createElement("div");
    document.body.appendChild(nodo);
    const root = createRoot(nodo);
    const cerrar = (v: boolean) => {
      resolver(v);
      setTimeout(() => { root.unmount(); nodo.remove(); }, 180);
    };
    root.render(<Ventana op={op} onFin={cerrar} />);
  });
}

function Ventana({ op, onFin }: { op: Opciones; onFin: (v: boolean) => void }) {
  const [saliendo, setSaliendo] = useState(false);
  const cancelarRef = useRef<HTMLButtonElement>(null);
  const aceptarRef = useRef<HTMLButtonElement>(null);
  const tono = op.tono ?? "peligro";
  const fin = (v: boolean) => { if (saliendo) return; setSaliendo(true); onFin(v); };

  useEffect(() => {
    (tono === "peligro" ? cancelarRef : aceptarRef).current?.focus();
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") fin(false); };
    window.addEventListener("keydown", tecla);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", tecla); document.body.style.overflow = prev; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Icono = tono === "peligro" ? Trash2 : tono === "aviso" ? AlertTriangle : ShieldCheck;
  const icono = tono === "peligro"
    ? "bg-red-50 text-red-600 ring-red-100 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20"
    : tono === "aviso"
      ? "bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20"
      : "bg-[#0b2a6b]/[.06] text-[#0b2a6b] ring-[#0b2a6b]/10 dark:bg-white/10 dark:text-sky-200 dark:ring-white/10";
  const boton = tono === "peligro"
    ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-300"
    : "bg-[#0b2a6b] hover:bg-[#0a2459] focus-visible:ring-sky-300";

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="cf-titulo"
      className={`fixed inset-0 z-[9999] flex items-end justify-center p-4 sm:items-center ${saliendo ? "cf-out" : "cf-in"}`}
      onMouseDown={(e) => { if (e.target === e.currentTarget) fin(false); }}
    >
      <style>{`
        .cf-in .cf-velo{animation:cf-fade .2s ease-out both}.cf-in .cf-caja{animation:cf-pop .26s cubic-bezier(.2,.9,.3,1.15) both}
        .cf-out .cf-velo{animation:cf-fade .18s ease-in reverse both}.cf-out .cf-caja{animation:cf-pop .18s ease-in reverse both}
        @keyframes cf-fade{from{opacity:0}to{opacity:1}}
        @keyframes cf-pop{from{opacity:0;transform:translateY(12px) scale(.96)}to{opacity:1;transform:none}}
        @media (prefers-reduced-motion:reduce){.cf-velo,.cf-caja{animation:none!important}}
      `}</style>
      <div className="cf-velo pointer-events-none absolute inset-0 bg-[#071a46]/45 backdrop-blur-[3px]" />
      <div className="cf-caja relative w-full max-w-[420px] overflow-hidden rounded-3xl border border-white/60 bg-white shadow-[0_30px_80px_-20px_rgba(7,26,70,.55)] dark:border-white/10 dark:bg-[#0d1628]">
        <div className="h-1 w-full bg-gradient-to-r from-[#0b2a6b] via-[#0e7490] to-[#0b2a6b]" />
        <button type="button" onClick={() => fin(false)} aria-label="Cerrar" className="absolute right-3 top-4 grid size-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10">
          <X className="size-4" />
        </button>
        <div className="px-6 pb-6 pt-7 text-center sm:px-7">
          <span className={`mx-auto grid size-14 place-items-center rounded-2xl ring-8 ${icono}`}>
            <Icono className="size-6" />
          </span>
          <h2 id="cf-titulo" className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">{op.titulo}</h2>
          {op.texto && <p className="mx-auto mt-2 max-w-[34ch] text-sm leading-relaxed text-slate-500 dark:text-slate-400">{op.texto}</p>}
          <div className="mt-6 grid grid-cols-2 gap-2.5">
            <button ref={cancelarRef} type="button" onClick={() => fin(false)} className="h-11 rounded-xl bg-white text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-white/10">
              {op.cancelar ?? "Cancelar"}
            </button>
            <button ref={aceptarRef} type="button" onClick={() => fin(true)} className={`h-11 rounded-xl text-sm font-semibold text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 ${boton}`}>
              {op.aceptar ?? (tono === "peligro" ? "Sí, eliminar" : "Aceptar")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
