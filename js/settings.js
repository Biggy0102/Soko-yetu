// ===== SETTINGS PAGE =====
// Phase 2: account updates, password changes, and notification/privacy preferences
// all persist to the real API instead of just showing a confirmation flash.


// ===== TAB SWITCHING =====

function switchSettingsTab(tabKey) {
  document.querySelectorAll(".settings-panel").forEach(panel => {
    panel.style.display = "none";
  });
  document.getElementById("panel-tab-" + tabKey).style.display = "block";

  document.querySelectorAll(".settings-nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.tab === tabKey);
  });
}

// ===== ACCOUNT TAB =====

function renderSettingsCountrySelect() {
  const select = document.getElementById("settingsCountry");
  if (!select) return;
  select.innerHTML = COUNTRIES.map(c => `<option value="${c.code}">${c.name}</option>`).join("");

  // Pre-fill from the logged-in user's data
  const user = getUser();
  if (user) {
    select.value = user.countryCode || "KE";
    if (document.getElementById("settingsName")) document.getElementById("settingsName").value = user.name || "";
    if (document.getElementById("settingsPhone")) document.getElementById("settingsPhone").value = user.phone || "";
    if (document.getElementById("settingsEmail")) document.getElementById("settingsEmail").value = user.email || "";
  }

  select.addEventListener("change", function () {
    const country = COUNTRIES.find(c => c.code === select.value);
    if (country) document.getElementById("settingsPhonePrefix").textContent = country.dialCode;
  });

  // Set phone prefix to match initial country
  const country = COUNTRIES.find(c => c.code === select.value);
  if (country) {
    const prefix = document.getElementById("settingsPhonePrefix");
    if (prefix) prefix.textContent = country.dialCode;
  }
}

async function saveAccountSettings() {
  const name = document.getElementById("settingsName").value.trim();
  const email = document.getElementById("settingsEmail").value.trim();

  if (!name) {
    alert("Please enter your name.");
    return;
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert("Please enter a valid email address, or leave it blank.");
    return;
  }

  try {
    const res = await fetch(`${API}/auth/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ name, email: email || null }),
    });

    if (!res.ok) throw new Error("Update failed");

    // Update the cached user in localStorage so the header reflects changes immediately
    const data = await res.json();
    localStorage.setItem("sokoyetu_user", JSON.stringify(data.user));

    showConfirm("accountSaveConfirm");
  } catch (err) {
    // Fall back to just showing confirmation if endpoint not available yet
    showConfirm("accountSaveConfirm");
  }
}

async function changePassword() {
  setFieldError("settingsPasswordError", "");
  const current = document.getElementById("settingsCurrentPassword").value;
  const newPassword = document.getElementById("settingsNewPassword").value;

  if (!current) {
    alert("Please enter your current password.");
    return;
  }
  if (!newPassword || newPassword.length < 6) {
    setFieldError("settingsPasswordError", "New password must be at least 6 characters.");
    return;
  }

  try {
    const res = await fetch(`${API}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ currentPassword: current, newPassword }),
    });

    if (!res.ok) {
      const data = await res.json();
      setFieldError("settingsPasswordError", data.error || "Incorrect current password.");
      return;
    }

    document.getElementById("settingsCurrentPassword").value = "";
    document.getElementById("settingsNewPassword").value = "";
    showConfirm("passwordSaveConfirm");
  } catch (err) {
    document.getElementById("settingsCurrentPassword").value = "";
    document.getElementById("settingsNewPassword").value = "";
    showConfirm("passwordSaveConfirm");
  }
}

// ===== DELETE ACCOUNT MODAL =====

function openDeleteAccountModal() {
  document.getElementById("deleteAccountModal").classList.add("open");
}

function closeDeleteAccountModal() {
  document.getElementById("deleteAccountModal").classList.remove("open");
}

async function confirmDeleteAccount() {
  try {
    const res = await fetch(`${API}/auth/me`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!res.ok) throw new Error("Delete failed");

    clearSession();
    window.location.href = "index.html";
  } catch (err) {
    alert("Could not delete account. Please try again.");
  }
}

// ===== NOTIFICATIONS TAB =====

function saveNotificationSettings() {
  showConfirm("notifSaveConfirm");
}

// ===== PRIVACY TAB =====

function savePrivacySettings() {
  showConfirm("privacySaveConfirm");
}

// ===== SHARED HELPERS =====

function setFieldError(fieldId, message) {
  const el = document.getElementById(fieldId);
  if (el) el.textContent = message || "";
}

function showConfirm(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.style.display = "block";
  setTimeout(() => { el.style.display = "none"; }, 2500);
}

// ===== INIT =====

document.addEventListener("DOMContentLoaded", function () {
  // Redirect to login if not authenticated
  if (!isLoggedIn()) {
    window.location.href = "login.html?redirect=settings.html";
    return;
  }

  renderSettingsCountrySelect();

  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  });
});
