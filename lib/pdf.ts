import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const pdfsDir = path.join(process.cwd(), 'public', 'pdfs');

export async function generateContractPdf(
  contractId: string,
  clientName: string,
  contractText: string,
  signatureData: string
): Promise<string> {
  if (!fs.existsSync(pdfsDir)) {
    fs.mkdirSync(pdfsDir, { recursive: true });
  }

  const html = buildContractHtml(clientName, contractText, signatureData);
  
  const browser = await puppeteer.launch({
    executablePath: '/opt/google/chrome/chrome',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    
    const filename = `contract-${contractId}.pdf`;
    const filePath = path.join(pdfsDir, filename);
    
    await page.pdf({
      path: filePath,
      format: 'A4',
      margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
      printBackground: true,
    });

    return `/pdfs/${filename}`;
  } finally {
    await browser.close();
  }
}

function buildContractHtml(
  clientName: string,
  contractText: string,
  signatureData: string
): string {
  const now = new Date().toLocaleDateString('ru-RU', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 14px;
    line-height: 1.8;
    color: #1a1a1a;
    background: white;
  }
  .page { max-width: 170mm; margin: 0 auto; padding: 10mm 0; }
  h1 {
    font-size: 18px;
    text-align: center;
    margin-bottom: 8px;
    font-weight: bold;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .date {
    text-align: center;
    color: #555;
    margin-bottom: 24px;
    font-size: 13px;
  }
  .contract-body {
    text-align: justify;
    white-space: pre-wrap;
    margin-bottom: 40px;
  }
  .signature-section {
    margin-top: 40px;
    border-top: 1px solid #ccc;
    padding-top: 20px;
  }
  .signature-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 40px;
  }
  .sig-box {
    flex: 1;
  }
  .sig-label {
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .sig-name {
    font-weight: bold;
    font-size: 14px;
    border-top: 1px solid #333;
    padding-top: 4px;
  }
  .sig-image-box {
    flex: 1;
    text-align: center;
  }
  .sig-image-box img {
    max-height: 70px;
    max-width: 200px;
  }
  .sig-image-label {
    font-size: 11px;
    color: #888;
    margin-top: 4px;
    border-top: 1px solid #333;
    padding-top: 4px;
  }
  .stamp {
    margin-top: 24px;
    padding: 12px 16px;
    border: 2px solid #2d6a4f;
    border-radius: 4px;
    background: #f0faf4;
    display: inline-block;
    font-size: 12px;
    color: #2d6a4f;
    letter-spacing: 1px;
  }
</style>
</head>
<body>
<div class="page">
  <h1>Договор</h1>
  <div class="date">г. Москва, ${now}</div>
  <div class="contract-body">${escapeHtml(contractText).replace(/\{client_name\}/g, `<strong>${escapeHtml(clientName)}</strong>`)}</div>
  
  <div class="signature-section">
    <div class="signature-row">
      <div class="sig-box">
        <div class="sig-label">Клиент</div>
        <div class="sig-name">${escapeHtml(clientName)}</div>
      </div>
      <div class="sig-image-box">
        <img src="${signatureData}" alt="Подпись" />
        <div class="sig-image-label">Подпись</div>
      </div>
    </div>
    <div class="stamp">✓ ДОКУМЕНТ ПОДПИСАН ЭЛЕКТРОННО · ${now}</div>
  </div>
</div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
