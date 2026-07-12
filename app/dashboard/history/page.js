'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'

export default function HistoryPage() {
  const [items, setItems] = useState([])
  useEffect(()=>{
    fetch('/api/generations?limit=100').then(r=>r.json()).then(d=>setItems(d.items||[]))
  },[])
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">History</h1>
        <p className="text-muted-foreground mt-1">Timeline of your generation jobs.</p>
      </div>
      {items.length === 0 ? (
        <div className="aspect-[16/6] rounded-2xl border border-dashed border-border grid place-items-center text-muted-foreground text-sm">No jobs yet.</div>
      ) : (
        <div className="relative pl-8">
          <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
          {items.map((it, idx) => (
            <div key={it.id} className="relative mb-6">
              <div className="absolute -left-6 top-2 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
              <div className="glass rounded-2xl p-4 flex gap-4">
                <img src={it.image} alt="" className="h-20 w-20 rounded-xl object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5"/>Completed</span>
                    <span>·</span>
                    <span>{new Date(it.created_at).toLocaleString()}</span>
                    <span>·</span>
                    <span>{it.meta?.style || '—'}</span>
                  </div>
                  <div className="mt-1 text-sm line-clamp-2">{it.prompt}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
