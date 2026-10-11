
const CACHE_NAME = "one-search-shell-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./offline.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Cache available app files without failing the whole install
      // if one URL is temporarily unavailable.
      await Promise.all(
        APP_FILES.map(async (file) => {
          try {
            const response = await fetch(file);

            if (response.ok) {
              await cache.put(file, response);
            }
          } catch (error) {
            console.warn("Could not cache:", file);
          }
        })
      );

      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith("one-search-shell-") &&
              key !== CACHE_NAME
          )
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Do not intercept other websites or non-GET requests.
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);

          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          }

          return response;
        } catch (error) {
          const cache = await caches.open(CACHE_NAME);

          return (
            (await cache.match(request)) ||
            (await cache.match("./index.html")) ||
            (await cache.match("./offline.html")) ||
            new Response("ONE Search is offline.", {
              status: 503,
              headers: {
                "Content-Type": "text/plain; charset=utf-8"
              }
            })
          );
        }
      })()
    );

    return;
  }

  // Reuse cached same-origin resources when available.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);

      if (cached) return cached;

      try {
        const response = await fetch(request);

        if (response.ok) {
          await cache.put(request, response.clone());
        }

        return response;
      } catch (error) {
        return new Response("Resource unavailable offline.", {
          status: 503
        });
      }
    })()
  );
});
