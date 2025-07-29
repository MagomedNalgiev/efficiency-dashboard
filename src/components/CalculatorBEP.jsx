import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function CalculatorBEP() {
  const [bepData, setBepData] = useState([{ fixed: "", price: "", variable: "" }]);
  const [results, setResults] = useState([]);

  const handleChange = (index, field, value) => {
    const updated = [...bepData];
    updated[index][field] = value;
    setBepData(updated);
  };

  const addRow = () => {
    setBepData([...bepData, { fixed: "", price: "", variable: "" }]);
  };

  const calculateBEP = () => {
    const res = bepData.map(({ fixed, price, variable }) => {
      const f = parseFloat(fixed);
      const p = parseFloat(price);
      const v = parseFloat(variable);
      if (!isNaN(f) && !isNaN(p) && !isNaN(v) && (p - v) > 0) {
        return (f / (p - v)).toFixed(2);
      }
      return 0;
    });
    setResults(res);
  };

  const data = {
    labels: bepData.map((_, i) => `Период ${i + 1}`),
    datasets: [
      {
        label: "Точка безубыточности (единиц)",
        data: results,
        borderColor: "rgb(239,68,68)",
        backgroundColor: "rgba(239,68,68,0.3)",
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: { color: "#ffffff" },
      },
    },
    scales: {
      x: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col pt-16 px-4 md:px-16 py-8">
      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 flex items-center gap-2">
        BEP
      </h1>
      <p className="text-gray-200 text-lg md:text-xl leading-relaxed max-w-2xl mb-6">
        Укажите постоянные издержки, цену продажи и переменные издержки на единицу, чтобы рассчитать точку безубыточности (Break-Even Point).
      </p>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow w-full max-w-2xl mb-6">
        {bepData.map((entry, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-white font-semibold mb-2">Период {index + 1}</h3>

            <label className="block mb-2 text-sm">Постоянные издержки (₽):</label>
            <input
              type="number"
              value={entry.fixed}
              onChange={(e) => handleChange(index, "fixed", e.target.value)}
              className="w-full p-2 mb-2 rounded bg-white/5 text-white placeholder-white placeholder:text-sm focus:outline-none"
              placeholder="Например: 100000"
            />

            <label className="block mb-2 text-sm">Цена продажи за единицу (₽):</label>
            <input
              type="number"
              value={entry.price}
              onChange={(e) => handleChange(index, "price", e.target.value)}
              className="w-full p-2 mb-2 rounded bg-white/5 text-white placeholder-white placeholder:text-sm focus:outline-none"
              placeholder="Например: 1000"
            />

            <label className="block mb-2 text-sm">Переменные издержки на единицу (₽):</label>
            <input
              type="number"
              value={entry.variable}
              onChange={(e) => handleChange(index, "variable", e.target.value)}
              className="w-full p-2 mb-2 rounded bg-white/5 text-white placeholder-white placeholder:text-sm focus:outline-none"
              placeholder="Например: 600"
            />
          </div>
        ))}

        <button
          onClick={addRow}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded w-full mb-4"
        >
          ➕ Добавить период
        </button>

        <button
          onClick={calculateBEP}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded w-full"
        >
          Рассчитать BEP
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-8 w-full max-w-2xl">
          <Line data={data} options={options} />
        </div>
      )}

      <footer className="mt-12 text-gray-400 text-sm">© 2025 Metricspace</footer>
    </div>
  );
}
