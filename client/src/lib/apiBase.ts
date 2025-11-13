// Central helper to build API URLs consistently.
// Switch base URL via .env (VITE_API_BASE_URL) or fallback to dev default.

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5101';
export const API_BASE = RAW_BASE.replace(/\/$/, '');

// Ensures single slash between base and path.
export function apiUrl(path: string): string {
  const trimmed = path.startsWith('/') ? path : `/${path}`;
  return API_BASE + trimmed;
}

// Simple fetch wrapper (extend with auth headers later).
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path), { credentials: 'include' });
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// Example usage:
// const ideas = await apiGet<Idea[]>('/api/ideas');