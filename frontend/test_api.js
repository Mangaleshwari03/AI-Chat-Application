import axios from "axios";

const API = "http://localhost:5001/api";

const testAPI = async () => {
  try {
    // Attempt to login as ananya/ManiMekalai or another user, or register a temp user
    // Wait, let's just make a user if needed or login
    const signupData = {
      fullName: "Test User",
      email: "test_msg_error@example.com",
      password: "password123",
      dob: "2000-01-01",
      city: "Test",
      gender: "Male"
    };

    let token = "";
    
    try {
      const res = await axios.post(`${API}/auth/signup`, signupData);
      // Wait, there are no tokens in json, we use cookies! So we must store the cookie.
    } catch(e) {}

    const axiosInstance = axios.create({
      baseURL: API,
      withCredentials: true // Requires maintaining a cookie jar in Node.js, wait 
      // Node axios doesn't support cookies natively unless we extract and pass it.
    });

  } catch (error) {
    console.error("Test blocked:", error);
  }
};

testAPI();
