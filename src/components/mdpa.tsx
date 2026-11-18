/** Piezas visuales del monitoreo domiciliario de presión arterial (portal y panel). */
import { useState } from "react";
import { Armchair, BicepsFlexed, Coffee, Footprints, Gauge, MicOff, Timer, type LucideIcon } from "lucide-react";
import { analizar, CRITERIOS_MDPA, diaDe, MOMENTOS_MDPA, PATRON_NOCTURNO, AVISO_IA, type MedicionMdpa, type MonitoreoMdpa } from "@/lib/mdpa";

/* ───────────── Guía de medición correcta ───────────── */
export const PASOS_MEDICION: { n: number; t: string; icon: LucideIcon; items: string[] }[] = [
  { n: 1, t: "Vaciar la vejiga y evitar el café", icon: Coffee, items: ["Vaya al baño antes de medir.", "30 minutos antes: nada de café ni bebidas con cafeína, no fume y no haga ejercicio."] },
  { n: 2, t: "Reposo previo", icon: Timer, items: ["Descanse sentado al menos 5 minutos (ideal 5 a 15).", "No mida justo después de caminar, subir escaleras o tener un disgusto."] },
  { n: 3, t: "Sentarse correctamente", icon: Armchair, items: ["Silla con respaldo, espalda bien apoyada y cuerpo relajado.", "No mida sentado en la cama ni de pie, salvo que su médico lo indique."] },
  { n: 4, t: "Piernas descruzadas", icon: Footprints, items: ["No cruce las piernas.", "Rodillas en ángulo de unos 90° y los dos pies apoyados en el piso."] },
  { n: 5, t: "Brazo apoyado a la altura del corazón", icon: BicepsFlexed, items: ["Brazo descubierto, sin ropa que apriete.", "Apóyelo relajado sobre una mesa; no lo sostenga en el aire."] },
  { n: 6, t: "Brazalete bien colocado", icon: Gauge, items: ["Sobre la piel, nunca sobre la ropa.", "Borde inferior 1 a 2 cm por encima del pliegue del codo, ni flojo ni apretado.", "Tamaño adecuado a su brazo; alinee la marca de la arteria según el tensiómetro."] },
  { n: 7, t: "No hablar durante la medición", icon: MicOff, items: ["Silencio total: no hable ni use el celular.", "No se mueva y respire tranquilo."] },
];

/** Ilustración sencilla de la postura correcta. */
export function IlustracionPostura({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" role="img" aria-label="Persona sentada correctamente para medir la presión" className={className}>
      <rect x="0" y="0" width="320" height="240" rx="18" fill="#F5F7FA" />
      <line x1="20" y1="214" x2="300" y2="214" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
      {/* Mesa */}
      <rect x="196" y="120" width="96" height="8" rx="3" fill="#94A3B8" />
      <rect x="276" y="128" width="7" height="86" fill="#CBD5E1" />
      {/* Silla con respaldo */}
      <rect x="62" y="66" width="10" height="148" rx="4" fill="#475569" />
      <rect x="62" y="140" width="84" height="10" rx="4" fill="#475569" />
      <rect x="136" y="150" width="8" height="64" fill="#475569" />
      {/* Cuerpo */}
      <circle cx="100" cy="58" r="17" fill="#1E3A8A" />
      <path d="M86 78 h28 a6 6 0 0 1 6 6 v54 h-40 v-54 a6 6 0 0 1 6-6z" fill="#3B5BC0" />
      {/* Brazo apoyado en la mesa a la altura del corazón */}
      <path d="M112 92 L160 118 L214 118" stroke="#3B5BC0" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Brazalete */}
      <rect x="134" y="98" width="22" height="18" rx="4" fill="#10B981" transform="rotate(28 145 107)" />
      <path d="M156 110 q20 -6 26 -22" stroke="#10B981" strokeWidth="2.5" fill="none" />
      <rect x="176" y="72" width="22" height="16" rx="3" fill="#0F172A" />
      <text x="187" y="84" textAnchor="middle" fontSize="8" fill="#10B981" fontFamily="system-ui">128</text>
      {/* Piernas a 90° y pies apoyados */}
      <path d="M86 138 h52 v70" stroke="#1E3A8A" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M102 138 h40 v70" stroke="#172E6E" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".85" />
      <rect x="130" y="206" width="26" height="8" rx="4" fill="#0F172A" />
      {/* Corazón y línea de altura */}
      <circle cx="104" cy="98" r="4" fill="#EF4444" />
      <line x1="104" y1="98" x2="214" y2="118" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 4" opacity=".6" />
      {/* Silencio */}
      <g transform="translate(24 20)"><rect width="38" height="22" rx="11" fill="#E8ECF2" /><text x="19" y="15" textAnchor="middle" fontSize="10" fill="#475569" fontFamily="system-ui">Shh</text></g>
      <g transform="translate(232 20)"><rect width="72" height="22" rx="11" fill="#DBE4FB" /><text x="36" y="15" textAnchor="middle" fontSize="10" fill="#1E3A8A" fontFamily="system-ui">5 min reposo</text></g>
    </svg>
  );
}

