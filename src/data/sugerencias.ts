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
