// ======================
// LOGIN CHECK
// ======================
document.addEventListener("DOMContentLoaded", () => {
document
  .getElementById("type-select")
  ?.addEventListener(
    "change",
    applyFilters
  );
  const token = localStorage.getItem("auth_token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

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
// GLOBAL
// ======================

let allProducts = [];

let cart =
  JSON.parse(
    localStorage.getItem("cart")
  ) || [];

// ======================
// CART
// ======================

function updateCartBadge() {

  const badge =
    document.getElementById("cartBadge");

  if (badge) {

    badge.textContent =
      cart.length;

  }
}

// ======================
// LOAD PRODUCTS
// ======================

async function loadProducts() {

  const grid =
    document.getElementById("productsGrid");

  if (!grid) return;

  grid.innerHTML =
    "<p>กำลังโหลด...</p>";

  try {

    const res =
      await fetch(
        "http://localhost:3000/api/products"
      );

    const result =
      await res.json();

    allProducts =
      result.data || [];

    renderProducts(
      allProducts
    );

  } catch (err) {

    console.error(err);

    grid.innerHTML =
      "<p style='color:red'>โหลดสินค้าไม่สำเร็จ</p>";

  }
}
function renderProducts(products) {

  const grid =
    document.getElementById("productsGrid");

  grid.innerHTML = "";

  products.forEach((p) => {

    const days =
      parseInt(p.days_left);

    let badgeBg = "#22c55e";
    let badgeColor = "#fff";

    if (days <= 0) {

      badgeBg = "#6b7280";

    } else if (days === 1) {

      badgeBg = "#ef4444";

    } else if (days <= 3) {

      badgeBg = "#F49D73";
      badgeColor = "#5C2710";

    }

    const badgeText =
      days <= 0
      ? "หมดอายุแล้ว"
      : `เหลือ ${days} วัน`;

    grid.innerHTML += `

      <div class="product-card">

        <div class="card-img-container">

          <img
            src="http://localhost:3000/uploads/${p.image}"
            alt="${p.name}"
          >

          <div
            class="card-badge"
            style="
              background:${badgeBg};
              color:${badgeColor};
            "
          >
            ${badgeText}
          </div>

        </div>

        <div class="card-content">

          <h3>${p.name}</h3>

          <p>👤 ${p.username}</p>

          <p>📦 ${p.quantity} กก.</p>

          <div class="product-status">
            ${
              p.status === "trade"
              ? "🔄 Trade"
              : "💰 Sell"
            }
          </div>

          <div class="card-footer-row">

            ${
              p.status === "trade"
              ? `
                <button
                  class="trade-btn"
                  onclick="goTrade(${p.id})"
                >
                  Request Trade
                </button>
              `
              : `
                <button
                  class="buy-btn"
                  onclick="addToCart(${p.id})"
                >
                  Add To Cart
                </button>
              `
            }

          </div>

        </div>

      </div>

    `;
  });
}
function applyFilters() {

  const keyword =
    document
      .getElementById("searchInput")
      .value
      .toLowerCase();

  const type =
    document
      .getElementById("type-select")
      .value;

  let filtered = [...allProducts];

  if (keyword) {

    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(keyword)
    );

  }

  if (type !== "all") {

    filtered = filtered.filter((p) =>
      p.status === type
    );

  }

  renderProducts(filtered);
}
document
  .getElementById("searchInput")
  ?.addEventListener(
    "input",
    applyFilters
  );

document
  .getElementById("type-select")
  ?.addEventListener(
    "change",
    applyFilters
  );
  function goTrade(id) {

  window.location.href =
    `trade-request.html?id=${id}`;

}

function addToCart(id) {

  alert(
    "เพิ่มสินค้า ID : " + id
  );

}

