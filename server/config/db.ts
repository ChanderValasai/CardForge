import mongoose from 'mongoose';

type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'unconfigured' | 'error';

let connectionStatus: ConnectionState = 'disconnected';
let connectionError: string | null = null;
let connectionDiagnostic: string | null = null;
let retryTimer: NodeJS.Timeout | null = null;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    connectionStatus = 'unconfigured';
    connectionDiagnostic = 'MONGODB_URI is not configured in .env yet.';
    console.log(
      '[CardForge DB] MONGODB_URI not set. Running with development database mode.\n' +
      'To connect to your free MongoDB Atlas cluster, set MONGODB_URI in your environment.'
    );
    return;
  }

  // If already connected, do not re-initiate
  if (mongoose.connection.readyState === 1) {
    connectionStatus = 'connected';
    connectionError = null;
    connectionDiagnostic = null;
    return;
  }

  try {
    connectionStatus = 'connecting';
    console.log('[CardForge DB] Attempting connection to MongoDB Atlas...');

    // Clear previous error handlers to avoid duplicate event logs
    mongoose.connection.removeAllListeners('error');
    mongoose.connection.on('error', (err) => {
      connectionStatus = 'error';
      connectionError = err.message;
      console.warn('[CardForge DB] MongoDB event warning:', err.message);
    });

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    connectionStatus = 'connected';
    connectionError = null;
    connectionDiagnostic = null;
    if (retryTimer) {
      clearInterval(retryTimer);
      retryTimer = null;
    }
    console.log('[CardForge DB] MongoDB connected successfully to database.');
  } catch (error: any) {
    connectionStatus = 'error';
    const msg = error.message || 'Database connection error';
    connectionError = msg;

    if (
      msg.includes('whitelist') ||
      msg.includes('tlsv1 alert internal error') ||
      error.code === 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR'
    ) {
      connectionDiagnostic =
        'MongoDB Atlas IP Whitelist required: In MongoDB Atlas, go to "Network Access" -> "Add IP Address" -> select "Allow Access From Anywhere" (0.0.0.0/0).';
      console.warn(
        `[CardForge DB] Notice: MongoDB Atlas rejected connection.\n${connectionDiagnostic}`
      );
    } else {
      connectionDiagnostic = msg;
      console.warn('[CardForge DB] Notice: Could not reach MongoDB:', msg);
    }

    // Auto-retry after 15 seconds if not connected
    if (!retryTimer) {
      retryTimer = setInterval(() => {
        if (mongoose.connection.readyState !== 1) {
          console.log('[CardForge DB] Retrying MongoDB Atlas connection...');
          connectDB();
        } else if (retryTimer) {
          clearInterval(retryTimer);
          retryTimer = null;
        }
      }, 15000);
    }
  }
};

mongoose.connection.on('connected', () => {
  connectionStatus = 'connected';
  connectionError = null;
  connectionDiagnostic = null;
  if (retryTimer) {
    clearInterval(retryTimer);
    retryTimer = null;
  }
  console.log('[CardForge DB] MongoDB status: connected');
});

mongoose.connection.on('disconnected', () => {
  connectionStatus = 'disconnected';
  console.log('[CardForge DB] MongoDB status: disconnected');
});

export const getDBStatus = () => {
  return {
    state: connectionStatus,
    error: connectionError,
    diagnostic: connectionDiagnostic,
    mongooseState: mongoose.STATES[mongoose.connection.readyState],
  };
};
