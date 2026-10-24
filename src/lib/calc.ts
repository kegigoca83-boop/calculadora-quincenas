import type { Item, QuincenaData } from '../types'

export const suma = (items: Item[]) => items.reduce((t, i) => t + (Number(i.valor) || 0), 0)

export interface Resumen {
  ingresos: number
  totalTA: number
  subtotalPK: number
  subtotalPC: number
  gq: number
  restante: number
}

export function calcular(d: QuincenaData): Resumen {
  const totalTA = suma(d.ta)
  const ingresos = (Number(d.sq) || 0) + totalTA
  const subtotalPK = suma(d.pk)
  const subtotalPC = suma(d.pc)
  // Los pagos compartidos solo muestran su total: no cuentan en GQ ni se restan
  const gq = subtotalPK
  return { ingresos, totalTA, subtotalPK, subtotalPC, gq, restante: ingresos - gq }
}

export function vacia(): QuincenaData {
  return { sq: 0, ta: [], pk: [], pc: [] }
}

export function tieneDatos(d: QuincenaData | undefined): boolean {
  return !!d && (d.sq > 0 || d.ta.length > 0 || d.pk.length > 0 || d.pc.length > 0)
}

export function nuevoId(): string {
  // crypto.randomUUID solo existe en https/localhost; este respaldo sirve al probar por IP en la red local
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

/** Copia el sueldo y los gastos marcados como fijos (sin fecha ni evento de calendario) */
export function copiarFijos(origen: QuincenaData): QuincenaData {
  const copiar = (items: Item[]) =>
    items.filter((i) => i.fijo).map((i) => ({ id: nuevoId(), descripcion: i.descripcion, valor: i.valor, fijo: true }))
  return { sq: origen.sq, ta: [], pk: copiar(origen.pk), pc: copiar(origen.pc) }
}
