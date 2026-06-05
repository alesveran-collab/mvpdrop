'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import SignatureCanvas from './SignatureCanvas';

interface Contract {
  id: string;
  client_name: string;
  email: string;
  contract_text: string;
  status: 'sent' | 'signed';
  pdf_url?: string;
  created_at: string;
  signed_at?: string;
}

export default function ContractPage() {
  const params = useParams();
  const id = params.id as string;
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/contracts/${id}`);
      if (!res.ok) { setNotFound(true); setLoading(false); return; }
      const data = await res.json();
      setContract(data);
      if (data.status === 'signed') {
        setSigned(true);
        setPdfUrl(data.pdf_url);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSign() {
    if (!signatureData) return;
    setSigning(true);
    try {
      const res = await fetch(`/api/contracts/${id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature_data: signatureData }),
      });
      const data = await res.json();
      if (res.ok) {
        setSigned(true);
        setPdfUrl(data.pdf_url);
      }
    } finally {
      setSigning(false);
    }
  }

  function renderContractText(text: string, name: string) {
    return text.replace(/\{client_name\}/g, `<strong>${name}</strong>`);
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#9999aa', letterSpacing: 3, fontFamily: 'Georgia, serif', fontSize: 13, textTransform: 'uppercase' }}>
          Загрузка...
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, color: '#ddd', marginBottom: 16 }}>404</div>
          <div style={{ color: '#666' }}>Договор не найден</div>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
        <div style={{ textAlign: 'center', maxWidth: 480, padding: 40 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2d6a4f, #40916c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 32px', fontSize: 32,
          }}>
            ✓
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 400, color: '#1a1a1a', marginBottom: 12, letterSpacing: 1 }}>
            Документ подписан
          </h2>
          <p style={{ color: '#666', lineHeight: 1.7, marginBottom: 32 }}>
            {contract?.client_name}, ваш договор успешно подписан.<br />
            Копия будет направлена на {contract?.email}.
          </p>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              style={{
                display: 'inline-block',
                background: '#1a1a1a',
                color: '#faf8f4',
                textDecoration: 'none',
                padding: '12px 32px',
                fontSize: 12,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Скачать PDF
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f4', fontFamily: 'Georgia, serif' }}>
      {/* Header bar */}
      <div style={{
        background: '#1a1a1a',
        padding: '14px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ color: '#c9a96e', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' }}>
          Электронное подписание
        </div>
        <div style={{ color: '#555', fontSize: 11, letterSpacing: 1 }}>
          {contract?.client_name} · {contract?.email}
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#aaa', textTransform: 'uppercase', marginBottom: 12 }}>
            Для подписания
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 400, color: '#1a1a1a', letterSpacing: 1 }}>
            Договор об оказании услуг
          </h1>
          <div style={{ width: 48, height: 1, background: '#c9a96e', margin: '16px auto 0' }} />
        </div>

        {/* Contract body */}
        <div style={{
          background: 'white',
          border: '1px solid #e8e4dc',
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          padding: '48px 56px',
          marginBottom: 40,
          lineHeight: 1.9,
          fontSize: 15,
          color: '#2a2a2a',
          whiteSpace: 'pre-wrap',
        }}
          dangerouslySetInnerHTML={{
            __html: renderContractText(contract!.contract_text, contract!.client_name)
          }}
        />

        {/* Signature section */}
        <div style={{
          background: 'white',
          border: '1px solid #e8e4dc',
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          padding: '40px 48px',
        }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: '#aaa', textTransform: 'uppercase', marginBottom: 8 }}>
            Шаг 1
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 400, color: '#1a1a1a', marginBottom: 6 }}>
            Поставьте подпись
          </h3>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
            Нарисуйте вашу подпись в поле ниже. Используйте мышь или сенсорный экран.
          </p>

          <SignatureCanvas
            onChange={setSignatureData}
            disabled={signed}
          />

          <div style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid #f0ece4' }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#aaa', textTransform: 'uppercase', marginBottom: 8 }}>
              Шаг 2
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 400, color: '#1a1a1a', marginBottom: 16 }}>
              Подпишите договор
            </h3>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
              Нажимая кнопку, вы подтверждаете, что ознакомились с условиями договора и согласны с ними.
            </p>

            <button
              onClick={handleSign}
              disabled={!signatureData || signing}
              style={{
                background: signatureData && !signing ? '#1a1a1a' : '#e0ddd6',
                color: signatureData && !signing ? '#faf8f4' : '#aaa',
                border: 'none',
                padding: '14px 48px',
                fontSize: 13,
                letterSpacing: 2,
                textTransform: 'uppercase',
                cursor: signatureData && !signing ? 'pointer' : 'not-allowed',
                fontFamily: 'Georgia, serif',
                transition: 'all 0.2s',
              }}
            >
              {signing ? 'Сохранение...' : 'Подписать договор'}
            </button>

            {!signatureData && (
              <p style={{ marginTop: 12, color: '#bbb', fontSize: 12, letterSpacing: 0.5 }}>
                ↑ Сначала поставьте подпись выше
              </p>
            )}
          </div>
        </div>

        <div style={{ marginTop: 32, textAlign: 'center', color: '#bbb', fontSize: 11, letterSpacing: 1 }}>
          Документ защищён · Данные передаются по зашифрованному каналу
        </div>
      </div>
    </div>
  );
}
