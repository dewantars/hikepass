'use server'

import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export async function verifyPayment(bookingId: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('hikepass-token')?.value
    if (!token) return { error: 'Tidak ada akses' }

    const session = await verifyToken(token)
    if (!session || session.role !== 'ADMIN') return { error: 'Hanya admin yang dapat memverifikasi' }

    // Dapatkan data admin
    const admin = await db.user.findUnique({
      where: { id: session.userId },
      select: { mountainId: true }
    })

    if (!admin?.mountainId) return { error: 'Admin belum di-assign ke gunung' }

    const bookingIdInt = parseInt(bookingId)

    // Verifikasi kepemilikan booking
    const booking = await db.booking.findUnique({
      where: { id: bookingIdInt }
    })

    if (!booking) return { error: 'Booking tidak ditemukan' }
    if (booking.mountainId !== admin.mountainId) return { error: 'Bukan booking untuk gunung Anda' }
    if (booking.status !== 'WAITING_CONFIRM') return { error: 'Status booking tidak valid untuk diverifikasi' }

    // Update status
    await db.booking.update({
      where: { id: bookingIdInt },
      data: { status: 'PAID' }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Verify Payment Error:', error)
    return { error: 'Terjadi kesalahan internal' }
  }
}

export async function scanTicket(qrToken: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('hikepass-token')?.value
    if (!token) return { error: 'Tidak ada akses' }

    const session = await verifyToken(token)
    if (!session || session.role !== 'ADMIN') return { error: 'Akses ditolak' }

    const admin = await db.user.findUnique({
      where: { id: session.userId },
      select: { mountainId: true }
    })

    if (!admin?.mountainId) return { error: 'Admin belum di-assign ke gunung' }

    // Cari booking berdasarkan token QR
    const booking = await db.booking.findFirst({
      where: { qrToken },
      include: {
        members: true,
        trail: true
      }
    })

    if (!booking) return { error: 'Tiket tidak ditemukan / QR tidak valid' }
    if (booking.mountainId !== admin.mountainId) return { error: 'Tiket ini bukan untuk gunung Anda' }

    // Cek status
    if (booking.status === 'WAITING_CONFIRM') return { error: 'Tiket belum diverifikasi pembayarannya' }
    if (booking.status === 'CANCELLED') return { error: 'Tiket telah dibatalkan' }
    if (booking.status === 'EXPIRED') return { error: 'Tiket telah kedaluwarsa' }
    
    // Jika masih PAID -> Bisa Check-in
    // Jika CHECKED_IN -> Bisa Check-out
    return { success: true, booking }
  } catch (error: any) {
    console.error('Scan Ticket Error:', error)
    return { error: 'Terjadi kesalahan internal' }
  }
}

export async function updateTicketStatus(bookingId: string, newStatus: 'CHECKED_IN' | 'COMPLETED') {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('hikepass-token')?.value
    if (!token) return { error: 'Tidak ada akses' }

    const session = await verifyToken(token)
    if (!session || session.role !== 'ADMIN') return { error: 'Hanya admin yang dapat mengubah status' }

    const bookingIdInt = parseInt(bookingId)

    await db.booking.update({
      where: { id: bookingIdInt },
      data: { status: newStatus }
    })

    return { success: true }
  } catch (error: any) {
    return { error: 'Gagal memperbarui status tiket' }
  }
}

export async function toggleTrailStatus(trailId: number, currentStatus: boolean) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('hikepass-token')?.value
    if (!token) return { error: 'Tidak ada akses' }

    const session = await verifyToken(token)
    if (!session || session.role !== 'ADMIN') return { error: 'Hanya admin yang berhak' }

    const admin = await db.user.findUnique({
      where: { id: session.userId },
      select: { mountainId: true }
    })

    const trail = await db.trail.findUnique({ where: { id: trailId } })
    if (!trail || trail.mountainId !== admin?.mountainId) {
      return { error: 'Jalur tidak ditemukan atau Anda tidak berwenang' }
    }

    await db.trail.update({
      where: { id: trailId },
      data: { isOpen: !currentStatus }
    })

    return { success: true }
  } catch (error: any) {
    return { error: 'Gagal mengubah status jalur' }
  }
}
