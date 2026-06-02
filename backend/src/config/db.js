import mongoose from 'mongoose';
import User from '../models/User.js';
import Post from '../models/Post.js';

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${conn.connection.host}`);

  // Ensure Mongo indexes exist (especially unique username/email).
  // If duplicates already exist in the collection, index creation will fail and must be resolved in DB.
  try {
    await Promise.all([User.syncIndexes(), Post.syncIndexes()]);
  } catch (err) {
    const msg = err?.message || String(err);
    console.warn('Index sync warning:', msg);
  }
};

export default connectDB;
