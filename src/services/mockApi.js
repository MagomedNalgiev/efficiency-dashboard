// Заглушка для демонстрации без бэкенда
class MockApiService {
  constructor() {
    this.users = JSON.parse(localStorage.getItem('mock_users') || '[]')
    this.currentUser = JSON.parse(localStorage.getItem('mock_current_user') || 'null')
  }

  async register(userData) {
    // Симуляция задержки сервера
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Проверяем, существует ли пользователь
    const existingUser = this.users.find(u => u.email === userData.email)
    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует')
    }

    // Создаем нового пользователя
    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      createdAt: new Date().toISOString(),
      plan: 'free' // По умолчанию бесплатный план
    }

    this.users.push(newUser)
    localStorage.setItem('mock_users', JSON.stringify(this.users))
    localStorage.setItem('mock_current_user', JSON.stringify(newUser))

    const token = `mock_token_${newUser.id}`

    // ИСПРАВЛЕНИЕ: Сохраняем токен в localStorage
    localStorage.setItem('auth_token', token)

    return {
      user: newUser,
      token: token
    }
  }

  async login(credentials) {
    await new Promise(resolve => setTimeout(resolve, 800))

    const user = this.users.find(u => u.email === credentials.email)
    if (!user) {
      throw new Error('Пользователь не найден')
    }

    // В реальном приложении здесь была бы проверка пароля
    if (credentials.password.length < 6) {
      throw new Error('Неверный пароль')
    }

    localStorage.setItem('mock_current_user', JSON.stringify(user))
    this.currentUser = user

    const token = `mock_token_${user.id}`

    // ИСПРАВЛЕНИЕ: Сохраняем токен в localStorage
    localStorage.setItem('auth_token', token)

    return {
      user: user,
      token: token
    }
  }

  async getProfile() {
    await new Promise(resolve => setTimeout(resolve, 300))

    if (!this.currentUser) {
      throw new Error('Не авторизован')
    }

    return this.currentUser
  }

  async logout() {
    // ИСПРАВЛЕНИЕ: Удаляем токен при выходе
    localStorage.removeItem('auth_token')
    localStorage.removeItem('mock_current_user')
    this.currentUser = null
    return { success: true }
  }

  // ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ для совместимости:
  async updateProfile(profileData) {
    await new Promise(resolve => setTimeout(resolve, 500))

    if (!this.currentUser) {
      throw new Error('Не авторизован')
    }

    const updatedUser = { ...this.currentUser, ...profileData }
    localStorage.setItem('mock_current_user', JSON.stringify(updatedUser))
    this.currentUser = updatedUser

    // Обновляем в списке пользователей
    const userIndex = this.users.findIndex(u => u.id === updatedUser.id)
    if (userIndex >= 0) {
      this.users[userIndex] = updatedUser
      localStorage.setItem('mock_users', JSON.stringify(this.users))
    }

    return updatedUser
  }

  async saveCalculatorData(calculatorType, data) {
    await new Promise(resolve => setTimeout(resolve, 300))

    const key = `mock_calculator_${calculatorType}`
    localStorage.setItem(key, JSON.stringify(data))

    return { success: true }
  }

  async getCalculatorData(calculatorType) {
    await new Promise(resolve => setTimeout(resolve, 200))

    const key = `mock_calculator_${calculatorType}`
    const data = localStorage.getItem(key)

    return data ? JSON.parse(data) : null
  }

  async getAllUserData() {
    await new Promise(resolve => setTimeout(resolve, 500))

    const allData = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('mock_calculator_')) {
        const calculatorType = key.replace('mock_calculator_', '')
        allData[calculatorType] = JSON.parse(localStorage.getItem(key))
      }
    }

    return allData
  }
}

export const mockApiService = new MockApiService()
