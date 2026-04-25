import express from 'express';
const router = express.Router();

export default (db, authenticateToken) => {

  router.use(authenticateToken);

  // POST /orders/place — place an order using the cart contents
  router.post('/place', async (req, res) => {
    const { address_id, payment_method, card_details } = req.body;
    const user_id = req.user.user_id;
    const paymentMethodMap = {
      cash_on_delivery: 'COD',
      CARD: 'CARD',
      online_upi: 'UPI'
    };
    const normalizedPaymentMethod = paymentMethodMap[payment_method] || payment_method;

    if (!address_id || !payment_method) {
      return res.status(400).json({ error: 'address_id and payment_method are required.' });
    }

    if (!['COD', 'CARD', 'UPI'].includes(normalizedPaymentMethod)) {
      return res.status(400).json({ error: 'payment_method must be one of COD, CARD, or UPI.' });
    }

    // Basic Validation for CARD payment
    if (normalizedPaymentMethod === 'CARD') {
      if (!card_details || !card_details.cardNumber || !card_details.cardHolder || !card_details.expiry || !card_details.cvv) {
        return res.status(400).json({ error: 'All card details are required for CARD payment.' });
      }
      // Simple format check (simulation)
      if (card_details.cardNumber.length < 13 || card_details.cvv.length < 3) {
        return res.status(400).json({ error: 'Invalid card format.' });
      }
    }

    try {
      // Call PlaceOrder stored procedure
      const [orderResult] = await db.execute('CALL PlaceOrder(?, ?, ?)', [user_id, address_id, normalizedPaymentMethod]);
      const order_id = orderResult[0][0].order_id;

      res.status(201).json({ message: 'Order placed successfully.', order_id });
    } catch (error) {
      console.error('DB error in POST /orders/place:', error.message);
      res.status(500).json({ error: 'Failed to place order. Please try again.' });
    }
  });

  // GET /orders — get all orders for the logged-in user
  router.get('/', async (req, res) => {
    const user_id = req.user.user_id;
    try {
      const [rows] = await db.execute(
        `SELECT o.order_id, o.order_date, o.status, o.total_amount, o.payment_method,
                a.street, a.city, a.state, a.zip
         FROM Orders o
         LEFT JOIN Addresses a ON o.address_id = a.address_id
         WHERE o.user_id = ?
         ORDER BY o.order_date DESC`,
        [user_id]
      );
      const ordersWithItems = await Promise.all(rows.map(async (order) => {
        const [itemRows] = await db.execute(
          `SELECT oi.order_item_id, p.name, p.image_url, oi.quantity, oi.price AS price,
                  (oi.quantity * oi.price) AS subtotal
           FROM Order_Items oi
           JOIN Products p ON oi.product_id = p.product_id
           WHERE oi.order_id = ?
           ORDER BY oi.order_item_id ASC`,
          [order.order_id]
        );

        return {
          ...order,
          items: itemRows
        };
      }));

      res.json(ordersWithItems);
    } catch (error) {
      console.error('DB error in GET /orders:', error.message);
      res.status(500).json({ error: 'Failed to fetch orders.' });
    }
  });

  // GET /orders/:id — get details of a specific order
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.user_id;
    try {
      const [orderRows] = await db.execute(
        'SELECT * FROM Orders WHERE order_id = ? AND user_id = ?',
        [id, user_id]
      );
      if (orderRows.length === 0) {
        return res.status(404).json({ error: 'Order not found.' });
      }

      const [itemRows] = await db.execute(
        `SELECT oi.order_item_id, p.name, p.image_url, oi.quantity, oi.price AS unit_price,
                (oi.quantity * oi.price) AS subtotal
         FROM Order_Items oi
         JOIN Products p ON oi.product_id = p.product_id
         WHERE oi.order_id = ?`,
        [id]
      );

      res.json({ order: orderRows[0], items: itemRows });
    } catch (error) {
      console.error(`DB error in GET /orders/${id}:`, error.message);
      res.status(500).json({ error: 'Failed to fetch order details.' });
    }
  });

  // PATCH /orders/:id/cancel — cancel a user-owned order
  router.patch('/:id/cancel', async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.user_id;

    try {
      const [orderRows] = await db.execute(
        'SELECT order_id, status FROM Orders WHERE order_id = ? AND user_id = ?',
        [id, user_id]
      );

      if (orderRows.length === 0) {
        return res.status(404).json({ error: 'Order not found.' });
      }

      if (String(orderRows[0].status).toLowerCase() === 'cancelled') {
        return res.json({ message: 'Order is already cancelled.' });
      }

      await db.execute(
        'UPDATE Orders SET status = ? WHERE order_id = ? AND user_id = ?',
        ['cancelled', id, user_id]
      );

      res.json({ message: 'Order cancelled successfully.' });
    } catch (error) {
      console.error(`DB error in PATCH /orders/${id}/cancel:`, error.message);
      res.status(500).json({ error: 'Failed to cancel order.' });
    }
  });

  return router;
};