import { useState, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { trackCalculatorUsage, trackEvent } from '@utils/analytics'

export const useCalculator = (calculatorType, initialData, storageKey) => {
  const [data, setData] = useLocalStorage(storageKey, initialData)
  const [results, setResults] = useState([])
  const [lastSaved, setLastSaved] = useState(null)
  const [isModified, setIsModified] = useState(false)
  const [hasCalculated, setHasCalculated] = useState(false)

  const updateData = (newData) => {
    setData(newData)
    setIsModified(true)
    setLastSaved(Date.now())
  }

  const calculate = (calculationFunction, shouldTrack = true) => {
    const calculatedResults = calculationFunction(data)
    setResults(calculatedResults)
    setIsModified(false)
    setHasCalculated(true)

    if (shouldTrack) {
      trackCalculatorUsage(calculatorType)
      trackEvent('calculation_completed', {
        calculator: calculatorType,
        data_points: Array.isArray(data) ? data.length : Object.keys(data).length,
        has_results: Array.isArray(calculatedResults)
          ? calculatedResults.some(r => r > 0)
          : calculatedResults > 0
      })
    }
  }

  const clearAllData = () => {
    if (confirm('Очистить все данные? Это действие нельзя отменить.')) {
      setData(initialData)
      setResults([])
      setLastSaved(Date.now())
      setIsModified(false)
      setHasCalculated(false)

      trackEvent('data_cleared', {
        calculator: calculatorType
      })
    }
  }

  const addItem = (newItem) => {
    if (Array.isArray(data)) {
      const newData = [...data, newItem]
      updateData(newData)

      trackEvent('item_added', {
        calculator: calculatorType,
        total_items: newData.length
      })
    }
  }

  const removeItem = (index) => {
    if (Array.isArray(data) && data.length > 1) {
      const newData = data.filter((_, i) => i !== index)
      updateData(newData)

      trackEvent('item_removed', {
        calculator: calculatorType,
        total_items: newData.length
      })
    }
  }

  const updateItem = (index, field, value) => {
    if (Array.isArray(data)) {
      const updated = [...data]
      if (field) {
        updated[index][field] = value
      } else {
        updated[index] = value
      }
      updateData(updated)
    }
  }

  return {
    data,
    results,
    lastSaved,
    isModified,
    hasCalculated,
    updateData,
    calculate,
    clearAllData,
    addItem,
    removeItem,
    updateItem
  }
}
