'use client'

import { useRef, useState, useEffect } from 'react'

export default function ZoomPan({ src, alt = '', onZoomChange, resetKey }) {
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const startRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => { setZoom(1); setPos({ x:0, y:0 }) }, [resetKey])
  useEffect(() => { onZoomChange?.(zoom) }, [zoom, onZoomChange])

  const onWheel = (e) => {
    e.preventDefault()
    const delta = -e.deltaY * 0.0015
    setZoom((z) => Math.min(6, Math.max(0.3, z + delta * z)))
  }
  const onDown = (e) => { if (zoom <= 1) return; startRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y } }
  const onMove = (e) => { if (!startRef.current) return; setPos({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y }) }
  const onUp = () => { startRef.current = null }

  return (
    <div
      ref={wrapRef}
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
        className="absolute inset-0 m-auto max-w-full max-h-full object-contain select-none transition-[transform] duration-75 ease-out"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`, transformOrigin: 'center center' }}
      />
    </div>
  )
}
