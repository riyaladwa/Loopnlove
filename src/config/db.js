import mongoose from 'mongoose';

/**
 * Global cache for Mongoose connection across serverless invocations.
 * In serverless environments like Vercel, the Node.js execution environment
 * may be reused across multiple requests. Caching the connection avoids
 * creating new connections on every request and avoids cold-start hanging.
 */
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) {
    console.error('❌ MONGODB_URI environment variable is missing.');
    throw new Error('MONGODB_URI environment variable is not defined.');
  }

  // If already connected and ready, return existing connection immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: 'loop_n_love',
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 1,
      socketTimeoutMS: 30000,
      family: 4
    };

    cached.promise = mongoose.connect(rawUri, opts).then((conn) => {
      const isAtlas = conn.connection.host.includes('mongodb.net');
      const safeHost = isAtlas ? 'MongoDB Atlas (' + conn.connection.host.split('.')[0] + '...)' : conn.connection.host;
      console.log(`🌸 MongoDB Connected successfully: ${safeHost} / Database: ${conn.connection.name}`);
      setupListeners();
      return conn;
    }).catch(async (error) => {
      cached.promise = null;
      console.warn(`⚠️ Primary MongoDB connection failed: ${error.message}`);

      // Only attempt local fallback if running locally (not on Vercel / production)
      const isVercelOrProd = process.env.VERCEL || process.env.NODE_ENV === 'production';
      if (!isVercelOrProd && rawUri.includes('mongodb.net')) {
        console.log('🔄 Attempting local MongoDB connection (127.0.0.1:27017/loop_n_love)...');
        try {
          const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/loop_n_love', {
            serverSelectionTimeoutMS: 2000
          });
          console.log(`🌸 Connected to Local MongoDB fallback database: ${localConn.connection.name}`);
          setupListeners();
          return localConn;
        } catch (localErr) {
          console.error(`❌ Local MongoDB fallback also failed: ${localErr.message}`);
        }
      }
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}

let listenersAttached = false;
function setupListeners() {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB runtime error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected.');
    if (cached) {
      cached.conn = null;
      cached.promise = null;
    }
  });
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
