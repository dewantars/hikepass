import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { redirect } from 'next/navigation'
import BookingActionClient from './BookingActionClient'
import styles from './pesanan.module.css'

export default async function AdminPesanan() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hikepass-token')?.value
  const session = token ? await verifyToken(token) : null

  if (!session || session.role !== 'ADMIN') redirect('/admin-masuk')

  const admin = await db.user.findUnique({
    where: { id: session.userId },
    select: { mountainId: true }
  })

  if (!admin?.mountainId) redirect('/admin')

  // Ambil semua booking untuk gunung ini, urutkan yang menunggu konfirmasi di atas
  const bookings = await db.booking.findMany({
    where: { mountainId: admin.mountainId },
    include: {
      trail: true,
      members: {
        where: { isLeader: true } // Ambil ketua saja untuk ringkasan
      }
    },
    orderBy: [
      { status: 'asc' }, // WAITING_CONFIRM biasanya akan di atas jika diurutkan (atau kita bisa urut spesifik nanti)
      { createdAt: 'desc' }
    ]
  })

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Manajemen Pesanan</h1>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Tanggal Naik</th>
              <th>Ketua & Anggota</th>
              <th>Total Tagihan</th>
              <th>Bukti Bayar</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                  Belum ada pesanan masuk.
                </td>
              </tr>
            ) : (
              bookings.map((b) => {
                const leader = b.members[0]
                
                return (
                  <tr key={b.id}>
                    <td><strong>{b.bookingCode}</strong></td>
                    <td>{b.hikingDate.toLocaleDateString('id-ID')}</td>
                    <td>
                      <div><strong>{leader?.name || 'Unknown'}</strong></div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        {b.totalMembers} orang • {b.trail.name}
                      </div>
                      <div className={styles.detailsBox}>
                        HP: {leader?.phone}<br/>
                        <a href={leader?.ktpImageUrl || '#'} target="_blank" className={styles.proofLink}>Lihat KTP</a> • 
                        <a href={leader?.healthCertUrl || '#'} target="_blank" className={styles.proofLink} style={{ marginLeft: 8 }}>Lihat S.Sehat</a>
                      </div>
                    </td>
                    <td>Rp {b.totalPrice.toLocaleString('id-ID')}</td>
                    <td>
                      {b.paymentProofUrl ? (
                        <a href={b.paymentProofUrl} target="_blank" className={styles.proofLink}>
                          Lihat Bukti
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles['status' + b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.status === 'WAITING_CONFIRM' && (
                        <BookingActionClient bookingId={b.id.toString()} />
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
