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
      invalidatesTags: [{ type: 'Projects', id: 'LIST' }],
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
  }),
})

export const { useGetProjectByIdQuery, useCreateProjectMutation, useUpsertStepsMutation, useUpdateStatusMutation, useGetMyProjectsQuery } = projectsApi
