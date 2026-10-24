// Integración con Google Calendar usando Google Identity Services (OAuth en el navegador).
// No hay servidor: el token vive solo en esta pestaña (sessionStorage) y dura ~1 hora.
import type { Item } from '../types'
import { ZONA, diasDelMes, fechaISO, hoyBogota } from './quincena'
import { formatMiles } from './format'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const SCOPE = 'https://www.googleapis.com/auth/calendar.events'
const API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'
const TOKEN_KEY = 'gcal-token'
const YA_CONECTO_KEY = 'gcal-ya-conecto'

export const gcalConfigurado = !!CLIENT_ID

interface TokenResponse {
  access_token?: string
  expires_in?: number
  error?: string
}
interface TokenClient {
  callback: (r: TokenResponse) => void
  error_callback?: (e: { type: string }) => void
  requestAccessToken: (o?: { prompt?: string }) => void
}
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (c: {
            client_id: string
            scope: string
            callback: (r: TokenResponse) => void
            error_callback?: (e: { type: string }) => void
          }) => TokenClient
          revoke: (token: string, done?: () => void) => void
        }
      }
    }
  }
}

export interface Evento {
  id: string
  titulo: string
  /** YYYY-MM-DD */
  fecha: string
  /** "09:00" o null si es de todo el día */
  hora: string | null
  enlace?: string
}

let tokenClient: TokenClient | null = null
let cargaScript: Promise<void> | null = null

function leerToken(): string | null {
  try {
    const t = JSON.parse(sessionStorage.getItem(TOKEN_KEY) ?? 'null') as { v: string; exp: number } | null
    return t && t.exp > Date.now() ? t.v : null
  } catch {
    return null
  }
}

function guardarToken(v: string | null, segundos = 3600) {
  try {
    if (v) sessionStorage.setItem(TOKEN_KEY, JSON.stringify({ v, exp: Date.now() + (segundos - 60) * 1000 }))
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    /* sin almacenamiento: el token queda solo en memoria del cliente de Google */
  }
}

export function estaConectado(): boolean {
  return !!leerToken()
}

/** Carga el script de Google. Se llama al abrir la app para que el botón de conectar abra la ventana al instante. */
export function prepararGoogle(): Promise<void> {
  if (!CLIENT_ID) return Promise.reject(new Error('Falta VITE_GOOGLE_CLIENT_ID en el archivo .env.local'))
  if (!cargaScript) {
    cargaScript = new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.async = true
      s.onload = () => {
        tokenClient = window.google!.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPE,
          callback: () => {},
        })
        resolve()
      }
      s.onerror = () => {
        cargaScript = null
        reject(new Error('No se pudo cargar Google. Revisa tu conexión a internet.'))
      }
      document.head.appendChild(s)
    })
  }
  return cargaScript
}

/** Abre la ventana de Google para dar permiso. Debe llamarse directo desde un clic. */
export function conectar(): Promise<void> {
  if (!tokenClient) return prepararGoogle().then(() => conectar())
  const cliente = tokenClient
  return new Promise((resolve, reject) => {
    cliente.callback = (r) => {
      if (r.error || !r.access_token) return reject(new Error('Google no dio permiso: ' + (r.error ?? 'sin token')))
      guardarToken(r.access_token, r.expires_in)
      try { localStorage.setItem(YA_CONECTO_KEY, '1') } catch { /* sin almacenamiento */ }
      resolve()
    }
    cliente.error_callback = (e) =>
      reject(new Error(e.type === 'popup_closed' ? 'Cerraste la ventana de Google.' : 'No se pudo abrir la ventana de Google (¿bloqueador de ventanas?).'))
    let yaConecto = false
    try { yaConecto = localStorage.getItem(YA_CONECTO_KEY) === '1' } catch { /* sin almacenamiento */ }
    cliente.requestAccessToken({ prompt: yaConecto ? '' : 'consent' })
  })
}

export function desconectar(): void {
  const t = leerToken()
  if (t) window.google?.accounts.oauth2.revoke(t)
  guardarToken(null)
  try { localStorage.removeItem(YA_CONECTO_KEY) } catch { /* sin almacenamiento */ }
}

