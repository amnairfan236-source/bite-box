/* =========================================================
   BiteBox – script.js
   Menu rendering, category filter, cart, checkout, forms
   ========================================================= */

/* ---------- DATA ----------
   Each item uses an emoji as its "image". To use real photos,
   add an `img: 'url'` field and swap the .item-img markup in renderMenu(). */
const MENU = [
  { id: 1,  cat: 'Burgers',  name: 'Classic Cheeseburger', emoji: '🍔', price: 6.99, desc: 'Beef patty, cheddar, pickles, house sauce.' },
  { id: 2,  cat: 'Burgers',  name: 'Double Smash',         emoji: '🍔', price: 8.99, desc: 'Two smashed patties, caramelised onion, American cheese.' },
  { id: 3,  cat: 'Burgers',  name: 'Crispy Chicken',       emoji: '🐔', price: 7.49, desc: 'Buttermilk fried chicken, slaw, spicy mayo.' },
  { id: 4,  cat: 'Pizzas',   name: 'Margherita',           emoji: '🍕', price: 9.99, desc: 'Tomato, fresh mozzarella, basil.' },
  { id: 5,  cat: 'Pizzas',   name: 'Pepperoni Feast',      emoji: '🍕', price: 11.49, desc: 'Double pepperoni, mozzarella, oregano.' },
  { id: 6,  cat: 'Pizzas',   name: 'BBQ Chicken',          emoji: '🍕', price: 11.99, desc: 'Smoky BBQ base, grilled chicken, red onion.' },
  { id: 7,  cat: 'Fries',    name: 'Salted Fries',         emoji: '🍟', price: 2.99, desc: 'Golden, crisp and lightly salted.' },
  { id: 8,  cat: 'Fries',    name: 'Cheesy Loaded Fries',  emoji: '🧀', price: 4.99, desc: 'Cheese sauce, jalapeños, crispy onions.' },
  { id: 9,  cat: 'Fries',    name: 'Sweet Potato Fries',   emoji: '🍠', price: 3.99, desc: 'Served with garlic aioli.' },
  { id: 10, cat: 'Drinks',   name: 'Cola',                 emoji: '🥤', price: 1.99, desc: 'Ice-cold 500 ml bottle.' },
  { id: 11, cat: 'Drinks',   name: 'Fresh Lemonade',       emoji: '🍋', price: 2.79, desc: 'Squeezed daily with a hint of mint.' },
  { id: 12, cat: 'Drinks',   name: 'Chocolate Shake',      emoji: '🥛', price: 4.49, desc: 'Thick, creamy and topped with whipped cream.' },
  { id: 13, cat: 'Desserts', name: 'Chocolate Brownie',    emoji: '🍫', price: 3.99, desc: 'Warm, fudgy and served with a dusting of cocoa.' },
  { id: 14, cat: 'Desserts', name: 'Vanilla Sundae',       emoji: '🍨', price: 3.49, desc: 'Soft serve, caramel drizzle, crushed nuts.' },
  { id: 15, cat: 'Desserts', name: 'Glazed Donuts (3)',    emoji: '🍩', price: 4.29, desc: 'Three fresh donuts with sugar glaze.' }
];

const REVIEWS = [
  { name: 'Sara M.',  stars: 5, text: 'The Double Smash is unreal, and my order arrived steaming hot in 25 minutes.' },
  { name: 'Daniel K.', stars: 5, text: 'Best loaded fries in town. Packaging kept everything crispy.' },
  { name: 'Aisha R.', stars: 4, text: 'Great pizza and friendly delivery. I would love more dessert options.' }
];

const CATEGORIES = ['Burgers', 'Pizzas', 'Fries', 'Drinks', 'Desserts'];
// Photo search keywords per category. Add `img: 'your-photo-url'` to any MENU item to use your own picture.
const KW = { Burgers: 'burger', Pizzas: 'pizza', Fries: 'fries', Drinks: 'milkshake', Desserts: 'dessert' };
const CART_KEY = 'bitebox_cart';

