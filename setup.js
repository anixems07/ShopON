import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setup() {
  console.log('🚀 Starting one-click setup...');

  try {
    // 1. Install backend dependencies
    console.log('\n📦 Installing backend dependencies...');
    execSync('npm install', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });

    // 2. Load .env from backend
    const envPath = path.join(__dirname, 'backend', '.env');
    if (!fs.existsSync(envPath)) {
      console.error('❌ backend/.env file not found. Please create it first.');
      process.exit(1);
    }
    
    dotenv.config({ path: envPath });

    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
    };

    // 3. Connect to MySQL (without DB first to create it)
    console.log('\n🗄️ Connecting to MySQL...');
    const connection = await mysql.createConnection(dbConfig);

    // 4. Create Database
    const dbName = process.env.DB_NAME || 'ecommerce';
    console.log(`\n💎 Creating database: ${dbName}...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName};`);
    await connection.query(`USE ${dbName};`);

    // 5. Run Schema
    console.log('\n📜 Loading schema...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
    // Split by semicolon but handle triggers/procedures if any (though mysql2 can take multiple statements if enabled)
    // For simplicity, we'll enable multipleStatements
    await connection.end();
    
    const connectionWithMulti = await mysql.createConnection({
      ...dbConfig,
      database: dbName,
      multipleStatements: true
    });

    await connectionWithMulti.query(schemaSql);
    console.log('✅ Schema loaded successfully.');

    // 6. Run Sample Data
    console.log('\n📊 Loading sample data...');
    const sampleDataSql = fs.readFileSync(path.join(__dirname, 'database', 'sample_data.sql'), 'utf8');
    await connectionWithMulti.query(sampleDataSql);
    console.log('✅ Sample data loaded successfully.');

    await connectionWithMulti.end();

    console.log('\n✨ Setup complete!');
    console.log('-----------------------------------');
    console.log('You can now start the server with:');
    console.log('cd backend && npm start');
    console.log('-----------------------------------');

  } catch (error) {
    console.error('\n❌ Setup failed:');
    console.error(error.message);
    process.exit(1);
  }
}

setup();
