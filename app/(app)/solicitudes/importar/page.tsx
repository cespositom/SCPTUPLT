'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ImportState = 'idle' | 'preview' | 'loading' | 'success' | 'error'

export default function ImportarPage() {
  const [raw, setRaw] = useState('')
  const [state, setState] = useState<ImportState>('idle')
  const [parsed, setParsed] = useState<any>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  function handleParse() {
    try {
      const data = JSON.parse(raw)
      if (!data.solicitud || !data.vehiculo) throw new Error('Faltan campos solicitud o vehiculo')
      setParsed(data)
      setState('preview')
      setError('')
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function handleImport() {
    setState('loading')
    const res = await fetch('/api/importar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    })
    const data = await res.json()
    if (res.ok) {
      setState('success')
      setTimeout(() => router.push(`/solicitudes/${data.id}`), 1500)
    } else {
      setError(data.error || 'Error al importar')
      setState('error')
    }
  }

  const s = parsed?.solicitud
  const v = parsed?.vehiculo
  const repuestos = parsed?.repuestos ?? []

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Importar JSON</h1>
        <p className="text-sm text-gray-500 mt-0.5">Pega el JSON de la solicitud para registrarla</p>
      </div>

      {(state === 'idle' || state === 'error') && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <textarea
            value={raw}
            onChange={e => setRaw(e.target.value)}
            placeholder='{ "solicitud": {...}, "vehiculo": {...}, "repuestos": [...] }'
            className="w-full h-64 font-mono text-xs border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            onClick={handleParse}
            disabled={!raw.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Previsualizar
          </button>
        </div>
      )}

      {state === 'preview' && parsed && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase mb-3">Solicitud</h2>
              <dl className="space-y-1.5 text-sm">
                <Row label="N°" value={s.nro_solicitud} />
                <Row label="Siniestro" value={s.nro_siniestro} />
                <Row label="Liquidador" value={s.liquidador} />
                <Row label="Región" value={s.region_taller} />
                <Row label="Fecha" value={s.fecha_solicitud} />
                <Row label="Tipo compra" value={s.tipo_compra} />
              </dl>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase mb-3">Vehículo</h2>
              <dl className="space-y-1.5 text-sm">
                <Row label="Marca" value={v.marca} />
                <Row label="Modelo" value={v.modelo} />
                <Row label="Año" value={String(v.año)} />
                <Row label="Patente" value={v.patente} />
                <Row label="VIN" value={v.vin} />
                <Row label="Catálogo" value={v.catalogo} />
              </dl>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Repuestos ({repuestos.length})</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Nombre ES</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Nombre EN</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Código OEM</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Variante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {repuestos.map((r: any, i: number) => (
                  <tr key={i}>
                    <td className="px-4 py-2.5">{r.nombre_es}</td>
                    <td className="px-4 py-2.5 text-gray-500">{r.nombre_en}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{r.codigo_oem}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{r.variante}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleImport}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Importar
            </button>
            <button
              onClick={() => setState('idle')}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Editar
            </button>
          </div>
        </div>
      )}

      {state === 'loading' && (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-600 text-sm">Importando...</p>
        </div>
      )}

      {state === 'success' && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-gray-700 font-medium">Solicitud importada</p>
          <p className="text-sm text-gray-400 mt-1">Redirigiendo...</p>
        </div>
      )}

      {state === 'error' && (
        <div className="mt-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium">{value || '—'}</dd>
    </div>
  )
}
