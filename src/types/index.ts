export type PaletteId = 'aurora' | 'ember' | 'ultraviolet'
export interface AfterimageSettings { palette: PaletteId; particleSize: number; trailPersistence: number }
export interface PaletteDefinition { id: PaletteId; name: string; colors: readonly number[]; swatch: readonly [string, string, string] }
export interface Point { x: number; y: number }