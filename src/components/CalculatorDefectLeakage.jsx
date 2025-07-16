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

import Header from "../components/Header";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function CalculatorDefectLeakage() {
  const [entries, setEntries] = useState([{ prodDefects: "", totalDefects: "" }]);
  const [leakages, setLeakages] = useState([]);

  const handleChange = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const addEntry = () => {
    setEntries([...entries, { prodDefects: "", totalDefects: "" }]);
  };

  const calculateLeakages = () => {
    const results = entries.map(({ prodDefects, totalDefects }) => {
      const prod = parseFloat(prodDefects);
      const total = parseFloat(totalDefects);
      if (!isNaN(prod) && !isNaN(total) && total > 0) {
        return ((prod / total) * 100).toFixed(2);
      }
      return 0;
    });
    setLeakages(results);
  };

  const data = {
    labels: entries.map((_, i) => `Наблюдение ${i + 1}`),
    datasets: [
      {
        label: "Defect Leakage (%)",
        data: leakages,
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
      },
      y: {
        ticks: { color: "#ffffff" },
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col py-8 w-full pl-8 md:pl-16 pt-16">

      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 flex items-center gap-2">
        Калькулятор Defect Leakage
      </h1>
      <p className="text-gray-200 text-lg md:text-xl leading-relaxed max-w-2xl mb-6">
        Введите значения по каждой итерации, чтобы рассчитать и визуализировать процент Defect Leakage.
      </p>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow w-full max-w-2xl mb-6">
        {entries.map((entry, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-white font-semibold mb-2">Наблюдение {index + 1}</h3>
            <label className="block mb-2 text-sm">Дефекты в продакшене:</label>
            <input
              type="number"
              value={entry.prodDefects}
              onChange={(e) => handleChange(index, "prodDefects", e.target.value)}
              className="w-full p-2 mb-2 rounded text-black"
              placeholder="Например: 5"
            />
            <label className="block mb-2 text-sm">Общее количество дефектов:</label>
            <input
              type="number"
              value={entry.totalDefects}
              onChange={(e) => handleChange(index, "totalDefects", e.target.value)}
              className="w-full p-2 rounded text-black"
              placeholder="Например: 50"
            />
          </div>
        ))}

        <button
          onClick={addEntry}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded w-full mb-4"
        >
          ➕ Добавить наблюдение
        </button>

        <button
          onClick={calculateLeakages}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded w-full"
        >
          Рассчитать Defect Leakage
        </button>
      </div>

      {leakages.length > 0 && (
        <div className="mt-8 w-full max-w-2xl">
          <Line data={data} options={options} />
        </div>
      )}

      <footer className="mt-12 text-gray-400 text-sm">
        © 2025 Metricspace
      </footer>
    </div>
  );
}
