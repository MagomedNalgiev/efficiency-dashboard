import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import CalculatorVelocity from './components/CalculatorVelocity.jsx';
import CalculatorCycleTime from './components/CalculatorCycleTime.jsx';
import CalculatorMTTR from './components/CalculatorMTTR.jsx';
import CalculatorDeploymentFrequency from './components/CalculatorDeploymentFrequency.jsx';
import CalculatorDefectLeakage from './components/CalculatorDefectLeakage.jsx';
import CalculatorCustomMetric from './components/CalculatorCustomMetric.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/velocity" element={<CalculatorVelocity />} />
        <Route path="/cycletime" element={<CalculatorCycleTime />} />
        <Route path="/mttr" element={<CalculatorMTTR />} />
        <Route path="/deploymentfrequency" element={<CalculatorDeploymentFrequency />} />
        <Route path="/defectleakage" element={<CalculatorDefectLeakage />} />
        <Route path="/custommetric" element={<CalculatorCustomMetric />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
