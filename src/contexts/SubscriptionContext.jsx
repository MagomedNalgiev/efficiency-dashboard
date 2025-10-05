import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { SUBSCRIPTION_PLANS, canAccessCalculator } from '../config/subscriptionPlans'
import { useAuth } from './AuthContext'
import { trackEvent } from '../utils/analytics'

const SubscriptionContext = createContext()

const subscriptionReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SUBSCRIPTION':
      return {
        ...state,
        currentPlan: action.payload.plan,
        usage: action.payload.usage || state.usage,
        loading: false
      }
    case 'UPDATE_USAGE':
      return {
        ...state,
        usage: {
          ...state.usage,
          ...action.payload
        }
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    default:
      return state
  }
}

const initialState = {
  currentPlan: 'FREE',
  usage: {
    calculationsThisMonth: 0,
    lastCalculationDate: null
  },
  loading: false
}

export const SubscriptionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState)
  const { user, isAuthenticated } = useAuth()

  // Загружаем информацию о подписке при аутентификации
  useEffect(() => {
    if (isAuthenticated && user) {
      loadSubscriptionInfo()
    } else {
      // Для неавторизованных пользователей - FREE план
      dispatch({
        type: 'SET_SUBSCRIPTION',
        payload: { plan: 'FREE' }
      })
    }
  }, [isAuthenticated, user])

  const loadSubscriptionInfo = () => {
    dispatch({ type: 'SET_LOADING', payload: true })

    // В реальном приложении - запрос к API
    // Пока используем localStorage для mock данных
    const userPlan = user?.plan || 'FREE'
    const usage = JSON.parse(localStorage.getItem(`usage_${user.id}`) || '{}')

    dispatch({
      type: 'SET_SUBSCRIPTION',
      payload: {
        plan: userPlan.toUpperCase(),
        usage: {
          calculationsThisMonth: usage.calculationsThisMonth || 0,
          lastCalculationDate: usage.lastCalculationDate
        }
      }
    })
  }

  const checkAccess = (calculatorId) => {
    return canAccessCalculator(state.currentPlan, calculatorId)
  }

  const checkCalculationLimit = () => {
    const plan = SUBSCRIPTION_PLANS[state.currentPlan]

    if (plan.limits.calculationsPerMonth === 'unlimited') {
      return { allowed: true }
    }

    const currentMonth = new Date().getMonth()
    const lastCalculationMonth = state.usage.lastCalculationDate
      ? new Date(state.usage.lastCalculationDate).getMonth()
      : null

    // Сброс счетчика если новый месяц
    let calculationsCount = state.usage.calculationsThisMonth
    if (lastCalculationMonth !== null && lastCalculationMonth !== currentMonth) {
      calculationsCount = 0
    }

    const allowed = calculationsCount < plan.limits.calculationsPerMonth
    const remaining = plan.limits.calculationsPerMonth - calculationsCount

    return { allowed, remaining, limit: plan.limits.calculationsPerMonth }
  }

  const recordCalculation = (calculatorId) => {
    const currentDate = new Date().toISOString()
    const currentMonth = new Date().getMonth()
    const lastCalculationMonth = state.usage.lastCalculationDate
      ? new Date(state.usage.lastCalculationDate).getMonth()
      : null

    let newCount = state.usage.calculationsThisMonth + 1

    // Сброс счетчика если новый месяц
    if (lastCalculationMonth !== null && lastCalculationMonth !== currentMonth) {
      newCount = 1
    }

    const newUsage = {
      calculationsThisMonth: newCount,
      lastCalculationDate: currentDate
    }

    // Сохраняем в localStorage (в реальном приложении - отправка на сервер)
    if (user?.id) {
      localStorage.setItem(`usage_${user.id}`, JSON.stringify(newUsage))
    }

    dispatch({
      type: 'UPDATE_USAGE',
      payload: newUsage
    })

    trackEvent('calculation_performed', {
      calculator_id: calculatorId,
      user_plan: state.currentPlan,
      calculations_this_month: newCount
    })
  }

  const upgradePlan = async (newPlanId) => {
    // В реальном приложении - запрос к API оплаты
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      // Симуляция API вызова
      await new Promise(resolve => setTimeout(resolve, 1000))

      dispatch({
        type: 'SET_SUBSCRIPTION',
        payload: { plan: newPlanId.toUpperCase() }
      })

      trackEvent('plan_upgraded', {
        from_plan: state.currentPlan,
        to_plan: newPlanId,
        user_id: user?.id
      })

      return { success: true }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      throw error
    }
  }

  const value = {
    ...state,
    currentPlanInfo: SUBSCRIPTION_PLANS[state.currentPlan],
    checkAccess,
    checkCalculationLimit,
    recordCalculation,
    upgradePlan,
    loadSubscriptionInfo
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
