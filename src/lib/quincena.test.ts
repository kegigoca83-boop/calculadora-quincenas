import { describe, expect, it } from 'vitest'
import { anterior, clave, quincenaActual, rangoTexto, siguiente, titulo } from './quincena'

describe('quincenas', () => {
  it('usa la hora de Bogotá (UTC-5)', () => {
    // 1 nov 2026 03:00 UTC = 31 oct 22:00 en Bogotá
    expect(quincenaActual(new Date('2026-11-01T03:00:00Z'))).toEqual({ year: 2026, month: 10, q: 2 })
    expect(quincenaActual(new Date('2026-10-16T04:59:00Z'))).toEqual({ year: 2026, month: 10, q: 1 })
    expect(quincenaActual(new Date('2026-10-16T05:00:00Z'))).toEqual({ year: 2026, month: 10, q: 2 })
  })
  it('arma el título y el rango', () => {
    const q = { year: 2026, month: 10, q: 2 as const }
    expect(`${titulo(q)} (${rangoTexto(q)})`).toBe('Quincena 2 · Octubre 2026 (16–31 oct)')
    expect(rangoTexto({ year: 2028, month: 2, q: 2 })).toBe('16–29 feb')
    expect(rangoTexto({ year: 2026, month: 2, q: 1 })).toBe('1–15 feb')
  })
  it('navega entre quincenas y años', () => {
    expect(siguiente({ year: 2026, month: 12, q: 2 })).toEqual({ year: 2027, month: 1, q: 1 })
    expect(anterior({ year: 2026, month: 1, q: 1 })).toEqual({ year: 2025, month: 12, q: 2 })
    expect(clave({ year: 2026, month: 3, q: 1 })).toBe('2026-03-Q1')
  })
})
