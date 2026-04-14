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
import { supabase } from './supabase';

import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Base URL — IMPORTANT for physical devices:
// If testing on a PHYSICAL phone, you MUST replace 'localhost' with your 
// computer's local IP address (e.g. '192.168.1.5').
// ---------------------------------------------------------------------------
const getBaseUrl = () => {
  if (process.env.API_BASE_URL) return process.env.API_BASE_URL;

  // EDIT THIS LINE if using a physical phone:
  const LOCAL_IP = '192.168.1.9'; // Your Wi-Fi IP

  if (__DEV__) {
    return Platform.OS === 'android' ? `http://${LOCAL_IP}:3000/api` : 'http://localhost:3000/api';
  }
  return 'http://localhost:3000/api';
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
