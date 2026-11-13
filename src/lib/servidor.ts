/**
 * Funciones del servidor (backend). Se llaman desde el navegador como funciones normales;
 * TanStack Start las convierte en pedidos al servidor de Vercel.
 */
import { createServerFn } from "@tanstack/react-start";

export type UsuarioServidor = { id: string; nombre: string; rol: "medico" | "enfermeria" | "personal"; area?: string };
export type PersonalServidor = { id: string; nombre: string; documento?: string; activo: boolean; creado: string; creadoPor: string; area?: string; invitacion?: string };
type Resultado<T = object> = ({ ok: true } & T) | { ok: false; error: string };

/** Datos que cualquiera puede leer (se muestran en la web pública). */
const PUBLICOS = ["gb_sitio", "gb_agenda"] as const;
/** Datos internos: los lee y guarda cualquier persona del equipo con sesión. */
const PRIVADOS = ["gb_firmas", "gb_automatizaciones", "gb_automatizaciones_hechas"] as const;
/** Datos internos que solo los médicos pueden modificar. */
const PRIVADOS_MEDICOS = ["gb_permisos"] as const;
/** Datos que solo los médicos administradores pueden modificar. */
const SOLO_MEDICOS = ["gb_sitio", "gb_agenda"] as const;
const ADMINS_IDS = ["alonso", "alberto"];

import { permiteColeccion, nivelDe, AREA_DIRECCION, AREAS_MEDICAS, type Permisos } from "./permisos";
const permiteModulo = (p: Permisos, area: string, modulo: string, accion: "ver" | "editar") => {
  const n = nivelDe(p, area, modulo);
  return accion === "ver" ? n !== "ninguno" : n === "editar";
};
const modulo = () => import("./db.server");
const acceso = () => import("./acceso.server");

/* ===================================================================== */
/* Estado                                                                  */
/* ===================================================================== */

export const estadoBackend = createServerFn({ method: "GET" }).handler(async () => {
  const { hayBase } = await modulo();
  if (!hayBase()) return { conectado: false as const };
  try {
    await (await acceso()).sembrarAdmins();
    return { conectado: true as const };
  } catch (e) {
    console.error("Base de datos no disponible", e);
    return { conectado: false as const };
  }
});

/* ===================================================================== */
/* Datos (clave → valor JSON)                                              */
/* ===================================================================== */

export const leerDatos = createServerFn({ method: "GET" })
  .validator((d: { claves: string[] }) => d)
  .handler(async ({ data }) => {
    const { hayBase, db } = await modulo();
    if (!hayBase()) return {} as Record<string, string>;
    let permitidas = data.claves.filter((c) => (PUBLICOS as readonly string[]).includes(c));
    const internas = data.claves.filter((c) => ([...PRIVADOS, ...PRIVADOS_MEDICOS] as readonly string[]).includes(c));
    if (internas.length && (await (await acceso()).usuarioActual())) permitidas = [...permitidas, ...internas];
    if (!permitidas.length) return {} as Record<string, string>;
    const sql = await db();
    const filas = (await sql`SELECT clave, valor FROM datos WHERE clave = ANY(${permitidas})`) as { clave: string; valor: unknown }[];
    return Object.fromEntries(filas.map((f) => [f.clave, JSON.stringify(f.valor)])) as Record<string, string>;
  });

export const guardarDatoServidor = createServerFn({ method: "POST" })
  .validator((d: { clave: string; valor: string }) => d)
  .handler(async ({ data }): Promise<Resultado> => {
    const { db } = await modulo();
    const esAgenda = data.clave === "gb_agenda";
    const deMedicos = !esAgenda && ([...SOLO_MEDICOS, ...PRIVADOS_MEDICOS] as readonly string[]).includes(data.clave);
    if (!deMedicos && !(PRIVADOS as readonly string[]).includes(data.clave)) return { ok: false, error: "Dato no habilitado." };
    let u: UsuarioServidor;
    try {
      const a = await acceso();
      if (deMedicos) u = await a.exigirDireccion();
      else if (esAgenda) {
        // Agenda: los médicos, o el personal con permiso de editar Horarios (secretaría)
        const x = await a.usuarioActual();
        if (!x) throw new Error("Tu sesión venció. Volvé a ingresar.");
        if (x.rol !== "medico" && !permiteModulo(await permisosGuardados(), x.area ?? "", "Horarios", "editar")) throw new Error("Tu área no tiene permiso para modificar horarios.");
        u = x;
      }
      else {
        const x = await a.usuarioActual();
        if (!x) throw new Error("Tu sesión venció. Volvé a ingresar.");
        u = x;
      }
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const sql = await db();
    let json = data.valor;
    if (data.clave === "gb_agenda") {
      // Cada médico solo puede guardar SU agenda: se toma su parte y se conserva la del otro
      // Cada médico solo cambia SU agenda; las de los demás profesionales las cambian
      // los médicos o la secretaría. La agenda de un médico nunca la toca otro.
      const nuevo = JSON.parse(data.valor || "{}") as Record<string, unknown>;
      const filas = (await sql`SELECT valor FROM datos WHERE clave = 'gb_agenda'`) as { valor: Record<string, unknown> }[];
      const actual: Record<string, unknown> = { ...(filas[0]?.valor ?? {}) };
      const admins = ["alonso", "alberto"];
      const puede = (k: string) => (admins.includes(k) ? u.rol === "medico" && k === u.id : true);
      for (const k of new Set([...Object.keys(actual), ...Object.keys(nuevo)])) {
        if (!puede(k)) continue;
        if (k in nuevo) actual[k] = nuevo[k];
        else if (!admins.includes(k)) delete actual[k];
      }
      json = JSON.stringify(actual);
    }
    await sql`INSERT INTO datos (clave, valor, por, actualizado) VALUES (${data.clave}, ${json}::jsonb, ${u.nombre}, now())
      ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, por = EXCLUDED.por, actualizado = now()`;
    return { ok: true };
  });

/* ===================================================================== */
/* Acceso: médicos y personal                                              */
/* ===================================================================== */

/** Lista para la pantalla de ingreso (sin datos sensibles). */
export const listaIngreso = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await (await acceso()).sembrarAdmins();
  const filas = (await sql`SELECT id, nombre, rol, area, documento, activo, creado, creado_por, (hash IS NOT NULL) AS con_clave FROM usuarios ORDER BY creado`) as {
    id: string; nombre: string; rol: string; area: string | null; documento: string | null; activo: boolean; creado: string; creado_por: string | null; con_clave: boolean;
  }[];
  return {
    conClave: filas.filter((f) => f.con_clave).map((f) => f.id),
    personal: filas
      .filter((f) => f.rol !== "medico" && f.activo)
      .map((f): PersonalServidor => ({ id: f.id, nombre: f.nombre, activo: f.activo, creado: new Date(f.creado).toISOString(), creadoPor: f.creado_por ?? "", ...(f.area ? { area: f.area } : {}) })),
  };
});

