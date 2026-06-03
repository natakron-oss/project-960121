// ========================================
// หน้าแรก - Product Detail Page (dynamic)
// ========================================

let currentProduct = null;

// เพิ่มจำนวน
function increaseQty() {
    const qtyInput = document.getElementById('quantity');
    if (!qtyInput) return;
    qtyInput.value = parseInt(qtyInput.value) + 1;
}

// ลดจำนวน
function decreaseQty() {
    const qtyInput = document.getElementById('quantity');
    if (!qtyInput) return;
    if (parseInt(qtyInput.value) > 1) {
        qtyInput.value = parseInt(qtyInput.value) - 1;
    }
}

// เพิ่มลงตะกร้าจากหน้ารายละเอียด
function addToCartDetail() {
    const qtyInput = document.getElementById('quantity');
    const qty = qtyInput ? parseInt(qtyInput.value) : 1;
    if (!currentProduct) {
        alert('ไม่พบข้อมูลสินค้า');
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.id === currentProduct.id);
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            quantity: qty,
            image: currentProduct.image
        });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    const badge = document.getElementById('cartBadge');
    if (badge) badge.textContent = cart.length;
    alert(`เพิ่มสินค้า ${qty} ชิ้นลงตะกร้าแล้ว`);
}

// โหลดข้อมูลสินค้าจาก query string และเติมลงหน้า
function loadDetailFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    if (!id) return;
    const product = (typeof products !== 'undefined') ? products.find(p => p.id === id) : null;
    if (!product) return;
    currentProduct = product;

    const mainImage = document.querySelector('.main-image');
    if (mainImage) mainImage.src = product.image;

    const title = document.querySelector('.product-title');
    if (title) title.textContent = product.name;

    const price = document.querySelector('.product-price');
    if (price) price.textContent = `${product.price} บาท / กก.`;

    const desc = document.querySelector('.product-description');
    if (desc) desc.innerHTML = product.description ? product.description.replace(/\n/g, '<br>') : '';

    const stock = document.querySelector('.stock-info');
    if (stock) stock.textContent = `เพิ่มได้สูงสุด ${product.stock || 18} กก.`;

    const qtyInput = document.getElementById('quantity');
    if (qtyInput) qtyInput.value = 1;
}

// เรียกโหลดรายละเอียดเมื่อหน้าโหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    loadDetailFromQuery();
});

// ========================================
// หน้าตะกร้า - Cart Page
// ========================================

function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>ตะกร้าว่างเปล่า</p>';
        return;
    }
    
    cartContainer.innerHTML = '';
    
    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <input type="checkbox" class="item-checkbox" data-index="${index}" checked>
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>ราคาต่อหน่วย: ${item.price} บาท/กก.</p>
                <p>เพิ่มได้สูงสุด: 10 วัน</p>
            </div>
            <div class="cart-item-qty">
                <button onclick="decreaseCartQty(${index})">−</button>
                <span>${item.quantity}</span>
                <button onclick="increaseCartQty(${index})">+</button>
            </div>
            <div class="cart-item-price">${item.price * item.quantity}.00 บาท</div>
            <button class="delete-btn" onclick="removeFromCart(${index})">ลบสินค้า</button>
        `;
        cartContainer.appendChild(cartItem);
    });
    
    updateCartTotal();
}

function increaseCartQty(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[index].quantity++;
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

function decreaseCartQty(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
    }
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

function updateCartTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const totalElement = document.getElementById('cart-total');
    if (totalElement) {
        totalElement.textContent = total.toFixed(2);
    }
}

function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('ตะกร้าว่างเปล่า');
        return;
    }
    
    window.location.href = 'checkout.html';
}

// ========================================
// หน้าชำระเงิน - Checkout Page
// ========================================

function loadOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const summaryContainer = document.getElementById('order-items');
    
    if (summaryContainer) {
        summaryContainer.innerHTML = '';
        
        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const summaryItem = document.createElement('div');
            summaryItem.className = 'summary-item';
            summaryItem.innerHTML = `
                <div>
                    <div class="summary-item-name">${item.name}</div>
                    <small>${item.price} บาท/กก. x ${item.quantity}</small>
                </div>
                <div class="summary-item-price">${itemTotal.toFixed(2)} บาท</div>
            `;
            summaryContainer.appendChild(summaryItem);
        });
        
        const totalElement = document.getElementById('order-total');
        if (totalElement) {
            totalElement.textContent = total.toFixed(2);
        }
    }
}

function submitOrder(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    
    if (!name || !phone || !address) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }
    
    const orderData = {
        customer: {
            name: name,
            phone: phone,
            address: address
        },
        items: JSON.parse(localStorage.getItem('cart')),
        total: document.getElementById('order-total').textContent,
        deliveryMethod: document.querySelector('input[name="delivery"]:checked').value,
        paymentMethod: document.querySelector('input[name="payment"]:checked').value,
        orderDate: new Date().toISOString()
    };
    
    console.log('Order submitted:', orderData);
    
    // ส่ง order ไป backend (ที่นี่เป็นเพียงการแสดงว่าขั้นตอนทำงาน)
    localStorage.setItem('order', JSON.stringify(orderData));
    localStorage.removeItem('cart');
    
    alert('สั่งซื้อสำเร็จ! ขอบคุณที่ใช้บริการ SmartFarm');
    window.location.href = 'index.html';
}

// เรียกใช้เมื่อโหลดหน้า
document.addEventListener('DOMContentLoaded', function() {
    // ตรวจสอบว่าอยู่หน้าไหน
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('cart') || currentPage.includes('page2')) {
        loadCart();
    }
    
    if (currentPage.includes('checkout') || currentPage.includes('page3')) {
        loadOrderSummary();
    }
});