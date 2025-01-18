import dotenv from 'dotenv';
import mongoose from 'mongoose';
import File from './dbSchema.js';

dotenv.config();

const uri = process.env.URI;

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Successfully connected to MongoDB with Mongoose!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
