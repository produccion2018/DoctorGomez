import type { Doctor } from "@/lib/clinic/types";

export const CLINICA = {
  nombre: "Clínica Gómez Bolaño",
  claim: "Centro médico especializado en Medicina Interna, Nefrología y Cardiología",
  direccion: "Av. Libertador 2450, Piso 3 — Ciudad",
  telefono: "+54 11 4000-1200",
  whatsapp: "+54 9 11 6000-1200",
  email: "contacto@clinicagomezbolano.com",
  horarios: "Lunes a viernes de 08:00 a 20:00 · Sábados de 09:00 a 13:00",
};

export const DOCTORS: Doctor[] = [
  {
    id: "d1",
    nombre: "Dr. Carlos Alberto Gómez Bolaño",
    titulo: "Especialista en Medicina Interna y Nefrología",
    especialidades: ["Medicina Interna", "Nefrología"],
    matricula: "MN 84.512",
    bio: "Referente en medicina interna y enfermedad renal crónica, con enfoque en diagnóstico integral y seguimiento longitudinal del paciente.",
    formacion: [
      "Médico Cirujano — Universidad de Guayaquil, Ecuador",
      "Especialista en Medicina Interna — Universidad del Zulia, Unidad Docente Hospital General del Sur, Maracaibo",
      "Especialista en Nefrología — Universidad del Zulia, Unidad Docente Hospital Universitario de Maracaibo",
    ],
    areas: [
      "Enfermedad renal crónica",
      "Hipertensión arterial",
      "Diabetes y síndrome metabólico",
      "Trastornos hidroelectrolíticos",
      "Evaluación prequirúrgica",
      "Seguimiento de enfermedades crónicas",
    ],
    foto: "alberto",
    consultorio: "Consultorio 3",
    dias: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
  },
  {
    id: "d2",
    nombre: "Dr. Carlos Alonso Gómez Bolaño",
    titulo: "Especialista en Medicina Interna y Cardiología",
    especialidades: ["Medicina Interna", "Cardiología", "Cardiología Crítica", "Ecocardiografía"],
    matricula: "MN 84.513",
    bio: "Cardiólogo con magíster en Cardiología Crítica y Ecocardiografía, dedicado a la prevención cardiovascular y al diagnóstico por imágenes cardíacas.",
    formacion: [
      "Especialista en Medicina Interna",
      "Especialista en Cardiología",
      "Magíster en Cardiología Crítica y Ecocardiografía",
    ],
    areas: [
      "Prevención cardiovascular",
      "Insuficiencia cardíaca",
      "Arritmias",
      "Ecocardiografía doppler",
      "Cardiopatía isquémica",
      "Evaluación de riesgo cardiovascular",
    ],
    foto: "alonso",
    consultorio: "Consultorio 5",
    dias: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
  },
];

export const ESPECIALIDADES = [
  {
    slug: "medicina-interna",
    nombre: "Medicina Interna",
    icono: "stethoscope",
    doctorIds: ["d1", "d2"],
    descripcion:
      "Evaluación clínica integral del paciente adulto, con una mirada global que conecta todos los sistemas del organismo.",
    aborda: [
      "Diagnóstico de enfermedades complejas",
      "Hipertensión, diabetes y dislipemias",
      "Chequeos y prevención",
      "Evaluación prequirúrgica",
      "Coordinación entre especialidades",
    ],
    cuando: [
      "Síntomas persistentes sin diagnóstico claro",
      "Múltiples enfermedades crónicas simultáneas",
      "Necesidad de un control clínico anual",
      "Alteraciones en estudios de laboratorio",
    ],
    estudios: ["Laboratorio completo", "Perfil metabólico", "Electrocardiograma", "Ecografía abdominal"],
    seguimiento:
      "Controles programados cada 3 a 6 meses con revisión de estudios y ajuste terapéutico documentado en la historia clínica.",
  },
  {
    slug: "nefrologia",
    nombre: "Nefrología",
    icono: "kidney",
    doctorIds: ["d1"],
    descripcion:
      "Diagnóstico, tratamiento y seguimiento de las enfermedades del riñón y del medio interno.",
    aborda: [
      "Enfermedad renal crónica",
      "Hipertensión de causa renal",
      "Proteinuria y hematuria",
      "Litiasis renal",
      "Trastornos hidroelectrolíticos",
    ],
    cuando: [
      "Creatinina o filtrado glomerular alterados",
      "Presencia de proteínas o sangre en orina",
      "Hipertensión de difícil control",
      "Antecedentes familiares de enfermedad renal",
    ],
    estudios: ["Función renal", "Orina completa y proteinuria 24h", "Ecografía renal", "Doppler renal"],
    seguimiento:
      "Plan de nefroprotección con controles trimestrales, ajuste de medicación y educación sobre hábitos y dieta.",
  },
  {
    slug: "cardiologia",
    nombre: "Cardiología",
    icono: "heart",
    doctorIds: ["d2"],
    descripcion:
      "Prevención, diagnóstico y tratamiento de las enfermedades del corazón y del sistema vascular.",
    aborda: [
      "Hipertensión arterial",
      "Cardiopatía isquémica",
      "Insuficiencia cardíaca",
      "Arritmias",
      "Riesgo cardiovascular global",
    ],
    cuando: [
      "Dolor de pecho o palpitaciones",
      "Falta de aire con el esfuerzo",
      "Antecedentes familiares cardíacos",
      "Control de deportistas y prequirúrgico",
    ],
    estudios: ["Electrocardiograma", "Ergometría", "Holter 24h", "Ecocardiograma doppler"],
    seguimiento:
      "Programa de prevención cardiovascular con controles semestrales y monitoreo de factores de riesgo.",
  },
  {
    slug: "cardiologia-critica",
    nombre: "Cardiología Crítica",
    icono: "activity",
    doctorIds: ["d2"],
    descripcion:
      "Abordaje del paciente cardiovascular de alta complejidad y evaluación en escenarios de riesgo.",
    aborda: [
      "Insuficiencia cardíaca descompensada",
      "Síndromes coronarios",
      "Monitoreo hemodinámico",
      "Evaluación post internación",
    ],
    cuando: [
      "Alta reciente por evento cardiovascular",
      "Descompensaciones frecuentes",
      "Necesidad de ajuste intensivo de tratamiento",
    ],
    estudios: ["Ecocardiografía a la cabecera", "Biomarcadores cardíacos", "Monitoreo ambulatorio de presión"],
    seguimiento:
      "Controles cercanos durante los primeros 90 días post evento, con plan escrito de señales de alarma.",
  },
  {
    slug: "ecocardiografia",
    nombre: "Ecocardiografía",
    icono: "waves",
    doctorIds: ["d2"],
    descripcion:
      "Estudio por imágenes que evalúa en tiempo real la estructura y función del corazón, sin radiación.",
    aborda: [
      "Función ventricular",
      "Valvulopatías",
      "Miocardiopatías",
      "Presión pulmonar estimada",
    ],
    cuando: [
      "Soplo cardíaco detectado",
      "Disnea o edemas",
      "Control de valvulopatía conocida",
      "Seguimiento de insuficiencia cardíaca",
    ],
    estudios: ["Ecocardiograma doppler color", "Ecocardiograma de estrés", "Doppler vascular"],
    seguimiento:
      "Informe entregado el mismo día en el portal del paciente y revisión con el cardiólogo tratante.",
  },
];

