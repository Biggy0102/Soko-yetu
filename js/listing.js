// ===== LISTING DETAIL PAGE LOGIC =====
// Phase 2: real API calls throughout. Relies on main.js (loaded earlier on the
// page) for API, getToken/getUser/isLoggedIn, formatPrice, getCategoryName,
// renderListingGrid. Do NOT redeclare `const API` here - main.js already does.

let currentListing = null;
let currentConversationId = null;

function getListingIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id"));
}

function timeAgo(dateStr) {
  const posted = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return days + " days ago";
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : months + " months ago";
}

// Masks a phone number until the user chooses to reveal it (common trust/safety pattern)
function maskPhone(phone) {
  if (!phone || phone.length < 6) return phone || "";
  return phone.slice(0, 4) + " " + "•".repeat(phone.length - 6) + " " + phone.slice(-2);
}

function redirectToLogin() {
  const here = "listing.html?" + new URLSearchParams(window.location.search).toString();
  window.location.href = "login.html?redirect=" + encodeURIComponent(here);
}

function renderBreadcrumb(listing) {
  const breadcrumb = document.getElementById("breadcrumb");
  const catName = listing.categoryName || getCategoryName(listing.category);
  breadcrumb.innerHTML = `
    <a href="index.html">Home</a>
    <span>›</span>
    <a href="browse.html?category=${listing.category}">${catName}</a>
    <span>›</span>
    <span class="breadcrumb-current">${listing.title}</span>
  `;
}

// Renders the two-column key/value spec table (Brand, Model, Condition, etc.)
function renderSpecTable(listing) {
  if (!listing.specs || Object.keys(listing.specs).length === 0) return "";

  const entries = Object.entries(listing.specs);
  const cells = entries.map(([label, value]) => `
    <div class="spec-cell">
      <div class="spec-value">${value}</div>
      <div class="spec-label">${label.toUpperCase()}</div>
    </div>
  `).join("");

  return `
    <div class="spec-table-block">
      <div class="spec-grid">${cells}</div>
    </div>
  `;
}

// Renders the store/seller location block with a simple open-hours line
function renderStoreAddress(listing) {
  if (!listing.storeAddress) return "";

  return `
    <div class="store-address-block">
      <div class="store-address-header">🏬 <strong>Seller location</strong></div>
      <div class="store-address-location">📍 ${listing.location}</div>
      <div class="store-address-detail">${listing.storeAddress}</div>
      <div class="store-hours">🕒 Mon – Sun, 08:30 – 19:00</div>
    </div>
  `;
}

// Renders the currently-active photo (or the icon placeholder if no photos were uploaded)
function renderMediaMain(listing) {
  if (listing.photos && listing.photos.length > 0) {
    const src = listing.photos[activePhotoIndex] || listing.photos[0];
    return `<img id="listingMainPhoto" src="${src}" alt="${listing.title}" style="width:100%;height:100%;object-fit:cover;">`;
  }
  return `<span class="listing-media-icon">${listing.icon || "📦"}</span>`;
}

// Renders a thumbnail strip below the main photo, only if there's more than one photo
function renderMediaThumbs(listing) {
  if (!listing.photos || listing.photos.length < 2) return "";
  return `
    <div class="listing-media-thumbs">
      ${listing.photos.map((url, i) => `
        <button type="button" class="listing-media-thumb ${i === activePhotoIndex ? "active" : ""}" onclick="selectListingPhoto(${i})">
          <img src="${url}" alt="${listing.title} photo ${i + 1}">
        </button>
      `).join("")}
    </div>
  `;
}

function selectListingPhoto(index) {
  activePhotoIndex = index;
  const mainPhoto = document.getElementById("listingMainPhoto");
  if (mainPhoto && currentListing && currentListing.photos) {
    mainPhoto.src = currentListing.photos[index];
  }
  document.querySelectorAll(".listing-media-thumb").forEach((thumb, i) => {
    thumb.classList.toggle("active", i === index);
  });
}

