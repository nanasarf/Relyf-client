import { baseApi } from "./baseApi";
import type { Idea } from "../types/ideas";

// Unified types (keep close to server DTOs)
export type IdeaStats = {
  id: number | string;
  views?: number;
  saves?: number;
  reactions?: number;
};

export type GenerateIdeaRequest = {
  promptText: string;
  itemId?: number | null;
  model?: string;
  temperature?: number;
  topP?: number;
  titleHint?: string;
};
export type GenerateIdeaResponse = {
  ideaId: number;
  title: string;
  ideaText: string;
  coherePromptId: number;
  itemId?: number | null;
  userId: number;
};

// Paged shape returned by API (/api/ideas/search)
export type Paged<T> = {
  results: T[];
  total: number;
  skip: number;
  take: number;
};

type GetIdeasParams = { skip?: number; take?: number };
type GetAiIdeasParams = { item: string; skip?: number; take?: number };
type GetAiIdeasResponse = { ideas: string };

// Inject endpoints into the existing baseApi so the slice reducer & middleware are already registered.
export const ideasApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // List ideas (search without filters)
    getIdeas: builder.query<Paged<Idea>, GetIdeasParams | void>({
      query: (params) => ({
        url: "/api/ideas/search",
        method: "GET",
        params: {
          skip: params?.skip ?? 0,
          take: params?.take ?? 20,
        },
      }),
      providesTags: (result) => {
        const items: Idea[] = result?.results ?? [];
        return [
          ...items.map((i) => ({ type: "Idea" as const, id: i.id })),
          { type: "Ideas" as const, id: "LIST" },
        ];
      },
    }),

    // Get AI-generated ideas for an item
    getAiIdeas: builder.query<GetAiIdeasResponse, GetAiIdeasParams>({
      query: ({ item, skip = 0, take = 12 }) => ({
        url: "/api/Ideas",
        method: "GET",
        params: { item, skip, take },
      }),
      providesTags: [{ type: "Ideas", id: "AI" }],
    }),

    // Single idea by id
    getIdeaById: builder.query<Idea, number | string>({
      query: (id) => ({ url: `/api/Ideas/${id}`, method: "GET" }),
      providesTags: (_, __, id) => [{ type: "Idea", id }],
    }),

    // Generate idea
    generateIdea: builder.mutation<GenerateIdeaResponse, GenerateIdeaRequest>({
      query: (body) => ({ url: "/api/Ideas/generate", method: "POST", body }),
      invalidatesTags: [
        { type: "Ideas", id: "LIST" },
        { type: "Top", id: "LIST" },
      ],
    }),

    // Filtered search
    searchIdeas: builder.query<Paged<Idea>, { query: string; skip?: number; take?: number }>({
      query: ({ query, skip = 0, take = 20 }) => ({
        url: "/api/ideas/search",
        method: "GET",
        params: { q: query, skip, take },
      }),
      providesTags: [{ type: "Ideas", id: "SEARCH" }],
    }),

    // Top ideas
    getTopIdeas: builder.query<Idea[], void>({
      query: () => ({ url: "/api/ideas/top", method: "GET" }),
      providesTags: [{ type: "Top", id: "LIST" }],
    }),

    // Stats for an idea
    getIdeaStats: builder.query<IdeaStats, number | string>({
      query: (id) => ({ url: `/api/ideas/${id}/stats`, method: "GET" }),
      providesTags: (_, __, id) => [{ type: "Stats", id }],
    }),
  }),
  overrideExisting: true, // ensure replacement if hot-reloaded
});

export const {
  useGetIdeasQuery,
  useGetAiIdeasQuery,
  useGetIdeaByIdQuery,
  useGenerateIdeaMutation,
  useSearchIdeasQuery,
  useGetTopIdeasQuery,
  useGetIdeaStatsQuery,
} = ideasApi;
