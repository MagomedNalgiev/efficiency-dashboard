import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// YooKassa конфигурация
const YOOKASSA_CONFIG = {
  shopId: process.env.YOOKASSA_SHOP_ID,
  secretKey: process.env.YOOKASSA_SECRET_KEY,
  testShopId: process.env.YOOKASSA_TEST_SHOP_ID,
  testSecretKey: process.env.YOOKASSA_TEST_SECRET_KEY,
  apiUrl: 'https://api.yookassa.ru/v3'
}

// Функция для создания базовой аутентификации
const getAuthHeader = (mode = 'production') => {
  const shopId = mode === 'test' ? YOOKASSA_CONFIG.testShopId : YOOKASSA_CONFIG.shopId
  const secretKey = mode === 'test' ? YOOKASSA_CONFIG.testSecretKey : YOOKASSA_CONFIG.secretKey

  const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64')
  return `Basic ${auth}`
}

// Создание платежа
app.post('/api/payments/create', async (req, res) => {
  try {
    const { amount, currency = 'RUB', description, planId, billingPeriod, userEmail, returnUrl, mode = 'test' } = req.body

    if (!amount || !description || !userEmail) {
      return res.status(400).json({ error: 'Недостающие обязательные поля' })
    }

    // Генерируем ключ идемпотентности
    const idempotenceKey = crypto.randomUUID()

    const paymentData = {
      amount: {
        value: amount.toString(),
        currency
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
      }
    }

    console.log('Создаем платеж в YooKassa:', paymentData)

    const response = await fetch(`${YOOKASSA_CONFIG.apiUrl}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(mode),
        'Idempotence-Key': idempotenceKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error('YooKassa error:', responseData)
      return res.status(response.status).json({
        error: 'Ошибка создания платежа',
        details: responseData
      })
    }

    console.log('Платеж создан:', responseData.id)

    res.json({
      payment_id: responseData.id,
      confirmation_token: responseData.confirmation.confirmation_token,
      status: responseData.status
    })

  } catch (error) {
    console.error('Ошибка создания платежа:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Проверка статуса платежа
app.get('/api/payments/status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params
    const mode = req.query.mode || 'test'

    const response = await fetch(`${YOOKASSA_CONFIG.apiUrl}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(mode),
        'Content-Type': 'application/json'
      }
    })

    const paymentData = await response.json()

    if (!response.ok) {
      console.error('YooKassa payment status error:', paymentData)
      return res.status(response.status).json({
        error: 'Ошибка получения статуса платежа',
        details: paymentData
      })
    }

    res.json({
      payment_id: paymentData.id,
      status: paymentData.status,
      paid: paymentData.paid,
      amount: paymentData.amount,
      metadata: paymentData.metadata
    })

  } catch (error) {
    console.error('Ошибка проверки статуса:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Webhook для уведомлений от YooKassa
app.post('/api/webhook/yookassa', async (req, res) => {
  try {
    const { type, event, object } = req.body

    console.log('Получено уведомление от YooKassa:', { type, event, payment_id: object?.id })

    if (type !== 'notification') {
      return res.status(400).json({ error: 'Неверный тип уведомления' })
    }

    // Обрабатываем успешный платеж
    if (event === 'payment.succeeded') {
      const payment = object
      const metadata = payment.metadata || {}

      console.log('Платеж успешно завершен:', {
        payment_id: payment.id,
        user_email: metadata.user_email,
        plan_id: metadata.plan_id,
        billing_period: metadata.billing_period
      })

      // Здесь можно обновить статус подписки в базе данных
      // или отправить уведомление пользователю


      res.json({ received: true })
    } else if (event === 'payment.canceled') {
      console.log('Платеж отменен:', object.id)
      res.json({ received: true })
    } else {
      console.log('Неизвестное событие:', event)
      res.json({ received: true })
    }

  } catch (error) {
    console.error('Ошибка обработки webhook:', error)
    res.status(500).json({ error: 'Ошибка обработки уведомления' })
  }
})

// Проверка работоспособности сервера
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Payment backend запущен на порту ${PORT}`)
  console.log(`Режим: ${process.env.NODE_ENV || 'development'}`)
})


