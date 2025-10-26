import { Link } from "react-router-dom";
import { useSubscription } from "./contexts/SubscriptionContext";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { checkAccess, currentPlan, currentPlanInfo } = useSubscription();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col py-8 w-full px-8 md:px-16 pt-16">
      <h1 className="text-4xl font-bold text-white mb-6">Metricspace</h1>
      <p className="text-white/80 mb-8 max-w-4xl">
        Быстрый расчёт и визуализация метрик эффективности IT-команд: Velocity,
        Cycle Time, MTTR, Deployment Frequency и других.
        Рассчитывайте, стройте графики и улучшайте производительность вашей команды.
      </p>

      {/* Информация о плане */}
      {isAuthenticated && (
        <div className="mb-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-white/80">Ваш план: </span>
              <span className="text-white font-bold">{currentPlanInfo?.name}</span>
              {currentPlan === 'FREE' && currentPlanInfo && (
                <span className="text-orange-400 ml-2">
                  ({(currentPlanInfo.limits.calculationsPerMonth - (currentPlanInfo.usage?.calculationsThisMonth || 0))} расчетов)
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

      {/* ИЗМЕНИТЬ все ссылки - добавить /app/ в начало */}

      {/* Категория: Delivery */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Delivery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            title="Velocity"
            description="Расчет средней скорости команды"
            to="/app/velocity" // ИЗМЕНИТЬ
            hasAccess={checkAccess('velocity')}
            planRequired={!checkAccess('velocity') ? 'PRO' : null}
          />
          <Card
            title="Cycle Time"
            description="Время выполнения задачи"
            to="/app/cycletime" // ИЗМЕНИТЬ
            hasAccess={checkAccess('cycletime')}
            planRequired={!checkAccess('cycletime') ? 'PRO' : null}
          />
          <Card
            title="Deployment Frequency"
            description="Частота деплоев"
            to="/app/deploymentfrequency" // ИЗМЕНИТЬ
            hasAccess={checkAccess('deploymentfrequency')}
            planRequired={!checkAccess('deploymentfrequency') ? 'PRO' : null}
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
            to="/app/defectleakage" // ИЗМЕНИТЬ
            hasAccess={checkAccess('defectleakage')}
            planRequired={!checkAccess('defectleakage') ? 'PRO' : null}
          />
          <Card
            title="MTTR"
            description="Среднее время восстановления"
            to="/app/mttr" // ИЗМЕНИТЬ
            hasAccess={checkAccess('mttr')}
            planRequired={!checkAccess('mttr') ? 'PRO' : null}
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
            to="/app/cac" // ИЗМЕНИТЬ
            hasAccess={checkAccess('cac')}
            planRequired={!checkAccess('cac') ? 'PRO' : null}
          />
          <Card
            title="ROMI"
            description="Return on Marketing Investment"
            to="/app/romi" // ИЗМЕНИТЬ
            hasAccess={checkAccess('romi')}
            planRequired={!checkAccess('romi') ? 'PRO' : null}
          />
          <Card
            title="LTV"
            description="Lifetime Value"
            to="/app/ltv" // ИЗМЕНИТЬ
            hasAccess={checkAccess('ltv')}
            planRequired={!checkAccess('ltv') ? 'PRO' : null}
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
            to="/app/ebitda" // ИЗМЕНИТЬ
            hasAccess={checkAccess('ebitda')}
            planRequired={!checkAccess('ebitda') ? 'PRO' : null}
          />
          <Card
            title="ROS"
            description="Return on Sales"
            to="/app/ros" // ИЗМЕНИТЬ
            hasAccess={checkAccess('ros')}
            planRequired={!checkAccess('ros') ? 'PRO' : null}
          />
          <Card
            title="BEP"
            description="Break-even point"
            to="/app/bep" // ИЗМЕНИТЬ
            hasAccess={checkAccess('bep')}
            planRequired={!checkAccess('bep') ? 'PRO' : null}
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
            to="/app/custommetric" // ИЗМЕНИТЬ
            hasAccess={checkAccess('custommetric')}
            planRequired={!checkAccess('custommetric') ? 'PRO' : null}
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
            to="/app/data-manager" // ИЗМЕНИТЬ
            hasAccess={true}
          />
        </div>
      </div>
    </div>
  );
}

function Card({ title, description, to, hasAccess = true, planRequired = null }) {
  return (
    <Link
      to={to}
      className={`block bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow hover:bg-white/20 transition duration-200 relative ${
        !hasAccess ? 'opacity-75' : ''
      }`}
    >
      {!hasAccess && (
        <div className="absolute top-3 right-3">
          <div className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
            {planRequired}
          </div>
        </div>
      )}

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
