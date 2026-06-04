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
                product_name
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
      fullname,
      phone,
      address,
      shippingMethod,
      tradeItem
    } = req.body;

    if (!productId || !fullname || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "ข้อมูลไม่ครบ"
      });
    }

    // ตัวอย่าง insert (ปรับตาม DB จริงคุณ)
    await db.query(`
      INSERT INTO trade_requests
      (product_id, fullname, phone, address, shipping_method, trade_item)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      productId,
      fullname,
      phone,
      address,
      shippingMethod,
      tradeItem
    ]);

    res.json({
      success: true,
      message: "ส่งคำขอสำเร็จ"
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