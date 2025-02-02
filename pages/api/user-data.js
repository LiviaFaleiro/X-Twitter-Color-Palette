export default function handler(req, res) {
    res.status(200).json({
      success: true,
      message: 'User data fetched successfully',
      data: {
        userId: '123',
        preferences: {
          colorScheme: 'light',
          favoriteColors: ['#FF5733', '#33FF57', '#3357FF']
        }
      }
    })
  }

  // This is a simple API route that returns a JSON response with a success message and some dummy user data.
  // It is used to demonstrate how to fetch user data from an API in a Next.js application.
  // The API route is defined in the pages/api directory and is automatically recognized by Next.js.
  // The handler function takes two parameters: req and res.
  // The req parameter contains information about the incoming HTTP request, such as the request method, headers, and body.
  // The res parameter is used to send the response back to the client.
  // In this case, the response is a JSON object with a success message and some dummy user data.
  // The response status code is set to 200, which indicates a successful response.