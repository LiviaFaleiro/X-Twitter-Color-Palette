const axios = require('axios');

module.exports = async (req, res) => {
    const username = req.query.username || req.params.username;
    const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

    try {
        const response = await axios.get(
            `https://api.twitter.com/2/users/by/username/${username}?user.fields=profile_image_url,profile_banner_url,name,username`,
            {
                headers: {
                    'Authorization': `Bearer ${BEARER_TOKEN}`
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || error.message
        });
    }
};
