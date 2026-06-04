const router = require("express").Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

// REGISTER
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ status: "error", message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    try {
        // เช็ค email ซ้ำ
        const [existing] = await db.query(
            "SELECT user_id FROM users WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            return res.json({ status: "error", message: "อีเมลนี้ถูกใช้งานแล้ว" });
        }

        const hash = await bcrypt.hash(password, 10);

        await db.query(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            [name, email, hash]
        );

        res.json({
            status: "success",
            message: "สมัครสมาชิกสำเร็จ"
        });

    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.json({ status: "error", message: err.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ status: "error", message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    try {
        const [results] = await db.query(
            "SELECT user_id, username, email, password_hash FROM users WHERE email = ?",
            [email]
        );

        if (results.length === 0) {
            return res.json({ status: "error", message: "ไม่พบผู้ใช้" });
        }

        const user = results[0];

        const check = await bcrypt.compare(password, user.password_hash);

        if (!check) {
            return res.json({ status: "error", message: "รหัสผ่านผิด" });
        }

        return res.json({
            status: "success",
            user: {
                user_id: user.user_id,
                username: user.username
            }
        });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.json({ status: "error", message: err.message });
    }
});

module.exports = router;