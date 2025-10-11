import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { initYooKassaPayment } from '../../config/payment'
import { trackEvent } from '../../utils/analytics'

export default function YooKassaWidget({ planId, billingPeriod, onSuccess, onError, onClose }) {
  const { user } = useAuth()
  const containerRef = useRef(null)
  const widgetRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.email) {
      setError('Необходимо авторизоваться')
      setIsLoading(false)
      return
    }

    const loadScript = () =>
      new Promise((resolve, reject) => {
        if (window.YooMoneyCheckoutUI) return resolve()
        const script = document.createElement('script')
        script.src = 'https://yoomoney.ru/checkout-ui/v1/checkout.js'
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Не удалось загрузить SDK YooKassa'))
        document.head.appendChild(script)
      })

    const initialize = async () => {
      try {
        setIsLoading(true)
        await loadScript()

        // Очищаем контейнер от предыдущего инстанса
        const container = containerRef.current
        if (!container) throw new Error('Контейнер не найден')
        container.innerHTML = ''

        // Получаем confirmation token
        const payment = await initYooKassaPayment(planId, billingPeriod, user.email)
        const token = payment.confirmation.confirmation_token
        if (!token) throw new Error('Не получен confirmation_token')

        // Инициализируем виджет
        const widget = new window.YooMoneyCheckoutUI({
          confirmation_token: token,
          container: container,              // передаем DOM-элемент
          error_callback: ({ message }) => {
            setError(message || 'Ошибка платежного виджета')
            setIsLoading(false)
          }
        })

        // Слушаем успешное завершение
        widget.on('success', (details) => {
          trackEvent('payment_success', {
            plan_id: planId,
            billing_period: billingPeriod,
            user_id: user.id,
            payment_id: details.payment_id
          })
          onSuccess && onSuccess(details)
        })

        // Рендерим в переданный контейнер
        await widget.render(container)

        widgetRef.current = widget
      } catch (e) {
        const msg = e.message || String(e)
        setError(msg)
        onError && onError(new Error(msg))
      } finally {
        setIsLoading(false)
      }
    }

    initialize()

    return () => {
      if (widgetRef.current?.destroy) {
        try {
          widgetRef.current.destroy()
        } catch {}
        widgetRef.current = null
      }
    }
  }, [planId, billingPeriod, user, onSuccess, onError])

  const handleClose = () => {
    widgetRef.current?.destroy()
    onClose && onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1e293b] border border-gray-700 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
        <header className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h3 className="text-xl font-bold text-white">Оплата подписки</h3>
            <p className="text-sm text-gray-400">
              {planId === 'pro' ? 'Профессиональный план' : 'Корпоративный план'} •{' '}
              {billingPeriod === 'yearly' ? 'Годовая' : 'Месячная'} подписка
            </p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </header>
        <div className="p-6">
          {isLoading && <p className="text-white">Загрузка формы оплаты...</p>}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div ref={containerRef} className="yookassa-embed"></div>
        </div>
      </div>
    </div>
  )
}
