'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import Sidebar from '@/components/dashboard-sidebar'
import { Loader2 } from 'lucide-react'

// Pages that render as full-bleed "workspace" mode (no inner max-w container).
const WORKSPACE_ROUTES = ['/dashboard/generate']

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const isWorkspace = WORKSPACE_ROUTES.some((r) => pathname === r || pathname?.startsWith(r + '/'))

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading studio…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={isWorkspace ? 'md:pl-64 h-screen overflow-hidden' : 'md:pl-64'}>
        {isWorkspace ? (
          children
        ) : (
          <div className="p-6 md:p-10 max-w-7xl mx-auto">{children}</div>
        )}
      </main>
    </div>
  )
}
