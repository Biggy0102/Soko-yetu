// ===== MY ADS DASHBOARD =====
// Phase 2: real ads from GET /api/listings/mine (the logged-in user's own ads).
// Edit, delete, and mark-sold all call real PATCH/DELETE endpoints.
// Redirects to login if not authenticated.


const STATUS_LABELS = {
  active: "Active",
  pending: "Pending review",
  sold: "Sold",
  rejected: "Rejected",
};

let currentTab = "all";
let myAds = []; // cached from the last API fetch

// ===== FETCH ADS =====

async function fetchMyAds() {
  const token = getToken();
  if (!token) {
    window.location.href = "login.html?redirect=dashboard.html";
    return [];
  }

  try {
    const res = await fetch(`${API}/listings/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      clearSession();
      window.location.href = "login.html?redirect=dashboard.html";
      return [];
    }

    const data = await res.json();
    return data.listings || [];
  } catch (err) {
    return [];
  }
}

// ===== STATS =====

function renderStats(ads) {
  const active = ads.filter(a => a.status === "active").length;
  const pending = ads.filter(a => a.status === "pending").length;
  const totalViews = ads.reduce((sum, a) => sum + (a.views || 0), 0);

  document.getElementById("dashboardStats").innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${ads.length}</div>
      <div class="stat-label">Total ads</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${active}</div>
      <div class="stat-label">Active</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${pending}</div>
      <div class="stat-label">Pending review</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${totalViews.toLocaleString()}</div>
      <div class="stat-label">Total views</div>
    </div>
  `;
}

// ===== TABS =====

function renderTabs(ads) {
  const tabs = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "pending", label: "Pending review" },
    { key: "sold", label: "Sold" },
  ];

  document.getElementById("dashboardTabs").innerHTML = tabs.map(tab => {
    const count = tab.key === "all" ? ads.length : ads.filter(a => a.status === tab.key).length;
    return `
      <button type="button" class="dashboard-tab ${tab.key === currentTab ? 'active' : ''}" onclick="switchTab('${tab.key}')">
        ${tab.label} <span class="dashboard-tab-count">${count}</span>
      </button>
    `;
  }).join("");
}

function switchTab(tabKey) {
  currentTab = tabKey;
  renderAdsList(myAds);
  renderTabs(myAds);
}

// ===== ADS LIST =====

function renderAdsList(ads) {
  const filtered = currentTab === "all" ? ads : ads.filter(a => a.status === currentTab);
  const container = document.getElementById("dashboardAdsList");

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="dashboard-empty">
        <p>No ads in this category yet.</p>
        <a href="post-ad.html" class="btn btn-primary">Post an ad</a>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(ad => {
    const thumb = ad.photos && ad.photos.length > 0
      ? `<img src="${ad.photos[0]}" alt="${ad.title}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`
      : `<span style="font-size:2rem;">${ad.icon || "📦"}</span>`;

    return `
      <div class="dashboard-ad-card">
        <div class="dashboard-ad-thumb">${thumb}</div>
        <div class="dashboard-ad-info">
          <div class="dashboard-ad-top-row">
            <h3 class="dashboard-ad-title">${ad.title}</h3>
            <span class="status-badge status-badge-${ad.status}">${STATUS_LABELS[ad.status] || ad.status}</span>
          </div>
          <div class="dashboard-ad-price">${formatPrice(ad.price, ad.currency)}</div>
          <div class="dashboard-ad-meta">📍 ${ad.location || ad.city} &nbsp;•&nbsp; 👁️ ${(ad.views || 0).toLocaleString()} views &nbsp;•&nbsp; 🕒 ${new Date(ad.postedAt).toLocaleDateString()}</div>
        </div>
        <div class="dashboard-ad-actions">
          <a href="listing.html?id=${ad.id}" class="btn btn-outline btn-sm">View</a>
          <button type="button" class="btn btn-outline btn-sm" onclick="openEditModal(${ad.id})">Edit</button>
          ${ad.status === "active" ? `<button type="button" class="btn btn-outline btn-sm" onclick="markAsSold(${ad.id})">Mark sold</button>` : ""}
          <button type="button" class="btn btn-outline btn-sm btn-danger-outline" onclick="openDeleteModal(${ad.id})">Delete</button>
        </div>
      </div>
    `;
  }).join("");
}

async function renderDashboard() {
  const container = document.getElementById("dashboardAdsList");
  if (container) container.innerHTML = `<p style="color:var(--text-muted);padding:20px 0;">Loading your ads...</p>`;

  myAds = await fetchMyAds();
  renderStats(myAds);
  renderTabs(myAds);
  renderAdsList(myAds);
}

// ===== EDIT MODAL =====

let editingAdId = null;
let editCountersInitialized = false;
let editPhotos = []; // current photo URLs for the ad being edited (existing + newly uploaded)

