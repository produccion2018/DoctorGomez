/**
 * Avisos automáticos de citas (servidor): correo con Resend y WhatsApp con la API oficial de Meta.
 * Si falta alguna clave, ese canal simplemente no se usa (nunca rompe la reserva).
 *
 * Variables de entorno:
 *  RESEND_API_KEY      clave de Resend
 *  RESEND_FROM         remitente (por defecto "HEGO <onboarding@resend.dev>", modo prueba)
 *  CORREO_AVISOS       correo(s) de la administración que reciben las citas nuevas (separados por coma)
 *  URL_PUBLICA         dirección del sitio (por defecto https://doctor-gomez.vercel.app)
 *  WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, WHATSAPP_PLANTILLA   WhatsApp Business (Meta Cloud API)
 */
import { createHmac, timingSafeEqual } from "node:crypto";

type Cita = Record<string, unknown> & { id: string };

const env = (k: string) => process.env[k]?.trim() || "";
const base = () => env("URL_PUBLICA") || "https://doctor-gomez.vercel.app";
const esc = (s: unknown) => String(s ?? "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);
const h12 = (h: unknown) => {
  const [a, b] = String(h ?? "").split(":").map(Number);
  if (a === undefined || b === undefined || Number.isNaN(a)) return String(h ?? "");
  if (a === 12 && b === 0) return "12:00 m.";
  return `${a % 12 === 0 ? 12 : a % 12}:${String(b).padStart(2, "0")} ${a < 12 ? "a. m." : "p. m."}`;
};
const fechaLarga = (f: unknown) => {
  const d = new Date(`${String(f)}T12:00:00`);
  return Number.isNaN(d.getTime()) ? String(f) : d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
};

/* ---------- link firmado para confirmar con un clic ---------- */
const secreto = () => env("SECRETO_LINKS") || env("DATABASE_URL") || "hego-local";
const firma = (id: string) => createHmac("sha256", secreto()).update(`cita:${id}`).digest("base64url").slice(0, 32);
export const tokenCita = (id: string) => `${id}.${firma(id)}`;
export function idDeToken(token: string): string | null {
  const [id, f] = token.split(".");
  if (!id || !f) return null;
  const a = Buffer.from(f);
  const b = Buffer.from(firma(id));
  return a.length === b.length && timingSafeEqual(a, b) ? id : null;
}
export const linkConfirmar = (id: string) => `${base()}/confirmar?c=${encodeURIComponent(tokenCita(id))}`;

/* ---------- canales ---------- */
export async function enviarCorreo(para: string[], asunto: string, html: string): Promise<boolean> {
  const clave = env("RESEND_API_KEY");
  const to = para.map((x) => x.trim()).filter((x) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x));
  if (!clave || to.length === 0) return false;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env("RESEND_FROM") || "HEGO <onboarding@resend.dev>", to, subject: asunto, html }),
  }).catch(() => null);
  if (!r?.ok) console.error("Correo no enviado:", r?.status, await r?.text().catch(() => ""));
  return !!r?.ok;
}

/** Celular colombiano a formato internacional (57 + 10 dígitos). */
export function telefonoCO(t: unknown): string | null {
  let d = String(t ?? "").replace(/\D/g, "");
  if (d.length === 10 && d.startsWith("3")) d = `57${d}`;
  return d.length >= 11 ? d : null;
}

/** WhatsApp automático con plantilla aprobada por Meta. Devuelve false si no está configurado. */
export async function enviarWhatsApp(telefono: unknown, parametros: string[]): Promise<boolean> {
  const token = env("WHATSAPP_TOKEN");
  const phoneId = env("WHATSAPP_PHONE_ID");
  const plantilla = env("WHATSAPP_PLANTILLA");
  const to = telefonoCO(telefono);
  if (!token || !phoneId || !plantilla || !to) return false;
  const r = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: { name: plantilla, language: { code: env("WHATSAPP_IDIOMA") || "es" }, components: [{ type: "body", parameters: parametros.map((text) => ({ type: "text", text })) }] },
    }),
  }).catch(() => null);
  if (!r?.ok) console.error("WhatsApp no enviado:", r?.status, await r?.text().catch(() => ""));
  return !!r?.ok;
}

