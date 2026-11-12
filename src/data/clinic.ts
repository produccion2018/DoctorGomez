import type { Doctor } from "@/lib/clinic/types";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ClipboardCheck,
  Droplets,
  Dumbbell,
  FlaskConical,
  Gauge,
  HeartPulse,
  ScanLine,
  Stethoscope,
  TestTube,
  Video,
  Watch,
  Waves,
} from "lucide-react";
import fotoAlberto from "@/assets/doctor-alberto.jpg";
import fotoAlonso from "@/assets/doctor-alonso.jpg";
import imgInterna from "@/assets/medicina-interna.jpg";
import imgNefro from "@/assets/nefrologia.jpg";
import imgCardio from "@/assets/cardiologia.jpg";
import imgClinica from "@/assets/clinica.jpg";

import img_cardiologia_critica from "@/assets/esp-cardiologia-critica.jpg";
import img_ecocardiografia from "@/assets/esp-ecocardiografia.jpg";
import img_hipertension_arterial from "@/assets/esp-hipertension-arterial.jpg";
import img_diabetes_metabolismo from "@/assets/esp-diabetes-metabolismo.jpg";
import img_holter_mapa from "@/assets/esp-holter-mapa.jpg";
import img_diagnostico_por_imagenes from "@/assets/esp-diagnostico-por-imagenes.jpg";
import img_laboratorio from "@/assets/esp-laboratorio.jpg";
import img_chequeos_preventivos from "@/assets/esp-chequeos-preventivos.jpg";
import img_medicina_deporte from "@/assets/esp-medicina-deporte.jpg";
import img_teleconsulta from "@/assets/esp-teleconsulta.jpg";
const ICONOS: Record<string, LucideIcon> = {
  stethoscope: Stethoscope,
  kidney: Droplets,
  heart: HeartPulse,
  activity: Activity,
  waves: Waves,
  gauge: Gauge,
  flask: FlaskConical,
  watch: Watch,
  scan: ScanLine,
  "test-tube": TestTube,
  clipboard: ClipboardCheck,
  dumbbell: Dumbbell,
  video: Video,
};

export function iconoEspecialidad(key: string): LucideIcon {
  return ICONOS[key] ?? Stethoscope;
}

export function fotoDoctor(foto: "alberto" | "alonso") {
  return foto === "alberto" ? fotoAlberto : fotoAlonso;
}

const IMG_ESP: Record<string, string> = {
  "medicina-interna": imgInterna,
  nefrologia: imgNefro,
  cardiologia: imgCardio,
  "cardiologia-critica": img_cardiologia_critica,
  "ecocardiografia": img_ecocardiografia,
  "hipertension-arterial": img_hipertension_arterial,
  "diabetes-metabolismo": img_diabetes_metabolismo,
  "holter-mapa": img_holter_mapa,
  "diagnostico-por-imagenes": img_diagnostico_por_imagenes,
  "laboratorio": img_laboratorio,
  "chequeos-preventivos": img_chequeos_preventivos,
  "medicina-deporte": img_medicina_deporte,
  "teleconsulta": img_teleconsulta,
};

export function imagenEspecialidad(slug: string) {
  return IMG_ESP[slug] ?? imgClinica;
}

export const CLINICA = {
  nombre: "HEGO · Centro de especialidades médicas",
  claim: "Centro médico especializado en Medicina Interna, Cardiología y Nefrología",
  direccion: "Av. Libertador 2450, Piso 3 — Ciudad",
  telefono: "+54 11 4000-1200",
  whatsapp: "+54 9 11 6000-1200",
  email: "contacto@clinicagomezbolano.com",
  horarios: "Lunes a viernes de 08:00 a 20:00 · Sábados de 09:00 a 13:00",
};

