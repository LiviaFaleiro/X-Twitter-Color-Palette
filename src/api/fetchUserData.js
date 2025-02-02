export const fetchUserData = async (username) => {
    const response = await fetch(`/api/twitter/user/${username}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
  
    return response.json();
  };
  //the fetchUserData function is an asynchronous function that fetches user data from a specified endpoint. 
  //It takes a username parameter and returns a promise that resolves to the JSON response from the API.
  //If the response is not ok, it throws an error.
  //The function is exported so it can be used in other parts of the application.