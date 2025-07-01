import express from 'express';
import { getLeetCodeData, getCodeforcesData } from '../services/leetcode.js';

const router = express.Router();

router.get('/leetcode/:username', async (req, res) => {
  try {
    const data = await getLeetCodeData(req.params.username);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/codeforces/:handle', async (req, res) => {
  try {
    const data = await getCodeforcesData(req.params.handle);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
