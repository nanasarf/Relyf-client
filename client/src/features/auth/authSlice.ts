import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type User = { id: string; email: string } | null

interface AuthState {
  token: string | null
  user: User
}

const initialState: AuthState = {
  token: localStorage.getItem('relyf_token'),
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token
      state.user = action.payload.user
      localStorage.setItem('relyf_token', action.payload.token)
    },
    signOut: (state) => {
      state.token = null
      state.user = null
      localStorage.removeItem('relyf_token')
    },
  },
})

export const { setCredentials, signOut } = authSlice.actions
export default authSlice.reducer
