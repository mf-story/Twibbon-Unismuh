// Server Twibbon Studio.
// - Menyajikan halaman statis (HTML/CSS/JS/frame).
// - Menyediakan API kelola FRAME (template), bukan hasil twibbon.
//   Hasil twibbon tetap dibuat & diunduh di browser (tidak disimpan di server).

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const FRAMES_DIR = path.join(ROOT, "frames");
// Metadata frame disimpan di dalam folder frames agar mudah dijadikan volume persisten.
const FRAMES_JSON = path.join(FRAMES_DIR, "frames.json");
// Data awal (dibuat saat build) untuk mengisi volume yang masih kosong.
const SEED_DIR = path.join(ROOT, "seed");
// Ganti lewat variabel lingkungan: set ADMIN_PASSWORD=... sebelum start.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const MAX_UPLOAD_BYTES = 6 * 1024 * 1024; // 6 MB

// Frame awal saat data masih kosong (mis. volume baru di Coolify).
const DEFAULT_FRAMES = [
  { id: "unismuh", name: "MABA Unismuh", src: "ok2Twibbon Unismuh.png", builtin: false },
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".webmanifest": "application/manifest+json",
  ".ico": "image/x-icon",
};

// Hanya raster yang boleh diunggah admin (hindari risiko XSS dari SVG).
const UPLOAD_TYPES = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

// ---------- Util ----------
function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}

function readFrames() {
  try {
    const raw = fs.readFileSync(FRAMES_JSON, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data.frames) ? data.frames : [];
  } catch {
    return [];
  }
}

function writeFrames(frames) {
  fs.writeFileSync(FRAMES_JSON, JSON.stringify({ frames }, null, 2), "utf8");
}

// Pastikan folder & metadata frame ada (penting saat volume masih kosong).
function ensureSeed() {
  if (!fs.existsSync(FRAMES_DIR)) fs.mkdirSync(FRAMES_DIR, { recursive: true });
  if (fs.existsSync(FRAMES_JSON)) return;
  // Volume kosong: salin data awal dari folder seed (dibuat saat build image).
  if (fs.existsSync(SEED_DIR)) {
    for (const f of fs.readdirSync(SEED_DIR)) {
      try { fs.copyFileSync(path.join(SEED_DIR, f), path.join(FRAMES_DIR, f)); } catch { /* abaikan */ }
    }
  }
  if (!fs.existsSync(FRAMES_JSON)) writeFrames(DEFAULT_FRAMES);
}

