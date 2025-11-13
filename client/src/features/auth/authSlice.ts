import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type User = { id: string; email: string } | null

interface AuthState {
  token: string | null
  user: User
}

const initialState: AuthState = {
  token: localStorage.getItem('relyf_token'),
  user: (() => {
    const savedUser = localStorage.getItem('relyf_user');
    return savedUser ? JSON.parse(savedUser) : null;
  })(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token
      state.user = action.payload.user
      localStorage.setItem('relyf_token', action.payload.token)
      if (action.payload.user) {
        localStorage.setItem('relyf_user', JSON.stringify(action.payload.user))
      }
    },
    signOut: (state) => {
      state.token = null
      state.user = null
      localStorage.removeItem('relyf_token')
      localStorage.removeItem('relyf_user')
    },
  },
})

export const { setCredentials, signOut } = authSlice.actions
export default authSlice.reducer
