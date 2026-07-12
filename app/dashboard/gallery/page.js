'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Download, Heart, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function GalleryPage() {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  useEffect(()=>{
    fetch('/api/generations?limit=100').then(r=>r.json()).then(d=>setItems(d.items||[]))
  },[])
  const filtered = items.filter(i => !q || (i.prompt||'').toLowerCase().includes(q.toLowerCase()))
  const del = async (id) => {
    await fetch(`/api/generations/${id}`, { method: 'DELETE' })
    setItems(items.filter(i=>i.id!==id))
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Gallery</h1>
          <p className="text-muted-foreground mt-1">All your generated images in one place.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <Input value={q} onChange={(e)=>setQ(e.target.value)} className="pl-9 rounded-full" placeholder="Search prompts…" />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="aspect-[16/6] rounded-2xl border border-dashed border-border grid place-items-center text-muted-foreground text-sm">
          No images yet. Head to Generate Image to create your first shot.
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filtered.map((it) => (
            <motion.div key={it.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="break-inside-avoid group relative rounded-2xl overflow-hidden glass">
              <img src={it.image} alt="" className="w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end opacity-0 group-hover:opacity-100 transition">
                <div className="text-[11px] text-white/80 line-clamp-2 max-w-[70%]">{it.prompt}</div>
                <div className="flex gap-1">
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={()=>{const a=document.createElement('a');a.href=it.image;a.download=`lumen-${it.id}.png`;a.click()}}><Download className="h-3.5 w-3.5"/></Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full"><Heart className="h-3.5 w-3.5"/></Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={()=>del(it.id)}><Trash2 className="h-3.5 w-3.5"/></Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
