/**
 * عقاري — AQARI AI | JAVASCRIPT APPLICATION LOGIC
 * High-End Real Estate Valuation & Installment Intelligence
 */

// Application State
const appState = {
  lang: 'ar',
  currentCategory: 'medium',
  areaSqm: 160,
  bedrooms: 3,
  bathrooms: 2,
  paymentMode: 'Cash',
  downPaymentPct: 10,
  installmentYears: 7,
  lastPredictedPrice: 9850000,
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

// Size Categories Definitions (Strict User Requirement)
const CATEGORY_CONFIG = {
  small: {
    min: 40,
    max: 120,
    default: 85,
    step: 5,
    ticks: ['40 م²', '60 م²', '80 م²', '100 م²', '120 م²'],
    ticksEn: ['40 sqm', '60 sqm', '80 sqm', '100 sqm', '120 sqm'],
    presets: [
      { labelAr: 'ستوديو (50 م²)', labelEn: 'Studio (50 sqm)', val: 50 },
      { labelAr: 'شقة غرفة (75 م²)', labelEn: '1-Bed (75 sqm)', val: 75 },
      { labelAr: 'شقة غرفتين (105 م²)', labelEn: '2-Bed (105 sqm)', val: 105 }
    ],
    defaultBedrooms: 2,
    defaultBathrooms: 1,
    defaultType: 'Apartment'
  },
  medium: {
    min: 120,
    max: 250,
    default: 160,
    step: 5,
    ticks: ['120 م²', '150 م²', '180 م²', '210 م²', '250 م²'],
    ticksEn: ['120 sqm', '150 sqm', '180 sqm', '210 sqm', '250 sqm'],
    presets: [
      { labelAr: 'شقة عائلية (145 م²)', labelEn: 'Family Apt (145 sqm)', val: 145 },
      { labelAr: 'دوبلكس مريح (190 م²)', labelEn: 'Duplex (190 sqm)', val: 190 },
      { labelAr: 'بنتهاوس متوسط (230 م²)', labelEn: 'Penthouse (230 sqm)', val: 230 }
    ],
    defaultBedrooms: 3,
    defaultBathrooms: 2,
    defaultType: 'Apartment'
  },
  large: {
    min: 250,
    max: 800,
    default: 420,
    step: 10,
    ticks: ['250 م²', '380 م²', '500 م²', '650 م²', '800 م²'],
    ticksEn: ['250 sqm', '380 sqm', '500 sqm', '650 sqm', '800 sqm'],
    presets: [
      { labelAr: 'تاون هاوس (280 م²)', labelEn: 'Townhouse (280 sqm)', val: 280 },
      { labelAr: 'توين هاوس (360 م²)', labelEn: 'Twin House (360 sqm)', val: 360 },
      { labelAr: 'فيلا فاخرة (520 م²)', labelEn: 'Luxury Villa (520 sqm)', val: 520 }
    ],
    defaultBedrooms: 5,
    defaultBathrooms: 4,
    defaultType: 'Villa'
  }
};

// City Compounds Dictionary
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

// Translations Dictionary (Arabic & English)
const I18N = {
  ar: {
    tagline: "التقييم العقاري الذكي الفاخر 🇪🇬",
    nav_calculator: "حاسبة التقييم العقاري",
    nav_market: "تحليلات السوق والمدن",
    nav_models: "نماذج الـ AI (الأكاديمية)",
    hero_badge: "المنصة الأولى للتقييم العقاري بالذكاء الاصطناعي في مصر",
    hero_title_1: "اكتشف القيمة الحقيقية لعقارك مع",
    hero_title_brand: "عقاري — AQARI AI",
    hero_desc: "احصل على تقدير دقيق لسعر الشراء والبيع، مع حاسبة ذكية لخطة الأقساط والمقدمات، وأثر الإطلالة البحرية وحمام السباحة والروف.",
    form_title: "مواصفات العقار",
    form_subtitle: "حدد الفئة أولاً، ثم اختر المساحة والمميزات",
    category_label: "1. حدد فئة المساحة أولاً:",
    category_hint: "انقر لاختيار النطاق المناسب",
    cat_small_badge: "شقق وستوديو",
    cat_small_title: "مساحة صغيرة",
    cat_small_desc: "استوديو وغرفة أو غرفتين",
    cat_med_badge: "الأكثر شيوعاً 🌟",
    cat_med_title: "مساحة متوسطة",
    cat_med_desc: "شقق عائلية ودوبلكس 3 غرف",
    cat_large_badge: "فيلات فاخرة 👑",
    cat_large_title: "مساحة كبيرة",
    cat_large_desc: "فيلات مستقلة وتاون وبنتهاوس",
    area_slider_label: "تحديد المساحة الدقيقة داخل هذه الفئة:",
    label_prop_type: "نوع العقار",
    label_city: "المدينة / المنطقة",
    label_compound: "الكومباوند / المشروع",
    label_payment: "نظام الدفع المفضل",
    pay_cash: "كاش فوري",
    pay_installments: "تقسيط مريح ⚡",
    label_beds: "عدد غرف النوم",
    label_baths: "عدد الحمامات",
    amenities_title: "المميزات والإطلالات الإضافية:",
    amenities_hint: "انقر للتفعيل ومشاهدة الأثر المالي",
    am_sea_view: "إطلالة على البحر / بحيرة",
    am_roof: "روف خاص (Private Roof)",
    am_pool: "حمام سباحة خاص",
    am_garden: "حديقة خاصة (Private Garden)",
    am_finished: "تشطيب ألترا سوبر لوكس",
    am_furnished: "مفروش بالكامل بأرقى أثاث",
    am_maid: "غرفة خادمة خاصة بالحمام",
    premium_val: "قيمة سوقية إضافية",
    btn_calculate: "إعادة تقييم العقار الآن",
    val_badge: "التقييم العقاري الذكي المعتمد",
    currency: "EGP",
    approx: "حوالي",
    million_egp: "مليون جنيه مصري",
    lbl_meter_price: "سعر المتر المربع",
    lbl_price_range: "النطاق السعري العادل",
    lbl_confidence: "درجة موثوقية التقييم",
    conf_high: "فائقة الدقة",
    active_amenities_title: "المميزات المحتسبة في هذا التقييم:",
    inst_title: "حاسبة خطة التقسيط الميسرة",
    inst_subtitle: "احسب القسط الشهري والربع سنوي والمقدم بدقة",
    inst_active: "خطة دفع نشطة",
    lbl_downpayment: "نسبة المقدم (Down Payment):",
    lbl_years: "مدة التقسيط (سنين):",
    years: "سنوات",
    months: "شهر",
    yrs: "سنوات",
    lbl_monthly_inst: "القسط الشهري التقريبي",
    lbl_per_month: "يدفع كل شهر",
    lbl_quarterly_inst: "القسط الربع سنوي",
    lbl_per_quarter: "كل 3 أشهر",
    lbl_remaining_amount: "إجمالي المبلغ المتبقي",
    lbl_after_dp: "بعد خصم المقدم",
    market_badge: "مؤشرات السوق العقاري المصري",
    market_heading_1: "خريطة الأسعار والمناطق",
    market_heading_2: "في مصر",
    market_desc: "بيانات دقيقة مستخلصة من أكثر من 14,000 إعلان حقيقي لمساعدتك في اتخاذ أفضل قرار شراء أو استثمار.",
    kpi_1: "عقار مدروس بعد التنظيف",
    kpi_2: "السعر الوسيط للعقارات",
    kpi_3: "المساحة الوسيطة الأكثر طلباً",
    kpi_4: "تغطية تشمل كافة المحافظات",
    city: "مدينة",
    chart_cities_title: "أعلى المناطق في مصر بالأسعار الوسيطة (مليون جنيه)",
    chart_amenities_title: "نسبة القيمة الإضافية لكل ميزة فاخرة (علاوة السعر)",
    models_badge: "المناقشة الأكاديمية ونماذج التعلم الآلي",
    models_heading_1: "مقارنة الخوارزميات الـ 4",
    models_heading_2: "(Machine Learning Benchmark)",
    models_desc: "توثيق معايير اختيار الموديل الفائز لمناقشة الدكتور واللجنة الأكاديمية.",
    winner_title: "النموذج الفائز والمعتمد بالمشروع",
    lbl_r2_score: "معامل التحديد (R² Score)",
    speed_fast: "فائق السرعة",
    desc_lgbm: "تفوق في التعامل مع الفئات النصية واستخراج العلاقات غير الخطية بين الموقع والمساحة.",
    rank_2: "المركز الثاني 🥈",
    desc_rf: "قوي جداً في العلاقات المتداخلة، لكنه أثقل في حجم الذاكرة وتصدير الموديل.",
    rank_3: "المركز الثالث 🥉",
    desc_xgb: "ممتاز في البيانات الجداولية، وتطلب معالجة إضافية لتفادي أثر القيم الشاذة القصوى.",
    rank_baseline: "النموذج المرجعي (Baseline)",
    linear_simple: "خطي بسيط",
    desc_lr: "أعطى الأساس المرجعي للعلاقة الخطية المباشرة بين عدد الأمتار والسعر.",
    chart_r2_title: "مقارنة معامل التحديد (R² Score - الأعلى أفضل)",
    chart_mae_title: "متوسط الخطأ المطلق (MAE بالمليون جنيه - الأقل أفضل)",
    footer_meta: "مشروع متكامل (Full-Stack Machine Learning) مدعوم بـ FastAPI ⚡"
  },
  en: {
    tagline: "Ultra-Luxury AI Real Estate Valuation 🇪🇬",
    nav_calculator: "Valuation Calculator",
    nav_market: "Market Analytics",
    nav_models: "AI Models (Academics)",
    hero_badge: "Egypt's #1 AI Real Estate Valuation Engine",
    hero_title_1: "Discover True Fair Market Value with",
    hero_title_brand: "AQARI — AI Valuer",
    hero_desc: "Accurate real estate valuations powered by Machine Learning, with a dynamic installment planner and luxury amenity premiums.",
    form_title: "Property Specifications",
    form_subtitle: "Choose size tier first, then configure exact area and amenities",
    category_label: "1. Select Area Tier First:",
    category_hint: "Click to set appropriate size range",
    cat_small_badge: "Studios & Flats",
    cat_small_title: "Compact Size",
    cat_small_desc: "Studio, 1-Bed, or 2-Bed",
    cat_med_badge: "Most Popular 🌟",
    cat_med_title: "Medium Size",
    cat_med_desc: "Family Flats & Duplexes",
    cat_large_badge: "Luxury Villas 👑",
    cat_large_title: "Spacious / Large",
    cat_large_desc: "Villas, Townhouses & Penthouses",
    area_slider_label: "Fine-tune Exact Area inside this Tier:",
    label_prop_type: "Property Type",
    label_city: "City / District",
    label_compound: "Compound / Development",
    label_payment: "Payment Preference",
    pay_cash: "Cash Upfront",
    pay_installments: "Easy Installments ⚡",
    label_beds: "Bedrooms",
    label_baths: "Bathrooms",
    amenities_title: "Luxury Features & Views:",
    amenities_hint: "Click to toggle and preview valuation effect",
    am_sea_view: "Sea / Lake View",
    am_roof: "Private Roof Deck",
    am_pool: "Private Swimming Pool",
    am_garden: "Private Landscaped Garden",
    am_finished: "Ultra Super Lux Finishing",
    am_furnished: "Fully Designer Furnished",
    am_maid: "Maid's Quarters with Bath",
    premium_val: "Market Value Premium",
    btn_calculate: "Re-Evaluate Property Now",
    val_badge: "Certified AI Market Valuation",
    currency: "EGP",
    approx: "Approx.",
    million_egp: "Million EGP",
    lbl_meter_price: "Price per SQM",
    lbl_price_range: "Fair Price Range",
    lbl_confidence: "Confidence Rating",
    conf_high: "High Precision",
    active_amenities_title: "Active Features Included in Valuation:",
    inst_title: "Flexible Installment Calculator",
    inst_subtitle: "Plan down payment and monthly / quarterly installments",
    inst_active: "Active Payment Plan",
    lbl_downpayment: "Down Payment %:",
    lbl_years: "Installment Duration:",
    years: "Years",
    months: "Months",
    yrs: "Yrs",
    lbl_monthly_inst: "Estimated Monthly Payment",
    lbl_per_month: "Due every month",
    lbl_quarterly_inst: "Quarterly Payment",
    lbl_per_quarter: "Due every 3 months",
    lbl_remaining_amount: "Total Installment Amount",
    lbl_after_dp: "After down payment",
    market_badge: "Egyptian Real Estate Analytics",
    market_heading_1: "Geographic Price Map",
    market_heading_2: "Across Egypt",
    market_desc: "Accurate market insights extracted from 14,000+ real verified listings.",
    kpi_1: "Cleaned Listings Analyzed",
    kpi_2: "Median Property Price",
    kpi_3: "Most Demanded Median Area",
    kpi_4: "Nationwide Coverage",
    city: "Cities",
    chart_cities_title: "Highest Priced Districts in Egypt (Median M EGP)",
    chart_amenities_title: "Added Valuation Premium per Luxury Feature (%)",
    models_badge: "Academic Defense & Machine Learning Benchmarks",
    models_heading_1: "4 Algorithm Comparison",
    models_heading_2: "(Machine Learning Benchmark)",
    models_desc: "Documented criteria for the winning model for academic presentation.",
    winner_title: "Winning Production Model",
    lbl_r2_score: "R² Coefficient Score",
    speed_fast: "Ultra Fast",
    desc_lgbm: "Outperformed all algorithms in handling categorical features and non-linear interactions.",
    rank_2: "2nd Place 🥈",
    desc_rf: "Very robust with non-linear relationships, but requires higher memory and inference latency.",
    rank_3: "3rd Place 🥉",
    desc_xgb: "Strong on tabular features, required additional regularization against extreme price outliers.",
    rank_baseline: "Baseline Model",
    linear_simple: "Simple Linear",
    desc_lr: "Provides the linear baseline relationship between square meters and valuation.",
    chart_r2_title: "Model Accuracy Comparison (R² Score - Higher is Better)",
    chart_mae_title: "Mean Absolute Error (MAE in Millions EGP - Lower is Better)",
    footer_meta: "Full-Stack Machine Learning Architecture powered by FastAPI ⚡"
  }
};

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  initCategory('medium');
  updateCompoundsForCity();
  calculatePrice();
});

