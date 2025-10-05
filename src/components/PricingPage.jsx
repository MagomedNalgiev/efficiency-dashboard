import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'
import PricingModal from './subscription/PricingModal'
import { SUBSCRIPTION_PLANS } from '../config/subscriptionPlans'

export default function PricingPage() {
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('PRO')

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId)
    setShowPricingModal(true)
  }

  const plans = [SUBSCRIPTION_PLANS.FREE, SUBSCRIPTION_PLANS.PRO, SUBSCRIPTION_PLANS.ENTERPRISE]

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Заголовок */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              Простые и понятные цены
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Выберите план, который подходит для ваших потребностей.
              Начните бесплатно, обновитесь по мере роста.
            </p>
          </div>

          {/* Планы */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-white/10 backdrop-blur-sm rounded-xl p-8 ${
                    plan.recommended
                      ? 'border-2 border-blue-500 scale-105'
                      : 'border border-white/20'
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                        🔥 Популярный
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">
                        {plan.price === 0 ? 'Бесплатно' : `${plan.price}₽`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-white/70">/месяц</span>
                      )}
                    </div>
                    <p className="text-white/70">{plan.description}</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-white/80">
                        <span className="text-green-400 mr-3">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                      plan.recommended
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : plan.id === 'free'
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
                    }`}
                  >
                    {plan.id === 'free' ? 'Попробовать бесплатно' : 'Выбрать план'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ секция */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Часто задаваемые вопросы
            </h2>

            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Можно ли изменить план позже?
                </h3>
                <p className="text-white/80">
                  Да, вы можете обновить или понизить свой план в любое время.
                  При обновлении изменения вступают в силу немедленно.
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Есть ли пробный период для платных планов?
                </h3>
                <p className="text-white/80">
                  Мы предлагаем бесплатный план с базовым функционалом.
                  Это позволяет вам протестировать платформу перед покупкой.
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Какие способы оплаты принимаются?
                </h3>
                <p className="text-white/80">
                  Мы принимаем все основные банковские карты: Visa, MasterCard, МИР.
                  Оплата происходит через защищенную систему Stripe.
                </p>
              </div>
            </div>
          </div>

          {/* CTA секция */}
          <div className="mt-20 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Готовы начать?
              </h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Присоединитесь к тысячам команд, которые уже используют Metricspace
                для повышения эффективности разработки.
              </p>
              <Link
                to="/"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Начать бесплатно
              </Link>
            </div>
          </div>
        </div>
      </div>

      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        defaultPlan={selectedPlan}
      />
    </div>
  )
}
