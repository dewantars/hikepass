import { db } from '@/lib/db'
import { createToken, getTokenCookieOptions } from '@/lib/auth'
import { normalizePhone } from '@/lib/utils'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { phone, code, name } = await request.json()

    if (!phone || !code) {
      return NextResponse.json({ error: 'Nomor HP dan kode OTP wajib diisi' }, { status: 400 })
    }

    const normalizedPhone = normalizePhone(phone)

    // Cari OTP yang valid
    const otpSession = await db.otpSession.findFirst({
      where: {
        phone: normalizedPhone,
        code: code.trim(),
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otpSession) {
      return NextResponse.json({ error: 'Kode OTP tidak valid atau sudah kedaluwarsa' }, { status: 400 })
    }

    // Cari atau buat user
    let user = await db.user.findUnique({ where: { phone: normalizedPhone } })

    if (!user) {
      // User baru — butuh nama
      if (!name || name.trim().length < 2) {
        return NextResponse.json({
          error: 'Nama lengkap wajib diisi (minimal 2 karakter)',
          needName: true,
        }, { status: 400 })
      }
      user = await db.user.create({
        data: { phone: normalizedPhone, name: name.trim() },
      })
    } else if (name && name.trim()) {
      // Update nama jika dikirim
      user = await db.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
      })
    }

    // Tandai OTP sebagai terverifikasi
    await db.otpSession.update({
      where: { id: otpSession.id },
      data: { verified: true },
    })

    // Buat JWT token
    const token = await createToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    })

    // Set cookie
    const cookieStore = await cookies()
    const opts = getTokenCookieOptions()
    cookieStore.set(opts.name, token, opts)

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
