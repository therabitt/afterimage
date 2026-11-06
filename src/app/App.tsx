import {useCallback,useEffect,useState} from 'react'
import {useAfterimageEngine} from '../hooks/useAfterimageEngine'
import {useReducedMotion} from '../hooks/useReducedMotion'
import {loadSettings,saveSettings} from '../settings/storage'
import {DEFAULT_SETTINGS} from '../settings/defaults'
import {PALETTES} from '../engine/palettes'
import {downloadBlob,createExportFilename} from '../utils/download'
import type {AfterimageSettings,PaletteId} from '../types'
export default function App(){
 const [settings,setSettings]=useState<AfterimageSettings>(()=>loadSettings())
 const [started,setStarted]=useState(false),[status,setStatus]=useState(''),[busy,setBusy]=useState(false)
 const reduced=useReducedMotion(),onInteraction=useCallback(()=>setStarted(true),[])
 const {canvasRef,clearCanvas,exportCanvas,engineError}=useAfterimageEngine(settings,reduced,onInteraction)
 useEffect(()=>saveSettings(settings),[settings])
 const patch=(value:Partial<AfterimageSettings>)=>setSettings(s=>({...s,...value}))
 const clear=()=>{clearCanvas();setStarted(false);setStatus('A clean page. Begin again.')}
 const save=async()=>{if(busy)return;setBusy(true);try{downloadBlob(await exportCanvas(),createExportFilename());setStatus('Your image is ready. Keep this moment.')}catch(e){setStatus(e instanceof Error?e.message:'Could not export image.')}finally{setBusy(false)}}
 return <div className="shell">
  <header className="topbar"><a className="brand" href="#top"><span className="brand-icon">✳</span>afterimage<span className="brand-period">.</span></a><div className="top-center">A STUDY IN MOTION <i/> An interactive generative drawing instrument</div><span className="edition">STUDIO 01 · BETA</span></header>
  <main id="top"><div className="intro"><div><p className="eyebrow">A LITTLE TRACE OF THE MOMENT</p><h1>Make a moment <em>linger.</em></h1></div><p className="intro-note">Nothing here needs to last.<br/>Except what you choose to keep.</p></div>
   <div className="workspace"><section className="canvas-column"><div className="canvas-meta"><span><b>01</b> THE CANVAS</span><span className="live"><i/> LIVE SURFACE</span></div><div className="canvas-frame"><canvas ref={canvasRef} aria-label="Interactive drawing canvas. Move your pointer or drag to create fading particle trails." aria-describedby="canvas-help"/>{!started&&!engineError&&<div className="canvas-prompt"><span>✳</span><strong>Move through the canvas.</strong><small>Your movement leaves a trace.</small></div>}{engineError&&<div className="canvas-error" role="alert">{engineError}</div>}<span className="corner top">A / 01</span><span className="corner bottom">FIELD NOTES · 001</span></div><p id="canvas-help" className="canvas-help"><b>MOVE</b> to draw <i/> <b>PRESS + DRAG</b> to stay with the line</p></section>
   <aside className="controls"><div className="control-title"><div><p className="eyebrow">THE INSTRUMENT</p><h2>Shape the trace</h2></div><span>02 / 02</span></div>
    <section className="control-section"><div className="section-title"><h3>Colour field</h3><small>01</small></div><div className="palettes">{PALETTES.map(p=><button key={p.id} type="button" className={settings.palette===p.id?'palette selected':'palette'} aria-pressed={settings.palette===p.id} onClick={()=>patch({palette:p.id as PaletteId})}><span className="swatches">{p.swatch.map(c=><i key={c} style={{background:c}}/>)}</span>{p.name}<span className="check">{settings.palette===p.id?'●':''}</span></button>)}</div></section>
    <section className="control-section"><div className="section-title"><h3>Particle size</h3><small>02</small></div><div className="range-label"><label htmlFor="size">Scale</label><output>{settings.particleSize.toFixed(1)} px</output></div><input id="size" type="range" min="1.4" max="7" step=".2" value={settings.particleSize} onChange={e=>patch({particleSize:Number(e.target.value)})}/><p className="hint">A finer point or a wider bloom.</p></section>
    <section className="control-section"><div className="section-title"><h3>Afterglow</h3><small>03</small></div><div className="range-label"><label htmlFor="trail">Persistence</label><output>{Math.round(settings.trailPersistence*100)}%</output></div><input id="trail" type="range" min=".62" max=".96" step=".01" value={settings.trailPersistence} onChange={e=>patch({trailPersistence:Number(e.target.value)})}/><p className="hint">How long the last movement stays with you.</p></section>
    <div className="actions"><button className="button quiet" onClick={clear}>↺ &nbsp; Clear canvas</button><button className="button primary" onClick={save} disabled={busy}>↓ &nbsp; {busy?'Preparing…':'Save image'}</button></div><p className="privacy">✳ Your work stays in this browser. Nothing is uploaded.</p>
   </aside></div><div className="below"><span>✳ &nbsp; Every gesture is a small beginning.</span><div role="status" aria-live="polite">{status}</div><button onClick={()=>setSettings({...DEFAULT_SETTINGS})}>Reset settings</button></div>
  </main><footer><span>MADE TO DISAPPEAR. MADE TO BE KEPT.</span><span>YOUR CANVAS, YOUR MOMENT　·　NO UPLOADS</span></footer>
 </div>
}