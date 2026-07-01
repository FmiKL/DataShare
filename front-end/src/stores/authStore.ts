import { create } from 'zustand'

const AUTH_TOKEN_KEY = 'datashare.authToken'

type AuthState = {
  clearToken: () => void
  setToken: (token: string) => void
  token: string | null
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(AUTH_TOKEN_KEY),
  setToken: (token) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    set({ token })
  },
  clearToken: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    set({ token: null })
  },
}))
