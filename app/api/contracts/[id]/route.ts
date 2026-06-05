import { NextRequest, NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDb();
  const { id } = await params;
  const result = await db.execute({
    sql: 'SELECT * FROM contracts WHERE id = ?',
    args: [id],
  });

  if (!result.rows.length) {
    return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}
