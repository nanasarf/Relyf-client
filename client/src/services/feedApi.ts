// src/services/feedApi.ts
import { baseApi } from "./baseApi";

export interface FeedItem {
  itemType: "project" | "idea";
  itemId: number;
  userId: number;
  userName: string;
  displayName: string;
  avatarUrl?: string;
  title: string;
  description?: string;
  ideaText?: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
  status?: string;
  ideaId?: number;
  aiIdeaId?: number;
  reactionCount: number;
  commentCount: number;
  saveCount: number;
  hasUserReacted: boolean;
  hasUserSaved: boolean;
}

export interface FeedResult {
  items: FeedItem[];
  total: number;
  skip: number;
  take: number;
}

export const feedApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeed: builder.query<FeedResult, { skip?: number; take?: number }>({
      query: ({ skip = 0, take = 20 }) => ({
        url: "/api/Feed",
        params: { skip, take },
      }),
      providesTags: ["Feed"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFeedQuery } = feedApi;
