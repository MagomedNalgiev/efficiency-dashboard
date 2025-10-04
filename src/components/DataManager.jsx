import { useState } from 'react'
import Header from "@components/Header"
import { getStoredKeys, clearStoredData } from "@hooks/useLocalStorage"
import { trackEvent } from "@utils/analytics"

export default function DataManager() {
  const [keys, setKeys] = useState(getStoredKeys())

  const refreshKeys = () => {
    setKeys(getStoredKeys())
  }

  const clearSpecificData = (key) => {
    if (confirm(`Удалить данные для ${key.replace('metricspace_', '')}?`)) {
      clearStoredData(key)
      refreshKeys()
      trackEvent('specific_data_cleared', { storage_key: key })
    }
  }

  const clearAllData = () => {
    if (confirm('Удалить ВСЕ сохраненные данные? Это действие нельзя отменить!')) {
      keys.forEach(key => clearStoredData(key))
      refreshKeys()
      trackEvent('all_data_cleared', { keys_count: keys.length })
    }
  }

  const getDataSize = (key) => {
    try {
      const data = localStorage.getItem(key)
      return data ? `${(data.length / 1024).toFixed(1)} KB` : '0 KB'
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">Управление данными</h1>
          <p className="text-white/80 mb-8">
            Управляйте сохраненными данными калькуляторов. Данные хранятся локально в вашем браузере.
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            {keys.length === 0 ? (
              <p className="text-white/70 text-center py-8">
                Сохраненных данных пока нет. Используйте калькуляторы, чтобы данные появились здесь.
              </p>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">Сохраненные данные</h3>
                  <div className="space-y-3">
                    {keys.map(key => (
                      <div key={key} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <div>
                          <span className="text-white font-medium">
                            {key.replace('metricspace_', '').replace('_data', '')}
                          </span>
                          <span className="text-white/50 ml-2 text-sm">
                            ({getDataSize(key)})
                          </span>
                        </div>
                        <button
                          onClick={() => clearSpecificData(key)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Удалить
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/20 pt-6">
                  <button
                    onClick={clearAllData}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
                  >
                    Очистить все данные
                  </button>
                  <button
                    onClick={refreshKeys}
                    className="ml-4 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
                  >
                    Обновить список
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
