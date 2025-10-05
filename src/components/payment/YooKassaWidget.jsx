import { useEffect, useState } from 'react'
import { paymentService } from '../../services/paymentService'

export default function YooKassaWidget({
  planId,
  billingPeriod,
  userEmail,
  userId,
  onSuccess,
  onError,
  onClose
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    initializePayment()
  }, [planId, billingPeriod, userEmail, userId])

  const initializePayment = async () => {
    try {
      setLoading(true)
      setError(null)

      // Инициируем платеж
      await paymentService.initiatePurchase(planId, billingPeriod, userEmail, userId)

      // Платеж инициирован успешно (или произошел редирект)
      setLoading(false)

    } catch (error) {
      console.error('Payment initialization error:', error)
      setError(error.message)
      setLoading(false)
      onError(error.message)
    }
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <div className="text-red-400 text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-white mb-3">Ошибка инициализации платежа</h3>
        <p className="text-red-300 mb-6">{error}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={initializePayment}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Попробовать снова
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-white mb-2">Подготовка к оплате...</h3>
        <p className="text-white/70">Инициализация платежной системы</p>

        {/* В demo режиме показываем прогресс */}
        <div className="mt-6 bg-white/10 rounded-lg p-4">
          <p className="text-white/80 text-sm mb-2">🧪 Демо режим активен</p>
          <p className="text-white/60 text-xs">
            Перенаправление на страницу успеха через несколько секунд...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center p-6">
      {/* Контейнер для виджета ЮKassa (для реального режима) */}
      <div id="yookassa-payment"></div>

      <p className="text-white/70 text-sm mt-4">
        Используется безопасная система оплаты ЮKassa
      </p>
    </div>
  )
}
