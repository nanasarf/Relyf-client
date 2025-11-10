// src/services/authApi.ts
import { baseApi } from './baseApi'

// Backend controllers are under /api, default to the full path unless overridden by env
const LOGIN_URL = import.meta.env.VITE_LOGIN_PATH ?? '/api/Auth/login'
const REGISTER_URL = import.meta.env.VITE_REGISTER_PATH ?? '/api/Auth/register'

type LoginRequest = { email: string; password: string }
type LoginResponse = { token: string; user?: { id: string; email: string } }

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: LOGIN_URL, method: 'POST', body }),
    }),
    register: build.mutation<LoginResponse, { email: string; password: string }>({
      query: (body) => ({ url: REGISTER_URL, method: 'POST', body }),
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation } = authApi
