/* =========================================================================
   EduGame Hub — Store (store.js)
   State + persistensi (localStorage) + import/export JSON & CSV.
   Semua game membaca data dari sini agar konsisten per mapel.
   ========================================================================= */
window.Store = (function () {
  var KEY = "eduGameHub.subjects.v1";
  var PREF = "eduGameHub.prefs.v1";
  var subjects = [];
  var prefs = { subjectId: null, sound: true, scopeTopic: null, scopeSub: null };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      subjects = raw ? JSON.parse(raw) : clone(window.DEFAULT_SUBJECTS);
    } catch (e) { subjects = clone(window.DEFAULT_SUBJECTS); }
    try {
      var p = localStorage.getItem(PREF);
      if (p) prefs = Object.assign(prefs, JSON.parse(p));
    } catch (e) {}
    subjects.forEach(normalize);
    // Selalu gabungkan bank bawaan (js/bank.js) — dedupe, hanya menambah yang belum ada.
    // Menjamin soal permanen tersedia di semua browser/origin.
    if (window.SEED_BANK && window.SEED_BANK.length) seedFromBank();
    if (!prefs.subjectId && subjects[0]) prefs.subjectId = subjects[0].id;
  }

  // Pastikan tiap mapel punya field lengkap (migrasi data lama).
  function normalize(s) {
    s.icon = s.icon || "📘"; s.color = s.color || "#4f46e5";
    s.level = s.level || "Umum";
    s.grade = typeof s.grade === "number" ? s.grade : 0;
    s.topics = s.topics || [];
    s.quiz = s.quiz || []; s.pairs = s.pairs || []; s.words = s.words || [];
    ["quiz", "pairs", "words"].forEach(function (k) {
      s[k].forEach(function (it) { if (it.topic == null) it.topic = ""; if (it.sub == null) it.sub = ""; });
    });
    return s;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(subjects)); } catch (e) {}
    scheduleServerSync();
  }
  function savePrefs() {
    try { localStorage.setItem(PREF, JSON.stringify(prefs)); } catch (e) {}
  }

  // Auto-simpan ke server (permanen) saat ada perubahan — HANYA jika admin login
  // dan berjalan lewat http/https (server). Debounce agar tidak sering menulis.
  var syncTimer = null, syncing = false;
  function scheduleServerSync() {
    if (location.protocol === "file:") return;
    if (!(window.Admin && Admin.isUnlocked && Admin.isUnlocked())) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(function () {
      if (syncing) { scheduleServerSync(); return; }
      syncing = true;
      saveToServer()
        .then(function () { if (window.UI) UI.toast("☁️ Tersimpan permanen", "good"); })
        .catch(function () { /* offline / bukan server: diabaikan */ })
        .then(function () { syncing = false; });
    }, 2500);
  }

  function getSubjects() { return subjects; }
  function getSubject(id) {
    return subjects.filter(function (s) { return s.id === id; })[0] || subjects[0];
  }
  function current() { return getSubject(prefs.subjectId); }
  function setCurrent(id) { prefs.subjectId = id; prefs.scopeTopic = null; prefs.scopeSub = null; savePrefs(); }

  /* -------- Cakupan materi (scope) -------- */
  function getScope() { return { topic: prefs.scopeTopic, sub: prefs.scopeSub }; }
  function setScope(topic, sub) { prefs.scopeTopic = topic || null; prefs.scopeSub = sub || null; savePrefs(); }
  function scopeLabel() {
    if (!prefs.scopeTopic) return "Semua Materi";
    return prefs.scopeTopic + (prefs.scopeSub ? " › " + prefs.scopeSub : "");
  }

  // Mapel turunan yang item-nya sudah disaring sesuai scope aktif.
  function scopedSubject() {
    var s = current(); if (!s) return s;
    if (!prefs.scopeTopic) return s;
    function filt(arr) {
      return arr.filter(function (it) {
        if (it.topic !== prefs.scopeTopic) return false;
        if (prefs.scopeSub && it.sub !== prefs.scopeSub) return false;
        return true;
      });
    }
    return {
      id: s.id, name: s.name, icon: s.icon, color: s.color, level: s.level, grade: s.grade, topics: s.topics,
      quiz: filt(s.quiz), pairs: filt(s.pairs), words: filt(s.words)
    };
  }

  function getSound() { return prefs.sound; }
  function setSound(v) { prefs.sound = !!v; savePrefs(); }

  function slug(name) {
    return (name || "mapel").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);
  }

  function addSubject(name, level, grade) {
    var colors = ["#4f46e5", "#0ea5e9", "#22c55e", "#f59e0b", "#f43f5e", "#a855f7", "#14b8a6"];
    var s = normalize({
      id: slug(name), name: name || "Mapel Baru", icon: "📘",
      color: colors[subjects.length % colors.length],
      level: level || "Umum", grade: grade || 0,
      quiz: [], pairs: [], words: []
    });
    subjects.push(s); save(); return s;
  }
  function updateSubject(id, patch) {
    var s = getSubject(id); if (!s) return; Object.assign(s, patch); save();
  }

  // Buat mapel dari katalog Kurikulum Merdeka (topics terisi, bank soal kosong).
  // Jika mapel dg nama+jenjang+kelas yg sama sudah ada, kembalikan yang itu.
  function createFromCatalog(level, grade, entry) {
    var exist = subjects.filter(function (x) {
      return x.name === entry.name && x.level === level && (x.grade || 0) === (grade || 0);
    })[0];
    if (exist) return exist;
    var s = normalize({
      id: slug(entry.name + "-" + level + "-" + grade),
      name: entry.name, icon: entry.icon || "📘", color: entry.color || "#4f46e5",
      level: level, grade: grade || 0,
      topics: JSON.parse(JSON.stringify(entry.topics || [])),
      quiz: [], pairs: [], words: []
    });
    subjects.push(s); save(); return s;
  }

  // Cek apakah mapel katalog sudah dibuat.
  function hasSubject(level, grade, name) {
    return subjects.some(function (x) {
      return x.name === name && x.level === level && (x.grade || 0) === (grade || 0);
    });
  }
  function deleteSubject(id) {
    subjects = subjects.filter(function (s) { return s.id !== id; });
    if (prefs.subjectId === id) prefs.subjectId = subjects[0] ? subjects[0].id : null;
    save(); savePrefs();
  }

  function resetDefaults() {
    subjects = clone(window.DEFAULT_SUBJECTS);
    subjects.forEach(normalize);
    prefs.subjectId = subjects[0].id;
    save(); savePrefs();
  }

  // Kunci unik item untuk deteksi duplikat.
  function itemKey(type, it) {
    if (type === "quiz") return "q:" + String(it.q || "").toLowerCase().replace(/\s+/g, " ").trim();
    if (type === "pairs") return "p:" + String(it.a || "").toLowerCase().trim() + "|" + String(it.b || "").toLowerCase().trim();
    return "w:" + String(it.word || "").toLowerCase().trim();
  }

  // Tambah item ke objek mapel, buang duplikat. Kembalikan jumlah yang ditambah.
  function pushDedupe(s, type, items) {
    if (!s || !items || !items.length) return 0;
    if (!s[type]) s[type] = [];
    var seen = {};
    s[type].forEach(function (it) { seen[itemKey(type, it)] = 1; });
    var added = 0;
    for (var i = 0; i < items.length; i++) {
      var k = itemKey(type, items[i]);
      if (k && seen[k]) continue;
      seen[k] = 1; s[type].push(items[i]); added++;
    }
    return added;
  }

  // Tambah item hasil generate ke sebuah mapel (otomatis buang duplikat).
  function addItems(subjectId, type, items) {
    var s = getSubject(subjectId);
    var n = pushDedupe(s, type, items);
    if (n) save();
    return n;
  }

  // Muat/gabungkan bank soal bawaan (window.SEED_BANK) ke koleksi mapel.
  function seedFromBank() {
    var seed = window.SEED_BANK;
    if (!seed || !seed.length) return 0;
    var added = 0;
    seed.forEach(function (ss) {
      var s = JSON.parse(JSON.stringify(ss));
      normalize(s);
      var ex = subjects.filter(function (x) {
        return x.id === s.id || (x.name === s.name && x.level === s.level && (x.grade || 0) === (s.grade || 0));
      })[0];
      if (!ex) { subjects.push(s); added += s.quiz.length + s.pairs.length + s.words.length; }
      else {
        if ((!ex.topics || !ex.topics.length) && s.topics && s.topics.length) ex.topics = s.topics;
        added += pushDedupe(ex, "quiz", s.quiz);
        added += pushDedupe(ex, "pairs", s.pairs);
        added += pushDedupe(ex, "words", s.words);
      }
    });
    save(); return added;
  }

  // Unduh bank soal saat ini sebagai file js/bank.js (untuk disalin ke semua browser).
  function exportBankJS() {
    var content = "/* EduGame Hub — Bank soal bawaan. Taruh sebagai EduGameHub/js/bank.js */\n" +
      "window.SEED_BANK = " + JSON.stringify(subjects) + ";\n";
    download(new Blob([content], { type: "application/javascript" }), "bank.js");
  }

  // Simpan bank langsung ke file js/bank.js lewat server (permanen, tanpa unduh manual).
  function saveToServer() {
    var key = "";
    try { key = sessionStorage.getItem("eduGameHub.adminKey") || ""; } catch (e) {}
    return fetch("/api/save-bank", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify(subjects)
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error("HTTP " + r.status + " " + t); });
      return r.json();
    });
  }

  // Konten untuk sebuah game. Bila data asli (pairs/words) kosong, TURUNKAN dari
  // bank Kuis agar 1x generate Kuis bisa dipakai semua jenis permainan.
  //   pairs (Mencocokkan/Memori) : jawaban benar  ↔  pertanyaan
  //   words (Tebak Kata)         : kata = jawaban benar (1 kata), petunjuk = pertanyaan
  function contentFor(subj, type) {
    var native = subj[type] || [];
    if (type === "quiz") return native;
    if (native.length >= 2) return native;
    var quiz = subj.quiz || [];
    if (type === "pairs") {
      return quiz.map(function (q) {
        var ans = (q.options && q.options[q.answer]) || "";
        var b = String(q.q || "").replace(/\s*\?\s*$/, "").trim();
        return { a: String(ans).trim(), b: b, topic: q.topic || "", sub: q.sub || "" };
      }).filter(function (p) { return p.a && p.b; });
    }
    if (type === "words") {
      return quiz.map(function (q) {
        var raw = String((q.options && q.options[q.answer]) || "");
        if (/\s/.test(raw)) return null; // lewati jawaban lebih dari satu kata
        var w = raw.toUpperCase().replace(/[^A-Z]/g, "");
        return { word: w, hint: q.hint || String(q.q || ""), topic: q.topic || "", sub: q.sub || "" };
      }).filter(function (w) { return w && w.word.length >= 3 && w.word.length <= 14; });
    }
    return native;
  }

  /* -------- Import / Export -------- */
  function exportJSON() {
    var blob = new Blob([JSON.stringify(subjects, null, 2)], { type: "application/json" });
    download(blob, "edugame-materi.json");
  }
  function download(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }

  function importJSON(text) {
    var data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error("Format JSON harus berupa array mapel.");
    data.forEach(function (s) {
      s.id = s.id || slug(s.name);
      normalize(s);
    });
    subjects = data;
    prefs.subjectId = subjects[0] ? subjects[0].id : null;
    save(); savePrefs();
  }

  /* CSV kuis: kolom -> pertanyaan,opsiA,opsiB,opsiC,opsiD,jawaban(1-4 atau A-D),petunjuk
     Diimpor ke mapel yang sedang aktif. */
  function importQuizCSV(text, subjectId) {
    var rows = parseCSV(text);
    var s = getSubject(subjectId); if (!s) return 0;
    var start = 0;
    // skip header jika baris pertama tidak berisi jawaban valid
    if (rows.length && /pertanyaan|question|soal/i.test(rows[0][0] || "")) start = 1;
    var added = 0;
    for (var i = start; i < rows.length; i++) {
      var r = rows[i]; if (!r || !r[0]) continue;
      var ans = String(r[5] || "1").trim().toUpperCase();
      var idx = "ABCD".indexOf(ans);
      if (idx < 0) idx = (parseInt(ans, 10) || 1) - 1;
      idx = Math.max(0, Math.min(3, idx));
      s.quiz.push({
        q: r[0], options: [r[1] || "", r[2] || "", r[3] || "", r[4] || ""],
        answer: idx, hint: r[6] || ""
      });
      added++;
    }
    save(); return added;
  }

  function parseCSV(text) {
    var rows = []; var row = []; var field = ""; var i = 0; var inQ = false;
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    while (i < text.length) {
      var c = text[i];
      if (inQ) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
        else field += c;
      } else {
        if (c === '"') inQ = true;
        else if (c === "," || c === ";") { row.push(field); field = ""; }
        else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
        else field += c;
      }
      i++;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (x) { return x && x.trim(); }); });
  }

  load();
  return {
    getSubjects: getSubjects, getSubject: getSubject, current: current, setCurrent: setCurrent,
    getScope: getScope, setScope: setScope, scopeLabel: scopeLabel, scopedSubject: scopedSubject,
    contentFor: contentFor,
    getSound: getSound, setSound: setSound,
    addSubject: addSubject, updateSubject: updateSubject, deleteSubject: deleteSubject,
    createFromCatalog: createFromCatalog, hasSubject: hasSubject,
    resetDefaults: resetDefaults, save: save, addItems: addItems,
    seedFromBank: seedFromBank, exportBankJS: exportBankJS, saveToServer: saveToServer,
    exportJSON: exportJSON, importJSON: importJSON, importQuizCSV: importQuizCSV, download: download
  };
})();
