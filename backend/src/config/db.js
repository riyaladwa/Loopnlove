import mongoose from 'mongoose';

export async function connectDB() {
  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) {
    console.error('❌ MONGODB_URI environment variable is missing.');
    return null;
  }

  // Attempt 1: Configured URI (Atlas or custom)
  try {
    const conn = await mongoose.connect(rawUri, {
      dbName: 'loop_n_love',
      serverSelectionTimeoutMS: 5000,
      family: 4
    });

    const isAtlas = conn.connection.host.includes('mongodb.net');
    const safeHost = isAtlas ? 'MongoDB Atlas (' + conn.connection.host.split('.')[0] + '...)' : conn.connection.host;
    console.log(`🌸 MongoDB Connected successfully: ${safeHost} / Database: ${conn.connection.name}`);
    setupListeners();
    return conn;
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB connection failed: ${error.message}`);

    // If primary was Atlas and failed (e.g. dynamic IP not yet in Atlas Network Access), attempt local fallback
    if (rawUri.includes('mongodb.net')) {
      console.log('🔄 Attempting local MongoDB connection (127.0.0.1:27017/loop_n_love)...');
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/loop_n_love', {
          serverSelectionTimeoutMS: 3000
        });
        console.log(`🌸 Connected to Local MongoDB fallback database: ${localConn.connection.name}`);
        console.log('📌 NOTE: To connect directly to MongoDB Atlas, add 0.0.0.0/0 (or current IP) in Atlas > Network Access.');
        setupListeners();
        return localConn;
      } catch (localErr) {
        console.error(`❌ Local MongoDB fallback also failed: ${localErr.message}`);
      }
    }

    return null;
  }
}

function setupListeners() {
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB runtime error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected.');
  });
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