export const crearClaveServidor = createServerFn({ method: "POST" })
  .validator((d: { id: string; password: string }) => d)
  .handler(async ({ data }): Promise<Resultado> => {
    const { hashClave } = await modulo();
    const sql = await (await acceso()).sembrarAdmins();
    if (data.password.length < 8) return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
    const filas = (await sql`SELECT nombre, rol, hash FROM usuarios WHERE id = ${data.id} AND activo = true`) as { nombre: string; rol: string; hash: string | null }[];
    const f = filas[0];
    if (!f || f.rol !== "medico") return { ok: false, error: "Usuario no autorizado." };
    if (f.hash) return { ok: false, error: "Este usuario ya tiene contraseña." };
    await sql`UPDATE usuarios SET hash = ${hashClave(data.password)} WHERE id = ${data.id} AND hash IS NULL`;
    await (await acceso()).auditar(f.nombre, "Contraseña creada", "Primer ingreso");
    return { ok: true };
  });

export const ingresarServidor = createServerFn({ method: "POST" })
  .validator((d: { id: string; password: string }) => d)
  .handler(async ({ data }): Promise<Resultado<{ usuario?: UsuarioServidor; ticket?: string; configurar2fa?: boolean }>> => {
    const { verificarClave } = await modulo();
    const sql = await (await acceso()).sembrarAdmins();
    const filas = (await sql`SELECT id, nombre, rol, area, hash FROM usuarios WHERE id = ${data.id} AND activo = true`) as {
      id: string; nombre: string; rol: string; area: string | null; hash: string | null;
    }[];
    const f = filas[0];
    if (!f) return { ok: false, error: "Usuario no autorizado." };
    if (!f.hash) return { ok: false, error: "Este usuario todavía no creó su contraseña." };
    const a = await acceso();
    const freno = await a.bloqueado(`staff:${f.id}`);
    if (freno) return { ok: false, error: freno };
    if (!verificarClave(data.password, f.hash)) {
      await a.registrarFallo(`staff:${f.id}`);
      await a.auditar(f.nombre, "Intento de acceso fallido", "Contraseña incorrecta");
      return { ok: false, error: (await a.bloqueado(`staff:${f.id}`)) ?? "Contraseña incorrecta." };
    }
    await a.limpiarFallos(`staff:${f.id}`);
    const usuario = a.aUsuario(f);
    const seg = (await sql`SELECT totp_ok FROM usuarios WHERE id = ${f.id}`) as { totp_ok: boolean }[];
    // Con 2FA activo: todavía no hay sesión, falta el código de la app
    if (seg[0]?.totp_ok) {
      const ticket = (await modulo()).tokenAleatorio();
      await sql`DELETE FROM desafios WHERE expira < now() OR usuario_id = ${f.id}`;
      await sql`INSERT INTO desafios (token, usuario_id, expira) VALUES (${a.sha(ticket)}, ${f.id}, now() + interval '5 minutes')`;
      return { ok: true, ticket };
    }
    // Obligatorio y sin configurar: sesión limitada, solo para activar el 2FA
    const falta = a.exige2fa(usuario);
    await a.abrirSesion(f.id, falta);
    await a.auditar(f.nombre, "Inicio de sesión", usuario.rol === "medico" ? "Acceso al panel administrativo" : `Acceso al panel · ${usuario.area ?? ""}`);
    return { ok: true, usuario, configurar2fa: falta };
  });

