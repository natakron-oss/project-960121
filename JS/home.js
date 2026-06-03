// ฟังก์ชันเปิด/ปิด Dropdown
function toggleDropdown() {
    const dropdown = document.getElementById("category-dropdown");
    if (dropdown) {
        dropdown.classList.toggle("show");
    }
}

// ปิด Dropdown เมื่อคลิกที่อื่นนอกกรอบ
window.onclick = function(event) {
    if (!event.target.closest('.dropdown-container')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// Cart Management
let currentFilter = 'all';

// Initialize
function init() {
    setupDistanceSlider();
    setupTypeSelect();
    setupSearch();
    setupSort();
    updateCartBadge();
    updateNavMenu();
    applyFilters();
}

// Setup Distance Slider
function setupDistanceSlider() {
    const slider = document.getElementById('distance-slider');
    const valSpan = document.getElementById('distance-val');
    if (slider) {
        slider.addEventListener('input', function() {
            let km = (this.value / 1000).toFixed(1);
            if (valSpan) valSpan.innerText = km;
            applyFilters();
        });
    }
}

// Setup Type Select dropdown
function setupTypeSelect() {
    const select = document.getElementById('type-select');
    if (select) {
        select.addEventListener('change', function() {
            applyFilters();
        });
    }
}

// Search Products
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            applyFilters();
        });
    }
}

// Setup Sort
function setupSort() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            applyFilters();
        });
    }
}

// Filter and Render logic
function applyFilters() {
    let filtered = [...products];

    // 1. Category Filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(product => product.category === currentFilter);
    }

    // 2. Search Keyword
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value) {
        const keyword = searchInput.value.toLowerCase().trim();
        filtered = filtered.filter(product => product.name.toLowerCase().includes(keyword));
    }

    // 3. Distance Filter
    const distanceSlider = document.getElementById('distance-slider');
    if (distanceSlider) {
        const maxDistance = parseInt(distanceSlider.value);
        filtered = filtered.filter(product => {
            const distance = product.distance || ((product.id * 373) % 9900 + 100);
            return distance <= maxDistance;
        });
    }

    // 4. Type Filter
    const typeSelect = document.getElementById('type-select');
    if (typeSelect && typeSelect.value !== 'all') {
        const selectedType = typeSelect.value;
        filtered = filtered.filter(product => {
            const type = product.type || (product.id % 2 === 0 ? 'swap' : 'sell');
            return type === selectedType;
        });
    }

    // 5. Sort
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect && sortSelect.value) {
        if (sortSelect.value === 'low-high') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortSelect.value === 'high-low') {
            filtered.sort((a, b) => b.price - a.price);
        }
    }

    renderProducts(filtered);
}

