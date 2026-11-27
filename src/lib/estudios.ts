/**
 * Estudios diagnósticos de la historia clínica (pestaña «Estudios»).
 * Estructura común para todos los estudios y, por ahora, el primero integrado: el MAPA
 * (Monitoreo Ambulatorio de la Presión Arterial de 24 horas).
 * Para sumar otro estudio (ECG, Holter, ecocardiograma…): agregar su tipo en TIPOS_ESTUDIO_DX,
 * su forma de datos en DatosEstudio y su vista en la historia clínica.
 */
export const KEY_ESTUDIOS_DX = "gb_estudios_dx";

export type TipoEstudioDx = "MAPA" | "ECG" | "Holter" | "Ecocardiograma" | "Otro";

export const TIPOS_ESTUDIO_DX: { id: TipoEstudioDx; corto: string; nombre: string; descripcion: string; disponible: boolean; color: string }[] = [
  { id: "MAPA", corto: "MAPA", nombre: "Monitoreo Ambulatorio de la Presión Arterial", descripcion: "Presión arterial de 24 horas: gráfica, mediciones, promedios día/noche e informe.", disponible: true, color: "from-[#1E3A8A] to-[#3B5BC0]" },
  { id: "ECG", corto: "ECG", nombre: "Electrocardiograma", descripcion: "Trazado e informe del electrocardiograma.", disponible: false, color: "from-pink-500 to-rose-600" },
  { id: "Holter", corto: "Holter", nombre: "Holter cardíaco", descripcion: "Registro del ritmo cardíaco de 24 a 48 horas.", disponible: false, color: "from-violet-500 to-indigo-600" },
  { id: "Ecocardiograma", corto: "Eco", nombre: "Ecocardiograma", descripcion: "Imágenes, mediciones e informe del ecocardiograma.", disponible: false, color: "from-cyan-500 to-sky-700" },
];

/** Una medición del MAPA. La hora va en hora local de la clínica, sin zona: "YYYY-MM-DDTHH:mm". */
export type LecturaMapa = {
  t: string;
  s: number;
  d: number;
  fc?: number;
  /** Excluida del análisis (artefacto). "auto" la marca el sistema; si no, el médico con su motivo. */
  excluida?: { por: string; motivo: string };
};

export type DatosMapa = {
  /** Horario de sueño informado por el paciente (define el período nocturno). */
  dormir: string; // HH:mm
  despertar: string; // HH:mm
  equipo?: string;
  brazo?: "Derecho" | "Izquierdo";
  lecturas: LecturaMapa[];
};

export type DatosEstudio = DatosMapa | Record<string, unknown>;

export type EstudioDx = {
  id: string;
  /** Id del paciente en la historia clínica (padrón o portal). */
  pacienteId: string;
  paciente: string;
  dni?: string;
  tipo: TipoEstudioDx;
  /** Día en que se realizó (YYYY-MM-DD). */
  fecha: string;
  solicitadoPor?: string;
  motivo?: string;
  datos: DatosEstudio;
  /** Informe / conclusión del médico. */
  informe?: string;
  informadoPor?: { id?: string; nombre: string; fecha: string };
  /** PDF u otro archivo del informe original del equipo (queda en los documentos del paciente). */
  documentoId?: string;
  documentoNombre?: string;
  cargadoPor: string;
  creado: string;
  /** Los estudios no se borran: se anulan con motivo y quedan en la auditoría. */
  anulado?: { por: string; fecha: string; motivo: string };
  auditoria: { fecha: string; por: string; accion: string }[];
};

export const esMapa = (e: EstudioDx): e is EstudioDx & { datos: DatosMapa } => e.tipo === "MAPA" && Array.isArray((e.datos as DatosMapa).lecturas);

/* ───────────── Criterios del MAPA ───────────── */
/**
 * Umbrales de hipertensión por MAPA (ESH 2023 · ESC 2024 · AHA/ACC):
 * 24 h ≥ 130/80 · diurno (vigilia) ≥ 135/85 · nocturno (sueño) ≥ 120/70.
 * Descenso nocturno de la sistólica: ≥ 20 % dipper extremo · 10–20 % dipper · 0–10 % non-dipper · < 0 % riser (patrón invertido).
 * Calidad mínima: ≥ 70 % de lecturas válidas, ≥ 20 diurnas y ≥ 7 nocturnas.
 */
