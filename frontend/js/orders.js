const ordersDiv = document.getElementById('orders');
const token = localStorage.getItem('token');

function getDummyOrders() {
    return JSON.parse(localStorage.getItem('dummyOrders') || '[]');
}

function saveDummyOrders(orders) {
    localStorage.setItem('dummyOrders', JSON.stringify(orders));
}

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
                const hydratedOrders = await Promise.all(dbOrders.map(async (o) => {
                    const detailsResponse = await fetch(`http://localhost:3000/orders/${o.order_id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    let detailedItems = [];
                    if (detailsResponse.ok) {
                        const details = await detailsResponse.json();
                        detailedItems = (details.items || []).map(item => ({
                            name: item.name,
                            image_url: item.image_url,
                            quantity: Number(item.quantity),
                            price: Number(item.unit_price ?? item.price),
                            subtotal: Number(item.subtotal)
                        }));
                    }

                    const orderItems = detailedItems.length > 0
                        ? detailedItems
                        : (o.items || []).map(item => ({
                            ...item,
                            quantity: Number(item.quantity),
                            price: Number(item.price),
                            subtotal: Number(item.subtotal)
                        }));

                    return {
                        source: 'db',
                        order_id: o.order_id,
                        total_amount: o.total_amount,
                        status: o.status || 'delivered',
                        date: o.order_date || new Date().toISOString(),
                        items: orderItems
                    };
                }));

                allOrders = hydratedOrders;
            }
        } catch (err) {
            console.error('Failed fetching DB orders', err);
        }
    }

    // 2. Fetch Dummy Orders
    const dummyOrders = getDummyOrders().map(o => ({
        source: 'dummy',
        ...o,
        status: o.status || 'processing'
    }));
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
                    ${(o.items.length ? o.items : [{ name: 'Unknown item', quantity: 1, price: 0 }]).map(item => `
                        <tr>
                            <td>
                                <strong>${item.name}</strong>
                            </td>
                            <td style="text-align: center;">${Number(item.quantity)}</td>
                            <td style="text-align: right;">₹${Number(item.price).toLocaleString('en-IN')}</td>
                            <td style="text-align: right;">₹${(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="order-body" style="border-top: 1px dashed var(--border-color); padding-top: 16px; margin-top: 8px;">
                <div class="order-summary-text">
                    ${o.items.length} item(s) • Paid via Online/COD
                </div>
                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: flex-end;">
                    ${canCancelOrder(o.status) ? `
                        <button type="button" class="order-cancel-btn" data-order-id="${o.order_id}" data-order-source="${o.source}">
                            <i class="fa-solid fa-xmark"></i> Cancel
                        </button>
                    ` : ''}
                    <div class="order-total-amount">
                        ₹${Number(o.total_amount).toLocaleString('en-IN')}
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.order-cancel-btn').forEach(button => {
        button.addEventListener('click', () => cancelOrder(button.dataset.orderId, button.dataset.orderSource));
    });
}

function getStatusClass(status) {
    const s = status.toLowerCase();
    if (s.includes('cancel')) return 'status-cancelled';
    if (s.includes('deliver') || s.includes('complete')) return 'status-delivered';
    if (s.includes('process') || s.includes('pending')) return 'status-processing';
    if (s.includes('ship')) return 'status-shipped';
    return 'status-processing';
}

function canCancelOrder(status) {
    return !String(status).toLowerCase().includes('cancel');
}

async function cancelOrder(orderId, source) {
    const confirmed = window.confirm(`Cancel order #${orderId}?`);
    if (!confirmed) return;

    if (source === 'dummy') {
        const dummyOrders = getDummyOrders();
        const updatedOrders = dummyOrders.map(order => (
            String(order.order_id) === String(orderId)
                ? { ...order, status: 'cancelled' }
                : order
        ));
        saveDummyOrders(updatedOrders);
        loadOrders();
        return;
    }

    if (!token) {
        alert('Please log in again to cancel this order.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/orders/${orderId}/cancel`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Failed to cancel order.');
            return;
        }

        loadOrders();
    } catch (error) {
        console.error('Failed to cancel order', error);
        alert('Failed to cancel order.');
    }
}

loadOrders();