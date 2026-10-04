import mongoose from 'mongoose';

export async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/loop_n_love';
    
    // Connect with safe options
    const conn = await mongoose.connect(uri);
    console.log(`🌸 MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error. Please verify MongoDB is running:');
    console.error(error.message);
    // In production or tests, handle accordingly
    return null;
  }
}