/** Segundo paso del ingreso: código de 6 dígitos de la app (o un código de respaldo). */
export const verificar2faServidor = createServerFn({ method: "POST" })
  .validator((d: { ticket: string; codigo: string }) => d)
  .handler(async ({ data }): Promise<Resultado<{ usuario: UsuarioServidor }>> => {
    const { db } = await modulo();
    const a = await acceso();
    const sql = await db();
    const filas = (await sql`SELECT u.id, u.nombre, u.rol, u.area, u.totp, u.respaldo FROM desafios d JOIN usuarios u ON u.id = d.usuario_id
      WHERE d.token = ${a.sha(data.ticket)} AND d.expira > now() AND u.activo = true`) as { id: string; nombre: string; rol: string; area: string | null; totp: string | null; respaldo: string | null }[];
    const f = filas[0];
    if (!f || !f.totp) return { ok: false, error: "El ingreso venció. Volvé a poner tu contraseña." };
    const llave = `2fa:${f.id}`;
    const freno = await a.bloqueado(llave);
    if (freno) return { ok: false, error: freno };
    const cod = data.codigo.trim().toUpperCase();
    let ok = a.totpValido(f.totp, cod);
    if (!ok && cod.includes("-")) {
      // Código de respaldo: sirve una sola vez
      const lista = JSON.parse(f.respaldo ?? "[]") as string[];
      const h = a.sha(cod);
      if (lista.includes(h)) {
        ok = true;
        await sql`UPDATE usuarios SET respaldo = ${JSON.stringify(lista.filter((x) => x !== h))} WHERE id = ${f.id}`;
        await a.auditar(f.nombre, "Ingreso con código de respaldo", `Quedan ${lista.length - 1}`);
      }
    }
    if (!ok) {
      await a.registrarFallo(llave);
      await a.auditar(f.nombre, "Código 2FA incorrecto", "");
      return { ok: false, error: (await a.bloqueado(llave)) ?? "Código incorrecto. Fijate en la app y probá de nuevo." };
    }
    await a.limpiarFallos(llave);
    await sql`DELETE FROM desafios WHERE usuario_id = ${f.id}`;
    await a.abrirSesion(f.id);
    const usuario = a.aUsuario(f);
    await a.auditar(f.nombre, "Inicio de sesión", "Con verificación en dos pasos");
    return { ok: true, usuario };
  });

/** Estado de seguridad del usuario conectado (2FA y correo). */
export const seguridadServidor = createServerFn({ method: "GET" }).handler(async (): Promise<Resultado<{ activo: boolean; obligatorio: boolean; email: string; respaldos: number; correoListo: boolean }>> => {
  const a = await acceso();
  const s = await a.sesionCompleta();
  if (!s) return { ok: false, error: "Sin sesión." };
  const sql = await (await modulo()).db();
  const f = (await sql`SELECT email, respaldo FROM usuarios WHERE id = ${s.usuario.id}`) as { email: string | null; respaldo: string | null }[];
  return { ok: true, activo: s.totpOk, obligatorio: a.exige2fa(s.usuario), email: f[0]?.email ?? "", respaldos: (JSON.parse(f[0]?.respaldo ?? "[]") as string[]).length, correoListo: !!process.env["RESEND_API_KEY"] };
});

/** Empieza a activar el 2FA: genera la clave y el QR para escanear. */
export const iniciar2faServidor = createServerFn({ method: "POST" }).handler(async (): Promise<Resultado<{ qr: string; secreto: string }>> => {
  const a = await acceso();
  const s = await a.sesionCompleta();
  if (!s) return { ok: false, error: "Tu sesión venció. Volvé a ingresar." };
  if (s.totpOk) return { ok: false, error: "Ya tenés la verificación en dos pasos activa." };
  const secreto = a.nuevoSecreto();
  const sql = await (await modulo()).db();
  await sql`UPDATE usuarios SET totp = ${secreto}, totp_ok = false WHERE id = ${s.usuario.id}`;
  const etiqueta = encodeURIComponent(`HEGO:${s.usuario.nombre}`);
  const url = `otpauth://totp/${etiqueta}?secret=${secreto}&issuer=${encodeURIComponent("HEGO Centro Médico")}&algorithm=SHA1&digits=6&period=30`;
  const QR = await import("qrcode");
  const qr = await QR.toDataURL(url, { margin: 1, width: 240, color: { dark: "#0b1f4d", light: "#ffffff" } });
  return { ok: true, qr, secreto: secreto.replace(/(.{4})/g, "$1 ").trim() };
});

/** Confirma el 2FA con el primer código. Devuelve los códigos de respaldo (se muestran una vez). */
export const confirmar2faServidor = createServerFn({ method: "POST" })
  .validator((d: { codigo: string }) => d)
  .handler(async ({ data }): Promise<Resultado<{ respaldo: string[] }>> => {
    const a = await acceso();
    const s = await a.sesionCompleta();
    if (!s) return { ok: false, error: "Tu sesión venció. Volvé a ingresar." };
    const sql = await (await modulo()).db();
    const f = (await sql`SELECT totp FROM usuarios WHERE id = ${s.usuario.id}`) as { totp: string | null }[];
    if (!f[0]?.totp) return { ok: false, error: "Volvé a generar el código QR." };
    if (!a.totpValido(f[0].totp, data.codigo)) return { ok: false, error: "El código no coincide. Usá el que muestra la app en este momento." };
    const respaldo = a.codigosRespaldo();
    await sql`UPDATE usuarios SET totp_ok = true, respaldo = ${JSON.stringify(respaldo.map(a.sha))} WHERE id = ${s.usuario.id}`;
    const token = a.tokenCookie();
    if (token) await sql`UPDATE sesiones SET limitada = false, expira = now() + interval '14 days' WHERE token = ${token}`;
    await a.auditar(s.usuario.nombre, "Verificación en dos pasos activada", "");
    return { ok: true, respaldo };
  });

