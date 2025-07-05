// lib/mongo.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'your_connection_string';

if (!MONGODB_URI) throw new Error('Please define MONGODB_URI in .env.local');

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
