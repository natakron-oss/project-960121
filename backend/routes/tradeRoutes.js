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