// ============================================================
// cart.js — เชื่อมตะกร้า localStorage + Database
// ============================================================

const API_BASE = "http://localhost:3000/api";

class CartManager {
  constructor() {
    this.user = JSON.parse(localStorage.getItem("user")) || null;
    this.userId = this.user ? (this.user.user_id || this.user.id) : null;
    this.init();
  }

  // ─── INIT ────────────────────────────────────────────────
  async init() {
    if (this.userId) {
      // มี user → sync จาก DB มาก่อน แล้วค่อย render
      await this.syncFromDB();
    }
    this.renderCart();
    this.setupEventListeners();
  }

  // ─── LOCAL STORAGE ────────────────────────────────────────
  getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }

  saveCartLocal(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    try {
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { cart } }));
    } catch (e) {
      window.dispatchEvent(new Event("cartUpdated"));
    }
  }

  // ─── SYNC จาก DB → localStorage ──────────────────────────
  async syncFromDB() {
    try {
      const res = await fetch(`${API_BASE}/cart/${this.userId}`);
      const data = await res.json();

      if (data.status === "success") {
        // แปลง format ให้ตรงกับ localStorage เดิม
        const cart = data.data.map(item => ({
          cart_id:    item.cart_id,
          product_id: item.product_id,
          name:       item.name,
          price:      parseFloat(item.price) || 0,
          image:      item.image,
          quantity:   item.quantity,
          expire_date: item.expire_date,
          days_left:  item.days_left
        }));
        this.saveCartLocal(cart);
      }
    } catch (err) {
      console.error("SYNC FROM DB ERROR:", err);
      // ถ้า sync ไม่ได้ → ใช้ localStorage ที่มีอยู่ต่อ
    }
  }

  // ─── RENDER CART ──────────────────────────────────────────
  renderCart() {
    const cart = this.getCart();
    const cartContent = document.getElementById("cart-items");
    if (!cartContent) return;

    if (cart.length === 0) {
      this.showEmptyCart();
      return;
    }

    // Header
    const header = document.createElement("div");
    header.className = "cart-header";
    header.innerHTML = `
      <div></div>
      <div>ชื่อสินค้า</div>
      <div>ราคา</div>
      <div>จำนวน</div>
      <div>รวม</div>
      <div></div>
    `;
    cartContent.innerHTML = "";
    cartContent.appendChild(header);

    cart.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.setAttribute("data-cart-id", item.cart_id || "");

      row.innerHTML = `
        <div>
          <input type="checkbox" class="item-checkbox" checked>
        </div>
        <div class="product-info">
          <img src="${API_BASE.replace("/api", "")}/uploads/${item.image}" width="80" onerror="this.src='img/no-image.png'">
          <span>${item.name}</span>
          ${item.days_left <= 3 ? `<span class="badge-expire">หมดอายุใน ${item.days_left} วัน</span>` : ""}
        </div>
        <div>${(parseFloat(item.price) || 0).toFixed(2)} บาท</div>
        <div class="qty-controls">
          <button class="minus-btn" data-index="${index}">-</button>
          <span>${item.quantity}</span>
          <button class="plus-btn" data-index="${index}">+</button>
        </div>
        <div>${((parseFloat(item.price) || 0) * item.quantity).toFixed(2)} บาท</div>
        <div>
          <button class="delete-btn" data-index="${index}">ลบ</button>
        </div>
      `;
      cartContent.appendChild(row);
    });

    this.updateCartSummary();
  }

  showEmptyCart() {
    const cartContent = document.getElementById("cart-items");
    cartContent.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <div class="empty-cart-text">ตะกร้าว่างเปล่า</div>
        <a href="home.html" class="continue-shopping">กลับไปช้อปปิ้ง</a>
      </div>
    `;
    const cartSummary = document.getElementById("cart-summary");
    if (cartSummary) {
      cartSummary.innerHTML = `
        <div class="cart-summary">
          <div class="summary-title">สรุปคำสั่งซื้อ</div>
          <button class="checkout-btn" disabled>สั่งซื้อ</button>
        </div>
      `;
    }
  }

  updateCartSummary() {
    const cart = this.getCart();
    const subtotal = cart.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * item.quantity), 0);
    const shipping = 0;
    const total = subtotal + shipping;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("subtotal",      subtotal.toFixed(2));
    set("shipping",      shipping.toFixed(2));
    set("total",         total.toFixed(2));
    set("cart-subtotal", subtotal.toFixed(2) + " บาท");
    set("shipping-fee",  shipping.toFixed(2) + " บาท");
    set("cart-grand",    total.toFixed(2) + " บาท");

    // Badge จำนวนสินค้า
    const badge = document.getElementById("cartBadge");
    const qty = cart.reduce((s, item) => s + (item.quantity || 0), 0);
    if (badge) badge.textContent = qty;
  }

  // ─── INCREASE QTY ─────────────────────────────────────────
  async increaseQty(index) {
    const cart = this.getCart();
    if (!cart[index]) return;

    const newQty = cart[index].quantity + 1;

    if (this.userId && cart[index].cart_id) {
      const ok = await this.updateQtyDB(cart[index].cart_id, newQty);
      if (!ok) return; // หยุดถ้า DB บอก error (เช่น stock ไม่พอ)
    }

    cart[index].quantity = newQty;
    this.saveCartLocal(cart);
    this.renderCart();
  }

  // ─── DECREASE QTY ─────────────────────────────────────────
  async decreaseQty(index) {
    const cart = this.getCart();
    if (!cart[index] || cart[index].quantity <= 1) return;

    const newQty = cart[index].quantity - 1;

    if (this.userId && cart[index].cart_id) {
      const ok = await this.updateQtyDB(cart[index].cart_id, newQty);
      if (!ok) return;
    }

    cart[index].quantity = newQty;
    this.saveCartLocal(cart);
    this.renderCart();
  }

  // ─── UPDATE QTY ใน DB ─────────────────────────────────────
  async updateQtyDB(cartId, quantity) {
    try {
      const res = await fetch(`${API_BASE}/cart/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_id: cartId, quantity })
      });
      const data = await res.json();
      if (data.status !== "success") {
        alert(data.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error("UPDATE QTY DB ERROR:", err);
      return false;
    }
  }

  // ─── REMOVE ITEM ──────────────────────────────────────────
  async removeItem(index) {
    if (!confirm("ยืนยันการลบสินค้า?")) return;

    const cart = this.getCart();
    const item = cart[index];

    if (this.userId && item.cart_id) {
      try {
        await fetch(`${API_BASE}/cart/remove/${item.cart_id}`, { method: "DELETE" });
      } catch (err) {
        console.error("REMOVE DB ERROR:", err);
      }
    }

    cart.splice(index, 1);
    this.saveCartLocal(cart);
    this.renderCart();
  }

  // ─── PROCEED TO CHECKOUT ──────────────────────────────────
  proceedToCheckout() {
    const cart = this.getCart();
    if (cart.length === 0) {
      alert("ตะกร้าว่างเปล่า");
      return;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "checkout.html";
  }

  // ─── EVENT LISTENERS ──────────────────────────────────────
  setupEventListeners() {
    const cartContent = document.getElementById("cart-items");
    if (!cartContent) return;

    cartContent.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index);
      if (e.target.classList.contains("plus-btn"))   this.increaseQty(index);
      else if (e.target.classList.contains("minus-btn")) this.decreaseQty(index);
      else if (e.target.classList.contains("delete-btn")) this.removeItem(index);
    });

    document.querySelectorAll(".item-checkbox").forEach(cb => {
      cb.addEventListener("change", () => this.updateCheckoutButton());
    });
  }

  updateCheckoutButton() {
    const checked = document.querySelectorAll(".item-checkbox:checked");
    const btn = document.querySelector(".checkout-btn");
    if (btn) btn.disabled = checked.length === 0;
  }
}

