import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../app/store'

const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState)?.auth?.token
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['AdminLogs', 'Idea', 'Ideas', 'Top', 'Stats', 'ReactionCount', 'Save', 'SaveCount', 'Tag', 'Image', 'Feedback', 'DropoffSite'],
  endpoints: () => ({}),
})
