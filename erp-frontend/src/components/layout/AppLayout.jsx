import { Sidebar } from '@/components/layout/Sidebar'

export function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
