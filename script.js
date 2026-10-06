// Replace this placeholder with the business WhatsApp number in international format, without + or spaces.
const WHATSAPP_NUMBER = "234000000000";
const CART_STORAGE_KEY = "fmk-clothing-abuja-cart";

const products = [
  { id: "native", name: "Classic Native Outfit", category: "Men", groups: ["men", "cultural"], price: 85000, image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=82", alt: "Man wearing a refined traditional-inspired outfit", badge: "POPULAR" },
  { id: "elegant-dress", name: "Elegant Women's Dress", category: "Women", groups: ["women"], price: 75000, image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=82", alt: "Elegant flowing women's fashion dress", badge: "NEW" },
  { id: "heritage", name: "African Heritage Collection", category: "Cultural", groups: ["cultural", "men"], price: 95000, image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=82", alt: "Contemporary fashion look with rich African-inspired styling", badge: "" },
  { id: "senator", name: "Premium Senator Wear", category: "Men", groups: ["men", "cultural"], price: 120000, image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=800&q=82", alt: "Tailored premium menswear outfit", badge: "POPULAR" },
  { id: "ankara", name: "Modern Ankara Style", category: "Women", groups: ["women", "cultural"], price: 65000, image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=82", alt: "Modern patterned women's fashion", badge: "NEW" },
  { id: "two-piece", name: "Cultural Two-Piece", category: "Cultural", groups: ["cultural", "women"], price: 90000, image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=82", alt: "Two-piece contemporary fashion ensemble", badge: "" },
  { id: "agbada", name: "Classic Agbada Set", category: "Men", groups: ["men", "cultural"], price: 150000, image: "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=800&q=82", alt: "Formal traditional-inspired menswear", badge: "EXCLUSIVE" },
  { id: "accessories", name: "Fashion Accessories", category: "Accessories", groups: ["accessories"], price: 25000, image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=82", alt: "Fashion accessories curated for a polished look", badge: "" }
];

const productGrid = document.querySelector("#product-grid");
const cartDrawer = document.querySelector(".cart-drawer");
const cartBackdrop = document.querySelector(".drawer-backdrop");
const cartTrigger = document.querySelector(".cart-trigger");
const cartClose = document.querySelector(".cart-close");
const cartItemsElement = document.querySelector(".cart-items");
const cartEmpty = document.querySelector(".cart-empty");
const cartTotal = document.querySelector(".cart-total strong");
const checkoutButton = document.querySelector(".checkout-button");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

let cart = loadCart();
let lastFocusedElement = null;

function formatPrice(value) {
  return `₦${new Intl.NumberFormat("en-NG").format(value)}`;
}

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    if (!Array.isArray(savedCart)) return [];
    return savedCart.filter((item) =>
      products.some((product) => product.id === item.id) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    );
  } catch (error) {
    console.error("Unable to load the saved FMK shopping bag.", error);
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Unable to save the FMK shopping bag.", error);
  }
}

function renderProducts(filter = "all") {
  const visibleProducts = products.filter((product) =>
    filter === "all" || product.groups.includes(filter)
  );
  productGrid.innerHTML = visibleProducts.map((product, index) => `
    <article class="product-card" style="animation-delay:${index * 45}ms">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.alt}" loading="lazy">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-bottom">
          <span class="product-price">${formatPrice(product.price)}</span>
          <button class="add-button" type="button" data-add="${product.id}" aria-label="Add ${product.name} to cart">Add to bag +</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const total = cart.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  document.querySelector(".cart-count").textContent = count;
  document.querySelector(".drawer-count").textContent = `(${count})`;
  cartTotal.textContent = formatPrice(total);
  cartEmpty.classList.toggle("is-visible", cart.length === 0);
  cartItemsElement.hidden = cart.length === 0;
  checkoutButton.disabled = cart.length === 0;
  cartItemsElement.innerHTML = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    if (!product) return "";
    return `
      <article class="cart-line">
        <img src="${product.image}" alt="${product.alt}">
        <div>
          <h3>${product.name}</h3>
          <span class="cart-line-price">${formatPrice(product.price)}</span>
          <div class="quantity-control" aria-label="Quantity for ${product.name}">
            <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Decrease ${product.name} quantity">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-quantity="${product.id}" data-change="1" aria-label="Increase ${product.name} quantity">+</button>
          </div>
        </div>
        <button class="remove-item" type="button" data-remove="${product.id}" aria-label="Remove ${product.name} from cart">Remove</button>
      </article>
    `;
  }).join("");
}

function addToCart(productId) {
  const item = cart.find((entry) => entry.id === productId);
  if (item) item.quantity += 1;
  else cart.push({ id: productId, quantity: 1 });
  saveCart();
  renderCart();
}

function changeQuantity(productId, change) {
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) cart = cart.filter((entry) => entry.id !== productId);
  saveCart();
  renderCart();
}

function openCart() {
  lastFocusedElement = document.activeElement;
  cartBackdrop.hidden = false;
  requestAnimationFrame(() => {
    cartBackdrop.classList.add("is-visible");
    cartDrawer.classList.add("is-open");
  });
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  cartClose.focus();
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartBackdrop.classList.remove("is-visible");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  window.setTimeout(() => { cartBackdrop.hidden = true; }, 300);
  if (lastFocusedElement) lastFocusedElement.focus();
}

function createWhatsAppUrl() {
  const lines = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return `${product.name} × ${item.quantity} — ${formatPrice(product.price * item.quantity)}`;
  });
  const total = cart.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return sum + product.price * item.quantity;
  }, 0);
  const message = [
    "Hello FMK Clothing Abuja,",
    "",
    "I would like to place an order:",
    "",
    ...lines,
    "",
    `Total: ${formatPrice(total)}`,
    "",
    "Please let me know how I can complete my order."
  ].join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function openWhatsAppOrder() {
  if (cart.length === 0) return;
  window.open(createWhatsAppUrl(), "_blank", "noopener,noreferrer");
}

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".filter-button.is-active")?.classList.remove("is-active");
    document.querySelector(".filter-button[aria-pressed='true']")?.setAttribute("aria-pressed", "false");
    button.classList.add("is-active");
    button.setAttribute("aria-pressed", "true");
    renderProducts(button.dataset.filter);
  });
});

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) addToCart(addButton.dataset.add);
});

cartItemsElement.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) changeQuantity(quantityButton.dataset.quantity, Number(quantityButton.dataset.change));
  if (removeButton) {
    cart = cart.filter((item) => item.id !== removeButton.dataset.remove);
    saveCart();
    renderCart();
  }
});

cartTrigger.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);
checkoutButton.addEventListener("click", openWhatsAppOrder);
document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
  link.href = `https://wa.me/${WHATSAPP_NUMBER}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
});
document.querySelector("[data-close-cart]").addEventListener("click", closeCart);

menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  menuToggle.setAttribute("aria-label", expanded ? "Open navigation menu" : "Close navigation menu");
  navLinks.classList.toggle("is-open", !expanded);
});
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    navLinks.classList.remove("is-open");
  });
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) closeCart();
  if (event.key === "Escape" && navLinks.classList.contains("is-open")) {
    navLinks.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    menuToggle.focus();
  }
});

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-revealed"));
}

renderProducts();
renderCart();
