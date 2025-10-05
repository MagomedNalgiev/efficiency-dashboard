import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useSubscription } from "../contexts/SubscriptionContext"
import AuthModal from "./auth/AuthModal"

export default function Header({ toggleMenu, menuOpen }) {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const { currentPlan, usage, currentPlanInfo } = useSubscription()
  const location = useLocation()

  // Определяем, находимся ли мы в приложении
  const isInApp = location.pathname.startsWith('/app')

  const handleAuthClick = () => {
    setAuthModalOpen(true)
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-black/20 backdrop-blur-sm p-4 flex items-center justify-between z-50">
        {/* Кнопка меню + Логотип СЛЕВА */}
        <div className="flex items-center space-x-4">
          {/* Показывать кнопку меню только в приложении */}
          {isInApp && (
            <button
              onClick={toggleMenu}
              className="text-white text-2xl font-bold transition-transform duration-200"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          )}

          <Link
            to={isAuthenticated ? "/app" : "/"}
            className="text-white text-xl font-bold"
          >
            Metricspace
          </Link>
        </div>

        {/* Навигация и аутентификация СПРАВА */}
        <div className="flex items-center space-x-4">
          {/* Навигационные ссылки */}
          <Link
            to="/pricing"
            className="text-white/80 hover:text-white transition-colors hidden md:inline"
          >
            Тарифы
          </Link>

          {/* ДОБАВЛЕННАЯ КНОПКА БЛОГ */}
          <Link
            to="/blog"
            className="text-white/80 hover:text-white transition-colors hidden md:inline"
          >
            Блог
          </Link>

          {/* Индикатор использования для FREE плана */}
          {isAuthenticated && currentPlan === 'FREE' && currentPlanInfo && isInApp && (
            <div className="hidden lg:flex items-center space-x-2 bg-orange-500/20 px-3 py-1 rounded-full">
              <span className="text-orange-400 text-sm">
                {usage.calculationsThisMonth || 0}/{currentPlanInfo.limits.calculationsPerMonth}
              </span>
              <span className="text-orange-300 text-xs">расчетов</span>
            </div>
          )}

          {/* Аутентификация */}
          {isAuthenticated ? (
            <>
              <span className="text-white/80 hidden md:inline">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-white/80 hover:text-white transition-colors"
              >
                Выход
              </button>
            </>
          ) : (
            <button
              onClick={handleAuthClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Войти
            </button>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
      />
    </>
  )
}
