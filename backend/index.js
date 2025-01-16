const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');
const apiCaller = require('./utils/apiCaller');

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

        const endpoint = type === 'tv'
        ? 'https://api.themoviedb.org/3/search/tv'
        : 'https://api.themoviedb.org/3/search/movie';

        const params = {
            api_key: TMDB_API_KEY,
            query,
            page
        }

    try {
        const data = await apiCaller(endpoint, params);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'An error occured while fetching data from TMDb.' });
    }
});

app.get('/api/books', async (req, res) => {
    const { query, startIndex = '0', maxResults = '8' } = req.query;
    const  GBOOKS_API_KEY = process.env.GBOOKS_API_KEY;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required.'});
    }

    const params = {
        q: query,
        startIndex: parseInt(startIndex, 10),
        maxResults: parseInt(maxResults, 10),
        key: GBOOKS_API_KEY,
    };

    try {
        const data = await apiCaller('https://www.googleapis.com/books/v1/volumes', params);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'An error occured while fetching data from Google Books'});
    }
});

app.get('/api/rawg', async (req, res) => {
    const { query, page = 1, page_size = 8 } = req.query;
    const RAWG_API_KEY = process.env.RAWG_API_KEY;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is require.' });
    }

    const params = {
        key: RAWG_API_KEY,
        search: query,
        page,
        page_size
    };

    try {
        const data = await apiCaller('https://api.rawg.io/api/games', params);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'An error occured while fetching data from RAWG'});
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
