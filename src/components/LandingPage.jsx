import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'
import AuthModal from './auth/AuthModal'
import PricingModal from './subscription/PricingModal'
import { useAuth } from '../contexts/AuthContext'
import { trackEvent } from '../utils/analytics'
import { trackLandingEvents, setupScrollTracking } from '../utils/landingAnalytics'

export default function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [pricingModalOpen, setPricingModalOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  // ДОБАВЛЕННАЯ АНАЛИТИКА
  useEffect(() => {
    trackLandingEvents.heroViewed()
    const cleanup = setupScrollTracking()

    return cleanup
  }, [])

  const handleGetStarted = () => {
    const userType = isAuthenticated ? 'authenticated' : 'guest'
    trackLandingEvents.getStartedClicked(userType)

    if (isAuthenticated) {
      trackEvent('landing_get_started_authenticated')
      // Перенаправляем на главную страницу приложения
      window.location.href = '/app'
    } else {
      trackEvent('landing_get_started_guest')
      trackLandingEvents.signupStarted()
      setAuthModalOpen(true)
    }
  }

  const handleViewPricing = () => {
    trackLandingEvents.viewPricingClicked()
    trackEvent('landing_view_pricing')
    setPricingModalOpen(true)
  }

  // Обработчик для отслеживания hovering калькуляторов
  const handleCalculatorHover = (calculatorName) => {
    trackLandingEvents.calculatorHovered(calculatorName)
  }

  // Обработчик успешной регистрации
  const handleAuthSuccess = () => {
    trackLandingEvents.signupCompleted()
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      {/* Hero секция */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto text-center max-w-6xl">
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Измеряйте эффективность <br/>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                IT-команды легко
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-4xl mx-auto leading-relaxed">
              13 профессиональных калькуляторов для расчета ключевых метрик: Velocity, MTTR,
              Deployment Frequency, CAC, LTV, EBITDA и других. Визуализируйте результаты
              и принимайте решения на основе данных.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Начать бесплатно
              </button>

              <button
                onClick={handleViewPricing}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-200 border border-white/30"
              >
                Посмотреть тарифы
              </button>
            </div>

            <p className="text-white/60 text-sm mt-4">
              Бесплатный план • Мгновенный доступ
            </p>
          </div>
        </div>
      </section>

      {/* Проблемы и решения */}
      <section
        className="py-16 px-4 bg-white/5"
        onMouseEnter={() => trackLandingEvents.problemsSectionViewed()}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-6">
              Устали от Excel и ручных расчетов?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-red-400 mb-6">Проблемы</h3>
              <ul className="space-y-4 text-white/80 text-lg">
                <li className="flex items-start">
                  <span className="text-red-400 mr-3">❌</span>
                  Тратите часы на расчеты метрик в Excel
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-3">❌</span>
                  Ошибки в формулах и потеря данных
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-3">❌</span>
                  Нет визуализации и истории изменений
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-3">❌</span>
                  Сложно отслеживать тренды
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-3">❌</span>
                  Команда не понимает метрики
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-green-400 mb-6">Решение</h3>
              <ul className="space-y-4 text-white/80 text-lg">
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">✅</span>
                  Расчет за 30 секунд без ошибок
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">✅</span>
                  Автосохранение и защита данных
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">✅</span>
                  Красивые графики и аналитика
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">✅</span>
                  Отслеживание динамики по периодам
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">✅</span>
                  Понятные результаты для всех
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Калькуляторы */}
      <section
        className="py-16 px-4"
        onMouseEnter={() => trackLandingEvents.calculatorsSectionViewed()}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-6">
              13 профессиональных калькуляторов
            </h2>
            <p className="text-xl text-white/70">
              Все метрики, которые нужны для управления командой
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Velocity', desc: 'Скорость команды', category: 'Dev', free: true },
              { name: 'Cycle Time', desc: 'Время выполнения', category: 'Dev', free: true },
              { name: 'MTTR', desc: 'Время восстановления', category: 'Ops', free: true },
              { name: 'Deployment Frequency', desc: 'Частота деплоев', category: 'Dev', free: false },
              { name: 'Defect Leakage', desc: 'Утечка багов', category: 'QA', free: false },
              { name: 'CAC', desc: 'Стоимость клиента', category: 'Marketing', free: false },
              { name: 'ROMI', desc: 'ROI маркетинга', category: 'Marketing', free: false },
              { name: 'LTV', desc: 'Ценность клиента', category: 'Marketing', free: false },
              { name: 'EBITDA', desc: 'Операционная прибыль', category: 'Finance', free: false },
              { name: 'ROS', desc: 'Рентабельность продаж', category: 'Finance', free: false },
              { name: 'BEP', desc: 'Точка безубыточности', category: 'Finance', free: false },
              { name: 'Custom Metric', desc: 'Ваши метрики', category: 'Custom', free: false },
            ].map((calc, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 relative hover:bg-white/15 transition-all duration-200"
                onMouseEnter={() => handleCalculatorHover(calc.name)}
              >
                {calc.free && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    FREE
                  </div>
                )}
                {!calc.free && (
                  <div className="absolute top-3 right-3 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                    PRO
                  </div>
                )}

                <div className="mb-3">
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-medium">
                    {calc.category}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">{calc.name}</h3>
                <p className="text-white/70 mb-4">{calc.desc}</p>

                <div className="flex justify-between items-center">
                  <span className="text-green-400 text-sm">✓ Автосохранение</span>
                  <span className="text-blue-400 text-sm">📊 Графики</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA секция */}
      <section
        className="py-20 px-4"
        onMouseEnter={() => trackLandingEvents.ctaSectionViewed()}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Готовы улучшить метрики команды?
          </h2>

          <p className="text-xl text-white/80 mb-8">
            Присоединяйтесь к командам, которые уже используют Metricspace
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-xl px-12 py-4 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Начать бесплатно прямо сейчас
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">3</div>
              <div className="text-white/70">бесплатных калькулятора</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">5</div>
              <div className="text-white/70">расчетов в месяц</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">0₽</div>
              <div className="text-white/70">стартовая цена</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-white text-xl font-bold">Metricspace</div>
              <div className="text-white/60 text-sm">Метрики эффективности для IT-команд</div>
            </div>

            <div className="flex space-x-6">
              <Link to="/pricing" className="text-white/70 hover:text-white transition-colors">
                Тарифы
              </Link>
              <Link to="/blog" className="text-white/70 hover:text-white transition-colors">
                Блог
              </Link>
              <a href="mailto:support@metricspace.ru" className="text-white/70 hover:text-white transition-colors">
                Поддержка
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Модальные окна */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode="register"
      />

      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
      />
    </div>
  )
}
