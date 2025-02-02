import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req, res) {
  const { username } = req.query;
  
  const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

  try {
   
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = await client.v2.userByUsername(username, {
      'user.fields': ['profile_image_url', 'profile_banner_url', 'name', 'username']
    });

    res.status(200).json({
      data: {
        name: user.data.name,
        username: user.data.username,
        profile_image_url: user.data.profile_image_url,
        profile_banner_url: user.data.profile_banner_url
      }
    });

  } catch (error) {
    if (error.code === 429) {
      res.status(429).json({
        message: 'Please wait a moment and try again (limit rate exceeded)'
      });
    } else {
      res.status(404).json({
        message: 'Twitter user not found'
      });
    }
  }
}
