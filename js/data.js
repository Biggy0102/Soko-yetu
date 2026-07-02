// ===== SAMPLE DATA =====
// In Phase 1, this data is hardcoded so we can see the site working.
// In Phase 2 (backend), this will be replaced by real data fetched from a database.

const CATEGORIES = [
  {
    id: "vehicles", name: "Vehicles", icon: "🚗",
    subcategories: [
      { id: "cars", name: "Cars" },
      { id: "motorcycles", name: "Motorcycles & Scooters" },
      { id: "trucks", name: "Trucks & Trailers" },
      { id: "buses", name: "Buses & Vans" },
      { id: "boats", name: "Boats & Watercraft" },
      { id: "vehicle-parts", name: "Vehicle Parts & Accessories" },
      { id: "rental-vehicles", name: "Vehicles for Rent" },
    ]
  },
  {
    id: "property", name: "Property", icon: "🏠",
    subcategories: [
      { id: "houses-rent", name: "Houses & Apartments for Rent" },
      { id: "houses-sale", name: "Houses & Apartments for Sale" },
      { id: "land-sale", name: "Land & Plots for Sale" },
      { id: "commercial-property", name: "Commercial Property" },
      { id: "short-stay", name: "Short Stay & Airbnb" },
    ]
  },
  {
    id: "phones", name: "Phones & Tablets", icon: "📱",
    subcategories: [
      { id: "smartphones", name: "Mobile Phones" },
      { id: "tablets", name: "Tablets" },
      { id: "phone-accessories", name: "Phone Accessories" },
      { id: "smartwatches", name: "Smartwatches" },
    ]
  },
  {
    id: "electronics", name: "Electronics", icon: "💻",
    subcategories: [
      { id: "laptops", name: "Laptops & Computers" },
      { id: "tv-audio", name: "TVs & Home Audio" },
      { id: "cameras", name: "Cameras & Photography" },
      { id: "gaming", name: "Video Games & Consoles" },
      { id: "printers", name: "Printers & Office Electronics" },
    ]
  },
  {
    id: "fashion", name: "Fashion", icon: "👗",
    subcategories: [
      { id: "womens-clothing", name: "Women's Clothing" },
      { id: "mens-clothing", name: "Men's Clothing" },
      { id: "shoes", name: "Shoes" },
      { id: "bags", name: "Bags & Accessories" },
      { id: "jewelry", name: "Jewelry & Watches" },
    ]
  },
  {
    id: "furniture", name: "Furniture & Home", icon: "🛋️",
    subcategories: [
      { id: "living-room", name: "Living Room Furniture" },
      { id: "bedroom", name: "Bedroom Furniture" },
      { id: "kitchen", name: "Kitchen & Dining" },
      { id: "home-decor", name: "Home Decor" },
      { id: "appliances", name: "Home Appliances" },
    ]
  },
  {
    id: "jobs", name: "Jobs", icon: "💼",
    subcategories: [
      { id: "full-time", name: "Full-Time Jobs" },
      { id: "part-time", name: "Part-Time Jobs" },
      { id: "internships", name: "Internships" },
      { id: "freelance", name: "Freelance & Remote" },
      { id: "domestic", name: "Domestic Staff" },
    ]
  },
  {
    id: "services", name: "Services", icon: "🛠️",
    subcategories: [
      { id: "home-services", name: "Home Repair Services" },
      { id: "events", name: "Events & Catering" },
      { id: "legal-financial", name: "Legal & Financial Services" },
      { id: "transport-services", name: "Transport & Moving" },
      { id: "tech-services", name: "Tech & IT Services" },
    ]
  },
  {
    id: "beauty", name: "Beauty & Personal Care", icon: "💄",
    subcategories: [
      { id: "skincare", name: "Skincare" },
      { id: "makeup", name: "Makeup & Cosmetics" },
      { id: "haircare", name: "Hair Care & Wigs" },
      { id: "fragrances", name: "Fragrances" },
    ]
  },
  {
    id: "kids", name: "Babies & Kids", icon: "🧸",
    subcategories: [
      { id: "baby-clothing", name: "Baby & Kids Clothing" },
      { id: "toys", name: "Toys & Games" },
      { id: "strollers", name: "Strollers & Car Seats" },
      { id: "school-supplies", name: "School Supplies" },
    ]
  },
  {
    id: "agriculture", name: "Agriculture & Food", icon: "🌾",
    subcategories: [
      { id: "farm-produce", name: "Farm Produce" },
      { id: "livestock-feed", name: "Livestock & Animal Feed" },
      { id: "farm-machinery", name: "Farm Machinery & Tools" },
      { id: "seeds-fertilizer", name: "Seeds & Fertilizer" },
    ]
  },
  {
    id: "animals", name: "Animals & Pets", icon: "🐄",
    subcategories: [
      { id: "dogs", name: "Dogs" },
      { id: "cats", name: "Cats" },
      { id: "farm-animals", name: "Farm Animals" },
      { id: "pet-accessories", name: "Pet Accessories & Food" },
    ]
  },
  {
    id: "commercial", name: "Commercial Equipment", icon: "🏗️",
    subcategories: [
      { id: "construction-equipment", name: "Construction Equipment" },
      { id: "industrial-machinery", name: "Industrial Machinery" },
      { id: "restaurant-equipment", name: "Restaurant & Catering Equipment" },
      { id: "office-equipment", name: "Office Equipment" },
    ]
  },
  {
    id: "repair", name: "Repair & Construction", icon: "🔧",
    subcategories: [
      { id: "building-materials", name: "Building Materials" },
      { id: "tools", name: "Tools & Hardware" },
      { id: "electrical", name: "Electrical Supplies" },
      { id: "plumbing", name: "Plumbing Supplies" },
    ]
  },
  {
    id: "sports", name: "Sports & Outdoors", icon: "🏀",
    subcategories: [
      { id: "gym-equipment", name: "Gym & Fitness Equipment" },
      { id: "bicycles", name: "Bicycles" },
      { id: "camping", name: "Camping & Outdoor Gear" },
      { id: "team-sports", name: "Team Sports Equipment" },
    ]
  },
  {
    id: "education", name: "Education & Classes", icon: "📚",
    subcategories: [
      { id: "books", name: "Books & Textbooks" },
      { id: "tutoring", name: "Tutoring & Lessons" },
      { id: "courses", name: "Courses & Training" },
      { id: "musical-instruments", name: "Musical Instruments" },
    ]
  },
];

