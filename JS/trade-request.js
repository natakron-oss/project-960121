document.addEventListener("DOMContentLoaded", () => {

    loadTraderItems();

    const form =
        document.getElementById("customerForm");

    form.addEventListener("submit", submitTradeRequest);

});

async function loadTraderItems() {
  try {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    if (!productId) return;

    const res = await fetch("http://localhost:3000/api/products");
    const data = await res.json();

    const product = data.data.find(p => p.id == productId);

    if (!product) return;

    // trader name (คนขาย)
    document.getElementById("traderName").value = product.username;

    // ใส่ item ที่จะ trade
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

async function submitTradeRequest(e) {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  const fullname = document.getElementById("fullname").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const tradeItem = document.getElementById("tradeItem").value;

  const shippingMethod = document.querySelector('input[name="shipping"]:checked').value;

  if (!fullname || !phone || !address || !tradeItem) {
    alert("กรุณากรอกข้อมูลให้ครบ");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/api/trades/request",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,        // ⭐ สำคัญมาก
          fullname,
          phone,
          address,
          shippingMethod,
          tradeItem
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