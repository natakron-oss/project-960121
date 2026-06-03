const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = (req, res) => {
    const { username, email, password } = req.body;

    const hash = bcrypt.hashSync(password, 10);

    const sql = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
    db.query(sql, [username, email, hash], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Register success" });
    });
};

// LOGIN
exports.login = (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json(err);

        if (results.length === 0)
            return res.status(404).json({ message: "User not found" });

        const user = results[0];

        const isMatch = bcrypt.compareSync(password, user.password_hash);

        if (!isMatch)
            return res.status(401).json({ message: "Wrong password" });

        const token = jwt.sign(
            { id: user.user_id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token, user });
    });
};