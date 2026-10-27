// Interações e rolagens do wireframe v0.2 (GSAP + ScrollTrigger + Lenis)
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const M = window.REMO_MATERIALS || [];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const motion = hasGsap && !reduced;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

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
    if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    scrollToEl(el);
  }));

  // ---------- Header que some ao descer ----------
  const header = $("#header");
  let lastY = 0;
  const onScroll = y => {
    if (header) header.classList.toggle("hidden", y > lastY && y > 400);
    lastY = y;
  };
  if (lenis) lenis.on("scroll", e => onScroll(e.scroll));
  else addEventListener("scroll", () => onScroll(scrollY), { passive: true });

  // ---------- Progresso ----------
  if (motion && $("#progress")) {
    gsap.to("#progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
  }

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

  if (motion) {
    // Hero se afasta ao rolar
    gsap.to("#hero-inner", { yPercent: -18, opacity: 0.1, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to("#field", { opacity: 0.25, scale: 1.08, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

    // Títulos em linhas (fora do hero)
    $$("[data-lines]").forEach(h => {
      if (h.closest(".hero")) return;
      gsap.from($$(".line > span", h), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: h, start: "top 85%" } });
    });

    // Revelação genérica
    $$("[data-reveal]").forEach(el => {
      if (el.closest(".hero")) return;
      gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
    });

    // Faixa de segmentos reage à velocidade da rolagem
    const mq = $("#marquee");
    if (mq) {
      const loopTw = gsap.to(mq, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
      ScrollTrigger.create({
        onUpdate: self => {
          const v = Math.min(Math.abs(self.getVelocity()) / 300, 6);
          gsap.to(loopTw, { timeScale: (self.direction > 0 ? 1 : -1) * (1 + v), duration: 0.3, overwrite: true });
          gsap.to(loopTw, { timeScale: self.direction > 0 ? 1 : -1, duration: 1.2, delay: 0.3 });
        }
      });
    }

    // Manifesto palavra por palavra
    const mf = $("#manifesto");
    if (mf) {
      mf.innerHTML = mf.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(" ");
      gsap.to($$(".w", mf), { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: mf, start: "top 80%", end: "bottom 40%", scrub: true } });
    }

    // Contadores
    $$("[data-count]").forEach(el => {
      const o = { v: 0 };
      gsap.to(o, { v: +el.dataset.count, duration: 1.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" }, onUpdate: () => { el.textContent = Math.round(o.v); } });
    });

    // Selo ISO gira com a rolagem
    gsap.to("#ring-g", { rotation: 200, transformOrigin: "50% 50%", ease: "none", scrollTrigger: { trigger: "#qualidade", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from("#seal .core", { scale: 0.7, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: "#seal", start: "top 75%" } });

    // Seções horizontais fixas (somente desktop)
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", () => {
      const steps = $("#steps");
      if (steps) {
        const dist = () => steps.scrollWidth - innerWidth;
        gsap.to(steps, {
          x: () => -dist(), ease: "none",
          scrollTrigger: {
            trigger: "#hscroll", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true,
            onUpdate: s => { $("#step-count").textContent = `0${Math.min(4, Math.floor(s.progress * 3.999) + 1)} / 04`; }
          }
        });
      }
      const tlEl = $("#timeline");
      if (tlEl) {
        const dist = () => Math.max(0, tlEl.scrollWidth - innerWidth);
        const st = { trigger: "#tl-pin", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true };
        gsap.to(tlEl, { x: () => -dist(), ease: "none", scrollTrigger: st });
        gsap.to("#tl-fill", { scaleX: 1, ease: "none", scrollTrigger: { ...st, pin: false } });
      }
    });
  } else {
    $$("[data-count]").forEach(el => { el.textContent = el.dataset.count; });
  }

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
      pellet.style.setProperty("--c", `rgba(${rgb.join(",")},${S.a})`);
      pellet.style.setProperty("--gloss", S.gloss);
      pellet.style.setProperty("--glow", S.fx === "fluorescente" ? 0.9 : S.fx === "fosforescente" ? 0.5 : 0);
      pellet.dataset.fx = S.fx;
      const ref = $("#ref-code").value.trim();
      $("#spec").innerHTML =
        `<span>HEX</span><b>${hex(rgb)}</b><span>RGB</span><b>${rgb.join(" · ")}</b>` +
        `<span>Opacidade</span><b>${Math.round(S.a * 100)}%${S.a < 1 ? " (translúcido)" : ""}</b>` +
        `<span>Brilho</span><b>${Math.round(S.gloss * 100)}% · ${S.gloss < 0.35 ? "fosco" : S.gloss > 0.7 ? "alto brilho" : "acetinado"}</b>` +
        `<span>Efeito</span><b>${fxNames[S.fx]}</b>` +
        (ref ? `<span>Referência</span><b>${$("#ref-type").value} ${ref}</b>` : "");
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
    $("#send-color").addEventListener("click", () => {
      const rgb = hsv2rgb(S.h, S.s, S.v);
      const ref = $("#ref-code").value.trim();
      const spec = `Cor ${hex(rgb)} (RGB ${rgb.join(", ")}) · opacidade ${Math.round(S.a * 100)}% · brilho ${Math.round(S.gloss * 100)}% · efeito ${fxNames[S.fx]}` + (ref ? ` · ref. ${$("#ref-type").value} ${ref}` : "");
      $("#tipo").value = "Solicitar amostra de cor";
      $("#msg").value = spec + "\nAplicação: ";
      $("#prefill").classList.add("show");
      $("#prefill-sw").style.background = `rgba(${rgb.join(",")},${S.a})`;
      $("#prefill-txt").textContent = "Especificação da cor anexada ao pedido";
      scrollToEl($("#contato"));
    });
    render();
  }

  // ---------- Materiais ----------
  const panelHTML = m => `
    <div class="material-panel">
      <div>
        <div class="big">${m.name}</div>
        <div class="full">${m.full}</div>
        <p style="font-size:18px;max-width:52ch">${m.desc}</p>
        <b style="font:12px var(--f-mono);text-transform:uppercase;letter-spacing:.08em;color:var(--slate)">Principais aplicações</b>
        <ul>${m.apps.map(a => `<li>${a}</li>`).join("")}</ul>
        <div>${m.traits.map(t => `<span class="chip">${t}</span>`).join("")}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px">
          <a class="btn navy" href="produto.html?linha=${m.id}">Ver linha ${m.name} <span class="arr">→</span></a>
          <a class="btn ghost" href="#contato">Solicitar amostra</a>
        </div>
      </div>
      <div>
        <div class="mono" style="color:var(--slate);margin-bottom:8px">GRADES EM DESTAQUE · ${m.sheets} FICHAS TÉCNICAS</div>
        <div class="grade-list">
          ${m.grades.slice(0, 5).map(g => `<div class="grade"><div><b>${g[0]}</b><small>${g[1]}</small></div><a href="#">Ficha PDF ↓</a></div>`).join("")}
        </div>
      </div>
    </div>`;
  const tabs = $("#mat-tabs"), panel = $("#mat-panel");
  if (tabs && panel) {
    tabs.innerHTML = M.map((m, i) => `<button role="tab" id="tab-${m.id}" aria-selected="${i === 0}" data-id="${m.id}">${m.name}</button>`).join("");
    const show = id => {
      $$("button", tabs).forEach(b => b.setAttribute("aria-selected", String(b.dataset.id === id)));
      panel.innerHTML = panelHTML(M.find(m => m.id === id));
      panel.setAttribute("aria-labelledby", "tab-" + id);
      $$('a[href="#contato"]', panel).forEach(a => a.addEventListener("click", e => { e.preventDefault(); scrollToEl($("#contato")); }));
      if (motion) {
        gsap.from(".material-panel .big", { yPercent: 40, opacity: 0, duration: 0.8, ease: "expo.out" });
        gsap.from(".material-panel .grade", { y: 16, opacity: 0, duration: 0.6, ease: "expo.out", stagger: 0.05 });
      }
    };
    tabs.addEventListener("click", e => { const b = e.target.closest("button"); if (b) show(b.dataset.id); });
    show(M[0].id);
  }

  // ---------- Guia de seleção ----------
  const quiz = $("#quiz"), result = $("#quiz-result");
  if (quiz && result) {
    const run = () => {
      const f = new FormData(quiz);
      const seg = f.get("seg"), prop = f.get("prop"), env = f.get("env");
      const [a, b] = M.map(m => ({
        m, s: (m.segments.includes(seg) ? 2 : 0) + (m.props.includes(prop) ? 3 : 0) + (env === "uv" && m.props.includes("uv") ? 2 : 0)
      })).sort((x, y) => y.s - x.s);
      result.innerHTML = `
        <div><div class="mono" style="color:var(--steel)">SUGESTÃO INICIAL</div>
        <div class="r-name">${a.m.name}</div><div class="mono" style="color:var(--steel);margin-top:6px">alternativa: ${b.m.name}</div></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a class="btn ghost" href="produto.html?linha=${a.m.id}">Ver ${a.m.name}</a>
          <a class="btn" href="#contato" data-go>Validar com um especialista <span class="arr">→</span></a>
        </div>`;
      const go = $("[data-go]", result);
      go.addEventListener("click", e => { e.preventDefault(); scrollToEl($("#contato")); });
      if (motion) gsap.from(".r-name", { yPercent: 60, opacity: 0, duration: 0.6, ease: "expo.out" });
    };
    quiz.addEventListener("change", run);
    run();
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
    document.title = `${m.name} — Remo Polímeros · Wireframe v0.2`;
    $$("[data-f]").forEach(el => {
      const k = el.dataset.f;
      if (k === "apps") el.innerHTML = m.apps.map(a => `<li>${a}</li>`).join("");
      else if (k === "traits") el.innerHTML = m.traits.map(t => `<span class="chip">${t}</span>`).join("");
      else if (k === "sheets") el.textContent = m.sheets;
      else el.textContent = m[k];
    });
    $("#grades").innerHTML = m.grades.map(g =>
      `<div class="grade"><div><b>${g[0]}</b><small>${g[1]}</small></div><div style="display:flex;gap:16px"><a href="#">Ficha técnica PDF ↓</a><a href="index.html#contato">Pedir amostra</a></div></div>`).join("");
    $("#other-lines").innerHTML = M.filter(x => x.id !== m.id).map(x => `<a class="btn ghost sm" href="produto.html?linha=${x.id}">${x.name}</a>`).join("");
    if (motion) {
      gsap.from(".p-hero .big", { yPercent: 30, opacity: 0, duration: 1.2, ease: "expo.out" });
      gsap.from("#grades .grade", { y: 20, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: "#grades", start: "top 85%" } });
    }
  }
})();
