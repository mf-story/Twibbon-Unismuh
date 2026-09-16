(() => {
  "use strict";

  // ---------- Canvas setup ----------
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  // Orientation presets - the canvas + layout resize to match.
  const ORIENTATIONS = {
    portrait: { w: 480, h: 800 },
    landscape: { w: 1422, h: 800 },
  };
  let orientation = "portrait";
  let W = canvas.width;
  let H = canvas.height;

  // ---------- DOM ----------
  const screenStart = document.getElementById("screen-start");
  const screenCalibrate = document.getElementById("screen-calibrate");
  const screenOver = document.getElementById("screen-over");
  const hud = document.getElementById("hud");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const finalScoreEl = document.getElementById("final-score");
  const bestMsgEl = document.getElementById("best-msg");
  const micErrorEl = document.getElementById("mic-error");
  const micStatusEl = document.getElementById("mic-status");
  const micStatusTextEl = document.getElementById("mic-status-text");
  const micTranscriptEl = document.getElementById("mic-transcript");
  const calibrateMsgEl = document.getElementById("calibrate-msg");
  const btnStart = document.getElementById("btn-start");
  const btnStartTap = document.getElementById("btn-start-tap");
  const btnRetry = document.getElementById("btn-retry");
  const btnHome = document.getElementById("btn-home");
  const btnOrientPortrait = document.getElementById("orient-portrait");
  const btnOrientLandscape = document.getElementById("orient-landscape");
  const sensitivityInput = document.getElementById("sensitivity");
  const sensValEl = document.getElementById("sens-val");
  const nameInput = document.getElementById("player-name");
  const overNameEl = document.getElementById("over-name");
  const lbListStart = document.getElementById("lb-list-start");
  const lbListOver = document.getElementById("lb-list-over");

  // ---------- Player & leaderboard ----------
  const NAME_KEY = "voiceFlyGame_name";
  const SCORES_KEY = "voiceFlyGame_scores";
  const MUTED_KEY = "voiceFlyGame_muted";
  let muted = localStorage.getItem(MUTED_KEY) === "1";
  let playerName = localStorage.getItem(NAME_KEY) || "";
  nameInput.value = playerName;
  let best = 0;

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  function loadLocalScores() {
    try { return JSON.parse(localStorage.getItem(SCORES_KEY) || "[]"); }
    catch (e) { return []; }
  }

  function saveLocalScore(name, sc) {
    const scores = loadLocalScores();
    const existing = scores.find((s) => s.name.toLowerCase() === name.toLowerCase());
    if (existing) { if (sc > existing.score) existing.score = sc; }
    else scores.push({ name, score: sc });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores.slice(0, 50)));
    return scores;
  }

  let leaderboard = []; // scores shown (from server, or local fallback when offline)

  function renderLeaderboard() {
    const scores = leaderboard.slice(0, 5);
    best = scores.length ? scores[0].score : 0;
    bestEl.textContent = `Terbaik: ${best}`;
    const html = scores.length
      ? scores.map((s, i) =>
          `<li><span class="lb-rank">${["🥇", "🥈", "🥉"][i] || i + 1}</span>` +
          `<span class="lb-name">${escapeHtml(s.name)}</span>` +
          `<span class="lb-score">${s.score}</span></li>`
        ).join("")
      : `<li class="lb-empty">Belum ada skor</li>`;
    lbListStart.innerHTML = html;
    lbListOver.innerHTML = html;
  }

  // Shared online ranking (server), with local fallback when offline.
  async function fetchLeaderboard() {
    try {
      const r = await fetch("api/scores", { cache: "no-store" });
      if (r.ok) {
        const d = await r.json();
        if (Array.isArray(d.scores)) { leaderboard = d.scores; renderLeaderboard(); return; }
      }
    } catch (e) { /* offline / no server */ }
    leaderboard = loadLocalScores().sort((a, b) => b.score - a.score);
    renderLeaderboard();
  }

  async function submitScore(name, sc) {
    saveLocalScore(name, sc); // keep an offline backup regardless
    try {
      const r = await fetch("api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, score: sc }),
      });
      if (r.ok) {
        const d = await r.json();
        if (Array.isArray(d.scores)) { leaderboard = d.scores; renderLeaderboard(); return; }
      }
    } catch (e) { /* offline */ }
    leaderboard = loadLocalScores().sort((a, b) => b.score - a.score);
    renderLeaderboard();
  }

  // ---------- Game constants ----------
  const GRAVITY = 780;            // px/s^2 pulling the character down
  const LIFT_ACCEL = 1350;       // px/s^2 continuous upward while sound sustains
  const MAX_UP_VY = 420;          // fastest rise speed
  const MAX_DOWN_VY = 520;        // fastest fall speed
  const FLAP_KICK_VY = -300;      // instant upward pop the moment a sound starts
  const FLAP_COOLDOWN = 0.18;     // seconds between pops
  const CHAR_R = 24;
  const GROUND_H = 60;
  const PIPE_WIDTH = 88;
  const PIPE_SPEED_BASE = 155;    // px/s
  const PIPE_INTERVAL = 1750;     // ms between spawns

  // Layout values that depend on canvas size (recomputed per orientation).
  let CHAR_X = W * 0.26;
  let GAP_HEIGHT_BASE = Math.round(H * 0.40);
  let GAP_MIN = Math.round(H * 0.28);
  let PIPE_MARGIN = Math.round(H * 0.11);

  function applyOrientation(o) {
    orientation = o;
    let cfg;
    if (o === "portrait") {
      // match the device screen aspect so it fills a phone with no black bars
      const vw = window.innerWidth || 480;
      const vh = window.innerHeight || 800;
      const w = 480;
      const h = Math.max(720, Math.min(1180, Math.round(w * (vh / vw))));
      cfg = { w, h };
    } else {
      cfg = ORIENTATIONS.landscape;
    }
    canvas.width = cfg.w;
    canvas.height = cfg.h;
    W = cfg.w;
    H = cfg.h;
    CHAR_X = W * 0.26;
    GAP_HEIGHT_BASE = Math.round(H * 0.40);
    GAP_MIN = Math.round(H * 0.28);
    PIPE_MARGIN = Math.round(H * 0.11);
    canvas.style.aspectRatio = `${W} / ${H}`;
    canvas.classList.toggle("landscape", o === "landscape");
    canvas.classList.toggle("portrait", o === "portrait");
    drawIdleFrame();
  }

  // Voice detection: the character rises while your voice is above this level.
  // The threshold is set by the mic-sensitivity slider (higher slider = more
  // sensitive = lower threshold). Persisted in localStorage.
  const SENS_KEY = "voiceFlyGame_sens";
  let voiceThreshold = 0.14;
  const VOICE_BOOST = 2.6;        // laptop mics report low raw RMS

  function setSensitivity(s) {
    // slider 1..10 -> threshold 0.28 (least sensitive) .. 0.04 (most sensitive)
    voiceThreshold = 0.28 - (s - 1) * (0.24 / 9);
    sensValEl.textContent = s;
    localStorage.setItem(SENS_KEY, String(s));
  }

  // ---------- State ----------
  let mode = "start"; // start | calibrate | playing | over
  let usingMic = false;
  let tapActive = false; // hold-to-rise fallback (tap/space)
  let wasLoud = false;   // for onset (pop) detection
  let lastFlapTime = -999;

  let character = { y: H / 2, vy: 0, rot: 0 };
  let pipes = [];
  let clouds = [];
  let particles = [];
  let lastPipeTime = 0;
  let score = 0;
  let elapsed = 0;
  let lastTime = 0;
  let rafId = null;

  // ---------- Clouds (animated, layered over the image) ----------
  function initClouds() {
    clouds = [];
    for (let i = 0; i < 5; i++) {
      clouds.push({
        x: Math.random() * W,
        y: 30 + Math.random() * (H * 0.30),
        scale: 0.5 + Math.random() * 0.8,
        speed: 8 + Math.random() * 16,
      });
    }
  }

  function drawCloud(c) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(c.scale, c.scale);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.arc(28, 8, 20, 0, Math.PI * 2);
    ctx.arc(-26, 10, 18, 0, Math.PI * 2);
    ctx.arc(6, -14, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---------- Background image ----------
  const bgImage = new Image();
  let bgReady = false;
  bgImage.onload = () => { bgReady = true; drawIdleFrame(); };
  bgImage.src = "background.png";

  // ---------- Character sprite ----------
  const charImage = new Image();
  let charReady = false;
  charImage.onload = () => { charReady = true; drawIdleFrame(); };
  charImage.src = "character.png";

  // ---------- Background (image + previous sky/clouds/silhouette/ground) ----------
  function drawBackground(dt) {
    // base sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#67c1e8");
    grad.addColorStop(1, "#bfe9f7");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // campus illustration, cover-fit, faded so it sits softly behind the game
    if (bgReady) {
      const scale = Math.max(W / bgImage.width, H / bgImage.height);
      const dw = bgImage.width * scale;
      const dh = bgImage.height * scale;
      ctx.globalAlpha = 0.4;
      ctx.drawImage(bgImage, (W - dw) / 2, (H - dh) / 2, dw, dh);
      ctx.globalAlpha = 1;
    }

    // animated clouds drifting over the scene (semi-transparent to blend)
    ctx.globalAlpha = 0.7;
    clouds.forEach((c) => {
      c.x -= c.speed * dt;
      if (c.x < -80) c.x = W + 80;
      drawCloud(c);
    });
    ctx.globalAlpha = 1;

    // background fence (silver, matching the pipes), sitting on the ground line
    const fenceBottom = H - GROUND_H;
    const fenceTop = fenceBottom - 84;
    ctx.strokeStyle = "#6b7480";
    ctx.lineWidth = 2;
    // pickets with pointed tops
    for (let x = -10; x < W + 20; x += 24) {
      ctx.fillStyle = "#dfe4e8";
      ctx.beginPath();
      ctx.moveTo(x, fenceTop + 12);
      ctx.lineTo(x + 5, fenceTop);
      ctx.lineTo(x + 10, fenceTop + 12);
      ctx.lineTo(x + 10, fenceBottom);
      ctx.lineTo(x, fenceBottom);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // two horizontal rails
    ctx.fillStyle = "#b8c0c8";
    ctx.fillRect(0, fenceTop + 24, W, 11);
    ctx.strokeRect(0, fenceTop + 24, W, 11);
    ctx.fillRect(0, fenceBottom - 30, W, 11);
    ctx.strokeRect(0, fenceBottom - 30, W, 11);

    // ground (solid, exactly like the previous background)
    ctx.fillStyle = "#5c8a3a";
    ctx.fillRect(0, H - 60, W, 60);
    ctx.fillStyle = "#4a7530";
    ctx.fillRect(0, H - 60, W, 10);
  }

  // ---------- Pipes / obstacles ----------
  const PIPE_LABELS = [
    "Unismuh Unggul", "Unismuh Keren", "Unismuh Mantap",
    "Aku Keren", "Aku Imut", "Aku Cakep", "Aku Hebat", "Aku Pintar",
    "Kece Badai", "Mantul!", "Gaskeun!", "Santuy", "Auto Cakep",
    "No Baper", "Healing Dulu", "Semangat!", "Slay!", "Gercep",
    "Idaman Mertua", "Anak Sholeh", "Calon Sukses", "Jomblo Bahagia",
    "Anti Galau", "Rezeki Nomplok", "Bintang Kelas", "Juara Sejati",
    "Good Vibes", "Level Up", "Sultan Muda", "Berprestasi",
    "OTW Sarjana", "OTW Wisuda", "OTW Dilamar",
  ];

  let pipeLabelTop = true; // alternates each spawn for top/bottom labels

  function spawnPipe() {
    const gapH = Math.max(GAP_MIN, GAP_HEIGHT_BASE - score * 2);
    const gapY = PIPE_MARGIN + Math.random() * (H - GROUND_H - PIPE_MARGIN * 2 - gapH);
    const label = PIPE_LABELS[Math.floor(Math.random() * PIPE_LABELS.length)];
    pipes.push({ x: W + PIPE_WIDTH, gapY, gapH, passed: false, label, labelOnTop: pipeLabelTop });
    pipeLabelTop = !pipeLabelTop;
  }

  function drawPipe(p) {
    const capH = 28;   // rim height at the gap end
    const over = 7;    // rim overhang on each side
    const bottomY = p.gapY + p.gapH;
    const groundTop = H - GROUND_H;

    // top pipe: body + rim facing down into the gap
    drawPipeSeg(p.x, 0, PIPE_WIDTH, p.gapY - capH);
    drawPipeSeg(p.x - over, p.gapY - capH, PIPE_WIDTH + over * 2, capH);
    // bottom pipe: rim facing up + body down to the ground
    drawPipeSeg(p.x - over, bottomY, PIPE_WIDTH + over * 2, capH);
    drawPipeSeg(p.x, bottomY + capH, PIPE_WIDTH, groundTop - (bottomY + capH));

    drawPipeLabel(p, capH, groundTop);
  }

  function drawPipeLabel(p, capH, groundTop) {
    const topH = p.gapY - capH;
    const bottomStart = p.gapY + p.gapH + capH;
    const bottomH = groundTop - bottomStart;

    // put the label on the requested pipe, but fall back if it's too short
    let useTop = p.labelOnTop;
    if (useTop && topH < 90) useTop = false;
    if (!useTop && bottomH < 90) useTop = true;

    const segLen = useTop ? topH : bottomH;
    if (segLen < 70) return;
    const cx = p.x + PIPE_WIDTH / 2;
    const cy = useTop ? topH / 2 : bottomStart + bottomH / 2;

    // words stacked so text stays horizontal inside the narrow pipe
    const words = p.label.split(" ");
    const availW = PIPE_WIDTH - 18;
    let fs = 18;
    ctx.font = `bold ${fs}px "Segoe UI", Arial`;
    let maxWordW = Math.max(...words.map((w) => ctx.measureText(w).width));
    if (maxWordW > availW) {
      fs = Math.max(10, Math.floor((fs * availW) / maxWordW));
      ctx.font = `bold ${fs}px "Segoe UI", Arial`;
      maxWordW = Math.max(...words.map((w) => ctx.measureText(w).width));
    }

    const lineH = fs + 5;
    const bh = words.length * lineH + 12;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // ribbon banner shape (pointed ends) behind the horizontal text
    const rw = PIPE_WIDTH + 22;
    const notch = 15;
    const x0 = cx - rw / 2, x1 = cx + rw / 2;
    const y0 = cy - bh / 2, y1 = cy + bh / 2;

    // little fold tails behind the tips for a ribbon feel
    ctx.fillStyle = "#5a1226";
    ctx.beginPath();
    ctx.moveTo(x0 + notch, y1);
    ctx.lineTo(x0 - 2, y1 + 9);
    ctx.lineTo(x0 + notch, y1 - 12);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x1 - notch, y1);
    ctx.lineTo(x1 + 2, y1 + 9);
    ctx.lineTo(x1 - notch, y1 - 12);
    ctx.closePath();
    ctx.fill();

    // main banner (hexagon with pointed left/right ends)
    const grad = ctx.createLinearGradient(0, y0, 0, y1);
    grad.addColorStop(0, "#a83250");
    grad.addColorStop(1, "#6e1630");
    ctx.fillStyle = grad;
    ctx.strokeStyle = "#f2c14e";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x0, cy);
    ctx.lineTo(x0 + notch, y0);
    ctx.lineTo(x1 - notch, y0);
    ctx.lineTo(x1, cy);
    ctx.lineTo(x1 - notch, y1);
    ctx.lineTo(x0 + notch, y1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // horizontal text, one word per line
    ctx.fillStyle = "#ffffff";
    words.forEach((w, i) => {
      ctx.fillText(w, cx, cy - bh / 2 + 6 + lineH * (i + 0.5));
    });
    ctx.restore();
  }

  function drawPipeSeg(x, y, w, h) {
    if (h <= 0) return;
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.28, "#dfe4e8");
    g.addColorStop(0.72, "#b8c0c8");
    g.addColorStop(1, "#949da6");
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#6b7480";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
  }

  function updatePipes(dt, speedMul) {
    const speed = PIPE_SPEED_BASE * speedMul;
    pipes.forEach((p) => (p.x -= speed * dt));
    pipes = pipes.filter((p) => p.x + PIPE_WIDTH > -10);

    pipes.forEach((p) => {
      if (!p.whooshed && CHAR_X + CHAR_R > p.x && CHAR_X - CHAR_R < p.x + PIPE_WIDTH) {
        p.whooshed = true;
        playWhooshSfx(); // self-gated to tap mode
      }
      if (!p.passed && p.x + PIPE_WIDTH < CHAR_X - CHAR_R) {
        p.passed = true;
        score++;
        scoreEl.textContent = score;
        if (!usingMic) playScoreSfx(); // point "ding" in tap/space mode
      }
    });
  }

  // ---------- Sound effects (generated via Web Audio) ----------
  let sfxCtx = null;
  function ensureSfx() {
    if (!sfxCtx) {
      try { sfxCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { sfxCtx = null; return; }
    }
    if (sfxCtx.state === "suspended") sfxCtx.resume();
  }
  function sfxOn() { return sfxCtx && !muted; }

  // Simple looping chiptune background music (tap mode only, to avoid mic feedback).
  let musicTimer = null;
  let musicStep = 0;
  const MUSIC_SEQ = [
    262, 330, 392, 523, 392, 330,
    294, 349, 440, 349, 294, 247,
  ];
  function playMusicNote() {
    if (!sfxOn()) return;
    const t = sfxCtx.currentTime;
    const f = MUSIC_SEQ[musicStep % MUSIC_SEQ.length];
    const o = sfxCtx.createOscillator();
    const g = sfxCtx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g); g.connect(sfxCtx.destination);
    o.start(t); o.stop(t + 0.24);
    // soft bass every 3 steps
    if (musicStep % 3 === 0) {
      const bo = sfxCtx.createOscillator();
      const bg = sfxCtx.createGain();
      bo.type = "sine";
      bo.frequency.setValueAtTime(f / 2, t);
      bg.gain.setValueAtTime(0.0001, t);
      bg.gain.exponentialRampToValueAtTime(0.06, t + 0.03);
      bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      bo.connect(bg); bg.connect(sfxCtx.destination);
      bo.start(t); bo.stop(t + 0.32);
    }
    musicStep++;
  }
  function startMusic() {
    if (usingMic || !sfxOn()) return; // no music in mic mode (would trigger voice detection)
    stopMusic();
    musicStep = 0;
    playMusicNote();
    musicTimer = setInterval(playMusicNote, 210);
  }
  function stopMusic() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  }

  // Short ascending "ready-go" beep at the start of a round (tap mode only).
  function playStartSfx() {
    if (usingMic || !sfxOn()) return;
    const t = sfxCtx.currentTime;
    [[523, 0], [659, 0.1], [880, 0.2]].forEach(([f, d]) => {
      const o = sfxCtx.createOscillator();
      const g = sfxCtx.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(f, t + d);
      g.gain.setValueAtTime(0.0001, t + d);
      g.gain.exponentialRampToValueAtTime(0.16, t + d + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.12);
      o.connect(g); g.connect(sfxCtx.destination);
      o.start(t + d); o.stop(t + d + 0.14);
    });
  }

  // Triumphant fanfare for a new record (plays in both modes on game over).
  function playRecordFanfare() {
    if (!sfxOn()) return;
    const t = sfxCtx.currentTime;
    const notes = [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.36]]; // C5 E5 G5 C6
    notes.forEach(([f, d]) => {
      const o = sfxCtx.createOscillator();
      const g = sfxCtx.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(f, t + d);
      g.gain.setValueAtTime(0.0001, t + d);
      g.gain.exponentialRampToValueAtTime(0.2, t + d + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.34);
      o.connect(g); g.connect(sfxCtx.destination);
      o.start(t + d); o.stop(t + d + 0.36);
    });
  }

  // Airy "whoosh" as the character passes a pipe (tap mode only).
  function playWhooshSfx() {
    if (usingMic || !sfxOn()) return;
    const t = sfxCtx.currentTime;
    const dur = 0.22;
    const buf = sfxCtx.createBuffer(1, Math.floor(sfxCtx.sampleRate * dur), sfxCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
    const src = sfxCtx.createBufferSource(); src.buffer = buf;
    const bp = sfxCtx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(500, t);
    bp.frequency.exponentialRampToValueAtTime(2600, t + dur);
    const g = sfxCtx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.14, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp); bp.connect(g); g.connect(sfxCtx.destination);
    src.start(t); src.stop(t + dur);
  }

  function playFlapSfx() {
    if (!sfxOn()) return;
    const t = sfxCtx.currentTime;
    const o = sfxCtx.createOscillator();
    const g = sfxCtx.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(440, t);
    o.frequency.exponentialRampToValueAtTime(880, t + 0.08);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.2, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    o.connect(g); g.connect(sfxCtx.destination);
    o.start(t); o.stop(t + 0.15);
  }
  // Two quick ascending blips - classic "point"/coin sound.
  function playScoreSfx() {
    if (!sfxOn()) return;
    const t = sfxCtx.currentTime;
    [[988, 0], [1319, 0.08]].forEach(([f, d]) => {
      const o = sfxCtx.createOscillator();
      const g = sfxCtx.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(f, t + d);
      g.gain.setValueAtTime(0.0001, t + d);
      g.gain.exponentialRampToValueAtTime(0.18, t + d + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.11);
      o.connect(g); g.connect(sfxCtx.destination);
      o.start(t + d); o.stop(t + d + 0.13);
    });
  }
  // A descending "fail" jingle for game over (plays in both mic and tap modes).
  function playGameOverSfx() {
    if (!sfxOn()) return;
    const t = sfxCtx.currentTime;
    const notes = [[523, 0], [440, 0.18], [349, 0.36], [262, 0.56]]; // C5 A4 F4 C4
    notes.forEach(([f, d]) => {
      const o = sfxCtx.createOscillator();
      const g = sfxCtx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(f, t + d);
      g.gain.setValueAtTime(0.0001, t + d);
      g.gain.exponentialRampToValueAtTime(0.24, t + d + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.3);
      o.connect(g); g.connect(sfxCtx.destination);
      o.start(t + d); o.stop(t + d + 0.32);
    });
  }
  function playCrashSfx() {
    if (!sfxOn()) return;
    const t = sfxCtx.currentTime;
    const dur = 0.45;
    // noise burst through a falling low-pass filter
    const buf = sfxCtx.createBuffer(1, Math.floor(sfxCtx.sampleRate * dur), sfxCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = sfxCtx.createBufferSource(); src.buffer = buf;
    const lp = sfxCtx.createBiquadFilter(); lp.type = "lowpass";
    lp.frequency.setValueAtTime(1400, t);
    lp.frequency.exponentialRampToValueAtTime(200, t + dur);
    const gn = sfxCtx.createGain();
    gn.gain.setValueAtTime(0.4, t);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(lp); lp.connect(gn); gn.connect(sfxCtx.destination);
    src.start(t);
    // plus a quick descending tone for the "thud"
    const o = sfxCtx.createOscillator(); const g2 = sfxCtx.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(300, t);
    o.frequency.exponentialRampToValueAtTime(60, t + dur);
    g2.gain.setValueAtTime(0.22, t);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g2); g2.connect(sfxCtx.destination);
    o.start(t); o.stop(t + dur);
  }

  // ---------- Character effects (glow, sparkle trail, flap pulse) ----------
  function spawnFlapParticles() {
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: CHAR_X - CHAR_R * 0.5 + (Math.random() - 0.5) * 18,
        y: character.y + CHAR_R * 0.6 + (Math.random() - 0.5) * 12,
        vx: -50 - Math.random() * 90,
        vy: 30 + Math.random() * 90,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.4,
        size: 3 + Math.random() * 5,
        gold: Math.random() < 0.6,
      });
    }
  }

  function updateParticles(dt) {
    for (const p of particles) {
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 140 * dt;
    }
    if (particles.length) particles = particles.filter((p) => p.life < p.maxLife);
  }

  function drawParticles() {
    for (const p of particles) {
      const t = 1 - p.life / p.maxLife;
      ctx.globalAlpha = Math.max(0, t);
      ctx.fillStyle = p.color || (p.gold ? "#ffe27a" : "#ffffff");
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ---------- Crash effect (explosion + screen shake + flash) ----------
  let crashStart = -999;
  let shakeUntil = 0;
  const CRASH_DURATION = 0.7;

  function spawnExplosion() {
    const colors = ["#ff5a3c", "#ff9d2e", "#ffd93d", "#ffffff", "#c2cad2"];
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 130 + Math.random() * 340;
      particles.push({
        x: CHAR_X,
        y: character.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.6,
        size: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  function startCrash() {
    mode = "crash";
    crashStart = elapsed;
    shakeUntil = elapsed + 0.5;
    hud.classList.add("hidden");
    stopMusic();
    spawnExplosion();
    if (!usingMic) playCrashSfx(); // crash sound in tap/space mode
  }

  function drawCharacter() {
    ctx.save();
    ctx.translate(CHAR_X, character.y);
    ctx.rotate(character.rot * 0.55);

    // soft glowing aura behind the character
    const glow = ctx.createRadialGradient(0, 0, CHAR_R * 0.5, 0, 0, CHAR_R * 2.6);
    glow.addColorStop(0, "rgba(255, 226, 122, 0.4)");
    glow.addColorStop(1, "rgba(255, 226, 122, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, CHAR_R * 2.6, 0, Math.PI * 2);
    ctx.fill();

    // quick pop/scale pulse right after a flap
    const since = elapsed - lastFlapTime;
    const pulse = since >= 0 && since < 0.2 ? 1 + (0.2 - since) * 0.7 : 1;
    ctx.scale(pulse, pulse);

    if (charReady) {
      // draw the mascot sprite (transparent PNG), sized around the hitbox
      const h = CHAR_R * 5.8;
      const w = h * (charImage.width / charImage.height);
      ctx.drawImage(charImage, -w / 2, -h / 2, w, h);
      ctx.restore();
      return;
    }

    // cape / helicopter blade effect when flying
    ctx.strokeStyle = "#ffd93d";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-CHAR_R - 4, -CHAR_R + 6);
    ctx.lineTo(-CHAR_R - 22, -CHAR_R - 10);
    ctx.stroke();

    // body
    ctx.fillStyle = "#2e7d32";
    ctx.beginPath();
    ctx.ellipse(0, 6, CHAR_R * 0.75, CHAR_R * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();

    // head
    ctx.fillStyle = "#ffcf9e";
    ctx.beginPath();
    ctx.arc(0, -CHAR_R + 2, CHAR_R * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // eye
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(6, -CHAR_R, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ---------- Collision ----------
  function checkCollision() {
    // ceiling is a soft boundary (clamp), not a hazard - only buildings and
    // the ground should end the game, so enthusiastic shouting isn't unfair.
    if (character.y - CHAR_R < 0) {
      character.y = CHAR_R;
      character.vy = Math.max(0, character.vy);
    }
    if (character.y + CHAR_R > H - 60) return true;

    for (const p of pipes) {
      const withinX = CHAR_X + CHAR_R > p.x && CHAR_X - CHAR_R < p.x + PIPE_WIDTH;
      if (!withinX) continue;
      const hitsTop = character.y - CHAR_R < p.gapY;
      const hitsBottom = character.y + CHAR_R > p.gapY + p.gapH;
      if (hitsTop || hitsBottom) return true;
    }
    return false;
  }

  // ---------- Voice input (offline, no words - sustained sound = keep rising) ----------
  let voiceAudioCtx = null;
  let voiceAnalyser = null;
  let voiceData = null;
  let voiceFreq = null;
  let voiceStream = null;
  let voiceVolume = 0; // smoothed 0..1

  function setMicStatus(listening) {
    micStatusEl.classList.toggle("listening", listening);
    micStatusTextEl.textContent = listening ? "Mendengarkan..." : "Mikrofon nonaktif";
  }

  function readVoiceVolume() {
    if (!voiceAnalyser) return 0;
    voiceAnalyser.getByteTimeDomainData(voiceData);
    let sum = 0;
    for (let i = 0; i < voiceData.length; i++) {
      const v = (voiceData[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / voiceData.length);

    voiceAnalyser.getByteFrequencyData(voiceFreq);
    let freqSum = 0;
    for (let i = 0; i < voiceFreq.length; i++) freqSum += voiceFreq[i];
    const freqAvg = freqSum / voiceFreq.length / 255;

    return Math.min(1, Math.max(rms, freqAvg) * VOICE_BOOST);
  }

  async function setupMic() {
    micErrorEl.textContent = "";
    calibrateMsgEl.textContent = "Mengaktifkan mikrofon...";
    voiceStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    voiceAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (voiceAudioCtx.state === "suspended") await voiceAudioCtx.resume();
    const source = voiceAudioCtx.createMediaStreamSource(voiceStream);
    voiceAnalyser = voiceAudioCtx.createAnalyser();
    voiceAnalyser.fftSize = 1024;
    voiceAnalyser.smoothingTimeConstant = 0.03;
    source.connect(voiceAnalyser);
    voiceData = new Uint8Array(voiceAnalyser.fftSize);
    voiceFreq = new Uint8Array(voiceAnalyser.frequencyBinCount);
    usingMic = true;
    setMicStatus(true);
  }

  function stopMic() {
    if (voiceStream) voiceStream.getTracks().forEach((t) => t.stop());
    if (voiceAudioCtx) { try { voiceAudioCtx.close(); } catch (e) { /* ignore */ } }
    voiceAudioCtx = null;
    voiceAnalyser = null;
    voiceStream = null;
    usingMic = false;
    setMicStatus(false);
  }

  // ---------- Screen management ----------
  function showScreen(el) {
    [screenStart, screenCalibrate, screenOver].forEach((s) => s.classList.add("hidden"));
    if (el) el.classList.remove("hidden");
  }

  // ---------- Game flow ----------
  function resetGame() {
    character = { y: H / 2, vy: 0, rot: 0 };
    pipes = [];
    score = 0;
    elapsed = 0;
    lastPipeTime = 0;
    lastFlapTime = -999;
    wasLoud = false;
    pipeLabelTop = true;
    particles = [];
    crashStart = -999;
    shakeUntil = 0;
    scoreEl.textContent = "0";
    initClouds();
  }

  function requireName() {
    const name = nameInput.value.trim();
    if (!name) {
      micErrorEl.textContent = "Masukkan nama kamu dulu ya!";
      nameInput.focus();
      return false;
    }
    playerName = name;
    localStorage.setItem(NAME_KEY, playerName);
    micErrorEl.textContent = "";
    return true;
  }

  async function startWithMic() {
    if (!requireName()) return;
    ensureSfx(); // enable audio (this click is a user gesture) - for the game-over jingle
    btnStart.disabled = true;
    try {
      if (!usingMic) {
        showScreen(screenCalibrate);
        await setupMic();
      }
      resetGame();
      beginPlay();
    } catch (err) {
      if (!micErrorEl.textContent) {
        micErrorEl.textContent = "Tidak bisa mengakses mikrofon. Gunakan tombol 'Tanpa Mikrofon'.";
      }
      showScreen(screenStart);
    } finally {
      btnStart.disabled = false;
    }
  }

  function startWithTap() {
    if (!requireName()) return;
    stopMic();
    ensureSfx(); // this click is a user gesture, so audio is allowed
    resetGame();
    beginPlay();
  }

  function beginPlay() {
    mode = "playing";
    showScreen(null);
    hud.classList.remove("hidden");
    playStartSfx();
    startMusic();
    lastTime = performance.now();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  }

  function endGame() {
    mode = "over";
    hud.classList.add("hidden");
    stopMusic();
    const mine = leaderboard.find((s) => s.name.toLowerCase() === playerName.toLowerCase());
    const myBest = mine ? mine.score : 0;
    const isRecord = score > myBest && score > 0;
    bestMsgEl.textContent = isRecord ? "🎉 Rekor baru!" : "";
    overNameEl.textContent = playerName;
    finalScoreEl.textContent = String(score);
    showScreen(screenOver);
    if (isRecord) playRecordFanfare(); else playGameOverSfx(); // both modes
    submitScore(playerName, score); // saves + refreshes ranking (async)
    if (rafId) cancelAnimationFrame(rafId);
  }

  // ---------- Main loop ----------
  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    elapsed += dt;

    let speedMul = 1 + Math.min(0.6, score * 0.02);

    if (mode === "playing") {
      // Read control input from voice (or tap/space fallback).
      let liftStrength = 0; // 0..~1.4, strength of continuous lift
      let loudNow = false;  // whether sound is currently present (for onset pop)
      if (usingMic) {
        const raw = readVoiceVolume();
        voiceVolume = voiceVolume * 0.3 + raw * 0.7; // light smoothing = responsive
        liftStrength = Math.max(0, Math.min(1.4, (voiceVolume - voiceThreshold) / 0.18));
        loudNow = voiceVolume > voiceThreshold;
        micTranscriptEl.textContent = `Suara ${voiceVolume.toFixed(2)} / Batas ${voiceThreshold.toFixed(2)}`;
      } else {
        liftStrength = tapActive ? 1 : 0;
        loudNow = tapActive;
      }

      // physics: gravity pulls down. Combined control - an instant "pop" the
      // moment a sound starts (responsive), PLUS continuous lift while the sound
      // is sustained (longer sound = higher).
      character.vy += GRAVITY * dt;
      if (loudNow && !wasLoud && elapsed - lastFlapTime > FLAP_COOLDOWN) {
        character.vy = Math.min(character.vy, FLAP_KICK_VY);
        lastFlapTime = elapsed;
        spawnFlapParticles();
        if (!usingMic) playFlapSfx(); // sound feedback in tap/space mode
      }
      character.vy -= LIFT_ACCEL * liftStrength * dt;
      wasLoud = loudNow;
      character.vy = Math.max(-MAX_UP_VY, Math.min(MAX_DOWN_VY, character.vy));
      character.y += character.vy * dt;
      character.rot = Math.max(-0.5, Math.min(0.9, character.vy / MAX_DOWN_VY));

      // spawn pipes
      if (elapsed * 1000 - lastPipeTime > PIPE_INTERVAL / speedMul) {
        spawnPipe();
        lastPipeTime = elapsed * 1000;
      }
      updatePipes(dt, speedMul);
      updateParticles(dt);

      if (checkCollision()) {
        startCrash();
      }
    } else if (mode === "crash") {
      // let the character tumble and fall while the explosion plays out
      character.vy += GRAVITY * dt;
      character.y += character.vy * dt;
      character.rot += 4 * dt;
      updateParticles(dt);
      if (elapsed - crashStart > CRASH_DURATION) {
        endGame();
        return;
      }
    }

    // draw (background stays still; foreground shakes on crash)
    drawBackground(dt);
    let sx = 0, sy = 0;
    if (elapsed < shakeUntil) {
      const k = (shakeUntil - elapsed) / 0.5;
      sx = (Math.random() - 0.5) * 26 * k;
      sy = (Math.random() - 0.5) * 26 * k;
    }
    ctx.save();
    ctx.translate(sx, sy);
    pipes.forEach(drawPipe);
    drawParticles();
    if (mode !== "crash" || elapsed - crashStart < 0.18) drawCharacter();
    ctx.restore();

    // white impact flash right at the moment of crash
    if (mode === "crash") {
      const f = 1 - (elapsed - crashStart) / 0.18;
      if (f > 0) {
        ctx.fillStyle = `rgba(255,255,255,${f * 0.7})`;
        ctx.fillRect(0, 0, W, H);
      }
    }

    rafId = requestAnimationFrame(loop);
  }

  // ---------- Static preview on start screen ----------
  function drawIdleFrame() {
    initClouds();
    character = { y: H / 2, vy: 0, rot: 0 };
    pipes = [];
    drawBackground(0);
    drawCharacter();
  }

  // ---------- Input handlers ----------
  btnOrientPortrait.addEventListener("click", () => {
    applyOrientation("portrait");
    btnOrientPortrait.classList.add("active");
    btnOrientLandscape.classList.remove("active");
  });
  btnOrientLandscape.addEventListener("click", () => {
    applyOrientation("landscape");
    btnOrientLandscape.classList.add("active");
    btnOrientPortrait.classList.remove("active");
  });

  sensitivityInput.addEventListener("input", () => setSensitivity(parseInt(sensitivityInput.value, 10)));

  btnStart.addEventListener("click", () => { btnStart.blur(); startWithMic(); });
  btnStartTap.addEventListener("click", () => { btnStartTap.blur(); startWithTap(); });
  btnRetry.addEventListener("click", () => {
    btnRetry.blur();
    micErrorEl.textContent = "";
    resetGame();
    beginPlay();
  });
  btnHome.addEventListener("click", () => {
    btnHome.blur();
    stopMic();
    mode = "start";
    fetchLeaderboard();
    nameInput.value = playerName;
    showScreen(screenStart);
    drawIdleFrame();
  });

  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); startWithMic(); }
  });

  function handleTapDown() {
    if (usingMic) return; // voice controls when mic is active
    tapActive = true;
  }
  function handleTapUp() {
    tapActive = false;
  }
  canvas.addEventListener("pointerdown", handleTapDown);
  canvas.addEventListener("pointerup", handleTapUp);
  canvas.addEventListener("pointerleave", handleTapUp);
  window.addEventListener("keydown", (e) => {
    if (e.target && e.target.tagName === "INPUT") return; // allow typing spaces
    if (e.code === "Space") { e.preventDefault(); handleTapDown(); }
  });
  window.addEventListener("keyup", (e) => {
    if (e.target && e.target.tagName === "INPUT") return;
    if (e.code === "Space") { e.preventDefault(); handleTapUp(); }
  });

  const savedSens = parseInt(localStorage.getItem(SENS_KEY) || "6", 10);
  sensitivityInput.value = savedSens;
  setSensitivity(savedSens);

  // Re-fit the canvas to the screen on rotate / viewport change, but only when
  // not mid-game so the layout doesn't jump under the player.
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (mode === "playing" || mode === "crash") return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => applyOrientation(orientation), 150);
  });

  // Mute toggle (bottom-right). Persists across sessions.
  const muteBtn = document.createElement("button");
  muteBtn.id = "mute-btn";
  muteBtn.type = "button";
  muteBtn.setAttribute("aria-label", "Bisukan / nyalakan suara");
  muteBtn.textContent = muted ? "🔇" : "🔊";
  Object.assign(muteBtn.style, {
    position: "absolute", bottom: "12px", right: "12px", zIndex: "30",
    width: "44px", height: "44px", borderRadius: "50%", border: "none",
    cursor: "pointer", fontSize: "20px", lineHeight: "44px", padding: "0",
    background: "rgba(0,0,0,0.45)", color: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
  });
  (document.getElementById("game-wrap") || document.body).appendChild(muteBtn);
  muteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    muted = !muted;
    localStorage.setItem(MUTED_KEY, muted ? "1" : "0");
    muteBtn.textContent = muted ? "🔇" : "🔊";
    ensureSfx();
    if (muted) stopMusic();
    else if (mode === "playing" && !usingMic) startMusic();
    muteBtn.blur();
  });

  fetchLeaderboard();
  applyOrientation("landscape");
})();
