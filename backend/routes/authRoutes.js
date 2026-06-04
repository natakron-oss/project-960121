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
        "SELECT user_id, username, email, password_hash FROM users WHERE email = ?",
        [email],
        (err, results) => {
            if (err) {
                console.log(err);
                return res.json({ status: "error", message: "db error" });
            }

            if (results.length === 0) {
                return res.json({ status: "error", message: "ไม่พบผู้ใช้" });
            }

            const user = results[0];

            const check = bcrypt.compareSync(password, user.password_hash);

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
        }
    );
});

module.exports = router;