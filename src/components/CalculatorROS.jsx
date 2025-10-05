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

const STORAGE_KEY = 'metricspace_ros_data'
const INITIAL_DATA = [{ revenue: "", netIncome: "" }]

export default function CalculatorROS() {
  const { performCalculation } = useCalculatorAccess('ros') // ДОБАВИТЬ

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
  } = useCalculator('ros', INITIAL_DATA, STORAGE_KEY)

  const handleChange = (index, field, value) => {
    updateItem(index, field, value)
  }

  const addPeriod = () => {
    addItem({ revenue: "", netIncome: "" })
  }

  const calculateROS = () => {
    const result = performCalculation(() => {
      return periods.map(period => {
        const revenue = parseFloat(period.revenue) || 0
        const netIncome = parseFloat(period.netIncome) || 0
        if (revenue > 0) {
          return ((netIncome / revenue) * 100).toFixed(2)
        }
        return 0
      })
    })

    if (result) {
      calculate(() => result)
    }
  }

  const avgROS = results.length > 0
    ? (results.reduce((sum, ros) => sum + parseFloat(ros), 0) / results.length).toFixed(2)
    : 0

  const data = {
    labels: periods.map((_, i) => `Период ${i + 1}`),
    datasets: [{
      label: "ROS (%)",
      data: results,
      borderColor: "rgb(20,184,166)",
      backgroundColor: "rgba(20,184,166,0.3)",
      tension: 0.1,
    }],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#ffffff" } },
      title: { display: true, text: 'Return on Sales по периодам', color: '#ffffff' }
    },
    scales: {
      x: { ticks: { color: "#ffffff" }, grid: { color: "rgba(255,255,255,0.1)" } },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
        title: { display: true, text: 'Процент (%)', color: '#ffffff' }
      },
    },
  }

  return (
    <AccessGate calculatorId="ros"> {/* ДОБАВИТЬ AccessGate */}
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-6">ROS</h1>
            <p className="text-white/80 mb-8">
              Return on Sales - рентабельность продаж. Показывает, какую прибыль
              компания получает с каждого рубля выручки.
              ROS = (Чистая прибыль / Выручка) × 100%
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
                      <label className="block text-white mb-2">Выручка (₽):</label>
                      <input
                        type="number"
                        min="0"
                        value={period.revenue}
                        onChange={(e) => handleChange(index, 'revenue', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Например: 1000000"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Чистая прибыль (₽):</label>
                      <input
                        type="number"
                        value={period.netIncome}
                        onChange={(e) => handleChange(index, 'netIncome', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Например: 150000"
                      />
                    </div>
                  </div>

                  {results[index] && (
                    <div className={`mt-3 p-2 rounded ${
                      parseFloat(results[index]) > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      <strong>ROS: {results[index]}%</strong>
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
                  onClick={calculateROS}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Рассчитать ROS
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
                    Средний ROS: <span className={`font-bold ${
                      parseFloat(avgROS) > 0 ? 'text-teal-400' : 'text-red-400'
                    }`}>{avgROS}%</span>
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
