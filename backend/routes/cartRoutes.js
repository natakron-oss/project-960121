const router = require("express").Router();
const db     = require("../config/db");

// ====================
// GET CART
// ====================
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const [results] = await db.query(`
      SELECT
        ci.id                                     AS cart_id,
        ci.product_id,
        ci.quantity,
        p.name,
        p.image,
        p.expire_date,
        p.status,
        COALESCE(p.price, 0)                      AS price,
        DATEDIFF(p.expire_date, CURDATE())         AS days_left
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `, [user_id]);

    res.json({ status: "success", data: results });
  } catch (err) {
    console.error("GET CART ERROR:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ====================
// ADD TO CART
// ====================
router.post("/add", async (req, res) => {
  try {
    const { user_id, product_id, quantity = 1 } = req.body;

    if (!user_id || !product_id) {
      return res.json({ status: "error", message: "กรุณาระบุ user_id และ product_id" });
    }

    // เช็คสินค้ามีอยู่และไม่หมดอายุ
    const [productCheck] = await db.query(
      `SELECT id, quantity AS stock FROM products WHERE id = ? AND expire_date >= CURDATE()`,
      [product_id]
    );

    if (!productCheck.length) {
      return res.json({ status: "error", message: "สินค้าไม่มีหรือหมดอายุแล้ว" });
    }

    // เช็คว่ามีในตะกร้าแล้วหรือยัง
    const [existing] = await db.query(
      `SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?`,
      [user_id, product_id]
    );

    if (existing.length > 0) {
      const newQty = existing[0].quantity + parseInt(quantity);
      if (newQty > productCheck[0].stock) {
        return res.json({ status: "error", message: "สินค้ามีไม่เพียงพอ" });
      }
      await db.query(
        `UPDATE cart_items SET quantity = ? WHERE id = ?`,
        [newQty, existing[0].id]
      );
      return res.json({ status: "success", message: "อัปเดตจำนวนสินค้าในตะกร้าแล้ว" });
    }

    if (parseInt(quantity) > productCheck[0].stock) {
      return res.json({ status: "error", message: "สินค้ามีไม่เพียงพอ" });
    }

    await db.query(
      `INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)`,
      [user_id, product_id, quantity]
    );

    res.json({ status: "success", message: "เพิ่มสินค้าลงตะกร้าแล้ว" });
  } catch (err) {
    console.error("ADD TO CART ERROR:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ====================
// UPDATE QUANTITY
// ====================
router.put("/update", async (req, res) => {
  try {
    const { cart_id, quantity } = req.body;

    if (!cart_id || quantity < 1) {
      return res.json({ status: "error", message: "ข้อมูลไม่ถูกต้อง" });
    }

    const [stockCheck] = await db.query(
      `SELECT p.quantity AS stock FROM cart_items ci
       JOIN products p ON ci.product_id = p.id WHERE ci.id = ?`,
      [cart_id]
    );

    if (!stockCheck.length) {
      return res.json({ status: "error", message: "ไม่พบรายการในตะกร้า" });
    }

    if (parseInt(quantity) > stockCheck[0].stock) {
      return res.json({ status: "error", message: "สินค้ามีไม่เพียงพอ" });
    }

    await db.query(`UPDATE cart_items SET quantity = ? WHERE id = ?`, [quantity, cart_id]);
    res.json({ status: "success", message: "อัปเดตจำนวนแล้ว" });
  } catch (err) {
    console.error("UPDATE CART ERROR:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ====================
// REMOVE ITEM
// ====================
router.delete("/remove/:cart_id", async (req, res) => {
  try {
    const { cart_id } = req.params;
    await db.query(`DELETE FROM cart_items WHERE id = ?`, [cart_id]);
    res.json({ status: "success", message: "ลบสินค้าออกจากตะกร้าแล้ว" });
  } catch (err) {
    console.error("REMOVE CART ITEM ERROR:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ====================
// CLEAR CART
// ====================
router.delete("/clear/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    await db.query(`DELETE FROM cart_items WHERE user_id = ?`, [user_id]);
    res.json({ status: "success", message: "ล้างตะกร้าแล้ว" });
  } catch (err) {
    console.error("CLEAR CART ERROR:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;