export function downloadBlob(blob: Blob, filename: string): void {
 const url = URL.createObjectURL(blob); const anchor = document.createElement('a')
 anchor.href = url; anchor.download = filename; anchor.style.display = 'none'
 document.body.appendChild(anchor); anchor.click(); anchor.remove()
 window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export function createExportFilename(date = new Date()): string {
 const pad = (v: number) => String(v).padStart(2,'0')
 return `afterimage-${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}-${pad(date.getHours())}-${pad(date.getMinutes())}.png`
}