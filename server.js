const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

const fs = require('fs');
const DATA_DIR = path.join(__dirname, 'data');
const TRADES_FILE = path.join(DATA_DIR, 'trades.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(TRADES_FILE)) fs.writeFileSync(TRADES_FILE, JSON.stringify([]));
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));

app.use(express.json());

// ใช้ static folder
app.use(express.static(__dirname));

// หน้าแรก
app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'home.html')
    );
});

// Simple trades API (file-persisted)
function readTrades() {
    try { return JSON.parse(fs.readFileSync(TRADES_FILE, 'utf8') || '[]'); } catch (e) { return []; }
}

function writeTrades(data) {
    fs.writeFileSync(TRADES_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/trades', (req, res) => {
    res.json(readTrades());
});

// Simple users API for register/login (insecure demo only)
function readUsers() { try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]'); } catch (e) { return []; } }
function writeUsers(u) { fs.writeFileSync(USERS_FILE, JSON.stringify(u, null, 2)); }

app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.json({ status: 'error', message: 'ข้อมูลไม่ครบ' });
    const users = readUsers();
    if (users.find(x => x.email === email)) return res.json({ status: 'error', message: 'อีเมลนี้ถูกใช้แล้ว' });
    const user = { id: 'U_' + Date.now(), name, email, password };
    users.push(user); writeUsers(users);
    res.json({ status: 'success', message: 'สมัครสมาชิกเรียบร้อย' });
});

// expose users list (omit passwords)
app.get('/api/users', (req, res) => {
    const users = readUsers().map(u => ({ id: u.id, name: u.name, email: u.email }));
    res.json(users);
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body || {};
    const users = readUsers();
    const u = users.find(x => x.email === email && x.password === password);
    if (!u) return res.json({ status: 'error', message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    const token = 'tok_' + Date.now();
    const out = { id: u.id, name: u.name, email: u.email };
    res.json({ status: 'success', message: 'ยินดีต้อนรับ', token, user: out });
});

app.post('/api/trades', (req, res) => {
    const body = req.body;
    const trades = readTrades();
    const newOrder = Object.assign({ id: 'TO_' + Date.now(), status: 'pending', createdAt: new Date().toISOString() }, body);
    trades.push(newOrder);
    writeTrades(trades);
    res.json(newOrder);
});

app.put('/api/trades/:id/complete', (req, res) => {
    const id = req.params.id;
    const trades = readTrades();
    const idx = trades.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    trades[idx].status = 'completed';
    trades[idx].updatedAt = new Date().toISOString();
    writeTrades(trades);
    res.json(trades[idx]);
});

app.delete('/api/trades/:id', (req, res) => {
    const id = req.params.id;
    let trades = readTrades();
    trades = trades.filter(t => t.id !== id);
    writeTrades(trades);
    res.json({ ok: true });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});