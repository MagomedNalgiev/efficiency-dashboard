import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { initYooKassaPayment } from '../../config/payment'
import { trackEvent } from '../../utils/analytics'

export default function YooKassaWidget({ planId, billingPeriod, onSuccess, onError, onClose }) {
  const { user } = useAuth()
  const [confirmationToken, setConfirmationToken] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.email) {
      setError('Необходимо авторизоваться')
      setIsLoading(false)
      return
    }

    const init = async () => {
      try {
        setIsLoading(true)
        const payment = await initYooKassaPayment(planId, billingPeriod, user.email)
        setConfirmationToken(payment.confirmation.confirmation_token)
      } catch (e) {
        setError(e.message || 'Ошибка создания платежа')
        onError && onError(e)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [planId, billingPeriod, user, onError])

  const handleWidget = () => {
    if (!confirmationToken) return
    window.ym(confirmationToken, {
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
        setError(err.message || 'Ошибка оплаты')
        onError && onError(err)
      },
      onClose: () => {
        onClose && onClose()
      }
    })
  }

  if (isLoading) {
    return <div className="p-6 text-center text-white">Загрузка...</div>
  }

  if (error) {
    return (
      <div className="p-6 text-red-400">
        {error}
        <button onClick={onClose} className="ml-4 text-white bg-red-600 px-2 py-1 rounded">Закрыть</button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <button
        onClick={handleWidget}
        className="w-full py-3 bg-blue-600 text-white rounded-lg"
      >
        Оплатить сейчас
      </button>
    </div>
  )
}
