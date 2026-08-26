import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AppointmentStatus, PaymentStatus } from "@/lib/clinic/types";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="shadow-card">
      <CardContent className="flex items-start gap-4 p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function Panel({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

const STATUS_STYLE: Record<AppointmentStatus, string> = {
  confirmado: "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30",
  pendiente: "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30",
  reprogramado: "bg-[var(--info)]/15 text-[var(--info)] border-[var(--info)]/30",
  cancelado: "bg-destructive/12 text-destructive border-destructive/30",
  finalizado: "bg-muted text-muted-foreground border-border",
  ausente: "bg-primary/10 text-primary border-primary/30",
};

export function StatusBadge({ estado }: { estado: AppointmentStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[estado]}`}>
      {estado}
    </span>
  );
}

const PAY_STYLE: Record<PaymentStatus, string> = {
  pagado: "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30",
  pendiente: "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30",
  cancelado: "bg-destructive/12 text-destructive border-destructive/30",
};

export function PayBadge({ estado }: { estado: PaymentStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${PAY_STYLE[estado]}`}>
      {estado}
    </span>
  );
}

export function EmptyState({ mensaje }: { mensaje: string }) {
  return <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{mensaje}</p>;
}

export function LegendBadge({ color, label }: { color: string; label: string }) {
  return (
    <Badge variant="outline" className="gap-1.5 font-normal">
      <span className="size-2 rounded-full" style={{ background: color }} />
      {label}
    </Badge>
  );
}

/** Diálogo de autorización simulada para operaciones sensibles. */
export function AuthorizeDialog({
  open,
  onOpenChange,
  operacion,
  onAuthorize,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  operacion: string;
  onAuthorize: (director: string) => void;
}) {
  const [director, setDirector] = useState("Dr. Carlos Alberto Gómez Bolaño");
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Esta operación requiere autorización de un director médico</AlertDialogTitle>
          <AlertDialogDescription>
            Operación solicitada: <strong>{operacion}</strong>. Seleccioná el director que autoriza. La autorización queda registrada en auditoría.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-2">
          {["Dr. Carlos Alberto Gómez Bolaño", "Dr. Carlos Alonso Gómez Bolaño"].map((d) => (
            <Button key={d} variant={director === d ? "default" : "outline"} onClick={() => setDirector(d)} className="justify-start">
              {d}
            </Button>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => onAuthorize(director)}>Autorizar operación</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const money = (n: number) => `$${n.toLocaleString("es-AR")}`;
export const fechaCorta = (iso: string) => new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
export const fechaHora = (iso: string) => new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
