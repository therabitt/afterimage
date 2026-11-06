import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from './defaults'
import { validateSettings } from './validation'
import type { AfterimageSettings } from '../types'
export function loadSettings(): AfterimageSettings {
  try { const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY); return stored ? validateSettings(JSON.parse(stored) as unknown) : { ...DEFAULT_SETTINGS } }
  catch { return { ...DEFAULT_SETTINGS } }
}
export function saveSettings(settings: AfterimageSettings): void {
  try { window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings)) } catch { /* Storage is optional. */ }
}