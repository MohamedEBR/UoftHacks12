import express, { json } from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const { JsonWebTokenError } = jwt;

// @route   POST api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      username,
      email,
      password
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Return JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          throw err;
        }
        User.findById(payload.user.id)
          .select('-password')
          .then(user => {
            res.json({ token, user });
          });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/login
// @desc    Login user / Authenticate user
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // See if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: [ { msg: 'Invalid Credentials' }] });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ errors: [ { msg: 'Invalid Credentials' }] });
    }

    // Return JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          throw err;
        }
        User.findById(payload.user.id)
          .select('-password')
          .then(user => {
            res.json({ token, user });
          });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/me
// @desc    Get current user
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router
