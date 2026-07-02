// ===== BROWSE PAGE =====
// Phase 2: filters passed as query params to GET /api/listings instead of
// filtering the local LISTINGS array. Everything else (chips, sort, price controls)
// stays the same since it just manipulates the URL.

function getParams() {
  return new URLSearchParams(window.location.search);
}

function getSubcategoryName(catId, subId) {
  const cat = CATEGORIES.find(c => c.id === catId);
  if (!cat) return subId;
  const sub = (cat.subcategories || []).find(s => s.id === subId);
  return sub ? sub.name : subId;
}

function getCountryName(code) {
  const c = COUNTRIES.find(c => c.code === code);
  return c ? c.name : code;
}

// ===== RESULTS SUMMARY =====

function renderResultsSummary(total) {
  const params = getParams();
  const category = params.get("category");
  const sub = params.get("sub");
  const country = params.get("country");
  const query = params.get("q");

  const titleEl = document.getElementById("resultsTitle");
  const countEl = document.getElementById("resultsCount");
  const chipsEl = document.getElementById("filterChips");

  let title = "All listings";
  if (sub) title = getSubcategoryName(category, sub);
  else if (category) title = getCategoryName(category);
  if (query) title = `Results for "${query}"`;
  if (titleEl) titleEl.textContent = title;
  if (countEl) countEl.textContent = `${total} ${total === 1 ? "ad" : "ads"} found`;

  const chips = [];
  if (category) chips.push({ label: getCategoryName(category), removeKeys: ["category", "sub"] });
  if (sub) chips.push({ label: getSubcategoryName(category, sub), removeKeys: ["sub"] });
  if (country) chips.push({ label: getCountryName(country), removeKeys: ["country"] });
  if (query) chips.push({ label: `"${query}"`, removeKeys: ["q"] });
  if (params.get("min") || params.get("max")) {
    const min = params.get("min") || "0";
    const max = params.get("max") || "∞";
    chips.push({ label: `${min} - ${max}`, removeKeys: ["min", "max"] });
  }

  if (chipsEl) {
    chipsEl.innerHTML = chips.map(chip => `
      <span class="filter-chip">
        ${chip.label}
        <button type="button" onclick='removeFilter(${JSON.stringify(chip.removeKeys)})'>✕</button>
      </span>
    `).join("");
  }
}

function removeFilter(keys) {
  const params = getParams();
  keys.forEach(k => params.delete(k));
  window.location.search = params.toString();
}

// ===== FETCH + RENDER =====

async function renderBrowseResults() {
  const params = getParams();
  const grid = document.getElementById("browseGrid");
  const countEl = document.getElementById("resultsCount");

  if (grid) grid.innerHTML = `<p style="color:var(--text-muted);padding:20px 0;">Loading...</p>`;

  // Build query string from current URL params — passes category, sub, country,
  // q, min, max, sort directly to the API which handles all filtering server-side.
  const apiParams = new URLSearchParams();
  ["category", "sub", "country", "q", "min", "max", "sort"].forEach(key => {
    if (params.get(key)) apiParams.set(key, params.get(key));
  });

  try {
    const res = await fetch(`${API}/listings?${apiParams.toString()}`);
    const data = await res.json();

    renderResultsSummary(data.total || 0);
    renderListingGrid(data.results || [], "browseGrid");
  } catch (err) {
    renderResultsSummary(0);
    if (grid) grid.innerHTML = `<p style="color:var(--text-muted);padding:20px 0;">Could not load listings. Please try again.</p>`;
  }
}

// ===== FILTER CONTROLS =====

function syncFilterControls() {
  const params = getParams();
  const sortSelect = document.getElementById("sortSelect");
  const minInput = document.getElementById("minPrice");
  const maxInput = document.getElementById("maxPrice");
  const countrySelect = document.getElementById("countrySelect");

  if (sortSelect && params.get("sort")) sortSelect.value = params.get("sort");
  if (minInput && params.get("min")) minInput.value = params.get("min");
  if (maxInput && params.get("max")) maxInput.value = params.get("max");
  if (countrySelect && params.get("country")) countrySelect.value = params.get("country");
}

function setupBrowseControls() {
  const sortSelect = document.getElementById("sortSelect");
  const applyPriceBtn = document.getElementById("applyPriceBtn");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      const params = getParams();
      params.set("sort", this.value);
      window.location.search = params.toString();
    });
  }

  if (applyPriceBtn) {
    applyPriceBtn.addEventListener("click", function () {
      const params = getParams();
      const min = document.getElementById("minPrice").value;
      const max = document.getElementById("maxPrice").value;
      if (min) params.set("min", min); else params.delete("min");
      if (max) params.set("max", max); else params.delete("max");
      window.location.search = params.toString();
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", function () {
      window.location.search = "";
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  syncFilterControls();
  setupBrowseControls();
  renderBrowseResults();
});
