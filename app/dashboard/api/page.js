'use client'
import { Card } from '@/components/ui/card'
import { Cpu, Key, Zap } from 'lucide-react'
import { availableProviders } from '@/lib/providers'
export default function ApiPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold tracking-tight">API</h1><p className="text-muted-foreground mt-1">Programmatic access & AI provider manager.</p></div>
      <Card className="p-6 rounded-2xl glass">
        <div className="flex items-center gap-2 mb-4"><Key className="h-4 w-4"/><h3 className="font-medium">Your API Key</h3></div>
        <div className="font-mono text-sm bg-secondary rounded-lg p-3">sk-lumen-••••••••••••••••••••••••••••••••</div>
        <p className="text-xs text-muted-foreground mt-2">Programmatic API coming soon. Ready for webhook & queue integration.</p>
      </Card>
      <Card className="p-6 rounded-2xl glass">
        <div className="flex items-center gap-2 mb-4"><Cpu className="h-4 w-4"/><h3 className="font-medium">AI Providers</h3></div>
        <div className="grid md:grid-cols-2 gap-3">
          {availableProviders.map(p => (
            <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-border">
              <div><div className="font-medium text-sm">{p.label}</div><div className="text-xs text-muted-foreground">{p.id}</div></div>
              {p.enabled ? <span className="text-xs text-emerald-400 inline-flex items-center gap-1"><Zap className="h-3 w-3"/>Active</span> : <span className="text-xs text-muted-foreground">Coming soon</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
