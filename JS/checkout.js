const SHIPPING_COST = 0;

document.addEventListener("DOMContentLoaded", () => {
  loadCartItems();
  attachFormListener();
});

window.addEventListener("cartUpdated", loadCartItems);
window.addEventListener("storage", (e) => { if (e.key === "cart") loadCartItems(); });

// ======================
// LOAD
// ======================
function loadCartItems() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  displayProducts(cart);
  calculateTotals(cart);
}

// ======================
// DISPLAY
// ======================
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
        ${(p.price * p.quantity).toFixed(2)} บาท
      </td>
    </tr>
  `).join("");
}

// ======================
// TOTALS
// ======================
function calculateTotals(products) {
  const subtotal   = products.reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0);
  const shipping   = products.length > 0 ? SHIPPING_COST : 0;
  const grandTotal = subtotal + shipping;

  const el = (id) => document.getElementById(id);
  if (el("subtotal"))   el("subtotal").textContent   = subtotal.toFixed(2)   + " บาท";
  if (el("shipping"))   el("shipping").textContent   = shipping.toFixed(2)   + " บาท";
  if (el("grandTotal")) el("grandTotal").textContent = "฿" + grandTotal.toFixed(2);
}

// ======================
// FORM
// ======================
function attachFormListener() {
  document.getElementById("customerForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    submitOrder();
  });
}

function submitOrder() {
  const fullname       = document.getElementById("fullname").value.trim();
  const phone          = document.getElementById("phone").value.trim();
  const address        = document.getElementById("address").value.trim();
  const shippingMethod = document.querySelector('input[name="shipping"]:checked')?.value || "";

  if (!fullname || !phone || !address) {
    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!cart.length) { alert("ตะกร้าว่างเปล่า"); return; }

  const order = {
    id:             "ORD-" + Date.now(),
    fullname,
    phone,
    address,
    shippingMethod,
    items:          cart,
    date:           new Date().toLocaleDateString("th-TH"),
    status:         "pending"
  };

  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  orders.push(order);
  localStorage.setItem("orders", JSON.stringify(orders));
  localStorage.removeItem("cart");

  alert("สั่งซื้อสำเร็จ! รหัสคำสั่ง: " + order.id);
  window.location.href = "home.html";
}