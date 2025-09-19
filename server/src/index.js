import aiRouter from './routes/ai.routes.js';
import newsRouter from './routes/news.routes.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import priceRouter from './routes/price.routes.js';
import { connectDatabase, onDatabaseEvents } from './config/db.js';
import { startScheduler } from './services/scheduler.service.js';
import { initializeWebSocket } from './services/websocket.service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/ai', aiRouter);
app.use('/api/news', newsRouter);
app.use('/api/price', priceRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack || err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    path: req.path
  });
});

// Start server after DB connection
(async () => {
  try {
    const conn = await connectDatabase();
    onDatabaseEvents(conn);
    
    // Create HTTP server
    const server = createServer(app);
    
    // Initialize WebSocket
    initializeWebSocket(server);
    
    // Start scheduler
    startScheduler();

    server.listen(PORT, () => {
      console.log(`✅ Server listening on port ${PORT}`);
      console.log(`✅ WebSocket server ready`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();




