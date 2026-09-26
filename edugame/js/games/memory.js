/* =========================================================================
   Game: Kartu Memori (memory.js)
   Balik kartu & temukan pasangan (istilah ↔ pasangannya).
   ========================================================================= */
window.Games = window.Games || {};
window.Games.memory = {
  key: "memory",
  title: "Kartu Memori",
  icon: "🃏",
  color: "#f43f5e",
  desc: "Balik kartu dan cocokkan pasangannya. Melatih daya ingat & konsep.",
  dataType: "pairs",
  min: 2,

  start: function (subject) {
    var chosen = UI.draw("memory:" + subject.id, subject.pairs, Math.min(6, subject.pairs.length));
    var cards = [];
    chosen.forEach(function (p, i) {
      cards.push({ pid: i, text: p.a });
      cards.push({ pid: i, text: p.b });
    });
    cards = UI.shuffle(cards);
    var cols = cards.length <= 8 ? 4 : cards.length <= 12 ? 4 : 5;
    var first = null, lock = false, matched = 0, moves = 0;

    function render() {
      var grid = cards.map(function (c, i) {
        return '<div class="mem-card" data-i="' + i + '" data-pid="' + c.pid + '">' +
          '<div class="mem-inner">' +
            '<div class="mem-face mem-front">❔</div>' +
            '<div class="mem-face mem-back">' + UI.esc(c.text) + '</div>' +
          '</div></div>';
      }).join("");
      UI.setScreen(
        '<div class="game-shell">' +
          gameBar(subject, ['<span class="pill score">✅ <b id="matched">0</b> / ' + chosen.length + '</span>',
                            '<span class="pill">🔄 <b id="moves">0</b> langkah</span>']) +
          '<div class="mem-grid" style="grid-template-columns:repeat(' + cols + ',1fr)">' + grid + '</div>' +
        '</div>'
      );
      Array.prototype.forEach.call(document.querySelectorAll(".mem-card"), function (el) {
        el.addEventListener("click", function () { flip(el); });
      });
    }

    function flip(el) {
      if (lock || el.classList.contains("flipped") || el.classList.contains("matched")) return;
      el.classList.add("flipped"); UI.sfx.flip();
      if (!first) { first = el; return; }
      moves++; document.getElementById("moves").textContent = moves;
      lock = true;
      if (first.dataset.pid === el.dataset.pid && first !== el) {
        setTimeout(function () {
          first.classList.add("matched"); el.classList.add("matched");
          first = null; lock = false; matched++;
          document.getElementById("matched").textContent = matched;
          UI.sfx.correct();
          if (matched === chosen.length) { UI.sfx.win(); UI.confetti(); setTimeout(finish, 700); }
        }, 380);
      } else {
        UI.sfx.wrong();
        var a = first, b = el;
        setTimeout(function () {
          a.classList.remove("flipped"); b.classList.remove("flipped");
          first = null; lock = false;
        }, 900);
      }
    }

    function finish() {
      var stars = moves <= chosen.length + 2 ? "⭐⭐⭐" : moves <= chosen.length + 5 ? "⭐⭐" : "⭐";
      UI.setScreen(
        '<div class="result">' +
          '<div class="r-emoji">🧠</div>' +
          '<div class="r-title">Ingatan Hebat!</div>' +
          '<div class="r-score">' + stars + '</div>' +
          '<div class="r-sub">Selesai dalam ' + moves + ' langkah — ' + UI.esc(subject.name) + '</div>' +
          '<div class="btn-row" style="justify-content:center">' +
            '<button class="btn btn-primary btn-lg" id="retryBtn">🔁 Main Lagi</button>' +
            '<button class="btn btn-ghost btn-lg" onclick="App.home()">🏠 Menu</button>' +
          '</div>' +
        '</div>'
      );
      document.getElementById("retryBtn").addEventListener("click", function () { Games.memory.start(subject); });
    }

    render();
  }
};
