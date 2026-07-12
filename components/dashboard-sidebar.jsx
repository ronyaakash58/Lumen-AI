'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wand2, Layers, BookMarked, ImageIcon, History, Cpu, CreditCard, Settings, LogOut, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/generate', label: 'Generate Image', icon: Wand2 },
  { href: '/dashboard/bulk', label: 'Bulk Generator', icon: Layers },
  { href: '/dashboard/prompts', label: 'Prompt Library', icon: BookMarked },
  { href: '/dashboard/gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/dashboard/history', label: 'History', icon: History },
  { href: '/dashboard/api', label: 'API', icon: Cpu },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const path = usePathname()
  const user = useAuthStore((s) => s.user)
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }
  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r border-sidebar-border bg-sidebar z-30">
      <div className="px-5 py-5 flex items-center gap-2 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-fuchsia-500 grid place-items-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-sm">Lumen AI</div>
          <div className="text-[10px] text-muted-foreground">Fashion Studio</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV.map((n) => {
          const active = path === n.href || (n.href !== '/dashboard' && path?.startsWith(n.href))
          return (
            <Link key={n.href} href={n.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'}`}>
              <n.icon className="h-4 w-4" />
              <span>{n.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user?.picture} alt={user?.name} />
          <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{user?.name || 'User'}</div>
          <div className="text-[11px] text-muted-foreground truncate">{user?.email}</div>
        </div>
        <Button size="icon" variant="ghost" onClick={logout} title="Log out"><LogOut className="h-4 w-4" /></Button>
      </div>
    </aside>
  )
}
