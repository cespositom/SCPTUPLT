import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { solicitud: s, vehiculo: v, repuestos = [] } = await request.json()

  const supabase = await createClient()

  const fechaRaw: string = s.fecha_solicitud ?? ''
  let fecha_solicitud: string | null = null
  if (fechaRaw) {
    const [d, m, y] = fechaRaw.split('/')
    fecha_solicitud = `${y}-${m}-${d}`
  }

  const { data: sol, error: solErr } = await supabase
    .from('solicitudes')
    .insert({
      n_solicitud:   s.nro_solicitud,
      n_siniestro:   s.nro_siniestro,
      tipo_vehiculo: v.tipo,
      marca:         v.marca,
      modelo:        v.modelo,
      anio:          v.año,
      vin:           v.vin,
      patente:       v.patente,
      region_taller: s.region_taller,
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
      nombre_es:       r.nombre_es,
      nombre_en:       r.nombre_en,
      codigo_original: r.codigo_oem,
    }))
    await supabase.from('repuestos').insert(rows)
  }

  return NextResponse.json({ id: sol.id })
}
