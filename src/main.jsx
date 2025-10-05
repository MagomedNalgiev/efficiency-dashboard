import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { initGA, initYM } from '@utils/analytics'

// Контексты
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext' // ДОБАВИТЬ

// Компоненты
import DataManager from './components/DataManager.jsx'
import PricingPage from './components/PricingPage.jsx' // ДОБАВИТЬ
import Layout from './components/Layout';
import App from './App.jsx';

// Калькуляторы
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
      <SubscriptionProvider> {/* ДОБАВИТЬ */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<App />} />
              <Route path="pricing" element={<PricingPage />} /> {/* ДОБАВИТЬ */}

              {/* Калькуляторы */}
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
          </Routes>
        </BrowserRouter>
      </SubscriptionProvider>
    </AuthProvider>
  </React.StrictMode>,
);
