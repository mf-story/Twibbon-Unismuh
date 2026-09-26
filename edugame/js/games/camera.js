/* =========================================================================
   Game: Pilih Sisi (camera.js)
   Layar dibagi 2: jawaban di KIRI & KANAN. Siswa bergerak/berdiri ke sisi
   pilihannya; kamera mendeteksi sisi dengan gerakan terbanyak.
   Fallback: ketuk sisi bila kamera tidak tersedia.
   ========================================================================= */
window.Games = window.Games || {};
window.Games.camera = {
  key: "camera",
  title: "Pilih Sisi (Kamera)",
  icon: "📷",
  color: "#ef4444",
  desc: "Jawab dengan gerak! Berdiri di sisi kiri atau kanan sesuai jawaban. Butuh kamera (atau ketuk layar).",
  dataType: "quiz",
  min: 1,
  _stream: null,

  // Matikan kamera & tutup layar penuh saat keluar dari game.
  stop: function () {
    if (this._stream) { this._stream.getTracks().forEach(function (t) { t.stop(); }); this._stream = null; }
    if (this._det) { clearInterval(this._det); this._det = null; }
    if (this._cd) { clearInterval(this._cd); this._cd = null; }
    var ov = document.getElementById("camOverlay");
    if (ov) ov.remove();
  },

  start: function (subject) {
    var self = Games.camera;
    var items = UI.draw("camera:" + subject.id, subject.quiz, 10);
    var idx = 0, score = 0;

    function ensureCamera() {
      if (self._stream) return Promise.resolve(self._stream);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return Promise.reject(new Error("Browser tidak mendukung kamera."));
      }
      return navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
        .then(function (s) { self._stream = s; return s; });
    }

    function round() {
      if (idx >= items.length) return finish();
      var it = items[idx];
      var correct = it.options[it.answer];
      var distractors = it.options.filter(function (o, i) { return i !== it.answer && o && o.trim(); });
      var wrong = UI.shuffle(distractors)[0] || "—";
      var correctLeft = Math.random() < 0.5;
      var leftText = correctLeft ? correct : wrong;
      var rightText = correctLeft ? wrong : correct;
      var correctSide = correctLeft ? "left" : "right";

      // Layar penuh: overlay tetap di atas semua (di luar .view).
      var stage = document.getElementById("camOverlay");
      if (!stage) { stage = document.createElement("div"); stage.id = "camOverlay"; document.body.appendChild(stage); }
      stage.className = "cam-overlay";
      stage.innerHTML =
        '<video id="camVideo" class="cam-video" autoplay playsinline muted></video>' +
        '<div class="cam-topbar">' +
          '<button class="btn btn-ghost cam-back" id="camBack">← Menu</button>' +
          '<div class="cam-q">' + UI.esc(it.q) + '</div>' +
          '<span class="pill score">⭐ <b id="score">' + score + '</b> · ' + (idx + 1) + '/' + items.length + '</span>' +
        '</div>' +
        '<div class="cam-half left" data-side="left">' +
          '<div class="cam-side-tag">◀ KIRI</div>' +
          '<div class="cam-label">' + UI.esc(leftText) + '</div>' +
          '<div class="cam-meter"><div class="cam-fill" id="fillL"></div></div>' +
        '</div>' +
        '<div class="cam-half right" data-side="right">' +
          '<div class="cam-side-tag">KANAN ▶</div>' +
          '<div class="cam-label">' + UI.esc(rightText) + '</div>' +
          '<div class="cam-meter"><div class="cam-fill" id="fillR"></div></div>' +
        '</div>' +
        '<div class="cam-divider"></div>' +
        '<div class="cam-count" id="camCount">Siap?</div>' +
        '<div class="cam-hint" id="camHint">Menyalakan kamera…</div>';
      document.getElementById("camBack").addEventListener("click", function () { App.home(); });

      var video = document.getElementById("camVideo");
      var stage = document.getElementById("camOverlay");
      var hint = document.getElementById("camHint");
      var countEl = document.getElementById("camCount");
      var fillL = document.getElementById("fillL");
      var fillR = document.getElementById("fillR");
      var locked = false, accumulating = false;
      var leftAccum = 0, rightAccum = 0;
      var detTimer = null, cdTimer = null;

      // Ketuk sisi = pilih langsung (fallback / tanpa kamera).
      Array.prototype.forEach.call(stage.querySelectorAll(".cam-half"), function (h) {
        h.addEventListener("click", function () { choose(h.dataset.side, true); });
      });

      ensureCamera().then(function (stream) {
        video.srcObject = stream;
        hint.textContent = "Bergeraklah ke sisi jawabanmu saat aba-aba MULAI!";
        startDetection();
        beginCountdown();
      }).catch(function (err) {
        // Tanpa kamera: mode ketuk.
        stage.classList.add("no-cam");
        hint.innerHTML = "📷 Kamera tidak aktif (" + UI.esc(err.message) + ").<br>Ketuk sisi kiri/kanan untuk menjawab.";
        countEl.textContent = "Ketuk!";
      });

      function startDetection() {
        var W = 160, H = 120;
        var cv = document.createElement("canvas"); cv.width = W; cv.height = H;
        var cx = cv.getContext("2d", { willReadFrequently: true });
        var prev = null, half = W / 2, area = half * H;
        detTimer = self._det = setInterval(function () {
          if (!document.body.contains(video)) { clearInterval(detTimer); return; }
          if (video.readyState < 2) return;
          // Gambar mirror agar cocok dengan tampilan (yang di-mirror lewat CSS).
          cx.save(); cx.translate(W, 0); cx.scale(-1, 1); cx.drawImage(video, 0, 0, W, H); cx.restore();
          var d = cx.getImageData(0, 0, W, H).data;
          var gray = new Uint8Array(W * H);
          for (var i = 0, p = 0; i < d.length; i += 4, p++) gray[p] = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11);
          var lm = 0, rm = 0;
          if (prev) {
            for (var y = 0; y < H; y++) {
              var row = y * W;
              for (var x = 0; x < W; x++) {
                if (Math.abs(gray[row + x] - prev[row + x]) > 24) { if (x < half) lm++; else rm++; }
              }
            }
          }
          prev = gray;
          var lp = Math.min(100, (lm / area) * 400);
          var rp = Math.min(100, (rm / area) * 400);
          fillL.style.height = lp + "%";
          fillR.style.height = rp + "%";
          if (accumulating) { leftAccum += lm; rightAccum += rm; }
        }, 90);
      }

      function beginCountdown() {
        var n = 3;
        countEl.textContent = n;
        cdTimer = self._cd = setInterval(function () {
          n--;
          if (n > 0) { countEl.textContent = n; UI.sfx.tick(); }
          else { clearInterval(cdTimer); go(); }
        }, 1000);
      }

      function go() {
        accumulating = true;
        leftAccum = rightAccum = 0;
        stage.classList.add("live");
        var t = 15;
        countEl.textContent = t;
        countEl.classList.add("go");
        UI.sfx.tick();
        cdTimer = self._cd = setInterval(function () {
          t--;
          if (t > 0) { countEl.textContent = t; UI.sfx.tick(); }
          else { clearInterval(cdTimer); decide(); }
        }, 1000);
      }

      function decide() {
        accumulating = false;
        var total = leftAccum + rightAccum;
        if (total < 30) { // nyaris tak ada gerakan terdeteksi
          countEl.textContent = "?";
          document.getElementById("camHint").innerHTML = "Gerakan tidak terdeteksi. <b>Ketuk sisi</b> pilihanmu.";
          return; // biarkan pemain mengetuk
        }
        choose(leftAccum >= rightAccum ? "left" : "right", false);
      }

      function choose(side, byTap) {
        if (locked) return; locked = true;
        accumulating = false;
        if (cdTimer) clearInterval(cdTimer);
        if (detTimer) clearInterval(detTimer);
        stage.classList.remove("live");
        var leftHalf = stage.querySelector(".cam-half.left");
        var rightHalf = stage.querySelector(".cam-half.right");
        (correctSide === "left" ? leftHalf : rightHalf).classList.add("correct");
        var chosen = side === "left" ? leftHalf : rightHalf;
        chosen.classList.add("chosen");
        countEl.textContent = side === "left" ? "◀" : "▶";
        var ok = side === correctSide;
        if (ok) { score++; document.getElementById("score").textContent = score; chosen.classList.add("right-ans"); UI.sfx.correct(); UI.confetti(40); UI.toast("Benar! 🎉", "good"); }
        else { chosen.classList.add("wrong-ans"); UI.sfx.wrong(); UI.toast("Kurang tepat", "bad"); }
        setTimeout(function () { idx++; round(); }, 2200);
      }
    }

    function finish() {
      self.stop();
      showResult(subject, score, items.length, function () { Games.camera.start(subject); });
    }

    round();
  }
};
