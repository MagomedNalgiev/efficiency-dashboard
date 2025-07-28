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

export default function CalculatorLTV() {
  const [ltvData, setLtvData] = useState([{ arpu: "", lifetime: "" }]);
  const [results, setResults] = useState([]);

  const handleChange = (index, field, value) => {
    const updated = [...ltvData];
    updated[index][field] = value;
    setLtvData(updated);
  };

  const addRow = () => {
    setLtvData([...ltvData, { arpu: "", lifetime: "" }]);
  };

  const calculateLTV = () => {
    const res = ltvData.map(({ arpu, lifetime }) => {
      const a = parseFloat(arpu);
      const l = parseFloat(lifetime);
      if (!isNaN(a) && !isNaN(l)) {
        return (a * l).toFixed(2);
      }
      return 0;
    });
    setResults(res);
  };

  const data = {
    labels: ltvData.map((_, i) => `Период ${i + 1}`),
    datasets: [
      {
        label: "LTV",
        data: results,
        borderColor: "rgb(245,158,11)",
        backgroundColor: "rgba(245,158,11,0.3)",
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
        LTV калькулятор
      </h1>
      <p className="text-gray-200 text-lg md:text-xl leading-relaxed max-w-2xl mb-6">
        Укажите средний доход с одного клиента (ARPU) и продолжительность его жизни в периодах, чтобы рассчитать LTV.
      </p>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow w-full max-w-2xl mb-6">
        {ltvData.map((entry, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-white font-semibold mb-2">Период {index + 1}</h3>
            <label className="block mb-2 text-sm">Средний доход на клиента (ARPU, ₽):</label>
            <input
              type="number"
              value={entry.arpu}
              onChange={(e) => handleChange(index, "arpu", e.target.value)}
              className="w-full p-2 mb-2 rounded bg-white/5 text-white placeholder-white placeholder:text-sm focus:outline-none"
              placeholder="Например: 3000"
            />
            <label className="block mb-2 text-sm">Средняя продолжительность жизни (мес.):</label>
            <input
              type="number"
              value={entry.lifetime}
              onChange={(e) => handleChange(index, "lifetime", e.target.value)}
              className="w-full p-2 mb-2 rounded bg-white/5 text-white placeholder-white placeholder:text-sm focus:outline-none"
              placeholder="Например: 12"
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
          onClick={calculateLTV}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded w-full"
        >
          Рассчитать LTV
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
