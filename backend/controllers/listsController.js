const pool = require('../db');

const getUserLists = async (req, res) => {
    const { auth0_id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM lists WHERE auth0_id = $1 ORDER BY created_at DESC',
            [auth0_id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching user lists:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

const createList = async (req, res) => {
    try {
        const { auth0_id, title, items, description } = req.body;
        if (!auth0_id || !title || !items) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await pool.query(
            `INSERT INTO lists (auth0_id, title, items, description)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [auth0_id, title, JSON.stringify(items), description || null]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating list:', err);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

module.exports = { getUserLists, createList };