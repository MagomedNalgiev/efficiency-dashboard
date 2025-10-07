// Конфигурация платежной системы YooKassa
export const PAYMENT_CONFIG = {
  // Тестовый режим для продакшн сайта
  mode: 'mock', // ИЗМЕНЕНО: используем mock режим

  // URL для возврата после оплаты
  returnUrl: window.location.origin + '/payment/success',

  // Конфигурация планов (ИСПРАВЛЕНО: строчные ID как в subscriptionPlans.js)
  plans: {
    pro: {  // ИСПРАВЛЕНО: было PRO, стало pro
      monthly: {
        amount: 990.00,
        description: 'Metricspace Pro - месячная подписка'
      },
      yearly: {
        amount: 9900.00,
        description: 'Metricspace Pro - годовая подписка (скидка 17%)'
      }
    },
    enterprise: {  // ИСПРАВЛЕНО: было ENTERPRISE, стало enterprise
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

// НОВАЯ функция для создания mock платежа
export const createMockPayment = async (planId, billingPeriod, userEmail) => {
  const plan = PAYMENT_CONFIG.plans[planId.toLowerCase()]  // ИСПРАВЛЕНО: приводим к нижнему регистру
  if (!plan || !plan[billingPeriod]) {
    throw new Error('Неверный план или период оплаты')
  }

  // Симулируем запрос к серверу
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockResponse = {
        payment_id: `mock_${Date.now()}`,
        confirmation_token: `ct-mock-${Date.now()}`,
        status: 'pending',
        amount: plan[billingPeriod].amount,
        description: plan[billingPeriod].description,
        test_mode: true
      }

      console.log('Mock payment created:', mockResponse)
      resolve(mockResponse)
    }, 1000) // 1 секунда задержки для реалистичности
  })
}

// НОВАЯ функция для инициализации mock виджета
export const initMockPayment = async (planId, billingPeriod, userEmail, onSuccess, onError) => {
  try {
    console.log('Инициализируем mock платеж для:', planId, billingPeriod)

    const paymentResponse = await createMockPayment(planId, billingPeriod, userEmail)

    // Симулируем успешное создание виджета
    setTimeout(() => {
      console.log('Mock виджет готов')
      if (onSuccess) {
        onSuccess(paymentResponse)
      }
    }, 500)

    // Возвращаем mock объект виджета
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
              <h3 class="text-lg font-semibold text-gray-900 mb-2">DEMO Режим</h3>
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

        // Обработчик успешной оплаты
        document.getElementById('mock-pay-button')?.addEventListener('click', () => {
          container.innerHTML = `
            <div class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Обрабатываем платеж...</p>
            </div>
          `

          setTimeout(() => {
            // Перенаправляем на страницу успеха
            window.location.href = `${PAYMENT_CONFIG.returnUrl}?plan=${planId}&period=${billingPeriod}&payment_id=${paymentResponse.payment_id}&demo=true`
          }, 2000)
        })

        // Обработчик ошибки
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

// Оригинальная функция для реального YooKassa (пока не используется)
export const initYooKassaPayment = async (planId, billingPeriod, userEmail, onSuccess, on
