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

// Add user or retrieve specific user
const upsertUser = async (req, res) => {
    try {
        const { username, email, auth0_id } = req.body;

        if (!auth0_id || !username || !email) {
            return res.status(400).json({ error: 'auth0_id, username and email are required.' });
        }

        const existingUser = await pool.query('SELECT * FROM users WHERE auth0_id = $1', [auth0_id]);

        if (existingUser.rows.length > 0) {
            return res.status(200).json(existingUser.rows[0]);
        }

        const result = await pool.query(
            'INSERT INTO users (auth0_id, username, email) VALUES ($1, $2, $3) RETURNING *',
            [auth0_id, username, email]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const { auth0_id } = req.params;

        const result = await pool.query(
            'SELECT * FROM users WHERE auth0_id = $1',
            [auth0_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        user.created_at = new Date(user.created_at).toLocaleDateString();

        res.json(user);
    } catch (err) {
        console.error('Error fetching user by ID:', err);
        res.status(500).json({ error: 'Server Error:', details: err.message });
    }
};

const incrementProfileViews = async (req, res) => {
    const { auth0_id } = req.params;

    try {
        const result = await pool.query(
            `UPDATE users
             SET views = views + 1
             WHERE auth0_id = $1
             RETURNING views`,
            [auth0_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ views: result.rows[0].views });
    } catch (err) {
        console.error('Error incrementing profile views', err);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

const likeUser = async (req, res) => {
    const { auth0_id } = req.params;

    try {
        const result = await pool.query(
           `UPDATE users
            SET likes = likes + 1
            WHERE auth0_id = $1
            RETURNING *`,
            [auth0_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.'});
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error liking user:', err);
        res.status(500).json({ error: 'Server Error', details: err.message});
    }
};

const updateUsername = async (req, res) => {
    const { auth0_id } = req.params;
    const { username } = req.body;

    try {
        const result = await pool.query(
            'UPDATE users SET username = $1 WHERE auth0_id = $2 RETURNING *',
            [username, auth0_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating username:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

module.exports = { 
    getUsers, 
    upsertUser, 
    getUserById, 
    incrementProfileViews, 
    likeUser, 
    updateUsername
};