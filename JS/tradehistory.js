// Render trade history and pending trade on tradehistory.html
document.addEventListener('DOMContentLoaded', function() {
    function getTradeOrders() {
        try {
            return JSON.parse(localStorage.getItem('tradeOrders')) || [];
        } catch (e) { return []; }
    }

    function getPendingTrade() {
        try { return JSON.parse(localStorage.getItem('trade')) || []; } catch (e) { return []; }
    }

    function formatDate(iso) {
        try { const d = new Date(iso); return d.toLocaleString(); } catch (e) { return iso; }
    }

    function renderPending() {
        const pending = getPendingTrade();
        const container = document.getElementById('pending-trade');
        if (!container) return;
        if (pending.length === 0) {
            container.innerHTML = '<div class="empty-cart-text">ยังไม่มีการลงเทรดรอส่ง</div>';
            return;
        }
        let html = '<div class="card">';
        html += '<h3>รายการรอส่ง</h3>';
        pending.forEach((it, idx) => {
            html += `<div class="trade-item"><strong>${it.name}</strong> — จำนวน ${it.quantity} ${it.unit || ''} <span class="meta">(คลัง ${it.stock || '-'})</span></div>`;
        });
        html += `<div style="margin-top:12px; display:flex; gap:8px;"><button id="send-pending-btn" class="btn btn-outline-green">ส่งคำขอแลก</button><button id="clear-pending-btn" class="btn">ล้างรายการ</button></div>`;
        html += '</div>';
        container.innerHTML = html;
    }

    function renderHistory() {
        const orders = getTradeOrders();
        const container = document.getElementById('trade-history');
        if (!container) return;
        if (orders.length === 0) {
            container.innerHTML = '<div class="empty-cart-text">ยังไม่มีประวัติการเทรด</div>';
            return;
        }
        let html = '';
        orders.slice().reverse().forEach(order => {
            const statusClass = order.status === 'completed' ? 'completed' : 'pending';
            html += `<div class="trade-order" data-id="${order.id}">
                <div class="trade-order-header">
                    <div>ID: ${order.id}</div>
                    <div>สถานะ: <span class="status-badge ${statusClass}">${order.status}</span></div>
                    <div>วันที่: ${formatDate(order.createdAt)}</div>
                </div>
                <div class="trade-order-items">`;
            order.items.forEach(it => {
                html += `<div class="trade-item">• ${it.name} — จำนวน ${it.quantity} ${it.unit || ''}</div>`;
            });
            html += `</div>
                <div style="margin-top:8px; display:flex; gap:8px;">
                    ${order.status !== 'completed' ? `<button class="btn btn-outline-green mark-complete-btn" data-id="${order.id}">ทำเครื่องหมายเสร็จ</button>` : ''}
                    <button class="btn delete-order-btn" data-id="${order.id}">ลบ</button>
                </div>
            </div>`;
        });
        container.innerHTML = html;
    }

    // Actions
    function sendPendingAsOrder() {
        const pending = getPendingTrade();
        if (!pending || pending.length === 0) { alert('ไม่มีรายการที่จะส่ง'); return; }
        const orders = getTradeOrders();
        const newOrder = {
            id: 'TO_' + Date.now(),
            items: pending,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        orders.push(newOrder);
        localStorage.setItem('tradeOrders', JSON.stringify(orders));
        localStorage.setItem('trade', JSON.stringify([]));
        renderPending(); renderHistory();
        alert('ส่งคำขอแลกเรียบร้อย');
    }

    function clearPending() {
        if (!confirm('ต้องการล้างรายการรอส่งหรือไม่?')) return;
        localStorage.setItem('trade', JSON.stringify([]));
        renderPending();
    }

    function markOrderComplete(id) {
        const orders = getTradeOrders();
        const idx = orders.findIndex(o => o.id === id);
        if (idx === -1) return;
        orders[idx].status = 'completed';
        orders[idx].updatedAt = new Date().toISOString();
        localStorage.setItem('tradeOrders', JSON.stringify(orders));
        renderHistory();
    }

    function deleteOrder(id) {
        if (!confirm('ลบคำขอเทรดนี้จริงหรือไม่?')) return;
        const orders = getTradeOrders().filter(o => o.id !== id);
        localStorage.setItem('tradeOrders', JSON.stringify(orders));
        renderHistory();
    }

    renderPending();
    renderHistory();

    // (seed button removed) For safety, no sample-data handler is registered here.

    // wire action buttons (delegation)
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'send-pending-btn') {
            sendPendingAsOrder();
        } else if (e.target && e.target.id === 'clear-pending-btn') {
            clearPending();
        } else if (e.target && e.target.classList.contains('mark-complete-btn')) {
            const id = e.target.dataset.id; if (id) markOrderComplete(id);
        } else if (e.target && e.target.classList.contains('delete-order-btn')) {
            const id = e.target.dataset.id; if (id) deleteOrder(id);
        }
    });

    // Refresh when storage changes (from other tabs/actions)
    window.addEventListener('storage', (e) => {
        if (e.key === 'trade' || e.key === 'tradeOrders' || e.key === 'tradeOrders') {
            renderPending(); renderHistory();
        }
    });
});
