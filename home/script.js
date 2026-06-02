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
    setupSearch();
    setupSort();
}
// Search Products
function setupSearch() {
    const searchInput = document.getElementById('searchInput');

    if (!searchInput) return;

    searchInput.addEventListener('input', function () {

        const keyword = this.value.toLowerCase();

        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(keyword)
        );

        renderProducts(filteredProducts);
    });
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
                    
                    <button class="btn-add" onclick="addToCart(${product.id})">แลกเปลี่ยนได้</button>
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
// Add To Cart
function addToCart(productId) {

    const product = products.find(p => p.id === productId);

    if (!product) return;

    cart.push(product);

    localStorage.setItem('cart', JSON.stringify(cart));

    updateCartBadge();

    alert(product.name + ' ถูกเพิ่มลงตะกร้าแล้ว');
}
// Update Cart Badge
function updateCartBadge() {

    const badge = document.getElementById('cartBadge');

    if (!badge) return;

    badge.textContent = cart.length;
}
// Show Product Detail
function showDetail(productId) {

    const product = products.find(p => p.id === productId);

    if (!product) return;

    const modal = document.getElementById('detailModal');
    const detailContent = document.getElementById('detailContent');

    detailContent.innerHTML = `
        <div class="detail-container">

            <img src="${product.image}" 
                 alt="${product.name}" 
                 style="width:100%; max-width:300px; border-radius:10px;">

            <h2>${product.name}</h2>

            <p>${product.description}</p>

            <h3>${product.price} บาท / กก.</h3>

            <button onclick="addToCart(${product.id})">
                เพิ่มลงตะกร้า
            </button>

        </div>
    `;

    modal.style.display = 'flex';
}
function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

// Setup Sort
function setupSort() {

    const sortSelect = document.getElementById('sortSelect');

    if (!sortSelect) return;

    sortSelect.addEventListener('change', function () {

        let sortedProducts = [...products];

        if (this.value === 'low-high') {
            sortedProducts.sort((a, b) => a.price - b.price);
        }

        if (this.value === 'high-low') {
            sortedProducts.sort((a, b) => b.price - a.price);
        }

        renderProducts(sortedProducts);
    });
}
// Run init when DOM is ready
window.addEventListener('DOMContentLoaded', init);