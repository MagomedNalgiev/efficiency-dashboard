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

const STORAGE_KEY = 'metricspace_ebitda_data'
const INITIAL_DATA = [{ revenue: "", opex: "", depreciation: "" }]

export default function CalculatorEBITDA() {
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
  } = useCalculator('ebitda', INITIAL_DATA, STORAGE_KEY)

  const handleChange = (index, field, value) => {
    updateItem(index, field, value)
  }

  const addPeriod = () => {
    addItem({ revenue: "", opex: "", depreciation: "" })
  }

  const calculateEBITDA = () => {
    calculate((data) => {
      return data.map(period => {
        const revenue = parseFloat(period.revenue) || 0
        const opex = parseFloat(period.opex) || 0
        const depreciation = parseFloat(period.depreciation) || 0

        const ebitda = revenue - opex + depreciation
        return ebitda.toFixed(0)
      })
    })
  }

  const avgEBITDA = results.length > 0
    ? (results.reduce((sum, ebitda) => sum + parseFloat(ebitda), 0) / results.length).toFixed(0)
    : 0

  const data = {
    labels: periods.map((_, i) => `Период ${i + 1}`),
    datasets: [{
      label: "EBITDA (₽)",
      data: results,
      borderColor: "rgb(99,102,241)",
      backgroundColor: "rgba(99,102,241,0.3)",
      tension: 0.1,
    }],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#ffffff" } },
      title: { display: true, text: 'EBITDA по периодам', color: '#ffffff' }
    },
    scales: {
      x: { ticks: { color: "#ffffff" }, grid: { color: "rgba(255,255,255,0.1)" } },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
        title: { display: true, text: 'Рубли (₽)', color: '#ffffff' }
      },
    },
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">EBITDA</h1>
          <p className="text-white/80 mb-8">
            Укажите выручку, операционные расходы и амортизацию, чтобы рассчитать EBITDA (прибыль до вычета процентов, налогов и амортизации).
            Данные автоматически сохраняются.
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white mb-2">Выручка (₽):</label>
                    <input
                      type="number"
                      min="0"
                      value={period.revenue}
                      onChange={(e) => handleChange(index, 'revenue', e.target.value)}
                      className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Например: 1000000"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Операционные расходы (₽):</label>
                    <input
                      type="number"
                      min="0"
                      value={period.opex}
                      onChange={(e) => handleChange(index, 'opex', e.target.value)}
                      className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Например: 700000"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Амортизация (₽):</label>
                    <input
                      type="number"
                      min="0"
                      value={period.depreciation}
                      onChange={(e) => handleChange(index, 'depreciation', e.target.value)}
                      className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Например: 50000"
                    />
                  </div>
                </div>

                {results[index] !== undefined && (
                  <div className={`mt-3 p-2 rounded ${parseFloat(results[index]) > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    <strong>EBITDA: {parseFloat(results[index]).toLocaleString()} ₽</strong>
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
                onClick={calculateEBITDA}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200"
              >
                Рассчитать EBITDA
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
                  Средний EBITDA: <span className={`font-bold ${parseFloat(avgEBITDA) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {parseFloat(avgEBITDA).toLocaleString()} ₽
                  </span>
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
