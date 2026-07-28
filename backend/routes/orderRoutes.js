const express = require("express");
const router  = express.Router();
const db      = require("../config/db");

// ─────────────────────────────────────────
// POST /api/orders  — สร้างคำสั่งซื้อ
// ─────────────────────────────────────────
router.post("/", async (req, res) => {
  const { user_id, fullname, phone, address, shipping_method, payment_method, items } = req.body;

  // Validate
  if (!user_id || !fullname || !phone || !address || !items?.length) {
    return res.status(400).json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // ── 1. ดึงข้อมูลสินค้าทั้งหมดใน cart ──
    const productIds = items.map(i => i.product_id);
    const [products] = await conn.query(
      `SELECT id, user_id, name, price, quantity FROM products WHERE id IN (?)`,
      [productIds]
    );

    // ── 2. Block ซื้อของตัวเอง ──
    const selfBuy = products.find(p => p.user_id === user_id);
    if (selfBuy) {
      await conn.rollback();
      return res.status(403).json({
        success: false,
        message: `ไม่สามารถสั่งซื้อสินค้าของตัวเองได้ (${selfBuy.name})`
      });
    }

    // ── 3. คำนวณราคารวม ──
    const total_price = items.reduce((sum, item) => {
      const prod = products.find(p => p.id === item.product_id);
      return sum + ((prod?.price || 0) * (item.quantity || 1));
    }, 0);

    // ── 4. สร้าง Order ──
    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, total_price, status, fullname, phone, address, shipping_method, payment_method)
       VALUES (?, ?, 'pending', ?, ?, ?, ?, ?)`,
      [user_id, total_price, fullname, phone, address, shipping_method, payment_method]
    );
    const order_id = orderResult.insertId;

    // ── 5. สร้าง order_items + noti ให้คนขาย ──
    for (const item of items) {
      const prod = products.find(p => p.id === item.product_id);
      if (!prod) continue;

      // order_items
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_order)
         VALUES (?, ?, ?, ?)`,
        [order_id, item.product_id, item.quantity, prod.price]
      );

      // notification → คนขาย
      await conn.query(
        `INSERT INTO notifications (user_id, type, message, order_id, is_read)
         VALUES (?, 'new_order', ?, ?, 0)`,
        [
          prod.user_id,
          `มีคำสั่งซื้อใหม่สำหรับสินค้า "${prod.name}" จำนวน ${item.quantity} กก. โดย ${fullname}`,
          order_id
        ]
      );
    }

    await conn.commit();

    res.json({
      success: true,
      message: "สั่งซื้อสำเร็จ",
      order_id
    });

  } catch (err) {
    await conn.rollback();
    console.error("Order error:", err);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
  } finally {
    conn.release();
  }
});

// ─────────────────────────────────────────
// GET /api/orders/notify/:userId — noti ของคนขาย (new_order)
// ─────────────────────────────────────────
router.get("/notify/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT n.id, n.message, n.is_read, n.created_at,
              o.order_id, o.total_price, o.status as order_status,
              o.fullname, o.phone, o.address, o.payment_method, o.shipping_method
       FROM notifications n
       LEFT JOIN orders o ON o.order_id = n.order_id
       WHERE n.user_id = ? AND n.type = 'new_order'
       ORDER BY n.created_at DESC`,
      [userId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// ─────────────────────────────────────────
// PUT /api/orders/status/:orderId — อัปเดตสถานะ (seller กด confirm/cancel)
// ─────────────────────────────────────────
router.put("/status/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { status }  = req.body; // 'paid' | 'cancelled'

  const allowed = ["paid", "cancelled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: "สถานะไม่ถูกต้อง" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. อัปเดตสถานะ order
    await conn.query(`UPDATE orders SET status = ? WHERE order_id = ?`, [status, orderId]);

    // 2. ถ้า confirm (paid) → ลด quantity สินค้า + ลบถ้าหมด
    if (status === "paid") {

      // ดึง order_items ของ order นี้
      const [items] = await conn.query(
        `SELECT oi.product_id, oi.quantity AS ordered_qty,
                p.quantity AS stock, p.image
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = ?`,
        [orderId]
      );

      for (const item of items) {
        const newQty = (item.stock || 0) - (item.ordered_qty || 0);

        if (newQty <= 0) {
          // ลบรูปออกจาก disk
          if (item.image) {
            const fp = require("path").join(__dirname, "../../uploads", item.image);
            if (require("fs").existsSync(fp)) require("fs").unlinkSync(fp);
          }
          // ลบสินค้าออกจาก DB (cascade ลบ order_items, cart_items ที่ FK ชี้มาด้วย)
          await conn.query(`DELETE FROM products WHERE id = ?`, [item.product_id]);
        } else {
          // ลด quantity
          await conn.query(
            `UPDATE products SET quantity = ? WHERE id = ?`,
            [newQty, item.product_id]
          );
        }
      }
    }

    await conn.commit();
    res.json({ success: true, message: "อัปเดตสถานะสำเร็จ" });

  } catch (err) {
    await conn.rollback();
    console.error("Update order status error:", err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

// ─────────────────────────────────────────
// PUT /api/orders/notify/read/:notifId — mark as read
// ─────────────────────────────────────────
router.put("/notify/read/:notifId", async (req, res) => {
  try {
    await db.query(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [req.params.notifId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;