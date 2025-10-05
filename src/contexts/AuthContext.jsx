import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { apiService } from '../services/api'
import { trackEvent } from '../utils/analytics'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      }
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      }
    default:
      return state
  }
}

const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('auth_token'),
  loading: false,
  error: null,
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // ИСПРАВЛЕНО: Вынесли логику очистки в отдельную функцию
  const clearAuthData = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_profile')
    dispatch({ type: 'LOGOUT' })
  }

  // Проверка токена при загрузке
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userProfile = localStorage.getItem('user_profile')

    // ДОБАВИМ ОТЛАДКУ:
    console.log('AuthContext восстановление:', { token, userProfile })

    if (token && userProfile) {
      try {
        const user = JSON.parse(userProfile)
        console.log('Восстанавливаем пользователя:', user)
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        })
      } catch (error) {
        console.error('Error parsing user profile:', error)
        clearAuthData() // ИСПРАВЛЕНО: Используем локальную функцию
      }
    }
  }, []) // Пустой массив зависимостей

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' })

    try {
      const response = await apiService.login(credentials)

      console.log('Ответ login:', response) // ДОБАВИМ ОТЛАДКУ

      // Сохраняем профиль пользователя
      localStorage.setItem('user_profile', JSON.stringify(response.user))

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
        },
      })

      trackEvent('user_login', {
        user_id: response.user.id,
        login_method: 'email'
      })

      return response
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message,
      })
      throw error
    }
  }

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' })

    try {
      const response = await apiService.register(userData)

      console.log('Ответ register:', response) // ДОБАВИМ ОТЛАДКУ

      localStorage.setItem('user_profile', JSON.stringify(response.user))

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
        },
      })

      trackEvent('user_register', {
        user_id: response.user.id,
        registration_method: 'email'
      })

      return response
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message,
      })
      throw error
    }
  }

  const logout = async () => {
    await apiService.logout()
    clearAuthData()
    trackEvent('user_logout')
  }

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await apiService.updateProfile(profileData)
      localStorage.setItem('user_profile', JSON.stringify(updatedUser))
      dispatch({ type: 'SET_USER', payload: updatedUser })
      return updatedUser
    } catch (error) {
      console.error('Profile update failed:', error)
      throw error
    }
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
