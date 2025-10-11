const crypto = require('crypto')
const fetch = require('node-fetch') // Убедитесь, что в package.json добавлен node-fetch

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
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

    const shopId = process.env.YOOKASSA_SHOP_ID
    const secretKey = process.env.YOOKASSA_SECRET_KEY

    if (!shopId || !secretKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'YooKassa credentials not configured' })
      }
    }

    // Определение тарифов
    const plans = {
      pro: {
        monthly: { amount: 990.00, description: 'Metricspace Pro – месячная подписка' },
        yearly: { amount: 9900.00, description: 'Metricspace Pro – годовая подписка (скидка 17%)' }
      },
      enterprise: {
        monthly: { amount: 4990.00, description: 'Metricspace Enterprise – месячная подписка' },
        yearly: { amount: 49900.00, description: 'Metricspace Enterprise – годовая подписка (скидка 17%)' }
      }
    }

    const planKey = planId.toLowerCase()
    if (!plans[planKey] || !plans[planKey][billingPeriod]) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid plan or billing period' })
      }
    }

    const { amount, description } = plans[planKey][billingPeriod]

    // Формирование данных платежа с обязательным разделом receipt
    const paymentData = {
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB'
      },
      confirmation: {
        type: 'embedded'
      },
      capture: true,
      description,
      metadata: {
        plan_id: planId,
        billing_period: billingPeriod,
        user_email: userEmail,
        source: 'metricspace_web'
      },
      receipt: {
        customer: {
          email: userEmail
        },
        items: [
          {
            description,
            quantity: 1.00,
            amount: {
              value: amount.toFixed(2),
              currency: 'RUB'
            },
            vat_code: 2 // Код НДС 20%
          }
        ],
        tax_system_code: 1 // Общая система налогообложения
      },
      send: true // Отправить чек на почту покупателя
    }

    const idempotenceKey = crypto.randomUUID()

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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    }
  }
}
