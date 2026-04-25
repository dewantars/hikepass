import Navbar from '@/components/user/Navbar'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - 64px)' }}>
        {children}
      </div>
    </>
  )
}
