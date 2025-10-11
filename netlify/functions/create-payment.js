import crypto from 'node:crypto'

export async function handler(event, context) {
  // CORS заголовки
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  // Обработка preflight запроса
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    }
  }

  try {
    const { planId, billingPeriod, userEmail } = JSON.parse(event.body)

    // Получаем ключи из переменных окружения
    const shopId = process.env.YOOKASSA_SHOP_ID
    const secretKey = process.env.YOOKASSA_SECRET_KEY

    if (!shopId || !secretKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'YooKassa credentials not configured' })
      }
    }

    // Конфигурация планов
    const plans = {
      pro: {
        monthly: { amount: 990.00, description: 'Metricspace Pro - месячная подписка' },
        yearly: { amount: 9900.00, description: 'Metricspace Pro - годовая подписка (скидка 17%)' }
      },
      enterprise: {
        monthly: { amount: 4990.00, description: 'Metricspace Enterprise - месячная подписка' },
        yearly: { amount: 49900.00, description: 'Metricspace Enterprise - годовая подписка (скидка 17%)' }
      }
    }

    const plan = plans[planId.toLowerCase()]
    if (!plan || !plan[billingPeriod]) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid plan or billing period' })
      }
    }

    const paymentData = {
      amount: {
        value: plan[billingPeriod].amount.toString(),
        currency: 'RUB'
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

    // Создаем идемпотентный ключ
    const idempotenceKey = crypto.randomUUID()

    // Запрос к YooKassa API
    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey
      },
      body: JSON.stringify(paymentData)
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('YooKassa API error:', result)
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'Payment creation failed', details: result })
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    }

  } catch (error) {
    console.error('Payment function error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}
