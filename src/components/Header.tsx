import type { Modo, Quincena } from '../lib/quincena'
import { modoDe, nombrePeriodo, rangoTexto, titulo } from '../lib/quincena'

interface Props {
  q: Quincena
  esActual: boolean
  onAnterior: () => void
  onSiguiente: () => void
  onHoy: () => void
  onModo: (m: Modo) => void
}

export function Header({ q, esActual, onAnterior, onSiguiente, onHoy, onModo }: Props) {
  const modo = modoDe(q)
  const periodo = nombrePeriodo(modo)
  const opcion = (m: Modo, texto: string) => (
    <button
      onClick={() => onModo(m)}
      aria-pressed={modo === m}
      className={`rounded-full px-4 py-1 text-sm font-semibold ${modo === m ? 'bg-white text-emerald-700' : 'text-white/80'}`}
    >
      {texto}
    </button>
  )
  const flecha = 'grid size-11 shrink-0 place-items-center rounded-full bg-white/15 text-2xl active:bg-white/30'
  return (
    <header className="bg-gradient-to-br from-emerald-600 to-teal-700 px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top))] text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-3 flex justify-center">
          <div className="flex rounded-full bg-white/15 p-1">
            {opcion('quincenal', 'Quincenal')}
            {opcion('mensual', 'Mensual')}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <button className={flecha} onClick={onAnterior} aria-label={`${periodo} anterior`}>‹</button>
          <div className="text-center">
            <h1 className="text-2xl font-bold leading-tight">{titulo(q)}</h1>
            <p className="text-emerald-100">({rangoTexto(q)})</p>
          </div>
          <button className={flecha} onClick={onSiguiente} aria-label={`${periodo} siguiente`}>›</button>
        </div>
        <div className="mt-2 flex justify-center">
          {esActual ? (
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">{modo === 'mensual' ? 'Mes actual' : 'Quincena actual'}</span>
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
