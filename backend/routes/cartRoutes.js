const router = require("express").Router();
const db = require("../config/db");

// ====================
// GET CART (ดึงตะกร้าของ user)
// ====================
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const sql = `
      SELECT
        c.cart_id,
        c.product_id,
        c.quantity,
        p.name,
        p.price,
        p.image,
        p.expire_date,
        p.status,
        DATEDIFF(p.expire_date, CURDATE()) AS days_left
      FROM carts c
      JOIN products p ON c.product_id = p.product_id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `;

    const [results] = await db.query(sql, [user_id]);

    res.json({
      status: "success",
      data: results
    });

  } catch (err) {
    console.error("GET CART ERROR:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});


// ====================
// ADD TO CART (กดปุ่ม "เพิ่มในตะกร้า" จากหน้า home)
// ====================
router.post("/add", async (req, res) => {
  try {
    const { user_id, product_id, quantity = 1 } = req.body;

    if (!user_id || !product_id) {
      return res.json({ status: "error", message: "กรุณาระบุ user_id และ product_id" });
    }

    // ตรวจสอบว่าสินค้ายังมีอยู่และไม่หมดอายุ
    const [productCheck] = await db.query(
      `SELECT product_id, quantity AS stock FROM products
       WHERE product_id = ? AND expire_date >= CURDATE()`,
      [product_id]
    );

    if (productCheck.length === 0) {
      return res.json({ status: "error", message: "สินค้าไม่มีหรือหมดอายุแล้ว" });
    }

    // ตรวจสอบว่าสินค้านี้มีในตะกร้าของ user แล้วหรือไม่
    const [existing] = await db.query(
      `SELECT cart_id, quantity FROM carts WHERE user_id = ? AND product_id = ?`,
      [user_id, product_id]
    );

    if (existing.length > 0) {
      // มีอยู่แล้ว → เพิ่มจำนวน
      const newQty = existing[0].quantity + parseInt(quantity);

      // ตรวจสอบ stock ไม่ให้เกิน
      if (newQty > productCheck[0].stock) {
        return res.json({ status: "error", message: "สินค้ามีไม่เพียงพอ" });
      }

      await db.query(
        `UPDATE carts SET quantity = ? WHERE cart_id = ?`,
        [newQty, existing[0].cart_id]
      );

      return res.json({ status: "success", message: "อัปเดตจำนวนสินค้าในตะกร้าแล้ว" });
    }

    // ยังไม่มี → เพิ่มใหม่
    if (parseInt(quantity) > productCheck[0].stock) {
      return res.json({ status: "error", message: "สินค้ามีไม่เพียงพอ" });
    }

    await db.query(
      `INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)`,
      [user_id, product_id, quantity]
    );

    res.json({ status: "success", message: "เพิ่มสินค้าลงตะกร้าแล้ว" });

  } catch (err) {
    console.error("ADD TO CART ERROR:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});


// ====================
// UPDATE QUANTITY (กด + / - ในหน้าตะกร้า)
// ====================
router.put("/update", async (req, res) => {
  try {
    const { cart_id, quantity } = req.body;

    if (!cart_id || quantity < 1) {
      return res.json({ status: "error", message: "ข้อมูลไม่ถูกต้อง" });
    }

    // ตรวจ stock
    const [stockCheck] = await db.query(
      `SELECT p.quantity AS stock FROM carts c
       JOIN products p ON c.product_id = p.product_id
       WHERE c.cart_id = ?`,
      [cart_id]
    );

    if (stockCheck.length === 0) {
      return res.json({ status: "error", message: "ไม่พบรายการในตะกร้า" });
    }

    if (parseInt(quantity) > stockCheck[0].stock) {
      return res.json({ status: "error", message: "สินค้ามีไม่เพียงพอ" });
    }

    await db.query(`UPDATE carts SET quantity = ? WHERE cart_id = ?`, [quantity, cart_id]);

    res.json({ status: "success", message: "อัปเดตจำนวนแล้ว" });

  } catch (err) {
    console.error("UPDATE CART ERROR:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});


// ====================
// REMOVE ITEM (ลบรายการเดียว)
// ====================
router.delete("/remove/:cart_id", async (req, res) => {
  try {
    const { cart_id } = req.params;

    await db.query(`DELETE FROM carts WHERE cart_id = ?`, [cart_id]);

    res.json({ status: "success", message: "ลบสินค้าออกจากตะกร้าแล้ว" });

  } catch (err) {
    console.error("REMOVE CART ITEM ERROR:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});


// ====================
// CLEAR CART (ล้างตะกร้าทั้งหมดของ user เช่น หลัง checkout)
// ====================
router.delete("/clear/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    await db.query(`DELETE FROM carts WHERE user_id = ?`, [user_id]);

    res.json({ status: "success", message: "ล้างตะกร้าแล้ว" });

  } catch (err) {
    console.error("CLEAR CART ERROR:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;