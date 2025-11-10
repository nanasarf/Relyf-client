import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./baseQuery";
import type { Idea } from "../types/ideas";

/** --- Types: adjust to your DTOs if needed --- */
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

export type Paged<T> = {
  results: T[];
  total: number;
  skip: number;
  take: number;
};

type GetIdeasParams = { skip?: number; take?: number };

export const ideasApi = createApi({
  reducerPath: "ideasApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Idea", "Ideas", "Stats", "Top"],
  endpoints: (builder) => ({
    /** GET /api/ideas/search (without filters = list all) */
    getIdeas: builder.query<Paged<Idea>, GetIdeasParams | void>({
      query: (params?: GetIdeasParams) => ({
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

    /** GET /api/Ideas/{id} */
    getIdeaById: builder.query<Idea, number | string>({
      query: (id) => ({ url: `/api/Ideas/${id}`, method: "GET" }),
      providesTags: (_, __, id) => [{ type: "Idea", id }],
    }),

    /** POST /api/Ideas/generate */
    generateIdea: builder.mutation<GenerateIdeaResponse, GenerateIdeaRequest>({
      query: (body) => ({ url: "/api/Ideas/generate", method: "POST", body }),
      invalidatesTags: [{ type: "Ideas", id: "LIST" }, { type: "Top", id: "LIST" }],
    }),

    /** GET /api/ideas/search?q={query} */
    searchIdeas: builder.query<Paged<Idea>, { query: string; skip?: number; take?: number }>({
      query: ({ query, skip = 0, take = 20 }) => ({
        url: "/api/ideas/search",
        method: "GET",
        params: { q: query, skip, take },
      }),
      providesTags: [{ type: "Ideas", id: "SEARCH" }],
    }),

    /** GET /api/ideas/top */
    getTopIdeas: builder.query<Idea[], void>({
      query: () => ({ url: "/api/ideas/top", method: "GET" }),
      providesTags: [{ type: "Top", id: "LIST" }],
    }),

    /** GET /api/ideas/{id}/stats */
    getIdeaStats: builder.query<IdeaStats, number | string>({
      query: (id) => ({ url: `/api/ideas/${id}/stats`, method: "GET" }),
      providesTags: (_, __, id) => [{ type: "Stats", id }],
    }),
  }),
});

export const {
  useGetIdeasQuery,
  useGetIdeaByIdQuery,
  useGenerateIdeaMutation,
  useSearchIdeasQuery,
  useGetTopIdeasQuery,
  useGetIdeaStatsQuery,
} = ideasApi;
