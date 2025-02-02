const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors({
    origin: true,
    credentials: true
}));

app.use((req, res, next) => {
    res.header('Content-Type', 'application/json');
    next();
});

app.use(express.static(path.join(__dirname)));
app.use(express.json());

require('dotenv').config();
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const API_CACHE_TIME = 24 * 60 * 60 * 1000; // 24h
const userDataCache = new Map();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/twitter/user/:username', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const username = req.params.username;

    if (!BEARER_TOKEN) {
        return res.status(500).json({
            status: 'error',
            message: 'Twitter API configuration is missing'
        });
    }

    try {
        const response = await axios.get(
            `https://api.twitter.com/2/users/by/username/${username}?user.fields=profile_image_url,profile_banner_url,name,username`,
            {
                headers: {
                    'Authorization': `Bearer ${BEARER_TOKEN}`
                }
            }
        );
        
        return res.json(response.data);
    } catch (error) {
        return res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || error.message
        });
    }
});

app.get('/api/health', (req, res) => { 
    res.json({ status: 'ok' });
});

app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

setInterval(() => {
    const now = Date.now();
    for (const [key, value] of userDataCache.entries()) {
        if (now - value.timestamp > API_CACHE_TIME) {
            userDataCache.delete(key);
        }
    }
}, API_CACHE_TIME);

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
