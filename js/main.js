// ===== SHARED UTILITIES (loaded on every page) =====
// Phase 2: categories/countries now fetched from the real API once and cached
// in memory. Listing grids pull from the real /api/listings endpoint.

const API = "https://soko-yetu-backend.onrender.com/api";

// ===== IN-MEMORY CACHE =====
// Loaded once per page session from the API, then reused by all functions
// that need category names, icons, country names, etc.

let CATEGORIES = [];
let COUNTRIES = [];

async function loadReferenceData() {
  try {
    const [catRes, countryRes] = await Promise.all([
      fetch(`${API}/categories`),
      fetch(`${API}/countries`),
    ]);
    const catData = await catRes.json();
    const countryData = await countryRes.json();
    CATEGORIES = catData.categories || [];
    COUNTRIES = countryData.countries || [];
  } catch (err) {
    console.error("Failed to load reference data:", err);
  }
}

// ===== HELPERS =====

function formatPrice(price, currency) {
  if (price === 0) return "Negotiable";
  return (currency || "") + " " + Number(price).toLocaleString();
}

function getCategoryName(id) {
  const cat = CATEGORIES.find(c => c.id === id);
  return cat ? cat.name : id;
}

function getCategoryIcon(id) {
  const cat = CATEGORIES.find(c => c.id === id);
  return cat ? cat.icon : "📦";
}

// ===== AUTH HELPERS (available on every page via main.js) =====

function getToken() {
  return localStorage.getItem("sokoyetu_token");
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("sokoyetu_user"));
  } catch (e) {
    return null;
  }
}

function isLoggedIn() {
  return !!getToken();
}

function clearSession() {
  localStorage.removeItem("sokoyetu_token");
  localStorage.removeItem("sokoyetu_user");
}

// ===== HEADER AUTH STATE =====
// Updates the header to show the logged-in user's name or a "Sign in" link.

function updateHeaderAuthState() {
  const user = getUser();
  const accountPanel = document.getElementById("panel-account");
  if (!accountPanel) return;

  if (user) {
    accountPanel.innerHTML = `
      <div class="panel-header">My Account</div>
      <div class="panel-body">
        <p style="font-weight:600; margin-bottom:8px;">Hi, ${user.name.split(" ")[0]} 👋</p>
        <a href="dashboard.html" class="panel-link">My Ads</a>
        <a href="settings.html" class="panel-link">Settings</a>
        ${user.isAdmin ? '<a href="admin.html" class="panel-link">Moderation queue</a>' : ''}
        <button type="button" class="panel-link" onclick="handleSignOut()" style="background:none;border:none;cursor:pointer;color:var(--accent);text-align:left;padding:6px 0;width:100%;">Sign out</button>
      </div>
    `;
  } else {
    accountPanel.innerHTML = `
      <div class="panel-header">My Account</div>
      <div class="panel-body">
        <a href="login.html" class="btn btn-primary" style="display:block;text-align:center;margin-bottom:8px;">Sign in</a>
        <a href="register.html" class="btn btn-outline" style="display:block;text-align:center;">Create account</a>
      </div>
    `;
  }
}

function handleSignOut() {
  clearSession();
  window.location.href = "index.html";
}

// ===== HEADER ICON PANELS =====

function toggleIconPanel(key) {
  const panel = document.getElementById("panel-" + key);
  if (!panel) return;
  const isOpen = panel.classList.contains("open");

  document.querySelectorAll(".icon-panel.open").forEach(p => {
    if (p !== panel) p.classList.remove("open");
  });

  panel.classList.toggle("open", !isOpen);
}

document.addEventListener("click", function (e) {
  const nav = document.getElementById("iconNav");
  if (nav && !nav.contains(e.target)) {
    document.querySelectorAll(".icon-panel.open").forEach(p => p.classList.remove("open"));
  }
});

// ===== RENDER: COUNTRY DROPDOWN (in search bar) =====

function renderCountrySelect() {
  const select = document.getElementById("countrySelect");
  if (!select) return;
  select.innerHTML = COUNTRIES.map(c =>
    `<option value="${c.code}">All ${c.name}</option>`
  ).join("");
}

// ===== RENDER: CATEGORY GRID (Jiji-style, homepage only) =====

function renderCategoryGrid() {
  const grid = document.getElementById("categoryGrid");
  if (!grid) return;

  grid.innerHTML = CATEGORIES.map(cat => `
    <a href="browse.html?category=${cat.id}" class="category-grid-item">
      <span class="category-grid-icon">${cat.icon}</span>
      <span class="category-grid-label">${cat.name}</span>
    </a>
  `).join("");
}

// ===== RENDER: CATEGORY SIDEBAR =====

