import { useSubscription } from '../../contexts/SubscriptionContext'
import { useAuth } from '../../contexts/AuthContext'
import { trackEvent } from '../../utils/analytics'
import PricingModal from './PricingModal'
import { useState } from 'react'

export default function AccessGate({ calculatorId, children }) {
  const { checkAccess, checkCalculationLimit, currentPlan } = useSubscription()
  const { isAuthenticated } = useAuth()
  const [showPricing, setShowPricing] = useState(false)

  const hasAccess = checkAccess(calculatorId)
  const limitCheck = checkCalculationLimit()

  // Если есть полный доступ - показываем контент
  if (hasAccess && limitCheck.allowed) {
    return children
  }

  const handleUpgradeClick = () => {
    setShowPricing(true)
    trackEvent('upgrade_prompt_clicked', {
      calculator_id: calculatorId,
      current_plan: currentPlan,
      reason: !hasAccess ? 'no_access' : 'limit_exceeded'
    })
  }

  // Если нет доступа к калькулятору
  if (!hasAccess) {
    return (
      <>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Доступ ограничен</h2>
              <p className="text-white/80">
                Этот калькулятор доступен только в платных планах
              </p>
            </div>

            <div className="mb-6">
              <div className="bg-blue-500/20 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-white mb-2">В Pro плане:</h3>
                <ul className="text-sm text-white/80 text-left space-y-1">
                  <li>✓ Все 13 калькуляторов</li>
                  <li>✓ Безлимитные расчеты</li>
                  <li>✓ Расширенная аналитика</li>
                  <li>✓ Приоритетная поддержка</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleUpgradeClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Перейти на Pro за 990₽/мес
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
              >
                Вернуться назад
              </button>
            </div>
          </div>
        </div>

        <PricingModal
          isOpen={showPricing}
          onClose={() => setShowPricing(false)}
        />
      </>
    )
  }

  // Если превышен лимит расчетов
  return (
    <>
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Лимит исчерпан</h2>
            <p className="text-white/80 mb-4">
              Вы использовали все {limitCheck.limit} расчетов в этом месяце
            </p>
            <div className="bg-gray-500/20 rounded-lg p-3">
              <p className="text-sm text-white/60">
                Лимит обновится в начале следующего месяца
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-green-500/20 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-white mb-2">Безлимитный доступ:</h3>
              <ul className="text-sm text-white/80 text-left space-y-1">
                <li>✓ Неограниченные расчеты</li>
                <li>✓ Все калькуляторы</li>
                <li>✓ Продвинутая аналитика</li>
                <li>✓ Экспорт во все форматы</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleUpgradeClick}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Получить безлимитный доступ
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
            >
              Вернуться назад
            </button>
          </div>
        </div>
      </div>

      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
      />
    </>
  )
}
