import { baseApi } from './baseApi'
import type { AdminLog, LogsSummary, TopModel } from '../types/admin'

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRecentLogs: build.query<AdminLog[], void>({
      query: () => ({ url: '/admin/logs/recent' }),
      providesTags: ['AdminLogs'],
    }),
    getLogsSummary: build.query<LogsSummary, void>({
      query: () => ({ url: '/admin/logs/summary' }),
    }),
    getTopModels: build.query<TopModel[], void>({
      query: () => ({ url: '/admin/logs/top-models' }),
    }),
  }),
})

export const {
  useGetRecentLogsQuery,
  useGetLogsSummaryQuery,
  useGetTopModelsQuery,
} = adminApi
