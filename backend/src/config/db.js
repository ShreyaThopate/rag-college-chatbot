import mongoose from 'mongoose';
import { config } from './env.js';

let mongod = null;

/**
 * Safely masks a MongoDB URI to strip passwords and credentials for logging.
 * Returns only host/cluster info and database name.
 */
export const maskMongoUri = (uri) => {
  if (!uri) return 'undefined';
  try {
    const isSrv = uri.startsWith('mongodb+srv://');
    const protocol = isSrv ? 'mongodb+srv://' : 'mongodb://';
    const withoutProto = uri.replace(/^mongodb(\+srv)?:\/\//, '');
    const parts = withoutProto.split('@');

    if (parts.length > 1) {
      const hostAndRest = parts[1];
      const hostParts = hostAndRest.split('/');
      const host = hostParts[0];
      const dbAndQuery = hostParts.slice(1).join('/');
      const dbName = dbAndQuery.split('?')[0] || 'collegegpt';
      return `${protocol}***:***@${host}/${dbName}`;
    } else {
      const hostParts = parts[0].split('/');
      const host = hostParts[0];
      const dbAndQuery = hostParts.slice(1).join('/');
      const dbName = dbAndQuery.split('?')[0] || 'collegegpt';
      return `${protocol}${host}/${dbName}`;
    }
  } catch {
    return uri.startsWith('mongodb+srv://')
      ? 'mongodb+srv://***:***@[cluster]/collegegpt'
      : 'mongodb://***:***@[host]/collegegpt';
  }
};

/**
 * Returns diagnostic database status for health endpoints and monitoring
 */
export const getDatabaseStatus = () => {
  const readyStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const state = readyStates[mongoose.connection.readyState] || 'unknown';
  const isConnected = mongoose.connection.readyState === 1;
  const host = mongoose.connection.host || '';
  const isAtlas =
    host.includes('mongodb.net') ||
    (config.mongoUri && config.mongoUri.startsWith('mongodb+srv://'));

  return {
    status: state,
    connected: isConnected,
    host: host || 'unknown',
    name: mongoose.connection.name || 'collegegpt',
    isAtlas: isAtlas,
    collections: Object.keys(mongoose.connection.collections || {}),
  };
};

/**
 * Initializes and connects to MongoDB Atlas in production or local MongoDB with fallback in development
 */
export const connectDB = async () => {
  const isProd =
    config.isProduction ||
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.RENDER);
  const uri = process.env.MONGODB_URI || (isProd ? '' : config.mongoUri);

  // 1. Production Mode on Render / Cloud
  if (isProd) {
    if (!uri) {
      const errorMsg =
        '[Database] FATAL: MONGODB_URI environment variable is not defined in production. Please configure your MongoDB Atlas connection string in Render environment variables.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    const maskedUri = maskMongoUri(uri);
    console.log(`[Database] Connecting to production MongoDB Atlas (${maskedUri})...`);

    const mongooseOptions = {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
    };

    try {
      await mongoose.connect(uri, mongooseOptions);
      console.log(`[Database] Production MongoDB Atlas connected successfully.`);
      return mongoose.connection;
    } catch (err) {
      console.error(`[Database] Production connection to MongoDB Atlas failed: ${err.message}`);
      throw new Error(
        `Failed to connect to MongoDB Atlas (${maskedUri}): ${err.message}. Please verify Network Access (whitelist 0.0.0.0/0 on Atlas) and database credentials in Render MONGODB_URI.`
      );
    }
  }

  // 2. Development / Testing Mode
  const devUri = uri || 'mongodb://127.0.0.1:27017/collegegpt';
  const maskedUri = maskMongoUri(devUri);
  console.log(`[Database] Attempting connection to MongoDB (${maskedUri})...`);

  try {
    await mongoose.connect(devUri, {
      serverSelectionTimeoutMS: 3000,
      maxPoolSize: 10,
    });
    console.log('[Database] Connected to local MongoDB instance.');
    return mongoose.connection;
  } catch (devErr) {
    console.warn(`[Database] Local MongoDB unavailable (${devErr.message}). Starting development in-memory fallback...`);
    try {
      // Dynamic import ensures mongodb-memory-server is never loaded or executed in production
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const fallbackUri = mongod.getUri();
      await mongoose.connect(fallbackUri);
      console.log('[Database] Connected to development In-Memory MongoDB fallback.');
      return mongoose.connection;
    } catch (memErr) {
      console.error('[Database] Development In-Memory MongoDB fallback failed:', memErr.message);
      throw memErr;
    }
  }
};

/**
 * Gracefully disconnects from MongoDB
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
      mongod = null;
    }
    console.log('[Database] Disconnected from MongoDB cleanly.');
  } catch (err) {
    console.error('[Database] Error during MongoDB disconnect:', err.message);
  }
};
