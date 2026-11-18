/**
 * Monitoreo domiciliario de presión arterial (MDPA).
 * Tipos, criterios clínicos versionados y análisis. Lo usan el portal del paciente y el panel médico.
 * El MDPA NO es un MAPA de 24 horas: no permite clasificar el patrón nocturno (dipper, non-dipper, etc.).
 */
export const KEY_MDPA = "gb_mdpa";

export type MomentoMdpa = "Mañana" | "Mediodía" | "Tarde" | "Noche";
export const MOMENTOS_MDPA: MomentoMdpa[] = ["Mañana", "Mediodía", "Tarde", "Noche"];
export const SINTOMAS_MDPA = ["Cefalea", "Mareos", "Palpitaciones", "Dolor torácico", "Disnea", "Visión borrosa", "Otros"] as const;
/** Síntomas que, con cifras altas, requieren atención urgente. */
export const SINTOMAS_ALARMA = ["Dolor torácico", "Disnea", "Déficit neurológico", "Confusión", "Pérdida de conciencia"];

export type MedicionMdpa = {
  id: string;
  /** Fecha y hora de la toma (ISO). */
  fecha: string;
  momento: MomentoMdpa;
  /** 1.ª o 2.ª toma consecutiva de la sesión. */
  toma: 1 | 2;
  sesion: string;
  s: number;
  d: number;
  fc?: number;
  brazo: "Derecho" | "Izquierdo";
  posicion: "Sentado" | "Acostado";
  sintomas: string[];
  obs?: string;
  /** Cargada después (no en el momento): se identifica en el análisis. */
  retrospectiva?: boolean;
  /** Fuera del protocolo, tomada por iniciativa del paciente. */
  voluntaria?: boolean;
  registradoPor: string;
  registradoEl: string;
  /** Descartada por el médico: no entra en el análisis pero se conserva. */
  descartada?: { por: string; fecha: string; motivo: string };
  correcciones?: { por: string; fecha: string; antes: { s: number; d: number; fc?: number } }[];
};

export type ProtocoloMdpa = {
  tipo: "Estándar" | "Individual";
  dias: number;
  momentos: MomentoMdpa[];
  tomasPorSesion: 1 | 2;
  intervaloMin: number;
  brazo?: "Derecho" | "Izquierdo" | "Indistinto";
  objetivo: { s: number; d: number };
  descartarPrimerDia: boolean;
  instrucciones?: string;
  antesMedicacion?: boolean;
  /** Guía con la que se clasifica el promedio domiciliario (por defecto ESC 2024). */
  guia?: GuiaMdpa;
};

export type MonitoreoMdpa = {
  id: string;
  pacienteId: string;
  paciente: string;
  dni?: string;
  inicio: string; // YYYY-MM-DD
  protocolo: ProtocoloMdpa;
  motivo?: string;
  solicitadoPor: string;
  iniciadoPor: string;
  creado: string;
  mediciones: MedicionMdpa[];
  cerrado?: { por: string; fecha: string };
  revision?: { por: string; fecha: string; conclusion: string; validaAnalisis: boolean; comentarios?: string };
  evolucionId?: string;
  auditoria: { fecha: string; por: string; accion: string }[];
};

/* ───────────── Criterios clínicos (configuración versionada) ───────────── */
/**
 * Umbrales para el PROMEDIO DOMICILIARIO (no consultorio), revisados nov-2026:
 * - ESC 2024 (Guía de presión elevada e hipertensión): no elevada < 120/70; elevada 120–134 / 70–84; hipertensión ≥ 135/85.
 *   Objetivo en tratamiento: sistólica 120–129 si se tolera.
 * - AHA/ACC 2025 (reemplaza a 2017; valores domiciliarios equivalentes): normal < 120/80; elevada 120–129 / < 80;
 *   etapa 1: 130–134 / 80–84; etapa 2: ≥ 135/85. Objetivo < 130/80 (idealmente sistólica < 120). Severa > 180/120.
 * - ESH 2023 (y documento de posición ESH 2021 sobre AMPA): normal < 130/80; hipertensión ≥ 135/85. Grado 3 en consultorio ≥ 180/110.
 * - COLOMBIA (norma nacional, por defecto):
 *   · GPC No. 18 MinSalud/IETS, actualización parcial 2025: HTA con sistólica ≥ 130 y/o diastólica ≥ 80, confirmada con AMPA o MAPA;
 *     AMPA en la mañana y en la noche, 2 tomas con unos 2 minutos de diferencia; metas intensivas < 130/80.
 *   · Consenso intersocietario PresiónCo (Rev Colomb Cardiol 2023): AMPA ≥ 135/85; MAPA diurna ≥ 135/85, nocturna ≥ 120/70, 24 h ≥ 130/80.
 * - ISH 2020: hipertensión domiciliaria ≥ 135/85. Objetivo < 130/80 (< 140/90 en ≥ 65 años según tolerancia).
 */
