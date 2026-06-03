// tradehistory.js
// Renders three sections: open orders, incoming requests, completed trades

document.addEventListener('DOMContentLoaded', () => {
	// Sample data using product IDs from products.js — displays vegetable names

	function formatDate(iso) {
		const d = new Date(iso);
		return d.toLocaleString('th-TH');
	}

	// Ensure products.js is loaded (in case page didn't include it)
	function ensureProductsLoaded(cb) {
		if (window.products && Array.isArray(window.products)) return cb();
		const s = document.createElement('script');
		s.src = 'products.js';
		s.onload = () => cb();
		s.onerror = () => { console.error('Cannot load products.js'); cb(); };
		document.head.appendChild(s);
	}

	function buildSampleData() {
		const p = window.products || [];
		const pick = i => (p[i] ? p[i].id : (i+1));

		const openOrders = [
			{
				id: 'ORD-1001',
				createdAt: '2026-06-01T10:12:00',
				items: [ { productId: pick(0), qty: 2 }, { productId: pick(5), qty: 1 } ],
				price: p[0] ? `฿${p[0].price * 2}` : '฿0',
				details: 'สั่งขาย/แลกเปลี่ยนผักตามรายการด้านล่าง กรุณาติดต่อเพื่อยืนยันการนัดรับ',
				counterparty: null,
				status: 'pending'
			},
			{
				id: 'ORD-1002',
				createdAt: '2026-06-02T14:05:00',
				items: [ { productId: pick(2), qty: 1 } ],
				price: p[2] ? `฿${p[2].price}` : '฿0',
				details: 'คำสั่งแบบจองล่วงหน้า รอการยืนยันจากผู้ขาย',
				counterparty: null,
				status: 'pending'
			}
		];

		const incoming = [
			{
				id: 'REQ-9001',
				from: 'user_alice',
				createdAt: '2026-06-02T16:20:00',
				offer: { productId: pick(0), qty: 1, price: p[0] ? `฿${p[0].price}` : '' },
				message: 'สนใจแลกคะน้า 1 กก. ขอวิธีการรับสินค้าและเวลานัดรับ',
				status: 'requested'
			}
		];

		const completed = [
			{
				id: 'TX-7001',
				createdAt: '2026-05-28T09:30:00',
				executedAt: '2026-05-28T09:45:12',
				items: [ { productId: pick(9), qty: 6 } ],
				price: p[9] ? `฿${p[9].price * 6}` : '฿0',
				details: 'เทรดเสร็จสมบูรณ์ — ผู้ซื้อชำระผ่านพร้อมเพย์ เอกสารการโอนแนบในแชท การรับสินค้าเรียบร้อย',
				counterparty: 'user_bob',
				status: 'completed'
			}
		];

		return { openOrders, incoming, completed };
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

		function getProductName(id) {
			const arr = window.products || [];
			const p = arr.find(x => x.id === id);
			return p ? p.name : 'ไม่ทราบสินค้า';
		}

		function itemsToLabel(items) {
			if (!Array.isArray(items)) return '';
			return items.map(it => {
				const pid = it.productId || it.id;
				const qty = it.qty ? (' x' + it.qty) : '';
				return `${getProductName(pid)}${qty}`;
			}).join(', ');
		}

		items.forEach((o, idx) => {
			const row = document.createElement('div');
			row.className = 'cart-item';
			const name = Array.isArray(o.items) ? itemsToLabel(o.items) : (o.offer ? (o.offer.productId ? `${getProductName(o.offer.productId)} x${o.offer.qty}` : o.offer) : '');
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

	// Ensure products loaded, build sample data and render
	ensureProductsLoaded(() => {
		const data = buildSampleData();
		renderCartStyleList('open-list', data.openOrders, 'open');
		renderCartStyleList('incoming-list', data.incoming, 'incoming');
		renderCartStyleList('completed-list', data.completed, 'completed');
	});

});
