const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "smartfarm_trade"
});

db.connect((err) => {
    if(err){
        console.log(err);
        return;
    }

    console.log("MySQL Connected");
});

module.exports = db;