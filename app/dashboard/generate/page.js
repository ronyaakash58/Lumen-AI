'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import UploadTile from '@/components/workspace/upload-tile'
import ZoomPan from '@/components/workspace/zoom-pan'
import BeforeAfter from '@/components/workspace/before-after'
import {
  Wand2, Sparkles, RotateCcw, Download, RefreshCw, Trash2, Heart, ImagePlus,
  Loader2, Maximize2, Minimize2, ZoomIn, ZoomOut, Split, ChevronRight, ChevronLeft,
  Layers, History, BookMarked, Save, Plus, ScanLine, Wand,
} from 'lucide-react'

// ---------- constants ----------
const CATEGORIES = ["Women's Wear", "Men's Wear", 'Kids', 'Footwear', 'Accessories', 'Jewelry', 'Bags']
const GENDERS = ['Female', 'Male', 'Non-binary', 'Any']
const ANGLES = ['Front', 'Side', '3/4', 'Back', 'Top-down', 'Low angle', 'Dutch']
const POSES = ['Standing', 'Walking', 'Sitting', 'Editorial', 'Runway', 'Candid', 'Action', 'Portrait']
const LIGHTING = ['Studio softbox', 'Golden hour', 'Neon night', 'Overcast', 'Rim light', 'High-key white', 'Cinematic']
const BG_STYLES = ['Studio white', 'Studio gradient', 'Urban street', 'Beach', 'Forest', 'Minimal set', 'Editorial set', 'Custom (use upload)']
const RATIOS = ['1:1', '3:4', '4:3', '2:3', '3:2', '9:16', '16:9']
const RESOLUTIONS = ['1024', '1536', '2048']
const OUTPUT_COUNTS = [1, 2, 3, 4]
const PROMPT_PRESETS = [
  { name: 'Editorial cover', text: 'High-fashion editorial cover, cinematic lighting, magazine cover quality, sharp focus, subtle film grain' },
  { name: 'Ecommerce packshot', text: 'Clean ecommerce product photography on neutral background, soft shadow, sharp focus, commercial quality' },
  { name: 'Golden hour', text: 'Luxury lookbook, golden hour, warm rim light, dreamy pastel palette, film grain' },
  { name: 'Urban candid', text: 'Streetwear candid shot in urban setting, natural light, motion, story-driven' },
  { name: 'Runway', text: 'Runway shot, dramatic backstage lighting, motion blur, high-end couture' },
  { name: 'Minimal', text: 'Minimal fashion editorial, negative space, brutalist composition, monochromatic palette' },
]

const LS_HISTORY = 'lumen.workspace.history'
const LS_PROMPTS = 'lumen.workspace.recent_prompts'
const LS_PRESETS = 'lumen.workspace.saved_presets'