export const SERVICIOS = [
  { id: "s1", nombre: "Consulta de Medicina Interna", icono: "stethoscope", especialidad: "Medicina Interna", doctorId: "d1", duracion: 40, precio: 32000, descripcion: "Evaluación clínica integral con revisión de antecedentes y estudios." },
  { id: "s2", nombre: "Consulta de Nefrología", icono: "droplets", especialidad: "Nefrología", doctorId: "d1", duracion: 40, precio: 36000, descripcion: "Valoración de la función renal y plan de nefroprotección." },
  { id: "s3", nombre: "Consulta de Cardiología", icono: "heart", especialidad: "Cardiología", doctorId: "d2", duracion: 40, precio: 36000, descripcion: "Evaluación cardiológica completa con electrocardiograma incluido." },
  { id: "s4", nombre: "Evaluación cardiovascular", icono: "activity", especialidad: "Cardiología", doctorId: "d2", duracion: 60, precio: 52000, descripcion: "Estratificación de riesgo cardiovascular y plan preventivo." },
  { id: "s5", nombre: "Evaluación renal", icono: "flask-conical", especialidad: "Nefrología", doctorId: "d1", duracion: 60, precio: 48000, descripcion: "Análisis funcional del riñón con interpretación de laboratorio e imágenes." },
  { id: "s6", nombre: "Seguimiento de enfermedades crónicas", icono: "clipboard-list", especialidad: "Medicina Interna", doctorId: "d1", duracion: 30, precio: 28000, descripcion: "Control programado de diabetes, hipertensión y dislipemia." },
  { id: "s7", nombre: "Prevención cardiovascular", icono: "shield-check", especialidad: "Cardiología", doctorId: "d2", duracion: 45, precio: 42000, descripcion: "Programa personalizado de prevención primaria y secundaria." },
  { id: "s8", nombre: "Estudios cardiológicos", icono: "line-chart", especialidad: "Cardiología", doctorId: "d2", duracion: 45, precio: 45000, descripcion: "Electrocardiograma, ergometría y Holter con informe profesional." },
  { id: "s9", nombre: "Ecocardiografía", icono: "waves", especialidad: "Ecocardiografía", doctorId: "d2", duracion: 45, precio: 58000, descripcion: "Ecocardiograma doppler color con informe el mismo día." },
  { id: "s10", nombre: "Segunda opinión médica", icono: "users", especialidad: "Medicina Interna", doctorId: "d2", duracion: 45, precio: 40000, descripcion: "Revisión de diagnóstico y tratamiento por un segundo especialista." },
  { id: "s11", nombre: "Seguimiento integral", icono: "calendar-check", especialidad: "Medicina Interna", doctorId: "d1", duracion: 30, precio: 26000, descripcion: "Plan de controles coordinado entre las distintas especialidades." },
];

export const FAQS = [
  { q: "¿Cómo solicito un turno?", a: "Podés reservar desde la sección Turnos eligiendo especialidad, profesional, fecha y horario. Recibirás la confirmación en tu portal de paciente." },
  { q: "¿Necesito derivación para una consulta?", a: "No es necesaria. Podés consultar directamente con Medicina Interna, Nefrología o Cardiología." },
  { q: "¿Cuánto demora la entrega de estudios?", a: "Los estudios cardiológicos se informan el mismo día y quedan disponibles en la sección Estudios del portal." },
  { q: "¿Puedo reprogramar o cancelar mi turno?", a: "Sí. Desde Mis turnos podés cancelar o reprogramar; el horario liberado vuelve a quedar disponible automáticamente." },
  { q: "¿Atienden teleconsulta?", a: "Sí, la modalidad de teleconsulta está disponible para controles y seguimiento de enfermedades crónicas." },
  { q: "¿Qué debo llevar a la primera consulta?", a: "Documento de identidad, estudios previos y la lista de medicación que estés tomando." },
];

export const HORARIOS_BASE = [
  "08:00", "08:40", "09:20", "10:00", "10:40", "11:20",
  "12:00", "14:00", "14:40", "15:20", "16:00", "16:40", "17:20", "18:00",
];
