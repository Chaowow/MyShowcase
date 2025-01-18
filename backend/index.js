const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');
const NodeCache = require('node-cache');
const apiCaller = require('./utils/apiCaller');

dotenv.config();

const app = express();
const PORT = process.env.PORT|| 5000;
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

const cacheMiddleware = (req, res, next) => {
    const { query, page = 1, startIndex, type } = req.query;

    let key;
    if (req.path === '/api/books') {
        const startIdx = startIndex || 0;
        key = `${req.path}?query=${query}&startIndex=${startIdx}`;
    } else if (req.path === '/api/tmdb') {
        key = `${req.path}?query=${query}&page=${page}&type=${type}`;
    } else {
        key = `${req.path}?query=${query}&page=${page}`;
    }

    const cachedData = cache.get(key);

    if (cachedData) {
        console.log(`Cache hit for ${key}`);
        return res.json(cachedData);
    }

    console.log(`Cache miss for ${key}`);
    res.sendResponse = res.json;
    res.json = (body) => {
        cache.set(key, body);
        res.sendResponse(body);
    };

    next();
}

app.get('/api/tmdb', cacheMiddleware, async (req, res) => {
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

app.get('/api/books', cacheMiddleware, async (req, res) => {
    const { query, startIndex = '0', maxResults = '20' } = req.query;
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

app.get('/api/rawg', cacheMiddleware, async (req, res) => {
    const { query, page = 1, page_size = 20 } = req.query;
    const RAWG_API_KEY = process.env.RAWG_API_KEY;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required.' });
    }

    const params = {
        key: RAWG_API_KEY,
        search: query,
        page,
        page_size
    };

    try {
        const data = await apiCaller('https://api.rawg.io/api/games', params);

        const formattedResults = data.results.map((game) => ({
            id: game.id,
            name: game.name,
            released: game.released,
            background_image: game.background_image,
            platforms: game.platforms.map((p) => p.platform.name)
        }));

        res.json({ results: formattedResults });
    } catch (error) {
        res.status(500).json({ error: 'An error occured while fetching data from RAWG'});
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
