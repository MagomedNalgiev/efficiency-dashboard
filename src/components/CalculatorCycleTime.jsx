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
import Header from "@components/Header"
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

const STORAGE_KEY = 'metricspace_cycletime_data'

export default function CalculatorCycleTime() {
  const [tasksData, setTasksData] = useLocalStorage(STORAGE_KEY, [
    { days: "" }
  ])

  const [results, setResults] = useState([])
  const [lastSaved, setLastSaved] = useState(null)
  const [isModified, setIsModified] = useState(false)

  const handleChange = (index, value) => {
    const updated = [...tasksData]
    updated[index].days = value
    setTasksData(updated)
    setIsModified(true)
    setLastSaved(Date.now())
  }

  const addTask = () => {
    const newData = [...tasksData, { days: "" }]
    setTasksData(newData)
    setIsModified(true)
    setLastSaved(Date.now())

    trackEvent('task_added', {
      calculator: 'cycle_time',
      total_tasks: newData.length
    })
  }

  const calculateCycleTime = () => {
    const validTasks = tasksData
      .map(task => parseFloat(task.days))
      .filter(days => !isNaN(days) && days > 0)

    setResults(validTasks)
    setIsModified(false)

    trackCalculatorUsage('cycle_time')
    trackEvent('calculation_completed', {
      calculator: 'cycle_time',
      tasks_count: validTasks.length,
      avg_cycle_time: validTasks.reduce((sum, days) => sum + days, 0) / validTasks.length || 0
    })
  }

  const clearAllData = () => {
    if (confirm('Очистить все данные? Это действие нельзя отменить.')) {
      setTasksData([{ days: "" }])
      setResults([])
      setLastSaved(Date.now())
      setIsModified(false)

      trackEvent('data_cleared', {
        calculator: 'cycle_time'
      })
    }
  }

  const avgCycleTime = results.length > 0
    ? (results.reduce((sum, days) => sum + days, 0) / results.length).toFixed(1)
    : 0

  const data = {
    labels: tasksData.map((_, i) => `Задача ${i + 1}`),
    datasets: [
      {
        label: "Cycle Time (дни)",
        data: tasksData.map(task => parseFloat(task.days) || 0),
        borderColor: "rgb(59,130,246)",
        backgroundColor: "rgba(59,130,246,0.3)",
        tension: 0.1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "#ffffff" },
      },
      title: {
        display: true,
        text: 'Cycle Time по задачам',
        color: '#ffffff'
      }
    },
    scales: {
      x: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
        title: {
          display: true,
          text: 'Дни',
          color: '#ffffff'
        }
      },
    },
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">Cycle Time</h1>
          <p className="text-white/80 mb-8">
            Укажите количество дней на выполнение каждой задачи, чтобы рассчитать средний Cycle Time.
            Данные автоматически сохраняются.
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            {tasksData.map((task, index) => (
              <div key={index} className="mb-4 flex items-center space-x-4">
                <label className="text-white min-w-[100px]">
                  Задача {index + 1}:
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={task.days}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="flex-1 p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Количество дней"
                />
                <span className="text-white/70">дней</span>
              </div>
            ))}

            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={addTask}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Добавить задачу
              </button>

              <button
                onClick={calculateCycleTime}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
              >
                Рассчитать
              </button>

              <button
                onClick={clearAllData}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Очистить всё
              </button>
            </div>

            <SaveIndicator lastSaved={lastSaved} isModified={isModified} />
          </div>

          {results.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="mb-4 text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Результаты</h3>
                <p className="text-white/80">
                  Средний Cycle Time: <span className="text-blue-400 font-bold">{avgCycleTime} дней</span>
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
