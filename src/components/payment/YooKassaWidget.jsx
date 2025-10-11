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

  const loadSDK = () =>
    new Promise((resolve, reject) => {
      if (window.YooMoneyCheckoutWidget) return resolve()
      const script = document.createElement('script')
      script.src = 'https://yookassa.ru/checkout-widget/v1/checkout-widget.js'
      script.async = true
      script.onload = resolve
      script.onerror = () => reject(new Error('Ошибка загрузки SDK'))
      document.head.appendChild(script)
    })

  useEffect(() => {
    if (!user?.email) {
      setError('Необходимо авторизоваться')
      setIsLoading(false)
      return
    }

    if (!styleRef.current) {
      const style = document.createElement('style')
      style.textContent = `
        .yookassa-embed { border-radius:12px; overflow:hidden; background:rgba(30,41,59,0.5); border:1px solid rgba(71,85,105,0.3); min-height:400px; }
        .payment-widget-container { --yookassa-color-primary:#3b82f6; --yookassa-color-background:#1e293b; --yookassa-color-surface:#334155; --yookassa-color-text:#f8fafc; --yookassa-color-text-secondary:#94a3b8; --yookassa-border-radius:8px; }
        iframe { border-radius:12px!important; border:1px solid rgba(71,85,105,0.3)!important; }
      `
      document.head.appendChild(style)
      styleRef.current = style
    }

    const init = async () => {
      try {
        setIsLoading(true)
        await loadSDK()
        const payment = await createYooKassaPayment(planId, billingPeriod, user.email)
        const token = payment.confirmation?.confirmation_token
        if (!token) throw new Error('Нет confirmation_token')
        const container = containerRef.current
        if (!container) throw new Error('Контейнер не найден')
        container.innerHTML = ''
        const checkout = new window.YooMoneyCheckoutWidget({
          confirmation_token: token,
          return_url: `${window.location.origin}/payment/success?plan=${planId}&period=${billingPeriod}&payment_id=${payment.id}`,
          error_callback: (err) => {
            console.error(err)
            setError('Ошибка виджета: ' + (err.message || ''))
            setIsLoading(false)
          }
        })
        // Рендерим в конкретный DOM-элемент
        await checkout.render(container)
        widgetRef.current = checkout
      } catch (e) {
        console.error(e)
        setError(e.message)
        if (onError) onError(e)
      } finally {
        setIsLoading(false)
      }
    }

    init()

    return () => {
      if (widgetRef.current?.destroy) widgetRef.current.destroy()
      if (styleRef.current) document.head.removeChild(styleRef.current)
    }
  }, [planId, billingPeriod, user])

  const handleClose = () => {
    if (widgetRef.current?.destroy) widgetRef.current.destroy()
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1e293b] border border-gray-700 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
        <header className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h3 className="text-xl font-bold text-white">Оплата</h3>
            <p className="text-sm text-gray-400">{planId==='pro'?'Профессиональный':'Корпоративный'} • {billingPeriod==='yearly'?'Годовая':'Месячная'}</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </header>
        <div className="p-6">
          {isLoading && <div className="text-center text-white">Загрузка...</div>}
          {error && (
            <div className="text-red-400 mb-4">
              {error}
              <button onClick={handleClose} className="ml-4 text-sm text-white bg-red-600 px-2 py-1 rounded">Закрыть</button>
            </div>
          )}
          <div className="payment-widget-container">
            <div ref={containerRef} className="yookassa-embed"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
