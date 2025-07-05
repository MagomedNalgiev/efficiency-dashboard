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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-amber-400 mb-4">🐞 Калькулятор Defect Leakage</h1>
      <p className="text-gray-300 max-w-md text-center mb-6">
        Введите количество дефектов, обнаруженных в продакшене, и общее количество дефектов, чтобы рассчитать процент Defect Leakage.
      </p>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
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
          <p className="mt-4 text-lg text-center">
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
    </div>
  );
}