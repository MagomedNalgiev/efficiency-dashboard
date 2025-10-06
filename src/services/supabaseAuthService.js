import { supabaseApi } from '../config/supabase'
import { trackEvent } from '../utils/analytics'

class SupabaseAuthService {
  constructor() {
    this.currentUser = null
    this.sessionKey = 'metricspace_session'
  }

  // ИСПРАВЛЕННАЯ нормализация email
  normalizeEmail(email) {
    // Проверяем, что email действительно строка
    if (!email || typeof email !== 'string') {
      console.error('normalizeEmail: получен не-строковый email:', email, typeof email)
      return ''
    }
    return email.trim().toLowerCase()
  }

  // Регистрация пользователя
  async register(userData) {
    const { name, email, password } = userData

    try {
      // Проверяем входные данные
      if (!name || !email || !password) {
        throw new Error('Все поля обязательны для заполнения')
      }

      // Нормализуем email
      const normalizedEmail = this.normalizeEmail(email)

      if (!normalizedEmail) {
        throw new Error('Некорректный email адрес')
      }

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
        name: String(name).trim(),
        email: normalizedEmail,
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

  // ИСПРАВЛЕННАЯ авторизация пользователя
  async login(email, password) {
    try {
      console.log('=== НАЧАЛО АВТОРИЗАЦИИ ===')
      console.log('Тип email:', typeof email, 'Значение:', email)
      console.log('Тип password:', typeof password)

      // Проверяем входные данные
      if (!email || !password) {
        throw new Error('Email и пароль обязательны')
      }

      // Приводим к строке и нормализуем email
      const emailString = String(email)
      const passwordString = String(password)

      const normalizedEmail = this.normalizeEmail(emailString)

      if (!normalizedEmail) {
        throw new Error('Некорректный email адрес')
      }

      console.log('Нормализованный email для поиска:', normalizedEmail)

      // Ищем пользователя по email
      const userRecord = await this.findUserByEmail(normalizedEmail)
      if (!userRecord) {
        console.error('Пользователь не найден в базе данных:', normalizedEmail)
        throw new Error('Пользователь не найден')
      }

      console.log('Найден пользователь:', userRecord.name, 'ID:', userRecord.id)

      // Проверяем пароль
      const isPasswordValid = await this.verifyPassword(
        passwordString,
        userRecord.password_hash
      )

      if (!isPasswordValid) {
        console.error('Неверный пароль для пользователя:', normalizedEmail)
        throw new Error('Неверный пароль')
      }

      console.log('Пароль верен, авторизуем пользователя')

      // Обновляем дату последнего входа
      try {
        await supabaseApi.update('user_profiles', userRecord.id, {
          updated_at: new Date().toISOString()
        })
      } catch (updateError) {
        console.warn('Не удалось обновить время последнего входа:', updateError)
        // Не прерываем авторизацию из-за этой ошибки
      }

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

      console.log('=== АВТОРИЗАЦИЯ УСПЕШНА ===')
      return user
    } catch (error) {
      console.error('=== ОШИБКА АВТОРИЗАЦИИ ===')
      console.error('Login error:', error)
      throw error
    }
  }

  // ИСПРАВЛЕННЫЙ поиск пользователя по email
  async findUserByEmail(email) {
    try {
      console.log('=== ПОИСК ПОЛЬЗОВАТЕЛЯ ===')

      // Проверяем и нормализуем email
      const emailString = String(email || '')
      const normalizedEmail = this.normalizeEmail(emailString)

      if (!normalizedEmail) {
        console.error('Пустой или некорректный email для поиска')
        return null
      }

      console.log('Поиск пользователя по email:', normalizedEmail)

      // Прямой запрос к API
      const url = `https://dthvqbccujkjazconmos.supabase.co/rest/v1/user_profiles?email=eq.${encodeURIComponent(normalizedEmail)}&select=*`

      console.log('URL запроса:', url)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aHZxYmNjdWpramF6Y29ubW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NzQxNzcsImV4cCI6MjA3NTM1MDE3N30.Xj9P_FOlIn_b0P2IOWnaSPOZqplHWjAA5xwnzJXi3i4',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aHZxYmNjdWpramF6Y29ubW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NzQxNzcsImV4cCI6MjA3NTM1MDE3N30.Xj9P_FOlIn_b0P2IOWnaSPOZqplHWjAA5xwnzJXi3i4',
          'Accept': 'application/json'
        }
      })

      console.log('Статус ответа:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Ошибка запроса:', response.status, errorText)
        return null
      }

      const data = await response.json()
      console.log('Результат поиска:', data)

      if (!data || !Array.isArray(data) || data.length === 0) {
        console.log('Пользователь не найден в базе')
        return null
      }

      const user = data[0]
      console.log('Пользователь найден:', user.name, user.email)
      return user

    } catch (error) {
      console.error('Исключение при поиске пользователя:', error)
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
    const passwordString = String(password)
    const encoder = new TextEncoder()
    const data = encoder.encode(passwordString + 'metricspace_salt_2025_supabase')
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

      // Проверяем,
