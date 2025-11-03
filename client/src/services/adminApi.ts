import { baseApi } from './baseApi'

// Minimal shape based on typical log records.
// Tweak fields once you see the real response.
export type AdminLog = {
  message?: string;
  timestamp?: string;        // or 'createdAt' if that's what your API returns
} & Record<string, unknown>;

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRecentLogs: build.query<AdminLog[], void>({
      query: () => ({ url: '/admin/logs/recent' }), // base '/api' added by baseApi
    }),
  }),
});

export const { useGetRecentLogsQuery } = adminApi;
