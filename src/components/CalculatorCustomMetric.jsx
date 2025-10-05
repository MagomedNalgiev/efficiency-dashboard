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
import { useCalculator } from "@hooks/useCalculator"
import { useCalculatorAccess } from "../hooks/useCalculatorAccess" // ДОБАВИТЬ
import AccessGate from "./subscription/AccessGate" // ДОБАВИТЬ

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const STORAGE_KEY = 'metricspace_custom_metric_data'
const INITIAL_DATA = [{ name: "", value: "", formula: "" }]

export default function CalculatorCustomMetric() {
  const { performCalculation } = useCalculatorAccess('custommetric') // ДОБАВИТЬ

  const {
    data: metrics,
    results,
    lastSaved,
    isModified,
    hasCalculated,
    addItem,
    removeItem,
    updateItem,
    calculate,
    clearAllData
  } = useCalculator('custommetric', INITIAL_DATA, STORAGE_KEY)

  const handleChange = (index, field, value) => {
    updateItem(index, field, value)
  }

  const addMetric = () => {
    addItem({ name: "", value: "", formula: "" })
  }

  const calculateCustom = () => {
    const result = performCalculation(() => {
      return metrics.map(metric => parseFloat(metric.value) || 0)
    })

    if (result) {
      calculate(() => result)
    }
  }

  const avgValue = results.length > 0
    ? (results.reduce((sum, val) => sum + parseFloat(val), 0) / results.length).toFixed(2)
    : 0

  const data = {
    labels: metrics.map(metric => metric.name || `Метрика ${metrics.indexOf(metric) + 1}`),
    datasets: [{
      label: "Значение",
      data: results,
      borderColor: "rgb(99,102,241)",
      backgroundColor: "rgba(99,102,241,0.3)",
      tension: 0.1,
    }],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#ffffff" } },
      title: { display: true, text: 'Пользовательские метрики', color: '#ffffff' }
    },
    scales: {
      x: { ticks: { color: "#ffffff" }, grid: { color: "rgba(255,255,255,0.1)" } },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
        title: { display: true, text: 'Значение', color: '#ffffff' }
      },
    },
  }

  return (
    <AccessGate calculatorId="custommetric"> {/* ДОБАВИТЬ AccessGate */}
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-6">Custom Metric</h1>
            <p className="text-white/80 mb-8">
              Создайте и отслеживайте собственные метрики. Укажите название метрики,
              её значение и формулу расчета для будущего использования.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
              {metrics.map((metric, index) => (
                <div key={index} className="mb-6 p-4 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-white">Метрика {index + 1}</h3>
                    {metrics.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Удалить
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-white mb-2">Название метрики:</label>
                      <input
                        type="text"
                        value={metric.name}
                        onChange={(e) => handleChange(index, 'name', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Например: Satisfaction Score"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white mb-2">Значение:</label>
                        <input
                          type="number"
                          step="0.01"
                          value={metric.value}
                          onChange={(e) => handleChange(index, 'value', e.target.value)}
                          className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Например: 8.5"
                        />
                      </div>

                      <div>
                        <label className="block text-white mb-2">Единица измерения:</label>
                        <input
                          type="text"
                          value={metric.unit}
                          onChange={(e) => handleChange(index, 'unit', e.target.value)}
                          className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Например: баллы, %, шт"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white mb-2">Формула расчета (опционально):</label>
                      <textarea
                        value={metric.formula}
                        onChange={(e) => handleChange(index, 'formula', e.target.value)}
                        rows="3"
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Например: (Положительные отзывы / Общее количество отзывов) * 10"
                      />
                    </div>
                  </div>

                  {results[index] && (
                    <div className="mt-3 p-2 bg-indigo-500/20 rounded text-indigo-300">
                      <strong>{metric.name || 'Метрика'}: {results[index]} {metric.unit || ''}</strong>
                      {metric.formula && (
                        <p className="text-sm text-indigo-300/70 mt-1">
                          Формула: {metric.formula}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  onClick={addMetric}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Добавить метрику
                </button>

                <button
                  onClick={calculateCustom}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Сохранить метрики
                </button>

                <button
                  onClick={clearAllData}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  Очистить всё
                </button>
              </div>
            </div>

            {results.length > 0 && hasCalculated && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="mb-4 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Ваши метрики</h3>
                  <p className="text-white/80">
                    Среднее значение: <span className="text-indigo-400 font-bold">{avgValue}</span>
                  </p>
                </div>
                <Line data={data} options={options} />
              </div>
            )}
          </div>
        </div>
      </div>
    </AccessGate>
  )
}