// Render Products Grid
function renderProducts(productsList) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    if (productsList.length === 0) {
        productsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #888;">ไม่พบสินค้าที่ตรงตามเงื่อนไข</div>`;
        return;
    }

    productsGrid.innerHTML = productsList.map(product => {
        const days = product.bestBeforeDays || (product.id % 3 + 1); 
        const ownerName = product.owner || "Elena S.";
        const distance = product.distance || ((product.id * 373) % 9900 + 100);
        const type = product.type || (product.id % 2 === 0 ? 'swap' : 'sell');
        
        let badgeBgColor = '#22c55e'; // Green
        let badgeTextColor = '#ffffff';
        if (days === 1) {
            badgeBgColor = '#ef4444';  // Red
            badgeTextColor = '#ffffff';
        } else if (days <= 3) {
            badgeBgColor = '#F49D73';  // Orange
            badgeTextColor = '#5C2710';
        }
        
        return `
            <div class="product-card" onclick="showDetail(${product.id})">
                <div class="card-img-container">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="card-badge" style="background-color: ${badgeBgColor}; color: ${badgeTextColor};">
                        Best Before: ${days} วัน
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-title-row">
                        <h3>${product.name}</h3>
                        <span class="card-type-label" style="color: var(--primary); font-weight: bold;">
                            ${type === 'swap' ? 'Swap' : 'Sell'}
                        </span>
                    </div>
                    <div class="card-owner-row">
                        <i class="fa-regular fa-user"></i>
                        <span>${ownerName}</span>
                    </div>
                    <div class="card-owner-row" style="font-size: 0.8rem; color: #666;">
                        <i class="fa-solid fa-location-dot"></i>
                        <span>ห่างออกไป ${(distance / 1000).toFixed(1)} กม.</span>
                    </div>
                    <div class="product-stock">📦 เหลือ ${product.stock} กก.</div>
                    <div class="card-divider"></div>
                    <div class="card-footer-row" onclick="event.stopPropagation()">
                        <button class="card-btn-cart" onclick="addToCart(${product.id})">
                            <i class="fa-solid fa-shopping-cart"></i> ใส่ตะกร้า
                        </button>
                        <button class="card-btn-buy" onclick="buyNow(${product.id})">
                            ซื้อสินค้า
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Navigation Category Filter
function filterProducts(category) {
    currentFilter = category;
    const navLinks = document.querySelectorAll('.nav-link');
    const categoryBtns = document.querySelectorAll('.category-btn');

    navLinks.forEach(link => link.classList.remove('active'));
    categoryBtns.forEach(btn => btn.classList.remove('active'));

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

    applyFilters();
}

// Add To Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = cart.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        const cartProduct = Object.assign({ quantity: 1, unit: 'กก.' }, product);
        cart.push(cartProduct);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    alert(product.name + ' ถูกเพิ่มลงตะกร้าแล้ว');
}

// Buy Now (Immediate checkout/redirect to cart)
function buyNow(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = cart.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        const cartProduct = Object.assign({ quantity: 1, unit: 'กก.' }, product);
        cart.push(cartProduct);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'cart.html';
}

// Update Cart Badge
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const qty = cart.reduce((s, item) => s + (item.quantity || 1), 0);
    badge.textContent = qty;
}

// Show Product Detail Modal
function showDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('detailModal');
    const detailContent = document.getElementById('detailContent');
    if (!modal || !detailContent) return;

    const days = product.bestBeforeDays || (product.id % 3 + 1); 
    const distance = product.distance || ((product.id * 373) % 9900 + 100);
    const type = product.type || (product.id % 2 === 0 ? 'swap' : 'sell');

    detailContent.innerHTML = `
        <div class="detail-container" style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            <img src="${product.image}" alt="${product.name}" style="width:100%; max-width:250px; border-radius:10px; object-fit: cover; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
            <h2 style="color: #8C401A; margin: 0;">${product.name}</h2>
            <p style="color: #666; margin: 0;">${product.description}</p>
            <div style="font-size: 0.95rem; font-weight: bold; color: var(--primary);">
                รูปแบบ: ${type === 'swap' ? 'แลกเปลี่ยน / ฟรี' : 'ขาย (Direct Sale)'}
            </div>
            <div style="font-size: 0.9rem; color: #555;">
                <i class="fa-solid fa-location-dot"></i> ห่างออกไป ${(distance / 1000).toFixed(1)} กม.
            </div>
            <div style="font-size: 1.2rem; font-weight: bold; color: var(--dark);">
                ${product.price} บาท / กก. (คลังเหลือ ${product.stock} กก.)
            </div>
            <div style="display: flex; gap: 10px; width: 100%; margin-top: 1rem;">
                <button class="card-btn-cart" onclick="addToCart(${product.id}); closeModal();" style="flex: 1; padding: 10px;">
                    เพิ่มลงตะกร้า
                </button>
                <button class="card-btn-buy" onclick="buyNow(${product.id})" style="flex: 1; padding: 10px;">
                    ซื้อทันที
                </button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('detailModal');
    if (modal) modal.style.display = 'none';
}

// Update Navigation Menu for Logged In User
function updateNavMenu() {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return;
    try {
        const user = JSON.parse(userJson);
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) return;

        // Find the login button
        const loginBtn = Array.from(headerActions.querySelectorAll('a')).find(a => a.getAttribute('href') === 'login.html');
        if (loginBtn && user && user.name) {
            loginBtn.outerHTML = `
                <div class="user-menu" style="display: flex; align-items: center; gap: 0.8rem; background: #f0fdf4; padding: 0.3rem 0.8rem; border-radius: 20px; border: 1px solid #bbf7d0;">
                    <span style="font-size: 0.9rem; font-weight: 600; color: #166534;"><i class="fas fa-user"></i> ${user.name}</span>
                    <button onclick="logoutUser()" class="btn" style="padding: 0.2rem 0.5rem; font-size: 0.8rem; background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; border-radius: 12px; cursor: pointer; transition: all 0.2s;">ออกจากระบบ</button>
                </div>
            `;
        }
    } catch (e) {
        console.error(e);
    }
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.reload();
}

// List Harvest Modal Trigger
document.addEventListener('DOMContentLoaded', () => {
    const fabAddItem = document.getElementById('fab-add-item');
    const btnAddHarvest = document.getElementById('btn-add-harvest');
    const addItemModal = document.getElementById('add-item-modal');

    function openAddListingModal() {
        if (addItemModal) {
            addItemModal.classList.remove('hidden');
        } else {
            alert('โชว์หน้าต่าง List Your Garden Harvest!');
        }
    }

    if (fabAddItem) fabAddItem.addEventListener('click', openAddListingModal);
    if (btnAddHarvest) btnAddHarvest.addEventListener('click', openAddListingModal);
});

// Run init when DOM is ready
window.addEventListener('DOMContentLoaded', init);