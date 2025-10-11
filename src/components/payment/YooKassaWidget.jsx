import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { initYooKassaPayment } from '../../config/payment'
import { trackEvent } from '../../utils/analytics'

export default function YooKassaWidget({ planId, billingPeriod, onSuccess, onError, onClose }) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [widgetInstance, setWidgetInstance] = useState(null)

  useEffect(() => {
    const initializePayment = async () => {
      if (!user || !user.email) {
        setError('Необходимо авторизоваться для оплаты')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log('Инициализируем платежную форму для:', planId, billingPeriod)

        const widget = await initYooKassaPayment(
          planId,
          billingPeriod,
          user.email,
          (paymentData) => {
            console.log('Платеж инициализирован:', paymentData)
            trackEvent('payment_initiated', {
              plan_id: planId,
              billing_period: billingPeriod,
              user_id: user.id,
              payment_id: paymentData.id
            })
          },
          (error) => {
            console.error('Ошибка платежа:', error)
            setError(error)
            setIsLoading(false)
            trackEvent('payment_error', {
              plan_id: planId,
              billing_period: billingPeriod,
              user_id: user.id,
              error: error
            })
            if (onError) onError(error)
          }
        )

        setWidgetInstance(widget)
        setIsLoading(false)

      } catch (error) {
        console.error('Ошибка инициализации виджета:', error)
        setError(error.message)
        setIsLoading(false)
        if (onError) onError(error.message)
      }
    }

    initializePayment()

    // Cleanup
    return () => {
      if (widgetInstance && widgetInstance.destroy) {
        widgetInstance.destroy()
      }
    }
  }, [planId, billingPeriod, user])

  const handleClose = () => {
    if (widgetInstance && widgetInstance.destroy) {
      widgetInstance.destroy()
    }
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Оплата подписки</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Загрузка платежной формы...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Ошибка: </strong>
            {error}
          </div>
        )}

        {/* Контейнер для виджета YooKassa */}
        <div id="yookassa-payment-form"></div>

        <div className="mt-4 text-sm text-gray-500 text-center">
          <p>🔒 Безопасная оплата через YooKassa</p>
          <p>Принимаем карты, SberPay, YooMoney</p>
        </div>
      </div>
    </div>
  )
}
