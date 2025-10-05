import { Link } from "react-router-dom";
import { useSubscription } from "./contexts/SubscriptionContext"; // ДОБАВИТЬ
import { useAuth } from "./contexts/AuthContext"; // ДОБАВИТЬ

function App() {
  const { checkAccess, currentPlan, currentPlanInfo } = useSubscription(); // ДОБАВИТЬ
  const { isAuthenticated } = useAuth(); // ДОБАВИТЬ

  return (
    <div className="min-h-screen flex flex-col py-8 w-full px-8 md:px-16 pt-16">
      <h1 className="text-4xl font-bold text-white mb-6">Metricspace</h1>
      <p className="text-white/80 mb-8 max-w-4xl">
        Быстрый расчёт и визуализация метрик эффективности IT-команд: Velocity,
        Cycle Time, MTTR, Deployment Frequency и других.
        Рассчитывайте, стройте графики и улучшайте производительность вашей команды.
      </p>

      {/* ДОБАВИТЬ: Информация о плане */}
      {isAuthenticated && (
        <div className="mb-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-white/80">Ваш план: </span>
              <span className="text-white font-bold">{currentPlanInfo?.name}</span>
              {currentPlan === 'FREE' && currentPlanInfo && (
                <span className="text-orange-400 ml-2">
                  ({currentPlanInfo.limits.calculationsPerMonth - 0} расчетов осталось)
                </span>
              )}
            </div>
            {currentPlan === 'FREE' && (
              <Link
                to="/pricing"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Улучшить план
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Категория: Delivery */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Delivery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            title="Velocity"
            description="Расчет средней скорости команды"
            to="/velocity"
            hasAccess={checkAccess('velocity')} // ДОБАВИТЬ
            planRequired={!checkAccess('velocity') ? 'PRO' : null} // ДОБАВИТЬ
          />
          <Card
            title="Cycle Time"
            description="Время выполнения задачи"
            to="/cycletime"
            hasAccess={checkAccess('cycletime')} // ДОБАВИТЬ
            planRequired={!checkAccess('cycletime') ? 'PRO' : null} // ДОБАВИТЬ
          />
          <Card
            title="Deployment Frequency"
            description="Частота деплоев"
            to="/deploymentfrequency"
            hasAccess={checkAccess('deploymentfrequency')} // ДОБАВИТЬ
            planRequired={!checkAccess('deploymentfrequency') ? 'PRO' : null} // ДОБАВИТЬ
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
            hasAccess={checkAccess('defectleakage')} // ДОБАВИТЬ
            planRequired={!checkAccess('defectleakage') ? 'PRO' : null} // ДОБАВИТЬ
          />
          <Card
            title="MTTR"
            description="Среднее время восстановления"
            to="/mttr"
            hasAccess={checkAccess('mttr')} // ДОБАВИТЬ
            planRequired={!checkAccess('mttr') ? 'PRO' : null} // ДОБАВИТЬ
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
            hasAccess={checkAccess('cac')} // ДОБАВИТЬ
            planRequired={!checkAccess('cac') ? 'PRO' : null} // ДОБАВИТЬ
          />
          <Card
            title="ROMI"
            description="Return on Marketing Investment"
            to="/romi"
            hasAccess={checkAccess('romi')} // ДОБАВИТЬ
            planRequired={!checkAccess('romi') ? 'PRO' : null} // ДОБАВИТЬ
          />
          <Card
            title="LTV"
            description="Lifetime Value"
            to="/ltv"
            hasAccess={checkAccess('ltv')} // ДОБАВИТЬ
            planRequired={!checkAccess('ltv') ? 'PRO' : null} // ДОБАВИТЬ
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
            hasAccess={checkAccess('ebitda')} // ДОБАВИТЬ
            planRequired={!checkAccess('ebitda') ? 'PRO' : null} // ДОБАВИТЬ
          />
          <Card
            title="ROS"
            description="Return on Sales"
            to="/ros"
            hasAccess={checkAccess('ros')} // ДОБАВИТЬ
            planRequired={!checkAccess('ros') ? 'PRO' : null} // ДОБАВИТЬ
          />
          <Card
            title="BEP"
            description="Break-even point"
            to="/bep"
            hasAccess={checkAccess('bep')} // ДОБАВИТЬ
            planRequired={!checkAccess('bep') ? 'PRO' : null} // ДОБАВИТЬ
          />
        </div>
      </div>

      {/* Категория: Прочее */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Прочее</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            title="Custom Metric"
            description="Пользовательская метрика"
            to="/custommetric"
            hasAccess={checkAccess('custommetric')} // ДОБАВИТЬ
            planRequired={!checkAccess('custommetric') ? 'PRO' : null} // ДОБАВИТЬ
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
            hasAccess={true} // Всегда доступно
          />
        </div>
      </div>
    </div>
  );
}

// ОБНОВИТЬ функцию Card:
function Card({ title, description, to, hasAccess = true, planRequired = null }) {
  return (
    <Link
      to={to}
      className={`block bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow hover:bg-white/20 transition duration-200 relative ${
        !hasAccess ? 'opacity-75' : ''
      }`}
    >
      {/* Индикатор ограничения доступа */}
      {!hasAccess && (
        <div className="absolute top-3 right-3">
          <div className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
            {planRequired}
          </div>
        </div>
      )}

      {/* Иконка блокировки */}
      {!hasAccess && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
          <span className="text-4xl">🔒</span>
        </div>
      )}

      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/70">{description}</p>
    </Link>
  );
}

export default App;