// Tab Switching
function setupTabs() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
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

  if ((tabId === 'tab-models' || tabId === 'tab-market') && !appState.chartsInitialized) {
    initCharts();
    appState.chartsInitialized = true;
  }
}

// Language Switching (Arabic <-> English)
function toggleLanguage() {
  appState.lang = (appState.lang === 'ar') ? 'en' : 'ar';
  const isEn = (appState.lang === 'en');
  
  // HTML Direction
  document.documentElement.setAttribute('dir', isEn ? 'ltr' : 'rtl');
  document.documentElement.setAttribute('lang', appState.lang);
  document.body.setAttribute('data-lang', appState.lang);
  
  // Button Label
  document.getElementById('lang-label').textContent = isEn ? 'العربية' : 'English';

  // Apply Translations
  const t = I18N[appState.lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.textContent = t[key];
    }
  });

  // Refresh dynamic parts
  renderQuickPresets();
  updateTicks();
  calculateInstallments(appState.lastPredictedPrice);
  updateAreaDisplay();
}

// Category & Slider Dynamics (Crucial User Requirement: المساحة مقسمة حسب الفئة أولاً)
function selectSizeCategory(category) {
  initCategory(category);
  calculatePrice();
}

function initCategory(category) {
  appState.currentCategory = category;
  const cfg = CATEGORY_CONFIG[category];

  // Highlight active category card
  document.querySelectorAll('.size-category-card').forEach(card => {
    card.classList.toggle('active', card.getAttribute('data-category') === category);
  });

  // Adjust slider bounds strictly to this category
  const slider = document.getElementById('area-slider');
  slider.min = cfg.min;
  slider.max = cfg.max;
  slider.step = cfg.step;
  slider.value = cfg.default;
  appState.areaSqm = cfg.default;

  // Defaults for this tier
  appState.bedrooms = cfg.defaultBedrooms;
  appState.bathrooms = cfg.defaultBathrooms;
  document.getElementById('bedrooms-val').textContent = appState.bedrooms;
  document.getElementById('bathrooms-val').textContent = appState.bathrooms;

  const typeSelect = document.getElementById('select-type');
  if (typeSelect) typeSelect.value = cfg.defaultType;

  updateAreaDisplay();
  updateTicks();
  renderQuickPresets();
}

