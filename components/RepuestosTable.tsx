'use client'

import { useState } from 'react'

type Repuesto = {
  id: string
  numero_item: number | null
  nombre_es: string | null
  nombre_en: string | null
  codigo_original: string | null
  n_parte: string | null
  precio_ofertado: number | null
  proveedor: string | null
}

export default function RepuestosTable({ repuestos }: { repuestos: Repuesto[] }) {
  const [q, setQ] = useState('')

  if (!repuestos.length) {
    return <p className="text-center py-8 text-sm text-gray-400">Sin información</p>
  }

  const filtered = q
    ? repuestos.filter(r =>
        [r.nombre_es, r.nombre_en, r.codigo_original, r.n_parte, r.proveedor]
          .some(v => v?.toLowerCase().includes(q.toLowerCase()))
      )
    : repuestos

  return (
    <>
      <div className="px-5 py-3 border-b border-gray-100">
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar repuesto..."
          className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {!filtered.length ? (
        <p className="text-center py-8 text-sm text-gray-400">Sin resultados</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium text-gray-600">#</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-600">Nombre</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-600">Código</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-600">N° Parte</th>
              <th className="text-right px-4 py-2.5 font-medium text-gray-600">Precio</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-600">Proveedor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 text-gray-400">{r.numero_item}</td>
                <td className="px-4 py-2.5 text-gray-900">{r.nombre_es || r.nombre_en}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{r.codigo_original || '—'}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{r.n_parte || '—'}</td>
                <td className="px-4 py-2.5 text-right text-gray-900">
                  {r.precio_ofertado ? `$${Number(r.precio_ofertado).toLocaleString('es-CL')}` : '—'}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{r.proveedor || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
