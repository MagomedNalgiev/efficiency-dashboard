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
    // Добавляем стили прямо в head
    const style = document.createElement('style')
    style.textContent = `
      .yookassa-embed {
        border-radius: 12px;
        overflow: hidden;
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid rgba(71, 85, 105, 0.3);
        min-height: 400px;
      }
      .payment-widget-container {
        --yookassa-color-primary: #3b82f6;
        --yookassa-color-background: #1e293b;
        --yookassa-color-surface: #334155;
        --yookassa-color-text: #f8fafc;
        --yookassa-color-text-secondary: #94a3b8;
        --yookassa-border-radius: 8px;
      }
      #yookassa-payment-form iframe {
        border-radius: 12px !important;
        border: 1px solid rgba(71, 85, 105, 0.3) !important;
      }
    `
    document.head.appendChild(style)

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
      // Удаляем стили при размонтировании
      if (style && style.parentNode) {
        style.parentNode.removeChild(style)
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
      <div
        className="rounded-xl shadow-2xl backdrop-blur-sm w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(135deg, rgb(30, 41, 59) 0%, rgb(15, 23, 42) 50%, rgb(30, 41, 59) 100%)',
          border: '1px solid rgba(71, 85, 105, 0.5)'
        }}
      >

        {/* Заголовок */}
        <div
          className="flex justify-between items-center p-6"
          style={{ borderBottom: '1px solid rgba(71, 85, 105, 0.5)' }}
        >
          <div>
            <h3 className="text-xl font-bold text-white">Оплата подписки</h3>
            <p className="text-sm mt-1" style={{ color: 'rgb(148, 163, 184)' }}>
              {planId === 'pro' ? 'Профессиональный план' : 'Корпоративный план'} •
              {billingPeriod === 'yearly' ? ' Годовая подписка' : ' Месячная подписка'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-2xl transition-colors"
            style={{ color: 'rgb(148, 163, 184)' }}
            onMouseEnter={(e) => e.target.style.color = 'white'}
            onMouseLeave={(e) => e.target.style.color = 'rgb(148, 163, 184)'}
          >
            ✕
          </button>
        </div>

        {/* Контент */}
        <div className="p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div
                className="rounded-full h-12 w-12 mb-4"
                style={{
                  border: '2px solid rgb(96, 165, 250)',
                  borderTopColor: 'transparent',
                  animation: 'spin 1s linear infinite'
                }}
              ></div>
              <p className="text-white font-medium">Загрузка платежной формы...</p>
              <p className="text-sm mt-2" style={{ color: 'rgb(148, 163, 184)' }}>
                Подготавливаем безопасное соединение
              </p>
            </div>
          )}

          {error && (
            <div
              className="rounded-lg p-4 mb-6"
              style={{
                background: 'rgba(127, 29, 29, 0.5)',
                border: '1px solid rgba(239, 68, 68, 0.5)'
              }}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 mt-0.5" fill="none" stroke="rgb(248, 113, 113)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium" style={{ color: 'rgb(248, 113, 113)' }}>
                    Ошибка инициализации оплаты
                  </h4>
                  <p className="text-sm mt-1" style={{ color: 'rgb(252, 165, 165)' }}>
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="payment-widget-container">
            <div id="yookassa-payment-form" className="yookassa-embed"></div>
          </div>

          <div
            className="mt-6 pt-6"
            style={{ borderTop: '1px solid rgba(71, 85, 105, 0.5)' }}
          >
            <div className="flex items-center justify-center space-x-6 text-sm" style={{ color: 'rgb(148, 163, 184)' }}>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="rgb(74, 222, 128)" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Безопасная оплата</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="rgb(96, 165, 250)" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>YooKassa</span>
              </div>
            </div>
            <div className="text-center mt-3">
              <p className="text-xs" style={{ color: 'rgb(100, 116, 139)' }}>
                Принимаем карты Visa, MasterCard, МИР • SberPay • YooMoney
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
