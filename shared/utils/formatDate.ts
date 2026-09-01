export const formatDate = (date: Date | string | number) => {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  if (!(d instanceof Date) || isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDateStr(date: Date | string | number) {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  if (!(d instanceof Date) || isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}
