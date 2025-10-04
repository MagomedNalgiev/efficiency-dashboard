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
import { useCalculator } from "@hooks/useCalculator"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const STORAGE_KEY = 'metricspace_defect_leakage_data'
const INITIAL_DATA = [{ productionDefects: "", totalDefects: "" }]

export default function CalculatorDefectLeakage() {
  const {
    data: observations,
    results,
    lastSaved,
    isModified,
    hasCalculated,
    addItem,
    removeItem,
    updateItem,
    calculate,
    clearAllData
  } = useCalculator('defect_leakage', INITIAL_DATA, STORAGE_KEY)

  const handleChange = (index, field, value) => {
    updateItem(index, field, value)
  }

  const addObservation = () => {
    addItem({ productionDefects: "", totalDefects: "" })
  }

  const calculateDefectLeakage = () => {
    calculate((data) => {
      return data.map(obs => {
        const prod = parseFloat(obs.productionDefects)
        const total = parseFloat(obs.totalDefects)
        if (!isNaN(prod) && !isNaN(total) && total > 0) {
          return ((prod / total) * 100).toFixed(1)
        }
        return 0
      })
    })
  }

  const avgLeakage = results.length > 0
    ? (results.reduce((sum, leak) => sum + parseFloat(leak), 0) / results.length).toFixed(1)
    : 0

  const data = {
    labels: observations.map((_, i) => `Итерация ${i + 1}`),
    datasets: [{
      label: "Defect Leakage (%)",
      data: results,
      borderColor: "rgb(245,101,101)",
      backgroundColor: "rgba(245,101,101,0.3)",
      tension: 0.1,
    }],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#ffffff" } },
      title: { display: true, text: 'Defect Leakage по итерациям', color: '#ffffff' }
    },
    scales: {
      x: { ticks: { color: "#ffffff" }, grid: { color: "rgba(255,255,255,0.1)" } },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
        title: { display: true, text: 'Процент (%)', color: '#ffffff' },
        min: 0,
        max: 100
      },
    },
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">Defect Leakage</h1>
          <p className="text-white/80 mb-8">
            Введите значения по каждой итерации, чтобы рассчитать и визуализировать процент Defect Leakage.
            Данные автоматически сохраняются.
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            {observations.map((obs, index) => (
              <div key={index} className="mb-6 p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold text-white">Итерация {index + 1}</h3>
                  {observations.length > 1 && (
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
                    <label className="block text-white mb-2">Дефекты в продакшене:</label>
                    <input
                      type="number"
                      min="0"
                      value={obs.productionDefects}
                      onChange={(e) => handleChange(index, 'productionDefects', e.target.value)}
                      className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Например: 5"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Общее количество дефектов:</label>
                    <input
                      type="number"
                      min="0"
                      value={obs.totalDefects}
                      onChange={(e) => handleChange(index, 'totalDefects', e.target.value)}
                      className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Например: 25"
                    />
                  </div>
                </div>

                {results[index] > 0 && (
                  <div className="mt-3 p-2 bg-red-500/20 rounded text-red-300">
                    <strong>Defect Leakage: {results[index]}%</strong>
                  </div>
                )}
              </div>
            ))}

            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={addObservation}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
              >
                Добавить итерацию
              </button>

              <button
                onClick={calculateDefectLeakage}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200"
              >
                Рассчитать Defect Leakage
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
                  Средний Defect Leakage: <span className="text-red-400 font-bold">{avgLeakage}%</span>
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
