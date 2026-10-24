import { useState } from 'react'
import type { Item } from '../types'
import { nuevoId, suma } from '../lib/calc'
import { formatCOP } from '../lib/format'
import { MoneyInput } from './MoneyInput'

interface Props {
  items: Item[]
  onChange: (items: Item[]) => void
  /** Pagos: muestra fecha, "fijo" y botón de recordatorio */
  esPago?: boolean
  /** Si existe, muestra el botón 📅 en pagos con fecha */
  onRecordatorio?: (item: Item) => void
  etiquetaTotal: string
  placeholder: string
}

const inputBase =
  'rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-600 dark:bg-slate-800'

export function ItemList({ items, onChange, esPago, onRecordatorio, etiquetaTotal, placeholder }: Props) {
  const [desc, setDesc] = useState('')
  const [valor, setValor] = useState(0)
  const [fecha, setFecha] = useState('')

  const agregar = () => {
    if (!desc.trim() && !valor) return
    const nuevo: Item = { id: nuevoId(), descripcion: desc.trim(), valor, ...(esPago && fecha ? { fecha } : {}) }
    onChange([...items, nuevo])
    setDesc('')
    setValor(0)
    setFecha('')
  }

  const editar = (id: string, cambios: Partial<Item>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...cambios } : i)))

  const quitar = (id: string) => onChange(items.filter((i) => i.id !== id))

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-sm text-slate-400">Todavía no hay ítems.</p>}

      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.id} className="rounded-xl bg-slate-50 p-2 ring-1 ring-slate-200 dark:bg-slate-800/50 dark:ring-slate-700">
            <div className="flex gap-2">
              <input
                className={`${inputBase} min-w-0 flex-1`}
                value={i.descripcion}
                placeholder="Descripción"
                aria-label="Descripción"
                onChange={(e) => editar(i.id, { descripcion: e.target.value })}
              />
              <MoneyInput className="w-36 shrink-0" value={i.valor} ariaLabel="Valor" onChange={(v) => editar(i.id, { valor: v })} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              {esPago && (
                <>
                  <input
                    type="date"
                    aria-label="Fecha de pago"
                    className={`${inputBase} py-1.5 text-sm`}
                    value={i.fecha ?? ''}
                    onChange={(e) => editar(i.id, { fecha: e.target.value || undefined, eventoId: undefined })}
                  />
                  <button
                    onClick={() => editar(i.id, { fijo: !i.fijo })}
                    className={`rounded-full px-3 py-1.5 ${i.fijo ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' : 'bg-slate-200/70 text-slate-500 dark:bg-slate-700 dark:text-slate-300'}`}
                    title="Los gastos fijos se pueden copiar al siguiente periodo"
                  >
                    📌 {i.fijo ? 'Fijo' : 'Marcar fijo'}
                  </button>
                  {onRecordatorio && i.fecha && (
                    <button
                      onClick={() => onRecordatorio(i)}
                      className={`rounded-full px-3 py-1.5 ${i.eventoId ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200'}`}
                    >
                      {i.eventoId ? '✓ En calendario' : '📅 Recordatorio'}
                    </button>
                  )}
                </>
              )}
              <button onClick={() => quitar(i.id)} className="ml-auto rounded-full px-3 py-1.5 text-red-600 active:bg-red-50 dark:text-red-400" aria-label={`Eliminar ${i.descripcion}`}>
                🗑 Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form
        className="space-y-2 rounded-xl border-2 border-dashed border-slate-200 p-2 dark:border-slate-700"
        onSubmit={(e) => {
          e.preventDefault()
          agregar()
        }}
      >
        <div className="flex gap-2">
          <input className={`${inputBase} min-w-0 flex-1`} placeholder={placeholder} aria-label="Nueva descripción" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <MoneyInput className="w-36 shrink-0" value={valor} ariaLabel="Nuevo valor" onChange={setValor} />
        </div>
        <div className="flex gap-2">
          {esPago && (
            <input
              type="date"
              aria-label="Nueva fecha de pago (opcional)"
              className={`${inputBase} min-w-0 flex-1 py-2 text-sm`}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          )}
          <button type="submit" className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white active:bg-emerald-700">
            + Agregar
          </button>
        </div>
        {esPago && <p className="text-xs text-slate-400">La fecha es opcional.</p>}
      </form>

      <div className="flex justify-between px-1 text-sm font-medium">
        <span className="text-slate-500 dark:text-slate-400">{etiquetaTotal}</span>
        <span className="tabular-nums">{formatCOP(suma(items))}</span>
      </div>
    </div>
  )
}
