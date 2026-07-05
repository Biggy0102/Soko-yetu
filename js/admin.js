// ===== MODERATION QUEUE (admin only) =====
// Talks to the /api/admin endpoints (adminController.js) - requires a logged-in
// user with isAdmin=true on their account. Everyone else sees an access-denied
// message instead of the queue.

let currentAdminTab = "pending";
let rejectTargetId = null;

// ===== FETCH =====

async function fetchModerationQueue(status) {
  const token = getToken();
  const res = await fetch(`${API}/admin/listings?status=${status}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error("denied");
  }

  const data = await res.json();
  return data.results || [];
}

// ===== RENDER =====

function renderAdminList(listings) {
  const container = document.getElementById("adminList");

  if (listings.length === 0) {
    container.innerHTML = `
      <div class="dashboard-empty">
        <p>Nothing here right now.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = listings.map(ad => {
    const thumb = ad.photos && ad.photos.length > 0
      ? `<img src="${ad.photos[0]}" alt="${ad.title}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`
      : `<span style="font-size:2rem;">${ad.icon || "📦"}</span>`;

    return `
      <div class="dashboard-ad-card">
        <div class="dashboard-ad-thumb">${thumb}</div>
        <div class="dashboard-ad-info">
          <div class="dashboard-ad-top-row">
            <h3 class="dashboard-ad-title">${ad.title}</h3>
            <span class="status-badge status-badge-${ad.status}">${ad.status}</span>
          </div>
          <div class="dashboard-ad-price">${formatPrice(ad.price, ad.currency)}</div>
          <div class="dashboard-ad-meta">
            👤 ${ad.sellerName || "Unknown seller"} &nbsp;•&nbsp;
            📍 ${ad.location || ad.city} &nbsp;•&nbsp;
            🗂️ ${ad.categoryName || ad.category} &nbsp;•&nbsp;
            🕒 ${new Date(ad.postedAt).toLocaleString()}
          </div>
        </div>
        <div class="dashboard-ad-actions">
          <a href="listing.html?id=${ad.id}" class="btn btn-outline btn-sm" target="_blank">Preview</a>
          ${ad.status === "pending" ? `
            <button type="button" class="btn btn-primary btn-sm" onclick="approveListing(${ad.id})">Approve</button>
            <button type="button" class="btn btn-outline btn-sm btn-danger-outline" onclick="openRejectModal(${ad.id})">Reject</button>
          ` : ""}
          ${ad.status === "active" ? `
            <button type="button" class="btn btn-outline btn-sm" onclick="unapproveListing(${ad.id})">Unapprove</button>
          ` : ""}
        </div>
      </div>
    `;
  }).join("");
}

// ===== TABS =====

function switchAdminTab(status) {
  currentAdminTab = status;
  document.querySelectorAll("#adminTabs .dashboard-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.status === status);
  });
  loadAdminQueue();
}

async function loadAdminQueue() {
  const container = document.getElementById("adminList");
  container.innerHTML = `<p style="color:var(--text-muted);padding:20px 0;">Loading...</p>`;

  try {
    const listings = await fetchModerationQueue(currentAdminTab);
    renderAdminList(listings);
  } catch (err) {
    container.innerHTML = `<div class="dashboard-empty"><p>Could not load the queue. Please try again.</p></div>`;
  }
}

// ===== APPROVE =====

async function approveListing(id) {
  try {
    const res = await fetch(`${API}/admin/listings/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status: "active" }),
    });
    if (!res.ok) {
      alert("Could not approve this ad. Please try again.");
      return;
    }
    loadAdminQueue();
  } catch (err) {
    alert("Could not connect to the server. Please try again.");
  }
}

// ===== UNAPPROVE (send an approved ad back to pending) =====

async function unapproveListing(id) {
  if (!confirm("Send this ad back to pending review? It will be removed from browse until re-approved.")) return;

  try {
    const res = await fetch(`${API}/admin/listings/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status: "pending" }),
    });
    if (!res.ok) {
      alert("Could not unapprove this ad. Please try again.");
      return;
    }
    loadAdminQueue();
  } catch (err) {
    alert("Could not connect to the server. Please try again.");
  }
}

// ===== REJECT =====

function openRejectModal(id) {
  rejectTargetId = id;
  document.getElementById("rejectReason").value = "";
  document.getElementById("rejectModal").classList.add("open");
}

function closeRejectModal() {
  document.getElementById("rejectModal").classList.remove("open");
  rejectTargetId = null;
}

async function confirmReject() {
  if (!rejectTargetId) return;
  const reason = document.getElementById("rejectReason").value.trim();

  try {
    const res = await fetch(`${API}/admin/listings/${rejectTargetId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status: "rejected", reason }),
    });
    if (!res.ok) {
      alert("Could not reject this ad. Please try again.");
      return;
    }
    closeRejectModal();
    loadAdminQueue();
  } catch (err) {
    alert("Could not connect to the server. Please try again.");
  }
}

// ===== INIT =====

document.addEventListener("DOMContentLoaded", async function () {
  if (!isLoggedIn()) {
    window.location.href = "login.html?redirect=admin.html";
    return;
  }

  const user = getUser();
  if (!user || !user.isAdmin) {
    document.getElementById("adminDenied").style.display = "block";
    return;
  }

  document.getElementById("adminContent").style.display = "block";
  loadAdminQueue();

  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  });
});