function openEditModal(id) {
  const ad = myAds.find(a => a.id === id);
  if (!ad) return;

  editingAdId = id;
  const titleInput = document.getElementById("editAdTitle");
  const descInput = document.getElementById("editAdDescription");

  titleInput.value = ad.title;
  document.getElementById("editAdPrice").value = ad.price;
  
  descInput.value = ad.description || "";
  editPhotos = Array.isArray(ad.photos) ? [...ad.photos] : [];
  renderEditPhotoGrid();
  document.getElementById("editConfirm").style.display = "none";

  document.getElementById("editTitleCount").textContent = titleInput.value.length + " / " + titleInput.maxLength;
  document.getElementById("editDescCount").textContent = descInput.value.length + " / " + descInput.maxLength;

  if (!editCountersInitialized) {
    titleInput.addEventListener("input", () => {
      document.getElementById("editTitleCount").textContent = titleInput.value.length + " / " + titleInput.maxLength;
    });
    descInput.addEventListener("input", () => {
      document.getElementById("editDescCount").textContent = descInput.value.length + " / " + descInput.maxLength;
    });
    editCountersInitialized = true;
  }

  document.getElementById("editAdModal").classList.add("open");
}

function closeEditModal() {
  document.getElementById("editAdModal").classList.remove("open");
}

// ===== EDIT MODAL: PHOTOS =====

function renderEditPhotoGrid() {
  const grid = document.getElementById("editPhotoGrid");
  grid.innerHTML = editPhotos.map((url, i) => `
    <div class="edit-photo-thumb">
      <img src="${url}" alt="Ad photo ${i + 1}">
      <button type="button" class="edit-photo-remove" onclick="removeEditPhoto(${i})" aria-label="Remove photo">✕</button>
    </div>
  `).join("");

  document.getElementById("editPhotoCount").textContent = `${editPhotos.length} / 8 photos`;
  const addBtn = document.querySelector(".edit-photo-add-btn");
  const addInput = document.getElementById("editPhotoInput");
  const atLimit = editPhotos.length >= 8;
  addInput.disabled = atLimit;
  addBtn.style.opacity = atLimit ? 0.5 : 1;
  addBtn.style.pointerEvents = atLimit ? "none" : "auto";
}

function removeEditPhoto(index) {
  editPhotos.splice(index, 1);
  renderEditPhotoGrid();
}

async function handleEditPhotoSelect(event) {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;

  const remainingSlots = 8 - editPhotos.length;
  const filesToUpload = files.slice(0, remainingSlots);

  const formData = new FormData();
  filesToUpload.forEach(file => formData.append("photos", file));

  try {
    const uploadRes = await fetch(`${API}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    if (!uploadRes.ok) throw new Error("Photo upload failed");
    const uploadData = await uploadRes.json();
    editPhotos.push(...(uploadData.urls || []));
    renderEditPhotoGrid();
  } catch (err) {
    alert("Could not upload photo(s). Please try again.");
  } finally {
    event.target.value = "";
  }
}

async function saveEditedAd() {
  const title = document.getElementById("editAdTitle").value.trim();
  const price = document.getElementById("editAdPrice").value;
  const description = document.getElementById("editAdDescription").value.trim();

  if (!title || price === "" || Number(price) < 0) {
    alert("Please enter a valid title and price.");
    return;
  }

  try {
    const res = await fetch(`${API}/listings/${editingAdId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ title, price: Number(price), description, photoUrls: editPhotos }),
    });

    if (!res.ok) throw new Error("Update failed");

    document.getElementById("editConfirm").style.display = "block";
    setTimeout(() => {
      closeEditModal();
      renderDashboard();
    }, 900);
  } catch (err) {
    alert("Could not save changes. Please try again.");
  }
}

// ===== MARK AS SOLD =====

async function markAsSold(id) {
  try {
    const res = await fetch(`${API}/listings/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status: "sold" }),
    });

    if (!res.ok) throw new Error("Failed");
    renderDashboard();
  } catch (err) {
    alert("Could not mark as sold. Please try again.");
  }
}

// ===== DELETE MODAL =====

let deletingAdId = null;

function openDeleteModal(id) {
  deletingAdId = id;
  document.getElementById("deleteAdModal").classList.add("open");
}

function closeDeleteModal() {
  document.getElementById("deleteAdModal").classList.remove("open");
}

async function confirmDeleteAd() {
  try {
    const res = await fetch(`${API}/listings/${deletingAdId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!res.ok && res.status !== 204) throw new Error("Delete failed");

    closeDeleteModal();
    renderDashboard();
  } catch (err) {
    alert("Could not delete this ad. Please try again.");
  }
}

// ===== INIT =====

document.addEventListener("DOMContentLoaded", function () {
  renderDashboard();

  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  });
});
