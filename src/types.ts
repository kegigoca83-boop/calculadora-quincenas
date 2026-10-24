export interface Item {
  id: string
  descripcion: string
  valor: number
  /** Fecha de pago opcional, formato YYYY-MM-DD */
  fecha?: string
  /** Si es fijo, se ofrece copiarlo a la quincena siguiente */
  fijo?: boolean
  /** Id del evento creado en Google Calendar */
  eventoId?: string
}

export interface QuincenaData {
  sq: number
  ta: Item[]
  pk: Item[]
  pc: Item[]
  /** El usuario ya dijo "no" a copiar la quincena anterior */
  copiaDescartada?: boolean
}

export interface AppData {
  version: 1
  quincenas: Record<string, QuincenaData>
  config: {
    diasPagoCreados?: boolean
  }
}

export type ListaGasto = 'pk' | 'pc'
