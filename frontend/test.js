import axios from "axios";

const API = "http://localhost:3000/api";

const testFlow = async () => {
  try {
    const api = axios.create({
      baseURL: API,
      withCredentials: true,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const email = `test-user-${Date.now()}@test.com`;
    // 1. Signup (returns HTTPOnly cookie if valid)
    let cookie = "";
    const signupRes = await api.post("/auth/signup", {
      fullName: "Test User", email, password: "password123", dob: "1990-01-01", gender: "Male"
    });
    
    // Node.js axios does not store cookies automatically. We must grab set-cookie:
    const setCookie = signupRes.headers["set-cookie"];
    if (setCookie) {
      cookie = setCookie[0].split(";")[0];
    }
    console.log("Cookie grabbed:", cookie);

    const groupId = 4; // Java Study Circle ☕


    // 3. Send a message
    const sendRes = await api.post(`/groups/send/${groupId}`, {
        text: "hello ai tell me something" // triggers AI
    }, {
        headers: { Cookie: cookie }
    });

    console.log("Send message response:", sendRes.status, sendRes.data);
    
  } catch (error) {
    console.error("Test failed:", error.response?.status, error.response?.data || error.message);
  }
};

testFlow();