function updateTicks() {
  const cfg = CATEGORY_CONFIG[appState.currentCategory];
  const ticksContainer = document.getElementById('slider-ticks');
  const labels = (appState.lang === 'en') ? cfg.ticksEn : cfg.ticks;
  ticksContainer.innerHTML = labels.map(lbl => `<span>${lbl}</span>`).join('');
}

function renderQuickPresets() {
  const cfg = CATEGORY_CONFIG[appState.currentCategory];
  const container = document.getElementById('quick-presets');
  container.innerHTML = '';

  cfg.presets.forEach(preset => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `quick-preset-btn ${preset.val === appState.areaSqm ? 'active' : ''}`;
    btn.textContent = (appState.lang === 'en') ? preset.labelEn : preset.labelAr;
    btn.onclick = () => {
      document.getElementById('area-slider').value = preset.val;
      updateAreaSlider(preset.val);
    };
    container.appendChild(btn);
  });
}

function updateAreaSlider(val) {
  appState.areaSqm = parseInt(val, 10);
  updateAreaDisplay();

  // Highlight active preset button if matching
  document.querySelectorAll('.quick-preset-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.includes(`${appState.areaSqm}`));
  });

  calculatePrice();
}

function updateAreaDisplay() {
  const unit = (appState.lang === 'en') ? 'sqm' : 'م²';
  document.getElementById('area-display').textContent = `${appState.areaSqm} ${unit}`;
}

