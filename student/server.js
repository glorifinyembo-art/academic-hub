import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.STUDENT_PORT || process.env.PORT || 3002;
const API_URL = process.env.DATABASE_API_URL || 'http://localhost:3000/api';

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static files for student portal
app.use(express.static(__dirname));

// Proxy or direct API forwarder if standalone
app.use('/api', async (req, res) => {
  try {
    const targetUrl = `${API_URL}${req.url}`;
    const options = {
      method: req.method,
      headers: { ...req.headers, host: new URL(API_URL).host }
    };
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      options.body = JSON.stringify(req.body);
      options.headers['content-type'] = 'application/json';
    }
    const resp = await fetch(targetUrl, options);
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    res.status(502).json({ success: false, error: 'Database API unavailable: ' + err.message });
  }
});

// Fallback to student index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Academic Hub (Espace Étudiant) running on port ${PORT}`);
});
