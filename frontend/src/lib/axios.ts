import axios from 'axios';

// Create a custom axios instance
export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // Important for cookies/sessions if used
});

// Add a request interceptor to inject the JWT token if you are using localStorage
axiosInstance.interceptors.request.use(
    (config) => {
        // Example: get token from local storage or Zustand store
        const token = localStorage.getItem('chat-token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
