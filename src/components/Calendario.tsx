import { useEffect, useState } from 'react'
import type { Quincena } from '../lib/quincena'
import { modoDe, nombrePeriodo, rangoISO } from '../lib/quincena'
import type { Evento } from '../lib/gcal'
import { SesionVencida, gcalConfigurado, listarEventos } from '../lib/gcal'
import { fechaCorta } from '../lib/format'
import { Card } from './Card'

interface Props {
  q: Quincena
  conectado: boolean
  recarga: number
  diasPagoCreados: boolean
  onConectar: () => void
  onDesconectar: () => void
  onCrearDiasPago: () => void
  onSesionVencida: () => void
}

export function Calendario({ q, conectado, recarga, diasPagoCreados, onConectar, onDesconectar, onCrearDiasPago, onSesionVencida }: Props) {
  const [eventos, setEventos] = useState<Evento[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { inicio, fin } = rangoISO(q)
  const periodo = nombrePeriodo(modoDe(q))
  const delPeriodo = periodo === 'mes' ? 'del mes' : 'de la quincena'

  useEffect(() => {
    if (!conectado) return
    let vigente = true
    setEventos(null)
    setError(null)
    listarEventos(inicio, fin)
      .then((e) => vigente && setEventos(e))
      .catch((e: Error) => {
        if (!vigente) return
        if (e instanceof SesionVencida) onSesionVencida()
        else setError(e.message)
      })
    return () => {
      vigente = false
    }
  }, [conectado, inicio, fin, recarga, onSesionVencida])

  if (!gcalConfigurado) {
    return (
      <Card titulo="📅 Google Calendar">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          El calendario está desactivado. Para activarlo, crea el archivo <code>.env.local</code> con tu{' '}
          <code>VITE_GOOGLE_CLIENT_ID</code> (las instrucciones están en el README). La app funciona igual sin él.
        </p>
      </Card>
    )
  }

  if (!conectado) {
    return (
      <Card titulo="📅 Google Calendar">
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Conecta tu calendario para ver tus eventos {delPeriodo} y crear recordatorios de pago. Es opcional.
        </p>
        <button onClick={onConectar} className="w-full rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white active:bg-sky-700">
          Conectar Google Calendar
        </button>
      </Card>
    )
  }

  return (
    <Card
      titulo={`📅 Eventos ${delPeriodo}`}
      extra={<button onClick={onDesconectar} className="text-sm text-slate-500 underline">Desconectar</button>}
    >
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!eventos && !error && <p className="text-sm text-slate-400">Cargando eventos…</p>}
      {eventos?.length === 0 && <p className="text-sm text-slate-400">No tienes eventos en {periodo === 'mes' ? 'este mes' : 'esta quincena'}.</p>}
      {eventos && eventos.length > 0 && (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {eventos.map((e) => (
            <li key={e.id} className="flex gap-3 py-2 text-sm">
              <span className="w-20 shrink-0 text-slate-500 dark:text-slate-400">
                {fechaCorta(e.fecha)}
                {e.hora && <span className="block text-xs">{e.hora}</span>}
              </span>
              <a href={e.enlace} target="_blank" rel="noreferrer" className="min-w-0 flex-1 break-words">
                {e.titulo}
              </a>
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={onCrearDiasPago}
        className="mt-3 w-full rounded-xl bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-800 ring-1 ring-sky-200 active:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-200 dark:ring-sky-800"
      >
        {diasPagoCreados
          ? '✓ Días de pago creados (crear de nuevo)'
          : periodo === 'mes'
            ? '💰 Crear día de pago del sueldo (último día del mes)'
            : '💰 Crear días de pago del sueldo (15 y último día)'}
      </button>
    </Card>
  )
}
