import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post("/save-gpa", async (req, res) => {
  console.log("🔥 SAVE GPA HIT:", req.body);
  try {
    const { username, gpaData } = req.body;

    const result = await User.updateOne(
      { username: username},
      { $set: { gpaData } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Save GPA Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Load GPA Data Route
const loadGpaHandler = async (req, res) => {
  try {
    const user = await User.findOne(
      { username: req.params.username},
      { gpaData: 1 }
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({ success: true, gpaData: user.gpaData, data: user.gpaData });
  } catch (err) {
    console.error('Load GPA Error:', err);
    res.status(500).json({ error: 'Failed to load data.' });
  }
};

// Aliases for compatibility
router.get('/:username', loadGpaHandler);
router.get('/load/:username', loadGpaHandler);

export default router;
