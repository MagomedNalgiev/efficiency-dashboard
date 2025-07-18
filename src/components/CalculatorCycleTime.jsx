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

export default function CalculatorCycleTime() {
  const [tasks, setTasks] = useState([{ days: "" }]);
  const [average, setAverage] = useState(null);

  const handleChange = (index, value) => {
    const updated = [...tasks];
    updated[index].days = value;
    setTasks(updated);
  };

  const addTask = () => {
    setTasks([...tasks, { days: "" }]);
  };

  const calculateAverage = () => {
    const values = tasks.map((t) => parseFloat(t.days)).filter((v) => !isNaN(v));
    if (values.length > 0) {
      const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
      setAverage(avg);
    } else {
      setAverage(null);
    }
  };

  const data = {
    labels: tasks.map((_, i) => `Задача ${i + 1}`),
    datasets: [
      {
        label: "Cycle Time (дни)",
        data: tasks.map((t) => parseFloat(t.days) || 0),
        borderColor: "rgb(59,130,246)",
        backgroundColor: "rgba(59,130,246,0.3)",
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          color: "#ffffff",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#ffffff",
        },
      },
      y: {
        ticks: {
          color: "#ffffff",
        },
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col py-8 w-full pl-8 md:pl-16 pt-16">

      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 flex items-center gap-2">
        Калькулятор Cycle Time
      </h1>
      <p className="text-gray-200 text-lg md:text-xl leading-relaxed max-w-2xl mb-6">
        Укажите количество дней на выполнение каждой задачи, чтобы рассчитать средний Cycle Time и визуализировать данные.
      </p>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow w-full max-w-2xl mb-6">
        {tasks.map((task, index) => (
          <div key={index} className="mb-4">
            <label className="block mb-1 text-sm text-white">
              Задача {index + 1} — дней:
            </label>
            <input
              type="number"
              value={task.days}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-full p-2 mb-2 rounded bg-white/5 text-white placeholder-white placeholder:text-sm focus:outline-none"
              placeholder="Например: 5"
            />
          </div>
        ))}

        <button
          onClick={addTask}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded w-full mb-4"
        >
          ➕ Добавить задачу
        </button>

        <button
          onClick={calculateAverage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          Рассчитать Cycle Time
        </button>

        {average && (
          <p className="mt-4 text-lg text-white">
            Средний Cycle Time:{" "}
            <span className="text-blue-400 font-semibold">{average}</span> дней
          </p>
        )}
      </div>

      {average && (
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
