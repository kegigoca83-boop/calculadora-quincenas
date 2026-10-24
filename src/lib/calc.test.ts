import { describe, expect, it } from 'vitest'
import { calcular, copiarFijos } from './calc'
import { formatCOP, parseMiles } from './format'
import { importarJSON } from './storage'

const d = {
  sq: 2_000_000,
  ta: [{ id: '1', descripcion: 'Logo', valor: 300_000 }],
  pk: [{ id: '2', descripcion: 'Celular', valor: 80_000, fijo: true, fecha: '2026-10-20', eventoId: 'x' }],
  pc: [{ id: '3', descripcion: 'Arriendo', valor: 1_500_000, fijo: true }, { id: '4', descripcion: 'Mercado', valor: 900_000 }],
}

describe('cálculos', () => {
  it('suma ingresos, gastos y restante', () => {
    expect(calcular(d)).toEqual({ ingresos: 2_300_000, totalTA: 300_000, subtotalPK: 80_000, subtotalPC: 2_400_000, gq: 80_000, restante: 2_220_000 })
  })
  it('copia sueldo y solo gastos fijos, sin fecha ni evento', () => {
    const c = copiarFijos(d)
    expect(c.sq).toBe(2_000_000)
    expect(c.ta).toEqual([])
    expect(c.pk.map((i) => [i.descripcion, i.fecha, i.eventoId])).toEqual([['Celular', undefined, undefined]])
    expect(c.pc.map((i) => i.descripcion)).toEqual(['Arriendo'])
  })
  it('formatea pesos colombianos', () => {
    expect(formatCOP(1_250_000)).toBe('$ 1.250.000')
    expect(formatCOP(-35_000)).toBe('-$ 35.000')
    expect(parseMiles('1.250.000')).toBe(1_250_000)
  })
  it('importa un respaldo y rechaza basura', () => {
    const r = importarJSON(JSON.stringify({ version: 1, quincenas: { '2026-10-Q2': d, malo: {} }, config: {} }))
    expect(Object.keys(r.quincenas)).toEqual(['2026-10-Q2'])
    expect(calcular(r.quincenas['2026-10-Q2']).restante).toBe(2_220_000)
    expect(() => importarJSON('hola')).toThrow('JSON válido')
    expect(() => importarJSON('{}')).toThrow('quincenas')
  })
})
