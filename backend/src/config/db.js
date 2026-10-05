const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/greywater_db';
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    isConnected = false;
    mongoose.set('bufferCommands', false);
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${uri}.`);
    console.warn('[MongoDB Notice] Operating with in-memory persistence fallback. Dashboard and APIs remain fully functional!');
  }
};

const isDBConnected = () => {
  return isConnected && mongoose.connection.readyState === 1;
};

const getDBStatus = () => {
  return {
    connected: isDBConnected(),
    readyState: mongoose.connection.readyState,
    host: isDBConnected() ? mongoose.connection.host : 'local-memory-fallback',
    database: isDBConnected() ? mongoose.connection.name : 'in-memory'
  };
};

module.exports = { connectDB, getDBStatus, isDBConnected };

