'use client'
import { useAuthStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function SettingsPage() {
  const user = useAuthStore(s=>s.user)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl glass">
          <h3 className="font-medium mb-4">Profile</h3>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16"><AvatarImage src={user?.picture}/><AvatarFallback>{user?.name?.[0]}</AvatarFallback></Avatar>
            <div><div className="font-medium">{user?.name}</div><div className="text-sm text-muted-foreground">{user?.email}</div></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Full name</Label><Input defaultValue={user?.name} className="mt-1"/></div>
            <div><Label className="text-xs">Company</Label><Input placeholder="Your brand" className="mt-1"/></div>
          </div>
        </Card>
        <Card className="p-6 rounded-2xl glass">
          <h3 className="font-medium mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between"><div><div className="text-sm">Dark theme</div><div className="text-xs text-muted-foreground">Always on for this MVP</div></div><Switch defaultChecked disabled/></div>
            <div className="flex items-center justify-between"><div><div className="text-sm">Email notifications</div><div className="text-xs text-muted-foreground">Job completed alerts</div></div><Switch defaultChecked/></div>
            <div className="flex items-center justify-between"><div><div className="text-sm">Public gallery</div><div className="text-xs text-muted-foreground">Share your best shots</div></div><Switch/></div>
          </div>
        </Card>
        <Card className="p-6 rounded-2xl glass lg:col-span-2">
          <h3 className="font-medium mb-4">Provider API Keys</h3>
          <p className="text-xs text-muted-foreground mb-4">Bring your own keys for OpenAI, Gemini, Replicate, Fal.ai. During MVP we use the Emergent Universal Key.</p>
          <div className="grid md:grid-cols-2 gap-3">
            {['Gemini','OpenAI','Replicate','Fal.ai'].map(p=> (
              <div key={p}><Label className="text-xs">{p} API Key</Label><Input type="password" placeholder="sk-..." className="mt-1"/></div>
            ))}
          </div>
          <div className="mt-4"><Button className="rounded-full">Save keys</Button></div>
        </Card>
      </div>
    </div>
  )
}
