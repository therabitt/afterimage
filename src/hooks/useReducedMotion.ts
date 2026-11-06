import { useEffect, useState } from 'react'
export function useReducedMotion(): boolean {
 const [value,setValue] = useState(false)
 useEffect(() => { const media = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setValue(media.matches); update(); media.addEventListener('change',update); return () => media.removeEventListener('change',update) }, [])
 return value
}