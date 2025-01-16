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
    const { query, page = 1, type = 'movie' } = req.query; 
    const TMDB_API_KEY = process.env.TMDB_API_KEY;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required.'});
    }

    try {
        // Call TMDb API
        const endpoint = type === 'tv'
        ? 'https://api.themoviedb.org/3/search/tv'
        : 'https://api.themoviedb.org/3/search/movie';

        const response = await axios.get(endpoint, {
            params: {
                api_key: TMDB_API_KEY,
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

app.get('/api/books', async (req, res) => {
    const { query, startIndex = '0', maxResults = '8' } = req.query;
    const  GBOOKS_API_KEY = process.env.GBOOKS_API_KEY;

    const sIndex = parseInt(startIndex, 10);
    const mResults = parseInt(maxResults, 10);

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required.'});
    }

    try {
        // Call Google Books API
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
            params: {
                q: query,
                startIndex: sIndex,
                maxResults: mResults,
                key: GBOOKS_API_KEY
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from Google Books:', error.message);
        res.status(500).json({ error: 'An error occured while fetching data from Google Books'});
    }
});

app.get('/api/rawg', async (req, res) => {
    const { query, page = 1, page_size = 8 } = req.query;

    try {
        const response = await axios.get('https://api.rawg.io/api/games', {
            params: {
                key: process.env.RAWG_API_KEY,
                search: query,
                page,
                page_size
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from Google Books:', error.message);
        res.status(500).json({ error: 'An error occured while fetching data from RAWG'});
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