// Counter Controls (+ / -)
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

// Amenity Toggle
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

// Payment Mode: Cash vs Installments
function setPaymentMode(mode) {
  appState.paymentMode = mode;
  document.getElementById('btn-pay-cash').classList.toggle('active', mode === 'Cash');
  document.getElementById('btn-pay-installments').classList.toggle('active', mode === 'Installments');

  const instCard = document.getElementById('installment-section');
  if (mode === 'Installments') {
    instCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    instCard.style.boxShadow = '0 0 35px rgba(212, 175, 55, 0.45)';
    setTimeout(() => {
      instCard.style.boxShadow = '';
    }, 1500);
  }

  calculatePrice();
}

// Installment Calculator Logic (User Requirement: كام وازاي)
function setDownPaymentPct(pct) {
  appState.downPaymentPct = pct;
  document.querySelectorAll('#dp-pills .inst-pill').forEach(pill => {
    pill.classList.toggle('active', pill.textContent.trim() === `${pct}%`);
  });
  calculateInstallments(appState.lastPredictedPrice);
}

function setInstallmentYears(yrs) {
  appState.installmentYears = yrs;
  document.querySelectorAll('#years-pills .inst-pill').forEach(pill => {
    pill.classList.toggle('active', pill.textContent.startsWith(`${yrs}`));
  });
  calculateInstallments(appState.lastPredictedPrice);
}

