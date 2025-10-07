import { createContext, useContext, useState, useEffect } from 'react'
import { supabaseAuthService } from '../services/supabaseAuthService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Загружаем сессию при старте
    const savedUser = supabaseAuthService.getCurrentUser()
    setUser(savedUser)
    setLoading(false)
  }, [])

  const register = async (userData) => {
    try {
      const newUser = await supabaseAuthService.register(userData)
      setUser(newUser)
      return newUser
    } catch (error) {
      throw error
    }
  }

  // ИСПРАВЛЕННЫЙ login - поддерживает оба формата вызова
  const login = async (emailOrFormData, password) => {
    try {
      let email, pwd

      // Проверяем, передан ли объект formData или отдельные параметры
      if (typeof emailOrFormData === 'object' && emailOrFormData !== null) {
        // Случай: login(formData)
        email = emailOrFormData.email
        pwd = emailOrFormData.password

        console.log('Login вызван с объектом formData:', { email, hasPassword: !!pwd })
      } else {
        // Случай: login(email, password)
        email = emailOrFormData
        pwd = password

        console.log('Login вызван с отдельными параметрами:', { email, hasPassword: !!pwd })
      }

      // Проверяем, что у нас есть email и пароль
      if (!email || !pwd) {
        throw new Error('Email и пароль обязательны')
      }

      console.log('Вызываем supabaseAuthService.login с:', email)

      const loggedUser = await supabaseAuthService.login(email, pwd)
      setUser(loggedUser)
      return loggedUser
    } catch (error) {
      console.error('AuthContext login error:', error)
      throw error
    }
  }

  const logout = () => {
    supabaseAuthService.logout()
    setUser(null)
  }

  const updateUserPlan = async (planId, billingPeriod) => {
    if (!user) return

    try {
      await supabaseAuthService.updateUserPlan(user.id, planId, billingPeriod)
      // Пользователь обновится автоматически в сервисе
      setUser(supabaseAuthService.getCurrentUser())
    } catch (error) {
      console.error('Failed to update user plan:', error)
      throw error
    }
  }

  const incrementCalculations = async () => {
    if (!user) return

    try {
      const newCount = await supabaseAuthService.incrementCalculationsCount(user.id)
      setUser({ ...user, calculationsCount: newCount })
      return newCount
    } catch (error) {
      console.error('Failed to increment calculations:', error)
    }
  }

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateUserPlan,
    incrementCalculations,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
