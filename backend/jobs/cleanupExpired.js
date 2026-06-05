// ════════════════════════════════════════
//  cleanupExpired.js
//  Cron job: ลบสินค้าหมดอายุทุกคืนเที่ยงคืน
//  ใช้ร่วมกับ node-cron (npm install node-cron)
// ════════════════════════════════════════

const cron = require("node-cron");
const path = require("path");
const fs   = require("fs");
const db   = require("../config/db");

async function deleteExpiredProducts() {
  try {
    // 1. ดึงรายการที่หมดอายุ
    const [expired] = await db.query(
      `SELECT id, name, image FROM products WHERE expire_date < CURDATE()`
    );

    if (!expired.length) {
      console.log("[Cleanup] ไม่มีสินค้าหมดอายุ");
      return;
    }

    // 2. ลบไฟล์รูปออกจาก disk
    for (const p of expired) {
      if (p.image) {
        const fp = path.join(__dirname, "../../uploads", p.image);
        if (fs.existsSync(fp)) {
          fs.unlinkSync(fp);
          console.log(`[Cleanup] ลบรูป: ${p.image}`);
        }
      }
    }

    // 3. ลบสินค้าออกจาก DB (FK cascade → cart_items, order_items ลบตาม)
    const ids = expired.map(p => p.id);
    await db.query(`DELETE FROM products WHERE id IN (?)`, [ids]);

    console.log(`[Cleanup] ลบสินค้าหมดอายุ ${expired.length} รายการ:`,
      expired.map(p => `#${p.id} ${p.name}`).join(", ")
    );

  } catch (err) {
    console.error("[Cleanup] ERROR:", err.message);
  }
}

// ── รันทุกชั่วโมง ──
cron.schedule("0 * * * *", () => {
  console.log("[Cleanup] ตรวจสอบสินค้าหมดอายุ...");
  deleteExpiredProducts();
}, {
  timezone: "Asia/Bangkok"
});

// export ให้เรียกแบบ manual ได้ด้วย (เช่น ตอน server start)
module.exports = { deleteExpiredProducts };