const COUNTRIES = [
  { code: "KE", name: "Kenya",        currency: "KES", dialCode: "+254", exampleCity: "Nairobi" },
  { code: "UG", name: "Uganda",       currency: "UGX", dialCode: "+256", exampleCity: "Kampala" },
  { code: "TZ", name: "Tanzania",     currency: "TZS", dialCode: "+255", exampleCity: "Dar es Salaam" },
  { code: "RW", name: "Rwanda",       currency: "RWF", dialCode: "+250", exampleCity: "Kigali" },
  { code: "CD", name: "Congo (DRC)",  currency: "CDF", dialCode: "+243", exampleCity: "Kinshasa" },
  { code: "BI", name: "Burundi",      currency: "BIF", dialCode: "+257", exampleCity: "Bujumbura" },
  { code: "SS", name: "South Sudan",  currency: "SSP", dialCode: "+211", exampleCity: "Juba" },
  { code: "SO", name: "Somalia",      currency: "SOS", dialCode: "+252", exampleCity: "Mogadishu" },
  { code: "ET", name: "Ethiopia",     currency: "ETB", dialCode: "+251", exampleCity: "Addis Ababa" },
];

const LISTINGS = [
  {
    id: 1,
    title: "Toyota Axio 2014, clean, low mileage",
    price: 1450000,
    currency: "KES",
    category: "vehicles",
    sub: "cars",
    country: "KE",
    location: "Nairobi, Kenya",
    icon: "🚗",
    featured: true,
    description: "Well maintained Toyota Axio, single owner, full service history. Buggy-free, ready to drive. Genuine reason for sale.",
    specs: {
      "Brand": "Toyota", "Model": "Axio", "Year": "2014", "Condition": "Used",
      "Mileage": "78,000 km", "Transmission": "Automatic", "Fuel Type": "Petrol",
      "Engine": "1.5L", "Body Type": "Sedan", "Color": "Silver"
    },
    storeAddress: "Ngong Road, opposite Adams Arcade, Nairobi",
    sellerName: "James M.",
    sellerPhone: "0712345678",
    postedAt: "2026-06-18"
  },
  {
    id: 2,
    title: "iPhone 13 Pro Max 256GB - Sealed",
    price: 95000,
    currency: "KES",
    category: "phones",
    sub: "smartphones",
    country: "KE",
    location: "Mombasa, Kenya",
    icon: "📱",
    featured: true,
    description: "Brand new sealed iPhone 13 Pro Max, 256GB storage. Comes with warranty and original accessories.",
    specs: {
      "Brand": "Apple", "Model": "iPhone 13 Pro Max", "Condition": "Brand New",
      "Internal Storage": "256 GB", "RAM": "6 GB", "Main Camera": "Triple 12 MP",
      "Screen Size": "6.7 inches", "Battery": "4352 mAh", "SIM": "Dual SIM", "Color": "Graphite"
    },
    storeAddress: "Moi Avenue, Tusker House, Mombasa",
    sellerName: "Faith W.",
    sellerPhone: "0723456789",
    postedAt: "2026-06-20"
  },
  {
    id: 3,
    title: "2 Bedroom Apartment for Rent - Kileleshwa",
    price: 65000,
    currency: "KES",
    category: "property",
    sub: "houses-rent",
    country: "KE",
    location: "Nairobi, Kenya",
    icon: "🏠",
    featured: false,
    description: "Spacious 2 bedroom apartment, master ensuite, secure compound, parking available. Walking distance to shops.",
    specs: {
      "Bedrooms": "2", "Bathrooms": "2", "Furnishing": "Unfurnished",
      "Parking": "Yes", "Security": "24/7 Guard", "Water": "Borehole + County",
      "Floor": "3rd Floor", "Service Charge": "Included"
    },
    storeAddress: "Kileleshwa, off Othaya Road, Nairobi",
    sellerName: "Kileleshwa Homes",
    sellerPhone: "0734567890",
    postedAt: "2026-06-15"
  },
  {
    id: 4,
    title: "HP Laptop Core i7, 16GB RAM, 512GB SSD",
    price: 68000,
    currency: "KES",
    category: "electronics",
    sub: "laptops",
    country: "UG",
    location: "Kampala, Uganda",
    icon: "💻",
    featured: false,
    description: "Fast and reliable laptop, perfect for work and study. Barely used, no scratches, original charger included.",
    specs: {
      "Brand": "HP", "Model": "ProBook", "Condition": "Used - Like New",
      "Processor": "Core i7", "RAM": "16 GB", "Storage": "512 GB SSD",
      "Screen Size": "15.6 inches", "Operating System": "Windows 11"
    },
    storeAddress: "Kampala Road, Pioneer Mall, Kampala",
    sellerName: "Brian K.",
    sellerPhone: "0701234567",
    postedAt: "2026-06-19"
  },
  {
    id: 5,
    title: "Leather Sofa Set - 5 Seater",
    price: 38000,
    currency: "KES",
    category: "furniture",
    sub: "living-room",
    country: "TZ",
    location: "Arusha, Tanzania",
    icon: "🛋️",
    featured: false,
    description: "Genuine leather 5-seater sofa set in excellent condition. Comfortable and stylish, perfect for any living room.",
    specs: {
      "Material": "Genuine Leather", "Seats": "5 Seater (3+1+1)", "Condition": "Used - Excellent",
      "Color": "Brown", "Frame": "Solid Wood"
    },
    storeAddress: "Sokoine Road, Arusha",
    sellerName: "Amani Furnishings",
    sellerPhone: "0755123456",
    postedAt: "2026-06-17"
  },
  {
    id: 6,
    title: "Women's Designer Handbags - New Arrivals",
    price: 4500,
    currency: "KES",
    category: "fashion",
    sub: "bags",
    country: "RW",
    location: "Kigali, Rwanda",
    icon: "👗",
    featured: true,
    description: "Fresh stock of trendy designer-inspired handbags. Various colors available. Wholesale and retail prices.",
    specs: {
      "Type": "Handbag", "Material": "PU Leather", "Condition": "Brand New",
      "Colors Available": "Black, Brown, Beige", "Wholesale": "Available"
    },
    storeAddress: "Kigali City Market, Stall 42, Kigali",
    sellerName: "Grace U.",
    sellerPhone: "0788123456",
    postedAt: "2026-06-21"
  },
  {
    id: 7,
    title: "Experienced Plumber - Available for hire",
    price: 1500,
    currency: "KES",
    category: "services",
    sub: "home-services",
    country: "KE",
    location: "Nairobi, Kenya",
    icon: "🛠️",
    featured: false,
    description: "Professional plumbing services for homes and offices. Pipe installation, repairs, and maintenance. Call for a quote.",
    specs: {
      "Service Type": "Plumbing", "Experience": "8 years", "Availability": "Mon - Sat",
      "Call-out Fee": "Negotiable"
    },
    storeAddress: "Serves Nairobi and surrounding areas",
    sellerName: "Daniel O.",
    sellerPhone: "0745678901",
    postedAt: "2026-06-16"
  },
  {
    id: 8,
    title: "Accountant Needed - Full Time",
    price: 0,
    currency: "KES",
    category: "jobs",
    sub: "full-time",
    country: "TZ",
    location: "Dar es Salaam, Tanzania",
    icon: "💼",
    featured: false,
    description: "We are hiring a qualified accountant with at least 2 years experience. CPA certification required. Send CV to apply.",
    specs: {
      "Job Type": "Full-Time", "Experience Required": "2+ years", "Qualification": "CPA",
      "Industry": "Finance"
    },
    storeAddress: "Kariakoo, Dar es Salaam",
    sellerName: "Baraka Enterprises",
    sellerPhone: "0712987654",
    postedAt: "2026-06-14"
  },
  {
    id: 9,
    title: "Toyota Hiace Diesel - 14 Seater",
    price: 2100000,
    currency: "KES",
    category: "vehicles",
    sub: "buses",
    country: "KE",
    location: "Nakuru, Kenya",
    icon: "🚐",
    featured: false,
    description: "Well maintained 14-seater Hiace, perfect for shuttle business. Diesel engine, recently serviced.",
    specs: {
      "Brand": "Toyota", "Model": "Hiace", "Condition": "Used",
      "Mileage": "145,000 km", "Transmission": "Manual", "Fuel Type": "Diesel",
      "Seats": "14", "Body Type": "Van/Minibus"
    },
    storeAddress: "Nakuru Town, near Total Petrol Station",
    sellerName: "Peter N.",
    sellerPhone: "0711222333",
    postedAt: "2026-06-12"
  },
  {
    id: 10,
    title: "Samsung Galaxy Tab S8",
    price: 42000,
    currency: "KES",
    category: "phones",
    sub: "tablets",
    country: "UG",
    location: "Kampala, Uganda",
    icon: "📟",
    featured: false,
    description: "Samsung Galaxy Tab S8, barely used, comes with S Pen and original box. Great for work or school.",
    specs: {
      "Brand": "Samsung", "Model": "Galaxy Tab S8", "Condition": "Used - Like New",
      "Internal Storage": "128 GB", "RAM": "8 GB", "Screen Size": "11 inches",
      "Stylus Included": "Yes (S Pen)"
    },
    storeAddress: "Garden City Mall, Kampala",
    sellerName: "Sarah N.",
    sellerPhone: "0702345678",
    postedAt: "2026-06-13"
  },
  {
    id: 11,
    title: "3 Bedroom Bungalow on Half Acre - For Sale",
    price: 8500000,
    currency: "KES",
    category: "property",
    sub: "houses-sale",
    country: "KE",
    location: "Kiambu, Kenya",
    icon: "🏡",
    featured: true,
    description: "Beautiful 3 bedroom bungalow on half an acre, gated community, ready title deed. Serious buyers only.",
    specs: {
      "Bedrooms": "3", "Bathrooms": "3", "Land Size": "0.5 Acre",
      "Title Deed": "Ready", "Furnishing": "Unfurnished", "Gated Community": "Yes"
    },
    storeAddress: "Kiambu Road, near Tatu City, Kiambu",
    sellerName: "Kiambu Realty",
    sellerPhone: "0722334455",
    postedAt: "2026-06-11"
  },
  {
    id: 12,
    title: "German Shepherd Puppies for Sale",
    price: 25000,
    currency: "KES",
    category: "animals",
    sub: "dogs",
    country: "KE",
    location: "Nairobi, Kenya",
    icon: "🐕",
    featured: false,
    description: "Pure breed German Shepherd puppies, 8 weeks old, vaccinated and dewormed. Both parents on site.",
    specs: {
      "Breed": "German Shepherd", "Age": "8 weeks", "Vaccinated": "Yes",
      "Dewormed": "Yes", "Gender": "Male & Female available"
    },
    storeAddress: "Karen, near Hardy Shopping Centre, Nairobi",
    sellerName: "Mike W.",
    sellerPhone: "0733445566",
    postedAt: "2026-06-10"
  }
];

