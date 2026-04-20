'use client'

import { useState } from 'react'

export default function GestionadoToggle({ id, value }: { id: string; value: boolean }) {
  const [checked, setChecked] = useState(value)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (loading) return
    setLoading(true)
    const next = !checked
    try {
      const res = await fetch(`/api/solicitudes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gestionado: next }),
      })
      if (res.ok) setChecked(next)
    } finally {
      setLoading(false)
    }
  }

  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={loading}
      onChange={() => toggle()}
      onClick={e => e.stopPropagation()}
      className="w-4 h-4 accent-blue-600 cursor-pointer disabled:opacity-50"
    />
  )
}
