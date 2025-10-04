import { useState } from "react"
import { Line } from "react-chartjs-2"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import SaveIndicator from "@components/SaveIndicator"
import { useLocalStorage } from "@hooks/useLocalStorage"
import { trackCalculatorUsage, trackEvent } from "@utils/analytics"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const STORAGE_KEY = 'metricspace_custom_metric_data'

export default function CalculatorCustomMetric() {
  const [labels, setLabels] = useLocalStorage(`${STORAGE_KEY}_labels`, "")
  const [values, setValues] = useLocalStorage(`${STORAGE_KEY}_values`, "")
  const [lastSaved, setLastSaved] = useLocalStorage(`${STORAGE_KEY}_saved`, null)
  const [isModified, setIsModified] = useState(false)

  const handleLabelsChange = (newLabels) => {
    setLabels(newLabels)
    setIsModified(true)
    setLastSaved(Date.now())
  }

  const handleValuesChange = (newValues) => {
    setValues(newValues)
    setIsModified(true)
    setLastSaved(Date.now())
  }

  const buildChart = () => {
    setIsModified(false)

    trackCalculatorUsage('custom_metric')
    trackEvent('calculation_completed', {
      calculator: 'custom_metric',
      labels_count: labels.split(',').length,
      values_count: values.split(',').length
    })
  }

  const clearAllData = () => {
    if (confirm('Очистить все данные? Это действие нельзя отменить.')) {
      setLabels("")
      setValues("")
      setLastSaved(Date.now())
      setIsModified(false)

      trackEvent('data_cleared', {
        calculator: 'custom_metric'
      })
    }
  }

  // Парсим данные для графика
  const labelsArray = labels.split(',').map(label => label.trim()).filter(label => label)
  const valuesArray = values.split(',').map(value => parseFloat(value.trim())).filter(value => !isNaN(value))

  const hasValidData = labelsArray.length > 0 && valuesArray.length > 0

  const data = {
    labels: labelsArray,
    datasets: [{
      label: "Пользовательская метрика",
      data: valuesArray,
      borderColor: "rgb(168,85,247)",
      backgroundColor: "rgba(168,85,247,0.3)",
      tension: 0.1,
    }],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#ffffff" } },
      title: { display: true, text: 'Пользовательская метрика', color: '#ffffff' }
    },
    scales: {
      x: { ticks: { color: "#ffffff" }, grid: { color: "rgba(255,255,255,0.1)" } },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
        title: { display: true, text: 'Значения', color: '#ffffff' }
      },
    },
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">Custom Metric</h1>
          <p className="text-white/80 mb-8">
            Введите метки (через запятую) и значения (через запятую), чтобы построить свой собственный график для анализа метрик.
            Данные автоматически сохраняются.
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <div className="space-y-6">
              <div>
                <label className="block text-white mb-2 font-medium">Метки (через запятую):</label>
                <input
                  type="text"
                  value={labels}
                  onChange={(e) => handleLabelsChange(e.target.value)}
                  className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Например: Январь, Февраль, Март, Апрель"
                />
                <p className="text-white/60 text-sm mt-1">
                  Найдено меток: {labelsArray.length}
                </p>
              </div>

              <div>
                <label className="block text-white mb-2 font-medium">Значения (через запятую):</label>
                <input
                  type="text"
                  value={values}
                  onChange={(e) => handleValuesChange(e.target.value)}
                  className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Например: 10, 15, 8, 22"
                />
                <p className="text-white/60 text-sm mt-1">
                  Найдено значений: {valuesArray.length}
                </p>
              </div>

              {labelsArray.length !== valuesArray.length && labelsArray.length > 0 && valuesArray.length > 0 && (
                <div className="p-3 bg-yellow-500/20 rounded text-yellow-300">
                  ⚠️ Количество меток ({labelsArray.length}) не совпадает с количеством значений ({valuesArray.length}).
                  График может отображаться некорректно.
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={buildChart}
                disabled={!hasValidData}
                className={`px-6 py-2 rounded-lg transition duration-200 ${
                  hasValidData
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              >
                Построить график
              </button>

              <button
                onClick={clearAllData}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Очистить всё
              </button>
            </div>

            <SaveIndicator lastSaved={lastSaved} isModified={isModified} />
          </div>

          {hasValidData && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="mb-4 text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Ваш график</h3>
                <div className="text-white/80 text-sm">
                  <p>Точек данных: {Math.min(labelsArray.length, valuesArray.length)}</p>
                  {valuesArray.length > 0 && (
                    <p>
                      Среднее значение: <span className="text-purple-400 font-bold">
                        {(valuesArray.reduce((sum, val) => sum + val, 0) / valuesArray.length).toFixed(2)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              <Line data={data} options={options} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
