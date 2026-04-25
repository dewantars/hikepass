import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import Sidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('hikepass-token')?.value

  if (!token) {
    redirect('/admin-masuk')
  }

  const session = await verifyToken(token)
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin-masuk')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <Sidebar />
      <div 
        style={{ 
          flex: 1, 
          marginLeft: '260px', /* Desktop sidebar width */
          padding: '2rem',
          maxWidth: '100vw'
        }}
        className="admin-main-content"
      >
        {children}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .admin-main-content {
            margin-left: 0 !important;
            padding-bottom: 90px !important; /* Space for bottom nav */
          }
        }
      `}} />
    </div>
  )
}
