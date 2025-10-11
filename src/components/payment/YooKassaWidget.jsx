import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { initYooKassaPayment } from '../../config/payment'
import { trackEvent } from '../../utils/analytics'

export default function YooKassaWidget({ planId, billingPeriod, onSuccess, onError, onClose }) {
  const { user } = useAuth()
  const containerRef = useRef(null)
  const widgetRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user?.email) {
      setError('Необходимо авторизоваться')
      setIsLoading(false)
      return
    }

    const loadScript = () => {
      return new Promise((resolve, reject) => {
        if (window.YooMoneyCheckoutUI) return resolve()
        const script = document.createElement('script')
        script.src = 'https://yoomoney.ru/checkout-ui/v1/checkout.js'
        script.async = true
        script.onload = resolve
        script.onerror = () => reject(new Error('Не удалось загрузить виджет YooKassa'))
        document.head.appendChild(script)
      })
    }

    const init = async () => {
      try {
        setIsLoading(true)
        await loadScript()

        // Очистка контейнера от старых инстансов
        const container = containerRef.current
        if (container) container.innerHTML = ''

        // Создание платежа на бэкенде
        const paymentData = await initYooKassaPayment(planId, billingPeriod, user.email)
        const token = paymentData.confirmation.confirmation_token

        // Инициализация виджета
        const widget = new window.YooMoneyCheckoutUI({
          confirmation_token: token,
          container: container
        })

        widgetRef.current = widget
        setIsLoading(false)

        trackEvent('payment_initiated', {
          plan_id: planId,
          billing_period: billingPeriod,
          user_id: user.id,
          payment_id: paymentData.id
        })

        widget.on('success', (res) => {
          if (onSuccess) onSuccess(res)
        })
        widget.on('error', (err) => {
          setError(err.message || 'Ошибка платежа')
          if (onError) onError(err)
        })

      } catch (err) {
        setError(err.message || 'Не удалось инициализировать оплату')
        if (onError) onError(err)
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
  }, [planId, billingPeriod, user])

  const handleClose = () => {
    if (widgetRef.current?.destroy) widgetRef.current.destroy()
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden">
        <header className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Оплата подписки</h3>
          <button onClick={handleClose} className="text-xl">&times;</button>
        </header>
        <div className="p-4">
          {isLoading && <p>Загрузка формы оплаты...</p>}
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <div ref={containerRef} className="yookassa-embed"></div>
        </div>
      </div>
    </div>
  )
}
