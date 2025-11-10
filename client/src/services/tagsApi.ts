import { baseApi } from './baseApi'
import type { Tag, AttachTagRequest } from '../types/tags'
import type { Idea } from '../types/ideas'

export const tagsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // GET /api/Tags
    getAllTags: build.query<Tag[], void>({
      query: () => ({
        url: '/api/Tags',
        method: 'GET',
      }),
      providesTags: [{ type: 'Tag', id: 'LIST' }],
    }),

    // POST /api/Tags/attach
    attachTagToIdea: build.mutation<void, AttachTagRequest>({
      query: (body) => ({
        url: '/api/Tags/attach',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_, __, arg) => [{ type: 'Idea', id: arg.ideaId }],
    }),

    // GET /api/Tags/{tag}/ideas
    getIdeasByTag: build.query<Idea[], string>({
      query: (tag) => ({
        url: `/api/Tags/${tag}/ideas`,
        method: 'GET',
      }),
      providesTags: [{ type: 'Ideas', id: 'BY_TAG' }],
    }),
  }),
})

export const {
  useGetAllTagsQuery,
  useAttachTagToIdeaMutation,
  useGetIdeasByTagQuery,
} = tagsApi
