import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { signOut } from "../features/auth/authSlice";

// Prefer explicit env value; otherwise attempt a small ordered fallback list (supports VS https profile & direct run)
// For consistent local dev we now standardize on 5100 (http) / 5101 (https) via .env.
// Fallback logic retained for resilience if env not set yet.
const fallbackApiHosts = [
  "http://localhost:5100", // new standard http dev port
  "https://localhost:5101", // new standard https dev port
  "http://localhost:5157",  // legacy
  "https://localhost:7280", // legacy
];
const baseUrl = import.meta.env.VITE_API_BASE_URL || fallbackApiHosts[0];

/**
 * Looks for a JWT in localStorage under "auth/token" and adds Authorization header.
 * If your API uses cookies instead, flip credentials to 'include' and drop the header.
 */
const rawBase = fetchBaseQuery({
  baseUrl,
  // Use include so cookies (if auth switches) flow; adjust if not needed.
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("relyf_token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBase(args, api, extraOptions);
  if (result.error) {
    // If the backend returns 401, automatically sign the user out to avoid stale-token loops
    const statusCode = (result.error as FetchBaseQueryError)?.status;
    if (statusCode === 401) {
      try {
        api.dispatch(signOut());
      } catch {
        // ignore dispatch errors
      }
    }
  }
  return result;
};

// Expose chosen baseUrl for health checks or debugging
export const API_BASE_URL = baseUrl;
