/**
 * Sugerencias para el texto predictivo de la historia clínica.
 * Son frases de uso habitual en la consulta en Colombia; el médico siempre puede escribir libre.
 */
export const MOTIVOS_CONSULTA = [
  "Control", "Primera vez", "Control de hipertensión arterial", "Control de diabetes mellitus", "Control de enfermedad renal crónica",
  "Control posoperatorio", "Lectura de exámenes", "Lectura de estudios", "Renovación de fórmula", "Dolor torácico", "Disnea", "Palpitaciones",
  "Síncope", "Mareo", "Cefalea", "Edema de miembros inferiores", "Hipertensión arterial descompensada", "Dolor abdominal", "Fiebre", "Tos",
  "Fatiga", "Pérdida de peso", "Dolor lumbar", "Dolor articular", "Disuria", "Hematuria", "Oliguria", "Valoración prequirúrgica",
  "Chequeo preventivo", "Valoración cardiovascular", "Seguimiento de tratamiento", "Ajuste de medicación", "Resultado de Holter",
  "Resultado de MAPA", "Resultado de ecocardiograma", "Valoración para actividad física",
];

export const SINTOMAS = [
  "Dolor torácico opresivo", "Dolor torácico punzante", "Disnea de esfuerzo", "Disnea de reposo", "Ortopnea", "Disnea paroxística nocturna",
  "Palpitaciones", "Síncope", "Presíncope", "Mareo", "Cefalea", "Visión borrosa", "Tinnitus", "Edema de miembros inferiores", "Fatiga",
  "Astenia", "Adinamia", "Tos seca", "Tos productiva", "Fiebre", "Escalofríos", "Diaforesis", "Náuseas", "Vómito", "Dolor abdominal",
  "Diarrea", "Estreñimiento", "Pérdida de peso", "Aumento de peso", "Poliuria", "Polidipsia", "Polifagia", "Nicturia", "Disuria", "Hematuria",
  "Orina espumosa", "Oliguria", "Prurito", "Calambres", "Parestesias", "Debilidad muscular", "Dolor lumbar", "Artralgias", "Mialgias",
  "Insomnio", "Ansiedad", "Claudicación intermitente", "Niega dolor torácico", "Niega disnea", "Niega síncope", "Asintomático",
];

export const EXAMEN_FISICO = [
  "Paciente en buen estado general", "Alerta, orientado en tiempo, espacio y persona", "Hidratado, afebril", "Mucosas húmedas y rosadas",
  "Cuello sin ingurgitación yugular", "Sin adenopatías", "Ruidos cardíacos rítmicos, sin soplos", "Ruidos cardíacos arrítmicos",
  "Soplo sistólico", "Murmullo vesicular conservado", "Sin agregados pulmonares", "Estertores bibasales", "Abdomen blando, depresible, no doloroso",
  "Sin signos de irritación peritoneal", "Ruidos intestinales presentes", "Puño percusión renal negativa", "Extremidades sin edema",
  "Edema grado I en miembros inferiores", "Edema grado II en miembros inferiores", "Pulsos periféricos presentes y simétricos",
  "Llenado capilar menor de 2 segundos", "Sin déficit neurológico aparente", "Fuerza y sensibilidad conservadas", "Piel sin lesiones",
];

export const CONDUCTA = [
  // Indicaciones
  "Continuar manejo actual", "Dieta hiposódica", "Dieta baja en grasas", "Dieta para diabético", "Restricción hídrica", "Actividad física regular",
  "Caminar 30 minutos diarios", "Suspender tabaco", "Disminuir consumo de alcohol", "Control de peso", "Control de presión arterial en casa",
  "Glucometrías en casa", "Signos de alarma explicados", "Consultar a urgencias si presenta dolor torácico", "Adherencia al tratamiento",
  "Control en 1 mes", "Control en 3 meses", "Control en 6 meses", "Control con resultados", "Remisión a nutrición", "Remisión a oftalmología",
  "Remisión a endocrinología", "Remisión a nefrología", "Remisión a cardiología", "Remisión a medicina interna", "Interconsulta",
  "Incapacidad médica", "Fórmula médica entregada",
  // Estudios y procedimientos
  "Electrocardiograma", "Ecocardiograma transtorácico", "Holter de 24 horas", "Monitoreo ambulatorio de presión arterial (MAPA)",
  "Prueba de esfuerzo", "Radiografía de tórax", "Ecografía renal", "Ecografía abdominal total", "Doppler de miembros inferiores",
  "Cuadro hemático", "Glicemia en ayunas", "Hemoglobina glicosilada", "Perfil lipídico", "Creatinina", "Nitrógeno ureico (BUN)",
  "Parcial de orina", "Microalbuminuria", "Ionograma (sodio, potasio, cloro)", "TSH", "Ácido úrico", "Pruebas de función hepática",
];

