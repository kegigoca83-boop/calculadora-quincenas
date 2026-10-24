import { useCallback, useEffect, useState } from 'react'
import type { AppData, Item, ListaGasto, QuincenaData } from './types'
import { calcular, copiarFijos, tieneDatos, vacia } from './lib/calc'
import { anterior, clave, iguales, quincenaActual, siguiente } from './lib/quincena'
import type { Quincena } from './lib/quincena'
import { cargar, guardar } from './lib/storage'
import { colorRestante, formatCOP } from './lib/format'
import {
  SesionVencida, conectar, crearDiasDePago, crearRecordatorioPago, desconectar, estaConectado, gcalConfigurado, prepararGoogle,
} from './lib/gcal'
import { Header } from './components/Header'
import { Resumen } from './components/Resumen'
import { Card } from './components/Card'
import { MoneyInput } from './components/MoneyInput'
import { ItemList } from './components/ItemList'
import { CopiarBanner } from './components/CopiarBanner'
import { Calendario } from './components/Calendario'
import { Historial } from './components/Historial'
import { Respaldo } from './components/Respaldo'

export default function App() {
  const [datos, setDatos] = useState<AppData>(cargar)
  const [q, setQ] = useState<Quincena>(() => quincenaActual())
  const [pestana, setPestana] = useState<ListaGasto>('pk')
  const [gcalOk, setGcalOk] = useState(estaConectado)
  const [recarga, setRecarga] = useState(0)
  const [aviso, setAviso] = useState<string | null>(null)

  useEffect(() => guardar(datos), [datos])
  useEffect(() => {
    if (gcalConfigurado) prepararGoogle().catch(() => {})
  }, [])
  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 3500)
    return () => clearTimeout(t)
  }, [aviso])

  const k = clave(q)
  const actual = datos.quincenas[k] ?? vacia()
  const previa = datos.quincenas[clave(anterior(q))]
  const r = calcular(actual)
  const esActual = iguales(q, quincenaActual())

  const actualizar = (fn: (d: QuincenaData) => QuincenaData) =>
    setDatos((prev) => ({ ...prev, quincenas: { ...prev.quincenas, [k]: fn(prev.quincenas[k] ?? vacia()) } }))

  const mostrarCopia =
    !tieneDatos(actual) && !actual.copiaDescartada && !!previa && (previa.sq > 0 || [...previa.pk, ...previa.pc].some((i) => i.fijo))

  const sesionVencida = useCallback(() => setGcalOk(false), [])

  const fallo = (e: unknown) => {
    if (e instanceof SesionVencida) setGcalOk(false)
    setAviso((e as Error).message)
  }

  const conectarCalendario = async () => {
    try {
      await conectar()
      setGcalOk(true)
      setAviso('Google Calendar conectado ✓')
    } catch (e) {
      fallo(e)
    }
  }

  const recordatorio = async (lista: ListaGasto, item: Item) => {
    if (item.eventoId && !confirm('Ya creaste un recordatorio para este pago. ¿Crear otro?')) return
    try {
      if (!estaConectado()) {
        await conectar()
        setGcalOk(true)
      }
      const id = await crearRecordatorioPago(item)
      actualizar((d) => ({ ...d, [lista]: d[lista].map((i) => (i.id === item.id ? { ...i, eventoId: id } : i)) }))
      setRecarga((n) => n + 1)
      setAviso('Recordatorio creado en tu Google Calendar ✓')
    } catch (e) {
      fallo(e)
    }
  }

  const diasPago = async () => {
    if (datos.config.diasPagoCreados && !confirm('Ya los creaste antes. ¿Crearlos otra vez? (quedarían repetidos)')) return
    try {
      await crearDiasDePago()
      setDatos((d) => ({ ...d, config: { ...d.config, diasPagoCreados: true } }))
      setRecarga((n) => n + 1)
      setAviso('Días de pago creados: se repiten cada mes ✓')
    } catch (e) {
      fallo(e)
    }
  }

  const tab = (id: ListaGasto, texto: string, total: number) => (
    <button
      onClick={() => setPestana(id)}
      className={`flex-1 rounded-lg px-2 py-2 text-sm font-semibold ${pestana === id ? 'bg-white shadow-sm dark:bg-slate-700' : 'text-slate-500 dark:text-slate-400'}`}
    >
      {texto}
      <span className="block text-xs font-normal tabular-nums">{formatCOP(total)}</span>
    </button>
  )

  return (
    <div className="min-h-dvh bg-slate-100 pb-24 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header
        q={q}
        esActual={esActual}
        onAnterior={() => setQ(anterior(q))}
        onSiguiente={() => setQ(siguiente(q))}
        onHoy={() => setQ(quincenaActual())}
      />

      <main className="mx-auto -mt-2 max-w-md space-y-4 px-4">
        {mostrarCopia && previa && (
          <CopiarBanner
            anterior={previa}
            onCopiar={() => actualizar(() => copiarFijos(previa))}
            onDescartar={() => actualizar((d) => ({ ...d, copiaDescartada: true }))}
          />
        )}

        <Resumen r={r} />

        <Card titulo="💵 Ingresos">
          <label className="mb-1 block text-sm text-slate-500 dark:text-slate-400">Sueldo quincenal (SQ)</label>
          <MoneyInput grande value={actual.sq} ariaLabel="Sueldo quincenal" onChange={(v) => actualizar((d) => ({ ...d, sq: v }))} />
          <h3 className="mb-2 mt-4 text-sm font-semibold">Trabajos adicionales (TA)</h3>
          <ItemList
            items={actual.ta}
            onChange={(ta) => actualizar((d) => ({ ...d, ta }))}
            etiquetaTotal="Subtotal TA"
            placeholder="Ej: Diseño logo"
          />
          <div className="mt-3 flex justify-between border-t border-slate-100 px-1 pt-3 font-semibold dark:border-slate-800">
            <span>Ingresos</span>
            <span className="tabular-nums">{formatCOP(r.ingresos)}</span>
          </div>
        </Card>

        <Card titulo="🧾 Gastos quincenales (GQ)">
          <div className="mb-3 flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {tab('pk', 'Pagos Kenny', r.subtotalPK)}
            {tab('pc', 'Pagos compartidos', r.subtotalPC)}
          </div>
          <ItemList
            key={pestana}
            esPago
            items={actual[pestana]}
            onChange={(items) => actualizar((d) => ({ ...d, [pestana]: items }))}
            onRecordatorio={gcalConfigurado ? (item) => recordatorio(pestana, item) : undefined}
            etiquetaTotal={pestana === 'pk' ? 'Subtotal PK' : 'Subtotal PC'}
            placeholder={pestana === 'pk' ? 'Ej: Celular' : 'Ej: Arriendo'}
          />
        </Card>

        <Calendario
          q={q}
          conectado={gcalOk}
          recarga={recarga}
          diasPagoCreados={!!datos.config.diasPagoCreados}
          onConectar={conectarCalendario}
          onDesconectar={() => {
            desconectar()
            setGcalOk(false)
          }}
          onCrearDiasPago={diasPago}
          onSesionVencida={sesionVencida}
        />

        <Historial datos={datos} actual={q} onIr={(destino) => { setQ(destino); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />

        <Respaldo datos={datos} onImportar={setDatos} avisar={setAviso} />

        <p className="pb-2 text-center text-xs text-slate-400">Datos guardados solo en este dispositivo · Hora de Bogotá</p>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">Total restante</span>
          <span className={`text-xl font-bold tabular-nums ${colorRestante(r.restante)}`}>{formatCOP(r.restante)}</span>
        </div>
      </div>

      {aviso && (
        <div role="status" className="fixed inset-x-4 bottom-20 z-10 mx-auto max-w-md rounded-xl bg-slate-900 px-4 py-3 text-center text-sm text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
          {aviso}
        </div>
      )}
    </div>
  )
}
