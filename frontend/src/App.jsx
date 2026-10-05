import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import DashboardPage from './pages/DashboardPage';
import LiveMonitoringPage from './pages/LiveMonitoringPage';
import ManualAnalysisPage from './pages/ManualAnalysisPage';
import WaterQualityPage from './pages/WaterQualityPage';
import SmartRoutingPage from './pages/SmartRoutingPage';
import StorageTankPage from './pages/StorageTankPage';
import WeatherContextPage from './pages/WeatherContextPage';
import AnomalyDetectionPage from './pages/AnomalyDetectionPage';
import ShapExplainabilityPage from './pages/ShapExplainabilityPage';
import ReportsPage from './pages/ReportsPage';
import SystemHealthPage from './pages/SystemHealthPage';

export function App() {
  return (
    <AuthProvider>
      <SystemProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/monitoring" element={<LiveMonitoringPage />} />
              <Route path="/analysis" element={<ManualAnalysisPage />} />
              <Route path="/water-quality" element={<WaterQualityPage />} />
              <Route path="/routing" element={<SmartRoutingPage />} />
              <Route path="/storage" element={<StorageTankPage />} />
              <Route path="/weather" element={<WeatherContextPage />} />
              <Route path="/anomaly" element={<AnomalyDetectionPage />} />
              <Route path="/explainability" element={<ShapExplainabilityPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/system" element={<SystemHealthPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SystemProvider>
    </AuthProvider>
  );
}

export default App;