// ─── ฟังก์ชัน addToCart สำหรับเรียกจากหน้า home ──────────────
// ใช้: addToCart(product_id)  ใส่ใน onclick ของปุ่ม
async function addToCart(productId) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    if (typeof Swal !== "undefined") {
      await Swal.fire("แจ้งเตือน", "กรุณา Login ก่อนเพิ่มสินค้า", "warning");
    } else {
      alert("กรุณา Login ก่อนเพิ่มสินค้า");
    }
    window.location.href = "index.html";
    return;
  }

  const userId = user.user_id || user.id;

  try {
    const res = await fetch(`${API_BASE}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, product_id: productId, quantity: 1 })
    });

    const data = await res.json();

    if (data.status === "success") {
      // อัปเดต badge
      updateCartBadge();

      if (typeof Swal !== "undefined") {
        await Swal.fire({
          icon: "success",
          title: "เพิ่มสินค้าแล้ว",
          showConfirmButton: false,
          timer: 1200
        });
      } else {
        alert("เพิ่มสินค้าลงตะกร้าแล้ว");
      }
    } else {
      if (typeof Swal !== "undefined") {
        Swal.fire("ผิดพลาด", data.message, "error");
      } else {
        alert(data.message);
      }
    }
  } catch (err) {
    console.error("ADD TO CART ERROR:", err);
    alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
  }
}

// ─── อัปเดต Badge จำนวนสินค้าในตะกร้า ────────────────────────
async function updateCartBadge() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  const userId = user.user_id || user.id;
  const badge = document.getElementById("cartBadge");
  if (!badge) return;

  try {
    const res = await fetch(`${API_BASE}/cart/${userId}`);
    const data = await res.json();
    if (data.status === "success") {
      const total = data.data.reduce((s, item) => s + item.quantity, 0);
      badge.textContent = total;
    }
  } catch (err) {
    console.error("BADGE UPDATE ERROR:", err);
  }
}

// ─── เรียกใช้เมื่อโหลดหน้า ────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  // โหลด badge ทุกหน้า
  updateCartBadge();

  // ถ้าอยู่หน้าตะกร้า → สร้าง CartManager
  if (document.getElementById("cart-items")) {
    const cartManager = new CartManager();

    const checkoutBtn = document.querySelector(".checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => cartManager.proceedToCheckout());
    }

    const backBtn = document.querySelector(".back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => window.location.href = "home.html");
    }
  }
});