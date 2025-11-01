// ─────────────────────────────────────────────
// 🧠 HumanMap VAS — Service Worker básico (PWA)
// ─────────────────────────────────────────────
const CACHE_NAME = "humanmap-vas-cache-v1";

// Archivos que se almacenarán en caché
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./humanmap-vas-standalone.js",
  "./manifest.json",
  "./src/logo/favicon-32.png",
  "./src/logo/favicon-64.png",
  "./src/logo/favicon-180.png",
  "./src/img/light/head_right.svg",
  "./src/img/light/head_left.svg",
  "./src/img/light/neck_right.svg",
  "./src/img/light/neck_left.svg",
  "./src/img/light/torax_front.svg",
  "./src/img/light/torax_back.svg",
  "./src/img/dark/head_right.svg",
  "./src/img/dark/head_left.svg",
  "./src/img/dark/neck_right.svg",
  "./src/img/dark/neck_left.svg",
  "./src/img/dark/torax_front.svg",
  "./src/img/dark/torax_back.svg"
];

// Instalar y precachear recursos
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📦 Cacheando recursos de HumanMap VAS...");
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Activar y limpiar caches antiguos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Eliminando cache antiguo:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Interceptar peticiones y servir desde cache si es posible
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).then(fetchRes => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchRes.clone());
            return fetchRes;
          });
        })
      );
    })
  );
});

