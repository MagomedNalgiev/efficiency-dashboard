import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import AuthModal from "./auth/AuthModal"

export default function Header({ toggleMenu, menuOpen }) {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()

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
          <button
            onClick={toggleMenu}
            className="text-white text-2xl font-bold transition-transform duration-200"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
          <Link to="/" className="text-white text-xl font-bold">
            Metricspace
          </Link>
        </div>

        {/* Навигация и аутентификация СПРАВА */}
        <div className="flex items-center space-x-4">
          {/* ДОБАВИТЬ кнопку Тарифы */}
          <Link
            to="/pricing"
            className="text-white/80 hover:text-white transition-colors hidden md:inline"
          >
            Тарифы
          </Link>

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
