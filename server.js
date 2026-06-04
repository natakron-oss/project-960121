const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// API
app.use("/api/auth", require("./backend/routes/authRoutes"));
app.use("/api/products", require("./backend/routes/productRoutes"));
app.use("/api/trades", require("./backend/routes/tradeRoutes"));

// static frontend
app.use(express.static(__dirname));
app.use("/uploads", express.static("uploads"));

// home root
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on http://localhost:" + PORT);
});