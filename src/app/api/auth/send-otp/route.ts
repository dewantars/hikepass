import { db } from '@/lib/db'
import { generateOTPCode, sendOTP } from '@/lib/fonnte'
import { normalizePhone } from '@/lib/utils'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Nomor HP wajib diisi' }, { status: 400 })
    }

    const normalizedPhone = normalizePhone(phone)

    // Validasi format nomor
    if (!/^62\d{9,12}$/.test(normalizedPhone)) {
      return NextResponse.json({ error: 'Format nomor HP tidak valid' }, { status: 400 })
    }

    const code = generateOTPCode()
    const expiresAt = new Date(Date.now() + Number(process.env.OTP_EXPIRY_MINUTES || 5) * 60 * 1000)

    // Hapus OTP lama yang belum terverifikasi
    await db.otpSession.deleteMany({
      where: { phone: normalizedPhone, verified: false },
    })

    // Simpan OTP baru
    await db.otpSession.create({
      data: { phone: normalizedPhone, code, expiresAt },
    })

    // Kirim OTP via Fonnte (atau mock ke console)
    const result = await sendOTP(normalizedPhone, code)

    if (!result.success) {
      return NextResponse.json({ error: 'Gagal mengirim OTP, coba lagi' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: result.mock
        ? `[DEV] OTP: ${code} (lihat console server)`
        : 'OTP terkirim via WhatsApp',
      mock: result.mock ?? false,
      // Kembalikan code hanya di development mode mock
      ...(result.mock && process.env.NODE_ENV === 'development' ? { devCode: code } : {}),
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
