import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { solicitud: s, vehiculo: v, repuestos = [] } = await request.json()

  if (!s.nro_solicitud) return NextResponse.json({ error: 'El campo nro_solicitud es requerido' }, { status: 400 })

  const supabase = createServiceClient()

  const fechaRaw: string = s.fecha_solicitud ?? s.fecha ?? ''
  let fecha_solicitud: string | null = null
  if (fechaRaw) {
    const [d, m, y] = fechaRaw.split('/')
    if (d && m && y) fecha_solicitud = `${y}-${m}-${d}`
  }

  const { data: sol, error: solErr } = await supabase
    .from('solicitudes')
    .insert({
      n_solicitud:   s.nro_solicitud,
      n_siniestro:   s.nro_siniestro,
      tipo_vehiculo: v.tipo,
      marca:         v.marca,
      modelo:        v.modelo,
      anio:          Number(v.año ?? v.ano),
      vin:           v.vin,
      patente:       v.patente,
      region_taller: s.region_taller ?? s.region ?? s.zona_taller,
      liquidador:    s.liquidador,
      fecha_solicitud,
      tipo_compra:   s.tipo_compra,
      catalogo:      v.catalogo,
      estado:        'pendiente',
    })
    .select('id')
    .single()

  if (solErr) return NextResponse.json({ error: solErr.message }, { status: 400 })

  if (repuestos.length) {
    const rows = repuestos.map((r: any, i: number) => ({
      solicitud_id:    sol.id,
      numero_item:     i + 1,
      nombre_es:       r.nombre_es ?? r.nombre ?? null,
      nombre_en:       r.nombre_en ?? null,
      codigo_original: r.codigo_oem ?? r.codigo_original ?? r.codigo ?? null,
      n_parte:         r.n_parte ?? r.nro_parte ?? null,
      proveedor:       r.proveedor ?? r.fuente ?? null,
    }))
    const { error: repErr } = await supabase.from('repuestos').insert(rows)
    if (repErr) return NextResponse.json({ error: repErr.message }, { status: 400 })
  }

  return NextResponse.json({ id: sol.id })
}
