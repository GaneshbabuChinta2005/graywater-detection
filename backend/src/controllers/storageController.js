const mlClient = require('../services/mlClient');

exports.getLatestStorage = async (req, res) => {
  try {
    const storageRes = await mlClient.getStorageCurrent();
    return res.json({
      success: true,
      storage: storageRes.data
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
