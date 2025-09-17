const express = require('express');
const router = express.Router();

// Simple placeholder routes - will be implemented later
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'News endpoints will be implemented'
  });
});

module.exports = router;