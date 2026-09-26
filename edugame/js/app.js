/* =========================================================================
   EduGame Hub — App (app.js)
   Beranda (hub), pemilih mapel, topbar, fullscreen, suara.
   ========================================================================= */
window.App = (function () {
  // Urutan tampil game di beranda
  var ORDER = ["quiz", "wheel", "matching", "hangman", "snakes", "memory", "camera"];

  function games() { return ORDER.map(function (k) { return Games[k]; }).filter(Boolean); }

  /* ---------- Beranda ---------- */
  function home() {
    if (Games.camera && Games.camera.stop) Games.camera.stop();
    var s = Store.current();
    var scoped = Store.scopedSubject();
    UI.applyAccent(s.color);
    syncTopbar();

    var cards = games().map(function (g, i) {
      var count = Store.contentFor(scoped, g.dataType).length;
      var enough = count >= g.min;
      return '<button class="game-card" data-key="' + g.key + '" style="--gc:' + g.color + ';animation-delay:' + (i * 60) + 'ms"' + (enough ? "" : ' data-locked="1"') + '>' +
        '<span class="gc-count">' + count + ' soal</span>' +
        '<span class="gc-icon" style="background:linear-gradient(135deg,' + g.color + ',' + shade(g.color) + ')">' + g.icon + '</span>' +
        '<span class="gc-title">' + UI.esc(g.title) + '</span>' +
        '<span class="gc-desc">' + UI.esc(g.desc) + '</span>' +
        '<span class="gc-go">' + (enough ? "Mulai ▸" : "Perlu materi ▸") + '</span>' +
      '</button>';
    }).join("");

    var totalQ = Store.contentFor(scoped, "quiz").length;

    UI.setScreen(
      '<div class="hub-hero">' +
        '<span class="deco d1">✏️</span><span class="deco d2">🔢</span><span class="deco d3">🌟</span>' +
        '<span class="deco d4">📚</span><span class="deco d5">🎯</span><span class="deco d6">🧩</span>' +
        '<div class="hero-content">' +
          '<span class="hero-badge">🎓 Media Belajar Interaktif</span>' +
          '<h1>Ayo Belajar Sambil <span class="hl">Bermain!</span></h1>' +
          '<p>Pilih permainan favoritmu — semua soal mengikuti mapel & materi yang kamu pilih.</p>' +
          '<div class="hero-chips">' +
            '<span class="hero-chip">' + UI.esc(s.icon + " " + s.name) + '</span>' +
            '<span class="hero-chip">🎚️ ' + UI.esc(levelLabel(s)) + '</span>' +
            '<span class="hero-chip">🧩 ' + UI.esc(Store.scopeLabel()) + '</span>' +
            '<span class="hero-chip">❓ ' + totalQ + ' soal</span>' +
          '</div>' +
          '<div class="hero-actions">' +
            '<button class="btn btn-hero" id="pickSubjBtn">📚 Ganti Mapel</button>' +
            '<button class="btn btn-hero ghost" id="pickMateriBtn">🧩 Pilih Materi</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="hub-section-head"><h2 class="page-title" style="font-size:30px">🎮 Pilih Permainan</h2>' +
        '<div class="accent-rule"></div></div>' +
      '<div class="game-grid">' + cards + '</div>'
    );

    Array.prototype.forEach.call(document.querySelectorAll(".game-card"), function (c) {
      c.addEventListener("click", function () {
        if (c.dataset.locked) { UI.toast("Tidak ada soal pada materi ini. Pilih materi lain atau tambah lewat Admin.", "bad"); return; }
        openGame(c.dataset.key);
      });
    });
    document.getElementById("pickSubjBtn").addEventListener("click", pickSubject);
    document.getElementById("pickMateriBtn").addEventListener("click", pickMateri);
  }

  function shade(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function (x) { return x + x; }).join("");
    var r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 30);
    var g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 24);
    var b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 10);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function openGame(key) {
    var g = Games[key]; if (!g) return;
    if (Games.camera && Games.camera.stop && key !== "camera") Games.camera.stop();
    var scoped = Store.scopedSubject();
    // Sediakan konten game dari data asli atau turunan Kuis, agar 1 bank dipakai semua game.
    var derived = Object.assign({}, scoped);
    derived[g.dataType] = Store.contentFor(scoped, g.dataType);
    UI.applyAccent(g.color);
    UI.sfx.click();
    g.start(derived);
  }

  /* ---------- Pemilih Mapel (modal) dengan filter jenjang & kelas ---------- */
  var pickLevel = "all", pickGrade = "all";

  function pickSubject() {
    var back = document.createElement("div");
    back.className = "modal-backdrop";
    back.innerHTML =
      '<div class="modal">' +
        '<div class="modal-head"><h2>📚 Pilih Mata Pelajaran</h2>' +
          '<button class="modal-close" id="mClose">×</button></div>' +
        '<div class="modal-body">' +
          '<div id="lvlFilter" class="filter-row"></div>' +
          '<div id="grdFilter" class="filter-row"></div>' +
          '<div class="subject-grid" id="subjGrid"></div>' +
          '<div id="catalogArea"></div>' +
          '<div style="margin-top:20px;text-align:center">' +
            '<button class="btn btn-ghost" id="mEdit">🔐 Kelola Materi (Admin)</button></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(back);

    function close() { back.remove(); }
    back.addEventListener("click", function (e) { if (e.target === back) close(); });
    back.querySelector("#mClose").addEventListener("click", close);
    back.querySelector("#mEdit").addEventListener("click", function () { close(); Admin.require(function () { Editor.open(); }); });

    function renderFilters() {
      var lv = back.querySelector("#lvlFilter");
      var chips = ['<button class="fchip' + (pickLevel === "all" ? " active" : "") + '" data-lv="all">Semua Jenjang</button>'];
      window.LEVELS.forEach(function (L) {
        chips.push('<button class="fchip' + (pickLevel === L.id ? " active" : "") + '" data-lv="' + L.id + '">' + L.name + '</button>');
      });
      lv.innerHTML = chips.join("");
      Array.prototype.forEach.call(lv.querySelectorAll(".fchip"), function (b) {
        b.addEventListener("click", function () { pickLevel = b.dataset.lv; pickGrade = "all"; renderFilters(); refresh(); });
      });

      var gr = back.querySelector("#grdFilter");
      var L = window.LEVELS.filter(function (x) { return x.id === pickLevel; })[0];
      if (!L || !L.grades.length) { gr.innerHTML = ""; return; }
      var gchips = ['<button class="fchip sm' + (pickGrade === "all" ? " active" : "") + '" data-gr="all">Semua Kelas</button>'];
      L.grades.forEach(function (g) {
        gchips.push('<button class="fchip sm' + (pickGrade === String(g) ? " active" : "") + '" data-gr="' + g + '">Kelas ' + g + '</button>');
      });
      gr.innerHTML = gchips.join("");
      Array.prototype.forEach.call(gr.querySelectorAll(".fchip"), function (b) {
        b.addEventListener("click", function () { pickGrade = b.dataset.gr; renderFilters(); refresh(); });
      });
    }

    function refresh() { renderGrid(); renderCatalog(); }

    function renderGrid() {
      var cur = Store.current();
      var list = Store.getSubjects().filter(function (s) {
        if (pickLevel !== "all" && s.level !== pickLevel) return false;
        if (pickGrade !== "all" && String(s.grade) !== pickGrade) return false;
        return true;
      });
      var grid = back.querySelector("#subjGrid");
      if (!list.length) {
        grid.innerHTML = '<div class="empty-note" style="padding:20px">Belum ada mapel dibuat pada filter ini. Tambah dari katalog di bawah 👇</div>';
        return;
      }
      grid.innerHTML = list.map(function (s) {
        var total = s.quiz.length + s.pairs.length + s.words.length;
        return '<button class="subject-card' + (s.id === cur.id ? " active" : "") + '" data-id="' + s.id + '">' +
          '<span class="sc-icon" style="background:linear-gradient(135deg,' + s.color + ',' + shade(s.color) + ')">' + s.icon + '</span>' +
          '<span class="sc-name">' + UI.esc(s.name) + '</span>' +
          '<span class="sc-badge">' + UI.esc(levelLabel(s)) + '</span>' +
          '<span class="sc-meta">' + total + ' soal · ' + (s.topics || []).length + ' materi</span>' +
        '</button>';
      }).join("");
      Array.prototype.forEach.call(grid.querySelectorAll(".subject-card"), function (c) {
        c.addEventListener("click", function () {
          Store.setCurrent(c.dataset.id); UI.sfx.click(); close(); home();
        });
      });
    }

    // Katalog Kurikulum Merdeka — tambah mapel on-demand per jenjang & kelas.
    function renderCatalog() {
      var area = back.querySelector("#catalogArea");
      var CUR = window.CURRICULUM || {};
      if (pickLevel === "all" || !CUR[pickLevel]) { area.innerHTML = ""; return; }
      if (pickGrade === "all") {
        area.innerHTML = '<div class="catalog-hint">📖 Pilih <b>kelas</b> untuk menambah mapel dari Kurikulum Merdeka.</div>';
        return;
      }
      var g = parseInt(pickGrade, 10);
      var entries = (CUR[pickLevel] && CUR[pickLevel][g]) || [];
      if (!entries.length) { area.innerHTML = ""; return; }
      var avail = entries.filter(function (e) { return !Store.hasSubject(pickLevel, g, e.name); });
      var cards = avail.map(function (e) {
        var subN = (e.topics || []).reduce(function (a, t) { return a + (t.subs ? t.subs.length : 0); }, 0);
        return '<button class="subject-card catalog-card" data-cat="' + UI.esc(e.name) + '">' +
          '<span class="sc-icon" style="background:linear-gradient(135deg,' + e.color + ',' + shade(e.color) + ')">' + e.icon + '</span>' +
          '<span class="sc-name">' + UI.esc(e.name) + '</span>' +
          '<span class="sc-badge">' + (e.topics || []).length + ' materi · ' + subN + ' sub</span>' +
          '<span class="gc-go" style="background:var(--accent-soft);color:var(--accent)">➕ Tambah</span>' +
        '</button>';
      }).join("");
      area.innerHTML =
        '<div class="catalog-head">🧩 Katalog Kurikulum Merdeka — ' + pickLevel + ' Kelas ' + g + '</div>' +
        '<div class="subject-grid">' +
          (cards || '<div class="empty-note" style="padding:20px">✅ Semua mapel katalog untuk kelas ini sudah ditambahkan.</div>') +
        '</div>';
      Array.prototype.forEach.call(area.querySelectorAll(".catalog-card"), function (c) {
        c.addEventListener("click", function () {
          var entry = entries.filter(function (e) { return e.name === c.dataset.cat; })[0];
          if (!entry) return;
          var s = Store.createFromCatalog(pickLevel, g, entry);
          Store.setCurrent(s.id); UI.sfx.win();
          UI.toast('Mapel "' + entry.name + '" ditambahkan. Isi soal lewat Admin/AI.', "good");
          close(); home();
        });
      });
    }

    renderFilters();
    refresh();
  }

  function levelLabel(s) {
    if (!s.level || s.level === "Umum") return "Umum";
    return s.level + (s.grade ? " · Kelas " + s.grade : "");
  }

  /* ---------- Pemilih Materi & Sub-materi ---------- */
  function pickMateri() {
    var s = Store.current();
    var scope = Store.getScope();

    function countFor(topic, sub) {
      var n = 0;
      ["quiz", "pairs", "words"].forEach(function (k) {
        (s[k] || []).forEach(function (it) {
          if (topic && it.topic !== topic) return;
          if (sub && it.sub !== sub) return;
          n++;
        });
      });
      return n;
    }

    var allActive = !scope.topic ? " active" : "";
    var blocks = (s.topics || []).map(function (t) {
      var tActive = scope.topic === t.name && !scope.sub ? " active" : "";
      var subChips = (t.subs || []).map(function (sub) {
        var sActive = scope.topic === t.name && scope.sub === sub ? " active" : "";
        return '<button class="fchip sm materi-pick' + sActive + '" data-topic="' + UI.esc(t.name) + '" data-sub="' + UI.esc(sub) + '">' +
          UI.esc(sub) + ' <span class="mini">' + countFor(t.name, sub) + '</span></button>';
      }).join("");
      return '<div class="materi-block">' +
        '<button class="fchip materi-pick' + tActive + '" data-topic="' + UI.esc(t.name) + '" data-sub="">' +
          '📂 ' + UI.esc(t.name) + ' <span class="mini">' + countFor(t.name, null) + '</span></button>' +
        (subChips ? '<div class="materi-subs">' + subChips + '</div>' : '') +
      '</div>';
    }).join("");

    if (!(s.topics || []).length) {
      blocks = '<div class="empty-note">Mapel ini belum punya daftar materi. Admin dapat menambah lewat menu Materi.</div>';
    }

    var back = document.createElement("div");
    back.className = "modal-backdrop";
    back.innerHTML =
      '<div class="modal" style="max-width:720px">' +
        '<div class="modal-head"><h2>🧩 Pilih Materi — ' + UI.esc(s.name) + '</h2><button class="modal-close" id="mmClose">×</button></div>' +
        '<div class="modal-body">' +
          '<button class="fchip big materi-pick' + allActive + '" data-topic="" data-sub="" style="margin-bottom:16px">' +
            '📚 Semua Materi (' + UI.esc(levelLabel(s)) + ') <span class="mini">' + countFor(null, null) + '</span></button>' +
          blocks +
        '</div>' +
      '</div>';
    document.body.appendChild(back);

    function close() { back.remove(); }
    back.addEventListener("click", function (e) { if (e.target === back) close(); });
    back.querySelector("#mmClose").addEventListener("click", close);
    Array.prototype.forEach.call(back.querySelectorAll(".materi-pick"), function (b) {
      b.addEventListener("click", function () {
        Store.setScope(b.dataset.topic, b.dataset.sub); UI.sfx.click(); close(); home();
      });
    });
  }

  /* ---------- Topbar ---------- */
  function syncTopbar() {
    var s = Store.current();
    document.getElementById("subjectChipIcon").textContent = s.icon;
    document.getElementById("subjectChipName").textContent = s.name + " · " + levelLabel(s);
    document.getElementById("materiChipName").textContent = Store.scopeLabel();
    document.getElementById("soundBtn").textContent = Store.getSound() ? "🔊" : "🔇";
  }

  function wireTopbar() {
    document.getElementById("homeBtn").addEventListener("click", home);
    document.getElementById("homeBtn").addEventListener("keydown", function (e) { if (e.key === "Enter") home(); });
    document.getElementById("subjectChip").addEventListener("click", pickSubject);
    document.getElementById("materiChip").addEventListener("click", pickMateri);
    document.getElementById("editorBtn").addEventListener("click", function () {
      Admin.require(function () { Editor.open(); });
    });
    document.getElementById("soundBtn").addEventListener("click", function () {
      Store.setSound(!Store.getSound()); syncTopbar();
      if (Store.getSound()) UI.sfx.correct();
      UI.toast(Store.getSound() ? "Suara aktif 🔊" : "Suara nonaktif 🔇");
    });
    document.getElementById("fullscreenBtn").addEventListener("click", toggleFullscreen);
  }

  function toggleFullscreen() {
    var d = document.documentElement;
    if (!document.fullscreenElement) {
      (d.requestFullscreen || d.webkitRequestFullscreen || function () {}).call(d);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document);
    }
  }

  function init() {
    wireTopbar();
    home();
  }

  return { init: init, home: home, openGame: openGame };
})();

document.addEventListener("DOMContentLoaded", App.init);
