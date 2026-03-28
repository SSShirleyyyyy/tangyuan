const CACHE_NAME = "pourover-journal-shell-v20260327-1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=20260327-1",
  "./app.bundle.js?v=20260327-1",
  "./manifest.webmanifest",
  "./assets/app-icon.svg",
  "./assets/pourover-gear-watermark.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => null)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  if (event.request.method !== "GET" || requestUrl.origin !== self.location.origin) {
    return;
  }

  if (requestUrl.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        const response = await fetch(event.request);
        if (response.ok) {
          cache.put(event.request, response.clone()).catch(() => null);
        }
        return response;
      } catch (error) {
        const cached = await cache.match(event.request);
        if (cached) {
          return cached;
        }

        if (event.request.mode === "navigate") {
          const fallback = await cache.match("./index.html");
          if (fallback) {
            return fallback;
          }
        }

        throw error;
      }
    })()
  );
});
