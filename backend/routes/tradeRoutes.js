const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ดึงรายการสิ่งของที่เจ้าของโพสต์เปิดให้แลก
router.get("/:userId/items", async (req, res) => {
    try {
        const { userId } = req.params;

        const [rows] = await db.query(`
            SELECT
                id,
                name
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
router.post("/request", async (req, res) => {
  try {
    const {
      productId,
      fromUserId,
      toUserId,
      offeredItem,
      offeredQuantity,
      address,
      phone
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO trade_requests
      (product_id, from_user_id, to_user_id, offered_item, offered_quantity, address, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      productId,
      fromUserId,
      toUserId,
      offeredItem,
      offeredQuantity,
      address,
      phone
    ]);

    res.json({
      success: true,
      message: "สร้าง trade สำเร็จ"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});
router.get("/count/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(`
      SELECT COUNT(*) AS count
      FROM trade_requests
      WHERE to_user_id = ? AND status = 'pending'
    `, [userId]);

    res.json({
      success: true,
      count: rows[0].count
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
// =======================
// GET NOTIFICATION (ของคนรับ)
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
      WHERE tr.to_user_id = ?
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


// =======================
// ACCEPT / DENY
// =======================
router.put("/status/:tradeId", async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { status } = req.body; 
    // status = accepted | rejected

    await db.query(`
      UPDATE trade_requests
      SET status = ?
      WHERE trade_id = ?
    `, [status, tradeId]);

    res.json({
      success: true,
      message: "updated"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});
module.exports = router;