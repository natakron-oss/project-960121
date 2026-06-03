const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Register
router.post("/register", (req, res) => {

    console.log("REGISTER:", req.body);

    const { username, email, password } = req.body;

    const sql = `
        INSERT INTO users
        (username, email, password)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [username, email, password],
        (err, result) => {

            if (err) {
                console.log("MYSQL ERROR:", err);

                return res.status(500).json({
                    message: err.message
                });
            }

            console.log("INSERT SUCCESS:", result);

            res.json({
                message: "register success"
            });

        }
    );
});

// Login
router.post("/login", (req, res) => {

    const { email, password } = req.body;

    const sql = `
        SELECT *
        FROM users
        WHERE email = ?
        AND password = ?
    `;

    db.query(
        sql,
        [email, password],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }

            if (result.length === 0) {
                return res.status(401).json({
                    message: "Email หรือ Password ไม่ถูกต้อง"
                });
            }

            res.json({
                token: "test-token",
                user: result[0]
            });

        }
    );

});

module.exports = router;