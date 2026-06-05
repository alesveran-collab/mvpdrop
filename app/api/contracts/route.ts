import { NextRequest, NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { DEFAULT_CONTRACT_TEMPLATE } from '@/lib/template';
import { v4 as uuidv4 } from 'uuid';

async function ensureDb() {
  await initDb();
}

export async function GET() {
  await ensureDb();
  const result = await db.execute(
    'SELECT id, client_name, email, status, pdf_url, created_at, signed_at FROM contracts ORDER BY created_at DESC'
  );
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json();
  const { client_name, email, contract_text } = body;

  if (!client_name || !email) {
    return NextResponse.json({ error: 'client_name and email are required' }, { status: 400 });
  }

  const id = uuidv4();
  const now = new Date().toISOString();
  const text = contract_text || DEFAULT_CONTRACT_TEMPLATE;

  await db.execute({
    sql: 'INSERT INTO contracts (id, client_name, email, contract_text, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    args: [id, client_name, email, text, 'sent', now],
  });

  return NextResponse.json({ id, client_name, email, status: 'sent', created_at: now });
}
