import { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Search, Slash, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { AuthorizeDialog, EmptyState, LegendBadge, PayBadge, Panel, StatusBadge, fechaHora, money } from "@/components/dash/widgets";
import { DOCTORS, ESPECIALIDADES, HORARIOS_BASE } from "@/data/clinic";
import { changeAppointmentStatus, createAppointment, isSlotTaken, getDB, rescheduleAppointment, useDB } from "@/lib/clinic/store";
import { can } from "@/lib/clinic/permissions";
import type { Appointment, AppointmentStatus, User } from "@/lib/clinic/types";
import { toISO } from "@/lib/clinic/seed";

const ESTADOS: AppointmentStatus[] = ["pendiente", "confirmado", "reprogramado", "cancelado", "finalizado", "ausente"];

export function AppointmentsManager({ user, soloDoctorId, detalleAvanzado = false }: { user: User; soloDoctorId?: string; detalleAvanzado?: boolean }) {
  const appointments = useDB((db) => db.appointments);
  const pacientes = useDB((db) => db.users.filter((u) => u.role === "paciente"));
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<string>("todos");
  const [doctor, setDoctor] = useState<string>(soloDoctorId ?? "todos");
  const [pending, setPending] = useState<{ op: string; run: (dir: string) => void } | null>(null);
  const [reprogramar, setReprogramar] = useState<Appointment | null>(null);

  const actor = { nombre: user.nombre, role: user.role };

  const lista = useMemo(() => {
    return appointments
      .filter((a) => (soloDoctorId ? a.doctorId === soloDoctorId : true))
      .filter((a) => (doctor === "todos" ? true : a.doctorId === doctor))
      .filter((a) => (estado === "todos" ? true : a.estado === estado))
      .filter((a) => {
        const t = q.trim().toLowerCase();
        if (!t) return true;
        return [a.pacienteNombre, a.codigo, a.especialidad, a.fecha].join(" ").toLowerCase().includes(t);
      })
      .sort((a, b) => (a.fecha + a.hora < b.fecha + b.hora ? 1 : -1));
  }, [appointments, q, estado, doctor, soloDoctorId]);

  function accion(a: Appointment, nuevo: AppointmentStatus) {
    const sensible = nuevo === "cancelado" && a.estado === "confirmado" && user.role !== "director";
    const run = (autorizadoPor?: string) => {
      changeAppointmentStatus(a.id, nuevo, actor, autorizadoPor);
      toast.success(`Turno ${a.codigo} → ${nuevo}${autorizadoPor ? ` (autorizó ${autorizadoPor})` : ""}`);
    };
    if (sensible) setPending({ op: `Cancelar el turno confirmado ${a.codigo}`, run: (dir) => { run(dir); setPending(null); } });
    else run();
  }

  return (
    <div className="space-y-5">
      <Panel
        title="Gestión de turnos"
        description="Filtrá, confirmá, reprogramá o cancelá turnos. Cada operación queda registrada en auditoría."
        action={<NuevoTurnoDialog user={user} pacientes={pacientes} />}
      >
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="min-w-52 flex-1">
            <Label htmlFor="buscar-turno" className="mb-1.5 block text-xs">Buscar</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="buscar-turno" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Paciente, código o especialidad" className="pl-9" />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Estado</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {ESTADOS.map((e) => <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {!soloDoctorId && (
            <div>
              <Label className="mb-1.5 block text-xs">Profesional</Label>
              <Select value={doctor} onValueChange={setDoctor}>
                <SelectTrigger className="w-60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {DOCTORS.map((d) => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <LegendBadge color="var(--success)" label="Confirmado" />
          <LegendBadge color="var(--warning)" label="Pendiente" />
          <LegendBadge color="var(--info)" label="Reprogramado" />
          <LegendBadge color="var(--destructive)" label="Cancelado" />
          <LegendBadge color="var(--muted-foreground)" label="Finalizado" />
          <LegendBadge color="var(--primary)" label="No asistió" />
        </div>

        {lista.length === 0 ? (
          <EmptyState mensaje="No hay turnos que coincidan con el filtro." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turno</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Profesional</TableHead>
                  <TableHead>Fecha y hora</TableHead>
                  <TableHead>Estado</TableHead>
                  {detalleAvanzado && <TableHead>Creado por</TableHead>}
                  {detalleAvanzado && <TableHead>Última modificación</TableHead>}
                  <TableHead>Pago</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((a) => {
                  const doc = DOCTORS.find((d) => d.id === a.doctorId);
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.codigo}<div className="text-xs text-muted-foreground">{a.especialidad}</div></TableCell>
                      <TableCell>{a.pacienteNombre}</TableCell>
                      <TableCell className="text-sm">{doc?.nombre}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{a.fecha}<div className="text-xs text-muted-foreground">{a.hora} · {a.modalidad}</div></TableCell>
                      <TableCell><StatusBadge estado={a.estado} /></TableCell>
                      {detalleAvanzado && <TableCell className="text-xs">{a.creadoPor}<div className="text-muted-foreground">{fechaHora(a.creadoEl)}</div></TableCell>}
                      {detalleAvanzado && <TableCell className="text-xs text-muted-foreground">{fechaHora(a.modificadoEl)}{a.autorizadoPor && <div>Autorizó: {a.autorizadoPor}</div>}</TableCell>}
                      <TableCell><PayBadge estado={a.estadoPago} /><div className="text-xs text-muted-foreground">{money(a.importe)} · {a.metodoPago}</div></TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {can(user, "turnos.confirmar") && a.estado !== "confirmado" && a.estado !== "cancelado" && (
                            <Button size="icon" variant="ghost" title="Confirmar" onClick={() => accion(a, "confirmado")}><CheckCircle2 className="size-4" /></Button>
                          )}
                          {can(user, "turnos.reprogramar") && !["cancelado", "finalizado"].includes(a.estado) && (
                            <Button size="icon" variant="ghost" title="Reprogramar" onClick={() => setReprogramar(a)}><CalendarClock className="size-4" /></Button>
                          )}
                          {can(user, "turnos.cancelar") && !["cancelado", "finalizado"].includes(a.estado) && (
                            <Button size="icon" variant="ghost" title="Cancelar" onClick={() => accion(a, "cancelado")}><Slash className="size-4" /></Button>
                          )}
                          {user.role !== "paciente" && a.estado === "confirmado" && (
                            <Button size="icon" variant="ghost" title="Marcar no asistió" onClick={() => accion(a, "ausente")}><UserX className="size-4" /></Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>

      <ReprogramarDialog turno={reprogramar} onClose={() => setReprogramar(null)} actor={actor} />

      <AuthorizeDialog
        open={!!pending}
        onOpenChange={(v) => !v && setPending(null)}
        operacion={pending?.op ?? ""}
        onAuthorize={(dir) => pending?.run(dir)}
      />
    </div>
  );
}

function ReprogramarDialog({ turno, onClose, actor }: { turno: Appointment | null; onClose: () => void; actor: { nombre: string; role: User["role"] } }) {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const abierto = !!turno;
  const ocupados = useDB((db) => (turno ? db.appointments.filter((a) => a.doctorId === turno.doctorId && a.fecha === fecha && !["cancelado", "ausente"].includes(a.estado) && a.id !== turno.id).map((a) => a.hora) : []));

  return (
    <Dialog open={abierto} onOpenChange={(v) => { if (!v) { onClose(); setFecha(""); setHora(""); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reprogramar turno {turno?.codigo}</DialogTitle>
          <DialogDescription>El horario anterior se libera automáticamente y el nuevo queda ocupado.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="nueva-fecha" className="mb-1.5 block">Nueva fecha</Label>
            <Input id="nueva-fecha" type="date" value={fecha} min={toISO(new Date())} onChange={(e) => { setFecha(e.target.value); setHora(""); }} />
          </div>
          {fecha && (
            <div className="grid grid-cols-4 gap-2">
              {HORARIOS_BASE.map((h) => {
                const taken = ocupados.includes(h);
                return (
                  <Button key={h} type="button" size="sm" disabled={taken} variant={hora === h ? "default" : taken ? "secondary" : "outline"} onClick={() => setHora(h)}>
                    {h}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            disabled={!fecha || !hora}
            onClick={() => {
              if (!turno) return;
              const r = rescheduleAppointment(turno.id, fecha, hora, actor);
              if (r.ok) { toast.success("Turno reprogramado."); onClose(); setFecha(""); setHora(""); }
              else toast.error(r.error ?? "No se pudo reprogramar.");
            }}
          >
            Confirmar cambio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function NuevoTurnoDialog({ user, pacientes }: { user: User; pacientes: User[] }) {
  const [open, setOpen] = useState(false);
  const [pacienteId, setPacienteId] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");

  if (!can(user, "turnos.crear")) return null;
  const docsDisponibles = DOCTORS.filter((d) => !especialidad || d.especialidades.includes(especialidad));

  function guardar() {
    const paciente = pacientes.find((p) => p.id === pacienteId);
    if (!paciente || !doctorId || !fecha || !hora || !especialidad) {
      toast.error("Completá todos los campos.");
      return;
    }
    if (isSlotTaken(getDB(), doctorId, fecha, hora)) {
      toast.error("Ese horario ya está ocupado.");
      return;
    }
    const r = createAppointment(
      {
        pacienteId: paciente.id, pacienteNombre: paciente.nombre, doctorId, especialidad, fecha, hora,
        modalidad: "Presencial", estado: "confirmado", motivo: "Turno cargado por " + user.nombre,
        importe: 36000, metodoPago: "Pendiente en recepción", estadoPago: "pendiente",
        creadoPor: user.nombre, creadoPorRol: user.role,
      },
      { nombre: user.nombre, role: user.role },
    );
    if (r.ok) { toast.success(`Turno ${r.appointment?.codigo} creado.`); setOpen(false); setPacienteId(""); setFecha(""); setHora(""); }
    else toast.error(r.error ?? "No se pudo crear el turno.");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">Nuevo turno</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear turno</DialogTitle>
          <DialogDescription>El horario elegido dejará de estar disponible para el público.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="mb-1.5 block">Paciente</Label>
            <Select value={pacienteId} onValueChange={setPacienteId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar paciente" /></SelectTrigger>
              <SelectContent>{pacientes.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block">Especialidad</Label>
            <Select value={especialidad} onValueChange={(v) => { setEspecialidad(v); setDoctorId(""); }}>
              <SelectTrigger><SelectValue placeholder="Seleccionar especialidad" /></SelectTrigger>
              <SelectContent>{ESPECIALIDADES.map((e) => <SelectItem key={e.slug} value={e.nombre}>{e.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block">Profesional</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar profesional" /></SelectTrigger>
              <SelectContent>{docsDisponibles.map((d) => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block">Fecha</Label>
              <Input type="date" value={fecha} min={toISO(new Date())} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Hora</Label>
              <Select value={hora} onValueChange={setHora}>
                <SelectTrigger><SelectValue placeholder="Horario" /></SelectTrigger>
                <SelectContent>{HORARIOS_BASE.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={guardar}>Crear turno</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
