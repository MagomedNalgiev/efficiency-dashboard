import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabaseAuthService } from '../../services/supabaseAuthService'
import { checkPaymentStatus } from '../../config/payment'
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

        if (!planId || !billingPeriod || !paymentId) {
          throw new Error('Недостающие параметры платежа')
        }

        console.log('Обрабатываем результат платежа:', { planId, billingPeriod, paymentId })

        // Проверяем статус платежа через Netlify Functions
        const paymentStatus = await checkPaymentStatus(paymentId)
        console.log('Статус платежа:', paymentStatus)

        if (paymentStatus.status === 'succeeded' && paymentStatus.paid) {
          await handleSuccessfulPayment(planId, billingPeriod, paymentId, paymentStatus)
        } else if (paymentStatus.status === 'canceled') {
          throw new Error('Платеж был отменен')
        } else if (paymentStatus.status === 'pending') {
          setIsLoading(true)
          setTimeout(() => handlePaymentResult(), 3000)
          return
        } else {
          throw new Error(`Неожиданный статус платежа: ${paymentStatus.status}`)
        }
      } catch (error) {
        console.error('Ошибка обработки результата платежа:', error)
        setError(error.message)
        setIsLoading(false)
      }
    }

    handlePaymentResult()
  }, [searchParams, user, updateUserPlan])

  const handleSuccessfulPayment = async (planId, billingPeriod, paymentId, paymentStatus) => {
    try {
      if (!user) {
        throw new Error('Пользователь не авторизован')
      }

      await supabaseAuthService.updateUserPlan(user.id, planId, billingPeriod)
      if (updateUserPlan) {
        await updateUserPlan(planId, billingPeriod)
      }

      setPaymentInfo({
        planId: planId.toUpperCase(),
        billingPeriod,
        paymentId,
        amount: paymentStatus.amount?.value,
        currency: paymentStatus.amount?.currency
      })

      setIsSuccess(true)
      trackEvent('payment_success', {
        plan_id: planId,
        billing_period: billingPeriod,
        user_id: user.id,
        payment_id: paymentId,
        amount: paymentStatus.amount?.value
      })
    } catch (error) {
      console.error('Ошибка обновления плана:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Обрабатываем ваш платеж...</p>
          <p className="text-gray-400 text-sm mt-2">Пожалуйста, подождите</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-4">Ошибка платежа</h1>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/pricing')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Вернуться к тарифам
          </button>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-white mb-4">Оплата успешна!</h1>
          <p className="text-gray-300 mb-6">Ваша подписка успешно активирована</p>

          {paymentInfo && (
            <div className="bg-gray-800 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Детали подписки:</h3>
              <div className="space-y-2 text-gray-300">
                <p><span className="font-medium">План:</span> {paymentInfo.planId}</p>
                <p><span className="font-medium">Период:</span> {paymentInfo.billingPeriod === 'yearly' ? 'Годовая' : 'Месячная'}</p>
                <p><span className="font-medium">ID платежа:</span> {paymentInfo.paymentId}</p>
                {paymentInfo.amount && (
                  <p><span className="font-medium">Сумма:</span> {paymentInfo.amount} {paymentInfo.currency}</p>
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium mr-4"
          >
            Перейти в дашборд
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium"
          >
            На главную
          </button>
        </div>
      </div>
    )
  }

  return null
}
