// tradehistory.js
// Renders three sections: open orders, incoming requests, completed trades

document.addEventListener('DOMContentLoaded', () => {
	// Sample data — replace with real API calls as needed
	const openOrders = [
		{
			id: 'ORD-1001',
			createdAt: '2026-06-01T10:12:00',
			items: [ 'BTC 0.005', 'USDT 50' ],
			price: '฿150,000',
			details: 'สั่งขาย BTC ขนาดเล็กเพื่อทดสอบระบบ — ต้องการขายเมื่อราคาแตะ 150,000 บาท โปรดอย่าปรับราคาอัตโนมัติ การตั้งค่านี้มีการแบ่งส่ง 2 ครั้งในกรณีมีคำสั่งซื้อจำนวนมาก',
			counterparty: null,
			status: 'pending'
		},
		{
			id: 'ORD-1002',
			createdAt: '2026-06-02T14:05:00',
			items: [ 'ETH 0.2' ],
			price: '฿6,400',
			details: 'คำสั่งซื้อแบบ limit เพื่อสะสมเหรียญระยะกลาง — ไม่ยอมรับการเทรดทางเดียว ต้องยืนยันก่อนการจ่ายเงิน',
			counterparty: null,
			status: 'pending'
		}
	];

	const incoming = [
		{
			id: 'REQ-9001',
			from: 'user_alice',
			createdAt: '2026-06-02T16:20:00',
			offer: 'ต้องการซื้อ BTC 0.005 ในราคา ฿150,000',
			message: 'สนใจซื้อด่วนครับ ขอทราบวิธีจ่ายเงินและระยะเวลาการส่งเหรียญ — ผมมีประวัติเทรด 45 ครั้ง ไม่มีปัญหา',
			status: 'requested'
		}
	];

	const completed = [
		{
			id: 'TX-7001',
			createdAt: '2026-05-28T09:30:00',
			executedAt: '2026-05-28T09:45:12',
			items: [ 'BTC 0.01' ],
			price: '฿300,000',
			details: 'เทรดเสร็จสมบูรณ์ — ผู้ซื้อชำระผ่านพร้อมเพย์ เอกสารการโอนแนบในแชท การส่งเหรียญเสร็จสิ้นในเวลา 09:45:12 โดย TXID: abc123def456ghi789',
			counterparty: 'user_bob',
			status: 'completed'
		}
	];

	function formatDate(iso) {
		const d = new Date(iso);
		return d.toLocaleString('th-TH');
	}

	function renderCartStyleList(containerId, items, type) {
		const container = document.getElementById(containerId);
		container.innerHTML = '';
		if (!items || items.length === 0) {
			const emp = document.createElement('div');
			emp.className = 'empty-cart-text';
			emp.textContent = 'ยังไม่มีรายการ';
			container.appendChild(emp);
			return;
		}

		// header
		const header = document.createElement('div');
		header.className = 'cart-header';
		header.innerHTML = `
			<div></div>
			<div>รายละเอียด</div>
			<div>ราคา/เงื่อนไข</div>
			<div>สถานะ</div>
			<div>เวลา</div>
			<div></div>
		`;
		container.appendChild(header);

		items.forEach((o, idx) => {
			const row = document.createElement('div');
			row.className = 'cart-item';
			const name = Array.isArray(o.items) ? o.items.join(', ') : (o.offer || o.items || '');
			const statusLabel = o.status === 'completed' ? 'เสร็จแล้ว' : (type === 'incoming' ? 'คำขอ' : 'รอดำเนินการ');
			const timeText = o.executedAt ? formatDate(o.executedAt) : formatDate(o.createdAt);

			row.innerHTML = `
				<input type="checkbox" class="item-checkbox" data-index="${idx}" ${type==='completed' ? '' : 'checked'}>
				<div class="cart-item-info">
					<div class="cart-item-name">${o.id} — ${name}</div>
					<div class="cart-item-meta">${o.counterparty ? 'คู่สัญญา: ' + o.counterparty : (o.from ? 'ผู้เสนอ: ' + o.from : '')}</div>
				</div>
				<div class="cart-item-price">${o.price || ''}</div>
				<div class="cart-item-qty"><span class="status-badge ${o.status==='completed' ? 'completed' : 'pending'}">${statusLabel}</span></div>
				<div class="cart-item-total">${timeText}</div>
				<div>
					${type==='open' && o.status!=='completed' ? '<button class="delete-btn">ยกเลิก</button>' : '<button class="btn-small" disabled>ดู</button>'}
				</div>
			`;

			container.appendChild(row);

			// long details row
			const details = document.createElement('div');
			details.style.padding = '12px 20px 18px 70px';
			details.style.background = '#fff';
			details.style.borderBottom = '1px solid #eee';
			details.innerHTML = `<div style="color:#666; white-space:pre-line;">${o.details || o.message || ''}</div>`;
			container.appendChild(details);
		});
	}

	// Render all sections (cart-like UI)
	renderCartStyleList('open-list', openOrders, 'open');
	renderCartStyleList('incoming-list', incoming, 'incoming');
	renderCartStyleList('completed-list', completed, 'completed');

});
