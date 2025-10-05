// Конфигурация платежной системы ЮKassa через CDN
export const PAYMENT_CONFIG = {
  // Тестовые данные (замените на реальные после регистрации в ЮKassa)
  shopId: import.meta.env.VITE_YUKASSA_SHOP_ID || '123456', // ИСПРАВЛЕНО: import.meta.env вместо process.env

  // Настройки для demo режима
  demoMode: true, // Включить для тестирования без реальных платежей

  // URL для возврата после оплаты
  returnUrl: window.location.origin + '/payment/success',

  // Конфигурация планов (синхронизируем с subscriptionPlans.js)
  plans: {
    PRO: {
      monthly: {
        amount: 990.00, // ЮKassa требует decimal
        description: 'Metricspace Pro - месячная подписка'
      },
      yearly: {
        amount: 9900.00, // ЮKassa требует decimal
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

// Функция для инициализации виджета ЮKassa
export const initYooKassaPayment = (planId, billingPeriod, userEmail, onSuccess, onError) => {
  const plan = PAYMENT_CONFIG.plans[planId]
  if (!plan || !plan[billingPeriod]) {
    onError('Неверный план или период оплаты')
    return
  }

  // Проверяем, что YooCheckout доступен
  if (!window.YooCheckout) {
    onError('ЮKassa SDK не загружен')
    return
  }

  const paymentData = {
    amount: plan[billingPeriod].amount,
    currency: 'RUB',
    description: plan[billingPeriod].description,

    // Данные получателя для чека
    receipt: {
      customer: {
        email: userEmail
      },
      items: [{
        description: plan[billingPeriod].description,
        amount: plan[billingPeriod].amount,
        vat_code: 1, // НДС не облагается
        quantity: 1
      }]
    },

    // Метаданные для отслеживания
    metadata: {
      user_email: userEmail,
      plan_id: planId,
      billing_period: billingPeriod,
      source: 'metricspace_web'
    },

    // URL возврата
    confirmation: {
      type: 'redirect',
      return_url: `${PAYMENT_CONFIG.returnUrl}?plan=${planId}&period=${billingPeriod}`
    }
  }

  // В demo режиме - симулируем успешный платеж
  if (PAYMENT_CONFIG.demoMode) {
    console.log('DEMO MODE: Симулируем успешный платеж', paymentData)

    // Симулируем задержку платежной системы
    setTimeout(() => {
      // Сохраняем информацию о "платеже" для демо
      localStorage.setItem('demo_payment', JSON.stringify({
        paymentId: `demo_${Date.now()}`,
        planId,
        billingPeriod,
        amount: plan[billingPeriod].amount,
        timestamp: Date.now(),
        status: 'succeeded'
      }))

      // Перенаправляем на страницу успеха
      window.location.href = `${PAYMENT_CONFIG.returnUrl}?plan=${planId}&period=${billingPeriod}&payment_id=demo_${Date.now()}&demo=true`
    }, 2000)

    return
  }

  // Реальный режим - используем ЮKassa виджет
  try {
    const checkout = new window.YooCheckout({
      shopId: PAYMENT_CONFIG.shopId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      description: paymentData.description,
      receipt: paymentData.receipt,
      metadata: paymentData.metadata,
      confirmation: paymentData.confirmation
    })

    checkout.render('yookassa-payment')

    checkout.on('success', (payment) => {
      onSuccess(payment)
    })

    checkout.on('error', (error) => {
      onError(error.message || 'Ошибка при создании платежа')
    })

  } catch (error) {
    onError('Ошибка инициализации платежа: ' + error.message)
  }
}
