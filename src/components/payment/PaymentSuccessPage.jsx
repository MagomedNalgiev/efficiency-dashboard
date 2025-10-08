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

        console.log('Demo платеж - обновляем план пользователя')
        await handleSuccessfulPayment(planId, billingPeriod, paymentId)

      } catch (error) {
        console.error('Ошибка обработки результата платежа:', error)
        setError(error.message)
        setIsLoading(false)
      }
    }

    handlePaymentResult()
  }, [searchParams, user, updateUserPlan])

  const handleSuccessfulPayment = async (planId, billingPeriod, paymentId) => {
    try {
      if (!user) {
        throw new Error('Пользователь не авторизован')
      }

      console.log('Обновляем план пользователя:', { planId, billingPeriod })

      await supabaseAuthService.updateUserPlan(user.id, planId, billingPeriod)

      if (updateUserPlan) {
        await updateUserPlan(planId, billingPeriod)
      }

      setPaymentInfo({
        planId: planId.toUpperCase(),
        billingPeriod,
        paymentId
      })

      setIsSuccess(true)

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ошибка платежа</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/pricing')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Попробовать еще раз
          </button>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Оплата прошла успешно!</h2>
          <p className="text-gray-600 mb-4">Ваша подписка успешно активирована</p>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Перейти к панели управления
          </button>
        </div>
      </div>
    )
  }

  return null
}
