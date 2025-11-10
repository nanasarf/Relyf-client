import { baseApi } from './baseApi'
import type { DropoffSite, Feedback, SubmitFeedbackRequest } from '../types/community'

export const communityApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // GET /api/DropoffSites
    getDropoffSites: build.query<DropoffSite[], void>({
      query: () => ({
        url: '/api/DropoffSites',
        method: 'GET',
      }),
      providesTags: [{ type: 'DropoffSite', id: 'LIST' }],
    }),

    // GET /api/DropoffSites/{id}
    getDropoffSiteById: build.query<DropoffSite, number | string>({
      query: (id) => ({
        url: `/api/DropoffSites/${id}`,
        method: 'GET',
      }),
      providesTags: (_, __, id) => [{ type: 'DropoffSite', id }],
    }),

    // POST /api/Feedback
    submitFeedback: build.mutation<Feedback, SubmitFeedbackRequest>({
      query: (body) => ({
        url: '/api/Feedback',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Feedback', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetDropoffSitesQuery,
  useGetDropoffSiteByIdQuery,
  useSubmitFeedbackMutation,
} = communityApi
