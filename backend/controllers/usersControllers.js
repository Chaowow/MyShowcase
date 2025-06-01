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


const toggleLikeUser = async (req, res) => {
    const { liker_auth0_id } = req.body;
    const { liked_auth0_id } = req.params;

    try {
        const existing = await pool.query(
            'SELECT * FROM likes WHERE liker_auth0_id = $1 AND liked_auth0_id = $2',
            [liker_auth0_id, liked_auth0_id]
        );

        if (existing.rows.length > 0) {
            await pool.query(
                'DELETE FROM likes WHERE liker_auth0_id = $1 AND liked_auth0_id = $2',
                [liker_auth0_id, liked_auth0_id]
            );

            await pool.query(
                'UPDATE users SET likes = likes - 1 WHERE auth0_id = $1',
                [liked_auth0_id]
            );
        } else {
            await pool.query(
                'INSERT INTO likes (liker_auth0_id, liked_auth0_id) VALUES ($1, $2)',
                [liker_auth0_id, liked_auth0_id]
            );

            await pool.query(
                'UPDATE users SET likes = likes + 1 WHERE auth0_id = $1',
                [liked_auth0_id]
            );
        }

        const user = await pool.query(
            'SELECT * FROM users WHERE auth0_id = $1',
            [liked_auth0_id]
        );

        return res.status(200).json(user.rows[0]);
    } catch (err) {
        console.error('Error toggling like:', err);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

const checkIfLiked = async (req, res) => {
    const { liker_auth0_id, liked_auth0_id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM likes WHERE liker_auth0_id = $1 AND liked_auth0_id = $2',
            [liker_auth0_id, liked_auth0_id]
        );

        res.status(200).json({ liked: result.rows.length > 0 });
    } catch (err) {
        console.error('Error checking like:', err);
        res.status(500).json({ error: 'Server Error', details: err.message });
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

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error updating username:', err);

        if (err.code === '23505') {
            return res.status(409).json({ error: 'Username already taken' });
        }
        
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

const getUserByUsername = async (req, res) => {
    const { username } = req.params;

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching user by username:', err);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

const updatePfp = async (req, res) => {
    const { auth0_id } = req.params;
    const { pfp } = req.body;

    if (!pfp) {
        return res.status(400).json({ error: 'Profile picture URL is required.'});
    }

    try {
        const result = await pool.query(
            'UPDATE users SET pfp = $1 WHERE auth0_id = $2 RETURNING *',
            [pfp, auth0_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error:  'User not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error updating profile picture:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

module.exports = { 
    getUsers, 
    upsertUser, 
    getUserById, 
    incrementProfileViews,  
    toggleLikeUser,
    checkIfLiked,
    updateUsername,
    getUserByUsername,
    updatePfp
};