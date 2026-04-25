'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import styles from './Navbar.module.css'

interface User {
  id: number
  name: string | null
  phone: string
  role: string
}

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => data?.user && setUser(data.user))
      .catch(() => {})
  }, [pathname])

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/gunung', label: 'Gunung' },
    { href: '/riwayat', label: 'Booking Saya' },
  ]

  return (
    <header className={styles.header}>
      <nav className={styles.nav} role="navigation" aria-label="Navigasi utama">
        <div className="container">
          <div className={styles.navInner}>
            {/* Logo */}
            <Link href="/" className={styles.logo}>
              <span className={styles.logoIcon} aria-hidden="true">🏔</span>
              <span className={styles.logoText}>HikePass</span>
            </Link>

            {/* Desktop nav links */}
            <ul className={styles.navLinks} role="list">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${styles.navLink} ${pathname.startsWith(link.href) ? styles.navLinkActive : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Right side */}
            <div className={styles.navRight}>
              {user ? (
                <div className={styles.userMenu} ref={menuRef}>
                  <button
                    id="user-menu-btn"
                    className={styles.userBtn}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-expanded={menuOpen}
                    aria-haspopup="true"
                  >
                    <div className={styles.avatar} aria-hidden="true">
                      {(user.name?.[0] || user.phone[2]).toUpperCase()}
                    </div>
                    <span className={styles.userName}>{user.name || user.phone}</span>
                    <span className={`${styles.chevron} ${menuOpen ? styles.chevronUp : ''}`} aria-hidden="true">▾</span>
                  </button>

                  {menuOpen && (
                    <div className={styles.dropdown} role="menu">
                      <div className={styles.dropdownHeader}>
                        <p className={styles.dropdownName}>{user.name || 'Pengguna'}</p>
                        <p className={styles.dropdownPhone}>{user.phone}</p>
                      </div>
                      <hr className={styles.dropdownDivider} />
                      <Link href="/riwayat" className={styles.dropdownItem} role="menuitem" onClick={() => setMenuOpen(false)}>
                        📋 Booking Saya
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link href="/admin" className={styles.dropdownItem} role="menuitem" onClick={() => setMenuOpen(false)}>
                          ⚙️ Panel Admin
                        </Link>
                      )}
                      <hr className={styles.dropdownDivider} />
                      <button className={`${styles.dropdownItem} ${styles.dropdownLogout}`} role="menuitem" onClick={handleLogout}>
                        🚪 Keluar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.authButtons}>
                  <Link href="/masuk" className="btn btn-ghost btn-sm">Masuk</Link>
                  <Link href="/masuk" className="btn btn-primary btn-sm">Daftar</Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                id="mobile-menu-btn"
                className={styles.hamburger}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Buka menu"
                aria-expanded={mobileOpen}
              >
                <span className={`${styles.hamburgerLine} ${mobileOpen ? styles.hamburgerOpen1 : ''}`} />
                <span className={`${styles.hamburgerLine} ${mobileOpen ? styles.hamburgerOpen2 : ''}`} />
                <span className={`${styles.hamburgerLine} ${mobileOpen ? styles.hamburgerOpen3 : ''}`} />
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className={styles.mobileMenu}>
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={styles.mobileLink}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className={styles.mobileAuth}>
                  <Link href="/masuk" className="btn btn-primary btn-full" onClick={() => setMobileOpen(false)}>
                    Masuk / Daftar
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