/* ---------- STATE ---------- */
let activeCat = CATEGORIES[0];
let cart = loadCart(); // [{ id, qty }]

/* ---------- HELPERS ---------- */
const $ = (sel) => document.querySelector(sel);
const money = (n) => '$' + n.toFixed(2);
const findItem = (id) => MENU.find((m) => m.id === id);

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* storage unavailable */ }
}
function cartTotal() {
  return cart.reduce((sum, c) => sum + findItem(c.id).price * c.qty, 0);
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- MENU: TABS + GRID ---------- */
function renderTabs() {
  $('#tabs').innerHTML = CATEGORIES.map((c) =>
    `<button class="tab ${c === activeCat ? 'active' : ''}" role="tab" aria-selected="${c === activeCat}" data-cat="${c}">${c}</button>`
  ).join('');
}

function renderMenu() {
  $('#menu-grid').innerHTML = MENU.filter((m) => m.cat === activeCat).map((m) => `
    <article class="item">
      <div class="item-img"><img src="${m.img || `https://loremflickr.com/480/320/${KW[m.cat]}?lock=${m.id}`}" alt="${m.name}" loading="lazy" onerror="this.replaceWith(document.createTextNode('${m.emoji}'))"></div>
      <div class="item-body">
        <h3>${m.name}</h3>
        <p>${m.desc}</p>
        <div class="item-foot">
          <span class="price">${money(m.price)}</span>
          <button class="btn" data-add="${m.id}">Add to Cart</button>
        </div>
      </div>
    </article>`).join('');
}

$('#tabs').addEventListener('click', (e) => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  activeCat = tab.dataset.cat;
  renderTabs();
  renderMenu();
});

$('#menu-grid').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-add]');
  if (!btn) return;
  addToCart(Number(btn.dataset.add));
});

/* ---------- CART LOGIC ---------- */
function addToCart(id) {
  const line = cart.find((c) => c.id === id);
  line ? line.qty++ : cart.push({ id, qty: 1 });
  updateCart();
  toast(`${findItem(id).name} added to cart`);
  const badge = $('#cart-count');
  badge.classList.remove('pop');
  void badge.offsetWidth; // restart animation
  badge.classList.add('pop');
}

function changeQty(id, delta) {
  const line = cart.find((c) => c.id === id);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) cart = cart.filter((c) => c.id !== id);
  updateCart();
}

function removeItem(id) {
  cart = cart.filter((c) => c.id !== id);
  updateCart();
}

function updateCart() {
  saveCart();
  const count = cart.reduce((n, c) => n + c.qty, 0);
  $('#cart-count').textContent = count;
  $('#subtotal').textContent = money(cartTotal());
  $('#checkout-btn').disabled = cart.length === 0;
  $('#checkout-btn').style.opacity = cart.length ? 1 : .5;

  $('#cart-items').innerHTML = cart.length
    ? cart.map((c) => {
        const m = findItem(c.id);
        return `
        <div class="cart-row">
          <div class="thumb" aria-hidden="true">${m.emoji}</div>
          <div>
            <h4>${m.name}</h4>
            <small>${money(m.price)} each</small>
            <div class="qty">
              <button data-dec="${m.id}" aria-label="Decrease quantity">−</button>
              <span>${c.qty}</span>
              <button data-inc="${m.id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div style="text-align:right">
            <strong>${money(m.price * c.qty)}</strong><br>
            <button class="remove" data-rm="${m.id}">Remove</button>
          </div>
        </div>`;
      }).join('')
    : '<p class="empty">Your cart is empty.<br>Add something tasty from the menu.</p>';
}

$('#cart-items').addEventListener('click', (e) => {
  const t = e.target;
  if (t.dataset.inc) changeQty(Number(t.dataset.inc), 1);
  if (t.dataset.dec) changeQty(Number(t.dataset.dec), -1);
  if (t.dataset.rm)  removeItem(Number(t.dataset.rm));
});

/* ---------- DRAWER OPEN / CLOSE ---------- */
function openDrawer() {
  $('#drawer').classList.add('open');
  $('#drawer').setAttribute('aria-hidden', 'false');
  $('#overlay').classList.add('show');
}
function closeDrawer() {
  $('#drawer').classList.remove('open');
  $('#drawer').setAttribute('aria-hidden', 'true');
  $('#overlay').classList.remove('show');
}
$('#cart-open').addEventListener('click', openDrawer);
$('#cart-close').addEventListener('click', closeDrawer);
$('#overlay').addEventListener('click', closeDrawer);

/* ---------- CHECKOUT MODAL ---------- */
function openModal() {
  if (!cart.length) return toast('Your cart is empty');
  $('#modal-total').textContent = money(cartTotal());
  $('#checkout-view').hidden = false;
  $('#success-view').hidden = true;
  $('#modal').classList.add('show');
  $('#modal').setAttribute('aria-hidden', 'false');
  closeDrawer();
  setTimeout(() => $('#o-name').focus(), 100);
}
function closeModal() {
  $('#modal').classList.remove('show');
  $('#modal').setAttribute('aria-hidden', 'true');
}
$('#checkout-btn').addEventListener('click', openModal);
$('#modal-close').addEventListener('click', closeModal);
$('#success-close').addEventListener('click', closeModal);
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeModal(); closeDrawer(); }
});

/* ---------- FORM VALIDATION ---------- */
// Shows an error under a field; returns true when the field is valid.
function check(input, ok, message) {
  const err = input.parentElement.querySelector('.err');
  input.classList.toggle('invalid', !ok);
  err.textContent = ok ? '' : message;
  return ok;
}

$('#checkout-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#o-name'), phone = $('#o-phone'), addr = $('#o-address');
  const results = [
    check(name,  name.value.trim().length >= 2, 'Enter your full name.'),
    check(phone, /^\+?[0-9\s\-()]{7,15}$/.test(phone.value.trim()), 'Enter a valid phone number (7 to 15 digits).'),
    check(addr,  addr.value.trim().length >= 10, 'Enter your full delivery address.')
  ];
  if (results.includes(false)) return;

  const orderNo = 'BB' + Math.floor(100000 + Math.random() * 900000);
  $('#success-msg').textContent =
    `Thanks, ${name.value.trim()}! Order ${orderNo} will arrive in about 30 minutes. Please have ${money(cartTotal())} ready in cash.`;
  $('#checkout-view').hidden = true;
  $('#success-view').hidden = false;

  cart = [];            // clear the cart after a successful order
  updateCart();
  e.target.reset();
});

$('#contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#c-name'), email = $('#c-email'), msg = $('#c-msg');
  const results = [
    check(name,  name.value.trim().length >= 2, 'Enter your name.'),
    check(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()), 'Enter a valid email address.'),
    check(msg,   msg.value.trim().length >= 10, 'Message must be at least 10 characters.')
  ];
  if (results.includes(false)) return;
  e.target.reset();
  toast('Message sent! We will reply within 24 hours.');
});

/* ---------- REVIEWS ---------- */
function renderReviews() {
  $('#reviews-grid').innerHTML = REVIEWS.map((r) => `
    <article class="review">
      <div class="stars" aria-label="${r.stars} out of 5 stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
      <p>${r.text}</p>
      <strong>${r.name}</strong>
    </article>`).join('');
}

/* ---------- MOBILE NAV ---------- */
const navLinks = $('#nav-links'), toggle = $('#menu-toggle');
toggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
navLinks.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') { navLinks.classList.remove('open'); toggle.setAttribute('aria-expanded', false); }
});

/* ---------- INIT ---------- */
$('#year').textContent = new Date().getFullYear(); // dynamic copyright year
renderTabs();
renderMenu();
renderReviews();
updateCart();