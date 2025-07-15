import { Link } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen w-full px-6 md:px-16 pt-24 pb-12 bg-gray-900 text-white">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Efficiency Metrics</h1>
      <p className="text-lg md:text-xl leading-relaxed max-w-3xl mb-8 text-gray-300">
        Быстрый расчёт и визуализация метрик эффективности IT-команд: Velocity, Cycle Time, MTTR, Deployment Frequency и других.
        Рассчитывайте, стройте графики, выгружайте отчёты и улучшайте производительность вашей команды.
      </p>

      {/* Категория: Delivery */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-white">Delivery</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card title="Velocity" description="Расчёт средней скорости команды" to="/velocity" />
          <Card title="Cycle Time" description="Время выполнения задачи" to="/cycletime" />
          <Card title="Deployment Frequency" description="Частота деплоев" to="/deploymentfrequency" />
        </div>
      </div>

      {/* Категория: Quality */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-white">Quality</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card title="Defect Leakage" description="Анализ багов и качества" to="/defectleakage" />
          <Card title="MTTR" description="Среднее время восстановления" to="/mttr" />
        </div>
      </div>

      {/* Категория: Custom */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-white">Прочее</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card title="Custom Metric" description="Добавить свою метрику" to="/custommetric" />
        </div>
      </div>

      <footer className="mt-12 text-gray-400 text-sm">
        © 2025 Efficiency Metrics. Все права защищены.
      </footer>
    </div>
  );
}

function Card({ title, description, to }) {
  return (
    <Link
      to={to}
      className="block bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow hover:bg-white/20 transition duration-200"
    >
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="text-gray-300 text-sm mt-1">{description}</p>
    </Link>
  );
}

export default App;
