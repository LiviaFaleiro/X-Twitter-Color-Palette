const axios = require('axios');

export default async function handler(req, res) {
    const { username } = req.query;
    const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

    const response = await axios.get(
        `https://api.twitter.com/2/users/by/username/${username}?user.fields=profile_image_url,profile_banner_url,name,username`,
        {
            headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`
            }
        }
    );
    
    return res.json(response.data);
}
