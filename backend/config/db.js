import 'dotenv/config';
import mysql from 'mysql2/promise';

const dbPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to test the connection explicitly
export const testConnection = async () => {
  try {
    const connection = await dbPool.getConnection();
    console.log('Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('Failed to connect to the database:');
    console.error(error.message);
    throw error;
  }
};

export default dbPool;
