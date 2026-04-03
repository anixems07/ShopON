import express from 'express';
const router = express.Router();

export default (db, bcrypt, jwt, JWT_SECRET) => {

  // POST /auth/register — insert new user
  router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, and password are required.' });
    }

    try {
      // Hash password before storing
      const password_hash = await bcrypt.hash(password, 10);

      await db.execute(
        'INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, password_hash]
      );

      res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
      console.error('DB error in POST /auth/register:', error.message);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Email already in use.' });
      }
      res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  });

  // POST /auth/login — validate credentials and return JWT
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    try {
      const [rows] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const user = rows[0];
      const isValid = await bcrypt.compare(password, user.password_hash);

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = jwt.sign(
        { user_id: user.user_id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token, user: { user_id: user.user_id, username: user.username, email: user.email } });
    } catch (error) {
      console.error('DB error in POST /auth/login:', error.message);
      res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  });

  // POST /auth/logout — clear session (client-side token removal)
  router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully.' });
  });

  return router;
};