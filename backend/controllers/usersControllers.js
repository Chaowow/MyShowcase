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
        const { username, email } = req.body;
        const result = await pool.query(
            'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *',
            [username, email]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { getUsers, addUser };