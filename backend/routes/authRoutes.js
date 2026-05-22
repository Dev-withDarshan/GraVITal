import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get("/test", (req, res) => {
  console.log("🔥 TEST ROUTE HIT");
  res.send("Working");
});

// Register Route
const registerHandler = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log(`Register request received for: ${username ? username.toLowerCase() : 'unknown'}`);

    const existingUser = await User.findOne({ 
      username: username.toLowerCase() 
    });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists. Please choose a different username." });
    }

    const user = new User({ 
      username: username.toLowerCase(), 
      password 
    });

    console.log("SAVING USER...");

    await user.save(); // 🔥 THIS MUST RUN

    console.log("USER SAVED:", user);

    res.json({
      success: true,
      message: "Account created successfully.",
      gpaData: user.gpaData
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// Map both /register and /signup to the same handler to not break existing logic
router.post('/register', registerHandler);
router.post('/signup', registerHandler);

// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required.' });

  try {
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found. Please sign up.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect password.' });

    res.json({ success: true, message: 'Logged in successfully.', gpaData: user.gpaData });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

export default router;
