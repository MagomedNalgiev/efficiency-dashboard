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

  const handleUpgrade = async (planId) => {
    if (!isAuthenticated) {
      setError('Сначала необходимо зарегистрироваться')
      return
    }

    if (!user?.email) {
      setError('Отсутствует email адрес')
      return
    }

    setError(null)
    setSelectedPlan(planId)
    setShowPaymentWidget(true)

    trackEvent('payment_widget_opened', {
      plan_id: planId,
      billing_period: billingPeriod,
      user_id: user.id
    })
  }

  const handlePaymentSuccess = (payment) => {
    trackEvent('payment_widget_completed', {
      plan_id: selectedPlan,
      billing_period: billingPeriod,
      payment_id: payment.id,
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
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl max-w-md w-full">
          {/* Заголовок */}
          <div className="p-6 border-b border-white/20 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Оплата</h2>
              <p className="text-white/70 text-sm mt-1">
                {SUBSCRIPTION_PLANS[selectedPlan]?.name} - {billingPeriod === 'yearly' ? 'Годовая' : 'Месячная'} подписка
              </p>
            </div>
            <button
              onClick={handleClosePaymentWidget}
              className="text-white/70 hover:text-white text-2xl"
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="p-6 border-b border-white/20 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white">Выберите план</h2>
            <p className="text-white/70 mt-2">Получите полный доступ ко всем возможностям</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Переключатель периода оплаты */}
        <div className="p-6 border-b border-white/20">
          <div className="flex justify-center">
            <div className="bg-white/10 rounded-lg p-1 flex">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Ежемесячно
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  billingPeriod === 'yearly'
                    ? 'bg-blue-600 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Ежегодно
                <span className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                  -17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Планы */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const price = billingPeriod === 'yearly' ? plan.priceYearly : plan.priceMonthly
              const isCurrentPlan = currentPlan === plan.id.toUpperCase()
              const isFree = plan.id === 'free'

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white/5 rounded-xl p-6 border-2 transition-all ${
                    plan.recommended
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  {/* Рекомендуемый значок */}
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
                        Рекомендуем
                      </span>
                    </div>
                  )}

                  {/* Название плана */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-white/70 text-sm mb-4">{plan.description}</p>

                    {/* Цена */}
                    <div className="mb-4">
                      {isFree ? (
                        <div className="text-3xl font-bold text-white">Бесплатно</div>
                      ) : (
                        <>
                          <div className="text-3xl font-bold text-white">
                            {billingPeriod === 'yearly'
                              ? `${Math.round(price / 12)}₽`
                              : `${price}₽`
                            }
                            <span className="text-lg font-normal text-white/70">/мес</span>
                          </div>
                          {billingPeriod === 'yearly' && (
                            <div className="text-white/60 text-sm">
                              {price}₽ в год (скидка 17%)
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Возможности */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-400 mr-3 mt-1">✓</span>
                        <span className="text-white/80 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Кнопка действия */}
                  <div className="mt-auto">
                    {isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full bg-gray-600 text-gray-400 py-3 px-6 rounded-lg font-medium cursor-not-allowed"
                      >
                        Текущий план
                      </button>
                    ) : isFree ? (
                      <button
                        disabled
                        className="w-full bg-gray-600 text-gray-400 py-3 px-6 rounded-lg font-medium cursor-not-allowed"
                      >
                        Базовый план
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                          plan.recommended
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
                        }`}
                      >
                        Оплатить {billingPeriod === 'yearly' ? `${price}₽/год` : `${price}₽/мес`}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="p-6 border-t border-white/20 bg-white/5">
          <div className="text-center text-white/60 text-sm">
            <p className="mb-2">
              💳 Принимаем карты Visa, MasterCard, МИР • СБП
            </p>
            <p className="mb-2">
              🔒 Безопасные платежи через ЮKassa
            </p>
            <p>
              📞 Поддержка 24/7 • 💰 Возврат средств в течение 14 дней
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
