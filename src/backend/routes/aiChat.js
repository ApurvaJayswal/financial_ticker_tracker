const express = require('express');
const router = express.Router();
const {
  askQuestion,
  getConversationHistory,
  clearConversationHistory,
  getQuickInfo,
  getPopularQuestions,
  testAssistant,
  getAssistantStatus
} = require('../controllers/aiChatController');

// @desc    AI Financial Assistant Chat Routes
// @access  All routes are public for now

// Main chat endpoint
router.post('/ask', askQuestion);

// Quick info endpoint
router.get('/quick-info', getQuickInfo);

// Popular questions
router.get('/popular-questions', getPopularQuestions);

// Conversation management
router.get('/history/:userId', getConversationHistory);
router.delete('/history/:userId', clearConversationHistory);

// Testing and status
router.post('/test', testAssistant);
router.get('/status', getAssistantStatus);

module.exports = router;