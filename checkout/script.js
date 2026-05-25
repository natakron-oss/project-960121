// Sample products data
const sampleProducts = [
    {
        id: 1,
        name: 'Organic Carrots',
        quantity: 1,
        price: 7.00
    },
    {
        id: 2,
        name: 'Fresh Broccoli',
        quantity: 2,
        price: 4.00
    },
    {
        id: 3,
        name: 'Sweet Potatoes',
        quantity: 1,
        price: 8.25
    }
];

// Shipping cost
const SHIPPING_COST = 50;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();
    attachFormListener();
});

// Load cart items from localStorage or use sample data
function loadCartItems() {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || sampleProducts;
    
    if (cartItems.length === 0) {
        cartItems = sampleProducts;
    }

    displayProducts(cartItems);
    calculateTotals(cartItems);
}

// Display products in the order summary
function displayProducts(products) {
    const productsList = document.getElementById('productsList');
    const summaryRow = document.getElementById('summaryRow');

    if (products.length === 0) {
        summaryRow.innerHTML = `
            <td colspan="3" style="padding: 20px; text-align: center; color: #999;">
                ตะกร้าว่างเปล่า
            </td>
        `;
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
        return sum + (product.price * product.quantity);
    }, 0);

    const shipping = products.length > 0 ? SHIPPING_COST : 0;
    const grandTotal = subtotal + shipping;

    document.getElementById('subtotal').textContent = subtotal.toFixed(2) + ' บาท';
    document.getElementById('shipping').textContent = shipping.toFixed(2) + ' บาท';
    document.getElementById('grandTotal').textContent = '฿' + grandTotal.toFixed(2);
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
    const order = {
        id: 'ORD-' + Date.now(),
        fullname: fullname,
        phone: phone,
        address: address,
        shippingMethod: shippingMethod,
        items: JSON.parse(localStorage.getItem('cartItems')) || sampleProducts,
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
    localStorage.removeItem('cartItems');

    // Redirect to home page
    window.location.href = 'index.html';
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
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || sampleProducts;
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    const existingProduct = cartItems.find(item => item.id === product.id);
    
    if (existingProduct) {
        existingProduct.quantity += product.quantity || 1;
    } else {
        cartItems.push(product);
    }
    
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartDisplay();
}

// Remove product from cart
function removeFromCart(productId) {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    cartItems = cartItems.filter(item => item.id !== productId);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartDisplay();
}

// Update product quantity
function updateProductQuantity(productId, quantity) {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    const product = cartItems.find(item => item.id === productId);
    if (product) {
        product.quantity = quantity;
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            updateCartDisplay();
        }
    }
}