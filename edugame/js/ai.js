/* =========================================================================
   EduGame Hub — AI Generator (ai.js)
   Generate bank soal (kuis / pasangan / kata) memakai API AI.
   Mendukung dua jenis endpoint:
     - "openai"  : OpenAI-compatible /chat/completions
                   (OpenAI, OpenRouter, Groq, Together, LM Studio/Ollama lokal)
     - "gemini"  : Google Gemini generateContent
   Konfigurasi (termasuk API key) disimpan LOKAL di browser perangkat ini.
   ========================================================================= */
window.AI = (function () {
  var CFG = "eduGameHub.ai.v1";

  var PROVIDERS = {
    openai: {
      label: "OpenAI-compatible (OpenAI / OpenRouter / Groq / lokal)",
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-4o-mini"
    },
    gemini: {
      label: "Google Gemini",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      model: "gemini-2.0-flash"
    }
  };

  function getConfig() {
    var def = { provider: "openai", baseUrl: PROVIDERS.openai.baseUrl, apiKey: "", model: PROVIDERS.openai.model };
    var cfg = def;
    try {
      var raw = localStorage.getItem(CFG);
      if (raw) cfg = Object.assign(def, JSON.parse(raw));
    } catch (e) {}
    // Isi otomatis bila Base URL / Model kosong, sesuai penyedia yang dipilih.
    var prov = PROVIDERS[cfg.provider] || PROVIDERS.openai;
    if (!cfg.baseUrl || !cfg.baseUrl.trim()) cfg.baseUrl = prov.baseUrl;
    if (!cfg.model || !cfg.model.trim()) cfg.model = prov.model;
    return cfg;
  }
  function setConfig(cfg) {
    try { localStorage.setItem(CFG, JSON.stringify(cfg)); } catch (e) {}
  }
  function isReady() { return !!(getConfig().apiKey && getConfig().model); }

  /* -------- Prompt builder -------- */
  function buildPrompt(o) {
    var jenjang = o.level && o.level !== "Umum" ? o.level : "umum (fleksibel)";
    var kelas = o.grade ? "kelas " + o.grade : "tanpa kelas khusus";
    var audience = "peserta didik jenjang " + jenjang + " " + kelas;
    var n = o.count;
    var topic = o.topic || o.subjectName;
    var schema, contoh;

    if (o.type === "quiz") {
      schema = '[{"q":"pertanyaan","options":["A","B","C","D"],"answer":<index 0-3 jawaban benar>,"hint":"petunjuk singkat"}]';
      contoh = 'Setiap soal WAJIB 4 opsi, tepat satu benar, "answer" = index (0-3) opsi benar.';
    } else if (o.type === "pairs") {
      schema = '[{"a":"istilah","b":"pasangan/definisi singkat"}]';
      contoh = 'Buat pasangan istilah dengan definisi/pasangannya yang singkat (maksimal 4 kata pada "b").';
    } else {
      schema = '[{"word":"KATA","hint":"petunjuk"}]';
      contoh = '"word" HARUS satu kata, huruf kapital A-Z tanpa spasi/angka/tanda baca (untuk game tebak kata).';
    }

    return "Anda pembuat soal pendidikan berbahasa Indonesia. Buat " + n +
      " item materi \"" + topic + "\" untuk mata pelajaran \"" + o.subjectName + "\", cocok untuk " + audience + ". " +
      contoh + " Gunakan bahasa yang sesuai tingkat " + audience + ". " +
      (o.variety ? "Buat soal yang BERVARIASI dan BERBEDA, hindari pengulangan soal yang umum. " : "") +
      "Jawab HANYA dengan JSON array valid (tanpa penjelasan, tanpa markdown, tanpa teks lain) sesuai skema: " + schema;
  }

  /* -------- Public: generate -------- */
  function generate(o) {
    var cfg = getConfig();
    if (!cfg.apiKey) return Promise.reject(new Error("API key belum diisi. Buka Pengaturan AI."));
    var prompt = buildPrompt(o);
    var call = cfg.provider === "gemini" ? callGemini : callOpenAI;
    return call(cfg, prompt).then(function (text) {
      var arr = parseJSONArray(text);
      return sanitize(arr, o.type).slice(0, o.count);
    });
  }

  // Generate banyak soal dengan beberapa panggilan (batch), dedupe by teks.
  // onProgress(collected, target). Berhenti bila stopFn() true. o.delayMs = jeda antar panggilan.
  function generateMany(o, onProgress, stopFn) {
    var target = o.count || 50;
    var perCall = Math.min(target, o.type === "quiz" ? 15 : 20);
    var collected = [], seen = {};
    var attempts = 0, maxAttempts = Math.ceil(target / perCall) + 5;
    function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    function keyOf(it) {
      if (o.type === "quiz") return String(it.q || "").toLowerCase().replace(/\s+/g, " ").trim();
      if (o.type === "pairs") return String(it.a || "").toLowerCase().trim();
      return String(it.word || "").toLowerCase();
    }
    function step() {
      if (collected.length >= target || attempts >= maxAttempts || (stopFn && stopFn())) {
        return Promise.resolve(collected.slice(0, target));
      }
      attempts++;
      var need = Math.min(perCall, target - collected.length);
      return generate({
        type: o.type, topic: o.topic, level: o.level, grade: o.grade,
        subjectName: o.subjectName, count: need, variety: true
      }).then(function (items) {
        items.forEach(function (it) { var k = keyOf(it); if (k && !seen[k]) { seen[k] = 1; collected.push(it); } });
        if (onProgress) onProgress(Math.min(collected.length, target), target);
        if (collected.length >= target || (stopFn && stopFn())) return collected.slice(0, target);
        return (o.delayMs ? wait(o.delayMs) : Promise.resolve()).then(step);
      });
    }
    return step();
  }

  /* -------- OpenAI-compatible -------- */
  function callOpenAI(cfg, prompt) {
    var url = cfg.baseUrl.replace(/\/$/, "") + "/chat/completions";
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + cfg.apiKey },
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0.7,
        messages: [
          { role: "system", content: "Anda asisten pembuat soal pendidikan. Selalu balas JSON array valid saja." },
          { role: "user", content: prompt }
        ]
      })
    }).then(handleResp).then(function (data) {
      var c = data.choices && data.choices[0];
      return (c && c.message && c.message.content) || "";
    });
  }

  /* -------- Google Gemini -------- */
  function callGemini(cfg, prompt) {
    var base = cfg.baseUrl.replace(/\/$/, "");
    var url = base + "/models/" + encodeURIComponent(cfg.model) + ":generateContent?key=" + encodeURIComponent(cfg.apiKey);
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
      })
    }).then(handleResp).then(function (data) {
      var cand = data.candidates && data.candidates[0];
      var parts = cand && cand.content && cand.content.parts;
      return (parts && parts[0] && parts[0].text) || "";
    });
  }

  function handleResp(r) {
    return r.text().then(function (body) {
      if (!r.ok) {
        var msg = body;
        try { var j = JSON.parse(body); msg = (j.error && (j.error.message || j.error)) || body; } catch (e) {}
        throw new Error("API " + r.status + ": " + String(msg).slice(0, 200));
      }
      try { return JSON.parse(body); } catch (e) { throw new Error("Respons API tidak valid."); }
    });
  }

  /* -------- Parsing & sanitasi -------- */
  function parseJSONArray(text) {
    if (!text) throw new Error("AI tidak mengembalikan konten.");
    var t = String(text).trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    try { var d = JSON.parse(t); return Array.isArray(d) ? d : (d.items || d.data || d.soal || []); }
    catch (e) {}
    var m = t.match(/\[[\s\S]*\]/); // ambil array pertama
    if (m) { try { return JSON.parse(m[0]); } catch (e2) {} }
    throw new Error("Gagal membaca JSON dari respons AI.");
  }

  function sanitize(arr, type) {
    if (!Array.isArray(arr)) return [];
    var out = [];
    arr.forEach(function (it) {
      if (!it || typeof it !== "object") return;
      if (type === "quiz") {
        var opts = it.options || it.opsi || it.choices || [];
        if (!Array.isArray(opts) || opts.length < 2 || !it.q) return;
        opts = opts.slice(0, 4).map(function (x) { return String(x); });
        while (opts.length < 4) opts.push("");
        var ans = parseInt(it.answer != null ? it.answer : it.jawaban, 10);
        if (isNaN(ans) || ans < 0 || ans > 3) ans = 0;
        out.push({ q: String(it.q || it.pertanyaan), options: opts, answer: ans, hint: String(it.hint || it.petunjuk || "") });
      } else if (type === "pairs") {
        var a = it.a || it.istilah || it.term, b = it.b || it.pasangan || it.definisi || it.def;
        if (!a || !b) return;
        out.push({ a: String(a), b: String(b) });
      } else {
        var w = String(it.word || it.kata || "").toUpperCase().replace(/[^A-Z]/g, "");
        if (w.length < 2) return;
        out.push({ word: w, hint: String(it.hint || it.petunjuk || "") });
      }
    });
    return out;
  }

  return {
    PROVIDERS: PROVIDERS,
    getConfig: getConfig, setConfig: setConfig, isReady: isReady, generate: generate, generateMany: generateMany
  };
})();
