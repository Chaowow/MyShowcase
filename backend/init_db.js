const pool = require('./db');

const createUsersTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                auth0_id TEXT UNIQUE NOT NULL,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ Users table created successfully!');
    } catch (err) {
        console.error('❌ Error creating users table:', err);
    } finally {
        pool.end();
    }
};

createUsersTable();