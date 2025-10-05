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

const STORAGE_KEY = 'metricspace_mttr_data'
const INITIAL_DATA = [{ downtime: "" }]

export default function CalculatorMTTR() {
  const { performCalculation } = useCalculatorAccess('mttr') // ДОБАВИТЬ

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

  const handleChange = (index, field, value) => {
    updateItem(index, field, value)
  }

  const addIncident = () => {
    addItem({ downtime: "" })
  }

  const calculateMTTR = () => {
    const result = performCalculation(() => {
      return incidents.map(incident => parseFloat(incident.downtime) || 0)
    })

    if (result) {
      calculate(() => result)
    }
  }

  const avgMTTR = results.length > 0
    ? (results.reduce((sum, time) => sum + parseFloat(time), 0) / results.length).toFixed(1)
    : 0

  const data = {
    labels: incidents.map((_, i) => `Инцидент ${i + 1}`),
    datasets: [{
      label: "MTTR (часы)",
      data: results,
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
    <AccessGate calculatorId="mttr"> {/* ДОБАВИТЬ AccessGate */}
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-6">MTTR</h1>
            <p className="text-white/80 mb-8">
              Mean Time to Recovery - среднее время восстановления после инцидента.
              Укажите время простоя для каждого инцидента в часах.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
              {incidents.map((incident, index) => (
                <div key={index} className="mb-6 p-4 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-white">Инцидент {index + 1}</h3>
                    {incidents.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Удалить
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-white mb-2">Время простоя (часы):</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={incident.downtime}
                      onChange={(e) => handleChange(index, 'downtime', e.target.value)}
                      className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Например: 2.5"
                    />
                  </div>
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
            </div>

            {results.length > 0 && hasCalculated && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="mb-4 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Результаты</h3>
                  <p className="text-white/80">
                    Средний MTTR: <span className="text-red-400 font-bold">{avgMTTR}</span> часов
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
