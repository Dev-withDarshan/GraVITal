import express from 'express';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Rate Limiting ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs for auth routes
  message: { error: 'Too many authentication attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── Register ──────────────────────────────────────────────────
router.post('/register', authLimiter, async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const email = req.body.email?.trim();
    const { password } = req.body;

    if (!email || !email.endsWith('@vitstudent.ac.in')) {
      return res.status(400).json({ error: 'A valid VIT email is required.' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'User already exists. Please choose a different username.' });
      }
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Account created successfully.',
      token,
      username: user.username,
      email: user.email || ''
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

// Note: Use /register endpoint for signup — /signup alias removed (router.handle re-dispatch is unreliable)

// ── Login ─────────────────────────────────────────────────────
router.post('/login', authLimiter, async (req, res) => {
  const username = req.body.username?.trim();
  const { password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required.' });

  try {
    const user = await User.findOne({ username });

    if (!user)
      return res.status(404).json({ error: 'User not found. Please sign up.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ error: 'Incorrect password.' });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      username: user.username,
      email: user.email || '',
      gpaData: user.gpaData
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// ── Change Password (Protected) ───────────────────────────────
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect current password.' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change Password Error:', err);
    res.status(500).json({ error: 'Server error during password update.' });
  }
});

export default router;