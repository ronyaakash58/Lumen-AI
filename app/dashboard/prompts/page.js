'use client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, Copy, Edit3, Trash2 } from 'lucide-react'
import { useState } from 'react'

const CATS = ['All','Fashion','Lifestyle','Creative','Luxury','Ecommerce']
const SEED = [
  { id:1, cat:'Fashion', title:'Editorial cover', prompt:'A high-fashion editorial cover, cinematic lighting, magazine quality.' },
  { id:2, cat:'Ecommerce', title:'Clean packshot', prompt:'Clean ecommerce packshot on white background, soft shadow.' },
  { id:3, cat:'Luxury', title:'Golden hour', prompt:'Luxury lookbook, golden hour, film grain, dreamy pastel palette.' },
  { id:4, cat:'Lifestyle', title:'Urban candid', prompt:'Candid streetwear shot in Tokyo, neon lights, rain-soaked pavement.' },
  { id:5, cat:'Creative', title:'Surreal editorial', prompt:'Surreal fashion editorial, dreamlike lighting, floating fabrics.' },
]
export default function PromptsPage() {
  const [cat, setCat] = useState('All')
  const [q, setQ] = useState('')
  const items = SEED.filter(s => (cat==='All'||s.cat===cat) && (!q || s.title.toLowerCase().includes(q.toLowerCase())))
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-3xl font-semibold tracking-tight">Prompt Library</h1><p className="text-muted-foreground mt-1">Curated prompts for every fashion scenario.</p></div>
        <Button className="rounded-full"><Plus className="mr-2 h-4 w-4"/>New prompt</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {CATS.map(c => (
          <button key={c} onClick={()=>setCat(c)} className={`px-3 py-1.5 rounded-full text-xs ${cat===c?'bg-primary text-primary-foreground':'bg-secondary text-muted-foreground hover:text-foreground'}`}>{c}</button>
        ))}
        <div className="relative ml-auto w-full md:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input value={q} onChange={(e)=>setQ(e.target.value)} className="pl-9 rounded-full" placeholder="Search prompts…"/></div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(p => (
          <Card key={p.id} className="p-5 rounded-2xl glass"><div className="text-[10px] uppercase tracking-widest text-primary mb-1">{p.cat}</div><div className="font-medium">{p.title}</div><p className="text-sm text-muted-foreground mt-2 line-clamp-3">{p.prompt}</p><div className="flex gap-1 mt-4"><Button size="sm" variant="secondary" className="rounded-full h-8"><Copy className="h-3.5 w-3.5 mr-1"/>Duplicate</Button><Button size="icon" variant="ghost" className="h-8 w-8"><Edit3 className="h-3.5 w-3.5"/></Button><Button size="icon" variant="ghost" className="h-8 w-8"><Trash2 className="h-3.5 w-3.5"/></Button></div></Card>
        ))}
      </div>
    </div>
  )
}
