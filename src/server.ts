import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const ruta = new URL(request.url).pathname;
    if (ruta === "/api/recordatorios") return recordatorios(request);
    if (ruta === "/api/notificaciones") return notificaciones(request);
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

/** Recordatorios diarios de citas. Lo llama el cron de Vercel (ver nitro.config.ts). */
async function recordatorios(request: Request): Promise<Response> {
  const secreto = process.env["CRON_SECRET"]?.trim();
  const auth = request.headers.get("authorization") ?? "";
  const esCron = (request.headers.get("user-agent") ?? "").startsWith("vercel-cron");
  if (secreto ? auth !== `Bearer ${secreto}` : !esCron) return new Response("No autorizado", { status: 401 });
  try {
    const { enviarRecordatorios } = await import("./lib/avisos.server");
    return Response.json(await enviarRecordatorios());
  } catch (error) {
    console.error("Recordatorios:", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}

/**
 * Notificaciones habilitadas en el panel, para el motor interno de automatizaciones.
 * GET con "Authorization: Bearer <AUTOMATIZACIONES_TOKEN>". Devuelve el catálogo con "activa" en cada una.
 */
async function notificaciones(request: Request): Promise<Response> {
  const clave = process.env["AUTOMATIZACIONES_TOKEN"]?.trim();
  if (!clave) return Response.json({ ok: false, error: "AUTOMATIZACIONES_TOKEN no está configurado." }, { status: 503 });
  if ((request.headers.get("authorization") ?? "") !== `Bearer ${clave}`) return new Response("No autorizado", { status: 401 });
  try {
    const { db } = await import("./lib/db.server");
    const { NOTIFICACIONES, ACTIVAS_POR_DEFECTO } = await import("./lib/notificaciones");
    const sql = await db();
    const filas = (await sql`SELECT valor FROM datos WHERE clave = 'gb_automatizaciones'`) as { valor: Record<string, boolean> | null }[];
    const elegidas = { ...ACTIVAS_POR_DEFECTO, ...(filas[0]?.valor ?? {}) };
    const lista = NOTIFICACIONES.map((n) => ({ ...n, activa: !!elegidas[n.id] }));
    return Response.json({ ok: true, total: lista.length, activas: lista.filter((n) => n.activa).length, notificaciones: lista });
  } catch (error) {
    console.error("Notificaciones:", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
