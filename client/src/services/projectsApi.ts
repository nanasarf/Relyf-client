import { baseApi } from './baseApi'
import type { Project, CreateProjectRequest, CreateProjectResponse, Paged } from '../types/projects'

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // GET /api/Projects/{id}
    getProjectById: build.query<Project, number | string>({
      query: (id) => ({ url: `/api/Projects/${id}` }),
      providesTags: (_result, _err, id) => [{ type: 'Project', id }],
    }),

    // POST /api/Projects
    createProject: build.mutation<CreateProjectResponse, CreateProjectRequest>({
      query: (body) => ({ url: '/api/Projects', method: 'POST', body }),
      // invalidate possible lists once added
      invalidatesTags: (_result, _error, body) => [
        { type: 'Projects' as const, id: 'LIST' },
        { type: 'Projects' as const, id: 'FEED' }, // Invalidate feed when creating a project
        ...(body.userId ? [{ type: 'Projects' as const, id: `USER_${body.userId}` }] : []),
      ],
    }),

    // PUT /api/Projects/{id}/steps
    upsertSteps: build.mutation<void, { id: number; steps: string[] }>({
      query: ({ id, steps }) => ({
        url: `/api/Projects/${id}/steps`,
        method: 'PUT',
        body: { steps },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Project', id },
        { type: 'Projects', id: 'LIST' },
      ],
    }),

    // PATCH /api/Projects/{id}/status
    updateStatus: build.mutation<void, { id: number; status: 'draft' | 'in_progress' | 'completed' }>({
      query: ({ id, status }) => ({
        url: `/api/Projects/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Project', id },
        { type: 'Projects', id: 'LIST' },
      ],
    }),

    // DELETE /api/Projects/{id}
    deleteProject: build.mutation<void, number | string>({
      query: (id) => ({
        url: `/api/Projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Project', id },
        { type: 'Projects', id: 'LIST' },
        { type: 'Projects', id: 'FEED' },
      ],
    }),

    // GET /api/Projects (current user's projects)
    getMyProjects: build.query<Paged<Project>, { skip?: number; take?: number } | void>({
      query: (params) => ({
        url: '/api/Projects',
        params: { skip: params?.skip ?? 0, take: params?.take ?? 12 },
      }),
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems) => {
        // append-like merge for infinite scroll
        const merged = new Set<number>(currentCache.results.map(p => p.projectId));
        const appended = newItems.results.filter(p => !merged.has(p.projectId));
        currentCache.results.push(...appended);
        currentCache.total = newItems.total; // keep latest total
        currentCache.take = newItems.take;   // reflect last page size
        // skip remains as original; consumers track skip locally
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.skip !== previousArg?.skip || currentArg?.take !== previousArg?.take;
      },
      providesTags: [{ type: 'Projects', id: 'LIST' }],
    }),
    
    // GET /api/Projects (explore/community projects)
    // This endpoint mirrors /api/Projects but accepts an optional `excludeUserId` param
    // so the UI can request other users' projects for an Explore page.
    getExploreProjects: build.query<Paged<Project>, { skip?: number; take?: number; excludeUserId?: number } | void>({
      query: (params) => ({
        url: '/api/Projects',
        params: {
          skip: params?.skip ?? 0,
          take: params?.take ?? 12,
          // pass through excludeUserId when provided; backend can ignore if unsupported
          excludeUserId: params?.excludeUserId,
        },
      }),
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems) => {
        const merged = new Set<number>(currentCache.results.map((p) => p.projectId));
        const appended = newItems.results.filter((p) => !merged.has(p.projectId));
        currentCache.results.push(...appended);
        currentCache.total = newItems.total;
        currentCache.take = newItems.take;
      },
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.skip !== previousArg?.skip ||
          currentArg?.take !== previousArg?.take ||
          currentArg?.excludeUserId !== previousArg?.excludeUserId
        );
      },
      providesTags: [{ type: 'Projects', id: 'LIST' }],
    }),

    // NEW: GET /api/projects/user/{userId}?skip=&take=  (paged projects for a specific user)
    getUserProjects: build.query<Paged<Project>, { userId: number | string; skip?: number; take?: number }>({
      query: ({ userId, skip = 0, take = 20 }) => ({
        url: `/api/projects/user/${userId}`,
        params: { skip, take },
      }),
      providesTags: (result, _err, { userId }) => (
        result
          ? [
              ...result.results.map((p) => ({ type: 'Project' as const, id: p.projectId })),
              { type: 'Projects' as const, id: `USER_${userId}` },
            ]
          : [{ type: 'Projects' as const, id: `USER_${userId}` }]
      ),
    }),

    // GET feed projects for users the current user is following
    getFeedProjects: build.query<Project[], void>({
      queryFn: async (_arg, _queryApi, _extraOptions, baseQuery) => {
        try {
          // Get current user ID
          const userJson = localStorage.getItem('relyf_user');
          if (!userJson) {
            return { data: [] };
          }
          const currentUser = JSON.parse(userJson);
          const currentUserId = currentUser.id;

          // Fetch list of users the current user is following
          const followingResult = await baseQuery({
            url: `/api/Users/${currentUserId}/following`,
            method: 'GET',
          });

          if (followingResult.error) {
            return { error: followingResult.error };
          }

          const following = followingResult.data as Array<{ id: number | string; userId?: number | string; userName?: string; displayName?: string; avatarUrl?: string }>;

          if (!following || following.length === 0) {
            return { data: [] };
          }

          // Exclude current user from feed (avoid showing own projects here)
          // Normalize IDs to strings to avoid 1 vs "1" mismatches
          const currentIdStr = String(currentUserId);
          const filteredFollowing = following.filter((u) => {
            const uid = u.userId ?? u.id;
            return String(uid) !== currentIdStr;
          });

          if (filteredFollowing.length === 0) {
            return { data: [] };
          }

          // Fetch projects for each followed user
          // NOTE: Some backends ignore the `userId` query param on /api/Projects and
          // only support the dedicated route /api/projects/user/{userId}. Use the
          // specific route here to ensure we actually get that user's projects.
          const allProjectsPromises = filteredFollowing.map(async (user) => {
            const userId = user.userId || user.id;
            const projectsResult = await baseQuery({
              url: `/api/projects/user/${userId}`,
              method: 'GET',
              params: { skip: 0, take: 50 }, // fetch a reasonable page
            });

            if (projectsResult.error || !projectsResult.data) {
              return [] as Project[];
            }

            const projectsData = projectsResult.data as Project[] | Paged<Project>;
            const projects = Array.isArray(projectsData) ? projectsData : projectsData.results || [];

            // Attach user info to each project
            return projects.map((project) => ({
              ...project,
              // Add user metadata for display
              _userInfo: {
                userName: user.userName,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
              },
            }));
          });

          const allProjectsArrays = await Promise.all(allProjectsPromises);
          let allProjects = allProjectsArrays.flat();

          // Final defensive filter: only include projects from followed users and never self
          const followedIdSet = new Set(
            filteredFollowing.map((u) => String(u.userId ?? u.id))
          );
          allProjects = allProjects.filter(
            (p) => followedIdSet.has(String(p.userId)) && String(p.userId) !== currentIdStr
          );

          // Sort by createdAt (most recent first)
          allProjects.sort(
            (a, b) =>
              new Date(b.createdAtUtc).getTime() -
              new Date(a.createdAtUtc).getTime()
          );

          return { data: allProjects };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: [{ type: 'Projects', id: 'FEED' }],
    }),
  }),
})

export const {
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpsertStepsMutation,
  useUpdateStatusMutation,
  useDeleteProjectMutation,
  useGetMyProjectsQuery,
  useGetExploreProjectsQuery,
  useGetUserProjectsQuery,
  useGetFeedProjectsQuery,
} = projectsApi
