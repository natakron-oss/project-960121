
// ฟังก์ชันเปิด/ปิด Dropdown
function toggleDropdown() {
    document.getElementById("category-dropdown").classList.toggle("show");
}

// ปิด Dropdown เมื่อคลิกที่อื่นนอกกรอบ
window.onclick = function(event) {
    // เช็คว่าจุดที่คลิก ไม่ได้อยู่ใน dropdown-container
    if (!event.target.closest('.dropdown-container')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// (แถม) อัปเดตตัวเลขระยะทางแบบ Real-time เมื่อเลื่อน Slider
document.getElementById('distance-slider').addEventListener('input', function() {
    // หาร 1000 เพื่อแปลงเมตรเป็นกิโลเมตร (ตามค่า min/max ที่ตั้งไว้)
    let km = (this.value / 1000).toFixed(1);
    document.getElementById('distance-val').innerText = km;
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

// ตัวอย่างฟังก์ชัน render สินค้า (นำเฉพาะโครงสร้าง HTML ด้านในไปประยุกต์ใช้)
const productsGrid = document.getElementById('productsGrid');

// ลูปข้อมูล products จากไฟล์ products.js ของมิน
productsGrid.innerHTML = products.map(product => {
    
    // จำลองข้อมูลเสริมให้ตรงกับในรูป (เพราะใน products.js ตอนนี้ยังไม่มีข้อมูลเหล่านี้)
    const bestBefore = product.bestBefore || "4 Days";
    const ownerName = product.owner || "Elena S.";
    const distance = product.distance || "500m away";
    
    return `
        <div class="product-card">
            <div class="card-img-container">
                <img src="${product.image}" alt="${product.name}">
                <div class="card-badge-orange">Best Before: ${bestBefore}</div>
            </div>
            
            <div class="card-content">
                
                <div class="card-title-row">
                    <h3>${product.name}</h3>
                </div>
                
                <div class="card-owner-row">
                    <i class="fa-regular fa-user"></i>
                    <span>${ownerName}</span>
                </div>
                <div class="product-stock">📦 เหลือ ${product.stock} กก.</div>
                
                <div class="card-footer-row">
                    <button class="card-btn-cart" onclick="addToCart(${product.id})">
                        <i class="fa-solid fa-shopping-cart"></i> ใส่ตะกร้า
                    </button>
                    <!-- Swap button removed -->
                    <button class="card-btn-buy" onclick="buyNow(${product.id})">
                        ซื้อสินค้า
                    </button>
                </div>
                
            </div>
        </div>
    `;
}).join('');
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

document.addEventListener('DOMContentLoaded', () => {
    // 1. ค้นหาปุ่มทั้ง 2 ตัวจาก HTML
    const fabAddItem = document.getElementById('fab-add-item');
    const btnAddHarvest = document.getElementById('btn-add-harvest');
    
    // สมมติว่าเรามี Modal Container อยู่ใน HTML (id="add-item-modal")
    const addItemModal = document.getElementById('add-item-modal');

    // 2. สร้างฟังก์ชันสำหรับเปิด Modal
    function openAddListingModal() {
        console.log('Opening Add Item Modal...');
        // ลบคลาส hidden เพื่อแสดง Modal
        if (addItemModal) {
            addItemModal.classList.remove('hidden');
            // ทำงานอื่นๆ เช่น reset ค่าในฟอร์ม
        } else {
            // ถ้ายังไม่ได้สร้าง Modal UI ใน HTML จะเด้ง Alert แทนก่อน
            alert('โชว์หน้าต่าง List Your Garden Harvest!');
        }
    }

    // 3. ผูก Event Click ให้กับปุ่ม ถ้าปุ่มนั้นมีอยู่บนหน้าจอ
    if (fabAddItem) {
        fabAddItem.addEventListener('click', openAddListingModal);
    }

    if (btnAddHarvest) {
        btnAddHarvest.addEventListener('click', openAddListingModal);
    }
});

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