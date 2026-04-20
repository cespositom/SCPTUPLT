'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteSolicitud({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    await fetch(`/api/solicitudes/${id}`, { method: 'DELETE' })
    router.push('/solicitudes')
    router.refresh()
  }

  if (confirming) return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">¿Eliminar esta orden?</span>
      <button onClick={handleDelete} disabled={loading}
        className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
        {loading ? 'Eliminando...' : 'Confirmar'}
      </button>
      <button onClick={() => setConfirming(false)}
        className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">
        Cancelar
      </button>
    </div>
  )

  return (
    <button onClick={() => setConfirming(true)}
      className="border border-red-300 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-50">
      Eliminar orden
    </button>
  )
}
