import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { trackEvent } from '../../utils/analytics'

export default function YooKassaWidget({ planId, billingPeriod, onSuccess, onError, onClose }) {
  const { user } = useAuth()
  const containerRef = useRef(null)
  const widgetRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const createPayment = async (planId, billingPeriod, userEmail) => {
    const res = await fetch('/.netlify/functions/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, billingPeriod, userEmail })
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Ошибка создания платежа')
    }
    return res.json()
  }

  useEffect(() => {
    if (!user?.email) {
      setError('Необходимо авторизоваться для оплаты')
      setIsLoading(false)
      return
    }

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

    const init = async () => {
      try {
        setIsLoading(true)
        await loadSDK()

        const payment = await createPayment(planId, billingPeriod, user.email)
        const token = payment.confirmation?.confirmation_token
        if (!token) throw new Error('Не получен confirmation_token')

        const container = containerRef.current
        if (!container) throw new Error('Контейнер не найден')
        container.innerHTML = ''
        const containerId = 'yookassa-payment-form-' + Date.now()
        container.id = containerId

        const checkout = new window.YooMoneyCheckoutWidget({
          confirmation_token: token,
          return_url: `https://metricspace.ru/payment/success?plan=${planId}&period=${billingPeriod}&payment_id=${payment.id}`,
          error_callback: (err) => {
            setError(err.message || 'Ошибка виджета оплаты')
            setIsLoading(false)
          }
        })

        await checkout.render(containerId)
        widgetRef.current = checkout

        checkout.on('success', (details) => {
          trackEvent('payment_success', {
            plan_id: planId,
            billing_period: billingPeriod,
            user_id: user.id,
            payment_id: details.payment_id
          })
          window.location.href = `/payment/success?plan=${planId}&period=${billingPeriod}&payment_id=${details.payment_id}`
        })

      } catch (e) {
        console.error('Payment init error:', e)
        setError(e.message)
        onError && onError(e)
      } finally {
        setIsLoading(false)
      }
    }

    init()
    return () => {
      if (widgetRef.current?.destroy) {
        widgetRef.current.destroy()
        widgetRef.current = null
      }
    }
  }, [planId, billingPeriod, user, onError])

  const handleClose = () => {
    widgetRef.current?.destroy()
    onClose && onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1e293b] border border-gray-700 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
        <header className="flex justify-between items-center p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Оплата подписки</h3>
          <button onClick={handleClose} className="text-2xl text-gray-400 hover:text-white">✕</button>
        </header>
        <div className="p-6">
          {isLoading && <p className="text-center text-white">Загрузка формы оплаты...</p>}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div ref={containerRef} className="yookassa-embed" style={{
            borderRadius:'12px', overflow:'hidden',
            background:'rgba(30,41,59,0.5)', border:'1px solid rgba(71,85,105,0.3)',
            minHeight:'400px'
          }}></div>
        </div>
      </div>
    </div>
  )
}
