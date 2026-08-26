import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-provider";
import { Brand } from "@/components/site/PublicLayout";
import { ScrollTop } from "@/components/site/ScrollTop";
import { Crumbs } from "@/components/site/Crumbs";
import { logout, useCurrentUser, useDB } from "@/lib/clinic/store";
import type { Role } from "@/lib/clinic/types";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const ROLE_LABEL: Record<Role, string> = {
  paciente: "Paciente",
  medico: "Médico",
  secretaria: "Secretaría",
  director: "Dirección médica",
};

export function DashboardLayout({
  roles,
  area,
  items,
  title,
  crumbs,
  actions,
  children,
}: {
  roles: Role[];
  area: string;
  items: NavItem[];
  title: string;
  crumbs: { label: string; to?: string }[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const noLeidas = useDB((db) =>
    db.notifications.filter((n) => !n.leida && n.rol === (user?.role ?? "paciente") && (!n.userId || n.userId === user?.id)).length,
  );

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
    else if (!roles.includes(user.role)) navigate({ to: "/login" });
  }, [user, roles, navigate]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!user || !roles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Verificando sesión…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 shrink-0 overflow-y-auto bg-sidebar p-4 text-sidebar-foreground transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <Brand light />
          <Button variant="ghost" size="icon" className="lg:hidden text-sidebar-foreground" onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <X className="size-5" />
          </Button>
        </div>
        <p className="px-3 pb-2 text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/50">{area}</p>
        <nav className="space-y-1">
          {items.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" /> Cerrar sesión
          </button>
        </nav>
        <div className="mt-6 rounded-xl bg-sidebar-accent p-3 text-xs text-sidebar-accent-foreground/80">
          <p className="font-semibold text-sidebar-accent-foreground">{user.nombre}</p>
          <p>{ROLE_LABEL[user.role]}</p>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menú">
              <Menu className="size-5" />
            </Button>
            <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {noLeidas > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Bell className="size-3.5" /> {noLeidas}
              </Badge>
            )}
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link to="/">Sitio público</Link>
            </Button>
          </div>
        </header>
        <div className="min-w-0 flex-1 p-4 lg:p-8">
          <Crumbs items={crumbs} />
          {actions && <div className="mb-5 flex flex-wrap gap-2">{actions}</div>}
          {children}
        </div>
      </div>
      <ScrollTop />
    </div>
  );
}
