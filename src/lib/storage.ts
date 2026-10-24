import type { AppData, Item, QuincenaData } from '../types'
import { desdeClave } from './quincena'
import { nuevoId } from './calc'

const KEY = 'finanzas-quincenas:v1'

export function datosVacios(): AppData {
  return { version: 1, quincenas: {}, config: {} }
}

export function cargar(): AppData {
  try {
    const texto = localStorage.getItem(KEY)
    return texto ? normalizar(JSON.parse(texto)) : datosVacios()
  } catch {
    return datosVacios()
  }
}

export function guardar(datos: AppData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(datos))
  } catch {
    // almacenamiento lleno o bloqueado (modo privado): la app sigue en memoria
  }
}

export function exportarJSON(datos: AppData): string {
  return JSON.stringify({ ...datos, exportado: new Date().toISOString() }, null, 2)
}

/** Lee un respaldo. Lanza un Error con mensaje en español si el archivo no es válido. */
export function importarJSON(texto: string): AppData {
  let crudo: unknown
  try {
    crudo = JSON.parse(texto)
  } catch {
    throw new Error('El archivo no es un JSON válido.')
  }
  if (!crudo || typeof crudo !== 'object' || typeof (crudo as { quincenas?: unknown }).quincenas !== 'object') {
    throw new Error('El archivo no parece un respaldo de esta app (falta "quincenas").')
  }
  return normalizar(crudo)
}

function numero(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0
}

function items(v: unknown): Item[] {
  if (!Array.isArray(v)) return []
  return v
    .filter((i) => i && typeof i === 'object')
    .map((i) => ({
      id: typeof i.id === 'string' && i.id ? i.id : nuevoId(),
      descripcion: typeof i.descripcion === 'string' ? i.descripcion : '',
      valor: numero(i.valor),
      ...(typeof i.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(i.fecha) ? { fecha: i.fecha } : {}),
      ...(i.fijo ? { fijo: true } : {}),
      ...(typeof i.eventoId === 'string' ? { eventoId: i.eventoId } : {}),
    }))
}

function normalizar(crudo: unknown): AppData {
  const obj = crudo as { quincenas?: Record<string, Record<string, unknown>>; config?: Record<string, unknown> }
  const quincenas: Record<string, QuincenaData> = {}
  for (const [k, q] of Object.entries(obj.quincenas ?? {})) {
    if (!desdeClave(k) || !q || typeof q !== 'object') continue
    quincenas[k] = {
      sq: numero(q.sq),
      ta: items(q.ta),
      pk: items(q.pk),
      pc: items(q.pc),
      ...(q.copiaDescartada ? { copiaDescartada: true } : {}),
    }
  }
  return { version: 1, quincenas, config: { diasPagoCreados: !!obj.config?.diasPagoCreados } }
}
