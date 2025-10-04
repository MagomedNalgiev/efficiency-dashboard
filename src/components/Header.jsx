import '../index.css';
import { Link } from "react-router-dom";

export default function Header({ toggleMenu, menuOpen }) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-black/20 backdrop-blur-sm p-4 flex items-center justify-between z-50">
      {/* Кнопка меню + Логотип СЛЕВА */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMenu}
          className="text-white text-xl hover:text-green-400 transition border border-white/30 rounded px-2 py-1"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
        <Link to="/" className="text-lg font-semibold text-white hover:text-green-400 transition">
          Metricspace
        </Link>
      </div>

      {/* Пустое место справа */}
      <div></div>
    </header>
  );
}
