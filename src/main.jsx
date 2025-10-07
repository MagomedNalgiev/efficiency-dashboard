import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { initGA, initYM } from '@utils/analytics'

// Контексты
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'

// Компоненты
import LandingPage from './components/LandingPage.jsx' // ДОБАВИТЬ
import DataManager from './components/DataManager.jsx'
import PricingPage from './components/PricingPage.jsx'
import Layout from './components/Layout';
import App from './App.jsx';
import BlogPage from './components/BlogPage.jsx'
import PaymentSuccessPage from './components/payment/PaymentSuccessPage'


// Калькуляторы (все как раньше)
import CalculatorVelocity from './components/CalculatorVelocity.jsx';
import CalculatorCycleTime from './components/CalculatorCycleTime.jsx';
import CalculatorMTTR from './components/CalculatorMTTR.jsx';
import CalculatorDeploymentFrequency from './components/CalculatorDeploymentFrequency.jsx';
import CalculatorDefectLeakage from './components/CalculatorDefectLeakage.jsx';
import CalculatorCustomMetric from './components/CalculatorCustomMetric.jsx';
import CalculatorCAC from "./components/CalculatorCAC";
import CalculatorROMI from "./components/CalculatorROMI";
import CalculatorLTV from "./components/CalculatorLTV";
import CalculatorEBITDA from "./components/CalculatorEBITDA";
import CalculatorROS from "./components/CalculatorROS";
import CalculatorBEP from "./components/CalculatorBEP";

initGA()
initYM()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SubscriptionProvider>
        <BrowserRouter>
          <Routes>
            {/* НОВЫЙ РОУТ: Лендинг как главная страница */}
            <Route path="/" element={<LandingPage />} />

            {/* Приложение под /app */}
            <Route path="/app" element={<Layout />}>
              <Route index element={<App />} />
              <Route path="velocity" element={<CalculatorVelocity />} />
              <Route path="cycletime" element={<CalculatorCycleTime />} />
              <Route path="mttr" element={<CalculatorMTTR />} />
              <Route path="deploymentfrequency" element={<CalculatorDeploymentFrequency />} />
              <Route path="defectleakage" element={<CalculatorDefectLeakage />} />
              <Route path="cac" element={<CalculatorCAC />} />
              <Route path="romi" element={<CalculatorROMI />} />
              <Route path="ltv" element={<CalculatorLTV />} />
              <Route path="ebitda" element={<CalculatorEBITDA />} />
              <Route path="ros" element={<CalculatorROS />} />
              <Route path="bep" element={<CalculatorBEP />} />
              <Route path="custommetric" element={<CalculatorCustomMetric />} />
              <Route path="data-manager" element={<DataManager />} />
            </Route>

            {/* Отдельные страницы */}
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
          </Routes>
        </BrowserRouter>
      </SubscriptionProvider>
    </AuthProvider>
  </React.StrictMode>,
);
