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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-red-400 mb-4">🛠️ Калькулятор MTTR</h1>
      <p className="text-gray-300 max-w-md text-center mb-6">
        Введите общее время простоя (в часах) и количество инцидентов, чтобы рассчитать средний MTTR (Mean Time To Recovery).
      </p>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
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
          <p className="mt-4 text-lg text-center">
            Средний MTTR: <span className="text-red-400 font-semibold">{mttr}</span> часов
          </p>
        )}
      </div>

      {mttr && (
        <div className="mt-8 w-full max-w-2xl">
          <Line data={data} />
        </div>
      )}
    </div>
  );
}
