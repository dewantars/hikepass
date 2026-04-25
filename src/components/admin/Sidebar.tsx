'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TicketCheck, ScanLine, Mountain, LogOut } from 'lucide-react'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const pathname = usePathname()

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/pesanan', label: 'Pesanan', icon: TicketCheck },
    { href: '/admin/scanner', label: 'QR Scanner', icon: ScanLine },
    { href: '/admin/gunung', label: 'Kelola Gunung', icon: Mountain },
  ]

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/admin-masuk'
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>🏔 HikePass Admin</div>
        <div className={styles.subtitle}>Basecamp Portal</div>
      </div>

      <nav className={styles.nav}>
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/admin')
          
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              <Icon size={20} className={styles.icon} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className={styles.footer}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={20} className={styles.icon} />
          Keluar
        </button>
      </div>
    </aside>
  )
}
