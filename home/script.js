// Dropdown toggle for category
function toggleDropdown() {
    const dropdown = document.getElementById('categoryDropdown');
    dropdown.style.display = (dropdown.style.display === 'none' || dropdown.style.display === '') ? 'block' : 'none';
}

function hideDropdown() {
    const dropdown = document.getElementById('categoryDropdown');
    dropdown.style.display = 'none';
}

// Hide dropdown when clicking outside
document.addEventListener('click', function(e) {
    const toggle = document.getElementById('dropdownToggle');
    const dropdown = document.getElementById('categoryDropdown');
    if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});
// Cart Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentFilter = 'all';
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Initialize
function init() {
    renderProducts(products);
    updateCartBadge();
    updateNavMenu();
}

// Render Products
function renderProducts(productsToRender) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    if (productsToRender.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem;">ไม่พบสินค้า</p>';
        return;
    }

    productsToRender.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">${product.price} บาท /กก.</div>
                <div class="product-stock">📦 เหลือ ${product.stock} กก.</div>
                <div class="product-actions">
                    <button class="btn-detail" onclick="showDetail(${product.id})">ใส่ตะกร้า</button>
                    <button class="btn-add" onclick="addToCart(${product.id})">ซื้อสินค้า</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filter Products
function filterProducts(category) {
    currentFilter = category;
    const navLinks = document.querySelectorAll('.nav-link');
    const categoryBtns = document.querySelectorAll('.category-btn');

    // Remove active class from all nav links and category buttons
    navLinks.forEach(link => link.classList.remove('active'));
    categoryBtns.forEach(btn => btn.classList.remove('active'));

    // Add active class to the clicked button or link
    // Try to find the button or link that matches the category
    navLinks.forEach(link => {
        if ((category === 'all' && link.textContent.includes('หน้าแรก')) || link.textContent.trim() === category) {
            link.classList.add('active');
        }
    });
    categoryBtns.forEach(btn => {
        if ((category === 'all' && btn.textContent.includes('ทั้งหมด')) || btn.textContent.trim() === category) {
            btn.classList.add('active');
        }
    });

    // Filter products
    let filteredProducts = [];
    if (category === 'all') {
        filteredProducts = products;
    } else {
        filteredProducts = products.filter(product => product.category === category);
    }
    renderProducts(filteredProducts);
}

// Run init when DOM is ready
window.addEventListener('DOMContentLoaded', init);