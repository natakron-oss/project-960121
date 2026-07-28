const express = require("express");
const router  = express.Router();
const db      = require("../config/db");

// ─────────────────────────────────────────
// ⚠️  /orders/:userId ต้องอยู่ก่อน /:userId เสมอ
//     ไม่งั้น Express จะอ่าน "orders" เป็น userId
// ─────────────────────────────────────────

// GET /api/history/orders/:userId — ประวัติ order (ซื้อ + ขาย)
router.get("/orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // ออเดอร์ที่ฉันซื้อ
    const [bought] = await db.query(`
      SELECT
        o.order_id, o.total_price, o.status,
        o.fullname, o.phone, o.address,
        o.payment_method, o.shipping_method, o.created_at,
        GROUP_CONCAT(p.name ORDER BY p.name SEPARATOR ', ')     AS product_names,
        GROUP_CONCAT(oi.quantity ORDER BY p.name SEPARATOR ', ') AS quantities
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.order_id
      JOIN products p     ON p.id = oi.product_id
      WHERE o.user_id = ?
      GROUP BY o.order_id
      ORDER BY o.created_at DESC
    `, [userId]);

    // ออเดอร์ที่คนอื่นซื้อสินค้าของฉัน
    const [sold] = await db.query(`
      SELECT
        o.order_id, o.total_price, o.status,
        o.fullname, o.phone, o.address,
        o.payment_method, o.shipping_method, o.created_at,
        GROUP_CONCAT(p.name ORDER BY p.name SEPARATOR ', ')     AS product_names,
        GROUP_CONCAT(oi.quantity ORDER BY p.name SEPARATOR ', ') AS quantities
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.order_id
      JOIN products p     ON p.id = oi.product_id
      WHERE p.user_id = ? AND o.user_id != ?
      GROUP BY o.order_id
      ORDER BY o.created_at DESC
    `, [userId, userId]);

    res.json({ success: true, bought, sold });

  } catch (err) {
    console.error("History orders error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/history/:userId — ประวัติ trade
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(`
      SELECT
        tr.*,
        p.name       AS product_name,
        u1.username  AS from_username,
        u2.username  AS to_username
      FROM trade_requests tr
      JOIN products p  ON tr.product_id   = p.id
      JOIN users u1    ON tr.from_user_id  = u1.user_id
      JOIN users u2    ON tr.to_user_id    = u2.user_id
      WHERE tr.from_user_id = ? OR tr.to_user_id = ?
      ORDER BY tr.created_at DESC
    `, [userId, userId]);

    res.json({ success: true, data: rows });

  } catch (err) {
    console.error("History trade error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;