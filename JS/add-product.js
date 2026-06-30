document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    Swal.fire("error", "กรุณาเข้าสู่ระบบก่อน", "error");
    window.location.href = "login.html";
    return;
  }

  // รองรับทั้ง user.user_id และ user.id
  const userId = user.user_id || user.id;
  if (!userId) {
    Swal.fire("error", "ไม่พบข้อมูลผู้ใช้ กรุณา login ใหม่", "error");
    return;
  }

  const data = {
    user_id:     userId,
    name:        document.getElementById("name").value,
    category:    document.getElementById("category").value,
    quantity:    document.getElementById("quantity").value,
    description: document.getElementById("description").value,
    expire_days: document.getElementById("expire_days").value,
    image:       "default.jpg",
    status:      "sell"
  };

  const res = await fetch("http://localhost:3000/api/products/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (result.status === "success") {
    await Swal.fire("สำเร็จ", "ลงสินค้าสำเร็จ", "success");
    document.getElementById("productForm").reset();
    window.location.href = "home.html";
  } else {
    Swal.fire("ผิดพลาด", result.message || "เกิดข้อผิดพลาด", "error");
  }
});