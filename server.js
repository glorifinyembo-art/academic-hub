import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './server/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Mount API routes
app.use('/api', apiRoutes);

// Admin site at /admin
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.get('/admin*', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Student site static assets and routes
app.use('/student', express.static(path.join(__dirname, 'student')));
app.use(express.static(path.join(__dirname, 'student')));
app.use(express.static(__dirname));

// Default student site SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'student', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Academic Hub server running on port ${PORT}`);
});

