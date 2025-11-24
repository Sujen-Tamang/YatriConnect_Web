import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const Navbar = () => {
  const { isAuthenticated, currentUser, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileBookOpen, setMobileBookOpen] = useState(false)
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false)

  const isActive = (path) =>
    location.pathname === path ? "text-[#59f20d] font-bold" : "text-[#a6ba9c] hover:text-white transition-colors"

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (!currentUser) return "?"
    const name = currentUser.name || currentUser.email || ""
    const parts = name.trim().split(" ")
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <nav className="bg-[#0d140a] border-b border-[#2e3928] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* ── Left: Logo ── */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="size-9 bg-[#59f20d] rounded-lg flex items-center justify-center text-[#0d140a] shadow-[0_0_12px_rgba(89,242,13,0.4)] group-hover:shadow-[0_0_20px_rgba(89,242,13,0.6)] transition-shadow duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.13401 2 5 5.13401 5 9C5 13.5 12 22 12 22C12 22 19 13.5 19 9C19 5.13401 15.866 2 12 2Z"></path>
                  <circle cx="12" cy="9" r="2.5" fill="currentColor" stroke="none"></circle>
                </svg>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Yatriconnect</span>
            </Link>
          </div>

          {/* ── Middle: Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-1">

            {/* Book a Bus */}
            <Link to="/bus-booking" className={`px-4 py-2 rounded-lg text-sm font-medium ${isActive('/bus-booking')} hover:text-white transition-colors`}>
              Book a Bus
            </Link>

            {/* Track your Bus */}
            <Link to="/busTracking" className={`px-4 py-2 rounded-lg text-sm font-medium ${isActive('/busTracking')}`}>
              Track your Bus
            </Link>

            {/* About us */}
            <Link to="/about" className={`px-4 py-2 rounded-lg text-sm font-medium ${isActive('/about')}`}>
              About us
            </Link>
          </div>

          {/* ── Right: Profile / Auth ── */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="relative group">
                {/* Avatar trigger */}
                <button className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#1c2619] border border-[#2e3928] hover:border-[#59f20d]/50 transition-all group">
                  <div className="size-8 rounded-lg bg-[#59f20d] flex items-center justify-center text-[#0d140a] text-xs font-black tracking-tight shadow-[0_0_8px_rgba(89,242,13,0.3)]">
                    {getInitials()}
                  </div>
                  <span className="text-sm text-white font-medium max-w-[100px] truncate hidden lg:block">
                    {currentUser?.name || currentUser?.email?.split("@")[0]}
                  </span>
                  <span className="material-symbols-outlined text-[#a6ba9c] text-[16px] transition-transform duration-200 group-hover:rotate-180">expand_more</span>
                </button>

                {/* Invisible hover bridge */}
                <div className="absolute right-0 top-full w-full h-3 bg-transparent"></div>

                {/* Dropdown */}
                <div className="absolute right-0 top-[calc(100%+0.75rem)] w-52 bg-[#1c2619] border border-[#2e3928] rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)]
                  opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                  transition-all duration-200 ease-out overflow-hidden z-50">

                  {/* User info header in dropdown */}
                  <div className="px-4 py-3 border-b border-[#2e3928]">
                    <p className="text-white text-sm font-bold truncate">{currentUser?.name || "User"}</p>
                    <p className="text-[#a6ba9c] text-xs truncate">{currentUser?.email}</p>
                  </div>

                  <Link to="/customer/dashboard" className="flex items-center gap-3 px-4 py-3.5 text-sm text-[#a6ba9c] hover:text-white hover:bg-[#2e3928] transition-colors border-b border-[#2e3928]">
                    <span className="material-symbols-outlined text-[18px]">dashboard</span> Dashboard
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-3.5 text-sm text-red-400 hover:text-red-300 hover:bg-[#2e3928] transition-colors">
                    <span className="material-symbols-outlined text-[18px]">logout</span> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/auth/signin" className="flex items-center gap-2 px-5 py-2.5 bg-[#59f20d] text-[#0d140a] font-bold text-sm rounded-xl hover:bg-[#4ed40b] shadow-[0_0_15px_rgba(89,242,13,0.3)] hover:shadow-[0_0_25px_rgba(89,242,13,0.5)] transition-all active:scale-[0.98]">
                <span className="material-symbols-outlined text-[18px]">login</span> Sign In
              </Link>
            )}
          </div>

          {/* ── Mobile menu button ── */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[#a6ba9c] hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1c2619] border-b border-[#2e3928]">
          <div className="px-4 py-4 space-y-1">

            <Link to="/bus-booking" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-3 text-sm font-medium text-[#a6ba9c] hover:text-white rounded-lg hover:bg-[#2e3928] transition-colors">
              Book a Bus
            </Link>

            <Link to="/busTracking" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-3 text-sm font-medium text-[#a6ba9c] hover:text-white rounded-lg hover:bg-[#2e3928] transition-colors">
              Track your Bus
            </Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-3 text-sm font-medium text-[#a6ba9c] hover:text-white rounded-lg hover:bg-[#2e3928] transition-colors">
              About us
            </Link>

            {/* Mobile: Profile section */}
            <div className="pt-3 mt-3 border-t border-[#2e3928]">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setMobileProfileOpen(!mobileProfileOpen)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-[#a6ba9c] hover:text-white rounded-lg hover:bg-[#2e3928] transition-colors"
                  >
                    <div className="size-8 rounded-lg bg-[#59f20d] flex items-center justify-center text-[#0d140a] text-xs font-black flex-shrink-0">
                      {getInitials()}
                    </div>
                    <span className="flex-1 text-left text-white">{currentUser?.name || currentUser?.email?.split("@")[0]}</span>
                    <span className={`material-symbols-outlined transition-transform ${mobileProfileOpen ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  {mobileProfileOpen && (
                    <div className="mt-1 ml-3 pl-3 border-l border-[#2e3928] space-y-1">
                      <Link to="/customer/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#a6ba9c] hover:text-white rounded-lg hover:bg-[#2e3928] transition-colors">
                        <span className="material-symbols-outlined text-[16px]">dashboard</span> Dashboard
                      </Link>
                      <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 rounded-lg hover:bg-[#2e3928] transition-colors">
                        <span className="material-symbols-outlined text-[16px]">logout</span> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/auth/signin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-3 text-sm font-medium text-[#59f20d]">
                  <span className="material-symbols-outlined text-[18px]">login</span> Sign In
                </Link>
              )}
            </div>

          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
