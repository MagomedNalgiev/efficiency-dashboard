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
      <div
        className={`fixed top-0 left-0 h-full w-56 md:w-64 bg-black z-40 shadow-lg pt-20 transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 text-white h-full overflow-y-auto">
          <h3 className="text-lg font-bold mb-4">DELIVERY</h3>
          <Link to="/velocity" className="block py-1 px-4 hover:bg-gray-700 rounded mb-1">
            Velocity
          </Link>
          <Link to="/cycletime" className="block py-1 px-4 hover:bg-gray-700 rounded mb-1">
            Cycle Time
          </Link>
          <Link to="/deploymentfrequency" className="block py-1 px-4 hover:bg-gray-700 rounded mb-1">
            Deployment Frequency
          </Link>

          <h3 className="text-lg font-bold mb-4 mt-6">QUALITY</h3>
          <Link to="/defectleakage" className="block py-1 px-4 hover:bg-gray-700 rounded mb-1">
            Defect Leakage
          </Link>
          <Link to="/mttr" className="block py-1 px-4 hover:bg-gray-700 rounded mb-1">
            MTTR
          </Link>

          <h3 className="text-lg font-bold mb-4 mt-6">МАРКЕТИНГ</h3>
          <Link to="/cac" className="block py-1 px-4 hover:bg-gray-700 rounded mb-1">
            CAC
          </Link>
          <Link to="/romi" className="block py-1 px-4 hover:bg-gray-700 rounded mb-1">
            ROMI
          </Link>
          <Link to="/ltv" className="block py-1 px-4 hover:bg-gray-700 rounded mb-1">
            LTV
          </Link>

          <h3 className="text-lg font-bold mb-4 mt-6">ФИНАНСЫ</h3>
          <Link to="/ebitda" className="block py-1 px-4 hover:bg-gray-700 rounded mb-1">
            EBITDA
          </Link>
          <Link to="/ros" className="block py-1 px-4 hover:bg-gray-700 rounded mb-1">
            ROS
          </Link>
          <Link to="/bep" className="block py-1 px-4 hover:bg-gray-700 rounded mb-1">
            BEP
          </Link>

          <h3 className="text-lg font-bold mb-4 mt-6">ПРОЧЕЕ</h3>
          <Link to="/custommetric" className="block py-1 px-4 hover:bg-gray-700 rounded mb-1">
            Custom Metric
          </Link>

          <h3 className="text-lg font-bold mb-4 mt-6">УПРАВЛЕНИЕ</h3>
          <Link to="/data-manager" className="block py-1 px-4 hover:bg-gray-700 rounded mb-1">
            Управление данными
          </Link>
        </div>

      </div>

      {/* ФИКСИРОВАННЫЙ Header - НЕ СДВИГАЕТСЯ */}
      <Header toggleMenu={toggleMenu} menuOpen={menuOpen} />

      {/* Контент с отступом от сайдбара - ТОЛЬКО ОН СДВИГАЕТСЯ */}
      <main className={`pt-20 transition-all duration-300 ${
        menuOpen ? 'md:pl-64' : 'pl-0'
      }`}>
        <Outlet />
      </main>

      {/* Overlay для закрытия меню на мобильных */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
