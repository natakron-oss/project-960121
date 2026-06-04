const router = require("express").Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// สร้าง uploads/ ถ้ายังไม่มี
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ====================
// ADD PRODUCT
// ====================
router.post("/add", upload.single("image"), (req, res) => {

  const { user_id, name, category, quantity, description, expire_date, status } = req.body;

  // ✅ ใช้ expire_date ให้ตรงกับที่รับมา (ไม่ใช่ expire_days)
  const image = req.file ? req.file.filename : null;

  if (!user_id || !name || !quantity || !expire_date) {
    return res.json({ status: "error", message: "กรุณากรอกข้อมูลให้ครบ" });
  }

  const sql = `
    INSERT INTO products (user_id, name, category, quantity, description, expire_date, image, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [user_id, name, category, quantity, description || "", expire_date, image, status || "sell"],
    (err, result) => {
      if (err) {
        console.error("DB error:", err);
        return res.json({ status: "error", message: err.message });
      }
      res.json({ status: "success", product_id: result.insertId });
    }
  );
});

// ====================
// GET PRODUCTS
// ====================
router.get("/", (req, res) => {

  // ✅ คำนวณวันที่เหลือใน SQL เลย ให้ได้ตัวเลขกลับมาตรงๆ
  const sql = `
    SELECT
      p.*,
      u.username,
      DATEDIFF(p.expire_date, CURDATE()) AS days_left
    FROM products p
    JOIN users u ON p.user_id = u.user_id
    ORDER BY p.expire_date ASC, p.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.json({ status: "error", message: err.message });
    }
    res.json({ status: "success", data: results });
  });
});

module.exports = router;