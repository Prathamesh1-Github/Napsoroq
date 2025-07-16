import axios from 'axios';

const axiosInstance = axios.create({
    headers: {
        'Content-Type': 'application/json',
        
    },
});




// Add Authorization header dynamically on every request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
