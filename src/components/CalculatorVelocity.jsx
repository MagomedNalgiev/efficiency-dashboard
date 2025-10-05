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

const STORAGE_KEY = 'metricspace_velocity_data'
const INITIAL_DATA = [{ storyPoints: "", focusFactor: "" }]

export default function CalculatorVelocity() {
  const { performCalculation } = useCalculatorAccess('velocity') // ДОБАВИТЬ

  const {
    data: sprints,
    results,
    lastSaved,
    isModified,
    hasCalculated,
    addItem,
    removeItem,
    updateItem,
    calculate,
    clearAllData
  } = useCalculator('velocity', INITIAL_DATA, STORAGE_KEY)

  const handleChange = (index, field, value) => {
    updateItem(index, field, value)
  }

  const addSprint = () => {
    addItem({ storyPoints: "", focusFactor: "" })
  }

  const calculateVelocity = () => {
    // ИЗМЕНИТЬ: использовать performCalculation вместо calculate напрямую
    const result = performCalculation(() => {
      return sprints.map(sprint => {
        const points = parseFloat(sprint.storyPoints)
        const factor = parseFloat(sprint.focusFactor)
        if (!isNaN(points) && !isNaN(factor) && factor > 0) {
          return (points * factor / 100).toFixed(2)
        }
        return 0
      })
    })

    if (result) {
      calculate(() => result)
    }
  }

  // Остальной код остается таким же...
  const avgVelocity = results.length > 0
    ? (results.reduce((sum, vel) => sum + parseFloat(vel), 0) / results.length).toFixed(2)
    : 0

  const data = {
    labels: sprints.map((_, i) => `Спринт ${i + 1}`),
    datasets: [{
      label: "Velocity",
      data: results,
      borderColor: "rgb(34,197,94)",
      backgroundColor: "rgba(34,197,94,0.3)",
      tension: 0.1,
    }],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#ffffff" } },
      title: { display: true, text: 'Velocity команды по спринтам', color: '#ffffff' }
    },
    scales: {
      x: { ticks: { color: "#ffffff" }, grid: { color: "rgba(255,255,255,0.1)" } },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
        title: { display: true, text: 'Story Points', color: '#ffffff' }
      },
    },
  }

  return (
    <AccessGate calculatorId="velocity"> {/* ДОБАВИТЬ AccessGate */}
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-6">Velocity</h1>
            <p className="text-white/80 mb-8">
              Укажите Story Points и Focus-фактор для каждого спринта, чтобы рассчитать динамику Velocity команды. Данные
              автоматически сохраняются в вашем браузере.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
              {sprints.map((sprint, index) => (
                <div key={index} className="mb-6 p-4 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-white">Спринт {index + 1}</h3>
                    {sprints.length > 1 && (
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
                      <label className="block text-white mb-2">Story Points:</label>
                      <input
                        type="number"
                        min="0"
                        value={sprint.storyPoints}
                        onChange={(e) => handleChange(index, 'storyPoints', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Например: 21"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Focus-фактор (%):</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={sprint.focusFactor}
                        onChange={(e) => handleChange(index, 'focusFactor', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Например: 85"
                      />
                    </div>
                  </div>

                  {results[index] > 0 && (
                    <div className="mt-3 p-2 bg-green-500/20 rounded text-green-300">
                      <strong>Velocity: {results[index]} story points</strong>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  onClick={addSprint}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Добавить спринт
                </button>

                <button
                  onClick={calculateVelocity}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Рассчитать Velocity
                </button>

                <button
                  onClick={clearAllData}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  Очистить всё
                </button>
              </div>

              {isModified && (
                <div className="mt-4 text-yellow-300 text-sm">
                  ⚠️ Есть несохраненные изменения
                </div>
              )}

              {lastSaved && (
                <div className="mt-2 text-green-300 text-sm">
                  ✅ Последнее сохранение: {new Date(lastSaved).toLocaleString()}
                </div>
              )}
            </div>

            {results.length > 0 && hasCalculated && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="mb-4 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Результаты</h3>
                  <p className="text-white/80">
                    Средняя Velocity: <span className="text-green-400 font-bold">{avgVelocity}</span> story points за спринт
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
