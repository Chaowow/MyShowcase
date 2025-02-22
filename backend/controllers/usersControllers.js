const pool = require('../db');

// Get all users
const getUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

// Add a new user 
const addUser = async (req, res) => {
    try {
        const { username, email, auth0_id } = req.body;

        if (!username || !email) {
            return res.status(400).json({ error: 'Username and email are required.' });
        }

        const existingUser = await pool.query('SELECT * FROM users WHERE auth0_id = $1', [auth0_id]);

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ 
                error: 'User already exists.',
                details: `A user with auth0_id: ${auth0_id} is already registered.`
             });
        }

        const result = await pool.query(
            'INSERT INTO users (username, email, auth0_id) VALUES ($1, $2, $3) RETURNING *',
            [username, email, auth0_id]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

module.exports = { getUsers, addUser };