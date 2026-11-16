import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck2, CheckCircle2, Loader2, Send, XCircle } from "lucide-react";
import { verCitaLink, confirmarCitaLink } from "@/lib/servidor";
import { hora12 } from "@/lib/auth-local";

export const Route = createFileRoute("/confirmar")({
  validateSearch: (s: Record<string, unknown>) => ({ c: typeof s["c"] === "string" ? s["c"] : "" }),
  head: () => ({ meta: [{ title: "Confirmar cita | HEGO" }, { name: "robots", content: "noindex" }] }),
  component: Confirmar,
});

type Cita = { paciente: string; fecha: string; hora: string; doctor: string; motivo: string; estado: string; telefono: string; mensaje: string };

const wa = (tel: string, texto: string) => {
  let d = tel.replace(/\D/g, "");
  if (d.length === 10 && d.startsWith("3")) d = `57${d}`;
  return `https://wa.me/${d}?text=${encodeURIComponent(texto)}`;
};

function Confirmar() {
  const { c } = Route.useSearch();
  const [cita, setCita] = useState<Cita | null>(null);
  const [error, setError] = useState("");
  const [estado, setEstado] = useState<"cargando" | "listo" | "confirmando" | "hecho">("cargando");
  const [envios, setEnvios] = useState({ correo: false, whatsapp: false });

  useEffect(() => {
    if (!c) {
      setError("Falta el código del link.");
      return;
    }
    verCitaLink({ data: { token: c } })
      .then((r) => {
        if (!r.ok) return setError(r.error);
        setCita(r.cita);
        setEstado(r.cita.estado === "Confirmado" || r.cita.estado === "Atendido" ? "hecho" : "listo");
      })
      .catch(() => setError("No nos pudimos conectar. Intente de nuevo."));
  }, [c]);

  const confirmar = async () => {
    setEstado("confirmando");
    const r = await confirmarCitaLink({ data: { token: c } }).catch(() => null);
    if (!r || !r.ok) {
      setError(r && !r.ok ? r.error : "No se pudo confirmar. Intente de nuevo.");
      setEstado("listo");
      return;
    }
    setEnvios({ correo: r.correo, whatsapp: r.whatsapp });
    setEstado("hecho");
  };

  const fecha = cita ? new Date(`${cita.fecha}T12:00:00`).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" }) : "";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-[#071a46] via-[#0b2a6b] to-[#1d4ed8] p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[1.6rem] bg-white text-slate-900 shadow-2xl">
        <div className="bg-gradient-to-r from-[#071a46] to-[#1d4ed8] px-6 py-5 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/60">HEGO · Centro de especialidades médicas</p>
          <p className="mt-1 flex items-center gap-2 text-xl font-semibold"><CalendarCheck2 className="size-5" /> Confirmar cita</p>
        </div>
        <div className="space-y-4 p-6">
          {error && (
            <p className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200"><XCircle className="mt-0.5 size-4 shrink-0" /> {error}</p>
          )}
          {!cita && !error && <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="size-4 animate-spin" /> Buscando la cita…</p>}
          {cita && (
            <>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-lg font-semibold">{cita.paciente}</p>
                <p className="mt-1 text-sm text-slate-600 first-letter:uppercase">{fecha} · {hora12(cita.hora)}</p>
                <p className="text-sm text-slate-600">{cita.doctor}{cita.motivo ? ` · ${cita.motivo}` : ""}</p>
              </div>
              {estado === "hecho" ? (
                <div className="space-y-3">
                  <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 font-semibold text-emerald-700 ring-1 ring-emerald-200"><CheckCircle2 className="size-5" /> Cita confirmada</p>
                  {(envios.correo || envios.whatsapp) && (
                    <p className="text-sm text-slate-600">Le avisamos al paciente {[envios.whatsapp && "por WhatsApp", envios.correo && "por correo"].filter(Boolean).join(" y ")}.</p>
                  )}
                  {!envios.whatsapp && cita.telefono && (
                    <a href={wa(cita.telefono, cita.mensaje)} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 font-semibold text-white">
                      <Send className="size-4" /> Avisarle por WhatsApp
                    </a>
                  )}
                </div>
              ) : (
                <button onClick={() => void confirmar()} disabled={estado === "confirmando"} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-600 disabled:opacity-60">
                  {estado === "confirmando" ? <Loader2 className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />} Sí, confirmar la cita
                </button>
              )}
            </>
          )}
          <Link to="/panel" className="block text-center text-sm font-medium text-blue-700 hover:underline">Ir al panel</Link>
        </div>
      </div>
    </div>
  );
}