export class SesionVencida extends Error {
  constructor() {
    super('La conexión con Google venció. Vuelve a conectar.')
  }
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const token = leerToken()
  if (!token) throw new SesionVencida()
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init?.headers },
  })
  if (res.status === 401) {
    guardarToken(null)
    throw new SesionVencida()
  }
  if (!res.ok) throw new Error(`Google Calendar respondió ${res.status}`)
  return res.json() as Promise<T>
}

function diaSiguiente(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number)
  const f = new Date(Date.UTC(y, m - 1, d + 1))
  return fechaISO(f.getUTCFullYear(), f.getUTCMonth() + 1, f.getUTCDate())
}

/** Eventos del calendario principal entre dos fechas (incluidas) */
export async function listarEventos(inicio: string, fin: string): Promise<Evento[]> {
  const params = new URLSearchParams({
    timeMin: `${inicio}T00:00:00-05:00`,
    timeMax: `${diaSiguiente(fin)}T00:00:00-05:00`,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '100',
    timeZone: ZONA,
  })
  type Resp = {
    items?: { id: string; summary?: string; htmlLink?: string; start: { date?: string; dateTime?: string } }[]
  }
  const r = await api<Resp>(`${API}?${params}`)
  return (r.items ?? []).map((e) => {
    // dateTime viene como "2026-10-20T09:00:00-05:00" porque pedimos timeZone=America/Bogota
    const dt = e.start.dateTime
    return {
      id: e.id,
      titulo: e.summary ?? '(sin título)',
      fecha: dt ? dt.slice(0, 10) : (e.start.date ?? ''),
      hora: dt ? dt.slice(11, 16) : null,
      enlace: e.htmlLink,
    }
  })
}

/** Crea "Pago: Arriendo – $1.250.000" el día del pago a las 9:00, con avisos el día antes y 1 hora antes */
export async function crearRecordatorioPago(item: Item): Promise<string> {
  if (!item.fecha) throw new Error('Este pago no tiene fecha.')
  const r = await api<{ id: string }>(API, {
    method: 'POST',
    body: JSON.stringify({
      summary: `Pago: ${item.descripcion || 'sin descripción'} – $${formatMiles(item.valor)}`,
      description: 'Creado desde la Calculadora de Finanzas',
      start: { dateTime: `${item.fecha}T09:00:00`, timeZone: ZONA },
      end: { dateTime: `${item.fecha}T09:30:00`, timeZone: ZONA },
      reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 1440 }, { method: 'popup', minutes: 60 }] },
    }),
  })
  return r.id
}

/** Crea eventos de todo el día que se repiten cada mes: el 15 (solo en modo quincenal) y el último día del mes */
export async function crearDiasDePago(mensual = false): Promise<void> {
  const hoy = hoyBogota()
  const sigMes = hoy.month === 12 ? { year: hoy.year + 1, month: 1 } : { year: hoy.year, month: hoy.month + 1 }
  const primer15 = hoy.day <= 15 ? fechaISO(hoy.year, hoy.month, 15) : fechaISO(sigMes.year, sigMes.month, 15)
  const primerUltimo = fechaISO(hoy.year, hoy.month, diasDelMes(hoy.year, hoy.month))
  const evento = (fecha: string, regla: string, titulo: string) => ({
    summary: titulo,
    description: 'Creado desde la Calculadora de Finanzas',
    start: { date: fecha },
    end: { date: diaSiguiente(fecha) },
    recurrence: [regla],
    reminders: { useDefault: true },
  })
  if (mensual) {
    await api(API, { method: 'POST', body: JSON.stringify(evento(primerUltimo, 'RRULE:FREQ=MONTHLY;BYMONTHDAY=-1', '💰 Día de pago')) })
    return
  }
  await api(API, { method: 'POST', body: JSON.stringify(evento(primer15, 'RRULE:FREQ=MONTHLY;BYMONTHDAY=15', '💰 Día de pago (quincena 1)')) })
  await api(API, { method: 'POST', body: JSON.stringify(evento(primerUltimo, 'RRULE:FREQ=MONTHLY;BYMONTHDAY=-1', '💰 Día de pago (quincena 2)')) })
}