// ---------- small subcomponents ----------
function SectionHeader({ icon: Icon, children, right }) {
  return (
    <div className="flex items-center justify-between px-1 mb-2">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {children}
      </div>
      {right}
    </div>
  )
}
function Field({ label, children, compact }) {
  return (
    <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}
function SelectField({ value, onChange, options }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 rounded-lg bg-secondary/40 border-border/60 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={String(o)} value={String(o)}>{o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
function CountPills({ value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {OUTPUT_COUNTS.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`flex-1 h-9 rounded-lg text-sm font-medium transition ${
            value === n ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/70'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}
function ProgressBar({ value }) {
  return (
    <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-primary via-fuchsia-500 to-primary"
        style={{ width: `${value}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  )
}

// ---------- MAIN ----------
function GenerateWorkspace() {
  // Left rail — references
  const [product, setProduct] = useState('')
  const [modelImg, setModelImg] = useState('')
  const [background, setBackground] = useState('')

  // Left rail — settings
  const [category, setCategory] = useState(CATEGORIES[0])
  const [gender, setGender] = useState(GENDERS[0])
  const [angle, setAngle] = useState(ANGLES[0])
  const [pose, setPose] = useState(POSES[0])
  const [lighting, setLighting] = useState(LIGHTING[0])
  const [bgStyle, setBgStyle] = useState(BG_STYLES[0])
  const [ratio, setRatio] = useState(RATIOS[0])
  const [resolution, setResolution] = useState(RESOLUTIONS[1])
  const [outputs, setOutputs] = useState(1)

  const [prompt, setPrompt] = useState(PROMPT_PRESETS[0].text)
  const [negative, setNegative] = useState('low quality, blurry, deformed hands, extra fingers, watermark, text, logo')

  // Center — results
  const [items, setItems] = useState([]) // current batch results [{id, image, prompt, meta}]
  const [selected, setSelected] = useState(null) // id
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Ready')

  // Center — viewer state
  const [showBeforeAfter, setShowBeforeAfter] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [resetToken, setResetToken] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const canvasRef = useRef(null)

  // Right rail
  const [history, setHistory] = useState([])
  const [recentPrompts, setRecentPrompts] = useState([])
  const [presets, setPresets] = useState([])
  const [tab, setTab] = useState('history')

  // Left rail collapse
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)

  const selectedItem = useMemo(() => items.find((i) => i.id === selected) || items[0] || null, [items, selected])

  // Hydrate history & recent prompts + presets from server + localStorage
  useEffect(() => {
    fetch('/api/generations?limit=40').then((r) => r.json()).then((d) => setHistory(d.items || []))
    try {
      setRecentPrompts(JSON.parse(localStorage.getItem(LS_PROMPTS) || '[]'))
      setPresets(JSON.parse(localStorage.getItem(LS_PRESETS) || '[]'))
    } catch {}
  }, [])

  const persistPrompts = (list) => {
    setRecentPrompts(list)
    localStorage.setItem(LS_PROMPTS, JSON.stringify(list.slice(0, 20)))
  }
  const persistPresets = (list) => {
    setPresets(list)
    localStorage.setItem(LS_PRESETS, JSON.stringify(list.slice(0, 30)))
  }

  const buildPrompt = () => {
    return [
      prompt.trim(),
      `Category: ${category}`,
      `Gender: ${gender}`,
      `Camera angle: ${angle}`,
      `Pose: ${pose}`,
      `Lighting: ${lighting}`,
      `Background style: ${bgStyle}`,
      `Aspect ratio: ${ratio}`,
      `Target resolution: ${resolution}px longest edge`,
      negative ? `Avoid: ${negative}` : null,
      'Ultra-detailed, photoreal, professional fashion photography.',
    ].filter(Boolean).join('. ')
  }

  const startProgress = () => {
    setProgress(4)
    const startedAt = Date.now()
    const t = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000
      // Ease toward 92% over ~28s
      const p = Math.min(92, 4 + Math.log1p(elapsed) * 22)
      setProgress(p)
    }, 250)
    return () => clearInterval(t)
  }

  const generate = async () => {
    if (loading) return
    setLoading(true)
    setItems([])
    setSelected(null)
    setShowBeforeAfter(false)
    setStatus(`Generating ${outputs} image${outputs > 1 ? 's' : ''}…`)
    const stop = startProgress()
    const payload = {
      prompt: buildPrompt(),
      productImg: product || undefined,
      modelImg: modelImg || undefined,
      backgroundImg: background || undefined,
      meta: { category, gender, angle, pose, lighting, bgStyle, ratio, resolution },
    }
    try {
      const calls = Array.from({ length: outputs }, () =>
        fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).then(async (r) => {
          const data = await r.json()
          if (!r.ok) throw new Error(data.error || 'Failed')
          return data
        }),
      )
      const results = await Promise.allSettled(calls)
      const ok = results.filter((r) => r.status === 'fulfilled').map((r) => r.value)
      const failed = results.length - ok.length
      if (ok.length === 0) throw new Error('All generations failed')
      setItems(ok)
      setSelected(ok[0].id)
      setStatus(failed ? `Done — ${failed} failed` : 'Done')
      toast.success(`Generated ${ok.length} image${ok.length > 1 ? 's' : ''}`)

      // Persist to right rail
      const newHist = [...ok, ...history].slice(0, 60)
      setHistory(newHist)
      const trimmedPrompt = prompt.trim()
      if (trimmedPrompt) persistPrompts([trimmedPrompt, ...recentPrompts.filter((p) => p !== trimmedPrompt)])
    } catch (e) {
      setStatus(`Error: ${e.message}`)
      toast.error(e.message)
    } finally {
      stop()
      setProgress(100)
      setTimeout(() => setProgress(0), 900)
      setLoading(false)
    }
  }

  const reset = () => {
    setProduct(''); setModelImg(''); setBackground('')
    setItems([]); setSelected(null); setStatus('Ready'); setShowBeforeAfter(false)
  }

  const download = (item) => {
    const target = item || selectedItem
    if (!target?.image) return
    const a = document.createElement('a')
    a.href = target.image
    a.download = `lumen-${target.id}.png`
    a.click()
  }
  const removeItem = async (item) => {
    try {
      await fetch(`/api/generations/${item.id}`, { method: 'DELETE' })
    } catch {}
    setHistory((h) => h.filter((x) => x.id !== item.id))
    setItems((h) => h.filter((x) => x.id !== item.id))
    if (selected === item.id) setSelected(null)
    toast.success('Deleted')
  }
  const favorite = (item) => {
    toast.success('Added to favorites')
  }

  const savePreset = () => {
    const name = `Preset ${presets.length + 1}`
    const p = { name, category, gender, angle, pose, lighting, bgStyle, ratio, resolution, outputs, prompt, negative }
    persistPresets([p, ...presets])
    toast.success(`Saved as ${name}`)
  }
  const applyPreset = (p) => {
    setCategory(p.category); setGender(p.gender); setAngle(p.angle); setPose(p.pose)
    setLighting(p.lighting); setBgStyle(p.bgStyle); setRatio(p.ratio); setResolution(p.resolution)
    setOutputs(p.outputs); setPrompt(p.prompt); setNegative(p.negative)
    toast.success(`Loaded ${p.name}`)
  }

  const enterFullscreen = () => {
    const el = canvasRef.current
    if (!el) return
    if (!document.fullscreenElement) el.requestFullscreen?.().then(() => setFullscreen(true))
    else document.exitFullscreen?.().then(() => setFullscreen(false))
  }
  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const beforeSrc = product || modelImg || background || null
  const canBeforeAfter = !!(selectedItem?.image && beforeSrc)

  // Ratio -> tailwind style (padding-based box)
  const ratioPad = useMemo(() => {
    const [w, h] = ratio.split(':').map(Number)
    return `${(h / w) * 100}%`
  }, [ratio])

  // ---------- render ----------
  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Top toolbar */}
      <div className="h-12 shrink-0 border-b border-border/60 glass px-3 flex items-center gap-2 z-10">
        <button onClick={() => setLeftOpen((v) => !v)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-secondary/60 text-muted-foreground">
          {leftOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-fuchsia-500 grid place-items-center">
            <Wand2 className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-medium">Generate</span>
          <span className="text-xs text-muted-foreground hidden md:inline">Untitled project</span>
        </div>
        <div className="mx-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><span className={`h-1.5 w-1.5 rounded-full ${loading ? 'bg-primary animate-pulse' : 'bg-emerald-400'}`} /> {status}</span>
        </div>
        <button onClick={() => setRightOpen((v) => !v)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-secondary/60 text-muted-foreground">
          {rightOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Main 3-column */}
      <div className="flex-1 flex overflow-hidden">
        {/* ---------- LEFT RAIL ---------- */}
        <AnimatePresence initial={false}>
          {leftOpen && (
            <motion.aside
              key="left"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="shrink-0 border-r border-border/60 glass overflow-hidden flex flex-col"
            >
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                  {/* Reference Images */}
                  <div>
                    <SectionHeader icon={Layers}>Reference Images</SectionHeader>
                    <div className="space-y-3">
                      <UploadTile label="Product" hint="Item, garment, apparel" value={product} onChange={setProduct} onClear={() => setProduct('')} accent="primary" />
                      <UploadTile label="Model" hint="Person / mannequin" value={modelImg} onChange={setModelImg} onClear={() => setModelImg('')} accent="fuchsia-500" />
                      <UploadTile label="Background" hint="Scene / environment" value={background} onChange={setBackground} onClear={() => setBackground('')} accent="cyan-500" />
                    </div>
                  </div>

                  {/* Generation Settings */}
                  <div>
                    <SectionHeader icon={ScanLine}>Generation Settings</SectionHeader>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Category"><SelectField value={category} onChange={setCategory} options={CATEGORIES} /></Field>
                      <Field label="Gender"><SelectField value={gender} onChange={setGender} options={GENDERS} /></Field>
                      <Field label="Camera Angle"><SelectField value={angle} onChange={setAngle} options={ANGLES} /></Field>
                      <Field label="Pose"><SelectField value={pose} onChange={setPose} options={POSES} /></Field>
                      <Field label="Lighting"><SelectField value={lighting} onChange={setLighting} options={LIGHTING} /></Field>
                      <Field label="Background Style"><SelectField value={bgStyle} onChange={setBgStyle} options={BG_STYLES} /></Field>
                      <Field label="Image Ratio"><SelectField value={ratio} onChange={setRatio} options={RATIOS} /></Field>
                      <Field label="Resolution"><SelectField value={resolution} onChange={setResolution} options={RESOLUTIONS} /></Field>
                    </div>
                    <div className="mt-3">
                      <Field label="Number of Outputs"><CountPills value={outputs} onChange={setOutputs} /></Field>
                    </div>
                  </div>

                  {/* Prompt Builder */}
                  <div>
                    <SectionHeader icon={Wand} right={
                      <button className="text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><Sparkles className="h-3 w-3" />Enhance</button>
                    }>Prompt Builder</SectionHeader>
                    <Textarea rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)} className="resize-none rounded-xl bg-secondary/40 border-border/60 text-sm" placeholder="Describe your vision…" />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {PROMPT_PRESETS.map((p) => (
                        <button key={p.name} onClick={() => setPrompt(p.text)} className="text-[10px] px-2 py-1 rounded-full bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground">{p.name}</button>
                      ))}
                    </div>
                  </div>

                  {/* Negative Prompt */}
                  <div>
                    <SectionHeader>Negative Prompt</SectionHeader>
                    <Textarea rows={3} value={negative} onChange={(e) => setNegative(e.target.value)} className="resize-none rounded-xl bg-secondary/40 border-border/60 text-sm" placeholder="Things to avoid…" />
                  </div>
                </div>
              </ScrollArea>

              {/* Sticky generate */}
              <div className="p-3 border-t border-border/60 bg-background/60 backdrop-blur space-y-2">
                <Button
                  size="lg"
                  onClick={generate}
                  disabled={loading}
                  className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary via-fuchsia-500 to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] transition-[background-position] duration-500 glow-primary"
                >
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating…</> : <><Wand2 className="mr-2 h-4 w-4" />Generate {outputs > 1 ? `×${outputs}` : ''}</>}
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-lg" onClick={reset}><RotateCcw className="h-3.5 w-3.5 mr-1" />Reset</Button>
                  <Button variant="outline" size="sm" className="flex-1 rounded-lg" onClick={savePreset}><Save className="h-3.5 w-3.5 mr-1" />Save preset</Button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ---------- CENTER CANVAS ---------- */}
        <section ref={canvasRef} className="flex-1 relative overflow-hidden bg-[#0a0a0c] bg-grid">
          {/* Canvas top mini-toolbar */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-black/40 backdrop-blur rounded-full border border-border/60 px-1 py-1">
            <button title="Zoom out" onClick={() => setResetToken((t) => t + 1)} className="h-8 px-3 rounded-full hover:bg-white/5 text-xs inline-flex items-center gap-1"><ZoomOut className="h-3.5 w-3.5" />Fit</button>
            <div className="w-px h-5 bg-border/60" />
            <button title="Before/After" disabled={!canBeforeAfter} onClick={() => setShowBeforeAfter((v) => !v)} className={`h-8 px-3 rounded-full text-xs inline-flex items-center gap-1 ${showBeforeAfter ? 'bg-primary text-primary-foreground' : 'hover:bg-white/5 disabled:opacity-40'}`}>
              <Split className="h-3.5 w-3.5" />Before / After
            </button>
            <div className="w-px h-5 bg-border/60" />
            <div className="text-[10px] text-muted-foreground px-2">{ratio} · {resolution}px</div>
            <div className="w-px h-5 bg-border/60" />
            <button title="Fullscreen" onClick={enterFullscreen} className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/5">
              {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Canvas content */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="relative" style={{ width: 'min(100%, 1100px)' }}>
              <div className="relative w-full rounded-2xl overflow-hidden bg-black/70 border border-border/60 shadow-2xl" style={{ paddingBottom: ratioPad }}>
                <div className="absolute inset-0">
                  {/* Loading overlay */}
                  {loading && (
                    <div className="absolute inset-0 z-10 grid place-items-center">
                      <div className="absolute inset-0 shimmer opacity-30" />
                      <div className="relative flex flex-col items-center gap-4 text-center">
                        <div className="relative h-14 w-14">
                          <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
                          <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                          <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-primary" />
                        </div>
                        <div className="text-sm text-white/80">Composing your image with Gemini 2.5 Flash Image</div>
                        <div className="w-72"><ProgressBar value={progress} /></div>
                        <div className="text-[10px] text-muted-foreground">{Math.round(progress)}% · up to ~30s</div>
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {!loading && !selectedItem && (
                    <div className="absolute inset-0 grid place-items-center text-center p-8">
                      <div>
                        <div className="mx-auto h-16 w-16 rounded-2xl bg-secondary/60 grid place-items-center mb-4">
                          <ImagePlus className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="text-lg font-medium">Your canvas awaits</div>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                          Add reference images on the left, dial in your settings, and hit
                          <span className="mx-1 inline-flex items-center gap-1 text-primary"><Wand2 className="h-3 w-3" />Generate</span>
                          to create your first studio-grade shot.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Result */}
                  {!loading && selectedItem && !showBeforeAfter && (
                    <ZoomPan
                      src={selectedItem.image}
                      alt={selectedItem.prompt}
                      onZoomChange={setZoom}
                      resetKey={`${selectedItem.id}-${resetToken}`}
                    />
                  )}
                  {!loading && selectedItem && showBeforeAfter && beforeSrc && (
                    <BeforeAfter before={beforeSrc} after={selectedItem.image} className="absolute inset-0" />
                  )}
                </div>
              </div>

              {/* Multi-output strip */}
              {items.length > 1 && (
                <div className="mt-3 flex items-center gap-2 justify-center">
                  {items.map((it, idx) => (
                    <button
                      key={it.id}
                      onClick={() => setSelected(it.id)}
                      className={`relative h-16 w-16 rounded-xl overflow-hidden border transition ${selected === it.id ? 'border-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.4)]' : 'border-border/60 hover:border-border'}`}
                    >
                      <img src={it.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute bottom-0.5 right-0.5 text-[9px] px-1 rounded bg-black/60 text-white">#{idx + 1}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Zoom indicator */}
          {!loading && selectedItem && !showBeforeAfter && (
            <div className="absolute bottom-4 right-4 z-20 text-[10px] text-muted-foreground bg-black/40 backdrop-blur px-2 py-1 rounded-full inline-flex items-center gap-1">
              <ZoomIn className="h-3 w-3" /> {Math.round(zoom * 100)}% · scroll to zoom, drag to pan
            </div>
          )}
        </section>

        {/* ---------- RIGHT RAIL ---------- */}
        <AnimatePresence initial={false}>
          {rightOpen && (
            <motion.aside
              key="right"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="shrink-0 border-l border-border/60 glass overflow-hidden flex flex-col"
            >
              {/* Actions on selected */}
              <div className="p-3 border-b border-border/60">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Selected result</div>
                <div className="grid grid-cols-4 gap-2">
                  <Button size="sm" variant="secondary" className="rounded-lg" disabled={!selectedItem} onClick={() => download()}><Download className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="secondary" className="rounded-lg" disabled={!selectedItem || loading} onClick={generate}><RefreshCw className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="secondary" className="rounded-lg" disabled={!selectedItem} onClick={() => favorite(selectedItem)}><Heart className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="secondary" className="rounded-lg" disabled={!selectedItem} onClick={() => removeItem(selectedItem)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>

              <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="mx-3 mt-3 grid grid-cols-3 bg-secondary/40">
                  <TabsTrigger value="history" className="text-xs"><History className="h-3.5 w-3.5 mr-1" />History</TabsTrigger>
                  <TabsTrigger value="prompts" className="text-xs"><BookMarked className="h-3.5 w-3.5 mr-1" />Prompts</TabsTrigger>
                  <TabsTrigger value="presets" className="text-xs"><Sparkles className="h-3.5 w-3.5 mr-1" />Presets</TabsTrigger>
                </TabsList>

                <TabsContent value="history" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full px-3 pb-3">
                    {history.length === 0 ? (
                      <div className="text-xs text-muted-foreground text-center py-10">No generations yet.</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 pt-3">
                        {history.map((h) => (
                          <button
                            key={h.id}
                            onClick={() => { setItems([h]); setSelected(h.id); setShowBeforeAfter(false) }}
                            className={`relative aspect-square rounded-lg overflow-hidden border transition ${selected === h.id ? 'border-primary' : 'border-border/60 hover:border-border'}`}
                          >
                            <img src={h.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent text-[10px] p-1.5 text-left text-white/85 line-clamp-2">
                              {h.prompt?.slice(0, 60)}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="prompts" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full px-3 pb-3">
                    {recentPrompts.length === 0 ? (
                      <div className="text-xs text-muted-foreground text-center py-10">No recent prompts.</div>
                    ) : (
                      <div className="space-y-2 pt-3">
                        {recentPrompts.map((p, i) => (
                          <button key={i} onClick={() => setPrompt(p)} className="w-full text-left p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-border/60 text-xs text-muted-foreground hover:text-foreground line-clamp-3">
                            {p}
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="presets" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full px-3 pb-3">
                    <div className="pt-3 space-y-2">
                      <button onClick={savePreset} className="w-full inline-flex items-center justify-center gap-1 py-2 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-xs"><Plus className="h-3.5 w-3.5" />Save current as preset</button>
                      {presets.length === 0 ? (
                        <div className="text-xs text-muted-foreground text-center py-8">No presets yet.</div>
                      ) : (
                        presets.map((p, i) => (
                          <button key={i} onClick={() => applyPreset(p)} className="w-full text-left p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-border/60">
                            <div className="text-xs font-medium">{p.name}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{p.category} · {p.ratio} · {p.resolution}px · ×{p.outputs}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default GenerateWorkspace
