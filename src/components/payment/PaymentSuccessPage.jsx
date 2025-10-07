import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabaseAuthService } from '../../services/supabaseAuthService'
import { trackEvent } from '../../utils/analytics'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, updateUserPlan } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [paymentInfo, setPaymentInfo] = useState(null)

  useEffect(() => {
    const handlePaymentResult = async () => {
      try {
        const planId = searchParams.get('plan')
        const billingPeriod = searchParams.get('period')
        const paymentId = searchParams.get('payment_id')
        const isDemo = searchParams.get('demo') === 'true'

        if (!planId || !billingPeriod) {
          throw new Error('Недостающие параметры платежа')
        }

        if (isDemo) {
          // Демо режим - просто обновляем план
          console.log('Демо платеж - обновляем план пользователя')
          await handleSuccessfulPayment(planId, billingPeriod, paymentId)
          return
        }

        if (!paymentId) {
          throw new Error('ID платежа не найден')
        }

        // Проверяем статус платежа через backend
        console.log('Проверяем статус платежа:', paymentId)
        const paymentStatus = await checkPaymentStatus(paymentId)

        if (paymentStatus.status === 'succeeded') {
          await handleSuccessfulPayment(planId, billingPeriod, paymentId)
        } else {
          throw new Error(`Платеж не завершен. Статус: ${paymentStatus.status}`)
        }

      } catch (error) {
        console.error('Ошибка обработки результата платежа:', error)
        setError(error.message)
        setIsLoading(false)
      }
    }

    handlePaymentResult()
  }, [searchParams, user, updateUserPlan])

  const checkPaymentStatus = async (paymentId) => {
    try {
      const response = await fetch(`/api/payments/status/${paymentId}`)
      if (!response.ok) {
        throw new Error('Ошибка проверки статуса платежа')
      }
      return await response.json()
    } catch (error) {
      console.error('Ошибка проверки статуса:', error)
      throw error
    }
  }

  const handleSuccessfulPayment = async (planId, billingPeriod, paymentId) => {
    try {
      if (!user) {
        throw new Error('Пользователь не авторизован')
      }

      console.log('Обновляем план пользователя:', { planId, billingPeriod })

      // Обновляем план пользователя в базе данных
      await supabaseAuthService.updateUserPlan(user.id, planId, billingPeriod)

      // Обновляем состояние пользователя в контексте
      await updateUserPlan(planId, billingPeriod)

      setPaymentInfo({
        planId: planId.toUpperCase(),
        billingPeriod,
        paymentId
      })

      setIsSuccess(true)

      // Аналитика
      trackEvent('payment_success', {
        plan_id: planId,
        billing_period: billingPeriod,
        user_id: user.id,
        payment_id: paymentId
      })

      console.log('План успешно обновлен')

    } catch (error) {
      console.error('Ошибка обновления плана:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const getPlanName = (planId) => {
    switch(planId) {
      case 'PRO': return 'Профессиональный'
      case 'ENTERPRISE': return 'Корпоративный'
      default: return planId
    }
  }

  const getBillingPeriodName = (period) => {
    return period === 'yearly' ? 'Годовая' : 'Месячная'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Обрабатываем платеж...
        </h2>
        <p className="text-gray-600">Пожалуйста, подождите</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ошибка платежа
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/pricing')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Попробовать еще раз
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Вернуться в панель
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Оплата прошла успешно!
          </h2>
          <p className="text-gray-600 mb-4">
            Ваша подписка успешно активирована
          </p>

          {paymentInfo && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Детали подписки:</h3>
              <p className="text-sm text-gray-600">
                <strong>План:</strong> {getPlanName(paymentInfo.planId)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Период:</strong> {getBillingPeriodName(paymentInfo.billingPeriod)}
              </p>
              {paymentInfo.paymentId && (
                <p className="text-sm text-gray-600">
                  <strong>ID платежа:</strong> {paymentInfo.paymentId}
                </p>
              )}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Перейти к панели управления
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
