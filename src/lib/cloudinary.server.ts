/**
 * Archivos en Cloudinary (imágenes, PDF y documentos de pacientes).
 * Se configura con UNA variable en Vercel:
 *   CLOUDINARY_URL = cloudinary://API_KEY:API_SECRET@CLOUD_NAME   (se copia del panel de Cloudinary)
 * Todo se sube como PRIVADO: nadie lo abre con un enlace; el servidor lo entrega solo a quien tiene permiso.
 */
import { createHash } from "node:crypto";

type Conf = { nube: string; clave: string; secreto: string };
export type ArchivoNube = { rt: "image" | "raw"; pid: string; fmt?: string };

export function configCloudinary(): Conf | null {
  const u = process.env["CLOUDINARY_URL"]?.trim();
  if (u) {
    const m = u.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (m) return { clave: m[1]!, secreto: m[2]!, nube: m[3]! };
  }
  const nube = process.env["CLOUDINARY_CLOUD_NAME"]?.trim();
  const clave = process.env["CLOUDINARY_API_KEY"]?.trim();
  const secreto = process.env["CLOUDINARY_API_SECRET"]?.trim();
  return nube && clave && secreto ? { nube, clave, secreto } : null;
}

/** Firma de Cloudinary: parámetros ordenados "a=1&b=2" + secreto, en SHA-1. */
const firmar = (p: Record<string, string>, secreto: string) =>
  createHash("sha1").update(Object.keys(p).sort().filter((k) => p[k] !== "").map((k) => `${k}=${p[k]}`).join("&") + secreto).digest("hex");

/** Sube un archivo privado. Las fotos van como imagen; PDF y demás formatos como archivo. */
export async function subirCloudinary(buf: Buffer, tipo: string, carpeta: string, nombre: string): Promise<ArchivoNube> {
  const c = configCloudinary();
  if (!c) throw new Error("Cloudinary no está configurado.");
  const rt: ArchivoNube["rt"] = tipo.startsWith("image/") && !/svg/.test(tipo) ? "image" : "raw";
  const base = nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "").slice(-70) || "archivo";
  const params: Record<string, string> = {
    folder: carpeta,
    public_id: rt === "raw" ? base : base.replace(/\.[^.]+$/, ""),
    timestamp: String(Math.floor(Date.now() / 1000)),
    type: "private",
    unique_filename: "true",
    use_filename: "true",
  };
  const form = new FormData();
  Object.entries(params).forEach(([k, v]) => form.append(k, v));
  form.append("api_key", c.clave);
  form.append("signature", firmar(params, c.secreto));
  form.append("file", new Blob([new Uint8Array(buf)], { type: tipo || "application/octet-stream" }), base);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${c.nube}/${rt}/upload`, { method: "POST", body: form });
  const j = (await r.json().catch(() => ({}))) as { public_id?: string; format?: string; error?: { message?: string } };
  if (!r.ok || !j.public_id) throw new Error(j.error?.message || `Cloudinary respondió ${r.status}`);
  return { rt, pid: j.public_id, ...(j.format ? { fmt: j.format } : {}) };
}

/** Sube audio PÚBLICO (música de espera de la web): Cloudinary guarda el audio como recurso "video". */
export async function subirAudioPublicoCloudinary(buf: Buffer, tipo: string, nombre: string): Promise<string> {
  const c = configCloudinary();
  if (!c) throw new Error("Cloudinary no está configurado.");
  const base = nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "tema";
  const params: Record<string, string> = { folder: "hego/musica", public_id: base, timestamp: String(Math.floor(Date.now() / 1000)), unique_filename: "true", use_filename: "true" };
  const form = new FormData();
  Object.entries(params).forEach(([k, v]) => form.append(k, v));
  form.append("api_key", c.clave);
  form.append("signature", firmar(params, c.secreto));
  form.append("file", new Blob([new Uint8Array(buf)], { type: tipo || "audio/mpeg" }), nombre);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${c.nube}/video/upload`, { method: "POST", body: form });
  const j = (await r.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } };
  if (!r.ok || !j.secure_url) throw new Error(j.error?.message || `Cloudinary respondió ${r.status}`);
  return j.secure_url;
}

/** Firma para que el navegador suba el audio DIRECTO a Cloudinary (evita el límite de tamaño del servidor). */
export function firmaAudioPublico(nombre: string): { url: string; campos: Record<string, string> } {
  const c = configCloudinary();
  if (!c) throw new Error("Cloudinary no está configurado.");
  const base = nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "tema";
  const params: Record<string, string> = { folder: "hego/musica", public_id: `${base}-${Date.now().toString(36)}`, timestamp: String(Math.floor(Date.now() / 1000)) };
  return { url: `https://api.cloudinary.com/v1_1/${c.nube}/video/upload`, campos: { ...params, api_key: c.clave, signature: firmar(params, c.secreto) } };
}

/** Descarga un archivo privado (con enlace firmado de un solo uso, del lado del servidor). */
export async function bajarCloudinary(a: ArchivoNube): Promise<Buffer> {
  const c = configCloudinary();
  if (!c) throw new Error("Cloudinary no está configurado.");
  const p: Record<string, string> = { public_id: a.pid, timestamp: String(Math.floor(Date.now() / 1000)), type: "private", ...(a.fmt ? { format: a.fmt } : {}) };
  const q = new URLSearchParams({ ...p, api_key: c.clave, signature: firmar(p, c.secreto) });
  const r = await fetch(`https://api.cloudinary.com/v1_1/${c.nube}/${a.rt}/download?${q}`);
  if (!r.ok) throw new Error(`Cloudinary respondió ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

export async function borrarCloudinary(a: ArchivoNube): Promise<void> {
  const c = configCloudinary();
  if (!c) return;
  const p: Record<string, string> = { public_id: a.pid, timestamp: String(Math.floor(Date.now() / 1000)), type: "private", invalidate: "true" };
  const form = new URLSearchParams({ ...p, api_key: c.clave, signature: firmar(p, c.secreto) });
  await fetch(`https://api.cloudinary.com/v1_1/${c.nube}/${a.rt}/destroy`, { method: "POST", body: form }).catch(() => undefined);
}
