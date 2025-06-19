import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL + "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ This is crucial
});

export default axiosInstance;
