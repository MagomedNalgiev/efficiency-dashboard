import { supabaseApi } from '../config/supabase'
import { trackEvent } from '../utils/analytics'

class SupabaseAuthService {
  constructor() {
    this.currentUser = null
    this.sessionKey = 'metricspace_session'
  }

  // Нормализация email (убираем пробелы и приводим к нижнему регистру)
  normalizeEmail(email) {
    return email.trim().toLowerCase()
  }

  // Регистрация пользователя
  async register(userData) {
    const { name, email, password } = userData

    try {
      // Нормализуем email
      const normalizedEmail = this.normalizeEmail(email)

      console.log('Регистрация пользователя:', normalizedEmail)

      // Проверяем, не существует ли уже такой email
      const existingUser = await this.findUserByEmail(normalizedEmail)
      if (existingUser) {
        throw new Error('Пользователь с таким email уже существует')
      }

      // Хешируем пароль
      const passwordHash = await this.hashPassword(password)

      // Создаем пользователя в Supabase
      const newUser = await supabaseApi.insert('user_profiles', {
        name,
        email: normalizedEmail, // Сохраняем нормализованный email
        password_hash: passwordHash,
        plan: 'free',
        calculations_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      const user = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        plan: newUser.plan,
        subscriptionExpires: newUser.subscription_expires,
        calculationsCount: newUser.calculations_count
      }

      this.currentUser = user
      this.saveSession(user)

      trackEvent('user_registered', {
        user_id: user.id,
        email: user.email,
        source: 'supabase_rest'
      })

      return user
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  // Авторизация пользователя
  async login(email, password) {
    try {
      // Нормализуем email для поиска
      const normalizedEmail = this.normalizeEmail(email)

      console.log('Попытка входа:', normalizedEmail)

      // Ищем пользователя по email
      const userRecord = await this.findUserByEmail(normalizedEmail)
      if (!userRecord) {
        console.error('Пользователь не найден в базе данных:', normalizedEmail)
        throw new Error('Пользователь не найден')
      }

      console.log('Найден пользователь:', userRecord.name, 'ID:', userRecord.id)

      // Проверяем пароль
      const isPasswordValid = await this.verifyPassword(
        password,
        userRecord.password_hash
      )

      if (!isPasswordValid) {
        console.error('Неверный пароль для пользователя:', normalizedEmail)
        throw new Error('Неверный пароль')
      }

      console.log('Пароль верен, авторизуем пользователя')

      // Обновляем дату последнего входа
      await supabaseApi.update('user_profiles', userRecord.id, {
        updated_at: new Date().toISOString()
      })

      const user = {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        plan: userRecord.plan,
        subscriptionExpires: userRecord.subscription_expires,
        calculationsCount: userRecord.calculations_count
      }

      this.currentUser = user
      this.saveSession(user)

      trackEvent('user_logged_in', {
        user_id: user.id,
        email: user.email,
        plan: user.plan
      })

      console.log('Авторизация успешна:', user)
      return user
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // ИСПРАВЛЕННЫЙ поиск пользователя по email
  async findUserByEmail(email) {
    try {
      const normalizedEmail = this.normalizeEmail(email)

      console.log('Поиск пользователя по email:', normalizedEmail)

      // Делаем запрос без single:true, чтобы получить массив
      const users = await supabaseApi.select('user_profiles', {
        select: '*',
        eq: ['email', normalizedEmail]
      })

      console.log('Результат поиска пользователя:', users)

      // Если массив пустой - пользователь не найден
      if (!users || users.length === 0) {
        console.log('Пользователь не найден:', normalizedEmail)
        return null
      }

      // Возвращаем первого найденного пользователя
      const user = users[0]
      console.log('Пользователь найден:', user.name, user.email)
      return user

    } catch (error) {
      console.error('Ошибка поиска пользователя:', error)
      return null
    }
  }

  // Обновление плана пользователя (после оплаты)
  async updateUserPlan(userId, planId, billingPeriod) {
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + (billingPeriod === 'yearly' ? 12 : 1))

    const updatedUser = await supabaseApi.update('user_profiles', userId, {
      plan: planId.toLowerCase(),
      subscription_expires: expiresAt.toISOString(),
      calculations_count: 0, // Сброс при апгрейде
      updated_at: new Date().toISOString()
    })

    // Обновляем текущего пользователя
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser.plan = planId.toLowerCase()
      this.currentUser.subscriptionExpires = expiresAt.toISOString()
      this.currentUser.calculationsCount = 0
      this.saveSession(this.currentUser)
    }

    return updatedUser
  }

  // Увеличение счетчика расчетов
  async incrementCalculationsCount(userId) {
    const newCount = (this.currentUser?.calculationsCount || 0) + 1

    await supabaseApi.update('user_profiles', userId, {
      calculations_count: newCount,
      updated_at: new Date().toISOString()
    })

    // Обновляем локального пользователя
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser.calculationsCount = newCount
      this.saveSession(this.currentUser)
    }

    return newCount
  }

  // Хеширование пароля
  async hashPassword(password) {
    const encoder = new TextEncoder()
    const data = encoder.encode(password + 'metricspace_salt_2025_supabase')
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Проверка пароля
  async verifyPassword(password, hash) {
    const computedHash = await this.hashPassword(password)
    const isValid = computedHash === hash
    console.log('Проверка пароля:', isValid ? 'успешно' : 'неудачно')
    return isValid
  }

  // Сохранение сессии
  saveSession(user) {
    const sessionData = {
      user,
      timestamp: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 часа
    }
    localStorage.setItem(this.sessionKey, JSON.stringify(sessionData))
    console.log('Сессия сохранена:', user.email)
  }

  // Загрузка сессии
  loadSession() {
    const sessionData = localStorage.getItem(this.sessionKey)
    if (!sessionData) return null

    try {
      const session = JSON.parse(sessionData)

      // Проверяем, не истекла ли сессия
      if (Date.now() > session.expiresAt) {
        console.log('Сессия истекла')
        this.logout()
        return null
      }

      this.currentUser = session.user
      console.log('Сессия загружена:', session.user.email)
      return session.user
    } catch (error) {
      console.error('Session load error:', error)
      this.logout()
      return null
    }
  }

  // Выход
  logout() {
    console.log('Выход из системы')
    this.currentUser = null
    localStorage.removeItem(this.sessionKey)
  }

  // Получение текущего пользователя
  getCurrentUser() {
    return this.currentUser || this.loadSession()
  }

  // Проверка авторизации
  isAuthenticated() {
    return this.getCurrentUser() !== null
  }

  // ДОПОЛНИТЕЛЬНЫЙ метод для отладки
  async debugUserSearch(email) {
    try {
      console.log('=== ОТЛАДКА ПОИСКА ПОЛЬЗОВАТЕЛЯ ===')
      console.log('Исходный email:', email)

      const normalizedEmail = this.normalizeEmail(email)
      console.log('Нормализованный email:', normalizedEmail)

      // Попробуем найти всех пользователей
      const allUsers = await supabaseApi.select('user_profiles', {
        select: 'id,email,name'
      })

      console.log('Все пользователи в базе:', allUsers)

      // Попробуем найти конкретного пользователя
      const specificUser = await supabaseApi.select('user_profiles', {
        select: '*',
        eq: ['email', normalizedEmail]
      })

      console.log('Поиск конкретного пользователя:', specificUser)
      console.log('=== КОНЕЦ ОТЛАДКИ ===')

      return specificUser
    } catch (error) {
      console.error('Ошибка отладки:', error)
      return null
    }
  }
}

export const supabaseAuthService = new SupabaseAuthService()
