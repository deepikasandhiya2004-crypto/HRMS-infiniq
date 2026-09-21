import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// TEMPORARY (dev only): tells the backend which employee is "logged in".
// Login vandhadhum idhai real token-a maathuvom.
api.interceptors.request.use((config) => {
  const devUserId = localStorage.getItem("hrms_dev_user_id");
  if (devUserId) {
    config.headers["x-employee-id"] = devUserId;
  }
  return config;
});

// Turn any failure into a normal Error with a readable message
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