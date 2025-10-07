import { useState } from 'react'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { useAuth } from '../../contexts/AuthContext'
import { SUBSCRIPTION_PLANS } from '../../config/subscriptionPlans'
import YooKassaWidget from '../payment/YooKassaWidget'
import { trackEvent } from '../../utils/analytics'

export default function PricingModal({ isOpen, onClose, defaultPlan = 'PRO' }) {
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan)
  const [billingPeriod, setBillingPeriod] = useState('monthly')
  const [showPaymentWidget, setShowPaymentWidget] = useState(false)
  const [error, setError] = useState(null)
  const { currentPlan } = useSubscription()
  const { isAuthenticated, user } = useAuth()

  if (!isOpen) return null

  // ИСПРАВЛЕННАЯ функция handleUpgrade
  const handleUpgrade = async (planId) => {
    // Конвертируем в правильный формат для payment.js (приводим к нижнему регистру)
    const normalizedPlanId = planId.toLowerCase()

    if (!isAuthenticated) {
      setError('Сначала необходимо зарегистрироваться')
      return
    }

    if (!user?.email) {
      setError('Отсутствует email адрес')
      return
    }

    setError(null)
    setSelectedPlan(normalizedPlanId) // Используем нормализованный ID
    setShowPaymentWidget(true)

    trackEvent('payment_widget_opened', {
      plan_id: normalizedPlanId, // Используем нормализованный ID
      billing_period: billingPeriod,
      user_id: user.id
    })
  }

  const handlePaymentSuccess = (payment) => {
    trackEvent('payment_widget_completed', {
      plan_id: selectedPlan,
      billing_period: billingPeriod,
      payment_id: payment.payment_id, // ИСПРАВЛЕНО: payment_id вместо id
      user_id: user.id
    })
    // Закрываем модальное окно, пользователь будет перенаправлен
    onClose()
  }

  const handlePaymentError = (error) => {
    setError(error)
    setShowPaymentWidget(false)
    trackEvent('payment_widget_error', {
      plan_id: selectedPlan,
      billing_period: billingPeriod,
      error: error,
      user_id: user?.id
    })
  }

  const handleClosePaymentWidget = () => {
    setShowPaymentWidget(false)
    setError(null)
  }

  // Если показываем виджет оплаты
  if (showPaymentWidget) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          {/* Заголовок */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Оплата</h3>
              <p className="text-sm text-gray-600">
                {SUBSCRIPTION_PLANS[selectedPlan.toUpperCase()]?.name} - {billingPeriod === 'yearly' ? 'Годовая' : 'Месячная'} подписка
              </p>
            </div>
            <button
              onClick={handleClosePaymentWidget}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Виджет ЮKassa */}
          <YooKassaWidget
            planId={selectedPlan}
            billingPeriod={billingPeriod}
            userEmail={user?.email}
            userId={user?.id}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onClose={handleClosePaymentWidget}
          />
        </div>
      </div>
    )
  }

  const plans = [SUBSCRIPTION_PLANS.FREE, SUBSCRIPTION_PLANS.PRO, SUBSCRIPTION_PLANS.ENTERPRISE]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Выберите план</h2>
            <p className="text-gray-600">Получите полный доступ ко всем возможностям</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mx-6 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Переключатель периода оплаты */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Ежемесячно
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  billingPeriod === 'yearly'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Ежегодно
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded">
                  -17%
                </span>
              </button>
            </div>
          </div>

          {/* Планы */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const price = billingPeriod === 'yearly' ? plan.priceYearly : plan.priceMonthly
              const isCurrentPlan = currentPlan === plan.id.toUpperCase()
              const isFree = plan.id === 'free'

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-xl p-6 border-2 transition-all ${
                    plan.recommended
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Рекомендуемый значок */}
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                        Рекомендуем
                      </div>
                    </div>
                  )}

                  {/* Название плана */}
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                  </div>

                  {/* Цена */}
                  <div className="text-center mb-6">
                    {isFree ? (
                      <div className="text-2xl font-bold text-gray-900">Бесплатно</div>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-gray-900">
                          {billingPeriod === 'yearly'
                            ? `${Math.round(price / 12)}₽`
                            : `${price}₽`
                          }
                          <span className="text-lg text-gray-500">/мес</span>
                        </div>
                        {billingPeriod === 'yearly' && (
                          <div className="text-sm text-gray-500">
                            {price}₽ в год (скидка 17%)
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Возможности */}
                  <ul className="mb-6 space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Кнопка действия */}
                  <div className="text-center">
                    {isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full bg-gray-200 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed"
                      >
                        Текущий план
                      </button>
                    ) : isFree ? (
                      <button
                        disabled
                        className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed"
                      >
                        Бесплатно
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        Выбрать план
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Дополнительная информация */}
          <div className="mt-8 text-center space-y-2 text-sm text-gray-500">
            <div>
              <span className="mr-4">💳 Принимаем карты Visa, MasterCard, МИР • СБП</span>
            </div>
            <div>
              <span className="mr-4">🔒 Безопасные платежи через ЮKassa</span>
            </div>
            <div>
              <span className="mr-4">📞 Поддержка 24/7 • 💰 Возврат средств в течение 14 дней</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
