// Interações e rolagens do wireframe v0.6 (GSAP + ScrollTrigger + Lenis)
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
  // gate = hero travado esperando a primeira rolagem para a transição de página
  let gate = false;
  const scrollToEl = el => {
    if (gate && el.id !== "topo") { gate = false; if (lenis) lenis.start(); }
    if (lenis) lenis.scrollTo(el, { offset: el.id === "sobre" ? 0 : -72, duration: 1.4, force: true });
    else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    scrollToEl(el);
  });

  // ---------- Header que some ao descer ----------
  const header = $("#header");
  let lastY = 0;
  const onScroll = y => {
    if (header) header.classList.toggle("hidden", y > lastY && y > 400);
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

  // ---------- Transição hero → manifesto (página que sobe, como a abertura) ----------
  const heroGate = (() => {
    const sheet = $("#sheet"), mf = $("#sobre"), hero = $(".hero");
    if (!motion || !lenis || !sheet || !mf || !hero) { if (sheet) sheet.remove(); return null; }
    let busy = false, ty = null;
    const words = $$(".word span", sheet);
    const play = () => {
      if (!gate || busy) return;
      busy = true; gate = false;
      const cnt = { v: 0 };
      gsap.timeline({ onComplete: () => { gsap.set(sheet, { display: "none", opacity: 1 }); lenis.start(); busy = false; } })
        .set(sheet, { display: "grid", yPercent: 100, opacity: 1 })
        .set(".sheet-inner", { opacity: 1, y: 0 })
        .to(sheet, { yPercent: 0, duration: 0.85, ease: "expo.inOut" })
        .from(words, { yPercent: 110, duration: 0.55, ease: "expo.out", stagger: 0.05 }, "-=0.3")
        .to(cnt, { v: 100, duration: 0.8, ease: "power2.inOut", onUpdate: () => { $("#sheet-count").textContent = Math.round(cnt.v); } }, "-=0.5")
        .add(() => { lenis.scrollTo(mf, { immediate: true, force: true }); ScrollTrigger.update(); })
        .to(".sheet-inner", { opacity: 0, y: -24, duration: 0.4, ease: "power2.in" }, "+=0.05")
        .to(sheet, { opacity: 0, duration: 0.35 });
    };
    const arm = () => { if (lenis.scroll <= 2) { gate = true; lenis.stop(); } };
    addEventListener("wheel", e => { if (gate && e.deltaY > 4) play(); }, { passive: true });
    addEventListener("touchstart", e => { ty = e.touches[0].clientY; }, { passive: true });
    addEventListener("touchmove", e => { if (gate && ty !== null && ty - e.touches[0].clientY > 24) play(); }, { passive: true });
    addEventListener("keydown", e => {
      if (!gate || e.target.closest("input, textarea, select")) return;
      if (["ArrowDown", "PageDown", " ", "Spacebar"].includes(e.key)) { e.preventDefault(); play(); }
    });
    const nx = $("#hero-next");
    if (nx) nx.addEventListener("click", () => { if (gate) play(); else scrollToEl(mf); });
    // Voltar ao topo rolando reativa a transição
    lenis.on("scroll", e => { if (!busy && !gate && e.scroll <= 2 && e.direction < 0) arm(); });
    return { arm };
  })();

  // ---------- Abertura ----------
  const pre = $("#preloader");
  const heroIn = () => {
    if (!motion) return;
    gsap.from(".hero [data-lines] .line > span", { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.1 });
    gsap.from(".hero [data-reveal]", { y: 30, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.12, delay: 0.35 });
  };
  const endIntro = () => {
    document.body.classList.remove("is-loading");
    if (lenis) { lenis.start(); if (heroGate) heroGate.arm(); }
    const rail = $("#rail");
    if (rail) rail.classList.add("on");
    if (hasGsap) ScrollTrigger.refresh();
  };
  if (pre) {
    if (!motion) { pre.remove(); endIntro(); }
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
  } else {
    const rail = $("#rail");
    if (rail) rail.classList.add("on");
  }
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
      if (h.closest(".hero")) return;
      gsap.from($$(".line > span", h), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: h, start: "top 85%" } });
    });
    $$("[data-reveal]").forEach(el => {
      if (el.closest(".hero")) return;
      gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
    });

    // Contadores
    $$("[data-count]").forEach(el => {
      const o = { v: 0 };
      gsap.to(o, { v: +el.dataset.count, duration: 1.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" }, onUpdate: () => { el.textContent = Math.round(o.v); } });
    });

    // Seções horizontais fixas (somente desktop)
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", () => {
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
      const tlEl = $("#timeline");
      if (tlEl) {
        const dist = () => Math.max(0, tlEl.scrollWidth - innerWidth);
        const st = { trigger: "#tl-pin", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true };
        gsap.to(tlEl, { x: () => -dist(), ease: "none", scrollTrigger: st });
        gsap.to("#tl-fill", { scaleX: 1, ease: "none", scrollTrigger: { ...st, pin: false } });
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

  // ---------- Barra de progresso lateral (ponta a ponta) ----------
  const rail = $("#rail");
  if (rail && hasGsap) {
    const SECS = [["topo", "Início"], ["sobre", "Manifesto"], ["numeros", "Números"], ["solucoes", "Como trabalhamos"], ["laboratorio", "Laboratório"], ["materiais", "Materiais"], ["guia", "Guia de seleção"], ["qualidade", "Qualidade ISO"], ["historia", "História"], ["contato", "Contato"]]
      .map(([id, label]) => ({ id, label, el: $("#" + id), p: 0 })).filter(x => x.el);
    const ticksEl = $("#rail-ticks"), fill = $("#rail-fill"), marker = $("#rail-marker");
    ticksEl.innerHTML = SECS.map(x => `<button type="button" class="tick" data-sec="${x.id}" aria-label="Ir para ${x.label}"><span>${x.label}</span></button>`).join("");
    const ticks = $$(".tick", ticksEl);
    ticks.forEach((t, i) => t.addEventListener("click", () => scrollToEl(SECS[i].el)));
    let progress = 0;
    const layout = () => {
      const max = ScrollTrigger.maxScroll(window) || 1, H = rail.clientHeight;
      SECS.forEach((x, i) => {
        const box = x.el.parentElement.classList.contains("pin-spacer") ? x.el.parentElement : x.el;
        x.p = Math.min(1, Math.max(0, (box.getBoundingClientRect().top + scrollY) / max));
        ticks[i].style.top = 12 + x.p * (H - 48) + "px";
      });
      update(progress);
    };
    const update = pr => {
      progress = pr;
      const H = rail.clientHeight;
      fill.style.transform = `scaleY(${pr})`;
      marker.style.transform = `translateY(${12 + pr * (H - 48)}px)`;
      let a = 0;
      SECS.forEach((x, i) => { if (x.p <= pr + 0.002) a = i; });
      ticks.forEach((t, i) => t.classList.toggle("passed", SECS[i].p <= pr + 0.002));
      $("#rail-label").textContent = SECS[a].label;
      $("#rail-count").textContent = String(a + 1).padStart(2, "0");
    };
    ScrollTrigger.addEventListener("refresh", layout);
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: s => update(s.progress) });
    layout();
  } else if (rail) rail.remove();

  // ---------- Laboratório de cores ----------
  const sv = $("#sv");
  if (sv) {
    const S = { h: 221, s: 1, v: 0.373, a: 1, gloss: 0.6, fx: "solido" };
    const hsv2rgb = (h, s, v) => {
      const f = n => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
      return [f(5), f(3), f(1)].map(x => Math.round(x * 255));
    };
    const rgb2hsv = (r, g, b) => {
      r /= 255; g /= 255; b /= 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
      let h = 0;
      if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      return [Math.round((h * 60 + 360) % 360), mx ? d / mx : 0, mx];
    };
    const hex = rgb => "#" + rgb.map(x => x.toString(16).padStart(2, "0")).join("").toUpperCase();
    const fxNames = { solido: "Sólido", metalico: "Metálico", fluorescente: "Fluorescente", fosforescente: "Fosforescente", madeira: "Madeira", granito: "Granito" };
    const pellet = $("#pellet"), knob = $("#knob");

    const render = (skip) => {
      const rgb = hsv2rgb(S.h, S.s, S.v);
      sv.style.backgroundColor = `hsl(${S.h} 100% 50%)`;
      knob.style.left = S.s * 100 + "%"; knob.style.top = (1 - S.v) * 100 + "%";
      knob.style.background = hex(rgb);
      $("#alpha").style.backgroundImage = `linear-gradient(90deg, transparent, ${hex(rgb)}), conic-gradient(#ddd 25%, #fff 0 50%, #ddd 0 75%, #fff 0)`;
      $("#alpha").style.backgroundSize = "100% 100%, 12px 12px";
      $("#hue").value = S.h; $("#hue-o").textContent = S.h + "°";
      $("#alpha").value = Math.round(S.a * 100); $("#alpha-o").textContent = Math.round(S.a * 100) + "%";
      $("#gloss").value = Math.round(S.gloss * 100); $("#gloss-o").textContent = Math.round(S.gloss * 100) + "%";
      if (skip !== "hex") $("#hex").value = hex(rgb);
      if (skip !== "rgb") { $("#r").value = rgb[0]; $("#g").value = rgb[1]; $("#b").value = rgb[2]; }
      const rgba = `rgba(${rgb.join(",")},${S.a})`;
      pellet.style.setProperty("--c", rgba);
      pellet.style.setProperty("--gloss", S.gloss);
      pellet.style.setProperty("--glow", S.fx === "fluorescente" ? 0.9 : S.fx === "fosforescente" ? 0.5 : 0);
      pellet.dataset.fx = S.fx;
      const ref = $("#ref-code").value.trim();
      $("#spec").innerHTML =
        `<span>HEX</span><b>${hex(rgb)}</b><span>RGB</span><b>${rgb.join(" · ")}</b>` +
        `<span>Opacidade</span><b>${Math.round(S.a * 100)}%${S.a < 1 ? " transl." : ""}</b>` +
        `<span>Brilho</span><b>${S.gloss < 0.35 ? "Fosco" : S.gloss > 0.7 ? "Alto brilho" : "Acetinado"}</b>` +
        `<span>Efeito</span><b>${fxNames[S.fx]}</b>` +
        (ref ? `<span>Ref.</span><b>${$("#ref-type").value} ${ref}</b>` : "");
      const bar = $("#lab-bar-sw");
      if (bar) { bar.style.background = rgba; $("#lab-bar-txt").textContent = `${hex(rgb)} · ${fxNames[S.fx]}`; }
    };

    const pick = e => {
      const r = sv.getBoundingClientRect();
      S.s = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      S.v = Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height));
      render();
    };
    sv.addEventListener("pointerdown", e => { sv.setPointerCapture(e.pointerId); pick(e); sv.addEventListener("pointermove", pick); });
    sv.addEventListener("pointerup", () => sv.removeEventListener("pointermove", pick));
    sv.addEventListener("keydown", e => {
      const st = e.shiftKey ? 0.1 : 0.02;
      if (e.key === "ArrowRight") S.s = Math.min(1, S.s + st);
      else if (e.key === "ArrowLeft") S.s = Math.max(0, S.s - st);
      else if (e.key === "ArrowUp") S.v = Math.min(1, S.v + st);
      else if (e.key === "ArrowDown") S.v = Math.max(0, S.v - st);
      else return;
      e.preventDefault(); render();
    });
    $("#hue").addEventListener("input", e => { S.h = +e.target.value; render(); });
    $("#alpha").addEventListener("input", e => { S.a = +e.target.value / 100; render(); });
    $("#gloss").addEventListener("input", e => { S.gloss = +e.target.value / 100; render(); });
    $("#hex").addEventListener("input", e => {
      const m = e.target.value.trim().match(/^#?([0-9a-f]{6})$/i);
      if (!m) return;
      const n = parseInt(m[1], 16);
      [S.h, S.s, S.v] = rgb2hsv(n >> 16, (n >> 8) & 255, n & 255);
      render("hex");
    });
    ["r", "g", "b"].forEach(id => $("#" + id).addEventListener("input", () => {
      const c = ["r", "g", "b"].map(k => Math.min(255, Math.max(0, +$("#" + k).value || 0)));
      [S.h, S.s, S.v] = rgb2hsv(...c);
      render("rgb");
    }));
    $("#ref-code").addEventListener("input", () => render());
    $("#ref-type").addEventListener("change", () => render());
    $$(".effects button").forEach(b => b.addEventListener("click", () => {
      $$(".effects button").forEach(x => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true"); S.fx = b.dataset.fx; render();
      if (motion) gsap.fromTo(pellet, { scale: 0.92 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, .5)" });
    }));

    // Leva a especificação para o formulário
    const sendColor = () => {
      const rgb = hsv2rgb(S.h, S.s, S.v);
      const ref = $("#ref-code").value.trim();
      const spec = `Cor ${hex(rgb)} (RGB ${rgb.join(", ")}) · opacidade ${Math.round(S.a * 100)}% · brilho ${Math.round(S.gloss * 100)}% · efeito ${fxNames[S.fx]}` + (ref ? ` · ref. ${$("#ref-type").value} ${ref}` : "");
      $("#tipo").value = "Solicitar amostra de cor";
      $("#msg").value = spec + "\nAplicação: ";
      $("#prefill").classList.add("show");
      $("#prefill-sw").style.background = `rgba(${rgb.join(",")},${S.a})`;
      $("#prefill-txt").textContent = "Especificação da cor anexada ao pedido";
      scrollToEl($("#contato"));
    };
    $("#send-color").addEventListener("click", sendColor);
    if ($("#send-color-m")) $("#send-color-m").addEventListener("click", sendColor);

    // Barra fixa do laboratório no celular
    const labBar = $("#lab-bar");
    if (labBar) new IntersectionObserver(([en]) => labBar.classList.toggle("show", en.isIntersecting), { threshold: 0.15 }).observe($(".lab-grid"));
    render();
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
              <a class="btn ghost" href="#contato">Solicitar amostra</a>
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

    // Card flutuante que segue o cursor.
    // Visibilidade decidida pelo elemento sob o ponteiro (inclusive ao rolar sem mexer o mouse);
    // overwrite evita que a animação de entrada vença a de saída.
    const fl = $("#mat-float");
    if (fl && finePointer && motion) {
      const xTo = gsap.quickTo(fl, "x", { duration: 0.5, ease: "power3" });
      const yTo = gsap.quickTo(fl, "y", { duration: 0.5, ease: "power3" });
      let px = -1, py = -1, shown = null;
      const hide = () => {
        if (shown === null) return;
        shown = null;
        gsap.to(fl, { opacity: 0, scale: 0.8, duration: 0.25, ease: "power2.out", overwrite: "auto" });
      };
      const sync = () => {
        const el = px < 0 ? null : document.elementFromPoint(px, py);
        const head = el && el.closest("#mat-index .mat-head");
        const row = head && head.closest(".mat-row");
        if (!row || row.classList.contains("open")) return hide();
        if (shown === row.dataset.id) return;
        shown = row.dataset.id;
        const m = M.find(x => x.id === shown);
        $("#mf-name").textContent = m.name;
        $("#mf-props").textContent = m.traits.slice(0, 3).join(" · ");
        $("#mf-pellet").style.setProperty("--c", LOOK[m.id] || "#888");
        $("#mf-pellet").style.setProperty("--gloss", 0.8);
        gsap.to(fl, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.6)", overwrite: "auto" });
      };
      addEventListener("pointermove", e => { px = e.clientX; py = e.clientY; xTo(px + 28); yTo(py - 140); sync(); }, { passive: true });
      document.documentElement.addEventListener("pointerleave", () => { px = -1; hide(); });
      if (lenis) lenis.on("scroll", sync); else addEventListener("scroll", sync, { passive: true });
      idx.addEventListener("click", () => setTimeout(sync, 0));
    } else if (fl) fl.remove();
  }


  // ---------- Grânulo 3D (Three.js) no guia de seleção ----------
  const pellet3d = (() => {
    const box = $("#g3d"), cvs = $("#g3d-canvas");
    if (!box || !cvs) return null;
    if (!window.THREE) { box.remove(); return null; }
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: true }); } catch (e) { box.remove(); return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0.4, 7);

    // Perfil de um pellet cilíndrico com bordas arredondadas, girado em torno do eixo
    const R = 1, Hh = 0.62, e = 0.34, pts = [new THREE.Vector2(0, -Hh)];
    for (let i = 0; i <= 8; i++) { const t = (i / 8) * Math.PI / 2; pts.push(new THREE.Vector2(R - e + Math.sin(t) * e, -Hh + e - Math.cos(t) * e)); }
    for (let i = 0; i <= 8; i++) { const t = (i / 8) * Math.PI / 2; pts.push(new THREE.Vector2(R - e + Math.cos(t) * e, Hh - e + Math.sin(t) * e)); }
    pts.push(new THREE.Vector2(0, Hh));
    const geo = new THREE.LatheGeometry(pts, 64);
    geo.computeVertexNormals();

    const mat = new THREE.MeshPhysicalMaterial({ color: 0xe8e4d8, roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.15, transparent: true, opacity: 1 });
    const main = new THREE.Mesh(geo, mat);
    main.rotation.set(0.9, 0, 0.35);
    const group = new THREE.Group();
    group.add(main);

    // Grânulos menores orbitando
    const small = [];
    for (let i = 0; i < 7; i++) {
      const m = new THREE.Mesh(geo, mat);
      const s = 0.14 + Math.random() * 0.12;
      m.scale.setScalar(s);
      m.userData = { a: (i / 7) * Math.PI * 2, r: 1.9 + Math.random() * 0.5, y: (Math.random() - 0.5) * 1.6, sp: 0.15 + Math.random() * 0.2, rx: Math.random() * 3, ry: Math.random() * 3 };
      group.add(m); small.push(m);
    }
    scene.add(group);

    scene.add(new THREE.HemisphereLight(0xf4f5f7, 0x050b1a, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.05); key.position.set(3, 4, 5); scene.add(key);
    const rim = new THREE.PointLight(0xffd100, 1.2, 20); rim.position.set(-4, -1.5, -2); scene.add(rim);
    const fillL = new THREE.PointLight(0x7fa8ff, 0.5, 20); fillL.position.set(-3, 3, 4); scene.add(fillL);

    const parse = c => { const m = c.match(/[\d.]+/g).map(Number); return { color: new THREE.Color(m[0] / 255, m[1] / 255, m[2] / 255), a: m[3] }; };
    const target = { color: new THREE.Color(0xe8e4d8), a: 1 };
    const set = (id, burst) => {
      const look = parse(LOOK[id] || LOOK.abs);
      target.color.copy(look.color); target.a = look.a;
      const m = M.find(x => x.id === id);
      $("#g3d-name").textContent = m ? m.name : "";
      if (burst) spin += 2.4;
    };

    // Arrastar para girar, com inércia; o mouse inclina levemente
    let dragging = false, lx = 0, ly = 0, vx = 0.004, vy = 0, rotY = 0, rotX = 0.15, spin = 0, hx = 0, hy = 0;
    box.addEventListener("pointerdown", e => { dragging = true; lx = e.clientX; ly = e.clientY; box.setPointerCapture(e.pointerId); });
    box.addEventListener("pointermove", e => {
      const r = box.getBoundingClientRect();
      hx = (e.clientX - r.left) / r.width - 0.5; hy = (e.clientY - r.top) / r.height - 0.5;
      if (!dragging) return;
      vx = (e.clientX - lx) * 0.006; vy = (e.clientY - ly) * 0.006; lx = e.clientX; ly = e.clientY;
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
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(box);
    const frame = now => {
      requestAnimationFrame(frame);
      if (!visible) return;
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
      mat.color.lerp(target.color, 0.08);
      mat.opacity += (target.a - mat.opacity) * 0.08;
      mat.roughness = mat.opacity < 0.6 ? 0.05 : 0.28;
      mat.depthWrite = mat.opacity > 0.9;
      renderer.render(scene, camera);
    };
    requestAnimationFrame(frame);
    set("abs");
    return { set };
  })();

  // ---------- Guia de seleção em etapas ----------
  const gStage = $("#g-stage");
  if (gStage) {
    const Q = [
      { k: "seg", q: "Para qual segmento é a peça?", o: [["automotivo", "Automotivo", "Interior, exterior, iluminação"], ["eletro", "Eletroeletrônicos", "Carcaças, conectores, plugs"], ["linha-branca", "Linha branca", "Geladeiras, lavadoras, pequenos"], ["construcao", "Construção civil", "Perfis, telhas, conexões"], ["embalagens", "Embalagens e cosméticos", "Potes, frascos, tampas"]] },
      { k: "prop", q: "Qual é a exigência principal?", o: [["impacto", "Resistência ao impacto", "Peças sujeitas a choque"], ["chama", "Anti-chama", "V0 / RoHS / halogênio free"], ["transparencia", "Transparência", "Lentes, visores, utilidades"], ["temperatura", "Alta temperatura", "Próximo a calor ou motor"], ["rigidez", "Rigidez e mecânica", "Engrenagens, peças técnicas"]] },
      { k: "env", q: "Onde a peça será usada?", o: [["interno", "Ambiente interno", "Sem exposição ao sol"], ["uv", "Ambiente externo", "Sol, chuva e intempéries"]] }
    ];
    const A = {};
    let step = 0;
    const back = $("#g-back");
    const setProg = () => {
      $("#g-step").textContent = step < Q.length ? `0${step + 1} / 03` : "Resultado";
      $("#g-bar").style.transform = `scaleX(${Math.min(1, (step + 1) / Q.length)})`;
      back.hidden = step === 0;
    };
    const animIn = dir => { if (motion) gsap.from(gStage.children, { x: 60 * dir, opacity: 0, duration: 0.6, ease: "expo.out", stagger: 0.04 }); };
    const showStep = (dir = 1) => {
      const s = Q[step];
      gStage.innerHTML = `<p class="g-q">${s.q}</p><div class="g-cards">${s.o.map((o, i) =>
        `<button type="button" class="g-card${A[s.k] === o[0] ? " sel" : ""}" data-v="${o[0]}" data-cursor="Selecionar"><span class="gi">0${i + 1}</span><span><span class="gl">${o[1]}</span><span class="gs" style="display:block">${o[2]}</span></span></button>`).join("")}</div>`;
      setProg();
      if (motion) gsap.from($$(".g-card", gStage), { y: 40, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.05 });
      animIn(dir);
    };
    const rank = () => M.map(m => ({
      m, s: (m.segments.includes(A.seg) ? 2 : 0) + (m.props.includes(A.prop) ? 3 : 0) + (A.env === "uv" && m.props.includes("uv") ? 2 : 0)
    })).sort((x, y) => y.s - x.s);
    const showResult = () => {
      const [a, b] = rank();
      const label = (k, v) => Q.find(q => q.k === k).o.find(o => o[0] === v)[1];
      gStage.innerHTML = `
        <div class="result">
          <div>
            <div class="mono" style="color:var(--steel)">SUGESTÃO INICIAL</div>
            <div class="r-name">${a.m.name}</div>
            <div class="r-sum">${label("seg", A.seg)} · ${label("prop", A.prop)} · ${label("env", A.env)}<br>Alternativa: ${b.m.name}</div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button type="button" class="btn ghost" id="g-redo">Refazer</button>
            <a class="btn ghost" href="produto.html?linha=${a.m.id}" data-cursor="Ver">Ver ${a.m.name}</a>
            <a class="btn" href="#contato">Validar com um especialista <span class="arr">→</span></a>
          </div>
        </div>`;
      setProg();
      $("#g-redo").addEventListener("click", () => { step = 0; Object.keys(A).forEach(k => delete A[k]); showStep(-1); if (pellet3d) pellet3d.set("abs", true); });
      if (motion) {
        gsap.from(".result", { y: 40, opacity: 0, duration: 0.8, ease: "expo.out" });
        gsap.from(".result .r-name", { yPercent: 80, opacity: 0, duration: 1, ease: "expo.out", delay: 0.1 });
      }
    };
    gStage.addEventListener("click", e => {
      const c = e.target.closest(".g-card");
      if (!c) return;
      A[Q[step].k] = c.dataset.v;
      if (pellet3d) pellet3d.set(rank()[0].m.id, true);
      $$(".g-card", gStage).forEach(x => x.classList.toggle("sel", x === c));
      if (cur) cur.classList.remove("big");
      setTimeout(() => { step++; step < Q.length ? showStep(1) : showResult(); }, motion ? 380 : 0);
    });
    back.addEventListener("click", () => { if (step > 0) { step--; showStep(-1); } });
    showStep();
  }

  // ---------- Formulário ----------
  const form = $("#contact-form");
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
    document.title = `${m.name} — Remo Polímeros · Wireframe v0.6`;
    $$("[data-f]").forEach(el => {
      const k = el.dataset.f;
      if (k === "apps") el.innerHTML = m.apps.map(a => `<li>${a}</li>`).join("");
      else if (k === "traits") el.innerHTML = m.traits.map(t => `<span class="chip">${t}</span>`).join("");
      else if (k === "sheets") el.textContent = m.sheets;
      else el.textContent = m[k];
    });
    $("#grades").innerHTML = m.grades.map(g =>
      `<div class="grade"><div><b>${g[0]}</b><small>${g[1]}</small></div><div style="display:flex;gap:16px"><a href="#">Ficha técnica PDF ↓</a><a href="index.html#contato">Pedir amostra</a></div></div>`).join("");
    $("#other-lines").innerHTML = M.filter(x => x.id !== m.id).map(x => `<a class="btn ghost sm" href="produto.html?linha=${x.id}" data-cursor="Ver">${x.name}</a>`).join("");
    if (motion) {
      gsap.from(".p-hero .big", { yPercent: 30, opacity: 0, duration: 1.2, ease: "expo.out" });
      gsap.from("#grades .grade", { y: 20, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: "#grades", start: "top 85%" } });
    }
  }

  if (hasGsap) { ScrollTrigger.sort(); ScrollTrigger.refresh(); }
})();
