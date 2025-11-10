import { createApi } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../app/store'
import { API_BASE_URL } from './baseQuery'
import { baseQueryWithAuth } from './baseQuery'

// Reuse enhanced baseQueryWithAuth (adds Authorization + debug logging). Fall back to Redux token if localStorage empty.
const wrappedBaseQuery: typeof baseQueryWithAuth = async (args, api, extra) => {
  // Ensure token mirrored into localStorage if only in Redux
  const stateToken = (api.getState() as RootState)?.auth?.token
  if (stateToken && !localStorage.getItem('relyf_token')) {
    localStorage.setItem('relyf_token', stateToken)
  }
  return baseQueryWithAuth(args, api, extra)
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: wrappedBaseQuery,
  tagTypes: ['AdminLogs', 'Idea', 'Ideas', 'Top', 'Stats', 'ReactionCount', 'Save', 'SaveCount', 'Tag', 'Image', 'Feedback', 'DropoffSite', 'Project', 'Projects'],
  endpoints: () => ({}),
})

// Optional: export resolved API base for UI diagnostics
export { API_BASE_URL }
