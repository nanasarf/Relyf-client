import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

// Prefer explicit env value; otherwise attempt a small ordered fallback list (supports VS https profile & direct run)
const fallbackApiHosts = [
  "http://localhost:5157",  // direct dotnet run http profile (preferred for dev)
  "https://localhost:7280", // VS https profile
];
const baseUrl = import.meta.env.VITE_API_BASE_URL || (() => {
  for (const h of fallbackApiHosts) {
    // We optimistically choose the first; runtime connectivity banner will still validate
    return h;
  }
  return "http://localhost:5157";
})();

/**
 * Looks for a JWT in localStorage under "auth/token" and adds Authorization header.
 * If your API uses cookies instead, flip credentials to 'include' and drop the header.
 */
const rawBase = fetchBaseQuery({
  baseUrl,
  credentials: "same-origin",
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
    try {
      const req = typeof args === "string" ? { url: args, method: "GET" } : args;
      const url = req.url ?? "<unknown-url>";
      const method = (req as FetchArgs).method ?? "GET";
      const status = result.error.status ?? "<no-status>";
      const dataSnippet = typeof result.error.data === "string"
        ? result.error.data.slice(0, 200)
        : JSON.stringify(result.error.data)?.slice(0, 200);
      console.debug(`[API ERROR] ${method} ${url} -> ${status}`, dataSnippet);
    } catch (e) {
      console.debug("[API ERROR] failed to log", e);
    }
  }
  return result;
};

// Expose chosen baseUrl for health checks or debugging
export const API_BASE_URL = baseUrl;
