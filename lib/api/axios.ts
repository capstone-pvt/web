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

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// A separate instance for token refresh to avoid interceptor recursion
const axiosRefreshInstance = axios.create({
  baseURL,
  withCredentials: true,
});

// Response interceptor for data unwrapping and token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    // Unwrap the NestJS API response format
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return {
        ...response,
        data: response.data.data ?? response.data,
      };
    }
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    // Only try to refresh on 401 errors for non-auth-related endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/me')
    ) {
      originalRequest._retry = true;

      try {
        // Use the clean instance to refresh the token
        await axiosRefreshInstance.post('/auth/refresh');
        // Retry the original request with the main instance
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, just reject the promise. The UI will handle it.
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
