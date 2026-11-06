import { useCallback, useEffect, useRef, useState } from 'react'
import { ParticleEngine } from '../engine/ParticleEngine'
import type { AfterimageSettings } from '../types'
export function useAfterimageEngine(settings: AfterimageSettings, reducedMotion: boolean) {
 const canvasRef = useRef<HTMLCanvasElement|null>(null)
 const engineRef = useRef<ParticleEngine|null>(null)
 const [engineError,setEngineError] = useState<string|null>(null)
 useEffect(() => { const canvas = canvasRef.current; if (!canvas) return
  try { const engine = new ParticleEngine(canvas,settings,reducedMotion); engineRef.current=engine; setEngineError(null); return () => { engine.destroy(); engineRef.current=null } }
  catch { setEngineError('Canvas 2D is unavailable in this browser. Try a modern browser.') }
 },[])
 useEffect(() => { engineRef.current?.setSettings(settings) },[settings])
 useEffect(() => { engineRef.current?.setReducedMotion(reducedMotion) },[reducedMotion])
 const clearCanvas = useCallback(() => engineRef.current?.clear(),[])
 const exportCanvas = useCallback(() => engineRef.current ? engineRef.current.exportPng() : Promise.reject(new Error('Canvas is not ready.')),[])
 return {canvasRef,clearCanvas,exportCanvas,engineError}
}