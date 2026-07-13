'use client'

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { ZoomIn } from 'lucide-react'

/**
 * Self-contained zoom/pan viewer.
 * Zoom lives INSIDE this component so wheel events don't cascade into the
 * parent tree (which was causing full-page re-renders on every scroll).
 */
function ZoomPan({ src, alt = '', resetKey }) {
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const startRef = useRef(null)

  useEffect(() => { setZoom(1); setPos({ x: 0, y: 0 }) }, [resetKey])

  const onWheel = useCallback((e) => {
    e.preventDefault()
    const delta = -e.deltaY * 0.0015
    setZoom((z) => Math.min(6, Math.max(0.3, z + delta * z)))
  }, [])

  const onDown = useCallback((e) => {
    if (e.button !== 0) return
    // Only allow pan when zoomed in
    setPos((p) => { startRef.current = { x: e.clientX - p.x, y: e.clientY - p.y }; return p })
  }, [])

  const onMove = useCallback((e) => {
    if (!startRef.current) return
    setPos({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y })
  }, [])

  const onUp = useCallback(() => { startRef.current = null }, [])

  return (
    <div
      onWheel={onWheel}
      onMouseDown={onDown}
      onMouseMove={onMove}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      className={`relative w-full h-full overflow-hidden ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        decoding="async"
        loading="eager"
        className="absolute inset-0 m-auto max-w-full max-h-full object-contain select-none will-change-transform"
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${zoom})`, transformOrigin: 'center center' }}
      />
      <div className="absolute bottom-3 right-3 z-10 text-[10px] text-white/80 bg-black/50 px-2 py-1 rounded-full inline-flex items-center gap-1 pointer-events-none">
        <ZoomIn className="h-3 w-3" /> {Math.round(zoom * 100)}% · scroll to zoom, drag to pan
      </div>
    </div>
  )
}

export default memo(ZoomPan)
