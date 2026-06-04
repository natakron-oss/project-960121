const router = require("express").Router();
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

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
});