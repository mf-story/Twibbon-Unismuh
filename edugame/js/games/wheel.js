/* =========================================================================
   Game: Roda Putar (wheel.js)
   Roda memilih pertanyaan secara acak. Cocok untuk memilih giliran/soal.
   ========================================================================= */
window.Games = window.Games || {};
window.Games.wheel = {
  key: "wheel",
  title: "Roda Putar",
  icon: "🎡",
  color: "#f59e0b",
  desc: "Putar roda untuk memilih soal. Seru untuk giliran & tantangan kelas.",
  dataType: "quiz",
  min: 2,

  start: function (subject) {
    var items = [], n = 0;
    var palette = ["#4f46e5", "#f59e0b", "#22c55e", "#f43f5e", "#38bdf8", "#a855f7", "#14b8a6", "#ef4444"];
    var score = 0, rounds = 0, rotation = 0, spinning = false;

    function showWheel() {
      // Ambil 8 soal SEGAR tiap putaran (rotasi) agar tidak cepat berulang.
      items = UI.draw("wheel:" + subject.id, subject.quiz, Math.min(8, subject.quiz.length));
      n = items.length;
      UI.setScreen(
        '<div class="game-shell">' +
          gameBar(subject, ['<span class="pill score">⭐ <b id="score">' + score + '</b></span>',
                            '<span class="pill">🎯 Putaran ' + rounds + '</span>']) +
          '<div class="wheel-wrap">' +
            '<div class="wheel-stage">' +
              '<div class="wheel-pointer">▼</div>' +
              '<canvas id="wheelCanvas" class="wheel-canvas" width="560" height="560"></canvas>' +
              '<div class="wheel-hub">🎯</div>' +
            '</div>' +
            '<button class="btn btn-primary btn-lg" id="spinBtn">🎡 PUTAR RODA</button>' +
            '<div class="page-sub">Ada <b>' + n + '</b> soal di roda</div>' +
          '</div>' +
        '</div>'
      );
      var canvas = document.getElementById("wheelCanvas");
      var ctx = canvas.getContext("2d");
      canvas.style.transform = "rotate(" + rotation + "deg)";
      var cx = 280, cy = 280, r = 270, seg = (Math.PI * 2) / n;
      for (var i = 0; i < n; i++) {
        var a0 = i * seg - Math.PI / 2, a1 = a0 + seg;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a1); ctx.closePath();
        ctx.fillStyle = palette[i % palette.length]; ctx.fill();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.stroke();
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(a0 + seg / 2);
        ctx.textAlign = "right"; ctx.fillStyle = "#fff"; ctx.font = "bold 34px 'Baloo 2', sans-serif";
        ctx.fillText(String(i + 1), r - 26, 12); ctx.restore();
      }
      document.getElementById("spinBtn").addEventListener("click", function () { spin(canvas); });
    }

    function spin(canvas) {
      if (spinning) return; spinning = true;
      var pick = Math.floor(Math.random() * n);
      var segDeg = 360 / n;
      rotation += 360 * 5 + (360 - (pick * segDeg + segDeg / 2)) - (rotation % 360);
      canvas.style.transform = "rotate(" + rotation + "deg)";
      var ticks = 0, ti = setInterval(function () { UI.sfx.tick(); if (++ticks > 8) clearInterval(ti); }, 260);
      setTimeout(function () { spinning = false; rounds++; askQuestion(items[pick]); }, 4700);
    }

    function askQuestion(it) {
      var opts = it.options.map(function (o, i) {
        return '<button class="opt" data-i="' + i + '"><span class="opt-key">' + "ABCD"[i] + '</span><span>' + UI.esc(o) + '</span></button>';
      }).join("");
      var wrap = UI.setScreen(
        '<div class="game-shell">' +
          gameBar(subject, ['<span class="pill score">⭐ <b>' + score + '</b></span>']) +
          '<div class="q-card">' +
            '<div class="q-count">🎯 Soal Terpilih</div>' +
            '<div class="q-text">' + UI.esc(it.q) + '</div>' +
            '<div class="q-options">' + opts + '</div>' +
          '</div>' +
        '</div>'
      );
      var btns = wrap.querySelectorAll(".opt");
      var locked = false;
      Array.prototype.forEach.call(btns, function (b) {
        b.addEventListener("click", function () {
          if (locked) return; locked = true;
          Array.prototype.forEach.call(btns, function (x) { x.disabled = true; });
          btns[it.answer].classList.add("correct");
          if (parseInt(b.dataset.i, 10) === it.answer) { score++; UI.sfx.correct(); UI.confetti(30); UI.toast("Benar! 🎉", "good"); }
          else { b.classList.add("wrong"); UI.sfx.wrong(); UI.toast(it.hint ? "💡 " + it.hint : "Kurang tepat", "bad"); }
          setTimeout(showWheel, 1700);
        });
      });
    }

    showWheel();
  }
};
