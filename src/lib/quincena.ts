export const ZONA = 'America/Bogota'

export interface Quincena {
  year: number
  /** 1 a 12 */
  month: number
  q: 1 | 2
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export function diasDelMes(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

/** Fecha de hoy (año, mes, día) en la zona horaria de Bogotá */
export function hoyBogota(ahora: Date = new Date()): { year: number; month: number; day: number } {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(ahora)
  const get = (t: string) => Number(partes.find((p) => p.type === t)?.value)
  return { year: get('year'), month: get('month'), day: get('day') }
}

export function quincenaDeFecha(year: number, month: number, day: number): Quincena {
  return { year, month, q: day <= 15 ? 1 : 2 }
}

export function quincenaActual(ahora: Date = new Date()): Quincena {
  const h = hoyBogota(ahora)
  return quincenaDeFecha(h.year, h.month, h.day)
}

export function clave(q: Quincena): string {
  return `${q.year}-${String(q.month).padStart(2, '0')}-Q${q.q}`
}

export function desdeClave(k: string): Quincena | null {
  const m = /^(\d{4})-(\d{2})-Q([12])$/.exec(k)
  if (!m) return null
  return { year: Number(m[1]), month: Number(m[2]), q: Number(m[3]) as 1 | 2 }
}

export function siguiente(q: Quincena): Quincena {
  if (q.q === 1) return { ...q, q: 2 }
  return q.month === 12 ? { year: q.year + 1, month: 1, q: 1 } : { year: q.year, month: q.month + 1, q: 1 }
}

export function anterior(q: Quincena): Quincena {
  if (q.q === 2) return { ...q, q: 1 }
  return q.month === 1 ? { year: q.year - 1, month: 12, q: 2 } : { year: q.year, month: q.month - 1, q: 2 }
}

export function iguales(a: Quincena, b: Quincena): boolean {
  return a.year === b.year && a.month === b.month && a.q === b.q
}

/** Primer y último día del mes que cubre la quincena */
export function rangoDias(q: Quincena): { desde: number; hasta: number } {
  return q.q === 1 ? { desde: 1, hasta: 15 } : { desde: 16, hasta: diasDelMes(q.year, q.month) }
}

const pad = (n: number) => String(n).padStart(2, '0')

export function fechaISO(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`
}

/** Fechas YYYY-MM-DD de inicio y fin (incluido) de la quincena */
export function rangoISO(q: Quincena): { inicio: string; fin: string } {
  const { desde, hasta } = rangoDias(q)
  return { inicio: fechaISO(q.year, q.month, desde), fin: fechaISO(q.year, q.month, hasta) }
}

/** "Quincena 2 · Octubre 2026" */
export function titulo(q: Quincena): string {
  return `Quincena ${q.q} · ${MESES[q.month - 1]} ${q.year}`
}

/** "16–31 oct" */
export function rangoTexto(q: Quincena): string {
  const { desde, hasta } = rangoDias(q)
  return `${desde}–${hasta} ${MESES_CORTOS[q.month - 1]}`
}

export function fechaEnQuincena(fecha: string, q: Quincena): boolean {
  const { inicio, fin } = rangoISO(q)
  return fecha >= inicio && fecha <= fin
}
