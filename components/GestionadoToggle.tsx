'use client'

import { useState } from 'react'

export default function GestionadoToggle({ id, value }: { id: string; value: boolean }) {
  const [checked, setChecked] = useState(value)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const next = !checked
    await fetch(`/api/solicitudes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gestionado: next }),
    })
    setChecked(next)
    setLoading(false)
  }

  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={loading}
      onChange={e => { e.stopPropagation(); toggle() }}
      onClick={e => e.stopPropagation()}
      className="w-4 h-4 accent-blue-600 cursor-pointer disabled:opacity-50"
    />
  )
}
