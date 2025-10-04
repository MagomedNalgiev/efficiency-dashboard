import { useState, useEffect } from "react"
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const STORAGE_KEY = 'metricspace_velocity_data'

export default function CalculatorVelocity() {
  // Используем localStorage для данных спринтов
  const [sprintsData, setSprintsData] = useLocalStorage(STORAGE_KEY, [
    { storyPoints: "", focusFactor: "" }
  ])

  const [velocities, setVelocities] = useState([])
  const [lastSaved, setLastSaved] = useState(null)
  const [isModified, setIsModified] = useState(false)
  const [hasCalculated, setHasCalculated] = useState(false)

  // Пересчитываем velocity при загрузке сохраненных данных
  useEffect(() => {
    if (sprintsData.some(sprint => sprint.storyPoints && sprint.focusFactor)) {
      calculateVelocity(false) // false = не трекать событие при загрузке
    }
  }, []) // Только при первой загрузке

  const handleChange = (index, field, value) => {
    const updated = [...sprintsData]
    updated[index][field] = value
    setSprintsData(updated)
    setIsModified(true)
    setLastSaved(Date.now())
  }

  const addSprint = () => {
    const newData = [...sprintsData, { storyPoints: "", focusFactor: "" }]
    setSprintsData(newData)
    setIsModified(true)
    setLastSaved(Date.now())

    // Трекинг добавления спринта
    trackEvent('sprint_added', {
      calculator: 'velocity',
      total_sprints: newData.length
    })
  }

  const removeSprint = (index) => {
    if (sprintsData.length > 1) {
      const newData = sprintsData.filter((_, i) => i !== index)
      setSprintsData(newData)
      setIsModified(true)
      setLastSaved(Date.now())

      trackEvent('sprint_removed', {
        calculator: 'velocity',
        total_sprints: newData.length
      })
    }
  }

  const calculateVelocity = (shouldTrack = true) => {
    const results = sprintsData.map(({ storyPoints, focusFactor }) => {
      const sp = parseFloat(storyPoints)
      const ff = parseFloat(focusFactor)
      if (!isNaN(sp) && !isNaN(ff) && ff >= 0) {
        return (sp * ff / 100).toFixed(2)
      }
      return 0
    })

    setVelocities(results)
    setIsModified(false)
    setHasCalculated(true)

    if (shouldTrack) {
      trackCalculatorUsage('velocity')
      trackEvent('calculation_completed', {
        calculator: 'velocity',
        sprints_count: sprintsData.length,
        has_results: results.some(r => r > 0),
        avg_velocity: results.reduce((sum, v) => sum + parseFloat(v), 0) / results.length
      })
    }
  }

  const clearAllData = () => {
    if (confirm('Очистить все данные? Это действие нельзя отменить.')) {
      setSprintsData([{ storyPoints: "", focusFactor: "" }])
      setVelocities([])
      setLastSaved(Date.now())
      setIsModified(false)
      setHasCalculated(false)

      trackEvent('data_cleared', {
        calculator: 'velocity'
      })
    }
  }

  const data = {
    labels: sprintsData.map((_, i) => `Спринт ${i + 1}`),
    datasets: [
      {
        label: "Velocity",
        data: velocities,
        borderColor: "rgb(34,197,94)",
        backgroundColor: "rgba(34,197,94,0.3)",
        tension: 0.1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#ffffff",
        },
      },
      title: {
        display: true,
        text: 'Динамика Velocity команды',
        color: '#ffffff'
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "rgba(255,255,255,0.1)",
        },
      },
      y: {
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "rgba(255,255,255,0.1)",
        },
      },
    },
  }

  const avgVelocity = velocities.length > 0
    ? (velocities.reduce((sum, v) => sum + parseFloat(v), 0) / velocities.length).toFixed(2)
    : 0

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">Velocity</h1>
          <p className="text-white/80 mb-8">
            Укажите Story Points и Focus-фактор для каждого спринта, чтобы рассчитать динамику Velocity команды.
            Данные автоматически сохраняются в вашем браузере.
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            {sprintsData.map((sprint, index) => (
              <div key={index} className="mb-6 p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold text-white">Спринт {index + 1}</h3>
                  {sprintsData.length > 1 && (
                    <button
                      onClick={() => removeSprint(index)}
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
                      value={sprint.storyPoints}
                      onChange={(e) => handleChange(index, "storyPoints", e.target.value)}
                      className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Например: 30"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Focus-фактор (%):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={sprint.focusFactor}
                      onChange={(e) => handleChange(index, "focusFactor", e.target.value)}
                      className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Например: 90"
                    />
                  </div>
                </div>

                {velocities[index] > 0 && (
                  <div className="mt-3 p-2 bg-green-500/20 rounded text-green-300">
                    <strong>Velocity: {velocities[index]}</strong>
                  </div>
                )}
              </div>
            ))}

            <div className="flex flex-wrap gap-4">
              <button
                onClick={addSprint}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
              >
                Добавить спринт
              </button>

              <button
                onClick={() => calculateVelocity(true)}
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

            <SaveIndicator lastSaved={lastSaved} isModified={isModified} />
          </div>

          {velocities.length > 0 && hasCalculated && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="mb-4 text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Результаты</h3>
                <p className="text-white/80">
                  Средняя Velocity: <span className="text-green-400 font-bold">{avgVelocity}</span>
                </p>
              </div>
              <Line data={data} options={options} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
