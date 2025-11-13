// src/services/authApi.ts
import { baseApi } from './baseApi'

// Backend controllers are under /api, default to the full path unless overridden by env
const LOGIN_URL = import.meta.env.VITE_LOGIN_PATH ?? '/api/Auth/login'
const REGISTER_URL = import.meta.env.VITE_REGISTER_PATH ?? '/api/Auth/register'

type LoginRequest = { email: string; password: string }
type RegisterRequest = { 
  email: string; 
  password: string;
  userName: string;
  displayName: string; 
  countryCode: string 
}
type LoginResponse = { token: string; user?: { id: string; email: string; userName?: string; displayName?: string } }

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: LOGIN_URL, method: 'POST', body }),
    }),
    register: build.mutation<LoginResponse, RegisterRequest>({
      query: (body) => ({ url: REGISTER_URL, method: 'POST', body }),
    }),
    // Check if username is available
    checkUsername: build.query<{ available: boolean; message?: string }, string>({
      query: (userName) => ({ url: `/api/Users/check-username/${userName}`, method: 'GET' }),
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation, useLazyCheckUsernameQuery } = authApi
