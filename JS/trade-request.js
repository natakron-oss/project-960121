document.addEventListener("DOMContentLoaded", () => {
  loadTraderItems();
  document.getElementById("customerForm").addEventListener("submit", submitTradeRequest);
});

let toUserId   = null;
let fromUserId = null;

// ======================
// LOAD PRODUCT INFO
// ======================
async function loadTraderItems() {
  const submitBtn = document.querySelector(".btn-submit");
  submitBtn.disabled    = true;
  submitBtn.textContent = "กำลังโหลด...";

  try {
    const productId = new URLSearchParams(window.location.search).get("id");
    if (!productId) { alert("ไม่พบ id สินค้า"); return; }

    const res  = await fetch("http://localhost:3000/api/products");
    const data = await res.json();

    // products PK = id
    const product = (data.data || []).find(p => String(p.id) === String(productId));
    if (!product) { alert("ไม่พบสินค้า"); return; }

    toUserId = product.user_id;
    document.getElementById("traderName").value = product.username || "ไม่พบชื่อ";
    document.getElementById("tradeItem").innerHTML = `
      <option value="${product.name}">${product.name} (${product.quantity} กก.)</option>`;
  } catch (err) {
    console.error(err);
    alert("โหลดข้อมูลสินค้าไม่สำเร็จ");
  } finally {
    submitBtn.disabled    = false;
    submitBtn.textContent = "ส่งคำขอแลกเปลี่ยน";
  }
}

// ======================
// SUBMIT
// ======================
async function submitTradeRequest(e) {
  e.preventDefault();

  const productId   = new URLSearchParams(window.location.search).get("id");
  const phone       = document.getElementById("phone").value.trim();
  const address     = document.getElementById("address").value.trim();
  const tradeItem   = document.getElementById("tradeItem").value;
  const tradeWeight = document.getElementById("tradeWeight").value;

  const user = JSON.parse(localStorage.getItem("user"));
  fromUserId = user?.user_id || user?.id;

  if (!fromUserId)                              { alert("ยังไม่ได้ login"); return; }
  if (!toUserId)                                { alert("ไม่พบเจ้าของสินค้า กรุณารีเฟรช"); return; }
  if (!tradeWeight || parseFloat(tradeWeight) <= 0) { alert("กรุณากรอกน้ำหนักที่ต้องการแลก"); return; }

  const submitBtn       = document.querySelector(".btn-submit");
  submitBtn.disabled    = true;
  submitBtn.textContent = "กำลังส่ง...";

  try {
    const response = await fetch("http://localhost:3000/api/trades/request", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        fromUserId,
        toUserId,
        offeredItem:     tradeItem,
        offeredQuantity: tradeWeight,
        address,
        phone
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      alert("ส่งคำขอแลกสำเร็จ ✅");
      window.location.href = "home.html";
    } else {
      alert(result.message || "เกิดข้อผิดพลาด");
      submitBtn.disabled    = false;
      submitBtn.textContent = "ส่งคำขอแลกเปลี่ยน";
    }
  } catch (err) {
    console.error(err);
    alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    submitBtn.disabled    = false;
    submitBtn.textContent = "ส่งคำขอแลกเปลี่ยน";
  }
}