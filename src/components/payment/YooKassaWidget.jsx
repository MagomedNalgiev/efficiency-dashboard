import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { createYooKassaPayment } from '../../config/payment'
import { trackEvent } from '../../utils/analytics'

export default function YooKassaWidget({ planId, billingPeriod, onSuccess, onError, onClose }) {
  const { user } = useAuth()
  const containerRef = useRef(null)
  const widgetRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.email) {
      setError('Необходимо авторизоваться для оплаты')
      setIsLoading(false)
      return
    }

    const loadScript = () => {
      return new Promise((resolve, reject) => {
        if (window.YooMoneyCheckoutWidget) return resolve()
        const script = document.createElement('script')
        script.src = 'https://yookassa.ru/checkout-widget/v1/checkout-widget.js'
        script.async = true
        script.onload = resolve
        script.onerror = () => reject(new Error('Ошибка загрузки SDK'))
        document.head.appendChild(script)
      })
    }

    const initialize = async () => {
      try {
        setIsLoading(true)
        await loadScript()

        // Создаем платеж и получаем confirmation_token
        const payment = await createYooKassaPayment(planId, billingPeriod, user.email)
        const token = payment.confirmation?.confirmation_token
        if (!token) throw new Error('Не получен confirmation_token')

        // Очищаем контейнер
        const container = containerRef.current
        if (!container) throw new Error('Контейнер не найден')
        container.innerHTML = ''

        // Создаем виджет согласно официальной документации
        const checkout = new window.YooMoneyCheckoutWidget({
          confirmation_token: token,
          return_url: `${window.location.origin}/payment/success?plan=${planId}&period=${billingPeriod}&payment_id=${payment.id}`,
          error_callback: function(error) {
            console.error('Widget error:', error)
            setError('Ошибка виджета оплаты: ' + (error.message || 'Неизвестная ошибка'))
            setIsLoading(false)
          }
        })

        // Рендерим виджет в контейнер по ID
        const containerId = 'yookassa-payment-form-' + Date.now()
        container.id = containerId

        await checkout.render(containerId)
        widgetRef.current = checkout

        trackEvent('payment_initiated', {
          plan_id: planId,
          billing_period: billingPeriod,
          user_id: user.id,
          payment_id: payment.id
        })

      } catch (e) {
        console.error('Payment initialization error:', e)
        setError(e.message || 'Ошибка при инициализации платежа')
        if (onError) onError(new Error(e.message))
      } finally {
        setIsLoading(false)
      }
    }

    initialize()

    return () => {
      if (widgetRef.current?.destroy) {
        try {
          widgetRef.current.destroy()
        } catch (e) {
          console.warn('Widget destroy error:', e)
        }
        widgetRef.current = null
      }
    }
  }, [planId, billingPeriod, user, onError])

  const handleClose = () => {
    if (widgetRef.current?.destroy) {
      try {
        widgetRef.current.destroy()
      } catch (e) {
        console.warn('Widget destroy error:', e)
      }
      widgetRef.current = null
    }
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="rounded-xl shadow-2xl backdrop-blur-sm w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(135deg, rgb(30, 41, 59) 0%, rgb(15, 23, 42) 50%, rgb(30, 41, 59) 100%)',
          border: '1px solid rgba(71, 85, 105, 0.5)'
        }}
      >
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
                  <button
                    onClick={handleClose}
                    className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="payment-widget-container">
            <div ref={containerRef} className="yookassa-embed" style={{
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              minHeight: '400px'
            }}></div>
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
