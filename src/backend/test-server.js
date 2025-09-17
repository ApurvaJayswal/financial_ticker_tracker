console.log('Starting test server...');

try {
  const express = require('express');
  console.log('Express loaded successfully');
  
  const app = express();
  const PORT = 5001;
  
  app.get('/', (req, res) => {
    res.json({ message: 'Test server is working!' });
  });
  
  app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
  });
  
} catch (error) {
  console.error('Error starting test server:', error);
}