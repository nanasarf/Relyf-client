import { baseApi } from './baseApi'
import type { Save, CreateSaveRequest } from '../types/engagement'

export const savesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // PUT /api/Saves (create or update)
    toggleSave: build.mutation<Save, CreateSaveRequest>({
      query: (body) => ({
        url: '/api/Saves',
        method: 'PUT',
        body,
      }),
  invalidatesTags: (_, __, arg) => {
        // Attempt to invalidate the actual current user's profile cache so saveCount refreshes
        let currentUserId: number | string | undefined
        try {
          const raw = localStorage.getItem('relyf_user')
          if (raw) {
            const parsed = JSON.parse(raw)
            currentUserId = parsed?.id ?? parsed?.userId
          }
        } catch {
          // ignore JSON/localStorage parsing errors
        }
        const tags: { type: 'Idea' | 'SaveCount' | 'Save' | 'User'; id: string | number }[] = [
          { type: 'Idea', id: arg.ideaId },
          { type: 'SaveCount', id: arg.ideaId },
          // Invalidate generic saved-list and also a user-scoped list for safety
          { type: 'Save', id: 'USER_LIST' },
        ]
        if (currentUserId !== undefined && currentUserId !== null) {
          tags.push({ type: 'User', id: currentUserId })
          tags.push({ type: 'Save', id: `USER_LIST_${currentUserId}` })
        }
        return tags
      },
    }),

    // DELETE /api/Saves/{ideaId}
    removeSave: build.mutation<void, number | string>({
      query: (ideaId) => ({
        url: `/api/Saves/${ideaId}`,
        method: 'DELETE',
      }),
  invalidatesTags: (_, __, ideaId) => {
        let currentUserId: number | string | undefined
        try {
          const raw = localStorage.getItem('relyf_user')
          if (raw) {
            const parsed = JSON.parse(raw)
            currentUserId = parsed?.id ?? parsed?.userId
          }
        } catch {
          // ignore JSON/localStorage parsing errors
        }
        const tags: { type: 'Idea' | 'SaveCount' | 'Save' | 'User'; id: string | number }[] = [
          { type: 'Idea', id: ideaId },
          { type: 'SaveCount', id: ideaId },
          { type: 'Save', id: 'USER_LIST' },
        ]
        if (currentUserId !== undefined && currentUserId !== null) {
          tags.push({ type: 'User', id: currentUserId })
          tags.push({ type: 'Save', id: `USER_LIST_${currentUserId}` })
        }
        return tags
      },
    }),

    // GET /api/Saves/user/{userId}
    getUserSaves: build.query<Save[], number | string>({
      query: (userId) => ({
        url: `/api/Saves/user/${userId}`,
        method: 'GET',
      }),
      // Provide both a generic tag and a user-scoped tag so we can target invalidation precisely
      providesTags: (_, __, userId) => [
        { type: 'Save' as const, id: 'USER_LIST' },
        { type: 'Save' as const, id: `USER_LIST_${userId}` },
      ],
    }),
  }),
})

export const {
  useToggleSaveMutation,
  useRemoveSaveMutation,
  useGetUserSavesQuery,
} = savesApi
