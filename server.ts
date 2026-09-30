import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, getDBStatus } from './server/config/db.ts';
import authRoutes from './server/routes/auth.ts';
import deckRoutes from './server/routes/decks.ts';
import cardRoutes from './server/routes/cards.ts';
import studyRoutes from './server/routes/study.ts';
import { seedInitialDecks } from './server/config/seedData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// Initialize MongoDB connection and seed system decks
connectDB().then(async () => {
  try {
    const res = await seedInitialDecks();
    console.log(`[CardForge] System seeds verified: ${res.seeded} seeded, ${res.existing} existing.`);
  } catch (err) {
    console.warn('[CardForge] Seed verification notice:', err);
  }
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/study', studyRoutes);

// API Health / Status Check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'CardForge API is running',
    version: '1.0.0',
    database: getDBStatus(),
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/health/retry', async (_req: Request, res: Response) => {
  await connectDB();
  res.json({
    status: 'ok',
    message: 'Triggered database reconnect attempt',
    database: getDBStatus(),
  });
});

// Full-stack Vite integration:
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  // Development mode: Vite middleware
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: false,
      watch: null,
    },
    appType: 'spa',
  });

  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CardForge Server] Listening on http://0.0.0.0:${PORT}`);
});