/** Apaga el 2FA (solo quien no está obligado), pidiendo un código válido. */
export const desactivar2faServidor = createServerFn({ method: "POST" })
  .validator((d: { codigo: string }) => d)
  .handler(async ({ data }): Promise<Resultado> => {
    const a = await acceso();
    const s = await a.sesionCompleta();
    if (!s || s.falta2fa) return { ok: false, error: "Tu sesión venció. Volvé a ingresar." };
    const sql = await (await modulo()).db();
    const f = (await sql`SELECT totp FROM usuarios WHERE id = ${s.usuario.id}`) as { totp: string | null }[];
    if (!f[0]?.totp || !a.totpValido(f[0].totp, data.codigo)) return { ok: false, error: "Código incorrecto." };
    await sql`UPDATE usuarios SET totp = NULL, totp_ok = false, respaldo = NULL WHERE id = ${s.usuario.id}`;
    // Si es obligatoria (médicos y Dirección), cierra sesión: al volver a entrar se escanea el QR otra vez
    if (a.exige2fa(s.usuario)) await sql`DELETE FROM sesiones WHERE usuario_id = ${s.usuario.id}`;
    await a.auditar(s.usuario.nombre, a.exige2fa(s.usuario) ? "Verificación en dos pasos reiniciada" : "Verificación en dos pasos desactivada", "");
    return { ok: true };
  });

/** Un médico (o Dirección, para el personal) le restablece el 2FA a otra persona que perdió el celular. */
export const restablecer2faServidor = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }): Promise<Resultado> => {
    const a = await acceso();
    let u: UsuarioServidor;
    try {
      u = await a.exigirDireccion();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    if (data.id === u.id) return { ok: false, error: "No podés restablecer tu propia verificación." };
    const sql = await (await modulo()).db();
    const f = (await sql`SELECT nombre, rol FROM usuarios WHERE id = ${data.id}`) as { nombre: string; rol: string }[];
    if (!f[0]) return { ok: false, error: "Usuario no encontrado." };
    if (f[0].rol === "medico" && u.rol !== "medico") return { ok: false, error: "La verificación de un médico solo la restablece el otro médico." };
    await sql`UPDATE usuarios SET totp = NULL, totp_ok = false, respaldo = NULL WHERE id = ${data.id}`;
    await sql`DELETE FROM sesiones WHERE usuario_id = ${data.id}`;
    await a.auditar(u.nombre, "Restableció la verificación en dos pasos", f[0].nombre);
    return { ok: true };
  });

/** Guarda el correo del usuario (para recuperar la contraseña). */
export const guardarEmailServidor = createServerFn({ method: "POST" })
  .validator((d: { email: string }) => d)
  .handler(async ({ data }): Promise<Resultado> => {
    const a = await acceso();
    const u = await a.usuarioActual();
    if (!u) return { ok: false, error: "Tu sesión venció. Volvé a ingresar." };
    const email = data.email.trim().toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Ese correo no parece válido." };
    const sql = await (await modulo()).db();
    await sql`UPDATE usuarios SET email = ${email || null} WHERE id = ${u.id}`;
    await a.auditar(u.nombre, "Correo de recuperación actualizado", "");
    return { ok: true };
  });

