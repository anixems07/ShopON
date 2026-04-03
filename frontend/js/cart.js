const cartDiv = document.getElementById('cart');
const checkoutBtn = document.getElementById('checkoutBtn');
const cartSubtotalEl = document.getElementById('cartSubtotal');
const cartTaxEl = document.getElementById('cartTax');
const cartTotalEl = document.getElementById('cartTotal');
const token = localStorage.getItem('token');

// We mix dummyCart from local storage with real DB cart
async function loadCart() {
    let allCartItems = [];
    
    // 1. Get real DB cart items
    if (token) {
        try {
            const response = await fetch('http://localhost:3000/cart', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const dbCart = await response.json();
                allCartItems = dbCart.map(c => ({
                    ...c,
                    type: 'real',
                    // Only use image_url if it's a real HTTP URL; otherwise use picsum fallback
                    image_url: (c.image_url && c.image_url.startsWith('http'))
                                ? c.image_url
                                : `https://picsum.photos/seed/${c.product_id}/500`
                }));
            }
        } catch (err) {
            console.error('Failed to load DB cart', err);
        }
    }

    // 2. Add Dummy Cart items from localStorage
    const dummyCart = JSON.parse(localStorage.getItem('dummyCart') || '[]');
    dummyCart.forEach(item => {
        allCartItems.push({ ...item, type: 'dummy' });
    });

    renderCart(allCartItems);
}

function renderCart(cartItems) {
    if (cartItems.length === 0) {
        cartDiv.innerHTML = `
            <div style="text-align:center; padding: 40px;">
                <i class="fa-solid fa-cart-shopping" style="font-size: 3em; color: var(--border-color); margin-bottom: 20px;"></i>
                <h3 style="color: var(--text-main);">Your cart is empty</h3>
                <p style="color: var(--text-muted); margin-top: 10px;">Looks like you haven't added anything yet.</p>
                <a href="index.html" class="checkout-btn" style="display: inline-flex; width: auto; font-size: 1em; margin-top: 20px;">
                    Start Shopping
                </a>
            </div>`;
        updateTotals(0);
        checkoutBtn.style.display = 'none';
        return;
    }

    checkoutBtn.style.display = 'flex';

    cartDiv.innerHTML = cartItems.map((c, index) => `
        <div class="cart-item-row">
            <img src="${c.image_url}" alt="${c.name}" class="cart-item-img" onerror="this.onerror=null;this.src='https://picsum.photos/seed/${c.product_id}/500'">
            <div class="cart-item-details">
                <div class="cart-item-name">${c.name}</div>
                <div style="color: var(--text-muted); font-size: 0.9em; margin-bottom: 12px;">Category: ${c.category || 'N/A'}</div>
                <div class="cart-item-price-main">₹${c.price.toLocaleString('en-IN')}</div>
            </div>
            <div class="cart-qty-controls">
                <button class="qty-btn" onclick="updateQuantity('${c.product_id}', '${c.type}', -1)">
                    <i class="fa-solid fa-minus" style="font-size: 0.75em;"></i>
                </button>
                <span style="font-weight: 600; width: 24px; text-align: center;">${c.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity('${c.product_id}', '${c.type}', 1)">
                    <i class="fa-solid fa-plus" style="font-size: 0.75em;"></i>
                </button>
            </div>
            <button onclick="removeFromCart('${c.product_id}', '${c.type}')" class="remove-btn" title="Remove Item">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    `).join('');

    const subtotal = cartItems.reduce((sum, c) => sum + (c.price * c.quantity), 0);
    updateTotals(subtotal);
}

function updateTotals(subtotal) {
    const tax = Math.round(subtotal * 0.05); // Simulated 5% Tax
    const total = subtotal + tax;
    
    cartSubtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    cartTaxEl.textContent = `₹${tax.toLocaleString('en-IN')}`;
    cartTotalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
}

async function updateQuantity(product_id, type, change) {
    if (type === 'dummy') {
        let dummyCart = JSON.parse(localStorage.getItem('dummyCart') || '[]');
        const item = dummyCart.find(i => i.product_id === product_id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                dummyCart = dummyCart.filter(i => i.product_id !== product_id);
            }
            localStorage.setItem('dummyCart', JSON.stringify(dummyCart));
        }
        loadCart();
        return;
    }

    // Real DB update (assuming backend cart/update exists, if not, we fallback to simple render)
    // The previous implementation didn't have a quantity update API, only add/remove. 
    // We will simulate it visually via reloading and alert for DB products since we can't easily +/- them.
    alert('Quantity update for backend products is mocked for now.');
}

async function removeFromCart(product_id, type) {
    if (type === 'dummy') {
        let dummyCart = JSON.parse(localStorage.getItem('dummyCart') || '[]');
        dummyCart = dummyCart.filter(item => item.product_id !== product_id);
        localStorage.setItem('dummyCart', JSON.stringify(dummyCart));
        loadCart();
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/cart/remove', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ product_id })
        });
        if(response.ok) {
            loadCart();
        } else {
            const data = await response.json();
            alert(data.message || data.error);
        }
    } catch(err) {
        console.error(err);
    }
}

checkoutBtn.addEventListener('click', () => {
    // Save totals for checkout page
    localStorage.setItem('checkoutTotal', cartTotalEl.textContent);
    window.location.href = 'checkout.html';
});

// Initialize
loadCart();