import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { db } = await import('@/lib/db')
    const count = await db.mountain.count()
    return NextResponse.json({ connected: true, mountainCount: count })
  } catch (err) {
    return NextResponse.json({ connected: false, error: String(err) }, { status: 500 })
  }
}
