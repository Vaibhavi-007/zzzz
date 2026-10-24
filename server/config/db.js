const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/emotion_negotiation';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] MongoDB connection failed (${err.message}). Using local hybrid persistence.`);
    isConnected = false;
    return null;
  }
};

const getStatus = () => isConnected;

module.exports = { connectDB, getStatus };
