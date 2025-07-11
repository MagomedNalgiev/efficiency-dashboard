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

export default function CalculatorDefectLeakage() {
  const [prodDefects, setProdDefects] = useState("");
  const [totalDefects, setTotalDefects] = useState("");
  const [defectLeakage, setDefectLeakage] = useState(null);

  const calculateDefectLeakage = () => {
    if (totalDefects > 0) {
      const result = ((prodDefects / totalDefects) * 100).toFixed(2);
      setDefectLeakage(result);
    } else {
      setDefectLeakage(null);
    }
  };

  const data = {
    labels: ["Defect Leakage %"],
    datasets: [
      {
        label: "Defect Leakage %",
        data: [defectLeakage || 0],
        borderColor: "rgb(245,158,11)", // amber
        backgroundColor: "rgba(245,158,11,0.3)",
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col py-8 w-full pl-8 md:pl-16 pt-16">
      <Header />

      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 flex items-center gap-2">
        Калькулятор Defect Leakage
      </h1>
      <p className="text-gray-200 text-lg md:text-xl leading-relaxed max-w-2xl mb-6">
        Введите количество дефектов, обнаруженных в продакшене, и общее количество дефектов, чтобы рассчитать процент Defect Leakage.
      </p>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow w-full max-w-md mb-6">
        <label className="block mb-2 text-sm">Количество дефектов в продакшене:</label>
        <input
          type="number"
          value={prodDefects}
          onChange={(e) => setProdDefects(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
          placeholder="Например: 5"
        />
        <label className="block mb-2 text-sm">Общее количество дефектов (QA + Прод):</label>
        <input
          type="number"
          value={totalDefects}
          onChange={(e) => setTotalDefects(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
          placeholder="Например: 50"
        />
        <button
          onClick={calculateDefectLeakage}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded w-full"
        >
          Рассчитать Defect Leakage
        </button>
        {defectLeakage && (
          <p className="mt-4 text-lg">
            Defect Leakage:{" "}
            <span className="text-amber-400 font-semibold">{defectLeakage}%</span>
          </p>
        )}
      </div>

      {defectLeakage && (
        <div className="mt-8 w-full max-w-md">
          <Line data={data} />
        </div>
      )}

      <footer className="mt-12 text-gray-400 text-sm">
        © 2025 Efficiency Metrics. Все права защищены.
      </footer>
    </div>
  );
}
