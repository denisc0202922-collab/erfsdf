import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

function apiDatabasePlugin() {
  const DATA_DIR = path.resolve(__dirname, 'data');
  const DB_FILE = path.join(DATA_DIR, 'database.json');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  function getOrGenerateDatabase() {
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
    } catch {
      return {};
    }
  }

  function saveDatabase(db: any) {
    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }

  return {
    name: 'api-database-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url?.split('?')[0];

        if (url === '/api/db' && req.method === 'GET') {
          const db = getOrGenerateDatabase();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, data: db, lastUpdated: db.lastUpdated }));
          return;
        }

        if (url === '/api/db/sync' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body || '{}');
              const currentDb = getOrGenerateDatabase();
              const updatedDb = { ...currentDb, ...payload, lastUpdated: new Date().toISOString() };
              saveDatabase(updatedDb);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, lastUpdated: updatedDb.lastUpdated }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        if (url === '/api/db/reset' && req.method === 'POST') {
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
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, message: 'База данных сброшена', data: freshDb }));
          return;
        }

        if (url === '/api/status' && req.method === 'GET') {
          const stats = fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE) : null;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            status: 'online',
            dbFile: 'data/database.json',
            sizeBytes: stats ? stats.size : 0,
            lastModified: stats ? stats.mtime : null
          }));
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDatabasePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: [
          '**/data/**',
          '**/data/database.json',
          '**/dist/**',
          '**/*.json'
        ]
      },
    },
  };
});