const nz = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Fragmento que se está escribiendo (después del último salto de línea, coma, punto y coma o viñeta). */
export function fragmentoActual(texto: string): string {
  const m = /[^\n,;•]*$/.exec(texto);
  return (m?.[0] ?? "").replace(/^[\s:-]+/, "");
}

/** Sugerencias para el fragmento que se está escribiendo. */
export function sugerirFrase(listas: string[][], texto: string, max = 6): string[] {
  const f = nz(fragmentoActual(texto).trim());
  if (f.length < 2) return [];
  const todas = [...new Set(listas.flat())];
  const empieza = todas.filter((x) => nz(x).startsWith(f));
  const palabra = todas.filter((x) => !empieza.includes(x) && nz(x).split(/[\s(/]+/).some((w) => w.startsWith(f)));
  const contiene = f.length >= 3 ? todas.filter((x) => !empieza.includes(x) && !palabra.includes(x) && nz(x).includes(f)) : [];
  return [...empieza, ...palabra, ...contiene].filter((x) => nz(x) !== f).slice(0, max);
}

/** Reemplaza el fragmento que se está escribiendo por la sugerencia elegida. */
export function completarFrase(texto: string, sugerencia: string): string {
  const frag = fragmentoActual(texto);
  const base = texto.slice(0, texto.length - frag.length);
  return `${base}${sugerencia}`;
}

/** Frases ya escritas en registros anteriores (para que el sistema aprenda el vocabulario del equipo). */
export function frasesDe(textos: (string | undefined)[], max = 400): string[] {
  const out = new Set<string>();
  for (const t of textos) {
    if (!t) continue;
    for (const p of t.split(/[\n;•]+/)) {
      const x = p.replace(/^[\s\-:]+|[\s.]+$/g, "").trim();
      if (x.length >= 4 && x.length <= 90 && !/:$/.test(x)) out.add(x.charAt(0).toUpperCase() + x.slice(1));
      if (out.size >= max) return [...out];
    }
  }
  return [...out];
}

export const FRECUENCIAS = ["Cada 4 horas", "Cada 6 horas", "Cada 8 horas", "Cada 12 horas", "Cada 24 horas", "Una vez al día en la mañana", "Una vez al día en la noche", "Cada 48 horas", "Una vez a la semana", "Según necesidad", "Dosis única"];
export const DURACIONES = ["Dosis única", "3 días", "5 días", "7 días", "10 días", "14 días", "1 mes", "3 meses", "6 meses", "Uso crónico (indefinido)"];
export const VIAS = ["Oral", "Sublingual", "Intravenosa", "Intramuscular", "Subcutánea", "Inhalada", "Tópica", "Oftálmica", "Nasal", "Rectal", "Transdérmica"];
/** Horarios sugeridos para el recordatorio del portal según la frecuencia. */
export function horariosDeFrecuencia(f: string): string[] {
  const m: Record<string, string[]> = {
    "Cada 4 horas": ["06:00", "10:00", "14:00", "18:00", "22:00"],
    "Cada 6 horas": ["06:00", "12:00", "18:00", "00:00"],
    "Cada 8 horas": ["06:00", "14:00", "22:00"],
    "Cada 12 horas": ["08:00", "20:00"],
    "Cada 24 horas": ["08:00"],
    "Una vez al día en la mañana": ["08:00"],
    "Una vez al día en la noche": ["20:00"],
  };
  return m[f] ?? [];
}

/* ───────────── Estudios diagnósticos (fuera del laboratorio clínico) ───────────── */
export type TipoOrden = "Laboratorio clínico" | "Imágenes diagnósticas" | "Estudios cardiológicos" | "Otros estudios diagnósticos";
export type EstudioCat = { nombre: string; sin: string[]; tipo: TipoOrden; grupo: string };
const ESTUDIOS_DATOS: { tipo: TipoOrden; grupo: string; filas: string[] }[] = [
  { tipo: "Imágenes diagnósticas", grupo: "Radiología", filas: [
    "Radiografía de tórax PA y lateral|rx torax, placa de torax", "Radiografía de tórax portátil|rx torax", "Radiografía de abdomen simple|rx abdomen",
    "Radiografía de columna cervical|rx cervical", "Radiografía de columna dorsal|rx dorsal", "Radiografía de columna lumbosacra|rx lumbar",
    "Radiografía de pelvis|rx cadera", "Radiografía de rodilla|rx rodilla", "Radiografía de hombro|rx hombro", "Radiografía de mano|rx mano",
    "Radiografía de pie|rx pie", "Radiografía de tobillo|rx tobillo", "Radiografía de senos paranasales|rx senos", "Radiografía de cráneo|rx craneo",
    "Radiografía de huesos largos|rx femur, rx tibia, rx humero", "Urografía excretora|uro", "Esofagograma|trago de bario",
  ] },
  { tipo: "Imágenes diagnósticas", grupo: "Ecografía", filas: [
    "Ecografía de abdomen total|eco abdominal", "Ecografía de hígado y vías biliares|eco hepatobiliar, vesicula", "Ecografía renal y de vías urinarias|eco renal, riñones",
    "Ecografía de vejiga y próstata|eco prostata", "Ecografía pélvica transabdominal|eco pelvica", "Ecografía transvaginal|eco tv", "Ecografía obstétrica|eco embarazo",
    "Ecografía de tiroides|eco tiroides", "Ecografía de cuello|eco cuello", "Ecografía de mama|eco mamaria", "Ecografía testicular|eco testiculos",
    "Ecografía de tejidos blandos|eco partes blandas", "Ecografía de hombro|eco hombro", "Ecografía de rodilla|eco rodilla",
    "Doppler venoso de miembros inferiores|doppler venoso, trombosis", "Doppler arterial de miembros inferiores|doppler arterial",
    "Doppler de vasos del cuello (carotídeo)|doppler carotideo, carotidas", "Doppler de arterias renales|doppler renal", "Doppler venoso de miembros superiores|doppler brazos",
  ] },
  { tipo: "Imágenes diagnósticas", grupo: "Tomografía (TAC)", filas: [
    "Tomografía de cráneo simple|tac craneo, scanner", "Tomografía de cráneo con contraste|tac craneo contrastado", "Tomografía de tórax simple|tac torax",
    "Tomografía de tórax de alta resolución|tacar", "Angiotomografía de tórax (TEP)|angiotac pulmonar, embolia", "Tomografía de abdomen y pelvis con contraste|tac abdomen",
    "Urotomografía|urotac, calculos", "Tomografía de senos paranasales|tac senos", "Tomografía de columna lumbar|tac lumbar",
    "Angiotomografía coronaria|angiotac coronario, coronarias", "Score de calcio coronario|calcio coronario", "Angiotomografía de aorta|angiotac aorta",
  ] },
  { tipo: "Imágenes diagnósticas", grupo: "Resonancia magnética", filas: [
    "Resonancia magnética de cerebro simple|rm cerebral, rmn", "Resonancia magnética de cerebro con contraste|rm cerebral contrastada", "Resonancia magnética de columna cervical|rm cervical",
    "Resonancia magnética de columna lumbar|rm lumbar", "Resonancia magnética de rodilla|rm rodilla", "Resonancia magnética de hombro|rm hombro",
    "Resonancia magnética de abdomen|rm abdomen", "Colangiorresonancia|colangio rm", "Resonancia magnética de pelvis|rm pelvis",
    "Resonancia magnética cardíaca|rm cardiaca, cardiorresonancia", "Angiorresonancia de arterias renales|angio rm renal", "Angiorresonancia cerebral|angio rm cerebral",
  ] },
  { tipo: "Imágenes diagnósticas", grupo: "Otros estudios de imagen", filas: [
    "Mamografía bilateral|mamografia", "Densitometría ósea|densitometria, osteoporosis", "Gammagrafía de perfusión miocárdica|perfusion miocardica, spect",
    "Gammagrafía renal|gammagrafia renal, dmsa", "Gammagrafía ósea|gammagrafia osea", "Gammagrafía de tiroides|gammagrafia tiroides",
  ] },
  { tipo: "Estudios cardiológicos", grupo: "Cardiología", filas: [
    "Electrocardiograma de 12 derivaciones|ecg, ekg, electro", "Ecocardiograma transtorácico|eco cardio, ecocardiografia", "Ecocardiograma transesofágico|eco te",
    "Ecocardiograma de estrés con dobutamina|eco estres", "Holter de ritmo cardíaco de 24 horas|holter", "Monitoreo ambulatorio de presión arterial (MAPA)|mapa, presurometro",
    "Prueba de esfuerzo convencional|ergometria", "Prueba de mesa basculante (tilt test)|tilt", "Cateterismo cardíaco|coronariografia",
  ] },
  { tipo: "Otros estudios diagnósticos", grupo: "Otros", filas: [
    "Espirometría pre y posbroncodilatador|espirometria", "Endoscopia de vías digestivas altas|eda, endoscopia", "Colonoscopia total|colonoscopia",
    "Electroencefalograma|eeg", "Electromiografía y velocidad de conducción|emg, neuroconduccion", "Polisomnografía|apnea del sueño",
    "Audiometría|audiometria", "Fondo de ojo|oftalmoscopia", "Biopsia|biopsia", "Citología cervicovaginal|citologia",
  ] },
];
export const ESTUDIOS_DIAGNOSTICOS: EstudioCat[] = ESTUDIOS_DATOS.flatMap(({ tipo, grupo, filas }) => filas.map((f) => { const [nombre, sin] = f.split("|"); return { nombre: nombre!, sin: (sin ?? "").split(",").map((x) => x.trim()).filter(Boolean), tipo, grupo }; }));
