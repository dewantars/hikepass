'use client'

import { useState } from 'react'
import { toggleTrailStatus } from '@/app/actions/admin'
import { useRouter } from 'next/navigation'

interface Props {
  trailId: number
  isOpen: boolean
}

export default function TrailActionClient({ trailId, isOpen }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    const actionText = isOpen ? 'TUTUP' : 'BUKA'
    if (!confirm(`Yakin ingin ${actionText} jalur ini?`)) return

    setLoading(true)
    const res = await toggleTrailStatus(trailId, isOpen)
    setLoading(false)

    if (res?.error) {
      alert(res.error)
    } else {
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      style={{
        padding: '8px 16px',
        borderRadius: '6px',
        fontWeight: 600,
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        background: isOpen ? '#FEE2E2' : '#D1FAE5',
        color: isOpen ? '#DC2626' : '#059669',
        opacity: loading ? 0.7 : 1
      }}
    >
      {loading ? 'Proses...' : isOpen ? 'Tutup Jalur' : 'Buka Jalur'}
    </button>
  )
}
