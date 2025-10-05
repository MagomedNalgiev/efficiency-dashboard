// Конфигурация API
import { mockApiService } from './mockApi'

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || !import.meta.env.VITE_API_URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class ApiService {
  constructor() {
    this.token = localStorage.getItem('auth_token')
  }

  // Базовый метод для запросов
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Методы аутентификации
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (response.token) {
      this.token = response.token
      localStorage.setItem('auth_token', response.token)
    }

    return response
  }

  async logout() {
    this.token = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_profile')
  }

  // Методы пользователя
  async getProfile() {
    return this.request('/user/profile')
  }

  async updateProfile(profileData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  // Методы для работы с данными калькуляторов
  async saveCalculatorData(calculatorType, data) {
    return this.request('/data/save', {
      method: 'POST',
      body: JSON.stringify({
        calculator_type: calculatorType,
        data: data,
      }),
    })
  }

  async getCalculatorData(calculatorType) {
    return this.request(`/data/${calculatorType}`)
  }

  async getAllUserData() {
    return this.request('/data/all')
  }

  // Методы подписок (для будущего)
  async getSubscriptionInfo() {
    return this.request('/subscription/info')
  }

  async updateSubscription(planId) {
    return this.request('/subscription/update', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId }),
    })
  }
}

// Экспортируем нужный сервис (ТОЛЬКО ОДИН ЭКСПОРТ!)
export const apiService = USE_MOCK_API ? mockApiService : new ApiService()
export default apiService
