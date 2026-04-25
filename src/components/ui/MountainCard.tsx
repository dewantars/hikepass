import Link from 'next/link'
import Image from 'next/image'
import styles from './MountainCard.module.css'

interface MountainCardProps {
  id: number
  name: string
  province: string
  location: string
  altitude: number
  pricePerPerson: number
  imageUrl: string | null
}

export default function MountainCard({
  id,
  name,
  province,
  location,
  altitude,
  pricePerPerson,
  imageUrl
}: MountainCardProps) {
  return (
    <Link href={`/gunung/${id}`} className={styles.card}>
      <div className={styles.cardImageWrapper}>
        <div className={styles.provinceBadge}>{province}</div>
        
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={name} 
            fill 
            className={styles.cardImage}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className={styles.cardImageFallback}>🏔</div>
        )}
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{name}</h3>
        <div className={styles.cardLocation}>📍 {location}</div>
        
        <div className={styles.cardStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Ketinggian</span>
            <span className={styles.statValue}>{altitude.toLocaleString('id-ID')} mdpl</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Simaksi</span>
            <span className={`${styles.statValue} ${styles.priceHighlight}`}>
              Rp {pricePerPerson.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
