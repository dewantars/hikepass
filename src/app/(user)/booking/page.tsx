import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import BookingForm from './BookingForm'

interface BookingPageProps {
  searchParams: Promise<{ mountainId?: string }>
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const { mountainId } = await searchParams
  
  if (!mountainId) {
    redirect('/gunung')
  }

  const id = parseInt(mountainId)
  if (isNaN(id)) {
    redirect('/gunung')
  }

  const mountain = await db.mountain.findUnique({
    where: { id },
    include: {
      trails: {
        where: { isOpen: true }
      }
    }
  })

  if (!mountain) {
    redirect('/gunung')
  }

  if (mountain.trails.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Mohon Maaf</h2>
        <p>Saat ini tidak ada jalur pendakian yang dibuka untuk {mountain.name}.</p>
      </div>
    )
  }

  return (
    <main style={{ background: 'var(--color-background)', minHeight: '100vh', padding: 'var(--space-8) 0' }}>
      <div className="container">
        <BookingForm mountain={mountain} trails={mountain.trails} />
      </div>
    </main>
  )
}
