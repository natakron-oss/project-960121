const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(`
      SELECT 
        tr.*,
        p.name AS product_name,
        u1.username AS from_username,
        u2.username AS to_username
      FROM trade_requests tr
      JOIN products p ON tr.product_id = p.id
      JOIN users u1 ON tr.from_user_id = u1.user_id
      JOIN users u2 ON tr.to_user_id = u2.user_id
      WHERE tr.from_user_id = ? OR tr.to_user_id = ?
      ORDER BY tr.created_at DESC
    `, [userId, userId]);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});
module.exports = router;