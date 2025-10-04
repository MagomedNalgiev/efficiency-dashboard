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

const STORAGE_KEY = 'metricspace_mttr_data'
const INITIAL_DATA = [{ hours: "" }]

export default function CalculatorMTTR() {
  const {
    data: incidents,
    results,
    lastSaved,
    isModified,
    hasCalculated,
    addItem,
    removeItem,
    updateItem,
    calculate,
    clearAllData
  } = useCalculator('mttr', INITIAL_DATA, STORAGE_KEY)

  const handleChange = (index, value) => {
    updateItem(index, 'hours', value)
  }

  const addIncident = () => {
    addItem({ hours: "" })
  }

  const calculateMTTR = () => {
    calculate((data) => {
      const validIncidents = data
        .map(incident => parseFloat(incident.hours))
        .filter(hours => !isNaN(hours) && hours > 0)
      return validIncidents
    })
  }

  const avgMTTR = results.length > 0
    ? (results.reduce((sum, hours) => sum + hours, 0) / results.length).toFixed(1)
    : 0

  const data = {
    labels: incidents.map((_, i) => `Инцидент ${i + 1}`),
    datasets: [{
      label: "MTTR (часы)",
      data: incidents.map(incident => parseFloat(incident.hours) || 0),
      borderColor: "rgb(239,68,68)",
      backgroundColor: "rgba(239,68,68,0.3)",
      tension: 0.1,
    }],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#ffffff" } },
      title: { display: true, text: 'MTTR по инцидентам', color: '#ffffff' }
    },
    scales: {
      x: { ticks: { color: "#ffffff" }, grid: { color: "rgba(255,255,255,0.1)" } },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
        title: { display: true, text: 'Часы', color: '#ffffff' }
      },
    },
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">MTTR</h1>
          <p className="text-white/80 mb-8">
            Укажите длительность восстановления (в часах) по каждому инциденту, чтобы рассчитать средний MTTR.
            Данные автоматически сохраняются.
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            {incidents.map((incident, index) => (
              <div key={index} className="mb-4 flex items-center space-x-4">
                <label className="text-white min-w-[120px]">
                  Инцидент {index + 1}:
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={incident.hours}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="flex-1 p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Время восстановления"
                />
                <span className="text-white/70">часов</span>
                {incidents.length > 1 && (
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
                onClick={addIncident}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
              >
                Добавить инцидент
              </button>

              <button
                onClick={calculateMTTR}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200"
              >
                Рассчитать MTTR
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
                <p className="text-white/80">
                  Средний MTTR: <span className="text-red-400 font-bold">{avgMTTR} часов</span>
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
