const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ================= API =================
app.use("/api/auth", require("./backend/routes/authRoutes"));
app.use("/api/products", require("./backend/routes/productRoutes"));
app.use("/api/cart", require("./backend/routes/cartRoutes")); // ✅ เพิ่มตรงนี้
app.use("/api/trades", require("./backend/routes/tradeRoutes"));
app.use("/api/history", require("./backend/routes/historyRoutes"));
app.use("/api/orders", require("./backend/routes/orderRoutes"));

// ================= STATIC ROOT =================
// 👉 HTML อยู่ root ใช้ตัวนี้พอ
app.use(express.static(__dirname));

// uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= ROUTE =================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on http://localhost:" + PORT);
});