function renderListing(listing) {
  const container = document.getElementById("listingContent");
  document.getElementById("pageTitle").textContent = listing.title + " - Soko Yetu";

  const user = getUser();
  const isOwner = !!user && user.id === listing.sellerId;
  const seller = listing.seller || {};

  container.innerHTML = `
    <div class="listing-detail-grid">

      <div class="listing-media">
        <div class="listing-media-main">
          ${listing.featured ? '<span class="listing-badge listing-badge-lg">FEATURED</span>' : ''}
          ${listing.status === 'sold' ? '<span class="listing-badge listing-badge-lg" style="background:#666;">SOLD</span>' : ''}
          ${renderMediaMain(listing)}
        </div>
        ${renderMediaThumbs(listing)}

        ${renderSpecTable(listing)}

        ${renderStoreAddress(listing)}

        <div class="listing-description-block">
          <h3>Description</h3>
          <p>${listing.description}</p>
        </div>

        <div class="share-row">
          <span class="share-label">Share this ad:</span>
          <a class="share-icon share-fb" href="#" onclick="return false;" aria-label="Share on Facebook">f</a>
          <a class="share-icon share-mail" href="mailto:?subject=${encodeURIComponent(listing.title)}&body=${encodeURIComponent('Check out this ad on Soko Yetu: ' + listing.title)}" aria-label="Share by email">✉</a>
          <a class="share-icon share-x" href="#" onclick="return false;" aria-label="Share on X">𝕏</a>
          <a class="share-icon share-wa" href="https://wa.me/?text=${encodeURIComponent('Check out this ad on Soko Yetu: ' + listing.title)}" target="_blank" aria-label="Share on WhatsApp">☏</a>
        </div>

        ${!isOwner ? `
        <button type="button" class="btn btn-outline btn-full" onclick="openOfferModal(${listing.id})">
          🏷️ Make an offer
        </button>` : ''}
      </div>

      <div class="listing-side-col">

        <div class="price-panel">
          <div class="listing-detail-title">${listing.title}</div>
          <div class="listing-detail-price">${formatPrice(listing.price, listing.currency)}</div>
          <div class="listing-detail-meta">
            <span>📍 ${listing.location}</span>
            <span>🕒 Posted ${timeAgo(listing.postedAt)}</span>
          </div>

          <div class="price-extras">
            <button type="button" class="btn btn-outline btn-full" onclick="openPriceHistoryModal(${listing.id})">
              📊 Price history
            </button>
            <div class="market-price-box">
              Market estimate: <strong>${getMarketPriceRange(listing)}</strong>
            </div>
            ${!isOwner ? `
            <button type="button" class="btn btn-outline btn-full" onclick="openCallbackModal(${listing.id})">
              ☎️ Request call back
            </button>` : ''}
          </div>
        </div>

        <div class="seller-panel">
          <div class="seller-card">
            <div class="seller-avatar">${(seller.name || "?").charAt(0)}</div>
            <div class="seller-info">
              <div class="seller-name">${seller.name || "Seller"}</div>
              <div class="seller-badges">
                <span class="seller-badge">👤 Member since ${seller.memberSince ? new Date(seller.memberSince).getFullYear() : "—"}</span>
                ${seller.verified ? '<span class="seller-badge seller-badge-verified">✓ Verified</span>' : ''}
              </div>
              <div class="seller-response">💬 Usually replies ${seller.responseTime || "within a day"}</div>
            </div>
          </div>

          ${isOwner ? `
          <a href="dashboard.html" class="btn btn-primary btn-full btn-lg">📋 Manage in dashboard</a>
          ` : `
          <button type="button" class="btn btn-primary btn-full btn-lg" onclick="openContactModal(${listing.id})">
            📞 Show contact
          </button>
          <button type="button" class="btn btn-outline btn-full" onclick="openChatModal(${listing.id})">
            💬 Start chat
          </button>
          `}
        </div>

        <a href="#" class="feedback-banner" id="feedbackBanner">
          <span id="feedbackBannerText">🙂 Feedback</span>
          <span class="feedback-view-all">view all ›</span>
        </a>

        <div class="action-row">
          ${isOwner ? `
          <button type="button" class="btn btn-outline btn-full" id="ownerStatusBtn" onclick="toggleOwnListingStatus(${listing.id})">
            ${listing.status === 'sold' ? '↩️ Relist ad' : '✅ Mark as sold'}
          </button>` : `
          <button type="button" class="btn btn-outline btn-full btn-danger-outline" onclick="openReportModal()">🚩 Report ad</button>
          `}
        </div>

        <div class="safety-panel">
          <h4>Buyer safety tips</h4>
          <ul>
            <li>Don't pay anything before you see the item in person</li>
            <li>Meet the seller somewhere public and well-lit</li>
            <li>Check the item works and matches the ad before agreeing to buy</li>
            <li>Confirm what's in the package matches what you inspected</li>
            <li>Only hand over money once you're fully satisfied</li>
          </ul>
        </div>

        <a href="post-ad.html?category=${listing.category}&sub=${listing.sub || ''}" class="btn btn-outline btn-full">
          ➕ Post an ad like this
        </a>

      </div>

    </div>
  `;

  renderBreadcrumb(listing);
  decorateSellerFeedback(listing.sellerId);
}

