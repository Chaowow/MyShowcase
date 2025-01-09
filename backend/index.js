const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');


dotenv.config();

const app = express();
const PORT = process.env.PORT|| 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

app.get('/api/tmdb', async (req, res) => {
    const { query, page = 1 } = req.query; // Extract 'query' and 'page' from request
    const API_KEY = process.env.TMDB_API_KEY;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required.'});
    }

    try {
        // Call TMDb API
        const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
            params: {
                api_key: API_KEY,
                query,
                page
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from TMDb:', error.message);
        res.status(500).json({ error: 'An error occured while fetching data from TMDb.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
