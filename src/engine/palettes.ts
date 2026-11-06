import type { PaletteDefinition, PaletteId } from '../types'
export const PALETTES: readonly PaletteDefinition[] = [
 { id:'aurora', name:'Aurora', colors:[184,192,201,211,222,235,253], swatch:['#8be0ed','#91aaff','#d0a9ff'] },
 { id:'ember', name:'Ember', colors:[5,13,22,334,347,357,27], swatch:['#ffb06c','#ff7c79','#f1a4ce'] },
 { id:'ultraviolet', name:'Ultraviolet', colors:[261,272,283,295,307,218,236], swatch:['#b89bff','#ed9bdf','#82b9ff'] },
]
export function getPalette(id: PaletteId): PaletteDefinition { return PALETTES.find(p => p.id === id) ?? PALETTES[0]! }