export type GuiaMdpa = "Colombia 2025" | "ESC 2024" | "AHA/ACC 2025" | "ESH 2023" | "ISH 2020";
export type CategoriaMdpa = { nombre: string; rango: string; tono: "verde" | "ambar" | "naranja" | "rojo" };
type DefGuia = { nombre: string; categorias: (CategoriaMdpa & { desde: { s: number; d: number } })[]; objetivo: { s: number; d: number }; notaObjetivo: string };

export const GUIAS_MDPA: Record<GuiaMdpa, DefGuia> = {
  "Colombia 2025": {
    nombre: "Colombia · Consenso PresiónCo y GPC MinSalud/IETS 2025",
    categorias: [
      { nombre: "Normal", rango: "< 135/85", tono: "verde", desde: { s: 0, d: 0 } },
      { nombre: "Hipertensión", rango: "135–179 / 85–109", tono: "rojo", desde: { s: 135, d: 85 } },
      { nombre: "Hipertensión severa", rango: "≥ 180/110", tono: "rojo", desde: { s: 180, d: 110 } },
    ],
    objetivo: { s: 130, d: 80 },
    notaObjetivo: "Promedio en casa (AMPA): normal < 135/85; hipertensión ≥ 135/85 (PresiónCo). Meta en tratamiento < 130/80 (GPC MinSalud 2025). MAPA: 24 h ≥ 130/80, diurna ≥ 135/85, nocturna ≥ 120/70.",
  },
  "ESC 2024": {
    nombre: "ESC 2024 · Sociedad Europea de Cardiología",
    categorias: [
      { nombre: "No elevada", rango: "< 120/70", tono: "verde", desde: { s: 0, d: 0 } },
      { nombre: "Presión elevada", rango: "120–134 / 70–84", tono: "ambar", desde: { s: 120, d: 70 } },
      { nombre: "Hipertensión", rango: "≥ 135/85", tono: "rojo", desde: { s: 135, d: 85 } },
    ],
    objetivo: { s: 130, d: 80 },
    notaObjetivo: "En tratamiento: sistólica 120–129 mmHg si se tolera; más flexible en fragilidad, ≥ 85 años o hipotensión ortostática.",
  },
  "AHA/ACC 2025": {
    nombre: "AHA/ACC 2025 · Asociación Americana del Corazón / Colegio Americano de Cardiología",
    categorias: [
      { nombre: "Normal", rango: "< 120/80", tono: "verde", desde: { s: 0, d: 0 } },
      { nombre: "Presión elevada", rango: "120–129 / < 80", tono: "ambar", desde: { s: 120, d: 999 } },
      { nombre: "Hipertensión etapa 1", rango: "130–134 / 80–84", tono: "naranja", desde: { s: 130, d: 80 } },
      { nombre: "Hipertensión etapa 2", rango: "≥ 135/85", tono: "rojo", desde: { s: 135, d: 85 } },
    ],
    objetivo: { s: 130, d: 80 },
    notaObjetivo: "Objetivo < 130/80 mmHg, idealmente sistólica < 120 mmHg.",
  },
  "ESH 2023": {
    nombre: "ESH 2023 · Sociedad Europea de Hipertensión",
    categorias: [
      { nombre: "Normal", rango: "< 130/80", tono: "verde", desde: { s: 0, d: 0 } },
      { nombre: "Zona limítrofe", rango: "130–134 / 80–84", tono: "ambar", desde: { s: 130, d: 80 } },
      { nombre: "Hipertensión", rango: "≥ 135/85", tono: "rojo", desde: { s: 135, d: 85 } },
    ],
    objetivo: { s: 130, d: 80 },
    notaObjetivo: "Objetivo < 130/80 mmHg en la mayoría; < 140/90 en ≥ 80 años según tolerancia.",
  },
  "ISH 2020": {
    nombre: "ISH 2020 · Sociedad Internacional de Hipertensión",
    categorias: [
      { nombre: "Sin hipertensión", rango: "< 135/85", tono: "verde", desde: { s: 0, d: 0 } },
      { nombre: "Hipertensión", rango: "≥ 135/85", tono: "rojo", desde: { s: 135, d: 85 } },
    ],
    objetivo: { s: 130, d: 80 },
    notaObjetivo: "Objetivo < 130/80 mmHg (< 140/90 en ≥ 65 años según tolerancia).",
  },
};
export const GUIA_POR_DEFECTO: GuiaMdpa = "Colombia 2025";