export function GuiaMedicion({ confirmable = false, confirmado = false, onConfirmar }: { confirmable?: boolean; confirmado?: boolean; onConfirmar?: (v: boolean) => void }) {
  const [i, setI] = useState(0);
  const p = PASOS_MEDICION[i]!;
  return (
    <section className="overflow-hidden rounded-3xl border border-[#DBE4FB] bg-white shadow-[0_1px_2px_rgba(15,23,42,.04)] dark:border-white/10 dark:bg-white/[.03]">
      <div className="border-b border-[#DBE4FB] bg-[#EEF2FB] px-5 py-4 dark:border-white/10 dark:bg-white/5">
        <p className="text-lg font-bold tracking-tight text-[#1E3A8A] dark:text-sky-200">¿Cómo medir correctamente su presión arterial en casa?</p>
        <p className="text-sm text-[#475569] dark:text-slate-300">Siga estos 7 pasos antes de cada medición. Así su médico puede confiar en los resultados.</p>
      </div>
      <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <IlustracionPostura className="w-full" />
        <div>
          <div className="mb-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Pasos">
            {PASOS_MEDICION.map((x, k) => (
              <button key={x.n} type="button" role="tab" aria-selected={k === i} onClick={() => setI(k)} className={`grid size-9 place-items-center rounded-xl text-sm font-bold transition ${k === i ? "bg-[#1E3A8A] text-white" : "bg-slate-100 text-slate-600 hover:bg-[#DBE4FB] dark:bg-white/10 dark:text-slate-200"}`}>{x.n}</button>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
            <div className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#1E3A8A] text-white"><p.icon className="size-6" /></span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#475569]">Paso {p.n} de 7</p>
                <p className="text-base font-bold">{p.t}</p>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5 text-[15px] leading-relaxed text-slate-700 dark:text-slate-200">
              {p.items.map((x) => <li key={x} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#10B981]" />{x}</li>)}
            </ul>
            <div className="mt-4 flex justify-between gap-2">
              <button type="button" disabled={i === 0} onClick={() => setI(i - 1)} className="h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-[#1E3A8A] disabled:opacity-40 dark:text-sky-300">Anterior</button>
              <button type="button" disabled={i === PASOS_MEDICION.length - 1} onClick={() => setI(i + 1)} className="h-11 rounded-xl bg-[#1E3A8A] px-5 text-sm font-semibold text-white disabled:opacity-40">Siguiente paso</button>
            </div>
          </div>
          {confirmable && (
            <label className={`mt-3 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${confirmado ? "border-[#10B981] bg-[#ECFDF5] dark:bg-emerald-500/10" : "border-slate-300 hover:border-[#1E3A8A]/50 dark:border-white/15"}`}>
              <input type="checkbox" checked={confirmado} onChange={(e) => onConfirmar?.(e.target.checked)} className="mt-0.5 size-5 accent-[#1E3A8A]" />
              <span className="text-[15px] font-semibold leading-snug">Leí las instrucciones y estoy preparado para realizar la medición correctamente.</span>
            </label>
          )}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Gráficos (SVG) ───────────── */
const W = 640;
const H = 240;
const PAD = { l: 40, r: 14, t: 14, b: 30 };
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const fd = (f: string) => `${f.slice(8, 10)}/${f.slice(5, 7)}/${f.slice(0, 4)}`;
const fh = (iso: string) => new Date(iso).toLocaleString("es-CO", { timeZone: "America/Bogota", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function escala(vals: number[], extra: number[] = []) {
  const todos = [...vals, ...extra];
  const min = Math.floor((Math.min(...todos, 60) - 5) / 10) * 10;
  const max = Math.ceil((Math.max(...todos, 140) + 5) / 10) * 10;
  return { min, max, y: (v: number) => PAD.t + ((max - v) / (max - min)) * (H - PAD.t - PAD.b) };
}
function ejes(min: number, max: number, y: (v: number) => number) {
  let g = "";
  for (let v = min; v <= max; v += 20) g += `<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(v)}" y2="${y(v)}" stroke="#E2E8F0"/><text x="${PAD.l - 6}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="#475569">${v}</text>`;
  return g;
}

/** Gráfico 1: evolución temporal (cada medición), con banda del objetivo. */
export function svgSerie(ms: MedicionMdpa[], objetivo: { s: number; d: number }) {
  if (!ms.length) return "";
  const { min, max, y } = escala(ms.flatMap((m) => [m.s, m.d]), [objetivo.s, objetivo.d]);
  const x = (i: number) => PAD.l + (ms.length === 1 ? (W - PAD.l - PAD.r) / 2 : (i / (ms.length - 1)) * (W - PAD.l - PAD.r));
  const linea = (k: "s" | "d") => ms.map((m, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(m[k]).toFixed(1)}`).join(" ");
  const pS = ms.reduce((a, m) => a + m.s, 0) / ms.length;
  const pD = ms.reduce((a, m) => a + m.d, 0) / ms.length;
  const puntos = ms.map((m, i) => {
    const fuera = m.s >= objetivo.s || m.d >= objetivo.d;
    return `<g><title>${esc(`${fh(m.fecha)} · ${m.momento} · ${m.s}/${m.d} mmHg${m.fc ? ` · ${m.fc} lpm` : ""}${m.sintomas.length ? ` · ${m.sintomas.join(", ")}` : ""}`)}</title><circle cx="${x(i)}" cy="${y(m.s)}" r="${fuera ? 4.5 : 3.5}" fill="${fuera ? "#DC2626" : "#1E3A8A"}"/><circle cx="${x(i)}" cy="${y(m.d)}" r="${fuera ? 4.5 : 3.5}" fill="${fuera ? "#DC2626" : "#10B981"}"/></g>`;
  }).join("");
  const dias = [...new Set(ms.map((m) => diaDe(m.fecha)))];
  const etiquetas = dias.map((d) => { const i = ms.findIndex((m) => diaDe(m.fecha) === d); return `<text x="${x(i)}" y="${H - 10}" font-size="10" fill="#475569" text-anchor="middle">${d.slice(8, 10)}/${d.slice(5, 7)}</text>`; }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,sans-serif" style="width:100%;height:auto">
${ejes(min, max, y)}
<rect x="${PAD.l}" y="${y(objetivo.s)}" width="${W - PAD.l - PAD.r}" height="${Math.max(0, y(objetivo.d) - y(objetivo.s))}" fill="#10B981" opacity=".06"/>
<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(objetivo.s)}" y2="${y(objetivo.s)}" stroke="#DC2626" stroke-dasharray="5 4" opacity=".7"/><text x="${W - PAD.r}" y="${y(objetivo.s) - 4}" text-anchor="end" font-size="10" fill="#DC2626">Objetivo sistólica ${objetivo.s}</text>
<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(objetivo.d)}" y2="${y(objetivo.d)}" stroke="#F59E0B" stroke-dasharray="5 4" opacity=".8"/><text x="${W - PAD.r}" y="${y(objetivo.d) - 4}" text-anchor="end" font-size="10" fill="#B45309">Objetivo diastólica ${objetivo.d}</text>
<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(pS)}" y2="${y(pS)}" stroke="#1E3A8A" opacity=".35"/><line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(pD)}" y2="${y(pD)}" stroke="#10B981" opacity=".45"/>
<path d="${linea("s")}" fill="none" stroke="#1E3A8A" stroke-width="2"/><path d="${linea("d")}" fill="none" stroke="#10B981" stroke-width="2"/>
${puntos}${etiquetas}</svg>`;
}

/** Gráfico 2: promedio por horario (barras sistólica/diastólica). */
export function svgMomentos(porMomento: { momento: string; n: number; s: number; d: number }[]) {
  if (!porMomento.length) return "";
  const { min, max, y } = escala(porMomento.flatMap((x) => [x.s, x.d]));
  const bw = (W - PAD.l - PAD.r) / porMomento.length;
  const barras = porMomento.map((x, i) => {
    const cx = PAD.l + bw * i + bw / 2;
    return `<g><title>${esc(`${x.momento}: ${x.s}/${x.d} mmHg (${x.n} mediciones)`)}</title><rect x="${cx - 26}" y="${y(x.s)}" width="22" height="${y(min) - y(x.s)}" rx="4" fill="#1E3A8A"/><rect x="${cx + 4}" y="${y(x.d)}" width="22" height="${y(min) - y(x.d)}" rx="4" fill="#10B981"/><text x="${cx - 15}" y="${y(x.s) - 4}" font-size="10" text-anchor="middle" fill="#0F172A">${Math.round(x.s)}</text><text x="${cx + 15}" y="${y(x.d) - 4}" font-size="10" text-anchor="middle" fill="#0F172A">${Math.round(x.d)}</text><text x="${cx}" y="${H - 10}" font-size="11" text-anchor="middle" fill="#475569">${x.momento}</text></g>`;
  }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,sans-serif" style="width:100%;height:auto">${ejes(min, max, y)}${barras}</svg>`;
}

/** Gráfico 3: promedio diario. Gráfico 4: variabilidad (desviación estándar sistólica por día). */
export function svgDiario(porDia: { dia: string; n: number; s: number; d: number; deS: number }[], modo: "promedio" | "variabilidad") {
  const ds = porDia.filter((x) => x.n > 0);
  if (!ds.length) return "";
  if (modo === "promedio") {
    const { min, max, y } = escala(ds.flatMap((x) => [x.s, x.d]));
    const x = (i: number) => PAD.l + (ds.length === 1 ? (W - PAD.l - PAD.r) / 2 : (i / (ds.length - 1)) * (W - PAD.l - PAD.r));
    const l = (k: "s" | "d") => ds.map((p, i) => `${i ? "L" : "M"}${x(i)} ${y(p[k])}`).join(" ");
    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,sans-serif" style="width:100%;height:auto">${ejes(min, max, y)}<path d="${l("s")}" fill="none" stroke="#1E3A8A" stroke-width="2.5"/><path d="${l("d")}" fill="none" stroke="#10B981" stroke-width="2.5"/>${ds.map((p, i) => `<g><title>${esc(`${p.dia}: ${p.s}/${p.d} mmHg (${p.n})`)}</title><circle cx="${x(i)}" cy="${y(p.s)}" r="4" fill="#1E3A8A"/><circle cx="${x(i)}" cy="${y(p.d)}" r="4" fill="#10B981"/><text x="${x(i)}" y="${H - 10}" font-size="10" text-anchor="middle" fill="#475569">${p.dia.slice(8, 10)}/${p.dia.slice(5, 7)}</text></g>`).join("")}</svg>`;
  }
  const max = Math.max(20, ...ds.map((x) => x.deS)) + 5;
  const y = (v: number) => PAD.t + ((max - v) / max) * (H - PAD.t - PAD.b);
  const bw = (W - PAD.l - PAD.r) / ds.length;
  const umbral = CRITERIOS_MDPA.variabilidadAltaDE;
  let g = "";
  for (let v = 0; v <= max; v += 5) g += `<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(v)}" y2="${y(v)}" stroke="#E2E8F0"/><text x="${PAD.l - 6}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="#475569">${v}</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,sans-serif" style="width:100%;height:auto">${g}<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(umbral)}" y2="${y(umbral)}" stroke="#DC2626" stroke-dasharray="5 4"/><text x="${W - PAD.r}" y="${y(umbral) - 4}" font-size="10" text-anchor="end" fill="#DC2626">Variabilidad alta (DE ${umbral})</text>${ds.map((p, i) => { const cx = PAD.l + bw * i + bw / 2; return `<g><title>${esc(`${p.dia}: DE sistólica ${p.deS} mmHg`)}</title><rect x="${cx - 12}" y="${y(p.deS)}" width="24" height="${y(0) - y(p.deS)}" rx="4" fill="${p.deS >= umbral ? "#DC2626" : "#3B5BC0"}"/><text x="${cx}" y="${H - 10}" font-size="10" text-anchor="middle" fill="#475569">${p.dia.slice(8, 10)}/${p.dia.slice(5, 7)}</text></g>`; }).join("")}</svg>`;
}

export function Svg({ html, className = "" }: { html: string; className?: string }) {
  if (!html) return <p className="py-8 text-center text-sm text-[#475569]">Todavía no hay mediciones para graficar.</p>;
  return <div className={`mx-auto w-full max-w-3xl ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ───────────── Informe para el médico (HTML imprimible) ───────────── */
export function htmlInformeMdpa(m: MonitoreoMdpa, opciones: { medico?: string; firma?: string } = {}) {
  const a = analizar(m);
  const p = m.protocolo;
  const fila = (k: string, v: string) => `<tr><td>${k}</td><td><b>${v}</b></td></tr>`;
  const destacadas = a.validas.filter((x) => x.s >= p.objetivo.s + 20 || x.d >= p.objetivo.d + 15 || x.s < CRITERIOS_MDPA.hipotension.s || x.sintomas.length).slice(0, 12);
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe MDPA · ${esc(m.paciente)}</title>
<style>body{font-family:system-ui,sans-serif;color:#0f172a;padding:32px;max-width:860px;margin:auto;font-size:13px}h1{font-size:19px;margin:0}h2{font-size:14px;margin:22px 0 8px;color:#1E3A8A;text-transform:uppercase;letter-spacing:.05em}
.m{color:#475569}table{width:100%;border-collapse:collapse}td,th{padding:5px 8px;border-bottom:1px solid #e2e8f0;text-align:left}th{background:#f5f7fa;font-size:11px;text-transform:uppercase;color:#475569}
.g{display:grid;grid-template-columns:1fr 1fr;gap:12px}.box{border:1px solid #e2e8f0;border-radius:12px;padding:10px}.aviso{background:#EEF2FB;border-radius:10px;padding:10px 12px;margin-top:8px}.alerta{color:#b91c1c}
.firme{margin-top:44px;display:flex;justify-content:space-between;gap:20px}.firme div{border-top:1px solid #334155;padding-top:6px;min-width:240px;text-align:center}img{height:60px}</style></head><body>
<h1>HEGO · Centro de especialidades médicas</h1><p class="m"><b>Informe de monitoreo domiciliario de presión arterial (MDPA)</b> · criterios v${CRITERIOS_MDPA.version}</p>
<table>${fila("Paciente", `${esc(m.paciente)}${m.dni ? ` · C.C. ${m.dni}` : ""}`)}${fila("Médico solicitante", esc(m.solicitadoPor))}${fila("Período", `${fd(m.inicio)} a ${fd(a.fin)} · ${p.dias} días`)}${fila("Protocolo", `${p.tipo} · ${p.momentos.join(" y ")} · ${p.tomasPorSesion} tomas por sesión con ${p.intervaloMin} min de intervalo${p.descartarPrimerDia ? " · se excluye el primer día" : ""}`)}${fila("Objetivo", `< ${p.objetivo.s}/${p.objetivo.d} mmHg`)}${m.motivo ? fila("Motivo", esc(m.motivo)) : ""}</table>
<h2>Resultados</h2>
<table>${fila("Promedio global", `${a.pS}/${a.pD} mmHg`)}${a.porMomento.map((x) => fila(`Promedio ${x.momento.toLowerCase()}`, `${x.s}/${x.d} mmHg (${x.n})`)).join("")}${fila("Frecuencia cardíaca promedio", a.fc ? `${a.fc} lpm` : "Sin datos")}${fila("Variabilidad (DE)", `Sistólica ${a.deS} · diastólica ${a.deD} mmHg`)}${fila("Mediciones", `${a.todas.length} registradas · ${a.validas.length} válidas · ${a.excluidas} excluidas`)}${fila("Por encima del objetivo", `${a.pctSobre}%`)}${fila("Por debajo de 90/60", `${a.pctBajo}%`)}${fila("Cumplimiento del protocolo", `${a.cumplimiento}% (${a.esperadas} esperadas)`)}${fila("Calidad del registro", `${a.calidad}% cargadas en el momento · ${a.diasValidos} días válidos`)}${a.tendencia !== null ? fila("Tendencia sistólica (2.ª vs 1.ª mitad)", `${a.tendencia > 0 ? "+" : ""}${a.tendencia} mmHg`) : ""}</table>
<h2>Gráficos</h2><div class="box">${svgSerie(a.validas, p.objetivo)}</div><div class="g" style="margin-top:12px"><div class="box">${svgMomentos(a.porMomento)}</div><div class="box">${svgDiario(a.porDia, "promedio")}</div></div>
<h2>Evolución diaria</h2><table><tr><th>Día</th><th>Mediciones</th><th>Promedio</th><th>DE sistólica</th><th>FC</th></tr>${a.porDia.map((x) => `<tr><td>${fd(x.dia)}</td><td>${x.n || (p.descartarPrimerDia && x.dia === m.inicio ? "Excluido (1.er día)" : 0)}</td><td>${x.n ? `${x.s}/${x.d}` : "—"}</td><td>${x.deS}</td><td>${x.fc || "—"}</td></tr>`).join("")}</table>
${destacadas.length ? `<h2>Mediciones destacadas</h2><table><tr><th>Fecha</th><th>Momento</th><th>PA</th><th>FC</th><th>Síntomas</th></tr>${destacadas.map((x) => `<tr><td>${fh(x.fecha)}</td><td>${x.momento}</td><td>${x.s}/${x.d}</td><td>${x.fc ?? "—"}</td><td>${esc(x.sintomas.join(", ") || "—")}</td></tr>`).join("")}</table>` : ""}
${a.alertas.length ? `<h2>Alertas</h2><ul>${a.alertas.map((x) => `<li class="${x.nivel === "Urgente" ? "alerta" : ""}"><b>${x.nivel}:</b> ${esc(x.texto)}${x.fecha ? ` · ${fh(x.fecha)}` : ""}</li>`).join("")}</ul>` : ""}
<h2>Interpretación</h2><p>${esc(a.interpretacion)}</p><p class="m">${PATRON_NOCTURNO}</p><div class="aviso"><b>${AVISO_IA}</b></div>
<h2>Limitaciones del método</h2><p class="m">Mediciones realizadas por el paciente con su propio tensiómetro, en vigilia. No reemplaza al MAPA de 24 horas ni permite evaluar la presión durante el sueño. La calidad depende de la técnica de medición y del cumplimiento del protocolo. Criterios: ${CRITERIOS_MDPA.fuentes}.</p>
<h2>Conclusión del médico</h2><p>${m.revision ? `${esc(m.revision.conclusion)}${m.revision.comentarios ? `<br><span class="m">${esc(m.revision.comentarios)}</span>` : ""}` : "<span class='m'>Pendiente de revisión.</span>"}</p>
<div class="firme"><span class="m">${m.revision ? `Revisado el ${new Date(m.revision.fecha).toLocaleDateString("es-CO")}` : ""}</span><div>${opciones.firma ? `<img src="${opciones.firma}"><br>` : ""}${esc(m.revision?.por ?? opciones.medico ?? m.solicitadoPor)}</div></div>
<script>setTimeout(()=>window.print(),400)</script></body></html>`;
}

export const momentosDe = (m: MonitoreoMdpa) => MOMENTOS_MDPA.filter((x) => m.protocolo.momentos.includes(x));
