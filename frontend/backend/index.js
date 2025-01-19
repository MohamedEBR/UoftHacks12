import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from './models/User.js';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

// Function to generate JWT token
const generateJwtToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

const client = new OAuth2Client({ clientId: process.env.GOOGLE_CLIENT_ID });

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'some_secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

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

app.post('/api/users/google-login', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      clientId: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    // Find user by email
    let user = await User.findOne({ email });

    if (user) {
      // If user exists, update their googleId and picture
      user.googleId = sub;
      user.picture = picture;
      await user.save();
    } else {
      // If user doesn't exist, create a new user
      user = new User({
        googleId: sub,
        email,
        username: name, // Set username from Google profile name
        picture,
      });
      await user.save();
    }

    // Generate JWT token
    const jwtToken = generateJwtToken(user);

    res.json({ token: jwtToken, user });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
