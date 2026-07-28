// ════════════════════════════════════════
//  checkout.js  – Gardenshare
//  ส่ง order ผ่าน API + ป้องกันซื้อของตัวเอง
// ════════════════════════════════════════

const SHIPPING_COST = 0;

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  loadCartItems();
  attachFormListener();
  setupPaymentToggle();
});

window.addEventListener("cartUpdated", loadCartItems);
window.addEventListener("storage", (e) => { if (e.key === "cart") loadCartItems(); });

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────
function checkAuth() {
  const token = localStorage.getItem("auth_token");
  if (!token) { window.location.href = "login.html"; }
}

// ─────────────────────────────────────────
// LOAD CART
// ─────────────────────────────────────────
function loadCartItems() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  displayProducts(cart);
  calculateTotals(cart);
}

// ─────────────────────────────────────────
// DISPLAY PRODUCTS
// ─────────────────────────────────────────
function displayProducts(products) {
  const productsList = document.getElementById("productsList");
  if (!productsList) return;

  if (!products.length) {
    productsList.innerHTML = `
      <tr><td colspan="3" style="padding:20px;text-align:center;color:#999;">ตะกร้าว่างเปล่า</td></tr>`;
    return;
  }

  productsList.innerHTML = products.map(p => `
    <tr style="border-bottom:1px solid #e0e0e0;">
      <td style="text-align:left;padding:12px 8px;">${p.name}</td>
      <td style="text-align:center;padding:12px 8px;">${p.quantity}</td>
      <td style="text-align:right;padding:12px 8px;font-weight:600;color:var(--primary);">
        ${((p.price || 0) * (p.quantity || 1)).toFixed(2)} บาท
      </td>
    </tr>
  `).join("");
}

// ─────────────────────────────────────────
// TOTALS
// ─────────────────────────────────────────
function calculateTotals(products) {
  const subtotal   = products.reduce((sum, p) => sum + (parseFloat(p.price) || 0) * (parseInt(p.quantity) || 1), 0);
  const shipping   = products.length > 0 ? SHIPPING_COST : 0;
  const grandTotal = subtotal + shipping;

  const el = (id) => document.getElementById(id);
  if (el("subtotal"))   el("subtotal").textContent   = subtotal.toFixed(2)   + " บาท";
  if (el("shipping"))   el("shipping").textContent   = shipping.toFixed(2)   + " บาท";
  if (el("grandTotal")) el("grandTotal").textContent = "฿" + grandTotal.toFixed(2);
}

// ─────────────────────────────────────────
// PAYMENT METHOD TOGGLE
// — แสดง/ซ่อน section พิเศษตาม payment
// ─────────────────────────────────────────
function setupPaymentToggle() {
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener("change", () => {
      const val = radio.value;
      const qrSection      = document.getElementById("qrSection");
      const transferSection = document.getElementById("transferSection");
      if (qrSection)       qrSection.style.display       = val === "qrcode"   ? "block" : "none";
      if (transferSection) transferSection.style.display = val === "transfer"  ? "block" : "none";
    });
  });
}

// ─────────────────────────────────────────
// FORM SUBMIT
// ─────────────────────────────────────────
function attachFormListener() {
  document.getElementById("customerForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    submitOrder();
  });
}

async function submitOrder() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) { alert("กรุณา Login ก่อน"); window.location.href = "login.html"; return; }

  const fullname        = document.getElementById("fullname").value.trim();
  const phone           = document.getElementById("phone").value.trim();
  const address         = document.getElementById("address").value.trim();
  const shippingMethod  = document.querySelector('input[name="shipping"]:checked')?.value  || "pickupschool";
  const paymentMethod   = document.querySelector('input[name="payment"]:checked')?.value   || "cod";

  if (!fullname || !phone || !address) {
    showAlert("กรุณากรอกข้อมูลให้ครบถ้วน", "error");
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!cart.length) { showAlert("ตะกร้าว่างเปล่า", "error"); return; }

  // ── Client-side block: ห้ามซื้อของตัวเอง ──
  const selfItem = cart.find(item => item.seller_id && String(item.seller_id) === String(user.user_id));
  if (selfItem) {
    showAlert(`ไม่สามารถสั่งซื้อสินค้าของตัวเองได้ (${selfItem.name})`, "error");
    return;
  }

  // ── Map items ──
  const items = cart.map(p => ({
    product_id: p.id,
    quantity:   parseInt(p.quantity) || 1
  }));

  // ── Disable submit btn ──
  const submitBtn = document.querySelector(".btn-submit");
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "กำลังส่งคำสั่งซื้อ..."; }

  try {
    const res  = await fetch("http://localhost:3000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
      },
      body: JSON.stringify({
        user_id: user.user_id,
        fullname,
        phone,
        address,
        shipping_method: shippingMethod,
        payment_method:  paymentMethod,
        items
      })
    });

    const data = await res.json();

    if (data.success) {
      // ลบ cart ออก
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));

      // ไปหน้า payment พร้อม order_id
      if (paymentMethod === "qrcode" || paymentMethod === "transfer") {
        window.location.href = `payment.html?order_id=${data.order_id}&method=${paymentMethod}`;
      } else {
        // COD → ไปหน้า success
        window.location.href = `order-success.html?order_id=${data.order_id}`;
      }
    } else {
      showAlert(data.message || "เกิดข้อผิดพลาด", "error");
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "ยืนยันการสั่งซื้อ"; }
    }

  } catch (err) {
    console.error(err);
    showAlert("ไม่สามารถเชื่อมต่อ server ได้", "error");
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "ยืนยันการสั่งซื้อ"; }
  }
}

// ─────────────────────────────────────────
// ALERT HELPER
// ─────────────────────────────────────────
function showAlert(message, type = "info") {
  // ลบ alert เก่า
  document.querySelectorAll(".checkout-alert").forEach(el => el.remove());

  const colors = {
    error:   { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", icon: "fa-circle-exclamation" },
    success: { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", icon: "fa-circle-check" },
    info:    { bg: "#eff6ff", border: "#bfdbfe", text: "#2563eb", icon: "fa-circle-info" }
  };
  const c = colors[type] || colors.info;

  const div = document.createElement("div");
  div.className = "checkout-alert";
  div.style.cssText = `
    position:fixed;top:80px;left:50%;transform:translateX(-50%);
    background:${c.bg};border:1px solid ${c.border};color:${c.text};
    padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600;
    display:flex;align-items:center;gap:8px;z-index:9999;
    box-shadow:0 4px 16px rgba(0,0,0,.12);min-width:280px;
    animation: slideDown .3s ease;
  `;
  div.innerHTML = `<i class="fa-solid ${c.icon}"></i> ${message}`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}