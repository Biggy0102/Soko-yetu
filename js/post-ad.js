// ===== POST AN AD - MULTI-STEP WIZARD =====
// Phase 2: photos uploaded to /api/upload (Cloudinary), then listing created
// via POST /api/listings. Requires login — redirects if not authenticated.

const API = "https://soko-yetu-backend.onrender.com/api";

let currentStep = 1;
const TOTAL_STEPS = 5;

const postAdState = {
  category: null,
  sub: null,
  title: "",
  price: "",
  negotiable: false,
  description: "",
  specs: {},
  photoFiles: [],   // real File objects for upload
  photoPreviews: [], // data URLs for in-browser preview
  country: "KE",
  city: "",
  phone: "",
  sellerName: ""
};

function getCurrentCurrency() {
  const country = COUNTRIES.find(c => c.code === postAdState.country);
  return country ? country.currency : "KES";
}

const SPEC_FIELD_TEMPLATES = {
  vehicles:    ["Brand", "Model", "Year", "Condition", "Mileage", "Transmission", "Fuel Type"],
  property:    ["Bedrooms", "Bathrooms", "Furnishing", "Parking"],
  phones:      ["Brand", "Model", "Condition", "Internal Storage", "RAM"],
  electronics: ["Brand", "Model", "Condition"],
  fashion:     ["Type", "Material", "Condition", "Color"],
  furniture:   ["Material", "Condition", "Color"],
  jobs:        ["Job Type", "Experience Required", "Qualification"],
  services:    ["Service Type", "Experience", "Availability"],
  beauty:      ["Type", "Condition"],
  kids:        ["Type", "Age Range", "Condition"],
  agriculture: ["Type", "Quantity", "Condition"],
  animals:     ["Breed", "Age", "Vaccinated"],
  commercial:  ["Type", "Brand", "Condition"],
  repair:      ["Type", "Condition"],
  sports:      ["Type", "Condition"],
  education:   ["Type", "Condition"],
};

const TITLE_EXAMPLES = {
  vehicles:    "Toyota Axio 2014, clean, low mileage",
  property:    "2 Bedroom Apartment for Rent - Kileleshwa",
  phones:      "iPhone 13 Pro Max 256GB - Sealed",
  electronics: "HP Laptop Core i7, 16GB RAM, 512GB SSD",
  fashion:     "Women's Designer Handbags - New Arrivals",
  furniture:   "Leather Sofa Set - 5 Seater",
  jobs:        "Accountant Needed - Full Time",
  services:    "Experienced Plumber - Available for Hire",
  beauty:      "Brand New Makeup Set - Full Kit",
  kids:        "Baby Stroller - Like New",
  agriculture: "Fresh Maize - 90kg Bags",
  animals:     "German Shepherd Puppies for Sale",
  commercial:  "Industrial Generator - 50KVA",
  repair:      "Quality Cement - 50kg Bags",
  sports:      "Mountain Bike - Barely Used",
  education:   "Used Form 4 Textbooks - Full Set",
};

const SPEC_FIELD_EXAMPLES = {
  vehicles:    { "Brand": "Toyota", "Model": "Axio", "Year": "2014", "Condition": "Used", "Mileage": "78,000 km", "Transmission": "Automatic", "Fuel Type": "Petrol" },
  property:    { "Bedrooms": "2", "Bathrooms": "2", "Furnishing": "Unfurnished", "Parking": "Yes" },
  phones:      { "Brand": "Samsung", "Model": "Galaxy A57", "Condition": "Brand New", "Internal Storage": "256 GB", "RAM": "8 GB" },
  electronics: { "Brand": "HP", "Model": "ProBook", "Condition": "Used - Like New" },
  fashion:     { "Type": "Handbag", "Material": "Leather", "Condition": "Brand New", "Color": "Black" },
  furniture:   { "Material": "Leather", "Condition": "Used - Excellent", "Color": "Brown" },
  jobs:        { "Job Type": "Full-Time", "Experience Required": "2+ years", "Qualification": "CPA" },
  services:    { "Service Type": "Plumbing", "Experience": "8 years", "Availability": "Mon - Sat" },
  beauty:      { "Type": "Makeup Set", "Condition": "Brand New" },
  kids:        { "Type": "Stroller", "Age Range": "0-3 years", "Condition": "Used - Like New" },
  agriculture: { "Type": "Maize", "Quantity": "90kg bags", "Condition": "Fresh" },
  animals:     { "Breed": "German Shepherd", "Age": "8 weeks", "Vaccinated": "Yes" },
  commercial:  { "Type": "Generator", "Brand": "Cummins", "Condition": "Used - Good" },
  repair:      { "Type": "Cement", "Condition": "Brand New" },
  sports:      { "Type": "Mountain Bike", "Condition": "Used - Good" },
  education:   { "Type": "Textbook Set", "Condition": "Used - Good" },
};

