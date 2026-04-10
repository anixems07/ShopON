import express from 'express';
const router = express.Router();

export default (db, authenticateToken) => {

  router.use(authenticateToken);

  // POST /orders/place — call stored procedure to place order & process payment
  router.post('/place', async (req, res) => {
    const { address_id, payment_method, payment_provider, card_details } = req.body;
    const user_id = req.user.user_id;

    if (!address_id || !payment_method) {
      return res.status(400).json({ error: 'address_id and payment_method are required.' });
    }

    // Basic Validation for CARD payment
    if (payment_method === 'CARD') {
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
      const [orderResult] = await db.execute('CALL PlaceOrder(?, ?)', [user_id, address_id]);
      const order_id = orderResult[0][0].order_id;

      // Fetch total amount from the created order
      const [orderRows] = await db.execute(
        'SELECT total_amount FROM Orders WHERE order_id = ?',
        [order_id]
      );

      if (orderRows.length === 0) {
        return res.status(500).json({ error: 'Order was created but could not be retrieved.' });
      }

      const total_amount = orderRows[0].total_amount;

      // Handle payment provider for CARD (mask card number)
      let finalPaymentProvider = payment_provider || null;
      if (payment_method === 'CARD' && card_details) {
        finalPaymentProvider = `Card ending in ${card_details.cardNumber.slice(-4)}`;
      }

      // Call ProcessPayment stored procedure
      await db.execute(
        'CALL ProcessPayment(?, ?, ?, ?)',
        [order_id, payment_method, finalPaymentProvider, total_amount]
      );

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
        `SELECT o.order_id, o.order_date, o.status, o.total_amount,
                a.street, a.city, a.state, a.zip
         FROM Orders o
         LEFT JOIN Addresses a ON o.address_id = a.address_id
         WHERE o.user_id = ?
         ORDER BY o.order_date DESC`,
        [user_id]
      );
      res.json(rows);
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

  return router;
};