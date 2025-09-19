import mongoose from 'mongoose';

export async function connectDatabase(
  uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tickertracker'
) {
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  return mongoose.connection;
}

export function onDatabaseEvents(conn = mongoose.connection) {
  conn.on('connected', () => console.log('[mongo] connected'));
  conn.on('error', (err) => console.error('[mongo] error', err));
  conn.on('disconnected', () => console.warn('[mongo] disconnected'));

  process.on('SIGINT', async () => {
    await conn.close();
    console.log('[mongo] connection closed due to app termination');
    process.exit(0);
  });
}
