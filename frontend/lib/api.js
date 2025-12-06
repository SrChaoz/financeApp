import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle timeout
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout');
        }

        // Handle 401 - Unauthorized (Token expired or invalid)
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                // Clear stored data
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Show notification if not already on login page
                if (window.location.pathname !== '/login') {
                    // Store a flag to show message on login page
                    sessionStorage.setItem('sessionExpired', 'true');

                    // Redirect to login
                    window.location.href = '/login';
                }
            }
        }

        // Log errors in development
        if (process.env.NODE_ENV === 'development') {
            console.error('API Error:', {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response?.status,
                data: error.response?.data
            });
        }

        return Promise.reject(error);
    }
);

export default api;
