import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Ticket, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import styles from './adminDashboard.module.css'

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hikepass-token')?.value
  const session = token ? await verifyToken(token) : null

  if (!session || !session.userId) redirect('/admin-masuk')

  // Dapatkan Mountain ID yang dikelola admin ini
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { mountainId: true, mountain: true }
  })

  if (!user || !user.mountainId) {
    return (
      <div className={styles.errorBox}>
        <AlertCircle size={40} color="#EF4444" />
        <h2>Akses Ditolak</h2>
        <p>Anda belum ditugaskan untuk mengelola gunung manapun. Hubungi Super Admin.</p>
      </div>
    )
  }

  const mountainId = user.mountainId
  const mountainName = user.mountain?.name

  // Statistik: Hari ini
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // 1. Pesanan masuk yang belum diverifikasi
  const pendingBookings = await db.booking.count({
    where: { mountainId, status: 'WAITING_CONFIRM' }
  })

  // 2. Pendapatan bulan ini (dari booking berstatus PAID atau COMPLETED)
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthBookings = await db.booking.aggregate({
    _sum: { totalPrice: true },
    where: { 
      mountainId, 
      createdAt: { gte: startOfMonth },
      status: { in: ['PAID', 'CHECKED_IN', 'COMPLETED'] }
    }
  })
  const monthlyRevenue = monthBookings._sum.totalPrice || 0

  // 3. Kuota terisi hari ini
  const bookedToday = await db.booking.aggregate({
    _sum: { totalMembers: true },
    where: { 
      mountainId, 
      hikingDate: { gte: today, lt: tomorrow },
      status: { notIn: ['CANCELLED', 'EXPIRED'] }
    }
  })
  const quotaUsedToday = bookedToday._sum.totalMembers || 0
  const dailyQuota = user.mountain?.dailyQuota || 0
  const remainingQuota = Math.max(0, dailyQuota - quotaUsedToday)

  return (
    <main>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Ringkasan operasional {mountainName} hari ini</p>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper} style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <Clock size={24} />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Menunggu Verifikasi</p>
            <p className={styles.statValue}>{pendingBookings} Pesanan</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper} style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Sisa Kuota Hari Ini</p>
            <p className={styles.statValue}>{remainingQuota} Orang</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper} style={{ backgroundColor: '#DBEAFE', color: '#2563EB' }}>
            <Ticket size={24} />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Pendapatan Bulan Ini</p>
            <p className={styles.statValue}>Rp {monthlyRevenue.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      <div className={styles.recentSection}>
        <h2 className={styles.sectionTitle}>Aksi Cepat</h2>
        <div className={styles.actionGrid}>
          <a href="/admin/pesanan" className={styles.actionCard}>
            <h3>Kelola Pesanan →</h3>
            <p>Verifikasi bukti pembayaran yang masuk.</p>
          </a>
          <a href="/admin/scanner" className={styles.actionCard}>
            <h3>Scanner QR →</h3>
            <p>Pindai tiket pendaki yang datang ke basecamp.</p>
          </a>
          <a href="/admin/gunung" className={styles.actionCard}>
            <h3>Status Jalur →</h3>
            <p>Tutup atau buka jalur pendakian (Emergency).</p>
          </a>
        </div>
      </div>
    </main>
  )
}
