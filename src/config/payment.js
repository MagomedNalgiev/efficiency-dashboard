// Конфигурация платежной системы YooKassa - ТОЛЬКО PRODUCTION
export const PAYMENT_CONFIG = {
  // Данные из переменных окружения
  shopId: import.meta.env.VITE_YOOKASSA_SHOP_ID,
  secretKey: import.meta.env.VITE_YOOKASSA_SECRET_KEY,

  // URL для возврата после оплаты
  returnUrl: window.location.origin + '/payment/success',

  // YooKassa API
  apiUrl: 'https://api.yookassa.ru/v3',

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

// Функция создания реального платежа YooKassa
export const createYooKassaPayment = async (planId, billingPeriod, userEmail) => {
  const plan = PAYMENT_CONFIG.plans[planId.toLowerCase()]
  if (!plan || !plan[billingPeriod]) {
    throw new Error('Неверный план или период оплаты')
  }

  if (!PAYMENT_CONFIG.shopId || !PAYMENT_CONFIG.secretKey) {
    throw new Error('Не настроены ключи YooKassa. Обратитесь к администратору.')
  }

  const paymentData = {
    amount: {
      value: plan[billingPeriod].amount.toString(),
      currency: plan[billingPeriod].currency
    },
    confirmation: {
      type: 'embedded'
    },
    capture: true,
    description: plan[billingPeriod].description,
    metadata: {
      plan_id: planId,
      billing_period: billingPeriod,
      user_email: userEmail,
      source: 'metricspace_web'
    }
  }

  console.log('Создаем платеж YooKassa:', { planId, billingPeriod, amount: paymentData.amount })

  const response = await fetch(`${PAYMENT_CONFIG.apiUrl}/payments`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(PAYMENT_CONFIG.shopId + ':' + PAYMENT_CONFIG.secretKey)}`,
      'Content-Type': 'application/json',
      'Idempotence-Key': crypto.randomUUID()
    },
    body: JSON.stringify(paymentData)
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('YooKassa API error:', response.status, errorData)
    throw new Error(`Ошибка создания платежа: ${response.status}`)
  }

  const result = await response.json()
  console.log('Платеж создан:', result.id)
  return result
}

// Основная функция инициализации платежа - ТОЛЬКО PRODUCTION
export const initYooKassaPayment = async (planId, billingPeriod, userEmail, onSuccess, onError) => {
  try {
    console.log('Инициализируем реальный платеж YooKassa...')

    // Загружаем YooKassa SDK
    await loadYooKassaSDK()

    // Создаем платеж через YooKassa API
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

// Проверка статуса платежа
export const checkPaymentStatus = async (paymentId) => {
  if (!PAYMENT_CONFIG.shopId || !PAYMENT_CONFIG.secretKey) {
    throw new Error('Не настроены ключи YooKassa')
  }

  const response = await fetch(`${PAYMENT_CONFIG.apiUrl}/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${btoa(PAYMENT_CONFIG.shopId + ':' + PAYMENT_CONFIG.secretKey)}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Ошибка проверки статуса: ${response.status}`)
  }

  return await response.json()
}
