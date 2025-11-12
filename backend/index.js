const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const pool = require('./db');
const { toHttps, normalizeGoogleBook } = require('./utils/toHttps');
const cors = require('cors'); // Import CORS for cross-origin requests
const NodeCache = require('node-cache'); // Import NodeCache for caching
const apiCaller = require('./utils/apiCaller'); // Custom utility for API calls
const usersRoutes = require('./routes/users');
const listsRoutes = require('./routes/lists');

const ALLOWED_IMAGE_HOSTS = new Set([
    'books.googleusercontent.com',
    'books.google.com',
    'media.rawg.io',
    'image.tmdb.org'
]);

const IMAGE_TIMEOUT_MS = 7000;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const FORWARD_HEADERS = [
    'content-type',
    'cache-control',
    'etag',
    'last-modified',
    'expires',
];

function isAllowedImageUrl(u) {
    try {
        const url = new URL(u);
        if (!['http:', 'https:'].includes(url.protocol)) return false;
        return ALLOWED_IMAGE_HOSTS.has(url.hostname);
    } catch {
        return false;
    }
}


dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 }); // Initialize cache with TTL of 300 seconds

app.use(cors());
app.use(express.json());
app.use('/users', usersRoutes);
app.use('/lists', listsRoutes);

app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

// Cache middleware to reduce duplicate API calls
const cacheMiddleware = (req, res, next) => {
    const { query, page = 1, type } = req.query;

    // Generate a unique cache key based on the endpoint and query parameters
    let key;
    if (req.path === '/api/books') {
        key = `${req.path}?query=${query}&page=${page}`;
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

    const itemsPerPage = 4;
    const tmdbPage = Math.ceil(page / Math.ceil(20 / itemsPerPage));

    const params = {
        api_key: TMDB_API_KEY,
        query,
        page: tmdbPage
    };

    try {
        const data = await apiCaller(endpoint, params); // Fetch data from TMDb API

        const results = data.results || [];
        const startIndex = ((page - 1) % Math.ceil(20 / itemsPerPage)) * itemsPerPage;
        const currentItems = results.slice(startIndex, startIndex + itemsPerPage);

        const total_pages = Math.ceil(data.total_results / itemsPerPage);

        // Return the fetched data
        res.json({
            results: currentItems,
            total_pages
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching data from TMDb.' });
    }
});

// Endpoint to fetch books from Google Books API
app.get('/api/books', cacheMiddleware, async (req, res) => {
    const { query, page = 1 } = req.query;
    const GBOOKS_API_KEY = process.env.GBOOKS_API_KEY;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required.' });
    }

    const itemsPerPage = 4;
    const startIndex = (parseInt(page) - 1) * itemsPerPage;

    const params = {
        q: query,
        startIndex,
        maxResults: itemsPerPage,
        key: GBOOKS_API_KEY,
    };

    try {
        const data = await apiCaller('https://www.googleapis.com/books/v1/volumes', params); // Fetch data from Google Books API

        const results = (data.items || []).map(normalizeGoogleBook);
        const totalItems = data.totalItems || 0;
        const totalPages = Math.ceil(totalItems / itemsPerPage);


        res.json({ results, totalPages }); // Return the fetched data
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching data from Google Books.' });
    }
});

// Endpoint to fetch video games from RAWG API
app.get('/api/rawg', cacheMiddleware, async (req, res) => {
    const { query, page = 1 } = req.query;
    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    const page_size = 4;

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

        const total_pages = Math.ceil((data.count || 0) / page_size);

        res.json({ results: formattedResults, total_pages }); // Return the formatted data
    } catch (error) {
        console.error('RAWG API Error:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching data from RAWG.' });
    }
});

app.get('/api/image', async (req, res) => {
    const raw = req.query.u;
    if (!raw) return res.status(400).json({ error: 'Missing ?u' });

    if (!isAllowedImageUrl(raw)) {
        return res.status(400).json({ error: 'Host not allowed' });
    }

    try {

        const upstream = await axios.get(raw, {
            responseType: 'stream',
            timeout: IMAGE_TIMEOUT_MS,
            headers: {
                'User-Agent': 'MyTopShowcase/1.0 (+https://example.local)',
                'Accept': 'image/avif,image/webp,image/*;q=0.8,*/*;q=0.5'
            },
            withCredentials: false,
            validateStatus: (s) => s >= 200 && s < 400,
            maxRedirects: 3
        });

        const ct = upstream.headers['content-type'] || '';
        if (!ct.startsWith('image/')) {
            upstream.data.destroy();
            return res.status(415).json({ error: 'Upstream is not an image' });
        }

        const lenHeader = upstream.headers['content-length'];
        if (lenHeader && Number(lenHeader) > MAX_IMAGE_BYTES) {
            upstream.data.destroy();
            return res.status(413).json({ error: 'Image too large' });
        }

        FORWARD_HEADERS.forEach((h) => {
            const v = upstream.headers[h];
            if (v) res.setHeader(h, v);
        });

        if (!upstream.headers['cache-control']) {
            res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
        }

        if (lenHeader) {
            res.setHeader('Content-Length', lenHeader);
        }

        let bytes = 0;
        upstream.data.on('data', (chunk) => {
            bytes += chunk.length;
            if (bytes > MAX_IMAGE_BYTES) {
                upstream.data.destroy(new Error('Image exceeded size cap'));
            }
        });

        upstream.data.on('error', () => {
            if (!res.headersSent) res.status(502);
            res.end();
        });

        upstream.data.pipe(res);

    } catch (err) {
        if (axios.isAxiosError(err)) {
            if (err.code === 'ECONNABORTED') {
                return res.status(504).json({ error: 'Upstream timed out' });
            }
            const status = err.response?.status || 502;
            return res.status(status).json({ error: 'Failed to fetch image' });
        }

        return res.status(500).json({ error: 'Proxy error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
