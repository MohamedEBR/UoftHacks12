import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const DB_URI = process.env.URI;
if (!DB_URI) {
  console.error("MONGODB_URI is not defined in the environment variables.");
  process.exit(1);
}

mongoose.connect(DB_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Define Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
