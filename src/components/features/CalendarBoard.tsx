import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LegendBadge, Panel, StatusBadge } from "@/components/dash/widgets";
import { DOCTORS, HORARIOS_BASE } from "@/data/clinic";
import { useDB } from "@/lib/clinic/store";
import { addDays, toISO } from "@/lib/clinic/seed";

export function CalendarBoard({ soloDoctorId }: { soloDoctorId?: string }) {
  const [offset, setOffset] = useState(0);
  const [doctorId, setDoctorId] = useState(soloDoctorId ?? DOCTORS[0]!.id);
  const appointments = useDB((db) => db.appointments);
  const bloqueos = useDB((db) => db.agenda.bloqueos);

  const base = addDays(new Date(), offset * 5);
  const dias = Array.from({ length: 5 }, (_, i) => addDays(base, i));

  return (
    <Panel title="Calendario de agenda" description="Vista semanal de disponibilidad. Los horarios ocupados aparecen bloqueados.">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setOffset((o) => o - 1)} aria-label="Semana anterior"><ChevronLeft className="size-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setOffset(0)}>Hoy</Button>
          <Button variant="outline" size="icon" onClick={() => setOffset((o) => o + 1)} aria-label="Semana siguiente"><ChevronRight className="size-4" /></Button>
        </div>
        {!soloDoctorId && (
          <Select value={doctorId} onValueChange={setDoctorId}>
            <SelectTrigger className="w-72"><SelectValue /></SelectTrigger>
            <SelectContent>{DOCTORS.map((d) => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}</SelectContent>
          </Select>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <LegendBadge color="var(--success)" label="Disponible" />
        <LegendBadge color="var(--destructive)" label="Ocupado" />
        <LegendBadge color="var(--warning)" label="Bloqueado" />
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[720px] grid-cols-5 gap-3">
          {dias.map((d) => {
            const iso = toISO(d);
            const bloqueado = bloqueos.some((b) => b.doctorId === doctorId && b.fecha === iso);
            const delDia = appointments.filter((a) => a.doctorId === doctorId && a.fecha === iso && !["cancelado", "ausente"].includes(a.estado));
            return (
              <div key={iso} className="rounded-xl border border-border p-3">
                <p className="text-sm font-semibold capitalize">{d.toLocaleDateString("es-AR", { weekday: "long" })}</p>
                <p className="mb-3 text-xs text-muted-foreground">{d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}</p>
                {bloqueado && <p className="mb-2 rounded-md bg-[var(--warning)]/15 px-2 py-1 text-xs text-[var(--warning)]">Agenda bloqueada</p>}
                <div className="space-y-1.5">
                  {HORARIOS_BASE.map((h) => {
                    const turno = delDia.find((a) => a.hora === h);
                    if (bloqueado) return <div key={h} className="rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground">{h}</div>;
                    return turno ? (
                      <div key={h} className="rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs">
                        <span className="font-medium">{h}</span> · {turno.pacienteNombre}
                        <div className="mt-1"><StatusBadge estado={turno.estado} /></div>
                      </div>
                    ) : (
                      <div key={h} className="rounded-md border border-[var(--success)]/30 bg-[var(--success)]/10 px-2 py-1 text-xs text-[var(--success)]">{h} libre</div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
