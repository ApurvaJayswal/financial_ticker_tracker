import { Server } from 'socket.io';

let io = null;

export function initializeWebSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[websocket] Client connected: ${socket.id}`);

    socket.on('subscribe', (data) => {
      const { ticker, type = 'all' } = data;
      if (ticker) {
        socket.join(`ticker:${ticker.toUpperCase()}`);
        console.log(`[websocket] Client subscribed to ticker:${ticker.toUpperCase()} (${type})`);
      }
    });

    socket.on('unsubscribe', (data) => {
      const { ticker } = data;
      if (ticker) {
        socket.leave(`ticker:${ticker.toUpperCase()}`);
        console.log(`[websocket] Client unsubscribed from ticker:${ticker.toUpperCase()}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[websocket] Client disconnected: ${socket.id}`);
    });
  });

  console.log('[websocket] WebSocket server initialized');
  return io;
}

export function broadcastPriceUpdate(ticker, priceData) {
  if (io) {
    io.to(`ticker:${ticker.toUpperCase()}`).emit('priceUpdate', {
      ticker: ticker.toUpperCase(),
      ...priceData,
      timestamp: new Date().toISOString(),
    });
    console.log(`[websocket] Broadcasted price update for ${ticker}`);
  }
}

export function broadcastNewsUpdate(ticker, newsData) {
  if (io) {
    io.to(`ticker:${ticker.toUpperCase()}`).emit('newsUpdate', {
      ticker: ticker.toUpperCase(),
      ...newsData,
      timestamp: new Date().toISOString(),
    });
    console.log(`[websocket] Broadcasted news update for ${ticker}`);
  }
}

export function broadcastToAll(event, data) {
  if (io) {
    io.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
    console.log(`[websocket] Broadcasted ${event} to all clients`);
  }
}
