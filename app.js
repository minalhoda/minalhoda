/* ==========================================================================
   Aura Cafe POS — app.js
   Vanilla JS, no build step. All data is kept in this browser's localStorage.
   ========================================================================== */
'use strict';

/* ---------------------------------------------------------------- helpers */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const sum = (arr, f = (x) => x) => arr.reduce((a, x) => a + (+f(x) || 0), 0);

const KEY = 'aura-pos-v1';
const CART_KEY = 'aura-pos-cart-v1';

/* ------------------------------------------------------------------ icons */
const P_ICONS = {
  cup: '<path d="M9.5 2.8c-.9 1 .9 2 0 3.2M13.5 2.8c-.9 1 .9 2 0 3.2"/><path d="M5.2 8.5h13.6L17.2 20a1.8 1.8 0 0 1-1.8 1.5H8.6A1.8 1.8 0 0 1 6.8 20z"/><path d="M9.6 12v6.5M12 12v6.5M14.4 12v6.5"/>',
  toast: '<path d="M6.5 21V11.8A4.3 4.3 0 0 1 7.8 3.5h8.4a4.3 4.3 0 0 1 1.3 8.3V21z"/><path d="M10.8 9.5 9.8 11.5M13.6 12.6l-1 2M10.6 16.4l.6 1.2"/>',
  pitha: '<path d="M3 16.5h18"/><path d="M4.6 16.5a7.4 6.6 0 0 1 14.8 0"/><path d="M12 7.2v2.7"/><path d="M8.6 13.2c1.1.9 2.3.9 3.4 0s2.3-.9 3.4 0"/><path d="M6 19.5h12"/>',
  honey: '<path d="M8 3.5h8"/><path d="M9 3.5v2.8C6 7.6 5 10.2 5 13.6A6.4 6.4 0 0 0 11.4 20h1.2A6.4 6.4 0 0 0 19 13.6c0-3.4-1-6-4-7.3V3.5"/><path d="M9.3 14c1.6 1.4 3.8 1.4 5.4 0"/>',
  combo: '<path d="M12 3.2l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.6l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"/>',
  addon: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/>',
  cookie: '<circle cx="12" cy="12" r="8.5"/><path d="M9 9h.01M14.5 8.5h.01M15 14h.01M9.5 15h.01M12 12h.01" stroke-width="2.6"/>',
  juice: '<path d="M7 5h10l-1.5 15.2a1.5 1.5 0 0 1-1.5 1.3h-4a1.5 1.5 0 0 1-1.5-1.3z"/><path d="M7.5 9.5h9"/><path d="M13.5 5l2-3"/>',
  cake: '<path d="M4 20h16"/><path d="M5 20v-6.5A1.5 1.5 0 0 1 6.5 12h11a1.5 1.5 0 0 1 1.5 1.5V20"/><path d="M5 15.5c1.2 1 2.3 1 3.5 0s2.3-1 3.5 0 2.3 1 3.5 0 2.3-1 3.5 0"/><path d="M12 12V8.5"/><path d="M12 5c.8.9.8 1.8 0 2.4-.8-.6-.8-1.5 0-2.4z"/>',
  bowl: '<path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0z"/><path d="M8 20.5h8"/><path d="M9 3.5c-.8 1 .8 2 0 3.5M13 3.5c-.8 1 .8 2 0 3.5"/>',
  heart: '<path d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z"/>',
};
const UI = {
  pos: '<path d="M3 4h2.2l2.3 11.2a1.5 1.5 0 0 0 1.5 1.2h8.3a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6.1"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/>',
  dashboard: '<rect x="3.5" y="3.5" width="7" height="8" rx="2"/><rect x="13.5" y="3.5" width="7" height="5" rx="2"/><rect x="13.5" y="11.5" width="7" height="9" rx="2"/><rect x="3.5" y="14.5" width="7" height="6" rx="2"/>',
  sales: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M8 17v-2M12 17v-4.5M16 17v-3"/>',
  products: '<path d="M3.5 12.6V5A1.5 1.5 0 0 1 5 3.5h7.6a1.5 1.5 0 0 1 1 .44l7.5 7.5a1.5 1.5 0 0 1 0 2.12l-7.6 7.6a1.5 1.5 0 0 1-2.12 0l-7.5-7.5a1.5 1.5 0 0 1-.38-1.06z"/><circle cx="8.5" cy="8.5" r="1.5"/>',
  settings: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 12.5a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4l1-12.5"/><path d="M10 11v6M14 11v6"/>',
  edit: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/><path d="m14.5 7.5 3 3"/>',
  print: '<path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/>',
  receipt: '<path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
  mobile: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/>',
  user: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M4.5 20h15"/>',
  upload: '<path d="M12 15.5V4.5M7 9l5-5 5 5M4.5 20h15"/>',
  chevL: '<path d="m15 5-7 7 7 7"/>',
  chevR: '<path d="m9 5 7 7-7 7"/>',
  chevD: '<path d="m6 9 6 6 6-6"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  bag: '<path d="M5.5 8h13l-1 12a1.5 1.5 0 0 1-1.5 1.4H8a1.5 1.5 0 0 1-1.5-1.4z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/>',
  trend: '<path d="M3.5 17 9 11.5l4 4 7.5-8"/><path d="M15 7.5h5.5V13"/>',
  coins: '<ellipse cx="12" cy="6.5" rx="7" ry="3"/><path d="M5 6.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/><path d="M5 11.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.3"/><circle cx="17" cy="17" r="2.3"/>',
  wand: '<path d="m4 20 11-11"/><path d="M14.5 3.5v3M13 5h3M19.5 8.5v3M18 10h3M17 14.5v2M16 15.5h2"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  note: '<path d="M5 3.5h14v17H5z"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>',
  layers: '<path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8z"/><path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5"/>',
};
const svg = (paths, cls = '', sw = 1.7) =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const ui = (n, cls) => svg(UI[n] || '', cls);
const picon = (n, cls) => svg(P_ICONS[n] || P_ICONS.cup, cls);

/* ------------------------------------------------------------ brand data */
const COLORS = [
  { hex: '#F3E3C3', name: 'Malai Cream', ink: '#7E512F' },
  { hex: '#C18D53', name: 'Caramel Cup', ink: '#FFF8EE' },
  { hex: '#F6B92B', name: 'Honey Glow', ink: '#311F11' },
  { hex: '#9A5B2B', name: 'Toast Brown', ink: '#FFF8EE' },
  { hex: '#C8553D', name: 'Gur Terracotta', ink: '#FFF8EE' },
  { hex: '#EDB26B', name: 'Chai Gold', ink: '#311F11' },
  { hex: '#7E512F', name: 'Clay Brown', ink: '#F6DDB8' },
  { hex: '#311F11', name: 'Espresso Night', ink: '#EDB26B' },
];
const inkFor = (hex) => (COLORS.find((c) => c.hex.toLowerCase() === String(hex).toLowerCase()) || COLORS[0]).ink;

const PAY = {
  cash: { bn: 'ক্যাশ', icon: 'cash' },
  bkash: { bn: 'বিকাশ', icon: 'mobile' },
  nagad: { bn: 'নগদ', icon: 'mobile' },
  card: { bn: 'কার্ড', icon: 'card' },
};

const OFFERS = [
  { id: 'student', label: 'Student Tuesday', short: '−১০%', type: 'pct', value: 10 },
  { id: 'story', label: 'Story Tag', short: '−৫৳', type: 'amt', value: 5 },
  { id: 'rainy', label: 'Rainy Day', short: '−৫৳', type: 'amt', value: 5 },
];

function seed() {
  const p = (id, cat, name, en, price, large, cost, color, icon, extra = {}) =>
    ({ id, cat, name, en, price, large: large || null, cost: cost || 0, color, icon, active: true, best: false, desc: '', ...extra });
  return {
    v: 1,
    settings: {
      shopName: 'Aura Cafe',
      tagline: 'A Little Place – A Better Mood',
      address: 'আপনার ঠিকানা, এলাকা, শহর',
      phone: '+880 1XXX-XXXXXX',
      social: '@auracafe',
      footer: 'আবার এসো, মুড ভালো রেখো!',
      vat: 0,
      digits: 'bn',
      printFormat: 'a5',
      autoPrint: false,
      nextNo: 1,
    },
    categories: [
      { id: 'cha', name: 'চা', en: 'Cha' },
      { id: 'bites', name: 'নাস্তা', en: 'Bites' },
      { id: 'combo', name: 'কম্বো', en: 'Combo' },
      { id: 'addon', name: 'অ্যাড-অন', en: 'Add-on' },
    ],
    products: [
      p('dudh', 'cha', 'দুধ চা', 'Classic Dudh', 20, 30, 10, '#C18D53', 'cup', { desc: 'গরুর খাঁটি দুধ, কড়া লিকার' }),
      p('modhu', 'cha', 'মধু চা', 'Honey Aura', 35, 45, 17, '#F6B92B', 'honey', { desc: 'লাল চা, খাঁটি মধু, আদা ও লেবু' }),
      p('malai', 'cha', 'মালাই চা', 'Malai Mood', 45, 55, 22, '#F3E3C3', 'cup', { best: true, desc: 'ঘন জ্বাল দেওয়া দুধের চা, উপরে তাজা মালাই' }),
      p('toast', 'bites', 'পোড়া পাউরুটি', 'Pora Toast', 25, null, 11, '#9A5B2B', 'toast', { desc: 'কয়লা/তাওয়ায় সেঁকা, মাখন আর চিনি' }),
      p('htoast', 'bites', 'মধু-মাখন পাউরুটি', 'Honey Butter Toast', 35, null, 17, '#9A5B2B', 'toast'),
      p('bhapa', 'bites', 'ভাপা পিঠা', 'Bhapa Love', 25, null, 14, '#C8553D', 'pitha', { desc: 'চালের গুঁড়া, খেজুর গুড় আর নারকেল' }),
      p('bhapasp', 'bites', 'ভাপা পিঠা স্পেশাল', 'Bhapa Special', 35, null, 18, '#C8553D', 'pitha', { desc: 'ডাবল গুড় + ডাবল নারকেল' }),
      p('c-study', 'combo', 'স্টাডি ব্রেক', 'Study Break', 40, null, 21, '#311F11', 'combo', { desc: 'দুধ চা + পোড়া পাউরুটি' }),
      p('c-winter', 'combo', 'উইন্টার মুড', 'Winter Mood', 65, null, 36, '#EDB26B', 'combo', { desc: 'মালাই চা + ভাপা পিঠা' }),
      p('c-honey', 'combo', 'হানি হাগ', 'Honey Hug', 55, null, 31, '#F6B92B', 'combo', { desc: 'মধু চা + ভাপা পিঠা' }),
      p('c-squad', 'combo', 'স্কোয়াড প্যাক', 'Squad Pack', 160, null, 90, '#C8553D', 'combo', { desc: '৪ চা + ২ পাউরুটি + ২ পিঠা' }),
      p('a-malai', 'addon', 'এক্সট্রা মালাই', 'Extra Malai', 10, null, 5, '#F3E3C3', 'addon'),
      p('a-modhu', 'addon', 'এক্সট্রা মধু', 'Extra Honey', 10, null, 5, '#F6B92B', 'addon'),
      p('a-makhon', 'addon', 'ডাবল মাখন', 'Double Butter', 10, null, 5, '#EDB26B', 'addon'),
    ],
    orders: [],
    token: { day: '', n: 0 },
  };
}

/* ------------------------------------------------------------------ store */
let S;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch { S = null; }
if (!S || !S.products) S = seed();
S.settings = { ...seed().settings, ...S.settings };
const save = () => {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('সেভ করা যায়নি — ব্রাউজারের স্টোরেজ ভর্তি', 'x'); }
};

let cart;
try { cart = JSON.parse(localStorage.getItem(CART_KEY)); } catch { cart = null; }
if (!cart || !Array.isArray(cart.lines)) cart = { lines: [], discount: null };
const saveCart = () => localStorage.setItem(CART_KEY, JSON.stringify(cart));

/* UI state (not persisted) */
const st = {
  view: 'pos',
  cat: 'all',
  q: '',
  dashRange: 'today',
  salesDay: null,
  prodCat: 'all',
  prodQ: '',
  co: null,
};

