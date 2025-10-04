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

const STORAGE_KEY = 'metricspace_bep_data'
const INITIAL_DATA = [{ fixedCosts: "", salePrice: "", variableCosts: "" }]

export default function CalculatorBEP() {
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
  } = useCalculator('bep', INITIAL_DATA, STORAGE_KEY)

  const handleChange = (index, field, value) => {
    updateItem(index, field, value)
  }

  const addPeriod = () => {
    addItem({ fixedCosts: "", salePrice: "", variableCosts: "" })
  }

  const calculateBEP = () => {
    calculate((data) => {
      return data.map(period => {
        const fixedCosts = parseFloat(period.fixedCosts)
        const salePrice = parseFloat(period.salePrice)
        const variableCosts = parseFloat(period.variableCosts)

        if (!isNaN(fixedCosts) && !isNaN(salePrice) && !isNaN(variableCosts) &&
            salePrice > variableCosts && salePrice > 0) {
          const bep = fixedCosts / (salePrice - variableCosts)
          return Math.ceil(bep)
        }
        return 0
      })
    })
  }

  const avgBEP = results.length > 0
    ? Math.ceil(results.reduce((sum, bep) => sum + parseFloat(bep), 0) / results.length)
    : 0

  const data = {
    labels: periods.map((_, i) => `Период ${i + 1}`),
    datasets: [{
      label: "BEP (единиц)",
      data: results,
      borderColor: "rgb(251,146,60)",
      backgroundColor: "rgba(251,146,60,0.3)",
      tension: 0.1,
    }],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#ffffff" } },
      title: { display: true, text: 'Break-Even Point по периодам', color: '#ffffff' }
    },
    scales: {
      x: { ticks: { color: "#ffffff" }, grid: { color: "rgba(255,255,255,0.1)" } },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
        title: { display: true, text: 'Единиц товара', color: '#ffffff' }
      },
    },
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">BEP</h1>
          <p className="text-white/80 mb-8">
            Укажите постоянные издержки, цену продажи и переменные издержки на единицу, чтобы рассчитать точку безубыточности (Break-Even Point).
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
                    <label className="block text-white mb-2">Постоянные издержки (₽):</label>
                    <input
                      type="number"
                      min="0"
                      value={period.fixedCosts}
                      onChange={(e) => handleChange(index, 'fixedCosts', e.target.value)}
                      className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Например: 100000"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Цена продажи за единицу (₽):</label>
                    <input
                      type="number"
                      min="0"
                      value={period.salePrice}
                      onChange={(e) => handleChange(index, 'salePrice', e.target.value)}
                      className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Например: 1000"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Издержки на единицу (₽):</label>
                    <input
                      type="number"
                      min="0"
                      value={period.variableCosts}
                      onChange={(e) => handleChange(index, 'variableCosts', e.target.value)}
                      className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Например: 600"
                    />
                  </div>
                </div>

                {results[index] > 0 && (
                  <div className="mt-3 p-2 bg-orange-500/20 rounded text-orange-300">
                    <strong>BEP: {results[index]} единиц</strong>
                    <div className="text-sm mt-1">
                      Выручка в точке безубыточности: {(results[index] * parseFloat(period.salePrice || 0)).toLocaleString()} ₽
                    </div>
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
                onClick={calculateBEP}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200"
              >
                Рассчитать BEP
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
                  Средний BEP: <span className="text-orange-400 font-bold">{avgBEP} единиц</span>
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
