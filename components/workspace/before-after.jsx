'use client'

import { useRef, useState, useEffect } from 'react'

export default function BeforeAfter({ before, after, className = '' }) {
  const containerRef = useRef(null)
  const [pct, setPct] = useState(50)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left
      const p = Math.max(0, Math.min(100, (x / rect.width) * 100))
      setPct(p)
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [dragging])

  return (
    <div ref={containerRef} className={`relative select-none rounded-2xl overflow-hidden bg-black ${className}`}>
      <img src={before} alt="before" className="absolute inset-0 w-full h-full object-contain" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
        <img src={after} alt="after" className="absolute inset-0 w-full h-full object-contain" draggable={false} />
      </div>
      {/* Divider */}
      <div className="absolute top-0 bottom-0 z-10 pointer-events-none" style={{ left: `${pct}%` }}>
        <div className="w-px h-full bg-white/70 shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
      </div>
      {/* Handle */}
      <div
        onMouseDown={() => setDragging(true)}
        onTouchStart={() => setDragging(true)}
        className="absolute z-20 top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-white/95 text-black grid place-items-center cursor-ew-resize shadow-lg"
        style={{ left: `${pct}%` }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 6 9 12 15 18" /><polyline points="9 6 15 12 9 18" /></svg>
      </div>
      {/* Labels */}
      <div className="absolute top-3 left-3 text-[10px] uppercase tracking-widest text-white/80 bg-black/40 backdrop-blur px-2 py-1 rounded-full">Before</div>
      <div className="absolute top-3 right-3 text-[10px] uppercase tracking-widest text-white bg-primary/80 px-2 py-1 rounded-full">After</div>
    </div>
  )
}
