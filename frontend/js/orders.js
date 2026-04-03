const ordersDiv = document.getElementById('orders');
const token = localStorage.getItem('token');

async function loadOrders() {
    let allOrders = [];

    // 1. Fetch real DB orders
    if (token) {
        try {
            const response = await fetch('http://localhost:3000/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const dbOrders = await response.json();
                allOrders = dbOrders.map(o => ({
                    order_id: o.order_id,
                    total_amount: o.total_amount,
                    status: o.status || 'Delivered',
                    date: o.order_date || new Date().toISOString(),
                    // DB likely missing item breakdown in current basic API
                    items: o.items || [{ name: 'Assorted DB Products', quantity: 1, price: o.total_amount }]
                }));
            }
        } catch (err) {
            console.error('Failed fetching DB orders', err);
        }
    }

    // 2. Fetch Dummy Orders
    const dummyOrders = JSON.parse(localStorage.getItem('dummyOrders') || '[]');
    allOrders = [...allOrders, ...dummyOrders];

    // 3. Sort by date (newest first)
    allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderOrders(allOrders);
}

function renderOrders(orders) {
    if (orders.length === 0) {
        ordersDiv.innerHTML = `
            <div style="text-align:center; padding: 40px; background: white; border-radius: var(--radius-md);">
                <i class="fa-solid fa-box-open" style="font-size: 3em; color: var(--border-color); margin-bottom: 20px;"></i>
                <h3 style="color: var(--text-main);">No Orders Yet</h3>
                <p style="color: var(--text-muted); margin-top: 10px;">You haven't placed any orders.</p>
                <a href="index.html" class="checkout-btn" style="display: inline-flex; width: auto; font-size: 1em; margin-top: 20px;">
                    Start Shopping
                </a>
            </div>`;
        return;
    }

    ordersDiv.innerHTML = orders.map(o => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-id-date">
                    <div class="order-id">Order #${o.order_id}</div>
                    <div class="order-date">Placed on: ${new Date(o.date).toLocaleDateString()}</div>
                </div>
                <div class="order-status-badge ${getStatusClass(o.status)}">
                    ${o.status}
                </div>
            </div>
            
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th style="width: 50%;">Item</th>
                        <th style="width: 15%; text-align: center;">Qty</th>
                        <th style="width: 15%; text-align: right;">Price</th>
                        <th style="width: 20%; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${o.items.map(item => `
                        <tr>
                            <td>
                                <strong>${item.name}</strong>
                                ${item.category ? `<br><small style="color: var(--text-muted);">${item.category}</small>` : ''}
                            </td>
                            <td style="text-align: center;">${item.quantity}</td>
                            <td style="text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
                            <td style="text-align: right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="order-body" style="border-top: 1px dashed var(--border-color); padding-top: 16px; margin-top: 8px;">
                <div class="order-summary-text">
                    ${o.items.length} item(s) • Paid via Online/COD
                </div>
                <div class="order-total-amount">
                    ₹${Number(o.total_amount).toLocaleString('en-IN')}
                </div>
            </div>
        </div>
    `).join('');
}

function getStatusClass(status) {
    const s = status.toLowerCase();
    if (s.includes('deliver') || s.includes('complete')) return 'status-delivered';
    if (s.includes('process') || s.includes('pending')) return 'status-processing';
    if (s.includes('ship')) return 'status-shipped';
    return 'status-processing';
}

loadOrders();