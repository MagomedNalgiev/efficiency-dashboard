// netlify/functions/create-payment.js
export default async (request, context) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await request.json()
    const { amount, description, planId, billingPeriod, userEmail } = body

    // В тестовом режиме возвращаем mock данные
    const mockResponse = {
      payment_id: `test_${Date.now()}`,
      confirmation_token: `ct-test-${Date.now()}`,
      status: 'pending',
      test_mode: true
    }

    console.log('Mock payment created:', mockResponse)

    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    console.error('Payment creation error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = {
  path: "/api/payments/create"
}
