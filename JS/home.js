// ======================
// INIT
// ======================
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("auth_token");
  if (!token) { window.location.href = "login.html"; return; }

  document.getElementById("authBtn")?.addEventListener("click", () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });

  document.getElementById("type-select")?.addEventListener("change", applyFilters);
  document.getElementById("searchInput")?.addEventListener("input", applyFilters);

  updateCartBadge();   // ฟังก์ชันนี้อยู่ใน cart.js
  loadProducts();
  loadNotifyBadge();
});

// ======================
// GLOBALS
// ======================
let allProducts = [];

// ======================
// NOTIFY BADGE
// ======================
async function loadNotifyBadge() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;
  const userId = user.user_id || user.id;
  const badge  = document.getElementById("notifyBadge");
  if (!badge) return;
  try {
    const res   = await fetch(`http://localhost:3000/api/trades/notify/${userId}`);
    const data  = await res.json();
    const count = (data.data || []).length;
    badge.textContent   = count;
    badge.style.display = count > 0 ? "flex" : "none";
  } catch (err) { console.error(err); }
}

// ======================
// LOAD PRODUCTS
// ======================
async function loadProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;
  grid.innerHTML = "<p>กำลังโหลด...</p>";
  try {
    const res    = await fetch("http://localhost:3000/api/products");
    const result = await res.json();
    allProducts  = result.data || [];
    renderProducts(allProducts);
  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p style='color:red'>โหลดสินค้าไม่สำเร็จ</p>";
  }
}

// ======================
// RENDER PRODUCTS
// ======================
function renderProducts(products) {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  if (!products.length) {
    grid.innerHTML = "<p style='color:#888;text-align:center;padding:40px'>ไม่พบสินค้า</p>";
    return;
  }

  products.forEach((p) => {
    const pid       = p.id;
    const days      = Number.isFinite(parseInt(p.days_left)) ? parseInt(p.days_left) : 0;
    const isExpired = days <= 0;

    let badgeBg = "#22c55e", badgeColor = "#fff";
    if (isExpired)       { badgeBg = "#6b7280"; }
    else if (days === 1) { badgeBg = "#ef4444"; }
    else if (days <= 3)  { badgeBg = "#F49D73"; badgeColor = "#5C2710"; }

    const badgeText = isExpired ? "หมดอายุแล้ว" : `เหลือ ${days} วัน`;

    let actionBtn = "";
    if (isExpired) {
      actionBtn = `<button class="buy-btn" disabled style="opacity:.4;cursor:not-allowed;">ไม่สามารถซื้อได้</button>`;
    } else if (p.status === "trade") {
      actionBtn = `<button class="trade-btn" data-pid="${pid}">Request Trade</button>`;
    } else {
      // ✅ ใช้ addToCart จาก cart.js (รับ product_id แล้ว call API → บันทึก DB)
      actionBtn = `<button class="buy-btn" data-pid="${pid}">Add To Cart</button>`;
    }

    const priceHTML = p.status === "sell" && p.price > 0
      ? `<p class="product-price">💰 ${parseFloat(p.price).toFixed(2)} บาท/กก.</p>`
      : "";

    const card = document.createElement("div");
    card.className    = "product-card";
    card.style.cursor = "pointer";
    card.dataset.pid  = pid;
    card.innerHTML = `
      <div class="card-img-container">
        <img src="http://localhost:3000/uploads/${p.image}" alt="${p.name}"
             onerror="this.src='image/no-image.png'">
        <div class="card-badge" style="background:${badgeBg};color:${badgeColor};">${badgeText}</div>
      </div>
      <div class="card-content">
        <h3>${p.name}</h3>
        <p>👤 ${p.username}</p>
        <p>📦 ${p.quantity} กก.</p>
        ${priceHTML}
        <div class="product-status">${p.status === "trade" ? "🔄 Trade" : "💰 Sell"}</div>
        <div class="card-footer-row">${actionBtn}</div>
      </div>
    `;
    grid.appendChild(card);
  });

  // card click → open detail modal
  grid.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      openDetailModal(card.dataset.pid);
    });
  });

  // ✅ buy-btn เรียก addToCart จาก cart.js โดยตรง (ไม่มีฟังก์ชันซ้ำ)
  grid.querySelectorAll(".buy-btn[data-pid]").forEach(btn =>
    btn.addEventListener("click", () => addToCart(btn.dataset.pid))
  );
  grid.querySelectorAll(".trade-btn[data-pid]").forEach(btn =>
    btn.addEventListener("click", () => goTrade(btn.dataset.pid))
  );
}

// ======================
// DETAIL MODAL
// ======================
function openDetailModal(pid) {
  const p = allProducts.find(x => String(x.id) === String(pid));
  if (!p) return;

  const priceHTML = p.status === "sell" && p.price > 0
    ? `<p style="font-size:1.2rem;font-weight:700;color:#16a34a;">💰 ${parseFloat(p.price).toFixed(2)} บาท/กก.</p>`
    : `<p style="color:#6b7280;">🔄 Trade (แลกเปลี่ยน)</p>`;

  const days      = Number.isFinite(parseInt(p.days_left)) ? parseInt(p.days_left) : 0;
  const actionBtn = p.status === "trade"
    ? `<button onclick="goTrade(${p.id})" style="background:#f59e0b;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:1rem;cursor:pointer;">Request Trade</button>`
    : `<button onclick="addToCart(${p.id})" style="background:#16a34a;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:1rem;cursor:pointer;">Add To Cart</button>`;

  document.getElementById("detailContent").innerHTML = `
    <div style="display:flex;gap:16px;flex-wrap:wrap;">
      <img src="http://localhost:3000/uploads/${p.image}" alt="${p.name}"
           onerror="this.src='image/no-image.png'"
           style="width:180px;height:180px;object-fit:cover;border-radius:10px;">
      <div style="flex:1;min-width:180px;">
        <h3 style="font-size:1.3rem;font-weight:700;margin-bottom:8px;">${p.name}</h3>
        ${priceHTML}
        <p>👤 ${p.username}</p>
        <p>📦 ${p.quantity} กก. คงเหลือ</p>
        <p>⏰ เหลือ ${days} วัน</p>
        <p style="color:#555;margin-top:8px;">${p.description || ""}</p>
        <div style="margin-top:16px;">${actionBtn}</div>
      </div>
    </div>
  `;
  document.getElementById("detailModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("detailModal").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("detailModal")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
});

// ======================
// FILTERS
// ======================
function applyFilters() {
  const keyword = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const type    = document.getElementById("type-select")?.value || "all";
  let filtered  = [...allProducts];
  if (keyword)        filtered = filtered.filter(p => p.name.toLowerCase().includes(keyword));
  if (type !== "all") filtered = filtered.filter(p => p.status === type);
  renderProducts(filtered);
}

// ======================
// TRADE
// ======================
function goTrade(id) {
  closeModal();
  window.location.href = `trade-request.html?id=${id}`;
}