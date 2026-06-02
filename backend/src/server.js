import './config/loadEnv.js';
import express from 'express';
import { UPLOAD_DIR } from './utils/imageStorage.js';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { validateEnv } from './config/validateEnv.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';
import errorMiddleware from './middleware/errorMiddleware.js';

validateEnv();

const app = express();

app.use(
  helmet({
    // Allow images from this API (e.g. /uploads) to display on the Vite app (different port)
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Social Post SaaS API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✅ API ready  http://localhost:${PORT}`);
    console.log(`   Health     http://localhost:${PORT}/api/health`);
    console.log(`   Uploads    http://localhost:${PORT}/uploads/ (local images)`);
    if (process.env.NODE_ENV !== 'production') {
      console.log('   (Request logs below are normal while you use the app)\n');
    }
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
