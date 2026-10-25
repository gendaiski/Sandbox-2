(() => {
  "use strict";
  const catalog = JSON.parse(document.getElementById("catalog-data").textContent);
  const tools = catalog.items;
  const bySlug = new Map(tools.map(tool => [tool.slug, tool]));
  const $ = id => document.getElementById(id);
  const storageKey = "legal-standards-workspace-v1";
  const criteria = [
    ["accuracy", "Legal accuracy", "How correct and responsive was the result?"],
    ["documents", "Document handling", "How well did it work with your files?"],
    ["transparency", "Source transparency", "Were sources and uncertainty clear?"],
    ["workflow", "Workflow fit", "Did it fit your working process?"],
    ["control", "Security & control", "Could you manage access and data safely?"],
  ];
  const text = value => String(value ?? "");
  const escapeHTML = value => text(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
  const typeName = kind => kind === "legal_ai" ? "Legal AI" : kind === "general_purpose" ? "General purpose" : "Other";
  function safeUrl(value) { try { const url = new URL(value); return url.protocol === "https:" ? url.href : null; } catch { return null; } }
  function readStorage() { try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { return {}; } }
  const stored = readStorage();
  const state = {
    compare: Array.isArray(stored.compare) ? stored.compare.filter(slug => bySlug.has(slug)).slice(0, 3) : [],
    assessments: stored.assessments && typeof stored.assessments === "object" && !Array.isArray(stored.assessments) ? stored.assessments : {},
    useCase: "all",
    query: "",
    kind: "all",
    sort: "source",
    trayDismissed: false,
  };
  function persist() { try { localStorage.setItem(storageKey, JSON.stringify({compare: state.compare, assessments: state.assessments})); return true; } catch { toast("Browser storage is unavailable; export your work before closing."); return false; } }
  let toastTimer;
  function toast(message) { const node = $("toast"); node.textContent = message; node.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove("show"), 3200); }
  function toolName(slug) { return bySlug.get(slug)?.name || "Unknown product"; }
  function initials(name) { return name.split(/\s+/).map(word => word[0]).slice(0, 2).join("").toUpperCase(); }

  const useCases = [...new Set(tools.flatMap(tool => tool.use_cases))].sort();
  const filterWrap = $("usecase-filters");
  for (const label of ["All", ...useCases]) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = label;
    button.dataset.case = label === "All" ? "all" : label;
    button.setAttribute("aria-pressed", String(button.dataset.case === "all"));
    button.addEventListener("click", () => { state.useCase = button.dataset.case; renderFilters(); renderCards(); });
    filterWrap.append(button);
  }
  function renderFilters() { filterWrap.querySelectorAll("button").forEach(button => { const active = button.dataset.case === state.useCase; button.classList.toggle("active", active); button.setAttribute("aria-pressed", String(active)); }); }
  function clearFilters() { state.query = ""; state.kind = "all"; state.useCase = "all"; state.sort = "source"; $("search").value = ""; $("type-filter").value = "all"; $("sort").value = "source"; renderFilters(); renderCards(); }
  $("search").addEventListener("input", event => { state.query = event.target.value.trim().toLocaleLowerCase(); renderCards(); });
  $("type-filter").addEventListener("change", event => { state.kind = event.target.value; renderCards(); });
  $("sort").addEventListener("change", event => { state.sort = event.target.value; renderCards(); });
  $("clear-filters").addEventListener("click", clearFilters);
  $("empty-clear").addEventListener("click", clearFilters);

  function matches(tool) {
    const searchable = [tool.name, typeName(tool.kind), ...tool.use_cases, ...tool.audience].join(" ").toLocaleLowerCase();
    return (!state.query || searchable.includes(state.query)) && (state.kind === "all" || tool.kind === state.kind) && (state.useCase === "all" || tool.use_cases.includes(state.useCase));
  }
  function card(tool, index) {
    const selected = state.compare.includes(tool.slug);
    const root = document.createElement("article");
    root.className = "tool-card";
    root.innerHTML = `<div class="tool-top"><span class="tool-logo" aria-hidden="true">${escapeHTML(initials(tool.name))}</span><div><h3>${escapeHTML(tool.name)}</h3><div class="tool-kind">${escapeHTML(typeName(tool.kind))}</div></div><span class="tool-number">${String(index + 1).padStart(2, "0")}</span></div><p>Source-listed for ${escapeHTML(tool.use_cases.slice(0, 2).join(" and ") || "legal work")}.</p><div class="tool-tags">${tool.use_cases.slice(0, 3).map(value => `<span>${escapeHTML(value)}</span>`).join("")}</div><div class="tool-actions"><button type="button" data-profile="${escapeHTML(tool.slug)}">View profile ↗</button><button type="button" class="add ${selected ? "active" : ""}" data-compare="${escapeHTML(tool.slug)}" aria-pressed="${selected}">${selected ? "✓ Added to compare" : "+ Add to compare"}</button></div>`;
    return root;
  }
  function renderCards() {
    const filtered = tools.filter(matches);
    if (state.sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
    $("tool-grid").replaceChildren(...filtered.map(card));
    $("result-count").textContent = String(filtered.length);
    $("empty-results").hidden = filtered.length > 0;
  }
  $("tool-grid").addEventListener("click", event => {
    const profile = event.target.closest("[data-profile]");
    const compare = event.target.closest("[data-compare]");
    if (profile) openProfile(profile.dataset.profile);
    if (compare) toggleCompare(compare.dataset.compare);
  });

  function toggleCompare(slug) {
    if (!bySlug.has(slug)) return;
    if (state.compare.includes(slug)) state.compare = state.compare.filter(value => value !== slug);
    else if (state.compare.length >= 3) { toast("Compare up to three products at once."); return; }
    else state.compare.push(slug);
    state.trayDismissed = false;
    persist(); renderCards(); renderCompare(); renderNav();
    toast(state.compare.includes(slug) ? `${toolName(slug)} added to comparison.` : `${toolName(slug)} removed from comparison.`);
  }
  function renderCompare() {
    $("nav-compare-count").textContent = String(state.compare.length);
    $("tray-count").textContent = String(state.compare.length);
    $("compare-empty").hidden = state.compare.length > 0;
    $("compare-content").hidden = state.compare.length === 0;
    const selected = state.compare.map(slug => bySlug.get(slug));
    if (!selected.length) { $("compare-table").replaceChildren(); return; }
    const cells = (label, get) => `<tr><th scope="row">${escapeHTML(label)}</th>${selected.map(tool => `<td>${get(tool)}</td>`).join("")}</tr>`;
    const website = tool => { const url = safeUrl(tool.listed_website); return url ? `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(new URL(url).hostname.replace(/^www\./, ""))} ↗</a>` : "Not listed"; };
    const score = tool => { const item = state.assessments[tool.slug]; return item && item.scores ? `${average(item.scores).toFixed(1)} / 5 <small>(your assessment)</small>` : "No personal assessment"; };
    $("compare-table").innerHTML = `<thead><tr><th scope="col">Compare</th>${selected.map(tool => `<th scope="col">${escapeHTML(tool.name)}<br><button type="button" data-remove="${escapeHTML(tool.slug)}">Remove</button></th>`).join("")}</tr></thead><tbody>${cells("Product type", tool => escapeHTML(typeName(tool.kind)))}${cells("Source-listed uses", tool => escapeHTML(tool.use_cases.join(", ") || "Not listed"))}${cells("Audience", tool => escapeHTML(tool.audience.join(", ") || "Not listed"))}${cells("Listed website", website)}${cells("My assessment", score)}${cells("Independent result", () => "Not yet tested by Legal Standards")}</tbody>`;
  }
  $("compare-table").addEventListener("click", event => { const button = event.target.closest("[data-remove]"); if (button) toggleCompare(button.dataset.remove); });
  $("clear-compare").addEventListener("click", () => { state.compare = []; persist(); renderCompare(); renderCards(); renderNav(); });
  $("tray-close").addEventListener("click", () => { state.trayDismissed = true; renderNav(); });

  const dialog = $("profile-dialog");
  function openProfile(slug) {
    const tool = bySlug.get(slug); if (!tool) return;
    $("profile-title").textContent = tool.name;
    const website = safeUrl(tool.listed_website);
    const source = safeUrl(tool.source_profile);
    $("profile-body").innerHTML = `<p class="profile-tagline">A ${escapeHTML(typeName(tool.kind).toLowerCase())} product listed for ${escapeHTML(tool.use_cases.slice(0, 2).join(" and ") || "legal work")}.</p><dl class="profile-meta"><dt>Source-listed use cases</dt><dd><div class="profile-tags">${tool.use_cases.map(value => `<span>${escapeHTML(value)}</span>`).join("") || "Not listed"}</div></dd><dt>Audience</dt><dd>${escapeHTML(tool.audience.join(", ") || "Not listed")}</dd><dt>Listed product site</dt><dd>${website ? `<a href="${escapeHTML(website)}" target="_blank" rel="noopener noreferrer">${escapeHTML(new URL(website).hostname.replace(/^www\./, ""))} ↗</a>` : "Not listed"}</dd><dt>Independent score</dt><dd>Not yet tested by Legal Standards</dd></dl><div class="profile-actions"><button class="button solid" type="button" data-profile-compare="${escapeHTML(slug)}">${state.compare.includes(slug) ? "Remove from compare" : "Add to compare"}</button><button class="button outline" type="button" data-profile-review="${escapeHTML(slug)}">Write my assessment</button>${source ? `<a class="button outline" href="${escapeHTML(source)}" target="_blank" rel="noopener noreferrer">Source listing ↗</a>` : ""}</div><p class="profile-note">Source categories were imported from a captured public directory. The listed website and use cases have not been independently verified by Legal Standards.</p>`;
    dialog.showModal();
  }
  $("profile-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  $("profile-body").addEventListener("click", event => {
    const compare = event.target.closest("[data-profile-compare]");
    const review = event.target.closest("[data-profile-review]");
    if (compare) { toggleCompare(compare.dataset.profileCompare); dialog.close(); }
    if (review) { $("review-tool").value = review.dataset.profileReview; fillForm(review.dataset.profileReview); dialog.close(); location.hash = "#review"; }
  });

  function average(scores) { const values = criteria.map(([key]) => Number(scores[key])).filter(value => Number.isFinite(value) && value >= 1 && value <= 5); return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0; }
  const select = $("review-tool");
  for (const tool of tools.slice().sort((a, b) => a.name.localeCompare(b.name))) { const option = document.createElement("option"); option.value = tool.slug; option.textContent = tool.name; select.append(option); }
  for (const [key, title, help] of criteria) {
    const box = document.createElement("div"); box.className = "criterion";
    box.innerHTML = `<label for="score-${key}">${escapeHTML(title)} <span id="value-${key}">3 / 5</span></label><p>${escapeHTML(help)}</p><input type="range" id="score-${key}" name="${key}" min="1" max="5" step="1" value="3">`;
    box.querySelector("input").addEventListener("input", event => { $(`value-${key}`).textContent = `${event.target.value} / 5`; });
    $("criteria").append(box);
  }
  function fillForm(slug) { const item = state.assessments[slug]; for (const [key] of criteria) { const value = item?.scores?.[key] || 3; $(`score-${key}`).value = value; $(`value-${key}`).textContent = `${value} / 5`; } $("review-notes").value = item?.notes || ""; }
  select.addEventListener("change", () => fillForm(select.value));
  $("assessment-form").addEventListener("reset", () => { setTimeout(() => { for (const [key] of criteria) $(`value-${key}`).textContent = "3 / 5"; }, 0); });
  $("assessment-form").addEventListener("submit", event => {
    event.preventDefault(); const slug = select.value; if (!bySlug.has(slug)) return;
    const scores = Object.fromEntries(criteria.map(([key]) => [key, Number($(`score-${key}`).value)]));
    state.assessments[slug] = {slug, scores, notes: $("review-notes").value.trim(), updated_at: new Date().toISOString(), source: "personal_browser_assessment"};
    persist(); renderReviews(); renderCompare(); toast(`Assessment for ${toolName(slug)} saved in this browser.`);
  });
  function renderReviews() {
    const entries = Object.values(state.assessments).filter(item => item && bySlug.has(item.slug)).sort((a, b) => text(b.updated_at).localeCompare(text(a.updated_at)));
    $("assessment-count").textContent = String(entries.length);
    const list = $("assessment-list"); list.replaceChildren();
    if (!entries.length) { const empty = document.createElement("p"); empty.className = "saved-empty"; empty.textContent = "No assessments saved yet. Choose a product and record your observations."; list.append(empty); return; }
    for (const item of entries) {
      const article = document.createElement("article"); article.className = "assessment-item";
      const title = document.createElement("h3"); title.textContent = toolName(item.slug);
      const meta = document.createElement("div"); meta.className = "meta"; meta.textContent = `${average(item.scores).toFixed(1)} / 5 · Your assessment · ${item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "Date unknown"}`;
      const note = document.createElement("p"); note.textContent = item.notes || "No notes added.";
      const edit = document.createElement("button"); edit.type = "button"; edit.textContent = "Edit"; edit.addEventListener("click", () => { select.value = item.slug; fillForm(item.slug); $("assessment-form").scrollIntoView({behavior:"smooth", block:"start"}); });
      const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "Remove"; remove.addEventListener("click", () => { if (confirm(`Remove your assessment of ${toolName(item.slug)} from this browser?`)) { delete state.assessments[item.slug]; persist(); renderReviews(); renderCompare(); toast("Assessment removed."); } });
      article.append(title, meta, note, edit, remove); list.append(article);
    }
  }
  $("export-assessments").addEventListener("click", () => {
    const records = Object.values(state.assessments).filter(item => item && bySlug.has(item.slug));
    if (!records.length) { toast("Save an assessment before exporting."); return; }
    const data = {application:"Legal Standards", exported_at:new Date().toISOString(), notice:"Personal browser assessments; not independent Legal Standards scores.", assessments:records};
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type:"application/json"}));
    const link = document.createElement("a"); link.href = url; link.download = "legal-standards-my-assessments.json"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 30000);
  });

  const validViews = new Set(["explore", "compare", "review", "method"]);
  function currentView() { const hash = location.hash.slice(1); return validViews.has(hash) ? hash : "explore"; }
  function renderNav() {
    const view = currentView();
    document.querySelectorAll(".view").forEach(node => { node.hidden = node.dataset.view !== view; });
    document.querySelectorAll("[data-nav]").forEach(node => { const active = node.dataset.nav === view; node.classList.toggle("active", active); if (active) node.setAttribute("aria-current", "page"); else node.removeAttribute("aria-current"); });
    $("compare-tray").hidden = !(state.compare.length && view === "explore" && !state.trayDismissed);
    $("main-nav").classList.remove("open"); $("menu-toggle").setAttribute("aria-expanded", "false");
    if (location.hash === "#directory") requestAnimationFrame(() => $("directory").scrollIntoView({behavior:"smooth"}));
    else window.scrollTo({top:0,behavior:"instant"});
  }
  window.addEventListener("hashchange", renderNav);
  $("menu-toggle").addEventListener("click", () => { const open = $("main-nav").classList.toggle("open"); $("menu-toggle").setAttribute("aria-expanded", String(open)); });
  $("main-nav").addEventListener("click", event => { if (event.target.closest("a")) { $("main-nav").classList.remove("open"); $("menu-toggle").setAttribute("aria-expanded", "false"); } });
  const theme = $("theme-toggle");
  function syncTheme() { const dark = document.documentElement.dataset.theme === "dark"; theme.textContent = dark ? "☀" : "☾"; theme.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} theme`); }
  try { document.documentElement.dataset.theme = localStorage.getItem("legal-standards-theme") === "dark" ? "dark" : "light"; } catch { document.documentElement.dataset.theme = "light"; }
  syncTheme(); theme.addEventListener("click", () => { document.documentElement.dataset.theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; try { localStorage.setItem("legal-standards-theme", document.documentElement.dataset.theme); } catch {} syncTheme(); });

  $("hero-count").textContent = String(tools.length); $("method-count").textContent = String(tools.length);
  renderFilters(); renderCards(); renderCompare(); renderReviews(); fillForm(select.value); renderNav();
})();
