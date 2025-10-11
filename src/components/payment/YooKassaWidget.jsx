import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { initYooKassaPayment } from '../../config/payment'
import { trackEvent } from '../../utils/analytics'

export default function YooKassaWidget({ planId, billingPeriod, onSuccess, onError, onClose }) {
  const { user } = useAuth()
  const [confirmationToken, setConfirmationToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.email) {
      setError('Необходимо авторизоваться')
      setIsLoading(false)
      return
    }

    const loadWidgetScript = () =>
      new Promise((resolve, reject) => {
        if (window.ym) return resolve()
        const script = document.createElement('script')
        script.src = 'https://static.yoomoney.ru/checkout-widget/v1/checkout-widget.js'
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Не удалось загрузить SDK YooKassa'))
        document.head.appendChild(script)
      })

    const initialize = async () => {
      try {
        setIsLoading(true)
        await loadWidgetScript()

        // Создаем платеж и получаем confirmation_token
        const payment = await initYooKassaPayment(planId, billingPeriod, user.email)
        const token = payment.confirmation?.confirmation_token
        if (!token) throw new Error('Не получен confirmation_token')

        setConfirmationToken(token)
      } catch (e) {
        const msg = e.message || 'Ошибка создания платежа'
        setError(msg)
        onError && onError(new Error(msg))
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [planId, billingPeriod, user, onError])

  const openWidget = () => {
    if (!confirmationToken) return
    window.ym(confirmationToken, {
      container_id: 'yoo-pay-widget',
      onSuccess: (details) => {
        trackEvent('payment_success', {
          plan_id: planId,
          billing_period: billingPeriod,
          user_id: user.id,
          payment_id: details.payment_id
        })
        onSuccess && onSuccess(details)
      },
      onFail: (err) => {
        const msg = err.message || 'Ошибка платежа'
        setError(msg)
        onError && onError(err)
      },
      onClose: () => {
        onClose && onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden">
        <header className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Оплата подписки</h3>
          <button onClick={onClose} className="text-xl">✕</button>
        </header>
        <div className="p-4">
          {isLoading && <p className="text-center">Загрузка...</p>}
          {error && (
            <div className="mb-4 text-red-600">
              {error}
              <button onClick={onClose} className="ml-2 px-2 py-1 bg-red-600 text-white rounded">Закрыть</button>
            </div>
          )}
          {!isLoading && !error && (
            <>
              <div id="yoo-pay-widget" className="mb-4"></div>
              <button
                onClick={openWidget}
                className="w-full py-2 bg-blue-600 text-white rounded-lg"
              >
                Оплатить
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
