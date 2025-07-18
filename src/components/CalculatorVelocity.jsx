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

export default function CalculatorVelocity() {
  const [sprintsData, setSprintsData] = useState([
    { storyPoints: "", focusFactor: "" }
  ]);
  const [velocities, setVelocities] = useState([]);

  const handleChange = (index, field, value) => {
    const updated = [...sprintsData];
    updated[index][field] = value;
    setSprintsData(updated);
  };

  const addSprint = () => {
    setSprintsData([...sprintsData, { storyPoints: "", focusFactor: "" }]);
  };

  const calculateVelocity = () => {
    const results = sprintsData.map(({ storyPoints, focusFactor }) => {
      const sp = parseFloat(storyPoints);
      const ff = parseFloat(focusFactor);
      if (!isNaN(sp) && !isNaN(ff) && ff >= 0) {
        return (sp * ff / 100).toFixed(2);
      }
      return 0;
    });
    setVelocities(results);
  };

  const data = {
    labels: sprintsData.map((_, i) => `Спринт ${i + 1}`),
    datasets: [
      {
        label: "Velocity",
        data: velocities,
        borderColor: "rgb(34,197,94)",
        backgroundColor: "rgba(34,197,94,0.3)",
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          color: "#ffffff", // белый цвет для легенды
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#ffffff", // белый цвет оси X
        },
        grid: {
          color: "rgba(255,255,255,0.1)", // светлая сетка X
        },
      },
      y: {
        ticks: {
          color: "#ffffff", // белый цвет оси Y
        },
        grid: {
          color: "rgba(255,255,255,0.1)", // светлая сетка Y
        },
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col pt-16 px-4 md:px-16 py-8">

      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 flex items-center gap-2">
        Калькулятор Velocity
      </h1>
      <p className="text-gray-200 text-lg md:text-xl leading-relaxed max-w-2xl mb-6">
        Укажите Story Points и Focus-фактор для каждого спринта, чтобы рассчитать динамику Velocity команды.
      </p>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow w-full max-w-2xl mb-6">
        {sprintsData.map((sprint, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-white font-semibold mb-2">Спринт {index + 1}</h3>
            <label className="block mb-2 text-sm">Story Points:</label>
            <input
              type="number"
              value={sprint.storyPoints}
              onChange={(e) =>
                handleChange(index, "storyPoints", e.target.value)
              }
              className="w-full p-2 mb-2 rounded bg-white/5 text-white placeholder-white placeholder:text-sm focus:outline-none"
              placeholder="Например: 30"
            />
            <label className="block mb-2 text-sm">Focus-фактор (%):</label>
            <input
              type="number"
              value={sprint.focusFactor}
              onChange={(e) =>
                handleChange(index, "focusFactor", e.target.value)
              }
              className="w-full p-2 mb-2 rounded bg-white/5 text-white placeholder-white placeholder:text-sm focus:outline-none"
              placeholder="Например: 90"
            />
          </div>
        ))}

        <button
          onClick={addSprint}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded w-full mb-4"
        >
          ➕ Добавить спринт
        </button>

        <button
          onClick={calculateVelocity}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
        >
          Рассчитать Velocity
        </button>
      </div>

      {velocities.length > 0 && (
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
