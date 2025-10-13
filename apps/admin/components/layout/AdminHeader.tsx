"use client"

import { useAdminAuth } from "../../lib/admin-auth-context"
import { useState } from "react"

interface AdminHeaderProps {
  onMenuClick: () => void
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user, signOut } = useAdminAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Mobile menu button + Title */}
      <div className="flex items-center gap-4">
        {/* Botón hamburguesa - solo visible en móvil */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h2 className="text-lg sm:text-xl font-semibold text-white">Admin Panel</h2>
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold text-sm">
            {user?.email?.charAt(0).toUpperCase() || "A"}
          </div>

          {/* User info - oculto en móvil */}
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-white">
              {user?.displayName || user?.email?.split("@")[0] || "Admin"}
            </p>
            <p className="text-xs text-slate-400 capitalize">{user?.role || "admin"}</p>
          </div>

          {/* Dropdown icon */}
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform hidden sm:block ${
              showDropdown ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />

            {/* Menu */}
            <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20">
              <div className="p-3 border-b border-slate-700">
                <p className="text-sm text-white font-medium">
                  {user?.email}
                </p>
                <p className="text-xs text-slate-400 mt-1 capitalize">
                  {user?.role} Account
                </p>
              </div>

              <div className="p-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
