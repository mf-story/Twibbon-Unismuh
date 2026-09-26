/* =========================================================================
   Game: Mencocokkan (matching.js)
   Pasangkan istilah di kiri dengan pasangannya di kanan.
   ========================================================================= */
window.Games = window.Games || {};
window.Games.matching = {
  key: "matching",
  title: "Mencocokkan",
  icon: "🔗",
  color: "#22c55e",
  desc: "Pasangkan istilah dengan definisinya. Melatih pemahaman konsep.",
  dataType: "pairs",
  min: 2,

  start: function (subject) {
    var pairs = UI.draw("matching:" + subject.id, subject.pairs, Math.min(6, subject.pairs.length));
    var left = pairs.map(function (p, i) { return { id: i, text: p.a }; });
    var right = UI.shuffle(pairs.map(function (p, i) { return { id: i, text: p.b }; }));
    var selLeft = null, selRight = null, done = 0, tries = 0;

    function render() {
      UI.setScreen(
        '<div class="game-shell">' +
          gameBar(subject, ['<span class="pill score">✅ <b id="done">' + done + '</b> / ' + pairs.length + '</span>',
                            '<span class="pill">🎯 ' + tries + ' coba</span>']) +
          '<div class="page-sub" style="text-align:center;margin-bottom:20px">Ketuk satu di kiri, lalu pasangannya di kanan</div>' +
          '<div class="match-grid">' +
            '<div class="match-col"><h3>Istilah</h3>' +
              left.map(function (x) { return item("L", x); }).join("") + '</div>' +
            '<div class="match-col"><h3>Pasangan</h3>' +
              right.map(function (x) { return item("R", x); }).join("") + '</div>' +
          '</div>' +
        '</div>'
      );
      bind();
    }

    function item(side, x) {
      return '<button class="match-item" data-side="' + side + '" data-id="' + x.id + '">' + UI.esc(x.text) + '</button>';
    }

    function bind() {
      Array.prototype.forEach.call(document.querySelectorAll(".match-item"), function (el) {
        el.addEventListener("click", function () { pick(el); });
      });
    }

    function pick(el) {
      if (el.classList.contains("done")) return;
      UI.sfx.click();
      var side = el.dataset.side;
      var group = document.querySelectorAll('.match-item[data-side="' + side + '"]');
      Array.prototype.forEach.call(group, function (g) { if (!g.classList.contains("done")) g.classList.remove("selected"); });
      el.classList.add("selected");
      if (side === "L") selLeft = el; else selRight = el;
      if (selLeft && selRight) check();
    }

    function check() {
      tries++;
      var a = selLeft, b = selRight;
      selLeft = selRight = null;
      if (a.dataset.id === b.dataset.id) {
        a.classList.add("done"); b.classList.add("done");
        a.classList.remove("selected"); b.classList.remove("selected");
        done++; UI.sfx.correct();
        document.getElementById("done").textContent = done;
        if (done === pairs.length) { UI.sfx.win(); UI.confetti(); setTimeout(finish, 700); }
      } else {
        UI.sfx.wrong();
        a.classList.add("shake"); b.classList.add("shake");
        setTimeout(function () {
          a.classList.remove("selected", "shake"); b.classList.remove("selected", "shake");
        }, 500);
      }
    }

    function finish() {
      var stars = tries <= pairs.length + 1 ? "⭐⭐⭐" : tries <= pairs.length + 3 ? "⭐⭐" : "⭐";
      UI.setScreen(
        '<div class="result">' +
          '<div class="r-emoji">🎉</div>' +
          '<div class="r-title">Semua Cocok!</div>' +
          '<div class="r-score">' + stars + '</div>' +
          '<div class="r-sub">Selesai dalam ' + tries + ' percobaan — ' + UI.esc(subject.name) + '</div>' +
          '<div class="btn-row" style="justify-content:center">' +
            '<button class="btn btn-primary btn-lg" id="retryBtn">🔁 Main Lagi</button>' +
            '<button class="btn btn-ghost btn-lg" onclick="App.home()">🏠 Menu</button>' +
          '</div>' +
        '</div>'
      );
      document.getElementById("retryBtn").addEventListener("click", function () { Games.matching.start(subject); });
    }

    render();
  }
};
