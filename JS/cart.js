
// ไม่มีข้อมูลตัวอย่างสินค้าในไฟล์ cart.js — ใช้ข้อมูลจาก products.js
const SAMPLE_CART = [];

class CartManager {
    constructor() {
        this.initializeCart();
        this.renderCart();
        this.setupEventListeners();
    }

    initializeCart() {
        // ถ้าไม่มีข้อมูลตะกร้า ให้ใช้ข้อมูลตัวอย่าง
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify(SAMPLE_CART));
        }
    }

    getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        // แจ้งให้ส่วนอื่นๆ ทราบว่าตะกร้าเปลี่ยนแปลงแล้ว
        try {
            window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
        } catch (e) {
            // old browsers fallback
            window.dispatchEvent(new Event('cartUpdated'));
        }
    }

    renderCart() {
        const cart = this.getCart();
        const cartContent = document.getElementById('cart-items');

        if (!cartContent) return;

        if (cart.length === 0) {
            this.showEmptyCart();
            return;
        }

        // สร้าง header
        const header = document.createElement('div');
        header.className = 'cart-header';
        header.innerHTML = `
            <div></div>
            <div>ชื่อสินค้า</div>
            <div>ราคา</div>
            <div>จำนวน</div>
            <div>รวม</div>
            <div></div>
        `;
        cartContent.innerHTML = '';
        cartContent.appendChild(header);
        cart.forEach((item, index) => {

    const row = document.createElement('div');
    row.className = 'cart-item';

    row.innerHTML = `
        <div>
            <input
                type="checkbox"
                class="item-checkbox"
                checked
            >
        </div>

        <div class="product-info">
            <img
                src="http://localhost:3000/uploads/${item.image}"
                width="80"
            >

            <span>${item.name}</span>
        </div>

        <div>
            ${item.price} บาท
        </div>

        <div class="qty-controls">
            <button
                class="minus-btn"
                data-index="${index}"
            >
                -
            </button>

            <span>${item.quantity}</span>

            <button
                class="plus-btn"
                data-index="${index}"
            >
                +
            </button>
        </div>

        <div>
            ${(item.price * item.quantity).toFixed(2)}
            บาท
        </div>

        <div>
            <button
                class="delete-btn"
                data-index="${index}"
            >
                ลบ
            </button>
        </div>
    `;

    cartContent.appendChild(row);

});
        

        this.updateCartSummary();
    }

    showEmptyCart() {
        const cartContent = document.getElementById('cart-items');
        cartContent.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <div class="empty-cart-text">ตะกร้าว่างเปล่า</div>
                <a href="home.html" class="continue-shopping">กลับไปช้อปปิ้ง</a>
            </div>
        `;

        const cartSummary = document.getElementById('cart-summary');
        if (cartSummary) {
            cartSummary.innerHTML = `
                <div class="cart-summary">
                    <div class="summary-title">สรุปคำสั่งซื้อ</div>
                    <button class="checkout-btn" disabled>สั่งซื้อ</button>
                </div>
            `;
        }
    }

    updateCartSummary() {
        const cart = this.getCart();
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const SHIPPING_COST = 0;
        const shipping = cart.length > 0 ? SHIPPING_COST : 0;
        const total = subtotal + shipping;

        // Update header/checkout IDs used elsewhere
        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shipping');
        const totalEl = document.getElementById('total');
        if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
        if (shippingEl) shippingEl.textContent = shipping.toFixed(2);
        if (totalEl) totalEl.textContent = total.toFixed(2);

        // Update cart page summary elements (IDs used in cart.html)
        const cartSubtotalEl = document.getElementById('cart-subtotal');
        const shippingFeeEl = document.getElementById('shipping-fee');
        const cartGrandEl = document.getElementById('cart-grand');
        if (cartSubtotalEl) cartSubtotalEl.textContent = subtotal.toFixed(2) + ' บาท';
        if (shippingFeeEl) shippingFeeEl.textContent = shipping.toFixed(2) + ' บาท';
        if (cartGrandEl) cartGrandEl.textContent = total.toFixed(2) + ' บาท';

        // Update cart badge count (total quantity)
        const badge = document.getElementById('cartBadge');
        const qty = cart.reduce((s, item) => s + (item.quantity || 0), 0);
        if (badge) badge.textContent = qty;
    }

    increaseQty(index) {
        const cart = this.getCart();
        if (cart[index]) {
            cart[index].quantity++;
            this.saveCart(cart);
            this.renderCart();
        }
    }

    decreaseQty(index) {
        const cart = this.getCart();
        if (cart[index] && cart[index].quantity > 1) {
            cart[index].quantity--;
            this.saveCart(cart);
            this.renderCart();
        }
    }

    removeItem(index) {
        if (confirm('ยืนยันการลบสินค้า?')) {
            const cart = this.getCart();
            cart.splice(index, 1);
            this.saveCart(cart);
            this.renderCart();
        }
    }

    setupEventListeners() {
        const cartContent = document.getElementById('cart-items');
        if (!cartContent) return;

        // Event delegation สำหรับปุ่มต่างๆ
        cartContent.addEventListener('click', (e) => {
            const index = e.target.dataset.index;

            if (e.target.classList.contains('plus-btn')) {
                this.increaseQty(parseInt(index));
            } else if (e.target.classList.contains('minus-btn')) {
                this.decreaseQty(parseInt(index));
            } else if (e.target.classList.contains('delete-btn')) {
                this.removeItem(parseInt(index));
            }
        });

        // Checkbox สำหรับเลือกสินค้า
        const checkboxes = document.querySelectorAll('.item-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateCheckoutButton();
            });
        });
    }

    updateCheckoutButton() {
        const checkboxes = document.querySelectorAll('.item-checkbox:checked');
        const checkoutBtn = document.querySelector('.checkout-btn');
        
        if (checkoutBtn) {
            checkoutBtn.disabled = checkboxes.length === 0;
        }
    }

    proceedToCheckout() {
        const cart = this.getCart();
        
        if (cart.length === 0) {
            alert('ตะกร้าว่างเปล่า');
            return;
        }

        // บันทึกตะกร้าก่อนไปหน้าชำระเงิน
        localStorage.setItem('cart', JSON.stringify(cart));
        window.location.href = 'checkout.html';
    }
}

// เรียกใช้เมื่อโหลดหน้า
document.addEventListener('DOMContentLoaded', function() {
    const cartManager = new CartManager();

    // ตั้งค่า checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn && !checkoutBtn.disabled) {
        checkoutBtn.addEventListener('click', () => {
            cartManager.proceedToCheckout();
        });
    }

    // ปุ่มกลับ
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});