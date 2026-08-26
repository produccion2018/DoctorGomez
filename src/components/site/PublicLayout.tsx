import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, CalendarPlus, LogIn, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-provider";
import { ScrollTop } from "./ScrollTop";
import { CLINICA } from "@/data/clinic";
import { useCurrentUser } from "@/lib/clinic/store";
import { HOME_BY_ROLE } from "@/lib/clinic/permissions";

const LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/especialidades", label: "Especialidades" },
  { to: "/servicios", label: "Servicios" },
  { to: "/clinica", label: "Clínica" },
  { to: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
  { to: "/contacto", label: "Contacto" },
  { to: "/turnos", label: "Turnos" },
];

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex size-10 items-center justify-center rounded-xl gradient-deep">
        <Activity className="size-5 text-deep-foreground" />
      </span>
      <span className="leading-tight">
        <span className={`block text-sm font-semibold tracking-tight ${light ? "text-deep-foreground" : "text-foreground"}`}>
          Gómez Bolaño
        </span>
        <span className={`block text-[11px] uppercase tracking-[0.18em] ${light ? "text-deep-foreground/70" : "text-muted-foreground"}`}>
          Clínica médica
        </span>
      </span>
    </Link>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
          <Brand />
          <nav className="hidden items-center gap-1 xl:flex">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === l.to ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link to={HOME_BY_ROLE[user.role]}>Mi panel</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">
                  <LogIn className="size-4" /> Iniciar sesión
                </Link>
              </Button>
            )}
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/turnos">
                <CalendarPlus className="size-4" /> Solicitar turno
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menú">
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
        {open && (
          <div className="border-t border-border bg-background xl:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col p-3">
              {LINKS.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button asChild variant="outline" size="sm" onClick={() => setOpen(false)}>
                  <Link to={user ? HOME_BY_ROLE[user.role] : "/login"}>{user ? "Mi panel" : "Iniciar sesión"}</Link>
                </Button>
                <Button asChild size="sm" onClick={() => setOpen(false)}>
                  <Link to="/turnos">Solicitar turno</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="mt-24 border-t border-border bg-deep text-deep-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 lg:px-8">
          <div className="space-y-4">
            <Brand light />
            <p className="text-sm text-deep-foreground/70">{CLINICA.claim}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Navegación</h3>
            <ul className="mt-4 space-y-2 text-sm text-deep-foreground/70">
              {LINKS.slice(0, 5).map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition-colors hover:text-deep-foreground">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Accesos</h3>
            <ul className="mt-4 space-y-2 text-sm text-deep-foreground/70">
              <li><Link to="/turnos" className="hover:text-deep-foreground">Solicitar turno</Link></li>
              <li><Link to="/login" className="hover:text-deep-foreground">Portal del paciente</Link></li>
              <li><Link to="/registro" className="hover:text-deep-foreground">Crear cuenta</Link></li>
              <li><Link to="/preguntas-frecuentes" className="hover:text-deep-foreground">Preguntas frecuentes</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Contacto</h3>
            <ul className="mt-4 space-y-3 text-sm text-deep-foreground/70">
              <li className="flex gap-2"><MapPin className="size-4 shrink-0" />{CLINICA.direccion}</li>
              <li className="flex gap-2"><Phone className="size-4 shrink-0" />{CLINICA.telefono}</li>
              <li className="flex gap-2"><Mail className="size-4 shrink-0" />{CLINICA.email}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-deep-foreground/60">
          © {new Date().getFullYear()} {CLINICA.nombre}. Demo institucional con datos ficticios.
        </div>
      </footer>
      <ScrollTop />
    </div>
  );
}
