import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { useCalculator } from "@hooks/useCalculator"
import { useCalculatorAccess } from "../hooks/useCalculatorAccess" // ДОБАВИТЬ
import AccessGate from "./subscription/AccessGate" // ДОБАВИТЬ

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const STORAGE_KEY = 'metricspace_ebitda_data'
const INITIAL_DATA = [{ revenue: "", expenses: "", depreciation: "", interest: "", tax: "" }]

export default function CalculatorEBITDA() {
  const { performCalculation } = useCalculatorAccess('ebitda') // ДОБАВИТЬ

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
    addItem({ revenue: "", expenses: "", depreciation: "", interest: "", tax: "" })
  }

  const calculateEBITDA = () => {
    const result = performCalculation(() => {
      return periods.map(period => {
        const revenue = parseFloat(period.revenue) || 0
        const expenses = parseFloat(period.expenses) || 0
        const depreciation = parseFloat(period.depreciation) || 0
        const interest = parseFloat(period.interest) || 0
        const tax = parseFloat(period.tax) || 0

        // EBITDA = Revenue - Operating Expenses + Depreciation + Interest + Tax
        const ebitda = revenue - expenses + depreciation + interest + tax
        return ebitda.toFixed(0)
      })
    })

    if (result) {
      calculate(() => result)
    }
  }

  const avgEBITDA = results.length > 0
    ? (results.reduce((sum, ebitda) => sum + parseFloat(ebitda), 0) / results.length).toFixed(0)
    : 0

  const data = {
    labels: periods.map((_, i) => `Период ${i + 1}`),
    datasets: [{
      label: "EBITDA (₽)",
      data: results,
      backgroundColor: results.map(r => parseFloat(r) > 0 ? "rgba(34,197,94,0.8)" : "rgba(239,68,68,0.8)"),
      borderColor: results.map(r => parseFloat(r) > 0 ? "rgb(34,197,94)" : "rgb(239,68,68)"),
      borderWidth: 1,
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
    <AccessGate calculatorId="ebitda"> {/* ДОБАВИТЬ AccessGate */}
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-6">EBITDA</h1>
            <p className="text-white/80 mb-8">
              Earnings Before Interest, Taxes, Depreciation and Amortization -
              прибыль до уплаты процентов, налогов и амортизации.
              Ключевой показатель операционной эффективности компании.
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
                      <label className="block text-white mb-2">Выручка (₽):</label>
                      <input
                        type="number"
                        value={period.revenue}
                        onChange={(e) => handleChange(index, 'revenue', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Например: 1000000"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Операционные расходы (₽):</label>
                      <input
                        type="number"
                        value={period.expenses}
                        onChange={(e) => handleChange(index, 'expenses', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Например: 700000"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Амортизация (₽):</label>
                      <input
                        type="number"
                        value={period.depreciation}
                        onChange={(e) => handleChange(index, 'depreciation', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Например: 50000"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Проценты по кредитам (₽):</label>
                      <input
                        type="number"
                        value={period.interest}
                        onChange={(e) => handleChange(index, 'interest', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Например: 30000"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-white mb-2">Налоги (₽):</label>
                      <input
                        type="number"
                        value={period.tax}
                        onChange={(e) => handleChange(index, 'tax', e.target.value)}
                        className="w-full p-3 rounded bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Например: 80000"
                      />
                    </div>
                  </div>

                  {results[index] && (
                    <div className={`mt-3 p-2 rounded ${
                      parseFloat(results[index]) > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      <strong>EBITDA: {parseInt(results[index]).toLocaleString()} ₽</strong>
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
            </div>

            {results.length > 0 && hasCalculated && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="mb-4 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Результаты</h3>
                  <p className="text-white/80">
                    Средний EBITDA: <span className={`font-bold ${
                      parseFloat(avgEBITDA) > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>{parseInt(avgEBITDA).toLocaleString()} ₽</span>
                  </p>
                </div>
                <Bar data={data} options={options} />
              </div>
            )}
          </div>
        </div>
      </div>
    </AccessGate>
  )
}
