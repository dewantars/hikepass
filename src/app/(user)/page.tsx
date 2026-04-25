import { db } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.css'
import MountainCard from '@/components/ui/MountainCard'

export default async function Home() {
  // Ambil 6 gunung terbaru/unggulan
  const featuredMountains = await db.mountain.findMany({
    take: 6,
    orderBy: { altitude: 'desc' },
  })

  return (
    <main>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroBgFallback} />
          {/* Gambar lokal yang nanti akan diisi user */}
          {/* <Image 
            src="/images/hero/hero-bg.jpg" 
            alt="Pemandangan Gunung" 
            fill 
            className={styles.heroBgImage}
            priority
          /> */}
        </div>
        <div className={styles.heroOverlay} />
        
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Sistem Booking Tiket Pendakian Gunung</h1>
          <p className={styles.heroSubtitle}>
            Rencanakan pendakianmu dengan mudah, cek sisa kuota secara real-time, dan pesan tiket 
            untuk seluruh anggota tim hanya dalam beberapa langkah.
          </p>
          <div className={styles.heroActions}>
            <Link href="/gunung" className="btn btn-primary btn-lg">
              Mulai Petualangan
            </Link>
            <Link href="/masuk" className="btn btn-ghost btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              Daftar Akun
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Mountains Section */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Jelajahi Gunung Favorit</h2>
            <p className={styles.sectionSubtitle}>Temukan destinasi pendakian terbaik di Indonesia</p>
          </div>

          <div className={styles.grid}>
            {featuredMountains.map((m) => (
              <MountainCard
                key={m.id}
                id={m.id}
                name={m.name}
                province={m.province}
                location={m.location}
                altitude={m.altitude}
                pricePerPerson={m.pricePerPerson}
                imageUrl={m.imageUrl}
              />
            ))}
          </div>

          <div className={styles.viewAllWrapper}>
            <Link href="/gunung" className="btn btn-primary">
              Lihat Semua Gunung →
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
