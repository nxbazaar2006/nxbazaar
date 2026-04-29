import axios from "axios";

const api = axios.create({
  baseURL: "/api", // ✅ FIX
  withCredentials: true,
});

export default api;