// ===== SELLER PROFILES =====
// In a real backend, sellers would be a separate table referenced by listings.
// For Phase 1, we look sellers up by name so listing data doesn't repeat itself.

const SELLERS = {
  "James M.":          { memberSince: "2023", verified: true,  feedbackCount: 38,  responseTime: "within an hour" },
  "Faith W.":           { memberSince: "2024", verified: true,  feedbackCount: 21,  responseTime: "within minutes" },
  "Kileleshwa Homes":   { memberSince: "2021", verified: true,  feedbackCount: 96,  responseTime: "within minutes" },
  "Brian K.":           { memberSince: "2024", verified: false, feedbackCount: 6,   responseTime: "within a day" },
  "Amani Furnishings":  { memberSince: "2022", verified: true,  feedbackCount: 54,  responseTime: "within an hour" },
  "Grace U.":           { memberSince: "2025", verified: false, feedbackCount: 12,  responseTime: "within a few hours" },
  "Daniel O.":          { memberSince: "2023", verified: true,  feedbackCount: 29,  responseTime: "within an hour" },
  "Baraka Enterprises": { memberSince: "2020", verified: true,  feedbackCount: 142, responseTime: "within minutes" },
  "Peter N.":           { memberSince: "2024", verified: false, feedbackCount: 9,   responseTime: "within a day" },
  "Sarah N.":           { memberSince: "2023", verified: true,  feedbackCount: 17,  responseTime: "within a few hours" },
  "Kiambu Realty":      { memberSince: "2019", verified: true,  feedbackCount: 203, responseTime: "within minutes" },
  "Mike W.":            { memberSince: "2024", verified: false, feedbackCount: 4,   responseTime: "within a day" },
};

function getSellerProfile(name) {
  return SELLERS[name] || { memberSince: "2025", verified: false, feedbackCount: 0, responseTime: "within a day" };
}
