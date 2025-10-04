// Шаблоны для быстрого создания калькуляторов с автосохранением

export const createSimpleCalculatorComponent = ({
  name,
  title,
  description,
  storageKey,
  calculatorType,
  fields,
  calculateFunction,
  chartConfig
}) => `
import { Line } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js"
import Header from "@components/Header"
import SaveIndicator from "@components/SaveIndicator"
import { useCalculator } from "@hooks/useCalculator"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const STORAGE_KEY = '${storageKey}'
const INITIAL_DATA = [${JSON.stringify(fields)}]

export default function ${name}() {
  const {
    data,
    results,
    lastSaved,
    isModified,
    hasCalculated,
    addItem,
    removeItem,
    updateItem,
    calculate,
    clearAllData
  } = useCalculator('${calculatorType}', INITIAL_DATA, STORAGE_KEY)

  // ... остальная логика калькулятора
}
`