export const CRITERIOS_MAPA = {
  version: "2026.11",
  h24: { s: 130, d: 80 },
  dia: { s: 135, d: 85 },
  noche: { s: 120, d: 70 },
  calidad: { validas: 70, diurnas: 20, nocturnas: 7 },
  guias: "ESH 2023 · ESC 2024 · AHA/ACC",
};

const minutos = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return (h ?? 0) * 60 + (m ?? 0); };
export const horaDe = (t: string) => t.slice(11, 16);
export const diaDeLectura = (t: string) => t.slice(0, 10);

/** ¿La lectura cae en el período de sueño? */
export function esNocturna(t: string, dormir: string, despertar: string) {
  const x = minutos(horaDe(t));
  const a = minutos(dormir);
  const b = minutos(despertar);
  return a <= b ? x >= a && x < b : x >= a || x < b;
}

/** Marca automáticamente las lecturas imposibles (artefactos del equipo). */
export function motivoArtefacto(l: { s: number; d: number; fc?: number }) {
  if (!(l.s > 0) || !(l.d > 0)) return "Lectura incompleta";
  if (l.s < 60 || l.s > 280) return "Sistólica fuera de rango fisiológico";
  if (l.d < 30 || l.d > 160) return "Diastólica fuera de rango fisiológico";
  if (l.s - l.d < 15) return "Presión de pulso demasiado baja";
  if (l.fc !== undefined && (l.fc < 25 || l.fc > 220)) return "Frecuencia cardíaca fuera de rango";
  return null;
}

type Promedio = { n: number; s: number; d: number; fc: number | null };
const prom = (ls: LecturaMapa[]): Promedio => {
  if (!ls.length) return { n: 0, s: 0, d: 0, fc: null };
  const conFc = ls.filter((l) => l.fc);
  return {
    n: ls.length,
    s: Math.round(ls.reduce((a, l) => a + l.s, 0) / ls.length),
    d: Math.round(ls.reduce((a, l) => a + l.d, 0) / ls.length),
    fc: conFc.length ? Math.round(conFc.reduce((a, l) => a + (l.fc ?? 0), 0) / conFc.length) : null,
  };
};
const de = (vals: number[]) => {
  if (vals.length < 2) return 0;
  const m = vals.reduce((a, v) => a + v, 0) / vals.length;
  return Math.round(Math.sqrt(vals.reduce((a, v) => a + (v - m) ** 2, 0) / (vals.length - 1)) * 10) / 10;
};

export type PatronNocturno = { id: "extremo" | "dipper" | "nondipper" | "riser"; nombre: string; detalle: string; tono: "verde" | "ambar" | "rojo" | "azul" };

