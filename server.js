const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname)));

require('dotenv').config();
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const API_CACHE_TIME = 24 * 60 * 60 * 1000; // 24h
const userDataCache = new Map();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/twitter/user/:username', async (req, res) => {
    const username = req.params.username;
    
    
    if (userDataCache.has(username)) {
        const cachedData = userDataCache.get(username);
        if (Date.now() - cachedData.timestamp < API_CACHE_TIME) {
            return res.json(cachedData.data);
        }
        userDataCache.delete(username);
    }

    try {
        const response = await axios.get(
            `https://api.twitter.com/2/users/by/username/${username}?user.fields=profile_image_url,profile_banner_url,name,username`,
            {
                headers: {
                    'Authorization': `Bearer ${BEARER_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        
        userDataCache.set(username, {
            timestamp: Date.now(),
            data: response.data
        });

        res.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const message = status === 429 ? 
            'Taking a break to respect Twitter limits. Try again in a few minutes.' : 
            error.message;
            
        res.status(status).json({
            status: 'error',
            message
        });
    }
});

// cleanup interval
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
