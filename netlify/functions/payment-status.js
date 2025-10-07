// netlify/functions/payment-status.js
export default async (request, context) => {
  const url = new URL(request.url)
  const paymentId = url.pathname.split('/').pop()

  if (!paymentId) {
    return new Response(JSON.stringify({ error: 'Payment ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Mock статус для тестирования
  const mockStatus = {
    payment_id: paymentId,
    status: 'succeeded',
    paid: true,
    amount: { value: '990.00', currency: 'RUB' },
    test_mode: true
  }

  return new Response(JSON.stringify(mockStatus), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
}

export const config = {
  path: "/api/payments/status/*"
}
