import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Response format from NestJS backend
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Extended request config with retry flag
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Cookies are sent automatically with withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for data unwrapping and token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    // Unwrap the NestJS API response format
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      // Return the data property for easier access
      return {
        ...response,
        data: response.data.data ?? response.data,
      };
    }
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    // If 401 and not a retry or refresh request, try refreshing
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/me')
    ) {
      originalRequest._retry = true;

      try {
        // Call the NestJS refresh endpoint
        await axiosInstance.post('/auth/refresh');
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Format error response
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject({
      ...error,
      message: errorMessage,
    });
  }
);

export default axiosInstance;
