export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escape = (cell: string | number) => {
    const s = String(cell ?? '')
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const lines = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))]
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  triggerDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`)
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadBlob(blob: Blob, filename: string): void {
  triggerDownload(blob, filename)
}
