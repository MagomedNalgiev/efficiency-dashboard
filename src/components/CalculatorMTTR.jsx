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

import Header from "../components/Header"; // проверь путь

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function CalculatorMTTR() {
  const [totalDowntime, setTotalDowntime] = useState("");
  const [incidents, setIncidents] = useState("");
  const [mttr, setMTTR] = useState(null);

  const calculateMTTR = () => {
    if (incidents > 0) {
      const result = (totalDowntime / incidents).toFixed(2);
      setMTTR(result);
    } else {
      setMTTR(null);
    }
  };

  const data = {
    labels: Array.from({ length: incidents || 0 }, (_, i) => `Инцидент ${i + 1}`),
    datasets: [
      {
        label: "MTTR (часы)",
        data: Array.from({ length: incidents || 0 }, () => mttr || 0),
        borderColor: "rgb(239,68,68)", // red
        backgroundColor: "rgba(239,68,68,0.3)",
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col py-8 w-full pl-8 md:pl-16 pt-16">
      <Header />

      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 flex items-center gap-2">
        Калькулятор MTTR
      </h1>
      <p className="text-gray-200 text-lg md:text-xl leading-relaxed max-w-2xl mb-6">
        Введите общее время простоя (в часах) и количество инцидентов, чтобы рассчитать средний MTTR (Mean Time To Recovery).
      </p>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow w-full max-w-md mb-6">
        <label className="block mb-2 text-sm">Общее время простоя (часы):</label>
        <input
          type="number"
          value={totalDowntime}
          onChange={(e) => setTotalDowntime(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
          placeholder="Например: 48"
        />
        <label className="block mb-2 text-sm">Количество инцидентов:</label>
        <input
          type="number"
          value={incidents}
          onChange={(e) => setIncidents(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
          placeholder="Например: 6"
        />
        <button
          onClick={calculateMTTR}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded w-full"
        >
          Рассчитать MTTR
        </button>
        {mttr && (
          <p className="mt-4 text-lg">
            Средний MTTR:{" "}
            <span className="text-red-400 font-semibold">{mttr}</span> часов
          </p>
        )}
      </div>

      {mttr && (
        <div className="mt-8 w-full max-w-2xl">
          <Line data={data} />
        </div>
      )}

      <footer className="mt-12 text-gray-400 text-sm">
        © 2025 Efficiency Metrics. Все права защищены.
      </footer>
    </div>
  );
}
