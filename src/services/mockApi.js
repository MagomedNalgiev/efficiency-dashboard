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

    const token = `mock_token_${newUser.id}`

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

    const token = `mock_token_${user.id}`

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
}

export const mockApiService = new MockApiService()
