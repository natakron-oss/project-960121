document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.user_id;

  if (!userId) {
    alert("กรุณา login");
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/history/${userId}`);
    const result = await res.json();

    if (!result.success) return;

    const data = result.data;

    const open = [];
    const incoming = [];
    const completed = [];

    data.forEach(item => {

      // 🟡 pending = ยังไม่เสร็จ
      if (item.status === "pending") {

        if (item.from_user_id == userId) {
          open.push(item);
        }

        if (item.to_user_id == userId) {
          incoming.push(item);
        }

      } 
      // 🟢 completed / rejected / accepted
      else {
        completed.push(item);
      }
    });

    renderList("open-list", open, "open");
    renderList("incoming-list", incoming, "incoming");
    renderList("completed-list", completed, "completed");

  } catch (err) {
    console.error(err);
  }
});

function renderList(containerId, items, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (!items.length) {
    container.innerHTML = `<div class="empty-cart-text">ยังไม่มีรายการ</div>`;
    return;
  }

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";

    let statusColor = "";
    if (item.status === "pending") statusColor = "orange";
    if (item.status === "accepted") statusColor = "green";
    if (item.status === "rejected") statusColor = "red";

    div.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">
          ${item.product_name} (Trade #${item.trade_id})
        </div>

        <div class="cart-item-meta">
          จาก: ${item.from_username} ➜ ถึง: ${item.to_username}
        </div>

        <div style="font-size:12px; color:#666;">
          แลก: ${item.offered_item} x ${item.offered_quantity}
        </div>
      </div>

      <div class="cart-item-price"></div>

      <div class="cart-item-qty">
        <span style="color:${statusColor}; font-weight:bold;">
          ${item.status}
        </span>
      </div>

      <div class="cart-item-total">
        ${new Date(item.created_at).toLocaleString("th-TH")}
      </div>
    `;

    container.appendChild(div);
  });
}