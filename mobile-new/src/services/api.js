import axios from "axios";

// Simple in-memory token store (AsyncStorage issue bypass)
let authToken = null;

export const setToken = (token) => { authToken = token; };
export const getToken = () => authToken;
export const clearToken = () => { authToken = null; };

const api = axios.create({
  baseURL: "http://10.83.169.217:5000/api",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", err.message, "URL:", err.config?.url);
    return Promise.reject(err);
  }
);

export default api;
