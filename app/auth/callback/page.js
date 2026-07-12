'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace(/^#/, ''))
    const session_id = params.get('session_id')
    if (!session_id) { router.replace('/'); return }
    fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id }),
    }).then(async (r) => {
      if (r.ok) window.location.href = '/dashboard'
      else { const t = await r.text(); console.error('auth failed', t); router.replace('/') }
    })
  }, [router])
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin"/> Signing you in…
      </div>
    </div>
  )
}
