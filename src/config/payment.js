// Конфигурация платежной системы YooKassa - PRODUCTION через Netlify Functions
export const PAYMENT_CONFIG = {
  // URL для возврата после оплаты
  returnUrl: window.location.origin + '/payment/success',

  // Netlify Functions API endpoints
  createPaymentUrl: '/.netlify/functions/create-payment',
  checkStatusUrl: '/.netlify/functions/payment-status',

  // Конфигурация планов
  plans: {
    pro: {
      monthly: {
        amount: 990.00,
        currency: 'RUB',
        description: 'Metricspace Pro - месячная подписка'
      },
      yearly: {
        amount: 9900.00,
        currency: 'RUB',
        description: 'Metricspace Pro - годовая подписка (скидка 17%)'
      }
    },
    enterprise: {
      monthly: {
        amount: 4990.00,
        currency: 'RUB',
        description: 'Metricspace Enterprise - месячная подписка'
      },
      yearly: {
        amount: 49900.00,
        currency: 'RUB',
        description: 'Metricspace Enterprise - годовая подписка (скидка 17%)'
      }
    }
  }
}

// Загрузка YooKassa SDK
function loadYooKassaSDK() {
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

// Функция создания платежа через Netlify Functions
export const createYooKassaPayment = async (planId, billingPeriod, userEmail) => {
  const plan = PAYMENT_CONFIG.plans[planId.toLowerCase()]
  if (!plan || !plan[billingPeriod]) {
    throw new Error('Неверный план или период оплаты')
  }

  console.log('Создаем платеж через Netlify Functions:', { planId, billingPeriod })

  const response = await fetch(PAYMENT_CONFIG.createPaymentUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      planId,
      billingPeriod,
      userEmail
    })
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('Payment creation error:', response.status, errorData)
    throw new Error(`Ошибка создания платежа: ${response.status}`)
  }

  const result = await response.json()
  console.log('Платеж создан:', result.id)
  return result
}

// Основная функция инициализации платежа
export const initYooKassaPayment = async (planId, billingPeriod, userEmail, onSuccess, onError) => {
  try {
    console.log('Инициализируем платеж YooKassa...')

    // Загружаем YooKassa SDK
    await loadYooKassaSDK()

    // Создаем платеж через Netlify Functions
    const paymentResponse = await createYooKassaPayment(planId, billingPeriod, userEmail)

    if (!paymentResponse.confirmation?.confirmation_token) {
      throw new Error('Не получен confirmation_token от YooKassa')
    }

    // Инициализируем виджет
    const checkout = new window.YooMoneyCheckoutWidget({
      confirmation_token: paymentResponse.confirmation.confirmation_token,
      return_url: `${PAYMENT_CONFIG.returnUrl}?plan=${planId}&period=${billingPeriod}&payment_id=${paymentResponse.id}`,
      error_callback: function(error) {
        console.error('YooKassa widget error:', error)
        if (onError) onError(error.message || 'Ошибка виджета оплаты')
      }
    })

    // Отображаем виджет
    checkout.render('yookassa-payment-form')
      .then(() => {
        console.log('Виджет YooKassa загружен успешно')
        if (onSuccess) onSuccess(paymentResponse)
      })
      .catch((error) => {
        console.error('Ошибка отображения виджета:', error)
        if (onError) onError('Ошибка отображения платежной формы')
      })

    return checkout

  } catch (error) {
    console.error('Ошибка создания платежа:', error)
    if (onError) onError(error.message || 'Ошибка при создании платежа')
    throw error
  }
}

// Проверка статуса платежа через Netlify Functions
export const checkPaymentStatus = async (paymentId) => {
  const response = await fetch(`${PAYMENT_CONFIG.checkStatusUrl}?paymentId=${paymentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Ошибка проверки статуса: ${response.status}`)
  }

  return await response.json()
}
