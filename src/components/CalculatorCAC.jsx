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

const STORAGE_KEY = 'metricspace_cac_data'
const INITIAL_DATA = [{ marketingCosts: "", newCustomers: "" }]

export default function CalculatorCAC() {
  const { performCalculation } = useCalculatorAccess('cac') // ДОБАВИТЬ

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
  } = useCalculator('cac', INITIAL_DATA, STORAGE_KEY)

  const handleChange = (index, field, value) => {
    updateItem(index, field, value)
  }

  const addPeriod = () => {
    addItem({ marketingCosts: "", newCustomers: "" })
  }

  const calculateCAC = () => {
    // ИЗМЕНИТЬ: использовать performCalculation вместо calculate напрямую
    const result = performCalculation(() => {
      return periods.map(period => {
        const costs = parseFloat(period.marketingCosts)
        const customers = parseFloat(period.newCustomers)
        if (!isNaN(costs) && !isNaN(customers) && customers > 0) {
          return (costs / customers).toFixed(0)
        }
        return 0
      })
    })

    if (result) {
      calculate(() => result)
    }
  }

  // Весь остальной код остается прежним...
  const avgCAC = results.length > 0
    ? (results.reduce((sum, cac) => sum + parseFloat(cac), 0) / results.length).toFixed(0)
    : 0

  const data = {
    labels: periods.map((_, i) => `Период ${i + 1}`),
    datasets: [{
      label: "CAC (₽)",
      data: results,
      borderColor: "rgb(16,185,129)",
      backgroundColor: "rgba(16,185,129,0.3)",
      tension: 0.1,
    }],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#ffffff" } },
      title: { display: true, text: 'Customer Acquisition Cost по периодам', color: '#ffffff' }
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
    <AccessGate calculatorId="cac"> {/* ДОБАВИТЬ AccessGate */}
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-6">CAC</h1>
            <p className="text-white/80 mb-8">
              Укажите расходы на маркетинг и количество новых клиентов за каждый период, чтобы рассчитать CAC (Customer Acquisition Cost).
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
                      <label className="block text-white mb-2">Маркетинговые расходы (₽):</label>
                      <input
                        type="number"
                        min="0"
                        value={period.marketingCosts}
                        onChange={(e) => handleChange(index, 'marketingCosts', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Например: 100000"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Новые клиенты:</label>
                      <input
                        type="number"
                        min="0"
                        value={period.newCustomers}
                        onChange={(e) => handleChange(index, 'newCustomers', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Например: 50"
                      />
                    </div>
                  </div>

                  {results[index] > 0 && (
                    <div className="mt-3 p-2 bg-green-500/20 rounded text-green-300">
                      <strong>CAC: {results[index]} ₽ за клиента</strong>
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
                  onClick={calculateCAC}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Рассчитать CAC
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
                    Средний CAC: <span className="text-green-400 font-bold">{avgCAC} ₽</span> за клиента
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
