import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import QuotaCalendar from '@/components/user/QuotaCalendar'
import styles from './gunungDetail.module.css'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function GunungDetailPage({ params }: PageProps) {
  const { id } = await params;
  const mountainId = parseInt(id)
  
  if (isNaN(mountainId)) {
    notFound()
  }

  const mountain = await db.mountain.findUnique({
    where: { id: mountainId },
    include: {
      trails: true,
    }
  })

  if (!mountain) {
    notFound()
  }

  return (
    <main className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          {mountain.imageUrl ? (
            <Image
              src={mountain.imageUrl}
              alt={mountain.name}
              fill
              className={styles.heroImage}
              priority
            />
          ) : (
            <div className={styles.heroFallback} />
          )}
        </div>
        <div className={styles.heroOverlay} />
        
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.title}>{mountain.name}</h1>
            <div className={styles.location}>
              📍 {mountain.location}, {mountain.province}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className={`container ${styles.contentWrapper}`}>
        <div className={styles.layoutGrid}>
          
          {/* Left Column (Details) */}
          <div className={styles.mainCol}>
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Informasi Gunung</h2>
              
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Ketinggian</span>
                  <span className={styles.infoValue}>{mountain.altitude.toLocaleString('id-ID')} mdpl</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Kuota Harian</span>
                  <span className={styles.infoValue}>{mountain.dailyQuota} pendaki</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Grup Minimal</span>
                  <span className={styles.infoValue}>{mountain.minGroupSize} orang</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Grup Maksimal</span>
                  <span className={styles.infoValue}>{mountain.maxGroupSize} orang</span>
                </div>
              </div>

              {mountain.description && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h3 className={styles.sectionTitle} style={{ fontSize: '1.25rem' }}>Deskripsi</h3>
                  <p className={styles.description}>{mountain.description}</p>
                </div>
              )}
            </div>

            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Jalur Pendakian (Trail)</h2>
              {mountain.trails.length > 0 ? (
                <div className={styles.trailList}>
                  {mountain.trails.map(trail => (
                    <div key={trail.id} className={styles.trailItem}>
                      <span className={styles.trailName}>{trail.name}</span>
                      <span className={`${styles.trailStatus} ${trail.isOpen ? styles.trailOpen : styles.trailClosed}`}>
                        {trail.isOpen ? 'BUKA' : 'TUTUP'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.description}>Belum ada data jalur pendakian.</p>
              )}
            </div>
          </div>

          {/* Right Column (Booking & Calendar) */}
          <div className={styles.sideCol}>
            <div className={`${styles.card} ${styles.priceCard}`}>
              <div className={styles.priceLabel}>Tarif Simaksi (per orang)</div>
              <div className={styles.priceAmount}>
                Rp {mountain.pricePerPerson.toLocaleString('id-ID')}
              </div>
              <div className={styles.groupRule}>
                Pemesanan wajib untuk {mountain.minGroupSize} - {mountain.maxGroupSize} orang per grup.
              </div>
              
              {/* Nanti tombol ini akan terhubung ke Phase 4 (Booking Form) */}
              <Link 
                href={`/booking?mountainId=${mountain.id}`} 
                className={`btn btn-primary btn-lg btn-full ${styles.actionButton}`}
              >
                Pesan Tiket Sekarang
              </Link>
            </div>

            <QuotaCalendar mountainId={mountain.id} />
          </div>

        </div>
      </section>
    </main>
  )
}
