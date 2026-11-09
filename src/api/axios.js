
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Automatically attach the correct authentication token.
api.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    const isAdminRequest =
  url.startsWith("/admin") ||
  (
    ["/products", "/category"].includes(url.split("/")[1] ? `/${url.split("/")[1]}` : "") &&
    ["post", "put", "patch", "delete"].includes(
      (config.method || "get").toLowerCase()
    )
  );
    const token = isAdminRequest
      ? localStorage.getItem("4xabuoya-admin-token")
      : localStorage.getItem("4xabuoya-token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
