import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { initYooKassaPayment } from '../../config/payment'
import { trackEvent } from '../../utils/analytics'

export default function YooKassaWidget({ planId, billingPeriod, onSuccess, onError, onClose }) {
  const { user } = useAuth()
  const containerRef = useRef(null)
  const widgetRef = useRef(null)
  const styleRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Если виджет уже инициализирован — не делать снова
    if (widgetRef.current) return

    // Добавляем стили единожды
    const style = document.createElement('style')
    style.textContent = `
      .yookassa-embed { border-radius:12px; overflow:hidden; background:rgba(30,41,59,0.5); border:1px solid rgba(71,85,105,0.3); min-height:400px; }
      .payment-widget-container { --yookassa-color-primary:#3b82f6; --yookassa-color-background:#1e293b; --yookassa-color-surface:#334155; --yookassa-color-text:#f8fafc; --yookassa-color-text-secondary:#94a3b8; --yookassa-border-radius:8px; }
      #yookassa-payment-form iframe { border-radius:12px!important; border:1px solid rgba(71,85,105,0.3)!important; }
    `
    document.head.appendChild(style)
    styleRef.current = style

    const initialize = async () => {
      if (!user?.email) {
        setError('Необходимо авторизоваться')
        return
      }
      setIsLoading(true)
      try {
        const widget = await initYooKassaPayment(
          planId,
          billingPeriod,
          user.email,
          (paymentData) => {
            trackEvent('payment_initiated', {
              plan_id: planId,
              billing_period: billingPeriod,
              user_id: user.id,
              payment_id: paymentData.id
            })
            if (onSuccess) onSuccess(paymentData)
          },
          (err) => {
            setError(err)
            if (onError) onError(err)
          }
        )
        widgetRef.current = widget
      } catch (err) {
        setError(err.message || 'Ошибка инициализации')
        if (onError) onError(err)
      } finally {
        setIsLoading(false)
      }
    }

    // Очистка контейнера перед инициализацией
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }
    initialize()

    return () => {
      // Удаляем виджет и стили при размонтировании
      if (widgetRef.current?.destroy) {
        widgetRef.current.destroy()
        widgetRef.current = null
      }
      if (styleRef.current) {
        document.head.removeChild(styleRef.current)
        styleRef.current = null
      }
    }
  }, [planId, billingPeriod, user, onSuccess, onError])

  const handleClose = () => {
    if (widgetRef.current?.destroy) {
      widgetRef.current.destroy()
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
            </div>
          )}

          <div className="payment-widget-container">
            <div id="yookassa-payment-form" className="yookassa-embed" ref={containerRef}></div>
          </div>

          {/* Подвал */}
          <div className="mt-6 pt-6 border-t border-gray-700 text-gray-400 text-center text-xs">
            Принимаем карты Visa, MasterCard, МИР • SberPay • YooMoney
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
