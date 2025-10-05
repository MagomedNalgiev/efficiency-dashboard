import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import AuthModal from "./auth/AuthModal"

export default function Header({ toggleMenu, menuOpen }) {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const { isAuthenticated, user, logout } = useAuth()

  const handleAuthClick = (mode) => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  const handleLogout = async () => {
    await logout()
    // Можно добавить уведомление об успешном выходе
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

        {/* Аутентификация СПРАВА */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              <span className="text-white/80 hidden md:inline">
                Привет, {user?.name}!
              </span>
              <button
                onClick={handleLogout}
                className="text-white/80 hover:text-white transition-colors"
              >
                Выход
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleAuthClick('login')}
                className="text-white/80 hover:text-white transition-colors"
              >
                Вход
              </button>
              <button
                onClick={() => handleAuthClick('register')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Регистрация
              </button>
            </>
          )}
        </div>
      </header>

      {/* Модальное окно аутентификации */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  )
}
