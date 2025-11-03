import { baseApi } from './baseApi'

type LoginRequest = { email: string; password: string }  // adjust if your API uses 'username'
type LoginResponse = { token: string; user?: { id: string; email: string } } // flexible

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: '/Auth/login',   // baseUrl '/api' + this => '/api/Auth/login'
        method: 'POST',
        body,
      }),
    }),
    register: build.mutation<LoginResponse, { email: string; password: string }>({
      query: (body) => ({
        url: '/Auth/register',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation } = authApi
