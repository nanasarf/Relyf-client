// src/services/dataApi.ts
import { baseApi } from './baseApi'

const RESOURCE = import.meta.env.VITE_DATA_RESOURCE_PATH ?? '/ideas'

export interface Item {
  id: number
  title?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

// If your API returns a wrapper (e.g., { items: [...] }) we’ll adjust next step.
export const dataApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    list: b.query<Item[], void>({ query: () => ({ url: RESOURCE }) }),
    create: b.mutation<Item, Partial<Item>>({
      query: (body) => ({ url: RESOURCE, method: 'POST', body }),
    }),
    update: b.mutation<Item, Partial<Item> & { id: number }>({
      query: ({ id, ...body }) => ({ url: `${RESOURCE}/${id}`, method: 'PUT', body }),
    }),
    remove: b.mutation<{ success: boolean }, number>({
      query: (id) => ({ url: `${RESOURCE}/${id}`, method: 'DELETE' }),
    }),
  }),
})

export const { useListQuery, useCreateMutation, useUpdateMutation, useRemoveMutation } = dataApi
