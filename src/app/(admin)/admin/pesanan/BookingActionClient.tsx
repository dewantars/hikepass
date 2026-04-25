'use client'

import { useState } from 'react'
import { verifyPayment } from '@/app/actions/admin'
import { useRouter } from 'next/navigation'

export default function BookingActionClient({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleVerify = async () => {
    if (!confirm('Apakah Anda yakin bukti transfer sudah valid dan ingin memverifikasi pesanan ini?')) return

    setLoading(true)
    const res = await verifyPayment(bookingId)
    setLoading(false)

    if (res?.error) {
      alert(res.error)
    } else {
      alert('Berhasil diverifikasi!')
      router.refresh()
    }
  }

  return (
    <button 
      onClick={handleVerify} 
      disabled={loading}
      style={{
        padding: '8px 16px',
        background: '#10B981',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1
      }}
    >
      {loading ? 'Memproses...' : 'Verifikasi Pembayaran'}
    </button>
  )
}
