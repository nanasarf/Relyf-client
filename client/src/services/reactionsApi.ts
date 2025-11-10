import { baseApi } from './baseApi'
import type { Reaction, ReactionCount, CreateReactionRequest } from '../types/engagement'

export const reactionsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // PUT /api/Reactions (create or update)
    toggleReaction: build.mutation<Reaction, CreateReactionRequest>({
      query: (body) => ({
        url: '/api/Reactions',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_, __, arg) => [
        { type: 'Idea', id: arg.ideaId },
        { type: 'ReactionCount', id: arg.ideaId },
      ],
    }),

    // DELETE /api/Reactions/{ideaId}
    removeReaction: build.mutation<void, number | string>({
      query: (ideaId) => ({
        url: `/api/Reactions/${ideaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, ideaId) => [
        { type: 'Idea', id: ideaId },
        { type: 'ReactionCount', id: ideaId },
      ],
    }),

    // GET /api/Reactions/idea/{ideaId}/count
    getReactionCount: build.query<ReactionCount, number | string>({
      query: (ideaId) => ({
        url: `/api/Reactions/idea/${ideaId}/count`,
        method: 'GET',
      }),
      providesTags: (_, __, ideaId) => [{ type: 'ReactionCount', id: ideaId }],
    }),
  }),
})

export const {
  useToggleReactionMutation,
  useRemoveReactionMutation,
  useGetReactionCountQuery,
} = reactionsApi
