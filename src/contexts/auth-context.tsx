'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, AuthState } from '@/types'
import { db } from '@/lib/db'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name?: string) => Promise<boolean>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  useEffect(() => {
    // Check for existing session on mount
    checkAuthSession()
  }, [])

  const checkAuthSession = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false }))
        return
      }

      // Validate token with backend
      const response = await fetch('/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setState({
          user: userData.user,
          isLoading: false,
          isAuthenticated: true
        })
      } else {
        localStorage.removeItem('auth_token')
        setState(prev => ({ ...prev, isLoading: false }))
      }
    } catch (error) {
      console.error('Auth session check failed:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('auth_token', data.token)
        
        setState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true
        })
        
        return true
      } else {
        const error = await response.json()
        console.error('Login failed:', error.message)
        setState(prev => ({ ...prev, isLoading: false }))
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      setState(prev => ({ ...prev, isLoading: false }))
      return false
    }
  }

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('auth_token', data.token)
        
        setState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true
        })
        
        return true
      } else {
        const error = await response.json()
        console.error('Registration failed:', error.message)
        setState(prev => ({ ...prev, isLoading: false }))
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      setState(prev => ({ ...prev, isLoading: false }))
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    })
  }

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return false

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setState(prev => ({
          ...prev,
          user: prev.user ? { ...prev.user, ...updatedUser } : null
        }))
        return true
      }
      return false
    } catch (error) {
      console.error('Profile update error:', error)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      updateProfile
    }}>
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