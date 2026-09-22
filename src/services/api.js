import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hrms_token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      "Cannot reach the server. Is the backend running?";
    const err = new Error(message);
    err.status = error.response?.status;
    return Promise.reject(err);
  }
);

export default api;