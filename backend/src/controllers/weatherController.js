const mlClient = require('../services/mlClient');

exports.getLatestWeather = async (req, res) => {
  try {
    const weatherRes = await mlClient.getWeatherCurrent();
    return res.json({
      success: true,
      weather: weatherRes.data
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
