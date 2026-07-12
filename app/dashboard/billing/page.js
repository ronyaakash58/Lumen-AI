'use client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
const PLANS=[
  {name:'Free',price:'$0',credits:'100 / month',features:['Basic prompts','Watermark','Community support']},
  {name:'Studio',price:'$29',credits:'2,000 / month',popular:true,features:['No watermark','Bulk generator','Prompt library','Priority queue']},
  {name:'Enterprise',price:'Contact',credits:'Unlimited',features:['SSO','Custom providers','SLA','Dedicated support']},
]
export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-semibold tracking-tight">Billing</h1><p className="text-muted-foreground mt-1">Subscription plans, credits, invoices.</p></div>
      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map(p => (
          <Card key={p.name} className={`p-6 rounded-2xl glass relative ${p.popular?'ring-1 ring-primary glow-primary':''}`}>
            {p.popular && <div className="absolute -top-2 right-4 text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full">POPULAR</div>}
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{p.name}</div>
            <div className="text-4xl font-semibold mt-2">{p.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
            <div className="text-xs text-muted-foreground mt-1">{p.credits}</div>
            <ul className="mt-5 space-y-2">{p.features.map(f=><li key={f} className="text-sm flex items-center gap-2"><Check className="h-4 w-4 text-primary"/>{f}</li>)}</ul>
            <Button className="mt-6 w-full rounded-full" variant={p.popular?'default':'secondary'}>Choose {p.name}</Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
