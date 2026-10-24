import type { Quincena } from '../lib/quincena'
import { rangoTexto, titulo } from '../lib/quincena'

interface Props {
  q: Quincena
  esActual: boolean
  onAnterior: () => void
  onSiguiente: () => void
  onHoy: () => void
}

export function Header({ q, esActual, onAnterior, onSiguiente, onHoy }: Props) {
  const flecha = 'grid size-11 shrink-0 place-items-center rounded-full bg-white/15 text-2xl active:bg-white/30'
  return (
    <header className="bg-gradient-to-br from-emerald-600 to-teal-700 px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top))] text-white">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between gap-2">
          <button className={flecha} onClick={onAnterior} aria-label="Quincena anterior">‹</button>
          <div className="text-center">
            <h1 className="text-2xl font-bold leading-tight">{titulo(q)}</h1>
            <p className="text-emerald-100">({rangoTexto(q)})</p>
          </div>
          <button className={flecha} onClick={onSiguiente} aria-label="Quincena siguiente">›</button>
        </div>
        <div className="mt-2 flex justify-center">
          {esActual ? (
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">Quincena actual</span>
          ) : (
            <button onClick={onHoy} className="rounded-full bg-white px-4 py-1 text-sm font-semibold text-emerald-700 active:bg-emerald-50">
              Hoy
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
