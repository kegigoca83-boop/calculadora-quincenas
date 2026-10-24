import { formatMiles, parseMiles } from '../lib/format'

interface Props {
  value: number
  onChange: (v: number) => void
  placeholder?: string
  className?: string
  ariaLabel?: string
  grande?: boolean
}

/** Campo de dinero que muestra separador de miles mientras escribes: 1.250.000 */
export function MoneyInput({ value, onChange, placeholder = '0', className = '', ariaLabel, grande }: Props) {
  return (
    <div className={`flex items-center rounded-xl border border-slate-300 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/30 dark:border-slate-600 dark:bg-slate-800 ${className}`}>
      <span className={`pl-3 text-slate-400 ${grande ? 'text-xl' : ''}`}>$</span>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value ? formatMiles(value) : ''}
        onChange={(e) => onChange(parseMiles(e.target.value))}
        className={`w-full min-w-0 bg-transparent px-2 py-2.5 text-right tabular-nums outline-none ${grande ? 'text-2xl font-semibold' : ''}`}
      />
    </div>
  )
}
