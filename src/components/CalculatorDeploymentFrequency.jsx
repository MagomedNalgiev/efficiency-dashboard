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

export default function CalculatorDeploymentFrequency() {
  const [deploys, setDeploys] = useState([{ daysBetween: "" }]);
  const [average, setAverage] = useState(null);

  const handleChange = (index, value) => {
    const updated = [...deploys];
    updated[index].daysBetween = value;
    setDeploys(updated);
  };

  const addDeploy = () => {
    setDeploys([...deploys, { daysBetween: "" }]);
  };

  const calculateAverage = () => {
    const values = deploys.map((d) => parseFloat(d.daysBetween)).filter((v) => !isNaN(v) && v > 0);
    if (values.length > 0) {
      const freqs = values.map((d) => +(1 / d).toFixed(3)); // деплоев в день
      const avg = (
        freqs.reduce((acc, val) => acc + val, 0) / freqs.length
      ).toFixed(3);
      setAverage(avg);
    } else {
      setAverage(null);
    }
  };

  const data = {
    labels: deploys.map((_, i) => `Деплой ${i + 1}`),
    datasets: [
      {
        label: "Деплоев в день",
        data: deploys.map((d) =>
          d.daysBetween && parseFloat(d.daysBetween) > 0
            ? +(1 / parseFloat(d.daysBetween)).toFixed(3)
            : 0
        ),
        borderColor: "rgb(34,197,94)",
        backgroundColor: "rgba(34,197,94,0.3)",
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
      <Header />

      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 flex items-center gap-2">
        Калькулятор Deployment Frequency
      </h1>
      <p className="text-gray-200 text-lg md:text-xl leading-relaxed max-w-2xl mb-6">
        Укажите количество дней между каждым деплоем, чтобы рассчитать среднюю частоту деплоев и построить график.
      </p>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow w-full max-w-2xl mb-6">
        {deploys.map((deploy, index) => (
          <div key={index} className="mb-4">
            <label className="block mb-1 text-sm text-white">
              Деплой {index + 1} — дней между деплоем и предыдущим:
            </label>
            <input
              type="number"
              value={deploy.daysBetween}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-full p-2 rounded text-black"
              placeholder="Например: 2"
            />
          </div>
        ))}

        <button
          onClick={addDeploy}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded w-full mb-4"
        >
          ➕ Добавить деплой
        </button>

        <button
          onClick={calculateAverage}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
        >
          Рассчитать частоту
        </button>

        {average && (
          <p className="mt-4 text-lg text-white">
            Средняя частота деплоев:{" "}
            <span className="text-green-400 font-semibold">{average}</span> в день
          </p>
        )}
      </div>

      {average && (
        <div className="mt-8 w-full max-w-2xl">
          <Line data={data} options={options} />
        </div>
      )}

      <footer className="mt-12 text-gray-400 text-sm">
        © 2025 Efficiency Metrics. Все права защищены.
      </footer>
    </div>
  );
}
