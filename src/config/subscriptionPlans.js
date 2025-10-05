// Конфигурация планов подписки
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Бесплатный',
    price: 0,
    priceMonthly: 0,
    priceYearly: 0,
    description: 'Для знакомства с платформой',
    features: [
      'Доступ к 3 калькуляторам',
      '5 расчетов в месяц',
      'Базовые графики',
      'Экспорт в CSV'
    ],
    limits: {
      calculators: ['velocity', 'cycletime', 'mttr'], // Только эти калькуляторы
      calculationsPerMonth: 5,
      dataExport: true,
      advancedCharts: false,
      dataHistory: 7 // дней
    },
    recommended: false
  },

  PRO: {
    id: 'pro',
    name: 'Профессиональный',
    price: 990,
    priceMonthly: 990,
    priceYearly: 9900, // скидка 17%
    description: 'Для профессионалов и команд',
    features: [
      'Все 13 калькуляторов',
      'Безлимитные расчеты',
      'Расширенная аналитика',
      'Экспорт во все форматы',
      'История данных 90 дней',
      'Приоритетная поддержка'
    ],
    limits: {
      calculators: 'all',
      calculationsPerMonth: 'unlimited',
      dataExport: true,
      advancedCharts: true,
      dataHistory: 90 // дней
    },
    recommended: true
  },

  ENTERPRISE: {
    id: 'enterprise',
    name: 'Корпоративный',
    price: 4990,
    priceMonthly: 4990,
    priceYearly: 49900, // скидка 17%
    description: 'Для больших команд и компаний',
    features: [
      'Все возможности Pro',
      'API доступ',
      'Белый лейбл',
      'Интеграции с Jira, Slack',
      'Неограниченная история',
      'Персональный менеджер',
      'SLA 99.9%'
    ],
    limits: {
      calculators: 'all',
      calculationsPerMonth: 'unlimited',
      dataExport: true,
      advancedCharts: true,
      dataHistory: 'unlimited',
      apiAccess: true,
      whiteLabel: true
    },
    recommended: false
  }
}

export const getAvailableCalculators = (planId) => {
  const plan = SUBSCRIPTION_PLANS[planId?.toUpperCase()] || SUBSCRIPTION_PLANS.FREE
  return plan.limits.calculators === 'all'
    ? Object.keys(CALCULATORS_CONFIG)
    : plan.limits.calculators
}

export const canAccessCalculator = (userPlan, calculatorId) => {
  const availableCalculators = getAvailableCalculators(userPlan)
  return availableCalculators === 'all' || availableCalculators.includes(calculatorId)
}

// Конфигурация всех калькуляторов
export const CALCULATORS_CONFIG = {
  velocity: { name: 'Velocity', category: 'Delivery' },
  cycletime: { name: 'Cycle Time', category: 'Delivery' },
  mttr: { name: 'MTTR', category: 'Stability' },
  deploymentfrequency: { name: 'Deployment Frequency', category: 'Delivery' },
  defectleakage: { name: 'Defect Leakage', category: 'Quality' },
  cac: { name: 'CAC', category: 'Marketing' },
  romi: { name: 'ROMI', category: 'Marketing' },
  ltv: { name: 'LTV', category: 'Marketing' },
  ebitda: { name: 'EBITDA', category: 'Finance' },
  ros: { name: 'ROS', category: 'Finance' },
  bep: { name: 'BEP', category: 'Finance' },
  custommetric: { name: 'Custom Metric', category: 'Custom' }
}
