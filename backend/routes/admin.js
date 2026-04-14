import express from 'express';
const router = express.Router();

export default (db, authenticateToken) => {

  router.use(authenticateToken);

  // GET /admin/top-products — fetch top selling products from view
  router.get('/top-products', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT * FROM Top_Products LIMIT 10');
      res.json(rows);
    } catch (error) {
      console.error('DB error in GET /admin/top-products:', error.message);
      res.status(500).json({ error: 'Failed to fetch top products.' });
    }
  });

  // GET /admin/stats — summary stats for admin dashboard
  router.get('/stats', async (req, res) => {
    try {
      const [[userCount]] = await db.execute('SELECT COUNT(*) AS total_users FROM Users');
      const [[orderCount]] = await db.execute('SELECT COUNT(*) AS total_orders FROM Orders');
      const [[revenue]] = await db.execute(
        "SELECT IFNULL(SUM(total_amount), 0) AS total_revenue FROM Orders WHERE status != 'cancelled'"
      );

      res.json({
        total_users: userCount.total_users,
        total_orders: orderCount.total_orders,
        total_revenue: revenue.total_revenue
      });
    } catch (error) {
      console.error('DB error in GET /admin/stats:', error.message);
      res.status(500).json({ error: 'Failed to fetch admin stats.' });
    }
  });

  return router;
};