import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { paymentService } from '../../services/paymentService'
import { SUBSCRIPTION_PLANS } from '../../config/subscriptionPlans'
import { trackEvent } from '../../utils/analytics'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [paymentDetails, setPaymentDetails] = useState(null)
  const { user } = useAuth()
  const { loadSubscriptionInfo } = useSubscription()

  const planId = searchParams.get('plan')
  const billingPeriod = searchParams.get('period')
  const paymentId = searchParams.get('payment_id')

  useEffect(() => {
    processPaymentSuccess()
  }, [])

  const processPaymentSuccess = async () => {
    try {
      // Попытаемся восстановить информацию о платеже
      let pendingPayment = paymentService.restorePendingPayment()

      if (!pendingPayment && (planId && billingPeriod)) {
        // Создаем минимальную информацию из URL параметров
        pendingPayment = {
          planId: planId.toUpperCase(),
          billingPeriod,
          paymentId: paymentId || `success_${Date.now()}`
        }
      }

      if (!pendingPayment) {
        throw new Error('Не удалось найти информацию о платеже')
      }

      // Обрабатываем успешный платеж
      await paymentService.handlePaymentSuccess(
        pendingPayment.paymentId,
        pendingPayment.planId,
        pendingPayment.billingPeriod,
        user?.id
      )

      // Обновляем информацию о подписке
      await loadSubscriptionInfo()

      // Получаем информацию о плане для отображения
      const plan = SUBSCRIPTION_PLANS[pendingPayment.planId]
      const price = pendingPayment.billingPeriod === 'yearly'
        ? plan.priceYearly
        : plan.priceMonthly

      setPaymentDetails({
        planName: plan.name,
        planId: pendingPayment.planId,
        billingPeriod: pendingPayment.billingPeriod,
        price,
        features: plan.features
      })

      trackEvent('payment_success_page_viewed', {
        plan_id: pendingPayment.planId,
        billing_period: pendingPayment.billingPeriod
      })

    } catch (error) {
      console.error('Payment processing error:', error)
      setError(error.message)

      trackEvent('payment_success_page_error', {
        error: error.message,
        plan_id: planId,
        billing_period: billingPeriod
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Обрабатываем ваш платеж...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-4">Ошибка обработки платежа</h1>
          <p className="text-red-300 mb-6">{error}</p>
          <div className="space-y-3">
            <Link
              to="/pricing"
              className="block bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Попробовать снова
            </Link>
            <Link
              to="/app"
              className="block bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Вернуться к приложению
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
        {/* Иконка успеха */}
        <div className="text-8xl mb-6">🎉</div>

        <h1 className="text-4xl font-bold text-white mb-4">
          Оплата прошла успешно!
        </h1>

        <p className="text-xl text-white/80 mb-8">
          Поздравляем! Вы активировали план <span className="text-green-400 font-bold">
            {paymentDetails?.planName}
          </span>
        </p>

        {/* Детали подписки */}
        <div className="bg-white/5 rounded-lg p-6 mb-8 text-left">
          <h3 className="text-xl font-semibold text-white mb-4">Детали вашей подписки:</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-white/60">План:</span>
              <p className="text-white font-semibold">{paymentDetails?.planName}</p>
            </div>
            <div>
              <span className="text-white/60">Период оплаты:</span>
              <p className="text-white font-semibold">
                {paymentDetails?.billingPeriod === 'yearly' ? 'Годовой' : 'Месячный'}
              </p>
            </div>
            <div>
              <span className="text-white/60">Сумма:</span>
              <p className="text-green-400 font-bold text-lg">{paymentDetails?.price}₽</p>
            </div>
            <div>
              <span className="text-white/60">Следующий платеж:</span>
              <p className="text-white font-semibold">
                {new Date(Date.now() + (paymentDetails?.billingPeriod === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>

          <div className="border-t border-white/20 pt-4">
            <span className="text-white/60">Теперь вам доступно:</span>
            <ul className="mt-2 space-y-2">
              {paymentDetails?.features.map((feature, index) => (
                <li key={index} className="flex items-center text-white/80">
                  <span className="text-green-400 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Следующие шаги */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-3">🚀 Что дальше?</h3>
          <ul className="text-white/80 space-y-2 text-left">
            <li>• Все калькуляторы теперь разблокированы</li>
            <li>• Безлимитные расчеты</li>
            <li>• Полная история данных</li>
            <li>• Приоритетная поддержка</li>
          </ul>
        </div>

        {/* Кнопки действий */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/app"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            🎯 Начать использовать
          </Link>

          <Link
            to="/app/data-manager"
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 border border-white/30"
          >
            📊 Управление данными
          </Link>
        </div>

        {/* Поддержка */}
        <div className="mt-8 text-white/60 text-sm">
          <p>Нужна помощь? Напишите нам: <a href="mailto:support@metricspace.ru" className="text-blue-400 hover:text-blue-300">support@metricspace.ru</a></p>
        </div>
      </div>
    </div>
  )
}
