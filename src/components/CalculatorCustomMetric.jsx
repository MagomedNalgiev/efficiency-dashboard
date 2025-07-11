import Header from "../components/Header";
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

export default function CalculatorCustomMetric() {
  const [labels, setLabels] = useState("");
  const [values, setValues] = useState("");
  const [parsedLabels, setParsedLabels] = useState([]);
  const [parsedValues, setParsedValues] = useState([]);

  const generateChart = () => {
    const labelsArray = labels.split(",").map((l) => l.trim());
    const valuesArray = values.split(",").map((v) => Number(v.trim()));

    if (labelsArray.length === valuesArray.length && valuesArray.every((v) => !isNaN(v))) {
      setParsedLabels(labelsArray);
      setParsedValues(valuesArray);
    } else {
      alert("Количество меток и значений должно совпадать, а значения должны быть числами.");
    }
  };

  const data = {
    labels: parsedLabels,
    datasets: [
      {
        label: "Custom Metric",
        data: parsedValues,
        borderColor: "rgb(147,51,234)", // purple
        backgroundColor: "rgba(147,51,234,0.3)",
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col py-8 w-full pl-8 md:pl-16">
      <Header />

      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 flex items-center gap-2">
        Калькулятор Custom Metric
      </h1>
      <p className="text-gray-200 text-lg md:text-xl leading-relaxed max-w-2xl mb-6">
        Введите метки (через запятую) и значения (через запятую), чтобы построить свой собственный график для анализа метрик.
      </p>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow w-full max-w-xl mb-6">
        <label className="block mb-2 text-sm">Метки (через запятую):</label>
        <input
          type="text"
          value={labels}
          onChange={(e) => setLabels(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
          placeholder="Например: Январь, Февраль, Март"
        />
        <label className="block mb-2 text-sm">Значения (через запятую):</label>
        <input
          type="text"
          value={values}
          onChange={(e) => setValues(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
          placeholder="Например: 10, 20, 30"
        />
        <button
          onClick={generateChart}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded w-full"
        >
          Построить график
        </button>
      </div>

      {parsedLabels.length > 0 && (
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
