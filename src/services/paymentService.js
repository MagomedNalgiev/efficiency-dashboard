import { PAYMENT_CONFIG, initYooKassaPayment } from '../config/payment'
import { trackEvent } from '../utils/analytics'

class PaymentService {
  constructor() {
    this.pendingPayments = new Map()
  }

  async initiatePurchase(planId, billingPeriod, userEmail, userId) {
    return new Promise((resolve, reject) => {
      try {
        trackEvent('payment_initiated', {
          plan_id: planId,
          billing_period: billingPeriod,
          user_id: userId,
          demo_mode: PAYMENT_CONFIG.demoMode
        })

        // Сохраняем информацию о платеже
        const paymentInfo = {
          planId,
          billingPeriod,
          userEmail,
          userId,
          timestamp: Date.now()
        }

        // Сохраняем в localStorage для восстановления после редиректа
        localStorage.setItem('pending_payment', JSON.stringify(paymentInfo))

        // Функции обратного вызова
        const onSuccess = (payment) => {
          trackEvent('payment_widget_success', {
            plan_id: planId,
            billing_period: billingPeriod,
            payment_id: payment.id,
            user_id: userId
          })
          resolve(payment)
        }

        const onError = (error) => {
          trackEvent('payment_widget_error', {
            plan_id: planId,
            billing_period: billingPeriod,
            error: error,
            user_id: userId
          })
          reject(new Error(error))
        }

        // Инициируем платеж через ЮKassa
        initYooKassaPayment(
          planId,
          billingPeriod,
          userEmail,
          onSuccess,
          onError
        )

      } catch (error) {
        trackEvent('payment_initiation_error', {
          plan_id: planId,
          billing_period: billingPeriod,
          error: error.message,
          user_id: userId
        })
        reject(error)
      }
    })
  }

  async handlePaymentSuccess(paymentId, planId, billingPeriod, userId) {
    try {
      // В реальном приложении здесь будет верификация платежа через ваш сервер

      // В demo режиме - используем данные из localStorage
      let paymentData = null

      if (PAYMENT_CONFIG.demoMode) {
        const demoPayment = localStorage.getItem('demo_payment')
        if (demoPayment) {
          paymentData = JSON.parse(demoPayment)
        }
      } else {
        // Для реального режима - здесь будет запрос к вашему серверу для верификации
        paymentData = await this.verifyPayment(paymentId)
      }

      if (!paymentData) {
        throw new Error('Не удалось верифицировать платеж')
      }

      // Активируем подписку
      await this.activateSubscription(userId, planId, billingPeriod)

      trackEvent('payment_success', {
        payment_id: paymentId,
        plan_id: planId,
        billing_period: billingPeriod,
        user_id: userId,
        amount: paymentData.amount
      })

      // Очищаем временные данные
      localStorage.removeItem('pending_payment')
      localStorage.removeItem('demo_payment')

      return { success: true, paymentData }

    } catch (error) {
      trackEvent('payment_verification_failed', {
        payment_id: paymentId,
        error: error.message,
        user_id: userId
      })
      throw error
    }
  }

  async verifyPayment(paymentId) {
    // В реальном приложении здесь будет запрос к вашему серверу
    // который проверит статус платежа в ЮKassa

    // Пока возвращаем mock данные
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'succeeded',
          amount: 990.00,
          id: paymentId
        })
      }, 500)
    })
  }

  async activateSubscription(userId, planId, billingPeriod) {
    // Обновляем план пользователя в localStorage
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}')

    const updatedUser = {
      ...currentUser,
      plan: planId.toLowerCase(),
      planDetails: {
        id: planId,
        billingPeriod,
        activatedAt: new Date().toISOString(),
        expiresAt: this.calculateExpirationDate(billingPeriod),
        status: 'active'
      }
    }

    localStorage.setItem('user_profile', JSON.stringify(updatedUser))

    // Обновляем также mock пользователей
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]')
    const userIndex = mockUsers.findIndex(u => u.id === userId)
    if (userIndex >= 0) {
      mockUsers[userIndex] = updatedUser
      localStorage.setItem('mock_users', JSON.stringify(mockUsers))
    }

    return updatedUser
  }

  calculateExpirationDate(billingPeriod) {
    const now = new Date()

    if (billingPeriod === 'yearly') {
      now.setFullYear(now.getFullYear() + 1)
    } else {
      now.setMonth(now.getMonth() + 1)
    }

    return now.toISOString()
  }

  // Восстановление pending payment после перезагрузки
  restorePendingPayment() {
    const stored = localStorage.getItem('pending_payment')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        localStorage.removeItem('pending_payment')
      }
    }
    return null
  }

  getDemoPayment() {
    const stored = localStorage.getItem('demo_payment')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        localStorage.removeItem('demo_payment')
      }
    }
    return null
  }
}

export const paymentService = new PaymentService()
