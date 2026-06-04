document.addEventListener("DOMContentLoaded", () => {
  loadTraderItems();

  const form = document.getElementById("customerForm");
  form.addEventListener("submit", submitTradeRequest);
});

let toUserId = null;
let fromUserId = null;

// ================= LOAD PRODUCT =================
async function loadTraderItems() {
  try {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    if (!productId) return;

    const res = await fetch("http://localhost:3000/api/products");
    const data = await res.json();

    const product = data.data.find(p => p.id == productId);

    if (!product) return;

    // ⭐ owner (คนขาย)
    toUserId = product.user_id;

    // ⭐ แก้ตรงนี้: product ไม่มี username ต้อง JOIN backend เท่านั้น
    document.getElementById("traderName").value =
      product.username || "ไม่พบชื่อ";

    const select = document.getElementById("tradeItem");

    select.innerHTML = `
      <option value="${product.id}">
        ${product.name} (${product.quantity} กก.)
      </option>
    `;

  } catch (err) {
    console.error(err);
  }
}

// ================= SUBMIT TRADE =================
async function submitTradeRequest(e) {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  const fullname = document.getElementById("fullname").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;

  const tradeItem = document.getElementById("tradeItem").value;
  const tradeWeight = document.getElementById("tradeWeight").value;

  // ⭐ FIX สำคัญ: ดึง user จาก JSON
  const user = JSON.parse(localStorage.getItem("user"));
  fromUserId = user?.user_id;

  if (!fromUserId) {
    alert("ยังไม่ได้ login");
    return;
  }

  if (!toUserId) {
    alert("ไม่พบเจ้าของสินค้า");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/api/trades/request",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          fromUserId,
          toUserId,
          offeredItem: tradeItem,
          offeredQuantity: tradeWeight,
          address,
          phone
        })
      }
    );

    const result = await response.json();

    if (response.ok) {
      alert("ส่งคำขอแลกสำเร็จ");
      window.location.href = "home.html";
    } else {
      alert(result.message);
    }

  } catch (err) {
    console.error(err);
    alert("เกิดข้อผิดพลาด");
  }
}