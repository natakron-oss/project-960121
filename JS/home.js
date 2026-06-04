// ======================
// LOGIN CHECK
// ======================
document.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem("auth_token");

    if (!token) {
        alert("กรุณา Login ก่อน");
        window.location.href = "login.html";
        return;
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

    if (!badge) return;

    badge.textContent = cart.length;
}


// ======================
// LOAD PRODUCTS FROM DB
// ======================
async function loadProducts() {

    const grid = document.getElementById("productsGrid");

    if (!grid) {
        console.error("ไม่พบ productsGrid");
        return;
    }

    try {

        const res = await fetch("http://localhost:3000/api/products");

        const result = await res.json();

        console.log(result);

        grid.innerHTML = "";

        result.data.forEach((p) => {

            let color = "#22c55e";

            if (p.expire_date <= 1) {
                color = "#ef4444";
            }
            else if (p.expire_date <= 3) {
                color = "#f97316";
            }

            grid.innerHTML += `
                <div class="product-card">

                    <div class="card-img-container">

                        <img
                            src="http://localhost:3000/uploads/${p.image}"
                             alt="${p.name}"
                        >

                        <div
                            class="card-badge"
                            style="background:${color}"
                        >
                            เหลือ ${p.expire_days} วัน
                        </div>

                    </div>

                    <div class="card-content">

                        <h3>${p.name}</h3>

                        <p>📦 ${p.quantity} กก.</p>

                        <p>👤 ${p.username}</p>

                        <div class="product-status">
                        ${p.status === "trade"
                            ? "🔄 Trade"
                            : "💰 Sell"}
                        </div>

                        ${
                        p.status === "trade"
                        ?
                        `
                        <button
                            class="trade-btn"
                            onclick="goTrade(${p.id})"
                        >
                            Request Trade
                        </button>
                        `
                        :
                        `
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
            `;
        });

    } catch (err) {

        console.error("LOAD PRODUCT ERROR:", err);

    }
}
function goTrade(productId) {

    window.location.href =
      `trade-request.html?id=${productId}`;

}