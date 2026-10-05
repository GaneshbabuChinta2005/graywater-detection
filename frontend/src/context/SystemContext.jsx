import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDashboardSummary, stepSimulation, startSimulation, stopSimulation, resetSimulation } from '../services/api';

const SystemContext = createContext();

export const SystemProvider = ({ children }) => {
  const [summary, setSummary] = useState(null);
  const [latestTelemetry, setLatestTelemetry] = useState(null);
  const [telemetryTrends, setTelemetryTrends] = useState([]);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [systemHealth, setSystemHealth] = useState({
    frontend: 'CONNECTED',
    nodeApi: 'CONNECTING...',
    pythonMl: 'CONNECTING...',
    modelsLoaded: false,
    weatherStatus: 'CHECKING...'
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simInterval, setSimInterval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshDashboard = useCallback(async () => {
    try {
      const data = await getDashboardSummary();
      if (data.success) {
        setSummary(data.summary);
        setLatestTelemetry(data.latestTelemetry);
        setTelemetryTrends(data.telemetryTrends || []);
        setLatestAnalysis(data.latestAnalysis);
        setSystemHealth(prev => ({
          ...prev,
          nodeApi: 'CONNECTED',
          pythonMl: data.systemHealth?.pythonMl || 'DISCONNECTED',
          modelsLoaded: data.systemHealth?.modelsLoaded || false,
          weatherStatus: data.systemHealth?.weatherStatus || 'LIVE'
        }));
        setError(null);
      }
    } catch (err) {
      setSystemHealth(prev => ({
        ...prev,
        nodeApi: 'DISCONNECTED',
        pythonMl: 'DISCONNECTED',
        modelsLoaded: false
      }));
      setError('Backend API service is currently unreachable.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling every 5 seconds
  useEffect(() => {
    refreshDashboard();
    const timer = setInterval(refreshDashboard, 5000);
    return () => clearInterval(timer);
  }, [refreshDashboard]);

  // Digital Twin Simulation Actions
  const handleStepSimulation = async (config = {}) => {
    try {
      const res = await stepSimulation(config);
      if (res.success) {
        setLatestTelemetry(res.telemetry);
        setLatestAnalysis(res.analysis);
        refreshDashboard();
      }
      return res;
    } catch (e) {
      console.error('Simulation step error:', e);
    }
  };

  const handleStartSimulation = async () => {
    await startSimulation();
    setIsSimulating(true);
    // Auto-step every 3 seconds while active
    const id = setInterval(() => {
      handleStepSimulation();
    }, 3000);
    setSimInterval(id);
  };

  const handleStopSimulation = async () => {
    await stopSimulation();
    setIsSimulating(false);
    if (simInterval) clearInterval(simInterval);
  };

  const handleResetSimulation = async () => {
    if (simInterval) clearInterval(simInterval);
    setIsSimulating(false);
    const res = await resetSimulation();
    refreshDashboard();
    return res;
  };

  return (
    <SystemContext.Provider
      value={{
        summary,
        latestTelemetry,
        telemetryTrends,
        latestAnalysis,
        systemHealth,
        loading,
        error,
        isSimulating,
        refreshDashboard,
        handleStepSimulation,
        handleStartSimulation,
        handleStopSimulation,
        handleResetSimulation
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => useContext(SystemContext);
