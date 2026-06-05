import { NextRequest, NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { generateContractPdf } from '@/lib/pdf';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDb();
  const { id } = await params;
  const { signature_data } = await req.json();

  if (!signature_data) {
    return NextResponse.json({ error: 'signature_data is required' }, { status: 400 });
  }

  // Get contract
  const result = await db.execute({
    sql: 'SELECT * FROM contracts WHERE id = ?',
    args: [id],
  });

  if (!result.rows.length) {
    return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
  }

  const contract = result.rows[0] as unknown as {
    id: string;
    client_name: string;
    email: string;
    contract_text: string;
    status: string;
  };

  if (contract.status === 'signed') {
    return NextResponse.json({ error: 'Contract already signed' }, { status: 400 });
  }

  // Generate PDF
  const pdfUrl = await generateContractPdf(
    contract.id,
    contract.client_name,
    contract.contract_text,
    signature_data
  );

  const now = new Date().toISOString();

  // Update DB
  await db.execute({
    sql: 'UPDATE contracts SET status = ?, signature_data = ?, pdf_url = ?, signed_at = ? WHERE id = ?',
    args: ['signed', signature_data, pdfUrl, now, id],
  });

  return NextResponse.json({ success: true, pdf_url: pdfUrl, signed_at: now });
}
