const express = require('express');
const router = express.Router();

// Mock user data (in production, use a proper database)
const users = [
  {
    id: 1,
    email: 'demo@tickertracker.com',
    name: 'Demo User',
    created_at: new Date().toISOString(),
    preferences: {
      default_market: 'us_stock',
      notifications_enabled: true,
      theme: 'dark'
    }
  }
];

// POST /api/auth/login - User login (demo)
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }

    // Mock authentication (always succeed for demo)
    const user = users.find(u => u.email === email) || users[0];

    // In production, you'd verify the password hash here
    const token = 'mock-jwt-token-' + Date.now();

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          preferences: user.preferences
        },
        token,
        expires_in: '24h'
      },
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /api/auth/register - User registration (demo)
router.post('/register', (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Email, password, and name are required'
      });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Create new user (in production, hash the password)
    const newUser = {
      id: users.length + 1,
      email,
      name,
      created_at: new Date().toISOString(),
      preferences: {
        default_market: 'us_stock',
        notifications_enabled: true,
        theme: 'dark'
      }
    };

    users.push(newUser);

    const token = 'mock-jwt-token-' + Date.now();

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          preferences: newUser.preferences
        },
        token,
        expires_in: '24h'
      },
      message: 'Registration successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/auth/profile - Get user profile
router.get('/profile', (req, res) => {
  try {
    // In production, you'd extract user ID from JWT token
    const user = users[0]; // Demo user

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        preferences: user.preferences,
        stats: {
          tickers_tracked: 5,
          alerts_created: 3,
          news_read: 127,
          days_active: 30
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', (req, res) => {
  try {
    const { name, preferences } = req.body;
    
    // In production, you'd extract user ID from JWT token
    const userIndex = 0; // Demo user
    
    if (name) {
      users[userIndex].name = name;
    }
    
    if (preferences) {
      users[userIndex].preferences = {
        ...users[userIndex].preferences,
        ...preferences
      };
    }

    res.json({
      success: true,
      data: {
        id: users[userIndex].id,
        email: users[userIndex].email,
        name: users[userIndex].name,
        preferences: users[userIndex].preferences
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', (req, res) => {
  try {
    // In production, you'd invalidate the JWT token
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;