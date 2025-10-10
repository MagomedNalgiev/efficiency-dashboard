// Конфигурация платежной системы YooKassa
export const PAYMENT_CONFIG = {
  // Данные из переменных окружения
  shopId: import.meta.env.VITE_YOOKASSA_SHOP_ID,
  secretKey: import.meta.env.VITE_YOOKASSA_SECRET_KEY,
  mode: import.meta.env.VITE_PAYMENT_MODE || 'mock', // 'demo' или 'production'

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

// Функция создания реального платежа YooKassa
export const createYooKassaPayment = async (planId, billingPeriod, userEmail) => {
  const plan = PAYMENT_CONFIG.plans[planId.toLowerCase()]
  if (!plan || !plan[billingPeriod]) {
    throw new Error('Неверный план или период оплаты')
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
      user_email: userEmail
    }
  }

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
    throw new Error('Ошибка создания платежа')
  }

  return await response.json()
}

// Основная функция инициализации платежа
export const initYooKassaPayment = async (planId, billingPeriod, userEmail, onSuccess, onError) => {
  try {
    // В демо-режиме используем mock
    if (PAYMENT_CONFIG.mode === 'demo') {
      return await initMockPayment(planId, billingPeriod, userEmail, onSuccess, onError)
    }

    // Реальный режим - создаем платеж через YooKassa
    console.log('Создаем реальный платеж YooKassa...')

    const paymentResponse = await createYooKassaPayment(planId, billingPeriod, userEmail)

    if (!paymentResponse.confirmation?.confirmation_token) {
      throw new Error('Не получен confirmation_token от YooKassa')
    }

    // Загружаем YooKassa виджет
    if (!window.YooMoneyCheckoutWidget) {
      await loadYooKassaSDK()
    }

    // Инициализируем виджет
    const checkout = new window.YooMoneyCheckoutWidget({
      confirmation_token: paymentResponse.confirmation.confirmation_token,
      return_url: `${PAYMENT_CONFIG.returnUrl}?plan=${planId}&period=${billingPeriod}&payment_id=${paymentResponse.id}`
    })

    // Отображаем виджет
    checkout.render('yookassa-payment-form')

    if (onSuccess) {
      onSuccess(paymentResponse)
    }

    return checkout

  } catch (error) {
    console.error('Ошибка создания платежа:', error)
    if (onError) onError(error.message)
  }
}

// Загрузка YooKassa SDK
function loadYooKassaSDK() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://yookassa.ru/checkout-widget/v1/checkout-widget.js'
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// Mock функции остаются без изменений для демо-режима
export const createMockPayment = async (planId, billingPeriod, userEmail) => {
  const plan = PAYMENT_CONFIG.plans[planId.toLowerCase()]
  if (!plan || !plan[billingPeriod]) {
    throw new Error('Неверный план или период оплаты')
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        payment_id: `mock_${Date.now()}`,
        confirmation_token: `ct-mock-${Date.now()}`,
        status: 'pending',
        amount: plan[billingPeriod].amount,
        description: plan[billingPeriod].description,
        test_mode: true
      })
    }, 1000)
  })
}

export const initMockPayment = async (planId, billingPeriod, userEmail, onSuccess, onError) => {
  try {
    console.log('Инициализируем DEMO платеж для:', planId, billingPeriod)

    const paymentResponse = await createMockPayment(planId, billingPeriod, userEmail)

    setTimeout(() => {
      if (onSuccess) onSuccess(paymentResponse)
    }, 500)

    return {
      render: (containerId) => {
        const container = document.getElementById(containerId)
        if (!container) return

        const planInfo = PAYMENT_CONFIG.plans[planId.toLowerCase()]
        const planData = planInfo[billingPeriod]

        container.innerHTML = `
          <div class="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg border-2 border-dashed border-blue-300">
            <div class="text-center">
              <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">🧪 DEMO Режим</h3>
              <p class="text-sm text-gray-600 mb-4">Тестирование без реальной оплаты</p>
              <div class="space-y-3">
                <div class="bg-white p-3 rounded border">
                  <p class="font-medium">${planData.description}</p>
                  <p class="text-2xl font-bold text-blue-600">${planData.amount} ₽</p>
                </div>
                <button
                  id="mock-pay-button"
                  class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                >
                  🎯 ДЕМО ОПЛАТА (Успешно)
                </button>
                <button
                  id="mock-fail-button"
                  class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  ❌ ДЕМО ОШИБКА
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-3">Это демо режим для тестирования интерфейса</p>
            </div>
          </div>
        `

        document.getElementById('mock-pay-button')?.addEventListener('click', () => {
          container.innerHTML = `
            <div class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Обрабатываем платеж...</p>
            </div>
          `

          setTimeout(() => {
            window.location.href = `${PAYMENT_CONFIG.returnUrl}?plan=${planId}&period=${billingPeriod}&payment_id=${paymentResponse.payment_id}&demo=true`
          }, 2000)
        })

        document.getElementById('mock-fail-button')?.addEventListener('click', () => {
          if (onError) {
            onError('Демо ошибка оплаты')
          }
        })
      },
      destroy: () => {
        console.log('Mock widget destroyed')
      }
    }

  } catch (error) {
    console.error('Ошибка mock платежа:', error)
    if (onError) onError(error.message)
  }
}
