// ===== AUTH PAGES (LOGIN / REGISTER) =====
// Phase 2: real API calls to /api/auth/login and /api/auth/register.
// On success, JWT token + user object are stored in localStorage so every
// page can check "is anyone signed in" without asking the server again.

const API = "https://soko-yetu-backend.onrender.com/api";

// ===== TOKEN / SESSION HELPERS =====
// Used by every page that needs to know the current user (header, dashboard, post-ad, etc.)

function saveSession(token, user) {
  localStorage.setItem("sokoyetu_token", token);
  localStorage.setItem("sokoyetu_user", JSON.stringify(user));
}

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

function clearSession() {
  localStorage.removeItem("sokoyetu_token");
  localStorage.removeItem("sokoyetu_user");
}

function isLoggedIn() {
  return !!getToken();
}

// ===== SHARED: PASSWORD VISIBILITY TOGGLE =====

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  btn.textContent = isHidden ? "Hide" : "Show";
}

// ===== SHARED: FIELD ERROR HELPERS =====

function setFieldError(fieldId, message) {
  const el = document.getElementById(fieldId);
  if (el) el.textContent = message || "";
}

function clearAllErrors(ids) {
  ids.forEach(id => setFieldError(id, ""));
}

function setSubmitLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? "Please wait..." : btn.dataset.label;
}

// ===== LOGIN PAGE =====

async function handleLogin() {
  clearAllErrors(["loginIdentifierError", "loginPasswordError", "loginGeneralError"]);

  const identifier = document.getElementById("loginIdentifier").value.trim();
  const password = document.getElementById("loginPassword").value;
  let hasError = false;

  if (!identifier) {
    setFieldError("loginIdentifierError", "Enter your phone number or email.");
    hasError = true;
  }
  if (!password) {
    setFieldError("loginPasswordError", "Enter your password.");
    hasError = true;
  }
  if (hasError) return;

  setSubmitLoading("loginBtn", true);

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Server returned validation errors or wrong credentials
      if (data.errors) {
        Object.entries(data.errors).forEach(([field, msg]) => {
          setFieldError("login" + field.charAt(0).toUpperCase() + field.slice(1) + "Error", msg);
        });
      } else {
        setFieldError("loginGeneralError", data.error || "Sign-in failed. Please try again.");
      }
      return;
    }

    // Success: save session and redirect to wherever the user came from (or home)
    saveSession(data.token, data.user);
    const redirect = new URLSearchParams(window.location.search).get("redirect") || "index.html";
    window.location.href = redirect;

  } catch (err) {
    setFieldError("loginGeneralError", "Could not connect to the server. Please check your connection.");
  } finally {
    setSubmitLoading("loginBtn", false);
  }
}

// ===== REGISTER PAGE =====

function renderRegisterCountrySelect() {
  const select = document.getElementById("regCountry");
  if (!select) return;

  select.innerHTML = COUNTRIES.map(c => `<option value="${c.code}">${c.name}</option>`).join("");
  select.value = "KE";

  select.addEventListener("change", function () {
    updateRegisterPhonePrefix();
  });

  updateRegisterPhonePrefix();
}

function updateRegisterPhonePrefix() {
  const country = COUNTRIES.find(c => c.code === document.getElementById("regCountry").value);
  const prefix = document.getElementById("regPhonePrefix");
  if (country && prefix) prefix.textContent = country.dialCode;
}

// Live password strength feedback as the user types
function setupPasswordStrengthMeter() {
  const passwordInput = document.getElementById("regPassword");
  const strengthEl = document.getElementById("passwordStrength");
  if (!passwordInput || !strengthEl) return;

  passwordInput.addEventListener("input", function () {
    const value = passwordInput.value;
    if (!value) {
      strengthEl.textContent = "";
      strengthEl.className = "password-strength";
      return;
    }
    const strength = getPasswordStrength(value);
    strengthEl.textContent = strength.label;
    strengthEl.className = "password-strength password-strength-" + strength.level;
  });
}

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: "weak", label: "Weak password" };
  if (score <= 3) return { level: "medium", label: "Good password" };
  return { level: "strong", label: "Strong password" };
}

async function handleRegister() {
  clearAllErrors([
    "regNameError", "regPhoneError", "regEmailError",
    "regPasswordError", "regPasswordConfirmError", "agreeTermsError", "regGeneralError"
  ]);

  const name = document.getElementById("regName").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const passwordConfirm = document.getElementById("regPasswordConfirm").value;
  const agreed = document.getElementById("agreeTerms").checked;
  const countryCode = document.getElementById("regCountry").value;

  let hasError = false;

  if (!name) {
    setFieldError("regNameError", "Please enter your full name.");
    hasError = true;
  }

  const phoneDigits = phone.replace(/\D/g, "");
  if (!phone) {
    setFieldError("regPhoneError", "Please enter your phone number.");
    hasError = true;
  } else if (phoneDigits.length < 7 || phoneDigits.length > 10) {
    setFieldError("regPhoneError", "Enter a valid phone number (without the country code).");
    hasError = true;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError("regEmailError", "Enter a valid email address, or leave this blank.");
    hasError = true;
  }

  if (!password) {
    setFieldError("regPasswordError", "Please create a password.");
    hasError = true;
  } else if (password.length < 6) {
    setFieldError("regPasswordError", "Password must be at least 6 characters.");
    hasError = true;
  }

  if (password && passwordConfirm !== password) {
    setFieldError("regPasswordConfirmError", "Passwords don't match.");
    hasError = true;
  }

  if (!agreed) {
    setFieldError("agreeTermsError", "You must agree to the Terms & Conditions to continue.");
    hasError = true;
  }

  if (hasError) return;

  setSubmitLoading("registerBtn", true);

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone: phoneDigits, email: email || undefined, password, countryCode }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.errors) {
        Object.entries(data.errors).forEach(([field, msg]) => {
          setFieldError("reg" + field.charAt(0).toUpperCase() + field.slice(1) + "Error", msg);
        });
      } else {
        setFieldError("regGeneralError", data.error || "Registration failed. Please try again.");
      }
      return;
    }

    // Success: save session and show success modal
    saveSession(data.token, data.user);
    const dialCode = document.getElementById("regPhonePrefix").textContent;
    document.getElementById("registerSuccessText").textContent =
      `Welcome, ${name}! Your account has been created with phone ${dialCode} ${phoneDigits}.`;
    document.getElementById("registerSuccessModal").classList.add("open");

    // Redirect to home after 2 seconds
    setTimeout(() => { window.location.href = "index.html"; }, 2000);

  } catch (err) {
    setFieldError("regGeneralError", "Could not connect to the server. Please check your connection.");
  } finally {
    setSubmitLoading("registerBtn", false);
  }
}

// ===== INIT =====

document.addEventListener("DOMContentLoaded", function () {
  // Store button labels so setSubmitLoading can restore them
  ["loginBtn", "registerBtn"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.dataset.label = btn.textContent;
  });

  renderRegisterCountrySelect();
  setupPasswordStrengthMeter();

  // If already logged in, redirect away from auth pages
  if (isLoggedIn()) {
    window.location.href = "index.html";
  }
});
