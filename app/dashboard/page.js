'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles, ImageIcon, Zap, FolderKanban, Wand2, Activity } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { motion } from 'framer-motion'

function Stat({ icon: Icon, label, value, hint, gradient }) {
  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="glass rounded-2xl p-5 relative overflow-hidden">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-40 ${gradient}`} />
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-4 w-4" />{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </motion.div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState({ total: 0, today: 0, credits: 100, projects: 0 })
  const [recent, setRecent] = useState([])

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => setStats(d))
    fetch('/api/generations?limit=8').then(r => r.json()).then(d => setRecent(d.items || []))
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground">Welcome back</div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Hi, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
          <p className="text-muted-foreground mt-1">Your creative studio is ready.</p>
        </div>
        <Link href="/dashboard/generate">
          <Button size="lg" className="rounded-full glow-primary"><Wand2 className="mr-2 h-4 w-4" />Quick Generate</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={ImageIcon} label="Total Images" value={stats.total} hint="All-time" gradient="bg-primary" />
        <Stat icon={Zap} label="Today's Images" value={stats.today} hint="Last 24h" gradient="bg-fuchsia-500" />
        <Stat icon={Sparkles} label="Credits" value={stats.credits} hint="Refills daily" gradient="bg-cyan-500" />
        <Stat icon={FolderKanban} label="Projects" value={stats.projects} hint="Workspaces" gradient="bg-emerald-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 rounded-2xl glass">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Recent generations</h3>
            <Link href="/dashboard/gallery" className="text-xs text-primary hover:underline">View gallery →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="aspect-[16/7] rounded-xl border border-dashed border-border grid place-items-center text-muted-foreground text-sm">
              No generations yet. Try <Link className="text-primary ml-1" href="/dashboard/generate">Generate Image</Link>.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {recent.map((g) => (
                <div key={g.id} className="aspect-square rounded-xl overflow-hidden bg-secondary/40 relative group">
                  <img src={g.image} alt={g.prompt?.slice(0,40)} className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 rounded-2xl glass">
          <div className="flex items-center gap-2 mb-4"><Activity className="h-4 w-4" /><h3 className="font-medium">Recent Activity</h3></div>
          <div className="space-y-3">
            {recent.slice(0,5).map((g) => (
              <div key={g.id} className="flex gap-3 text-sm">
                <div className="h-10 w-10 rounded-lg overflow-hidden bg-secondary/40 shrink-0">
                  <img src={g.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="truncate">{g.prompt?.slice(0,60) || 'Generation'}</div>
                  <div className="text-[11px] text-muted-foreground">{new Date(g.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
            {recent.length === 0 && <div className="text-xs text-muted-foreground">Nothing here yet.</div>}
          </div>
        </Card>
      </div>
    </div>
  )
}
