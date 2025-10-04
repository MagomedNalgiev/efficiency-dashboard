import { Link } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen flex flex-col py-8 w-full px-8 md:px-16 pt-16">
      <h1 className="text-4xl font-bold text-white mb-6">Metricspace</h1>
      <p className="text-white/80 mb-8 max-w-4xl">
        Быстрый расчёт и визуализация метрик эффективности IT-команд: Velocity,
        Cycle Time, MTTR, Deployment Frequency и других.
        Рассчитывайте, стройте графики и улучшайте производительность вашей команды.
      </p>

      {/* Категория: Delivery */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Delivery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            title="Velocity"
            description="Расчет средней скорости команды"
            to="/velocity"
          />
          <Card
            title="Cycle Time"
            description="Время выполнения задачи"
            to="/cycletime"
          />
          <Card
            title="Deployment Frequency"
            description="Частота деплоев"
            to="/deploymentfrequency"
          />
        </div>
      </div>

      {/* Категория: Quality */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Quality</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            title="Defect Leakage"
            description="Анализ багов и качества"
            to="/defectleakage"
          />
          <Card
            title="MTTR"
            description="Среднее время восстановления"
            to="/mttr"
          />
        </div>
      </div>

      {/* Категория: Маркетинг */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Маркетинг</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            title="CAC"
            description="Customer Acquisition Cost"
            to="/cac"
          />
          <Card
            title="ROMI"
            description="Return on Marketing Investment"
            to="/romi"
          />
          <Card
            title="LTV"
            description="Lifetime Value"
            to="/ltv"
          />
        </div>
      </div>

      {/* Категория: Финансы */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Финансы</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            title="EBITDA"
            description="Прибыль до налогообложения"
            to="/ebitda"
          />
          <Card
            title="ROS"
            description="Return on Sales"
            to="/ros"
          />
          <Card
            title="BEP"
            description="Break-even point"
            to="/bep"
          />
        </div>
      </div>

      {/* Категория: Custom */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Прочее</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            title="Custom Metric"
            description="Пользовательская метрика"
            to="/custommetric"
          />
        </div>
      </div>

      {/* Категория: Управление */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Управление</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            title="Управление данными"
            description="Экспорт и управление сохраненными данными"
            to="/data-manager"
          />
        </div>
      </div>
    </div>
  );
}

function Card({ title, description, to }) {
  return (
    <Link
      to={to}
      className="block bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow hover:bg-white/20 transition duration-200"
    >
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/70">{description}</p>
    </Link>
  );
}

export default App;
