(() => {
  "use strict";

  /* ------------------------------------------------------------------
   * Copy (EN / ID)
   * ------------------------------------------------------------------ */
  const COPY = {
    en: {
      intro1: "Far past the last lit city, a small comet named Lumi keeps drifting.<br>Looking for a sky where light is shared, not hoarded.",
      intro2: "One night the stars began to bend.<br>A door appeared in the dark.",
      intro3: "Ready to follow<br>where Lumi goes?",
      subs: {
        2: "The stars stretched into lines. Lumi had never moved this fast.",
        3: "At the centre, a ring of light — turning, waiting, open.",
        4: "On the other side: colours no telescope had ever caught.",
      },
      manifesto: [
        ["Every story starts small.", "One spark in a very big dark."],
        ["Light travels farther together.", "Each frame is a step forward.", "Each viewer becomes a guide."],
        ["We build the stage first,", "then invite the world in.", "No spectators — only crew."],
      ],
      ctaHead: "The journey starts",
      ctaWords: ["NOW!", "HERE!", "WITH YOU!"],
      ctaLink: "Join the crew",
    },
    id: {
      intro1: "Jauh melewati kota terakhir yang bercahaya, sebuah komet kecil bernama Lumi terus melayang.<br>Mencari langit tempat cahaya dibagi, bukan disimpan sendiri.",
      intro2: "Suatu malam, bintang-bintang mulai melengkung.<br>Sebuah pintu muncul di dalam gelap.",
      intro3: "Siap mengikuti<br>ke mana Lumi pergi?",
      subs: {
        2: "Bintang-bintang memanjang menjadi garis. Lumi belum pernah melaju secepat ini.",
        3: "Di tengahnya, sebuah cincin cahaya — berputar, menunggu, terbuka.",
        4: "Di sisi lain: warna-warna yang belum pernah ditangkap teleskop mana pun.",
      },
      manifesto: [
        ["Setiap kisah dimulai dari kecil.", "Satu percikan di gelap yang luas."],
        ["Cahaya melaju lebih jauh bersama.", "Setiap bingkai adalah langkah maju.", "Setiap penonton menjadi pemandu."],
        ["Kami bangun panggungnya dulu,", "lalu mengundang dunia masuk.", "Tak ada penonton — semua kru."],
      ],
      ctaHead: "Perjalanan dimulai",
      ctaWords: ["SEKARANG!", "DI SINI!", "BERSAMAMU!"],
      ctaLink: "Gabung kru",
    },
  };

  let lang = "en";
  try { lang = localStorage.getItem("cinematik-lang") || "en"; } catch (e) {}
  if (!COPY[lang]) lang = "en";

  /* ------------------------------------------------------------------
   * DOM
   * ------------------------------------------------------------------ */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const canvas = $("#canvas");
  const ctx = canvas.getContext("2d");
  const sections = $$(".section");
  const introTexts = $$(".intro-text");
  const subtitles = $("#subtitles");
  const scrollHint = $("#scrollHint");
  const manifesto = $("#manifesto");
  const ctaWord = $("#ctaWord");
  const timelineBtns = $$("#timeline button");

  $("#year").textContent = new Date().getFullYear();
  document.body.classList.add("is-loading");

  function applyLanguage() {
    const c = COPY[lang];
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach((el) => { el.innerHTML = c[el.dataset.i18n]; });
    $$(".lang-toggle button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.language === lang)));

    manifesto.innerHTML = c.manifesto
      .map((g) => `<div class="manifesto-group">${g.map((l) => `<p class="manifesto-line"><span>${l}</span></p>`).join("")}</div>`)
      .join("");
    lastSub = null;
    typer.restart();
  }

  $$(".lang-toggle button").forEach((b) =>
    b.addEventListener("click", () => {
      lang = b.dataset.language;
      try { localStorage.setItem("cinematik-lang", lang); } catch (e) {}
      applyLanguage();
      update();
    })
  );

  /* ------------------------------------------------------------------
   * CTA typewriter
   * ------------------------------------------------------------------ */
  const typer = (() => {
    let i = 0, ch = 0, deleting = false, timer;
    function tick() {
      const words = COPY[lang].ctaWords;
      const w = words[i % words.length];
      ch += deleting ? -1 : 1;
      ctaWord.textContent = w.slice(0, ch);
      let delay = deleting ? 50 : 110;
      if (!deleting && ch === w.length) { deleting = true; delay = 1600; }
      else if (deleting && ch === 0) { deleting = false; i++; delay = 300; }
      timer = setTimeout(tick, delay);
    }
    return { restart() { clearTimeout(timer); i = 0; ch = 0; deleting = false; tick(); } };
  })();

  /* ------------------------------------------------------------------
   * Scroll state
   * ------------------------------------------------------------------ */
  let W = 0, H = 0, DPR = 1;
  let target = 0;       // global scene progress, 0..6 (section index + local progress)
  let current = 0;      // eased value used for rendering
  let lastSub = null;

  function sectionProgress() {
    const y = window.scrollY + window.innerHeight * 0.5;
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      const top = s.offsetTop, h = s.offsetHeight;
      if (y < top + h || i === sections.length - 1) {
        return i + Math.min(1, Math.max(0, (y - top) / h));
      }
    }
    return 0;
  }

  function update() {
    target = sectionProgress();
    const idx = Math.floor(target);           // 0-based chapter
    const local = target - idx;

    // Intro texts — chapter 1 split into three beats
    introTexts.forEach((el, n) => {
      const on = idx === 0 && local >= n / 3 && local < (n + 1) / 3 - 0.02;
      el.classList.toggle("is-active", on);
    });

    scrollHint.classList.toggle("is-hidden", window.scrollY > 40);

    // Subtitles for chapters 2-4
    const sub = COPY[lang].subs[idx + 1];
    const showSub = sub && local > 0.12 && local < 0.88;
    const key = showSub ? `${lang}-${idx}` : "";
    if (key !== lastSub) {
      lastSub = key;
      subtitles.classList.remove("is-active");
      if (showSub) {
        subtitles.innerHTML = `<span>${sub}</span>`;
        requestAnimationFrame(() => subtitles.classList.add("is-active"));
      }
    }

    // Manifesto lines reveal progressively through chapter 5
    const lines = $$(".manifesto-line", manifesto);
    const revealed = idx > 4 ? lines.length : idx === 4 ? Math.ceil(local * 1.4 * lines.length) : 0;
    lines.forEach((l, n) => l.classList.toggle("is-visible", n < revealed));

    // Footer timeline
    timelineBtns.forEach((b, n) => {
      const p = n < idx ? 1 : n === idx ? local : 0;
      b.style.setProperty("--p", p.toFixed(3));
    });
  }

  timelineBtns.forEach((b) =>
    b.addEventListener("click", () => {
      const s = sections[Number(b.dataset.section) - 1];
      window.scrollTo({ top: s.offsetTop, behavior: "smooth" });
    })
  );
  scrollHint.addEventListener("click", () =>
    window.scrollTo({ top: window.innerHeight * 0.75, behavior: "smooth" })
  );

  window.addEventListener("scroll", update, { passive: true });

  /* ------------------------------------------------------------------
   * Canvas scene
   * ------------------------------------------------------------------ */
  const STAR_COUNT = 900;
  const stars = [];
  const motes = [];

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    update();
  }

  function seed() {
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({ x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: Math.random(), pz: 0, hue: Math.random() });
    }
    for (let i = 0; i < 40; i++) {
      motes.push({
        a: Math.random() * Math.PI * 2, r: 0.15 + Math.random() * 0.55,
        s: 0.0006 + Math.random() * 0.0016, size: 4 + Math.random() * 22,
        sides: 3 + Math.floor(Math.random() * 4), hue: Math.random(), spin: Math.random() * 6,
      });
    }
  }

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const smooth = (e0, e1, x) => { const t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

  const palette = [
    [255, 181, 71],   // amber
    [255, 94, 126],   // rose
    [106, 215, 255],  // sky
    [170, 120, 255],  // violet
  ];
  const pick = (h) => palette[Math.floor(h * palette.length) % palette.length];

  function drawBackground(p, t) {
    // Deep space -> nebula world after the portal
    const other = smooth(3.4, 4.2, p);
    const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.8);
    g.addColorStop(0, `rgb(${lerp(10, 48, other)}, ${lerp(14, 18, other)}, ${lerp(28, 60, other)})`);
    g.addColorStop(1, `rgb(${lerp(5, 12, other)}, ${lerp(7, 6, other)}, ${lerp(13, 24, other)})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    if (other > 0) {
      for (let i = 0; i < 3; i++) {
        const c = palette[i + 1];
        const x = W / 2 + Math.cos(t * 0.0002 + i * 2.1) * W * 0.3;
        const y = H / 2 + Math.sin(t * 0.00025 + i * 1.7) * H * 0.25;
        const r = Math.max(W, H) * 0.45;
        const ng = ctx.createRadialGradient(x, y, 0, x, y, r);
        ng.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${0.22 * other})`);
        ng.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = ng;
        ctx.fillRect(0, 0, W, H);
      }
    }
  }

  function drawStars(p, dt) {
    // Speed ramps up in chapter 2 (warp), eases in 3, drifts afterwards
    const warp = smooth(0.9, 1.6, p) * (1 - smooth(2.3, 2.9, p));
    const speed = 0.00006 + warp * 0.0016 + smooth(3.6, 4.4, p) * 0.00012;
    const cx = W / 2, cy = H / 2, fov = Math.min(W, H) * 0.6;
    const dim = 1 - smooth(4.0, 4.3, p) * 0.4;

    ctx.lineCap = "round";
    for (const s of stars) {
      s.pz = s.z;
      s.z -= speed * dt;
      if (s.z <= 0.01) { s.z = 1; s.pz = 1; s.x = (Math.random() - 0.5) * 2; s.y = (Math.random() - 0.5) * 2; }
      const sx = cx + (s.x / s.z) * fov, sy = cy + (s.y / s.z) * fov;
      if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) continue;
      const px = cx + (s.x / s.pz) * fov, py = cy + (s.y / s.pz) * fov;
      const a = (1 - s.z) * dim;
      const c = warp > 0.2 ? pick(s.hue) : [244, 241, 234];
      ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
      ctx.lineWidth = Math.max(0.6, (1 - s.z) * 2.4);
      ctx.beginPath();
      // Stretch trails during warp
      const k = 1 + warp * 6;
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (px - sx) * k + 0.01, sy + (py - sy) * k);
      ctx.stroke();
    }
  }

  function drawPortal(p, t) {
    const open = smooth(1.8, 2.7, p);          // ring appears in chapter 3
    const pass = smooth(2.8, 3.6, p);          // fly through it
    const alpha = open * (1 - smooth(3.4, 3.8, p));
    if (alpha <= 0) return;
    const cx = W / 2, cy = H / 2;
    const base = Math.min(W, H) * lerp(0.05, 0.28, open) * lerp(1, 6, pass * pass);

    for (let i = 0; i < 7; i++) {
      const r = base * (1 + i * 0.12);
      const rot = t * 0.0004 * (i % 2 ? -1 : 1) + i;
      const c = palette[i % palette.length];
      ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha * (1 - i / 8)})`;
      ctx.lineWidth = 2.5 - i * 0.25;
      ctx.setLineDash([r * 0.6, r * 0.25]);
      ctx.beginPath();
      ctx.arc(cx, cy, r, rot, rot + Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, base);
    glow.addColorStop(0, `rgba(255,240,220,${0.55 * alpha})`);
    glow.addColorStop(0.6, `rgba(255,94,126,${0.12 * alpha})`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, base, 0, Math.PI * 2); ctx.fill();

    // White flash at the threshold
    const flash = Math.max(0, 1 - Math.abs(p - 3.45) / 0.18);
    if (flash > 0) { ctx.fillStyle = `rgba(255,248,235,${flash * 0.85})`; ctx.fillRect(0, 0, W, H); }
  }

  function drawMotes(p, t) {
    const vis = smooth(3.5, 4.1, p) * (1 - smooth(4.2, 4.5, p) * 0.6);
    if (vis <= 0) return;
    const cx = W / 2, cy = H / 2, R = Math.max(W, H) * 0.6;
    for (const m of motes) {
      const a = m.a + t * m.s;
      const x = cx + Math.cos(a) * m.r * R, y = cy + Math.sin(a) * m.r * R * 0.6;
      const c = pick(m.hue);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(m.spin + t * 0.0005);
      ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.7 * vis})`;
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.12 * vis})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let k = 0; k <= m.sides; k++) {
        const ang = (k / m.sides) * Math.PI * 2;
        const px = Math.cos(ang) * m.size, py = Math.sin(ang) * m.size;
        k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  }

  // Lumi — the original comet character
  const trail = [];
  function drawLumi(p, t) {
    const hide = smooth(4.05, 4.35, p) * (1 - smooth(5.0, 5.5, p));
    const alpha = 1 - hide;
    if (alpha <= 0.01) { trail.length = 0; return; }

    // Path: wanders in ch1, centres for warp, dives into portal, re-emerges, rises for finale
    const toCentre = smooth(0.8, 1.4, p);
    const dive = smooth(2.7, 3.4, p);
    const emerge = smooth(3.5, 4.0, p);
    const finale = smooth(5.0, 5.7, p);

    let x = lerp(W * 0.5 + Math.sin(t * 0.0006) * W * 0.22, W / 2 + Math.sin(t * 0.0012) * 18, toCentre);
    let y = lerp(H * 0.42 + Math.cos(t * 0.0008) * H * 0.12, H * 0.62 + Math.cos(t * 0.0014) * 10, toCentre);
    let size = lerp(1, 0.25, dive) * lerp(1, 1.2, emerge);
    y = lerp(y, H / 2, dive);
    if (emerge > 0) {
      x = lerp(x, W * 0.5 + Math.sin(t * 0.0007) * W * 0.18, emerge);
      y = lerp(y, H * 0.45 + Math.cos(t * 0.0009) * H * 0.1, emerge);
    }
    x = lerp(x, W / 2, finale);
    y = lerp(y, H * 0.2, finale);
    size *= Math.min(W, H) / 900 + 0.35;

    trail.push({ x, y });
    if (trail.length > 28) trail.shift();

    // Tail
    for (let i = 0; i < trail.length; i++) {
      const tp = trail[i], k = i / trail.length;
      ctx.fillStyle = `rgba(255,181,71,${0.18 * k * alpha})`;
      ctx.beginPath(); ctx.arc(tp.x, tp.y, 26 * size * k, 0, Math.PI * 2); ctx.fill();
    }

    // Halo
    const halo = ctx.createRadialGradient(x, y, 0, x, y, 90 * size);
    halo.addColorStop(0, `rgba(255,220,160,${0.6 * alpha})`);
    halo.addColorStop(1, "rgba(255,120,80,0)");
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(x, y, 90 * size, 0, Math.PI * 2); ctx.fill();

    // Body
    const r = 30 * size;
    const body = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
    body.addColorStop(0, `rgba(255,250,235,${alpha})`);
    body.addColorStop(1, `rgba(255,160,70,${alpha})`);
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

    // Face: eyes blink every few seconds, small smile
    const blink = (t % 3800) < 140 ? 0.15 : 1;
    ctx.fillStyle = `rgba(40,20,30,${alpha})`;
    for (const dx of [-0.32, 0.32]) {
      ctx.beginPath();
      ctx.ellipse(x + dx * r, y - r * 0.08, r * 0.09, r * 0.14 * blink, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = `rgba(40,20,30,${alpha})`;
    ctx.lineWidth = Math.max(1, r * 0.06);
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(x, y + r * 0.12, r * 0.22, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
    ctx.fillStyle = `rgba(255,94,126,${0.45 * alpha})`;
    for (const dx of [-0.55, 0.55]) {
      ctx.beginPath(); ctx.arc(x + dx * r, y + r * 0.18, r * 0.12, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawFinale(p) {
    const f = smooth(5.0, 5.8, p);
    if (f <= 0) return;
    const g = ctx.createLinearGradient(0, H, 0, 0);
    g.addColorStop(0, `rgba(255,94,126,${0.25 * f})`);
    g.addColorStop(0.5, `rgba(255,181,71,${0.08 * f})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawDim(p) {
    // Darken behind the manifesto text so it stays readable
    const d = smooth(4.0, 4.3, p) * (1 - smooth(4.9, 5.2, p));
    if (d > 0) { ctx.fillStyle = `rgba(0,0,0,${0.45 * d})`; ctx.fillRect(0, 0, W, H); }
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(64, now - last);
    last = now;
    current += (target - current) * Math.min(1, dt * 0.006);

    drawBackground(current, now);
    drawStars(current, dt);
    drawPortal(current, now);
    drawMotes(current, now);
    drawDim(current);
    drawFinale(current);
    drawLumi(current, now);

    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------
   * Boot
   * ------------------------------------------------------------------ */
  seed();
  applyLanguage();
  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);

  // Simulated preload (fonts + a short beat for the logo)
  const fill = $("#loadingFill");
  let prog = 0;
  const loader = setInterval(() => {
    prog = Math.min(90, prog + Math.random() * 18);
    fill.style.width = prog + "%";
  }, 120);
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.all([fontsReady, new Promise((r) => setTimeout(r, 1200))]).then(() => {
    clearInterval(loader);
    fill.style.width = "100%";
    setTimeout(() => {
      $("#loading").classList.add("is-done");
      document.body.classList.remove("is-loading");
      update();
    }, 300);
  });
})();
