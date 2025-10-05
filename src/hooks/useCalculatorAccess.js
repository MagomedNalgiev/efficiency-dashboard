import { useSubscription } from '../contexts/SubscriptionContext'
import { useAuth } from '../contexts/AuthContext'
import { trackEvent } from '../utils/analytics'

export const useCalculatorAccess = (calculatorId) => {
  const { checkAccess, checkCalculationLimit, recordCalculation } = useSubscription()
  const { isAuthenticated } = useAuth()

  const hasAccess = checkAccess(calculatorId)
  const limitCheck = checkCalculationLimit()
  const canCalculate = hasAccess && limitCheck.allowed

  const performCalculation = (calculationFunction) => {
    if (!canCalculate) {
      trackEvent('calculation_blocked', {
        calculator_id: calculatorId,
        reason: !hasAccess ? 'no_access' : 'limit_exceeded'
      })
      return null
    }

    // Выполняем расчет
    const result = calculationFunction()

    // Записываем использование
    recordCalculation(calculatorId)

    return result
  }

  return {
    hasAccess,
    canCalculate,
    remainingCalculations: limitCheck.remaining,
    calculationLimit: limitCheck.limit,
    performCalculation
  }
}