/** "Olvidé mi contraseña": manda un link por correo (Resend). Siempre responde igual, para no revelar quién existe. */
export const pedirRecuperoServidor = createServerFn({ method: "POST" })
  .validator((d: { email: string; origen: string }) => d)
  .handler(async ({ data }): Promise<Resultado> => {
    const clave = process.env["RESEND_API_KEY"];
    if (!clave) return { ok: false, error: "El envío de correos todavía no está configurado. Pedile a un médico o a Dirección que te restablezca la contraseña." };
    const a = await acceso();
    const email = data.email.trim().toLowerCase();
    const llave = `rec:${email}`;
    const freno = await a.bloqueado(llave);
    if (freno) return { ok: false, error: freno };
    await a.registrarFallo(llave); // cuenta pedidos: máximo 5 cada 15 minutos
    const sql = await (await modulo()).db();
    const f = (await sql`SELECT id, nombre FROM usuarios WHERE lower(email) = ${email} AND activo = true`) as { id: string; nombre: string }[];
    if (f[0]) {
      const token = (await modulo()).tokenAleatorio();
      await sql`DELETE FROM recuperos WHERE expira < now() OR usuario_id = ${f[0].id}`;
      await sql`INSERT INTO recuperos (token, usuario_id, expira) VALUES (${a.sha(token)}, ${f[0].id}, now() + interval '1 hour')`;
      const base = /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(data.origen) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(data.origen) ? data.origen : "https://doctor-gomez.vercel.app";
      const link = `${base}/login?recuperar=${token}`;
      const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#0b1f4d">
        <h2 style="margin:0 0 12px">HEGO · Centro de especialidades médicas</h2>
        <p>Hola ${f[0].nombre.replace(/[<>]/g, "")}, pediste restablecer tu contraseña del panel.</p>
        <p><a href="${link}" style="display:inline-block;background:#0b3d91;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">Crear contraseña nueva</a></p>
        <p style="font-size:13px;color:#555">El link vale por 1 hora y sirve una sola vez. Si no fuiste vos, ignorá este correo: tu contraseña no cambia.</p></div>`;
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env["RESEND_FROM"] ?? "HEGO <onboarding@resend.dev>", to: [email], subject: "Restablecer tu contraseña · HEGO", html }),
      }).catch(() => null);
      await a.auditar(f[0].nombre, "Pidió restablecer contraseña", r?.ok ? "Correo enviado" : `No se pudo enviar (${r?.status ?? "sin respuesta"})`);
    }
    return { ok: true };
  });

/** Usa el link del correo para poner una contraseña nueva. */
export const usarRecuperoServidor = createServerFn({ method: "POST" })
  .validator((d: { token: string; password: string }) => d)
  .handler(async ({ data }): Promise<Resultado> => {
    if (data.password.length < 8) return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
    const a = await acceso();
    const { db, hashClave } = await modulo();
    const sql = await db();
    const f = (await sql`SELECT r.usuario_id, u.nombre FROM recuperos r JOIN usuarios u ON u.id = r.usuario_id
      WHERE r.token = ${a.sha(data.token)} AND r.expira > now() AND r.usado = false AND u.activo = true`) as { usuario_id: string; nombre: string }[];
    if (!f[0]) return { ok: false, error: "El link venció o ya se usó. Pedí uno nuevo." };
    await sql`UPDATE usuarios SET hash = ${hashClave(data.password)} WHERE id = ${f[0].usuario_id}`;
    await sql`UPDATE recuperos SET usado = true WHERE usuario_id = ${f[0].usuario_id}`;
    await sql`DELETE FROM sesiones WHERE usuario_id = ${f[0].usuario_id}`;
    await a.limpiarFallos(`staff:${f[0].usuario_id}`);
    await a.auditar(f[0].nombre, "Contraseña restablecida por correo", "");
    return { ok: true };
  });

export const sesionServidor = createServerFn({ method: "GET" }).handler(async () => {
  const s = await (await acceso()).sesionCompleta();
  return s ? { usuario: s.usuario, falta2fa: s.falta2fa } : null;
});

export const salirServidor = createServerFn({ method: "POST" }).handler(async () => {
  const { hayBase, db } = await modulo();
  const a = await acceso();
  const token = a.tokenCookie();
  if (hayBase() && token) {
    const sql = await db();
    await sql`DELETE FROM sesiones WHERE token = ${token}`;
  }
  a.borrarCookie();
  return { ok: true };
});

export const cambiarClaveServidor = createServerFn({ method: "POST" })
  .validator((d: { actual: string; nueva: string }) => d)
  .handler(async ({ data }): Promise<Resultado> => {
    const { db, hashClave, verificarClave } = await modulo();
    const u = await (await acceso()).usuarioActual();
    if (!u) return { ok: false, error: "Tu sesión venció. Volvé a ingresar." };
    const sql = await db();
    const filas = (await sql`SELECT hash FROM usuarios WHERE id = ${u.id}`) as { hash: string | null }[];
    if (!verificarClave(data.actual, filas[0]?.hash ?? null)) return { ok: false, error: "La contraseña actual no es correcta." };
    if (data.nueva.length < 8) return { ok: false, error: "La nueva contraseña debe tener al menos 8 caracteres." };
    await sql`UPDATE usuarios SET hash = ${hashClave(data.nueva)} WHERE id = ${u.id}`;
    await (await acceso()).auditar(u.nombre, "Contraseña cambiada");
    return { ok: true };
  });

/* ---------- Personal (lo administran los médicos) ---------- */

export const listarPersonalServidor = createServerFn({ method: "GET" }).handler(async (): Promise<Resultado<{ personal: PersonalServidor[]; conClave: string[] }>> => {
  const { db } = await modulo();
  try {
    await (await acceso()).exigirDireccion();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const sql = await db();
  const filas = (await sql`SELECT id, nombre, area, documento, activo, invitacion, creado, creado_por, (hash IS NOT NULL) AS con_clave FROM usuarios WHERE rol <> 'medico' ORDER BY creado`) as {
    id: string; nombre: string; area: string | null; documento: string | null; activo: boolean; invitacion: string | null; creado: string; creado_por: string | null; con_clave: boolean;
  }[];
  return {
    ok: true,
    conClave: filas.filter((f) => f.con_clave).map((f) => f.id),
    personal: filas.map((f) => ({
      id: f.id,
      nombre: f.nombre,
      activo: f.activo,
      creado: new Date(f.creado).toISOString(),
      creadoPor: f.creado_por ?? "",
      ...(f.area ? { area: f.area } : {}),
      ...(f.documento ? { documento: f.documento } : {}),
      ...(f.invitacion ? { invitacion: f.invitacion } : {}),
    })),
  };
});

/** Guarda la lista completa del personal (altas, bajas, invitaciones). No toca contraseñas. */
export const guardarPersonalServidor = createServerFn({ method: "POST" })
  .validator((d: { personal: PersonalServidor[]; resetear?: string[] }) => d)
  .handler(async ({ data }): Promise<Resultado> => {
    const { db } = await modulo();
    let u: UsuarioServidor;
    try {
      u = await (await acceso()).exigirDireccion();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const sql = await db();
    for (const p of data.personal) {
      if (ADMINS_IDS.includes(p.id)) continue;
      const area = p.area ?? "Enfermería";
      const rol = area === "Enfermería" ? "enfermeria" : "personal";
      await sql`INSERT INTO usuarios (id, nombre, rol, area, documento, activo, invitacion, creado, creado_por)
        VALUES (${p.id}, ${p.nombre}, ${rol}, ${area}, ${p.documento ?? null}, ${p.activo}, ${p.invitacion ?? null}, ${p.creado}, ${p.creadoPor || u.nombre})
        ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, rol = EXCLUDED.rol, area = EXCLUDED.area, documento = EXCLUDED.documento,
          activo = EXCLUDED.activo, invitacion = EXCLUDED.invitacion`;
      if (!p.activo) await sql`DELETE FROM sesiones WHERE usuario_id = ${p.id}`;
    }
    for (const id of data.resetear ?? []) {
      if (ADMINS_IDS.includes(id)) continue;
      await sql`UPDATE usuarios SET hash = NULL, totp = NULL, totp_ok = false, respaldo = NULL WHERE id = ${id}`;
      await sql`DELETE FROM sesiones WHERE usuario_id = ${id}`;
    }
    return { ok: true };
  });

export const verInvitacion = createServerFn({ method: "GET" })
  .validator((d: { id: string; token: string }) => d)
  .handler(async ({ data }) => {
    const { db } = await modulo();
    const sql = await db();
    const filas = (await sql`SELECT id, nombre, area, documento, activo, invitacion, creado, creado_por FROM usuarios WHERE id = ${data.id} AND rol <> 'medico'`) as {
      id: string; nombre: string; area: string | null; documento: string | null; activo: boolean; invitacion: string | null; creado: string; creado_por: string | null;
    }[];
    const f = filas[0];
    if (!f || !f.activo || !f.invitacion || f.invitacion !== data.token) return null;
    return { id: f.id, nombre: f.nombre, activo: true, creado: new Date(f.creado).toISOString(), creadoPor: f.creado_por ?? "", invitacion: f.invitacion, ...(f.area ? { area: f.area } : {}), ...(f.documento ? { documento: f.documento } : {}) } as PersonalServidor;
  });

export const aceptarInvitacionServidor = createServerFn({ method: "POST" })
  .validator((d: { id: string; token: string; password: string }) => d)
  .handler(async ({ data }): Promise<Resultado<{ usuario: UsuarioServidor }>> => {
    const { db, hashClave } = await modulo();
    if (data.password.length < 8) return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
    const sql = await db();
    const filas = (await sql`UPDATE usuarios SET hash = ${hashClave(data.password)}, invitacion = NULL
      WHERE id = ${data.id} AND invitacion = ${data.token} AND activo = true AND rol <> 'medico'
      RETURNING id, nombre, rol, area`) as { id: string; nombre: string; rol: string; area: string | null }[];
    const f = filas[0];
    if (!f) return { ok: false, error: "Este link ya se usó o no es válido. Pedí uno nuevo." };
    await (await acceso()).auditar(f.nombre, "Contraseña creada", `Invitación aceptada · ${f.area ?? ""}`);
    await (await acceso()).abrirSesion(f.id);
    return { ok: true, usuario: (await acceso()).aUsuario(f) };
  });

/* ===================================================================== */
/* Archivos (música de espera) → Vercel Blob                               */
/* ===================================================================== */

export const subirAudioServidor = createServerFn({ method: "POST" })
  .validator((d: { nombre: string; tipo: string; base64: string }) => d)
  .handler(async ({ data }): Promise<Resultado<{ url: string }>> => {
    try {
      await (await acceso()).exigirDireccion();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    if (!process.env["BLOB_READ_WRITE_TOKEN"]) return { ok: false, error: "El almacenamiento de archivos no está configurado." };
    if (!data.tipo.startsWith("audio/")) return { ok: false, error: "El archivo tiene que ser de audio." };
    const buf = Buffer.from(data.base64, "base64");
    if (buf.length > 15 * 1024 * 1024) return { ok: false, error: "El archivo supera 15 MB." };
    const { put } = await import("@vercel/blob");
    const limpio = data.nombre.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(0, 60) || "tema";
    const r = await put(`musica/${limpio}`, buf, { access: "public", contentType: data.tipo, addRandomSuffix: true });
    return { ok: true, url: r.url };
  });

/* ===================================================================== */
/* Colecciones: turnos, padrón y pacientes del portal                      */
/* ===================================================================== */

const colecciones = () => import("./colecciones.server");

type Quien = { tipo: "staff"; id: string; nombre: string; medico: boolean; area: string } | { tipo: "paciente"; id: string; nombre: string } | null;

async function quienSoy(): Promise<Quien> {
  const u = await (await acceso()).usuarioActual();
  if (u) return { tipo: "staff", id: u.id, nombre: u.nombre, medico: u.rol === "medico", area: u.area ?? (u.rol === "enfermeria" ? "Enfermería" : "") };
  const c = await colecciones();
  const p = await c.pacienteActual().catch(() => null);
  if (p) return { tipo: "paciente", id: p.id, nombre: String(p["nombre"] ?? "") };
  return null;
}

/** Permisos por área guardados por los médicos (si no hay, valen los de fábrica). */
async function permisosGuardados(): Promise<Permisos> {
  const sql = await (await modulo()).db();
  const filas = (await sql`SELECT valor FROM datos WHERE clave = 'gb_permisos'`) as { valor: Permisos }[];
  return filas[0]?.valor ?? {};
}

/** ¿Este integrante del personal puede ver / editar la colección según su área? */
async function areaPermite(q: Extract<Quien, { tipo: "staff" }>, coleccion: string, accion: "ver" | "editar") {
  if (q.medico) return true;
  return permiteColeccion(await permisosGuardados(), q.area, coleccion, accion);
}

/** Lee una colección. Los médicos ven todo, el personal según su área y el paciente solo lo suyo. */
export const leerColeccion = createServerFn({ method: "GET" })
  .validator((d: { coleccion: string }) => d)
  .handler(async ({ data }): Promise<Resultado<{ json: string }>> => {
    const { hayBase } = await modulo();
    if (!hayBase()) return { ok: false, error: "Sin base de datos." };
    const c = await colecciones();
    if (!c.esColeccion(data.coleccion)) return { ok: false, error: "Colección no habilitada." };
    const q = await quienSoy();
    if (!q) return { ok: false, error: "Sin sesión." };
    // Chat interno: todo el personal; el canal de médicos solo lo ven médicos y Dirección
    if (data.coleccion === "gb_mensajes") {
      if (q.tipo !== "staff") return { ok: true, json: "[]" };
      const todos = await c.leer("gb_mensajes");
      const veMedicos = q.medico || q.area === AREA_DIRECCION || AREAS_MEDICAS.includes(q.area);
      const visible = (m: Record<string, unknown>) => {
        const canal = String(m["canal"] ?? "");
        if (canal.startsWith("dm:")) return canal.slice(3).split("|").includes(q.id); // privados: solo los dos
        return canal !== "medicos" || veMedicos;
      };
      return { ok: true, json: JSON.stringify(todos.filter(visible)) };
    }
    if (q.tipo === "staff" && !(await areaPermite(q, data.coleccion, "ver"))) return { ok: true, json: "[]" };
    let filas = await c.leer(data.coleccion);
    if (q.tipo === "paciente") {
      if (data.coleccion === "gb_pacientes") filas = filas.filter((p) => p.id === q.id);
      else if (c.DEL_PACIENTE.includes(data.coleccion)) filas = filas.filter((t) => t["pacienteId"] === q.id);
      else filas = [];
    }
    return { ok: true, json: JSON.stringify(filas) };
  });

/** Aplica cambios fila por fila (así dos personas pueden trabajar a la vez sin pisarse). */
export const aplicarCambios = createServerFn({ method: "POST" })
  .validator((d: { coleccion: string; upserts: string[]; borrar: string[] }) => d)
  .handler(async ({ data }): Promise<Resultado> => {
    const c = await colecciones();
    if (!c.esColeccion(data.coleccion)) return { ok: false, error: "Colección no habilitada." };
    const q = await quienSoy();
    if (!q) return { ok: false, error: "Tu sesión venció. Volvé a ingresar." };
    const filas = data.upserts.map((x) => JSON.parse(x) as Record<string, unknown> & { id: string }).filter((f) => typeof f.id === "string" && f.id);

    // Auditoría: cualquiera agrega eventos, nadie los cambia ni los borra (salvo los médicos)
    if (data.coleccion === "gb_audit" && !(q.tipo === "staff" && q.medico)) {
      for (const f of filas) if (!(await c.uno("gb_audit", f.id))) await c.guardar("gb_audit", { ...f, usuario: q.nombre });
      return { ok: true };
    }

    // Chat interno: cada uno escribe a su nombre; borra lo suyo (médicos y Dirección, cualquiera)
    if (data.coleccion === "gb_mensajes") {
      if (q.tipo !== "staff") return { ok: false, error: "No autorizado." };
      const jefe = q.medico || q.area === AREA_DIRECCION;
      for (const f of filas) {
        const previo = await c.uno("gb_mensajes", f.id);
        const canal = String(previo?.["canal"] ?? f["canal"] ?? "");
        const privado = canal.startsWith("dm:");
        if (privado && !canal.slice(3).split("|").includes(q.id)) return { ok: false, error: "No autorizado." };
        if (previo && previo["deId"] !== q.id && (!jefe || privado)) return { ok: false, error: "Solo podés editar tus mensajes." };
        if (!previo && f["canal"] === "avisos" && !jefe) return { ok: false, error: "En Avisos publican los médicos y Dirección." };
        await c.guardar("gb_mensajes", { ...f, deId: previo?.["deId"] ?? q.id, de: previo?.["de"] ?? q.nombre });
      }
      for (const id of data.borrar) {
        const previo = await c.uno("gb_mensajes", id);
        const privado = String(previo?.["canal"] ?? "").startsWith("dm:");
        if (previo && (previo["deId"] === q.id || (jefe && !privado))) await c.borrar("gb_mensajes", [id]);
      }
      return { ok: true };
    }

    if (q.tipo === "staff") {
      if (!(await areaPermite(q, data.coleccion, "editar"))) {
        await (await acceso()).auditar(q.nombre, "Cambio bloqueado por permisos", `${q.area || "Sin área"} · ${data.coleccion.replace("gb_", "")}`);
        return { ok: false, error: `Tu área (${q.area || "sin área"}) no tiene permiso para modificar esto. Pedíselo a un médico administrador.` };
      }
      for (const f of filas) await c.guardar(data.coleccion, f);
      await c.borrar(data.coleccion, data.borrar);
      return { ok: true };
    }

    // Paciente: lo que carga en su portal (controles, medicación, autorizaciones) solo si es suyo
    if (c.EDITA_PACIENTE.includes(data.coleccion)) {
      for (const f of filas) {
        const previo = await c.uno(data.coleccion, f.id);
        if (previo && previo["pacienteId"] !== q.id) return { ok: false, error: "No autorizado." };
        await c.guardar(data.coleccion, { ...f, pacienteId: q.id });
      }
      for (const id of data.borrar) {
        const previo = await c.uno(data.coleccion, id);
        if (previo && previo["pacienteId"] === q.id) await c.borrar(data.coleccion, [id]);
      }
      return { ok: true };
    }
    // Paciente: solo pedir/cancelar sus turnos y editar su perfil
    if (data.borrar.length) return { ok: false, error: "No autorizado." };
    if (data.coleccion === "gb_turnos") {
      for (const f of filas) {
        const previo = await c.uno("gb_turnos", f.id);
        if (previo) {
          if (previo["pacienteId"] !== q.id) return { ok: false, error: "No autorizado." };
          if (f["estado"] === "Cancelado") await c.guardar("gb_turnos", { ...previo, estado: "Cancelado" } as typeof f);
          continue;
        }
        const t: Record<string, unknown> & { id: string } = { ...f, pacienteId: q.id, paciente: q.nombre, estado: "Pendiente", origen: "portal" };
        if (await c.horarioOcupado(String(t["doctor"]), String(t["fecha"]), String(t["hora"]))) return { ok: false, error: "Ese horario se acaba de ocupar. Elegí otro." };
        await c.guardar("gb_turnos", t);
        await (await acceso()).auditar(q.nombre, "Turno pedido desde el portal", `${t["fecha"]} ${t["hora"]} · ${t["doctor"]}`);
      }
      return { ok: true };
    }
    if (data.coleccion === "gb_pacientes") {
      const f = filas.find((x) => x.id === q.id);
      const previo = await c.uno("gb_pacientes", q.id);
      if (!f || !previo) return { ok: false, error: "No autorizado." };
      const permitido: Record<string, unknown> = {};
      for (const k of ["telefono", "email", "ficha", "clave"]) if (k in f) permitido[k] = f[k];
      await c.guardar("gb_pacientes", { ...previo, ...permitido, id: q.id });
      return { ok: true };
    }
    return { ok: false, error: "No autorizado." };
  });

/** Horarios tomados (sin datos de pacientes) para mostrar disponibilidad en la web. */
export const horariosOcupados = createServerFn({ method: "GET" })
  .validator((d: { desde: string }) => d)
  .handler(async ({ data }) => {
    const { hayBase } = await modulo();
    if (!hayBase()) return [] as { doctor: string; fecha: string; hora: string }[];
    return (await colecciones()).ocupadosDesde(data.desde);
  });

/** Reserva desde la web pública (sin cuenta). */
export const reservarTurnoPublico = createServerFn({ method: "POST" })
  .validator((d: { fecha: string; hora: string; paciente: string; doctor: string; motivo: string; telefono: string; email: string }) => d)
  .handler(async ({ data }): Promise<Resultado<{ id: string }>> => {
    const c = await colecciones();
    const limpio = (s: string, n: number) => String(s ?? "").trim().slice(0, n);
    const t = {
      id: (await modulo()).tokenAleatorio(5),
      fecha: limpio(data.fecha, 10),
      hora: limpio(data.hora, 5),
      paciente: limpio(data.paciente, 120),
      doctor: limpio(data.doctor, 120),
      motivo: limpio(data.motivo, 300),
      telefono: limpio(data.telefono, 40),
      email: limpio(data.email, 120),
      estado: "Pendiente",
      origen: "web",
    };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(t.fecha) || !/^\d{2}:\d{2}$/.test(t.hora) || t.paciente.length < 3 || !t.telefono) return { ok: false, error: "Faltan datos del turno." };
    if (await c.horarioOcupado(t.doctor, t.fecha, t.hora)) return { ok: false, error: "Ese horario se acaba de ocupar. Elegí otro, por favor." };
    await c.guardar("gb_turnos", t);
    await (await acceso()).auditar("Web", "Turno solicitado desde la web", `${t.paciente} · ${t.fecha} ${t.hora} · ${t.doctor}`);
    return { ok: true, id: t.id };
  });

/** Ingreso al portal del paciente. */
export const ingresarPacienteServidor = createServerFn({ method: "POST" })
  .validator((d: { usuario: string; codigo: string }) => d)
  .handler(async ({ data }): Promise<Resultado<{ json: string }>> => {
    const c = await colecciones();
    const u = data.usuario.trim().toLowerCase();
    const dni = u.replace(/\D/g, "");
    const lista = await c.leer("gb_pacientes");
    const p = lista.find((x) => (dni.length >= 5 && x["dni"] === dni) || (u.includes("@") && String(x["email"] ?? "").toLowerCase() === u));
    if (!p) return { ok: false, error: "No encontramos un paciente con esa cédula o correo. Pedile a la clínica que te envíe la invitación." };
    if (p["estado"] === "Revocado") return { ok: false, error: "Tu acceso al portal está deshabilitado. Comunicate con la clínica." };
    const a = await acceso();
    const llave = `pac:${p.id}`;
    const freno = await a.bloqueado(llave);
    if (freno) return { ok: false, error: freno };
    const cod = data.codigo.trim();
    const valida = cod === p["codigo"] || (!!p["clave"] && c.sha256(cod) === p["clave"]);
    if (!valida) {
      await a.registrarFallo(llave);
      return { ok: false, error: (await a.bloqueado(llave)) ?? (p["clave"] ? "El código o la contraseña no son correctos." : "El código no es correcto. Revisá el mensaje de la clínica.") };
    }
    await a.limpiarFallos(llave);
    const primero = p["estado"] === "Invitado";
    const act = { ...p, estado: "Activo", ultimoIngreso: new Date().toISOString() };
    await c.guardar("gb_pacientes", act);
    await c.abrirSesionPaciente(p.id, (await modulo()).tokenAleatorio());
    await (await acceso()).auditar(String(p["nombre"]), primero ? "Primer ingreso al portal" : "Ingreso al portal", `Paciente C.C. ${p["dni"]}`);
    return { ok: true, json: JSON.stringify(act) };
  });

export const salirPacienteServidor = createServerFn({ method: "POST" }).handler(async () => {
  await (await colecciones()).cerrarSesionPaciente();
  return { ok: true };
});