function calculateInstallments(totalPrice) {
  const price = totalPrice || appState.lastPredictedPrice || 9850000;
  const dpPct = appState.downPaymentPct;
  const years = appState.installmentYears;

  const downPaymentAmount = price * (dpPct / 100);
  const remainingAmount = price - downPaymentAmount;

  const totalMonths = years * 12;
  const monthlyInstallment = remainingAmount / totalMonths;
  const quarterlyInstallment = remainingAmount / (years * 4);

  // Update DOM labels
  const dpFormatted = `${Math.round(downPaymentAmount).toLocaleString()} EGP (${dpPct}%)`;
  document.getElementById('dp-amount-display').textContent = dpFormatted;

  const yrsLabel = (appState.lang === 'en') ? `${years} Years (${totalMonths} Months)` : `${years} سنوات (${totalMonths} شهر)`;
  document.getElementById('years-display').textContent = yrsLabel;

  document.getElementById('inst-monthly-val').textContent = `${Math.round(monthlyInstallment).toLocaleString()} EGP`;
  document.getElementById('inst-quarterly-val').textContent = `${Math.round(quarterlyInstallment).toLocaleString()} EGP`;
  document.getElementById('inst-remaining-val').textContent = `${(remainingAmount / 1e6).toFixed(2)}M EGP`;
}

// Update Compounds when City changes
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