function renderCategorySidebar() {
  const sidebar = document.getElementById("categorySidebar");
  if (!sidebar) return;

  const activeCategory = new URLSearchParams(window.location.search).get("category");

  sidebar.innerHTML = CATEGORIES.map(cat => {
    const subItems = (cat.subcategories || []).map(sub => `
      <a href="browse.html?category=${cat.id}&sub=${sub.id}" class="sidebar-subitem">
        ${sub.name}
      </a>
    `).join("");
    const isActive = cat.id === activeCategory;

    return `
      <div class="sidebar-group">
        <button type="button" class="sidebar-item" data-cat="${cat.id}" onclick="toggleSidebarGroup('${cat.id}')">
          <span class="sidebar-icon">${cat.icon}</span>
          <span class="sidebar-text">
            <span class="sidebar-name">${cat.name}</span>
          </span>
          <span class="sidebar-arrow ${isActive ? 'rotated' : ''}" id="arrow-${cat.id}">›</span>
        </button>
        <div class="sidebar-subpanel ${isActive ? 'open' : ''}" id="subpanel-${cat.id}">
          <a href="browse.html?category=${cat.id}" class="sidebar-subitem sidebar-subitem-all">
            All ${cat.name}
          </a>
          ${subItems}
        </div>
      </div>
    `;
  }).join("");
}

function toggleSidebarGroup(catId) {
  const panel = document.getElementById("subpanel-" + catId);
  const arrow = document.getElementById("arrow-" + catId);
  if (!panel) return;

  const isOpen = panel.classList.contains("open");

  document.querySelectorAll(".sidebar-subpanel.open").forEach(p => {
    if (p !== panel) {
      p.classList.remove("open");
      const otherArrow = document.getElementById(p.id.replace("subpanel-", "arrow-"));
      if (otherArrow) otherArrow.classList.remove("rotated");
    }
  });

  panel.classList.toggle("open", !isOpen);
  if (arrow) arrow.classList.toggle("rotated", !isOpen);
}

// ===== RENDER: LISTING GRID =====

function renderListingGrid(listings, containerId) {
  const grid = document.getElementById(containerId);
  if (!grid) return;

  if (!listings || listings.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-muted); padding: 20px 0;">No listings found.</p>`;
    return;
  }

  grid.innerHTML = listings.map(item => {
    const thumb = item.photos && item.photos.length > 0
      ? `<img src="${item.photos[0]}" alt="${item.title}" style="width:100%;height:100%;object-fit:cover;">`
      : `<span style="font-size:2.5rem;">${item.icon || getCategoryIcon(item.category) || "📦"}</span>`;
    const saved = isAdSaved(item.id);

    return `
      <a href="listing.html?id=${item.id}" class="listing-card">
        <div class="listing-img">
          ${item.featured ? '<span class="listing-badge">FEATURED</span>' : ''}
          <button type="button" class="save-heart-btn ${saved ? 'saved' : ''}" onclick="toggleSaveAdCard(${item.id}, event)" aria-label="Save ad">${saved ? '❤️' : '🤍'}</button>
          ${thumb}
        </div>
        <div class="listing-info">
          <div class="listing-price">${formatPrice(item.price, item.currency)}</div>
          <div class="listing-title">${item.title}</div>
          <div class="listing-location">📍 ${item.location || item.city}</div>
        </div>
      </a>
    `;
  }).join("");
}

// ===== SAVED ADS =====
// Real version of the "Saved" header icon panel, which used to be just a
// static empty-state message with no data behind it. Backend already existed
// (savedAdController.js) - this was purely a missing frontend wiring gap.

let savedAdIds = new Set();

