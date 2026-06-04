const router = require("express").Router();
const db = require("../config/db");
// ADD PRODUCT
router.post("/add", (req, res) => {
  const {
    user_id,
    name,
    category,
    quantity,
    description,
    expire_days,
    image,
    status
  } = req.body;

  // ตรวจสอบ field บังคับ
  if (!user_id || !name || !quantity || !expire_days) {
    return res.json({ status: "error", message: "กรุณากรอกข้อมูลให้ครบ" });
  }

  const sql = `
    INSERT INTO products
    (user_id, name, category, quantity, description, expire_days, image, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [user_id, name, category, quantity, description || "", expire_days, image || "default.jpg", status || "sell"],
    (err, result) => {
      if (err) {
        console.error("DB error:", err);
        return res.json({ status: "error", message: err.message });
      }
      res.json({ status: "success", product_id: result.insertId });
    }
  );
});

// GET ALL PRODUCTS
router.get("/", (req, res) => {
  const sql = `
    SELECT p.*, u.username
    FROM products p
    JOIN users u ON p.user_id = u.user_id
    ORDER BY p.created_at DESC
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