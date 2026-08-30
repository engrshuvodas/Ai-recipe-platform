const mongoose = require('mongoose');

let isConnecting = false;

const connectDB = async () => {
  if (isConnecting || mongoose.connection.readyState === 1) return;
  isConnecting = true;
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe_companion';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4, bypasses Node.js IPv6 DNS resolution issues
    });
    console.log(`====================================================`);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    console.log(`====================================================`);
    isConnecting = false;
  } catch (error) {
    console.error(`❌ [Database Error] MongoDB connection failed: ${error.message}`);
    console.warn(`⚠️  [Warning] Server running without DB. Data features will be unavailable.`);
    isConnecting = false;
    // Retry after 10 seconds
    setTimeout(connectDB, 10000);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB disconnected. Attempting reconnect...');
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] MongoDB error:', err.message);
});

module.exports = connectDB;
