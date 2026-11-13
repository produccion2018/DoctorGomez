// Service worker mínimo para instalar el panel y el portal como app.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(
    fetch(e.request).catch(
      () => new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0;background:#0b1f4d;color:#fff;text-align:center"><div><h2>Sin conexión</h2><p>Revisá tu internet y volvé a intentar.</p></div>', { headers: { "Content-Type": "text/html; charset=utf-8" } }),
    ),
  );
});
