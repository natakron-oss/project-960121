const router = require("express").Router();
const db = require("../config/db");

const multer = require("multer");
const path = require("path");

// ====================
// UPLOAD CONFIG
// ====================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + path.extname(file.originalname)
    );
  }
});

const upload = multer({ storage });


// ====================
// ADD PRODUCT
// ====================

router.post(
  "/add",
  upload.single("image"),
  (req, res) => {

    const {
      user_id,
      name,
      category,
      quantity,
      description,
      expire_date,
      status
    } = req.body;

    const image = req.file
      ? req.file.filename
      : "default.jpg";

    const sql = `
      INSERT INTO products
      (
        user_id,
        name,
        category,
        quantity,
        description,
        expire_date,
        image,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        user_id,
        name,
        category,
        quantity,
        description,
        expire_days,
        image,
        status
      ],
      (err, result) => {

        if (err) {
          console.error(err);

          return res.json({
            status: "error",
            message: err.message
          });
        }

        res.json({
          status: "success",
          product_id: result.insertId
        });
      }
    );
  }
);


// ====================
// GET PRODUCTS
// ====================

router.get("/", (req, res) => {

  const sql = `
    SELECT
      p.*,
      u.username
    FROM products p
    JOIN users u
      ON p.user_id = u.user_id
    ORDER BY p.created_at DESC
  `;

  db.query(sql, (err, results) => {

    if (err) {
      return res.json({
        status: "error",
        message: err.message
      });
    }

    res.json({
      status: "success",
      data: results
    });
  });
});

module.exports = router;