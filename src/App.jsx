import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Link } from "react-router-dom";
import Header from "./components/Header";

import './App.css'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      {/* Header */}
      <Header />

      <header className="text-center my-8">
        <h1 className="text-4xl md:text-5xl font-bold text-green-400 mb-4">
          🚀 Efficiency Metrics
        </h1>
        <p className="max-w-xl text-gray-300 text-lg">
          Быстрый расчет и визуализация метрик эффективности IT-команд: Velocity, Cycle Time, MTTR, Deployment Frequency и других. Рассчитывайте, стройте графики, выгружайте отчеты и улучшайте производительность вашей команды.
        </p>
      </header>

      {/* Grid with metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 max-w-4xl w-full">
        {[
          { title: "Velocity", description: "Расчет средней скорости команды" },
          { title: "Cycle Time", description: "Время выполнения задачи" },
          { title: "MTTR", description: "Среднее время восстановления" },
          { title: "Deployment Frequency", description: "Частота деплоев" },
          { title: "Defect Leakage", description: "Анализ багов и качества" },
          { title: "Custom Metric", description: "Добавить свою метрику" },
        ].map((metric, index) => (
          metric.title === "Velocity" ? (
            <Link to="/velocity" key={index}>
              <div className="bg-gray-800 rounded-lg p-6 shadow hover:bg-gray-700 transition cursor-pointer">
                <h2 className="text-2xl font-semibold mb-2 text-green-300">{metric.title}</h2>
                <p className="text-gray-400">{metric.description}</p>
              </div>
            </Link>
          ) :
          metric.title === "Cycle Time" ? (
            <Link to="/cycletime" key={index}>
              <div className="bg-gray-800 rounded-lg p-6 shadow hover:bg-gray-700 transition cursor-pointer">
                <h2 className="text-2xl font-semibold mb-2 text-blue-300">{metric.title}</h2>
                <p className="text-gray-400">{metric.description}</p>
              </div>
            </Link>

          ) :
          metric.title === "MTTR" ? (
            <Link to="/mttr" key={index}>
              <div className="bg-gray-800 rounded-lg p-6 shadow hover:bg-gray-700 transition cursor-pointer">
                <h2 className="text-2xl font-semibold mb-2 text-red-300">{metric.title}</h2>
                <p className="text-gray-400">{metric.description}</p>
              </div>
            </Link>
          ) :

          metric.title === "Deployment Frequency" ? (
            <Link to="/deploymentfrequency" key={index}>
              <div className="bg-gray-800 rounded-lg p-6 shadow hover:bg-gray-700 transition cursor-pointer">
                <h2 className="text-2xl font-semibold mb-2 text-green-300">{metric.title}</h2>
                <p className="text-gray-400">{metric.description}</p>
              </div>
            </Link>
          ) :

          metric.title === "Defect Leakage" ? (
            <Link to="/defectleakage" key={index}>
              <div className="bg-gray-800 rounded-lg p-6 shadow hover:bg-gray-700 transition cursor-pointer">
                <h2 className="text-2xl font-semibold mb-2 text-amber-300">{metric.title}</h2>
                <p className="text-gray-400">{metric.description}</p>
              </div>
            </Link>
          ) :

          metric.title === "Custom Metric" ? (
            <Link to="/custommetric" key={index}>
              <div className="bg-gray-800 rounded-lg p-6 shadow hover:bg-gray-700 transition cursor-pointer">
                <h2 className="text-2xl font-semibold mb-2 text-purple-300">{metric.title}</h2>
                <p className="text-gray-400">{metric.description}</p>
              </div>
            </Link>
          ) :


              (
            <div
              key={index}
              className="bg-gray-800 rounded-lg p-6 shadow hover:bg-gray-700 transition cursor-pointer"
            >
              <h2 className="text-2xl font-semibold mb-2 text-green-300">{metric.title}</h2>
              <p className="text-gray-400">{metric.description}</p>
            </div>
          )
        ))}

      </div>

      {/* Footer */}
      <footer className="mt-12 text-gray-500 text-sm">
        © 2025 Efficiency Metrics. Все права защищены.
      </footer>
    </div>
  );
}