function isAuthorized(req) {
  const key = req.headers["x-admin-key"];
  if (!key) return false;
  // Bandingkan aman terhadap timing attack.
  const a = Buffer.from(String(key));
  const b = Buffer.from(ADMIN_PASSWORD);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error("PAYLOAD_TOO_LARGE"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// ---------- API frame ----------
async function handleApi(req, res, urlPath) {
  // GET daftar frame — publik (dibutuhkan aplikasi utama).
  if (req.method === "GET" && urlPath === "/api/frames") {
    return sendJson(res, 200, { frames: readFrames() });
  }

  // Cek login admin.
  if (req.method === "GET" && urlPath === "/api/check") {
    return sendJson(res, isAuthorized(req) ? 200 : 401, { ok: isAuthorized(req) });
  }

  // POST tambah frame (butuh otorisasi).
  if (urlPath === "/api/frames" && req.method === "POST") {
    if (!isAuthorized(req)) return sendJson(res, 401, { error: "Tidak diizinkan" });
    let body;
    try {
      const buf = await readBody(req, MAX_UPLOAD_BYTES + 1024 * 1024);
      body = JSON.parse(buf.toString("utf8"));
    } catch (e) {
      const msg = e.message === "PAYLOAD_TOO_LARGE" ? "Ukuran file terlalu besar" : "Body tidak valid";
      return sendJson(res, 400, { error: msg });
    }

    const name = String(body.name || "").trim().slice(0, 60);
    const dataUrl = String(body.dataUrl || "");
    if (!name) return sendJson(res, 400, { error: "Nama frame wajib diisi" });

    const m = /^data:([a-z/+.-]+);base64,(.+)$/i.exec(dataUrl);
    if (!m) return sendJson(res, 400, { error: "Format gambar tidak valid" });
    const mime = m[1].toLowerCase();
    const ext = UPLOAD_TYPES[mime];
    if (!ext) return sendJson(res, 400, { error: "Hanya PNG, JPG, atau WEBP yang didukung" });

    const buf = Buffer.from(m[2], "base64");
    if (buf.length > MAX_UPLOAD_BYTES) return sendJson(res, 400, { error: "Ukuran file melebihi 6 MB" });

    if (!fs.existsSync(FRAMES_DIR)) fs.mkdirSync(FRAMES_DIR, { recursive: true });
    const id = "f" + Date.now() + crypto.randomBytes(3).toString("hex");
    const file = id + ext;
    fs.writeFileSync(path.join(FRAMES_DIR, file), buf);

    const frames = readFrames();
    frames.push({ id, name, src: "frames/" + file, builtin: false });
    writeFrames(frames);
    return sendJson(res, 201, { frame: frames[frames.length - 1] });
  }

  // Hapus frame: DELETE /api/frames/:id
  const delMatch = /^\/api\/frames\/([\w-]+)$/.exec(urlPath);
  if (delMatch && req.method === "DELETE") {
    if (!isAuthorized(req)) return sendJson(res, 401, { error: "Tidak diizinkan" });
    const id = delMatch[1];
    const frames = readFrames();
    const idx = frames.findIndex((f) => f.id === id);
    if (idx === -1) return sendJson(res, 404, { error: "Frame tidak ditemukan" });
    if (frames[idx].builtin) return sendJson(res, 400, { error: "Frame bawaan tidak dapat dihapus" });

    // Hapus file fisik jika berada di dalam folder frames.
    const src = frames[idx].src || "";
    const abs = path.join(ROOT, src);
    if (abs.startsWith(FRAMES_DIR) && fs.existsSync(abs)) {
      try { fs.unlinkSync(abs); } catch { /* abaikan */ }
    }
    frames.splice(idx, 1);
    writeFrames(frames);
    return sendJson(res, 200, { ok: true });
  }

  return sendJson(res, 404, { error: "Endpoint tidak ditemukan" });
}

// ---------- Static ----------
function serveStatic(req, res, urlPath) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    return res.end("Method Not Allowed");
  }
  if (urlPath === "/") urlPath = "/index.html";
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, safePath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("404 — file tidak ditemukan");
    }
    const ext = path.extname(filePath).toLowerCase();
    const headers = { "Content-Type": MIME[ext] || "application/octet-stream" };
    // Gambar di-cache lama (berat & jarang berubah); CSS/JS selalu divalidasi
    // agar pembaruan tampilan langsung terlihat tanpa tertahan cache.
    if (/\.(png|jpg|jpeg|webp|svg|ico)$/.test(ext)) {
      headers["Cache-Control"] = "public, max-age=604800";
    } else if (/\.(css|js)$/.test(ext) || ext === ".html") {
      headers["Cache-Control"] = "no-cache";
    }
    res.writeHead(200, headers);
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
}

// ---------- Server ----------
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath.startsWith("/api/")) {
    handleApi(req, res, urlPath).catch(() => sendJson(res, 500, { error: "Kesalahan server" }));
    return;
  }
  serveStatic(req, res, urlPath);
});

server.listen(PORT, () => {
  ensureSeed();
  console.log(`Twibbon Studio berjalan di http://localhost:${PORT}`);
  console.log(`Panel admin: http://localhost:${PORT}/admin.html`);
  if (ADMIN_PASSWORD === "admin123") {
    console.log('PERINGATAN: password admin masih default "admin123". Set ADMIN_PASSWORD untuk keamanan.');
  }
});
