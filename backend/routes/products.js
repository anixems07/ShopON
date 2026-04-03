import express from 'express';
const router = express.Router();

export default (db) => {

  // GET /products — fetch all products with category name
  router.get('/', async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT p.*, c.name AS category 
        FROM Products p 
        LEFT JOIN Categories c ON p.category_id = c.category_id
      `);
      res.json(rows);
    } catch (error) {
      console.error('DB error in GET /products:', error.message);
      res.status(500).json({ error: 'Failed to fetch products.' });
    }
  });

  // GET /products/:id — fetch single product with category name
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await db.execute(`
        SELECT p.*, c.name AS category 
        FROM Products p 
        LEFT JOIN Categories c ON p.category_id = c.category_id 
        WHERE p.product_id = ?
      `, [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Product not found.' });
      }
      res.json(rows[0]);
    } catch (error) {
      console.error(`DB error in GET /products/${id}:`, error.message);
      res.status(500).json({ error: 'Failed to fetch product.' });
    }
  });

  return router;
};