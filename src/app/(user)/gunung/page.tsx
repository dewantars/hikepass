import { db } from '@/lib/db'
import MountainCard from '@/components/ui/MountainCard'
import styles from './gunung.module.css'

export default async function GunungPage() {
  const mountains = await db.mountain.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Daftar Gunung</h1>
          <p className={styles.subtitle}>
            Temukan informasi lengkap, harga tiket, dan cek ketersediaan kuota pendakian
            berbagai gunung di Indonesia.
          </p>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        <div className={styles.grid}>
          {mountains.map((m) => (
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
      </div>
    </main>
  )
}
