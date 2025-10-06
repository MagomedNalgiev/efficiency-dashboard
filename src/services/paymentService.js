import { PAYMENT_CONFIG, initYooKassaPayment } from '../config/payment'
import { trackEvent } from '../utils/analytics'
import { supabaseAuthService } from './supabaseAuthService'

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

      // Активируем подписку через Supabase
      const updatedUser = await this.activateSubscription(userId, planId, billingPeriod)

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

      return { success: true, paymentData, updatedUser }

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

  // ОБНОВЛЕННЫЙ МЕТОД с интеграцией Supabase
  async activateSubscription(userId, planId, billingPeriod) {
    try {
      console.log('Активация подписки для пользователя:', userId, planId, billingPeriod)

      // Обновляем план в Supabase через наш AuthService
      const updatedUser = await supabaseAuthService.updateUserPlan(userId, planId, billingPeriod)

      console.log('Подписка активирована:', updatedUser)

      // Дополнительно можем отправить email уведомление
      try {
        // Если у вас настроен emailService
        // await emailService.sendPurchaseConfirmation(updatedUser, {
        //   planName: planId === 'PRO' ? 'Профессиональный' : 'Корпоративный',
        //   billingPeriod
        // }, paymentData.amount)
        console.log('Email уведомление будет отправлено')
      } catch (emailError) {
        console.warn('Failed to send purchase confirmation email:', emailError)
        // Не останавливаем процесс, если email не отправился
      }

      return updatedUser

    } catch (error) {
      console.error('Error activating subscription:', error)
      throw new Error('Не удалось активировать подписку: ' + error.message)
    }
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

  async handlePaymentFailure(paymentId, error) {
    const pendingPayment = this.pendingPayments.get(paymentId)

    if (pendingPayment) {
      trackEvent('payment_failed', {
        payment_id: paymentId,
        plan_id: pendingPayment.planId,
        error: error,
        user_id: pendingPayment.userId
      })
    }

    // Очищаем pending payment
    this.pendingPayments.delete(paymentId)
    localStorage.removeItem('pending_payment')
  }

  getPendingPayment(paymentId) {
    return this.pendingPayments.get(paymentId)
  }

  // Восстановление pending payment после перезагрузки
  restorePendingPayment() {
    const stored = localStorage.getItem('pending_payment')
    if (stored) {
      try {
        const payment = JSON.parse(stored)
        this.pendingPayments.set(payment.paymentId, payment)
        return payment
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

  // Дополнительный метод для получения истории платежей пользователя
  async getUserPaymentHistory(userId) {
    try {
      // В будущем можно добавить таблицу payments в Supabase
      // и получать историю платежей пользователя

      // Пока возвращаем пустой массив
      return []
    } catch (error) {
      console.error('Error fetching payment history:', error)
      return []
    }
  }

  // Проверка активной подписки пользователя
  async checkSubscriptionStatus(userId) {
    try {
      const user = await supabaseAuthService.getCurrentUser()
      if (!user || user.id !== userId) {
        return { active: false, plan: 'free' }
      }

      const now = new Date()
      const expiresAt = user.subscriptionExpires ? new Date(user.subscriptionExpires) : null

      const isActive = user.plan !== 'free' && (!expiresAt || expiresAt > now)

      return {
        active: isActive,
        plan: user.plan,
        expiresAt: user.subscriptionExpires,
        calculationsCount: user.calculationsCount
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
      return { active: false, plan: 'free' }
    }
  }

  // Отмена подписки (для будущего функционала)
  async cancelSubscription(userId) {
    try {
      // Обновляем статус подписки в Supabase
      await supabaseAuthService.updateUserPlan(userId, 'FREE', 'monthly')

      trackEvent('subscription_cancelled', {
        user_id: userId
      })

      return { success: true }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      throw error
    }
  }
}

export const paymentService = new PaymentService()
