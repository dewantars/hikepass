import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json()

    if (!phone || !password) {
      return NextResponse.json({ error: 'Nomor telepon dan kata sandi wajib diisi' }, { status: 400 })
    }

    // Bersihkan format nomor HP (jika mulai dari 0, ubah ke 62)
    let formattedPhone = phone.replace(/\D/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1)
    }

    // Cari admin di database
    const user = await db.user.findUnique({
      where: { phone: formattedPhone }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Kredensial salah atau Anda bukan admin' }, { status: 401 })
    }

    if (!user.password) {
      return NextResponse.json({ error: 'Akun admin belum dikonfigurasi dengan kata sandi' }, { status: 401 })
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Kata sandi salah' }, { status: 401 })
    }

    // Generate JWT Token
    const token = await createToken({ userId: user.id, role: user.role, phone: user.phone })

    // Set HTTP-only Cookie
    const response = NextResponse.json({ success: true, user })
    
    response.cookies.set({
      name: 'hikepass-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 hari
    })

    return response
  } catch (error) {
    console.error('Admin Login Error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 })
  }
}
