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
    var PAWNS = [
      { emoji: "🦊", color: "#f97316" },
      { emoji: "🐰", color: "#3b82f6" },
      { emoji: "🐼", color: "#10b981" },
      { emoji: "🐸", color: "#eab308" }
    ];
    var OFFS = [{ x: 0.12, y: 0.12 }, { x: 0.55, y: 0.12 }, { x: 0.12, y: 0.55 }, { x: 0.55, y: 0.55 }];
    var players = [], turn = 0, rolls = 0;
    var pool = UI.draw("snakes:" + subject.id, subject.quiz, subject.quiz.length), qi = 0;

    function nextQ() { var q = pool[qi % pool.length]; qi++; return q; }
    function current() { return players[turn]; }
    function nextTurn() { turn = (turn + 1) % players.length; }

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

    /* ---- Pilih jumlah pemain ---- */
    function setup() {
      UI.setScreen(
        '<div class="game-shell">' +
          gameBar(subject, ['<span class="pill">🐍 Ular Tangga</span>']) +
          '<div style="max-width:560px;margin:36px auto 0;background:#fff;border-radius:var(--r-lg);box-shadow:var(--shadow-md);padding:34px;text-align:center">' +
            '<div style="font-family:var(--font-head);font-size:30px;font-weight:800;margin-bottom:8px">👥 Berapa Pemain?</div>' +
            '<div class="page-sub" style="margin-bottom:24px">Main bergiliran di satu layar. Pertama sampai kotak ' + LAST + ' menang!</div>' +
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">' +
              [1, 2, 3, 4].map(function (n) {
                return '<button class="btn ' + (n === 2 ? "btn-primary" : "btn-ghost") + ' btn-lg setup-n" data-n="' + n + '" style="flex-direction:column;gap:6px;padding:18px 0">' +
                  '<span style="font-size:24px">' + PAWNS.slice(0, n).map(function (p) { return p.emoji; }).join("") + '</span>' +
                  '<span>' + n + '</span></button>';
              }).join("") +
            '</div>' +
          '</div>' +
        '</div>'
      );
      Array.prototype.forEach.call(document.querySelectorAll(".setup-n"), function (b) {
        b.addEventListener("click", function () { startWith(parseInt(b.dataset.n, 10)); });
      });
    }

    function startWith(count) {
      players = [];
      for (var i = 0; i < count; i++) {
        players.push({ name: "Pemain " + (i + 1), emoji: PAWNS[i].emoji, color: PAWNS[i].color, pos: 0, correct: 0 });
      }
      turn = 0; rolls = 0; qi = 0;
      render();
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
      var pawnsHtml = players.map(function (pl, i) {
        return '<div class="pawn" id="pawn' + i + '" style="background:' + pl.color + ';display:grid;place-items:center;font-size:clamp(13px,2.4vw,26px);line-height:1">' + pl.emoji + '</div>';
      }).join("");
      var chips = players.map(function (pl, i) {
        return '<div style="padding:7px 13px;border-radius:999px;background:#fff;border:2.5px solid ' + pl.color + ';font-weight:700;font-size:15px;box-shadow:var(--shadow-sm);opacity:' + (i === turn ? "1" : ".5") + '">' + pl.emoji + ' ' + UI.esc(pl.name) + ' · 📍' + pl.pos + '</div>';
      }).join("");
      var cur = current();
      var multi = players.length > 1;
      UI.setScreen(
        '<div class="game-shell">' +
          gameBar(subject, ['<span class="pill">🎲 <b>' + rolls + '</b> lemparan</span>']) +
          '<div class="snakes-wrap">' +
            '<div class="board"><div class="board-grid">' + cells + '</div>' + pawnsHtml + '</div>' +
            '<div class="snakes-side">' +
              '<div style="display:flex;gap:8px;flex-wrap:wrap">' + chips + '</div>' +
              '<div class="dice-box">' +
                (multi ? '<div class="page-sub">Giliran: <b style="color:' + cur.color + '">' + cur.emoji + ' ' + UI.esc(cur.name) + '</b></div>' : '<div class="page-sub">Dadu</div>') +
                '<div class="dice" id="dice">🎲</div>' +
                '<button class="btn btn-primary btn-lg" id="rollBtn" style="width:100%">🎲 Lempar Dadu</button>' +
              '</div>' +
              '<div id="qBox"></div>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
      placePawns();
      document.getElementById("rollBtn").addEventListener("click", roll);
    }

    function placePawns() {
      players.forEach(function (pl, i) {
        var pawn = document.getElementById("pawn" + i);
        if (!pawn) return;
        var off = OFFS[i] || OFFS[0];
        if (pl.pos < 1) {
          pawn.style.left = (1 + i * 20) + "%";
          pawn.style.top = "89%";
          pawn.style.opacity = ".85";
          return;
        }
        pawn.style.opacity = "1";
        var p = cellPos(pl.pos);
        pawn.style.left = (p.left + 100 / SIZE * off.x) + "%";
        pawn.style.top = (p.top + 100 / SIZE * off.y) + "%";
      });
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
      var pl = current();
      var q = nextQ();
      var opts = q.options.map(function (o, i) {
        return '<button class="opt" data-i="' + i + '" style="padding:12px 14px;font-size:18px"><span class="opt-key" style="width:36px;height:36px;font-size:18px">' + "ABCD"[i] + '</span><span>' + UI.esc(o) + '</span></button>';
      }).join("");
      document.getElementById("qBox").innerHTML =
        '<div class="q-card" style="padding:20px">' +
          '<div class="q-count">' + pl.emoji + ' ' + UI.esc(pl.name) + ' dapat 🎲 ' + steps + ' — jawab untuk maju</div>' +
          '<div class="q-text" style="font-size:22px;margin:8px 0 16px">' + UI.esc(q.q) + '</div>' +
          '<div style="display:grid;gap:10px">' + opts + '</div>' +
        '</div>';
      var btns = document.querySelectorAll("#qBox .opt");
      Array.prototype.forEach.call(btns, function (b) {
        b.addEventListener("click", function () {
          Array.prototype.forEach.call(btns, function (x) { x.disabled = true; });
          btns[q.answer].classList.add("correct");
          if (parseInt(b.dataset.i, 10) === q.answer) {
            pl.correct++; UI.sfx.correct();
            setTimeout(function () { advance(steps); }, 800);
          } else {
            b.classList.add("wrong"); UI.sfx.wrong();
            UI.toast(players.length > 1 ? "Belum tepat — giliran berpindah" : "Belum tepat, tetap di kotak " + pl.pos, "bad");
            setTimeout(function () { nextTurn(); busy = false; render(); }, 1400);
          }
        });
      });
    }

    function advance(steps) {
      var pl = current();
      pl.pos = Math.min(LAST, pl.pos + steps);
      placePawns();
      setTimeout(function () {
        if (ladders[pl.pos]) { UI.toast("🪜 Naik tangga ke " + ladders[pl.pos] + "!", "good"); UI.sfx.win(); pl.pos = ladders[pl.pos]; placePawns(); }
        else if (snakes[pl.pos]) { UI.toast("🐍 Digigit ular! Turun ke " + snakes[pl.pos], "bad"); UI.sfx.wrong(); pl.pos = snakes[pl.pos]; placePawns(); }
        setTimeout(function () {
          if (pl.pos >= LAST) return finish(pl);
          nextTurn();
          busy = false; render();
        }, 700);
      }, 550);
    }

    function finish(winner) {
      UI.sfx.win(); UI.confetti(120);
      var multi = players.length > 1;
      UI.setScreen(
        '<div class="result">' +
          '<div class="r-emoji">' + winner.emoji + '</div>' +
          '<div class="r-title">' + (multi ? UI.esc(winner.name) + " Menang! 🏁" : "Sampai Finish!") + '</div>' +
          '<div class="r-score">🏆</div>' +
          '<div class="r-sub">' + (multi ? "Juara dengan " + winner.correct + " jawaban benar" : "Menjawab benar " + winner.correct + " kali dalam " + rolls + " lemparan") + ' — ' + UI.esc(subject.name) + '</div>' +
          '<div class="btn-row" style="justify-content:center">' +
            '<button class="btn btn-primary btn-lg" id="retryBtn">🔁 Main Lagi</button>' +
            '<button class="btn btn-ghost btn-lg" onclick="App.home()">🏠 Menu</button>' +
          '</div>' +
        '</div>'
      );
      document.getElementById("retryBtn").addEventListener("click", function () { Games.snakes.start(subject); });
    }

    setup();
  }
};
