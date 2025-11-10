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
      invalidatesTags: (_, __, arg) => [
        { type: 'Idea', id: arg.ideaId },
        { type: 'SaveCount', id: arg.ideaId },
      ],
    }),

    // DELETE /api/Saves/{ideaId}
    removeSave: build.mutation<void, number | string>({
      query: (ideaId) => ({
        url: `/api/Saves/${ideaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, ideaId) => [
        { type: 'Idea', id: ideaId },
        { type: 'SaveCount', id: ideaId },
      ],
    }),

    // GET /api/Saves/user/{userId}
    getUserSaves: build.query<Save[], number | string>({
      query: (userId) => ({
        url: `/api/Saves/user/${userId}`,
        method: 'GET',
      }),
      providesTags: [{ type: 'Save', id: 'USER_LIST' }],
    }),
  }),
})

export const {
  useToggleSaveMutation,
  useRemoveSaveMutation,
  useGetUserSavesQuery,
} = savesApi
