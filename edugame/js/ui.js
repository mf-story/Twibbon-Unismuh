/* =========================================================================
   EduGame Hub — UI Helpers (ui.js)
   Toast, confetti, suara (WebAudio), navigasi layar, util acak & warna.
   ========================================================================= */
window.UI = (function () {
  var view = null;
  function root() { return view || (view = document.getElementById("view")); }

  /* -------- Navigasi layar -------- */
  function setScreen(html) {
    root().scrollTop = 0;
    root().innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "screen";
    wrap.innerHTML = html;
    root().appendChild(wrap);
    return wrap;
  }

  /* -------- Toast -------- */
  var toastTimer = null;
  function toast(msg, type) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.className = "toast show" + (type ? " " + type : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = "toast"; }, 2000);
  }

  /* -------- Warna aksen per mapel -------- */
  function applyAccent(hex) {
    var r = document.documentElement.style;
    r.setProperty("--accent", hex);
    r.setProperty("--accent-2", lighten(hex, 14));
    r.setProperty("--accent-soft", hexA(hex, 0.12));
  }
  function lighten(hex, amt) {
    var c = h2rgb(hex);
    return "rgb(" + Math.min(255, c[0] + amt * 4) + "," + Math.min(255, c[1] + amt * 3) + "," + Math.min(255, c[2] + amt * 2) + ")";
  }
  function hexA(hex, a) { var c = h2rgb(hex); return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
  function h2rgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function (x) { return x + x; }).join("");
    return [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)];
  }

  /* -------- Util acak -------- */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function sample(arr, n) { return shuffle(arr).slice(0, n); }

  /* -------- Rotasi anti-ulang --------
     Mengambil item secara berurutan acak; baru mengulang setelah SEMUA item
     tampil. State per 'key' bertahan selama aplikasi terbuka, sehingga
     bermain ulang tidak langsung memunculkan soal yang sama. */
  var _rot = {};
  function shuffleIdx(len) {
    var a = []; for (var i = 0; i < len; i++) a.push(i);
    for (var j = len - 1; j > 0; j--) { var k = Math.floor(Math.random() * (j + 1)); var t = a[j]; a[j] = a[k]; a[k] = t; }
    return a;
  }
  function draw(key, list, n) {
    if (!list || !list.length) return [];
    var first = list[0] || {};
    var sig = list.length + "|" + String(first.q || first.a || first.word || "").slice(0, 24);
    var s = _rot[key];
    if (!s || s.sig !== sig) s = _rot[key] = { sig: sig, order: shuffleIdx(list.length), pos: 0 };
    var out = [], count = Math.min(n || list.length, list.length);
    for (var i = 0; i < count; i++) {
      if (s.pos >= s.order.length) { s.order = shuffleIdx(list.length); s.pos = 0; }
      out.push(list[s.order[s.pos++]]);
    }
    return out;
  }

  /* -------- Suara (WebAudio, tanpa file) -------- */
  var actx = null;
  function ac() {
    if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    return actx;
  }
  function tone(freq, dur, type, when, gain) {
    if (!window.Store || !Store.getSound()) return;
    var c = ac(); if (!c) return;
    var t0 = c.currentTime + (when || 0);
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.18, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }
  var sfx = {
    correct: function () { tone(660, 0.12, "triangle", 0); tone(990, 0.18, "triangle", 0.1); },
    wrong: function () { tone(200, 0.2, "sawtooth", 0, 0.14); tone(150, 0.25, "sawtooth", 0.12, 0.12); },
    click: function () { tone(420, 0.06, "square", 0, 0.08); },
    flip: function () { tone(520, 0.07, "sine", 0, 0.1); },
    win: function () { [523, 659, 784, 1046].forEach(function (f, i) { tone(f, 0.18, "triangle", i * 0.12); }); },
    tick: function () { tone(880, 0.04, "square", 0, 0.06); },
    roll: function () { tone(300, 0.05, "square", 0, 0.07); tone(360, 0.05, "square", 0.06, 0.07); }
  };

  /* -------- Confetti -------- */
  function confetti(n) {
    n = n || 90;
    var colors = ["#4f46e5", "#f59e0b", "#22c55e", "#f43f5e", "#38bdf8", "#a855f7"];
    for (var i = 0; i < n; i++) {
      (function (i) {
        var el = document.createElement("div");
        el.className = "confetti";
        el.style.left = Math.random() * 100 + "vw";
        el.style.background = colors[i % colors.length];
        el.style.transform = "rotate(" + Math.random() * 360 + "deg)";
        document.body.appendChild(el);
        var dur = 2200 + Math.random() * 1600;
        var x = (Math.random() - 0.5) * 240;
        el.animate([
          { transform: "translate(0,0) rotate(0)", opacity: 1 },
          { transform: "translate(" + x + "px," + (window.innerHeight + 60) + "px) rotate(" + (720 + Math.random() * 720) + "deg)", opacity: 1 }
        ], { duration: dur, easing: "cubic-bezier(.2,.6,.4,1)" });
        setTimeout(function () { el.remove(); }, dur);
      })(i);
    }
  }

  /* -------- Escape HTML -------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m];
    });
  }

  return {
    setScreen: setScreen, toast: toast, applyAccent: applyAccent,
    shuffle: shuffle, sample: sample, draw: draw, sfx: sfx, confetti: confetti, esc: esc
  };
})();
