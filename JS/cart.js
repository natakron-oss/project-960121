// ============================================================
// cart.js — Cart Manager (DB + localStorage sync)
// ============================================================

const API_BASE = "http://localhost:3000/api";

// ======================
// ADD TO CART (global — ใช้จาก home.js และ modal ได้เลย)
// ======================
async function addToCart(productId) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("กรุณา Login ก่อนเพิ่มสินค้า");
    window.location.href = "login.html";
    return;
  }

  const userId = user.user_id || user.id;

  try {
    const res  = await fetch(`${API_BASE}/cart/add`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ user_id: userId, product_id: productId, quantity: 1 })
    });
    const data = await res.json();

    if (data.status === "success") {
      await updateCartBadge();
      if (typeof Swal !== "undefined") {
        await Swal.fire({ icon: "success", title: "เพิ่มสินค้าแล้ว", showConfirmButton: false, timer: 1200 });
      } else {
        alert("เพิ่มสินค้าลงตะกร้าแล้ว ✅");
      }
    } else {
      alert(data.message || "เกิดข้อผิดพลาด");
    }
  } catch (err) {
    console.error("ADD TO CART ERROR:", err);
    alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
  }
}

// ======================
// UPDATE CART BADGE (global — ทุกหน้าใช้ได้)
// ======================
async function updateCartBadge() {
  const user  = JSON.parse(localStorage.getItem("user"));
  const badge = document.getElementById("cartBadge");
  if (!user || !badge) return;

  const userId = user.user_id || user.id;
  try {
    const res  = await fetch(`${API_BASE}/cart/${userId}`);
    const data = await res.json();
    if (data.status === "success") {
      const total = data.data.reduce((s, i) => s + i.quantity, 0);
      badge.textContent = total;
    }
  } catch (err) {
    console.error("BADGE UPDATE ERROR:", err);
  }
}

// ======================
// PROCEED TO CHECKOUT (global — ปุ่มใน cart.html เรียก)
// ======================
function proceedToCheckout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!cart.length) { alert("ตะกร้าว่างเปล่า"); return; }
  window.location.href = "checkout.html";
}

// ============================================================
// CART MANAGER — ใช้เฉพาะหน้า cart.html
// ============================================================
class CartManager {
  constructor() {
    this.user   = JSON.parse(localStorage.getItem("user")) || null;
    this.userId = this.user ? (this.user.user_id || this.user.id) : null;
  }

  async init() {
    await this.syncFromDB();   // ดึงจาก DB → localStorage ก่อน
    this.renderCart();
    this.setupEventListeners();
  }

  // ─── SYNC DB → localStorage ───────────────────────────────
  async syncFromDB() {
    if (!this.userId) return;
    try {
      const res  = await fetch(`${API_BASE}/cart/${this.userId}`);
      const data = await res.json();
      if (data.status === "success") {
        // ✅ เขียนทับ localStorage ด้วยข้อมูลจาก DB เสมอ
        const cart = data.data.map(item => ({
          cart_id:    item.cart_id,
          id:         item.product_id,   // ใช้ id เพื่อ compatible กับ checkout
          product_id: item.product_id,
          name:       item.name,
          price:      parseFloat(item.price) || 0,
          image:      item.image,
          quantity:   item.quantity,
          expire_date: item.expire_date,
          days_left:  item.days_left
        }));
        localStorage.setItem("cart", JSON.stringify(cart));
      }
    } catch (err) {
      console.error("SYNC FROM DB ERROR:", err);
    }
  }

  getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }

  saveCartLocal(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // ─── RENDER ───────────────────────────────────────────────
  renderCart() {
    const container = document.getElementById("cart-items");
    if (!container) return;

    const cart = this.getCart();
    container.innerHTML = "";

    if (!cart.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:#888;">
          <div style="font-size:3rem;">🛒</div>
          <p style="font-size:1.1rem;margin-top:12px;">ตะกร้าว่างเปล่า</p>
          <a href="home.html" style="display:inline-block;margin-top:16px;color:#16a34a;font-weight:600;">
            ← กลับไปช้อปปิ้ง
          </a>
        </div>`;
      this.updateSummary([]);
      return;
    }

    // header row
    const header = document.createElement("div");
    header.className = "cart-header";
    header.innerHTML = `
      <div></div>
      <div>ชื่อสินค้า</div>
      <div>ราคา/กก.</div>
      <div>จำนวน</div>
      <div>รวม</div>
      <div></div>`;
    container.appendChild(header);

    cart.forEach((item, index) => {
      const price    = parseFloat(item.price) || 0;
      const expBadge = item.days_left <= 3 && item.days_left > 0
        ? `<span class="badge-expire" style="background:#ef4444;color:#fff;font-size:.7rem;padding:2px 6px;border-radius:4px;margin-left:6px;">หมดอายุใน ${item.days_left} วัน</span>`
        : "";

      const row = document.createElement("div");
      row.className = "cart-item";
      row.dataset.cartId = item.cart_id || "";
      row.innerHTML = `
        <div></div>
        <div class="product-info" style="display:flex;align-items:center;gap:10px;">
          <img src="http://localhost:3000/uploads/${item.image}" width="70" height="70"
               style="object-fit:cover;border-radius:8px;" onerror="this.src='image/no-image.png'">
          <span>${item.name}${expBadge}</span>
        </div>
        <div>${price.toFixed(2)} บาท</div>
        <div class="qty-controls" style="display:flex;align-items:center;gap:8px;">
          <button class="minus-btn" data-index="${index}">−</button>
          <span>${item.quantity}</span>
          <button class="plus-btn"  data-index="${index}">+</button>
        </div>
        <div style="font-weight:700;color:#16a34a;">${(price * item.quantity).toFixed(2)} บาท</div>
        <div>
          <button class="delete-btn" data-index="${index}"
                  style="background:#ef4444;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;">
            ลบ
          </button>
        </div>`;
      container.appendChild(row);
    });

    this.updateSummary(cart);
  }

  updateSummary(cart) {
    const subtotal = cart.reduce((s, i) => s + ((parseFloat(i.price) || 0) * i.quantity), 0);
    const shipping = 0;
    const total    = subtotal + shipping;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("cart-subtotal", subtotal.toFixed(2) + " บาท");
    set("shipping-fee",  shipping.toFixed(2) + " บาท");
    set("cart-grand",    total.toFixed(2) + " บาท");

    // badge
    const badge = document.getElementById("cartBadge");
    if (badge) badge.textContent = cart.reduce((s, i) => s + (i.quantity || 0), 0);

    // disable checkout ถ้าว่าง
    const btn = document.querySelector(".checkout-btn");
    if (btn) btn.disabled = !cart.length;
  }

  // ─── QTY CHANGE ───────────────────────────────────────────
  async increaseQty(index) {
    const cart   = this.getCart();
    if (!cart[index]) return;
    const newQty = cart[index].quantity + 1;
    if (cart[index].cart_id) {
      const ok = await this.updateQtyDB(cart[index].cart_id, newQty);
      if (!ok) return;
    }
    cart[index].quantity = newQty;
    this.saveCartLocal(cart);
    this.renderCart();
  }

  async decreaseQty(index) {
    const cart = this.getCart();
    if (!cart[index] || cart[index].quantity <= 1) return;
    const newQty = cart[index].quantity - 1;
    if (cart[index].cart_id) {
      const ok = await this.updateQtyDB(cart[index].cart_id, newQty);
      if (!ok) return;
    }
    cart[index].quantity = newQty;
    this.saveCartLocal(cart);
    this.renderCart();
  }

  async updateQtyDB(cartId, quantity) {
    try {
      const res  = await fetch(`${API_BASE}/cart/update`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ cart_id: cartId, quantity })
      });
      const data = await res.json();
      if (data.status !== "success") { alert(data.message); return false; }
      return true;
    } catch (err) {
      console.error("UPDATE QTY DB ERROR:", err);
      return false;
    }
  }

  // ─── REMOVE ───────────────────────────────────────────────
  async removeItem(index) {
    if (!confirm("ยืนยันการลบสินค้า?")) return;
    const cart = this.getCart();
    const item = cart[index];
    if (item.cart_id) {
      try {
        await fetch(`${API_BASE}/cart/remove/${item.cart_id}`, { method: "DELETE" });
      } catch (err) { console.error("REMOVE DB ERROR:", err); }
    }
    cart.splice(index, 1);
    this.saveCartLocal(cart);
    this.renderCart();
  }

  // ─── EVENTS ───────────────────────────────────────────────
  setupEventListeners() {
    const container = document.getElementById("cart-items");
    if (!container) return;
    container.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index);
      if (isNaN(index)) return;
      if (e.target.classList.contains("plus-btn"))    this.increaseQty(index);
      else if (e.target.classList.contains("minus-btn")) this.decreaseQty(index);
      else if (e.target.classList.contains("delete-btn")) this.removeItem(index);
    });
  }
}

// ============================================================
// BOOT
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
  // badge ทุกหน้า
  await updateCartBadge();

  // ถ้าอยู่หน้าตะกร้า
  if (document.getElementById("cart-items")) {
    const manager = new CartManager();
    await manager.init();
  }
});