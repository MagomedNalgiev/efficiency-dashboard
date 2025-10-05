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

const STORAGE_KEY = 'metricspace_bep_data'
const INITIAL_DATA = [{ fixedCosts: "", variableCostPerUnit: "", pricePerUnit: "" }]

export default function CalculatorBEP() {
  const { performCalculation } = useCalculatorAccess('bep') // ДОБАВИТЬ

  const {
    data: products,
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

  const addProduct = () => {
    addItem({ fixedCosts: "", variableCostPerUnit: "", pricePerUnit: "" })
  }

  const calculateBEP = () => {
    const result = performCalculation(() => {
      return products.map(product => {
        const fixedCosts = parseFloat(product.fixedCosts) || 0
        const variableCost = parseFloat(product.variableCostPerUnit) || 0
        const price = parseFloat(product.pricePerUnit) || 0

        if (price > variableCost) {
          const bep = fixedCosts / (price - variableCost)
          return Math.ceil(bep) // округляем вверх до целого числа единиц
        }
        return 0
      })
    })

    if (result) {
      calculate(() => result)
    }
  }

  const avgBEP = results.length > 0
    ? Math.round(results.reduce((sum, bep) => sum + parseFloat(bep), 0) / results.length)
    : 0

  const data = {
    labels: products.map((_, i) => `Продукт ${i + 1}`),
    datasets: [{
      label: "BEP (единиц)",
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
      title: { display: true, text: 'Break-Even Point по продуктам', color: '#ffffff' }
    },
    scales: {
      x: { ticks: { color: "#ffffff" }, grid: { color: "rgba(255,255,255,0.1)" } },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
        title: { display: true, text: 'Единиц продукции', color: '#ffffff' }
      },
    },
  }

  return (
    <AccessGate calculatorId="bep"> {/* ДОБАВИТЬ AccessGate */}
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-6">BEP</h1>
            <p className="text-white/80 mb-8">
              Break-Even Point - точка безубыточности. Показывает, сколько единиц
              продукции нужно продать, чтобы покрыть все расходы.
              BEP = Постоянные затраты / (Цена за единицу - Переменные затраты за единицу)
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
              {products.map((product, index) => (
                <div key={index} className="mb-6 p-4 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-white">Продукт {index + 1}</h3>
                    {products.length > 1 && (
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
                      <label className="block text-white mb-2">Постоянные затраты (₽):</label>
                      <input
                        type="number"
                        min="0"
                        value={product.fixedCosts}
                        onChange={(e) => handleChange(index, 'fixedCosts', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="Например: 100000"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Переменные затраты за единицу (₽):</label>
                      <input
                        type="number"
                        min="0"
                        value={product.variableCostPerUnit}
                        onChange={(e) => handleChange(index, 'variableCostPerUnit', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="Например: 300"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Цена за единицу (₽):</label>
                      <input
                        type="number"
                        min="0"
                        value={product.pricePerUnit}
                        onChange={(e) => handleChange(index, 'pricePerUnit', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="Например: 800"
                      />
                    </div>
                  </div>

                  {results[index] > 0 && (
                    <div className="mt-3 p-2 bg-rose-500/20 rounded text-rose-300">
                      <strong>BEP: {parseInt(results[index]).toLocaleString()} единиц</strong>
                      <p className="text-sm text-rose-300/70 mt-1">
                        Выручка в точке безубыточности: {(parseInt(results[index]) * parseFloat(product.pricePerUnit || 0)).toLocaleString()} ₽
                      </p>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  onClick={addProduct}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Добавить продукт
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
            </div>

            {results.length > 0 && hasCalculated && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="mb-4 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Результаты</h3>
                  <p className="text-white/80">
                    Средний BEP: <span className="text-rose-400 font-bold">{avgBEP.toLocaleString()}</span> единиц
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
