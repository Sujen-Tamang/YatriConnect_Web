// api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api/v1/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log(token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const adminLogin = async (loginData) => {
    try {
        const response = await api.post("auth/login", loginData);
        console.log("Admin login response:", response.data); // Debug log
        if (response.data && typeof response.data === "object") {
            return response.data; // Expect { success, token, admin } or { success, message }
        } else {
            return {
                success: false,
                message: "Invalid response from server",
            };
        }
    } catch (error) {
        console.error("Admin login failed:", error.response?.data || error.message);
        return {
            success: false,
            message: error.response?.data?.message || "Admin login failed",
        };
    }
};

export default api;