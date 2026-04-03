const checkoutForm = document.getElementById('checkoutForm');
const displayTotal = document.getElementById('displayTotal');
const paymentRadios = document.getElementsByName('paymentMethod');
const upiInputSection = document.getElementById('upiInputSection');
const upiIdInput = document.getElementById('upiId');
const token = localStorage.getItem('token');

// Load total from cart
const savedTotal = localStorage.getItem('checkoutTotal') || '₹0';
displayTotal.textContent = savedTotal;

// Toggle Payment Fields
paymentRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.value === 'online_upi') {
            upiInputSection.style.display = 'block';
            upiIdInput.setAttribute('required', 'true');
        } else {
            upiInputSection.style.display = 'none';
            upiIdInput.removeAttribute('required');
        }
    });
});

checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // We get values primarily for visual fullness or future API extensions
    const street = document.getElementById('street').value;
    const city = document.getElementById('city').value;
    const paymentMethodValue = document.querySelector('input[name="paymentMethod"]:checked').value;
    const paymentProviderInfo = paymentMethodValue === 'online_upi' ? upiIdInput.value : 'COD';

    let successMessage = "Order placed successfully!";

    try {
        // 1. Save dummy order to local storage (for the rich dummy data UI)
        const dummyCart = JSON.parse(localStorage.getItem('dummyCart') || '[]');
        if (dummyCart.length > 0) {
            const dummyOrders = JSON.parse(localStorage.getItem('dummyOrders') || '[]');
            const dummyTotalRaw = dummyCart.reduce((sum, c) => sum + (c.price * c.quantity), 0);
            const dummyTotalStr = String(dummyTotalRaw + Math.round(dummyTotalRaw * 0.05)); // Subtotal + Tax
            
            dummyOrders.push({
                order_id: 'DB' + Math.floor(Math.random() * 100000), // Fake ID
                total_amount: dummyTotalStr,
                status: 'Processing',
                date: new Date().toISOString(),
                items: dummyCart
            });
            localStorage.setItem('dummyOrders', JSON.stringify(dummyOrders));
            localStorage.removeItem('dummyCart'); // Clear fake cart
        }

        // 2. Hit actual DB if there are items there (the backend order script requires token)
        if (token) {
            // Check if actual DB cart has items (simplification: we just FIRE the place request)
            const response = await fetch('http://localhost:3000/orders/place', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    address_id: 1, // hardcoded per previous simple implementation
                    payment_method: paymentMethodValue, 
                    payment_provider: paymentProviderInfo 
                })
            });
            
            const data = await response.json();
            if (!response.ok && data.error !== 'Cart is empty') { 
                // Don't alert error if it's just 'Cart is empty' (meaning they only bought dummy items)
                successMessage = "Dummy items processed, but DB failed: " + (data.error || 'Unknown Error');
            }
        } else if (dummyCart.length === 0) {
            alert('Your cart is completely empty.');
            return;
        }

        // Redirect to Orders Page showing success 
        localStorage.removeItem('checkoutTotal');
        showCheckoutSuccessOverlay();
        
    } catch (err) {
        console.error(err);
        alert('An unexpected error occurred during checkout.');
    }
});

function showCheckoutSuccessOverlay() {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0', left: '0', right: '0', bottom: '0',
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: '10000',
        animation: 'fadeIn 0.3s ease'
    });
    
    overlay.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: var(--radius-lg); text-align: center; max-width: 400px;">
            <i class="fa-solid fa-circle-check" style="font-size: 4em; color: var(--success-green); margin-bottom: 20px;"></i>
            <h2 style="margin-bottom: 12px; font-weight: 800;">Payment Successful</h2>
            <p style="color: var(--text-muted); margin-bottom: 24px;">Your order has been placed and is now processing.</p>
            <button onclick="window.location.href='orders.html'" class="place-order-btn" style="width: auto; padding: 12px 30px; font-size: 1em;">
                View Order History
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
}