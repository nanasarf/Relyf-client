// src/services/usersApi.ts
import { baseApi } from './baseApi'
import type { 
  User, 
  UserProfile, 
  FollowRelationship,
  SearchUsersParams,
  SearchUsersResponse,
  FollowRequest
} from '../types/users'

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // GET /api/Users/search?query=...&skip=0&take=20
    searchUsers: build.query<SearchUsersResponse, SearchUsersParams>({
      query: (params) => ({
        url: '/api/Users/search',
        method: 'GET',
        params,
      }),
      transformResponse: (response: Record<string, unknown>) => {
        // Normalize backend response field names
        const results = (response.results as Record<string, unknown>[]) || [];
        return {
          ...response,
          results: results.map((user) => ({
            ...user,
            id: user.userId || user.id,
            createdAt: user.createdAtUtc || user.createdAt,
          })),
        } as SearchUsersResponse;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'Users', id: 'SEARCH' },
            ]
          : [{ type: 'Users', id: 'SEARCH' }],
    }),

    // GET /api/Users/{id}
    getUserProfile: build.query<UserProfile, number | string>({
      query: (id) => ({
        url: `/api/Users/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: Record<string, unknown>) => {
        // Normalize backend response field names
        return {
          ...response,
          id: response.userId || response.id,
          createdAt: response.createdAtUtc || response.createdAt,
        } as UserProfile;
      },
      providesTags: (_, __, id) => [{ type: 'User', id }],
    }),

    // GET /api/Users/{id}/followers
    getUserFollowers: build.query<User[], number | string>({
      query: (id) => ({
        url: `/api/Users/${id}/followers`,
        method: 'GET',
      }),
      transformResponse: (response: Record<string, unknown>[]) => {
        // Normalize backend response field names
        return response.map((user) => ({
          ...user,
          id: user.userId || user.id,
          createdAt: user.createdAtUtc || user.createdAt,
        })) as User[];
      },
      providesTags: (result, _, id) =>
        result
          ? [
              ...result.map(({ id: userId }) => ({ type: 'User' as const, id: userId })),
              { type: 'Follow', id: `FOLLOWERS_${id}` },
            ]
          : [{ type: 'Follow', id: `FOLLOWERS_${id}` }],
    }),

    // GET /api/Users/{id}/following
    getUserFollowing: build.query<User[], number | string>({
      query: (id) => ({
        url: `/api/Users/${id}/following`,
        method: 'GET',
      }),
      transformResponse: (response: Record<string, unknown>[]) => {
        // Normalize backend response field names
        return response.map((user) => ({
          ...user,
          id: user.userId || user.id,
          createdAt: user.createdAtUtc || user.createdAt,
        })) as User[];
      },
      providesTags: (result, _, id) =>
        result
          ? [
              ...result.map(({ id: userId }) => ({ type: 'User' as const, id: userId })),
              { type: 'Follow', id: `FOLLOWING_${id}` },
            ]
          : [{ type: 'Follow', id: `FOLLOWING_${id}` }],
    }),

    // POST /api/Follow
    followUser: build.mutation<FollowRelationship, FollowRequest>({
      query: (body) => ({
        url: '/api/Follow',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_, __, { followingId }) => [
        { type: 'User', id: followingId },
        { type: 'Follow', id: 'LIST' },
        { type: 'Follow', id: `FOLLOWERS_${followingId}` },
        { type: 'Projects', id: 'FEED' }, // Invalidate feed when following someone
      ],
    }),

    // DELETE /api/Follow/{followingId}
    unfollowUser: build.mutation<void, number | string>({
      query: (followingId) => ({
        url: `/api/Follow/${followingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, followingId) => [
        { type: 'User', id: followingId },
        { type: 'Follow', id: 'LIST' },
        { type: 'Follow', id: `FOLLOWERS_${followingId}` },
        { type: 'Projects', id: 'FEED' }, // Invalidate feed when unfollowing someone
      ],
    }),

    // GET /api/Follow/check/{followingId} - check if current user follows someone
    checkFollowStatus: build.query<{ isFollowing: boolean }, number | string>({
      query: (followingId) => ({
        url: `/api/Follow/check/${followingId}`,
        method: 'GET',
      }),
      providesTags: (_, __, followingId) => [{ type: 'Follow', id: followingId }],
    }),

    // PUT /api/Users/{id} - update user profile
    updateUserProfile: build.mutation<UserProfile, { id: number | string; profile: Partial<UserProfile> }>({
      query: ({ id, profile }) => ({
        url: `/api/Users/${id}`,
        method: 'PUT',
        body: profile,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'User', id }],
    }),
  }),
})

export const {
  useSearchUsersQuery,
  useLazySearchUsersQuery,
  useGetUserProfileQuery,
  useGetUserFollowersQuery,
  useGetUserFollowingQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useCheckFollowStatusQuery,
  useUpdateUserProfileMutation,
} = usersApi
