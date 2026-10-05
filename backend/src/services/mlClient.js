const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

class MLClient {
  async getHealth() {
    try {
      const res = await client.get('/api/health');
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: 'ML_SERVICE_UNAVAILABLE',
        message: 'Python FastAPI ML Service is not responding at ' + ML_SERVICE_URL
      };
    }
  }

  async analyzeSample(sampleData) {
    try {
      const res = await client.post('/api/inference/analyze', sampleData);
      return { success: true, data: res.data };
    } catch (err) {
      console.error('[MLClient Error]', err.response ? err.response.data : err.message);
      return {
        success: false,
        error: 'ML_SERVICE_UNAVAILABLE',
        message: err.response?.data?.detail || 'Inference service is currently unavailable.'
      };
    }
  }

  async analyzeBatch(samples) {
    try {
      const res = await client.post('/api/inference/batch', { samples });
      return { success: true, data: res.data };
    } catch (err) {
      console.error('[MLClient Batch Error]', err.response ? err.response.data : err.message);
      return {
        success: false,
        error: 'ML_SERVICE_UNAVAILABLE',
        message: err.response?.data?.detail || 'Batch inference service is currently unavailable.'
      };
    }
  }

  async simulationStep(stepConfig = {}) {
    try {
      const res = await client.post('/api/simulation/step', stepConfig);
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: 'ML_SERVICE_UNAVAILABLE',
        message: err.response?.data?.detail || 'Simulation step could not be executed.'
      };
    }
  }

  async simulationStart() {
    try {
      const res = await client.post('/api/simulation/start');
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: 'ML_SERVICE_UNAVAILABLE' };
    }
  }

  async simulationStop() {
    try {
      const res = await client.post('/api/simulation/stop');
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: 'ML_SERVICE_UNAVAILABLE' };
    }
  }

  async simulationReset() {
    try {
      const res = await client.post('/api/simulation/reset');
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: 'ML_SERVICE_UNAVAILABLE' };
    }
  }

  async getSimulationCurrent() {
    try {
      const res = await client.get('/api/simulation/current');
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: 'ML_SERVICE_UNAVAILABLE' };
    }
  }

  async getWeatherCurrent() {
    try {
      const res = await client.get('/api/weather/current');
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: 'WEATHER_UNAVAILABLE',
        data: {
          temperature_C: 25.0,
          humidity_percent: 50.0,
          rainfall_mm: 0.0,
          precipitation_probability: 0.0,
          weather_condition: 'Offline Fallback',
          weather_status: 'UNAVAILABLE',
          irrigation_action: 'ALLOW_ROUTE'
        }
      };
    }
  }

  async getStorageCurrent() {
    try {
      const res = await client.get('/api/storage/current');
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: 'STORAGE_UNAVAILABLE',
        data: {
          tank_id: 'TANK_PRIMARY_01',
          capacity_liters: 1000.0,
          current_level_liters: 250.0,
          fill_percentage: 25.0,
          temperature_C: 24.5,
          storage_age_hours: 0.0,
          current_water_usable: true
        }
      };
    }
  }

  async getExplanation(analysisId) {
    try {
      const res = await client.get(`/api/explanation/${analysisId}`);
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: 'EXPLANATION_NOT_FOUND',
        message: 'SHAP attributions not found or expired from session cache.'
      };
    }
  }
}

module.exports = new MLClient();
