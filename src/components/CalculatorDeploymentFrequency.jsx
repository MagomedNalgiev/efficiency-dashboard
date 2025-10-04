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
import { useCalculator } from "@hooks/useCalculator"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const STORAGE_KEY = 'metricspace_deployment_frequency_data'
const INITIAL_DATA = [{ daysBetween: "" }]

export default function CalculatorDeploymentFrequency() {
  const {
    data: deployments,
    results,
    lastSaved,
    isModified,
    hasCalculated,
    addItem,
    removeItem,
    updateItem,
    calculate,
    clearAllData
  } = useCalculator('deployment_frequency', INITIAL_DATA, STORAGE_KEY)

  const handleChange = (index, value) => {
    updateItem(index, 'daysBetween', value)
  }

  const addDeployment = () => {
    addItem({ daysBetween: "" })
  }

  const calculateFrequency = () => {
    calculate((data) => {
      const validDeployments = data
        .map(deployment => parseFloat(deployment.daysBetween))
        .filter(days => !isNaN(days) && days >= 0)
      return validDeployments
    })
  }

  const avgFrequency = results.length > 0
    ? (results.reduce((sum, days) => sum + days, 0) / results.length).toFixed(1)
    : 0

  const deploymentsPerWeek = avgFrequency > 0 ? (7 / avgFrequency).toFixed(2) : 0

  const data = {
    labels: deployments.map((_, i) => `Деплой ${i + 1}`),
    datasets: [{
      label: "Дни между деплоями",
      data: deployments.map(deployment => parseFloat(deployment.daysBetween) || 0),
      borderColor: "rgb(168,85,247)",
      backgroundColor: "rgba(168,85,247,0.3)",
      tension: 0.1,
    }],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#ffffff" } },
      title: { display: true, text: 'Частота деплоев', color: '#ffffff' }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">Deployment Frequency</h1>
          <p className="text-white/80 mb-8">
            Укажите количество дней между каждым деплоем, чтобы рассчитать среднюю частоту деплоев.
            Данные автоматически сохраняются.
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            {deployments.map((deployment, index) => (
              <div key={index} className="mb-4 flex items-center space-x-4">
                <label className="text-white min-w-[100px]">
                  Деплой {index + 1}:
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={deployment.daysBetween}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="flex-1 p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Дней от предыдущего деплоя"
                />
                <span className="text-white/70">дней</span>
                {deployments.length > 1 && (
                  <button
                    onClick={() => removeItem(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Удалить
                  </button>
                )}
              </div>
            ))}

            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={addDeployment}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
              >
                Добавить деплой
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

            <SaveIndicator lastSaved={lastSaved} isModified={isModified} />
          </div>

          {results.length > 0 && hasCalculated && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="mb-4 text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Результаты</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
                  <p>
                    Средний интервал: <span className="text-purple-400 font-bold">{avgFrequency} дней</span>
                  </p>
                  <p>
                    Деплоев в неделю: <span className="text-purple-400 font-bold">{deploymentsPerWeek}</span>
                  </p>
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
