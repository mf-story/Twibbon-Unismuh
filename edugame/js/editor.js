/* =========================================================================
   EduGame Hub — Editor Materi (editor.js)
   Kelola bank soal per mapel di layar: kuis, pasangan, kata.
   Import/Export JSON, Import CSV kuis, tambah/hapus/ganti nama mapel.
   ========================================================================= */
window.Editor = (function () {
  var tab = "quiz";

  function open() {
    var s = Store.current();
    if (!s) { Store.addSubject("Mapel Baru"); s = Store.current(); }
    render(s.id);
  }

  function render(subjectId) {
    if (subjectId) Store.setCurrent(subjectId);
    var s = Store.current();
    var subs = Store.getSubjects();

    var options = subs.map(function (x) {
      return '<option value="' + x.id + '"' + (x.id === s.id ? " selected" : "") + '>' + UI.esc(x.icon + " " + x.name) + '</option>';
    }).join("");

    UI.setScreen(
      '<div class="editor">' +
        '<div class="page-head">' +
          '<div><h1 class="page-title">✏️ Kelola Materi <span class="admin-tag">ADMIN</span></h1>' +
            '<div class="page-sub">Ubah bank soal per mata pelajaran. Tersimpan otomatis di perangkat ini.</div>' +
            '<div class="accent-rule"></div></div>' +
          '<div class="btn-row">' +
            '<button class="btn btn-ghost" id="chPin">🔑 Ganti PIN</button>' +
            '<button class="btn btn-ghost" id="logoutAdm">🚪 Keluar Admin</button>' +
            '<button class="btn btn-ghost" onclick="App.home()">← Selesai</button>' +
          '</div>' +
        '</div>' +

        '<div class="ed-head">' +
          '<div class="ed-subjpick">' +
            '<span class="ed-subj-emoji">' + UI.esc(s.icon) + '</span>' +
            '<div class="ed-subj-fields">' +
              '<select class="fld ed-subj-sel" id="subjSel">' + options + '</select>' +
              '<div class="ed-meta">' +
                '<label class="fld-lbl">Jenjang</label><select class="fld" id="lvlSel">' + levelOptions(s.level) + '</select>' +
                '<label class="fld-lbl">Kelas</label><select class="fld" id="grdSel">' + gradeOptions(s.level, s.grade) + '</select>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="ed-subjbtns">' +
            '<button class="btn btn-ghost" id="addSubj">➕ Mapel</button>' +
            '<button class="btn btn-ghost ic" id="renSubj" title="Ganti nama mapel">✒️</button>' +
            '<button class="btn btn-ghost ic" id="iconSubj" title="Ganti ikon">😀</button>' +
            '<button class="btn btn-ghost ic" id="delSubj" title="Hapus mapel">🗑️</button>' +
          '</div>' +
        '</div>' +

        '<div class="ed-actions">' +
          '<div class="ed-group">' +
            '<span class="ed-group-lbl">🤖 Isi Soal (AI)</span>' +
            '<button class="btn btn-primary" id="aiGen">Buat dengan AI</button>' +
            '<button class="btn btn-ghost" id="aiBank">🏦 Bank Default</button>' +
            '<button class="btn btn-ghost" id="aiBulk">🌐 Generate Massal</button>' +
            '<button class="btn btn-ghost ic" id="aiCfg" title="Pengaturan AI">⚙️</button>' +
          '</div>' +
          '<div class="ed-group">' +
            '<span class="ed-group-lbl">📁 Data</span>' +
            '<button class="btn btn-ghost" id="impJson" title="Impor materi (JSON)">⬆️ JSON</button>' +
            '<button class="btn btn-ghost" id="expJson" title="Ekspor materi (JSON)">⬇️ JSON</button>' +
            '<button class="btn btn-ghost" id="impCsv" title="Impor kuis (CSV)">📄 CSV</button>' +
            '<button class="btn btn-primary" id="saveBank" title="Simpan semua soal permanen ke aplikasi (js/bank.js)">💾 Simpan Permanen</button>' +
            '<button class="btn btn-ghost" id="expBank" title="Unduh bank bawaan (js/bank.js)">🧩 Bank .js</button>' +
            '<button class="btn btn-ghost" id="loadBank" title="Muat/gabung bank bawaan">🔄 Muat Bank</button>' +
            '<button class="btn btn-ghost" id="resetAll" title="Kembalikan ke bawaan">♻️ Reset</button>' +
          '</div>' +
        '</div>' +

        '<div class="ed-tabs">' +
          tabBtn("quiz", "❓ Kuis", s.quiz.length) +
          tabBtn("pairs", "🔗 Pasangan", s.pairs.length) +
          tabBtn("words", "🔤 Kata", s.words.length) +
          tabBtn("topics", "🗂️ Materi", (s.topics || []).length) +
        '</div>' +

        '<div class="ed-panel" id="edPanel" style="margin-top:16px"></div>' +

        '<input type="file" id="fileJson" accept=".json,application/json" class="hidden" />' +
        '<input type="file" id="fileCsv" accept=".csv,text/csv" class="hidden" />' +
      '</div>'
    );

    document.getElementById("subjSel").addEventListener("change", function (e) { render(e.target.value); });
    document.getElementById("addSubj").addEventListener("click", addSubject);
    document.getElementById("renSubj").addEventListener("click", renameSubject);
    document.getElementById("iconSubj").addEventListener("click", changeIcon);
    document.getElementById("delSubj").addEventListener("click", deleteSubject);
    document.getElementById("lvlSel").addEventListener("change", function (e) {
      var L = window.LEVELS.filter(function (x) { return x.id === e.target.value; })[0];
      var g = L && L.grades.length ? L.grades[0] : 0;
      Store.updateSubject(s.id, { level: e.target.value, grade: g }); render();
    });
    document.getElementById("grdSel").addEventListener("change", function (e) {
      Store.updateSubject(s.id, { grade: parseInt(e.target.value, 10) || 0 }); render();
    });
    document.getElementById("aiGen").addEventListener("click", function () { AIPanel.generate(s.id, tab === "topics" ? "quiz" : tab, render); });
    document.getElementById("aiBank").addEventListener("click", function () { AIPanel.bank(s.id, render); });
    document.getElementById("aiBulk").addEventListener("click", function () { AIPanel.bulk(render); });
    document.getElementById("aiCfg").addEventListener("click", function () { AIPanel.settings(); });
    document.getElementById("chPin").addEventListener("click", function () { Admin.changePin(); });
    document.getElementById("logoutAdm").addEventListener("click", function () {
      Admin.lock(); UI.toast("Keluar dari mode admin 🔒"); App.home();
    });
    document.getElementById("expJson").addEventListener("click", function () { Store.exportJSON(); UI.toast("File materi diunduh", "good"); });
    document.getElementById("impJson").addEventListener("click", function () { document.getElementById("fileJson").click(); });
    document.getElementById("impCsv").addEventListener("click", function () { document.getElementById("fileCsv").click(); });
    document.getElementById("saveBank").addEventListener("click", function () {
      var btn = document.getElementById("saveBank");
      btn.disabled = true; btn.textContent = "⏳ Menyimpan...";
      Store.saveToServer().then(function (r) {
        UI.toast("✅ Tersimpan permanen di aplikasi (" + r.count + " mapel). Ada di semua browser.", "good");
        btn.disabled = false; btn.textContent = "💾 Simpan Permanen";
      }).catch(function () {
        // Bukan lewat server (mis. file://) — fallback unduh file.
        Store.exportBankJS();
        UI.toast("Server tak tersedia — file bank.js diunduh, salin ke folder js/", "bad");
        btn.disabled = false; btn.textContent = "💾 Simpan Permanen";
      });
    });
    document.getElementById("expBank").addEventListener("click", function () {
      Store.exportBankJS();
      UI.toast("bank.js diunduh — salin ke folder EduGameHub/js/ (timpa yang lama)", "good");
    });
    document.getElementById("loadBank").addEventListener("click", function () {
      var n = Store.seedFromBank();
      render();
      UI.toast(n > 0 ? (n + " soal dari bank bawaan ditambahkan") : "Tidak ada bank bawaan / semua sudah ada", n > 0 ? "good" : "bad");
    });
    document.getElementById("resetAll").addEventListener("click", resetAll);
    document.getElementById("fileJson").addEventListener("change", onJson);
    document.getElementById("fileCsv").addEventListener("change", onCsv);
    Array.prototype.forEach.call(document.querySelectorAll(".ed-tab"), function (b) {
      b.addEventListener("click", function () { tab = b.dataset.t; render(); });
    });

    renderPanel();
  }

  function tabBtn(t, label, count) {
    return '<button class="ed-tab' + (tab === t ? " active" : "") + '" data-t="' + t + '">' + label + ' (' + count + ')</button>';
  }

  function levelOptions(sel) {
    return window.LEVELS.map(function (L) {
      return '<option value="' + L.id + '"' + (L.id === sel ? " selected" : "") + '>' + L.name + '</option>';
    }).join("");
  }
  function gradeOptions(level, sel) {
    var L = window.LEVELS.filter(function (x) { return x.id === level; })[0];
    if (!L || !L.grades.length) return '<option value="0">Semua Kelas</option>';
    return L.grades.map(function (g) {
      return '<option value="' + g + '"' + (g === sel ? " selected" : "") + '>Kelas ' + g + '</option>';
    }).join("");
  }

  function renderPanel() {
    var s = Store.current();
    var panel = document.getElementById("edPanel");
    if (tab === "quiz") panel.innerHTML = quizPanel(s);
    else if (tab === "pairs") panel.innerHTML = pairsPanel(s);
    else if (tab === "words") panel.innerHTML = wordsPanel(s);
    else panel.innerHTML = topicsPanel(s);
    bindPanel(s);
  }

  // Dua dropdown Materi + Sub-materi untuk sebuah item.
  function tagRow(s, type, i, it) {
    var topics = s.topics || [];
    var topicOpts = '<option value="">— Tanpa materi —</option>' + topics.map(function (t) {
      return '<option value="' + UI.esc(t.name) + '"' + (it.topic === t.name ? " selected" : "") + '>' + UI.esc(t.name) + '</option>';
    }).join("");
    var tObj = topics.filter(function (t) { return t.name === it.topic; })[0];
    var subs = tObj ? (tObj.subs || []) : [];
    var subOpts = '<option value="">— Umum —</option>' + subs.map(function (su) {
      return '<option value="' + UI.esc(su) + '"' + (it.sub === su ? " selected" : "") + '>' + UI.esc(su) + '</option>';
    }).join("");
    return '<div class="ed-grid2">' +
      '<div><span class="fld-lbl">📂 Materi</span><select class="fld tag-topic" data-type="' + type + '" data-i="' + i + '">' + topicOpts + '</select></div>' +
      '<div><span class="fld-lbl">Sub-materi</span><select class="fld tag-sub" data-type="' + type + '" data-i="' + i + '">' + subOpts + '</select></div>' +
    '</div>';
  }

  /* ---------- MATERI (topics) ---------- */
  function topicsPanel(s) {
    var rows = (s.topics || []).map(function (t, i) {
      return '<div class="ed-row"><div class="ed-grid2">' +
        '<div><span class="fld-lbl">Nama materi</span><input class="fld t-name" data-i="' + i + '" value="' + UI.esc(t.name) + '" placeholder="mis. Pecahan"></div>' +
        '<button class="row-del" data-delt="' + i + '">🗑️ Hapus</button>' +
        '</div>' +
        '<div><span class="fld-lbl">Sub-materi (satu per baris)</span>' +
          '<textarea class="fld t-subs" data-i="' + i + '" placeholder="Persen&#10;Pecahan Senilai">' + UI.esc((t.subs || []).join("\n")) + '</textarea></div>' +
      '</div>';
    }).join("");
    return '<div class="page-sub" style="margin-bottom:14px">Materi & sub-materi (Kurikulum Merdeka) dipakai untuk memilih cakupan soal saat bermain.</div>' +
      (rows || empty("Belum ada materi. Tambahkan materi Kurikulum Merdeka untuk mapel ini.")) +
      '<button class="btn btn-primary" id="addTopic">➕ Tambah Materi</button>';
  }

  /* ---------- QUIZ ---------- */
  function quizPanel(s) {
    var rows = s.quiz.map(function (q, i) {
      var opts = [0, 1, 2, 3].map(function (k) {
        return '<label class="opt-radio">' +
          '<input type="radio" name="ans' + i + '" data-i="' + i + '" data-k="' + k + '"' + (q.answer === k ? " checked" : "") + '>' +
          '<input class="fld q-opt" data-i="' + i + '" data-k="' + k + '" value="' + UI.esc(q.options[k] || "") + '" placeholder="Opsi ' + "ABCD"[k] + '">' +
        '</label>';
      }).join("");
      return '<div class="ed-row">' +
        '<div><span class="fld-lbl">Pertanyaan ' + (i + 1) + '</span>' +
          '<textarea class="fld q-q" data-i="' + i + '" placeholder="Tulis pertanyaan...">' + UI.esc(q.q) + '</textarea></div>' +
        '<div><span class="fld-lbl">Pilihan jawaban (pilih lingkaran = kunci benar)</span>' +
          '<div class="ed-grid4">' + opts + '</div></div>' +
        '<div class="ed-grid2">' +
          '<div><span class="fld-lbl">Petunjuk (opsional)</span>' +
            '<input class="fld q-hint" data-i="' + i + '" value="' + UI.esc(q.hint || "") + '" placeholder="Petunjuk..."></div>' +
          '<button class="row-del" data-del="' + i + '">🗑️ Hapus</button>' +
        '</div>' +
        tagRow(s, "quiz", i, q) +
      '</div>';
    }).join("");
    return (rows || empty("Belum ada soal kuis.")) +
      '<button class="btn btn-primary" id="addRow">➕ Tambah Soal</button>';
  }

  /* ---------- PAIRS ---------- */
  function pairsPanel(s) {
    var rows = s.pairs.map(function (p, i) {
      return '<div class="ed-row"><div class="ed-grid2">' +
        '<div><span class="fld-lbl">Istilah</span><input class="fld p-a" data-i="' + i + '" value="' + UI.esc(p.a) + '" placeholder="mis. Jakarta"></div>' +
        '<div><span class="fld-lbl">Pasangan</span><input class="fld p-b" data-i="' + i + '" value="' + UI.esc(p.b) + '" placeholder="mis. Indonesia"></div>' +
        '</div>' + tagRow(s, "pairs", i, p) +
        '<button class="row-del" data-del="' + i + '">🗑️ Hapus</button></div>';
    }).join("");
    return (rows || empty("Belum ada pasangan. Dipakai game Mencocokkan & Kartu Memori.")) +
      '<button class="btn btn-primary" id="addRow">➕ Tambah Pasangan</button>';
  }

  /* ---------- WORDS ---------- */
  function wordsPanel(s) {
    var rows = s.words.map(function (w, i) {
      return '<div class="ed-row"><div class="ed-grid2">' +
        '<div><span class="fld-lbl">Kata (huruf saja)</span><input class="fld w-word" data-i="' + i + '" value="' + UI.esc(w.word) + '" placeholder="mis. GARUDA"></div>' +
        '<div><span class="fld-lbl">Petunjuk</span><input class="fld w-hint" data-i="' + i + '" value="' + UI.esc(w.hint || "") + '" placeholder="Petunjuk kata"></div>' +
        '</div>' + tagRow(s, "words", i, w) +
        '<button class="row-del" data-del="' + i + '">🗑️ Hapus</button></div>';
    }).join("");
    return (rows || empty("Belum ada kata. Dipakai game Tebak Kata.")) +
      '<button class="btn btn-primary" id="addRow">➕ Tambah Kata</button>';
  }

  function empty(msg) { return '<div class="empty-note">' + msg + '</div>'; }

  /* ---------- Binding perubahan ---------- */
  function bindPanel(s) {
    var add = document.getElementById("addRow");
    if (add) add.addEventListener("click", function () {
      if (tab === "quiz") s.quiz.push({ q: "", options: ["", "", "", ""], answer: 0, hint: "", topic: "", sub: "" });
      else if (tab === "pairs") s.pairs.push({ a: "", b: "", topic: "", sub: "" });
      else s.words.push({ word: "", hint: "", topic: "", sub: "" });
      Store.save(); render();
    });

    var addT = document.getElementById("addTopic");
    if (addT) addT.addEventListener("click", function () {
      s.topics = s.topics || []; s.topics.push({ name: "Materi Baru", subs: [] });
      Store.save(); render();
    });

    Array.prototype.forEach.call(document.querySelectorAll("[data-del]"), function (b) {
      b.addEventListener("click", function () {
        var i = parseInt(b.dataset.del, 10);
        if (tab === "quiz") s.quiz.splice(i, 1);
        else if (tab === "pairs") s.pairs.splice(i, 1);
        else s.words.splice(i, 1);
        Store.save(); render();
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll("[data-delt]"), function (b) {
      b.addEventListener("click", function () {
        s.topics.splice(parseInt(b.dataset.delt, 10), 1); Store.save(); render();
      });
    });

    function on(sel, fn) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        el.addEventListener("input", function () { fn(el); Store.save(); });
        el.addEventListener("change", function () { fn(el); Store.save(); });
      });
    }
    on(".q-q", function (el) { s.quiz[el.dataset.i].q = el.value; });
    on(".q-opt", function (el) { s.quiz[el.dataset.i].options[el.dataset.k] = el.value; });
    on(".q-hint", function (el) { s.quiz[el.dataset.i].hint = el.value; });
    on("input[type=radio][data-i]", function (el) { if (el.checked) s.quiz[el.dataset.i].answer = parseInt(el.dataset.k, 10); });
    on(".p-a", function (el) { s.pairs[el.dataset.i].a = el.value; });
    on(".p-b", function (el) { s.pairs[el.dataset.i].b = el.value; });
    on(".w-word", function (el) { s.words[el.dataset.i].word = el.value; });
    on(".w-hint", function (el) { s.words[el.dataset.i].hint = el.value; });

    // Materi (topics) management
    on(".t-name", function (el) { s.topics[el.dataset.i].name = el.value; });
    on(".t-subs", function (el) {
      s.topics[el.dataset.i].subs = el.value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
    });

    // Tag materi/sub per item — ganti topik me-reset sub & render ulang opsi sub.
    Array.prototype.forEach.call(document.querySelectorAll(".tag-topic"), function (el) {
      el.addEventListener("change", function () {
        var arr = s[el.dataset.type]; arr[el.dataset.i].topic = el.value; arr[el.dataset.i].sub = "";
        Store.save(); render();
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll(".tag-sub"), function (el) {
      el.addEventListener("change", function () {
        s[el.dataset.type][el.dataset.i].sub = el.value; Store.save();
      });
    });
  }

  /* ---------- Aksi mapel ---------- */
  function addSubject() {
    var name = prompt("Nama mata pelajaran baru:", "");
    if (name && name.trim()) { var s = Store.addSubject(name.trim()); render(s.id); UI.toast("Mapel ditambahkan", "good"); }
  }
  function renameSubject() {
    var s = Store.current();
    var name = prompt("Ubah nama mapel:", s.name);
    if (name && name.trim()) { Store.updateSubject(s.id, { name: name.trim() }); render(); UI.toast("Nama diperbarui", "good"); }
  }
  function changeIcon() {
    var s = Store.current();
    var ic = prompt("Masukkan 1 emoji ikon (mis. 📘 🔬 🎨 🎵):", s.icon);
    if (ic && ic.trim()) { Store.updateSubject(s.id, { icon: ic.trim() }); render(); }
  }
  function deleteSubject() {
    var s = Store.current();
    if (Store.getSubjects().length <= 1) { UI.toast("Minimal harus ada 1 mapel", "bad"); return; }
    if (confirm('Hapus mapel "' + s.name + '" beserta semua soalnya?')) { Store.deleteSubject(s.id); render(); UI.toast("Mapel dihapus", "good"); }
  }
  function resetAll() {
    if (confirm("Kembalikan SEMUA materi ke bawaan? Perubahan Anda akan hilang.")) { Store.resetDefaults(); tab = "quiz"; render(); UI.toast("Materi dikembalikan ke bawaan", "good"); }
  }

  function onJson(e) {
    var f = e.target.files[0]; if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      try { Store.importJSON(reader.result); tab = "quiz"; render(); UI.toast("Materi berhasil diimpor", "good"); }
      catch (err) { UI.toast("Gagal impor: " + err.message, "bad"); }
    };
    reader.readAsText(f); e.target.value = "";
  }
  function onCsv(e) {
    var f = e.target.files[0]; if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      try { var n = Store.importQuizCSV(reader.result, Store.current().id); tab = "quiz"; render(); UI.toast(n + " soal diimpor ke " + Store.current().name, "good"); }
      catch (err) { UI.toast("Gagal impor CSV: " + err.message, "bad"); }
    };
    reader.readAsText(f); e.target.value = "";
  }

  return { open: open };
})();
