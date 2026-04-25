import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mountainId = parseInt(id)
    if (isNaN(mountainId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const monthStr = searchParams.get('month')
    const yearStr = searchParams.get('year')

    if (!monthStr || !yearStr) {
      return NextResponse.json({ error: 'Missing month or year parameter' }, { status: 400 })
    }

    const month = parseInt(monthStr)
    const year = parseInt(yearStr)

    // Dapatkan kuota harian gunung
    const mountain = await db.mountain.findUnique({
      where: { id: mountainId },
      select: { dailyQuota: true },
    })

    if (!mountain) {
      return NextResponse.json({ error: 'Gunung tidak ditemukan' }, { status: 404 })
    }

    const dailyQuota = mountain.dailyQuota

    // Tanggal mulai dan akhir bulan
    // Perhatikan index bulan di JS mulai dari 0 (0 = Jan, 11 = Dec)
    const startDate = new Date(Date.UTC(year, month - 1, 1))
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59))

    // Ambil semua booking di bulan ini yang statusnya bukan CANCELLED atau EXPIRED
    const bookings = await db.booking.findMany({
      where: {
        mountainId,
        hikingDate: { gte: startDate, lte: endDate },
        status: { notIn: ['CANCELLED', 'EXPIRED'] },
      },
      select: { hikingDate: true, totalMembers: true },
    })

    // Hitung total member per tanggal
    const bookedPerDate: Record<string, number> = {}
    bookings.forEach((b) => {
      const dateStr = b.hikingDate.toISOString().split('T')[0]
      bookedPerDate[dateStr] = (bookedPerDate[dateStr] || 0) + b.totalMembers
    })

    // Ambil closure yang beririsan dengan bulan ini
    const closures = await db.closure.findMany({
      where: {
        mountainId,
        isActive: true,
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    })

    // Generate response untuk setiap hari dalam bulan tsb
    const daysInMonth = endDate.getUTCDate()
    const result = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(year, month - 1, day))
      const dateStr = date.toISOString().split('T')[0]
      
      // Cek apakah tanggal ini ditutup
      const isClosed = closures.some(
        (c) => date >= c.startDate && date <= c.endDate
      )

      const booked = bookedPerDate[dateStr] || 0
      const remainingQuota = isClosed ? 0 : Math.max(0, dailyQuota - booked)

      result.push({
        date: dateStr,
        remainingQuota,
        isClosed,
      })
    }

    return NextResponse.json({
      mountainId,
      year,
      month,
      dailyQuota,
      data: result,
    })

  } catch (error) {
    console.error('Quota API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
