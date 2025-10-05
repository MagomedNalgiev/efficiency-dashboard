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

const STORAGE_KEY = 'metricspace_ltv_data'
const INITIAL_DATA = [{ monthlyRevenue: "", retentionRate: "", grossMargin: "" }]

export default function CalculatorLTV() {
  const { performCalculation } = useCalculatorAccess('ltv') // ДОБАВИТЬ

  const {
    data: segments,
    results,
    lastSaved,
    isModified,
    hasCalculated,
    addItem,
    removeItem,
    updateItem,
    calculate,
    clearAllData
  } = useCalculator('ltv', INITIAL_DATA, STORAGE_KEY)

  const handleChange = (index, field, value) => {
    updateItem(index, field, value)
  }

  const addSegment = () => {
    addItem({ monthlyRevenue: "", retentionRate: "", grossMargin: "" })
  }

  const calculateLTV = () => {
    const result = performCalculation(() => {
      return segments.map(segment => {
        const revenue = parseFloat(segment.monthlyRevenue) || 0
        const retention = parseFloat(segment.retentionRate) || 0
        const margin = parseFloat(segment.grossMargin) || 0

        if (retention > 0 && retention < 100) {
          const churnRate = (100 - retention) / 100
          const ltv = (revenue * (margin / 100)) / churnRate
          return ltv.toFixed(0)
        }
        return 0
      })
    })

    if (result) {
      calculate(() => result)
    }
  }

  const avgLTV = results.length > 0
    ? (results.reduce((sum, ltv) => sum + parseFloat(ltv), 0) / results.length).toFixed(0)
    : 0

  const data = {
    labels: segments.map((_, i) => `Сегмент ${i + 1}`),
    datasets: [{
      label: "LTV (₽)",
      data: results,
      borderColor: "rgb(147,51,234)",
      backgroundColor: "rgba(147,51,234,0.3)",
      tension: 0.1,
    }],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#ffffff" } },
      title: { display: true, text: 'Customer Lifetime Value по сегментам', color: '#ffffff' }
    },
    scales: {
      x: { ticks: { color: "#ffffff" }, grid: { color: "rgba(255,255,255,0.1)" } },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
        title: { display: true, text: 'Рубли (₽)', color: '#ffffff' }
      },
    },
  }

  return (
    <AccessGate calculatorId="ltv"> {/* ДОБАВИТЬ AccessGate */}
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-6">LTV</h1>
            <p className="text-white/80 mb-8">
              Customer Lifetime Value - прогнозируемая прибыль от клиента за всё время взаимодействия.
              Укажите месячную выручку на клиента, retention rate и маржинальность.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
              {segments.map((segment, index) => (
                <div key={index} className="mb-6 p-4 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-white">Сегмент {index + 1}</h3>
                    {segments.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Удалить
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white mb-2">Месячная выручка с клиента (₽):</label>
                      <input
                        type="number"
                        min="0"
                        value={segment.monthlyRevenue}
                        onChange={(e) => handleChange(index, 'monthlyRevenue', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Например: 5000"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Retention Rate (%):</label>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={segment.retentionRate}
                        onChange={(e) => handleChange(index, 'retentionRate', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Например: 85"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Маржинальность (%):</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={segment.grossMargin}
                        onChange={(e) => handleChange(index, 'grossMargin', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Например: 25"
                      />
                    </div>
                  </div>

                  {results[index] > 0 && (
                    <div className="mt-3 p-2 bg-purple-500/20 rounded text-purple-300">
                      <strong>LTV: {results[index]} ₽</strong>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  onClick={addSegment}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Добавить сегмент
                </button>

                <button
                  onClick={calculateLTV}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Рассчитать LTV
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
                    Средний LTV: <span className="text-purple-400 font-bold">{avgLTV} ₽</span>
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
