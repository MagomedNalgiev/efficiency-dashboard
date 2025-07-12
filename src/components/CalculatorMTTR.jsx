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

export default function CalculatorMTTR() {
  const [incidents, setIncidents] = useState([{ hours: "" }]);
  const [average, setAverage] = useState(null);

  const handleChange = (index, value) => {
    const updated = [...incidents];
    updated[index].hours = value;
    setIncidents(updated);
  };

  const addIncident = () => {
    setIncidents([...incidents, { hours: "" }]);
  };

  const calculateAverage = () => {
    const values = incidents.map((i) => parseFloat(i.hours)).filter((v) => !isNaN(v));
    if (values.length > 0) {
      const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
      setAverage(avg);
    } else {
      setAverage(null);
    }
  };

  const data = {
    labels: incidents.map((_, i) => `Инцидент ${i + 1}`),
    datasets: [
      {
        label: "MTTR (часы)",
        data: incidents.map((i) => parseFloat(i.hours) || 0),
        borderColor: "rgb(239,68,68)",
        backgroundColor: "rgba(239,68,68,0.3)",
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
      <Header />

      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 flex items-center gap-2">
        Калькулятор MTTR
      </h1>
      <p className="text-gray-200 text-lg md:text-xl leading-relaxed max-w-2xl mb-6">
        Укажите длительность восстановления (в часах) по каждому инциденту, чтобы рассчитать средний MTTR и построить график.
      </p>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow w-full max-w-2xl mb-6">
        {incidents.map((incident, index) => (
          <div key={index} className="mb-4">
            <label className="block mb-1 text-sm text-white">
              Инцидент {index + 1} — время восстановления (часы):
            </label>
            <input
              type="number"
              value={incident.hours}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-full p-2 rounded text-black"
              placeholder="Например: 4"
            />
          </div>
        ))}

        <button
          onClick={addIncident}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded w-full mb-4"
        >
          ➕ Добавить инцидент
        </button>

        <button
          onClick={calculateAverage}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded w-full"
        >
          Рассчитать MTTR
        </button>

        {average && (
          <p className="mt-4 text-lg text-white">
            Средний MTTR:{" "}
            <span className="text-red-400 font-semibold">{average}</span> часов
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
