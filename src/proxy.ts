import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Routes yang butuh login user biasa
const USER_PROTECTED = ['/booking', '/pembayaran', '/tiket', '/riwayat']

// Routes yang butuh admin
const ADMIN_PROTECTED = ['/admin']

// Routes yang tidak boleh diakses kalau sudah login
const AUTH_ROUTES = ['/masuk', '/daftar', '/admin-masuk']

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('hikepass-token')?.value

  const session = token ? await verifyToken(token) : null

  const isUserProtected = USER_PROTECTED.some(p => pathname.startsWith(p))
  const isAdminProtected = ADMIN_PROTECTED.some(p => pathname.startsWith(p))
  const isAuthRoute = AUTH_ROUTES.some(p => pathname.startsWith(p))

  // Redirect ke login jika belum login dan akses halaman protected
  if (isUserProtected && !session) {
    return NextResponse.redirect(new URL('/masuk', request.url))
  }

  // Redirect ke admin login jika bukan admin
  if (isAdminProtected && (!session || session.role !== 'ADMIN')) {
    return NextResponse.redirect(new URL('/admin-masuk', request.url))
  }

  // Redirect ke home jika sudah login dan akses auth routes
  if (isAuthRoute && session) {
    if (session.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/booking/:path*',
    '/pembayaran/:path*',
    '/tiket/:path*',
    '/riwayat',
    '/admin/:path*',
    '/masuk',
    '/daftar',
    '/admin-masuk',
  ],
}
