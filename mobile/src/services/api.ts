/**
 * File: api.ts
 *
 * Description: Configures the base API client for the mobile app and provides generic
 * CRUD helper functions for making authenticated requests to the backend.
 * Centralizes error handling, request interceptors, and response parsing.
 *
 * Author: Navnit(Ninjacode911)
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '@env';
import { SecureStore } from '../utils/keychain';

// ---------------------------------------------------------------------------
// Base URL is read from mobile/.env (see mobile/.env.example for guidance).
// Each developer sets their own value — see mobile/README.md "Local setup".
//
// In dev: missing API_BASE_URL falls back to localhost with a warning.
// In production: missing API_BASE_URL is a build-time mistake — throw loudly
// so it's caught before users hit a silently-broken app.
// ---------------------------------------------------------------------------
const DEV_FALLBACK_BASE_URL = 'http://localhost:3000/api';

const getBaseUrl = (): string => {
  if (API_BASE_URL && API_BASE_URL.trim().length > 0) {
    return API_BASE_URL;
  }
  if (__DEV__) {
    console.warn(
      '[API] API_BASE_URL is not set. Copy mobile/.env.example to mobile/.env ' +
        'and set API_BASE_URL. Falling back to ' + DEV_FALLBACK_BASE_URL,
    );
    return DEV_FALLBACK_BASE_URL;
  }
  throw new Error(
    '[API] API_BASE_URL is required in production builds but was not set at build time. ' +
      'Set it in mobile/.env before running `npm run android` / `npm run ios`.',
  );
};

const BASE_URL = getBaseUrl();
if (__DEV__) console.log(`[API] Base URL configured as: ${BASE_URL}`);

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Request interceptor — attach JWT token from secure storage to every request
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getToken('auth_token');

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor — handle token refresh and auth errors
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet, attempt a token refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retried
    ) {
      originalRequest._retried = true;

      try {
        const refreshToken = await SecureStore.getToken('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { access_token, refresh_token: newRefreshToken } = response.data.data;
          
          // Store new tokens
          await SecureStore.saveToken('auth_token', access_token);
          if (newRefreshToken) {
            await SecureStore.saveToken('refresh_token', newRefreshToken);
          }
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed — clear tokens and redirect to login
        await SecureStore.deleteToken('auth_token');
        await SecureStore.deleteToken('refresh_token');
        // You might want to emit an event here to redirect to login
      }
    }

    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Generic typed helpers
// ---------------------------------------------------------------------------

/** Unwrap the `data` field from the standard backend response envelope */
function unwrap<T>(response: AxiosResponse<{ data: T }>): T {
  return response.data.data;
}

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<{ data: T }>(url, config);
  return unwrap(response);
}

export async function post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.post<{ data: T }>(url, body, config);
  return unwrap(response);
}

export async function patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.patch<{ data: T }>(url, body, config);
  return unwrap(response);
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<{ data: T }>(url, config);
  return unwrap(response);
}

export default apiClient;
