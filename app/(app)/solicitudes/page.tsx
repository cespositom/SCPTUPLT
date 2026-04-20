import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import GestionadoToggle from '@/components/GestionadoToggle'

const ESTADOS: Record<string, { label: string; color: string }> = {
  pendiente:   { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-800' },
  en_proceso:  { label: 'En proceso',  color: 'bg-blue-100 text-blue-800' },
  cotizada:    { label: 'Cotizada',    color: 'bg-green-100 text-green-800' },
  cerrada:     { label: 'Cerrada',     color: 'bg-gray-100 text-gray-700' },
}

export default async function SolicitudesPage() {
  const supabase = await createClient()

  const { data: solicitudes } = await supabase
    .from('solicitudes')
    .select('id, n_solicitud, marca, modelo, anio, patente, region_taller, fecha_solicitud, gestionado, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const ids = solicitudes?.map(s => s.id) ?? []
  const { data: codigos } = ids.length
    ? await supabase.from('repuestos').select('solicitud_id').not('codigo_original', 'is', null).in('solicitud_id', ids)
    : { data: [] }

  const codigosCount: Record<string, number> = {}
  codigos?.forEach(r => { codigosCount[r.solicitud_id] = (codigosCount[r.solicitud_id] || 0) + 1 })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitudes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{solicitudes?.length ?? 0} solicitudes registradas</p>
        </div>
        <Link
          href="/solicitudes/importar"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Importar JSON
        </Link>
      </div>

      {!solicitudes?.length ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No hay solicitudes aún</p>
          <p className="text-sm mt-1">Carga el primer PDF para comenzar</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">N° Solicitud</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Vehículo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Patente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Región</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Cód. Originales</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Gestionado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {solicitudes.map(s => {
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <Link href={`/solicitudes/${s.id}`} className="font-mono font-medium text-blue-600 hover:underline">
                        #{s.n_solicitud}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{s.marca} {s.modelo} {s.anio}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{s.patente}</td>
                    <td className="px-4 py-3 text-gray-600">{s.region_taller}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {s.fecha_solicitud ? new Date(s.fecha_solicitud).toLocaleDateString('es-CL') : '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700 font-medium">
                      {codigosCount[s.id] ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <GestionadoToggle id={s.id} value={s.gestionado ?? false} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
