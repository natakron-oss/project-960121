const router = require("express").Router();
const db     = require("../config/db");
const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// =========================================
// POST /api/products/add
// =========================================
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { user_id, name, category, quantity, description, expire_date, status } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!user_id || !name || !quantity || !expire_date) {
      return res.json({ status: "error", message: "กรุณากรอกข้อมูลให้ครบ" });
    }

    // price column only exists when status = sell; store 0 for trade
    const price = status === "sell" ? (parseFloat(req.body.price) || 0) : 0;

    const [result] = await db.query(`
      INSERT INTO products (user_id, name, category, quantity, description, expire_date, image, status, price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [user_id, name, category, quantity, description || "", expire_date, image, status || "sell", price]);

    res.json({ status: "success", product_id: result.insertId });
  } catch (err) {
    // fallback: if price column doesn't exist yet, insert without it
    try {
      const { user_id, name, category, quantity, description, expire_date, status } = req.body;
      const image = req.file ? req.file.filename : null;
      const [result] = await db.query(`
        INSERT INTO products (user_id, name, category, quantity, description, expire_date, image, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [user_id, name, category, quantity, description || "", expire_date, image, status || "sell"]);
      res.json({ status: "success", product_id: result.insertId });
    } catch (err2) {
      console.error("ADD PRODUCT ERROR:", err2);
      res.status(500).json({ status: "error", message: err2.message });
    }
  }
});

// =========================================
// GET /api/products
// =========================================
router.get("/", async (req, res) => {
  try {
    // clean expired products + their images
    const [expired] = await db.query(
      "SELECT image FROM products WHERE expire_date < CURDATE()"
    );
    for (const p of expired) {
      if (p.image) {
        const fp = path.join(__dirname, "../../uploads", p.image);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      }
    }
    await db.query("DELETE FROM products WHERE expire_date < CURDATE()");

    const [results] = await db.query(`
      SELECT
        p.id,
        p.user_id,
        p.name,
        p.category,
        p.quantity,
        p.description,
        p.image,
        p.status,
        p.expire_date,
        p.created_at,
        COALESCE(p.price, 0)                       AS price,
        u.username,
        DATEDIFF(p.expire_date, CURDATE())          AS days_left
      FROM products p
      JOIN users u ON p.user_id = u.user_id
      ORDER BY p.expire_date ASC, p.created_at DESC
    `);

    res.json({ status: "success", data: results });
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;