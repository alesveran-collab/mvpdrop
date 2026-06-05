'use client';
import { useState, useEffect } from 'react';
import { DEFAULT_CONTRACT_TEMPLATE } from '@/lib/template';

interface Contract {
  id: string;
  client_name: string;
  email: string;
  status: 'sent' | 'signed';
  pdf_url?: string;
  created_at: string;
  signed_at?: string;
}

export default function AdminPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({
    client_name: '',
    email: '',
    contract_text: DEFAULT_CONTRACT_TEMPLATE,
  });

  useEffect(() => { fetchContracts(); }, []);

  async function fetchContracts() {
    const res = await fetch('/api/contracts');
    const data = await res.json();
    setContracts(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function createContract(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch('/api/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ client_name: '', email: '', contract_text: DEFAULT_CONTRACT_TEMPLATE });
      setShowForm(false);
      fetchContracts();
    }
    setCreating(false);
  }

  function getContractUrl(id: string) {
    return `${window.location.origin}/contract/${id}`;
  }

  function copyLink(id: string) {
    navigator.clipboard.writeText(getContractUrl(id));
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f13', color: '#e8e4dc', fontFamily: "'Georgia', serif" }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #2a2a35', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#6b6b80', textTransform: 'uppercase', marginBottom: 4 }}>Система управления</div>
          <h1 style={{ fontSize: 24, fontWeight: 400, letterSpacing: 1 }}>Договоры</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: showForm ? '#2a2a35' : '#c9a96e',
            color: showForm ? '#e8e4dc' : '#0f0f13',
            border: 'none',
            padding: '10px 24px',
            fontSize: 13,
            letterSpacing: 2,
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {showForm ? '✕ Отмена' : '+ Новый договор'}
        </button>
      </header>

      <div style={{ padding: '40px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Create Form */}
        {showForm && (
          <form onSubmit={createContract} style={{
            background: '#16161d',
            border: '1px solid #2a2a35',
            padding: 32,
            marginBottom: 40,
          }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#c9a96e', textTransform: 'uppercase', marginBottom: 24 }}>
              Новый договор
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: 2, color: '#6b6b80', textTransform: 'uppercase', marginBottom: 8 }}>
                  Имя клиента *
                </label>
                <input
                  required
                  value={form.client_name}
                  onChange={e => setForm({...form, client_name: e.target.value})}
                  placeholder="Иван Иванов"
                  style={{
                    width: '100%', background: '#0f0f13', border: '1px solid #2a2a35',
                    color: '#e8e4dc', padding: '10px 14px', fontSize: 14,
                    fontFamily: 'inherit', outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: 2, color: '#6b6b80', textTransform: 'uppercase', marginBottom: 8 }}>
                  Email *
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="client@example.com"
                  style={{
                    width: '100%', background: '#0f0f13', border: '1px solid #2a2a35',
                    color: '#e8e4dc', padding: '10px 14px', fontSize: 14,
                    fontFamily: 'inherit', outline: 'none',
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: 2, color: '#6b6b80', textTransform: 'uppercase', marginBottom: 8 }}>
                Текст договора (используйте {'{client_name}'} для подстановки имени)
              </label>
              <textarea
                value={form.contract_text}
                onChange={e => setForm({...form, contract_text: e.target.value})}
                rows={10}
                style={{
                  width: '100%', background: '#0f0f13', border: '1px solid #2a2a35',
                  color: '#e8e4dc', padding: '12px 14px', fontSize: 13,
                  fontFamily: 'monospace', outline: 'none', resize: 'vertical',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              style={{
                background: '#c9a96e', color: '#0f0f13', border: 'none',
                padding: '12px 32px', fontSize: 13, letterSpacing: 2,
                textTransform: 'uppercase', cursor: creating ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', opacity: creating ? 0.6 : 1,
              }}
            >
              {creating ? 'Создание...' : 'Создать договор'}
            </button>
          </form>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'Всего', value: contracts.length },
            { label: 'Отправлено', value: contracts.filter(c => c.status === 'sent').length },
            { label: 'Подписано', value: contracts.filter(c => c.status === 'signed').length },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#16161d', border: '1px solid #2a2a35', padding: '20px 24px' }}>
              <div style={{ fontSize: 28, fontWeight: 300, color: '#c9a96e', marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 11, letterSpacing: 2, color: '#6b6b80', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Contracts Table */}
        {loading ? (
          <div style={{ color: '#6b6b80', textAlign: 'center', padding: 60, letterSpacing: 2 }}>Загрузка...</div>
        ) : contracts.length === 0 ? (
          <div style={{ color: '#6b6b80', textAlign: 'center', padding: 60, letterSpacing: 1 }}>
            Договоры ещё не созданы
          </div>
        ) : (
          <div style={{ border: '1px solid #2a2a35' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1fr 2fr 1fr 1fr',
              padding: '12px 20px',
              background: '#16161d',
              fontSize: 11,
              letterSpacing: 2,
              color: '#6b6b80',
              textTransform: 'uppercase',
              borderBottom: '1px solid #2a2a35',
            }}>
              <div>Клиент</div>
              <div>Email</div>
              <div>Статус</div>
              <div>Создан</div>
              <div>Ссылка</div>
              <div>PDF</div>
            </div>
            {contracts.map((c, i) => (
              <div key={c.id} style={{
                display: 'grid',
                gridTemplateColumns: '2fr 2fr 1fr 2fr 1fr 1fr',
                padding: '16px 20px',
                fontSize: 13,
                alignItems: 'center',
                borderBottom: i < contracts.length - 1 ? '1px solid #1e1e28' : 'none',
                background: 'transparent',
              }}>
                <div style={{ fontWeight: 500 }}>{c.client_name}</div>
                <div style={{ color: '#9999aa' }}>{c.email}</div>
                <div>
                  <span style={{
                    padding: '3px 10px',
                    fontSize: 10,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    background: c.status === 'signed' ? 'rgba(45,106,79,0.25)' : 'rgba(201,169,110,0.15)',
                    color: c.status === 'signed' ? '#4ade80' : '#c9a96e',
                    border: `1px solid ${c.status === 'signed' ? 'rgba(74,222,128,0.3)' : 'rgba(201,169,110,0.3)'}`,
                  }}>
                    {c.status === 'signed' ? 'Подписан' : 'Отправлен'}
                  </span>
                </div>
                <div style={{ color: '#6b6b80', fontSize: 12 }}>
                  {new Date(c.created_at).toLocaleString('ru-RU')}
                </div>
                <div>
                  <button
                    onClick={() => copyLink(c.id)}
                    style={{
                      background: 'none',
                      border: '1px solid #2a2a35',
                      color: copied === c.id ? '#4ade80' : '#9999aa',
                      padding: '4px 10px',
                      fontSize: 11,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      letterSpacing: 1,
                    }}
                  >
                    {copied === c.id ? '✓ Скопировано' : 'Скопировать'}
                  </button>
                </div>
                <div>
                  {c.pdf_url ? (
                    <a
                      href={c.pdf_url}
                      target="_blank"
                      style={{
                        color: '#c9a96e',
                        textDecoration: 'none',
                        fontSize: 11,
                        letterSpacing: 1,
                        borderBottom: '1px solid rgba(201,169,110,0.3)',
                      }}
                    >
                      Открыть
                    </a>
                  ) : (
                    <span style={{ color: '#3a3a4a', fontSize: 11 }}>—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
