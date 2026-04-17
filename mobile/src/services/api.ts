/**
 * File: api.ts
 *
 * Description: Configures the base API client for the mobile app and provides generic
 * CRUD helper functions for making authenticated requests to the Supabase backend.
 * Centralizes error handling, request interceptors, and response parsing.
 *
 * Author: Navnit(Ninjacode911)
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '@env';
import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Base URL is read from mobile/.env (see mobile/.env.example for guidance).
// Each developer sets their own value — see mobile/README.md "Local setup".
// ---------------------------------------------------------------------------
const FALLBACK_BASE_URL = 'http://localhost:3000/api';

const getBaseUrl = (): string => {
  if (API_BASE_URL && API_BASE_URL.trim().length > 0) {
    return API_BASE_URL;
  }
  if (__DEV__) {
    console.warn(
      '[API] API_BASE_URL is not set. Copy mobile/.env.example to mobile/.env ' +
        'and set API_BASE_URL. Falling back to ' + FALLBACK_BASE_URL,
    );
  }
  return FALLBACK_BASE_URL;
};

const BASE_URL = getBaseUrl();
console.log(`[API] Base URL configured as: ${BASE_URL}`);

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
// Request interceptor — attach Supabase JWT to every request
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  async (config) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor — surface friendly error messages
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet, attempt a session refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retried
    ) {
      originalRequest._retried = true;

      const { data, error: refreshError } = await supabase.auth.refreshSession();

      if (!refreshError && data.session) {
        originalRequest.headers['Authorization'] = `Bearer ${data.session.access_token}`;
        return apiClient(originalRequest);
      }

      // Refresh failed — sign user out
      await supabase.auth.signOut();
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
