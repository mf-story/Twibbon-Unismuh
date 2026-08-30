// Panel admin: kelola template frame. Kata sandi disimpan di sessionStorage.

const loginScreen = document.getElementById("loginScreen");
const loginForm = document.getElementById("loginForm");
const passwordEl = document.getElementById("password");
const loginErr = document.getElementById("loginErr");
const adminMain = document.getElementById("adminMain");

const addForm = document.getElementById("addForm");
const frameName = document.getElementById("frameName");
const frameFile = document.getElementById("frameFile");
const previewRow = document.getElementById("previewRow");
const previewImg = document.getElementById("previewImg");
const addBtn = document.getElementById("addBtn");
const addErr = document.getElementById("addErr");
const frameGrid = document.getElementById("frameGrid");

const MAX_BYTES = 6 * 1024 * 1024;
let adminKey = sessionStorage.getItem("twibbonAdminKey") || "";

function showErr(el, msg) {
  el.textContent = msg;
  el.hidden = !msg;
}

async function api(method, url, body) {
  const opts = { method, headers: {} };
  if (adminKey) opts.headers["x-admin-key"] = adminKey;
  if (body) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  let data = {};
  try { data = await res.json(); } catch { /* kosong */ }
  return { ok: res.ok, status: res.status, data };
}

// ---------- Login ----------
async function tryEnter(key) {
  adminKey = key;
  const { ok } = await api("GET", "/api/check");
  if (ok) {
    sessionStorage.setItem("twibbonAdminKey", key);
    loginScreen.hidden = true;
    adminMain.hidden = false;
    loadFrames();
    return true;
  }
  adminKey = "";
  sessionStorage.removeItem("twibbonAdminKey");
  return false;
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showErr(loginErr, "");
  const ok = await tryEnter(passwordEl.value);
  if (!ok) showErr(loginErr, "Kata sandi salah.");
});

// ---------- Pratinjau file ----------
frameFile.addEventListener("change", () => {
  const f = frameFile.files && frameFile.files[0];
  showErr(addErr, "");
  if (!f) { previewRow.hidden = true; return; }
  if (f.size > MAX_BYTES) {
    showErr(addErr, "Ukuran file melebihi 6 MB.");
    frameFile.value = "";
    previewRow.hidden = true;
    return;
  }
  const reader = new FileReader();
  reader.onload = () => { previewImg.src = reader.result; previewRow.hidden = false; };
  reader.readAsDataURL(f);
});

// ---------- Tambah frame ----------
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showErr(addErr, "");
  const f = frameFile.files && frameFile.files[0];
  if (!f) return showErr(addErr, "Pilih file gambar dulu.");

  addBtn.disabled = true;
  addBtn.textContent = "Mengunggah…";
  try {
    const dataUrl = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(f);
    });
    const { ok, data } = await api("POST", "/api/frames", {
      name: frameName.value.trim(),
      dataUrl,
    });
    if (!ok) throw new Error(data.error || "Gagal mengunggah");
    addForm.reset();
    previewRow.hidden = true;
    loadFrames();
  } catch (err) {
    showErr(addErr, err.message);
  } finally {
    addBtn.disabled = false;
    addBtn.textContent = "⬆ Unggah Frame";
  }
});

// ---------- Daftar & hapus ----------
async function loadFrames() {
  const { data } = await api("GET", "/api/frames");
  const frames = (data && data.frames) || [];
  frameGrid.innerHTML = "";
  frames.forEach((fr) => {
    const item = document.createElement("div");
    item.className = "frame-item";

    const thumb = document.createElement("div");
    thumb.className = "thumb";
    const img = document.createElement("img");
    img.src = fr.src;
    img.alt = fr.name;
    thumb.appendChild(img);

    const meta = document.createElement("div");
    meta.className = "meta";

    const left = document.createElement("div");
    left.style.minWidth = "0";
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = fr.name;
    left.appendChild(name);
    if (fr.builtin) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "bawaan";
      left.appendChild(badge);
    }

    const del = document.createElement("button");
    del.className = "del-btn";
    del.textContent = "Hapus";
    del.disabled = !!fr.builtin;
    del.title = fr.builtin ? "Frame bawaan tidak dapat dihapus" : "Hapus frame";
    del.addEventListener("click", () => removeFrame(fr));

    meta.appendChild(left);
    meta.appendChild(del);
    item.appendChild(thumb);
    item.appendChild(meta);
    frameGrid.appendChild(item);
  });
}

async function removeFrame(fr) {
  if (!confirm(`Hapus frame "${fr.name}"?`)) return;
  const { ok, data } = await api("DELETE", "/api/frames/" + encodeURIComponent(fr.id));
  if (!ok) return alert(data.error || "Gagal menghapus");
  loadFrames();
}

// ---------- Auto-login jika sudah ada key ----------
(async function init() {
  if (adminKey) {
    const entered = await tryEnter(adminKey);
    if (!entered) { loginScreen.hidden = false; }
  }
})();
