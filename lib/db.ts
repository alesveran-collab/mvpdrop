import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'contracts.db');

export const db = createClient({
  url: `file:${dbPath}`,
});

export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      email TEXT NOT NULL,
      contract_text TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'sent',
      pdf_url TEXT,
      signature_data TEXT,
      created_at TEXT NOT NULL,
      signed_at TEXT
    )
  `);
}
