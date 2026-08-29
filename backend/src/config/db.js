import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './env.js';

let mongod = null;

/**
 * Safely masks a MongoDB URI to strip passwords and credentials for logging.
 * Returns only host/cluster info and database name.
 */
export const maskMongoUri = (uri) => {
  if (!uri) return 'undefined';
  try {
    // Handle standard mongodb:// or mongodb+srv:// URIs
    const protocol = uri.startsWith('mongodb+srv://') ? 'mongodb+srv://' : 'mongodb://';
    const withoutProto = uri.replace(/^mongodb(\+srv)?:\/\//, '');
    const parts = withoutProto.split('@');
    
    if (parts.length > 1) {
      // Credentials present: mask them completely
      const hostAndRest = parts[1];
      const hostParts = hostAndRest.split('/');
      const host = hostParts[0];
      const dbAndQuery = hostParts.slice(1).join('/');
      const dbName = dbAndQuery.split('?')[0] || 'default';
      return `${protocol}***:***@${host}/${dbName}`;
    } else {
      // No credentials
      const hostParts = parts[0].split('/');
      const host = hostParts[0];
      const dbAndQuery = hostParts.slice(1).join('/');
      const dbName = dbAndQuery.split('?')[0] || 'default';
      return `${protocol}${host}/${dbName}`;
    }
  } catch {
    return 'mongodb://***:***@[configured_cluster]';
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
  const isAtlas = host.includes('mongodb.net') || (config.mongoUri && config.mongoUri.startsWith('mongodb+srv://'));

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
 * Initializes and connects to MongoDB Atlas or local MongoDB
 */
export const connectDB = async () => {
  const uri = config.mongoUri;
  const isSrv = uri.startsWith('mongodb+srv://');
  const maskedUri = maskMongoUri(uri);

  console.log(`[Database] Attempting connection to MongoDB (${maskedUri})...`);

  // Connection listeners
  mongoose.connection.on('connected', () => {
    const status = getDatabaseStatus();
    console.log(
      `[Database] MongoDB connection established successfully! [Host: ${status.host}, Database: ${status.name}, Atlas: ${status.isAtlas ? 'Yes' : 'No'}]`
    );
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[Database] MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB disconnected. Attempting reconnection...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[Database] MongoDB connection re-established.');
  });

  const mongooseOptions = {
    serverSelectionTimeoutMS: isSrv ? 8000 : 3000,
    maxPoolSize: 10,
    socketTimeoutMS: 45000,
  };

  try {
    await mongoose.connect(uri, mongooseOptions);
    return mongoose.connection;
  } catch (err) {
    console.warn(
      `[Database] Primary MongoDB connection failed (${err.message}).`
    );

    // If configured URI was local/default and failed, start in-memory MongoDB for local dev fallback
    if (!isSrv) {
      console.log('[Database] Starting in-memory MongoDB server for local development...');
      try {
        mongod = await MongoMemoryServer.create();
        const fallbackUri = mongod.getUri();
        await mongoose.connect(fallbackUri);
        console.log(`[Database] Connected to fallback In-Memory MongoDB.`);
        return mongoose.connection;
      } catch (memErr) {
        console.error('[Database] In-memory MongoDB initialization failed:', memErr.message);
        throw memErr;
      }
    } else {
      // Atlas URI was explicitly provided but failed: rethrow error with clear diagnostic guidance
      throw new Error(`Failed to connect to MongoDB Atlas (${maskedUri}): ${err.message}`);
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
    }
    console.log('[Database] Disconnected from MongoDB cleanly.');
  } catch (err) {
    console.error('[Database] Error during MongoDB disconnect:', err.message);
  }
};
