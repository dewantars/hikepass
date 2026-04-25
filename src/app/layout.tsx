import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'HikePass — Pesan Tiket Pendakian Online',
    template: '%s | HikePass',
  },
  description: 'Pesan tiket pendakian gunung secara online. Cek kuota real-time, booking kelompok, dan dapatkan e-ticket dengan QR Code.',
  keywords: ['tiket pendakian', 'pendakian gunung', 'booking hiking', 'kuota pendakian'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
