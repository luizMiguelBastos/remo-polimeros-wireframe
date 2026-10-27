// Interações do wireframe (somente para validar usabilidade)
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const M = window.REMO_MATERIALS || [];

  // Mostrar/ocultar notas de UX
  const tn = $("#toggle-notes");
  if (tn) tn.addEventListener("click", () => {
    const hidden = document.body.classList.toggle("hide-notes");
    tn.setAttribute("aria-pressed", String(!hidden));
    tn.textContent = hidden ? "Mostrar notas de UX" : "Ocultar notas de UX";
  });

  // Menu mobile
  const mt = $(".menu-toggle"), nav = $("#nav");
  if (mt && nav) mt.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    mt.setAttribute("aria-expanded", String(open));
  });

  // Laboratório de cores
  const pellet = $("#pellet"), label = $("#pellet-label");
  if (pellet) {
    let color = "Azul", effect = "Sólido";
    const paint = () => { label.textContent = `[GRÂNULO 3D] ${color} · ${effect}`; };
    $$(".swatch").forEach(b => b.addEventListener("click", () => {
      $$(".swatch").forEach(x => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true");
      pellet.style.background = b.dataset.c;
      pellet.style.color = b.dataset.c === "#e8e8e8" ? "#222" : "#fff";
      color = b.getAttribute("aria-label");
      paint();
    }));
    $$(".seg button").forEach(b => b.addEventListener("click", () => {
      $$(".seg button").forEach(x => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true");
      effect = b.textContent;
      paint();
    }));
  }

  // Painel de material (usado na home)
  const panelHTML = m => `
    <div class="material-panel">
      <div>
        <h3 style="font-size:24px">${m.name} <span class="muted" style="font-size:15px;font-weight:400">· ${m.full}</span></h3>
        <p>${m.desc}</p>
        <b style="font-size:14px">Principais aplicações</b>
        <ul>${m.apps.map(a => `<li>${a}</li>`).join("")}</ul>
        <div>${m.traits.map(t => `<span class="chip">${t}</span>`).join("")}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">
          <a class="btn" href="produto.html?linha=${m.id}">Ver linha ${m.name}</a>
          <a class="btn ghost" href="#contato">Solicitar amostra</a>
        </div>
      </div>
      <div>
        <b style="font-size:14px">Grades em destaque · ${m.sheets} fichas técnicas</b>
        <div class="grade-list" style="margin-top:8px">
          ${m.grades.slice(0, 4).map(g => `<div class="grade"><div><b>${g[0]}</b><small>${g[1]}</small></div><a href="#">Ficha PDF ↓</a></div>`).join("")}
        </div>
      </div>
    </div>`;

  const tabs = $("#mat-tabs"), panel = $("#mat-panel");
  if (tabs && panel) {
    tabs.innerHTML = M.map((m, i) =>
      `<button role="tab" id="tab-${m.id}" aria-selected="${i === 0}" data-id="${m.id}">${m.name}</button>`).join("");
    const show = id => {
      $$("button", tabs).forEach(b => b.setAttribute("aria-selected", String(b.dataset.id === id)));
      panel.innerHTML = panelHTML(M.find(m => m.id === id));
      panel.setAttribute("aria-labelledby", "tab-" + id);
    };
    tabs.addEventListener("click", e => { const b = e.target.closest("button"); if (b) show(b.dataset.id); });
    show(M[0].id);
  }

  // Guia de seleção: pontua cada linha pelas respostas
  const quiz = $("#quiz"), result = $("#quiz-result");
  if (quiz && result) {
    const run = () => {
      const f = new FormData(quiz);
      const seg = f.get("seg"), prop = f.get("prop"), env = f.get("env");
      const scored = M.map(m => ({
        m,
        s: (m.segments.includes(seg) ? 2 : 0) + (m.props.includes(prop) ? 3 : 0) + (env === "uv" && m.props.includes("uv") ? 2 : 0)
      })).sort((a, b) => b.s - a.s);
      const [a, b] = scored;
      result.innerHTML = `
        <div><div class="muted" style="font-size:13px">Sugestão inicial</div>
        <b style="font-size:20px">${a.m.name}</b> <span class="muted">ou ${b.m.name}</span></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a class="btn ghost" href="produto.html?linha=${a.m.id}">Ver ${a.m.name}</a>
          <a class="btn" href="#contato">Validar com um especialista</a>
        </div>`;
    };
    quiz.addEventListener("change", run);
    run();
  }

  // Página de produto (produto.html?linha=...)
  const pp = $("#product-page");
  if (pp) {
    const id = new URLSearchParams(location.search).get("linha") || "abs";
    const m = M.find(x => x.id === id) || M[0];
    document.title = `Wireframe — ${m.name} | Remo Polímeros`;
    $$("[data-f]").forEach(el => {
      const k = el.dataset.f;
      if (k === "apps") el.innerHTML = m.apps.map(a => `<li>${a}</li>`).join("");
      else if (k === "traits") el.innerHTML = m.traits.map(t => `<span class="chip">${t}</span>`).join("");
      else if (k === "sheets") el.textContent = m.sheets;
      else el.textContent = m[k];
    });
    $("#grades").innerHTML = m.grades.map(g =>
      `<div class="grade"><div><b>${g[0]}</b><small>${g[1]}</small></div><div style="display:flex;gap:12px"><a href="#">Ficha técnica PDF ↓</a><a href="index.html#contato">Pedir amostra</a></div></div>`).join("");
    $("#other-lines").innerHTML = M.filter(x => x.id !== m.id).map(x =>
      `<a class="btn ghost" href="produto.html?linha=${x.id}">${x.name}</a>`).join("");
  }
})();
