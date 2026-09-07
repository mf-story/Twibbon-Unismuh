// Service worker Twibbie — memungkinkan install (PWA) & akses offline dasar.
const CACHE = "twibbie-v1";
const SHELL = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/logo-unismuh.png",
  "/ranking-strip.png",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // API frame selalu dari jaringan (data terbaru), tidak di-cache.
  if (url.pathname.startsWith("/api/")) return;

  const isImage = /\.(png|jpg|jpeg|webp|svg|ico)$/.test(url.pathname);

  if (isImage) {
    // Gambar: cache-first (berat & jarang berubah).
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((r) => {
            if (r.ok && r.type === "basic") {
              const cp = r.clone();
              caches.open(CACHE).then((c) => c.put(req, cp));
            }
            return r;
          })
      )
    );
    return;
  }

  // HTML/CSS/JS: network-first (selalu segar saat online), fallback cache saat offline.
  e.respondWith(
    fetch(req)
      .then((r) => {
        const cp = r.clone();
        caches.open(CACHE).then((c) => c.put(req, cp));
        return r;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("/index.html")))
  );
});
