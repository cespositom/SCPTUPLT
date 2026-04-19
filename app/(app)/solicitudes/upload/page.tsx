'use client'

import { useState, useRef, DragEvent } from 'react'
import { useRouter } from 'next/navigation'

type UploadState = 'idle' | 'uploading' | 'success' | 'error' | 'duplicate'

interface UploadResult {
  success?: boolean
  solicitud_id?: string
  n_solicitud?: string
  mensaje?: string
  error?: boolean
  mensaje_error?: string
}

export default function UploadPage() {
  const [state, setState] = useState<UploadState>('idle')
  const [result, setResult] = useState<UploadResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleUpload(file: File) {
    if (!file || !file.name.endsWith('.pdf')) {
      setState('error')
      setResult({ mensaje_error: 'Solo se aceptan archivos PDF' })
      return
    }

    setFileName(file.name)
    setState('uploading')
    setResult(null)

    const formData = new FormData()
    formData.append('data', file, file.name)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.status === 201 && data.success) {
        setState('success')
        setResult(data)
      } else if (res.status === 409) {
        setState('duplicate')
        setResult(data)
      } else {
        setState('error')
        setResult({ mensaje_error: data.mensaje || 'Error al procesar el PDF' })
      }
    } catch {
      setState('error')
      setResult({ mensaje_error: 'No se pudo conectar con el servidor' })
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  function reset() {
    setState('idle')
    setResult(null)
    setFileName('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cargar PDF</h1>
        <p className="text-sm text-gray-500 mt-0.5">Solicitud de repuestos BCI Seguros</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {state === 'idle' && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-4xl mb-3">📄</div>
            <p className="text-gray-700 font-medium">Arrastra el PDF aquí</p>
            <p className="text-sm text-gray-400 mt-1">o haz clic para seleccionar</p>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {state === 'uploading' && (
          <div className="text-center py-12">
            <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-700 font-medium">Procesando PDF...</p>
            <p className="text-sm text-gray-400 mt-1">{fileName}</p>
            <p className="text-xs text-gray-400 mt-3">Claude está extrayendo los datos del documento</p>
          </div>
        )}

        {state === 'success' && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-lg font-semibold text-gray-900">Solicitud cargada</p>
            <p className="text-sm text-gray-500 mt-1">
              N° <span className="font-mono font-bold text-gray-800">{result?.n_solicitud}</span>
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={() => router.push('/solicitudes')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Ver solicitudes
              </button>
              <button
                onClick={reset}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cargar otro
              </button>
            </div>
          </div>
        )}

        {state === 'duplicate' && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-lg font-semibold text-gray-900">Solicitud ya existe</p>
            <p className="text-sm text-gray-500 mt-1">{result?.mensaje}</p>
            <button
              onClick={reset}
              className="mt-6 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Intentar con otro PDF
            </button>
          </div>
        )}

        {state === 'error' && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">❌</div>
            <p className="text-lg font-semibold text-gray-900">Error al procesar</p>
            <p className="text-sm text-gray-500 mt-1">{result?.mensaje_error}</p>
            <button
              onClick={reset}
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Intentar nuevamente
            </button>
          </div>
        )}
      </div>

      {state === 'idle' && (
        <div className="mt-4 text-xs text-gray-400 text-center">
          El PDF es procesado automáticamente por IA para extraer los datos de la solicitud
        </div>
      )}
    </div>
  )
}