async function loadSavedAds() {
  if (!isLoggedIn()) {
    savedAdIds = new Set();
    renderSavedAdsPanel([]);
    return;
  }
  try {
    const res = await fetch(`${API}/saved-ads`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    const savedAds = data.savedAds || [];
    savedAdIds = new Set(savedAds.map(s => s.listing.id));
    renderSavedAdsPanel(savedAds);
  } catch (err) {
    // Saved ads is a nice-to-have panel, not core functionality - fail quietly
  }
}

function renderSavedAdsPanel(savedAds) {
  const panel = document.getElementById("panel-saved");
  if (!panel) return;

  if (!savedAds || savedAds.length === 0) {
    panel.innerHTML = `
      <h4>Saved ads</h4>
      <p class="icon-panel-empty">You haven't saved any ads yet. Tap the heart on a listing to save it here.</p>
    `;
    return;
  }

  panel.innerHTML = `
    <h4>Saved ads</h4>
    ${savedAds.slice(0, 5).map(s => `
      <a href="listing.html?id=${s.listing.id}" class="icon-panel-row" style="margin-bottom:10px; text-decoration:none; color:inherit;">
        <div class="icon-panel-avatar" style="background:#eee; overflow:hidden;">
          ${s.listing.photos && s.listing.photos[0] ? `<img src="${s.listing.photos[0]}" alt="" style="width:100%;height:100%;object-fit:cover;">` : (s.listing.icon || "📦")}
        </div>
        <div>
          <div class="icon-panel-row-title">${s.listing.title}</div>
          <div class="icon-panel-row-sub">${formatPrice(s.listing.price, s.listing.currency)}</div>
        </div>
      </a>
    `).join("")}
    ${savedAds.length > 5 ? `<p class="icon-panel-note">+ ${savedAds.length - 5} more saved</p>` : ""}
  `;
}

function isAdSaved(id) {
  return savedAdIds.has(id);
}

async function toggleSaveAdCard(id, event) {
  if (event) { event.preventDefault(); event.stopPropagation(); }

  if (!isLoggedIn()) {
    window.location.href = "login.html?redirect=" + encodeURIComponent(window.location.pathname + window.location.search);
    return;
  }

  const btn = event ? event.currentTarget : null;
  const alreadySaved = savedAdIds.has(id);

  try {
    const res = await fetch(`${API}/saved-ads/${id}`, {
      method: alreadySaved ? "DELETE" : "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok && res.status !== 204) throw new Error("Failed");

    if (alreadySaved) {
      savedAdIds.delete(id);
    } else {
      savedAdIds.add(id);
    }
    if (btn) {
      btn.textContent = savedAdIds.has(id) ? "❤️" : "🤍";
      btn.classList.toggle("saved", savedAdIds.has(id));
    }
    loadSavedAds();
  } catch (err) {
    alert("Could not update saved ads. Please try again.");
  }
}

// ===== SEARCH FORM =====

function setupSearchForm() {
  const form = document.getElementById("searchForm");
  if (!form) return;

  const existingQuery = new URLSearchParams(window.location.search).get("q");
  const searchInput = document.getElementById("searchInput");
  if (existingQuery && searchInput) searchInput.value = existingQuery;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const country = document.getElementById("countrySelect").value;
    const query = document.getElementById("searchInput").value.trim();

    const params = new URLSearchParams(window.location.search);
    if (country) params.set("country", country); else params.delete("country");
    if (query) params.set("q", query); else params.delete("q");

    window.location.href = "browse.html?" + params.toString();
  });
}

// ===== HOMEPAGE: FEATURED + RECENT LISTINGS =====

async function loadHomepageListings() {
  const grid = document.getElementById("listingGrid");
  if (!grid) return;

  grid.innerHTML = `<p style="color:var(--text-muted);padding:20px 0;">Loading listings...</p>`;

  try {
    const res = await fetch(`${API}/listings?sort=newest&pageSize=8`);
    const data = await res.json();
    renderListingGrid(data.results || [], "listingGrid");
  } catch (err) {
    grid.innerHTML = `<p style="color:var(--text-muted);padding:20px 0;">Could not load listings.</p>`;
  }
}

// ===== BOTTOM NAV (Jiji-style: Home / Saved / Sell / Messages / Profile) =====
// Injected via JS so every page gets it automatically without editing each
// HTML file individually. Reuses the existing header panels for Saved/Messages
// where they exist on the page (full-header pages); falls back to a normal
// link to the homepage on pages that don't have those panels (info pages).

function handleBottomNavSaved(e) {
  const panel = document.getElementById("panel-saved");
  if (panel) {
    e.preventDefault();
    e.stopPropagation();
    toggleIconPanel("saved");
    if (panel.classList.contains("open")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return false;
  }
  return true;
}

function handleBottomNavMessages(e) {
  const panel = document.getElementById("panel-messages");
  if (panel) {
    e.preventDefault();
    e.stopPropagation();
    toggleIconPanel("messages");
    if (panel.classList.contains("open")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return false;
  }
  return true;
}

function renderBottomNav() {
  if (document.getElementById("bottomNav")) return;

  const path = window.location.pathname.split("/").pop() || "index.html";
  const loggedIn = isLoggedIn();
  const profileHref = loggedIn ? "settings.html" : "login.html";
  const isProfileActive = path === "settings.html" || path === "login.html";

  const nav = document.createElement("nav");
  nav.className = "bottom-nav";
  nav.id = "bottomNav";
  nav.innerHTML = `
    <a href="index.html" class="bottom-nav-item ${path === "index.html" ? "active" : ""}">
      <span class="bottom-nav-icon">🏠</span>
      <span class="bottom-nav-label">Home</span>
    </a>
    <a href="index.html" class="bottom-nav-item" onclick="return handleBottomNavSaved(event)">
      <span class="bottom-nav-icon">🔖</span>
      <span class="bottom-nav-label">Saved</span>
    </a>
    <a href="post-ad.html" class="bottom-nav-item ${path === "post-ad.html" ? "active" : ""}">
      <span class="bottom-nav-icon">➕</span>
      <span class="bottom-nav-label">Sell</span>
    </a>
    <a href="index.html" class="bottom-nav-item" onclick="return handleBottomNavMessages(event)">
      <span class="bottom-nav-icon">💬</span>
      <span class="bottom-nav-label">Messages</span>
    </a>
    <a href="${profileHref}" class="bottom-nav-item ${isProfileActive ? "active" : ""}">
      <span class="bottom-nav-icon">👤</span>
      <span class="bottom-nav-label">Profile</span>
    </a>
  `;
  document.body.appendChild(nav);
}

// ===== INIT =====

document.addEventListener("DOMContentLoaded", async function () {
  renderBottomNav();
  await loadReferenceData();
  renderCountrySelect();
  renderCategorySidebar();
  renderCategoryGrid();
  setupSearchForm();
  updateHeaderAuthState();
  await loadSavedAds();
  loadHomepageListings();
});