/* =========================================================================
   Game: Kuis Pilihan Ganda (quiz.js)
   ========================================================================= */
window.Games = window.Games || {};
window.Games.quiz = {
  key: "quiz",
  title: "Kuis Pilihan Ganda",
  icon: "❓",
  color: "#4f46e5",
  desc: "Jawab pertanyaan pilihan ganda. Cocok untuk kuis kelas & cerdas cermat.",
  dataType: "quiz",
  min: 1,

  start: function (subject) {
    var items = UI.draw("quiz:" + subject.id, subject.quiz, 10);
    var idx = 0, score = 0, locked = false;

    function render() {
      if (idx >= items.length) return finish();
      var it = items[idx];
      var pct = Math.round((idx / items.length) * 100);
      var opts = it.options.map(function (o, i) {
        return '<button class="opt" data-i="' + i + '">' +
          '<span class="opt-key">' + "ABCD"[i] + '</span><span>' + UI.esc(o) + '</span></button>';
      }).join("");

      UI.setScreen(
        '<div class="game-shell">' +
          gameBar(subject, [
            '<span class="pill score">⭐ <b id="score">' + score + '</b></span>',
            '<span class="pill">' + (idx + 1) + ' / ' + items.length + '</span>'
          ]) +
          '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="q-card">' +
            '<div class="q-count">Pertanyaan ' + (idx + 1) + '</div>' +
            '<div class="q-text">' + UI.esc(it.q) + '</div>' +
            '<div class="q-options">' + opts + '</div>' +
            '<div id="hintZone"></div>' +
          '</div>' +
        '</div>'
      );

      var btns = document.querySelectorAll(".opt");
      Array.prototype.forEach.call(btns, function (b) {
        b.addEventListener("click", function () { choose(parseInt(b.dataset.i, 10), btns, it); });
      });
    }

    function choose(i, btns, it) {
      if (locked) return; locked = true;
      Array.prototype.forEach.call(btns, function (b) { b.disabled = true; });
      var correct = it.answer;
      btns[correct].classList.add("correct");
      if (i === correct) {
        score++; document.getElementById("score").textContent = score;
        UI.sfx.correct(); UI.toast("Benar! 🎉", "good");
      } else {
        btns[i].classList.add("wrong");
        UI.sfx.wrong();
        UI.toast("Kurang tepat", "bad");
        if (it.hint) document.getElementById("hintZone").innerHTML =
          '<div class="hang-hint" style="margin-top:20px">💡 ' + UI.esc(it.hint) + '</div>';
      }
      setTimeout(function () { idx++; locked = false; render(); }, 1400);
    }

    function finish() {
      showResult(subject, score, items.length, function () { Games.quiz.start(subject); });
    }

    render();
  }
};

/* ---------- Helper bersama antar game ---------- */
function gameBar(subject, rightPills) {
  return '<div class="game-bar">' +
    '<div class="gb-left">' +
      '<button class="btn btn-ghost" onclick="App.home()">← Menu</button>' +
      '<h2 class="gb-title">' + subject.icon + ' ' + UI.esc(subject.name) + '</h2>' +
    '</div>' +
    '<div class="btn-row">' + (rightPills || []).join("") + '</div>' +
  '</div>';
}

function showResult(subject, score, total, onRetry) {
  var pct = total ? Math.round((score / total) * 100) : 0;
  var emoji = pct >= 80 ? "🏆" : pct >= 50 ? "😃" : "💪";
  var msg = pct >= 80 ? "Luar biasa!" : pct >= 50 ? "Bagus, terus berlatih!" : "Jangan menyerah!";
  if (pct >= 80) { UI.sfx.win(); UI.confetti(); } else UI.sfx.click();
  UI.setScreen(
    '<div class="result">' +
      '<div class="r-emoji">' + emoji + '</div>' +
      '<div class="r-title">' + msg + '</div>' +
      '<div class="r-score">' + score + ' / ' + total + '</div>' +
      '<div class="r-sub">Skor kamu ' + pct + '% pada mapel ' + UI.esc(subject.name) + '</div>' +
      '<div class="btn-row" style="justify-content:center">' +
        '<button class="btn btn-primary btn-lg" id="retryBtn">🔁 Main Lagi</button>' +
        '<button class="btn btn-ghost btn-lg" onclick="App.home()">🏠 Menu</button>' +
      '</div>' +
    '</div>'
  );
  document.getElementById("retryBtn").addEventListener("click", onRetry);
}
