import { db } from '@/lib/db'

export default async function Home() {
  // Test koneksi database
  const mountains = await db.mountain.findMany({
    select: { id: true, name: true, altitude: true, dailyQuota: true },
    orderBy: { altitude: 'desc' },
  })

  return (
    <main style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ color: '#1B6B4A', marginBottom: '0.5rem' }}>🏔 HikePass</h1>
      <p style={{ color: '#64748B', marginBottom: '2rem' }}>
        Phase 1 — Database connected ✅ ({mountains.length} gunung tersedia)
      </p>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {mountains.map((m) => (
          <li
            key={m.id}
            style={{
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              background: '#fff',
            }}
          >
            <strong>{m.name}</strong> — {m.altitude.toLocaleString('id-ID')} mdpl
            <span style={{ marginLeft: '1rem', color: '#64748B', fontSize: '0.875rem' }}>
              Kuota: {m.dailyQuota} orang/hari
            </span>
          </li>
        ))}
      </ul>
    </main>
  )
}
