import type { AfterimageSettings } from '../types'
export const SETTINGS_STORAGE_KEY = 'afterimage:settings:v1'
export const DEFAULT_SETTINGS: AfterimageSettings = { palette: 'aurora', particleSize: 3.2, trailPersistence: 0.88 }
export const PARTICLE_SIZE_RANGE = { min: 1.4, max: 7, step: 0.2 } as const
export const TRAIL_PERSISTENCE_RANGE = { min: 0.62, max: 0.96, step: 0.01 } as const