/** Clasifica un promedio domiciliario según la guía elegida (la categoría más alta que cumpla sistólica O diastólica). */
export function clasificarDomiciliaria(s: number, d: number, guia: GuiaMdpa = GUIA_POR_DEFECTO): CategoriaMdpa {
  const cats = GUIAS_MDPA[guia].categorias;
  let r = cats[0]!;
  for (const c of cats) if (s >= c.desde.s || d >= c.desde.d) r = c;
  return { nombre: r.nombre, rango: r.rango, tono: r.tono };
}

export const CRITERIOS_MDPA = {
  version: "2026.3",
  fuentes: "GPC MinSalud/IETS Colombia 2025 · Consenso PresiónCo 2023 · ESC 2024 · AHA/ACC 2025 · ESH 2023 · ISH 2020",
  /** Umbral domiciliario de hipertensión, común a todas las guías vigentes. */
  hta: { s: 135, d: 85 },
  elevada: { s: 120, d: 70 },
  /** Objetivo por defecto en tratamiento (todas las guías vigentes: < 130/80). El médico lo ajusta por paciente. */
  objetivoPorDefecto: { s: 130, d: 80 },
  /** Alerta urgente: ≥ 180 y/o ≥ 110 (grado 3 ESH; AHA/ACC 2025 define hipertensión severa > 180/120). */
  urgente: { s: 180, d: 110 },
  atencion: { s: 160, d: 100 },
  hipotension: { s: 90, d: 60 },
  hipotensionSevera: { s: 80, d: 50 },
  /** Valores fisiológicamente imposibles o casi seguro error de digitación. */
  imposibles: { sMin: 50, sMax: 300, dMin: 25, dMax: 200, fcMin: 25, fcMax: 250, presionPulsoMin: 10 },
  /** Desviación estándar sistólica (mmHg) a partir de la cual se informa variabilidad elevada (orientativo). */
  variabilidadAltaDE: 15,
  /** Mínimo de días válidos y mediciones para concluir (ESH: idealmente 7 días, mínimo 3). */
  minDiasValidos: 3,
  minMediciones: 12,
} as const;

export const PROTOCOLO_ESTANDAR: ProtocoloMdpa = {
  tipo: "Estándar",
  dias: 7,
  momentos: ["Mañana", "Noche"],
  tomasPorSesion: 2,
  intervaloMin: 1,
  brazo: "Indistinto",
  objetivo: { ...CRITERIOS_MDPA.objetivoPorDefecto },
  descartarPrimerDia: true,
  antesMedicacion: true,
  guia: GUIA_POR_DEFECTO,
};

