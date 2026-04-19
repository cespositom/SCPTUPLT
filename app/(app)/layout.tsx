import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('nombre, rol')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-gray-900 text-lg">SCARPIG</span>
          <nav className="flex gap-4">
            <Link href="/solicitudes" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Solicitudes
            </Link>
            <Link href="/solicitudes/upload" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Cargar PDF
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{perfil?.nombre || user.email}</span>
          {perfil?.rol === 'admin' && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Admin</span>
          )}
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
