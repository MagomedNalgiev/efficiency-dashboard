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

import Header from "../components/Header"; // проверь путь, если нужно

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function CalculatorVelocity() {
  const [storyPoints, setStoryPoints] = useState("");
  const [sprints, setSprints] = useState("");
  const [velocity, setVelocity] = useState(null);

  const calculateVelocity = () => {
    if (sprints > 0) {
      const result = (storyPoints / sprints).toFixed(2);
      setVelocity(result);
    } else {
      setVelocity(null);
    }
  };

  const data = {
    labels: Array.from({ length: sprints || 0 }, (_, i) => `Спринт ${i + 1}`),
    datasets: [
      {
        label: "Velocity",
        data: Array.from({ length: sprints || 0 }, () => velocity || 0),
        borderColor: "rgb(34,197,94)", // green
        backgroundColor: "rgba(34,197,94,0.3)",
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col py-8 w-full pl-8 md:pl-16 pt-16">
      <Header />

      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 flex items-center gap-2">
        Калькулятор Velocity
      </h1>
      <p className="text-gray-200 text-lg md:text-xl leading-relaxed max-w-2xl mb-6">
        Введите общее количество Story Points и количество спринтов, чтобы рассчитать среднюю Velocity команды.
      </p>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow w-full max-w-md mb-6">
        <label className="block mb-2 text-sm">Общее количество Story Points:</label>
        <input
          type="number"
          value={storyPoints}
          onChange={(e) => setStoryPoints(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
          placeholder="Например: 120"
        />
        <label className="block mb-2 text-sm">Количество спринтов:</label>
        <input
          type="number"
          value={sprints}
          onChange={(e) => setSprints(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
          placeholder="Например: 6"
        />
        <button
          onClick={calculateVelocity}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
        >
          Рассчитать Velocity
        </button>
        {velocity && (
          <p className="mt-4 text-lg">
            Средняя Velocity:{" "}
            <span className="text-green-400 font-semibold">{velocity}</span> story points/спринт
          </p>
        )}
      </div>

      {velocity && (
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
