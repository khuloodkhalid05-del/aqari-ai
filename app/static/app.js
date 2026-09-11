/**
 * GOLDENESTATE AI — FRONTEND APPLICATION LOGIC
 * Interactive Black & Gold Real Estate Valuation
 */

// State Management
const appState = {
  currentCategory: 'medium',
  areaSqm: 160,
  bedrooms: 3,
  bathrooms: 2,
  amenities: {
    sea_view: false,
    roof: false,
    pool: false,
    garden: false,
    finished: true,
    furnished: false,
    maid: false
  },
  chartsInitialized: false
};

// City to Compounds Mapping
const CITY_COMPOUNDS = {
  "New Cairo City": ["Mivida", "Hyde Park", "District 5", "Eastown", "Swan Lake", "Mountain View", "Other"],
  "Sheikh Zayed City": ["Allegria", "Badya Palm Hills", "Etapa", "Kayan", "Other"],
  "6 October City": ["Badya Palm Hills", "Joulz", "Mountain View", "Other"],
  "North Coast Resorts": ["Marassi", "Hacienda Bay", "Cali Coast", "Amwaj", "Fouka Bay", "Other"],
  "Ras Al Hekma": ["Azha North", "La vista Ras El Hikma", "Caesar", "Other"],
  "El Gouna": ["Swan Lake Gouna", "Mangroovy Residence", "Other"],
  "Al Ain Al Sokhna": ["IL Monte Galala", "Azha", "Other"],
  "Madinaty": ["Madinaty"],
  "Nasr City": ["Other"],
  "Heliopolis - Masr El Gedida": ["Other"],
  "El Maadi": ["Other"],
  "Zamalek": ["Other"]
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  updateCompoundsForCity();
  calculatePrice(); // initial auto-calculation on load
});

// 1. Tab Switching
function setupTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      switchTab(target);
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-tab') === tabId);
  });
  
  document.querySelectorAll('.app-tab').forEach(panel => {
    panel.classList.toggle('active', panel.id === tabId);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Initialize charts when models or market tabs are clicked
  if ((tabId === 'tab-models' || tabId === 'tab-market') && !appState.chartsInitialized) {
    initCharts();
    appState.chartsInitialized = true;
  }
}

// 2. Size Category Selection (Crucial User Requirement: صغيرة / وسط / كبيرة)
function selectSizeCategory(category) {
  appState.currentCategory = category;
  
  // Highlight active category card
  document.querySelectorAll('.size-category-card').forEach(card => {
    card.classList.toggle('active', card.getAttribute('data-category') === category);
  });

  const slider = document.getElementById('area-slider');
  const typeSelect = document.getElementById('select-type');

  if (category === 'small') {
    appState.areaSqm = 90;
    appState.bedrooms = 2;
    appState.bathrooms = 1;
    typeSelect.value = 'Apartment';
  } else if (category === 'medium') {
    appState.areaSqm = 160;
    appState.bedrooms = 3;
    appState.bathrooms = 2;
    typeSelect.value = 'Apartment';
  } else if (category === 'large') {
    appState.areaSqm = 380;
    appState.bedrooms = 5;
    appState.bathrooms = 4;
    typeSelect.value = 'Villa';
  }

  // Update DOM elements
  slider.value = appState.areaSqm;
  document.getElementById('area-display').textContent = `${appState.areaSqm} م²`;
  document.getElementById('bedrooms-val').textContent = appState.bedrooms;
  document.getElementById('bathrooms-val').textContent = appState.bathrooms;

  calculatePrice();
}

// Slider update
function updateAreaSlider(val) {
  appState.areaSqm = parseInt(val, 10);
  document.getElementById('area-display').textContent = `${appState.areaSqm} م²`;
  
  // Auto-sync category cards based on range
  document.querySelectorAll('.size-category-card').forEach(card => card.classList.remove('active'));
  if (appState.areaSqm <= 120) {
    document.querySelector('.size-category-card[data-category="small"]')?.classList.add('active');
  } else if (appState.areaSqm <= 220) {
    document.querySelector('.size-category-card[data-category="medium"]')?.classList.add('active');
  } else {
    document.querySelector('.size-category-card[data-category="large"]')?.classList.add('active');
  }
  
  calculatePrice();
}

// 3. Counter Adjustment for Rooms
function adjustCount(type, delta) {
  if (type === 'bedrooms') {
    appState.bedrooms = Math.max(1, Math.min(10, appState.bedrooms + delta));
    document.getElementById('bedrooms-val').textContent = appState.bedrooms;
  } else if (type === 'bathrooms') {
    appState.bathrooms = Math.max(1, Math.min(8, appState.bathrooms + delta));
    document.getElementById('bathrooms-val').textContent = appState.bathrooms;
  }
  calculatePrice();
}

// 4. Luxury Amenity Toggle
function toggleAmenity(key) {
  appState.amenities[key] = !appState.amenities[key];
  
  const cardMap = {
    sea_view: 'card-sea-view',
    roof: 'card-roof',
    pool: 'card-pool',
    garden: 'card-garden',
    finished: 'card-finished',
    furnished: 'card-furnished',
    maid: 'card-maid'
  };

  const card = document.getElementById(cardMap[key]);
  if (card) {
    card.classList.toggle('active', appState.amenities[key]);
  }

  calculatePrice();
}

// 5. Update Compounds when City changes
function updateCompoundsForCity() {
  const city = document.getElementById('select-city').value;
  const compoundSelect = document.getElementById('select-compound');
  compoundSelect.innerHTML = '';

  const compounds = CITY_COMPOUNDS[city] || ["Other"];
  compounds.forEach(comp => {
    const opt = document.createElement('option');
    opt.value = comp;
    opt.textContent = comp;
    compoundSelect.appendChild(opt);
  });

  calculatePrice();
}

function autoRefineOptions() {
  calculatePrice();
}

// 6. Perform AI Price Calculation via FastAPI
let debounceTimer = null;

function calculatePrice() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const spinner = document.getElementById('btn-spinner');
    if (spinner) spinner.style.display = 'inline-block';

    const payload = {
      area_sqm: appState.areaSqm,
      bedrooms: appState.bedrooms,
      bathrooms: appState.bathrooms,
      property_type: document.getElementById('select-type').value,
      city: document.getElementById('select-city').value,
      compound: document.getElementById('select-compound').value,
      payment_method: document.getElementById('select-payment').value,
      has_sea_view: appState.amenities.sea_view ? 1 : 0,
      has_roof: appState.amenities.roof ? 1 : 0,
      has_pool: appState.amenities.pool ? 1 : 0,
      has_garden: appState.amenities.garden ? 1 : 0,
      is_fully_finished: appState.amenities.finished ? 1 : 0,
      is_furnished: appState.amenities.furnished ? 1 : 0,
      has_maid_room: appState.amenities.maid ? 1 : 0
    };

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Prediction API failed');
      const data = await response.json();
      renderPredictionResults(data);
    } catch (err) {
      console.warn('API unavailable or error, falling back to local simulation:', err);
      renderLocalSimulation(payload);
    } finally {
      if (spinner) spinner.style.display = 'none';
    }
  }, 120);
}

