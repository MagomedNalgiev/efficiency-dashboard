import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Link } from "react-router-dom";
import Header from "./components/Header";

import './App.css'
import './index.css'


export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-start py-8 w-full pl-8 md:pl-16">


      {/* Header */}
      <Header />

      <header className="my-8 w-full text-left">

        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
          Efficiency Metrics
        </h1>

        <p className="text-gray-200 text-lg md:text-xl leading-relaxed">
          Быстрый расчет и визуализация метрик эффективности IT-команд: Velocity, Cycle Time, MTTR, Deployment Frequency и других. Рассчитывайте, стройте графики, выгружайте отчеты и улучшайте производительность вашей команды.
        </p>
      </header>

      {/* Grid with metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 w-full">
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
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow hover:bg-white/20 transition cursor-pointer">
                <h2 className="text-2xl font-semibold mb-2 text-white">{metric.title}</h2>
                <p className="text-gray-400">{metric.description}</p>
              </div>
            </Link>
          ) :
          metric.title === "Cycle Time" ? (
            <Link to="/cycletime" key={index}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow hover:bg-white/20 transition cursor-pointer">
                <h2 className="text-2xl font-semibold mb-2 text-white">{metric.title}</h2>
                <p className="text-gray-400">{metric.description}</p>
              </div>
            </Link>

          ) :
          metric.title === "MTTR" ? (
            <Link to="/mttr" key={index}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow hover:bg-white/20 transition cursor-pointer">
                <h2 className="text-2xl font-semibold mb-2 text-white">{metric.title}</h2>
                <p className="text-gray-400">{metric.description}</p>
              </div>
            </Link>
          ) :

          metric.title === "Deployment Frequency" ? (
            <Link to="/deploymentfrequency" key={index}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow hover:bg-white/20 transition cursor-pointer">
                <h2 className="text-2xl font-semibold mb-2 text-white">{metric.title}</h2>
                <p className="text-gray-400">{metric.description}</p>
              </div>
            </Link>
          ) :

          metric.title === "Defect Leakage" ? (
            <Link to="/defectleakage" key={index}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow hover:bg-white/20 transition cursor-pointer">
                <h2 className="text-2xl font-semibold mb-2 text-white">{metric.title}</h2>
                <p className="text-gray-400">{metric.description}</p>
              </div>
            </Link>
          ) :

          metric.title === "Custom Metric" ? (
            <Link to="/custommetric" key={index}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow hover:bg-white/20 transition cursor-pointer">
                <h2 className="text-2xl font-semibold mb-2 text-white">{metric.title}</h2>
                <p className="text-gray-400">{metric.description}</p>
              </div>
            </Link>
          ) :


              (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow hover:bg-white/20 transition cursor-pointer"
            >
              <h2 className="text-2xl font-semibold mb-2 text-white">{metric.title}</h2>
              <p className="text-gray-400">{metric.description}</p>
            </div>
          )
        ))}

      </div>

      {/* Footer */}
      <footer className="mt-12 text-gray-400 text-sm">
        © 2025 Efficiency Metrics. Все права защищены.
      </footer>
    </div>
  );
}