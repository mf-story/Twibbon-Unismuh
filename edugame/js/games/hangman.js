/* =========================================================================
   Game: Tebak Kata (hangman.js)
   Tebak huruf sebelum gambar lengkap. Pakai daftar 'words' + petunjuk.
   ========================================================================= */
window.Games = window.Games || {};
window.Games.hangman = {
  key: "hangman",
  title: "Tebak Kata",
  icon: "🔤",
  color: "#a855f7",
  desc: "Tebak kata huruf demi huruf sebelum kesempatan habis. Latih kosakata.",
  dataType: "words",
  min: 1,

  start: function (subject) {
    var pool = UI.draw("hangman:" + subject.id, subject.words, subject.words.length);
    var round = 0, score = 0;
    var maxWrong = 6;

    function play() {
      if (round >= pool.length) return finish();
      var entry = pool[round];
      var word = String(entry.word).toUpperCase().replace(/[^A-Z]/g, "");
      var guessed = {}, wrong = 0, over = false;

      function draw() {
        var display = word.split("").map(function (ch) {
          return '<div class="hang-letter">' + (guessed[ch] ? ch : "") + '</div>';
        }).join("");
        var keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(function (k) {
          var cls = "key"; var dis = "";
          if (guessed[k]) { cls += word.indexOf(k) >= 0 ? " hit" : " miss"; dis = "disabled"; }
          return '<button class="' + cls + '" data-k="' + k + '" ' + dis + '>' + k + '</button>';
        }).join("");

        UI.setScreen(
          '<div class="game-shell">' +
            gameBar(subject, ['<span class="pill score">⭐ <b>' + score + '</b></span>',
                              '<span class="pill">📝 ' + (round + 1) + ' / ' + pool.length + '</span>',
                              '<span class="pill lives">❤ ' + (maxWrong - wrong) + '</span>']) +
            '<div class="hang-wrap">' +
              '<div class="hang-figure">' + figureSVG(wrong) + '</div>' +
              '<div>' +
                '<div class="hang-word">' + display + '</div>' +
                '<div class="hang-hint">💡 ' + UI.esc(entry.hint || "Tebak katanya!") + '</div>' +
                '<div class="hang-keys">' + keys + '</div>' +
              '</div>' +
            '</div>' +
          '</div>'
        );
        Array.prototype.forEach.call(document.querySelectorAll(".key"), function (b) {
          b.addEventListener("click", function () { guess(b.dataset.k); });
        });
      }

      function guess(k) {
        if (over || guessed[k]) return;
        guessed[k] = true;
        if (word.indexOf(k) >= 0) {
          UI.sfx.correct();
          if (word.split("").every(function (ch) { return guessed[ch]; })) { over = true; score++; win(); return; }
        } else {
          wrong++; UI.sfx.wrong();
          if (wrong >= maxWrong) { over = true; lose(); return; }
        }
        draw();
      }

      function win() {
        draw(); UI.confetti(50); UI.toast("Tepat! Katanya: " + word, "good");
        setTimeout(function () { round++; play(); }, 1600);
      }
      function lose() {
        draw(); UI.toast("Waktunya habis. Kata: " + word, "bad");
        setTimeout(function () { round++; play(); }, 2200);
      }

      draw();
    }

    function finish() { showResult(subject, score, pool.length, function () { Games.hangman.start(subject); }); }

    play();
  }
};

function figureSVG(wrong) {
  var parts = [
    '<line x1="20" y1="230" x2="120" y2="230" stroke="#94a3b8" stroke-width="6"/>' +
    '<line x1="50" y1="230" x2="50" y2="20" stroke="#94a3b8" stroke-width="6"/>' +
    '<line x1="50" y1="20" x2="150" y2="20" stroke="#94a3b8" stroke-width="6"/>' +
    '<line x1="150" y1="20" x2="150" y2="50" stroke="#94a3b8" stroke-width="6"/>',
    '<circle cx="150" cy="70" r="20" stroke="var(--accent)" stroke-width="6" fill="none"/>',
    '<line x1="150" y1="90" x2="150" y2="150" stroke="var(--accent)" stroke-width="6"/>',
    '<line x1="150" y1="105" x2="120" y2="135" stroke="var(--accent)" stroke-width="6"/>',
    '<line x1="150" y1="105" x2="180" y2="135" stroke="var(--accent)" stroke-width="6"/>',
    '<line x1="150" y1="150" x2="122" y2="195" stroke="var(--accent)" stroke-width="6"/>',
    '<line x1="150" y1="150" x2="178" y2="195" stroke="var(--accent)" stroke-width="6"/>'
  ];
  return '<svg viewBox="0 0 200 250">' + parts.slice(0, 1 + wrong).join("") + '</svg>';
}
