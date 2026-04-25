'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './admin-masuk.module.css'

export default function AdminMasuk() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan')
      }

      // Login sukses, redirect ke dashboard admin
      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.adminBadge}>Admin Portal</div>
          <h1 className={styles.title}>Masuk ke Basecamp</h1>
          <p className={styles.subtitle}>Masukkan kredensial pengelola gunung Anda.</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          <div className={styles.inputGroup}>
            <label htmlFor="phone">Nomor WhatsApp</label>
            <div className={styles.phoneInput}>
              <span className={styles.countryCode}>+62</span>
              <input
                type="tel"
                id="phone"
                placeholder="81234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Kata Sandi</label>
            <input
              type="password"
              id="password"
              placeholder="Masukkan kata sandi admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className={styles.passwordInput}
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={loading || !phone || !password}
          >
            {loading ? 'Memproses...' : 'Masuk Dashboard'}
          </button>
        </form>

        <div className={styles.footer}>
          Bukan admin? <Link href="/masuk">Kembali ke Halaman Pendaki</Link>
        </div>
      </div>
    </div>
  )
}
