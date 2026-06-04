document.addEventListener("DOMContentLoaded", () => {
  const categoryEl    = document.getElementById("category");
  const priceWrapper  = document.getElementById("priceWrapper");
  const priceInput    = document.getElementById("price");

  // toggle price field
  function togglePrice() {
    const isSell = categoryEl.value === "sell";
    priceWrapper.style.display = isSell ? "block" : "none";
    priceInput.required = isSell;
  }
  categoryEl.addEventListener("change", togglePrice);
  togglePrice(); // run on load

  document.getElementById("productForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      Swal.fire("Error", "กรุณา Login ก่อน", "error");
      return;
    }

    const userId   = user.user_id || user.id;
    const days     = parseInt(document.getElementById("expire_date").value);
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + days);

    const formData = new FormData();
    formData.append("user_id",     userId);
    formData.append("name",        document.getElementById("name").value);
    formData.append("category",    categoryEl.value);
    formData.append("quantity",    document.getElementById("quantity").value);
    formData.append("description", document.getElementById("description").value);
    formData.append("expire_date", expireDate.toISOString().split("T")[0]);
    formData.append("status",      categoryEl.value);

    if (categoryEl.value === "sell") {
      formData.append("price", document.getElementById("price").value || 0);
    }

    const imageFile = document.getElementById("image").files[0];
    if (imageFile) formData.append("image", imageFile);

    const res    = await fetch("http://localhost:3000/api/products/add", { method: "POST", body: formData });
    const result = await res.json();

    if (result.status === "success") {
      await Swal.fire("สำเร็จ", "ลงสินค้าสำเร็จ", "success");
      window.location.href = "home.html";
    } else {
      Swal.fire("ผิดพลาด", result.message, "error");
    }
  });
});