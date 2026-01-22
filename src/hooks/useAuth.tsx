import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User, AuthState } from '../types'
import { users } from '../data'

interface AuthContextType extends AuthState {
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    currentUser: null
  })

  const login = () => {
    const demoUser = users.find(u => u.id === 'current-user') as User
    setAuthState({
      isAuthenticated: true,
      currentUser: demoUser
    })
  }

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      currentUser: null
    })
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
