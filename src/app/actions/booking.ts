'use server'

import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

/**
 * Helper untuk menyimpan file ke public/uploads/...
 */
async function saveFile(file: File | null, folder: string): Promise<string | null> {
  if (!file || file.size === 0) return null

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Generate unique filename
  const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9)
  const ext = path.extname(file.name) || '.jpg'
  const filename = `${uniquePrefix}${ext}`
  
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
  
  // Pastikan folder ada (hanya untuk pengaman)
  try {
    await fs.access(uploadDir)
  } catch {
    await fs.mkdir(uploadDir, { recursive: true })
  }

  const filepath = path.join(uploadDir, filename)
  await fs.writeFile(filepath, buffer)

  return `/uploads/${folder}/${filename}`
}

export async function createBooking(formData: FormData) {
  try {
    // 1. Verifikasi User (Hanya yang login bisa booking)
    const cookieStore = await cookies()
    const token = cookieStore.get('hikepass-token')?.value
    if (!token) return { error: 'Anda harus login terlebih dahulu' }

    const session = await verifyToken(token)
    if (!session) return { error: 'Sesi tidak valid' }

    // 2. Ambil data dasar dari FormData
    const mountainId = parseInt(formData.get('mountainId') as string)
    const trailId = parseInt(formData.get('trailId') as string)
    const hikingDateStr = formData.get('hikingDate') as string
    const totalMembers = parseInt(formData.get('totalMembers') as string)
    const totalPrice = parseInt(formData.get('totalPrice') as string)

    if (isNaN(mountainId) || isNaN(trailId) || !hikingDateStr || isNaN(totalMembers) || isNaN(totalPrice)) {
      return { error: 'Data pemesanan tidak lengkap' }
    }

    const hikingDate = new Date(hikingDateStr)

    // 3. Simpan file bukti transfer
    const paymentFile = formData.get('paymentProof') as File | null
    if (!paymentFile) return { error: 'Bukti transfer wajib diunggah' }
    
    const paymentProofUrl = await saveFile(paymentFile, 'payment')
    if (!paymentProofUrl) return { error: 'Gagal menyimpan bukti transfer' }

    // 4. Proses data anggota kelompok (member)
    const membersData: {
      name: string
      nik: string
      phone: string
      isLeader: boolean
      ktpImageUrl: string | null
      healthCertUrl: string | null
    }[] = []
    
    // Asumsi maksimal anggota tidak lebih dari 50, kita loop berdasarkan totalMembers
    for (let i = 0; i < totalMembers; i++) {
      const name = formData.get(`members[${i}].name`) as string
      const nik = formData.get(`members[${i}].nik`) as string
      const phone = formData.get(`members[${i}].phone`) as string
      const isLeader = formData.get(`members[${i}].isLeader`) === 'true'

      const ktpFile = formData.get(`members[${i}].ktp`) as File | null
      const sehatFile = formData.get(`members[${i}].sehat`) as File | null

      if (!name || !nik || !phone) {
        return { error: `Data anggota ke-${i + 1} tidak lengkap` }
      }

      // Save member files
      const ktpImageUrl = await saveFile(ktpFile, 'ktp')
      const healthCertUrl = await saveFile(sehatFile, 'sehat')

      membersData.push({
        name,
        nik,
        phone,
        isLeader,
        ktpImageUrl,
        healthCertUrl
      })
    }

    // 5. Generate Booking Code & QR Token
    const bookingCode = `HP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`
    const qrToken = crypto.randomUUID()

    // 6. Simpan ke Database menggunakan Transaksi
    const booking = await db.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          bookingCode,
          userId: session.userId,
          mountainId,
          trailId,
          hikingDate,
          totalMembers,
          totalPrice,
          paymentProofUrl,
          qrToken,
          status: 'WAITING_CONFIRM', // Sesuai MVP, tunggu konfirmasi admin
          members: {
            create: membersData
          }
        }
      })
      return newBooking
    })

    return { success: true, bookingId: booking.id, bookingCode }

  } catch (error: any) {
    console.error('Booking Action Error:', error)
    return { error: error.message || 'Terjadi kesalahan internal server' }
  }
}
