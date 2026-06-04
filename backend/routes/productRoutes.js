const router = require("express").Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// สร้าง uploads/ ถ้ายังไม่มี
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });


// ====================
// ADD PRODUCT (FIXED)
// ====================
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const {
      user_id,
      name,
      category,
      quantity,
      description,
      expire_date,
      status
    } = req.body;

    const image = req.file ? req.file.filename : null;

    if (!user_id || !name || !quantity || !expire_date) {
      return res.json({
        status: "error",
        message: "กรุณากรอกข้อมูลให้ครบ"
      });
    }

    const sql = `
      INSERT INTO products 
      (user_id, name, category, quantity, description, expire_date, image, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      user_id,
      name,
      category,
      quantity,
      description || "",
      expire_date,
      image,
      status || "sell"
    ]);

    res.json({
      status: "success",
      product_id: result.insertId
    });

  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});


// ====================
// GET PRODUCTS (FIXED)
// ====================
router.get("/", async (req, res) => {
  try {
    // ลบสินค้าหมดอายุ
    const [expiredProducts] = await db.query(`
      SELECT image FROM products
      WHERE expire_date < CURDATE()
    `);

    for (const p of expiredProducts) {
      if (p.image) {
        const filePath = path.join(__dirname, "../../uploads", p.image);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await db.query(`
      DELETE FROM products
      WHERE expire_date < CURDATE()
    `);

    // โหลดสินค้า
    const sql = `
      SELECT
        p.*,
        u.username,
        DATEDIFF(p.expire_date, CURDATE()) AS days_left
      FROM products p
      JOIN users u ON p.user_id = u.user_id
      ORDER BY p.expire_date ASC, p.created_at DESC
    `;

    const [results] = await db.query(sql);

    res.json({
      status: "success",
      data: results
    });

  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});

module.exports = router;