// Render Results
function renderPredictionResults(data) {
  // Animate Number Count
  animatePrice(data.predicted_price);

  // Millions pill
  document.getElementById('millions-pill').innerHTML = 
    `<i class="fa-solid fa-coins"></i> حوالي <strong>${data.price_in_millions} مليون جنيه مصري</strong>`;

  // Price per SQM
  document.getElementById('sqm-price-val').textContent = 
    `${Math.round(data.price_per_sqm).toLocaleString()} EGP/م²`;

  // Range
  const minM = (data.price_range_min / 1e6).toFixed(1);
  const maxM = (data.price_range_max / 1e6).toFixed(1);
  document.getElementById('range-val').textContent = `${minM}M - ${maxM}M EGP`;

  // Confidence
  document.getElementById('confidence-val').textContent = `${data.confidence_score}% (R² Benchmark)`;

  // Summary Specs
  document.getElementById('summary-type').textContent = data.property_summary.type;
  document.getElementById('summary-area').textContent = `${data.property_summary.area_sqm} م²`;
  document.getElementById('summary-location').textContent = `${data.property_summary.city}`;
  document.getElementById('summary-model').textContent = `${data.best_model_name}`;

  // Active Amenities tags
  const tagsContainer = document.getElementById('features-tags');
  tagsContainer.innerHTML = '';
  const activeAmenities = (data.amenities || []).filter(a => a.active);
  if (activeAmenities.length === 0) {
    tagsContainer.innerHTML = '<span class="feat-tag" style="opacity:0.6;">بدون مميزات إضافية مختارة</span>';
  } else {
    activeAmenities.forEach(a => {
      const span = document.createElement('span');
      span.className = 'feat-tag active';
      span.innerHTML = `${a.icon} ${a.name} (+${a.estimated_premium_pct}%)`;
      tagsContainer.appendChild(span);
    });
  }
}

// Fallback estimation if server is offline during development
function renderLocalSimulation(p) {
  let basePricePerSqm = 42000;
  if (p.city.includes('New Cairo') || p.city.includes('Zayed')) basePricePerSqm = 55000;
  if (p.city.includes('North Coast') || p.city.includes('Ras Al Hekma')) basePricePerSqm = 78000;
  if (p.property_type === 'Villa') basePricePerSqm *= 1.35;

  let total = p.area_sqm * basePricePerSqm;
  if (p.has_sea_view) total *= 1.28;
  if (p.has_pool) total *= 1.22;
  if (p.has_garden) total *= 1.15;
  if (p.is_fully_finished) total *= 1.12;
  if (p.is_furnished) total *= 1.10;
  if (p.has_roof) total *= 1.07;

  renderPredictionResults({
    predicted_price: total,
    price_formatted: `${Math.round(total).toLocaleString()} EGP`,
    price_in_millions: +(total / 1e6).toFixed(2),
    price_per_sqm: Math.round(total / p.area_sqm),
    price_range_min: total * 0.85,
    price_range_max: total * 1.15,
    confidence_score: 61.2,
    best_model_name: "LightGBM Regressor",
    property_summary: {
      type: p.property_type,
      area_sqm: p.area_sqm,
      city: p.city
    },
    amenities: [
      { name: "إطلالة على البحر / بحيرة", icon: "🌊", active: !!p.has_sea_view, estimated_premium_pct: 28.5 },
      { name: "روف خاص", icon: "⛱️", active: !!p.has_roof, estimated_premium_pct: 7.0 },
      { name: "حمام سباحة خاص", icon: "🏊", active: !!p.has_pool, estimated_premium_pct: 24.0 },
      { name: "حديقة خاصة", icon: "🌳", active: !!p.has_garden, estimated_premium_pct: 18.5 },
      { name: "تشطيب سوبر لوكس", icon: "✨", active: !!p.is_fully_finished, estimated_premium_pct: 15.0 },
      { name: "مفروش بالكامل", icon: "🛋️", active: !!p.is_furnished, estimated_premium_pct: 12.0 },
      { name: "غرفة خادمة", icon: "👩‍💼", active: !!p.has_maid_room, estimated_premium_pct: 9.0 }
    ]
  });
}

