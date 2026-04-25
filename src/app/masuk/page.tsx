'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './masuk.module.css'

type Step = 'phone' | 'otp' | 'name'

export default function MasukPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [devCode, setDevCode] = useState<string | null>(null)
  const [isNewUser, setIsNewUser] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: kirim OTP
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

      if (!res.ok) {
        setError(data.error || 'Gagal mengirim OTP')
        return
      }

      if (data.devCode) setDevCode(data.devCode)
      setStep('otp')
    } catch {
      setError('Terjadi kesalahan, coba lagi')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: verifikasi OTP
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

      if (data.needName) {
        setIsNewUser(true)
        setStep('name')
        return
      }

      if (!res.ok) {
        setError(data.error || 'OTP tidak valid')
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('Terjadi kesalahan, coba lagi')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: simpan nama (user baru)
  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp, name }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan data')
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('Terjadi kesalahan, coba lagi')
    } finally {
      setLoading(false)
    }
  }

  const stepLabels = ['Nomor HP', 'Kode OTP', 'Profil']
  const stepIndex = step === 'phone' ? 0 : step === 'otp' ? 1 : 2

  return (
    <div className={styles.page}>
      {/* Background */}
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgGradient} />
      </div>

      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🏔</span>
          <span className={styles.logoText}>HikePass</span>
        </Link>

        <div className={styles.card}>
          {/* Header */}
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>
              {step === 'name' ? 'Lengkapi Profil' : 'Masuk atau Daftar'}
            </h1>
            <p className={styles.subtitle}>
              {step === 'phone' && 'Masukkan nomor WhatsApp kamu'}
              {step === 'otp' && `Kode dikirim ke ${phone}`}
              {step === 'name' && 'Selamat datang! Lengkapi nama kamu'}
            </p>
          </div>

          {/* Step indicator */}
          <div className={styles.stepper} aria-label="Langkah pendaftaran">
            {stepLabels.map((label, i) => (
              <div key={label} className={styles.stepItem}>
                <div className={`${styles.stepDot} ${i < stepIndex ? styles.stepDone : i === stepIndex ? styles.stepActive : ''}`}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span className={`${styles.stepLabel} ${i === stepIndex ? styles.stepLabelActive : ''}`}>
                  {label}
                </span>
                {i < stepLabels.length - 1 && (
                  <div className={`${styles.stepLine} ${i < stepIndex ? styles.stepLineDone : ''}`} />
                )}
              </div>
            ))}
          </div>

          {/* Dev mode banner */}
          {devCode && (
            <div className={styles.devBanner} role="alert">
              <span>🛠 Dev Mode — OTP:</span>
              <strong className={styles.devCode}>{devCode}</strong>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className={styles.errorBox} role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Step 1: Input phone */}
          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className={styles.form} noValidate>
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Nomor WhatsApp <span className="required">*</span>
                </label>
                <div className={styles.phoneInput}>
                  <span className={styles.phonePrefix}>🇮🇩 +62</span>
                  <input
                    id="phone"
                    type="tel"
                    className={`form-control ${styles.phoneField}`}
                    placeholder="8123456789"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    autoFocus
                    inputMode="numeric"
                  />
                </div>
                <p className="form-hint">Tanpa angka 0 di depan. Contoh: 81234567890</p>
              </div>

              <button
                id="btn-send-otp"
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={loading || phone.length < 9}
              >
                {loading ? (
                  <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Mengirim...</>
                ) : (
                  'Kirim Kode OTP →'
                )}
              </button>
            </form>
          )}

          {/* Step 2: Input OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className={styles.form} noValidate>
              <div className="form-group">
                <label htmlFor="otp" className="form-label">
                  Kode OTP (6 digit) <span className="required">*</span>
                </label>
                <input
                  id="otp"
                  type="text"
                  className={`form-control ${styles.otpInput}`}
                  placeholder="123456"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                />
                <p className="form-hint">OTP berlaku selama 5 menit</p>
              </div>

              <button
                id="btn-verify-otp"
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Memverifikasi...</>
                ) : (
                  'Verifikasi Kode'
                )}
              </button>

              <button
                type="button"
                className="btn btn-ghost btn-full"
                style={{ marginTop: 8 }}
                onClick={() => { setStep('phone'); setOtp(''); setDevCode(null); setError('') }}
              >
                ← Ganti nomor HP
              </button>
            </form>
          )}

          {/* Step 3: Input nama (user baru) */}
          {step === 'name' && (
            <form onSubmit={handleSaveName} className={styles.form} noValidate>
              <div className={styles.newUserBadge}>🎉 Akun baru berhasil dibuat!</div>

              <div className="form-group">
                <label htmlFor="fullname" className="form-label">
                  Nama Lengkap <span className="required">*</span>
                </label>
                <input
                  id="fullname"
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Budi Santoso"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoFocus
                  minLength={2}
                  maxLength={100}
                />
                <p className="form-hint">Nama ini akan muncul di e-ticket pendakian</p>
              </div>

              <button
                id="btn-save-name"
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={loading || name.trim().length < 2}
              >
                {loading ? (
                  <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Menyimpan...</>
                ) : (
                  'Simpan & Masuk 🏔'
                )}
              </button>
            </form>
          )}

          <p className={styles.footerNote}>
            Dengan masuk, kamu menyetujui{' '}
            <Link href="/syarat">Syarat & Ketentuan</Link> HikePass.
          </p>
        </div>
      </div>
    </div>
  )
}
