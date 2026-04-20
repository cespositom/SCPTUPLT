import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import RepuestosTable from '@/components/RepuestosTable'
import DeleteSolicitud from '@/components/DeleteSolicitud'

const ESTADOS: Record<string, { label: string; color: string }> = {
  pendiente:  { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-800' },
  en_proceso: { label: 'En proceso', color: 'bg-blue-100 text-blue-800' },
  cotizada:   { label: 'Cotizada',   color: 'bg-green-100 text-green-800' },
  cerrada:    { label: 'Cerrada',    color: 'bg-gray-100 text-gray-700' },
}

export default async function SolicitudDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: s } = await supabase
    .from('solicitudes')
    .select('*')
    .eq('id', id)
    .single()

  if (!s) notFound()

  const { data: repuestos } = await supabase
    .from('repuestos')
    .select('*')
    .eq('solicitud_id', id)
    .order('numero_item')

  const estado = ESTADOS[s.estado] ?? { label: s.estado, color: 'bg-gray-100 text-gray-700' }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
        <Link href="/solicitudes" className="text-sm text-gray-500 hover:text-gray-700">← Solicitudes</Link>
        <span className="text-gray-300">/</span>
          <span className="text-sm font-mono font-medium text-gray-700">#{s.n_solicitud}</span>
        </div>
        <DeleteSolicitud id={s.id} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Vehículo</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Marca</dt><dd className="font-medium">{s.marca}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Modelo</dt><dd className="font-medium">{s.modelo}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Año</dt><dd className="font-medium">{s.anio}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Patente</dt><dd className="font-mono font-medium">{s.patente}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">VIN</dt><dd className="font-mono text-xs">{s.vin || '—'}</dd></div>
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Solicitud</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">N° Siniestro</dt><dd className="font-medium">{s.n_siniestro || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Liquidador</dt><dd className="font-medium">{s.liquidador || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Región</dt><dd className="font-medium">{s.region_taller || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Fecha</dt><dd className="font-medium">{s.fecha_solicitud ? new Date(s.fecha_solicitud).toLocaleDateString('es-CL') : '—'}</dd></div>
            <div className="flex justify-between items-center"><dt className="text-gray-500">Estado</dt><dd><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estado.color}`}>{estado.label}</span></dd></div>
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Repuestos ({repuestos?.length ?? 0})</h2>
        </div>
        <RepuestosTable repuestos={repuestos ?? []} />
      </div>
    </div>
  )
}
