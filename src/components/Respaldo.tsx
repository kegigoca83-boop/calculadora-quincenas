import { useRef } from 'react'
import type { AppData } from '../types'
import { exportarJSON, importarJSON } from '../lib/storage'
import { fechaISO, hoyBogota } from '../lib/quincena'
import { Card } from './Card'

export function Respaldo({ datos, onImportar, avisar }: { datos: AppData; onImportar: (d: AppData) => void; avisar: (m: string) => void }) {
  const archivo = useRef<HTMLInputElement>(null)

  const exportar = () => {
    const blob = new Blob([exportarJSON(datos)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const h = hoyBogota()
    const a = document.createElement('a')
    a.href = url
    a.download = `finanzas-quincenas-${fechaISO(h.year, h.month, h.day)}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const importar = async (f: File) => {
    try {
      const nuevos = importarJSON(await f.text())
      const n = Object.keys(nuevos.quincenas).length
      if (!confirm(`El respaldo tiene ${n} quincena(s). Esto reemplaza los datos actuales de este dispositivo. ¿Continuar?`)) return
      onImportar(nuevos)
      avisar('Datos importados ✓')
    } catch (e) {
      avisar((e as Error).message)
    }
  }

  return (
    <Card titulo="💾 Respaldo">
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
        Tus datos se guardan solo en este dispositivo. Exporta un respaldo de vez en cuando o para pasarlos a otro equipo.
      </p>
      <div className="flex gap-2">
        <button onClick={exportar} className="flex-1 rounded-xl bg-slate-800 px-4 py-2.5 font-semibold text-white active:bg-slate-900 dark:bg-slate-200 dark:text-slate-900">
          Exportar JSON
        </button>
        <button onClick={() => archivo.current?.click()} className="flex-1 rounded-xl px-4 py-2.5 font-semibold ring-1 ring-slate-300 active:bg-slate-100 dark:ring-slate-600 dark:active:bg-slate-800">
          Importar JSON
        </button>
      </div>
      <input
        ref={archivo}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) importar(f)
          e.target.value = ''
        }}
      />
    </Card>
  )
}
