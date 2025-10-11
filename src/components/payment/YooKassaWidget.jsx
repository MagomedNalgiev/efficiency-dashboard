import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { initYooKassaPayment } from '../../config/payment'
import { trackEvent } from '../../utils/analytics'
import '../index.css';


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
      {/* Модальное окно в стиле сайта */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl shadow-2xl border border-slate-700/50 backdrop-blur-sm w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">

        {/* Заголовок */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
          <div>
            <h3 className="text-xl font-bold text-white">Оплата подписки</h3>
            <p className="text-sm text-slate-400 mt-1">
              {planId === 'pro' ? 'Профессиональный план' : 'Корпоративный план'} •
              {billingPeriod === 'yearly' ? ' Годовая подписка' : ' Месячная подписка'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Контент */}
        <div className="p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-400 border-t-transparent mb-4"></div>
              <p className="text-white font-medium">Загрузка платежной формы...</p>
              <p className="text-slate-400 text-sm mt-2">Подготавливаем безопасное соединение</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-red-400 font-medium">Ошибка инициализации оплаты</h4>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="payment-widget-container">
            <div id="yookassa-payment-form" className="yookassa-embed"></div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Безопасная оплата</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>YooKassa</span>
              </div>
            </div>
            <div className="text-center mt-3">
              <p className="text-xs text-slate-500">
                Принимаем карты Visa, MasterCard, МИР • SberPay • YooMoney
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
