import { Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"
import { useCalculator } from "@hooks/useCalculator"
import { useCalculatorAccess } from "../hooks/useCalculatorAccess" // ДОБАВИТЬ
import AccessGate from "./subscription/AccessGate" // ДОБАВИТЬ

ChartJS.register(ArcElement, Tooltip, Legend)

const STORAGE_KEY = 'metricspace_defect_leakage_data'
const INITIAL_DATA = [{ foundInDev: "", foundInProd: "" }]

export default function CalculatorDefectLeakage() {
  const { performCalculation } = useCalculatorAccess('defectleakage') // ДОБАВИТЬ

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
  } = useCalculator('defectleakage', INITIAL_DATA, STORAGE_KEY)

  const handleChange = (index, field, value) => {
    updateItem(index, field, value)
  }

  const addPeriod = () => {
    addItem({ foundInDev: "", foundInProd: "" })
  }

  const calculateLeakage = () => {
    const result = performCalculation(() => {
      return periods.map(period => {
        const dev = parseFloat(period.foundInDev) || 0
        const prod = parseFloat(period.foundInProd) || 0
        const total = dev + prod
        return total > 0 ? ((prod / total) * 100).toFixed(1) : 0
      })
    })

    if (result) {
      calculate(() => result)
    }
  }

  const avgLeakage = results.length > 0
    ? (results.reduce((sum, leak) => sum + parseFloat(leak), 0) / results.length).toFixed(1)
    : 0

  // Данные для круговой диаграммы (последний период)
  const lastPeriod = periods[periods.length - 1]
  const lastResult = results[results.length - 1]

  const chartData = lastPeriod && lastResult ? {
    labels: ['Найдено в разработке', 'Утекло в продакшн'],
    datasets: [{
      data: [
        parseFloat(lastPeriod.foundInDev) || 0,
        parseFloat(lastPeriod.foundInProd) || 0
      ],
      backgroundColor: [
        'rgba(34,197,94,0.8)',
        'rgba(239,68,68,0.8)'
      ],
      borderColor: [
        'rgb(34,197,94)',
        'rgb(239,68,68)'
      ],
      borderWidth: 2,
    }],
  } : null

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "#ffffff" },
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'Распределение дефектов',
        color: '#ffffff'
      }
    },
  }

  return (
    <AccessGate calculatorId="defectleakage"> {/* ДОБАВИТЬ AccessGate */}
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-6">Defect Leakage</h1>
            <p className="text-white/80 mb-8">
              Defect Leakage Rate - процент дефектов, которые прошли мимо тестирования
              и были найдены в продакшене. Укажите количество багов, найденных на разных этапах.
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
                      <label className="block text-white mb-2">Найдено в разработке/тестировании:</label>
                      <input
                        type="number"
                        min="0"
                        value={period.foundInDev}
                        onChange={(e) => handleChange(index, 'foundInDev', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Например: 25"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Найдено в продакшене:</label>
                      <input
                        type="number"
                        min="0"
                        value={period.foundInProd}
                        onChange={(e) => handleChange(index, 'foundInProd', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Например: 3"
                      />
                    </div>
                  </div>

                  {results[index] && (
                    <div className="mt-3 p-2 bg-orange-500/20 rounded text-orange-300">
                      <strong>Defect Leakage: {results[index]}%</strong>
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
                  onClick={calculateLeakage}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Рассчитать утечку
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
                    Средний Defect Leakage: <span className="text-orange-400 font-bold">{avgLeakage}%</span>
                  </p>
                </div>

                {chartData && (
                  <div className="max-w-md mx-auto">
                    <Doughnut data={chartData} options={chartOptions} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AccessGate>
  )
}
