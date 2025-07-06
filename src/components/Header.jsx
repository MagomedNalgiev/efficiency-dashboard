import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900/80 backdrop-blur-md z-50 shadow">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between">
        <Link
          to="/"
          className="text-lg font-semibold text-white hover:text-green-400 transition mb-2 md:mb-0"
        >
          🚀 Efficiency Metrics
        </Link>

        <nav className="flex flex-wrap justify-center gap-3 md:gap-5">
          <Link to="/velocity" className="text-gray-300 hover:text-green-400 transition">Velocity</Link>
          <Link to="/cycletime" className="text-gray-300 hover:text-blue-400 transition">Cycle Time</Link>
          <Link to="/mttr" className="text-gray-300 hover:text-red-400 transition">MTTR</Link>
          <Link to="/deploymentfrequency" className="text-gray-300 hover:text-green-400 transition">Deploy</Link>
          <Link to="/defectleakage" className="text-gray-300 hover:text-amber-400 transition">Defects</Link>
          <Link to="/custommetric" className="text-gray-300 hover:text-purple-400 transition">Custom</Link>
        </nav>
      </div>
    </header>
  );
}