export function analizarMapa(m: DatosMapa) {
  const ordenadas = [...m.lecturas].sort((a, b) => a.t.localeCompare(b.t));
  const validas = ordenadas.filter((l) => !l.excluida);
  const noct = validas.filter((l) => esNocturna(l.t, m.dormir, m.despertar));
  const diur = validas.filter((l) => !esNocturna(l.t, m.dormir, m.despertar));
  const h24 = prom(validas);
  const dia = prom(diur);
  const noche = prom(noct);
  const caidaS = dia.n && noche.n ? Math.round(((dia.s - noche.s) / dia.s) * 1000) / 10 : null;
  const caidaD = dia.n && noche.n ? Math.round(((dia.d - noche.d) / dia.d) * 1000) / 10 : null;
  const patron: PatronNocturno | null =
    caidaS === null ? null
    : caidaS >= 20 ? { id: "extremo", nombre: "Dipper extremo", detalle: "Descenso nocturno mayor al 20 %", tono: "ambar" }
    : caidaS >= 10 ? { id: "dipper", nombre: "Dipper", detalle: "Descenso nocturno normal (10–20 %)", tono: "verde" }
    : caidaS >= 0 ? { id: "nondipper", nombre: "Non-dipper", detalle: "Descenso nocturno insuficiente (< 10 %)", tono: "ambar" }
    : { id: "riser", nombre: "Riser (patrón invertido)", detalle: "La presión sube durante el sueño", tono: "rojo" };
  const C = CRITERIOS_MAPA;
  const carga = (ls: LecturaMapa[], u: { s: number; d: number }) => (ls.length ? Math.round((ls.filter((l) => l.s >= u.s || l.d >= u.d).length / ls.length) * 100) : 0);
  const elev = {
    h24: h24.n > 0 && (h24.s >= C.h24.s || h24.d >= C.h24.d),
    dia: dia.n > 0 && (dia.s >= C.dia.s || dia.d >= C.dia.d),
    noche: noche.n > 0 && (noche.s >= C.noche.s || noche.d >= C.noche.d),
  };
  const pctValidas = ordenadas.length ? Math.round((validas.length / ordenadas.length) * 100) : 0;
  const calidad = {
    ok: pctValidas >= C.calidad.validas && diur.length >= C.calidad.diurnas && noct.length >= C.calidad.nocturnas,
    pctValidas,
    texto: [
      pctValidas < C.calidad.validas ? `solo ${pctValidas} % de lecturas válidas (mínimo ${C.calidad.validas} %)` : "",
      diur.length < C.calidad.diurnas ? `${diur.length} lecturas diurnas (mínimo ${C.calidad.diurnas})` : "",
      noct.length < C.calidad.nocturnas ? `${noct.length} lecturas nocturnas (mínimo ${C.calidad.nocturnas})` : "",
    ].filter(Boolean),
  };
  let resultado: { titulo: string; tono: "verde" | "ambar" | "rojo" };
  if (!validas.length) resultado = { titulo: "Sin lecturas válidas", tono: "ambar" };
  else if (!elev.h24 && !elev.dia && !elev.noche) resultado = { titulo: "Presión arterial normal en el MAPA", tono: "verde" };
  else if (elev.noche && !elev.dia && !elev.h24) resultado = { titulo: "Hipertensión nocturna aislada", tono: "rojo" };
  else if (elev.dia && !elev.noche) resultado = { titulo: "Hipertensión diurna", tono: "rojo" };
  else resultado = { titulo: elev.noche && elev.dia ? "Hipertensión diurna y nocturna" : "Hipertensión en el promedio de 24 h", tono: "rojo" };
  const max = validas.reduce<LecturaMapa | null>((a, l) => (!a || l.s > a.s ? l : a), null);
  const min = validas.reduce<LecturaMapa | null>((a, l) => (!a || l.s < a.s ? l : a), null);
  // Promedio por hora del día (para la tabla horaria)
  const porHora = Array.from({ length: 24 }, (_, h) => ({ h, ...prom(validas.filter((l) => Number(horaDe(l.t).slice(0, 2)) === h)) })).filter((x) => x.n > 0);
  return {
    ordenadas, validas, diur, noct, h24, dia, noche, caidaS, caidaD, patron, elev, calidad, resultado, max, min, porHora,
    cargas: { dia: carga(diur, C.dia), noche: carga(noct, C.noche) },
    variabilidad: { dia: de(diur.map((l) => l.s)), noche: de(noct.map((l) => l.s)) },
    inicio: ordenadas[0]?.t ?? null,
    fin: ordenadas[ordenadas.length - 1]?.t ?? null,
  };
}

