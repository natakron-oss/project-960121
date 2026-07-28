document.addEventListener("DOMContentLoaded", () => {
  loadTraderItems();
  document.getElementById("customerForm").addEventListener("submit", submitTradeRequest);
});

let toUserId   = null;
let fromUserId = null;

// ======================
// LOAD PRODUCT INFO + USER'S OWN ITEMS
// ======================
async function loadTraderItems() {
  const submitBtn = document.querySelector(".btn-submit");
  submitBtn.disabled    = true;
  submitBtn.textContent = "กำลังโหลด...";

  try {
    const productId = new URLSearchParams(window.location.search).get("id");
    if (!productId) { alert("ไม่พบ id สินค้า"); return; }

    // ดึงข้อมูล user จาก localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    fromUserId = user?.user_id || user?.id;
    if (!fromUserId) { alert("กรุณา Login ก่อน"); window.location.href = "login.html"; return; }

    // ดึงข้อมูลสินค้าที่จะแลก (ของ target)
    const res  = await fetch("http://localhost:3000/api/products");
    const data = await res.json();
    const product = (data.data || []).find(p => String(p.id) === String(productId));
    if (!product) { alert("ไม่พบสินค้า"); return; }

    toUserId = product.user_id;

    // แสดงข้อมูลสินค้าเป้าหมาย
    document.getElementById("traderName").value = product.username || "ไม่พบชื่อ";

    // แสดงการ์ดสินค้าที่จะขอแลก
    const productCard = document.getElementById("targetProductCard");
    if (productCard) {
      productCard.innerHTML = `
        <div style="display:flex;gap:16px;align-items:center;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;">
          <img src="http://localhost:3000/uploads/${product.image}" width="70" height="70"
               style="object-fit:cover;border-radius:8px;flex-shrink:0;" onerror="this.src='image/no-image.png'">
          <div>
            <div style="font-weight:700;font-size:1rem;color:#166534;">${product.name}</div>
            <div style="font-size:0.85rem;color:#555;margin-top:4px;">👤 ${product.username}</div>
            <div style="font-size:0.85rem;color:#555;">📦 มีอยู่ ${product.quantity} กก.</div>
          </div>
        </div>`;
    }

    // ดึงรายการสินค้าของตัวเองเพื่อเสนอแลก
    const myRes  = await fetch(`http://localhost:3000/api/trades/${fromUserId}/items`);
    const myData = await myRes.json();
    const myItems = myData.data || [];

    const select = document.getElementById("tradeItem");
    if (!myItems.length) {
      select.innerHTML = `<option value="">คุณยังไม่มีสินค้าลงประกาศ</option>`;
    } else {
      select.innerHTML = myItems.map(i =>
        `<option value="${i.name}">${i.name}</option>`
      ).join("");
    }

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