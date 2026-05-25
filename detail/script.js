// ========================================
// หน้าแรก - Product Detail Page
// ========================================

// เพิ่มจำนวน
function increaseQty() {
    const qtyInput = document.getElementById('quantity');
    qtyInput.value = parseInt(qtyInput.value) + 1;
}

// ลดจำนวน
function decreaseQty() {
    const qtyInput = document.getElementById('quantity');
    if (parseInt(qtyInput.value) > 1) {
        qtyInput.value = parseInt(qtyInput.value) - 1;
    }
}

// เพิ่มลงตะกร้า
function addToCart() {
    const qty = document.getElementById('quantity').value;
    const product = {
        id: 1,
        name: 'คะน้า',
        price: 30,
        quantity: parseInt(qty),
        image: 'basil-main.jpg'
    };
    
    // เก็บลง localStorage (สำหรับการทดลอง)
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // ตรวจสอบว่าสินค้านี้มีในตะกร้าแล้วหรือไม่
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += product.quantity;
    } else {
        cart.push(product);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`เพิ่มสินค้า ${qty} ชิ้นลงตะกร้าแล้ว`);
}

// เพิ่มในรายการโปรด
function addToWishlist() {
    alert('เพิ่มเข้าตะกร้าแล้ว');
}

// เปลี่ยนรูปภาพ
document.addEventListener('DOMContentLoaded', function() {
    const thumbnails = document.querySelectorAll('.thumbnail-images img');
    const mainImage = document.querySelector('.main-image');
    
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            mainImage.src = this.src;
        });
    });
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