import Link from 'next/link';

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f13',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      color: '#e8e4dc',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 500, padding: '0 24px' }}>
        <div style={{ fontSize: 11, letterSpacing: 5, color: '#c9a96e', textTransform: 'uppercase', marginBottom: 16 }}>
          Contract Sign
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: 2, marginBottom: 16, lineHeight: 1.2 }}>
          Электронное подписание договоров
        </h1>
        <p style={{ color: '#6b6b80', lineHeight: 1.7, marginBottom: 40, fontSize: 15 }}>
          Создавайте персональные договоры, отправляйте клиентам уникальные ссылки и получайте подписанные документы онлайн.
        </p>
        <Link
          href="/admin"
          style={{
            background: '#c9a96e',
            color: '#0f0f13',
            textDecoration: 'none',
            padding: '14px 40px',
            fontSize: 12,
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          Открыть панель управления →
        </Link>
      </div>
    </div>
  );
}
