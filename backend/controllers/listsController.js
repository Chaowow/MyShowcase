const pool = require('../db');

const togglePinnedList = async (req, res) => {
    const { user_auth0_id, list_id } = req.body;

    try {
        const existing = await pool.query(
            'SELECT * FROM pinned_lists WHERE user_auth0_id = $1 AND list_id = $2',
            [user_auth0_id, list_id]
        );

        if (existing.rows.length > 0) {
            await pool.query(
                'DELETE FROM pinned_lists WHERE user_auth0_id = $1 AND list_id = $2',
                [user_auth0_id, list_id]
            );
        } else {
            const countResult = await pool.query(
                'SELECT COUNT(*) FROM pinned_lists WHERE user_auth0_id = $1',
                [user_auth0_id]    
            );

            if (parseInt(countResult.rows[0].count) >= 3) {
                return res.status(400).json({ error: 'Maximum of 3 pinned lists allowed.' });
            }

            await pool.query(
                'INSERT INTO pinned_lists (user_auth0_id, list_id) VALUES ($1, $2)',
                [user_auth0_id, list_id]
            );
        }

        res.status(200).json({ message: 'Pin toggled successfully' });
    } catch (err) {
        console.error('Error toggling pinned list:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

  const getPinnedLists = async (req, res) => {
    const { user_auth0_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT l.*
            FROM lists l
            JOIN pinned_lists p ON l.id = p.list_id
            WHERE p.user_auth0_id = $1`,
            [user_auth0_id]
        );

        const formatted = result.rows.map(row => ({
            ...row,
            items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
        }));

        res.status(200).json(formatted);
    } catch (err) {
        console.error('Error fetching pinned lists:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

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

const updateList = async (req, res) => {
    const { id } = req.params;
    const { title, description, items} = req.body;

    try {
        const result = await pool.query(
           `UPDATE lists
            SET title = $1, description = $2, items = $3
            WHERE id = $4
            RETURNING *`,
            [title, description, JSON.stringify(items), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'List not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error updating list:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};


const deleteList = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM lists WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'List not found'});
        }

        res.status(200).json({ message: 'List deleted successfully', deleted: result.rows[0] });
    } catch (err) {
        console.error('Error deleting list:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

module.exports = { togglePinnedList, getPinnedLists, getUserLists, createList, updateList, deleteList };