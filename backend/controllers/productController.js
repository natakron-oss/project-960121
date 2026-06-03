const db = require("../config/db");

// ➕ เพิ่มสินค้า
exports.addProduct = (req, res) => {
    const {
        user_id,
        title,
        description,
        vegetable_name,
        quantity,
        price,
        type,
        image_url
    } = req.body;

    const sql = `
        INSERT INTO products
        (user_id, title, description, vegetable_name, quantity, price, type, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [user_id, title, description, vegetable_name, quantity, price, type, image_url],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "เพิ่มสินค้าสำเร็จ" });
        }
    );
};

// 🏠 ดึงสินค้าทั้งหมด (หน้า home)
exports.getAllProducts = (req, res) => {
    db.query("SELECT * FROM products ORDER BY created_at DESC", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};