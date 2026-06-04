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

  updateCartBadge();
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
  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#aaa;">กำลังโหลด...</div>`;
  try {
    const res    = await fetch("http://localhost:3000/api/products");
    const result = await res.json();
    allProducts  = result.data || [];
    renderProducts(allProducts);
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#e74c3c;">โหลดสินค้าไม่สำเร็จ</div>`;
  }
}

// ======================
// RENDER PRODUCTS
// ======================
function renderProducts(products) {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  if (!products.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:#aaa;">
      <div style="font-size:2.5rem;margin-bottom:12px;">🌱</div>
      <div>ไม่พบสินค้าที่ตรงกัน</div></div>`;
    return;
  }

  products.forEach((p) => {
    const pid       = p.id;
    const days      = Number.isFinite(parseInt(p.days_left)) ? parseInt(p.days_left) : 0;
    const isExpired = days <= 0;

    // Badge style
    let badgeBg = "#16a34a", badgeColor = "#fff";
    if (isExpired)       { badgeBg = "#6b7280"; }
    else if (days === 1) { badgeBg = "#ef4444"; }
    else if (days <= 3)  { badgeBg = "#f59e0b"; badgeColor = "#7c2d12"; }

    const badgeText = isExpired ? "หมดอายุ" : `⏰ ${days} วัน`;

    // Action button
    let actionBtn = "";
    if (isExpired) {
      actionBtn = `<button class="buy-btn" disabled>ไม่สามารถซื้อได้</button>`;
    } else if (p.status === "trade") {
      actionBtn = `<button class="trade-btn" data-pid="${pid}">🔄 ขอแลก</button>`;
    } else {
      actionBtn = `<button class="buy-btn" data-pid="${pid}">🛒 ใส่ตะกร้า</button>`;
    }

    const priceHTML = p.status === "sell" && parseFloat(p.price) > 0
      ? `<p class="product-price">฿${parseFloat(p.price).toFixed(2)} / กก.</p>`
      : "";

    const statusLabel = p.status === "trade"
      ? `<div class="product-status" style="background:#fff7ed;color:#b45309;">🔄 แลกเปลี่ยน</div>`
      : `<div class="product-status">💰 ขาย</div>`;

    const card = document.createElement("div");
    card.className   = "product-card";
    card.dataset.pid = pid;
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
        ${statusLabel}
        <div class="card-footer-row">${actionBtn}</div>
      </div>`;
    grid.appendChild(card);
  });

  // card body click → modal
  grid.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      openDetailModal(card.dataset.pid);
    });
  });

  grid.querySelectorAll(".buy-btn[data-pid]").forEach(btn =>
    btn.addEventListener("click", (e) => { e.stopPropagation(); addToCart(btn.dataset.pid); })
  );
  grid.querySelectorAll(".trade-btn[data-pid]").forEach(btn =>
    btn.addEventListener("click", (e) => { e.stopPropagation(); goTrade(btn.dataset.pid); })
  );
}

