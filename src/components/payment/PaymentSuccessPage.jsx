import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabaseAuthService } from '../../services/supabaseAuthService'
import { checkPaymentStatus } from '../../config/payment'
import { trackEvent } from '../../utils/analytics'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, updateUserPlan } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [paymentInfo, setPaymentInfo] = useState(null)

  useEffect(() => {
    // Если URL не совпадает, перенаправляем на pricing
    if (!location.pathname.startsWith('/payment/success')) {
      navigate('/pricing', { replace: true })
      return
    }

    const handlePaymentResult = async () => {
      try {
        const planId = searchParams.get('plan')
        const billingPeriod = searchParams.get('period')
        const paymentId = searchParams.get('payment_id')

        if (!planId || !billingPeriod || !paymentId) {
          throw new Error('Недостающие параметры платежа')
        }

        const paymentStatus = await checkPaymentStatus(paymentId)

        if (paymentStatus.status === 'succeeded' && paymentStatus.paid) {
          await handleSuccessfulPayment(planId, billingPeriod, paymentId, paymentStatus)
        } else if (paymentStatus.status === 'pending') {
          setTimeout(handlePaymentResult, 3000)
          return
        } else {
          throw new Error(`Статус платежа: ${paymentStatus.status}`)
        }
      } catch (err) {
        setError(err.message)
        setIsLoading(false)
      }
    }

    handlePaymentResult()
  }, [location.pathname, searchParams, user, updateUserPlan, navigate])

  const handleSuccessfulPayment = async (planId, billingPeriod, paymentId, paymentStatus) => {
    try {
      await supabaseAuthService.updateUserPlan(user.id, planId, billingPeriod)
      updateUserPlan && await updateUserPlan(planId, billingPeriod)

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
    } catch (err) {
      setError('Ошибка обновления плана: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white">Обработка платежа…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-red-500 mb-4">Ошибка</h1>
          <p className="text-red-400 mb-6">{error}</p>
          <button onClick={() => navigate('/pricing')} className="px-4 py-2 bg-blue-600 text-white rounded">
            Вернуться к тарифам
          </button>
        </div>
      </div>
    )
  }

  return isSuccess ? (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-3xl mb-4">✅ Оплата успешна!</h1>
        <div className="bg-gray-800 p-6 rounded mb-6">
          <p><strong>План:</strong> {paymentInfo.planId}</p>
          <p><strong>Период:</strong> {paymentInfo.billingPeriod === 'yearly' ? 'Годовая' : 'Месячная'}</p>
          <p><strong>ID платежа:</strong> {paymentInfo.paymentId}</p>
          {paymentInfo.amount && (
            <p><strong>Сумма:</strong> {paymentInfo.amount} {paymentInfo.currency}</p>
          )}
        </div>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-green-500 rounded mr-4">
          Перейти в дашборд
        </button>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-gray-700 rounded">
          На главную
        </button>
      </div>
    </div>
  ) : null
}