/* ───────────── Validación de una medición ───────────── */
export function validarMedicion(s: number, d: number, fc?: number): { error?: string; aviso?: string } {
  const c = CRITERIOS_MDPA.imposibles;
  if (!Number.isFinite(s) || !Number.isFinite(d)) return { error: "Escriba la presión sistólica y la diastólica." };
  if (s < c.sMin || s > c.sMax) return { error: `La sistólica (${s}) no es posible. Revise el número: debe estar entre ${c.sMin} y ${c.sMax}.` };
  if (d < c.dMin || d > c.dMax) return { error: `La diastólica (${d}) no es posible. Revise el número: debe estar entre ${c.dMin} y ${c.dMax}.` };
  if (d >= s) return { error: "La diastólica (el número de abajo) debe ser menor que la sistólica (el de arriba). ¿Los escribió al revés?" };
  if (s - d < c.presionPulsoMin) return { error: "La diferencia entre los dos valores es demasiado pequeña. Revise la lectura del tensiómetro." };
  if (fc !== undefined && (fc < c.fcMin || fc > c.fcMax)) return { error: `El pulso (${fc}) no es posible. Revise el número.` };
  if (s >= CRITERIOS_MDPA.urgente.s || d >= CRITERIOS_MDPA.urgente.d) return { aviso: "Cifra muy elevada." };
  if (s < CRITERIOS_MDPA.hipotensionSevera.s || d < CRITERIOS_MDPA.hipotensionSevera.d) return { aviso: "Cifra muy baja." };
  return {};
}

export type NivelAlerta = "Informativo" | "Atención" | "Urgente";
export type AlertaMdpa = { nivel: NivelAlerta; texto: string; fecha?: string; medicionId?: string };

/** Alertas de una sesión recién registrada (para el paciente). */
export function alertaSesion(ms: Pick<MedicionMdpa, "s" | "d" | "sintomas">[]): AlertaMdpa | null {
  if (!ms.length) return null;
  const sintomas = new Set(ms.flatMap((m) => m.sintomas));
  const alarma = [...sintomas].filter((x) => SINTOMAS_ALARMA.includes(x));
  const maxS = Math.max(...ms.map((m) => m.s));
  const maxD = Math.max(...ms.map((m) => m.d));
  const minS = Math.min(...ms.map((m) => m.s));
  const minD = Math.min(...ms.map((m) => m.d));
  const u = CRITERIOS_MDPA.urgente;
  if ((maxS >= u.s || maxD >= u.d) && alarma.length) return { nivel: "Urgente", texto: `Presión muy alta (${maxS}/${maxD}) con ${alarma.join(", ").toLowerCase()}. Busque atención médica de urgencia ahora: llame al 123 o acuda al servicio de urgencias más cercano. No espere a que el médico revise el registro.` };
  if (alarma.length) return { nivel: "Urgente", texto: `Reportó ${alarma.join(", ").toLowerCase()}. Si el síntoma es intenso, nuevo o no cede, busque atención de urgencia (línea 123) aunque la presión no esté muy alta.` };
  if (maxS >= u.s || maxD >= u.d) return { nivel: "Atención", texto: `Presión muy alta (${maxS}/${maxD}). Descanse 5 minutos sentado y vuelva a medir. Si sigue en 180/110 o más, o aparece dolor en el pecho, falta de aire, debilidad, confusión o alteración de la visión, busque atención de urgencia (línea 123).` };
  const h = CRITERIOS_MDPA.hipotensionSevera;
  if (minS < h.s || minD < h.d) return { nivel: "Atención", texto: `Presión baja (${minS}/${minD}). Siéntese o acuéstese y repita la medición. Si tiene mareo intenso, desmayo o confusión, busque atención médica.` };
  const hp = CRITERIOS_MDPA.hipotension;
  if ((minS < hp.s || minD < hp.d) && (sintomas.has("Mareos") || sintomas.has("Visión borrosa"))) return { nivel: "Atención", texto: `Presión baja (${minS}/${minD}) con ${[...sintomas].filter((x) => x === "Mareos" || x === "Visión borrosa").join(" y ").toLowerCase()}. Siéntese o acuéstese, hidrátese y repita la medición. Si empeora, consulte. No suspenda ni cambie su medicación sin hablar con su médico.` };
  if (minS < hp.s || minD < hp.d) return { nivel: "Informativo", texto: "Presión por debajo de 90/60. Continúe el protocolo; su médico revisará el registro." };
  const a = CRITERIOS_MDPA.atencion;
  if (maxS >= a.s || maxD >= a.d) return { nivel: "Informativo", texto: "Cifra por encima de lo esperado. Continúe el protocolo; su médico revisará el registro completo." };
  return null;
}

