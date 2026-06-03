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

  // โหลดสินค้าจาก DB
  loadProducts();
});

// ====== โหลดสินค้าจาก API ======
async function loadProducts() {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = `<p style="padding:20px;color:#888">กำลังโหลด...</p>`;

  try {
    const res = await fetch("http://localhost:3000/api/products");
    const result = await res.json();

    if (result.status !== "success") {
      grid.innerHTML = `<p style="color:red;padding:20px">โหลดสินค้าไม่สำเร็จ</p>`;
      return;
    }

    if (result.data.length === 0) {
      grid.innerHTML = `<p style="padding:20px;color:#888">ยังไม่มีสินค้า</p>`;
      return;
    }

    renderProducts(result.data);

  } catch (err) {
    grid.innerHTML = `<p style="color:red;padding:20px">ติดต่อ server ไม่ได้</p>`;
    console.error(err);
  }
}

// ====== Render product cards ======
function renderProducts(data) {
  const grid = document.getElementById("productsGrid");

  grid.innerHTML = data.map(p => {
    let badgeBg = "#22c55e";
    let badgeColor = "#fff";
    if (p.expire_days <= 1)      { badgeBg = "#ef4444"; }
    else if (p.expire_days <= 3) { badgeBg = "#F49D73"; badgeColor = "#5C2710"; }

    return `
      <div class="product-card">
        <div class="card-img-container">
          <img src="${p.image || 'image/default.jpg'}" alt="${p.name}"
               onerror="this.src='image/default.jpg'">
          <div class="card-badge" style="background:${badgeBg};color:${badgeColor}">
            Best Before: ${p.expire_days} วัน
          </div>
        </div>
        <div class="card-content">
          <div class="card-title-row"><h3>${p.name}</h3></div>
          <div class="card-owner-row">
            <i class="fa-regular fa-user"></i>
            <span>${p.username || "-"}</span>
          </div>
          <div class="product-stock">📦 ${p.quantity} กก.</div>
          <div class="card-footer-row">
            <button class="card-btn-cart" onclick="openTradeModal(${p.product_id})">
              <i class="fa-solid fa-exchange-alt"></i> เทรด
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ====== Dropdown toggle ======
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
  const modal = document.getElementById("detailModal");
  if (modal) modal.style.display = "none";
}

// placeholder — trade modal จะ implement ใน trade.js
function openTradeModal(productId) {
  window.location.href = `trade.html?id=${productId}`;
}