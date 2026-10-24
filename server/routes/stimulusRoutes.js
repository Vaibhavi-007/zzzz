const express = require('express');
const router = express.Router();
const { STIMULI_DATA } = require('../controllers/stimuliData');

// Get all stimuli or filter by category / type
router.get('/', (req, res) => {
  const { category, type } = req.query;
  let results = [...STIMULI_DATA];

  if (category) {
    results = results.filter(s => s.category === category.toLowerCase());
  }
  if (type) {
    results = results.filter(s => s.type === type.toLowerCase());
  }

  res.json({ success: true, count: results.length, stimuli: results });
});

// Get random stimulus for condition
router.get('/random/:category', (req, res) => {
  const { category } = req.params;
  const { type } = req.query;

  let pool = STIMULI_DATA.filter(s => s.category === category.toLowerCase());
  if (type) {
    const typePool = pool.filter(s => s.type === type.toLowerCase());
    if (typePool.length > 0) pool = typePool;
  }

  if (pool.length === 0) {
    return res.status(404).json({ error: `No stimuli found for category: ${category}` });
  }

  const selected = pool[Math.floor(Math.random() * pool.length)];
  res.json({ success: true, stimulus: selected });
});

module.exports = router;