/* ───────────── Análisis ───────────── */
const prom = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);
const de = (xs: number[]) => {
  if (xs.length < 2) return 0;
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.round(Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1)) * 10) / 10;
};
export const diaDe = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
export function sumarDias(fecha: string, n: number) {
  const d = new Date(`${fecha}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-CA");
}
export const finDe = (m: MonitoreoMdpa) => sumarDias(m.inicio, m.protocolo.dias - 1);

export type EstadoMdpa = "Monitoreo no iniciado" | "Monitoreo en curso" | "Monitoreo incompleto" | "Monitoreo completado" | "Pendiente de revisión médica" | "Revisado por el médico" | "Requiere evaluación médica";

export function analizar(m: MonitoreoMdpa, hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" })) {
  const p = m.protocolo;
  const todas = [...m.mediciones].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const validas0 = todas.filter((x) => !x.descartada);
  const primerDia = m.inicio;
  const validas = p.descartarPrimerDia && new Set(validas0.map((x) => diaDe(x.fecha))).size > 1 ? validas0.filter((x) => diaDe(x.fecha) !== primerDia) : validas0;
  const S = validas.map((x) => x.s);
  const D = validas.map((x) => x.d);
  const FC = validas.flatMap((x) => (x.fc ? [x.fc] : []));
  const porMomento = MOMENTOS_MDPA.map((mo) => {
    const xs = validas.filter((x) => x.momento === mo);
    return { momento: mo, n: xs.length, s: prom(xs.map((x) => x.s)), d: prom(xs.map((x) => x.d)) };
  }).filter((x) => x.n > 0);
  const dias = [...new Set(todas.map((x) => diaDe(x.fecha)))].sort();
  const porDia = dias.map((dia) => {
    const xs = validas.filter((x) => diaDe(x.fecha) === dia);
    return { dia, n: xs.length, s: prom(xs.map((x) => x.s)), d: prom(xs.map((x) => x.d)), deS: de(xs.map((x) => x.s)), fc: prom(xs.flatMap((x) => (x.fc ? [x.fc] : []))) };
  });
  const esperadas = p.dias * p.momentos.length * p.tomasPorSesion;
  const protocolares = todas.filter((x) => !x.voluntaria).length;
  const cumplimiento = Math.min(100, Math.round((protocolares / Math.max(1, esperadas)) * 100));
  const obj = p.objetivo;
  const sobre = validas.filter((x) => x.s >= obj.s || x.d >= obj.d).length;
  const bajo = validas.filter((x) => x.s < CRITERIOS_MDPA.hipotension.s || x.d < CRITERIOS_MDPA.hipotension.d).length;
  const pS = prom(S);
  const pD = prom(D);
  const deS = de(S);
  const deD = de(D);
  const diasValidos = new Set(validas.map((x) => diaDe(x.fecha))).size;
  const suficiente = diasValidos >= CRITERIOS_MDPA.minDiasValidos && validas.length >= CRITERIOS_MDPA.minMediciones;
  const fin = finDe(m);
  const terminado = hoy > fin;
  // Tendencia: diferencia entre el promedio de la primera y la segunda mitad del período
  const conDatos = porDia.filter((x) => x.n > 0);
  const mitad = Math.floor(conDatos.length / 2);
  const tend = conDatos.length >= 4 ? Math.round(prom(conDatos.slice(conDatos.length - mitad).map((x) => x.s)) - prom(conDatos.slice(0, mitad).map((x) => x.s))) : null;

  // Alertas del período
  const alertas: AlertaMdpa[] = [];
  for (const x of validas) {
    const al = alertaSesion([x]);
    if (al && al.nivel !== "Informativo") alertas.push({ ...al, fecha: x.fecha, medicionId: x.id, texto: `${x.s}/${x.d} mmHg${x.sintomas.length ? ` · ${x.sintomas.join(", ")}` : ""}` });
  }
  const seguidas = (() => {
    let max = 0, act = 0;
    for (const x of validas) { if (x.s >= obj.s || x.d >= obj.d) { act++; max = Math.max(max, act); } else act = 0; }
    return max;
  })();
  if (seguidas >= 4) alertas.push({ nivel: "Atención", texto: `${seguidas} mediciones seguidas por encima del objetivo (${obj.s}/${obj.d}).` });
  if (deS >= CRITERIOS_MDPA.variabilidadAltaDE) alertas.push({ nivel: "Informativo", texto: `Variabilidad sistólica elevada (DE ${deS} mmHg).` });

  // Interpretación orientativa (nunca diagnóstico definitivo)
  const c = CRITERIOS_MDPA;
  const guia = p.guia ?? GUIA_POR_DEFECTO;
  const categoria = clasificarDomiciliaria(pS, pD, guia);
  let interpretacion: string;
  if (!suficiente) interpretacion = `Datos insuficientes para una conclusión: se necesitan al menos ${c.minDiasValidos} días válidos y ${c.minMediciones} mediciones (hay ${diasValidos} días y ${validas.length} mediciones válidas).`;
  else if (pS < c.hipotension.s || pD < c.hipotension.d) interpretacion = `Promedio domiciliario bajo (${pS}/${pD} mmHg): posible hipotensión; valorar síntomas y tratamiento.`;
  else {
    const base = `Promedio domiciliario ${pS}/${pD} mmHg: «${categoria.nombre}» (${categoria.rango}) según ${guia}.`;
    const vsObj = pS >= obj.s || pD >= obj.d ? ` Por encima del objetivo individual (< ${obj.s}/${obj.d}).` : ` Dentro del objetivo individual (< ${obj.s}/${obj.d}).`;
    const hta = pS >= c.hta.s || pD >= c.hta.d ? " Alcanza el umbral domiciliario de hipertensión (≥ 135/85): en paciente tratado sugiere hipertensión no controlada; sin tratamiento, compatible con hipertensión según el contexto clínico." : "";
    interpretacion = base + vsObj + hta;
  }

  let estado: EstadoMdpa;
  if (m.revision) estado = "Revisado por el médico";
  else if (alertas.some((a) => a.nivel === "Urgente")) estado = "Requiere evaluación médica";
  else if (m.cerrado || terminado) estado = cumplimiento >= 70 && suficiente ? "Pendiente de revisión médica" : "Monitoreo incompleto";
  else if (todas.length === 0 && hoy < m.inicio) estado = "Monitoreo no iniciado";
  else estado = "Monitoreo en curso";

  const diaN = Math.max(0, Math.min(p.dias, Math.floor((new Date(`${hoy}T12:00:00`).getTime() - new Date(`${m.inicio}T12:00:00`).getTime()) / 86400000) + 1));
  return {
    todas, validas, excluidas: todas.length - validas.length, pS, pD, deS, deD, fc: prom(FC), porMomento, porDia, dias: dias.length, diasValidos,
    esperadas, cumplimiento, sobre, bajo, pctSobre: validas.length ? Math.round((sobre / validas.length) * 100) : 0, pctBajo: validas.length ? Math.round((bajo / validas.length) * 100) : 0,
    suficiente, tendencia: tend, alertas, interpretacion, guia, categoria, estado, fin, diaN, ultima: todas[todas.length - 1],
    calidad: todas.length ? Math.round(((todas.length - todas.filter((x) => x.retrospectiva).length) / todas.length) * 100) : 0,
  };
}

export const PATRON_NOCTURNO = "Patrón nocturno no evaluable mediante este protocolo de medición domiciliaria. Para determinar el comportamiento tensional durante el sueño se requiere un registro nocturno válido, habitualmente mediante MAPA de 24 horas.";
export const AVISO_IA = "Análisis asistido por sistema — requiere validación del médico tratante.";
