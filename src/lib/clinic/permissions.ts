import type { Role, User } from "./types";

export const PERMISOS_DISPONIBLES = [
  { key: "turnos.crear", label: "Crear turnos" },
  { key: "turnos.confirmar", label: "Confirmar turnos" },
  { key: "turnos.reprogramar", label: "Reprogramar turnos" },
  { key: "turnos.cancelar", label: "Cancelar turnos" },
  { key: "pacientes.buscar", label: "Buscar pacientes" },
  { key: "agenda.ver", label: "Consultar agenda" },
  { key: "agenda.editar", label: "Modificar disponibilidad médica" },
  { key: "pagos.editar", label: "Modificar pagos confirmados" },
];

export const RESTRICCIONES_SECRETARIA = [
  "Eliminar historias clínicas",
  "Modificar información médica",
  "Crear administradores o directores",
  "Cambiar sus propios permisos",
  "Eliminar registros de auditoría",
  "Modificar pagos confirmados sin autorización",
];

export function can(user: User | null, permiso: string): boolean {
  if (!user) return false;
  if (user.role === "director") return true;
  return user.permisos.includes(permiso) || user.permisos.includes("*");
}

export function requiereAutorizacion(user: User | null, operacion: string): boolean {
  if (!user) return true;
  if (user.role === "director") return false;
  return [
    "cancelar-confirmado",
    "modificar-pago",
    "eliminar-usuario",
    "modificar-permisos",
    "modificar-sensible",
  ].includes(operacion);
}

export const HOME_BY_ROLE: Record<Role, string> = {
  paciente: "/paciente",
  medico: "/medico",
  secretaria: "/secretaria",
  director: "/director",
};
