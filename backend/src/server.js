require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Initialize Database connection (with graceful fallback)
connectDB();

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log('='.repeat(65));
  console.log(`Greywater AI Node.js / Express Server listening on port ${PORT}`);
  console.log(`Environment    : ${process.env.NODE_ENV || 'development'}`);
  console.log(`ML Service URL : ${process.env.ML_SERVICE_URL || 'http://localhost:8000'}`);
  console.log(`Health Endpoint: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(65));
});
