import express from 'express';
const router = express.Router();

export default (db, authenticateToken) => {

  router.use(authenticateToken);

  // POST /cart/add — insert or update cart item
  router.post('/add', async (req, res) => {
    const { product_id, quantity } = req.body;
    const user_id = req.user.user_id;

    if (!product_id || !quantity) {
      return res.status(400).json({ error: 'product_id and quantity are required.' });
    }

    try {
      await db.execute(
        'INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
        [user_id, product_id, quantity, quantity]
      );
      res.json({ message: 'Item added to cart successfully.' });
    } catch (error) {
      console.error('DB error in POST /cart/add:', error.message);
      res.status(500).json({ error: 'Failed to add item to cart.' });
    }
  });

  // GET /cart — get all cart items for the logged-in user
  router.get('/', async (req, res) => {
    const user_id = req.user.user_id;
    try {
      const [rows] = await db.execute(
        `SELECT c.cart_id, p.product_id, p.name, p.price, p.image_url, cat.name AS category, c.quantity,
                (p.price * c.quantity) AS subtotal
         FROM Cart c
         JOIN Products p ON c.product_id = p.product_id
         LEFT JOIN Categories cat ON p.category_id = cat.category_id
         WHERE c.user_id = ?`,
        [user_id]
      );
      res.json(rows);
    } catch (error) {
      console.error('DB error in GET /cart:', error.message);
      res.status(500).json({ error: 'Failed to fetch cart items.' });
    }
  });

  // DELETE /cart/remove — remove specific item from cart
  router.delete('/remove', async (req, res) => {
    const { product_id } = req.body;
    const user_id = req.user.user_id;

    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required.' });
    }

    try {
      await db.execute(
        'DELETE FROM Cart WHERE user_id = ? AND product_id = ?',
        [user_id, product_id]
      );
      res.json({ message: 'Item removed from cart.' });
    } catch (error) {
      console.error('DB error in DELETE /cart/remove:', error.message);
      res.status(500).json({ error: 'Failed to remove item from cart.' });
    }
  });

  // DELETE /cart/clear — clear entire cart for the logged-in user
  router.delete('/clear', async (req, res) => {
    const user_id = req.user.user_id;
    try {
      await db.execute('DELETE FROM Cart WHERE user_id = ?', [user_id]);
      res.json({ message: 'Cart cleared.' });
    } catch (error) {
      console.error('DB error in DELETE /cart/clear:', error.message);
      res.status(500).json({ error: 'Failed to clear cart.' });
    }
  });

  return router;
};