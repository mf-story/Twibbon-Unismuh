// Twibbon Studio — proses gambar 100% di browser.
// Frame dimuat dari server (template), tapi hasil twibbon tidak pernah diunggah/disimpan.

// Frame cadangan bila API tidak tersedia (mis. buka file langsung tanpa server).
const FALLBACK_FRAMES = [
  { name: "MABA Unismuh", src: "ok2Twibbon Unismuh.png" },
];

const SIZE = 1080; // resolusi ekspor (px)

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const frameListEl = document.getElementById("frameList");
const photoInput = document.getElementById("photoInput");
const emptyHint = document.getElementById("emptyHint");
const adjustCard = document.getElementById("adjustCard");
const downloadBtn = document.getElementById("downloadBtn");
const zoomEl = document.getElementById("zoom");
const rotateEl = document.getElementById("rotate");
const zoomVal = document.getElementById("zoomVal");
const rotVal = document.getElementById("rotVal");
const flipBtn = document.getElementById("flipBtn");
const resetBtn = document.getElementById("resetBtn");
const canvasWrap = document.getElementById("canvasWrap");

// Status editor
const state = {
  photo: null, // HTMLImageElement
  frame: null, // HTMLImageElement
  baseScale: 1, // skala agar foto menutupi kanvas
  zoom: 1,
  rotation: 0, // radian
  flip: 1, // 1 atau -1
  tx: SIZE / 2, // posisi tengah foto (koordinat kanvas)
  ty: SIZE / 2,
};

// ---------- Muat frame ----------
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = encodeURI(src);
  });
}

function buildFrameList(frames) {
  frameListEl.innerHTML = "";
  frames.forEach((f, i) => {
    const btn = document.createElement("button");
    btn.className = "frame-thumb" + (i === 0 ? " active" : "");
    btn.style.backgroundImage = `url("${encodeURI(f.src)}")`;
    btn.title = f.name;
    btn.setAttribute("aria-label", f.name);
    btn.addEventListener("click", async () => {
      document.querySelectorAll(".frame-thumb").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.frame = await loadImage(f.src);
      render();
    });
    frameListEl.appendChild(btn);
  });
}

// ---------- Foto ----------
photoInput.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      state.photo = img;
      // skala "cover": foto menutupi seluruh kanvas
      state.baseScale = Math.max(SIZE / img.width, SIZE / img.height);
      resetTransform();
      emptyHint.style.display = "none";
      adjustCard.hidden = false;
      downloadBtn.disabled = false;
      render();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file); // dibaca lokal, tidak diunggah
});

function resetTransform() {
  state.zoom = 1;
  state.rotation = 0;
  state.flip = 1;
  state.tx = SIZE / 2;
  // Untuk foto potret, geser sedikit ke bawah agar wajah pas di lingkaran frame,
  // tanpa menyingkap area kosong di atas (tetap menutupi kanvas).
  if (state.photo) {
    const halfH = (state.photo.height / 2) * state.baseScale;
    state.ty = Math.min(SIZE * 0.58, halfH);
  } else {
    state.ty = SIZE / 2;
  }
  zoomEl.value = "1";
  rotateEl.value = "0";
  zoomVal.textContent = "100%";
  rotVal.textContent = "0°";
}

// ---------- Render ----------
function render() {
  ctx.clearRect(0, 0, SIZE, SIZE);

  if (state.photo) {
    const eff = state.baseScale * state.zoom;
    ctx.save();
    ctx.translate(state.tx, state.ty);
    ctx.rotate(state.rotation);
    ctx.scale(eff * state.flip, eff);
    ctx.drawImage(state.photo, -state.photo.width / 2, -state.photo.height / 2);
    ctx.restore();
  }

  if (state.frame) {
    ctx.drawImage(state.frame, 0, 0, SIZE, SIZE);
  }
}

// ---------- Kontrol slider ----------
zoomEl.addEventListener("input", () => {
  state.zoom = parseFloat(zoomEl.value);
  zoomVal.textContent = Math.round(state.zoom * 100) + "%";
  render();
});
rotateEl.addEventListener("input", () => {
  const deg = parseInt(rotateEl.value, 10);
  state.rotation = (deg * Math.PI) / 180;
  rotVal.textContent = deg + "°";
  render();
});
flipBtn.addEventListener("click", () => {
  state.flip *= -1;
  render();
});
resetBtn.addEventListener("click", () => {
  resetTransform();
  render();
});

// ---------- Geser (drag) & zoom (pinch/scroll) ----------
const pointers = new Map();
let pinchStartDist = 0;
let pinchStartZoom = 1;

function toCanvasScale() {
  const rect = canvas.getBoundingClientRect();
  return SIZE / rect.width;
}

canvasWrap.addEventListener("pointerdown", (e) => {
  if (!state.photo) return;
  canvasWrap.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinchStartDist = Math.hypot(a.x - b.x, a.y - b.y);
    pinchStartZoom = state.zoom;
  }
});

canvasWrap.addEventListener("pointermove", (e) => {
  if (!pointers.has(e.pointerId)) return;
  const prev = pointers.get(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (pointers.size === 1) {
    const ratio = toCanvasScale();
    state.tx += (e.clientX - prev.x) * ratio;
    state.ty += (e.clientY - prev.y) * ratio;
    render();
  } else if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    if (pinchStartDist > 0) {
      let z = pinchStartZoom * (dist / pinchStartDist);
      z = Math.min(4, Math.max(0.3, z));
      state.zoom = z;
      zoomEl.value = String(z);
      zoomVal.textContent = Math.round(z * 100) + "%";
      render();
    }
  }
});

function endPointer(e) {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinchStartDist = 0;
}
canvasWrap.addEventListener("pointerup", endPointer);
canvasWrap.addEventListener("pointercancel", endPointer);
canvasWrap.addEventListener("pointerleave", endPointer);

canvasWrap.addEventListener(
  "wheel",
  (e) => {
    if (!state.photo) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.06 : 0.94;
    let z = Math.min(4, Math.max(0.3, state.zoom * delta));
    state.zoom = z;
    zoomEl.value = String(z);
    zoomVal.textContent = Math.round(z * 100) + "%";
    render();
  },
  { passive: false }
);

// ---------- Unduh (lokal) ----------
downloadBtn.addEventListener("click", () => {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "twibbon-" + Date.now() + ".png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
});

// ---------- Inisialisasi ----------
(async function init() {
  let frames = FALLBACK_FRAMES;
  try {
    const res = await fetch("/api/frames");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.frames) && data.frames.length) frames = data.frames;
    }
  } catch {
    // Tanpa server: pakai frame cadangan.
  }
  buildFrameList(frames);
  if (frames[0]) {
    state.frame = await loadImage(frames[0].src);
    render();
  }
})();
