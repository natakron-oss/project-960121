document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('main-navbar');
    const notifDropdown = document.getElementById('notif-dropdown');
    const notifList = document.getElementById('notif-list');
    const notifBadge = document.getElementById('notif-badge');
    
    // สถานะ (State) ของระบบ
    let state = {
        activeTab: 'Market',
        isNotifOpen: false,
        cartItems: [], // ดึงมาจาก localStorage ได้เพื่อทำ Continuity
        notifications: []
    };

    // 1. ดึงข้อมูลจาก Data Source (แก้ปัญหา Hardcode)
    async function fetchNotifications() {
        try {
            // ในโปรเจกต์จริง เปลี่ยน URL เป็น /api/notifications
            // ตรงนี้เป็นการจำลองรับข้อมูล JSON
            const response = await fetch('/data/mock-notifications.json'); 
            const data = await response.json();
            state.notifications = data;
            renderNotifications();
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }

    // 2. การแยก Data ออกจาก UI (Render Logic)
    function renderNotifications() {
        notifList.innerHTML = '';
        let hasUnread = false;

        state.notifications.forEach(n => {
            if (n.unread) hasUnread = true;
            
            const item = document.createElement('div');
            item.className = `p-2 rounded-lg text-xs cursor-pointer ${n.unread ? 'bg-green-50 font-medium' : 'text-gray-600'}`;
            item.innerHTML = `
                <div class="flex justify-between">
                    <span>${n.text}</span>
                    ${n.unread ? '<span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>' : ''}
                </div>
                <span class="text-[10px] text-gray-400 mt-1">${n.time}</span>
            `;
            notifList.appendChild(item);
        });

        // จัดการ Badge แจ้งเตือน
        if (hasUnread) {
            notifBadge.classList.remove('hidden');
        } else {
            notifBadge.classList.add('hidden');
        }
    }

    // 3. EVENT DELEGATION - รับ Event ที่ Parent ตัวเดียว
    navbar.addEventListener('click', (e) => {
        // หา Element ที่ถูกคลิก แล้วเช็ค data-action
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.getAttribute('data-action');

        if (action === 'toggle-notif') {
            state.isNotifOpen = !state.isNotifOpen;
            notifDropdown.classList.toggle('hidden', !state.isNotifOpen);
            if (state.isNotifOpen && state.notifications.length === 0) {
                fetchNotifications(); // ดึงข้อมูลเมื่อกดเปิด
            }
        } 
        else if (action === 'nav-tab') {
            const tabName = target.getAttribute('data-tab');
            state.activeTab = tabName;
            console.log('Navigated to:', tabName);
            // เขียนโค้ดเปลี่ยนหน้า UI ตรงนี้
        }
        else if (action === 'open-cart') {
            console.log('Opening Cart Modal...');
            // เรียกฟังก์ชันเปิด Cart
        }
    });
});