// Fetches the seller's feedback count/rating separately so the main render
// isn't blocked on a second network round trip.
async function decorateSellerFeedback(sellerId) {
  const el = document.getElementById("feedbackBannerText");
  if (!el) return;
  try {
    const res = await fetch(`${API}/sellers/${sellerId}`);
    if (!res.ok) return;
    const data = await res.json();
    const count = data.seller ? data.seller.feedbackCount : data.feedbackCount;
    el.textContent = `🙂 ${count || 0} Feedback`;
  } catch (err) {
    // Leave the default text if this fails - non-critical
  }
}

async function renderSimilarListings(listing) {
  const section = document.getElementById("similarSection");
  try {
    const res = await fetch(`${API}/listings?category=${encodeURIComponent(listing.category)}&pageSize=8`);
    const data = await res.json();
    const similar = (data.results || []).filter(l => l.id !== listing.id).slice(0, 4);
    if (similar.length === 0) return;

    section.style.display = "block";
    renderListingGrid(similar, "similarGrid");
  } catch (err) {
    // No similar-listings block if this fails - non-critical
  }
}

// Generates a plausible market price range around the listed price.
// Simulated locally - there's no real market-aggregation endpoint yet.
function getMarketPriceRange(listing) {
  const low = Math.round((listing.price * 0.92) / 100) * 100;
  const high = Math.round((listing.price * 1.08) / 100) * 100;
  return `${listing.currency} ${low.toLocaleString()} ~ ${high.toLocaleString()}`;
}

// Simulated price history for the chart - no real price-history endpoint yet.
function getPriceHistoryData(listing) {
  const base = listing.price;
  return [
    { label: "3 mo ago", value: Math.round(base * 1.06) },
    { label: "2 mo ago", value: Math.round(base * 1.03) },
    { label: "1 mo ago", value: Math.round(base * 1.01) },
    { label: "Today",    value: base },
  ];
}

// ===== OWNER: MARK AS SOLD / RELIST =====

