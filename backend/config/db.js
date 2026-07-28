const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "trad_market",
  waitForConnections: true,
  connectionLimit: 10
});

console.log("✅ MySQL POOL READY");

module.exports = db;