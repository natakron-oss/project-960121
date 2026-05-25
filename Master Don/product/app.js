const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app =  express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/",(req,res) => {
    res.send("Welcome to Product management system");
});

const connection = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: '',
    database: '682110180'
});

connection.connect((err) =>{
    if(err){
        console.error('Error connecting to MYSQL:', err);
        return;
    }
    console.log('Connected to MySQL successfully!');
});

app.get('/products',(req,res)=>{
    const query = 'SELECT * FROM products';
    connection.query(query,(err,result) => {
        if(err){
            console.error('Error fetching items:',err);
            return res.status(500).json({message:'Error fetching items'});
        }
        res.json(result);
    });
});

app.post('/products',(req,res)=> {
    const items = req.body;
    const query = `INSERT INTO products (productName,price,qty) VALUES ('${items.productName}', ${items.price}, ${items.qty})`;
    connection.query(query,(err,result) =>{
        if (err){
            console.error('Error creating items:', err);
            return res.status(500).json({message:'Error creating items'});
        }
        res.status(201).json({id: result.insertId, productName: result.productName});
        res.json(result);
    });
});

app.put('/product/:id',(req,res) => {
    const id = req.params.id;
    const items = req.body;
    const query= `UPDATE product SET productName = '${items.productName}',price =${items.price}, qty = ${items.qty} WHERE productID = ${id}`;

    connection.query(query,(err,result) => {
        if (err){
            console.error('Error updating item:', err);
            return res.status(500).json({ message:'Error updating item'});
        }
        res.json(result);
    });
});

app.put('/product/:id',(req,res) => {
    const id = req.params.id;
    const items = req.body;
    const query= `DELETE FROM product WHERE productID =  ${id}`;

    connection.query(query,(err,result) => {
        if (err){
            console.error('Error deleting item:', err);
            return res.status(500).json({ message:'Error deleting item'});
        }
        if(result.affectedRows === 0){
            return
        }
        res.json({message: 'Item deleted'});
    });
});

app.listen(port, ()=> {
    console.log(`Server is listening on port ${port}`);
});

