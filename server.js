const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// ใช้ static folder
app.use(express.static(path.join(__dirname, 'project-960121-main')));

// หน้าแรก
app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'project-960121-main', 'home', 'home.html')
    );
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});