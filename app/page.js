'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sparkles, Wand2, Layers, ArrowRight, ImageIcon, Zap, Shield, Globe } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

const HERO_IMG = 'https://images.unsplash.com/photo-1595333692465-226c3bed1455?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHw0fHxmYXNoaW9uJTIwZWRpdG9yaWFsJTIwZGFya3xlbnwwfHx8YmxhY2t8MTc4Mzg3NDY1N3ww&ixlib=rb-4.1.0&q=85'
const G1 = 'https://images.unsplash.com/photo-1699378999301-8c88a6a237d9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwyfHxmYXNoaW9uJTIwZWRpdG9yaWFsJTIwZGFya3xlbnwwfHx8YmxhY2t8MTc4Mzg3NDY1N3ww&ixlib=rb-4.1.0&q=85'
const G2 = 'https://images.unsplash.com/photo-1595065666634-4725aa7e8379?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwzfHxmYXNoaW9uJTIwZWRpdG9yaWFsJTIwZGFya3xlbnwwfHx8YmxhY2t8MTc4Mzg3NDY1N3ww&ixlib=rb-4.1.0&q=85'
const G3 = 'https://images.pexels.com/photos/38519803/pexels-photo-38519803.jpeg'

function Landing() {
  const user = useAuthStore((s) => s.user)

  const login = () => {
    const redirect = `${window.location.origin}/auth/callback`
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirect)}`
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 aurora" />
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-fuchsia-500 grid place-items-center glow-primary">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold tracking-tight text-lg">Lumen AI</span>
          <span className="ml-2 text-xs text-muted-foreground hidden md:inline">/ Fashion Studio</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground hidden md:inline">Features</a>
          <a href="#gallery" className="text-sm text-muted-foreground hover:text-foreground hidden md:inline">Gallery</a>
          {user ? (
            <Link href="/dashboard"><Button size="sm" className="rounded-full">Dashboard <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button></Link>
          ) : (
            <Button size="sm" className="rounded-full" onClick={login}>Sign in <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-24">
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.7}} className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Powered by Gemini 2.5 Flash Image (Nano Banana)
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
            Studio-grade <span className="font-serif italic text-primary">fashion imagery</span>,
            generated in seconds.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Combine your product, model, and background photos into cinematic editorial shots.
            Zero photoshoots. Infinite variations. Production-ready output.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" className="rounded-full h-12 px-6 text-base glow-primary" onClick={user ? () => (window.location.href='/dashboard') : login}>
              <Wand2 className="mr-2 h-4 w-4" /> Start generating
            </Button>
            <Link href="#gallery"><Button size="lg" variant="outline" className="rounded-full h-12 px-6 text-base">See examples</Button></Link>
          </div>
        </motion.div>

        {/* Floating gallery */}
        <motion.div initial={{opacity:0, y:40}} animate={{opacity:1, y:0}} transition={{duration:0.9, delay:0.2}} className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[HERO_IMG, G1, G2, G3].map((src, i) => (
            <motion.div key={i} whileHover={{y:-6}} className={`relative rounded-3xl overflow-hidden glass ${i%2===0 ? 'md:translate-y-6' : ''}`}>
              <img src={src} alt="" className="w-full h-64 md:h-80 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-xs text-white/90">AI Generated</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Everything you need to<br/><span className="font-serif italic text-primary">ship faster</span></h2>
          <p className="mt-4 text-muted-foreground">A production-ready AI studio built for fashion brands, ecommerce teams, and creative agencies.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {icon: Layers, title:'Multi-image composition', desc:'Fuse product + model + background into a single cinematic shot.'},
            {icon: Zap, title:'Lightning-fast', desc:'Gemini 2.5 Flash Image delivers photoreal results in seconds.'},
            {icon: ImageIcon, title:'Bulk & API-ready', desc:'ZIP/CSV batch generation and API access for pipelines.'},
            {icon: Shield, title:'Prompt Library', desc:'Curated fashion, luxury, ecommerce and lifestyle presets.'},
            {icon: Globe, title:'Team workspace', desc:'Invite your team, share assets and generation history.'},
            {icon: Sparkles, title:'Modular providers', desc:'Add OpenAI, FLUX, Ideogram, Replicate anytime.'},
          ].map((f, i) => (
            <motion.div key={i} whileHover={{y:-4}} className="glass rounded-3xl p-6">
              <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary grid place-items-center mb-4"><f.icon className="h-5 w-5"/></div>
              <h3 className="font-medium text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="gallery" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-32">
        <div className="glass rounded-3xl p-8 md:p-14 text-center">
          <h3 className="text-3xl md:text-4xl font-semibold tracking-tight">Ready to create your first shot?</h3>
          <p className="mt-3 text-muted-foreground">Sign in with Google. It takes 5 seconds.</p>
          <Button size="lg" className="mt-6 rounded-full h-12 px-6 glow-primary" onClick={user ? ()=>(window.location.href='/dashboard') : login}>
            <Wand2 className="mr-2 h-4 w-4" /> Launch Studio
          </Button>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Lumen AI · Built for fashion creators
      </footer>
    </div>
  )
}

function App(){ return <Landing/> }
export default App
