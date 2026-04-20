'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GestionadoToggle({ id, value }: { id: string; value: boolean }) {
  const [checked, setChecked] = useState(value)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const next = !checked
    const supabase = createClient()
    await supabase.from('solicitudes').update({ gestionado: next }).eq('id', id)
    setChecked(next)
    setLoading(false)
  }

  return (
    <button
      onClick={e => { e.preventDefault(); toggle() }}
      disabled={loading}
      className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
        checked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {checked ? 'Sí' : 'No'}
    </button>
  )
}
