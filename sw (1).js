const CACHE_NAME = "universidad-app-v4"; // ← incrementar versión fuerza limpieza

const ASSETS = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", e => {
  // Forzar activación inmediata sin esperar que se cierren otras pestañas
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
});

self.addEventListener("activate", e => {
  // Borrar cachés viejos
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // tomar control de todas las pestañas abiertas
  );
});

self.addEventListener("fetch", e => {
  // Estrategia Network-First: intenta la red primero, cae en caché solo si falla
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Si la respuesta es válida, actualizar la caché
        if (res && res.status === 200 && res.type === "basic") {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, resClone));
        }
        return res;
      })
      .catch(() => caches.match(e.request)) // offline fallback
  );
});