async function toggleOwnListingStatus(id) {
  if (!currentListing) return;
  const target = currentListing.status === "sold" ? "active" : "sold";

  try {
    const res = await fetch(`${API}/listings/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status: target }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Could not update this ad's status.");
      return;
    }
    currentListing = data.listing;
    renderListing(currentListing);
  } catch (err) {
    alert("Could not connect to the server. Please try again.");
  }
}

// ===== PRICE HISTORY MODAL =====

function openPriceHistoryModal(id) {
  if (!currentListing) return;
  const listing = currentListing;

  const history = getPriceHistoryData(listing);
  const maxValue = Math.max(...history.map(h => h.value));

  document.getElementById("priceHistoryTitle").textContent = listing.title;
  document.getElementById("priceHistoryChart").innerHTML = history.map(point => {
    const heightPct = Math.max(20, Math.round((point.value / maxValue) * 100));
    return `
      <div class="price-history-bar-col">
        <span class="price-history-value">${(point.value / 1000).toFixed(0)}K</span>
        <div class="price-history-bar" style="height:${heightPct}px;"></div>
        <span class="price-history-label">${point.label}</span>
      </div>
    `;
  }).join("");

  document.getElementById("priceHistoryModal").classList.add("open");
}

function closePriceHistoryModal() {
  document.getElementById("priceHistoryModal").classList.remove("open");
}

// ===== REQUEST CALL BACK MODAL =====

let callbackListingId = null;

function openCallbackModal(id) {
  callbackListingId = id;
  document.getElementById("callbackConfirm").style.display = "none";
  document.getElementById("callbackForm").style.display = "flex";
  document.getElementById("callbackName").value = "";
  document.getElementById("callbackPhone").value = "";
  document.getElementById("callbackModal").classList.add("open");
}

function closeCallbackModal() {
  document.getElementById("callbackModal").classList.remove("open");
}

async function submitCallback() {
  const name = document.getElementById("callbackName").value.trim();
  const phone = document.getElementById("callbackPhone").value.trim();
  if (!name || !phone) {
    alert("Please enter your name and phone number.");
    return;
  }

  try {
    const headers = { "Content-Type": "application/json" };
    if (isLoggedIn()) headers.Authorization = `Bearer ${getToken()}`;

    const res = await fetch(`${API}/listings/${callbackListingId}/callbacks`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name, phone }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Could not send your request. Please try again.");
      return;
    }
    document.getElementById("callbackForm").style.display = "none";
    document.getElementById("callbackConfirm").style.display = "block";
  } catch (err) {
    alert("Could not connect to the server. Please try again.");
  }
}

// ===== MAKE AN OFFER MODAL =====

let offerListingId = null;

function openOfferModal(id) {
  if (!isLoggedIn()) {
    redirectToLogin();
    return;
  }
  offerListingId = id;
  const listing = currentListing;
  if (!listing) return;

  document.getElementById("offerListingTitle").textContent = listing.title;
  document.getElementById("offerAskingPrice").textContent = formatPrice(listing.price, listing.currency);
  document.getElementById("offerAmount").value = "";
  document.getElementById("offerForm").style.display = "flex";
  document.getElementById("offerConfirm").style.display = "none";
  document.getElementById("offerModal").classList.add("open");
}

function closeOfferModal() {
  document.getElementById("offerModal").classList.remove("open");
}

async function submitOffer() {
  const amount = document.getElementById("offerAmount").value.trim();
  if (!amount || Number(amount) <= 0) {
    alert("Please enter a valid offer amount.");
    return;
  }

  try {
    const res = await fetch(`${API}/listings/${offerListingId}/offers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ amount: Number(amount) }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Could not send your offer. Please try again.");
      return;
    }
    document.getElementById("offerForm").style.display = "none";
    document.getElementById("offerConfirm").style.display = "block";
  } catch (err) {
    alert("Could not connect to the server. Please try again.");
  }
}

// ===== CHAT MODAL =====

let chatListingId = null;

async function openChatModal(id) {
  if (!isLoggedIn()) {
    redirectToLogin();
    return;
  }
  chatListingId = id;
  currentConversationId = null;
  const listing = currentListing;
  if (!listing) return;

  document.getElementById("chatSellerName").textContent = "Chat with " + (listing.seller ? listing.seller.name : "seller");
  document.getElementById("chatListingRef").textContent = listing.title;
  document.getElementById("chatMessages").innerHTML = `<div class="chat-system-note">Loading conversation...</div>`;
  document.getElementById("chatModal").classList.add("open");
  document.getElementById("chatInput").focus();

  await loadExistingConversation(id);
}

