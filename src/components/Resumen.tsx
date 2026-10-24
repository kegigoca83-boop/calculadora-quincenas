import type { Resumen as R } from '../lib/calc'
import { colorRestante, formatCOP } from '../lib/format'
import { Card } from './Card'

export function Resumen({ r }: { r: R }) {
  const fila = (etiqueta: string, valor: number, clase = '') => (
    <div className={`flex justify-between py-1 ${clase}`}>
      <span className="text-slate-500 dark:text-slate-400">{etiqueta}</span>
      <span className="tabular-nums">{formatCOP(valor)}</span>
    </div>
  )
  return (
    <Card>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">Total restante</p>
      <p data-testid="restante" className={`text-center text-4xl font-extrabold tabular-nums ${colorRestante(r.restante)}`}>
        {formatCOP(r.restante)}
      </p>
      <div className="mt-3 border-t border-slate-100 pt-2 text-sm dark:border-slate-800">
        {fila('Ingresos', r.ingresos, 'font-medium')}
        {fila('Pagos Kenny (PK)', r.subtotalPK)}
        {fila('Pagos compartidos (PC)', r.subtotalPC)}
        {fila('Total gastos (GQ)', r.gq, 'font-medium')}
      </div>
    </Card>
  )
}
