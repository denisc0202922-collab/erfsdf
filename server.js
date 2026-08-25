import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate or retrieve database
export function getOrGenerateDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    const initialDb = {
      system: 'ЕИС Следственный Комитет РФ',
      version: '3.5.0',
      lastUpdated: new Date().toISOString(),
      officer: null,
      accounts: null,
      departments: null,
      cases: [],
      offenders: [],
      reports: [],
      documents: [],
      orders: null,
      examSubmissions: [],
      articles: null,
      binds: null
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database.json:', err);
    return {};
  }
}

// Save database to disk
export function saveDatabase(db) {
  db.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// API Endpoints
app.get('/api/db', (req, res) => {
  const db = getOrGenerateDatabase();
  res.json({ success: true, data: db, lastUpdated: db.lastUpdated });
});

app.post('/api/db/sync', (req, res) => {
  try {
    const payload = req.body;
    const currentDb = getOrGenerateDatabase();
    const updatedDb = {
      ...currentDb,
      ...payload,
      lastUpdated: new Date().toISOString()
    };
    saveDatabase(updatedDb);
    res.json({ success: true, lastUpdated: updatedDb.lastUpdated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/db/reset', (req, res) => {
  try {
    const freshDb = {
      system: 'ЕИС Следственный Комитет РФ',
      version: '3.5.0',
      lastUpdated: new Date().toISOString(),
      officer: null,
      accounts: null,
      departments: null,
      cases: [],
      offenders: [],
      reports: [],
      documents: [],
      orders: null,
      examSubmissions: [],
      articles: null,
      binds: null
    };
    saveDatabase(freshDb);
    res.json({ success: true, message: 'База данных успешно перегенерирована', data: freshDb });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/status', (req, res) => {
  const stats = fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE) : null;
  res.json({
    status: 'online',
    dbFile: 'data/database.json',
    sizeBytes: stats ? stats.size : 0,
    lastModified: stats ? stats.mtime : null
  });
});

// Serve frontend static build
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('React App is building. Please run npm run build.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[СК РФ Портал] Express сервер запущен на http://0.0.0.0:${PORT}`);
  console.log(`[БД] База данных database.json активна: ${DB_FILE}`);
});
