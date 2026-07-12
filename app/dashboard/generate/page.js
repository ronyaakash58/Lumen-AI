'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Wand2, Download, RotateCcw, Save, Sparkles, RefreshCw, Loader2, X, ImagePlus, Maximize2 } from 'lucide-react'

const CATEGORIES = ['Women\'s Wear', 'Men\'s Wear', 'Kids', 'Footwear', 'Accessories']
const ANGLES = ['Front', 'Side', '3/4', 'Back', 'Top-down', 'Low angle']
const POSES = ['Standing', 'Walking', 'Sitting', 'Editorial', 'Runway', 'Candid']
const LIGHTING = ['Studio softbox', 'Golden hour', 'Neon night', 'Overcast', 'Rim light', 'High-key white']
const STYLES = ['Editorial', 'Ecommerce', 'Luxury', 'Streetwear', 'Cinematic', 'Minimal']
const SIZES = ['1024x1024', '1024x1536', '1536x1024', '2048x2048']
const PROMPT_PRESETS = [
  'A high-fashion editorial shot, cinematic lighting, magazine cover quality',
  'Clean ecommerce product photography on neutral background, sharp focus',
  'Luxury lookbook style, moody dramatic lighting, film grain',
  'Streetwear campaign in urban setting, natural light, candid pose',
]

function UploadTile({ label, value, onChange, onClear }) {
  const inputRef = useRef(null)
  const onFile = async (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result)
    reader.readAsDataURL(file)
  }
  const onDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) onFile(f)
  }
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-2 block">{label}</Label>
      <div onClick={() => inputRef.current?.click()} onDragOver={(e)=>e.preventDefault()} onDrop={onDrop}
        className="relative aspect-square rounded-xl border border-dashed border-border bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition overflow-hidden group">
        {value ? (
          <>
            <img src={value} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={(e)=>{e.stopPropagation(); onClear()}} className="absolute top-1.5 right-1.5 h-6 w-6 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100">
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center text-muted-foreground">
            <div className="text-center">
              <ImagePlus className="h-5 w-5 mx-auto mb-1" />
              <div className="text-[10px]">Upload / drop</div>
            </div>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e)=>onFile(e.target.files?.[0])} />
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
    </div>
  )
}

export default function GeneratePage() {
  const [product, setProduct] = useState('')
  const [model, setModel] = useState('')
  const [background, setBackground] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [angle, setAngle] = useState(ANGLES[0])
  const [pose, setPose] = useState(POSES[0])
  const [lighting, setLighting] = useState(LIGHTING[0])
  const [style, setStyle] = useState(STYLES[0])
  const [size, setSize] = useState(SIZES[0])
  const [prompt, setPrompt] = useState(PROMPT_PRESETS[0])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState('')

  const reset = () => {
    setProduct(''); setModel(''); setBackground(''); setResult(null); setStatus('')
  }

  const buildPrompt = () => {
    return `${prompt}. Category: ${category}. Camera angle: ${angle}. Pose: ${pose}. Lighting: ${lighting}. Style: ${style}. Output resolution: ${size}. Ultra-detailed, photoreal, professional fashion photography.`
  }

  const generate = async () => {
    setLoading(true); setResult(null)
    setStatus('Composing prompt & sending to Gemini 2.5 Flash Image…')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: buildPrompt(),
          productImg: product || undefined,
          modelImg: model || undefined,
          backgroundImg: background || undefined,
          meta: { category, angle, pose, lighting, style, size },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate')
      setResult(data)
      setStatus('Done')
      toast.success('Image generated')
    } catch (e) {
      toast.error(e.message)
      setStatus('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const download = () => {
    if (!result?.image) return
    const a = document.createElement('a')
    a.href = result.image
    a.download = `lumen-${Date.now()}.png`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Generate Image</h1>
        <p className="text-muted-foreground mt-1">Upload references, tune your prompt, and create a studio-grade shot.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left panel */}
        <Card className="lg:col-span-2 p-5 rounded-2xl glass space-y-5">
          <div>
            <div className="text-sm font-medium mb-3">Reference Images</div>
            <div className="grid grid-cols-3 gap-3">
              <UploadTile label="Product" value={product} onChange={setProduct} onClear={()=>setProduct('')} />
              <UploadTile label="Model" value={model} onChange={setModel} onClear={()=>setModel('')} />
              <UploadTile label="Background" value={background} onChange={setBackground} onClear={()=>setBackground('')} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">Tip: upload any combination — all three are optional.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{CATEGORIES.map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>
            </Field>
            <Field label="Camera angle">
              <Select value={angle} onValueChange={setAngle}><SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{ANGLES.map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>
            </Field>
            <Field label="Pose">
              <Select value={pose} onValueChange={setPose}><SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{POSES.map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>
            </Field>
            <Field label="Lighting">
              <Select value={lighting} onValueChange={setLighting}><SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{LIGHTING.map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>
            </Field>
            <Field label="Style">
              <Select value={style} onValueChange={setStyle}><SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{STYLES.map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>
            </Field>
            <Field label="Output size">
              <Select value={size} onValueChange={setSize}><SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{SIZES.map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>
            </Field>
          </div>

          <Field label="Prompt">
            <Textarea rows={4} value={prompt} onChange={(e)=>setPrompt(e.target.value)} className="resize-none" />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PROMPT_PRESETS.map((p,i)=>(
                <button key={i} onClick={()=>setPrompt(p)} className="text-[10px] px-2 py-1 rounded-full bg-secondary hover:bg-secondary/70 text-muted-foreground">Preset {i+1}</button>
              ))}
            </div>
          </Field>

          <div className="flex gap-2">
            <Button className="flex-1 rounded-full glow-primary" onClick={generate} disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Generating…</> : <><Wand2 className="mr-2 h-4 w-4"/>Generate</>}
            </Button>
            <Button variant="outline" className="rounded-full" onClick={reset} disabled={loading}><RotateCcw className="h-4 w-4"/></Button>
          </div>
        </Card>

        {/* Right preview */}
        <Card className="lg:col-span-3 p-5 rounded-2xl glass min-h-[600px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary"/>Preview</div>
            <div className="text-xs text-muted-foreground">{status || 'Ready'}</div>
          </div>

          <div className="flex-1 rounded-xl bg-secondary/30 border border-border grid place-items-center relative overflow-hidden">
            {loading && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="absolute inset-0 shimmer opacity-40" />
                <div className="relative flex flex-col items-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <div>Creating your image… this can take 15-30s</div>
                </div>
              </div>
            )}
            {!loading && result?.image && (
              <motion.img initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} src={result.image} alt="" className="max-w-full max-h-[560px] object-contain rounded-lg" />
            )}
            {!loading && !result && (
              <div className="text-center text-muted-foreground text-sm p-8">
                <ImagePlus className="h-8 w-8 mx-auto mb-3 opacity-40" />
                Your generated image will appear here
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button variant="secondary" className="rounded-full" onClick={download} disabled={!result?.image}><Download className="mr-2 h-4 w-4"/>Download</Button>
            <Button variant="secondary" className="rounded-full" disabled={!result?.image}><Maximize2 className="mr-2 h-4 w-4"/>Upscale</Button>
            <Button variant="secondary" className="rounded-full" onClick={generate} disabled={loading}><RefreshCw className="mr-2 h-4 w-4"/>Regenerate</Button>
            <Button variant="secondary" className="rounded-full" disabled={!result?.image}><Save className="mr-2 h-4 w-4"/>Save to Gallery</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
