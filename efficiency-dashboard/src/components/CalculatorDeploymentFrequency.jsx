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

export default function CalculatorDeploymentFrequency() {
  const [deployments, setDeployments] = useState("");
  const [periodDays, setPeriodDays] = useState("");
  const [frequency, setFrequency] = useState(null);

  const calculateFrequency = () => {
    if (periodDays > 0) {
      const result = (deployments / periodDays).toFixed(2);
      setFrequency(result);
    } else {
      setFrequency(null);
    }
  };

  const data = {
    labels: Array.from({ length: deployments || 0 }, (_, i) => `Деплой ${i + 1}`),
    datasets: [
      {
        label: "Частота деплоев (в день)",
        data: Array.from({ length: deployments || 0 }, () => frequency || 0),
        borderColor: "rgb(34,197,94)", // green
        backgroundColor: "rgba(34,197,94,0.3)",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-green-400 mb-4">🚀 Калькулятор Deployment Frequency</h1>
      <p className="text-gray-300 max-w-md text-center mb-6">
        Введите количество деплоев и количество дней в периоде, чтобы рассчитать частоту деплоев (сколько деплоев в среднем в день).
      </p>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
        <label className="block mb-2 text-sm">Количество деплоев:</label>
        <input
          type="number"
          value={deployments}
          onChange={(e) => setDeployments(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
          placeholder="Например: 25"
        />
        <label className="block mb-2 text-sm">Количество дней в периоде:</label>
        <input
          type="number"
          value={periodDays}
          onChange={(e) => setPeriodDays(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
          placeholder="Например: 30"
        />
        <button
          onClick={calculateFrequency}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
        >
          Рассчитать частоту деплоев
        </button>
        {frequency && (
          <p className="mt-4 text-lg text-center">
            Частота деплоев:{" "}
            <span className="text-green-400 font-semibold">{frequency}</span> деплоев/день
          </p>
        )}
      </div>

      {frequency && (
        <div className="mt-8 w-full max-w-2xl">
          <Line data={data} />
        </div>
      )}
    </div>
  );
}
