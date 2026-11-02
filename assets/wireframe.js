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

  // ---------- Notas de UX ----------
  const tn = $("#toggle-notes");
  if (tn) tn.addEventListener("click", () => {
    const on = document.body.classList.toggle("show-notes");
    tn.setAttribute("aria-pressed", String(on));
    tn.textContent = on ? "Ocultar notas de UX" : "Mostrar notas de UX";
    if (hasGsap) ScrollTrigger.refresh();
  });

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

  // ---------- Header que some ao descer ----------
  const header = $("#header");
  let lastY = 0;
  const onScroll = y => {
    if (header) { header.classList.toggle("hidden", y > lastY && y > 400); header.classList.toggle("scrolled", y > 60); }
    lastY = y;
  };
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
  const pageTx = (() => {
    const sheet = $("#sheet");
    if (!sheet || !motion) { if (sheet) sheet.remove(); return null; }
    const words = $$(".word span", sheet), inner = $(".sheet-inner", sheet), count = $("#sheet-count");
    let busy = false;
    const leave = url => {
      if (busy) return;
      busy = true;
      if (lenis) lenis.stop();
      const cnt = { v: 0 };
      gsap.timeline({ onComplete: () => { try { sessionStorage.setItem("remo-nav", "1"); } catch (e) {} location.href = url; } })
        .set(sheet, { display: "grid", yPercent: 100, opacity: 1 })
        .set(inner, { opacity: 1, y: 0 })
        .to(sheet, { yPercent: 0, duration: 0.75, ease: "expo.inOut" })
        .from(words, { yPercent: 110, duration: 0.5, ease: "expo.out", stagger: 0.05 }, "-=0.25")
        .to(cnt, { v: 100, duration: 0.6, ease: "power2.inOut", onUpdate: () => { count.textContent = Math.round(cnt.v); } }, "-=0.45");
    };
    // Chegando de outra página: a folha começa cobrindo e sai para cima
    const enter = () => {
      let from = false;
      try { from = sessionStorage.getItem("remo-nav") === "1"; sessionStorage.removeItem("remo-nav"); } catch (e) {}
      if (!from) return false;
      count.textContent = "100";
      gsap.timeline({ onComplete: () => gsap.set(sheet, { display: "none" }) })
        .set(sheet, { display: "grid", yPercent: 0, opacity: 1 })
        .to(inner, { opacity: 0, y: -24, duration: 0.35, ease: "power2.in", delay: 0.1 })
        .to(sheet, { yPercent: -100, duration: 0.8, ease: "expo.inOut" });
      return true;
    };
    // Voltar pelo navegador pode restaurar a página com a folha cobrindo
    addEventListener("pageshow", ev => { if (ev.persisted) { busy = false; gsap.set(sheet, { display: "none" }); if (lenis) lenis.start(); } });
    return { leave, enter };
  })();
  const arrived = pageTx ? pageTx.enter() : false;

  // ---------- Abertura ----------
  const pre = $("#preloader");
  const heroIn = () => {
    if (!motion) return;
    gsap.from(".hero [data-lines] .line > span", { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.1 });
    gsap.from(".hero [data-reveal]", { y: 30, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.12, delay: 0.35 });
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
      const lines = $$("svg line", pre);
      lines.forEach(l => { const len = l.getTotalLength(); l.style.strokeDasharray = len; l.style.strokeDashoffset = len; });
      const cnt = { v: 0 };
      const tl = gsap.timeline({ onComplete: () => { pre.remove(); endIntro(); } });
      tl.from($$("svg circle", pre), { scale: 0, transformOrigin: "50% 50%", duration: 0.5 * d, ease: "back.out(2)", stagger: 0.08 * d })
        .to(lines, { strokeDashoffset: 0, duration: 0.5 * d, ease: "power2.inOut", stagger: 0.06 * d }, "-=0.2")
        .from($$(".word span", pre), { yPercent: 110, duration: 0.6 * d, ease: "expo.out", stagger: 0.05 * d }, "-=0.4")
        .to(cnt, { v: 100, duration: 1.4 * d, ease: "power2.inOut", onUpdate: () => { $("#count").textContent = Math.round(cnt.v); } }, 0)
        .to(pre, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "+=0.15")
        .add(heroIn, "-=0.45");
    }
  } else if (arrived) heroIn();
  const replay = $("#replay");
  if (replay) replay.addEventListener("click", () => { try { sessionStorage.removeItem("remo-intro"); } catch (e) {} scrollTo(0, 0); location.reload(); });

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
      const DUR = 6;
      const show = n => {
        slides.forEach((sl, k) => sl.classList.toggle("on", k === n));
        $("#hs-no").textContent = String(n + 1).padStart(2, "0");
        $("#hs-label").textContent = slides[n].dataset.label;
        if (hasGsap && motion) {
          gsap.fromTo(slides[n], { scale: 1.12 }, { scale: 1, duration: DUR + 1.5, ease: "none" });
          gsap.fromTo("#hs-label", { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: "expo.out" });
          gsap.fromTo("#hs-bar", { scaleX: 0 }, { scaleX: 1, duration: DUR, ease: "none" });
        }
      };
      show(0);
      let hold = false;
      const heroEl = document.querySelector(".hero");
      heroEl.addEventListener("pointerenter", () => { hold = true; gsap.getTweensOf("#hs-bar").forEach(t => t.pause()); });
      heroEl.addEventListener("pointerleave", () => { hold = false; gsap.getTweensOf("#hs-bar").forEach(t => t.resume()); });
      if (slides.length > 1 && motion) setInterval(() => { if (hold) return; i = (i + 1) % slides.length; show(i); }, DUR * 1000);
    });
  }

  // ---------- Molécula da marca: fundo de pontos e linhas nas seções escuras ----------
  const molField = host => {
    const cv = document.createElement("canvas");
    cv.className = "mol-bg"; cv.setAttribute("aria-hidden", "true");
    host.prepend(cv);
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, nodes = [], mx = -999, my = -999, on = false;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = host.clientWidth; H = host.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, W * H / 16000));
      nodes = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, r: 1.2 + Math.random() * 2.2, y2: Math.random() < .06 }));
    };
    const LINK = 130;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const a of nodes) {
        if (!reduced) { a.x += a.vx; a.y += a.vy; if (a.x < 0 || a.x > W) a.vx *= -1; if (a.y < 0 || a.y > H) a.vy *= -1; }
      }
      ctx.lineCap = "round";
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) { ctx.strokeStyle = `rgba(244,245,247,${(1 - d / LINK) * .1})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        const dm = Math.hypot(a.x - mx, a.y - my);
        if (dm < 180) { ctx.strokeStyle = `rgba(255,209,0,${(1 - dm / 180) * .35})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.stroke(); }
      }
      for (const a of nodes) {
        ctx.fillStyle = a.y2 ? "rgba(255,209,0,.7)" : "rgba(244,245,247,.22)";
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
    };
    const loop = () => { if (on) draw(); requestAnimationFrame(loop); };
    size(); addEventListener("resize", size);
    host.addEventListener("pointermove", e => { const r = host.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    host.addEventListener("pointerleave", () => { mx = my = -999; });
    new IntersectionObserver(([en]) => { on = en.isIntersecting; }).observe(host);
    if (reduced) { on = true; draw(); } else loop();
  };
  $$("[data-mol]").forEach(molField);

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
    const layers = [[".hero-slides", -24, -14], ["#field", -24, -14], [".hero-inner", 14, 8], [".hero-sector", 26, 14]]
      .map(([sel, ax, ay]) => { const el = $(sel, heroBox); return el && { x: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3" }), y: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3" }), ax, ay }; })
      .filter(Boolean);
    gsap.set($(".hero-slides", heroBox), { scale: 1.06 });
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
    ScrollTrigger.create({ start: 0, end: () => innerHeight * .6, onToggle: st => { if (st.isActive) hdrSec.classList.remove("on"); } });
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
    $$(".px-band .px-media").forEach(m => {
      gsap.fromTo(m, { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: m.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    $$(".contact-band .cb-media").forEach(m => {
      gsap.fromTo(m, { scale: 1.15 }, { scale: 1, ease: "none", scrollTrigger: { trigger: m.parentElement, start: "top bottom", end: "bottom bottom", scrub: true } });
    });
  }

  // ---------- Tecnologias: régua de dureza ligada à rolagem ----------
  const hardScale = $("#hard-scale");
  if (hardScale && hasGsap) {
    const STOPS = [["50A", "Flexível"], ["60A", "Flexível"], ["70A", "Macio"], ["80A", "Macio"], ["90A", "Semirrígido"], ["40D", "Semirrígido"], ["50D", "Rígido"], ["60D", "Rígido"], ["70D", "Rígido"], ["80D", "Muito rígido"], ["85D", "Muito rígido"]];
    const setHard = p => {
      const k = Math.min(STOPS.length - 1, Math.round(p * (STOPS.length - 1)));
      $("#hs-val").textContent = STOPS[k][0];
      $("#hs-txt").textContent = STOPS[k][1];
      gsap.set("#hs-fill", { scaleX: Math.max(0.02, p) });
      gsap.set("#hs-knob", { left: (p * 100) + "%" });
    };
    setHard(motion ? 0 : 1);
    if (motion) ScrollTrigger.create({ trigger: hardScale, start: "top 85%", end: "top 30%", scrub: true, onUpdate: st => setHard(st.progress) });
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

  // ---------- Aberturas das páginas: título letra a letra ----------
  const splitChars = el => {
    [...el.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        [...n.textContent].forEach(c => {
          if (c === " ") { frag.appendChild(document.createTextNode(" ")); return; }
          const sp = document.createElement("span"); sp.className = "ch"; sp.textContent = c; frag.appendChild(sp);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) splitChars(n);
    });
  };
  $$(".page-hero h1").forEach(h => {
    if (!motion) return;
    $$(".line > span", h).forEach(splitChars);
    const chars = $$(".ch", h);
    gsap.from(chars, { yPercent: 120, rotate: 12, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.022, delay: 0.15 });
    gsap.from($$(".hl .ch", h), { color: "#FFFFFF", duration: 1.2, delay: 0.9, stagger: 0.02 });
    const eb = $(".eyebrow", h.closest(".page-hero"));
    if (eb) gsap.from(eb, { x: -30, opacity: 0, duration: 0.9, ease: "expo.out" });
  });

  // ---------- Hero: a palavra final troca por sinônimos ----------
  const swap = $("#hero-swap");
  if (swap) {
    const WORDS = ["sob medida.", "para você.", "personalizados.", "com precisão.", "do seu jeito."];
    let wi = 0;
    if (motion) setInterval(() => {
      wi = (wi + 1) % WORDS.length;
      const cur = $(".sw-word", swap);
      const next = document.createElement("span");
      next.className = "sw-word"; next.textContent = WORDS[wi];
      next.style.position = "absolute"; next.style.left = "0"; next.style.top = "0";
      swap.appendChild(next);
      gsap.timeline({ onComplete: () => { cur.remove(); next.style.position = ""; } })
        .to(cur, { yPercent: -110, opacity: 0, duration: 0.6, ease: "expo.in" })
        .fromTo(next, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: "expo.out" }, 0.35)
        .to(swap, { width: () => next.offsetWidth, duration: 0.6, ease: "expo.inOut" }, 0.2)
        .set(swap, { clearProps: "width" });
    }, 3000);
  }

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

  // ---------- Manifesto do fim da página: palavras acendem com a rolagem ----------
  $$(".end-manifesto [data-words]").forEach(p => {
    const HL = ["certo", "começa", "aqui."];
    p.innerHTML = p.textContent.trim().split(/\s+/).map(w => `<span class="w${HL.includes(w) ? " hl-w" : ""}">${w}</span>`).join(" ");
    const ws = $$(".w", p);
    if (!motion) { ws.forEach(w => (w.style.opacity = 1)); return; }
    gsap.to(ws, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: p, start: "top 80%", end: "bottom 45%", scrub: 0.6 } });
  });

  // ---------- Esteira de seções: rolagem lateral presa à rolagem (desktop) ----------
  const railTrack = $(".rail-track");
  if (railTrack && motion) {
    gsap.matchMedia().add("(min-width: 901px)", () => {
      const dist = () => Math.max(0, railTrack.scrollWidth - innerWidth + 24);
      gsap.to(railTrack, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: ".rail-pin", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true } });
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

  // ---------- Materiais: índice interativo ----------
  const idx = $("#mat-index");
  if (idx) {
    idx.innerHTML = M.map((m, i) => `
      <li class="mat-row" data-id="${m.id}">
        <button class="mat-head" type="button" aria-expanded="false">
          <span class="no">0${i + 1}</span><span class="nm">${m.name}</span><span class="fl">${m.full}</span>
          <span class="gc">${m.sheets} fichas</span><span class="pl">+</span>
        </button>
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

    if (motion) gsap.from($$(".mat-row", idx), { y: 50, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: idx, start: "top 85%" } });
    const refresh = () => { if (hasGsap) ScrollTrigger.refresh(); };
    const toggle = row => {
      const body = $(".mat-body", row), btn = $(".mat-head", row);
      const open = !row.classList.contains("open");
      $$(".mat-row.open", idx).forEach(r => {
        if (r === row) return;
        r.classList.remove("open"); $(".mat-head", r).setAttribute("aria-expanded", "false");
        if (motion) gsap.to($(".mat-body", r), { height: 0, duration: 0.6, ease: "expo.inOut" }); else $(".mat-body", r).style.height = "0";
      });
      row.classList.toggle("open", open); btn.setAttribute("aria-expanded", String(open));
      if (!motion) { body.style.height = open ? "auto" : "0"; return; }
      if (open) {
        gsap.fromTo(body, { height: 0 }, { height: "auto", duration: 0.8, ease: "expo.inOut", onComplete: refresh });
        gsap.from($$(".grade, p, ul, .chip, .btn", body), { y: 24, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.03, delay: 0.2 });
      } else gsap.to(body, { height: 0, duration: 0.6, ease: "expo.inOut", onComplete: refresh });
    };
    idx.addEventListener("click", e => { const h = e.target.closest(".mat-head"); if (h) toggle(h.closest(".mat-row")); });

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
    document.title = `${m.name} · Remo Polímeros · Wireframe v1.1`;
    $$("[data-f]").forEach(el => {
      const k = el.dataset.f;
      if (k === "apps") el.innerHTML = m.apps.map(a => `<li>${a}</li>`).join("");
      else if (k === "traits") el.innerHTML = m.traits.map(t => `<span class="chip">${t}</span>`).join("");
      else if (k === "sheets") el.textContent = m.sheets;
      else el.textContent = m[k];
    });
    $("#grades").innerHTML = m.grades.map(g =>
      `<div class="grade"><div><b>${g[0]}</b><small>${g[1]}</small></div><div style="display:flex;gap:16px"><a href="#">Ficha técnica PDF ↓</a><a href="contato.html?tipo=amostra">Pedir amostra</a></div></div>`).join("");
    $("#other-lines").innerHTML = M.filter(x => x.id !== m.id).map(x => `<a class="btn ghost sm" href="produto.html?linha=${x.id}" data-cursor="Ver">${x.name}</a>`).join("");
    if (motion) {
      gsap.from(".p-hero .big", { yPercent: 30, opacity: 0, duration: 1.2, ease: "expo.out" });
      gsap.from("#grades .grade", { y: 20, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: "#grades", start: "top 85%" } });
    }
  }

  if (hasGsap) { ScrollTrigger.sort(); ScrollTrigger.refresh(); }
})();
