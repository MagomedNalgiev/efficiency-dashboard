import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import Layout from './Layout.jsx';
import App from './App.jsx';
import CalculatorVelocity from './CalculatorVelocity.jsx';
import CalculatorCycleTime from './CalculatorCycleTime.jsx';
import CalculatorMTTR from './CalculatorMTTR.jsx';
import CalculatorDeploymentFrequency from './CalculatorDeploymentFrequency.jsx';
import CalculatorDefectLeakage from './CalculatorDefectLeakage.jsx';
import CalculatorCustomMetric from './CalculatorCustomMetric.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Layout — общая обёртка с сайдбаром и шапкой */}
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="velocity" element={<CalculatorVelocity />} />
          <Route path="cycletime" element={<CalculatorCycleTime />} />
          <Route path="mttr" element={<CalculatorMTTR />} />
          <Route path="deploymentfrequency" element={<CalculatorDeploymentFrequency />} />
          <Route path="defectleakage" element={<CalculatorDefectLeakage />} />
          <Route path="custommetric" element={<CalculatorCustomMetric />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
