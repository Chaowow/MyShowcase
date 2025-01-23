const express = require('express'); 
const dotenv = require('dotenv'); 
const axios = require('axios'); 
const cors = require('cors'); // Import CORS for cross-origin requests
const NodeCache = require('node-cache'); // Import NodeCache for caching
const apiCaller = require('./utils/apiCaller'); // Custom utility for API calls

dotenv.config();

const app = express(); 
const PORT = process.env.PORT || 5000; 
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 }); // Initialize cache with TTL of 300 seconds

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

// Cache middleware to reduce duplicate API calls
const cacheMiddleware = (req, res, next) => {
    const { query, page = 1, startIndex, type } = req.query;

    // Generate a unique cache key based on the endpoint and query parameters
    let key;
    if (req.path === '/api/books') {
        const startIdx = startIndex || 0;
        key = `${req.path}?query=${query}&startIndex=${startIdx}`;
    } else if (req.path === '/api/tmdb') {
        key = `${req.path}?query=${query}&page=${page}&type=${type}`;
    } else {
        key = `${req.path}?query=${query}&page=${page}`;
    }

    // Check if data is already cached
    const cachedData = cache.get(key);

    if (cachedData) {
        return res.json(cachedData); // Return cached data
    }

    res.sendResponse = res.json;
    res.json = (body) => {
        cache.set(key, body); // Cache the response
        res.sendResponse(body);
    };

    next(); // Proceed to the next middleware or route handler
};

// Endpoint to fetch movies or TV shows from TMDb API
app.get('/api/tmdb', cacheMiddleware, async (req, res) => {
    const { query, page = 1, type = 'movie' } = req.query; 
    const TMDB_API_KEY = process.env.TMDB_API_KEY;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required.' });
    }

    // Determine the endpoint based on the type parameter
    const endpoint = type === 'tv'
        ? 'https://api.themoviedb.org/3/search/tv'
        : 'https://api.themoviedb.org/3/search/movie';

    const params = {
        api_key: TMDB_API_KEY,
        query,
        page
    };

    try {
        const data = await apiCaller(endpoint, params); // Fetch data from TMDb API
        res.json(data); // Return the fetched data
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching data from TMDb.' });
    }
});

// Endpoint to fetch books from Google Books API
app.get('/api/books', cacheMiddleware, async (req, res) => {
    const { query, startIndex = '0', maxResults = '20' } = req.query;
    const GBOOKS_API_KEY = process.env.GBOOKS_API_KEY;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required.' });
    }

    const params = {
        q: query,
        startIndex: parseInt(startIndex, 10),
        maxResults: parseInt(maxResults, 10),
        key: GBOOKS_API_KEY,
    };

    try {
        const data = await apiCaller('https://www.googleapis.com/books/v1/volumes', params); // Fetch data from Google Books API
        res.json(data); // Return the fetched data
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching data from Google Books.' });
    }
});

// Endpoint to fetch video games from RAWG API
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
        const data = await apiCaller('https://api.rawg.io/api/games', params); // Fetch data from RAWG API
        

        // Format the results for consistency
        const formattedResults = (data.results || []).map((game) => ({
            id: game.id,
            name: game.name,
            released: game.released,
            background_image: game.background_image,
            platforms: game.platforms ? game.platforms.map((p) => p.platform.name) : []
        }));

        res.json({ results: formattedResults, count: data.count || 0 }); // Return the formatted data
    } catch (error) {
        console.error('RAWG API Error:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching data from RAWG.' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
