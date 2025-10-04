import '../index.css';
import { Link } from "react-router-dom";

export default function Sidebar({ isOpen, onClose }) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-gray-900 z-50 shadow-lg transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-6 text-white">
        <h3 className="text-lg font-bold mb-4">Delivery</h3>
        <Link to="/velocity" className="block py-2 px-4 hover:bg-gray-700 rounded">
          Velocity
        </Link>
        <Link to="/deploymentfrequency" className="block py-2 px-4 hover:bg-gray-700 rounded">
          Deployment Frequency
        </Link>
        <Link to="/cycletime" className="block py-2 px-4 hover:bg-gray-700 rounded">
          Cycle Time
        </Link>

        <h3 className="text-lg font-bold mb-4 mt-6">Stability</h3>
        <Link to="/mttr" className="block py-2 px-4 hover:bg-gray-700 rounded">
          MTTR
        </Link>

        <h3 className="text-lg font-bold mb-4 mt-6">Quality</h3>
        <Link to="/defectleakage" className="block py-2 px-4 hover:bg-gray-700 rounded">
          Defect Leakage
        </Link>

        <h3 className="text-lg font-bold mb-4 mt-6">Marketing</h3>
        <Link to="/cac" className="block py-2 px-4 hover:bg-gray-700 rounded">
          CAC
        </Link>
        <Link to="/romi" className="block py-2 px-4 hover:bg-gray-700 rounded">
          ROMI
        </Link>
        <Link to="/ltv" className="block py-2 px-4 hover:bg-gray-700 rounded">
          LTV
        </Link>

        <h3 className="text-lg font-bold mb-4 mt-6">Finance</h3>
        <Link to="/ebitda" className="block py-2 px-4 hover:bg-gray-700 rounded">
          EBITDA
        </Link>
        <Link to="/ros" className="block py-2 px-4 hover:bg-gray-700 rounded">
          ROS
        </Link>
        <Link to="/bep" className="block py-2 px-4 hover:bg-gray-700 rounded">
          BEP
        </Link>

        <h3 className="text-lg font-bold mb-4 mt-6">Custom</h3>
        <Link to="/custommetric" className="block py-2 px-4 hover:bg-gray-700 rounded">
          Custom Metric
        </Link>

        {/* ДОБАВЬТЕ ЭТУ СЕКЦИЮ: */}
        <h3 className="text-lg font-bold mb-4 mt-6">Управление</h3>
        <Link to="/data-manager" className="block py-2 px-4 hover:bg-gray-700 rounded">
          Управление данными
        </Link>
      </div>
    </div>
  );
}
