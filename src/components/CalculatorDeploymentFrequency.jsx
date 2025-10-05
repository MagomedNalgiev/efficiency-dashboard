import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { useCalculator } from "@hooks/useCalculator"
import { useCalculatorAccess } from "../hooks/useCalculatorAccess" // ДОБАВИТЬ
import AccessGate from "./subscription/AccessGate" // ДОБАВИТЬ

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const STORAGE_KEY = 'metricspace_deployment_frequency_data'
const INITIAL_DATA = [{ deployments: "", period: "" }]

export default function CalculatorDeploymentFrequency() {
  const { performCalculation } = useCalculatorAccess('deploymentfrequency') // ДОБАВИТЬ

  const {
    data: periods,
    results,
    lastSaved,
    isModified,
    hasCalculated,
    addItem,
    removeItem,
    updateItem,
    calculate,
    clearAllData
  } = useCalculator('deploymentfrequency', INITIAL_DATA, STORAGE_KEY)

  const handleChange = (index, field, value) => {
    updateItem(index, field, value)
  }

  const addPeriod = () => {
    addItem({ deployments: "", period: "" })
  }

  const calculateFrequency = () => {
    const result = performCalculation(() => {
      return periods.map(period => {
        const deploys = parseFloat(period.deployments) || 0
        const days = parseFloat(period.period) || 1
        return (deploys / days * 7).toFixed(2) // конвертируем в неделю
      })
    })

    if (result) {
      calculate(() => result)
    }
  }

  const avgFrequency = results.length > 0
    ? (results.reduce((sum, freq) => sum + parseFloat(freq), 0) / results.length).toFixed(2)
    : 0

  const data = {
    labels: periods.map((_, i) => `Период ${i + 1}`),
    datasets: [{
      label: "Deployments/неделя",
      data: results,
      backgroundColor: "rgba(168,85,247,0.8)",
      borderColor: "rgb(168,85,247)",
      borderWidth: 1,
    }],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#ffffff" } },
      title: { display: true, text: 'Частота деплойментов', color: '#ffffff' }
    },
    scales: {
      x: { ticks: { color: "#ffffff" }, grid: { color: "rgba(255,255,255,0.1)" } },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
        title: { display: true, text: 'Деплойментов в неделю', color: '#ffffff' }
      },
    },
  }

  return (
    <AccessGate calculatorId="deploymentfrequency"> {/* ДОБАВИТЬ AccessGate */}
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-6">Deployment Frequency</h1>
            <p className="text-white/80 mb-8">
              Частота деплойментов - ключевая DORA метрика. Укажите количество деплойментов
              и период в днях для расчета частоты в неделю.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
              {periods.map((period, index) => (
                <div key={index} className="mb-6 p-4 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-white">Период {index + 1}</h3>
                    {periods.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Удалить
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2">Количество деплойментов:</label>
                      <input
                        type="number"
                        min="0"
                        value={period.deployments}
                        onChange={(e) => handleChange(index, 'deployments', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Например: 15"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Период (дней):</label>
                      <input
                        type="number"
                        min="1"
                        value={period.period}
                        onChange={(e) => handleChange(index, 'period', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Например: 30"
                      />
                    </div>
                  </div>

                  {results[index] > 0 && (
                    <div className="mt-3 p-2 bg-purple-500/20 rounded text-purple-300">
                      <strong>Частота: {results[index]} деплойментов/неделя</strong>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  onClick={addPeriod}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Добавить период
                </button>

                <button
                  onClick={calculateFrequency}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Рассчитать частоту
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
                  <h3 className="text-2xl font-bold text-white mb-2">Результаты</h3>
                  <p className="text-white/80">
                    Средняя частота: <span className="text-purple-400 font-bold">{avgFrequency}</span> деплойментов в неделю
                  </p>
                </div>
                <Bar data={data} options={options} />
              </div>
            )}
          </div>
        </div>
      </div>
    </AccessGate>
  )
}
