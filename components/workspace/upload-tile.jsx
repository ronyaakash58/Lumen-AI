'use client'

import { memo, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { X, ImagePlus, RefreshCw } from 'lucide-react'

function UploadTile({ label, hint, value, onChange, onClear, accent = 'primary' }) {
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)

  const readFile = useCallback((file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result)
    reader.readAsDataURL(file)
  }, [onChange])

  const onFilePicked = useCallback((e) => readFile(e.target.files?.[0]), [readFile])

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f && f.type.startsWith('image/')) readFile(f)
  }, [readFile])

  const openPicker = useCallback(() => inputRef.current?.click(), [])

  return (
    <div className="rounded-2xl border border-border/60 bg-secondary/30 hover:bg-secondary/40 transition">
      <div className="flex items-center gap-2 px-3 pt-3">
        <div className={`h-1.5 w-1.5 rounded-full bg-${accent}`} />
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
        {value && (
          <div className="ml-auto flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={openPicker} title="Replace">
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onClear} title="Remove">
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      <div
        onClick={value ? undefined : openPicker}
        onDragOver={(e) => { e.preventDefault(); if (!drag) setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`relative m-3 aspect-[4/5] rounded-xl overflow-hidden border ${drag ? 'border-primary bg-primary/10' : 'border-dashed border-border/70'} ${!value ? 'cursor-pointer' : ''}`}
      >
        {value ? (
          <img src={value} alt={label} decoding="async" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-center px-3">
            <div>
              <div className="mx-auto h-10 w-10 rounded-xl bg-secondary grid place-items-center mb-2 text-muted-foreground">
                <ImagePlus className="h-4 w-4" />
              </div>
              <div className="text-xs">Drop or click to upload</div>
              {hint && <div className="text-[10px] text-muted-foreground mt-1">{hint}</div>}
            </div>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFilePicked} />
      </div>
    </div>
  )
}

export default memo(UploadTile)