// ======================
// DETAIL MODAL — redesigned
// ======================
function openDetailModal(pid) {
  const p = allProducts.find(x => String(x.id) === String(pid));
  if (!p) return;

  const days      = Number.isFinite(parseInt(p.days_left)) ? parseInt(p.days_left) : 0;
  const isExpired = days <= 0;
  const price     = parseFloat(p.price) || 0;

  const priceBlock = p.status === "sell" && price > 0
    ? `<div style="font-family:'Prompt',sans-serif;font-size:1.5rem;font-weight:800;color:#2d7a4f;line-height:1;">
         ฿${price.toFixed(2)} <span style="font-size:0.9rem;font-weight:500;color:#7a9486;">/ กก.</span>
       </div>`
    : `<div style="display:inline-flex;align-items:center;gap:6px;background:#fff7ed;color:#b45309;border:1px solid #fcd34d;padding:5px 14px;border-radius:20px;font-weight:700;font-size:0.9rem;">
         🔄 แลกเปลี่ยน
       </div>`;

  const expBadge = isExpired
    ? `<span style="background:#6b7280;color:#fff;padding:3px 12px;border-radius:20px;font-size:0.75rem;font-weight:700;">หมดอายุ</span>`
    : days <= 3
    ? `<span style="background:#ef4444;color:#fff;padding:3px 12px;border-radius:20px;font-size:0.75rem;font-weight:700;">เหลือ ${days} วัน!</span>`
    : `<span style="background:#dcfce7;color:#166534;padding:3px 12px;border-radius:20px;font-size:0.75rem;font-weight:700;">เหลือ ${days} วัน</span>`;

  const actionBtn = isExpired
    ? `<button disabled style="flex:1;padding:12px;background:#e5e7eb;color:#9ca3af;border:none;border-radius:10px;font-size:0.95rem;font-weight:700;cursor:not-allowed;">ไม่สามารถดำเนินการได้</button>`
    : p.status === "trade"
    ? `<button onclick="goTrade(${p.id})" style="flex:1;padding:12px;background:#f59e0b;color:#fff;border:none;border-radius:10px;font-size:0.95rem;font-weight:700;cursor:pointer;font-family:'Sarabun',sans-serif;">🔄 ขอแลกเปลี่ยน</button>`
    : `<button onclick="addToCart(${p.id})" style="flex:1;padding:12px;background:#2d7a4f;color:#fff;border:none;border-radius:10px;font-size:0.95rem;font-weight:700;cursor:pointer;font-family:'Sarabun',sans-serif;">🛒 ใส่ตะกร้า</button>`;

  document.getElementById("detailContent").innerHTML = `
    <div style="padding:0 1.5rem 1.5rem;">
      <!-- รูปภาพ -->
      <div style="width:100%;height:220px;border-radius:12px;overflow:hidden;margin-bottom:16px;">
        <img src="http://localhost:3000/uploads/${p.image}" alt="${p.name}"
             onerror="this.src='image/no-image.png'"
             style="width:100%;height:100%;object-fit:cover;">
      </div>

      <!-- ชื่อ + badge -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:12px;">
        <h3 style="font-family:'Prompt',sans-serif;font-size:1.3rem;font-weight:700;color:#1a2e1f;line-height:1.3;">
          ${p.name}
        </h3>
        ${expBadge}
      </div>

      <!-- ราคา -->
      <div style="margin-bottom:14px;">${priceBlock}</div>

      <!-- info grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
        <div style="background:#f4f7f5;border-radius:8px;padding:10px 12px;">
          <div style="font-size:0.72rem;color:#7a9486;font-weight:600;text-transform:uppercase;letter-spacing:.4px;">เจ้าของ</div>
          <div style="font-size:0.9rem;font-weight:600;color:#1a2e1f;margin-top:2px;">👤 ${p.username}</div>
        </div>
        <div style="background:#f4f7f5;border-radius:8px;padding:10px 12px;">
          <div style="font-size:0.72rem;color:#7a9486;font-weight:600;text-transform:uppercase;letter-spacing:.4px;">ปริมาณ</div>
          <div style="font-size:0.9rem;font-weight:600;color:#1a2e1f;margin-top:2px;">📦 ${p.quantity} กก.</div>
        </div>
      </div>

      <!-- คำอธิบาย -->
      ${p.description ? `
        <div style="background:#f4f7f5;border-radius:8px;padding:12px;margin-bottom:14px;">
          <div style="font-size:0.72rem;color:#7a9486;font-weight:600;text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px;">รายละเอียด</div>
          <div style="font-size:0.88rem;color:#444;line-height:1.6;">${p.description}</div>
        </div>` : ""}

      <!-- action button -->
      <div style="display:flex;gap:10px;margin-top:4px;">
        ${actionBtn}
      </div>
    </div>`;

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