export const DOCTORS: Doctor[] = [
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
  {
    slug: "hipertension-arterial",
    nombre: "Unidad de Hipertensión",
    icono: "gauge",
    doctorIds: ["d1", "d2"],
    descripcion:
      "Abordaje conjunto clínico, renal y cardiológico de la presión arterial elevada y sus complicaciones.",
    aborda: [
      "Hipertensión esencial y secundaria",
      "Hipertensión resistente",
      "Daño de órgano blanco",
      "Ajuste de tratamiento antihipertensivo",
    ],
    cuando: [
      "Presión mayor a 140/90 en varios controles",
      "Hipertensión que no baja con medicación",
      "Dolor de cabeza o mareos frecuentes",
    ],
    estudios: ["MAPA 24h", "Función renal", "Fondo de ojo", "Ecocardiograma"],
    seguimiento:
      "Controles mensuales hasta lograr metas y luego trimestrales, con registro domiciliario de presión.",
  },
  {
    slug: "diabetes-metabolismo",
    nombre: "Diabetes y Metabolismo",
    icono: "flask",
    doctorIds: ["d1"],
    descripcion:
      "Prevención y control de la diabetes, la obesidad y las alteraciones del colesterol y triglicéridos.",
    aborda: [
      "Diabetes tipo 2 y prediabetes",
      "Síndrome metabólico",
      "Dislipemias",
      "Protección renal en el paciente diabético",
    ],
    cuando: [
      "Glucemia o hemoglobina glicosilada elevadas",
      "Sobrepeso con antecedentes familiares",
      "Colesterol o triglicéridos altos",
    ],
    estudios: ["Hemoglobina glicosilada", "Perfil lipídico", "Microalbuminuria", "Curva de glucemia"],
    seguimiento:
      "Plan personalizado con metas claras y controles cada 3 meses, coordinado con nefrología.",
  },
  {
    slug: "holter-mapa",
    nombre: "Holter y MAPA",
    icono: "watch",
    doctorIds: ["d2"],
    descripcion:
      "Monitoreo ambulatorio del ritmo cardíaco y de la presión arterial durante 24 horas, en tu vida diaria.",
    aborda: [
      "Detección de arritmias",
      "Palpitaciones y desmayos",
      "Hipertensión de guardapolvo blanco",
      "Control de eficacia de tratamientos",
    ],
    cuando: [
      "Palpitaciones o latidos irregulares",
      "Mareos o pérdida de conocimiento",
      "Valores de presión variables",
    ],
    estudios: ["Holter de ritmo 24h", "MAPA 24h", "Electrocardiograma de 12 derivaciones"],
    seguimiento:
      "Colocación en el consultorio, retiro al día siguiente e informe revisado por el cardiólogo.",
  },
  {
    slug: "diagnostico-por-imagenes",
    nombre: "Diagnóstico por Imágenes",
    icono: "scan",
    doctorIds: ["d1", "d2"],
    descripcion:
      "Ecografías y estudios doppler de alta resolución realizados e interpretados por los especialistas tratantes.",
    aborda: [
      "Ecografía renal y abdominal",
      "Doppler de vasos del cuello",
      "Doppler venoso y arterial",
      "Doppler de arterias renales",
    ],
    cuando: [
      "Indicación médica de estudio por imágenes",
      "Control de patología renal o vascular",
      "Evaluación prequirúrgica",
    ],
    estudios: ["Ecografía renal", "Ecografía abdominal", "Doppler vascular", "Doppler renal"],
    seguimiento:
      "Imágenes e informe disponibles en el portal del paciente, con revisión en la siguiente consulta.",
  },
  {
    slug: "laboratorio",
    nombre: "Laboratorio Clínico",
    icono: "test-tube",
    doctorIds: ["d1"],
    descripcion:
      "Extracciones en la clínica y resultados online para agilizar el diagnóstico y el seguimiento.",
    aborda: [
      "Análisis de rutina",
      "Función renal y hepática",
      "Perfil hormonal y metabólico",
      "Marcadores cardíacos",
    ],
    cuando: [
      "Chequeo anual",
      "Control de enfermedades crónicas",
      "Pedido de tu médico",
    ],
    estudios: ["Hemograma", "Química completa", "Orina completa", "Perfil tiroideo"],
    seguimiento:
      "Resultados en 24 a 48 hs en el portal, con aviso si algún valor requiere consulta prioritaria.",
  },
  {
    slug: "chequeos-preventivos",
    nombre: "Chequeos Preventivos",
    icono: "clipboard",
    doctorIds: ["d1", "d2"],
    descripcion:
      "Evaluación completa en una sola jornada para detectar a tiempo factores de riesgo clínicos y cardiovasculares.",
    aborda: [
      "Chequeo ejecutivo",
      "Chequeo cardiovascular",
      "Evaluación prequirúrgica",
      "Control de salud anual",
    ],
    cuando: [
      "Mayores de 40 años sin control reciente",
      "Antecedentes familiares de enfermedad",
      "Antes de una cirugía programada",
    ],
    estudios: ["Laboratorio completo", "Electrocardiograma", "Ergometría", "Ecografía abdominal"],
    seguimiento:
      "Informe integral con recomendaciones personalizadas y plan de controles para el año.",
  },
  {
    slug: "medicina-deporte",
    nombre: "Cardiología del Deporte",
    icono: "dumbbell",
    doctorIds: ["d2"],
    descripcion:
      "Evaluación cardiovascular para practicar actividad física de forma segura, desde aficionados hasta competidores.",
    aborda: [
      "Apto físico",
      "Evaluación precompetitiva",
      "Prescripción de ejercicio",
      "Corazón de atleta",
    ],
    cuando: [
      "Antes de empezar un deporte o gimnasio",
      "Competencias o maratones",
      "Síntomas durante el ejercicio",
    ],
    estudios: ["Electrocardiograma", "Ergometría", "Ecocardiograma"],
    seguimiento:
      "Certificado de apto físico y controles anuales según el nivel de actividad.",
  },
  {
    slug: "teleconsulta",
    nombre: "Teleconsulta",
    icono: "video",
    doctorIds: ["d1", "d2"],
    descripcion:
      "Consultas por videollamada para controles, lectura de estudios y seguimiento de enfermedades crónicas.",
    aborda: [
      "Controles de seguimiento",
      "Revisión de estudios",
      "Ajuste de medicación",
      "Segunda opinión",
    ],
    cuando: [
      "Vivís lejos de la clínica",
      "Necesitás un control rápido",
      "Querés mostrar resultados de estudios",
    ],
    estudios: ["Revisión de estudios previos", "Receta electrónica"],
    seguimiento:
      "Indicaciones y recetas enviadas al portal del paciente al finalizar la videollamada.",
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
  { q: "¿Cómo solicito un turno?", a: "Podés reservar desde la sección Turnos eligiendo especialidad, profesional, fecha y horario. La clínica te contacta para confirmarlo." },
  { q: "¿Necesito derivación para una consulta?", a: "No es necesaria. Podés consultar directamente con Medicina Interna, Nefrología o Cardiología." },
  { q: "¿Cuánto demora la entrega de estudios?", a: "Los estudios cardiológicos se informan el mismo día y se entregan en la clínica o por correo electrónico." },
  { q: "¿Puedo reprogramar o cancelar mi turno?", a: "Sí. Escribinos por WhatsApp o llamanos con al menos 24 horas de anticipación y te ofrecemos un nuevo horario." },
  { q: "¿Atienden teleconsulta?", a: "Sí, la modalidad de teleconsulta está disponible para controles y seguimiento de enfermedades crónicas." },
  { q: "¿Qué debo llevar a la primera consulta?", a: "Documento de identidad, estudios previos y la lista de medicación que estés tomando." },
  { q: "¿Trabajan con obras sociales y prepagas?", a: "Sí. Consultá por WhatsApp o teléfono si tu cobertura está incluida y si el estudio requiere autorización previa." },
  { q: "¿Cómo me preparo para un Holter o MAPA?", a: "Vení con ropa cómoda y sin cremas en el pecho. El equipo se coloca en el consultorio y se retira al día siguiente." },
  { q: "¿Necesito ayuno para los análisis?", a: "Para la mayoría de los análisis de sangre se recomiendan 8 a 12 horas de ayuno. Te confirmamos las indicaciones al reservar." },
  { q: "¿Qué medios de pago aceptan?", a: "Efectivo, tarjetas de débito y crédito, y transferencia bancaria." },
  { q: "¿Cómo recibo los resultados de mis estudios?", a: "Los informes se entregan en la clínica o se envían por correo electrónico; los cardiológicos suelen estar el mismo día." },
  { q: "¿Atienden urgencias?", a: "No somos un servicio de guardia. Ante una emergencia llamá al 107 o acudí a la guardia más cercana." },
];

export const HORARIOS_BASE = [
  "08:00", "08:40", "09:20", "10:00", "10:40", "11:20",
  "12:00", "14:00", "14:40", "15:20", "16:00", "16:40", "17:20", "18:00",
];