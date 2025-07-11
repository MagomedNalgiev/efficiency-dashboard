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

import Header from "../components/Header"; // путь подкорректируй при необходимости

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function CalculatorCycleTime() {
  const [totalDays, setTotalDays] = useState("");
  const [completedTasks, setCompletedTasks] = useState("");
  const [cycleTime, setCycleTime] = useState(null);

  const calculateCycleTime = () => {
    if (completedTasks > 0) {
      const result = (totalDays / completedTasks).toFixed(2);
      setCycleTime(result);
    } else {
      setCycleTime(null);
    }
  };

  const data = {
    labels: Array.from({ length: completedTasks || 0 }, (_, i) => `Задача ${i + 1}`),
    datasets: [
      {
        label: "Cycle Time (дни)",
        data: Array.from({ length: completedTasks || 0 }, () => cycleTime || 0),
        borderColor: "rgb(59,130,246)",
        backgroundColor: "rgba(59,130,246,0.3)",
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col py-8 w-full pl-8 md:pl-16">
      <Header />

      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 flex items-center gap-2">
        Калькулятор Cycle Time
      </h1>
      <p className="text-gray-200 text-lg md:text-xl leading-relaxed max-w-2xl mb-6">
        Введите общее количество дней работы над задачами и количество завершённых задач, чтобы рассчитать средний Cycle Time.
      </p>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow w-full max-w-md mb-6">
        <label className="block mb-2 text-sm">Общее количество дней:</label>
        <input
          type="number"
          value={totalDays}
          onChange={(e) => setTotalDays(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
          placeholder="Например: 30"
        />
        <label className="block mb-2 text-sm">Количество завершённых задач:</label>
        <input
          type="number"
          value={completedTasks}
          onChange={(e) => setCompletedTasks(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
          placeholder="Например: 15"
        />
        <button
          onClick={calculateCycleTime}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          Рассчитать Cycle Time
        </button>
        {cycleTime && (
          <p className="mt-4 text-lg">
            Средний Cycle Time:{" "}
            <span className="text-blue-400 font-semibold">{cycleTime}</span> дней/задачу
          </p>
        )}
      </div>

      {cycleTime && (
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
