import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

import dbPool, { testConnection } from './config/db.js';

import auth from './routes/auth.js';
import products from './routes/products.js';
import cart from './routes/cart.js';
import orders from './routes/orders.js';
import admin from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// Mount routes — pass db pool via dependency injection
app.use('/auth', auth(dbPool, bcrypt, jwt, JWT_SECRET));
app.use('/products', products(dbPool));
app.use('/cart', cart(dbPool, authenticateToken));
app.use('/orders', orders(dbPool, authenticateToken));
app.use('/admin', admin(dbPool, authenticateToken));

// Startup: verify DB connection before accepting requests
try {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error('Server failed to start due to database connection error.');
  process.exit(1);
}