import '../index.css';
import { Link } from "react-router-dom";

export default function Sidebar({ isOpen, onClose }) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-gray-900 z-50 shadow-lg transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-4 text-white pt-16">
        <div className="mb-4">
          <h3 className="text-sm text-gray-400 uppercase">Delivery</h3>
          <Link to="/velocity" className="block py-1 hover:text-green-400" onClick={onClose}>Velocity</Link>
          <Link to="/deploymentfrequency" className="block py-1 hover:text-green-400" onClick={onClose}>Deployment Frequency</Link>
          <Link to="/cycletime" className="block py-1 hover:text-blue-400" onClick={onClose}>Cycle Time</Link>
        </div>

        <div className="mb-4">
          <h3 className="text-sm text-gray-400 uppercase">Stability</h3>
          <Link to="/mttr" className="block py-1 hover:text-red-400" onClick={onClose}>MTTR</Link>
        </div>

        <div className="mb-4">
          <h3 className="text-sm text-gray-400 uppercase">Quality</h3>
          <Link to="/defectleakage" className="block py-1 hover:text-amber-400" onClick={onClose}>Defect Leakage</Link>
        </div>

        <div>
          <h3 className="text-sm text-gray-400 uppercase">Custom</h3>
          <Link to="/custommetric" className="block py-1 hover:text-purple-400" onClick={onClose}>Custom Metric</Link>
        </div>
      </div>
    </div>
  );
}
