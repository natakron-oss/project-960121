// ใช้ข้อมูลตะกร้าจาก localStorage (`cart`) และ/หรือ catalog จาก products.js
const SHIPPING_COST = 50;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();
    attachFormListener();
});

// Listen for cart updates (from other parts of the app)
window.addEventListener('cartUpdated', function (e) {
    loadCartItems();
});

// Also listen to storage events (cross-tab)
window.addEventListener('storage', function (e) {
    if (e.key === 'cart') {
        loadCartItems();
    }
});

// Load cart items from localStorage (no fallback products here)
function loadCartItems() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    displayProducts(cartItems);
    calculateTotals(cartItems);
}

// Display products in the order summary
function displayProducts(products) {
    const productsList = document.getElementById('productsList');
    const summaryRow = document.getElementById('summaryRow');

    if (!products || products.length === 0) {
        summaryRow.innerHTML = `
            <td colspan="3" style="padding: 20px; text-align: center; color: #999;">
                ตะกร้าว่างเปล่า
            </td>
        `;
        productsList.innerHTML = '';
        return;
    }

    // Clear products list
    productsList.innerHTML = '';

    // Add each product
    products.forEach((product, index) => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
            <span class="product-name">${product.name}</span>
            <span class="product-qty">${product.quantity} ชิ้น</span>
            <span class="product-price">${(product.price * product.quantity).toFixed(2)} บาท</span>
        `;
        productsList.appendChild(productItem);
    });

    // Update summary table
    summaryRow.innerHTML = products.map(product => `
        <tr style="border-bottom: 1px solid #e0e0e0;">
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>${(product.price * product.quantity).toFixed(2)} บาท</td>
        </tr>
    `).join('');
}

// Calculate and display totals
function calculateTotals(products) {
    const subtotal = products.reduce((sum, product) => {
        const qty = product.quantity || 1;
        return sum + (product.price * qty);
    }, 0);

    const shipping = products.length > 0 ? SHIPPING_COST : 0;
    const grandTotal = subtotal + shipping;

    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const grandEl = document.getElementById('grandTotal');
    if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2) + ' บาท';
    if (shippingEl) shippingEl.textContent = shipping.toFixed(2) + ' บาท';
    if (grandEl) grandEl.textContent = '฿' + grandTotal.toFixed(2);
}

// Attach form submit listener
function attachFormListener() {
    const form = document.getElementById('customerForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitOrder();
    });
}

// Submit order
function submitOrder() {
    const fullname = document.getElementById('fullname').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const shippingMethod = document.querySelector('input[name="shipping"]:checked').value;

    // Validate form
    if (!fullname || !phone || !address) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    // Save order
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    const order = {
        id: 'ORD-' + Date.now(),
        fullname: fullname,
        phone: phone,
        address: address,
        shippingMethod: shippingMethod,
        items: cartItems,
        date: new Date().toLocaleDateString('th-TH'),
        status: 'pending'
    };

    // Store order in localStorage
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Show success message
    alert('สั่งซื้อสำเร็จ! รหัสคำสั่ง: ' + order.id);

    // Clear form and cart
    document.getElementById('customerForm').reset();
    localStorage.removeItem('cart');

    // Show a simple confirmation modal/alert and keep orders saved
    // (orders already saved above)

    // Redirect to home page
    window.location.href = 'home.html';
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
    }).format(amount);
}

// Get cart summary
function getCartSummary() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const shipping = cartItems.length > 0 ? SHIPPING_COST : 0;

    return {
        items: cartItems,
        subtotal: subtotal,
        shipping: shipping,
        total: subtotal + shipping
    };
}

// Update cart display
function updateCartDisplay() {
    const summary = getCartSummary();
    displayProducts(summary.items);
    
    document.getElementById('subtotal').textContent = summary.subtotal.toFixed(2) + ' บาท';
    document.getElementById('shipping').textContent = summary.shipping.toFixed(2) + ' บาท';
    document.getElementById('grandTotal').textContent = '฿' + summary.total.toFixed(2);
}

// Add product to cart (can be called from other pages)
function addToCart(product) {
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    const existingProduct = cartItems.find(item => item.id === product.id);

    if (existingProduct) {
        existingProduct.quantity += product.quantity || 1;
    } else {
        cartItems.push(product);
    }

    localStorage.setItem('cart', JSON.stringify(cartItems));
    // notify other parts
    try { window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: cartItems } })); }
    catch (e) { window.dispatchEvent(new Event('cartUpdated')); }
    updateCartDisplay();
}

// Remove product from cart
function removeFromCart(productId) {
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    cartItems = cartItems.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    try { window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: cartItems } })); }
    catch (e) { window.dispatchEvent(new Event('cartUpdated')); }
    updateCartDisplay();
}

// Update product quantity
function updateProductQuantity(productId, quantity) {
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    const product = cartItems.find(item => item.id === productId);
    if (product) {
        product.quantity = quantity;
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cartItems));
            try { window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: cartItems } })); }
            catch (e) { window.dispatchEvent(new Event('cartUpdated')); }
            updateCartDisplay();
        }
    }
}