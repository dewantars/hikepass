'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './admin-masuk.module.css'

export default function AdminMasukPage() {
  const router = useRouter()

  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [devCode, setDevCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      if (data.devCode) setDevCode(data.devCode)
      setStep('otp')
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'OTP tidak valid'); return }

      if (data.user?.role !== 'ADMIN') {
        setError('Akun ini bukan akun admin')
        await fetch('/api/auth/logout', { method: 'POST' })
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} aria-hidden="true" />

      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span>🏔</span>
          <span className={styles.logoText}>HikePass</span>
          <span className={styles.adminBadge}>Admin</span>
        </Link>

        <div className={styles.card}>
          <h1 className={styles.title}>Masuk sebagai Admin</h1>
          <p className={styles.subtitle}>Khusus petugas basecamp & pengelola gunung</p>

          {devCode && (
            <div className={styles.devBanner}>
              🛠 Dev OTP: <strong className={styles.devCode}>{devCode}</strong>
            </div>
          )}

          {error && (
            <div className={styles.errorBox} role="alert">⚠️ {error}</div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className={styles.form} noValidate>
              <div className="form-group">
                <label htmlFor="admin-phone" className="form-label">Nomor WhatsApp Admin</label>
                <div className={styles.phoneWrap}>
                  <span className={styles.prefix}>🇮🇩 +62</span>
                  <input
                    id="admin-phone"
                    type="tel"
                    className={`form-control ${styles.phoneField}`}
                    placeholder="8123456789"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    inputMode="numeric"
                    autoFocus
                  />
                </div>
              </div>
              <button
                id="btn-admin-send-otp"
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={loading || phone.length < 9}
              >
                {loading ? 'Mengirim...' : 'Kirim OTP →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className={styles.form} noValidate>
              <div className="form-group">
                <label htmlFor="admin-otp" className="form-label">Kode OTP (6 digit)</label>
                <input
                  id="admin-otp"
                  type="text"
                  className={`form-control ${styles.otpInput}`}
                  placeholder="123456"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                />
              </div>
              <button
                id="btn-admin-verify"
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Memverifikasi...' : 'Masuk sebagai Admin'}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-full"
                onClick={() => { setStep('phone'); setOtp(''); setDevCode(null); setError('') }}
              >
                ← Ganti nomor
              </button>
            </form>
          )}
        </div>

        <Link href="/" className={styles.backLink}>← Kembali ke Beranda</Link>
      </div>
    </div>
  )
}
