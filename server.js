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

app.post('/api/analyze-colors', async (req, res) => {
    const { colors } = req.body;
    
    function analyzeColors(colors) {
        let warmColors = 0;
        let coolColors = 0;
        
        colors.forEach(color => {
            const hsl = hexToHSL(color);
            
            if ((hsl.h >= 0 && hsl.h <= 60) || hsl.h >= 320) {
                warmColors++;
            }
            else if (hsl.h > 180 && hsl.h < 320) {
                coolColors++;
            }
        });
        
        if (warmColors > coolColors) {
            if (colors.some(c => hexToHSL(c).s > 70)) {
                return {
                    personality: "Energetic, outgoing, and full of life",
                    season: "Summer: These vibrant warm tones reflect the energy of sunny days"
                };
            } else {
                return {
                    personality: "Grounded, creative, and nurturing",
                    season: "Autumn: Rich, warm hues that mirror falling leaves"
                };
            }
        } else {
            if (colors.some(c => hexToHSL(c).l > 70)) {
                return {
                    personality: "Optimistic, refreshing, and inspiring",
                    season: "Spring: Fresh and bright like new beginnings"
                };
            } else {
                return {
                    personality: "Elegant, mysterious, and confident",
                    season: "Winter: Cool and sophisticated tones"
                };
            }
        }
    }
    
    try {
        const analysis = analyzeColors(colors);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({
            error: "Color analysis error",
            details: error.message
        });
    }
});

function hexToHSL(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
    }

    return {
        h: h,
        s: s * 100,
        l: l * 100
    };
}

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
