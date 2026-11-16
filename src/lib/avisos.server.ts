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
 *  WHATSAPP_PLANTILLA_RECORDATORIO   plantilla aprobada para los recordatorios (opcional)
 *  CRON_SECRET         clave que Vercel manda al correr los recordatorios diarios (opcional)
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
  return (await enviarCorreoDetalle(para, asunto, html)).ok;
}

/** Igual que enviarCorreo, pero explica por qué no salió (para mostrarlo en el panel). */
export async function enviarCorreoDetalle(para: string[], asunto: string, html: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const clave = env("RESEND_API_KEY");
  const to = para.map((x) => x.trim()).filter((x) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x));
  if (!clave) return { ok: false, error: "Falta configurar el correo (RESEND_API_KEY en Vercel)." };
  if (to.length === 0) return { ok: false, error: "El correo del paciente no es válido." };
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env("RESEND_FROM") || "HEGO <onboarding@resend.dev>", to, subject: asunto, html }),
  }).catch(() => null);
  if (r?.ok) return { ok: true };
  const texto = r ? await r.text().catch(() => "") : "";
  console.error("Correo no enviado:", r?.status, texto);
  if (/testing emails|verify a domain|own email/i.test(texto))
    return { ok: false, error: "Resend está en modo de prueba: por ahora solo envía al correo de su cuenta de Resend. Para enviar a cualquier paciente hay que verificar un dominio propio." };
  if (r?.status === 401 || r?.status === 403) return { ok: false, error: "Resend rechazó la clave. Revise RESEND_API_KEY en Vercel." };
  return { ok: false, error: "No se pudo enviar el correo. Intente de nuevo en un momento." };
}

/** Celular colombiano a formato internacional (57 + 10 dígitos). */
export function telefonoCO(t: unknown): string | null {
  let d = String(t ?? "").replace(/\D/g, "");
  if (d.length === 10 && d.startsWith("3")) d = `57${d}`;
  return d.length >= 11 ? d : null;
}

