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

const STORAGE_KEY = 'metricspace_cycletime_data'
const INITIAL_DATA = [{ days: "" }]

export default function CalculatorCycleTime() {
  const { performCalculation } = useCalculatorAccess('cycletime') // ДОБАВИТЬ

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
  } = useCalculator('cycletime', INITIAL_DATA, STORAGE_KEY)

  const handleChange = (index, field, value) => {
    updateItem(index, field, value)
  }

  const addPeriod = () => {
    addItem({ days: "" })
  }

  const calculateCycleTime = () => {
    // ИЗМЕНИТЬ: использовать performCalculation вместо calculate напрямую
    const result = performCalculation(() => {
      return periods.map(period => parseFloat(period.days) || 0)
    })

    if (result) {
      calculate(() => result)
    }
  }

  // Остальной код остается таким же...
  const avgCycleTime = results.length > 0
    ? (results.reduce((sum, time) => sum + parseFloat(time), 0) / results.length).toFixed(1)
    : 0

  const data = {
    labels: periods.map((_, i) => `Задача ${i + 1}`),
    datasets: [{
      label: "Cycle Time (дни)",
      data: results,
      borderColor: "rgb(59,130,246)",
      backgroundColor: "rgba(59,130,246,0.3)",
      tension: 0.1,
    }],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#ffffff" } },
      title: { display: true, text: 'Cycle Time по задачам', color: '#ffffff' }
    },
    scales: {
      x: { ticks: { color: "#ffffff" }, grid: { color: "rgba(255,255,255,0.1)" } },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
        title: { display: true, text: 'Дни', color: '#ffffff' }
      },
    },
  }

  return (
    <AccessGate calculatorId="cycletime"> {/* ДОБАВИТЬ AccessGate */}
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-6">Cycle Time</h1>
            <p className="text-white/80 mb-8">
              Укажите количество дней на выполнение каждой задачи, чтобы рассчитать средний Cycle Time. Данные
              автоматически сохраняются.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
              {periods.map((period, index) => (
                <div key={index} className="mb-6 p-4 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-white">Задача {index + 1}</h3>
                    {periods.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Удалить
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-white mb-2">Количество дней:</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={period.days}
                      onChange={(e) => handleChange(index, 'days', e.target.value)}
                      className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Например: 5"
                    />
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  onClick={addPeriod}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Добавить задачу
                </button>

                <button
                  onClick={calculateCycleTime}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Рассчитать Cycle Time
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
                    Средний Cycle Time: <span className="text-blue-400 font-bold">{avgCycleTime}</span> дней
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