/* ---------- avisos ---------- */
const marco = (titulo: string, cuerpo: string) => `<div style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px">
  <div style="max-width:520px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:linear-gradient(130deg,#071a46,#0b2a6b 50%,#1d4ed8);color:#fff;padding:20px 24px">
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;opacity:.7">HEGO · Centro de especialidades médicas</div>
      <div style="font-size:20px;font-weight:bold;margin-top:6px">${titulo}</div>
    </div>
    <div style="padding:22px 24px;color:#0f172a;font-size:15px;line-height:1.5">${cuerpo}</div>
  </div></div>`;
const fichaCita = (t: Cita) => `<table style="width:100%;border-collapse:collapse;font-size:14px;margin:8px 0 16px">
  ${[
    ["Paciente", t["paciente"]],
    ["Día", fechaLarga(t["fecha"])],
    ["Hora", h12(t["hora"])],
    ["Profesional", t["doctor"]],
    ["Motivo", t["motivo"]],
    ["Teléfono", t["telefono"]],
    ["Correo", t["email"]],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 0;color:#64748b;width:110px">${k}</td><td style="padding:6px 0;font-weight:bold">${esc(v)}</td></tr>`)
    .join("")}</table>`;

/** Cita nueva (web o portal): correo a la administración con el botón "Confirmar cita". */
export async function avisarCitaNueva(t: Cita, origen: string) {
  const para = env("CORREO_AVISOS").split(",");
  const link = linkConfirmar(t.id);
  return enviarCorreo(
    para,
    `Nueva cita · ${String(t["paciente"])} · ${fechaLarga(t["fecha"])} ${h12(t["hora"])}`,
    marco(
      "Llegó una cita nueva",
      `<p style="margin:0 0 4px">Se pidió desde <b>${esc(origen)}</b>.</p>${fichaCita(t)}
       <p style="margin:18px 0"><a href="${link}" style="display:inline-block;background:#10b981;color:#fff;padding:14px 26px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px">✓ Confirmar cita</a></p>
       <p style="font-size:13px;color:#64748b">Al confirmar, al paciente le llega el aviso automático. También puede confirmarla desde el panel, en Agenda y citas.</p>`,
    ),
  );
}

/** Cita confirmada: aviso automático al paciente por correo y WhatsApp (los canales que estén configurados). */
export async function avisarCitaConfirmada(t: Cita) {
  const correo = t["email"]
    ? await enviarCorreo(
        [String(t["email"])],
        `Cita confirmada · ${fechaLarga(t["fecha"])} ${h12(t["hora"])}`,
        marco(
          "Su cita está confirmada",
          `<p style="margin:0 0 8px">Hola ${esc(String(t["paciente"]).split(" ")[0])}, le confirmamos su cita:</p>${fichaCita({ ...t, telefono: "", email: "" })}
           <p style="font-size:13px;color:#64748b">Si no puede asistir, avísenos con anticipación para darle el espacio a otro paciente. Puede ver y gestionar sus citas en el Portal del paciente: ${esc(base())}/portal</p>`,
        ),
      )
    : false;
  const whatsapp = await enviarWhatsApp(t["telefono"], [String(t["paciente"]).split(" ")[0] ?? "", fechaLarga(t["fecha"]), h12(t["hora"]), String(t["doctor"] ?? "")]);
  return { correo, whatsapp };
}

/** Mensaje listo para mandar a mano por WhatsApp cuando el envío automático no está configurado. */
export function textoConfirmacion(t: Cita) {
  return `Hola ${String(t["paciente"]).split(" ")[0]}, le escribimos del Centro HEGO. Su cita quedó CONFIRMADA para el ${fechaLarga(t["fecha"])} a las ${h12(t["hora"])} con ${String(t["doctor"])}. Si no puede asistir, avísenos con anticipación. ¡Lo esperamos!`;
}