/** WhatsApp automático con plantilla aprobada por Meta. Devuelve false si no está configurado. */
export async function enviarWhatsApp(telefono: unknown, parametros: string[], plantilla = env("WHATSAPP_PLANTILLA")): Promise<boolean> {
  const token = env("WHATSAPP_TOKEN");
  const phoneId = env("WHATSAPP_PHONE_ID");
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

/* ---------- recordatorios automáticos (2 días antes y 1 día antes) ---------- */
const soloDig = (x: unknown) => String(x ?? "").replace(/\D/g, "").slice(-10);
const normal = (x: unknown) => String(x ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const diaColombia = (sumar: number) => new Date(Date.now() - 5 * 3600000 + sumar * 86400000).toISOString().slice(0, 10);

/** Correo de recordatorio para el paciente, con lo que tiene que llevar o cómo prepararse. */
async function correoRecordatorio(t: Cita, para: string, faltan: 1 | 2) {
  const { indicacionesCita } = await import("./auth-local");
  const ind = indicacionesCita(String(t["motivo"] ?? ""));
  const cuando = faltan === 1 ? "mañana" : "pasado mañana";
  return enviarCorreo(
    [para],
    `Recordatorio: su cita es ${cuando} · ${fechaLarga(t["fecha"])} ${h12(t["hora"])}`,
    marco(
      `Su cita es ${cuando}`,
      `<p style="margin:0 0 8px">Hola ${esc(String(t["paciente"]).split(" ")[0])}, le recordamos su cita en el Centro HEGO:</p>${fichaCita({ ...t, telefono: "", email: "" })}
       <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:14px 16px;margin:6px 0 14px">
         <div style="font-weight:bold;margin-bottom:6px">${ind.estudio ? `Cómo prepararse para su ${esc(ind.titulo)}` : "Para su consulta tenga en cuenta"}</div>
         <ul style="margin:0;padding-left:18px">${ind.items.map((x) => `<li style="margin:3px 0">${esc(x)}</li>`).join("")}</ul>
       </div>
       <p style="font-size:13px;color:#64748b">Si no puede asistir, avísenos con anticipación para darle el espacio a otro paciente. Puede ver sus citas en el Portal del paciente: ${esc(base())}/portal</p>`,
    ),
  );
}

/**
 * Lo corre Vercel todos los días (8:00 a. m. de Colombia). Busca las citas de mañana y de pasado mañana
 * que no estén canceladas, avisa al paciente por correo (y WhatsApp si está configurado) una sola vez por cita,
 * y le manda a la administración el resumen con quién no tiene correo para llamarlo o escribirle.
 */
export async function enviarRecordatorios() {
  const col = await import("./colecciones.server");
  const [turnos, pacientes] = await Promise.all([col.leer("gb_turnos"), col.leer("gb_pacientes").catch(() => [])]);
  const correoDe = (t: Cita) => {
    if (t["email"]) return String(t["email"]);
    const p = pacientes.find((x) => (t["pacienteId"] && x.id === t["pacienteId"]) || (soloDig(x["telefono"]) && soloDig(x["telefono"]) === soloDig(t["telefono"])) || normal(x["nombre"]) === normal(t["paciente"]));
    return p?.["email"] ? String(p["email"]) : "";
  };
  const resumen: { t: Cita; faltan: 1 | 2; correo: boolean; whatsapp: boolean }[] = [];
  for (const faltan of [1, 2] as const) {
    const fecha = diaColombia(faltan);
    const marca = faltan === 1 ? "recordado1" : "recordado2";
    for (const t of turnos as Cita[]) {
      if (t["fecha"] !== fecha || t[marca] || ["Cancelado", "Atendido"].includes(String(t["estado"]))) continue;
      const email = correoDe(t);
      const correo = email ? await correoRecordatorio(t, email, faltan).catch(() => false) : false;
      const plantilla = env("WHATSAPP_PLANTILLA_RECORDATORIO");
      const whatsapp = plantilla
        ? await enviarWhatsApp(t["telefono"], [String(t["paciente"]).split(" ")[0] ?? "", fechaLarga(t["fecha"]), h12(t["hora"]), String(t["doctor"] ?? "")], plantilla).catch(() => false)
        : false;
      await col.guardar("gb_turnos", { ...t, [marca]: new Date().toISOString(), [`${marca}Canal`]: [correo && "correo", whatsapp && "whatsapp"].filter(Boolean).join(" y ") || "sin envío" });
      resumen.push({ t, faltan, correo, whatsapp });
    }
  }
  if (resumen.length) {
    const fila = (r: (typeof resumen)[number]) => `<tr><td style="padding:6px 8px 6px 0;white-space:nowrap">${esc(h12(r.t["hora"]))}</td><td style="padding:6px 8px 6px 0"><b>${esc(r.t["paciente"])}</b><br><span style="color:#64748b;font-size:12px">${esc(r.t["motivo"] ?? "")} · ${esc(r.t["doctor"] ?? "")}</span></td><td style="padding:6px 0;font-size:12px">${r.correo || r.whatsapp ? `<span style="color:#059669">✓ ${[r.correo && "correo", r.whatsapp && "WhatsApp"].filter(Boolean).join(" y ")}</span>` : `<span style="color:#b45309">Avisar a mano${r.t["telefono"] ? ` · ${esc(r.t["telefono"])}` : ""}</span>`}</td></tr>`;
    const bloque = (faltan: 1 | 2) => {
      const rs = resumen.filter((r) => r.faltan === faltan);
      return rs.length ? `<p style="margin:14px 0 4px;font-weight:bold">${faltan === 1 ? "Mañana" : "Pasado mañana"} · ${esc(fechaLarga(diaColombia(faltan)))}</p><table style="width:100%;border-collapse:collapse;font-size:14px">${rs.map(fila).join("")}</table>` : "";
    };
    await enviarCorreo(env("CORREO_AVISOS").split(","), `Recordatorios de citas · ${resumen.length} paciente${resumen.length === 1 ? "" : "s"}`, marco("Recordatorios enviados hoy", `${bloque(1)}${bloque(2)}<p style="font-size:13px;color:#64748b;margin-top:16px">Los que dicen "Avisar a mano" no tienen correo cargado. Puede escribirles desde el panel, en Automatizaciones o en la tarjeta "Mañana".</p>`)).catch(() => false);
  }
  return { ok: true, enviados: resumen.length };
}


/* ---------- invitación al Portal del paciente ---------- */
export async function invitarPortalPorCorreo(p: Record<string, unknown>) {
  const url = `${base()}/portal`;
  const nombre = String(p["nombre"] ?? "").split(" ")[0] ?? "";
  const digitos = String(p["codigo"] ?? "").split("").map((d) => `<td style="width:44px;height:54px;background:#ffffff;border:1px solid #bae6fd;border-radius:10px;text-align:center;font-size:26px;font-weight:bold;color:#0b2a6b;font-family:'Courier New',monospace">${esc(d)}</td>`).join('<td style="width:6px"></td>');
  return enviarCorreoDetalle(
    [String(p["email"] ?? "")],
    "Su acceso al Portal del paciente · HEGO",
    marco(
      "Bienvenido a su Portal del paciente",
      `<p style="margin:0 0 12px">Hola ${esc(nombre)}, le habilitamos el <b>Portal del paciente</b> del Centro HEGO. Desde ahí puede pedir y cancelar sus citas, ver sus estudios y resultados, sus medicamentos y sus autorizaciones.</p>
       <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:14px;padding:18px;margin:16px 0;text-align:center">
         <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#0369a1;margin-bottom:10px">Su código de acceso</div>
         <table style="margin:0 auto;border-collapse:separate"><tr>${digitos}</tr></table>
         <div style="font-size:13px;color:#475569;margin-top:12px">Usuario: su cédula <b>${esc(p["dni"])}</b></div>
       </div>
       <div style="text-align:center;margin:20px 0 8px"><a href="${url}" style="display:inline-block;background:#0b2a6b;color:#fff;text-decoration:none;font-weight:bold;padding:13px 28px;border-radius:12px">Entrar al portal</a></div>
       <ol style="font-size:14px;color:#334155;padding-left:18px;margin:18px 0 6px">
         <li>Toque <b>Entrar al portal</b> o ingrese a ${esc(url)}</li>
         <li>Escriba su cédula y el código de 6 números.</li>
         <li>Listo: ya puede pedir su cita. Si quiere, puede crear su propia contraseña.</li>
       </ol>
       <p style="font-size:12px;color:#94a3b8;margin-top:16px">Este código es personal. No lo comparta. Si usted no pidió este acceso, ignore este correo.</p>`,
    ),
  );
}
