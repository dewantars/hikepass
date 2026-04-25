'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { scanTicket, updateTicketStatus } from '@/app/actions/admin'
import styles from './scanner.module.css'

export default function AdminScanner() {
  const [scanResult, setScanResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    // Hindari double initialization pada React Strict Mode
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      )
      
      scannerRef.current.render(onScanSuccess, onScanFailure)
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Gagal clear scanner", err))
        scannerRef.current = null
      }
    }
  }, [])

  const onScanSuccess = async (decodedText: string) => {
    // Hentikan sementara scanning saat memproses
    if (scannerRef.current) {
      scannerRef.current.pause(true)
    }
    
    setError(null)
    setLoading(true)

    const res = await scanTicket(decodedText)
    setLoading(false)

    if (res.error) {
      setError(res.error)
      // Resume scanner after 3s if error
      setTimeout(() => {
        if (scannerRef.current) scannerRef.current.resume()
      }, 3000)
    } else if (res.success) {
      setScanResult(res.booking)
    }
  }

  const onScanFailure = (err: any) => {
    // Sering terjadi saat tidak ada QR di depan kamera, biarkan saja
  }

  const handleAction = async (action: 'CHECKED_IN' | 'COMPLETED') => {
    if (!scanResult) return
    setLoading(true)
    const res = await updateTicketStatus(scanResult.id, action)
    setLoading(false)

    if (res.error) {
      alert(res.error)
    } else {
      alert(`Berhasil! Status diubah menjadi ${action}`)
      setScanResult(null)
      if (scannerRef.current) scannerRef.current.resume()
    }
  }

  const handleRescan = () => {
    setScanResult(null)
    setError(null)
    if (scannerRef.current) scannerRef.current.resume()
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Scanner Tiket</h1>
      <p className={styles.subtitle}>Pindai QR Code E-Ticket Pendaki</p>

      {/* Tampilkan scanner hanya jika belum ada hasil sukses */}
      <div 
        id="qr-reader" 
        className={styles.scannerContainer} 
        style={{ display: scanResult ? 'none' : 'block' }}
      ></div>

      {error && (
        <div className={styles.errorBox}>
          {error}
        </div>
      )}

      {scanResult && (
        <div className={styles.resultBox}>
          <div className={styles.resultHeader}>
            <span>Kode Tiket:</span>
            <span className={styles.resultCode}>{scanResult.bookingCode}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Status Saat Ini</span>
            <span className={styles.detailValue} style={{ color: '#2563EB' }}>{scanResult.status}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Ketua</span>
            <span className={styles.detailValue}>{scanResult.members?.find((m:any) => m.isLeader)?.name}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Jumlah Anggota</span>
            <span className={styles.detailValue}>{scanResult.totalMembers} Orang</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Tanggal Naik</span>
            <span className={styles.detailValue}>{new Date(scanResult.hikingDate).toLocaleDateString('id-ID')}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Jalur</span>
            <span className={styles.detailValue}>{scanResult.trail?.name}</span>
          </div>

          <div className={styles.actionWrapper}>
            {scanResult.status === 'PAID' && (
              <button 
                className={`${styles.btnAction} ${styles.btnCheckIn}`}
                onClick={() => handleAction('CHECKED_IN')}
                disabled={loading}
              >
                {loading ? 'Proses...' : 'Check-In (Naik)'}
              </button>
            )}
            
            {scanResult.status === 'CHECKED_IN' && (
              <button 
                className={`${styles.btnAction} ${styles.btnCheckOut}`}
                onClick={() => handleAction('COMPLETED')}
                disabled={loading}
              >
                {loading ? 'Proses...' : 'Check-Out (Turun)'}
              </button>
            )}
          </div>

          <button className={styles.btnRescan} onClick={handleRescan}>
            Pindai Tiket Lain
          </button>
        </div>
      )}
    </div>
  )
}
