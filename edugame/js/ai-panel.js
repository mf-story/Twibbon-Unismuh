/* =========================================================================
   EduGame Hub — AI Panel (ai-panel.js)
   Dialog pengaturan API AI + dialog generate bank soal.
   ========================================================================= */
window.AIPanel = (function () {
  var TYPE_LABEL = { quiz: "Kuis Pilihan Ganda", pairs: "Pasangan (Mencocokkan/Memori)", words: "Kata (Tebak Kata)" };

  function modal(innerHTML) {
    var back = document.createElement("div");
    back.className = "modal-backdrop";
    back.innerHTML = '<div class="modal" style="max-width:640px">' + innerHTML + '</div>';
    document.body.appendChild(back);
    back.close = function () { back.remove(); };
    back.addEventListener("click", function (e) { if (e.target === back) back.close(); });
    var x = back.querySelector(".modal-close");
    if (x) x.addEventListener("click", back.close);
    return back;
  }

  /* ---------- Pengaturan API ---------- */
  function settings(afterSave) {
    var cfg = AI.getConfig();
    var provOpts = Object.keys(AI.PROVIDERS).map(function (k) {
      return '<option value="' + k + '"' + (cfg.provider === k ? " selected" : "") + '>' + UI.esc(AI.PROVIDERS[k].label) + '</option>';
    }).join("");

    var back = modal(
      '<div class="modal-head"><h2>⚙️ Pengaturan AI</h2><button class="modal-close">×</button></div>' +
      '<div class="modal-body">' +
        '<div class="warn-box" style="margin:0 0 18px;text-align:left">🔒 API key disimpan <b>lokal</b> di browser perangkat ini saja, tidak dikirim ke mana pun kecuali ke penyedia AI yang Anda pilih.</div>' +
        '<label class="fld-lbl">Penyedia</label>' +
        '<select class="fld" id="aiProv" style="margin-bottom:14px">' + provOpts + '</select>' +
        '<label class="fld-lbl">Base URL</label>' +
        '<input class="fld" id="aiBase" value="' + UI.esc(cfg.baseUrl) + '" style="margin-bottom:14px">' +
        '<label class="fld-lbl">Model</label>' +
        '<input class="fld" id="aiModel" value="' + UI.esc(cfg.model) + '" placeholder="mis. gpt-4o-mini / gemini-1.5-flash" style="margin-bottom:14px">' +
        '<label class="fld-lbl">API Key</label>' +
        '<input class="fld" id="aiKey" type="password" value="' + UI.esc(cfg.apiKey) + '" placeholder="Tempel API key di sini" style="margin-bottom:8px" autocomplete="off">' +
        '<div class="page-sub" style="font-size:14px" id="aiHint"></div>' +
        '<div class="btn-row" style="justify-content:space-between;margin-top:20px">' +
          '<button class="btn btn-ghost" id="aiTest">🔍 Uji Koneksi</button>' +
          '<div class="btn-row">' +
            '<button class="btn btn-ghost" id="aiCancel">Batal</button>' +
            '<button class="btn btn-primary" id="aiSave">💾 Simpan</button>' +
          '</div>' +
        '</div>' +
        '<div id="aiTestMsg" class="page-sub" style="min-height:20px;margin-top:10px;font-size:14px"></div>' +
      '</div>'
    );

    function hint() {
      var p = back.querySelector("#aiProv").value;
      back.querySelector("#aiHint").innerHTML = p === "gemini"
        ? 'Dapatkan API key gratis di <b>aistudio.google.com/apikey</b>. Model: <b>gemini-2.0-flash</b> (atau gemini-2.5-flash / gemini-1.5-flash).'
        : 'Kompatibel OpenAI. Contoh: OpenAI (api.openai.com/v1), OpenRouter (openrouter.ai/api/v1), Groq (api.groq.com/openai/v1), atau server lokal.';
    }
    hint();
    back.querySelector("#aiProv").addEventListener("change", function (e) {
      var p = AI.PROVIDERS[e.target.value];
      back.querySelector("#aiBase").value = p.baseUrl;
      back.querySelector("#aiModel").value = p.model;
      hint();
    });
    // Simpan sementara lalu coba 1 permintaan kecil untuk cek koneksi/kunci.
    back.querySelector("#aiTest").addEventListener("click", function () {
      var prov = back.querySelector("#aiProv").value;
      var def = AI.PROVIDERS[prov] || AI.PROVIDERS.openai;
      AI.setConfig({
        provider: prov,
        baseUrl: back.querySelector("#aiBase").value.trim() || def.baseUrl,
        model: back.querySelector("#aiModel").value.trim() || def.model,
        apiKey: back.querySelector("#aiKey").value.trim()
      });
      var msg = back.querySelector("#aiTestMsg");
      if (!back.querySelector("#aiKey").value.trim()) { msg.innerHTML = '<span style="color:var(--rose)">Isi API key dulu.</span>'; return; }
      msg.innerHTML = "⏳ Menguji koneksi ke AI...";
      AI.generate({ type: "quiz", topic: "tes koneksi", count: 1, level: "Umum", grade: 0, subjectName: "Tes" })
        .then(function () { msg.innerHTML = '<span style="color:var(--green)">✅ Berhasil! Koneksi & API key valid.</span>'; UI.sfx.correct(); })
        .catch(function (err) { msg.innerHTML = '<span style="color:var(--rose)">❌ ' + UI.esc(err.message) + '</span>'; });
    });
    back.querySelector("#aiCancel").addEventListener("click", back.close);
    back.querySelector("#aiSave").addEventListener("click", function () {
      var prov = back.querySelector("#aiProv").value;
      var def = AI.PROVIDERS[prov] || AI.PROVIDERS.openai;
      AI.setConfig({
        provider: prov,
        baseUrl: back.querySelector("#aiBase").value.trim() || def.baseUrl,
        model: back.querySelector("#aiModel").value.trim() || def.model,
        apiKey: back.querySelector("#aiKey").value.trim()
      });
      back.close(); UI.toast("Pengaturan AI tersimpan", "good");
      if (afterSave) afterSave();
    });
    return back;
  }

  /* ---------- Generate bank soal ---------- */
  function generate(subjectId, defaultType, onDone) {
    var s = Store.getSubject(subjectId);
    if (!AI.isReady()) {
      UI.toast("Lengkapi Pengaturan AI dulu ⚙️", "bad");
      settings(function () { generate(subjectId, defaultType, onDone); });
      return;
    }
    var typeOpts = ["quiz", "pairs", "words"].map(function (t) {
      return '<option value="' + t + '"' + (t === defaultType ? " selected" : "") + '>' + TYPE_LABEL[t] + '</option>';
    }).join("");
    var lvl = window.gradeLabel(s.level, s.grade);
    var scope = Store.getScope();
    var topicOpts = '<option value="">— Tanpa materi —</option>' +
      ((s.topics || []).length ? '<option value="__ALL__">📚 Semua materi</option>' : '') +
      (s.topics || []).map(function (t) {
      return '<option value="' + UI.esc(t.name) + '"' + (scope.topic === t.name ? " selected" : "") + '>' + UI.esc(t.name) + '</option>';
    }).join("");

    var back = modal(
      '<div class="modal-head"><h2>🤖 Buat Soal dengan AI</h2><button class="modal-close">×</button></div>' +
      '<div class="modal-body">' +
        '<div class="page-sub" style="margin-bottom:16px">Mapel <b>' + UI.esc(s.icon + " " + s.name) + '</b> · <b>' + UI.esc(s.level) + '</b> · ' + UI.esc(lvl) + '</div>' +
        '<label class="fld-lbl">Jenis materi</label>' +
        '<select class="fld" id="gType" style="margin-bottom:14px">' + typeOpts + '</select>' +
        '<div class="ed-grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">' +
          '<div><label class="fld-lbl">📂 Materi (Kurikulum Merdeka)</label>' +
            '<select class="fld" id="gTopic">' + topicOpts + '</select></div>' +
          '<div><label class="fld-lbl">Sub-materi</label>' +
            '<select class="fld" id="gSub"></select></div>' +
        '</div>' +
        '<label class="fld-lbl">Topik/detail tambahan (opsional)</label>' +
        '<input class="fld" id="gTopic2" placeholder="mis. soal cerita, tingkat mudah..." style="margin-bottom:14px">' +
        '<label class="fld-lbl">Jumlah soal</label>' +
        '<select class="fld" id="gCount" style="margin-bottom:8px">' +
          [5, 10, 15, 20, 30, 50].map(function (n) { return '<option value="' + n + '"' + (n === 10 ? " selected" : "") + '>' + n + ' soal</option>'; }).join("") +
        '</select>' +
        '<div id="gStatus" class="page-sub" style="min-height:24px;margin-top:8px"></div>' +
        '<div class="btn-row" style="justify-content:space-between;margin-top:16px">' +
          '<button class="btn btn-ghost" id="gCfg">⚙️ Pengaturan</button>' +
          '<div class="btn-row">' +
            '<button class="btn btn-ghost" id="gCancel">Batal</button>' +
            '<button class="btn btn-primary" id="gRun">✨ Generate</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );

    function fillSubs() {
      var tName = back.querySelector("#gTopic").value;
      var subSel = back.querySelector("#gSub");
      if (tName === "__ALL__") {
        subSel.innerHTML = '<option value="">— Semua sub —</option>';
        subSel.disabled = true;
        return;
      }
      subSel.disabled = false;
      var t = (s.topics || []).filter(function (x) { return x.name === tName; })[0];
      var subs = t ? (t.subs || []) : [];
      subSel.innerHTML = '<option value="">— Umum —</option>' + subs.map(function (su) {
        return '<option value="' + UI.esc(su) + '"' + (scope.sub === su ? " selected" : "") + '>' + UI.esc(su) + '</option>';
      }).join("");
    }
    fillSubs();
    back.querySelector("#gTopic").addEventListener("change", fillSubs);

    back.querySelector("#gCfg").addEventListener("click", function () { settings(); });
    back.querySelector("#gCancel").addEventListener("click", back.close);
    back.querySelector("#gRun").addEventListener("click", function () {
      var type = back.querySelector("#gType").value;
      var materi = back.querySelector("#gTopic").value;
      var sub = back.querySelector("#gSub").value;
      var extra = back.querySelector("#gTopic2").value.trim();
      var count = parseInt(back.querySelector("#gCount").value, 10) || 10;
      var status = back.querySelector("#gStatus");
      var run = back.querySelector("#gRun");
      var isAll = materi === "__ALL__";
      run.disabled = true; run.textContent = "⏳ Membuat...";
      status.innerHTML = '⏳ Menghubungi AI dan menyusun ' + count + ' soal...';

      var gen;
      if (isAll) {
        var topics = (s.topics || []).map(function (t) { return t.name; });
        var per = Math.max(1, Math.round(count / topics.length));
        var collected = [], i = 0;
        gen = (function nextTopic() {
          if (i >= topics.length) return Promise.resolve(collected);
          var tName = topics[i++];
          status.innerHTML = '⏳ Materi ' + i + '/' + topics.length + ': ' + UI.esc(tName) + '... (' + collected.length + ' soal)';
          var tp = [tName, extra].filter(Boolean).join(" — ");
          return AI.generateMany({ type: type, topic: tp, count: per, level: s.level, grade: s.grade, subjectName: s.name })
            .then(function (items) {
              items.forEach(function (it) { it.topic = tName; it.sub = ""; });
              collected = collected.concat(items);
              return nextTopic();
            });
        })();
      } else {
        var topic = [materi, sub, extra].filter(Boolean).join(" — ") || s.name;
        gen = count > 20
          ? AI.generateMany({ type: type, topic: topic, count: count, level: s.level, grade: s.grade, subjectName: s.name },
              function (got, tgt) { status.innerHTML = '⏳ Membuat soal... ' + got + '/' + tgt; })
          : AI.generate({ type: type, topic: topic, count: count, level: s.level, grade: s.grade, subjectName: s.name });
      }

      gen
        .then(function (items) {
          if (!items.length) throw new Error("AI tidak menghasilkan soal yang valid. Coba lagi atau ganti topik.");
          if (!isAll) items.forEach(function (it) { it.topic = materi; it.sub = sub; });
          var n = Store.addItems(s.id, type, items);
          UI.sfx.win(); UI.toast(n + " " + TYPE_LABEL[type] + " ditambahkan!", "good");
          back.close();
          if (onDone) onDone();
        })
        .catch(function (err) {
          run.disabled = false; run.textContent = "✨ Generate";
          status.innerHTML = '<span style="color:var(--rose)">⚠️ ' + UI.esc(err.message) + '</span>';
        });
    });
    return back;
  }

  /* ---------- Generate BANK DEFAULT (banyak soal per materi/sub) ---------- */
  function bank(subjectId, onDone) {
    var s = Store.getSubject(subjectId);
    if (!AI.isReady()) {
      UI.toast("Lengkapi Pengaturan AI dulu ⚙️", "bad");
      settings(function () { bank(subjectId, onDone); });
      return;
    }
    // Susun unit = tiap sub-materi (atau materi bila tak punya sub).
    function buildUnits() {
      var units = [];
      (s.topics || []).forEach(function (tp) {
        if (tp.subs && tp.subs.length) tp.subs.forEach(function (su) { units.push({ topic: tp.name, sub: su }); });
        else units.push({ topic: tp.name, sub: "" });
      });
      return units;
    }
    var units = buildUnits();
    if (!units.length) { UI.toast("Mapel ini belum punya materi. Tambah materi dulu.", "bad"); return; }

    var typeOpts = ["quiz", "pairs", "words"].map(function (t) {
      return '<option value="' + t + '">' + TYPE_LABEL[t] + '</option>';
    }).join("");

    var back = modal(
      '<div class="modal-head"><h2>🏦 Bank Soal Default</h2><button class="modal-close">×</button></div>' +
      '<div class="modal-body">' +
        '<div class="page-sub" style="margin-bottom:14px">Mapel <b>' + UI.esc(s.icon + " " + s.name) + '</b> · ' + UI.esc(window.gradeLabel(s.level, s.grade)) + ' · <b>' + units.length + '</b> sub-materi</div>' +
        '<div class="ed-grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">' +
          '<div><label class="fld-lbl">Jenis soal</label><select class="fld" id="bType">' + typeOpts + '</select></div>' +
          '<div><label class="fld-lbl">Jumlah per sub-materi</label><select class="fld" id="bCount">' +
            [25, 50, 75, 100].map(function (n) { return '<option value="' + n + '"' + (n === 50 ? " selected" : "") + '>' + n + ' soal</option>'; }).join("") +
          '</select></div>' +
        '</div>' +
        '<div class="warn-box" style="margin:0 0 14px;text-align:left" id="bEst"></div>' +
        '<div id="bProg" class="bank-prog"></div>' +
        '<div class="btn-row" style="justify-content:space-between;margin-top:8px">' +
          '<button class="btn btn-ghost" id="bCfg">⚙️ Pengaturan</button>' +
          '<div class="btn-row">' +
            '<button class="btn btn-ghost" id="bClose2">Tutup</button>' +
            '<button class="btn btn-primary" id="bRun">🚀 Mulai Generate</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );

    function updateEst() {
      var n = parseInt(back.querySelector("#bCount").value, 10);
      back.querySelector("#bEst").innerHTML = "⏱️ Perkiraan <b>" + (units.length * n) + " soal</b> (" + units.length +
        " sub-materi × " + n + "). Proses memakai banyak panggilan AI dan bisa lama — biarkan jendela terbuka. Bisa dihentikan kapan saja.";
    }
    updateEst();
    back.querySelector("#bCount").addEventListener("change", updateEst);
    back.querySelector("#bCfg").addEventListener("click", function () { settings(); });
    back.querySelector("#bClose2").addEventListener("click", back.close);

    var running = false, stopFlag = false;
    back.querySelector("#bRun").addEventListener("click", function () {
      if (running) { stopFlag = true; back.querySelector("#bRun").textContent = "⏳ Menghentikan..."; return; }
      running = true; stopFlag = false;
      var type = back.querySelector("#bType").value;
      var per = parseInt(back.querySelector("#bCount").value, 10);
      back.querySelector("#bType").disabled = true;
      back.querySelector("#bCount").disabled = true;
      back.querySelector("#bRun").textContent = "⏹️ Hentikan";
      var prog = back.querySelector("#bProg");
      prog.innerHTML = units.map(function (u, i) {
        return '<div class="bank-row" id="brow' + i + '"><span class="bank-lbl">' + UI.esc(u.topic + (u.sub ? " › " + u.sub : "")) + '</span>' +
          '<span class="bank-stat" id="bstat' + i + '">menunggu…</span></div>';
      }).join("");

      var totalAdded = 0;
      var chain = Promise.resolve();
      units.forEach(function (u, i) {
        chain = chain.then(function () {
          if (stopFlag) { setStat(i, "⏭️ dilewati", "muted"); return; }
          setStat(i, "⏳ membuat…", "run");
          var topicText = u.topic + (u.sub ? " — " + u.sub : "");
          return AI.generateMany(
            { type: type, topic: topicText, level: s.level, grade: s.grade, subjectName: s.name, count: per },
            function (got, tgt) { setStat(i, "⏳ " + got + "/" + tgt, "run"); },
            function () { return stopFlag; }
          ).then(function (items) {
            items.forEach(function (it) { it.topic = u.topic; it.sub = u.sub; });
            var n = Store.addItems(s.id, type, items);
            totalAdded += n;
            setStat(i, "✅ " + n + " soal", "ok");
          }).catch(function (err) {
            setStat(i, "⚠️ " + (err.message || "gagal"), "bad");
          });
        });
      });
      chain.then(function () {
        running = false;
        UI.sfx.win(); UI.confetti(60);
        UI.toast("Selesai! " + totalAdded + " soal ditambahkan ke " + s.name, "good");
        back.querySelector("#bRun").textContent = "✅ Selesai";
        back.querySelector("#bRun").disabled = true;
        if (onDone) onDone();
      });

      function setStat(i, txt, cls) {
        var el = back.querySelector("#bstat" + i);
        if (el) { el.textContent = txt; el.className = "bank-stat " + (cls || ""); }
      }
    });
    return back;
  }

  return { settings: settings, generate: generate, bank: bank, bulk: bulk };

  /* ---------- Generate MASSAL seluruh katalog ---------- */
  function bulk(onDone) {
    if (!window.CURRICULUM) { UI.toast("Katalog kurikulum tidak tersedia.", "bad"); return; }
    if (!AI.isReady()) {
      UI.toast("Lengkapi Pengaturan AI dulu ⚙️", "bad");
      settings(function () { bulk(onDone); });
      return;
    }
    var jenjangOpts = '<option value="all">Semua Jenjang</option>' +
      Object.keys(window.CURRICULUM).map(function (lv) { return '<option value="' + lv + '">' + lv + '</option>'; }).join("");

    var back = modal(
      '<div class="modal-head"><h2>🌐 Generate Massal (Seluruh Katalog)</h2><button class="modal-close">×</button></div>' +
      '<div class="modal-body">' +
        '<div class="ed-grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">' +
          '<div><label class="fld-lbl">Jenjang</label><select class="fld" id="buLv">' + jenjangOpts + '</select></div>' +
          '<div><label class="fld-lbl">Kelas</label><select class="fld" id="buGr"><option value="all">Semua Kelas</option></select></div>' +
        '</div>' +
        '<div class="ed-grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">' +
          '<div><label class="fld-lbl">Jenis soal</label><select class="fld" id="buType">' +
            '<option value="quiz">Kuis Pilihan Ganda</option><option value="pairs">Pasangan</option><option value="words">Kata</option></select></div>' +
          '<div><label class="fld-lbl">Jumlah per sub-materi</label><select class="fld" id="buCount">' +
            [5, 10, 25, 50].map(function (n) { return '<option value="' + n + '"' + (n === 10 ? " selected" : "") + '>' + n + ' soal</option>'; }).join("") +
          '</select></div>' +
        '</div>' +
        '<label class="opt-radio" style="margin-bottom:10px"><input type="checkbox" id="buSkip" checked style="width:22px;height:22px;accent-color:var(--accent)"> <span>Lewati sub-materi yang sudah terisi (untuk melanjutkan sesi sebelumnya)</span></label>' +
        '<div class="warn-box" style="margin:0 0 12px;text-align:left" id="buEst"></div>' +
        '<div id="buOverall" class="page-sub" style="font-weight:700;min-height:22px"></div>' +
        '<div class="progress-track" style="margin-bottom:10px"><div class="progress-fill" id="buBar" style="width:0%"></div></div>' +
        '<div id="buLog" class="bank-prog" style="max-height:220px"></div>' +
        '<div class="btn-row" style="justify-content:space-between;margin-top:12px">' +
          '<button class="btn btn-ghost" id="buCfg">⚙️ Pengaturan</button>' +
          '<div class="btn-row">' +
            '<button class="btn btn-ghost" id="buClose2">Tutup</button>' +
            '<button class="btn btn-primary" id="buRun">🚀 Mulai</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );

    function fillGrades() {
      var lv = back.querySelector("#buLv").value;
      var gsel = back.querySelector("#buGr");
      if (lv === "all") { gsel.innerHTML = '<option value="all">Semua Kelas</option>'; gsel.disabled = true; return; }
      gsel.disabled = false;
      var grades = Object.keys(window.CURRICULUM[lv] || {});
      gsel.innerHTML = '<option value="all">Semua Kelas</option>' +
        grades.map(function (g) { return '<option value="' + g + '">Kelas ' + g + '</option>'; }).join("");
    }
    fillGrades();
    back.querySelector("#buLv").addEventListener("change", function () { fillGrades(); updateEst(); });
    back.querySelector("#buGr").addEventListener("change", updateEst);
    back.querySelector("#buCount").addEventListener("change", updateEst);

    // Bangun daftar unit (mapel + materi + sub) sesuai lingkup.
    function buildTasks() {
      var lv = back.querySelector("#buLv").value;
      var gr = back.querySelector("#buGr").value;
      var levels = lv === "all" ? Object.keys(window.CURRICULUM) : [lv];
      var tasks = [];
      levels.forEach(function (L) {
        var grades = gr === "all" || lv === "all" ? Object.keys(window.CURRICULUM[L]) : [gr];
        grades.forEach(function (g) {
          (window.CURRICULUM[L][g] || []).forEach(function (entry) {
            (entry.topics || []).forEach(function (tp) {
              if (tp.subs && tp.subs.length) tp.subs.forEach(function (su) { tasks.push({ level: L, grade: parseInt(g, 10), entry: entry, topic: tp.name, sub: su }); });
              else tasks.push({ level: L, grade: parseInt(g, 10), entry: entry, topic: tp.name, sub: "" });
            });
          });
        });
      });
      return tasks;
    }

    function updateEst() {
      var tasks = buildTasks();
      var per = parseInt(back.querySelector("#buCount").value, 10);
      var total = tasks.length * per;
      back.querySelector("#buEst").innerHTML = "⏱️ <b>" + tasks.length + "</b> sub-materi × " + per + " = perkiraan <b>" + total + " soal</b>. " +
        "Proses SANGAT panjang & memakai banyak kuota AI (Gemini gratis dibatasi ±15/menit & 1.500/hari). " +
        "Ada jeda otomatis antar panggilan. Anda bisa <b>Hentikan</b> kapan saja lalu lanjutkan lain waktu (centang \"Lewati yang sudah terisi\").";
    }
    updateEst();

    back.querySelector("#buCfg").addEventListener("click", function () { settings(); });
    back.querySelector("#buClose2").addEventListener("click", back.close);

    var running = false, stopFlag = false;
    back.querySelector("#buRun").addEventListener("click", function () {
      if (running) { stopFlag = true; back.querySelector("#buRun").textContent = "⏳ Menghentikan..."; return; }
      var tasks = buildTasks();
      if (!tasks.length) { UI.toast("Tidak ada materi pada lingkup ini.", "bad"); return; }
      running = true; stopFlag = false;
      var type = back.querySelector("#buType").value;
      var per = parseInt(back.querySelector("#buCount").value, 10);
      var skip = back.querySelector("#buSkip").checked;
      ["#buLv", "#buGr", "#buType", "#buCount", "#buSkip"].forEach(function (id) { var el = back.querySelector(id); if (el) el.disabled = true; });
      back.querySelector("#buRun").textContent = "⏹️ Hentikan";
      var log = back.querySelector("#buLog");
      var overall = back.querySelector("#buOverall");
      var bar = back.querySelector("#buBar");

      var done = 0, added = 0, skipped = 0;
      function logLine(txt, cls) {
        var row = document.createElement("div");
        row.className = "bank-row";
        row.innerHTML = '<span class="bank-lbl">' + txt + '</span><span class="bank-stat ' + (cls || "") + '"></span>';
        log.insertBefore(row, log.firstChild);
        while (log.childElementCount > 60) log.removeChild(log.lastChild);
      }
      function setOverall() {
        overall.textContent = "Progres: " + done + "/" + tasks.length + " sub-materi · " + added + " soal dibuat" + (skipped ? " · " + skipped + " dilewati" : "");
        bar.style.width = Math.round((done / tasks.length) * 100) + "%";
      }
      setOverall();

      var chain = Promise.resolve();
      tasks.forEach(function (tk) {
        chain = chain.then(function () {
          if (stopFlag) return;
          var s = Store.createFromCatalog(tk.level, tk.grade, tk.entry);
          var label = tk.entry.name + " · " + tk.level + " " + tk.grade + " · " + tk.topic + (tk.sub ? " › " + tk.sub : "");
          if (skip) {
            var existing = (s[type] || []).filter(function (it) { return it.topic === tk.topic && it.sub === tk.sub; }).length;
            if (existing >= per) { skipped++; done++; logLine("⏭️ " + label + " (sudah ada " + existing + ")", "muted"); setOverall(); return; }
          }
          logLine("⏳ " + label, "run");
          var topicText = tk.topic + (tk.sub ? " — " + tk.sub : "");
          return AI.generateMany(
            { type: type, topic: topicText, level: tk.level, grade: tk.grade, subjectName: tk.entry.name, count: per, delayMs: 1500 },
            null,
            function () { return stopFlag; }
          ).then(function (items) {
            items.forEach(function (it) { it.topic = tk.topic; it.sub = tk.sub; });
            var n = Store.addItems(s.id, type, items);
            added += n; done++;
            var first = log.querySelector(".bank-row .bank-lbl");
            if (first) { first.textContent = "✅ " + label + " (+" + n + ")"; first.parentNode.querySelector(".bank-stat").className = "bank-stat ok"; }
            setOverall();
          }).catch(function (err) {
            done++;
            var first = log.querySelector(".bank-row .bank-lbl");
            if (first) { first.textContent = "⚠️ " + label + " — " + (err.message || "gagal"); first.parentNode.querySelector(".bank-stat").className = "bank-stat bad"; }
            setOverall();
          });
        });
      });
      chain.then(function () {
        running = false;
        UI.sfx.win(); if (!stopFlag) UI.confetti(80);
        UI.toast((stopFlag ? "Dihentikan. " : "Selesai! ") + added + " soal dibuat.", "good");
        var r = back.querySelector("#buRun");
        r.textContent = stopFlag ? "🚀 Lanjutkan" : "✅ Selesai";
        r.disabled = false; running = false; stopFlag = false;
        ["#buLv", "#buGr", "#buType", "#buCount", "#buSkip"].forEach(function (id) { var el = back.querySelector(id); if (el) el.disabled = false; });
        fillGrades();
        if (onDone) onDone();
      });
    });
    return back;
  }
})();