/* ------------------------------------------------------- number & dates */
const BN_D = '০১২৩৪৫৬৭৮৯';
const bn = (s) => (S.settings.digits === 'bn' ? String(s).replace(/\d/g, (d) => BN_D[d]) : String(s));
const fmtN = (n) => bn(Math.round(+n || 0).toLocaleString('en-IN'));
const money = (n) => `${fmtN(n)}৳`;
const compact = (n) => {
  n = Math.round(n);
  if (n >= 100000) return bn((n / 100000).toFixed(n >= 1000000 ? 0 : 1).replace(/\.0$/, '')) + (S.settings.digits === 'bn' ? ' লাখ' : 'L');
  if (n >= 1000) return bn((n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')) + 'k';
  return bn(n);
};
const pad = (n, l = 2) => String(n).padStart(l, '0');
const dayKey = (d = new Date()) => { d = new Date(d); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = fromKey(k); d.setDate(d.getDate() + n); return dayKey(d); };
const MONTHS_BN = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
const isBn = () => S.settings.digits === 'bn';
const fmtDate = (k) => { const d = fromKey(k); return isBn() ? `${bn(d.getDate())} ${MONTHS_BN[d.getMonth()]} ${bn(d.getFullYear())}` : `${d.getDate()} ${MONTHS_EN[d.getMonth()]} ${d.getFullYear()}`; };
const fmtDateShort = (k) => { const d = fromKey(k); return isBn() ? `${bn(d.getDate())} ${MONTHS_BN[d.getMonth()].slice(0, 3)}` : `${d.getDate()} ${MONTHS_EN[d.getMonth()]}`; };
const weekday = (k) => DAYS_BN[fromKey(k).getDay()];
const fmtTime = (ts) => {
  const d = new Date(ts); const h = d.getHours(); const m = pad(d.getMinutes()); const h12 = h % 12 || 12;
  if (!isBn()) return `${h12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
  const part = h < 5 ? 'রাত' : h < 12 ? 'সকাল' : h < 15 ? 'দুপুর' : h < 18 ? 'বিকাল' : h < 20 ? 'সন্ধ্যা' : 'রাত';
  return `${part} ${bn(h12)}:${bn(m)}`;
};
const hourLabel = (h) => { const h12 = h % 12 || 12; return isBn() ? bn(h12) + (h < 12 ? 'স' : 'বি') : `${h12}${h < 12 ? 'a' : 'p'}`; };
const orderNo = (o) => '#' + pad(o.no, 4);

/* --------------------------------------------------------------- lookups */
const prodById = (id) => S.products.find((p) => p.id === id);
const catById = (id) => S.categories.find((c) => c.id === id);
const paidOrders = () => S.orders.filter((o) => o.status !== 'void');
const ordersOn = (k) => S.orders.filter((o) => o.day === k);

/* ------------------------------------------------------------- cart math */
function calc(lines = cart.lines, discount = cart.discount) {
  const subtotal = sum(lines, (l) => l.price * l.qty);
  let discAmt = 0;
  if (discount && subtotal > 0) {
    discAmt = discount.type === 'pct' ? Math.round((subtotal * discount.value) / 100) : Math.min(discount.value, subtotal);
  }
  const after = subtotal - discAmt;
  const vatPct = +S.settings.vat || 0;
  const vat = Math.round((after * vatPct) / 100);
  return { subtotal, discAmt, vat, vatPct, total: after + vat, items: sum(lines, (l) => l.qty) };
}

function peekToken() {
  const today = dayKey();
  return S.token.day === today ? (S.token.n % 99) + 1 : 1;
}

/* ================================================================ RENDER */
const NAV = [
  { id: 'pos', bn: 'বিক্রি', icon: 'pos', key: '1' },
  { id: 'dashboard', bn: 'ড্যাশবোর্ড', icon: 'dashboard', key: '2' },
  { id: 'sales', bn: 'দৈনিক বিক্রি', short: 'দৈনিক', icon: 'sales', key: '3' },
  { id: 'products', bn: 'প্রোডাক্ট', icon: 'products', key: '4' },
  { id: 'settings', bn: 'সেটিংস', icon: 'settings', key: '5' },
];

function renderNav() {
  $('#side-nav').innerHTML = NAV.map((n) =>
    `<button class="nav-item ${st.view === n.id ? 'active' : ''}" data-act="go" data-v="${n.id}">${ui(n.icon)}<span>${n.bn}</span><span class="kbd">Alt ${n.key}</span></button>`).join('');
  $('#tab-nav').innerHTML = NAV.map((n) =>
    `<button class="tab-item ${st.view === n.id ? 'active' : ''}" data-act="go" data-v="${n.id}">${ui(n.icon)}<span>${n.short || n.bn}</span></button>`).join('');
}

function setHeader(title, sub, actions = '') {
  $('#page-title').textContent = title;
  $('#page-sub').innerHTML = sub || '';
  $('#topbar-actions').innerHTML = actions;
}

function go(v) {
  if (!NAV.some((n) => n.id === v)) v = 'pos';
  st.view = v;
  if (location.hash !== '#' + v) history.replaceState(null, '', '#' + v);
  render();
}

function render() {
  renderNav();
  const view = $('#view');
  view.className = 'view';
  view.scrollTop = 0;
  ({ pos: viewPOS, dashboard: viewDashboard, sales: viewSales, products: viewProducts, settings: viewSettings })[st.view]();
}

/* =================================================================== POS */
function viewPOS() {
  const view = $('#view');
  view.classList.add('pos-mode');
  setHeader('বিক্রি', `${weekday(dayKey())}, ${fmtDate(dayKey())} · আজ ${fmtN(ordersOn(dayKey()).filter((o) => o.status !== 'void').length)}টি অর্ডার`,
    `<button class="btn btn-ghost" data-act="go" data-v="dashboard">${ui('dashboard')}<span class="btn-label">ড্যাশবোর্ড</span></button>`);
  const active = S.products.filter((p) => p.active);
  const chips = [{ id: 'all', name: 'সব' }, ...S.categories, { id: 'best', name: '★ বেস্টসেলার' }]
    .filter((c) => c.id === 'all' || c.id === 'best' ? (c.id !== 'best' || active.some((p) => p.best)) : active.some((p) => p.cat === c.id))
    .map((c) => {
      const n = c.id === 'all' ? active.length : c.id === 'best' ? active.filter((p) => p.best).length : active.filter((p) => p.cat === c.id).length;
      return `<button class="chip ${st.cat === c.id ? 'active' : ''}" data-act="cat" data-c="${c.id}">${esc(c.name)} <span class="count">${bn(n)}</span></button>`;
    }).join('');
  view.innerHTML = `
    <div class="pos">
      <div class="pos-menu">
        <div class="pos-toolbar">
          <div class="search">${ui('search')}<input id="pos-q" class="input" placeholder="প্রোডাক্ট খুঁজুন… (Enter = যোগ)" value="${esc(st.q)}" autocomplete="off" /><span class="kbd-hint">/</span></div>
          <button class="btn btn-ghost" data-act="customItem" title="কাস্টম আইটেম">${ui('plus')}<span class="hide-sm">কাস্টম</span></button>
        </div>
        <div class="chips">${chips}</div>
        <div class="pos-grid-wrap" id="pos-grid"></div>
      </div>
      <aside class="cart" id="cart"></aside>
    </div>
    <div class="sheet-backdrop" id="sheet-bd" data-act="closeCart"></div>
    <button class="cart-fab" id="cart-fab" data-act="openCart"></button>`;
  renderGrid();
  renderCart();
}

function pcardHTML(p, inCart = 0) {
  const ink = inkFor(p.color);
  const sizes = p.large
    ? `<div class="pc-sizes">
         <button class="pc-size" data-act="add" data-id="${p.id}" data-size="R">রেগুলার<b>${money(p.price)}</b></button>
         <button class="pc-size lg" data-act="add" data-id="${p.id}" data-size="L">বড়<b>${money(p.large)}</b></button>
       </div>`
    : `<div class="pc-price">${money(p.price)}</div>`;
  return `
    <div class="pcard" role="button" tabindex="0" data-act="add" data-id="${p.id}" data-size="R" id="pc-${p.id}">
      <div class="pc-top" style="background:${p.color};color:${ink}">${picon(p.icon)}
        ${p.best ? '<span class="badge red pc-best">BESTSELLER</span>' : ''}
        ${inCart ? `<span class="pc-qty">${bn(inCart)}</span>` : ''}
      </div>
      <div class="pc-body">
        <div class="pc-name">${esc(p.name)}</div>
        ${p.en ? `<div class="pc-en">${esc(p.en)}</div>` : ''}
        ${sizes}
      </div>
    </div>`;
}

function filteredPOSProducts() {
  const q = st.q.trim().toLowerCase();
  let list = S.products.filter((p) => p.active);
  if (st.cat === 'best') list = list.filter((p) => p.best);
  else if (st.cat !== 'all') list = list.filter((p) => p.cat === st.cat);
  if (q) list = list.filter((p) => (p.name + ' ' + (p.en || '') + ' ' + (p.desc || '')).toLowerCase().includes(q));
  return list;
}

function renderGrid() {
  const wrap = $('#pos-grid');
  if (!wrap) return;
  const list = filteredPOSProducts();
  const qtyOf = (id) => sum(cart.lines.filter((l) => l.pid === id), (l) => l.qty);
  const custom = `<button class="pcard custom" data-act="customItem">${ui('plus')}<span>কাস্টম আইটেম<br><small class="muted">নাম ও দাম দিয়ে যোগ করুন</small></span></button>`;
  if (!list.length) {
    wrap.innerHTML = `<div class="empty"><img src="assets/glass.png" alt=""><h4>কিছু পাওয়া যায়নি</h4><p>অন্য নামে খুঁজুন, অথবা কাস্টম আইটেম যোগ করুন।</p></div><div class="pos-grid" style="max-width:220px;margin:0 auto">${custom}</div>`;
    return;
  }
  if (st.cat === 'all' && !st.q.trim()) {
    wrap.innerHTML = S.categories.map((c) => {
      const items = list.filter((p) => p.cat === c.id);
      if (!items.length) return '';
      return `<div class="pos-section-title"><h4>${esc(c.name)}</h4><span class="eyebrow">${esc(c.en || '')}</span></div>
              <div class="pos-grid">${items.map((p) => pcardHTML(p, qtyOf(p.id))).join('')}</div>`;
    }).join('') + `<div class="pos-section-title"><h4>অন্যান্য</h4></div><div class="pos-grid">${custom}</div>`;
  } else {
    wrap.innerHTML = `<div class="pos-grid">${list.map((p) => pcardHTML(p, qtyOf(p.id))).join('')}${custom}</div>`;
  }
}

function renderCart() {
  const el = $('#cart');
  if (!el) return;
  const c = calc();
  const token = peekToken();
  const lines = cart.lines.map((l, i) => `
    <div class="cart-line">
      <div class="p-ico" style="background:${l.color};color:${inkFor(l.color)}">${picon(l.icon)}</div>
      <div class="cl-info">
        <div class="cl-name">${esc(l.name)}${l.size === 'L' ? ' <span class="badge dark">বড়</span>' : ''}</div>
        <div class="cl-meta">${money(l.price)} × ${bn(l.qty)}</div>
      </div>
      <div class="stepper">
        <button data-act="dec" data-i="${i}" aria-label="কমান">${ui(l.qty === 1 ? 'trash' : 'minus')}</button>
        <span>${bn(l.qty)}</span>
        <button data-act="inc" data-i="${i}" aria-label="বাড়ান">${ui('plus')}</button>
      </div>
      <div class="cl-total">${money(l.price * l.qty)}</div>
    </div>`).join('');

  const d = cart.discount;
  const discChips = OFFERS.map((o) => `<button class="disc-chip ${d && d.id === o.id ? 'active' : ''}" data-act="disc" data-d="${o.id}">${o.label} ${o.short}</button>`).join('')
    + `<button class="disc-chip ${d && d.id === 'custom' ? 'active' : ''}" data-act="disc" data-d="custom">${d && d.id === 'custom' ? esc(d.label) : '+ কাস্টম ছাড়'}</button>`;

  el.innerHTML = `
    <div class="cart-head">
      <div>
        <h3>চলতি অর্ডার</h3>
        <div class="sub">${orderNo({ no: S.settings.nextNo })} · ${bn(c.items)} আইটেম</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        ${cart.lines.length ? `<button class="icon-btn" data-act="clearCart" title="অর্ডার খালি করুন">${ui('trash')}</button>` : ''}
        <div class="token"><div><b>${bn(pad(token))}</b><small>TOKEN</small></div></div>
      </div>
    </div>
    <div class="cart-lines">
      ${lines || `<div class="cart-empty"><img src="assets/glass.png" alt=""><h4>অর্ডার খালি</h4><div>বাম পাশ থেকে প্রোডাক্টে ট্যাপ করুন।<br>চা খাবি? চল Aura-তে।</div></div>`}
    </div>
    <div class="cart-foot">
      <div class="disc-row">${discChips}</div>
      <div class="sum-row"><span>সাবটোটাল</span><b>${money(c.subtotal)}</b></div>
      ${c.discAmt ? `<div class="sum-row disc"><span>ছাড় · ${esc(d.label)}</span><b>−${money(c.discAmt)}</b></div>` : ''}
      ${c.vatPct ? `<div class="sum-row"><span>ভ্যাট ${bn(c.vatPct)}%</span><b>${money(c.vat)}</b></div>` : ''}
      <div class="sum-total"><span>মোট</span><b>${money(c.total)}</b></div>
      <button class="btn btn-gold btn-block charge-btn" data-act="checkout" ${cart.lines.length ? '' : 'disabled'}>
        <span>চার্জ করুন <kbd>Ctrl+Enter</kbd></span><span class="amt">${money(c.total)}</span>
      </button>
    </div>`;

  const fab = $('#cart-fab');
  if (fab) {
    fab.classList.toggle('empty', !cart.lines.length);
    fab.innerHTML = `<span class="l"><span class="cnt">${bn(c.items)}</span>অর্ডার দেখুন</span><span class="r">${money(c.total)} ${ui('arrowR')}</span>`;
  }
}

function addToCart(pid, size = 'R', flash = true) {
  const p = prodById(pid);
  if (!p) return;
  if (size === 'L' && !p.large) size = 'R';
  const key = pid + '|' + size;
  const line = cart.lines.find((l) => l.key === key);
  if (line) line.qty++;
  else cart.lines.push({
    key, pid, size, qty: 1,
    name: p.name, en: p.en || '', cat: p.cat,
    price: size === 'L' ? +p.large : +p.price,
    cost: +p.cost || 0,
    color: p.color, icon: p.icon,
  });
  saveCart();
  renderCart();
  renderGrid();
  if (flash) { const c = $('#pc-' + pid); if (c) { c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash'); } }
}

/* ============================================================ CHECKOUT */
function openCheckout() {
  if (!cart.lines.length) return;
  closeCart();
  const c = calc();
  st.co = { method: 'cash', received: '', name: '', phone: '', note: '' };
  const quick = [...new Set([c.total, Math.ceil(c.total / 10) * 10, Math.ceil(c.total / 50) * 50, Math.ceil(c.total / 100) * 100, 500, 1000])]
    .filter((v) => v >= c.total).slice(0, 5);
  const fmt = S.settings.printFormat;
  openModal(`
    <div class="modal-head"><h3>পেমেন্ট</h3><button class="icon-btn" data-act="closeModal">${ui('x')}</button></div>
    <div class="modal-body">
      <div class="co-total">
        <div><div class="l">মোট বিল · ${bn(c.items)} আইটেম</div><div class="v">${money(c.total)}</div></div>
        <div class="token"><div><b>${bn(pad(peekToken()))}</b><small>TOKEN</small></div></div>
      </div>
      <div class="pay-methods">
        ${Object.entries(PAY).map(([k, v]) => `<button class="pay-m ${k === 'cash' ? 'active' : ''}" data-act="payMethod" data-m="${k}">${ui(v.icon)}${v.bn}</button>`).join('')}
      </div>
      <div id="cash-area">
        <div class="field">
          <label for="co-recv">কাস্টমার দিয়েছে</label>
          <input id="co-recv" class="input cash-input" type="number" inputmode="numeric" min="0" placeholder="${c.total}" />
        </div>
        <div class="quick-cash">${quick.map((v) => `<button data-act="quickCash" data-v="${v}">${money(v)}</button>`).join('')}</div>
        <div class="change-box" id="change-box"><span>ফেরত দিতে হবে</span><b>${money(0)}</b></div>
      </div>
      <details class="more">
        <summary>${ui('user')} কাস্টমারের তথ্য ও নোট (ঐচ্ছিক) ${ui('chevD')}</summary>
        <div class="form-grid">
          <div class="field"><label>নাম</label><input id="co-name" class="input" placeholder="যেমন: রাফি" /></div>
          <div class="field"><label>ফোন</label><input id="co-phone" class="input" inputmode="tel" placeholder="01XXXXXXXXX" /></div>
          <div class="field full"><label>নোট</label><input id="co-note" class="input" placeholder="যেমন: চিনি কম" /></div>
        </div>
      </details>
    </div>
    <div class="modal-foot">
      <button class="btn btn-ghost" data-act="complete" data-print="none">${ui('check')} শুধু সম্পন্ন</button>
      <button class="btn btn-ghost" data-act="complete" data-print="${fmt === 'a5' ? 'thermal' : 'a5'}">${ui(fmt === 'a5' ? 'receipt' : 'print')} ${fmt === 'a5' ? 'রসিদ (৮০মিমি)' : 'ইনভয়েস (A5)'}</button>
      <button class="btn btn-primary" data-act="complete" data-print="${fmt}" id="co-main">${ui(fmt === 'a5' ? 'print' : 'receipt')} সম্পন্ন ও প্রিন্ট <kbd style="opacity:.6;font-size:10px;font-family:Poppins">Enter</kbd></button>
    </div>`, '', () => { st.co = null; });
  const recv = $('#co-recv');
  recv.addEventListener('input', updateChange);
  setTimeout(() => recv.focus(), 60);
  updateChange();
}

function updateChange() {
  const c = calc();
  const box = $('#change-box');
  if (!box) return;
  const raw = $('#co-recv').value;
  const r = raw === '' ? c.total : +raw;
  const ch = r - c.total;
  box.classList.toggle('bad', ch < 0);
  box.innerHTML = ch < 0 ? `<span>আরও লাগবে</span><b>${money(-ch)}</b>` : `<span>ফেরত দিতে হবে</span><b>${money(ch)}</b>`;
}

function completeOrder(printFmt) {
  if (!cart.lines.length) return;
  const c = calc();
  const method = st.co?.method || 'cash';
  let received = c.total;
  if (method === 'cash') {
    const raw = $('#co-recv')?.value;
    received = raw === '' || raw == null ? c.total : +raw;
    if (received < c.total) { toast('টাকা কম দিয়েছে — আগে পুরো টাকা নিন', 'x'); $('#co-recv')?.focus(); return; }
  }
  const today = dayKey();
  if (S.token.day !== today) S.token = { day: today, n: 0 };
  S.token.n = (S.token.n % 99) + 1;
  const order = {
    id: uid(),
    no: S.settings.nextNo++,
    token: S.token.n,
    ts: Date.now(),
    day: today,
    items: cart.lines.map(({ pid, name, en, cat, size, price, cost, qty, color, icon }) => ({ pid, name, en, cat, size, price, cost, qty, color, icon })),
    subtotal: c.subtotal,
    discount: c.discAmt ? { label: cart.discount.label, amt: c.discAmt } : null,
    vat: c.vat, vatPct: c.vatPct,
    total: c.total,
    payment: method,
    received, change: received - c.total,
    customer: { name: ($('#co-name')?.value || '').trim(), phone: ($('#co-phone')?.value || '').trim() },
    note: ($('#co-note')?.value || '').trim(),
    status: 'paid',
  };
  S.orders.push(order);
  save();
  cart = { lines: [], discount: null };
  saveCart();
  closeModal(true);
  if (st.view === 'pos') { renderCart(); renderGrid(); setHeader('বিক্রি', `${weekday(today)}, ${fmtDate(today)} · আজ ${fmtN(ordersOn(today).filter((o) => o.status !== 'void').length)}টি অর্ডার`, $('#topbar-actions').innerHTML); }
  showOrder(order, true);
  if (printFmt && printFmt !== 'none') setTimeout(() => printOrder(order, printFmt), 250);
}

/* ======================================================== ORDER / INVOICE */
function showOrder(order, justDone = false) {
  const head = justDone
    ? `<div class="success-head"><div class="success-check">${ui('check')}</div><h3>অর্ডার সম্পন্ন!</h3>
        <p>${orderNo(order)} · টোকেন <b>${bn(pad(order.token))}</b> · ${PAY[order.payment].bn} ${order.change > 0 ? `· ফেরত <b>${money(order.change)}</b>` : ''}</p></div>`
    : '';
  openModal(`
    <div class="modal-head"><h3>${justDone ? '' : 'অর্ডার ' + orderNo(order)}</h3><button class="icon-btn" data-act="closeModal">${ui('x')}</button></div>
    <div class="modal-body">
      ${head}
      ${order.status === 'void' ? '<div class="change-box bad" style="margin:0 0 12px"><span>এই অর্ডারটি বাতিল করা হয়েছে</span></div>' : ''}
      <div class="inv-preview-wrap" id="inv-wrap"><div class="inv-preview" id="inv-prev">${invoiceHTML(order)}</div></div>
    </div>
    <div class="modal-foot">
      ${!justDone ? (order.status === 'void'
        ? `<button class="btn btn-ghost" data-act="restoreOrder" data-id="${order.id}">${ui('undo')} ফিরিয়ে আনুন</button>`
        : `<button class="btn btn-danger" data-act="voidOrder" data-id="${order.id}">${ui('trash')} বাতিল</button>`) : ''}
      <button class="btn btn-ghost" data-act="printOrder" data-id="${order.id}" data-f="thermal">${ui('receipt')} রসিদ ৮০মিমি</button>
      <button class="btn ${justDone ? 'btn-ghost' : 'btn-primary'}" data-act="printOrder" data-id="${order.id}" data-f="a5">${ui('print')} ইনভয়েস প্রিন্ট</button>
      ${justDone ? `<button class="btn btn-gold" data-act="newOrder">${ui('plus')} নতুন অর্ডার</button>` : ''}
    </div>`, 'wide');
  fitPreview();
}

function fitPreview() {
  const wrap = $('#inv-wrap'), prev = $('#inv-prev');
  if (!wrap || !prev) return;
  requestAnimationFrame(() => {
    const inv = prev.firstElementChild;
    const w = inv.offsetWidth, h = inv.offsetHeight;
    if (!w) return;
    const avail = wrap.clientWidth - 36;
    const s = Math.min(1, avail / w);
    prev.style.transform = `scale(${s})`;
    prev.style.width = w + 'px';
    prev.style.height = h + 'px';
    prev.style.marginLeft = `${(wrap.clientWidth - w * s) / 2}px`;
    prev.style.marginBottom = `${-(h * (1 - s))}px`;
  });
}

function invoiceHTML(o) {
  const s = S.settings;
  const rows = o.items.map((it, i) => `
    <tr>
      <td class="num">${bn(pad(i + 1))}</td>
      <td><div class="it"><span class="dot" style="background:${it.color}"></span><div><b>${esc(it.name)}${it.size === 'L' ? ' (বড়)' : ''}</b>${it.en ? `<small>${esc(it.en)}</small>` : ''}</div></div></td>
      <td class="r num">${money(it.price)}</td>
      <td class="c num">${bn(it.qty)}</td>
      <td class="r num"><b>${money(it.price * it.qty)}</b></td>
    </tr>`).join('');
  const cust = o.customer?.name || o.customer?.phone
    ? `<b>${esc(o.customer.name || 'কাস্টমার')}</b><br>${esc(o.customer.phone || '')}`
    : '<b>ওয়াক-ইন কাস্টমার</b><br><span style="color:#9B8670">Walk-in Guest</span>';
  return `
  <div class="inv">
    <div class="inv-head">
      <div><img class="logo" src="assets/logo-reverse.png" alt="Aura Cafe"></div>
      <div class="ttl"><div class="t1">INVOICE</div><div class="t2">ইনভয়েস</div><div class="t3">${orderNo(o)}</div></div>
    </div>
    <div class="inv-strip"></div>
    <div class="inv-meta">
      <div><div class="m-l">Date · তারিখ</div><div class="m-v">${fmtDate(o.day)}</div></div>
      <div><div class="m-l">Time · সময়</div><div class="m-v">${fmtTime(o.ts)}</div></div>
      <div><div class="m-l">Payment · পেমেন্ট</div><div class="m-v">${PAY[o.payment]?.bn || o.payment}</div></div>
      <div class="inv-token"><div><b>${bn(pad(o.token))}</b><small>TOKEN</small></div></div>
    </div>
    <div class="inv-parties">
      <div class="inv-party"><div class="p-l">Billed to · কাস্টমার</div>${cust}</div>
      <div class="inv-party"><div class="p-l">From · দোকান</div><b>${esc(s.shopName)}</b><br>${esc(s.address)}<br><span class="en">${esc(s.phone)}</span></div>
    </div>
    <table class="inv-table">
      <thead><tr><th style="width:7mm">#</th><th>Item · আইটেম</th><th class="r">Price</th><th class="c">Qty</th><th class="r">Total</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="inv-bottom">
      <div class="inv-pay">
        <div class="p-l">Payment details</div>
        ${PAY[o.payment]?.bn || ''} · প্রাপ্ত ${money(o.received)}${o.change > 0 ? ` · ফেরত ${money(o.change)}` : ''}
        ${o.note ? `<div style="margin-top:1.5mm"><b>নোট:</b> ${esc(o.note)}</div>` : ''}
        <div><span class="stamp ${o.status === 'void' ? 'void' : ''}">${o.status === 'void' ? 'VOID' : 'PAID ✓'}</span></div>
      </div>
      <div class="inv-sums">
        <div class="s"><span>সাবটোটাল</span><b>${money(o.subtotal)}</b></div>
        ${o.discount ? `<div class="s disc"><span>ছাড় · ${esc(o.discount.label)}</span><b>−${money(o.discount.amt)}</b></div>` : ''}
        ${o.vatPct ? `<div class="s"><span>ভ্যাট ${bn(o.vatPct)}%</span><b>${money(o.vat)}</b></div>` : ''}
        <div class="inv-grand"><span>সর্বমোট</span><b>${money(o.total)}</b></div>
      </div>
    </div>
    <div class="inv-foot">
      <span class="inv-mood">Mood: Better ✓</span>
      <div class="inv-thanks">${esc(s.footer)} <span>☕</span></div>
      <div class="inv-contact"><span>${esc(s.social)}</span><span>${esc(s.phone)}</span></div>
      <div class="tagline">${esc((s.tagline || '').toUpperCase())}</div>
      <img class="glass" src="assets/glass.png" alt="">
    </div>
    <div class="inv-foot-band"></div>
  </div>`;
}

function receiptHTML(o) {
  const s = S.settings;
  const rows = o.items.map((it) => `<tr><td>${esc(it.name)}${it.size === 'L' ? ' (বড়)' : ''} ×${bn(it.qty)}</td><td class="r">${money(it.price * it.qty)}</td></tr>`).join('');
  return `
  <div class="rcpt">
    <img class="logo" src="assets/logo-primary.png" alt="Aura Cafe">
    <div class="c mono meta">ORDER ${orderNo(o)} · ${bn(fmtDateNum(o.day))}<br>${fmtTime(o.ts)} · ${PAY[o.payment]?.bn || ''}</div>
    ${o.customer?.name ? `<div class="c meta">কাস্টমার: ${esc(o.customer.name)} ${esc(o.customer.phone || '')}</div>` : ''}
    <hr>
    <table>${rows}</table>
    <hr>
    <div class="row"><span>সাবটোটাল</span><span>${money(o.subtotal)}</span></div>
    ${o.discount ? `<div class="row"><span>ছাড় (${esc(o.discount.label)})</span><span>−${money(o.discount.amt)}</span></div>` : ''}
    ${o.vatPct ? `<div class="row"><span>ভ্যাট ${bn(o.vatPct)}%</span><span>${money(o.vat)}</span></div>` : ''}
    <div class="tot" style="margin-top:1.5mm"><span>মোট</span><span>${money(o.total)}</span></div>
    <div class="row"><span>প্রাপ্ত</span><span>${money(o.received)}</span></div>
    ${o.change > 0 ? `<div class="row"><span>ফেরত</span><span>${money(o.change)}</span></div>` : ''}
    ${o.note ? `<div class="meta">নোট: ${esc(o.note)}</div>` : ''}
    <div class="token-box"><b>${bn(pad(o.token))}</b><small>TOKEN</small></div>
    <hr>
    <div class="c mono" style="font-size:9pt">MOOD: BETTER ✓</div>
    <div class="c" style="font-size:9pt">${esc(s.footer)} · ${esc(s.social)}</div>
    ${o.status === 'void' ? '<div class="c mono" style="font-weight:700;margin-top:2mm">*** VOID ***</div>' : ''}
  </div>`;
}
const fmtDateNum = (k) => { const [y, m, d] = k.split('-'); return `${d}/${m}/${y}`; };

function printDoc(html, kind) {
  const root = $('#print-root');
  root.className = 'print-' + kind;
  root.innerHTML = html;
  const setPage = () => {
    let css = kind === 'a5' ? '@page { size: A5 portrait; margin: 0; }' : '@page { size: A4 portrait; margin: 10mm; }';
    if (kind === 'thermal') {
      // Thermal rolls have no fixed length: measure the receipt and size the page to fit it.
      root.style.cssText = 'display:block;position:fixed;left:-9999px;top:0';
      const mm = Math.ceil((root.firstElementChild.offsetHeight * 25.4) / 96) + 4;
      root.style.cssText = '';
      css = `@page { size: 80mm ${mm}mm; margin: 0; }`;
    }
    $('#page-style').textContent = css;
  };
  const imgs = $$('img', root).map((img) => (img.complete ? Promise.resolve() : new Promise((r) => { img.onload = img.onerror = r; })));
  Promise.all(imgs).then(() => (document.fonts ? document.fonts.ready : null)).then(() => { setPage(); setTimeout(() => window.print(), 60); });
}
const printOrder = (o, fmt) => printDoc(fmt === 'thermal' ? receiptHTML(o) : invoiceHTML(o), fmt === 'thermal' ? 'thermal' : 'a5');

/* ============================================================ DASHBOARD */
function rangeDays(r) {
  const today = dayKey();
  if (r === 'today') return [today, today];
  if (r === '7') return [addDays(today, -6), today];
  if (r === '30') return [addDays(today, -29), today];
  const d = new Date(); return [dayKey(new Date(d.getFullYear(), d.getMonth(), 1)), today];
}
const inRange = (o, [a, b]) => o.day >= a && o.day <= b;
const daysBetween = (a, b) => Math.round((fromKey(b) - fromKey(a)) / 864e5) + 1;

function stats(orders) {
  const total = sum(orders, (o) => o.total);
  const cost = sum(orders, (o) => sum(o.items, (i) => (i.cost || 0) * i.qty));
  const vat = sum(orders, (o) => o.vat || 0);
  const items = sum(orders, (o) => sum(o.items, (i) => i.qty));
  return { total, count: orders.length, avg: orders.length ? total / orders.length : 0, profit: total - vat - cost, items, cost };
}

function delta(cur, prev, label) {
  if (!prev) return `<div class="k-delta">${label}: —</div>`;
  const p = Math.round(((cur - prev) / prev) * 100);
  return `<div class="k-delta"><span class="${p >= 0 ? 'up' : 'down'}">${p >= 0 ? '▲' : '▼'} ${bn(Math.abs(p))}%</span> ${label}</div>`;
}

function viewDashboard() {
  const today = dayKey();
  const range = rangeDays(st.dashRange);
  const len = daysBetween(range[0], range[1]);
  const prevRange = [addDays(range[0], -len), addDays(range[0], -1)];
  const paid = paidOrders();
  const cur = paid.filter((o) => inRange(o, range));
  const prev = paid.filter((o) => inRange(o, prevRange));
  const a = stats(cur), b = stats(prev);
  const cmpLabel = st.dashRange === 'today' ? 'গতকালের তুলনায়' : 'আগের সময়ের তুলনায়';
  const h = new Date().getHours();
  const greet = h < 5 ? 'শুভ রাত্রি' : h < 12 ? 'শুভ সকাল' : h < 17 ? 'শুভ দুপুর' : h < 20 ? 'শুভ সন্ধ্যা' : 'শুভ রাত্রি';
  const todayStats = stats(paid.filter((o) => o.day === today));

  setHeader('ড্যাশবোর্ড', `${weekday(today)}, ${fmtDate(today)}`,
    `<button class="btn btn-ghost" data-act="addProduct">${ui('plus')}<span class="btn-label">প্রোডাক্ট যোগ</span></button>
     <button class="btn btn-primary" data-act="go" data-v="pos">${ui('pos')}<span class="btn-label">নতুন অর্ডার</span></button>`);

  const rangeSeg = [['today', 'আজ'], ['7', '৭ দিন'], ['30', '৩০ দিন'], ['month', 'এই মাস']]
    .map(([k, l]) => `<button class="${st.dashRange === k ? 'active' : ''}" data-act="dashRange" data-r="${k}">${l}</button>`).join('');

  /* top products */
  const agg = {};
  cur.forEach((o) => o.items.forEach((i) => {
    const k = i.pid; agg[k] = agg[k] || { name: i.name, color: i.color, icon: i.icon, qty: 0, rev: 0 };
    agg[k].qty += i.qty; agg[k].rev += i.qty * i.price;
  }));
  const top = Object.values(agg).sort((x, y) => y.rev - x.rev).slice(0, 6);
  const topMax = top[0]?.rev || 1;
  const topHTML = top.length ? `<div class="hbars">${top.map((t) => `
    <div class="hbar"><div class="hb-top"><span class="n"><span class="p-ico" style="background:${t.color};color:${inkFor(t.color)}">${picon(t.icon)}</span>${esc(t.name)}</span>
    <span class="v">${money(t.rev)}<small>${bn(t.qty)}টি</small></span></div>
    <div class="hb-track"><div class="hb-fill" style="width:${(t.rev / topMax) * 100}%"></div></div></div>`).join('')}</div>`
    : emptyMini('এই সময়ে কোনো বিক্রি নেই');

  /* payment split */
  const payAgg = Object.keys(PAY).map((k) => ({ k, v: sum(cur.filter((o) => o.payment === k), (o) => o.total), n: cur.filter((o) => o.payment === k).length })).filter((x) => x.n);
  const payMax = Math.max(1, ...payAgg.map((x) => x.v));
  const payHTML = payAgg.length ? `<div class="hbars">${payAgg.sort((x, y) => y.v - x.v).map((x) => `
    <div class="hbar"><div class="hb-top"><span class="n">${PAY[x.k].bn}</span><span class="v">${money(x.v)}<small>${bn(Math.round((x.v / a.total) * 100))}%</small></span></div>
    <div class="hb-track"><div class="hb-fill" style="width:${(x.v / payMax) * 100}%"></div></div></div>`).join('')}</div>` : emptyMini('কোনো পেমেন্ট নেই');

  const recent = [...S.orders].sort((x, y) => y.ts - x.ts).slice(0, 8);
  const chartDays = st.dashRange === '30' || st.dashRange === 'month' ? 30 : 14;

  $('#view').innerHTML = `
    <div class="dash-hero">
      <div>
        <h2>${greet}! আজকের বিক্রি <span>${money(todayStats.total)}</span></h2>
        <p>${bn(todayStats.count)}টি অর্ডার · ${bn(todayStats.items)}টি আইটেম — প্রতিটা গ্লাসে একই স্বাদ, প্রতিটা ভিজিটে একটু ভালো মুড।</p>
      </div>
      <div class="acts">
        <button class="btn btn-gold" data-act="go" data-v="pos">${ui('pos')} নতুন অর্ডার</button>
        <button class="btn btn-ghost" data-act="addProduct">${ui('plus')} প্রোডাক্ট যোগ</button>
        <button class="btn btn-ghost" data-act="go" data-v="sales">${ui('sales')} আজকের হিসাব</button>
      </div>
      <img class="glass" src="assets/glass.png" alt="">
    </div>

    <div class="dash-bar">
      <div class="seg">${rangeSeg}</div>
      <span class="muted" style="font-size:13px">${fmtDate(range[0])}${range[0] !== range[1] ? ' – ' + fmtDate(range[1]) : ''}</span>
    </div>

    <div class="kpis">
      <div class="kpi hero"><div class="k-label"><i>${ui('coins')}</i>মোট বিক্রি</div><div class="k-value">${fmtN(a.total)}<small>৳</small></div>${delta(a.total, b.total, cmpLabel)}</div>
      <div class="kpi"><div class="k-label"><i>${ui('bag')}</i>অর্ডার</div><div class="k-value">${fmtN(a.count)}</div>${delta(a.count, b.count, cmpLabel)}</div>
      <div class="kpi"><div class="k-label"><i>${ui('receipt')}</i>গড় বিল</div><div class="k-value">${fmtN(a.avg)}<small>৳</small></div>${delta(a.avg, b.avg, cmpLabel)}</div>
      <div class="kpi"><div class="k-label"><i>${ui('trend')}</i>আনুমানিক গ্রস লাভ</div><div class="k-value">${fmtN(a.profit)}<small>৳</small></div>
        <div class="k-delta">মার্জিন ${a.total ? bn(Math.round((a.profit / (a.total - sum(cur, (o) => o.vat || 0) || 1)) * 100)) : bn(0)}% · ${bn(a.items)}টি আইটেম বিক্রি</div></div>
    </div>

    <div class="dash-grid">
      <div class="card">
        <div class="card-title"><h3>দৈনিক বিক্রি · শেষ ${bn(chartDays)} দিন</h3><span class="chart-legend"><span><i style="background:var(--espresso)"></i>আজ</span><span><i style="background:var(--caramel)"></i>অন্য দিন</span></span></div>
        <div id="chart-daily" data-days="${chartDays}"></div>
      </div>
      <div class="card">
        <div class="card-title"><h3>সেরা প্রোডাক্ট</h3><span class="eyebrow">Top sellers</span></div>
        ${topHTML}
      </div>
    </div>

    <div class="dash-grid">
      <div class="card">
        <div class="card-title"><h3>কখন বেশি ভিড় · ঘণ্টাভিত্তিক বিক্রি</h3><span class="eyebrow b">${st.dashRange === 'today' ? 'আজ' : 'নির্বাচিত সময়'}</span></div>
        <div id="chart-hourly"></div>
      </div>
      <div class="card">
        <div class="card-title"><h3>পেমেন্ট মেথড</h3><span class="eyebrow">Payments</span></div>
        ${payHTML}
      </div>
    </div>

    <div class="card">
      <div class="card-title"><h3>সাম্প্রতিক অর্ডার</h3><button class="btn btn-ghost btn-sm" data-act="go" data-v="sales">সব দেখুন ${ui('chevR')}</button></div>
      ${recent.length ? ordersTable(recent, true) : `<div class="empty"><img src="assets/glass.png" alt=""><h4>এখনো কোনো অর্ডার নেই</h4><p>প্রথম অর্ডার নিন — অথবা সেটিংস থেকে ডেমো ডাটা লোড করে দেখুন কেমন দেখায়।</p>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:14px;flex-wrap:wrap"><button class="btn btn-primary" data-act="go" data-v="pos">${ui('pos')} প্রথম অর্ডার</button><button class="btn btn-ghost" data-act="demo">${ui('wand')} ডেমো ডাটা দেখুন</button></div></div>`}
    </div>`;
  drawDashCharts(cur);
}

const emptyMini = (t) => `<div class="empty" style="padding:24px 10px"><h4 style="font-weight:500;color:var(--muted)">${t}</h4></div>`;

function drawDashCharts(cur) {
  const el = $('#chart-daily');
  if (el) {
    const n = +el.dataset.days;
    const today = dayKey();
    const paid = paidOrders();
    const data = [];
    for (let i = n - 1; i >= 0; i--) {
      const k = addDays(today, -i);
      const os = paid.filter((o) => o.day === k);
      const t = sum(os, (o) => o.total);
      data.push({ label: fmtDateShort(k), value: t, hi: k === today, tip: `${weekday(k)}, ${fmtDate(k)}<br>বিক্রি <b>${money(t)}</b> · ${bn(os.length)}টি অর্ডার`, key: k });
    }
    el.innerHTML = data.some((d) => d.value > 0)
      ? barChart(data, { width: el.clientWidth, height: 230, every: n > 14 ? 5 : 2, clickAct: 'openDay' })
      : emptyMini('এখনো কোনো বিক্রি নেই — প্রথম অর্ডার নিলেই এখানে গ্রাফ দেখাবে');
  }
  const hEl = $('#chart-hourly');
  if (hEl) {
    const hours = Array.from({ length: 24 }, () => ({ v: 0, n: 0 }));
    cur.forEach((o) => { const h = new Date(o.ts).getHours(); hours[h].v += o.total; hours[h].n++; });
    let lo = 7, hi = 23;
    hours.forEach((x, i) => { if (x.n) { lo = Math.min(lo, i); hi = Math.max(hi, i); } });
    const data = [];
    const peak = Math.max(...hours.map((x) => x.v));
    for (let i = lo; i <= hi; i++) data.push({ label: hourLabel(i), value: hours[i].v, hi: peak > 0 && hours[i].v === peak, tip: `${hourLabel(i)} – ${hourLabel((i + 1) % 24)}<br>বিক্রি <b>${money(hours[i].v)}</b> · ${bn(hours[i].n)}টি অর্ডার` });
    hEl.innerHTML = peak > 0
      ? barChart(data, { width: hEl.clientWidth, height: 200, every: data.length > 12 ? 2 : 1 })
      : emptyMini('এই সময়ে কোনো বিক্রি নেই');
  }
}

function niceMax(v) {
  if (v <= 0) return 25;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
}

function barChart(data, { width = 600, height = 220, every = 1, clickAct = '' } = {}) {
  width = Math.max(280, width || 600);
  const padL = 40, padR = 4, padT = 18, padB = 26;
  const iw = width - padL - padR, ih = height - padT - padB;
  const step = niceMax(Math.max(...data.map((d) => d.value)) / 4);
  const max = Math.max(step, Math.ceil(Math.max(...data.map((d) => d.value)) / step) * step);
  const band = iw / data.length;
  const bw = Math.max(4, Math.min(34, band * 0.62));
  const y = (v) => padT + ih - (v / max) * ih;
  const ticks = []; for (let t = 0; t <= max + 1e-9; t += step) ticks.push(t);
  const grid = ticks.map((t) => `<line x1="${padL}" x2="${width - padR}" y1="${y(t)}" y2="${y(t)}"/>`).join('');
  const yl = ticks.map((t) => `<text x="${padL - 8}" y="${y(t) + 4}" text-anchor="end">${compact(t)}</text>`).join('');
  const maxV = Math.max(...data.map((d) => d.value));
  const bars = data.map((d, i) => {
    const x = padL + band * i + (band - bw) / 2;
    const top = y(d.value), base = padT + ih;
    const hgt = base - top;
    const r = Math.min(4, bw / 2, hgt);
    const path = hgt > 0.5
      ? `M${x},${base} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${base} Z`
      : '';
    const lbl = (i % every === 0 || d.hi) ? `<text x="${x + bw / 2}" y="${height - 6}" text-anchor="middle">${d.label}</text>` : '';
    const showVal = d.value > 0 && (d.hi || d.value === maxV);
    const val = showVal ? `<text class="val" x="${x + bw / 2}" y="${top - 6}" text-anchor="middle">${compact(d.value)}</text>` : '';
    return `<g class="col" data-tip="${esc(d.tip)}" ${clickAct && d.key ? `data-act="${clickAct}" data-k="${d.key}" style="cursor:pointer"` : ''}>
      <rect class="hit" x="${padL + band * i}" y="${padT}" width="${band}" height="${ih}"/>
      ${path ? `<path class="bar ${d.hi ? 'hi' : ''}" d="${path}"/>` : ''}${val}</g><g class="axis">${lbl}</g>`;
  }).join('');
  return `<svg class="chart" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
    <g class="grid">${grid}</g><g class="axis">${yl}</g>${bars}
    <line x1="${padL}" x2="${width - padR}" y1="${padT + ih}" y2="${padT + ih}" stroke="#E4D5BF"/></svg>`;
}

function ordersTable(orders, compactMode = false) {
  return `<div class="table-wrap"><table class="table">
    <thead><tr><th>অর্ডার</th><th>সময়</th><th class="${compactMode ? 'hide-sm' : ''}">আইটেম</th><th class="hide-sm">পেমেন্ট</th><th class="r">মোট</th><th></th></tr></thead>
    <tbody>${orders.map((o) => `
      <tr class="click ${o.status === 'void' ? 'void' : ''}" data-act="viewOrder" data-id="${o.id}">
        <td class="num">${orderNo(o)} <span class="badge grey keep" style="margin-left:4px">T${bn(pad(o.token))}</span></td>
        <td style="white-space:nowrap">${compactMode && o.day !== dayKey() ? fmtDateShort(o.day) + ', ' : ''}${fmtTime(o.ts)}</td>
        <td class="${compactMode ? 'hide-sm' : ''}"><div class="order-items">${esc(o.items.map((i) => `${i.name}${i.size === 'L' ? '(বড়)' : ''} ×${bn(i.qty)}`).join(', '))}</div></td>
        <td class="hide-sm keep"><span class="pay-tag">${PAY[o.payment]?.bn || ''}</span>${o.status === 'void' ? ' <span class="badge red">বাতিল</span>' : ''}</td>
        <td class="r num">${money(o.total)}</td>
        <td class="r keep"><span class="icon-btn">${ui('eye')}</span></td>
      </tr>`).join('')}</tbody></table></div>`;
}

/* ================================================================ SALES */
function viewSales() {
  const today = dayKey();
  const k = st.salesDay || today;
  const all = ordersOn(k).sort((x, y) => y.ts - x.ts);
  const paid = all.filter((o) => o.status !== 'void');
  const s = stats(paid);
  const disc = sum(paid, (o) => o.discount?.amt || 0);

  setHeader('দৈনিক বিক্রি', `${weekday(k)}, ${fmtDate(k)}${k === today ? ' · আজ' : ''}`,
    `<button class="btn btn-ghost" data-act="exportCSV">${ui('download')}<span class="btn-label">CSV</span></button>
     <button class="btn btn-primary" data-act="printDay">${ui('print')}<span class="btn-label">দিনের রিপোর্ট</span></button>`);

  /* item-wise */
  const agg = {};
  paid.forEach((o) => o.items.forEach((i) => {
    const key = i.pid + '|' + i.size;
    agg[key] = agg[key] || { name: i.name + (i.size === 'L' ? ' (বড়)' : ''), color: i.color, qty: 0, rev: 0, cost: 0 };
    agg[key].qty += i.qty; agg[key].rev += i.qty * i.price; agg[key].cost += i.qty * (i.cost || 0);
  }));
  const items = Object.values(agg).sort((x, y) => y.rev - x.rev);

  /* last 30 days table */
  const days = [];
  for (let i = 0; i < 30; i++) {
    const d = addDays(today, -i);
    const os = paidOrders().filter((o) => o.day === d);
    days.push({ d, n: os.length, t: sum(os, (o) => o.total), p: stats(os).profit });
  }
  const daysWith = days.filter((x) => x.n || x.d === today);

  $('#view').innerHTML = `
    <div class="dash-bar">
      <div class="date-nav">
        <button class="btn btn-ghost" data-act="dayShift" data-n="-1" aria-label="আগের দিন">${ui('chevL')}</button>
        <input type="date" class="input" id="sales-date" value="${k}" max="${today}" />
        <button class="btn btn-ghost" data-act="dayShift" data-n="1" aria-label="পরের দিন" ${k >= today ? 'disabled' : ''}>${ui('chevR')}</button>
        ${k !== today ? `<button class="btn btn-gold" data-act="dayToday">আজ</button>` : ''}
      </div>
      <span class="date-big">${weekday(k)}, ${fmtDate(k)}</span>
    </div>

    <div class="kpis">
      <div class="kpi hero"><div class="k-label"><i>${ui('coins')}</i>মোট বিক্রি</div><div class="k-value">${fmtN(s.total)}<small>৳</small></div><div class="k-delta">${disc ? `ছাড় দেওয়া হয়েছে ${money(disc)}` : 'কোনো ছাড় নেই'}</div></div>
      <div class="kpi"><div class="k-label"><i>${ui('bag')}</i>অর্ডার</div><div class="k-value">${fmtN(s.count)}</div><div class="k-delta">${all.length - paid.length ? `${bn(all.length - paid.length)}টি বাতিল` : 'কোনো বাতিল নেই'}</div></div>
      <div class="kpi"><div class="k-label"><i>${ui('layers')}</i>আইটেম বিক্রি</div><div class="k-value">${fmtN(s.items)}</div><div class="k-delta">গড় বিল ${money(s.avg)}</div></div>
      <div class="kpi"><div class="k-label"><i>${ui('trend')}</i>আনুমানিক গ্রস লাভ</div><div class="k-value">${fmtN(s.profit)}<small>৳</small></div><div class="k-delta">কাঁচামাল খরচ ${money(s.cost)}</div></div>
    </div>

    <div class="sales-grid">
      <div class="card">
        <div class="card-title"><h3>আইটেম অনুযায়ী বিক্রি</h3><span class="eyebrow">Item-wise</span></div>
        ${items.length ? `<div class="table-wrap"><table class="table">
          <thead><tr><th>আইটেম</th><th class="r">পরিমাণ</th><th class="r">বিক্রি</th><th class="r hide-sm">লাভ</th></tr></thead>
          <tbody>${items.map((i) => `<tr><td><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${i.color};margin-right:8px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)"></span>${esc(i.name)}</td>
            <td class="r num">${bn(i.qty)}</td><td class="r num">${money(i.rev)}</td><td class="r num hide-sm" style="color:var(--ok)">${money(i.rev - i.cost)}</td></tr>`).join('')}</tbody>
          <tfoot><tr><td>মোট</td><td class="r num">${bn(sum(items, (i) => i.qty))}</td><td class="r num">${money(sum(items, (i) => i.rev))}</td><td class="r num hide-sm">${money(sum(items, (i) => i.rev - i.cost))}</td></tr></tfoot>
        </table></div>` : emptyMini('এই দিনে কোনো বিক্রি নেই')}
      </div>
      <div class="card">
        <div class="card-title"><h3>শেষ ৩০ দিনের হিসাব</h3><span class="eyebrow b">ক্লিক করে দেখুন</span></div>
        <div class="table-wrap" style="max-height:420px;overflow:auto"><table class="table">
          <thead><tr><th>তারিখ</th><th class="r">অর্ডার</th><th class="r">বিক্রি</th><th class="r hide-sm">লাভ</th></tr></thead>
          <tbody>${daysWith.map((x) => `<tr class="click" data-act="openDay" data-k="${x.d}" style="${x.d === k ? 'background:#FFF4E2' : ''}">
            <td>${fmtDateShort(x.d)} <span class="muted" style="font-size:12px">${weekday(x.d).replace('বার', '')}</span></td>
            <td class="r num">${bn(x.n)}</td><td class="r num">${money(x.t)}</td><td class="r num hide-sm" style="color:var(--ok)">${money(x.p)}</td></tr>`).join('')}</tbody>
        </table></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><h3>এই দিনের সব অর্ডার</h3><span class="badge">${bn(all.length)}টি</span></div>
      ${all.length ? ordersTable(all) : `<div class="empty"><img src="assets/glass.png" alt=""><h4>এই দিনে কোনো অর্ডার নেই</h4></div>`}
    </div>`;

  $('#sales-date').addEventListener('change', (e) => { if (e.target.value) { st.salesDay = e.target.value > today ? today : e.target.value; render(); } });
}

function exportCSV() {
  const k = st.salesDay || dayKey();
  const rows = [['Order', 'Token', 'Date', 'Time', 'Items', 'Subtotal', 'Discount', 'VAT', 'Total', 'Payment', 'Received', 'Change', 'Customer', 'Phone', 'Status']];
  ordersOn(k).sort((a, b) => a.ts - b.ts).forEach((o) => {
    const d = new Date(o.ts);
    rows.push([orderNo(o), o.token, o.day, `${pad(d.getHours())}:${pad(d.getMinutes())}`,
      o.items.map((i) => `${i.name}${i.size === 'L' ? '(L)' : ''} x${i.qty}`).join('; '),
      o.subtotal, o.discount?.amt || 0, o.vat || 0, o.total, o.payment, o.received, o.change, o.customer?.name || '', o.customer?.phone || '', o.status]);
  });
  const csv = '﻿' + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  download(`aura-sales-${k}.csv`, csv, 'text/csv;charset=utf-8');
  toast('CSV ডাউনলোড হয়েছে', 'download');
}

function download(name, content, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function printDay() {
  const k = st.salesDay || dayKey();
  const all = ordersOn(k).sort((a, b) => a.ts - b.ts);
  const paid = all.filter((o) => o.status !== 'void');
  const s = stats(paid);
  const agg = {};
  paid.forEach((o) => o.items.forEach((i) => {
    const key = i.pid + '|' + i.size;
    agg[key] = agg[key] || { name: i.name + (i.size === 'L' ? ' (বড়)' : ''), color: i.color, qty: 0, rev: 0, price: i.price };
    agg[key].qty += i.qty; agg[key].rev += i.qty * i.price;
  }));
  const items = Object.values(agg).sort((a, b) => b.rev - a.rev);
  const pays = Object.keys(PAY).map((p) => ({ p, v: sum(paid.filter((o) => o.payment === p), (o) => o.total), n: paid.filter((o) => o.payment === p).length })).filter((x) => x.n);
  const html = `
  <div class="rep">
    <div class="inv-head"><div><img class="logo" src="assets/logo-reverse.png" alt=""><div class="tag">${esc(S.settings.tagline.toUpperCase())}</div></div>
      <div class="ttl"><div class="t1">DAILY REPORT</div><div class="t2">দিনের হিসাব</div><div class="t3">${weekday(k)}, ${fmtDate(k)}</div></div></div>
    <div class="rep-kpis">
      <div><small>মোট বিক্রি</small><b>${money(s.total)}</b></div>
      <div><small>অর্ডার</small><b>${bn(s.count)}</b></div>
      <div><small>গড় বিল</small><b>${money(s.avg)}</b></div>
      <div><small>আনুমানিক গ্রস লাভ</small><b>${money(s.profit)}</b></div>
    </div>
    <h4>আইটেম অনুযায়ী</h4>
    <table class="inv-table"><thead><tr><th>আইটেম</th><th class="r">দাম</th><th class="c">পরিমাণ</th><th class="r">মোট</th></tr></thead>
      <tbody>${items.map((i) => `<tr><td><div class="it"><span class="dot" style="background:${i.color}"></span><b>${esc(i.name)}</b></div></td><td class="r num">${money(i.price)}</td><td class="c num">${bn(i.qty)}</td><td class="r num"><b>${money(i.rev)}</b></td></tr>`).join('') || '<tr><td colspan="4">কোনো বিক্রি নেই</td></tr>'}</tbody></table>
    <h4>পেমেন্ট অনুযায়ী</h4>
    <table class="inv-table"><tbody>${pays.map((x) => `<tr><td>${PAY[x.p].bn}</td><td class="c num">${bn(x.n)}টি</td><td class="r num"><b>${money(x.v)}</b></td></tr>`).join('') || '<tr><td>—</td></tr>'}</tbody></table>
    <h4>সব অর্ডার (${bn(all.length)})</h4>
    <table class="inv-table"><thead><tr><th>অর্ডার</th><th>সময়</th><th>আইটেম</th><th>পেমেন্ট</th><th class="r">মোট</th></tr></thead>
      <tbody>${all.map((o) => `<tr style="${o.status === 'void' ? 'text-decoration:line-through;color:#aaa' : ''}"><td class="num">${orderNo(o)}</td><td>${fmtTime(o.ts)}</td><td>${esc(o.items.map((i) => `${i.name} ×${bn(i.qty)}`).join(', '))}</td><td>${PAY[o.payment]?.bn}</td><td class="r num">${money(o.total)}</td></tr>`).join('')}</tbody></table>
    <p style="font-size:8pt;color:#8a7560;margin-top:6mm">প্রিন্ট: ${fmtDate(dayKey())}, ${fmtTime(Date.now())} · ${esc(S.settings.shopName)} POS</p>
  </div>`;
  printDoc(html, 'a4');
}

/* ============================================================= PRODUCTS */
function viewProducts() {
  setHeader('প্রোডাক্ট', `${bn(S.products.length)}টি প্রোডাক্ট · ${bn(S.products.filter((p) => p.active).length)}টি আজ মেনুতে`,
    `<button class="btn btn-primary" data-act="addProduct">${ui('plus')}<span class="btn-label">নতুন প্রোডাক্ট</span></button>`);
  const chips = [{ id: 'all', name: 'সব' }, ...S.categories, { id: 'off', name: 'মেনুতে নেই' }]
    .map((c) => `<button class="chip ${st.prodCat === c.id ? 'active' : ''}" data-act="prodCat" data-c="${c.id}">${esc(c.name)}</button>`).join('');
  $('#view').innerHTML = `
    <div class="pos-toolbar" style="margin-bottom:12px">
      <div class="search">${ui('search')}<input id="prod-q" class="input" placeholder="প্রোডাক্ট খুঁজুন…" value="${esc(st.prodQ)}" autocomplete="off"/></div>
    </div>
    <div class="chips" style="margin-bottom:14px">${chips}</div>
    <div class="prod-list" id="prod-list"></div>
    <div class="card" style="margin-top:22px;max-width:640px">
      <div class="card-title"><h3>ক্যাটাগরি</h3><button class="btn btn-ghost btn-sm" data-act="addCat">${ui('plus')} নতুন ক্যাটাগরি</button></div>
      <div class="cat-list">${S.categories.map((c) => `
        <div class="cat-item">
          <input class="input" data-cat-name="${c.id}" value="${esc(c.name)}" placeholder="বাংলা নাম" />
          <input class="input en" data-cat-en="${c.id}" value="${esc(c.en || '')}" placeholder="English" />
          <span class="badge grey">${bn(S.products.filter((p) => p.cat === c.id).length)}</span>
          <button class="icon-btn danger" data-act="delCat" data-id="${c.id}" title="মুছুন">${ui('trash')}</button>
        </div>`).join('')}</div>
    </div>`;
  renderProdList();
  $('#prod-q').addEventListener('input', (e) => { st.prodQ = e.target.value; renderProdList(); });
  $$('[data-cat-name],[data-cat-en]').forEach((inp) => inp.addEventListener('change', (e) => {
    const id = e.target.dataset.catName || e.target.dataset.catEn;
    const c = catById(id); if (!c) return;
    if (e.target.dataset.catName) c.name = e.target.value.trim() || c.name; else c.en = e.target.value.trim();
    save(); toast('ক্যাটাগরি আপডেট হয়েছে', 'check');
  }));
}

function renderProdList() {
  const q = st.prodQ.trim().toLowerCase();
  let list = S.products;
  if (st.prodCat === 'off') list = list.filter((p) => !p.active);
  else if (st.prodCat !== 'all') list = list.filter((p) => p.cat === st.prodCat);
  if (q) list = list.filter((p) => (p.name + ' ' + (p.en || '')).toLowerCase().includes(q));
  const el = $('#prod-list');
  if (!list.length) { el.innerHTML = `<div class="empty" style="grid-column:1/-1"><img src="assets/glass.png" alt=""><h4>কোনো প্রোডাক্ট নেই</h4><p>“নতুন প্রোডাক্ট” বাটনে চাপ দিয়ে যোগ করুন।</p></div>`; return; }
  el.innerHTML = list.map((p) => {
    const margin = p.cost ? Math.round(((p.price - p.cost) / p.price) * 100) : null;
    return `<div class="prow ${p.active ? '' : 'off'}">
      <div class="p-ico" style="background:${p.color};color:${inkFor(p.color)}">${picon(p.icon)}</div>
      <div class="pr-info">
        <div class="pr-name">${esc(p.name)} ${p.best ? '<span class="badge red">★</span>' : ''}</div>
        <div class="pr-en">${esc(p.en || '')} · ${esc(catById(p.cat)?.name || '')}</div>
        <div class="pr-price">${money(p.price)}${p.large ? ` <small>/ বড় ${money(p.large)}</small>` : ''}${margin != null ? ` <small>· লাভ ~${bn(margin)}%</small>` : ''}</div>
      </div>
      <div class="pr-acts">
        <label class="switch" title="আজ মেনুতে আছে"><input type="checkbox" data-act-change="toggleActive" data-id="${p.id}" ${p.active ? 'checked' : ''}><span></span></label>
        <div class="row">
          <button class="icon-btn" data-act="editProduct" data-id="${p.id}" title="এডিট">${ui('edit')}</button>
          <button class="icon-btn danger" data-act="delProduct" data-id="${p.id}" title="মুছুন">${ui('trash')}</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function productModal(p = null) {
  const isNew = !p;
  const d = p ? { ...p } : { id: '', name: '', en: '', cat: S.categories[0]?.id || '', price: '', large: '', cost: '', color: COLORS[1].hex, icon: 'cup', active: true, best: false, desc: '' };
  const f = { ...d };
  const draw = () => {
    const prev = { ...f, name: f.name || 'প্রোডাক্টের নাম', price: +f.price || 0, large: +f.large || null };
    $('#pp-prev').innerHTML = pcardHTML(prev);
    $$('#pp-sw .swatch').forEach((b) => b.classList.toggle('active', b.dataset.c === f.color));
    $$('#pp-ic button').forEach((b) => b.classList.toggle('active', b.dataset.i === f.icon));
  };
  openModal(`
    <div class="modal-head"><h3>${isNew ? 'নতুন প্রোডাক্ট' : 'প্রোডাক্ট এডিট'}</h3><button class="icon-btn" data-act="closeModal">${ui('x')}</button></div>
    <div class="modal-body">
      <div class="prod-preview" id="pp-prev"></div>
      <div class="form-grid">
        <div class="field"><label>বাংলা নাম *</label><input class="input" id="pp-name" value="${esc(d.name)}" placeholder="যেমন: লেবু চা" /></div>
        <div class="field"><label>English নাম</label><input class="input" id="pp-en" value="${esc(d.en)}" placeholder="e.g. Lemon Tea" /></div>
        <div class="field"><label>দাম (৳) *</label><input class="input num" id="pp-price" type="number" inputmode="numeric" min="0" value="${d.price}" placeholder="২০" /></div>
        <div class="field"><label>বড় সাইজের দাম (৳)</label><input class="input num" id="pp-large" type="number" inputmode="numeric" min="0" value="${d.large || ''}" placeholder="ঐচ্ছিক" /><span class="hint">দিলে POS-এ রেগুলার/বড় দুইটা বাটন আসবে</span></div>
        <div class="field"><label>ক্যাটাগরি</label><select class="input select" id="pp-cat">${S.categories.map((c) => `<option value="${c.id}" ${c.id === d.cat ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
        <div class="field"><label>আনুমানিক খরচ (৳)</label><input class="input num" id="pp-cost" type="number" inputmode="numeric" min="0" value="${d.cost || ''}" placeholder="লাভ হিসাবের জন্য" /></div>
        <div class="field full"><label>বিবরণ</label><input class="input" id="pp-desc" value="${esc(d.desc || '')}" placeholder="যেমন: ঘন দুধ, উপরে মালাই" /></div>
        <div class="field full"><label>রং (ব্র্যান্ড প্যালেট)</label><div class="swatches" id="pp-sw">${COLORS.map((c) => `<button type="button" class="swatch" data-c="${c.hex}" title="${c.name}" style="background:${c.hex}"></button>`).join('')}</div></div>
        <div class="field full"><label>আইকন</label><div class="icon-pick" id="pp-ic">${Object.keys(P_ICONS).map((k) => `<button type="button" data-i="${k}">${picon(k)}</button>`).join('')}</div></div>
        <div class="full">
          <div class="toggle-row"><div><div class="t">আজ মেনুতে আছে</div><div class="s">বন্ধ করলে POS-এ দেখাবে না (মৌসুমি আইটেমের জন্য)</div></div><label class="switch"><input type="checkbox" id="pp-active" ${d.active ? 'checked' : ''}><span></span></label></div>
          <div class="toggle-row"><div><div class="t">বেস্টসেলার ব্যাজ</div><div class="s">কার্ডে লাল “BESTSELLER” ট্যাগ দেখাবে</div></div><label class="switch"><input type="checkbox" id="pp-best" ${d.best ? 'checked' : ''}><span></span></label></div>
        </div>
      </div>
    </div>
    <div class="modal-foot">
      ${!isNew ? `<button class="btn btn-danger" data-act="delProduct" data-id="${d.id}" style="margin-right:auto">${ui('trash')} মুছুন</button>` : ''}
      <button class="btn btn-ghost" data-act="closeModal">বাতিল</button>
      <button class="btn btn-primary" id="pp-save">${ui('check')} ${isNew ? 'প্রোডাক্ট যোগ করুন' : 'সেভ করুন'}</button>
    </div>`, 'wide');

  const bind = (id, key) => $(id).addEventListener('input', (e) => { f[key] = e.target.value; draw(); });
  bind('#pp-name', 'name'); bind('#pp-en', 'en'); bind('#pp-price', 'price'); bind('#pp-large', 'large');
  $('#pp-best').addEventListener('change', (e) => { f.best = e.target.checked; draw(); });
  $('#pp-sw').addEventListener('click', (e) => { const b = e.target.closest('.swatch'); if (b) { f.color = b.dataset.c; draw(); } });
  $('#pp-ic').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { f.icon = b.dataset.i; draw(); } });
  $('#pp-save').addEventListener('click', () => {
    const name = $('#pp-name').value.trim();
    const price = +$('#pp-price').value;
    if (!name) { toast('প্রোডাক্টের নাম দিন', 'x'); $('#pp-name').focus(); return; }
    if (!(price > 0)) { toast('সঠিক দাম দিন', 'x'); $('#pp-price').focus(); return; }
    const large = +$('#pp-large').value || null;
    const obj = {
      id: d.id || 'p-' + uid(), name, en: $('#pp-en').value.trim(), cat: $('#pp-cat').value, price, large: large && large > 0 ? large : null,
      cost: +$('#pp-cost').value || 0, color: f.color, icon: f.icon, active: $('#pp-active').checked, best: $('#pp-best').checked, desc: $('#pp-desc').value.trim(),
    };
    if (isNew) S.products.push(obj); else S.products[S.products.findIndex((x) => x.id === d.id)] = obj;
    save(); closeModal();
    toast(isNew ? `“${name}” যোগ হয়েছে` : 'সেভ হয়েছে', 'check');
    render();
  });
  draw();
  setTimeout(() => $('#pp-name').focus(), 60);
}

function customItemModal() {
  openModal(`
    <div class="modal-head"><h3>কাস্টম আইটেম</h3><button class="icon-btn" data-act="closeModal">${ui('x')}</button></div>
    <div class="modal-body">
      <p class="muted" style="margin-top:0">মেনুতে নেই এমন কিছু বিক্রি করতে — যেমন আজকের স্পেশাল।</p>
      <div class="form-grid">
        <div class="field full"><label>আইটেমের নাম *</label><input class="input" id="ci-name" placeholder="যেমন: আজকের স্পেশাল লেবু চা" /></div>
        <div class="field"><label>দাম (৳) *</label><input class="input num" id="ci-price" type="number" inputmode="numeric" min="0" placeholder="৩০" /></div>
        <div class="field"><label>পরিমাণ</label><input class="input num" id="ci-qty" type="number" inputmode="numeric" min="1" value="1" /></div>
        <div class="full toggle-row"><div><div class="t">প্রোডাক্ট লিস্টে সেভ করুন</div><div class="s">পরের বার থেকে মেনুতে বাটন হিসেবে আসবে</div></div><label class="switch"><input type="checkbox" id="ci-save"><span></span></label></div>
        <div class="field full hidden" id="ci-cat-wrap"><label>ক্যাটাগরি</label><select class="input select" id="ci-cat">${S.categories.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>
      </div>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" data-act="closeModal">বাতিল</button><button class="btn btn-primary" id="ci-add">${ui('plus')} অর্ডারে যোগ করুন</button></div>`);
  $('#ci-save').addEventListener('change', (e) => $('#ci-cat-wrap').classList.toggle('hidden', !e.target.checked));
  const add = () => {
    const name = $('#ci-name').value.trim(); const price = +$('#ci-price').value; const qty = Math.max(1, Math.round(+$('#ci-qty').value || 1));
    if (!name) { toast('নাম দিন', 'x'); $('#ci-name').focus(); return; }
    if (!(price > 0)) { toast('দাম দিন', 'x'); $('#ci-price').focus(); return; }
    if ($('#ci-save').checked) {
      const cat = $('#ci-cat').value;
      const p = { id: 'p-' + uid(), name, en: '', cat, price, large: null, cost: 0, color: '#EDB26B', icon: cat === 'cha' ? 'cup' : cat === 'bites' ? 'toast' : 'combo', active: true, best: false, desc: '' };
      S.products.push(p); save();
      for (let i = 0; i < qty; i++) addToCart(p.id, 'R', false);
    } else {
      const key = 'custom|' + uid();
      cart.lines.push({ key, pid: 'custom', size: 'R', qty, name, en: 'Custom', cat: 'custom', price, cost: 0, color: '#EDB26B', icon: 'heart' });
      saveCart();
    }
    closeModal();
    if (st.view === 'pos') { viewPOS(); }
    toast(`“${name}” যোগ হয়েছে`, 'check');
  };
  $('#ci-add').addEventListener('click', add);
  $('#ci-price').addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
  setTimeout(() => $('#ci-name').focus(), 60);
}

/* ============================================================= SETTINGS */
function viewSettings() {
  const s = S.settings;
  setHeader('সেটিংস', 'দোকানের তথ্য, ইনভয়েস ও ডাটা');
  const demoCount = S.orders.filter((o) => o.demo).length;
  $('#view').innerHTML = `
    <div class="settings-grid">
      <div class="card">
        <div class="card-title"><h3>দোকানের তথ্য</h3><span class="eyebrow b">ইনভয়েসে দেখাবে</span></div>
        <div class="form-grid">
          <div class="field"><label>দোকানের নাম</label><input class="input" data-set="shopName" value="${esc(s.shopName)}"/></div>
          <div class="field"><label>ফোন</label><input class="input" data-set="phone" value="${esc(s.phone)}"/></div>
          <div class="field full"><label>ঠিকানা</label><input class="input" data-set="address" value="${esc(s.address)}"/></div>
          <div class="field"><label>সোশ্যাল হ্যান্ডেল</label><input class="input" data-set="social" value="${esc(s.social)}"/></div>
          <div class="field"><label>ট্যাগলাইন</label><input class="input" data-set="tagline" value="${esc(s.tagline)}"/></div>
          <div class="field full"><label>ইনভয়েসের শেষ লাইন</label><input class="input" data-set="footer" value="${esc(s.footer)}"/></div>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><h3>ইনভয়েস ও প্রিন্ট</h3></div>
        <div class="field"><label>ডিফল্ট প্রিন্ট ফরম্যাট</label>
          <div class="fmt-pick">
            <button class="${s.printFormat === 'a5' ? 'active' : ''}" data-act="setFmt" data-f="a5"><b>${ui('print', 'inline')} A5 ইনভয়েস</b><span>রঙিন, প্রিমিয়াম ডিজাইন — সাধারণ প্রিন্টার</span></button>
            <button class="${s.printFormat === 'thermal' ? 'active' : ''}" data-act="setFmt" data-f="thermal"><b>${ui('receipt', 'inline')} ৮০মিমি রসিদ</b><span>থার্মাল POS প্রিন্টারের জন্য</span></button>
          </div>
        </div>
        <div class="form-grid">
          <div class="field"><label>ভ্যাট / সার্ভিস চার্জ (%)</label><input class="input num" type="number" min="0" max="50" data-set="vat" value="${s.vat}"/><span class="hint">০ দিলে ইনভয়েসে দেখাবে না</span></div>
          <div class="field"><label>পরের অর্ডার নম্বর</label><input class="input num" type="number" min="1" data-set="nextNo" value="${s.nextNo}"/></div>
        </div>
        <div class="toggle-row"><div><div class="t">সংখ্যা বাংলায় দেখাও</div><div class="s">২০৳ ↔ 20৳</div></div><label class="switch"><input type="checkbox" data-act-change="digits" ${s.digits === 'bn' ? 'checked' : ''}><span></span></label></div>
        <button class="btn btn-ghost" data-act="samplePrint">${ui('eye')} নমুনা ইনভয়েস দেখুন</button>
      </div>

      <div class="card">
        <div class="card-title"><h3>ডাটা ও ব্যাকআপ</h3></div>
        <p class="muted" style="margin:0">সব ডাটা এই ডিভাইসের ব্রাউজারে সেভ থাকে। নিয়মিত ব্যাকআপ ডাউনলোড করে রাখুন — অন্য ডিভাইসে রিস্টোর করা যাবে।</p>
        <div class="data-actions">
          <button class="btn btn-primary" data-act="backup">${ui('download')} ব্যাকআপ ডাউনলোড</button>
          <button class="btn btn-ghost" data-act="restore">${ui('upload')} ব্যাকআপ রিস্টোর</button>
        </div>
        <div class="toggle-row" style="border-top:1px dashed var(--line);padding-top:14px">
          <div><div class="t">ডেমো ডাটা</div><div class="s">${demoCount ? `${bn(demoCount)}টি ডেমো অর্ডার আছে` : 'শেষ ৩০ দিনের নমুনা বিক্রি দিয়ে ড্যাশবোর্ড দেখুন'}</div></div>
          ${demoCount ? `<button class="btn btn-danger btn-sm" data-act="clearDemo">ডেমো মুছুন</button>` : `<button class="btn btn-ghost btn-sm" data-act="demo">${ui('wand')} লোড করুন</button>`}
        </div>
        <div class="data-actions">
          <button class="btn btn-danger" data-act="clearSales">${ui('trash')} সব বিক্রি মুছুন</button>
          <button class="btn btn-danger" data-act="factoryReset">${ui('undo')} ফ্যাক্টরি রিসেট</button>
        </div>
        <input type="file" id="restore-file" accept="application/json,.json" class="hidden" />
      </div>

      <div class="card" style="background:var(--espresso) var(--pattern);color:var(--milk)">
        <img src="assets/logo-reverse.png" alt="" style="width:220px">
        <div class="eyebrow" style="color:var(--gold)">Keyboard shortcuts · দ্রুত কাজ</div>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:8px 16px;font-size:14px">
          <b class="en" style="color:var(--gold)">/</b><span>প্রোডাক্ট খুঁজুন</span>
          <b class="en" style="color:var(--gold)">Enter</b><span>খোঁজার প্রথম প্রোডাক্ট যোগ / পেমেন্ট সম্পন্ন</span>
          <b class="en" style="color:var(--gold)">Ctrl + Enter</b><span>চার্জ করুন (পেমেন্ট)</span>
          <b class="en" style="color:var(--gold)">Alt + 1…5</b><span>পেজ বদলান</span>
          <b class="en" style="color:var(--gold)">Esc</b><span>বন্ধ করুন</span>
        </div>
      </div>
    </div>`;

  $$('[data-set]').forEach((inp) => inp.addEventListener('change', (e) => {
    const k = e.target.dataset.set;
    let v = e.target.value;
    if (k === 'vat') v = clamp(+v || 0, 0, 50);
    if (k === 'nextNo') v = Math.max(1, Math.round(+v || 1));
    S.settings[k] = v; save(); toast('সেভ হয়েছে', 'check');
  }));
  $('#restore-file').addEventListener('change', restoreBackup);
}

function restoreBackup(e) {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = async () => {
    try {
      const data = JSON.parse(r.result);
      if (!data.products || !data.orders || !data.settings) throw new Error('bad');
      if (!(await confirmBox('ব্যাকআপ রিস্টোর করবেন?', `${bn(data.products.length)}টি প্রোডাক্ট ও ${bn(data.orders.length)}টি অর্ডার আসবে। বর্তমান সব ডাটা বদলে যাবে।`, 'রিস্টোর করুন'))) return;
      S = data; S.settings = { ...seed().settings, ...S.settings }; S.token = S.token || { day: '', n: 0 };
      save(); render(); toast('রিস্টোর সম্পন্ন', 'check');
    } catch { toast('ফাইলটি সঠিক ব্যাকআপ না', 'x'); }
    e.target.value = '';
  };
  r.readAsText(file);
}

/* ------------------------------------------------------------ demo data */
function generateDemo() {
  const weights = { dudh: 30, malai: 22, modhu: 12, toast: 18, htoast: 6, bhapa: 14, bhapasp: 4, 'c-study': 8, 'c-winter': 7, 'c-honey': 4, 'c-squad': 2, 'a-malai': 3, 'a-modhu': 2, 'a-makhon': 2 };
  const pool = [];
  S.products.forEach((p) => { for (let i = 0; i < (weights[p.id] || 3); i++) pool.push(p); });
  const hourW = [8, 9, 10, 11, 12, 13, 14, 15, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 19, 20, 20, 21, 21, 22];
  const payW = ['cash', 'cash', 'cash', 'cash', 'cash', 'cash', 'bkash', 'bkash', 'bkash', 'nagad', 'nagad', 'card'];
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const now = new Date();
  const created = [];
  for (let back = 29; back >= 0; back--) {
    const k = addDays(dayKey(), -back);
    const dow = fromKey(k).getDay();
    let n = 26 + Math.floor(Math.random() * 22) + (dow === 5 ? 14 : 0) + (dow === 4 ? 6 : 0) + Math.floor((29 - back) * 0.5);
    if (back === 0) n = Math.round(n * clamp((now.getHours() - 7) / 15, 0.1, 1));
    const stamps = [];
    for (let i = 0; i < n; i++) {
      const h = rnd(hourW); const d = fromKey(k); d.setHours(h, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
      if (back === 0 && d > now) continue;
      stamps.push(d.getTime());
    }
    stamps.sort((a, b) => a - b);
    stamps.forEach((ts, idx) => {
      const lines = {}; const cnt = 1 + Math.floor(Math.random() * Math.random() * 4);
      for (let j = 0; j < cnt; j++) {
        const p = rnd(pool); const size = p.large && Math.random() < 0.22 ? 'L' : 'R'; const key = p.id + size;
        lines[key] = lines[key] || { pid: p.id, name: p.name, en: p.en, cat: p.cat, size, price: size === 'L' ? p.large : p.price, cost: p.cost, qty: 0, color: p.color, icon: p.icon };
        lines[key].qty += Math.random() < 0.25 ? 2 : 1;
      }
      const items = Object.values(lines);
      const subtotal = sum(items, (i) => i.price * i.qty);
      const disc = dow === 2 && Math.random() < 0.35 ? { label: 'Student Tuesday', amt: Math.round(subtotal * 0.1) } : Math.random() < 0.04 ? { label: 'Story Tag', amt: 5 } : null;
      const total = subtotal - (disc?.amt || 0);
      const pay = rnd(payW);
      const received = pay === 'cash' ? (total <= 50 && Math.random() < 0.5 ? Math.ceil(total / 50) * 50 : Math.ceil(total / 10) * 10) : total;
      created.push({ id: uid(), no: 0, token: (idx % 99) + 1, ts, day: k, items, subtotal, discount: disc, vat: 0, vatPct: 0, total, payment: pay, received, change: received - total, customer: { name: '', phone: '' }, note: '', status: Math.random() < 0.01 ? 'void' : 'paid', demo: true });
    });
  }
  const all = [...S.orders, ...created].sort((a, b) => a.ts - b.ts);
  all.forEach((o, i) => { o.no = i + 1; });
  S.orders = all;
  S.settings.nextNo = all.length + 1;
  const todays = all.filter((o) => o.day === dayKey());
  S.token = { day: dayKey(), n: todays.length ? Math.max(...todays.map((o) => o.token)) : 0 };
  save();
}

/* ================================================================ MODAL */
let modalOnClose = null;
function openModal(html, size = '', onClose = null) {
  closeModal(true);
  modalOnClose = onClose;
  $('#modal-root').innerHTML = `<div class="modal-backdrop" data-act="backdrop"><div class="modal ${size}" role="dialog" aria-modal="true">${html}</div></div>`;
}
function closeModal(silent = false) {
  const had = !!$('#modal-root').firstChild;
  $('#modal-root').innerHTML = '';
  if (had && modalOnClose) { const f = modalOnClose; modalOnClose = null; f(); }
  if (!silent) {/* nothing */}
}
function confirmBox(title, msg, ok = 'ঠিক আছে', danger = true) {
  return new Promise((resolve) => {
    openModal(`
      <div class="modal-head"><h3>${title}</h3></div>
      <div class="modal-body"><p style="margin:0;color:var(--muted)">${msg}</p></div>
      <div class="modal-foot"><button class="btn btn-ghost" id="cf-no">না, থাক</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="cf-ok">${ok}</button></div>`, '', () => resolve(false));
    $('#cf-ok').onclick = () => { modalOnClose = null; closeModal(); resolve(true); };
    $('#cf-no').onclick = () => closeModal();
    setTimeout(() => $('#cf-ok')?.focus(), 50);
  });
}

function openCart() { $('#cart')?.classList.add('open'); $('#sheet-bd')?.classList.add('show'); }
function closeCart() { $('#cart')?.classList.remove('open'); $('#sheet-bd')?.classList.remove('show'); }

/* ================================================================ TOAST */
function toast(msg, icon = 'check') {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `${ui(icon)}<span>${esc(msg)}</span>`;
  $('#toast-root').appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 2200);
}

/* ============================================================== ACTIONS */
const ACT = {
  go: (el) => go(el.dataset.v),
  cat: (el) => { st.cat = el.dataset.c; $$('.pos .chip').forEach((c) => c.classList.toggle('active', c.dataset.c === st.cat)); renderGrid(); },
  add: (el) => addToCart(el.dataset.id, el.dataset.size || 'R'),
  inc: (el) => { cart.lines[+el.dataset.i].qty++; saveCart(); renderCart(); renderGrid(); },
  dec: (el) => { const i = +el.dataset.i; if (--cart.lines[i].qty <= 0) cart.lines.splice(i, 1); saveCart(); renderCart(); renderGrid(); },
  clearCart: async () => { if (await confirmBox('অর্ডার খালি করবেন?', 'চলতি অর্ডারের সব আইটেম সরে যাবে।', 'খালি করুন')) { cart = { lines: [], discount: null }; saveCart(); renderCart(); renderGrid(); } },
  disc: (el) => {
    const id = el.dataset.d;
    if (cart.discount && cart.discount.id === id) { cart.discount = null; saveCart(); renderCart(); return; }
    if (id === 'custom') return customDiscount();
    const o = OFFERS.find((x) => x.id === id);
    cart.discount = { id: o.id, label: o.label, type: o.type, value: o.value };
    saveCart(); renderCart();
  },
  checkout: () => openCheckout(),
  payMethod: (el) => {
    st.co.method = el.dataset.m;
    $$('.pay-m').forEach((b) => b.classList.toggle('active', b === el));
    $('#cash-area').classList.toggle('hidden', st.co.method !== 'cash');
  },
  quickCash: (el) => { $('#co-recv').value = el.dataset.v; updateChange(); },
  complete: (el) => completeOrder(el.dataset.print),
  newOrder: () => { closeModal(); if (st.view !== 'pos') go('pos'); else setTimeout(() => $('#pos-q')?.focus(), 50); },
  openCart: () => openCart(),
  closeCart: () => closeCart(),
  closeModal: () => closeModal(),
  backdrop: (el, ev) => { if (ev.target === el) closeModal(); },
  customItem: () => customItemModal(),
  viewOrder: (el) => { const o = S.orders.find((x) => x.id === el.dataset.id); if (o) showOrder(o); },
  printOrder: (el) => { const o = S.orders.find((x) => x.id === el.dataset.id); if (o) printOrder(o, el.dataset.f); },
  voidOrder: async (el) => {
    const o = S.orders.find((x) => x.id === el.dataset.id);
    if (o && await confirmBox(`অর্ডার ${orderNo(o)} বাতিল করবেন?`, 'বাতিল অর্ডার বিক্রির হিসাবে যোগ হবে না। পরে আবার ফিরিয়ে আনা যাবে।', 'বাতিল করুন')) {
      o.status = 'void'; save(); render(); toast('অর্ডার বাতিল হয়েছে', 'trash');
    }
  },
  restoreOrder: (el) => { const o = S.orders.find((x) => x.id === el.dataset.id); if (o) { o.status = 'paid'; save(); closeModal(); render(); toast('অর্ডার ফিরিয়ে আনা হয়েছে', 'undo'); } },
  dashRange: (el) => { st.dashRange = el.dataset.r; render(); },
  openDay: (el) => { st.salesDay = el.dataset.k; if (st.view !== 'sales') go('sales'); else render(); },
  dayShift: (el) => { const n = addDays(st.salesDay || dayKey(), +el.dataset.n); if (n <= dayKey()) { st.salesDay = n; render(); } },
  dayToday: () => { st.salesDay = dayKey(); render(); },
  exportCSV: () => exportCSV(),
  printDay: () => printDay(),
  addProduct: () => productModal(),
  editProduct: (el) => productModal(prodById(el.dataset.id)),
  delProduct: async (el) => {
    const p = prodById(el.dataset.id);
    if (p && await confirmBox(`“${esc(p.name)}” মুছবেন?`, 'আগের বিক্রির হিসাব ঠিক থাকবে, শুধু মেনু থেকে সরে যাবে।', 'মুছে ফেলুন')) {
      S.products = S.products.filter((x) => x.id !== p.id);
      cart.lines = cart.lines.filter((l) => l.pid !== p.id); saveCart();
      save(); render(); toast('প্রোডাক্ট মুছে ফেলা হয়েছে', 'trash');
    }
  },
  prodCat: (el) => { st.prodCat = el.dataset.c; $$('#view .chip').forEach((c) => c.classList.toggle('active', c.dataset.c === st.prodCat)); renderProdList(); },
  addCat: () => { S.categories.push({ id: 'c-' + uid(), name: 'নতুন ক্যাটাগরি', en: '' }); save(); render(); setTimeout(() => { const l = $$('[data-cat-name]').pop(); l?.focus(); l?.select(); }, 30); },
  delCat: async (el) => {
    const c = catById(el.dataset.id); const n = S.products.filter((p) => p.cat === c.id).length;
    if (n) { toast(`এই ক্যাটাগরিতে ${bn(n)}টি প্রোডাক্ট আছে — আগে সরান`, 'x'); return; }
    if (S.categories.length <= 1) return;
    if (await confirmBox(`“${esc(c.name)}” ক্যাটাগরি মুছবেন?`, '', 'মুছুন')) { S.categories = S.categories.filter((x) => x.id !== c.id); save(); render(); }
  },
  setFmt: (el) => { S.settings.printFormat = el.dataset.f; save(); render(); toast('ডিফল্ট প্রিন্ট ফরম্যাট সেভ হয়েছে', 'check'); },
  samplePrint: () => {
    const last = [...S.orders].reverse().find((o) => o.status !== 'void');
    const o = last || { id: 'sample', no: 42, token: 7, ts: Date.now(), day: dayKey(), items: [
      { pid: 'malai', name: 'মালাই চা', en: 'Malai Mood', size: 'R', price: 45, qty: 2, color: '#F3E3C3' },
      { pid: 'bhapa', name: 'ভাপা পিঠা', en: 'Bhapa Love', size: 'R', price: 25, qty: 2, color: '#C8553D' },
      { pid: 'toast', name: 'পোড়া পাউরুটি', en: 'Pora Toast', size: 'R', price: 25, qty: 1, color: '#9A5B2B' }],
      subtotal: 165, discount: null, vat: 0, vatPct: 0, total: 165, payment: 'cash', received: 200, change: 35, customer: { name: 'রাফি', phone: '01XXXXXXXXX' }, note: '', status: 'paid' };
    showOrder(o);
    if (!last) $$('.modal-foot [data-act="printOrder"]').forEach((b) => { b.dataset.act = 'printSample'; });
    ACT.printSample = (b) => printOrder(o, b.dataset.f);
  },
  backup: () => { download(`aura-pos-backup-${dayKey()}.json`, JSON.stringify(S, null, 1), 'application/json'); toast('ব্যাকআপ ডাউনলোড হয়েছে', 'download'); },
  restore: () => $('#restore-file').click(),
  demo: async () => {
    if (S.orders.some((o) => !o.demo) && !(await confirmBox('ডেমো ডাটা যোগ করবেন?', 'আপনার আসল বিক্রির সাথে নমুনা অর্ডার মিশে যাবে। পরে “ডেমো মুছুন” দিয়ে শুধু ডেমোগুলো সরানো যাবে।', 'যোগ করুন', false))) return;
    generateDemo(); render(); toast('ডেমো ডাটা লোড হয়েছে', 'wand');
  },
  clearDemo: async () => {
    if (await confirmBox('ডেমো অর্ডার মুছবেন?', 'শুধু নমুনা অর্ডারগুলো মুছবে, আপনার আসল বিক্রি থাকবে।', 'মুছুন')) {
      S.orders = S.orders.filter((o) => !o.demo);
      S.settings.nextNo = S.orders.reduce((m, o) => Math.max(m, o.no), 0) + 1;
      const td = S.orders.filter((o) => o.day === dayKey());
      S.token = { day: dayKey(), n: td.length ? Math.max(...td.map((o) => o.token)) : 0 };
      save(); render(); toast('ডেমো ডাটা মুছে ফেলা হয়েছে', 'trash');
    }
  },
  clearSales: async () => {
    if (await confirmBox('সব বিক্রি মুছবেন?', 'সব অর্ডার স্থায়ীভাবে মুছে যাবে। প্রোডাক্ট থাকবে। আগে ব্যাকআপ নিয়ে রাখুন।', 'সব মুছুন')) {
      S.orders = []; S.settings.nextNo = 1; S.token = { day: '', n: 0 }; save(); render(); toast('সব বিক্রি মুছে ফেলা হয়েছে', 'trash');
    }
  },
  factoryReset: async () => {
    if (await confirmBox('ফ্যাক্টরি রিসেট?', 'সব প্রোডাক্ট, অর্ডার ও সেটিংস মুছে প্রথম অবস্থায় ফিরে যাবে।', 'রিসেট করুন')) {
      S = seed(); cart = { lines: [], discount: null }; save(); saveCart(); render(); toast('রিসেট সম্পন্ন', 'undo');
    }
  },
};

function customDiscount() {
  openModal(`
    <div class="modal-head"><h3>কাস্টম ছাড়</h3><button class="icon-btn" data-act="closeModal">${ui('x')}</button></div>
    <div class="modal-body">
      <div class="seg" style="margin-bottom:14px"><button class="active" data-t="amt" id="cd-amt">টাকা (৳)</button><button data-t="pct" id="cd-pct">শতাংশ (%)</button></div>
      <div class="form-grid">
        <div class="field"><label>পরিমাণ</label><input class="input num" id="cd-v" type="number" inputmode="numeric" min="0" placeholder="১০" /></div>
        <div class="field"><label>কারণ</label><input class="input" id="cd-l" placeholder="যেমন: Birthday Mood" /></div>
      </div>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" data-act="closeModal">বাতিল</button><button class="btn btn-primary" id="cd-ok">${ui('check')} ছাড় দিন</button></div>`);
  let type = 'amt';
  ['amt', 'pct'].forEach((t) => $('#cd-' + t).addEventListener('click', () => { type = t; $('#cd-amt').classList.toggle('active', t === 'amt'); $('#cd-pct').classList.toggle('active', t === 'pct'); }));
  const ok = () => {
    const v = +$('#cd-v').value;
    if (!(v > 0)) { toast('পরিমাণ দিন', 'x'); return; }
    const lbl = $('#cd-l').value.trim() || 'বিশেষ ছাড়';
    cart.discount = { id: 'custom', label: `${lbl} −${type === 'pct' ? bn(v) + '%' : money(v)}`, type, value: type === 'pct' ? clamp(v, 0, 100) : v };
    saveCart(); closeModal(); renderCart();
  };
  $('#cd-ok').addEventListener('click', ok);
  $('#cd-v').addEventListener('keydown', (e) => { if (e.key === 'Enter') ok(); });
  setTimeout(() => $('#cd-v').focus(), 60);
}

/* ============================================================== EVENTS */
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el) return;
  const fn = ACT[el.dataset.act];
  if (fn) { if (el.dataset.act !== 'backdrop') ev.preventDefault(); fn(el, ev); }
});
document.addEventListener('change', (ev) => {
  const el = ev.target.closest('[data-act-change]');
  if (!el) return;
  const a = el.dataset.actChange;
  if (a === 'toggleActive') {
    const p = prodById(el.dataset.id); if (!p) return;
    p.active = el.checked; save();
    el.closest('.prow')?.classList.toggle('off', !p.active);
    setHeader('প্রোডাক্ট', `${bn(S.products.length)}টি প্রোডাক্ট · ${bn(S.products.filter((x) => x.active).length)}টি আজ মেনুতে`, $('#topbar-actions').innerHTML);
    toast(p.active ? `“${p.name}” আজ মেনুতে আছে` : `“${p.name}” মেনু থেকে সরানো হয়েছে`, p.active ? 'check' : 'eye');
  }
  if (a === 'digits') { S.settings.digits = el.checked ? 'bn' : 'en'; save(); render(); }
});
document.addEventListener('input', (ev) => {
  if (ev.target.id === 'pos-q') { st.q = ev.target.value; renderGrid(); }
});
document.addEventListener('keydown', (ev) => {
  const tag = (ev.target.tagName || '').toLowerCase();
  const typing = tag === 'input' || tag === 'textarea' || tag === 'select';
  const modalOpen = !!$('#modal-root').firstChild;

  if (ev.key === 'Escape') {
    if (modalOpen) closeModal();
    else if ($('#cart.open')) closeCart();
    else if (ev.target.id === 'pos-q') { st.q = ''; ev.target.value = ''; renderGrid(); ev.target.blur(); }
    return;
  }
  if (ev.altKey && /^[1-5]$/.test(ev.key)) { ev.preventDefault(); closeModal(); go(NAV[+ev.key - 1].id); return; }
  if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') {
    ev.preventDefault();
    if (st.co && modalOpen) $('#co-main')?.click();
    else if (st.view === 'pos' && !modalOpen) openCheckout();
    return;
  }
  if (ev.key === 'Enter' && st.co && modalOpen && tag !== 'button' && tag !== 'summary') { ev.preventDefault(); $('#co-main')?.click(); return; }
  if (ev.key === 'Enter' && ev.target.id === 'pos-q') {
    const first = filteredPOSProducts()[0];
    if (first) { addToCart(first.id, 'R'); ev.target.value = ''; st.q = ''; renderGrid(); }
    return;
  }
  if (ev.key === 'Enter' && ev.target.classList?.contains('pcard')) { ev.target.click(); return; }
  if (!typing && !modalOpen && ev.key === '/' && st.view === 'pos') { ev.preventDefault(); $('#pos-q')?.focus(); }
});

/* tooltips on charts */
const tip = $('#tip');
const showTip = (el, x, y) => {
  tip.innerHTML = el.dataset.tip; tip.classList.add('show');
  const r = tip.getBoundingClientRect();
  tip.style.left = clamp(x - r.width / 2, 8, innerWidth - r.width - 8) + 'px';
  tip.style.top = Math.max(8, y - r.height - 14) + 'px';
};
document.addEventListener('pointermove', (ev) => {
  const el = ev.target.closest?.('[data-tip]');
  if (el) showTip(el, ev.clientX, ev.clientY); else tip.classList.remove('show');
});
document.addEventListener('pointerdown', (ev) => {
  const el = ev.target.closest?.('[data-tip]');
  if (el && ev.pointerType !== 'mouse') showTip(el, ev.clientX, ev.clientY);
});

let rT;
window.addEventListener('resize', () => {
  clearTimeout(rT);
  rT = setTimeout(() => { if (st.view === 'dashboard') drawDashCharts(paidOrders().filter((o) => inRange(o, rangeDays(st.dashRange)))); fitPreview(); }, 150);
});
window.addEventListener('hashchange', () => { closeModal(); closeCart(); go(location.hash.slice(1)); });
window.addEventListener('storage', (e) => { if (e.key === KEY) { try { S = JSON.parse(e.newValue); render(); } catch {} } });
window.addEventListener('afterprint', () => { $('#print-root').innerHTML = ''; });

/* clock */
function tick() {
  const d = new Date();
  $('#side-clock').innerHTML = `${fmtTime(d).replace(/^(সকাল|দুপুর|বিকাল|সন্ধ্যা|রাত) /, '')}<small>${weekday(dayKey(d))}, ${fmtDate(dayKey(d))}</small>`;
}

/* boot */
st.view = location.hash.slice(1) || 'pos';
go(st.view);
tick(); setInterval(tick, 20000);
['assets/logo-reverse.png', 'assets/logo-primary.png', 'assets/glass.png'].forEach((s) => { const i = new Image(); i.src = s; });
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