const PRICE_EXAMPLES = {
  vehicles: "1450000", property: "65000", phones: "95000", electronics: "68000",
  fashion: "4500", furniture: "38000", jobs: "0", services: "1500",
  beauty: "2500", kids: "3500", agriculture: "4000", animals: "25000",
  commercial: "450000", repair: "800", sports: "12000", education: "1200",
};

// ===== STEP NAVIGATION =====

function goToStep(step) {
  if (step < 1 || step > TOTAL_STEPS) return;

  document.querySelectorAll(".form-step").forEach(s => s.style.display = "none");
  document.getElementById("step" + step).style.display = "block";
  currentStep = step;

  document.querySelectorAll(".step-dot-wrap").forEach(wrap => {
    const dotStep = Number(wrap.dataset.step);
    wrap.classList.toggle("active", dotStep === step);
    wrap.classList.toggle("completed", dotStep < step);
  });

  document.getElementById("backBtn").style.visibility = step === 1 ? "hidden" : "visible";

  const nextBtn = document.getElementById("nextBtn");
  nextBtn.textContent = step === TOTAL_STEPS ? "Post ad" : "Continue →";

  if (step === 2) renderSpecFields();
  if (step === 5) renderReview();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleNextClick() {
  if (!validateStep(currentStep)) return;
  saveStepData(currentStep);

  if (currentStep === TOTAL_STEPS) {
    submitAd();
    return;
  }
  goToStep(currentStep + 1);
}

// ===== VALIDATION =====

function validateStep(step) {
  if (step === 1) {
    if (!postAdState.category) {
      alert("Please choose a category to continue.");
      return false;
    }
  }
  if (step === 2) {
    const title = document.getElementById("adTitle").value.trim();
    const price = document.getElementById("adPrice").value;
    if (!title) { alert("Please enter a title for your ad."); return false; }
    if (!price || Number(price) < 0) { alert("Please enter a valid price (use 0 for negotiable/free)."); return false; }
  }
  if (step === 4) {
    const country = document.getElementById("adCountry").value;
    const city = document.getElementById("adCity").value.trim();
    const phone = document.getElementById("adPhone").value.trim();
    const sellerName = document.getElementById("adSellerName").value.trim();
    if (!country || !city || !phone || !sellerName) {
      alert("Please fill in all location and contact fields.");
      return false;
    }
  }
  return true;
}

// ===== SAVE STEP DATA =====

function saveStepData(step) {
  if (step === 2) {
    postAdState.title = document.getElementById("adTitle").value.trim();
    postAdState.price = document.getElementById("adPrice").value;
    postAdState.negotiable = document.getElementById("adNegotiable").checked;
    postAdState.description = document.getElementById("adDescription").value.trim();

    const fields = SPEC_FIELD_TEMPLATES[postAdState.category] || [];
    fields.forEach(label => {
      const input = document.getElementById("spec-" + label.replace(/\s+/g, "-"));
      if (input && input.value.trim()) {
        postAdState.specs[label] = input.value.trim();
      }
    });
  }
  if (step === 4) {
    postAdState.country = document.getElementById("adCountry").value;
    postAdState.city = document.getElementById("adCity").value.trim();
    const dialCode = document.getElementById("adPhonePrefix").textContent;
    const localNumber = document.getElementById("adPhone").value.trim().replace(/^0+/, "");
    postAdState.phone = localNumber ? dialCode + " " + localNumber : "";
    postAdState.sellerName = document.getElementById("adSellerName").value.trim();
  }
}

// ===== STEP 1: CATEGORY PICKER =====

function renderCategoryPicker() {
  const grid = document.getElementById("categoryPickGrid");
  grid.innerHTML = CATEGORIES.map(cat => `
    <button type="button" class="category-pick-btn ${postAdState.category === cat.id ? 'selected' : ''}"
      onclick="selectCategory('${cat.id}')">
      <span class="category-pick-icon">${cat.icon}</span>
      <span class="category-pick-name">${cat.name}</span>
    </button>
  `).join("");
}

function selectCategory(catId) {
  postAdState.category = catId;
  postAdState.sub = null;
  postAdState.specs = {};

  document.querySelectorAll(".category-pick-btn").forEach(btn => btn.classList.remove("selected"));
  const selected = document.querySelector(`[onclick="selectCategory('${catId}')"]`);
  if (selected) selected.classList.add("selected");

  const cat = CATEGORIES.find(c => c.id === catId);
  const subContainer = document.getElementById("subcategoryContainer");
  const subGrid = document.getElementById("subcategoryGrid");
  const titleInput = document.getElementById("adTitle");
  const priceInput = document.getElementById("adPrice");

  if (cat && cat.subcategories && cat.subcategories.length > 0) {
    subContainer.style.display = "block";
    subGrid.innerHTML = cat.subcategories.map(sub => `
      <button type="button" class="subcategory-btn" onclick="selectSubcategory('${sub.id}')">
        ${sub.name}
      </button>
    `).join("");
  } else {
    subContainer.style.display = "none";
  }

  if (titleInput) titleInput.placeholder = TITLE_EXAMPLES[catId] || "e.g. Item for sale";
  if (priceInput) priceInput.placeholder = PRICE_EXAMPLES[catId] || "0";
}

function selectSubcategory(subId) {
  postAdState.sub = subId;
  document.querySelectorAll(".subcategory-btn").forEach(btn => btn.classList.remove("selected"));
  const selected = document.querySelector(`[onclick="selectSubcategory('${subId}')"]`);
  if (selected) selected.classList.add("selected");
}

// ===== STEP 2: SPEC FIELDS =====

function renderSpecFields() {
  const container = document.getElementById("specFieldsContainer");
  if (!container) return;

  const fields = SPEC_FIELD_TEMPLATES[postAdState.category] || [];
  const examples = SPEC_FIELD_EXAMPLES[postAdState.category] || {};

  if (fields.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <h4 class="spec-fields-title">Details</h4>
    <div class="spec-fields-grid">
      ${fields.map(label => {
        const example = examples[label] ? "e.g. " + examples[label] : label;
        return `
        <div>
          <label class="field-label">${label}</label>
          <input type="text" id="spec-${label.replace(/\s+/g, "-")}" class="field-input" placeholder="${example}" value="${postAdState.specs[label] || ""}">
        </div>
      `;
      }).join("")}
    </div>
  `;
}

// ===== STEP 3: PHOTO UPLOAD =====

function renderPhotoGrid() {
  const grid = document.getElementById("photoUploadGrid");
  const slots = [...postAdState.photoPreviews];
  while (slots.length < 6) slots.push(null);

  grid.innerHTML = slots.map((photo, i) => {
    if (photo) {
      return `
        <div class="photo-slot photo-slot-filled">
          <img src="${photo}" alt="Photo ${i + 1}">
          <button type="button" class="photo-remove-btn" onclick="removePhoto(${i})">✕</button>
        </div>
      `;
    }
    return `
      <button type="button" class="photo-slot photo-slot-empty" onclick="document.getElementById('photoFileInput').click()">
        <span class="photo-add-icon">📷</span>
        <span>Add photo</span>
      </button>
    `;
  }).join("");
}

function removePhoto(index) {
  postAdState.photoPreviews.splice(index, 1);
  postAdState.photoFiles.splice(index, 1);
  renderPhotoGrid();
}

function setupPhotoInput() {
  const input = document.getElementById("photoFileInput");
  input.addEventListener("change", function (e) {
    const remaining = 8 - postAdState.photoFiles.length;
    const files = Array.from(e.target.files).slice(0, remaining);
    files.forEach(file => {
      postAdState.photoFiles.push(file);
      const reader = new FileReader();
      reader.onload = function (ev) {
        postAdState.photoPreviews.push(ev.target.result);
        renderPhotoGrid();
      };
      reader.readAsDataURL(file);
    });
    input.value = "";
  });
}

// ===== STEP 4: COUNTRY DROPDOWN =====

function renderAdCountrySelect() {
  const optionsHtml = COUNTRIES.map(c => `<option value="${c.code}">${c.name}</option>`).join("");

  const step1Select = document.getElementById("adCountryStep1");
  const step4Select = document.getElementById("adCountry");

  if (step1Select) { step1Select.innerHTML = optionsHtml; step1Select.value = postAdState.country; }
  if (step4Select) { step4Select.innerHTML = optionsHtml; step4Select.value = postAdState.country; }

  function handleCountryChange(e) {
    postAdState.country = e.target.value;
    if (step1Select) step1Select.value = postAdState.country;
    if (step4Select) step4Select.value = postAdState.country;
    updatePriceFieldLabel();
    updateLocationHints();
  }

  if (step1Select) step1Select.addEventListener("change", handleCountryChange);
  if (step4Select) step4Select.addEventListener("change", handleCountryChange);

  updateLocationHints();
}

function updateLocationHints() {
  const country = COUNTRIES.find(c => c.code === postAdState.country);
  if (!country) return;
  const cityInput = document.getElementById("adCity");
  const phonePrefix = document.getElementById("adPhonePrefix");
  if (cityInput) cityInput.placeholder = "e.g. " + country.exampleCity;
  if (phonePrefix) phonePrefix.textContent = country.dialCode;
}

function updatePriceFieldLabel() {
  const label = document.getElementById("priceFieldLabel");
  if (label) label.textContent = "Price (" + getCurrentCurrency() + ")";
}

// ===== STEP 5: REVIEW =====

function renderReview() {
  const catName = getCategoryName(postAdState.category);
  const cat = CATEGORIES.find(c => c.id === postAdState.category);
  const sub = cat && postAdState.sub ? (cat.subcategories || []).find(s => s.id === postAdState.sub) : null;
  const subName = sub ? sub.name : "";
  const countryName = COUNTRIES.find(c => c.code === postAdState.country)?.name || postAdState.country;
  const priceDisplay = Number(postAdState.price) === 0
    ? "Negotiable"
    : getCurrentCurrency() + " " + Number(postAdState.price).toLocaleString();

  const specRows = Object.entries(postAdState.specs).map(([label, value]) => `
    <div class="review-spec-row"><span>${label}</span><span>${value}</span></div>
  `).join("");

  const photoThumbs = postAdState.photoPreviews.map(p => `<img src="${p}" class="review-photo-thumb">`).join("");

  document.getElementById("reviewCard").innerHTML = `
    <div class="review-photos">${photoThumbs || '<p class="review-empty-note">No photos added</p>'}</div>
    <h3 class="review-title">${postAdState.title}</h3>
    <div class="review-price">${priceDisplay}${postAdState.negotiable ? " (Negotiable)" : ""}</div>
    <div class="review-meta">📍 ${postAdState.city}, ${countryName} &nbsp; • &nbsp; ${catName}${subName ? " › " + subName : ""}</div>
    ${specRows ? `<div class="review-specs">${specRows}</div>` : ""}
    <div class="review-description">
      <strong>Description</strong>
      <p>${postAdState.description || "<em>No description added</em>"}</p>
    </div>
    <div class="review-contact">
      <strong>Contact</strong>
      <p>${postAdState.sellerName} — ${postAdState.phone}</p>
    </div>
  `;
}

// ===== SUBMIT =====

async function submitAd() {
  const token = getToken();
  if (!token) {
    window.location.href = "login.html?redirect=post-ad.html";
    return;
  }

  const nextBtn = document.getElementById("nextBtn");
  nextBtn.disabled = true;
  nextBtn.textContent = "Posting...";

  try {
    // Step 1: upload photos if any
    let photoUrls = [];
    if (postAdState.photoFiles.length > 0) {
      nextBtn.textContent = "Uploading photos...";
      const formData = new FormData();
      postAdState.photoFiles.forEach(file => formData.append("photos", file));

      const uploadRes = await fetch(`${API}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Photo upload failed");
      const uploadData = await uploadRes.json();
      photoUrls = uploadData.urls || [];
    }

    // Step 2: create the listing
    nextBtn.textContent = "Creating listing...";
    const res = await fetch(`${API}/listings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: postAdState.title,
        price: Number(postAdState.price),
        negotiable: postAdState.negotiable,
        description: postAdState.description,
        category: postAdState.category,
        sub: postAdState.sub,
        countryCode: postAdState.country,
        city: postAdState.city,
        specs: postAdState.specs,
        photoUrls,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to post ad");
    }

    // Success
    document.getElementById("postAdForm").style.display = "none";
    document.getElementById("stepTracker").style.display = "none";
    document.getElementById("postSuccess").style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });

  } catch (err) {
    alert(err.message || "Could not post your ad. Please try again.");
    nextBtn.disabled = false;
    nextBtn.textContent = "Post ad";
  }
}

// ===== INIT =====

document.addEventListener("DOMContentLoaded", function () {
  // Redirect to login if not authenticated
  if (!isLoggedIn()) {
    window.location.href = "login.html?redirect=post-ad.html";
    return;
  }

  renderCategoryPicker();
  renderAdCountrySelect();
  updatePriceFieldLabel();
  setupPhotoInput();
  renderPhotoGrid();
  goToStep(1);

  const titleInput = document.getElementById("adTitle");
  const descInput = document.getElementById("adDescription");
  if (titleInput) titleInput.addEventListener("input", () => {
    document.getElementById("titleCount").textContent = titleInput.value.length + " / " + titleInput.maxLength;
  });
  if (descInput) descInput.addEventListener("input", () => {
    document.getElementById("descCount").textContent = descInput.value.length + " / " + descInput.maxLength;
  });
});
