import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

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
    .select('id, n_solicitud, marca, modelo, anio, patente, region_taller, estado, fecha_solicitud, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitudes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{solicitudes?.length ?? 0} solicitudes registradas</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/solicitudes/importar"
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            + Importar JSON
          </Link>
          <Link
            href="/solicitudes/upload"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Cargar PDF
          </Link>
        </div>
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {solicitudes.map(s => {
                const estado = ESTADOS[s.estado] ?? { label: s.estado, color: 'bg-gray-100 text-gray-700' }
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
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${estado.color}`}>
                        {estado.label}
                      </span>
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