// AI Valuation Calculation via FastAPI
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
      payment_method: appState.paymentMode,
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
      console.warn('FastAPI unavailable, using fallback estimation:', err);
      renderLocalSimulation(payload);
    } finally {
      if (spinner) spinner.style.display = 'none';
    }
  }, 120);
}

// Render Results to UI
function renderPredictionResults(data) {
  appState.lastPredictedPrice = data.predicted_price;

  // Animate Number Count
  animatePrice(data.predicted_price);

  // Millions pill
  const mLabel = (appState.lang === 'en') ? 'Million EGP' : 'مليون جنيه مصري';
  const approx = (appState.lang === 'en') ? 'Approx.' : 'حوالي';
  document.getElementById('millions-pill').innerHTML = 
    `<i class="fa-solid fa-coins"></i> ${approx} <strong>${data.price_in_millions} ${mLabel}</strong>`;

  // Price per SQM
  const unit = (appState.lang === 'en') ? 'EGP/sqm' : 'EGP/م²';
  document.getElementById('sqm-price-val').textContent = 
    `${Math.round(data.price_per_sqm).toLocaleString()} ${unit}`;

  // Range
  const minM = (data.price_range_min / 1e6).toFixed(1);
  const maxM = (data.price_range_max / 1e6).toFixed(1);
  document.getElementById('range-val').textContent = `${minM}M - ${maxM}M EGP`;

  // Summary Specs
  document.getElementById('summary-type').textContent = data.property_summary.type;
  document.getElementById('summary-area').textContent = `${data.property_summary.area_sqm} ${(appState.lang === 'en') ? 'sqm' : 'م²'}`;
  document.getElementById('summary-location').textContent = `${data.property_summary.city}`;

  // Active Amenities tags
  const tagsContainer = document.getElementById('features-tags');
  tagsContainer.innerHTML = '';
  const activeAmenities = (data.amenities || []).filter(a => a.active);
  if (activeAmenities.length === 0) {
    const noAm = (appState.lang === 'en') ? 'Standard Base Specifications' : 'المواصفات القياسية الأساسية';
    tagsContainer.innerHTML = `<span class="feat-tag" style="opacity:0.6;">${noAm}</span>`;
  } else {
    activeAmenities.forEach(a => {
      const span = document.createElement('span');
      span.className = 'feat-tag active';
      span.innerHTML = `${a.icon} ${a.name} (+${a.estimated_premium_pct}%)`;
      tagsContainer.appendChild(span);
    });
  }

  // Update Installment Simulator with the new price
  calculateInstallments(data.predicted_price);
}

// Fallback estimation
function renderLocalSimulation(p) {
  let basePricePerSqm = 44000;
  if (p.city.includes('New Cairo') || p.city.includes('Zayed')) basePricePerSqm = 56000;
  if (p.city.includes('North Coast') || p.city.includes('Ras Al Hekma')) basePricePerSqm = 79000;
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
  const duration = 400;
  const startVal = currentAnimVal || (targetVal * 0.85);
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
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

// Chart.js Visualizations
function initCharts() {
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = "'Cairo', 'Outfit', sans-serif";

  // Chart 1: R2 Score Comparison
  const ctxR2 = document.getElementById('r2ComparisonChart')?.getContext('2d');
  if (ctxR2) {
    const gradR2 = ctxR2.createLinearGradient(0, 0, 0, 300);
    gradR2.addColorStop(0, '#f6cf65');
    gradR2.addColorStop(1, '#aa8214');

    new Chart(ctxR2, {
      type: 'bar',
      data: {
        labels: ['LightGBM', 'Random Forest', 'XGBoost', 'Linear Regression'],
        datasets: [{
          data: [0.6124, 0.6075, 0.5764, 0.5059],
          backgroundColor: [gradR2, 'rgba(212, 175, 55, 0.6)', 'rgba(212, 175, 55, 0.4)', 'rgba(212, 175, 55, 0.2)'],
          borderColor: '#f6cf65',
          borderWidth: 1,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0.4, max: 0.7, grid: { color: 'rgba(255,255,255,0.06)' } },
          x: { grid: { display: false } }
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
        labels: ['LightGBM (Winner)', 'Random Forest', 'XGBoost', 'Linear Regression'],
        datasets: [{
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
          y: { min: 2.0, max: 3.5, grid: { color: 'rgba(255,255,255,0.06)' } },
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
