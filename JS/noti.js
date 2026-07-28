document.addEventListener("DOMContentLoaded", () => {
  loadNotifications();
});

async function loadNotifications() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.user_id;

    if (!userId) {
      alert("กรุณา login");
      return;
    }

    const res = await fetch(`http://localhost:3000/api/trades/notify/${userId}`);
    const data = await res.json();

    const container = document.getElementById("notiList");
    container.innerHTML = "";

    // ✅ FIX: กรองเฉพาะ pending ที่ฝั่ง client อีกชั้น + handle กรณีไม่มีข้อมูล
    const pending = (data.data || []).filter(item => item.status === "pending");

    if (!pending.length) {
      container.innerHTML = "<p>ไม่มีการแจ้งเตือนใหม่</p>";
      return;
    }

    pending.forEach(item => {
      const div = document.createElement("div");

      div.innerHTML = `
        <div style="border:1px solid #ccc; padding:10px; margin:10px;">
          <p><b>จาก:</b> ${item.from_username}</p>
          <p><b>สินค้า:</b> ${item.product_name}</p>
          <p><b>สิ่งที่เสนอ:</b> ${item.offered_item}</p>
          <p><b>จำนวน:</b> ${item.offered_quantity}</p>
          <p><b>สถานะ:</b> ${item.status}</p>

          <button onclick="updateStatus(${item.trade_id}, 'accepted')">
            Accept
          </button>

          <button onclick="updateStatus(${item.trade_id}, 'rejected')">
            Deny
          </button>
        </div>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error(err);
  }
}


async function updateStatus(tradeId, status) {
  try {
    const res = await fetch(`http://localhost:3000/api/trades/status/${tradeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    const data = await res.json();

    if (data.success) {
      alert(status === "accepted" ? "ยอมรับแล้ว ✅" : "ปฏิเสธแล้ว ❌");
      loadNotifications(); // ✅ reload — pending จะหายไปเพราะ filter แล้ว
    } else {
      alert(data.message || "เกิดข้อผิดพลาด");
    }

  } catch (err) {
    console.error(err);
  }
}