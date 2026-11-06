import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useAfterimageEngine } from '../hooks/useAfterimageEngine'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { loadSettings, saveSettings } from '../settings/storage'
import { DEFAULT_SETTINGS } from '../settings/defaults'
import { PALETTES } from '../engine/palettes'
import { createExportFilename, downloadBlob } from '../utils/download'
import type { AfterimageSettings } from '../types'

function ClearIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.2 8a6 6 0 1 1 .1 4.1M4 3.9v4.5h4.5M10 6.2v4l2.5 1.5" /></svg>
}

function SaveIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.8v9.1m-3.4-3.3 3.4 3.4 3.4-3.4M3.5 13.3v3.2h13v-3.2" /></svg>
}

function Mark() {
  return <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 2.8c1.1 6.1 3.1 8.1 9.2 9.2-6.1 1.1-8.1 3.1-9.2 9.2-1.1-6.1-3.1-8.1-9.2-9.2 6.1-1.1 8.1-3.1 9.2-9.2Z" /><path d="M22.5 18.5c.5 2.8 1.4 3.7 4.2 4.2-2.8.5-3.7 1.4-4.2 4.2-.5-2.8-1.4-3.7-4.2-4.2 2.8-.5 3.7-1.4 4.2-4.2Z" /></svg>
}

export default function App() {
  const [settings, setSettings] = useState<AfterimageSettings>(() => loadSettings())
  const [started, setStarted] = useState(false)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const reducedMotion = useReducedMotion()
  const onInteraction = useCallback(() => setStarted(true), [])
  const { canvasRef, clearCanvas, exportCanvas, engineError } = useAfterimageEngine(settings, reducedMotion, onInteraction)

  useEffect(() => saveSettings(settings), [settings])

  const updateSettings = (patch: Partial<AfterimageSettings>) => setSettings(current => ({ ...current, ...patch }))

  const handleClear = () => {
    clearCanvas()
    setStarted(false)
    setStatus('Canvas cleared. A new moment is yours.')
  }

  const handleSave = async () => {
    if (busy) return
    setBusy(true)
    setStatus('')
    try {
      const blob = await exportCanvas()
      downloadBlob(blob, createExportFilename())
      setStatus('Image saved as PNG.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not export the canvas.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="studio" id="top">
      <section className="canvas-stage" aria-label="Afterimage drawing area">
        <canvas
          ref={canvasRef}
          className="drawing-canvas"
          aria-label="Interactive drawing canvas. Move your pointer or drag to create fading particle trails."
          aria-describedby="canvas-instructions"
        />
        {!started && !engineError && (
          <div className="canvas-invitation" aria-hidden="true">
            <span className="invitation-mark"><Mark /></span>
            <p className="invitation-title">Leave a little trace.</p>
            <p className="invitation-caption">Move anywhere to begin</p>
          </div>
        )}
        {engineError && <div className="canvas-error" role="alert">{engineError}</div>}
        <p className="sr-only" id="canvas-instructions">
          Move your mouse across the canvas, or touch and drag, to create a fading particle drawing.
          Use the floating controls to choose a colour palette and adjust particle size and trail persistence.
        </p>
        <div className="canvas-vignette" aria-hidden="true" />
      </section>

      <header className="studio-header">
        <a className="studio-brand" href="#top" aria-label="Afterimage home">
          <span className="brand-mark"><Mark /></span>
          <span className="brand-word">afterimage<span>.</span></span>
        </a>
        <p className="header-note">A STUDY IN MOTION <i /> AN INTERACTIVE DRAWING INSTRUMENT</p>
        <div className="header-actions">
          <button className="action-button clear-button" type="button" onClick={handleClear} title="Clear canvas">
            <ClearIcon /><span>Clear</span>
          </button>
          <button className="action-button save-button" type="button" onClick={handleSave} disabled={busy} title="Save canvas as PNG">
            <SaveIcon /><span>{busy ? 'Saving' : 'Save image'}</span>
          </button>
        </div>
      </header>

      <div className="stage-caption" aria-hidden="true">
        <span className="stage-index">01 <i /> THE LIVING CANVAS</span>
        <span className="stage-coordinate">A DIGITAL STUDY OF MOVEMENT & MEMORY</span>
      </div>

      <section className="control-dock" aria-label="Drawing controls">
        <div className="dock-heading">
          <span>SHAPE YOUR TRACE</span>
          <button type="button" className="reset-button" onClick={() => updateSettings({ ...DEFAULT_SETTINGS })}>Reset</button>
        </div>
        <div className="dock-content">
          <div className="palette-control">
            <span className="control-label">COLOUR FIELD</span>
            <div className="palette-options" role="group" aria-label="Colour palette">
              {PALETTES.map(palette => (
                <button
                  key={palette.id}
                  type="button"
                  className={settings.palette === palette.id ? 'palette-swatch is-selected' : 'palette-swatch'}
                  style={{ '--swatch': `linear-gradient(115deg, ${palette.swatch.join(', ')})` } as CSSProperties}
                  aria-label={palette.name}
                  aria-pressed={settings.palette === palette.id}
                  title={palette.name}
                  onClick={() => updateSettings({ palette: palette.id })}
                >
                  <span />
                </button>
              ))}
            </div>
            <span className="selected-palette">{PALETTES.find(palette => palette.id === settings.palette)?.name}</span>
          </div>

          <div className="dock-divider" />

          <div className="slider-control">
            <div className="slider-heading">
              <label htmlFor="particle-size">PARTICLE SIZE</label>
              <output htmlFor="particle-size">{settings.particleSize.toFixed(1)}<small> px</small></output>
            </div>
            <input
              id="particle-size"
              type="range"
              min="1.4"
              max="7"
              step="0.2"
              value={settings.particleSize}
              onChange={event => updateSettings({ particleSize: Number(event.target.value) })}
            />
          </div>

          <div className="slider-control">
            <div className="slider-heading">
              <label htmlFor="trail-persistence">AFTERGLOW</label>
              <output htmlFor="trail-persistence">{Math.round(settings.trailPersistence * 100)}<small>%</small></output>
            </div>
            <input
              id="trail-persistence"
              type="range"
              min="0.62"
              max="0.96"
              step="0.01"
              value={settings.trailPersistence}
              onChange={event => updateSettings({ trailPersistence: Number(event.target.value) })}
            />
          </div>
        </div>
      </section>

      <footer className="studio-footer">
        <span className="gesture-hint"><kbd>MOVE</kbd> TO DRAW <i /> <kbd>PRESS + DRAG</kbd> TO STAY</span>
        <span className="privacy-note">YOUR WORK STAYS HERE <i /> NO UPLOADS</span>
      </footer>

      <div className="status-message" role="status" aria-live="polite">{status}</div>
    </main>
  )
}
