import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api",
  withCredentials: true,
});

// Global error interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just pass the error through — each store handles errors individually
    return Promise.reject(error);
  }
);
