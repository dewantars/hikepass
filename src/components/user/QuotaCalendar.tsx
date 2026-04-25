'use client'

import { useState, useEffect } from 'react'
import styles from './QuotaCalendar.module.css'

interface QuotaData {
  date: string
  remainingQuota: number
  isClosed: boolean
}

interface QuotaCalendarProps {
  mountainId: number
  onSelectDate?: (date: string) => void
}

export default function QuotaCalendar({ mountainId, onSelectDate }: QuotaCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [quotaData, setQuotaData] = useState<QuotaData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1 // 1-12

  useEffect(() => {
    async function fetchQuota() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/gunung/${mountainId}/quota?year=${year}&month=${month}`)
        if (!res.ok) throw new Error('Gagal mengambil data kuota')
        const json = await res.json()
        setQuotaData(json.data)
      } catch (err) {
        console.error(err)
        setError('Gagal memuat kuota.')
      } finally {
        setLoading(false)
      }
    }
    fetchQuota()
  }, [mountainId, year, month])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1))
  }

  const handleDateClick = (dateStr: string, remainingQuota: number, isClosed: boolean) => {
    if (isClosed || remainingQuota <= 0) return
    setSelectedDate(dateStr)
    if (onSelectDate) onSelectDate(dateStr)
  }

  // Helper untuk render kalender
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay() // 0 (Sun) to 6 (Sat)
  
  // Array untuk padding awal
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Kalender Kuota</h3>
        <div className={styles.controls}>
          <button className={styles.btnNav} onClick={handlePrevMonth} aria-label="Bulan sebelumnya">
            ←
          </button>
          <div className={styles.currentMonth}>
            {monthNames[month - 1]} {year}
          </div>
          <button className={styles.btnNav} onClick={handleNextMonth} aria-label="Bulan berikutnya">
            →
          </button>
        </div>
      </div>

      <div className={styles.weekdays}>
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
          <div key={day} className={styles.weekday}>{day}</div>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Memuat kuota...</p>
        </div>
      ) : error ? (
        <div className={styles.loading}>
          <p>{error}</p>
          <button onClick={() => setCurrentDate(new Date(currentDate.getTime()))} className="btn btn-primary btn-sm">Coba Lagi</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {/* Empty cells */}
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className={`${styles.dayCell} ${styles.dayCellEmpty}`}></div>
          ))}

          {/* Days */}
          {quotaData.map((data) => {
            const dayNum = parseInt(data.date.split('-')[2])
            const isFull = data.remainingQuota <= 0
            const isPast = new Date(data.date) < new Date(new Date().setHours(0,0,0,0))
            const isSelectable = !data.isClosed && !isFull && !isPast
            
            let badgeClass = styles.quotaAvailable
            let badgeText = `${data.remainingQuota} sisa`

            if (data.isClosed) {
              badgeClass = styles.quotaClosed
              badgeText = 'TUTUP'
            } else if (isPast) {
              badgeClass = styles.quotaClosed
              badgeText = '-'
            } else if (isFull) {
              badgeClass = styles.quotaFull
              badgeText = 'HABIS'
            } else if (data.remainingQuota < 20) {
              badgeClass = styles.quotaLow
            }

            return (
              <button
                key={data.date}
                className={`
                  ${styles.dayCell} 
                  ${data.isClosed || isPast ? styles.quotaClosed : ''} 
                  ${isFull && !data.isClosed && !isPast ? styles.quotaFull : ''}
                  ${selectedDate === data.date ? styles.daySelected : ''}
                `}
                disabled={!isSelectable}
                onClick={() => handleDateClick(data.date, data.remainingQuota, data.isClosed)}
                aria-label={`Tanggal ${data.date}, Sisa kuota ${data.remainingQuota}`}
                aria-pressed={selectedDate === data.date}
              >
                <span className={styles.dateNumber}>{dayNum}</span>
                <span className={`${styles.quotaBadge} ${badgeClass}`}>
                  {badgeText}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
