const express = require("express");
const router = express.Router();
const db = require("../config/db");

// =======================
// GET NOTIFICATION (เฉพาะ pending ของคนรับ)
// =======================
router.get("/notify/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(`
      SELECT 
        tr.trade_id,
        tr.product_id,
        tr.from_user_id,
        tr.to_user_id,
        tr.offered_item,
        tr.offered_quantity,
        tr.address,
        tr.phone,
        tr.status,
        tr.created_at,
        u.username AS from_username,
        p.name AS product_name
      FROM trade_requests tr
      JOIN users u ON tr.from_user_id = u.user_id
      JOIN products p ON tr.product_id = p.id
      WHERE tr.to_user_id = ? AND tr.status = 'pending'
      ORDER BY tr.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});


router.get("/notifications/:userId", async (req, res) => {
  const userId = req.params.userId;

  const [rows] = await db.query(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );

  res.json(rows);
});

// ดึงรายการสิ่งของที่เจ้าของโพสต์เปิดให้แลก
router.get("/:userId/items", async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(`
      SELECT id, name
      FROM products
      WHERE user_id = ?
    `, [userId]);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});

// =======================
// POST TRADE REQUEST
// =======================
router.post("/request", async (req, res) => {
  try {
    const {
      productId,
      fromUserId,
      offeredItem,
      offeredQuantity,
      address,
      phone
    } = req.body;

    if (!fromUserId || !productId) {
      return res.status(400).json({
        success: false,
        message: "ข้อมูลไม่ครบ"
      });
    }

    // 🔥 ดึง owner จาก DB เท่านั้น (ไม่เชื่อ frontend)
    const [productRows] = await db.query(
      "SELECT user_id FROM products WHERE id = ?",
      [productId]
    );

    if (!productRows.length) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบสินค้า"
      });
    }

    const ownerId = Number(productRows[0].user_id);

    // 🚨 กันตัวเอง
    if (Number(fromUserId) === ownerId) {
      return res.status(400).json({
        success: false,
        message: "ไม่สามารถแลกของตัวเองได้"
      });
    }

    await db.query(`
      INSERT INTO trade_requests
      (product_id, from_user_id, to_user_id, offered_item, offered_quantity, address, phone, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      productId,
      fromUserId,
      ownerId,
      offeredItem,
      offeredQuantity,
      address,
      phone
    ]);

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// =======================
// ACCEPT / DENY — ✅ FIX: เช็ค stock ก่อน update status
// =======================
router.put("/status/:tradeId", async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "status ไม่ถูกต้อง"
      });
    }

    const [tradeRows] = await db.query(`
      SELECT product_id, offered_quantity, status AS current_status
      FROM trade_requests
      WHERE trade_id = ?
    `, [tradeId]);

    if (!tradeRows.length) {
      return res.status(404).json({ success: false, message: "ไม่พบ trade" });
    }

    const trade = tradeRows[0];

    // ✅ FIX: กัน double-process — ถ้าไม่ใช่ pending แล้วให้หยุด
    if (trade.current_status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "trade นี้ถูกดำเนินการแล้ว"
      });
    }

    // ✅ FIX: เช็ค stock ก่อน แล้วค่อย update status ทีหลัง
    if (status === "accepted") {
      const [productRows] = await db.query(
        "SELECT quantity FROM products WHERE id = ?",
        [trade.product_id]
      );

      if (!productRows.length) {
        return res.status(404).json({ success: false, message: "ไม่พบสินค้า" });
      }

      const qty = productRows[0].quantity;

      if (qty < trade.offered_quantity) {
        return res.status(400).json({
          success: false,
          message: "สินค้าไม่พอ"
        });
      }

      // ลด stock
      await db.query(`
        UPDATE products
        SET quantity = quantity - ?
        WHERE id = ?
      `, [trade.offered_quantity, trade.product_id]);
    }

    // update status หลังเช็คทุกอย่างแล้ว
    await db.query(`
      UPDATE trade_requests
      SET status = ?
      WHERE trade_id = ?
    `, [status, tradeId]);

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;