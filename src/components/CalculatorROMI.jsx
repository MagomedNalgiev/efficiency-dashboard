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

const STORAGE_KEY = 'metricspace_romi_data'
const INITIAL_DATA = [{ marketingRevenue: "", marketingCosts: "" }]

export default function CalculatorROMI() {
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
  } = useCalculator('romi', INITIAL_DATA, STORAGE_KEY)

  const handleChange = (index, field, value) => {
    updateItem(index, field, value)
  }

  const addPeriod = () => {
    addItem({ marketingRevenue: "", marketingCosts: "" })
  }

  const calculateROMI = () => {
    calculate((data) => {
      return data.map(period => {
        const revenue = parseFloat(period.marketingRevenue)
        const costs = parseFloat(period.marketingCosts)
        if (!isNaN(revenue) && !isNaN(costs) && costs > 0) {
          return (((revenue - costs) / costs) * 100).toFixed(1)
        }
        return 0
      })
    })
  }

  const avgROMI = results.length > 0
    ? (results.reduce((sum, romi) => sum + parseFloat(romi), 0) / results.length).toFixed(1)
    : 0

  const data = {
    labels: periods.map((_, i) => `Период ${i + 1}`),
    datasets: [{
      label: "ROMI (%)",
      data: results,
      borderColor: "rgb(147,51,234)",
      backgroundColor: "rgba(147,51,234,0.3)",
      tension: 0.1,
    }],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#ffffff" } },
      title: { display: true, text: 'Return on Marketing Investment по периодам', color: '#ffffff' }
    },
    scales: {
      x: { ticks: { color: "#ffffff" }, grid: { color: "rgba(255,255,255,0.1)" } },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
        title: { display: true, text: 'Процент (%)', color: '#ffffff' }
      },
    },
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">ROMI</h1>
          <p className="text-white/80 mb-8">
            Укажите доход от маркетинговой активности и соответствующие расходы, чтобы рассчитать ROMI (Return on Marketing Investment).
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">Доход от маркетинга (₽):</label>
                    <input
                      type="number"
                      min="0"
                      value={period.marketingRevenue}
                      onChange={(e) => handleChange(index, 'marketingRevenue', e.target.value)}
                      className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Например: 150000"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Маркетинговые расходы (₽):</label>
                    <input
                      type="number"
                      min="0"
                      value={period.marketingCosts}
                      onChange={(e) => handleChange(index, 'marketingCosts', e.target.value)}
                      className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Например: 100000"
                    />
                  </div>
                </div>

                {results[index] !== 0 && (
                  <div className={`mt-3 p-2 rounded ${parseFloat(results[index]) > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    <strong>ROMI: {results[index]}%</strong>
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
                onClick={calculateROMI}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200"
              >
                Рассчитать ROMI
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
                  Средний ROMI: <span className={`font-bold ${parseFloat(avgROMI) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {avgROMI}%
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
