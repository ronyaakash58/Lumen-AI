'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: false },
  },
})

function AuthBootstrap() {
  const setUser = useAuthStore((s) => s.setUser)
  useEffect(() => {
    fetch('/api/auth/me').then(async (r) => {
      if (r.ok) {
        const d = await r.json()
        setUser(d.user || null)
      } else setUser(null)
    }).catch(() => setUser(null))
  }, [setUser])
  return null
}

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      {children}
      <Toaster theme="dark" position="top-right" richColors />
    </QueryClientProvider>
  )
}
