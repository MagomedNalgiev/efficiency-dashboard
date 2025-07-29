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

export default function CalculatorROS() {
  const [rosData, setRosData] = useState([{ revenue: "", profit: "" }]);
  const [results, setResults] = useState([]);

  const handleChange = (index, field, value) => {
    const updated = [...rosData];
    updated[index][field] = value;
    setRosData(updated);
  };

  const addRow = () => {
    setRosData([...rosData, { revenue: "", profit: "" }]);
  };

  const calculateROS = () => {
    const res = rosData.map(({ revenue, profit }) => {
      const r = parseFloat(revenue);
      const p = parseFloat(profit);
      if (!isNaN(r) && r > 0 && !isNaN(p)) {
        return ((p / r) * 100).toFixed(2);
      }
      return 0;
    });
    setResults(res);
  };

  const data = {
    labels: rosData.map((_, i) => `Период ${i + 1}`),
    datasets: [
      {
        label: "ROS (%)",
        data: results,
        borderColor: "rgb(251,191,36)",
        backgroundColor: "rgba(251,191,36,0.3)",
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
        ROS
      </h1>
      <p className="text-gray-200 text-lg md:text-xl leading-relaxed max-w-2xl mb-6">
        Укажите выручку и чистую прибыль за каждый период, чтобы рассчитать ROS (Return on Sales) — рентабельность продаж.
      </p>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow w-full max-w-2xl mb-6">
        {rosData.map((entry, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-white font-semibold mb-2">Период {index + 1}</h3>

            <label className="block mb-2 text-sm">Выручка (₽):</label>
            <input
              type="number"
              value={entry.revenue}
              onChange={(e) => handleChange(index, "revenue", e.target.value)}
              className="w-full p-2 mb-2 rounded bg-white/5 text-white placeholder-white placeholder:text-sm focus:outline-none"
              placeholder="Например: 500000"
            />

            <label className="block mb-2 text-sm">Чистая прибыль (₽):</label>
            <input
              type="number"
              value={entry.profit}
              onChange={(e) => handleChange(index, "profit", e.target.value)}
              className="w-full p-2 mb-2 rounded bg-white/5 text-white placeholder-white placeholder:text-sm focus:outline-none"
              placeholder="Например: 80000"
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
          onClick={calculateROS}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded w-full"
        >
          Рассчитать ROS
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