/* ───────────── Lectura del archivo del equipo ───────────── */
const sinTilde = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const pad = (n: number) => String(n).padStart(2, "0");
const sumarDia = (f: string, n = 1) => { const d = new Date(`${f}T12:00:00`); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

function fechaDeTexto(s: string): string | null {
  const t = s.trim();
  let m = /(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(t);
  if (m) return `${m[1]}-${pad(+m[2]!)}-${pad(+m[3]!)}`;
  m = /(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/.exec(t);
  if (m) {
    let a = +m[1]!, b = +m[2]!;
    const y = m[3]!.length === 2 ? 2000 + +m[3]! : +m[3]!;
    if (b > 12 && a <= 12) [a, b] = [b, a]; // venía mes/día
    return `${y}-${pad(b)}-${pad(a)}`;
  }
  return null;
}
function horaDeTexto(s: string): string | null {
  const m = /(\d{1,2}):(\d{2})(?::\d{2})?\s*(a\.?\s?m\.?|p\.?\s?m\.?|am|pm)?/i.exec(s);
  if (!m) return null;
  let h = +m[1]!;
  const suf = m[3]?.toLowerCase().replace(/[\s.]/g, "");
  if (suf === "pm" && h < 12) h += 12;
  if (suf === "am" && h === 12) h = 0;
  return h < 24 ? `${pad(h)}:${m[2]}` : null;
}

/** Ordena en el tiempo las lecturas que solo traen la hora: si la hora retrocede, pasó la medianoche. */
function armarTiempos(filas: { fecha: string | null; hora: string; s: number; d: number; fc?: number }[], inicio: string): LecturaMapa[] {
  let dia = inicio;
  let previa = -1;
  return filas.map((f) => {
    const mins = minutos(f.hora);
    if (f.fecha) dia = f.fecha;
    else if (previa >= 0 && mins < previa) dia = sumarDia(dia);
    previa = mins;
    const l: LecturaMapa = { t: `${dia}T${f.hora}`, s: f.s, d: f.d, ...(f.fc ? { fc: f.fc } : {}) };
    const art = motivoArtefacto(l);
    return art ? { ...l, excluida: { por: "Sistema", motivo: art } } : l;
  });
}

/** Lee lecturas desde una tabla (CSV / Excel exportado por el equipo de MAPA). */
export function lecturasDeTabla(filas: unknown[][], inicio: string): LecturaMapa[] {
  const txt = filas.map((f) => f.map((c) => String(c ?? "").trim()));
  const iCab = txt.findIndex((f) => f.some((c) => /sys|sist|^pas$|sbp|^ps$/i.test(sinTilde(c))) && f.some((c) => /^dia$|^dias$|diast|^pad$|dbp|^pd$/i.test(sinTilde(c))));
  if (iCab < 0) return lecturasDeTexto(txt.map((f) => f.join(" ")).join("\n"), inicio);
  const cab = txt[iCab]!.map(sinTilde);
  const col = (re: RegExp) => cab.findIndex((c) => re.test(c));
  const cS = col(/sys|sist|^pas$|sbp|^ps$/);
  const cD = col(/^dia$|^dias$|diast|^pad$|dbp|^pd$/);
  const cF = col(/^fc$|pulso|pulse|^hr$|frec|lpm|bpm|^pr$/);
  const cFH = col(/fecha.?y?.?hora|date.?time|fecha\/hora/);
  const cFe = cFH >= 0 ? -1 : col(/fecha|date|^dia$|^day$/);
  const cHo = cFH >= 0 ? -1 : col(/hora|time/);
  const out: { fecha: string | null; hora: string; s: number; d: number; fc?: number }[] = [];
  for (const f of txt.slice(iCab + 1)) {
    const s = Number((f[cS] ?? "").replace(",", "."));
    const d = Number((f[cD] ?? "").replace(",", "."));
    if (!s || !d) continue;
    const ref = cFH >= 0 ? f[cFH] ?? "" : `${cFe >= 0 ? f[cFe] ?? "" : ""} ${cHo >= 0 ? f[cHo] ?? "" : ""}`;
    const hora = horaDeTexto(ref);
    if (!hora) continue;
    const fc = cF >= 0 ? Number((f[cF] ?? "").replace(",", ".")) || undefined : undefined;
    out.push({ fecha: fechaDeTexto(ref), hora, s: Math.round(s), d: Math.round(d), ...(fc ? { fc: Math.round(fc) } : {}) });
  }
  return armarTiempos(out, inicio);
}

/** Lee lecturas pegadas como texto, una por línea: "14:30 128/82 74" o "27/11/2026 14:30 128 82 74". */
export function lecturasDeTexto(texto: string, inicio: string): LecturaMapa[] {
  const out: { fecha: string | null; hora: string; s: number; d: number; fc?: number }[] = [];
  for (const linea of texto.split(/\r?\n/)) {
    const hora = horaDeTexto(linea);
    if (!hora) continue;
    const fecha = fechaDeTexto(linea);
    // Los valores van después de la hora (lo que esté antes suele ser el número de lectura o la fecha)
    const reHora = /\d{1,2}:\d{2}(:\d{2})?\s*(a\.?\s?m\.?|p\.?\s?m\.?|am|pm)?/i;
    const mh = reHora.exec(linea);
    const despues = mh ? linea.slice(mh.index + mh[0].length).replace(/\d{1,4}[-/.]\d{1,2}[-/.]\d{2,4}/, " ") : "";
    const todo = linea.replace(/\d{1,4}[-/.]\d{1,2}[-/.]\d{2,4}/, " ").replace(reHora, " ");
    const numsDespues = (despues.match(/\d{2,3}/g) ?? []).map(Number);
    const nums = numsDespues.length >= 2 ? numsDespues : (todo.match(/\d{2,3}/g) ?? []).map(Number);
    const [s, d, fc] = nums;
    if (!s || !d) continue;
    out.push({ fecha, hora, s, d, ...(fc ? { fc } : {}) });
  }
  return armarTiempos(out, inicio);
}

/* ───────────── Gráfica del MAPA (SVG, sirve en pantalla y en el informe impreso) ───────────── */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const ms = (t: string) => new Date(`${t}:00`).getTime();

export function svgMapa(m: DatosMapa, opciones: { fc?: boolean } = {}) {
  const a = analizarMapa(m);
  const ls = a.ordenadas;
  if (!ls.length) return "";
  const W = 900, H = 320, P = { l: 42, r: 16, t: 18, b: 34 };
  const t0 = ms(ls[0]!.t), t1 = Math.max(ms(ls[ls.length - 1]!.t), t0 + 3600e3);
  const x = (t: string) => P.l + ((ms(t) - t0) / (t1 - t0)) * (W - P.l - P.r);
  const xm = (v: number) => P.l + ((v - t0) / (t1 - t0)) * (W - P.l - P.r);
  // La escala se arma con las lecturas válidas: un artefacto (ej. 300/20) no aplasta la gráfica
  const base = ls.filter((l) => !l.excluida).length ? ls.filter((l) => !l.excluida) : ls;
  const vals = base.flatMap((l) => [l.s, l.d, ...(opciones.fc && l.fc ? [l.fc] : [])]);
  const min = Math.max(0, Math.floor((Math.min(...vals, 60) - 5) / 20) * 20);
  const max = Math.ceil((Math.max(...vals, 160) + 5) / 20) * 20;
  const y = (v: number) => P.t + ((max - Math.min(max, Math.max(min, v))) / (max - min)) * (H - P.t - P.b);
  let g = "";
  // Bandas de sueño
  const hora = 3600e3;
  let cursor = new Date(t0); cursor.setMinutes(0, 0, 0);
  const tramos: { a: number; b: number; noche: boolean }[] = [];
  for (let t = cursor.getTime(); t < t1; t += 15 * 60e3) {
    const d = new Date(t);
    const n = esNocturna(`2000-01-01T${pad(d.getHours())}:${pad(d.getMinutes())}`, m.dormir, m.despertar);
    const a0 = Math.max(t, t0), b0 = Math.min(t + 15 * 60e3, t1);
    if (b0 <= a0) continue;
    const u = tramos[tramos.length - 1];
    if (u && u.noche === n && u.b === a0) u.b = b0; else tramos.push({ a: a0, b: b0, noche: n });
  }
  for (const tr of tramos) if (tr.noche) g += `<rect x="${xm(tr.a)}" y="${P.t}" width="${xm(tr.b) - xm(tr.a)}" height="${H - P.t - P.b}" fill="#1E3A8A" opacity=".07"/>`;
  for (let v = min; v <= max; v += 20) g += `<line x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}" stroke="#E2E8F0"/><text x="${P.l - 6}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="#64748B">${v}</text>`;
  // Umbrales: diurnos 135/85 y nocturnos 120/70, cada uno en su tramo
  for (const tr of tramos) {
    const u = tr.noche ? CRITERIOS_MAPA.noche : CRITERIOS_MAPA.dia;
    g += `<line x1="${xm(tr.a)}" x2="${xm(tr.b)}" y1="${y(u.s)}" y2="${y(u.s)}" stroke="#DC2626" stroke-dasharray="5 4" opacity=".55"/><line x1="${xm(tr.a)}" x2="${xm(tr.b)}" y1="${y(u.d)}" y2="${y(u.d)}" stroke="#F59E0B" stroke-dasharray="5 4" opacity=".7"/>`;
  }
  // Marcas de hora (cada 2 h)
  cursor = new Date(t0); cursor.setMinutes(0, 0, 0);
  for (let t = cursor.getTime() + hora; t <= t1; t += hora) {
    const d = new Date(t);
    if (d.getHours() % 2) continue;
    g += `<line x1="${xm(t)}" x2="${xm(t)}" y1="${H - P.b}" y2="${H - P.b + 4}" stroke="#94A3B8"/><text x="${xm(t)}" y="${H - P.b + 16}" text-anchor="middle" font-size="10" fill="#64748B">${pad(d.getHours())}:00</text>`;
  }
  const val = ls.filter((l) => !l.excluida);
  const linea = (k: "s" | "d" | "fc") => val.filter((l) => l[k]).map((l, i) => `${i ? "L" : "M"}${x(l.t).toFixed(1)} ${y(l[k]!).toFixed(1)}`).join(" ");
  // Rango sistólica-diastólica sombreado
  const area = val.length > 1 ? `<path d="${val.map((l, i) => `${i ? "L" : "M"}${x(l.t).toFixed(1)} ${y(l.s).toFixed(1)}`).join(" ")} ${[...val].reverse().map((l) => `L${x(l.t).toFixed(1)} ${y(l.d).toFixed(1)}`).join(" ")} Z" fill="#3B5BC0" opacity=".08"/>` : "";
  const puntos = ls.map((l) => {
    const n = esNocturna(l.t, m.dormir, m.despertar);
    const u = n ? CRITERIOS_MAPA.noche : CRITERIOS_MAPA.dia;
    const tip = `<title>${esc(`${horaDe(l.t)} ${n ? "(sueño)" : ""} · ${l.s}/${l.d} mmHg${l.fc ? ` · ${l.fc} lpm` : ""}${l.excluida ? ` · excluida: ${l.excluida.motivo}` : ""}`)}</title>`;
    if (l.excluida) return `<g>${tip}<circle cx="${x(l.t)}" cy="${y(l.s)}" r="3" fill="none" stroke="#94A3B8"/><circle cx="${x(l.t)}" cy="${y(l.d)}" r="3" fill="none" stroke="#94A3B8"/></g>`;
    return `<g>${tip}<circle cx="${x(l.t)}" cy="${y(l.s)}" r="${l.s >= u.s ? 3.8 : 3}" fill="${l.s >= u.s ? "#DC2626" : "#1E3A8A"}"/><circle cx="${x(l.t)}" cy="${y(l.d)}" r="${l.d >= u.d ? 3.8 : 3}" fill="${l.d >= u.d ? "#D97706" : "#10B981"}"/></g>`;
  }).join("");
  const fc = opciones.fc ? `<path d="${linea("fc")}" fill="none" stroke="#94A3B8" stroke-width="1.4" stroke-dasharray="2 3"/>` : "";
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,sans-serif" style="width:100%;height:auto" role="img" aria-label="Gráfica del MAPA de 24 horas">
${g}${area}<path d="${linea("s")}" fill="none" stroke="#1E3A8A" stroke-width="1.8"/><path d="${linea("d")}" fill="none" stroke="#10B981" stroke-width="1.8"/>${fc}${puntos}
<line x1="${P.l}" x2="${W - P.r}" y1="${H - P.b}" y2="${H - P.b}" stroke="#CBD5E1"/></svg>`;
}

/* ───────────── Informe imprimible ───────────── */
const fd = (f: string) => `${f.slice(8, 10)}/${f.slice(5, 7)}/${f.slice(0, 4)}`;
const fdh = (t: string) => `${fd(t.slice(0, 10))} ${horaDe(t)}`;

export function htmlInformeMapa(e: EstudioDx & { datos: DatosMapa }, opciones: { firma?: string | undefined } = {}) {
  const m = e.datos;
  const a = analizarMapa(m);
  const C = CRITERIOS_MAPA;
  const fila = (k: string, v: string) => `<tr><td>${k}</td><td><b>${v}</b></td></tr>`;
  const pr = (p: { n: number; s: number; d: number; fc: number | null }) => (p.n ? `${p.s}/${p.d} mmHg${p.fc ? ` · FC ${p.fc} lpm` : ""} (${p.n})` : "Sin lecturas");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>MAPA · ${esc(e.paciente)} · ${fd(e.fecha)}</title>
<style>body{font-family:system-ui,sans-serif;color:#0f172a;padding:30px;max-width:900px;margin:auto;font-size:12.5px}h1{font-size:19px;margin:0}h2{font-size:13px;margin:20px 0 8px;color:#1E3A8A;text-transform:uppercase;letter-spacing:.05em}
.m{color:#475569}table{width:100%;border-collapse:collapse}td,th{padding:4px 7px;border-bottom:1px solid #e2e8f0;text-align:left}th{background:#f5f7fa;font-size:10.5px;text-transform:uppercase;color:#475569}
.box{border:1px solid #e2e8f0;border-radius:12px;padding:10px}.cols{columns:3;column-gap:16px}.cols table{break-inside:avoid}.x{color:#94a3b8;text-decoration:line-through}.firme{margin-top:44px;display:flex;justify-content:flex-end}.firme div{border-top:1px solid #334155;padding-top:6px;min-width:240px;text-align:center}img{height:60px}</style></head><body>
<h1>HEGO · Centro de especialidades médicas</h1><p class="m"><b>Monitoreo Ambulatorio de la Presión Arterial (MAPA) de 24 horas</b> · criterios ${C.guias}</p>
<table>${fila("Paciente", `${esc(e.paciente)}${e.dni ? ` · C.C. ${e.dni}` : ""}`)}${fila("Fecha del estudio", fd(e.fecha))}${a.inicio && a.fin ? fila("Período", `${fdh(a.inicio)} a ${fdh(a.fin)}`) : ""}${fila("Horario de sueño", `${m.dormir} a ${m.despertar}`)}${e.solicitadoPor ? fila("Solicitado por", esc(e.solicitadoPor)) : ""}${m.equipo ? fila("Equipo", esc(m.equipo)) : ""}${e.motivo ? fila("Motivo", esc(e.motivo)) : ""}</table>
<h2>Resultados</h2><table>${fila("Promedio 24 h", pr(a.h24))}${fila("Promedio diurno (vigilia)", pr(a.dia))}${fila("Promedio nocturno (sueño)", pr(a.noche))}${fila("Descenso nocturno", a.caidaS !== null ? `Sistólica ${a.caidaS} % · diastólica ${a.caidaD} % · ${a.patron?.nombre ?? ""}` : "No se puede calcular")}${fila("Carga hipertensiva", `Diurna ${a.cargas.dia} % · nocturna ${a.cargas.noche} %`)}${a.max ? fila("Sistólica máxima", `${a.max.s}/${a.max.d} · ${fdh(a.max.t)}`) : ""}${a.min ? fila("Sistólica mínima", `${a.min.s}/${a.min.d} · ${fdh(a.min.t)}`) : ""}${fila("Variabilidad (DE sistólica)", `Diurna ${a.variabilidad.dia} · nocturna ${a.variabilidad.noche}`)}${fila("Lecturas", `${a.validas.length} válidas de ${a.ordenadas.length} (${a.calidad.pctValidas} %) · ${a.diur.length} diurnas · ${a.noct.length} nocturnas`)}</table>
<p><b>Resultado según los umbrales: ${a.resultado.titulo}.</b>${a.calidad.ok ? "" : ` <span class="m">Calidad del registro por debajo de lo recomendado: ${a.calidad.texto.join(", ")}.</span>`}</p>
<p class="m">Umbrales de hipertensión por MAPA: 24 h ≥ ${C.h24.s}/${C.h24.d} · diurno ≥ ${C.dia.s}/${C.dia.d} · nocturno ≥ ${C.noche.s}/${C.noche.d} mmHg.</p>
<h2>Gráfica</h2><div class="box">${svgMapa(m, { fc: true })}</div><p class="m">Zona sombreada: horario de sueño. Línea azul: sistólica · verde: diastólica · punteada gris: frecuencia cardíaca. Líneas cortadas: umbrales diurnos y nocturnos.</p>
<h2>Informe del médico</h2><p>${e.informe ? esc(e.informe).replace(/\n/g, "<br>") : "<span class='m'>Pendiente de informe.</span>"}</p>
<div class="firme"><div>${opciones.firma ? `<img src="${opciones.firma}"><br>` : ""}${esc(e.informadoPor?.nombre ?? e.solicitadoPor ?? "")}${e.informadoPor ? `<br><span class="m">${new Date(e.informadoPor.fecha).toLocaleDateString("es-CO")}</span>` : ""}</div></div>
<h2>Registro de mediciones</h2><div class="cols">${[0, 1, 2].map((k) => { const parte = a.ordenadas.filter((_, i) => i % 3 === k); return `<table><tr><th>Hora</th><th>PA</th><th>FC</th></tr>${parte.map((l) => `<tr class="${l.excluida ? "x" : ""}"><td>${horaDe(l.t)}${esNocturna(l.t, m.dormir, m.despertar) ? " ☾" : ""}</td><td>${l.s}/${l.d}</td><td>${l.fc ?? "—"}</td></tr>`).join("")}</table>`; }).join("")}</div>
<script>setTimeout(()=>window.print(),400)</script></body></html>`;
}
