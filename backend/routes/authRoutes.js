const router = require("express").Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    const hash = bcrypt.hashSync(password, 10);

    db.query(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        [name, email, hash],
        (err) => {
            if (err) return res.json({ status: "error", message: err });

            res.json({
                status: "success",
                message: "สมัครสมาชิกสำเร็จ"
            });
        }
    );
});

// LOGIN
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, results) => {
            if (err) return res.json({ status: "error" });

            if (results.length === 0)
                return res.json({ status: "error", message: "ไม่พบผู้ใช้" });

            const user = results[0];

            console.log("DB password:", user.password_hash);
            console.log("Input password:", password);

            const check = bcrypt.compareSync(password, user.password_hash);

            if (!check) {
                return res.json({
                    status: "error",
                    message: "รหัสผ่านผิด"
                });
            }

            res.json({
                status: "success",
                message: "login ผ่าน",
                user
            });
        }
    );
});

module.exports = router;