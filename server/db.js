import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Initialize tables
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        employee_code TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        mobile TEXT NOT NULL,
        designation TEXT NOT NULL,
        email TEXT,
        company TEXT,
        photo_path TEXT,
        qr_token TEXT NOT NULL UNIQUE,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS verification_logs (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
        qr_token TEXT NOT NULL,
        was_valid BOOLEAN NOT NULL,
        ip_address TEXT,
        verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_employees_employee_code ON employees(employee_code);
      CREATE INDEX IF NOT EXISTS idx_employees_qr_token ON employees(qr_token);
      CREATE INDEX IF NOT EXISTS idx_verification_logs_qr_token ON verification_logs(qr_token);
      CREATE INDEX IF NOT EXISTS idx_verification_logs_verified_at ON verification_logs(verified_at DESC);

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // Seed default admin if none exists
    const { rows } = await pool.query('SELECT COUNT(*) AS n FROM users');
    if (parseInt(rows[0].n, 10) === 0) {
      const crypto = await import('node:crypto');
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.scryptSync('admin123', salt, 64).toString('hex');
      await pool.query(
        'INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4)',
        ['admin', `${salt}:${hash}`, 'Administrator', 'admin']
      );
      console.log('Default admin user created (admin / admin123)');
    }
    console.log('PostgreSQL tables initialized');
  } catch (err) {
    console.error('Error initializing PostgreSQL tables:', err);
    throw err;
  }
};

export { pool, initDb };
