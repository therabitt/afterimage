import { DEFAULT_SETTINGS, PARTICLE_SIZE_RANGE, TRAIL_PERSISTENCE_RANGE } from './defaults'
import type { AfterimageSettings, PaletteId } from '../types'
const PALETTE_IDS: readonly PaletteId[] = ['aurora', 'ember', 'ultraviolet']
function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)) }
export function validateSettings(value: unknown): AfterimageSettings {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return { ...DEFAULT_SETTINGS }
  const data = value as Record<string, unknown>
  const palette = PALETTE_IDS.includes(data.palette as PaletteId) ? data.palette as PaletteId : DEFAULT_SETTINGS.palette
  const particleSize = typeof data.particleSize === 'number' && Number.isFinite(data.particleSize) ? clamp(data.particleSize, PARTICLE_SIZE_RANGE.min, PARTICLE_SIZE_RANGE.max) : DEFAULT_SETTINGS.particleSize
  const trailPersistence = typeof data.trailPersistence === 'number' && Number.isFinite(data.trailPersistence) ? clamp(data.trailPersistence, TRAIL_PERSISTENCE_RANGE.min, TRAIL_PERSISTENCE_RANGE.max) : DEFAULT_SETTINGS.trailPersistence
  return { palette, particleSize, trailPersistence }
}