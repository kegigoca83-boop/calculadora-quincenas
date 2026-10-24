const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0,
})
const miles = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })

/** 1250000 → "$ 1.250.000" */
export function formatCOP(n: number): string {
  return cop.format(Math.round(n)).replace(/ /g, ' ')
}

/** 1250000 → "1.250.000" */
export function formatMiles(n: number): string {
  return miles.format(Math.round(n))
}

/** "1.250.000" → 1250000 (ignora todo lo que no sea dígito) */
export function parseMiles(texto: string): number {
  const digitos = texto.replace(/\D/g, '')
  return digitos ? Number(digitos) : 0
}

/** "2026-10-20" → "20 oct" */
export function fechaCorta(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number)
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', timeZone: 'UTC' })
    .format(new Date(Date.UTC(y, m - 1, d)))
    .replace('.', '')
}

/** Clases de color para el Total restante: verde si es positivo, rojo si es negativo */
export function colorRestante(n: number): string {
  return n >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
}
