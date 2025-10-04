import { useState, useEffect } from 'react'

export const useLocalStorage = (key, initialValue) => {
  // Получаем значение из localStorage или используем начальное
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Ошибка чтения localStorage ключ "${key}":`, error)
      return initialValue
    }
  })

  // Функция для сохранения значения
  const setValue = (value) => {
    try {
      // Позволяет передавать функцию как в обычном useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      // Сохраняем в localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore))

      // Треким сохранение для аналитики
      if (window.gtag) {
        window.gtag('event', 'data_saved', {
          storage_key: key,
          data_size: JSON.stringify(valueToStore).length
        })
      }
    } catch (error) {
      console.error(`Ошибка сохранения в localStorage ключ "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

// Хелпер для очистки данных
export const clearStoredData = (key) => {
  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.error(`Ошибка удаления из localStorage ключ "${key}":`, error)
  }
}

// Хелпер для получения всех сохраненных ключей проекта
export const getStoredKeys = () => {
  try {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('metricspace_')) {
        keys.push(key)
      }
    }
    return keys
  } catch (error) {
    console.error('Ошибка получения ключей localStorage:', error)
    return []
  }
}
