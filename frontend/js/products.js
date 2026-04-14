const productsDiv = document.getElementById('products');
const token = localStorage.getItem('token');
let allProducts = [];
let filteredProducts = [];

// Rich Dummy Products to make the store look "Filled and Full"
const dummyProducts = [
    { product_id: 'd1', name: 'Premium Wireless Headphones', description: 'Noise-canceling over-ear headphones with 40h battery life.', price: 12500, category: 'Electronics', rating: 4.8, reviews: 342, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' },
    { product_id: 'd2', name: 'MacBook Pro 16"', description: 'M2 Max Chip, 32GB RAM, 1TB SSD for ultimate performance.', price: 235000, category: 'Electronics', rating: 4.9, reviews: 1024, image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80' },
    { product_id: 'd3', name: 'Sony PlayStation 5', description: 'Next-gen gaming console with ultra-high speed SSD.', price: 49990, category: 'Electronics', rating: 4.9, reviews: 2011, image_url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&q=80' },
    { product_id: 'd4', name: 'Cotton Summer T-Shirt', description: 'Breathable, 100% organic cotton classic fit t-shirt.', price: 999, category: 'Clothing', rating: 4.2, reviews: 85, image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80' },
    { product_id: 'd5', name: 'Denim Jacket Classic', description: 'Vintage style rugged denim jacket for everyday wear.', price: 3450, category: 'Clothing', rating: 4.6, reviews: 112, image_url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500&q=80' },
    { product_id: 'd6', name: 'Men\'s Running Sneakers', description: 'Lightweight and durable athletic shoes for marathon runners.', price: 4200, category: 'Clothing', rating: 4.4, reviews: 540, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80' },
    { product_id: 'd7', name: 'Leather Crossbody Bag', description: 'Handcrafted genuine leather bag with adjustable strap.', price: 5600, category: 'Accessories', rating: 4.7, reviews: 67, image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80' },
    { product_id: 'd8', name: 'Minimalist Wristwatch', description: 'Sleek stainless steel quartz watch with a black dial.', price: 2150, category: 'Accessories', rating: 4.5, reviews: 890, image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80' },
    { product_id: 'd9', name: 'Ray-Ban Aviator Sunglasses', description: 'Iconic polarized sunglasses with gold frames.', price: 8500, category: 'Accessories', rating: 4.8, reviews: 120, image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80' },
    { product_id: 'd10', name: 'Smart Fitness Tracker', description: 'Track your heart rate, sleep, and daily activities.', price: 3200, category: 'Electronics', rating: 4.1, reviews: 450, image_url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80' },
    { product_id: 'd11', name: 'Winter Knitted Beanie', description: 'Warm and cozy wool beanie for cold weather.', price: 550, category: 'Clothing', rating: 4.0, reviews: 34, image_url: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=500&q=80' },
    { product_id: 'd12', name: 'Gold Pendant Necklace', description: '18K gold-plated delicate pendant necklace.', price: 1800, category: 'Accessories', rating: 4.3, reviews: 55, image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80' }
];

// Global Image Mapping for consistency across all pages
const productImages = {
    'Laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    'T-Shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    'Novel Book': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
    'Smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    'Jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
    'Premium Wireless Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'MacBook Pro 16"': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    'Sony PlayStation 5': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80',
    'Cotton Summer T-Shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    'Denim Jacket Classic': 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80',
    'Men\'s Running Sneakers': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'Leather Crossbody Bag': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    'Minimalist Wristwatch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    'Ray-Ban Aviator Sunglasses': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
    'Smart Fitness Tracker': 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80',
    'Winter Knitted Beanie': 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&q=80',
    'Gold Pendant Necklace': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'
};

async function loadProducts() {
    try {
        const response = await fetch('http://localhost:3000/products');
        let dbProducts = [];
        if (response.ok) {
            dbProducts = await response.json();
            // Enrich missing properties on DB products to make them look premium
            dbProducts = dbProducts.map(p => ({
                ...p,
                category: p.category || 'Electronics',
                rating: 4.0 + Math.random(),
                reviews: Math.floor(Math.random() * 200) + 10,
                // Use global mapping for all products
                image_url: productImages[p.name] || 
                          ((p.image_url && p.image_url.startsWith('http')) 
                            ? p.image_url 
                            : `https://picsum.photos/seed/${p.product_id}/500`)
            }));
        }

        // Logged-in users should add only real DB products so cart persists in MySQL.
        if (token) {
            allProducts = [...dbProducts].filter(p => p.name !== 'Garden Hose');
        } else {
            // Guests can still browse a richer mixed catalog.
            allProducts = [...dbProducts, ...dummyProducts].filter(p => p.name !== 'Garden Hose');
        }
        
        applyFilters(); 
    } catch(err) {
        console.error('Failed to load DB products. Showing dummies.', err);
        allProducts = [...dummyProducts].filter(p => p.name !== 'Garden Hose');
        applyFilters();
    }
}

function renderProducts(productsToRender) {
    if(productsToRender.length === 0) {
        productsDiv.innerHTML = '<p style="text-align:center;width:100%;color:var(--text-muted);padding:40px;">No products match your filters.</p>';
        return;
    }

    productsDiv.innerHTML = productsToRender.map(p => `
        <div class="product-card">
            <div class="product-img-wrap">
                ${p.rating >= 4.5 ? '<span class="product-badge">⭐ Top Rated</span>' : ''}
                <img 
                    src="${p.image_url}" 
                    alt="${p.name}" 
                    class="product-img" 
                    loading="lazy"
                    onerror="this.src='https://picsum.photos/seed/${p.product_id}/500/300'"
                >
            </div>
            <div class="product-info">
                <span class="product-category-text">${p.category}</span>
                <h3 class="product-name">${p.name}</h3>

                <div class="product-rating">
                    <span class="stars">${getStarHTML(p.rating)}</span>
                    <span class="count">(${p.reviews})</span>
                </div>

                <p class="product-desc">${p.description}</p>

                <div class="product-bottom">
                    <div class="product-price">₹${p.price.toLocaleString('en-IN')}</div>
                    <button class="add-to-cart-btn" onclick="addToCart('${p.product_id}')">
                        <i class="fa-solid fa-cart-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function getStarHTML(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    for(let i=0; i<5; i++) {
        if (i < fullStars) {
            stars += '<i class="fa-solid fa-star"></i>';
        } else if (i === fullStars && halfStar) {
            stars += '<i class="fa-solid fa-star-half-stroke"></i>';
        } else {
            stars += '<i class="fa-regular fa-star"></i>';
        }
    }
    return stars;
}

// Filtering Logic
const filterRadios = document.querySelectorAll('.sidebar input[type="radio"]');
filterRadios.forEach(radio => {
    radio.addEventListener('change', applyFilters);
});

function applyFilters() {
    const categoryFilter = document.querySelector('input[name="category"]:checked').value;
    const priceFilter = document.querySelector('input[name="price"]:checked').value;
    const ratingFilter = document.querySelector('input[name="rating"]:checked').value;

    filteredProducts = allProducts.filter(p => {
        // Category Match
        if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;

        // Price Match
        if (priceFilter !== 'all') {
            if (priceFilter === '0-1000' && p.price > 1000) return false;
            if (priceFilter === '1000-5000' && (p.price < 1000 || p.price > 5000)) return false;
            if (priceFilter === '5000+' && p.price < 5000) return false;
        }

        // Rating Match
        if (ratingFilter !== 'all' && p.rating < parseFloat(ratingFilter)) return false;

        return true;
    });

    renderProducts(filteredProducts);
}

async function addToCart(product_id) {
    if (!token) {
        alert("Please login first!");
        window.location.href = 'login.html';
        return;
    }
    
    // For dummy products without real backend IDs, keep them as guest-only demo items.
    if (typeof product_id === 'string' && product_id.startsWith('d')) {
        alert('This is a demo-only item. Please add real catalog products to save into your database cart.');
        let dummyCart = JSON.parse(localStorage.getItem('dummyCart') || '[]');
        const product = dummyProducts.find(p => p.product_id === product_id);
        if (product) {
            const existing = dummyCart.find(item => item.product_id === product_id);
            if (existing) {
                existing.quantity += 1;
            } else {
                dummyCart.push({ ...product, quantity: 1 });
            }
            localStorage.setItem('dummyCart', JSON.stringify(dummyCart));
        }
        updateCartBadge();
        showFlyoutNotification('Added to Cart Successfully!');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ product_id, quantity: 1 })
        });
        const data = await response.json();
        
        if(response.ok) {
            updateCartBadge();
            showFlyoutNotification('Added to Cart Successfully!');
        } else {
            alert(data.message || data.error);
        }
    } catch(err) {
        console.error(err);
    }
}

// Cart UI updates (mock for demo feeling)
let cartCount = 0;
function updateCartBadge() {
    cartCount++;
    const badge = document.getElementById('cartBadge');
    if(badge) {
        badge.innerText = cartCount;
        badge.style.display = 'inline-block';
        badge.style.transform = 'scale(1.2)';
        setTimeout(() => badge.style.transform = 'scale(1)', 200);
    }
}

function showFlyoutNotification(msg) {
    const flyout = document.createElement('div');
    flyout.textContent = msg;
    Object.assign(flyout.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        background: 'var(--success-green)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-md)',
        zIndex: 9999,
        fontWeight: '600',
        animation: 'fadeIn 0.3s ease-out'
    });
    document.body.appendChild(flyout);
    setTimeout(() => {
        flyout.style.opacity = '0';
        flyout.style.transition = 'opacity 0.3s';
        setTimeout(() => flyout.remove(), 300);
    }, 2500);
}

// Initialize
loadProducts();