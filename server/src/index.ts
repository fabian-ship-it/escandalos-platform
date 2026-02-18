import express from 'express';
import cors from 'cors';
import path from 'path';
import { initDatabase } from './database';
import authRoutes from './routes/authRoutes';
import scandalRoutes from './routes/scandalRoutes';
import peopleRoutes from './routes/peopleRoutes';
import tipRoutes from './routes/tipRoutes';
import evidenceRoutes from './routes/evidenceRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// Init database
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/scandals', scandalRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/tips', tipRoutes);
app.use('/api/evidence', evidenceRoutes);

// Serve static client in production
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
