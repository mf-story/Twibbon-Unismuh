/* =========================================================================
   Game: Ular Tangga Edukasi (snakes.js)
   Jawab soal untuk melangkah. Kena tangga naik, kena ular turun.
   ========================================================================= */
window.Games = window.Games || {};
window.Games.snakes = {
  key: "snakes",
  title: "Ular Tangga",
  icon: "🐍",
  color: "#0ea5e9",
  desc: "Jawab benar untuk melangkah. Naik tangga, hati-hati ular! Sampai kotak 64 menang.",
  dataType: "quiz",
  min: 2,

  start: function (subject) {
    var SIZE = 8, LAST = SIZE * SIZE;
    var ladders = { 3: 22, 8: 26, 20: 41, 28: 47, 36: 55 };
    var snakes = { 32: 10, 40: 19, 48: 26, 54: 34, 62: 45 };
    var pos = 0, rolls = 0, correctCount = 0;
    var pool = UI.draw("snakes:" + subject.id, subject.quiz, subject.quiz.length), qi = 0;

    function nextQ() { var q = pool[qi % pool.length]; qi++; return q; }

    function cellNumber(r, c) {
      var rowFromBottom = SIZE - 1 - r;
      return rowFromBottom % 2 === 0 ? rowFromBottom * SIZE + c + 1 : rowFromBottom * SIZE + (SIZE - c);
    }
    function cellPos(n) {
      var rowFromBottom = Math.floor((n - 1) / SIZE);
      var inRow = (n - 1) % SIZE;
      var col = rowFromBottom % 2 === 0 ? inRow : SIZE - 1 - inRow;
      var r = SIZE - 1 - rowFromBottom;
      return { top: (r / SIZE) * 100, left: (col / SIZE) * 100 };
    }

    function render() {
      var cells = "";
      for (var r = 0; r < SIZE; r++) {
        for (var c = 0; c < SIZE; c++) {
          var n = cellNumber(r, c);
          var emoji = ladders[n] ? "🪜" : snakes[n] ? "🐍" : (n === LAST ? "🏁" : "");
          cells += '<div class="cell">' + n + (emoji ? '<span class="cell-emoji">' + emoji + '</span>' : "") + '</div>';
        }
      }
      UI.setScreen(
        '<div class="game-shell">' +
          gameBar(subject, ['<span class="pill">📍 Kotak <b id="posPill">' + pos + '</b></span>',
                            '<span class="pill score">✅ <b>' + correctCount + '</b></span>']) +
          '<div class="snakes-wrap">' +
            '<div class="board"><div class="board-grid">' + cells + '</div>' +
              '<div class="pawn" id="pawn"></div></div>' +
            '<div class="snakes-side">' +
              '<div class="dice-box">' +
                '<div class="page-sub">Dadu</div>' +
                '<div class="dice" id="dice">🎲</div>' +
                '<button class="btn btn-primary btn-lg" id="rollBtn" style="width:100%">🎲 Lempar Dadu</button>' +
              '</div>' +
              '<div id="qBox"></div>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
      placePawn(false);
      document.getElementById("rollBtn").addEventListener("click", roll);
    }

    function placePawn(animate) {
      var pawn = document.getElementById("pawn");
      if (!pawn) return;
      if (pos < 1) { pawn.style.left = "1%"; pawn.style.top = "89%"; pawn.style.opacity = ".5"; return; }
      pawn.style.opacity = "1";
      var p = cellPos(pos);
      pawn.style.left = (p.left + 100 / SIZE * 0.14) + "%";
      pawn.style.top = (p.top + 100 / SIZE * 0.14) + "%";
    }

    var busy = false;
    function roll() {
      if (busy) return; busy = true;
      var dice = document.getElementById("dice");
      dice.classList.add("rolling"); UI.sfx.roll();
      var val = 1 + Math.floor(Math.random() * 6);
      var faces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
      setTimeout(function () {
        dice.classList.remove("rolling");
        dice.textContent = faces[val];
        askToMove(val);
      }, 650);
    }

    function askToMove(steps) {
      rolls++;
      var q = nextQ();
      var opts = q.options.map(function (o, i) {
        return '<button class="opt" data-i="' + i + '" style="padding:12px 14px;font-size:18px"><span class="opt-key" style="width:36px;height:36px;font-size:18px">' + "ABCD"[i] + '</span><span>' + UI.esc(o) + '</span></button>';
      }).join("");
      document.getElementById("qBox").innerHTML =
        '<div class="q-card" style="padding:20px">' +
          '<div class="q-count">🎲 Dapat ' + steps + ' — jawab untuk maju</div>' +
          '<div class="q-text" style="font-size:22px;margin:8px 0 16px">' + UI.esc(q.q) + '</div>' +
          '<div style="display:grid;gap:10px">' + opts + '</div>' +
        '</div>';
      var btns = document.querySelectorAll("#qBox .opt");
      Array.prototype.forEach.call(btns, function (b) {
        b.addEventListener("click", function () {
          Array.prototype.forEach.call(btns, function (x) { x.disabled = true; });
          btns[q.answer].classList.add("correct");
          if (parseInt(b.dataset.i, 10) === q.answer) {
            correctCount++; UI.sfx.correct();
            setTimeout(function () { advance(steps); }, 800);
          } else {
            b.classList.add("wrong"); UI.sfx.wrong();
            UI.toast("Belum tepat, tetap di kotak " + pos, "bad");
            setTimeout(function () { busy = false; render(); }, 1400);
          }
        });
      });
    }

    function advance(steps) {
      pos = Math.min(LAST, pos + steps);
      document.getElementById("posPill") && (document.getElementById("posPill").textContent = pos);
      placePawn(true);
      setTimeout(function () {
        if (ladders[pos]) { UI.toast("🪜 Naik tangga ke " + ladders[pos] + "!", "good"); UI.sfx.win(); pos = ladders[pos]; placePawn(true); }
        else if (snakes[pos]) { UI.toast("🐍 Digigit ular! Turun ke " + snakes[pos], "bad"); UI.sfx.wrong(); pos = snakes[pos]; placePawn(true); }
        setTimeout(function () {
          if (pos >= LAST) return finish();
          busy = false; render();
        }, 700);
      }, 550);
    }

    function finish() {
      UI.sfx.win(); UI.confetti(120);
      UI.setScreen(
        '<div class="result">' +
          '<div class="r-emoji">🏁</div>' +
          '<div class="r-title">Sampai Finish!</div>' +
          '<div class="r-score">🏆</div>' +
          '<div class="r-sub">Menjawab benar ' + correctCount + ' kali dalam ' + rolls + ' lemparan — ' + UI.esc(subject.name) + '</div>' +
          '<div class="btn-row" style="justify-content:center">' +
            '<button class="btn btn-primary btn-lg" id="retryBtn">🔁 Main Lagi</button>' +
            '<button class="btn btn-ghost btn-lg" onclick="App.home()">🏠 Menu</button>' +
          '</div>' +
        '</div>'
      );
      document.getElementById("retryBtn").addEventListener("click", function () { Games.snakes.start(subject); });
    }

    render();
  }
};
