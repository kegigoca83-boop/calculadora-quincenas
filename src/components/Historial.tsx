import type { AppData } from '../types'
import { calcular, tieneDatos } from '../lib/calc'
import type { Quincena } from '../lib/quincena'
import { clave, desdeClave, modoDe, rangoTexto, titulo } from '../lib/quincena'
import { colorRestante, formatCOP } from '../lib/format'
import { Card } from './Card'

export function Historial({ datos, actual, onIr }: { datos: AppData; actual: Quincena; onIr: (q: Quincena) => void }) {
  const filas = Object.entries(datos.quincenas)
    .filter(([, d]) => tieneDatos(d))
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([k, d]) => ({ q: desdeClave(k)!, k, restante: calcular(d).restante }))
    // Solo los periodos del modo que se está usando (quincenas o meses)
    .filter((f) => modoDe(f.q) === modoDe(actual))

  return (
    <Card titulo="🕑 Historial">
      {filas.length === 0 ? (
        <p className="text-sm text-slate-400">Aún no hay {modoDe(actual) === 'mensual' ? 'meses guardados' : 'quincenas guardadas'}.</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {filas.map((f) => (
            <li key={f.k}>
              <button onClick={() => onIr(f.q)} className="flex w-full items-center justify-between gap-2 py-2.5 text-left">
                <span className={clave(actual) === f.k ? 'font-semibold' : ''}>
                  {titulo(f.q)}
                  <span className="block text-xs text-slate-400">{rangoTexto(f.q)}</span>
                </span>
                <span className={`font-semibold tabular-nums ${colorRestante(f.restante)}`}>{formatCOP(f.restante)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
