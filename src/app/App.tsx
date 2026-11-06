import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useAfterimageEngine } from '../hooks/useAfterimageEngine'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { loadSettings, saveSettings } from '../settings/storage'
import { PALETTES } from '../engine/palettes'
import { createExportFilename, downloadBlob } from '../utils/download'
import type { AfterimageSettings } from '../types'

function ClearIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4.8 6.5h10.4M8 6.5V4.2h4v2.3m1.2 0-.6 9.2H7.4l-.6-9.2M8.8 9v4.4m2.4-4.4v4.4" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 2.8v9.1m-3.4-3.3 3.4 3.4 3.4-3.4M3.5 13.3v3.2h13v-3.2" />
    </svg>
  )
}

export default function App() {
  const [settings, setSettings] = useState<AfterimageSettings>(() => loadSettings())
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const reducedMotion = useReducedMotion()
  const { canvasRef, clearCanvas, exportCanvas, engineError } = useAfterimageEngine(settings, reducedMotion)

  useEffect(() => saveSettings(settings), [settings])

  const updateSettings = (patch: Partial<AfterimageSettings>) => {
    setSettings(current => ({ ...current, ...patch }))
  }

  const handleClear = () => {
    clearCanvas()
    setStatus('Canvas cleared')
  }

  const handleSave = async () => {
    if (busy) return
    setBusy(true)
    setStatus('')
    try {
      const blob = await exportCanvas()
      downloadBlob(blob, createExportFilename())
      setStatus('PNG exported')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not export the canvas.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="studio">
      <section className="canvas-stage" aria-label="Afterimage drawing area">
        <canvas
          ref={canvasRef}
          className="drawing-canvas"
          aria-label="Interactive drawing canvas. Move your pointer or drag to create fading particle trails."
          aria-describedby="canvas-instructions"
        />
        {engineError && <div className="canvas-error" role="alert">{engineError}</div>}
        <p className="sr-only" id="canvas-instructions">
          Move or drag your pointer across the canvas to create a fading particle drawing.
          Use the controls to choose a colour palette and adjust particle size and afterglow.
        </p>
      </section>

      <div className="canvas-actions" role="group" aria-label="Canvas actions">
        <button
          className="action-button"
          type="button"
          onClick={handleClear}
          aria-label="Clear canvas"
          title="Clear canvas"
        >
          <ClearIcon />
        </button>
        <button
          className="action-button save-button"
          type="button"
          onClick={handleSave}
          disabled={busy}
          aria-label={busy ? 'Saving image' : 'Save canvas as PNG'}
          title={busy ? 'Saving image' : 'Save PNG'}
        >
          <SaveIcon />
        </button>
      </div>

      <section className="control-dock" aria-label="Drawing controls">
        <div className="dock-content">
          <div className="palette-control">
            <div className="palette-options" role="group" aria-label="Colour palette">
              {PALETTES.map(palette => (
                <button
                  key={palette.id}
                  type="button"
                  className={settings.palette === palette.id ? 'palette-swatch is-selected' : 'palette-swatch'}
                  style={{ '--swatch': 'linear-gradient(115deg, ' + palette.swatch.join(', ') + ')' } as CSSProperties}
                  aria-label={palette.name}
                  aria-pressed={settings.palette === palette.id}
                  title={palette.name}
                  onClick={() => updateSettings({ palette: palette.id })}
                >
                  <span />
                </button>
              ))}
            </div>
          </div>

          <div className="dock-divider" aria-hidden="true" />

          <div className="slider-control">
            <div className="slider-heading">
              <label htmlFor="particle-size">SIZE</label>
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

      {status && <div className="status-message" role="status" aria-live="polite">{status}</div>}
    </main>
  )
}
