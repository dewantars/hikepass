import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { redirect } from 'next/navigation'
import TrailActionClient from './TrailActionClient'
import styles from '../pesanan/pesanan.module.css' // Reuse table styles

export default async function AdminGunung() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hikepass-token')?.value
  const session = token ? await verifyToken(token) : null

  if (!session || session.role !== 'ADMIN') redirect('/admin-masuk')

  const admin = await db.user.findUnique({
    where: { id: session.userId },
    select: { mountainId: true }
  })

  if (!admin?.mountainId) redirect('/admin')

  const mountain = await db.mountain.findUnique({
    where: { id: admin.mountainId },
    include: {
      trails: true
    }
  })

  if (!mountain) redirect('/admin')

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Kelola Jalur: {mountain.name}</h1>
      <p style={{ color: '#64748B', marginBottom: '24px' }}>
        Gunakan fitur ini sebagai <strong>Emergency Switch</strong>. Anda dapat menutup jalur pendakian kapan saja (misal: cuaca buruk, evakuasi, kebakaran hutan).
      </p>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Jalur</th>
              <th>Status Saat Ini</th>
              <th>Aksi Darurat</th>
            </tr>
          </thead>
          <tbody>
            {mountain.trails.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td><strong>{t.name}</strong></td>
                <td>
                  <span className={`${styles.statusBadge} ${t.isOpen ? styles.statusPAID : styles.statusCANCELLED}`}>
                    {t.isOpen ? 'BUKA' : 'DITUTUP SEMENTARA'}
                  </span>
                </td>
                <td>
                  <TrailActionClient trailId={t.id} isOpen={t.isOpen} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
