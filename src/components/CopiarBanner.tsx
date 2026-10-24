import type { QuincenaData } from '../types'
import { formatCOP } from '../lib/format'

export function CopiarBanner({ anterior, periodo, onCopiar, onDescartar }: { anterior: QuincenaData; periodo: string; onCopiar: () => void; onDescartar: () => void }) {
  const nuevo = periodo === 'mes' ? 'Mes nuevo' : 'Quincena nueva'
  const previo = periodo === 'mes' ? 'del mes anterior' : 'de la quincena anterior'
  const fijos = anterior.pk.filter((i) => i.fijo).length + anterior.pc.filter((i) => i.fijo).length
  return (
    <div className="rounded-2xl bg-amber-50 p-4 text-amber-900 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-100 dark:ring-amber-800">
      <p className="font-semibold">{nuevo}</p>
      <p className="mt-1 text-sm">
        ¿Copiar {previo} el sueldo ({formatCOP(anterior.sq)})
        {fijos > 0 ? ` y ${fijos} gasto(s) fijo(s)` : ''}?
      </p>
      {fijos === 0 && (
        <p className="mt-1 text-xs opacity-80">Consejo: marca tus gastos con “📌 Fijo” para que también se copien.</p>
      )}
      <div className="mt-3 flex gap-2">
        <button onClick={onCopiar} className="flex-1 rounded-xl bg-amber-500 px-4 py-2 font-semibold text-white active:bg-amber-600">
          Sí, copiar
        </button>
        <button onClick={onDescartar} className="flex-1 rounded-xl px-4 py-2 font-semibold ring-1 ring-amber-300 dark:ring-amber-700">
          Empezar vacía
        </button>
      </div>
    </div>
  )
}
