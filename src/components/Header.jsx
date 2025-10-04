import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-gray-900/80 backdrop-blur-md z-40 shadow">
        <div className="flex justify-between items-center px-4 py-3 md:px-6 md:py-4 w-full">
          {/* Левая часть: бургер + логотип */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMenu}
              className="text-white text-xl hover:text-green-400 transition border border-white/30 rounded px-2 py-1"
            >
              {menuOpen ? "x" : "☰"}
            </button>

            <Link
              to="/"
              className="text-lg font-semibold text-white hover:text-green-400 transition"
            >
              Metricspace
            </Link>
          </div>

          {/* Горизонтальное меню на десктопе */}
          <nav className="hidden md:flex flex-wrap justify-center gap-5">
            <Link to="/velocity" className="text-gray-300 hover:text-green-400 transition">Velocity</Link>
            <Link to="/deploymentfrequency" className="text-gray-300 hover:text-green-400 transition">Deployment</Link>
            <Link to="/cycletime" className="text-gray-300 hover:text-blue-400 transition">Cycle Time</Link>
            <Link to="/mttr" className="text-gray-300 hover:text-red-400 transition">MTTR</Link>
            <Link to="/defectleakage" className="text-gray-300 hover:text-amber-400 transition">Defects</Link>
            <Link to="/custommetric" className="text-gray-300 hover:text-purple-400 transition">Custom</Link>
          </nav>
        </div>
      </header>

      <Sidebar isOpen={menuOpen} onClose={toggleMenu} />
    </>
  );
}