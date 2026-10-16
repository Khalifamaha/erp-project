import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, ChevronDown, LogOut, User as UserIcon } from 'lucide-react'
import toast from 'react-hot-toast'

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function getInitiales(user) {
  if (!user) return '?'
  const p = user.prenom?.[0] || ''
  const n = user.nom?.[0] || ''
  return (p + n).toUpperCase() || '?'
}

export function Topbar({ title, subtitle }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const user = getStoredUser()

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    toast.success('Déconnexion réussie')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-10 bg-canvas/80 backdrop-blur-sm border-b border-ink-100">
      <div className="h-16 px-4 sm:px-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-lg text-ink-900">{title}</h1>
          {subtitle && <p className="text-xs text-ink-500 -mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-white border border-ink-100 rounded-xl px-3 py-2 w-64 focus-within:ring-2 focus-within:ring-brand-400/40">
            <Search className="w-4 h-4 text-ink-300" />
            <input
              placeholder="Rechercher client, commande..."
              className="bg-transparent outline-none text-sm w-full placeholder:text-ink-300"
            />
          </div>

          <button className="relative w-10 h-10 rounded-xl bg-white border border-ink-100 flex items-center justify-center hover:border-ink-300 transition-colors">
            <Bell className="w-[18px] h-[18px] text-ink-500" />
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-white transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-cyan-500 flex items-center justify-center text-white text-xs font-semibold">
                {getInitiales(user)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-ink-900 leading-tight">
                  {user ? user.nom_complet || `${user.prenom} ${user.nom}` : 'Utilisateur'}
                </p>
                <p className="text-[11px] text-ink-500 leading-tight">
                  {user?.employe?.matricule ||
                    user?.roles?.[0] ||
                    user?.email ||
                    ''}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-ink-300 hidden sm:block" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-ink-100 bg-white py-1.5 shadow-lg">
                <div className="px-3.5 py-2 border-b border-ink-100">
                  <p className="text-sm font-medium text-ink-900">
                    {user ? user.nom_complet || `${user.prenom} ${user.nom}` : 'Utilisateur'}
                  </p>
                  <p className="text-xs text-ink-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setOpen(false)
                    navigate('/parametres')
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-ink-700 hover:bg-ink-100"
                >
                  <UserIcon size={15} />
                  Mon profil
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-rose-500 hover:bg-rose-50"
                >
                  <LogOut size={15} />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}