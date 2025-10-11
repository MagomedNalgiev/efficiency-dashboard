import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { createYooKassaPayment } from '../../config/payment'
import { trackEvent } from '../../utils/analytics'

export default function YooKassaWidget({ planId, billingPeriod, onSuccess, onError, onClose }) {
  const { user } = useAuth()
  const containerRef = useRef(null)
  const widgetRef = useRef(null)
  const styleRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Загрузка YooKassa SDK
  const loadYooKassaSDK = () => {
    return new Promise((resolve, reject) => {
      if (window.YooMoneyCheckoutWidget) {
        resolve()
        return
      }
      const script = document.createElement('script')
      script.src = 'https://yookassa.ru/checkout-widget/v1/checkout-widget.js'
      script.onload = resolve
      script.onerror = () => reject(new Error('Ошибка загрузки YooKassa SDK'))
      document.head.appendChild(script)
    })
  }

  useEffect(() => {
    if (!user?.email) {
      setError('Необходимо авторизоваться')
      setIsLoading(false)
      return
    }

    // Добавляем стили единожды
    if (!styleRef.current) {
      const style = document.createElement('style')
      style.textContent = `
        .yookassa-embed { border-radius:12px; overflow:hidden; background:rgba(30,41,59,0.5); border:1px solid rgba(71,85,105,0.3); min-height:400px; }
        .payment-widget-container { --yookassa-color-primary:#3b82f6; --yookassa-color-background:#1e293b; --yookassa-color-surface:#334155; --yookassa-color-text:#f8fafc; --yookassa-color-text-secondary:#94a3b8; --yookassa-border-radius:8px; }
        #yookassa-payment-form iframe { border-radius:12px!important; border:1px solid rgba(71,85,105,0.3)!important; }
      `
      document.head.appendChild(style)
      styleRef.current = style
    }

    const initialize = async () => {
      try {
        // Загружаем SDK
        await loadYooKassaSDK()

        // Создаем платеж
        const paymentResponse = await createYooKassaPayment(planId, billingPeriod, user.email)

        if (!paymentResponse.confirmation?.confirmation_token) {
          throw new Error('Не получен confirmation_token от YooKassa')
        }

        // Дожидаемся готовности контейнера
        if (!containerRef.current) {
          throw new Error('Контейнер не готов')
        }

        // Очищаем контейнер
        containerRef.current.innerHTML = ''

        // Создаем виджет
        const checkout = new window.YooMoneyCheckoutWidget({
          confirmation_token: paymentResponse.confirmation.confirmation_token,
          return_url: `${window.location.origin}/payment/success?plan=${planId}&period=${billingPeriod}&payment_id=${paymentResponse.id}`,
          error_callback: function(widgetError) {
            console.error('YooKassa widget error:', widgetError)
            setError('Ошибка виджета оплаты: ' + (widgetError.message || 'Неизвестная ошибка'))
            setIsLoading(false)
          }
        })

        // Рендерим виджет
        await checkout.render('yookassa-payment-form')

        widgetRef.current = checkout
        setIsLoading(false)

        // Трекаем событие
        trackEvent('payment_initiated', {
          plan_id: planId,
          billing_period: billingPeriod,
          user_id: user.id,
          payment_id: paymentResponse.id
        })

        if (onSuccess) onSuccess(paymentResponse)

      } catch (err) {
        console.error('Ошибка инициализации платежа:', err)
        setError(err.message || 'Ошибка при создании платежа')
        setIsLoading(false)
        // НЕ вызываем onError здесь, чтобы не закрывать модалку
      }
    }

    initialize()

    return () => {
      // Очистка при размонтировании
      if (widgetRef.current?.destroy) {
        try {
          widgetRef.current.destroy()
        } catch (e) {
          console.warn('Ошибка при уничтожении виджета:', e)
        }
        widgetRef.current = null
      }
      if (styleRef.current && styleRef.current.parentNode) {
        document.head.removeChild(styleRef.current)
        styleRef.current = null
      }
    }
  }, [planId, billingPeriod, user])

  const handleClose = () => {
    if (widgetRef.current?.destroy) {
      try {
        widgetRef.current.destroy()
      } catch (e) {
        console.warn('Ошибка при уничтожении виджета:', e)
      }
      widgetRef.current = null
    }
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="rounded-xl shadow-2xl backdrop-blur-sm w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" style={{ background:'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)', border:'1px solid rgba(71,85,105,0.5)' }}>
        <div className="flex justify-between items-center p-6" style={{ borderBottom:'1px solid rgba(71,85,105,0.5)' }}>
          <div>
            <h3 className="text-xl font-bold text-white">Оплата подписки</h3>
            <p className="text-sm mt-1 text-gray-400">
              {planId==='pro'?'Профессиональный план':'Корпоративный план'} • {billingPeriod==='yearly'?'Годовая подписка':'Месячная подписка'}
            </p>
          </div>
          <button onClick={handleClose} className="text-2xl text-gray-400 transition-colors hover:text-white">✕</button>
        </div>

        <div className="p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full h-12 w-12 mb-4 border-2 border-blue-400 border-t-transparent animate-spin"></div>
              <p className="text-white font-medium">Загрузка платежной формы...</p>
              <p className="text-sm mt-2 text-gray-400">Подготавливаем безопасное соединение</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg p-4 mb-6 bg-red-800 border border-red-600">
              <h4 className="font-medium text-red-400">Ошибка инициализации оплаты</h4>
              <p className="text-sm mt-1 text-red-200">{error}</p>
              <button
                onClick={handleClose}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                Закрыть
              </button>
            </div>
          )}

          <div className="payment-widget-container">
            <div id="yookassa-payment-form" className="yookassa-embed" ref={containerRef}></div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700 text-gray-400 text-center text-xs">
            Принимаем карты Visa, MasterCard, МИР • SberPay • YooMoney
          </div>
        </div>
      </div>
    </div>
  )
}
