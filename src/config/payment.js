// Конфигурация платежной системы YooKassa
export const PAYMENT_CONFIG = {
  // Данные из личного кабинета YooKassa
  shopId: import.meta.env.VITE_YUKASSA_SHOP_ID || '1178919',
  testShopId: import.meta.env.VITE_YUKASSA_TEST_SHOP_ID || '1181171',

  // Режим работы (test/production)
  mode: import.meta.env.VITE_PAYMENT_MODE || 'test',

  // API для создания платежей
  paymentApiUrl: import.meta.env.VITE_PAYMENT_API_URL || 'http://metricspace.ru/api',

  // URL для возврата после оплаты
  returnUrl: window.location.origin + '/payment/success',

  // URL для уведомлений (webhook)
  webhookUrl: import.meta.env.VITE_PAYMENT_API_URL + '/webhook/yookassa',

  // Конфигурация планов
  plans: {
    PRO: {
      monthly: {
        amount: 990.00,
        description: 'Metricspace Pro - месячная подписка'
      },
      yearly: {
        amount: 9900.00,
        description: 'Metricspace Pro - годовая подписка (скидка 17%)'
      }
    },
    ENTERPRISE: {
      monthly: {
        amount: 4990.00,
        description: 'Metricspace Enterprise - месячная подписка'
      },
      yearly: {
        amount: 49900.00,
        description: 'Metricspace Enterprise - годовая подписка (скидка 17%)'
      }
    }
  }
}

// Функция для создания платежа через ваш backend
export const createPayment = async (planId, billingPeriod, userEmail) => {
  const plan = PAYMENT_CONFIG.plans[planId]
  if (!plan || !plan[billingPeriod]) {
    throw new Error('Неверный план или период оплаты')
  }

  const paymentData = {
    amount: plan[billingPeriod].amount,
    currency: 'RUB',
    description: plan[billingPeriod].description,
    planId,
    billingPeriod,
    userEmail,
    returnUrl: `${PAYMENT_CONFIG.returnUrl}?plan=${planId}&period=${billingPeriod}`,
    mode: PAYMENT_CONFIG.mode
  }

  try {
    const response = await fetch(`${PAYMENT_CONFIG.paymentApiUrl}/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Payment creation failed:', error)
    throw error
  }
}

// Функция для инициализации виджета YooKassa
export const initYooKassaPayment = async (planId, billingPeriod, userEmail, onSuccess, onError) => {
  try {
    // Проверяем, что YooCheckout доступен
    if (!window.YooMoneyCheckoutWidget) {
      throw new Error('YooKassa SDK не загружен')
    }

    console.log('Создаем платеж через backend...')

    // Создаем платеж через ваш backend
    const paymentResponse = await createPayment(planId, billingPeriod, userEmail)

    if (!paymentResponse.confirmation_token) {
      throw new Error('Не получен confirmation_token от сервера')
    }

    console.log('Платеж создан, инициализируем виджет...')

    // Инициализируем виджет
    const checkout = new window.YooMoneyCheckoutWidget({
      confirmation_token: paymentResponse.confirmation_token,
      return_url: `${PAYMENT_CONFIG.returnUrl}?plan=${planId}&period=${billingPeriod}&payment_id=${paymentResponse.payment_id}`,
      error_callback: function(error) {
        console.error('YooKassa widget error:', error)
        onError(error.message || 'Ошибка при создании платежа')
      }
    })

    // Отображаем виджет
    checkout.render('yookassa-payment-form')
      .then(() => {
        console.log('Виджет YooKassa загружен успешно')
        if (onSuccess) {
          onSuccess(paymentResponse)
        }
      })
      .catch((error) => {
        console.error('Ошибка отображения виджета:', error)
        onError('Ошибка отображения платежной формы')
      })

    return checkout

  } catch (error) {
    console.error('Ошибка инициализации платежа:', error)
    onError(error.message || 'Ошибка при создании платежа')
  }
}