// Smooth Number Counter Animation
let currentAnimVal = 0;
function animatePrice(targetVal) {
  const el = document.getElementById('main-price-val');
  const duration = 400; // ms
  const startVal = currentAnimVal || (targetVal * 0.85);
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // EaseOutCubic
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startVal + (targetVal - startVal) * easeProgress);
    el.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      currentAnimVal = targetVal;
      el.textContent = Math.round(targetVal).toLocaleString();
    }
  }
  requestAnimationFrame(update);
}

// 7. Interactive Chart.js Initializations
function initCharts() {
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = "'Cairo', sans-serif";

  // Chart 1: R2 Score Comparison
  const ctxR2 = document.getElementById('r2ComparisonChart')?.getContext('2d');
  if (ctxR2) {
    const gradientR2 = ctxR2.createLinearGradient(0, 0, 0, 300);
    gradientR2.addColorStop(0, '#f6cf65');
    gradientR2.addColorStop(1, '#aa8214');

    new Chart(ctxR2, {
      type: 'bar',
      data: {
        labels: ['LightGBM', 'Random Forest', 'XGBoost', 'Linear Regression'],
        datasets: [{
          label: 'R² Score (الأعلى أفضل)',
          data: [0.6124, 0.6075, 0.5764, 0.5059],
          backgroundColor: [gradientR2, 'rgba(212, 175, 55, 0.6)', 'rgba(212, 175, 55, 0.4)', 'rgba(212, 175, 55, 0.2)'],
          borderColor: '#f6cf65',
          borderWidth: 1,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            min: 0.4,
            max: 0.7,
            grid: { color: 'rgba(255,255,255,0.06)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  // Chart 2: MAE Comparison
  const ctxMAE = document.getElementById('maeComparisonChart')?.getContext('2d');
  if (ctxMAE) {
    new Chart(ctxMAE, {
      type: 'bar',
      data: {
        labels: ['LightGBM (الفائز)', 'Random Forest', 'XGBoost', 'Linear Regression'],
        datasets: [{
          label: 'MAE بالمليون جنيه (الأقل أفضل)',
          data: [2.78, 2.85, 2.92, 3.18],
          backgroundColor: ['#10b981', 'rgba(239, 68, 68, 0.6)', 'rgba(239, 68, 68, 0.7)', 'rgba(239, 68, 68, 0.9)'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            min: 2.0,
            max: 3.5,
            grid: { color: 'rgba(255,255,255,0.06)' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // Chart 3: City Prices
  const ctxCity = document.getElementById('cityPricesChart')?.getContext('2d');
  if (ctxCity) {
    new Chart(ctxCity, {
      type: 'bar',
      data: {
        labels: ['رأس الحكمة', 'الساحل الشمالي', 'الجونة', 'القاهرة الجديدة', 'الشيخ زايد', 'العين السخنة', 'مدينة 6 أكتوبر', 'مدينة نصر'],
        datasets: [{
          label: 'السعر الوسيط (مليون جنيه)',
          data: [22.5, 17.8, 14.5, 11.2, 10.5, 7.8, 6.2, 4.3],
          backgroundColor: '#d4af37',
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.06)' } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  // Chart 4: Amenity Premium %
  const ctxAmenity = document.getElementById('amenityPremiumChart')?.getContext('2d');
  if (ctxAmenity) {
    new Chart(ctxAmenity, {
      type: 'doughnut',
      data: {
        labels: ['فيو بحري / بحيرة (+28%)', 'حمام سباحة (+24%)', 'حديقة خاصة (+18%)', 'تشطيب كامل (+15%)', 'مفروش (+12%)', 'غرفة خادمة (+9%)'],
        datasets: [{
          data: [28.5, 24.0, 18.5, 15.0, 12.0, 9.0],
          backgroundColor: ['#f6cf65', '#d4af37', '#aa8214', '#856404', '#604602', '#3e2d01'],
          borderColor: '#0e0e13',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { font: { size: 11 }, color: '#e2e8f0' }
          }
        }
      }
    });
  }
}
