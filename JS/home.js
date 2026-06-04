// ======================
// LOGIN CHECK
// ======================
document.addEventListener("DOMContentLoaded", () => {

  const token = localStorage.getItem("auth_token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  // Logout button
  const btn = document.getElementById("authBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "login.html";
    });
  }

  updateCartBadge();
  loadProducts();
});


// ======================
// CART
// ======================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (badge) badge.textContent = cart.length;
}


// ======================
// LOAD PRODUCTS FROM DB
// ======================
async function loadProducts() {

  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  grid.innerHTML = `<p style="padding:20px;color:#888">กำลังโหลด...</p>`;

  try {
    const res    = await fetch("http://localhost:3000/api/products");
    const result = await res.json();

    if (!result.data || result.data.length === 0) {
      grid.innerHTML = `<p style="padding:20px;color:#888">ยังไม่มีสินค้า</p>`;
      return;
    }

    grid.innerHTML = "";

    result.data.forEach((p) => {

      // ✅ ใช้ days_left ที่ DB คำนวณมาให้แล้ว
      const days = parseInt(p.days_left);

      // ✅ สีถูกต้องตามจำนวนวันที่เหลือ
      let badgeBg    = "#22c55e";  // เขียว = ยังสด
      let badgeColor = "#fff";
      if (days <= 0) {
        badgeBg    = "#6b7280";    // เทา = หมดอายุแล้ว
      } else if (days === 1) {
        badgeBg    = "#ef4444";    // แดง = เหลือ 1 วัน
      } else if (days <= 3) {
        badgeBg    = "#F49D73";    // ส้ม = เหลือ 2-3 วัน
        badgeColor = "#5C2710";
      }

      const badgeText = days <= 0
        ? "หมดอายุแล้ว"
        : `เหลือ ${days} วัน`;

      // ✅ ตรวจว่ามีรูปจริงหรือไม่ ถ้าไม่มีใช้ emoji placeholder
      const imgSrc = p.image
        ? `http://localhost:3000/uploads/${p.image}`
        : null;

      const imgTag = imgSrc
        ? `<img src="${imgSrc}" alt="${p.name}" onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : "";

      const placeholder = `<div style="width:100%;height:160px;background:#e8f5e9;display:${imgSrc?'none':'flex'};align-items:center;justify-content:center;font-size:48px">🌿</div>`;

      grid.innerHTML += `
        <div class="product-card">
          <div class="card-img-container">
            ${imgTag}
            ${placeholder}
            <div class="card-badge" style="background:${badgeBg};color:${badgeColor}">
              ${badgeText}
            </div>
          </div>
          <div class="card-content">
            <div class="card-title-row"><h3>${p.name}</h3></div>
            <div class="card-owner-row">
              <i class="fa-regular fa-user"></i>
              <span>${p.username || "-"}</span>
            </div>
            <p>📦 ${p.quantity} กก.</p>
            <div class="product-status">
              ${p.status === "trade" ? "🔄 Trade" : "💰 Sell"}
            </div>
            <div class="card-footer-row">
              ${p.status === "trade"
                ? `<button class="trade-btn" onclick="goTrade(${p.product_id})">Request Trade</button>`
                : `<button class="buy-btn" onclick="addToCart(${p.product_id})">Add To Cart</button>`
              }
            </div>
          </div>
        </div>
      `;
    });

  } catch (err) {
    console.error("LOAD PRODUCT ERROR:", err);
    grid.innerHTML = `<p style="color:red;padding:20px">ติดต่อ server ไม่ได้</p>`;
  }
}

function goTrade(productId) {
  window.location.href = `trade-request.html?id=${productId}`;
}

function addToCart(productId) {
  // implement cart logic here
  alert("เพิ่มลงตะกร้า id: " + productId);
}

// Dropdown toggle
function toggleDropdown() {
  const dd = document.getElementById("category-dropdown");
  if (dd) dd.classList.toggle("show");
}

window.addEventListener("click", (e) => {
  if (!e.target.closest(".dropdown-container")) {
    document.querySelectorAll(".dropdown-content.show")
      .forEach(el => el.classList.remove("show"));
  }
});

function closeModal() {
  const m = document.getElementById("detailModal");
  if (m) m.style.display = "none";
}