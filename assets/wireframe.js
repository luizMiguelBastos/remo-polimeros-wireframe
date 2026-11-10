// Interações e rolagens do wireframe v0.9 (GSAP + ScrollTrigger + Lenis)
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const M = window.REMO_MATERIALS || [];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const motion = hasGsap && !reduced;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  // Aparência de cada resina no card flutuante do índice (sem imagens nesta fase)
  const LOOK = {
    "abs": "rgba(232,228,216,1)", "abs-pc": "rgba(58,63,74,1)", "asa": "rgba(214,209,196,1)",
    "pbt": "rgba(30,30,32,1)", "pc": "rgba(200,225,255,.32)", "pc-compostos": "rgba(91,98,112,1)",
    "pmma": "rgba(255,255,255,.22)", "pom": "rgba(242,242,242,1)", "san": "rgba(190,230,255,.3)"
  };

  // ---------- Menu mobile ----------
  const mt = $(".menu-toggle"), nav = $("#nav");
  if (mt && nav) {
    mt.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      mt.setAttribute("aria-expanded", String(open));
    });
    $$("a", nav).forEach(a => a.addEventListener("click", () => { nav.classList.remove("open"); mt.setAttribute("aria-expanded", "false"); }));
  }

  // ---------- Rolagem suave (Lenis) ----------
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToEl = el => {
    if (lenis) lenis.scrollTo(el, { offset: el.id === "sobre" ? 0 : -72, duration: 1.4, force: true });
    else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (href.startsWith("#")) {
      const el = href.length > 1 && $(href);
      if (!el) return;
      e.preventDefault();
      scrollToEl(el);
      return;
    }
    // Links para outras páginas do site passam pela transição com a logo
    const url = new URL(a.href, location.href);
    if (pageTx && url.origin === location.origin && /\.html$/.test(url.pathname) && url.href !== location.href) {
      e.preventDefault();
      pageTx.leave(url.href);
    }
  });

  // ---------- Títulos principais: o sinal final (. ! ?) fica em cor diferente da letra anterior ----------
  const pt = el => {
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let last = null, nd;
    while ((nd = tw.nextNode())) if (nd.nodeValue.trim()) last = nd;
    if (!last || last.parentElement.closest(".pt")) return;
    const txt = last.nodeValue.replace(/\s+$/, "");
    if (!/[.!?]$/.test(txt)) return;
    const sp = document.createElement("span");
    sp.className = "pt"; sp.textContent = txt.slice(-1);
    last.nodeValue = txt.slice(0, -1);
    last.parentNode.insertBefore(sp, last.nextSibling);
  };
  $$("main h1, main h2, .contact-band h2, .rail h2").forEach(h => { if (!h.closest(".lgc") && !h.classList.contains("ph-big")) pt(h); });

  // ---------- Header que some ao descer ----------
  const header = $("#header");
  let lastY = 0;
  // Sobre seção escura lisa o vidro do header clareia (cinza), em vez de escurecer; sobre foto e sobre seção clara fica como está
  let toneQ = false;
  const hdrTone = () => {
    toneQ = false;
    if (!header) return;
    const hit = document.elementsFromPoint(innerWidth / 2, header.offsetHeight / 2).find(e => !header.contains(e) && e.closest("section, footer"));
    const sec = hit && hit.closest("section, footer");
    header.classList.toggle("on-dark", !!sec && !sec.matches(".light, .lgc, .footer, .hero, .page-hero, .px-band") && !hit.closest(".env3-stage"));
  };
  const onScroll = y => {
    if (header) header.classList.toggle("scrolled", y > 60);
    if (!toneQ) { toneQ = true; requestAnimationFrame(hdrTone); }
    lastY = y;
  };
  addEventListener("load", hdrTone); addEventListener("resize", hdrTone); setTimeout(hdrTone, 600);
  if (lenis) lenis.on("scroll", e => onScroll(e.scroll));
  else addEventListener("scroll", () => onScroll(scrollY), { passive: true });

  // ---------- Cursor personalizado ----------
  const cur = $("#cursor"), curLabel = $("#cursor-label");
  if (cur && finePointer && hasGsap && !reduced) {
    const xTo = gsap.quickTo(cur, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(cur, "y", { duration: 0.35, ease: "power3" });
    addEventListener("pointermove", e => { xTo(e.clientX); yTo(e.clientY); });
    document.addEventListener("pointerover", e => {
      const t = e.target.closest("[data-cursor]");
      if (t) { curLabel.textContent = t.dataset.cursor; cur.classList.add("big"); }
    });
    document.addEventListener("pointerout", e => {
      const t = e.target.closest("[data-cursor]");
      if (t && !t.contains(e.relatedTarget)) cur.classList.remove("big");
    });
  } else if (cur) cur.remove();

  // ---------- Transição entre páginas (página branca com a logo) ----------
  // Moléculas da folha de transição e da abertura: poucas, lentas, nas bordas
  const molSheet = molC => {
    let molOn = false;
    const mctx = molC.getContext("2d");
    let nodes = [];
    const seed = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      molC.width = innerWidth * dpr; molC.height = innerHeight * dpr; mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Poucas moléculas, lentas, nas bordas: nunca entram na elipse central da logo
      const spot = () => { let x, y; do { x = Math.random() * innerWidth; y = Math.random() * innerHeight; } while (inCore(x, y, 1.15)); return [x, y]; };
      nodes = Array.from({ length: 11 }, () => { const [x, y] = spot(); return { x, y, vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45, r: 1.8 + Math.random() * 2.4, y2: Math.random() < .4 }; });
    };
    const inCore = (x, y, s = 1) => { const cx = innerWidth / 2, cy = innerHeight / 2, rx = Math.max(220, innerWidth * .26) * s, ry = Math.max(200, innerHeight * .3) * s; return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1; };
    const tick = () => {
      if (!molOn) return;
      mctx.clearRect(0, 0, innerWidth, innerHeight); mctx.lineCap = "round";
      for (const a of nodes) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > innerWidth) a.vx *= -1; if (a.y < 0 || a.y > innerHeight) a.vy *= -1;
        if (inCore(a.x, a.y)) { a.x -= a.vx; a.y -= a.vy; const dx = a.x - innerWidth / 2, dy = a.y - innerHeight / 2, m = Math.hypot(dx, dy) || 1, sp = Math.hypot(a.vx, a.vy); a.vx = dx / m * sp; a.vy = dy / m * sp; }
      }
      for (let i = 0; i < nodes.length; i++) for (let k = i + 1; k < nodes.length; k++) {
        const a = nodes[i], b = nodes[k], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 260) { const al = (1 - d / 260) * .3; mctx.strokeStyle = a.y2 ? `rgba(255,209,0,${al})` : `rgba(0,31,95,${al})`; mctx.lineWidth = 1.2; mctx.beginPath(); mctx.moveTo(a.x, a.y); mctx.lineTo(b.x, b.y); mctx.stroke(); }
      }
      for (const a of nodes) { mctx.fillStyle = a.y2 ? "rgba(255,209,0,.9)" : "rgba(0,31,95,.6)"; mctx.beginPath(); mctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); mctx.fill(); }
      requestAnimationFrame(tick);
    };
    const start = () => { seed(); molOn = true; tick(); };
    const stop = () => { molOn = false; };
    return { start, stop };
  };
  const pageTx = (() => {
    const sheet = $("#sheet");
    if (!sheet || !motion) { if (sheet) sheet.remove(); document.documentElement.classList.remove("tx-in"); return null; }
    const words = $$(".word span", sheet), inner = $(".sheet-inner", sheet);
    let busy = false;
    // Nome da página de destino e moléculas animadas na folha
    const PAGE = { "index.html": "Início", "": "Início", "produtos.html": "Produtos", "produto.html": "Produtos", "historia.html": "História", "valores.html": "Valores", "tecnologias.html": "Tecnologias", "onde-atuamos.html": "Onde atuamos", "contato.html": "Contato" };
    const dest = $("#sheet-dest"), meta = $(".sheet-meta", sheet), molC = $("#sheet-mol", sheet);
    const pageName = href => PAGE[new URL(href, location.href).pathname.split("/").pop()] || "Remo";
    if (molC) { const m = molSheet(molC); sheet.startMol = m.start; sheet.stopMol = m.stop; }
    const leave = url => {
      if (busy) return;
      busy = true;
      if (lenis) lenis.stop();
      if (dest) dest.textContent = pageName(url);
      if (sheet.startMol) sheet.startMol();
      gsap.timeline({ onComplete: () => { try { sessionStorage.setItem("remo-nav", "1"); } catch (e) {} location.href = url; } })
        .set(sheet, { display: "grid", yPercent: 100, opacity: 1 })
        .set(inner, { opacity: 1, y: 0 })
        .to(sheet, { yPercent: 0, duration: 0.75, ease: "expo.inOut" })
        .from([$(".sheet-mark", sheet), meta], { y: 20, opacity: 0, duration: 0.5, ease: "expo.out", stagger: 0.1 }, "-=0.3")
        .from(words, { yPercent: 110, duration: 0.6, ease: "expo.out", stagger: 0.04 }, "-=0.45");
    };
    // Chegando de outra página: a folha começa cobrindo e sai para cima
    const enter = () => {
      let from = false;
      try { from = sessionStorage.getItem("remo-nav") === "1"; sessionStorage.removeItem("remo-nav"); } catch (e) {}
      if (!from) { document.documentElement.classList.remove("tx-in"); return false; }
      // (sem contador: a folha nova só mostra a logo e o destino)
      if (dest) dest.textContent = pageName(location.href);
      if (sheet.startMol) sheet.startMol();
      gsap.set(sheet, { display: "grid", yPercent: 0, opacity: 1 });
      // A folha só sobe depois que a foto da abertura carregou (no máximo 1,5 s)
      const media = $(".page-hero .ph-media") || $(".hero-slides .slide");
      const src = media && (media.dataset.src || (media.style.backgroundImage.match(/url\(["']?([^"')]+)/) || [])[1]);
      const ready = new Promise(ok => {
        if (!src) return ok();
        const im = new Image(); im.onload = im.onerror = () => ok(); im.src = src;
        setTimeout(ok, 1500);
      });
      ready.then(() => gsap.timeline({ onComplete: () => { gsap.set(sheet, { display: "none" }); document.documentElement.classList.remove("tx-in"); if (sheet.stopMol) sheet.stopMol(); } })
        .to(inner, { y: -16, opacity: 0, duration: 0.35, ease: "power2.in", delay: 0.15 })
        .to(sheet, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, "-=0.15"));
      return true;
    };
    // Voltar pelo navegador pode restaurar a página com a folha cobrindo
    addEventListener("pageshow", ev => { if (ev.persisted) { busy = false; gsap.set(sheet, { display: "none" }); if (lenis) lenis.start(); } });
    return { leave, enter };
  })();
  const arrived = pageTx ? pageTx.enter() : false;

  // ---------- Abertura ----------
  const pre = $("#preloader");
  // Selo ISO: contorno inclinado medido em px para o traço e o brilho ficarem exatos
  const fitIso = () => {
    const box = $("#hero-iso"); if (!box) return;
    const svg = $("svg", box), w = box.offsetWidth, h = box.offsetHeight, k = h * .6;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    // Paralelogramo com os quatro vértices arredondados (curva no canto, raio r)
    const pts = [[k, .75], [w - .75, .75], [w - k, h - .75], [.75, h - .75]], r = 6;
    const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const near = (a, b) => { const d = Math.hypot(b[0] - a[0], b[1] - a[1]); return lerp(a, b, Math.min(.5, r / d)); };
    let d = "";
    pts.forEach((p, i) => {
      const prev = pts[(i + 3) % 4], next = pts[(i + 1) % 4], a = near(p, prev), b = near(p, next);
      d += `${i ? "L" : "M"}${a[0].toFixed(2)},${a[1].toFixed(2)} Q${p[0].toFixed(2)},${p[1].toFixed(2)} ${b[0].toFixed(2)},${b[1].toFixed(2)} `;
    });
    d += "Z";
    $$("path", svg).forEach(p => p.setAttribute("d", d));
    $(".hi-glass", box).style.clipPath = `path("${d}")`;
  };
  fitIso();
  addEventListener("resize", fitIso);
  if (document.fonts) document.fonts.ready.then(fitIso);
  const heroIn = () => {
    if (!motion) return;
    gsap.from(".hero [data-lines] .line > span", { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.1 });
    gsap.from(".hero [data-reveal]", { y: 30, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.12, delay: 0.35 });
    if ($(".hero .h-sep")) gsap.from(".hero .h-sep", { scaleX: 0, duration: 1, ease: "expo.inOut", delay: 0.5 });
    if ($("#hero-iso")) {
      gsap.timeline({ delay: 0.6 })
        .from("#hero-iso .hi-line", { strokeDashoffset: 100, duration: 1.4, ease: "power2.inOut" })
        .from("#hero-iso .hi-run", { opacity: 0, duration: 0.6 }, "-=0.3")
        .from("#hero-iso .hi-dot", { scale: 0, duration: 0.5, ease: "back.out(3)" }, "-=1")
        .from("#hero-iso .hi-in", { yPercent: 110, duration: 0.9, ease: "expo.out" }, "-=0.8");
    }
    if ($(".hero-scroll")) gsap.fromTo(".hero-scroll", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: "expo.out", delay: 0.9, clearProps: "opacity,visibility,transform" });
  };
  const endIntro = () => {
    document.body.classList.remove("is-loading");
    if (lenis) lenis.start();
    if (hasGsap) ScrollTrigger.refresh();
  };
  if (pre) {
    if (!motion || arrived) { pre.remove(); endIntro(); heroIn(); }
    else {
      if (lenis) lenis.stop();
      const short = sessionStorage.getItem("remo-intro") === "1";
      try { sessionStorage.setItem("remo-intro", "1"); } catch (e) {}
      const d = short ? 0.5 : 1;
      // Abertura igual à folha de transição: marca empilhada, destino, pontilhado e moléculas
      const pm = $(".sheet-mol", pre), mol = pm ? molSheet(pm) : null;
      if (mol) mol.start();
      const tl = gsap.timeline({ onComplete: () => { if (mol) mol.stop(); pre.remove(); endIntro(); } });
      tl.from($(".sheet-mark", pre), { y: 20, opacity: 0, duration: 0.6 * d, ease: "expo.out" }, 0.1)
        .from($$(".word span", pre), { yPercent: 110, duration: 0.7 * d, ease: "expo.out", stagger: 0.05 * d }, "-=0.35")
        .from($(".sheet-meta", pre), { y: 14, opacity: 0, duration: 0.5 * d, ease: "expo.out" }, "-=0.4")
        .to($(".pre-inner", pre), { y: -16, opacity: 0, duration: 0.35, ease: "power2.in" }, "+=" + (0.6 * d))
        .to(pre, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "-=0.15")
        .add(heroIn, "-=0.45");
    }
  } else if (arrived) heroIn();

  // ---------- Fundo do hero: campo de grânulos (substitui o vídeo nesta fase) ----------
  const cv = $("#field");
  if (cv) {
    const ctx = cv.getContext("2d");
    let W, H, dpr, parts = [], mx = 0, my = 0, visible = true;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(140, W * H / 9000));
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H, z: 0.3 + Math.random() * 0.9,
        r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.004,
        vy: 0.08 + Math.random() * 0.25, y2: Math.random() < 0.08
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        if (!reduced) { p.y += p.vy * p.z; p.r += p.vr; if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; } }
        const px = p.x + mx * 18 * p.z, py = p.y + my * 12 * p.z, s = 7 * p.z;
        ctx.save(); ctx.translate(px, py); ctx.rotate(p.r);
        ctx.fillStyle = p.y2 ? `rgba(255,209,0,${0.35 + p.z * 0.4})` : `rgba(163,171,188,${0.08 + p.z * 0.22})`;
        ctx.beginPath(); ctx.ellipse(0, 0, s * 1.25, s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${0.05 + p.z * 0.12})`;
        ctx.beginPath(); ctx.ellipse(-s * 0.35, -s * 0.35, s * 0.4, s * 0.22, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    };
    const loop = () => { if (visible) draw(); requestAnimationFrame(loop); };
    resize(); addEventListener("resize", resize);
    addEventListener("pointermove", e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(cv);
    if (reduced) draw(); else loop();
  }

  // ---------- Fundo do hero: fotos dos setores alternando ----------
  const slidesBox = $("#hero-slides");
  if (slidesBox) {
    const all = $$(".slide", slidesBox);
    const sector = $("#hero-sector");
    // Só entram as fotos que existem; sem fotos, fica o campo de grânulos
    Promise.all(all.map(sl => new Promise(ok => {
      const img = new Image();
      img.onload = () => { sl.style.backgroundImage = `url(${sl.dataset.src})`; ok(sl); };
      img.onerror = () => { sl.remove(); ok(null); };
      img.src = sl.dataset.src;
    }))).then(list => {
      const slides = list.filter(Boolean);
      if (!slides.length) { sector.remove(); return; }
      document.querySelector(".hero").classList.add("has-photos");
      let i = 0;
      const DUR = 8;
      const show = n => {
        slides.forEach((sl, k) => sl.classList.toggle("on", k === n));
        $("#hs-no").textContent = String(n + 1).padStart(2, "0");
        $("#hs-label").textContent = slides[n].dataset.label;
        if (hasGsap && motion) {
          gsap.fromTo(slides[n], { scale: 1.03 }, { scale: 1, duration: DUR + 1.5, ease: "none" });
          gsap.fromTo("#hs-label", { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: "expo.out" });
          gsap.fromTo("#hs-bar", { scaleX: 0 }, { scaleX: 1, duration: DUR, ease: "none" });
        }
      };
      show(0);
      if (slides.length > 1 && motion) setInterval(() => { i = (i + 1) % slides.length; show(i); }, DUR * 1000);
    });
  }

  // ---------- Molécula da marca: fundo de pontos e linhas nas seções escuras ----------
  const molField = host => {
    const cv = document.createElement("canvas");
    cv.className = "mol-bg"; cv.setAttribute("aria-hidden", "true");
    host.prepend(cv);
    const ctx = cv.getContext("2d");
    const ink = host.dataset.mol === "ink";
    let W = 0, H = 0, nodes = [], mx = -999, my = -999, on = false;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const pW = W, pH = H;
      W = host.clientWidth; H = host.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Já desenhadas e mesma largura (só a altura mudou, ex.: conteúdo trocando): reposiciona na proporção, sem sortear de novo
      if (nodes.length && pW === W && pH) { const k = H / pH; nodes.forEach(a => { a.y *= k; }); return; }
      // data-mol-edge: moléculas só nas faixas laterais, deixando o miolo livre para o conteúdo
      // No celular a faixa fica só na margem de 24 px, sem passar por cima dos botões das linhas
      band = !edge ? 0 : W < 700 ? 22 : Math.min(W / 2, Math.max(120, (W - Math.min(W, 1320)) / 2 + 40));
      const area = edge ? 2 * band * H : W * H;
      const n = Math.round(Math.min(90, area / 16000) * (+host.dataset.molDensity || 1));
      nodes = Array.from({ length: n }, (_, i) => {
        const x = edge ? (i % 2 ? W - Math.random() * band : Math.random() * band) : Math.random() * W;
        return { x, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, r: 1.2 + Math.random() * 2.2, y2: Math.random() < .45, right: edge && i % 2 === 1 };
      });
    };
    const edge = "molEdge" in host.dataset;
    let band = 0;
    const LINK = 130;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const a of nodes) {
        if (!reduced) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > W) a.vx *= -1; if (a.y < 0 || a.y > H) a.vy *= -1;
          if (edge && (a.right ? a.x < W - band : a.x > band)) { a.x -= a.vx; a.vx *= -1; }
        }
      }
      ctx.lineCap = "round";
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) { const al = (1 - d / LINK) * (ink ? .28 : .22); ctx.strokeStyle = a.y2 ? `rgba(255,209,0,${al})` : (ink ? `rgba(0,31,95,${al})` : `rgba(110,140,205,${al})`); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        const dm = Math.hypot(a.x - mx, a.y - my);
        if (dm < 180) { ctx.strokeStyle = `rgba(255,209,0,${(1 - dm / 180) * .35})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.stroke(); }
      }
      for (const a of nodes) {
        ctx.fillStyle = a.y2 ? "rgba(255,209,0,.85)" : (ink ? "rgba(0,31,95,.55)" : "rgba(110,140,205,.65)");
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
    };
    const loop = () => { if (on) draw(); requestAnimationFrame(loop); };
    size(); addEventListener("resize", size);
    // A seção muda de altura depois da carga (conteúdo animado, fontes): redesenha no tamanho novo para não esticar
    if (window.ResizeObserver) { let lw = W, lh = H; new ResizeObserver(() => { if (host.clientWidth !== lw || host.clientHeight !== lh) { size(); lw = W; lh = H; } }).observe(host); }
    host.addEventListener("pointermove", e => { const r = host.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    host.addEventListener("pointerleave", () => { mx = my = -999; });
    new IntersectionObserver(([en]) => { on = en.isIntersecting; }).observe(host);
    if (reduced) { on = true; draw(); } else loop();
  };
  // Fundos escuros: linhas no estilo suminagashi (tinta marmorizada na água). São as curvas de nível de um campo de
  // distâncias deformado: anéis irregulares em volta de alguns centros, que se encontram sem se cruzar. Bem sutis e lentas.
  const sumiField = (host, idx) => {
    const cv = document.createElement("canvas");
    cv.className = "mol-bg flow-bg"; cv.setAttribute("aria-hidden", "true");
    host.prepend(cv);
    const ctx = cv.getContext("2d");
    const CELL = 12, GAP = 30, TILE = 540;
    let W = 0, H = 0, cols = 0, rows = 0, grid = null, drops = [], mx = -999, my = -999, on = false, t = idx * 7.3, tick = 0;
    // Sorteio com semente: os centros não mudam de lugar quando a seção muda de altura
    const rnd = (a, b) => { const v = Math.sin(a * 127.1 + b * 311.7 + idx * 74.7) * 43758.5453; return v - Math.floor(v); };
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      W = host.clientWidth; H = host.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / CELL) + 1; rows = Math.ceil(H / CELL) + 1;
      grid = new Float32Array(cols * rows);
      const tc = Math.max(1, Math.round(W / TILE)), tr = Math.max(1, Math.round(H / TILE)), tw = W / tc, th = H / tr;
      drops = [];
      for (let r = 0; r < tr; r++) for (let c = 0; c < tc; c++)
        drops.push({ x: (c + .15 + rnd(c, r) * .7) * tw, y: (r + .15 + rnd(r + 9, c) * .7) * th, s: .8 + rnd(c + 3, r + 5) * .5, o: rnd(c + 7, r + 2) * GAP * 3 });
      draw(true);
    };
    const draw = full => {
      if (!grid) return;
      // Só a faixa da seção que está na tela é calculada
      const top = host.getBoundingClientRect().top;
      const r0 = full ? 0 : Math.max(0, Math.floor((-top - 40) / CELL)), r1 = full ? rows - 1 : Math.min(rows - 1, Math.ceil((innerHeight - top + 40) / CELL));
      if (r1 <= r0) return;
      if (!reduced) t += .004;
      for (let r = r0; r <= r1; r++) {
        const y = r * CELL;
        for (let c = 0; c < cols; c++) {
          const x = c * CELL;
          const wx = x + 40 * Math.sin(y * .0061 + t) + 22 * Math.sin((x + y) * .0113 - t * 1.3);
          const wy = y + 40 * Math.sin(x * .0057 - t * .8) + 22 * Math.sin((x - y) * .0097 + t * 1.1);
          let best = 1e9, bi = 0;
          for (let k = 0; k < drops.length; k++) { const d = drops[k], v = Math.hypot(wx - d.x, wy - d.y) * d.s + d.o; if (v < best) { best = v; bi = k; } }
          const dm = Math.hypot(x - mx, y - my);
          if (dm < 170) best += (1 - dm / 170) * (1 - dm / 170) * 26;
          grid[r * cols + c] = best / GAP + .4 * Math.sin(best * .017 + bi);
        }
      }
      ctx.clearRect(0, r0 * CELL, W, (r1 - r0) * CELL);
      const gold = [];
      ctx.beginPath();
      for (let r = r0; r < r1; r++) for (let c = 0; c < cols - 1; c++) {
        const i = r * cols + c, a = grid[i], b = grid[i + 1], d = grid[i + cols], e = grid[i + cols + 1];
        const lo = Math.min(a, b, d, e), hi = Math.max(a, b, d, e);
        for (let L = Math.ceil(lo); L < hi; L++) {
          const x = c * CELL, y = r * CELL, q = [];
          if ((a < L) !== (b < L)) q.push(x + CELL * (L - a) / (b - a), y);
          if ((b < L) !== (e < L)) q.push(x + CELL, y + CELL * (L - b) / (e - b));
          if ((d < L) !== (e < L)) q.push(x + CELL * (L - d) / (e - d), y + CELL);
          if ((a < L) !== (d < L)) q.push(x, y + CELL * (L - a) / (d - a));
          for (let k = 0; k + 3 < q.length; k += 4) {
            if (L % 7 === 3) gold.push(q[k], q[k + 1], q[k + 2], q[k + 3]);
            else { ctx.moveTo(q[k], q[k + 1]); ctx.lineTo(q[k + 2], q[k + 3]); }
          }
        }
      }
      ctx.lineWidth = 1; ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(110,140,205,.11)"; ctx.stroke();
      ctx.beginPath();
      for (let k = 0; k < gold.length; k += 4) { ctx.moveTo(gold[k], gold[k + 1]); ctx.lineTo(gold[k + 2], gold[k + 3]); }
      ctx.strokeStyle = "rgba(255,209,0,.11)"; ctx.stroke();
    };
    // Um quadro sim, um não: o movimento é lento e o custo cai pela metade
    const loop = () => { if (on && (tick++ & 1)) draw(false); requestAnimationFrame(loop); };
    size(); addEventListener("resize", size);
    if (window.ResizeObserver) { let lw = W, lh = H; new ResizeObserver(() => { if (host.clientWidth !== lw || host.clientHeight !== lh) { size(); lw = W; lh = H; } }).observe(host); }
    host.addEventListener("pointermove", e => { const r = host.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    host.addEventListener("pointerleave", () => { mx = my = -999; });
    new IntersectionObserver(([en]) => { on = en.isIntersecting; }).observe(host);
    if (!reduced) loop();
  };
  // Toda seção azul-escura sem foto de fundo ganha as linhas suminagashi
  $$("main section:not(.light):not(.hero):not(.page-hero):not(.px-band):not(.lgc):not([data-mol])").forEach(sec => sec.setAttribute("data-mol", ""));
  $$("[data-mol]").forEach((host, k) => (host.dataset.mol === "ink" ? molField : sumiField)(host, k));

  // ---------- Cursor: rastro de moléculas atrás do ponto amarelo ----------
  if (finePointer && !reduced && $("#cursor")) {
    const tc = document.createElement("canvas");
    tc.className = "cursor-trail"; tc.setAttribute("aria-hidden", "true");
    document.body.appendChild(tc);
    const tx = tc.getContext("2d");
    const pts = [];
    const sizeT = () => { const dpr = Math.min(devicePixelRatio || 1, 2); tc.width = innerWidth * dpr; tc.height = innerHeight * dpr; tx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    sizeT(); addEventListener("resize", sizeT);
    addEventListener("pointermove", e => { pts.push({ x: e.clientX, y: e.clientY, t: performance.now() }); if (pts.length > 26) pts.shift(); });
    const trail = () => {
      const now = performance.now();
      while (pts.length && now - pts[0].t > 520) pts.shift();
      tx.clearRect(0, 0, innerWidth, innerHeight);
      tx.lineCap = "round"; tx.lineJoin = "round";
      for (let k = 1; k < pts.length; k++) {
        const a = pts[k - 1], b = pts[k], life = 1 - (now - b.t) / 520;
        tx.strokeStyle = `rgba(255,209,0,${life * .55})`; tx.lineWidth = 2 * life + .4;
        tx.beginPath(); tx.moveTo(a.x, a.y); tx.lineTo(b.x, b.y); tx.stroke();
        if (k % 5 === 0) { tx.fillStyle = `rgba(255,209,0,${life * .8})`; tx.beginPath(); tx.arc(b.x, b.y, 2.6 * life + 1, 0, Math.PI * 2); tx.fill(); }
      }
      requestAnimationFrame(trail);
    };
    trail();
  }

  // ---------- Seções brancas: cotas técnicas em Navy ----------
  const COTAS = ["Ø 3,0 mm", "± 0,02 mm", "Shore 80D", "MFI 12 g/10 min", "ΔE < 0,5", "23 °C · 50% UR", "ISO 527", "1,05 g/cm³"];
  $$("section.light").forEach((sec, k) => {
    const h = document.createElement("div"); h.className = "cota h"; h.setAttribute("aria-hidden", "true");
    h.innerHTML = `<i></i><span>${COTAS[k % COTAS.length]}</span>`;
    const v = document.createElement("div"); v.className = "cota v"; v.setAttribute("aria-hidden", "true");
    v.innerHTML = `<i></i><span>${COTAS[(k + 3) % COTAS.length]}</span>`;
    sec.prepend(h, v);
    if (motion) {
      gsap.from($("i", h), { scaleX: 0, duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: sec, start: "top 80%" } });
      gsap.from($("i", v), { scaleY: 0, duration: 1.4, ease: "expo.inOut", delay: .2, scrollTrigger: { trigger: sec, start: "top 80%" } });
      gsap.from($$("span", h).concat($$("span", v)), { opacity: 0, duration: .8, delay: .9, scrollTrigger: { trigger: sec, start: "top 80%" } });
    }
  });

  // ---------- Hero: parallax em camadas seguindo o mouse ----------
  const heroBox = $(".hero");
  if (heroBox && motion && finePointer) {
    const layers = [[".hero-slides", -8, -5], ["#field", -8, -5], [".hero-inner", 5, 3], [".hero-sector", 8, 4], [".hero-iso", 10, 6]]
      .map(([sel, ax, ay]) => { const el = $(sel, heroBox); return el && { x: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3" }), y: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3" }), ax, ay }; })
      .filter(Boolean);
    gsap.set($(".hero-slides", heroBox), { scale: 1.02 });
    heroBox.addEventListener("pointermove", e => {
      const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      layers.forEach(l => { l.x(nx * l.ax); l.y(ny * l.ay); });
    });
    heroBox.addEventListener("pointerleave", () => layers.forEach(l => { l.x(0); l.y(0); }));
  }

  // ---------- Header: nome da seção atual ----------
  const hdrSec = $("#hdr-sec");
  if (hdrSec && hasGsap) {
    $$("main section, section.contact-band, section.end-manifesto, section.rail").forEach(sec => {
      const eb = $(".eyebrow", sec);
      const name = eb ? eb.textContent.trim() : (sec.getAttribute("aria-label") || "");
      if (!name || sec.classList.contains("hero")) return;
      ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: st => { if (st.isActive) { hdrSec.textContent = name; hdrSec.classList.add("on"); } } });
    });
    // Na home, o primeiro trecho também tem nome: "Home"
    const homeHero = $("section.hero");
    ScrollTrigger.create({ start: 0, end: () => innerHeight * .6, onToggle: st => {
      if (!st.isActive) return;
      if (homeHero) { hdrSec.textContent = "Home"; hdrSec.classList.add("on"); } else hdrSec.classList.remove("on");
    } });
    if (homeHero && scrollY < innerHeight * .6) { hdrSec.textContent = "Home"; hdrSec.classList.add("on"); }
  }

  // ---------- Fotos: aberturas, cards da home, faixa do institucional ----------
  if (motion) {
    $$(".page-hero.photo .ph-media").forEach(m => {
      gsap.fromTo(m, { scale: 1.15 }, { scale: 1, duration: 2.4, ease: "expo.out" });
      gsap.to(m, { yPercent: 12, ease: "none", scrollTrigger: { trigger: m.parentElement, start: "top top", end: "bottom top", scrub: true } });
    });
    const grid = $(".hub-grid");
    if (grid) {
      const cards = $$(".hub-card", grid);
      gsap.set(cards, { y: 80, opacity: 0 });
      gsap.set($$(".hc-img", grid), { clipPath: "inset(100% 0 0 0)" });
      ScrollTrigger.batch(cards, {
        start: "top 88%", once: true,
        onEnter: batch => {
          gsap.to(batch, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.12 });
          gsap.to(batch.map(c => $(".hc-img", c)), { clipPath: "inset(0% 0 0 0)", duration: 1.3, ease: "expo.inOut", stagger: 0.12, delay: 0.15 });
        }
      });
    }
    // História, seção LG Chem: fotos do mosaico entram em cortina e têm leve paralaxe
    const lgm = $(".lgc-mosaic");
    if (lgm) {
      const tiles = $$(".lgc-ph", lgm);
      gsap.set(tiles, { clipPath: "inset(100% 0 0 0)" });
      ScrollTrigger.batch(tiles, { start: "top 92%", once: true, onEnter: b => gsap.to(b, { clipPath: "inset(0% 0 0 0)", duration: 1.3, ease: "expo.inOut", stagger: 0.1 }) });
      tiles.forEach(tile => gsap.fromTo($("i", tile), { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: tile, start: "top bottom", end: "bottom top", scrub: true } }));
    }
    $$(".px-band .px-media").forEach(m => {
      gsap.fromTo(m, { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: m.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    $$(".contact-band .cb-media").forEach(m => {
      gsap.fromTo(m, { scale: 1.15 }, { scale: 1, ease: "none", scrollTrigger: { trigger: m.parentElement, start: "top bottom", end: "bottom bottom", scrub: true } });
    });
  }

  // ---------- Onde atuamos: as horas do dia acendem no centro da tela ----------
  const dayRows = $$("#day li");
  if (dayRows.length) {
    if (motion) dayRows.forEach(li => ScrollTrigger.create({ trigger: li, start: "top 56%", end: "bottom 44%", toggleClass: "on" }));
    else dayRows.forEach(li => li.classList.add("on"));
  }

  // ---------- Cards de segmentos e do meio ambiente entram em cascata ----------
  if (motion) {
    [".seg-grid", ".env-grid"].forEach(sel => {
      const g = $(sel);
      if (!g) return;
      const items = [...g.children];
      gsap.from(items, { y: 70, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: g, start: "top 85%" } });
    });
  }

  // ---------- Aberturas das páginas: mesmo movimento do hero principal ----------
  $$(".page-hero").forEach(ph => {
    if (!motion) return;
    gsap.from($$("h1 .line > span", ph), { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.1, delay: 0.1 });
    gsap.from($$(".eyebrow, .crumbs", ph), { y: 20, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.08 });
    if ($(".h-sep", ph)) gsap.from($(".h-sep", ph), { scaleX: 0, duration: 1, ease: "expo.inOut", delay: 0.5 });
    if ($(".page-cue", ph)) gsap.fromTo($(".page-cue", ph), { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: "expo.out", delay: 0.9, clearProps: "opacity,visibility,transform" });
  });

  // ---------- Palavra grande das aberturas: letras sobem ----------
  $$(".ph-big").forEach(big => {
    big.innerHTML = [...big.textContent].map(c => c === " " ? " " : `<span class="ch">${c}</span>`).join("");
    if (motion) gsap.from($$(".ch", big), { yPercent: 115, rotate: 6, duration: 1.1, ease: "expo.out", stagger: 0.05, delay: big.closest(".hero") ? 0.2 : 0.1 });
  });

  // ---------- Hero e aberturas: subtítulo com a mesma largura da linha grande do título ----------
  $$(".ph-home").forEach(box => {
    const bigLine = $(".h-big", box), lead = $(".ph-side .lead", box);
    if (!bigLine || !lead) return;
    // Deixa espaço à direita para o "Explore" quando a frase grande é muito longa
    const fit = () => { lead.style.width = Math.max(280, Math.round(bigLine.getBoundingClientRect().width)) + "px"; lead.style.maxWidth = innerWidth > 700 ? "calc(100% - 160px)" : "100%"; };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(fit);
    addEventListener("resize", fit);
  });

  // ---------- Palavra que troca por sinônimos (hero e aberturas) ----------
  $$(".swap[data-words]").forEach((swap, n) => {
    const WORDS = swap.dataset.words.split("|");
    let wi = 0;
    if (!motion || WORDS.length < 2) return;
    let busy = false;
    setTimeout(() => setInterval(() => {
      if (busy || document.hidden) return;
      busy = true;
      const sep = swap.closest(".ph-home, .ph-txt") && $(".h-sep", swap.closest(".ph-home, .ph-txt"));
      if (sep) gsap.to(sep, { width: 96, duration: 0.35, ease: "power2.out", yoyo: true, repeat: 1 });
      $$(".sw-word", swap).slice(0, -1).forEach(w => w.remove());
      wi = (wi + 1) % WORDS.length;
      const cur = $(".sw-word", swap);
      const next = document.createElement("span");
      next.className = "sw-word"; next.textContent = WORDS[wi]; pt(next);
      next.style.position = "absolute"; next.style.left = "0"; next.style.top = "0"; next.style.whiteSpace = "nowrap";
      swap.appendChild(next);
      gsap.timeline({ onComplete: () => { cur.remove(); next.style.position = ""; next.style.whiteSpace = ""; busy = false; } })
        .to(cur, { yPercent: -110, opacity: 0, duration: 0.6, ease: "expo.in" })
        .fromTo(next, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: "expo.out" }, 0.35)
        .to(swap, { width: () => next.offsetWidth, duration: 0.6, ease: "expo.inOut" }, 0.2)
        .set(swap, { clearProps: "width" });
    }, 3000), 1800 + n * 150);
  });

  // ---------- Botões magnéticos ----------
  if (motion && finePointer) {
    $$(".btn").forEach(btn => {
      btn.addEventListener("pointermove", e => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: "power3.out" });
      });
      btn.addEventListener("pointerleave", () => gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" }));
    });
  }

  // ---------- Escolha por onde começar: detalhes ----------
  if (motion && $(".hub-deco")) {
    gsap.from(".hub-deco .hd-blue", { scaleX: 0, duration: 1.2, ease: "expo.inOut", scrollTrigger: { trigger: ".hub-head", start: "top 85%" } });
    gsap.from(".hub-dot", { scale: 0, rotate: 90, duration: 0.8, ease: "back.out(3)", delay: 0.5, scrollTrigger: { trigger: ".hub-head", start: "top 85%" } });
  }

  // ---------- Escolha por onde começar: cards em velocidades diferentes ----------
  if ($(".hub-grid") && motion) {
    gsap.matchMedia().add("(min-width: 901px)", () => {
      $$(".hub-grid .hub-card").forEach((c, k) => {
        const amt = [8, -6, 12][k % 3];
        gsap.fromTo(c, { yPercent: amt }, { yPercent: -amt, ease: "none", scrollTrigger: { trigger: ".hub-grid", start: "top bottom", end: "bottom top", scrub: 1 } });
      });
    });
  }

  // ---------- Hero: a seta de rolagem some quando a pessoa começa a rolar ----------
  const cue = $(".hero-scroll");
  if (cue) {
    const hideCue = y => cue.classList.toggle("gone", y > 40);
    if (lenis) lenis.on("scroll", e => hideCue(e.scroll)); else addEventListener("scroll", () => hideCue(scrollY), { passive: true });
  }

  // ---------- Hero e aberturas: "Explore" centralizado na altura do subtítulo ----------
  $$(".hero-inner > .hero-scroll, .ph-wrap > .hero-scroll").forEach(cueEl => {
    const leadEl = $(".ph-home .ph-side .lead", cueEl.parentElement);
    if (!leadEl) return;
    const alignCue = () => {
      // Desconta o deslocamento das animações de entrada para medir a posição final
      const ly = hasGsap ? (gsap.getProperty(leadEl, "y") || 0) : 0, cy = hasGsap ? (gsap.getProperty(cueEl, "y") || 0) : 0;
      const box = cueEl.parentElement.getBoundingClientRect(), l = leadEl.getBoundingClientRect(), c = cueEl.getBoundingClientRect();
      cueEl.style.bottom = Math.round(box.bottom - (l.bottom - ly) + (l.height - c.height) / 2) + "px";
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(alignCue);
    setTimeout(alignCue, 2600);
    addEventListener("resize", alignCue);
  });

  // ---------- Aberturas internas: "Explore" leva à próxima seção e some ao rolar ----------
  $$(".page-cue").forEach(pc => {
    const next = pc.closest("section").nextElementSibling;
    pc.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); if (next) scrollToEl(next); });
    const hide = y => pc.classList.toggle("gone", y > 40);
    if (lenis) lenis.on("scroll", e => hide(e.scroll)); else addEventListener("scroll", () => hide(scrollY), { passive: true });
  });

  // ---------- Footer: voltar ao topo ----------
  $$("[data-top]").forEach(a => a.addEventListener("click", e => {
    e.preventDefault(); e.stopPropagation();
    if (lenis) lenis.scrollTo(0, { duration: 1.6 }); else scrollTo({ top: 0, behavior: "smooth" });
  }));

  // ---------- Esteira de seções: rolagem lateral presa à rolagem (desktop) ----------
  const railTrack = $(".rail:not(.rail-free) .rail-track");
  if (railTrack && motion) {
    gsap.matchMedia().add("(min-width: 901px)", () => {
      const dist = () => Math.max(0, railTrack.scrollWidth - innerWidth + 24);
      gsap.to(railTrack, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: railTrack.closest(".rail-pin"), start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true } });
    });
    gsap.from($$(".rail-card", railTrack), { y: 60, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: railTrack, start: "top 85%" } });
  }


  // ---------- Rolagens (em ordem de página, para os pins calcularem certo) ----------
  if (motion) {
    // Progresso (barra superior no celular + trilho lateral no desktop)
    if ($("#progress")) gsap.to("#progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });


    // Manifesto: travado até a última palavra acender
    const mf = $("#manifesto");
    if (mf) {
      mf.innerHTML = mf.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(" ");
      const words = $$(".w", mf);
      gsap.timeline({ scrollTrigger: { trigger: "#sobre", start: "top top", end: () => "+=" + innerHeight * 1.4, pin: true, scrub: 0.6, invalidateOnRefresh: true } })
        .to(words, { opacity: 1, stagger: 0.1, ease: "none" })
        .to("#m-bar", { scaleX: 1, ease: "none", duration: words.length * 0.1 }, 0);
    }

    // Títulos em linhas e revelação genérica (fora do hero)
    $$("[data-lines]").forEach(h => {
      if (h.closest(".hero") || h.closest(".page-hero")) return;
      gsap.from($$(".line > span", h), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: h, start: "top 85%" } });
    });
    $$("[data-reveal]").forEach(el => {
      if (el.closest(".hero")) return;
      gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
    });

    // Contadores
    $$("[data-count]").filter(el => !el.closest(".hero")).forEach(el => {
      const o = { v: 0 };
      gsap.to(o, { v: +el.dataset.count, duration: 1.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" }, onUpdate: () => { el.textContent = Math.round(o.v); } });
    });

    // Seções horizontais fixas (somente desktop)
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", () => {
      const tlEl = $("#timeline");
      if (tlEl) {
        const dist = () => Math.max(0, tlEl.scrollWidth - innerWidth);
        const st = { trigger: "#tl-pin", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true };
        gsap.to(tlEl, { x: () => -dist(), ease: "none", scrollTrigger: st });
        gsap.to("#tl-fill", { scaleX: 1, ease: "none", scrollTrigger: { ...st, pin: false } });
      }
      const steps = $("#steps");
      if (steps) {
        const dist = () => steps.scrollWidth - innerWidth;
        const cards = $$(".step", steps);
        const setStep = i => {
          cards.forEach((c, k) => c.classList.toggle("active", k === i));
          $("#step-count").textContent = `0${i + 1} / 04`;
        };
        const tw = gsap.to(steps, {
          x: () => -dist(), ease: "none",
          scrollTrigger: {
            trigger: "#hscroll", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true,
            onUpdate: s => setStep(Math.min(cards.length - 1, Math.round(s.progress * (cards.length - 1))))
          }
        });
        setStep(0);
        // Clicar num card leva a esteira até ele
        const onClick = e => {
          const c = e.target.closest(".step");
          if (!c) return;
          const st = tw.scrollTrigger, i = cards.indexOf(c);
          lenis ? lenis.scrollTo(st.start + (st.end - st.start) * i / (cards.length - 1), { duration: 1.2 }) : scrollTo(0, st.start + (st.end - st.start) * i / (cards.length - 1));
        };
        steps.addEventListener("click", onClick);
      }
    });

    mm.add("(max-width: 900px)", () => {
      $$("#steps .step").forEach(c => ScrollTrigger.create({ trigger: c, start: "top 70%", end: "bottom 30%", toggleClass: "active" }));
    });

    // Selo ISO gira com a rolagem
    if ($("#qualidade")) gsap.to("#ring-g", { rotation: 200, transformOrigin: "50% 50%", ease: "none", scrollTrigger: { trigger: "#qualidade", start: "top bottom", end: "bottom top", scrub: true } });
    if ($("#seal")) gsap.from("#seal .core", { scale: 0.7, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: "#seal", start: "top 75%" } });

  } else {
    $$("[data-count]").forEach(el => { el.textContent = el.dataset.count; });
  }


  // ---------- Grânulo 3D (Three.js): card flutuante do índice de materiais ----------
  // Devolve null sem WebGL; quem chama mantém o fallback.
  function makePellet3D(box, cvs, opts = {}) {
    if (!box || !cvs || !window.THREE) return null;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: true }); } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0.4, opts.distance || 7);

    // Perfil de um pellet cilíndrico com bordas arredondadas, girado em torno do eixo
    const R = 1, Hh = 0.62, e = 0.34, pts = [new THREE.Vector2(0, -Hh)];
    for (let i = 0; i <= 8; i++) { const t = (i / 8) * Math.PI / 2; pts.push(new THREE.Vector2(R - e + Math.sin(t) * e, -Hh + e - Math.cos(t) * e)); }
    for (let i = 0; i <= 8; i++) { const t = (i / 8) * Math.PI / 2; pts.push(new THREE.Vector2(R - e + Math.cos(t) * e, Hh - e + Math.sin(t) * e)); }
    pts.push(new THREE.Vector2(0, Hh));
    const geo = new THREE.LatheGeometry(pts, 64);
    geo.computeVertexNormals();

    const mat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0xe8e4d8).convertSRGBToLinear(), roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.15, transparent: true, opacity: 1 });
    const main = new THREE.Mesh(geo, mat);
    main.rotation.set(0.9, 0, 0.35);
    const group = new THREE.Group();
    group.add(main);

    const small = [];
    if (opts.orbit) for (let i = 0; i < 7; i++) {
      const m = new THREE.Mesh(geo, mat);
      m.scale.setScalar(0.14 + Math.random() * 0.12);
      m.userData = { a: (i / 7) * Math.PI * 2, r: 1.9 + Math.random() * 0.5, y: (Math.random() - 0.5) * 1.6, sp: 0.15 + Math.random() * 0.2, rx: Math.random() * 3, ry: Math.random() * 3 };
      group.add(m); small.push(m);
    }
    scene.add(group);

    scene.add(new THREE.HemisphereLight(0xf4f5f7, opts.light ? 0x9aa3b5 : 0x050b1a, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.05); key.position.set(3, 4, 5); scene.add(key);
    const rim = new THREE.PointLight(0xffd100, opts.light ? 0.5 : 1.2, 20); rim.position.set(-4, -1.5, -2); scene.add(rim);
    const fillL = new THREE.PointLight(0x7fa8ff, 0.5, 20); fillL.position.set(-3, 3, 4); scene.add(fillL);

    const target = { color: new THREE.Color(0xe8e4d8).convertSRGBToLinear(), a: 1 };
    let dragging = false, lx = 0, ly = 0, vx = 0.004, vy = 0, rotY = 0, rotX = 0.15, spin = 0, hx = 0, hy = 0;
    box.addEventListener("pointerdown", ev => { dragging = true; lx = ev.clientX; ly = ev.clientY; box.setPointerCapture(ev.pointerId); });
    box.addEventListener("pointermove", ev => {
      const r = box.getBoundingClientRect();
      hx = (ev.clientX - r.left) / r.width - 0.5; hy = (ev.clientY - r.top) / r.height - 0.5;
      if (!dragging) return;
      vx = (ev.clientX - lx) * 0.006; vy = (ev.clientY - ly) * 0.006; lx = ev.clientX; ly = ev.clientY;
      rotY += vx; rotX = Math.max(-1, Math.min(1, rotX + vy));
    });
    const up = () => { dragging = false; };
    box.addEventListener("pointerup", up); box.addEventListener("pointercancel", up);
    box.addEventListener("pointerleave", () => { hx = hy = 0; });

    const resize = () => {
      const w = box.clientWidth, h = box.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    resize(); addEventListener("resize", resize);

    let visible = false, t0 = performance.now();
    const api = { mat, target, onFrame: null, spin: () => { spin += 2.4; } };
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) resize(); }).observe(box);
    const frame = now => {
      requestAnimationFrame(frame);
      if (!visible || api.paused) return;
      const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
      if (!dragging && !reduced) { vx += (0.004 - vx) * 0.04; vy *= 0.92; rotY += vx; }
      if (spin > 0.001) { const d = spin * 0.08; rotY += d; spin -= d; }
      group.rotation.y = rotY + hx * 0.4;
      group.rotation.x = rotX + hy * 0.3;
      main.position.y = reduced ? 0 : Math.sin(now / 900) * 0.08;
      small.forEach(m => {
        const u = m.userData; if (!reduced) u.a += u.sp * dt;
        m.position.set(Math.cos(u.a) * u.r, u.y + Math.sin(u.a * 2) * 0.15, Math.sin(u.a) * u.r * 0.6);
        m.rotation.set(u.rx + u.a, u.ry + u.a * 0.7, 0);
      });
      mat.color.lerp(target.color, 0.12);
      mat.opacity += (target.a - mat.opacity) * 0.12;
      mat.depthWrite = mat.opacity > 0.9;
      if (api.onFrame) api.onFrame(now);
      renderer.render(scene, camera);
    };
    requestAnimationFrame(frame);
    return api;
  }

  // ---------- Índice que abre ao clicar (Produtos e Tecnologias) ----------
  // Uma linha aberta por vez; altura animada; a foto (.mi-media) entra como cortina.
  function matAccordion(list) {
    if (motion) gsap.from($$(".mat-row", list), { y: 50, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: list, start: "top 85%" } });
    const refresh = () => { if (hasGsap) ScrollTrigger.refresh(); };
    const toggle = row => {
      const body = $(".mat-body", row), btn = $(".mat-head", row);
      const open = !row.classList.contains("open");
      $$(".mat-row.open", list).forEach(r => {
        if (r === row) return;
        r.classList.remove("open"); $(".mat-head", r).setAttribute("aria-expanded", "false");
        if (motion) gsap.to($(".mat-body", r), { height: 0, duration: 0.6, ease: "expo.inOut" }); else $(".mat-body", r).style.height = "0";
      });
      row.classList.toggle("open", open); btn.setAttribute("aria-expanded", String(open));
      if (!motion) { body.style.height = open ? "auto" : "0"; return; }
      if (open) {
        gsap.fromTo(body, { height: 0 }, { height: "auto", duration: 0.8, ease: "expo.inOut", onComplete: refresh });
        gsap.from($$(".grade, p, ul, .chip, .btn", body), { y: 24, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.03, delay: 0.2 });
        const media = $(".mi-media", body);
        if (media) gsap.fromTo(media, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.1, ease: "expo.inOut", delay: 0.15 });
      } else gsap.to(body, { height: 0, duration: 0.6, ease: "expo.inOut", onComplete: refresh });
    };
    list.addEventListener("click", e => { const h = e.target.closest(".mat-head"); if (h && list.contains(h)) toggle(h.closest(".mat-row")); });
  }

  // ---------- Materiais: índice interativo ----------
  const idx = $("#mat-index");
  if (idx) {
    idx.innerHTML = M.map((m, i) => `
      <li class="mat-row" data-id="${m.id}">
        <div class="mat-top">
          <button class="mat-head" type="button" aria-expanded="false">
            <span class="no"><i class="no-mol" aria-hidden="true"><b></b></i>0${i + 1}</span><span class="nm">${m.name}</span><span class="fl">${m.full}</span>
            <span class="gc">${m.sheets} fichas</span><span class="pl">+</span>
          </button>
          <button class="mat-cmp" type="button" aria-pressed="false" data-cmp="${m.id}"><i aria-hidden="true"></i><span>Comparar</span></button>
        </div>
        <div class="mat-body"><div class="mat-inner">
          <div>
            <p>${m.desc}</p>
            <b style="font:12px var(--f-mono);text-transform:uppercase;letter-spacing:.08em;color:var(--slate)">Principais aplicações</b>
            <ul>${m.apps.map(a => `<li>${a}</li>`).join("")}</ul>
            <div>${m.traits.map(t => `<span class="chip">${t}</span>`).join("")}</div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px">
              <a class="btn" href="produto.html?linha=${m.id}" data-cursor="Ver">Ver linha ${m.name} <span class="arr">→</span></a>
              <a class="btn ghost" href="contato.html?tipo=amostra">Solicitar amostra</a>
            </div>
          </div>
          <div>
            <div class="mono" style="color:var(--slate);margin-bottom:8px">GRADES EM DESTAQUE</div>
            <div class="grade-list">${m.grades.slice(0, 5).map(g => `<div class="grade"><div><b>${g[0]}</b><small>${g[1]}</small></div><a href="#">Ficha PDF ↓</a></div>`).join("")}</div>
          </div>
        </div></div>
      </li>`).join("");

    matAccordion(idx);
  }
  // Tecnologias: efeitos de cor e faixas de dureza usam o mesmo índice (HTML estático)
  $$(".fx-index, .hard-index").forEach(matAccordion);

  // ---------- Valores: visão centralizada no topo da seção escura ----------
  const vmi = $(".vm-intro");
  if (vmi && motion) {
    gsap.timeline({ scrollTrigger: { trigger: vmi, start: "top 80%" } })
      .from([$(".eyebrow", vmi)], { y: 16, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.08 })
      .from($$(".vm-h .mw > span", vmi), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.14 }, 0.1)
      .from($(".vm-vis", vmi), { y: 20, opacity: 0, duration: 0.9, ease: "expo.out" }, 0.55);
  }

  // ---------- Valores: missão como manifesto (travado na tela até a última palavra acender) ----------
  const mf2 = $("#mf2-text");
  if (mf2) {
    // Quebra em palavras, mantendo as palavras-chave (.kw) que ganham o sublinhado amarelo
    [...mf2.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.append(t); return; }
          const sp = document.createElement("span"); sp.className = "w"; sp.textContent = t; frag.append(sp);
        });
        n.replaceWith(frag);
      } else if (n.classList && n.classList.contains("kw")) {
        const ws = n.textContent.trim().split(/\s+/);
        n.textContent = "";
        ws.forEach((t, k) => { if (k) n.append(" "); const sp = document.createElement("span"); sp.className = "w"; sp.textContent = t; n.append(sp); });
      }
    });
    const words = $$(".w", mf2);
    if (!motion) { mf2.classList.add("lit"); }
    else {
      const tl = gsap.timeline({ scrollTrigger: { trigger: "#mf2", start: "top top", end: () => "+=" + innerHeight * 1.4, pin: true, scrub: 0.6, invalidateOnRefresh: true, refreshPriority: 2 } });
      words.forEach((w, n) => {
        tl.to(w, { opacity: 1, duration: 0.1, ease: "none" }, n * 0.1);
      });
      tl.to("#mf2-bar", { scaleX: 1, ease: "none", duration: words.length * 0.1 }, 0);
    }
  }

  // ---------- Valores: compromisso ambiental (temas à esquerda, ficha à direita; troca por clique ou sozinha a cada 7 s) ----------
  const env3 = $("#env3");
  if (env3) {
    const tabs = $$(".env3-tab", env3), panes = $$(".env3-p", env3), bgs = $$("#env-bg i"), wipe = $(".env3-wipe", env3), tabBox = $(".env3-tabs", env3), card = $(".env3-card", env3);
    const n = panes.length, DUR = 7, bars = tabs.map(b => $("i", b));
    let cur = 0, inView = false, hold = false, tl = null;
    // O 50% conta na primeira vez que o tema Energia aparece
    const count = p => {
      const c = $("[data-env-count]", p);
      if (!c || c.dataset.done) return;
      c.dataset.done = "1";
      if (!motion) { c.textContent = c.dataset.envCount; return; }
      const o = { v: 0 };
      gsap.to(o, { v: +c.dataset.envCount, duration: 1.6, ease: "power3.out", onUpdate: () => { c.textContent = Math.round(o.v); } });
    };
    // Barra de tempo no tema ativo; ao encher, passa para o próximo. Para quando a seção sai da tela ou o mouse está em cima
    const run = () => {
      if (!motion) return;
      gsap.killTweensOf(bars); gsap.set(bars, { scaleX: 0 });
      if (!inView || hold) return;
      gsap.to(bars[cur], { scaleX: 1, duration: DUR, ease: "none", onComplete: () => show((cur + 1) % n) });
    };
    const show = i => {
      if (i === cur) { run(); return; }
      const from = panes[cur], to = panes[i];
      cur = i;
      tabs.forEach((b, k) => { b.classList.toggle("on", k === i); b.setAttribute("aria-selected", k === i ? "true" : "false"); });
      bgs.forEach((b, k) => b.classList.toggle("on", k === i));
      if (tabBox.scrollWidth > tabBox.clientWidth) tabBox.scrollTo({ left: tabs[i].offsetLeft - tabBox.offsetLeft - 24, behavior: "smooth" });
      if (tl) tl.progress(1);
      if (!motion) { from.classList.remove("on"); to.classList.add("on"); count(to); return; }
      // A ficha atual sai para a esquerda, uma linha amarela cruza o topo e o conteúdo novo entra em cascata pela direita
      const kids = [...$(".env2-body", to).children];
      tl = gsap.timeline({ onComplete: () => { gsap.set([from, wipe, ...kids], { clearProps: "all" }); tl = null; } })
        .to(from, { autoAlpha: 0, x: -32, duration: .32, ease: "power2.in" })
        .fromTo(wipe, { scaleX: 0, transformOrigin: "0 50%" }, { scaleX: 1, duration: .42, ease: "expo.inOut" }, 0)
        .add(() => {
          // A ficha tem a altura do próprio conteúdo: a altura anima da ficha que sai para a que entra
          const h0 = card.offsetHeight;
          from.classList.remove("on"); to.classList.add("on"); count(to);
          const h1 = card.offsetHeight;
          if (h0 !== h1) gsap.fromTo(card, { height: h0 }, { height: h1, duration: .6, ease: "expo.inOut", clearProps: "height" });
        })
        .set(wipe, { transformOrigin: "100% 50%" })
        .to(wipe, { scaleX: 0, duration: .55, ease: "expo.inOut" })
        .fromTo(kids, { x: 48, opacity: 0 }, { x: 0, opacity: 1, duration: .75, ease: "expo.out", stagger: .07 }, "<");
      run();
    };
    tabs.forEach((b, k) => b.addEventListener("click", () => show(k)));
    if (finePointer) [tabBox, $(".env3-card", env3)].forEach(el => {
      el.addEventListener("pointerenter", () => { hold = true; run(); });
      el.addEventListener("pointerleave", () => { hold = false; run(); });
    });
    if (window.IntersectionObserver) new IntersectionObserver(([en]) => { inView = en.isIntersecting; if (inView) count(panes[cur]); run(); }, { threshold: 0.35 }).observe(env3);
    else { inView = true; run(); }
    document.addEventListener("visibilitychange", () => { hold = document.hidden; run(); });
  }

  // ---------- Valores: a lista avança com a rolagem e o card claro troca (desktop); no celular, lista aberta ----------
  const vr = $("#vr");
  if (vr) {
    const items = $$(".vr-item", vr), ticks = $$(".vr-card .vr-ticks i", vr);
    // Celular: esteira que se arrasta com o dedo (sem rolagem automática); o próximo card aparece na borda direita
    const sw = $(".vr-sw", vr);
    if (sw) {
      const track = $(".vr-sw-track", sw), swCur = $("#vr-sw-cur"), swTicks = $$(".vr-sw-ticks i", sw);
      items.forEach(b => {
        const d = b.dataset, c = document.createElement("article");
        c.className = "vr-sc";
        c.innerHTML = `<div class="vr-media"><span class="mono">[foto · ${d.short}]</span></div>
          <div class="vr-cota" aria-hidden="true"><i></i><span>Valor ${d.no} / 10 · ${d.short}</span></div>
          <h3 class="vr-title">${$(".vr-nm", b).textContent}</h3>
          <span class="vr-lbl">Na prática</span>
          <p class="vr-proof">${d.proof}</p>`;
        track.appendChild(c);
      });
      const cards = $$(".vr-sc", track);
      let si = -1;
      const upd = () => {
        const step = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : 1;
        const n = Math.max(0, Math.min(cards.length - 1, Math.round(track.scrollLeft / step)));
        if (n === si) return;
        si = n;
        swCur.textContent = String(n + 1).padStart(2, "0");
        swTicks.forEach((t, k) => t.classList.toggle("on", k <= n));
      };
      upd();
      track.addEventListener("scroll", () => { upd(); sw.classList.add("used"); }, { passive: true });
    }
    const title = $("#vr-title"), proof = $("#vr-proof"), cota = $("#vr-cota"), cur = $("#vr-cur");
    const mlbl = $("#vr-mlbl"), card = $(".vr-card", vr), inner = $(".vr-in", vr), wipe = $(".vr-wipe", vr), ind = $(".vr-ind", vr), list = $(".vr-list", vr);
    let i = 0, tl = null;
    // Troca automática a cada 3 s (barra de progresso no card); pausa no hover/foco e fora da tela
    const bar = $("#vr-bar"), desk = matchMedia("(min-width: 901px)");
    let visible = false, paused = false, tw = null;
    const run = () => {
      if (!motion || !bar) return;
      if (tw) tw.kill();
      gsap.set(bar, { scaleX: 0 });
      tw = gsap.to(bar, { scaleX: 1, duration: 3, ease: "none", paused: !visible || paused || !desk.matches, onComplete: () => show((i + 1) % items.length) });
    };
    const sync = () => { if (tw) (visible && !paused && desk.matches) ? tw.resume() : tw.pause(); };
    // Indicador que desliza até o valor ativo na lista
    const moveInd = (anim = true) => {
      const li = items[i].parentElement;
      const v = { y: li.offsetTop, height: li.offsetHeight };
      if (anim && motion) gsap.to(ind, { ...v, duration: 0.7, ease: "expo.out", overwrite: true }); else gsap.set(ind, v);
    };
    const show = n => {
      if (n === i) return;
      const dir = n > i ? 1 : -1;
      i = n;
      const b = items[i], d = b.dataset;
      items.forEach((x, k) => { x.classList.toggle("on", k === i); x.setAttribute("aria-pressed", String(k === i)); });
      ticks.forEach((t, k) => t.classList.toggle("on", k <= i));
      moveInd();
      run();
      const set = () => { title.textContent = $(".vr-nm", b).textContent; proof.textContent = d.proof; cota.textContent = `Valor ${d.no} / 10 · ${d.short}`; if (cur) cur.textContent = d.no; if (mlbl) mlbl.textContent = `[foto · ${d.short}]`; };
      if (!motion) { set(); return; }
      // Troca do card: conteúdo sai na direção da rolagem, uma cortina Navy cruza o card, o novo conteúdo entra e o card balança de leve
      if (tl) tl.progress(1).kill();
      tl = gsap.timeline()
        .to(inner, { yPercent: -10 * dir, opacity: 0, duration: 0.28, ease: "power2.in" }, 0)
        .fromTo(wipe, { scaleX: 0, transformOrigin: dir > 0 ? "0% 50%" : "100% 50%" }, { scaleX: 1, duration: 0.32, ease: "expo.in" }, 0)
        .add(set)
        .set(wipe, { transformOrigin: dir > 0 ? "100% 50%" : "0% 50%" })
        .to(wipe, { scaleX: 0, duration: 0.6, ease: "expo.out" })
        .fromTo(inner, { yPercent: 12 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.85, ease: "expo.out" }, "<0.05")
        .fromTo($$(".vr-cota, .vr-title, .vr-lbl, .vr-proof", inner), { y: 22 * dir }, { y: 0, duration: 0.9, ease: "expo.out", stagger: 0.05 }, "<")
        .fromTo(card, { rotation: 0.8 * dir, y: 14 * dir }, { rotation: 0, y: 0, duration: 1.1, ease: "elastic.out(1, 0.55)" }, 0);
    };
    ticks[0].classList.add("on");
    moveInd(false);
    addEventListener("resize", () => moveInd(false));
    // O usuário escolhe: clique ou hover (mouse) num valor troca o card na hora
    items.forEach((b, n) => {
      b.addEventListener("click", () => show(n));
      if (finePointer) b.addEventListener("mouseenter", () => show(n));
    });
    const grid = $(".vr-grid", vr);
    grid.addEventListener("mouseenter", () => { paused = true; sync(); });
    grid.addEventListener("mouseleave", () => { paused = grid.contains(document.activeElement); sync(); });
    grid.addEventListener("focusin", () => { paused = true; sync(); });
    grid.addEventListener("focusout", e => { if (!grid.contains(e.relatedTarget)) { paused = false; sync(); } });
    if (desk.addEventListener) desk.addEventListener("change", sync);
    // Card com altura fixa (a do maior valor): nada muda de tamanho ao trocar
    const fit = () => {
      const b = items[i];
      [[title, x => $(".vr-nm", x).textContent, $(".vr-nm", b).textContent], [proof, x => x.dataset.proof, b.dataset.proof]].forEach(([node, get, now]) => {
        node.style.minHeight = "0";
        let max = 0;
        items.forEach(x => { node.textContent = get(x); max = Math.max(max, node.offsetHeight); });
        node.textContent = now; node.style.minHeight = max + "px";
      });
      moveInd(false);
    };
    fit();
    if (document.fonts) document.fonts.ready.then(fit);
    let fitT; addEventListener("resize", () => { clearTimeout(fitT); fitT = setTimeout(fit, 150); });
    if (motion) {
      run();
      ScrollTrigger.create({ trigger: vr, start: "top 75%", end: "bottom 25%", onToggle: s => { visible = s.isActive; sync(); } });
      gsap.timeline({ scrollTrigger: { trigger: vr, start: "top 80%" } })
        .from($$(".vr-head > *", vr), { y: 20, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.08 })
        .from($$(".vr-list li:not(.vr-ind)", vr), { x: -24, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.04 }, 0.1)
        .fromTo(card, { clipPath: "inset(100% 0 0 0 round 10px)", y: 60 }, { clipPath: "inset(0% 0 0 0 round 10px)", y: 0, duration: 1.3, ease: "expo.inOut" }, 0.2)
        .from($$(".vr-cota, .vr-title, .vr-lbl, .vr-proof, .vr-foot", card), { y: 30, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.07 }, 0.8);
    }
  }

  // ---------- Guia de seleção: tabela segmento x exigência ----------
  const mx = $("#matrix");
  if (mx) {
    const SEG = [["automotivo", "Automotivo"], ["eletro", "Eletroeletrônicos"], ["linha-branca", "Linha branca"], ["construcao", "Construção civil"], ["embalagens", "Embalagens e cosméticos"]];
    const REQ = [["impacto", "Impacto"], ["chama", "Anti-chama"], ["transparencia", "Transparência"], ["temperatura", "Alta temperatura"], ["rigidez", "Rigidez"], ["uv", "Externo (UV)"]];
    const cell = (seg, req) => M.filter(m => m.segments.includes(seg) && m.props.includes(req))
      .map(m => `<a href="produto.html?linha=${m.id}" data-cursor="Ver">${m.name}</a>`).join("") || '<span class="none">Consulte</span>';
    mx.innerHTML = `<thead><tr><th scope="col"><span class="mono">Segmento / exigência</span></th>${REQ.map(r => `<th scope="col">${r[1]}</th>`).join("")}</tr></thead>
      <tbody>${SEG.map(s => `<tr><th scope="row">${s[1]}</th>${REQ.map(r => `<td>${cell(s[0], r[0])}</td>`).join("")}</tr>`).join("")}</tbody>`;
    if (motion) gsap.from($$("tbody tr", mx), { y: 30, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: mx, start: "top 85%" } });
  }

  // ---------- Produtos: comparar até 3 linhas a partir do índice ----------
  if (idx) {
    const PROPS = [["impacto", "Resistência ao impacto"], ["chama", "Anti-chama"], ["transparencia", "Transparência"], ["temperatura", "Alta temperatura"], ["rigidez", "Rigidez"], ["uv", "Uso externo (UV)"]];
    const SEGN = { automotivo: "Automotivo", eletro: "Eletroeletrônicos", "linha-branca": "Linha branca", construcao: "Construção civil", embalagens: "Embalagens e cosméticos" };
    const MAX = 3;
    let picked = [];
    document.body.insertAdjacentHTML("beforeend", `
      <div class="cmp-bar-fix" id="cmp-bar" aria-live="polite">
        <span class="cb-lbl mono">Comparar</span><div class="cb-chips" id="cb-chips"></div>
        <span class="cb-msg mono" id="cb-msg"></span>
        <button type="button" class="cb-clear mono" id="cb-clear">Limpar</button>
        <button type="button" class="btn sm cb-go" id="cb-go">Comparar <span class="arr">→</span></button>
      </div>
      <div class="cmp-drawer" id="cmp-drawer" role="dialog" aria-modal="true" aria-labelledby="cd-title" hidden>
        <div class="cd-scrim" data-close></div>
        <div class="cd-panel" tabindex="-1">
          <div class="cd-head"><h3 id="cd-title">Comparação</h3><button type="button" class="cd-x" data-close aria-label="Fechar">×</button></div>
          <div class="cd-body" id="cd-body" data-lenis-prevent></div>
          <p class="cd-foot mono">A indicação final é sempre validada pela equipe técnica.</p>
        </div>
      </div>`);
    const bar = $("#cmp-bar"), chips = $("#cb-chips"), msg = $("#cb-msg"), go = $("#cb-go"), drawer = $("#cmp-drawer"), panel = $(".cd-panel", drawer);
    const sync = () => {
      $$(".mat-cmp", idx).forEach(b => { const on = picked.includes(b.dataset.cmp); b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); $("span", b).textContent = on ? "Comparando" : "Comparar"; });
      chips.innerHTML = picked.map(id => `<button type="button" class="cb-chip" data-rm="${id}" aria-label="Tirar ${M.find(m => m.id === id).name}">${M.find(m => m.id === id).name}<b aria-hidden="true">×</b></button>`).join("");
      go.disabled = picked.length < 2;
      go.firstChild.textContent = `Comparar (${picked.length}) `;
      bar.classList.toggle("show", picked.length > 0);
    };
    const say = t => { msg.textContent = t; clearTimeout(say.t); say.t = setTimeout(() => { msg.textContent = ""; }, 2600); };
    idx.addEventListener("click", e => {
      const b = e.target.closest(".mat-cmp");
      if (!b) return;
      const id = b.dataset.cmp;
      if (picked.includes(id)) picked = picked.filter(x => x !== id);
      else if (picked.length >= MAX) { say("Máximo de 3 linhas"); return; }
      else picked.push(id);
      if (picked.length === 1) say("Marque mais uma para comparar");
      sync();
    });
    chips.addEventListener("click", e => { const c = e.target.closest("[data-rm]"); if (c) { picked = picked.filter(x => x !== c.dataset.rm); sync(); } });
    $("#cb-clear").addEventListener("click", () => { picked = []; sync(); });
    let lastFocus = null;
    const close = () => {
      if (drawer.hidden) return;
      drawer.classList.remove("open");
      setTimeout(() => { drawer.hidden = true; }, 450);
      if (lenis) lenis.start();
      if (lastFocus) lastFocus.focus();
    };
    go.addEventListener("click", () => {
      if (picked.length < 2) return;
      const L = picked.map(id => M.find(m => m.id === id));
      const row = (label, f) => `<tr><th scope="row">${label}</th>${L.map(m => `<td>${f(m)}</td>`).join("")}</tr>`;
      $("#cd-body").innerHTML = `<table class="cd-table">
        <thead><tr><td></td>${L.map(m => `<th scope="col"><b>${m.name}</b><small>${m.full}</small></th>`).join("")}</tr></thead>
        <tbody>
          ${PROPS.map(([k, label]) => row(label, m => m.props.includes(k) ? '<span class="ok" aria-label="Atende">✓</span>' : '<span class="no" aria-label="Não indicado">–</span>')).join("")}
          ${row("Segmentos", m => m.segments.map(x => SEGN[x]).join(", "))}
          ${row("Grades e fichas", m => `${m.grades.length} grades · ${m.sheets} fichas`)}
          ${row("", m => `<a class="cd-link" href="produto.html?linha=${m.id}">Ver ${m.name} →</a>`)}
        </tbody></table>`;
      lastFocus = document.activeElement;
      drawer.hidden = false;
      requestAnimationFrame(() => { drawer.classList.add("open"); panel.focus(); });
      if (lenis) lenis.stop();
    });
    drawer.addEventListener("click", e => { if (e.target.closest("[data-close]")) close(); });
    addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    sync();
  }

  // ---------- Formulário ----------
  const form = $("#contact-form");
  if (form && new URLSearchParams(location.search).get("tipo") === "amostra") $("#tipo").value = "Solicitar amostra de cor";
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const bad = $$("[required]", form).filter(el => !el.checkValidity());
    if (bad.length) {
      bad.forEach(el => { el.focus(); el.blur(); });
      bad[0].focus();
      if (!$("#lgpd").checked) $("#lgpd").parentElement.style.color = "#ff8f8f";
      return;
    }
    $("#lgpd").parentElement.style.color = "";
    $("#form-ok").classList.add("show");
  });

  // ---------- Página de produto ----------
  const pp = $("#product-page");
  if (pp) {
    const id = new URLSearchParams(location.search).get("linha") || "abs";
    const m = M.find(x => x.id === id) || M[0];
    document.title = `${m.name} · Remo Polímeros · Wireframe v5.36`;
    // Nome sempre em uma linha: a fonte diminui até caber e a altura do título não muda entre as linhas
    const nameEl = $(".p-hero .big");
    const fitName = () => {
      nameEl.style.fontSize = "";
      const max = parseFloat(getComputedStyle(nameEl).fontSize);
      const fit = max * nameEl.parentElement.clientWidth / nameEl.scrollWidth;
      nameEl.style.fontSize = Math.min(max, fit) + "px";
      nameEl.style.minHeight = max * 0.82 + "px";
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(fitName);
    addEventListener("resize", fitName);
    $$("[data-f]").forEach(el => {
      const k = el.dataset.f;
      if (k === "apps") {
        // Padrão: 4 aplicações visíveis; o resto abre pelo "Ver mais"
        const SHOW = 4;
        el.innerHTML = m.apps.map((a, i) => `<li class="pa-item${i >= SHOW ? " pa-extra" : ""}"><span class="pa-no">${String(i + 1).padStart(2, "0")}</span><span class="pa-name">${a}</span></li>`).join("");
        if (m.apps.length > SHOW) {
          el.insertAdjacentHTML("afterend", `<button type="button" class="pa-more mono" aria-expanded="false">Ver mais (+${m.apps.length - SHOW})</button>`);
          const more = el.nextElementSibling;
          more.addEventListener("click", () => {
            const open = more.getAttribute("aria-expanded") !== "true";
            more.setAttribute("aria-expanded", String(open));
            el.classList.toggle("show-all", open);
            more.textContent = open ? "Ver menos" : `Ver mais (+${m.apps.length - SHOW})`;
            if (open && motion) gsap.from($$(".pa-extra", el), { x: -20, opacity: 0, duration: .6, ease: "expo.out", stagger: .06 });
            if (hasGsap) ScrollTrigger.refresh();
          });
        }
      }
      else if (k === "traits") el.innerHTML = m.traits.map(t => `<span class="chip">${t}</span>`).join("");
      else if (k === "sheets") el.textContent = m.sheets;
      else el.textContent = m[k];
    });
    $("#grades").innerHTML = m.grades.map(g =>
      `<div class="grade"><div><b>${g[0]}</b><small>${g[1]}</small></div><div style="display:flex;gap:16px"><a href="#">Ficha técnica PDF ↓</a><a href="contato.html?tipo=amostra">Pedir amostra</a></div></div>`).join("");
    // Base do topo: volta para o índice e próxima resina
    const at = M.indexOf(m), prev = M[(at - 1 + M.length) % M.length], next = M[(at + 1) % M.length];
    $("#p-prev").href = `produto.html?linha=${prev.id}`;
    $("#p-prev b").textContent = prev.name;
    $("#p-next").href = `produto.html?linha=${next.id}`;
    $("#p-next b").textContent = next.name;
    if (motion) {
      gsap.from("#grades .grade", { y: 20, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: "#grades", start: "top 85%" } });
      gsap.from(".p-info > *", { y: 30, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.08, delay: 0.2 });
      gsap.fromTo(".p-media", { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: 1.4, ease: "expo.inOut", delay: 0.3 });
      gsap.from(".pa-item", { x: -30, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: ".pa-list", start: "top 85%" } });
      gsap.from(".p-nav", { opacity: 0, duration: 1, ease: "power2.out", delay: 0.9 });
      gsap.fromTo(".pa-photos .ph", { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.3, ease: "expo.inOut", stagger: 0.12, scrollTrigger: { trigger: ".pa-photos", start: "top 85%" } });
    }
  }

  if (hasGsap) { ScrollTrigger.sort(); ScrollTrigger.refresh(); }
})();
