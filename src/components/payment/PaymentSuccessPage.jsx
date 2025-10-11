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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col justify-center items-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-white/30 border-t-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2 text-center">
            Обрабатываем платеж...
          </h2>
          <p className="text-white/70 text-center">Пожалуйста, подождите</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col justify-center items-center px-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Ошибка платежа</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/pricing')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
            >
              Попробовать еще раз
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-colors"
            >
              Вернуться к дашборду
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col justify-center items-center px-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Оплата прошла успешно!</h2>
          <p className="text-white/70 mb-4">Ваша подписка успешно активирована</p>

          {paymentInfo && (
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 mb-6 text-left border border-white/10">
              <p className="text-sm text-white/70">План: <span className="font-semibold text-white">{paymentInfo.planId}</span></p>
              <p className="text-sm text-white/70">Период: <span className="font-semibold text-white">{paymentInfo.billingPeriod === 'yearly' ? 'Годовая' : 'Месячная'}</span></p>
              <p className="text-sm text-white/70">ID платежа: <span className="font-mono text-xs text-white/90">{paymentInfo.paymentId}</span></p>
            </div>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
          >
            Перейти к панели управления
          </button>
        </div>
      </div>
    )
  }

  return null
}