// Looks for a conversation the current user already has about this listing,
// and loads its full history if one exists.
async function loadExistingConversation(listingId) {
  try {
    const res = await fetch(`${API}/conversations`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    const existing = (data.conversations || []).find(c => c.listing && c.listing.id === listingId);

    if (!existing) {
      document.getElementById("chatMessages").innerHTML =
        `<div class="chat-system-note">Send a message to start the conversation with the seller.</div>`;
      return;
    }

    currentConversationId = existing.id;
    const msgRes = await fetch(`${API}/conversations/${existing.id}/messages`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const msgData = await msgRes.json();
    renderChatMessages(msgData.messages || []);
  } catch (err) {
    document.getElementById("chatMessages").innerHTML =
      `<div class="chat-system-note">Could not load previous messages.</div>`;
  }
}

function renderChatMessages(messages) {
  const box = document.getElementById("chatMessages");
  const me = getUser();
  box.innerHTML = messages.map(msg => {
    const bubbleClass = msg.senderId === me.id ? "chat-bubble chat-bubble-me" : "chat-bubble chat-bubble-them";
    return `<div class="${bubbleClass}">${msg.text}</div>`;
  }).join("") || `<div class="chat-system-note">Send a message to start the conversation with the seller.</div>`;
  box.scrollTop = box.scrollHeight;
}

async function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;

  input.value = "";

  try {
    let res, data;
    if (currentConversationId) {
      res = await fetch(`${API}/conversations/${currentConversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ text }),
      });
    } else {
      res = await fetch(`${API}/listings/${chatListingId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ text }),
      });
    }
    data = await res.json();
    if (!res.ok) {
      alert(data.error || "Could not send your message.");
      return;
    }
    if (data.conversationId) currentConversationId = data.conversationId;

    // Reload the full thread so both sides stay in sync
    const msgRes = await fetch(`${API}/conversations/${currentConversationId}/messages`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const msgData = await msgRes.json();
    renderChatMessages(msgData.messages || []);
  } catch (err) {
    alert("Could not connect to the server. Please try again.");
  }
}

function closeChatModal() {
  document.getElementById("chatModal").classList.remove("open");
}

// ===== CONTACT MODAL =====

function openContactModal(id) {
  const listing = currentListing;
  if (!listing) return;

  document.getElementById("contactSellerName").textContent = "Contact " + (listing.seller ? listing.seller.name : "seller") + " about this ad:";
  document.getElementById("contactPhoneBox").innerHTML = `
    <span class="contact-phone-masked">${maskPhone(listing.sellerPhone)}</span>
    <button type="button" class="btn btn-primary" onclick="revealPhone(${listing.id})">Reveal number</button>
  `;
  document.getElementById("contactModal").classList.add("open");
}

function revealPhone(id) {
  const listing = currentListing;
  if (!listing) return;
  document.getElementById("contactPhoneBox").innerHTML = `
    <a href="tel:${listing.sellerPhone}" class="contact-phone-revealed">${listing.sellerPhone}</a>
  `;
}

function closeContactModal() {
  document.getElementById("contactModal").classList.remove("open");
}

// ===== REPORT MODAL =====

function openReportModal() {
  document.querySelectorAll('input[name="reportReason"]').forEach(r => r.checked = false);
  document.getElementById("reportModal").classList.add("open");
  document.getElementById("reportConfirm").style.display = "none";
}

function closeReportModal() {
  document.getElementById("reportModal").classList.remove("open");
}

async function submitReport() {
  const selected = document.querySelector('input[name="reportReason"]:checked');
  if (!selected) {
    alert("Please choose a reason for reporting this ad.");
    return;
  }

  try {
    const headers = { "Content-Type": "application/json" };
    if (isLoggedIn()) headers.Authorization = `Bearer ${getToken()}`;

    const res = await fetch(`${API}/listings/${currentListing.id}/reports`, {
      method: "POST",
      headers,
      body: JSON.stringify({ reason: selected.value }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Could not submit this report. Please try again.");
      return;
    }
    document.getElementById("reportConfirm").style.display = "block";
    setTimeout(closeReportModal, 1800);
  } catch (err) {
    alert("Could not connect to the server. Please try again.");
  }
}

// ===== INIT =====

document.addEventListener("DOMContentLoaded", async function () {
  const id = getListingIdFromUrl();
  if (!Number.isInteger(id)) {
    document.getElementById("notFound").style.display = "block";
    return;
  }

  try {
    const res = await fetch(`${API}/listings/${id}`);
    if (!res.ok) {
      document.getElementById("notFound").style.display = "block";
      return;
    }
    const data = await res.json();
    currentListing = data.listing;
  } catch (err) {
    document.getElementById("notFound").style.display = "block";
    return;
  }

  renderListing(currentListing);
  renderSimilarListings(currentListing);

  // Enter key sends chat message
  const chatInput = document.getElementById("chatInput");
  if (chatInput) {
    chatInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  // Close modals when clicking outside the box
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  });
});
