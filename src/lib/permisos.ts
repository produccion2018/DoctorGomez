/** Permisos por área: compartido entre el panel (pantalla) y el servidor (lo hace cumplir). */
export type Nivel = "ninguno" | "ver" | "editar";
export type Permisos = Record<string, Record<string, Nivel>>;

export const MODULOS = [
  "Enfermería – Triage",
  "Turnos",
  "Pacientes",
  "Historias clínicas",
  "Recetas",
  "Laboratorio",
  "Estudios",
  "Finanzas",
  "Facturación",
  "Reportes",
  "Asistente IA",
  "Automatizaciones",
  "Horarios",
  "Portal del paciente",
  "Auditoría",
  "Permisos",
  "Sitio web",
];

/** Dirección general (gerencia de la clínica): acceso a todo, como los médicos. */
export const AREA_DIRECCION = "Dirección general";

/** Especialidades médicas de invitados: comparten los permisos de médico invitado. */
export const AREAS_MEDICAS = ["Medicina General", "Medicina Interna", "Cardiología (médicos)", "Nefrología (médicos)", "Endocrinología", "Neumología", "Neurología", "Gastroenterología", "Pediatría", "Ginecología y Obstetricia", "Dermatología", "Traumatología y Ortopedia", "Urología", "Oftalmología", "Otorrinolaringología", "Reumatología", "Oncología", "Geriatría", "Psiquiatría", "Psicología", "Nutrición", "Fisioterapia"];

export const mk = (p: Partial<Record<string, Nivel>>): Record<string, Nivel> =>
  Object.fromEntries(MODULOS.map((m) => [m, p[m] ?? "ninguno"])) as Record<string, Nivel>;

export const SEED_PERMISOS: Permisos = {
  "Recepción": mk({ Turnos: "editar", Pacientes: "ver", "Asistente IA": "ver", Horarios: "ver", "Portal del paciente": "editar" }),
  "Secretaría médica": mk({ Turnos: "editar", Pacientes: "editar", "Historias clínicas": "ver", Estudios: "ver", "Asistente IA": "ver", Horarios: "editar", "Portal del paciente": "editar" }),
  "Atención al paciente": mk({ Turnos: "editar", Pacientes: "ver", "Asistente IA": "ver", "Portal del paciente": "editar" }),
  "Enfermería": mk({ "Enfermería – Triage": "editar", Turnos: "ver", Pacientes: "ver", "Historias clínicas": "ver", Estudios: "ver", Laboratorio: "ver" }),
  "Cardiología": mk({ Turnos: "ver", Pacientes: "ver", "Historias clínicas": "ver", Estudios: "editar", "Asistente IA": "ver" }),
  "Nefrología": mk({ Turnos: "ver", Pacientes: "ver", "Historias clínicas": "ver", Estudios: "editar", "Asistente IA": "ver" }),
  "Estudios y laboratorio": mk({ Turnos: "ver", Pacientes: "ver", Estudios: "editar", "Asistente IA": "ver" }),
  "Diagnóstico por imágenes": mk({ Turnos: "ver", Pacientes: "ver", Estudios: "editar", "Asistente IA": "ver" }),
  "Farmacia e insumos": mk({ Finanzas: "ver", Reportes: "ver" }),
  "Administración": mk({ Turnos: "editar", Pacientes: "ver", Finanzas: "ver", Reportes: "ver", "Asistente IA": "ver" }),
  "Facturación": mk({ Turnos: "ver", Finanzas: "editar", Facturación: "editar", Reportes: "ver", "Asistente IA": "ver" }),
  "Recursos Humanos": mk({ Reportes: "ver" }),
  "Sistemas": mk({ Auditoría: "ver", Reportes: "ver" }),
};
// Médicos invitados: atienden pacientes, pero no ven finanzas ni administración
export const PERMISOS_MEDICO_INVITADO = mk({ "Enfermería – Triage": "ver", Turnos: "ver", Pacientes: "ver", "Historias clínicas": "editar", Recetas: "editar", Laboratorio: "editar", Estudios: "editar", Horarios: "ver" });
SEED_PERMISOS[AREA_DIRECCION] = mk(Object.fromEntries(MODULOS.map((m) => [m, "editar" as Nivel])));
AREAS_MEDICAS.forEach((n) => {
  SEED_PERMISOS[n] = PERMISOS_MEDICO_INVITADO;
});

export const nivelDe = (p: Permisos, area: string, modulo: string): Nivel =>
  p[area]?.[modulo] ?? SEED_PERMISOS[area]?.[modulo] ?? "ninguno";

/** Qué módulo de permisos protege cada colección del servidor. */
export const MODULO_COLECCION: Record<string, { ver: string[]; editar: string[] }> = {
  gb_turnos: { ver: ["Turnos", "Enfermería – Triage", "Portal del paciente"], editar: ["Turnos", "Enfermería – Triage"] },
  gb_padron: { ver: ["Pacientes", "Turnos", "Enfermería – Triage", "Historias clínicas"], editar: ["Pacientes", "Turnos"] },
  gb_pacientes: { ver: ["Pacientes", "Portal del paciente"], editar: ["Pacientes", "Portal del paciente"] },
  gb_triage: { ver: ["Enfermería – Triage", "Historias clínicas"], editar: ["Enfermería – Triage"] },
  gb_notas_enf: { ver: ["Enfermería – Triage", "Historias clínicas"], editar: ["Enfermería – Triage"] },
  gb_evoluciones: { ver: ["Historias clínicas"], editar: ["Historias clínicas"] },
  gb_controles: { ver: ["Historias clínicas", "Portal del paciente"], editar: ["Historias clínicas"] },
  gb_medicacion: { ver: ["Historias clínicas", "Recetas", "Portal del paciente"], editar: ["Historias clínicas", "Recetas"] },
  gb_recetas: { ver: ["Recetas", "Historias clínicas"], editar: ["Recetas"] },
  gb_laboratorio: { ver: ["Laboratorio", "Estudios", "Historias clínicas"], editar: ["Laboratorio"] },
  gb_estudios: { ver: ["Estudios", "Historias clínicas"], editar: ["Estudios"] },
  gb_autorizaciones: { ver: ["Pacientes", "Facturación", "Portal del paciente"], editar: ["Pacientes", "Facturación", "Portal del paciente"] },
  gb_facturas: { ver: ["Facturación", "Finanzas"], editar: ["Facturación"] },
  gb_cobros: { ver: ["Facturación", "Finanzas", "Turnos"], editar: ["Facturación", "Finanzas", "Turnos"] },
  gb_equipo: { ver: ["Finanzas", "Facturación"], editar: ["Finanzas"] },
  gb_cierres: { ver: ["Finanzas", "Facturación"], editar: ["Finanzas", "Facturación"] },
  gb_movs: { ver: ["Finanzas", "Reportes"], editar: ["Finanzas"] },
  gb_audit: { ver: ["Auditoría"], editar: [] },
};

/** ¿El área puede ver / editar la colección? (los médicos administradores siempre pueden) */
export function permiteColeccion(p: Permisos, area: string, coleccion: string, accion: "ver" | "editar") {
  const m = MODULO_COLECCION[coleccion];
  if (!m) return false;
  return m[accion].some((mod) => {
    const n = nivelDe(p, area, mod);
    return accion === "ver" ? n !== "ninguno" : n === "editar";
  });
}
