import '../index.css';
import Header from './Header';
import { useState } from "react";
import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white">
      {/* Сайдбар */}
      <aside
        className={`fixed top-0 left-0 h-full w-56 md:w-64 bg-black z-40 shadow-lg pt-20 transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-6 space-y-6">
          <div>
            <h3 className="text-sm text-gray-400 uppercase mb-2">Delivery</h3>
            <Link to="/velocity" className="block hover:text-green-400">Velocity</Link>
            <Link to="/cycletime" className="block hover:text-blue-400">Cycle Time</Link>
            <Link to="/deploymentfrequency" className="block hover:text-green-400">Deployment Frequency</Link>
          </div>
          <div>
            <h3 className="text-sm text-gray-400 uppercase mb-2">Quality</h3>
            <Link to="/defectleakage" className="block hover:text-amber-400">Defect Leakage</Link>
            <Link to="/mttr" className="block hover:text-red-400">MTTR</Link>
          </div>
          <div>
            <h3 className="text-sm text-gray-400 uppercase mb-2">Прочее</h3>
            <Link to="/custommetric" className="block hover:text-purple-400">Custom Metric</Link>
          </div>
        </nav>
      </aside>

      {/* Обертка для header + main с отступом */}
      <div className={`transition-all duration-300 ${menuOpen ? "md:pl-64" : "md:pl-0"}`}>
        {/* Верхняя панель */}
        <header className="fixed top-0 left-0 right-0 bg-black backdrop-blur-md z-50 shadow">
          <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
            <div className="flex items-center gap-4">
              <div className="relative z-50 scale-60">
                <input
                  id="burger-toggle"
                  type="checkbox"
                  checked={menuOpen}
                  onChange={toggleMenu}
                  className="burger-checkbox"
                />
                <label htmlFor="burger-toggle" className="burger">
                  <span></span>
                </label>
              </div>

              <Link
                to="/"
                className="text-lg font-semibold text-white hover:text-green-400 transition"
              >
                Metricspace
              </Link>
            </div>

            <nav className="hidden md:flex flex-wrap justify-center gap-5">
              <Link to="/velocity" className="text-gray-300 hover:text-green-400 transition">Velocity</Link>
              <Link to="/cycletime" className="text-gray-300 hover:text-blue-400 transition">Cycle Time</Link>
              <Link to="/deploymentfrequency" className="text-gray-300 hover:text-green-400 transition">Deployment</Link>
              <Link to="/defectleakage" className="text-gray-300 hover:text-amber-400 transition">Defects</Link>
              <Link to="/mttr" className="text-gray-300 hover:text-red-400 transition">MTTR</Link>
              <Link to="/custommetric" className="text-gray-300 hover:text-purple-400 transition">Custom</Link>
            </nav>
          </div>
        </header>

        {/* Контент */}
        <main className="pt-24 pb-8 w-full">
          <div className="px-4 sm:px-6 md:px-16">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
